#!/usr/bin/env node
/**
 * `ng build`, but a warning that means something is WRONG fails the run.
 *
 * ── Why this exists ─────────────────────────────────────────────────────
 *
 * A-14 removed the delete-a-log-entry dialog from System Logs' template but
 * left `ConfirmDialog` in the component's `imports` array. Angular said so
 * every single time:
 *
 *     NG8113: ConfirmDialog is not used within the template of SystemLogs
 *
 * `ng build` prints that and exits 0, so `npm run verify` was green, and the
 * message scrolled past in a build log nobody re-reads. It was finally noticed
 * in Netlify's deploy log — by which point it had shipped.
 *
 * That is the shape of a defect this project keeps meeting: not a failure, but
 * a true statement nobody was in a position to see.
 *
 * ── Which warnings, and why only these ──────────────────────────────────
 *
 * NG8113 only. An unused entry in a standalone component's `imports` is never
 * merely untidy: it is either dead weight, or the trace of a template usage
 * that was removed without finishing the job — which is exactly what happened
 * here. Every other Angular warning is left as a warning on purpose, including
 * the pre-existing `qrcode-generator is not ESM` note, which is a dependency's
 * packaging and not something this repo can act on. A gate that fails on
 * warnings nobody can fix is a gate people learn to bypass.
 */
import { spawn } from 'node:child_process';

const FAIL_ON = [/NG8113/];

const child = spawn('npx', ['ng', 'build'], { shell: false });
let captured = '';

for (const stream of [child.stdout, child.stderr]) {
  stream.on('data', (chunk) => {
    const text = String(chunk);
    captured += text;
    process.stdout.write(text);
  });
}

child.on('close', (code) => {
  if (code !== 0) process.exit(code ?? 1);

  const lines = captured.split('\n').filter((line) => FAIL_ON.some((r) => r.test(line)));
  if (lines.length === 0) process.exit(0);

  console.error(`\nbuild-strict: ${lines.length} warning(s) that must not ship\n`);
  for (const line of lines) console.error(`  ${line.trim()}`);
  console.error(
    '\n  An unused entry in a standalone `imports` array is dead weight, or the\n'
    + '  trace of a template usage removed without finishing the job.\n',
  );
  process.exit(1);
});
