#!/usr/bin/env node
/**
 * Fails when an interface names a required field the server does not send.
 *
 * ── The defect this is shaped around ────────────────────────────────────
 *
 * F-30 and F-31 were the same mistake four times: `PendingAccessRequest`
 * declared `mobileNumber`, `position`, `requestedPermitTypes` and `requestedAt`
 * as required; the server sends `mobile`, `officePosition`, `permitTypes` and
 * `raisedAt`. TypeScript was satisfied because nothing ever compared the
 * declaration to a response, and the suite was satisfied because every test
 * used a mock written to match the declaration.
 *
 * At runtime each one is `undefined`, which renders as an empty cell. Nothing
 * throws. Nothing goes red. A column is simply blank forever.
 *
 * ── What it checks, and what it deliberately does not ───────────────────
 *
 * REQUIRED fields only. An optional field (`foo?:`) may be absent from any one
 * response and still be correct, so flagging it would produce noise, and a
 * gate that cries wolf gets switched off.
 *
 * It also cannot see a field the server sends that no interface names — that
 * is a missed opportunity, not a defect, and treating it as one would fail the
 * build every time the API adds anything.
 *
 * ── Provenance is reported, not assumed ─────────────────────────────────
 *
 * A `derived` fixture was read out of the API's source rather than captured
 * from it. It is the best evidence available for shapes behind an authenticated
 * route this portal cannot yet reach, and it is NOT proof the server sends
 * them — a schema can be right while a handler forgets a field. The report says
 * which kind each check rested on.
 *
 * Run: npm run check:contract
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'src/app/core/api/contract';

/**
 * Fixture -> the interface that parses it, and where the fields live in the
 * body. Explicit rather than inferred: a gate that guesses which interface
 * reads which response will eventually guess wrong and be disbelieved.
 */
const MAP = [
  { fixture: 'staff-access-requests', file: 'src/app/core/api/access-request.api.ts',
    iface: 'PendingAccessRequest', at: (b) => b.data?.[0] },
  { fixture: 'me-staff', file: 'src/app/core/api/identity.api.ts',
    iface: 'Me', at: (b) => b },
  { fixture: 'me-applicant', file: 'src/app/core/api/identity.api.ts',
    iface: 'Me', at: (b) => b },
];

/** The required field names of an interface, read from its source block. */
function requiredFields(file, name) {
  const src = readFileSync(file, 'utf8');
  const start = src.indexOf(`interface ${name} {`);
  if (start === -1) return null;
  const body = src.slice(start, src.indexOf('\n}', start));
  const fields = [];
  for (const m of body.matchAll(/^\s*(?:readonly\s+)?(\w+)(\??):/gm)) {
    if (m[2] !== '?') fields.push(m[1]);
  }
  return fields;
}

if (!existsSync(DIR)) {
  console.error(`✘ contract: ${DIR} does not exist.`);
  process.exit(2);
}

const findings = [];
const notes = [];

for (const entry of MAP) {
  const path = join(DIR, `${entry.fixture}.json`);
  if (!existsSync(path)) {
    findings.push(`${entry.fixture}: no fixture — nothing checks ${entry.iface}`);
    continue;
  }
  const fixture = JSON.parse(readFileSync(path, 'utf8'));
  const sample = entry.at(fixture.body);
  if (sample === undefined) {
    // An empty list cannot show a row's shape. Say so rather than passing.
    notes.push(`${entry.fixture}: no sample row in the fixture, ${entry.iface} unchecked`);
    continue;
  }
  const required = requiredFields(entry.file, entry.iface);
  if (required === null) {
    findings.push(`${entry.iface}: not found in ${entry.file}`);
    continue;
  }
  const present = new Set(Object.keys(sample));
  const missing = required.filter((f) => !present.has(f));
  if (missing.length > 0) {
    findings.push(
      `${entry.iface} (${entry.file}) requires ${missing.map((f) => `\`${f}\``).join(', ')}, ` +
      `absent from ${entry.fixture}.json — at runtime these are undefined, which renders as a blank cell`,
    );
  }
  notes.push(`${entry.iface} vs ${entry.fixture} [${fixture.source}] — ${required.length} required field(s)`);
}

for (const n of notes) console.log(`  ${n}`);

if (findings.length === 0) {
  console.log('contract: clean');
  process.exit(0);
}
console.error(`\ncontract: ${findings.length} mismatch(es)\n`);
for (const f of findings) console.error(`  ${f}`);
console.error('');
process.exit(1);
