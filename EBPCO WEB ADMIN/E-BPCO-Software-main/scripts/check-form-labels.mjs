#!/usr/bin/env node
/**
 * Every form control must be programmatically labelled.
 *
 * This reads SOURCE, and that is the point: `check-a11y.mjs` sees a real
 * browser but only reaches `/welcome`, `/login` and `/register`, because every
 * other route redirects to `/login` without a session. The 37 unlabelled inputs
 * found by hand on 31 Aug are mostly behind that guard — 20 of them in
 * Applications alone — so the browser gate cannot see them and never will
 * until it can authenticate.
 *
 * ── What counts as labelled ─────────────────────────────────────────────
 *
 * An `id` with a `<label for>` pointing at it; an `aria-label`; an
 * `aria-labelledby`; or being wrapped directly inside a `<label>`.
 *
 * The wrapping case matters and is easy to get wrong. A first hand count said
 * 108 unlabelled inputs; 71 of those were wrapped in a label and perfectly
 * fine. Reporting 108 would have been three times the real number, and a gate
 * that over-reports gets switched off — see the citizen portal lane's note
 * about a contrast gate crying wolf.
 *
 * ── Why not just trust axe ──────────────────────────────────────────────
 *
 * axe is better at this and should be preferred wherever it can reach. This
 * exists because it cannot reach most of the portal. When the browser gate can
 * sign in, this one becomes redundant and should be deleted rather than kept
 * out of habit.
 *
 * Run: npm run check:labels
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : path.endsWith('.html') ? [path] : [];
  });

const CONTROL = /<(input|select|textarea)\b[^>]*>/g;
const findings = [];

for (const file of walk('src/app')) {
  const html = readFileSync(file, 'utf8');
  // Ranges covered by a <label> … </label>, so a wrapped control is labelled.
  const labelRanges = [...html.matchAll(/<label[\s\S]*?<\/label>/g)].map((m) => [
    m.index, m.index + m[0].length,
  ]);
  // Every id a <label> points at — static `for="x"` and Angular's
  // `[attr.for]="expr"`. The dynamic form is paired by EXPRESSION, because a
  // control written `[id]="'reason-' + r.id"` is labelled by a label written
  // `[attr.for]="'reason-' + r.id"` and neither has a literal id to compare.
  const labelledFor = new Set([
    ...[...html.matchAll(/<label[^>]*\bfor="([^"]+)"/g)].map((m) => m[1]),
    ...[...html.matchAll(/<label[^>]*\[attr\.for\]="([^"]+)"/g)].map((m) => m[1].trim()),
  ]);

  for (const m of html.matchAll(CONTROL)) {
    const tag = m[0];
    if (/type="(hidden|submit|button|reset)"/.test(tag)) continue;
    // Both the static attribute and Angular's binding form. Without the
    // second, a control written `[attr.aria-label]="'Select ' + row.id"` is
    // reported as unlabelled while being correctly labelled — and the first
    // thing anyone does with a false positive is start "fixing" working code.
    if (/(?:\[attr\.)?aria-label(?:ledby)?\]?=/.test(tag)) continue;

    const id = tag.match(/(?<!\[)\bid="([^"]+)"/)?.[1];
    const boundId = tag.match(/\[id\]="([^"]+)"/)?.[1]?.trim();
    if (id && labelledFor.has(id)) continue;
    if (boundId && labelledFor.has(boundId)) continue;
    if (labelRanges.some(([s, e]) => m.index >= s && m.index < e)) continue;

    findings.push({
      file: file.replace(/^src\/app\//, ''),
      line: html.slice(0, m.index).split('\n').length,
      tag: tag.replace(/\s+/g, ' ').slice(0, 62),
    });
  }
}

if (findings.length === 0) {
  console.log('labels: clean');
  process.exit(0);
}

console.error(`labels: ${findings.length} control(s) a screen reader cannot name\n`);
for (const f of findings) console.error(`  ${f.file}:${f.line}\n      ${f.tag}`);
console.error('');
process.exit(1);
