#!/usr/bin/env node
/**
 * The built index.html must not rely on an inline event-handler attribute.
 *
 * `netlify.toml`'s CSP is `script-src 'self'` with no `unsafe-inline` and no
 * hash/nonce, so an inline handler (`onload="..."`, `onerror="..."`, etc.)
 * is silently BLOCKED by the browser rather than failing the build — the
 * exact shape of the defect this gate exists for. It happened for real: the
 * production build's own critical-CSS optimisation (Angular's Beasties,
 * enabled by default whenever `optimization` is not explicitly overridden)
 * defers the full stylesheet with
 * `<link ... media="print" onload="this.media='all'">`, so the CSP's own
 * `script-src` blocked the ONE inline script the page needed to make its
 * own stylesheet apply. The Citizen Portal's login screen rendered as
 * unstyled HTML on the live site for as long as this went unnoticed, and
 * this portal's own login page carried the identical latent defect —
 * invisible only because enough of its styling happened to already be
 * critical-inlined. `ng serve`'s dev server sends no CSP header at all and
 * never reproduces this class of bug either way.
 *
 * Fixed by disabling `optimization.styles.inlineCritical` in angular.json's
 * production configuration (an explicit, plain `<link rel="stylesheet">`
 * has never needed a script to activate). This gate is the regression test:
 * it reads the REAL build output `npm run verify`'s own build step already
 * produced, not a copy of it.
 *
 * Run: npm run check:csp (after a build; npm run verify already orders it there)
 */
import { readFileSync, existsSync } from 'node:fs';

const path = 'dist/e-bpco/browser/index.html';

if (!existsSync(path)) {
  console.error(`csp-build: ${path} does not exist -- run npm run build first`);
  process.exit(1);
}

const html = readFileSync(path, 'utf8');

// Any on* HTML attribute is an inline event handler. `strict-dynamic`-style
// exceptions do not apply here since the CSP carries no nonce or hash.
const matches = [...html.matchAll(/\son[a-z]+\s*=/gi)];

if (matches.length === 0) {
  console.log('csp-build: clean');
  process.exit(0);
}

console.error(`csp-build: ${matches.length} inline event handler(s) in ${path}, blocked by script-src 'self'\n`);
for (const m of matches) console.error(`  ${m[0].trim()}`);
console.error('');
process.exit(1);
