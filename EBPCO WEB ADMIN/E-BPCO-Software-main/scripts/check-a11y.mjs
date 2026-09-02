#!/usr/bin/env node
/**
 * Accessibility gate: axe-core against the real rendered DOM, at four widths.
 *
 * Every other gate in this repo reads source. This one sees what a browser
 * actually produces — and a source scan cannot see a contrast ratio, a focus
 * order, or a control that only exists below a breakpoint.
 *
 * ── Why four viewports ──────────────────────────────────────────────────
 *
 * The citizen web portal lane raised this on 2 Sep: their own axe gate scans at
 * 1280×900 only, and responsive behaviour by definition does not exist there.
 * This portal has 33 rules below 900px across eight pages — sidebars collapse,
 * tables become cards, filter bars stack. A desktop-only scan sees none of it.
 *
 * ── Two lessons taken from their implementation ─────────────────────────
 *
 * SETTLE ANIMATIONS FIRST. axe samples computed colour, so an element mid-fade
 * reads as a contrast failure. They measured 13 contrast violations of which 6
 * were real; a gate that cries wolf gets switched off.
 *
 * FAIL CLOSED WITHOUT A BROWSER. A gate that silently skips reads exactly like
 * a gate that passed.
 *
 * ── What it cannot reach, said plainly ──────────────────────────────────
 *
 * Only `/welcome`, `/login` and `/register` render without a session; every
 * other route redirects to `/login`. So this covers three pages, and the 37
 * unlabelled inputs found by hand are mostly behind the guard — which is why
 * `check-form-labels.mjs` exists alongside it, reading source so it can see
 * every page.
 *
 * Run: npm run check:a11y   (needs `npm run build` — it scans dist/)
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const ROOT = 'dist/e-bpco/browser';
const PORT = 4398;
const ROUTES = ['/welcome', '/login', '/register'];
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'laptop', width: 900, height: 800 },
  { name: 'tablet', width: 640, height: 900 },
  { name: 'phone', width: 420, height: 860 },
];

if (!existsSync(ROOT)) {
  console.error(`✘ a11y: ${ROOT} does not exist — run \`npm run build\` first.`);
  process.exit(2);
}

// axe-core is INJECTED rather than used through @axe-core/playwright. The
// wrapper lives only in a sibling repo's node_modules, and a gate that depends
// on another lane not running `npm ci` is a gate that breaks for reasons
// nobody here can see. axe.min.js is a single file evaluated in the page.
const AXE = '/Users/user/ServanaWorkerWeb/node_modules/axe-core/axe.min.js';
let chromium;
try {
  ({ chromium } = await import('/Users/user/ServanaWorkerWeb/node_modules/playwright/index.mjs'));
  if (!existsSync(AXE)) throw new Error(`axe-core not found at ${AXE}`);
} catch (error) {
  console.error('✘ a11y: could not load Playwright or axe-core.');
  console.error(`   ${String(error).split('\n')[0]}`);
  console.error('   This gate FAILS rather than skips: a silent skip reads as a pass.');
  process.exit(2);
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.json': 'application/json' };

const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent((req.url ?? '/').split('?')[0]));
  let file = join(ROOT, path);
  if (!existsSync(file) || extname(file) === '') file = join(ROOT, 'index.html');
  try {
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(PORT, r));

// Forces every animation and transition to its end state, so axe samples the
// colour a reader would actually see rather than one mid-fade.
const SETTLE = `*, *::before, *::after {
  animation-duration: 0s !important; animation-delay: 0s !important;
  transition-duration: 0s !important; transition-delay: 0s !important; }`;

const browser = await chromium.launch();
const findings = [];

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await context.newPage();
  for (const route of ROUTES) {
    await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: SETTLE });
    await page.waitForTimeout(120);
    await page.addScriptTag({ path: AXE });
    const { violations } = await page.evaluate(async () =>
      // eslint-disable-next-line no-undef
      await axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      }),
    );
    for (const v of violations) {
      findings.push({ vp: vp.name, width: vp.width, route, id: v.id, impact: v.impact,
        help: v.help, count: v.nodes.length,
        sample: v.nodes[0]?.target?.join(' ')?.slice(0, 70) ?? '' });
    }
  }
  await context.close();
}

await browser.close();
server.close();

const scanned = `${ROUTES.length} routes × ${VIEWPORTS.length} widths`;
if (findings.length === 0) {
  console.log(`a11y: clean (${scanned})`);
  process.exit(0);
}

console.error(`a11y: ${findings.length} violation(s) (${scanned})\n`);
for (const f of findings) {
  console.error(`  [${f.impact}] ${f.id} — ${f.route} at ${f.width}px (${f.count} node${f.count === 1 ? '' : 's'})`);
  console.error(`      ${f.help}`);
  if (f.sample) console.error(`      e.g. ${f.sample}`);
}
console.error('');
process.exit(1);
