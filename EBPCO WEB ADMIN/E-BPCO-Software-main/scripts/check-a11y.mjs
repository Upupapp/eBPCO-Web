#!/usr/bin/env node
/**
 * Accessibility gate: axe-core against the real rendered DOM, at four widths.
 *
 * Every other gate in this repo reads source. This one sees what a browser
 * actually produces — and a source scan cannot see a contrast ratio, a focus
 * order, or a control that only exists below a breakpoint.
 *
 * ── Why four viewports AND two engines ──────────────────────────────────
 *
 * The citizen web portal lane raised the viewport axis on 2 Sep. This portal has
 * 33 rules below 900px across eight pages — sidebars collapse, tables become
 * cards, filter bars stack. A desktop-only scan sees none of it.
 *
 * Re-checked their gate on 3 Sep before repeating the criticism, and they had
 * already fixed it — and gone further than this one: they scan WebKit as well as
 * Chromium. That axis is not cosmetic. Chromium cannot see iOS zooming an input
 * under 16px, a native select ignoring an authored height, or Safari's shorter
 * landscape viewport. Adopted here on that evidence: Chromium at four widths for
 * the responsive axis, WebKit at phone width for the engine axis.
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
const CONFIGS = [
  { name: 'desktop', engine: 'chromium', width: 1280, height: 900 },
  { name: 'laptop', engine: 'chromium', width: 900, height: 800 },
  { name: 'tablet', engine: 'chromium', width: 640, height: 900 },
  { name: 'phone', engine: 'chromium', width: 420, height: 860 },
  // 390x844 is an iPhone 14/15 in portrait. WebKit is the only engine that
  // reproduces Safari's layout; the width is deliberately the citizen lane's so
  // a finding can be compared across the two portals without re-measuring.
  { name: 'phone-webkit', engine: 'webkit', width: 390, height: 844 },
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
let engines;
try {
  const pw = await import('/Users/user/ServanaWorkerWeb/node_modules/playwright/index.mjs');
  engines = { chromium: pw.chromium, webkit: pw.webkit };
  for (const [name, engine] of Object.entries(engines)) {
    if (!engine) throw new Error(`playwright exposes no ${name} engine`);
  }
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

// Browsers are launched on demand and reused across configs of the same engine.
// A launch failure FAILS the gate for the same reason a missing browser does: a
// config that silently did not run reads exactly like a config that passed.
const browsers = new Map();
async function browserFor(engine) {
  if (!browsers.has(engine)) {
    try {
      browsers.set(engine, await engines[engine].launch());
    } catch (error) {
      console.error(`✘ a11y: could not launch ${engine}.`);
      console.error(`   ${String(error).split('\n')[0]}`);
      console.error(`   Install it with: npx playwright install ${engine}`);
      process.exit(2);
    }
  }
  return browsers.get(engine);
}

const findings = [];

for (const vp of CONFIGS) {
  const browser = await browserFor(vp.engine);
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
      findings.push({ vp: vp.name, width: vp.width, engine: vp.engine, route, id: v.id, impact: v.impact,
        help: v.help, count: v.nodes.length,
        sample: v.nodes[0]?.target?.join(' ')?.slice(0, 70) ?? '' });
    }
  }
  await context.close();
}

for (const browser of browsers.values()) await browser.close();
server.close();

const engineCount = new Set(CONFIGS.map((c) => c.engine)).size;
const scanned = `${ROUTES.length} routes × ${CONFIGS.length} configs, ${engineCount} engines`;
if (findings.length === 0) {
  console.log(`a11y: clean (${scanned})`);
  process.exit(0);
}

console.error(`a11y: ${findings.length} violation(s) (${scanned})\n`);
for (const f of findings) {
  console.error(`  [${f.impact}] ${f.id} — ${f.route} at ${f.width}px ${f.engine} (${f.count} node${f.count === 1 ? '' : 's'})`);
  console.error(`      ${f.help}`);
  if (f.sample) console.error(`      e.g. ${f.sample}`);
}
console.error('');
process.exit(1);
