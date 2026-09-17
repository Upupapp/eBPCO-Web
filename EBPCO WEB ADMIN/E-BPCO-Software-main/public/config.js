/**
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
globalThis.EBPCO_API_BASE_URL = "";

/**
 * Where a CITIZEN browses — the applicant-facing User Portal, a different
 * application, a different origin, and a different repository from this
 * one. Not derivable from EBPCO_API_BASE_URL and not the same as the LGU
 * information website. Used to build the verification link a permit's QR
 * code encodes; empty means no QR is rendered at all, since a QR resolving
 * to the wrong host is worse than none.
 */
globalThis.EBPCO_USER_PORTAL_BASE_URL = "";
