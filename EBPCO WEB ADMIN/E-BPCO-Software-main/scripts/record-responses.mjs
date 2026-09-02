#!/usr/bin/env node
/**
 * Records real API responses into fixtures the contract spec asserts against.
 *
 * ── Why a recorder rather than hand-written fixtures ────────────────────
 *
 * F-30 to F-33 were four wire defects that 429 green tests could not see,
 * because every test asserted against a mock this portal had written. The mock
 * and the code agreed with each other and neither had met the server.
 *
 * A fixture somebody types out is that same mock with a new filename. The only
 * thing that breaks the loop is bytes the server actually sent, which is what
 * this captures.
 *
 * ── Provenance is written into each fixture ─────────────────────────────
 *
 * `recordedAt` and `source` say where a shape came from. A fixture marked
 * `derived` was read out of the API's own source — accurate as far as it goes,
 * and still not evidence that the server sends it. The contract spec reports
 * which kind it is asserting against, so nobody mistakes the weaker one for
 * the stronger.
 *
 * Usage:
 *   node scripts/record-responses.mjs                    # public shapes only
 *   node scripts/record-responses.mjs --token=<jwt>      # adds authenticated
 *
 * Needs the API running. Fails loudly if it is not: a recorder that silently
 * writes nothing leaves the fixtures stale and everything green.
 */
import { writeFileSync, mkdirSync } from 'node:fs';

const BASE = process.env.EBPCO_API ?? 'http://localhost:3000';
const OUT = 'src/app/core/api/contract';
const token = process.argv.find((a) => a.startsWith('--token='))?.slice(8);

mkdirSync(OUT, { recursive: true });

async function probe(name, path, init = {}) {
  const headers = { 'content-type': 'application/json', ...(init.headers ?? {}) };
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  const body = await res.json().catch(() => null);
  const fixture = {
    recordedAt: new Date().toISOString(),
    source: 'recorded',
    request: { method: init.method ?? 'GET', path },
    status: res.status,
    body,
  };
  writeFileSync(`${OUT}/${name}.json`, JSON.stringify(fixture, null, 2) + '\n');
  console.log(`  ${name.padEnd(28)} ${res.status}  ${path}`);
  return fixture;
}

try {
  await fetch(`${BASE}/health`);
} catch {
  console.error(`✘ record: no API at ${BASE}.`);
  console.error('   A recorder that writes nothing leaves the fixtures stale and');
  console.error('   every contract test green. Start the API and run this again.');
  process.exit(2);
}

console.log(`recording from ${BASE}\n`);

// Public shapes, reachable with no credentials at all.
await probe('auth-access-request-invalid', '/auth/access-request', {
  method: 'POST',
  body: JSON.stringify({ fullName: 'x' }),
});
await probe('auth-token-invalid', '/auth/token', {
  method: 'POST',
  body: JSON.stringify({ grantType: 'password', email: 'nobody@example.ph', password: 'wrong-passphrase' }),
});

if (token) {
  await probe('me', '/me');
  await probe('staff-applications', '/staff/applications?limit=2');
  await probe('staff-applications-metrics', '/staff/applications/metrics');
  await probe('staff-users', '/staff/users');
  await probe('staff-access-requests', '/staff/access-requests');
  await probe('staff-audit-security', '/staff/audit?stream=security&limit=2');
} else {
  console.log('\n  (no --token: authenticated shapes not recorded)');
}
console.log('');
