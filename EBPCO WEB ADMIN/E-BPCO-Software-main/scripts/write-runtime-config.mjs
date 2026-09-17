#!/usr/bin/env node
/**
 * Writes `public/config.js` from the build's own environment, so a deploy
 * points this portal at a real API without anyone hand-editing a checked-in
 * file per environment.
 *
 * `public/config.js` has always documented this as the intended path ("have
 * the deploy write it... a CI job can emit it from environment variables
 * without touching the Angular build") — this is that CI job. It did not
 * exist until the gap was found: the file in git stayed hardcoded to `''`
 * (same-origin) through every deploy, which is silently correct only for a
 * topology (portal and API behind one shared gateway) nobody had actually
 * built.
 *
 * Run BEFORE `ng build` (see netlify.toml's `command`), because Angular's
 * asset step copies `public/` verbatim — whatever this file contains at that
 * moment is what ships.
 *
 * Deliberately not the reverse: this never invents a value. An unset
 * variable writes `''`, exactly what the file already shipped with, so a
 * deploy that has not been given a real API host degrades to the same
 * honestly-disabled behaviour as before (same-origin, or "not configured"
 * for whatever specifically checks for '') rather than guessing at one.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const target = join(here, '..', 'public', 'config.js');

const apiBaseUrl = process.env.EBPCO_API_BASE_URL ?? '';
const userPortalBaseUrl = process.env.EBPCO_USER_PORTAL_BASE_URL ?? '';

const contents = `/**
 * Runtime configuration for the eBPCO Admin Portal.
 *
 * GENERATED at build time by scripts/write-runtime-config.mjs, from
 * EBPCO_API_BASE_URL / EBPCO_USER_PORTAL_BASE_URL in the build environment —
 * do not hand-edit this file; edit those variables (in Netlify's UI, or
 * wherever this build actually runs) and rebuild instead. Empty means the
 * corresponding variable was not set, which is a real, honestly-degraded
 * state (see the script's own doc comment), not a mistake.
 *
 * Loaded from index.html BEFORE the application bundle, so the
 * injection-token factories in core/ see these values when they first
 * resolve. See core/api/api.config.ts for how EBPCO_API_BASE_URL is read;
 * empty means same-origin, which is what a portal served behind the same
 * gateway as the API wants.
 */
globalThis.EBPCO_API_BASE_URL = ${JSON.stringify(apiBaseUrl)};

/**
 * Where a CITIZEN browses — the applicant-facing User Portal, a different
 * application, a different origin, and a different repository from this
 * one. Not derivable from EBPCO_API_BASE_URL and not the same as the LGU
 * information website. Used to build the verification link a permit's QR
 * code encodes; empty means no QR is rendered at all, since a QR resolving
 * to the wrong host is worse than none.
 */
globalThis.EBPCO_USER_PORTAL_BASE_URL = ${JSON.stringify(userPortalBaseUrl)};
`;

writeFileSync(target, contents, 'utf8');

process.stdout.write(
  `wrote public/config.js `
  + `(EBPCO_API_BASE_URL=${apiBaseUrl === '' ? '<unset, same-origin>' : JSON.stringify(apiBaseUrl)}, `
  + `EBPCO_USER_PORTAL_BASE_URL=${userPortalBaseUrl === '' ? '<unset>' : JSON.stringify(userPortalBaseUrl)})\n`,
);
