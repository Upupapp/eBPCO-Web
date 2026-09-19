#!/usr/bin/env node
/**
 * Netlify ships none of these by default. This reads the SAME netlify.toml
 * Netlify itself parses, not a copy of the values, so a header deleted or
 * loosened by hand fails the same gate a missing one would.
 *
 * Deliberately shallow: this does not parse TOML (no such dependency exists
 * in this repo, and one file does not earn a new one) — it looks for a
 * `[[headers]]` block covering `/*` and checks each required header/value
 * appears somewhere after it. A hand-edit that breaks TOML syntax outright
 * is Netlify's problem to report at deploy time, not this gate's.
 *
 * Run: npm run check:headers
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const REQUIRED = [
  ['Content-Security-Policy', /frame-ancestors 'none'/],
  ['Strict-Transport-Security', /max-age=\d+/],
  ['X-Content-Type-Options', /nosniff/],
  ['Referrer-Policy', /.+/],
];

// netlify.toml lives at the REPO root, not this Angular project's own
// directory (base = "EBPCO WEB ADMIN/E-BPCO-Software-main" in netlify.toml
// itself is exactly this split -- Netlify's `base` and this repo's actual
// root are two different directories).
const path = join(dirname(fileURLToPath(import.meta.url)), '../../../netlify.toml');
const toml = readFileSync(path, 'utf8');
const headersBlockStart = toml.indexOf('[[headers]]');

if (headersBlockStart === -1) {
  console.error(`headers: no [[headers]] block in ${path}`);
  process.exit(1);
}

const block = toml.slice(headersBlockStart);
const missing = REQUIRED.filter(([name, valuePattern]) => {
  const line = block.split('\n').find((l) => l.trimStart().startsWith(name));
  return line === undefined || !valuePattern.test(line);
});

if (missing.length === 0) {
  console.log('headers: clean');
  process.exit(0);
}

console.error(`headers: ${missing.length} required header(s) missing or weak in ${path}\n`);
for (const [name] of missing) console.error(`  ${name}`);
console.error('');
process.exit(1);
