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
import { existsSync, readFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { createRequire } from 'node:module';

const require_ = createRequire(import.meta.url);

const ROOT = 'dist/e-bpco/browser';
const PORT = 4398;
// ── The denominator, stated ─────────────────────────────────────────────
//
// The citizen lane's warning, 3 Sep: their sweep visited 17 screens, reported
// the portal clean, and never went to /permits/apply -- where 22 unnamed file
// pickers sat. Screens behind a journey are the easiest to omit and the most
// consequential, because that is where the real work happens.
//
// The same hole was here. This gate scanned three URL-reachable pages out of a
// sixteen-route table and said "clean", which is true only of the three.
//
// So the two lists below are exhaustive and CHECKED against app.routes.ts on
// every run. A route that appears in neither fails the gate rather than
// quietly not being scanned.
const ROUTES = ['/', '/welcome', '/login', '/register'];

// Reachable only with a server-validated session. authGuard no longer mints one
// (it used to, which made every guarded route reachable by typing its URL), and
// the seeded account requires a second factor, so this gate cannot sign itself
// in. These are UNMEASURED -- not clean -- and are printed on every run.
const SESSION_REQUIRED = {
  '/dashboard': 'authGuard',
  '/applications': 'authGuard',
  '/applications/:id': 'authGuard + needs a record to exist',
  '/evaluations': 'authGuard',
  '/payments': 'authGuard',
  '/permit-release': 'authGuard',
  '/businesses': 'authGuard',
  '/archive': 'authGuard',
  '/access-requests': 'authGuard',
  '/user-roles': 'authGuard',
  '/workflow': 'authGuard',
  '/system-logs': 'authGuard',
};
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

// ── The denominator is DERIVED, not trusted ─────────────────────────────
//
// Reading app.routes.ts rather than a number typed here. A route that is in
// neither ROUTES nor SESSION_REQUIRED fails this gate, because the alternative
// is a screen that is never scanned and never mentioned -- which is how a sweep
// goes on reporting clean while coverage shrinks underneath it.
function declaredRoutes() {
  const src = readFileSync('src/app/app.routes.ts', 'utf8');
  const found = new Set();
  for (const m of src.matchAll(/path:\s*'([^']*)'/g)) {
    const path = m[1];
    if (path === '**') continue;
    // The object this path belongs to, up to the next path: or its closing brace.
    const rest = src.slice(m.index, m.index + 220);
    const tail = rest.slice(0, Math.min(...[rest.indexOf('path:', 5), rest.indexOf('},')]
      .filter((i) => i > 0).concat([rest.length])));
    if (/redirectTo/.test(tail)) continue;      // an alias, not a screen
    found.add(path === '' ? '/' : `/${path}`);
  }
  return found;
}

const declared = declaredRoutes();
const covered = new Set([...ROUTES, ...Object.keys(SESSION_REQUIRED)]);
const unaccounted = [...declared].filter((r) => !covered.has(r));
const stale = [...covered].filter((r) => !declared.has(r));
if (unaccounted.length || stale.length) {
  console.error('✘ a11y: the route table and this gate disagree.');
  for (const r of unaccounted) {
    console.error(`   ${r} is a route but is in neither ROUTES nor SESSION_REQUIRED.`);
  }
  for (const r of stale) {
    console.error(`   ${r} is listed here but no longer exists in app.routes.ts.`);
  }
  console.error('   A screen this gate does not know about is a screen it silently skips.');
  process.exit(2);
}

if (!existsSync(ROOT)) {
  console.error(`✘ a11y: ${ROOT} does not exist — run \`npm run build\` first.`);
  process.exit(2);
}

// playwright and axe-core are devDependencies OF THIS REPO. They were once
// imported by absolute path from a sibling product's node_modules, which meant
// this gate could only ever run on one machine, and would break here whenever
// that unrelated repo was cleaned. A gate nobody else can run is a gate that
// silently stops being run. Resolving them locally is what lets this run inside
// `npm run verify` at all.
//
// axe-core is still INJECTED as a file rather than used through
// @axe-core/playwright: axe.min.js is a single self-contained script evaluated
// in the page, so it needs no second wrapper package kept in step.
// Resolved INSIDE the try. At module top level a missing package throws a raw
// loader stack trace and exits 1 -- the code this gate uses for "violations
// found" -- so an uninstalled dependency would read as an accessibility
// failure. Exit 2 means "could not run"; the two must stay distinguishable.
let AXE;
let engines;
try {
  AXE = require_.resolve('axe-core/axe.min.js');
  const pw = await import('playwright');
  engines = { chromium: pw.chromium, webkit: pw.webkit };
  for (const [name, engine] of Object.entries(engines)) {
    if (!engine) throw new Error(`playwright exposes no ${name} engine`);
  }
  if (!existsSync(AXE)) throw new Error(`axe-core not found at ${AXE}`);
} catch (error) {
  console.error('✘ a11y: could not load Playwright or axe-core.');
  console.error('   Both are devDependencies of this repo — run `npm ci`.');
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

    // A navigation that did not land where it was sent is the failure the
    // citizen lane pressed on: a redirected or errored screen prints nothing
    // and reads exactly like a clean one, so a guard added tomorrow would
    // silently shrink this sweep while it went on saying clean for ever.
    // '/' legitimately resolves to the splash component without changing URL.
    const landed = new URL(page.url()).pathname;
    const want = route === '/' ? '/' : route;
    if (landed !== want) {
      console.error(`✘ a11y: ${route} redirected to ${landed} and was NOT scanned.`);
      console.error('   An unreachable screen is UNMEASURED, not clean.');
      console.error('   Either it gained a guard (move it to SESSION_REQUIRED and say so),');
      console.error('   or the sweep is broken. It is not a pass either way.');
      process.exit(1);
    }
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
const unmeasured = Object.keys(SESSION_REQUIRED);
const scanned =
  `${ROUTES.length} of ${declared.size} routes × ${CONFIGS.length} configs, ${engineCount} engines`;

// Printed whether the run passes or fails. A gap nobody is reminded of is a gap
// that becomes permanent.
function reportCoverage() {
  console.log(`a11y coverage: ${ROUTES.length} of ${declared.size} routes scanned.`);
  console.log(`  ${unmeasured.length} not reached BY THIS SWEEP -- they need a session:`);
  for (const r of unmeasured) console.log(`    ${r}  (${SESSION_REQUIRED[r]})`);
  console.log('  They are not unmeasured: a11y-guarded-screens.spec.ts mounts all twelve');
  console.log('  as components and runs axe on them, which found nested-interactive on');
  console.log('  five screens and an unnamed switch on system-logs.');
  console.log('  What that CANNOT see is anything needing layout -- contrast, focus');
  console.log('  order, target size, reflow -- because jsdom does not lay out. Those');
  console.log('  remain genuinely unmeasured here until a signed-in session exists.');
}
reportCoverage();
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
