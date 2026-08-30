/**
 * Runtime configuration for the eBPCO Admin Portal.
 *
 * Loaded from index.html BEFORE the application bundle, so the injection-token
 * factories in core/ see these values when they first resolve.
 *
 * ── Why a file rather than a compiled-in constant ────────────────────────
 *
 * These values differ per environment, and a portal that has to be rebuilt to
 * point at a different server is one that eventually gets pointed at the wrong
 * one. The tokens were written for exactly this — but nothing had ever defined
 * the globals they read, so the "set it without a rebuild" story did not work:
 * `API_BASE_URL` said it was "overridden in main.ts", and main.ts does not
 * mention it.
 *
 * ── How to set them ──────────────────────────────────────────────────────
 *
 * Edit this file for the environment being deployed, or have the deploy write
 * it. It is plain JavaScript with no build step, so a CI job can emit it from
 * environment variables without touching the Angular build.
 *
 * Leave a value as '' when it is genuinely unknown. Every consumer treats empty
 * as "not configured" and degrades honestly rather than guessing — the QR on a
 * previewed permit, for instance, is omitted rather than pointed at a host that
 * cannot serve it.
 */
globalThis.EBPCO_API_BASE_URL = '';

/**
 * Where a CITIZEN browses — the applicant-facing User Portal, which is a
 * different application, a different origin, and now a different repository
 * from this one. Not derivable from API_BASE_URL and not the same as the LGU
 * information website.
 *
 * Used to build the verification link a permit's QR code encodes. Empty means
 * no QR is rendered at all: a QR resolving to the wrong host is worse than
 * none, because the reader trusts it and follows it.
 */
globalThis.EBPCO_USER_PORTAL_BASE_URL = '';
