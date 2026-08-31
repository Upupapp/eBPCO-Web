#!/usr/bin/env node
/**
 * Front-end gates that `build` and `test` cannot see.
 *
 * Every defect found in the 29 Aug sweep passed both of the portal's only two
 * scripts. These four checks are the shapes those defects had. Each one is a
 * pattern, not a style preference — a finding here is a thing that is wrong,
 * not a thing that is untidy.
 *
 *   orphans      a component or service nothing references. Dead weight that
 *                still compiles, still ships, and still passes its own spec.
 *   write-only   a signal that is declared and `.set()` and read by NOTHING.
 *                `loadError` was shipped this way: the failure it described was
 *                invisible because no template read it. A signal no template
 *                reads is not an error to the type checker or the suite.
 *   casts        `as unknown as` — the double cast that switches the type
 *                system off. One of these hid a `status` field set to entirely
 *                the wrong union for every server row.
 *   notice       every page that reads the application store but does not
 *                fetch it must show the queue-load notice, or a failed load
 *                renders as confident zeros with nothing saying why.
 *   dead-control a <select> bound to nothing. Not merely inert: its options
 *                NAME a period ("This Month"), so the chart beneath is read as
 *                filtered when it is not.
 *   config       index.html must actually LOAD public/config.js. The runtime
 *                tokens read `globalThis.EBPCO_*`, and an edit adding that
 *                script tag failed silently once: the build passed, config.js
 *                shipped, and nothing referenced it.
 *
 * Zero dependencies, on purpose: this runs anywhere `node` does, including a
 * tree that has not been `npm install`ed.
 *
 * Usage:  node scripts/gates.mjs        (exit 1 if anything is found)
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, normalize, relative } from 'node:path';

const SRC = 'src';
const findings = [];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const files = existsSync(SRC) ? walk(SRC) : [];
const ts = files.filter((f) => f.endsWith('.ts') && !f.endsWith('.spec.ts'));
const read = new Map(files.map((f) => [f, readFileSync(f, 'utf8')]));
const short = (f) => relative(SRC, f).replace(/^app\//, '');

/** The template a component renders: its templateUrl file plus any inline template. */
function templateOf(file, src) {
  let tpl = '';
  const url = src.match(/templateUrl:\s*'([^']+)'/);
  if (url) {
    const path = normalize(join(dirname(file), url[1]));
    if (read.has(path)) tpl += read.get(path);
  }
  const inline = src.match(/template:\s*`([\s\S]*?)`/);
  if (inline) tpl += inline[1];
  return tpl;
}

// ── 1. Orphans ────────────────────────────────────────────────────────────
for (const file of ts) {
  const src = read.get(file);
  if (!/@Component|@Injectable/.test(src)) continue;
  const cls = src.match(/^export class (\w+)/m)?.[1];
  if (!cls) continue;
  const selector = src.match(/selector:\s*'([^']+)'/)?.[1];

  const spec = file.replace(/\.ts$/, '.spec.ts');
  const referencedInCode = ts.some(
    (other) => other !== file && other !== spec && new RegExp(`\\b${cls}\\b`).test(read.get(other)),
  );
  const usedInTemplate =
    !!selector && files.some((f) => f.endsWith('.html') && read.get(f).includes(`<${selector}`));

  if (!referencedInCode && !usedInTemplate) {
    findings.push(['orphan', short(file), `${cls} is referenced by nothing`]);
  }
}

// ── 2. Write-only state ───────────────────────────────────────────────────
for (const file of ts) {
  const src = read.get(file);
  const tpl = templateOf(file, src);

  for (const m of src.matchAll(/(?:protected |private |public )?readonly (\w+)\s*=\s*signal[<(]/g)) {
    const name = m[1];
    const written = new RegExp(`\\b${name}\\.(set|update)\\(`).test(src);
    if (!written) continue;

    // A private backing signal re-exposed read-only is read through its public
    // twin, not by name — four of six hits in the first sweep were this.
    const reExposed = new RegExp(`\\b${name}\\.asReadonly\\(\\)`).test(src);
    const readInCode = new RegExp(`this\\.${name}\\(\\)`).test(src);
    const readInTemplate = new RegExp(`\\b${name}\\b`).test(tpl);

    if (!reExposed && !readInCode && !readInTemplate) {
      findings.push([
        'write-only',
        short(file),
        `${name} is set but read by nothing — no template, no code`,
      ]);
    }
  }
}

// ── 3. Type-system escapes ────────────────────────────────────────────────
for (const file of ts) {
  const src = read.get(file);
  src.split('\n').forEach((line, i) => {
    // Comments describe these casts as often as code performs them — the
    // docblock explaining why one was REMOVED tripped this on its first run.
    const code = line.replace(/\/\/.*$/, '').trim();
    const isComment = code.startsWith('*') || code.startsWith('/*') || code === '';
    if (!isComment && code.includes('as unknown as')) {
      findings.push([
        'cast',
        `${short(file)}:${i + 1}`,
        'as unknown as — the type system is switched off here',
      ]);
    }
  });
}

// ── 4. Runtime config must actually be wired ──────────────────────────────
// The tokens read `globalThis.EBPCO_*`, and nothing defines those unless
// index.html loads config.js BEFORE the app bundle. This is checked because it
// failed silently once: an edit to index.html did not match, the build
// succeeded, config.js shipped, and nothing referenced it — a config mechanism
// that is present, emitted, and inert.
{
  const indexPath = 'src/index.html';
  const configPath = 'public/config.js';
  if (existsSync(indexPath) && existsSync(configPath)) {
    const html = readFileSync(indexPath, 'utf8');
    if (!/<script[^>]+src=["']config\.js["']/.test(html)) {
      findings.push([
        'config',
        indexPath,
        'public/config.js exists but index.html does not load it — the EBPCO_* globals would never be defined',
      ]);
    }
  } else if (existsSync(indexPath) && readFileSync(indexPath, 'utf8').includes('config.js')) {
    findings.push(['config', configPath, 'index.html loads config.js but the file is missing']);
  }
}

// ── 5. The queue-load notice must be placed, not merely written ───────────
// Five pages read ApplicationStore.applications() and one fetches. When the
// fetch fails the store empties and the others show confident zeros. The notice
// exists to say so — and a component written but never used would reproduce the
// defect exactly, which is a shape this codebase has shipped before.
{
  const readers = ['permit-release', 'dashboard', 'evaluations', 'businesses'];
  const noticeExists = existsSync('src/app/shared/queue-load-notice/queue-load-notice.ts');
  if (noticeExists) {
    for (const page of readers) {
      const tpl = `src/app/pages/${page}/${page}.html`;
      if (!existsSync(tpl)) continue;
      if (!readFileSync(tpl, 'utf8').includes('<app-queue-load-notice')) {
        findings.push([
          'notice',
          tpl,
          'reads the application store but does not show the queue-load notice — a failed load would render confident zeros in silence',
        ]);
      }
    }
  }
}

// ── 6. A control that controls nothing ────────────────────────────────────
// A `<select>` with no binding is inert, and inertness is not the damage: the
// options NAME something. Four of these sat above dashboard and analytics
// charts offering "This Month" / "Last Month" / "This Year" while the chart
// beneath showed every record it had. An officer who picked "This Month" then
// read an all-time figure as a monthly one — a wrong number attached to a
// period, produced by the reader rather than the code.
//
// `disabled` selects are exempt and deliberately so: the application detail
// panels render read-only values that way, one interpolated option each. Those
// display real data and cannot be operated, so they claim nothing.
{
  const BINDINGS = ['ngModel', '(change)', '[value]', 'formControl', '[('];
  for (const file of files.filter((f) => f.endsWith('.html'))) {
    const html = read.get(file);
    for (const m of html.matchAll(/<select[^>]*>/g)) {
      const tag = m[0];
      if (/\bdisabled\b/.test(tag)) continue;
      if (BINDINGS.some((b) => tag.includes(b))) continue;
      const line = html.slice(0, m.index).split('\n').length;
      findings.push([
        'dead-control',
        `${short(file)}:${line}`,
        'a <select> bound to nothing — it names a choice the page does not make',
      ]);
    }
  }
}

// ── Report ────────────────────────────────────────────────────────────────
const scanned = `${ts.length} ts, ${files.filter((f) => f.endsWith('.html')).length} templates`;
if (findings.length === 0) {
  console.log(`gates: clean (${scanned})`);
  process.exit(0);
}

console.error(`gates: ${findings.length} finding(s) (${scanned})\n`);
for (const [kind, where, what] of findings) {
  console.error(`  [${kind}] ${where}\n      ${what}`);
}
console.error('');
process.exit(1);
