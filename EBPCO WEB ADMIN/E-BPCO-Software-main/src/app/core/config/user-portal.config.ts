import { InjectionToken } from '@angular/core';

/**
 * Where the applicant-facing User Portal lives.
 *
 * Separate from `API_BASE_URL` because it is a different thing: that is where
 * this portal *calls*, this is where a *citizen* browses. They are not the same
 * host and there is no rule that makes one derivable from the other.
 *
 * ── Why this exists ─────────────────────────────────────────────────────
 *
 * The permit preview builds a QR code linking to a document's verification
 * page. It used to build that link from `window.location.origin` — the origin
 * the code happens to be running on. That is correct on the User Portal, where
 * this document normally lives, and wrong here: staff preview it on the ADMIN
 * portal, which has no `/verify` route and whose router ends in
 * `{ path: '**', redirectTo: 'login' }`.
 *
 * Measured against the deployed admin before this existed:
 *
 *     GET https://ebpcowebadmin.netlify.app/verify/BP-2026-0001  ->  200,
 *     E-BPCO Admin Portal
 *
 * So a citizen scanning a permit a staff member had previewed was taken to a
 * staff login screen for a system they have no account on.
 *
 * The User Portal is now a separate repository as well as a separate origin, so
 * the admin cannot infer it. It has to be told.
 *
 * ── Empty means "no QR" ─────────────────────────────────────────────────
 *
 * Unset resolves to `''`, and the preview then renders no QR at all rather than
 * one built on a guess. A QR that resolves to the wrong host is worse than no
 * QR: the reader trusts it, follows it, and lands somewhere that cannot help
 * them. Same reasoning as every other unknown in this portal — say nothing
 * rather than something untrue.
 */
export const USER_PORTAL_BASE_URL = new InjectionToken<string>('EBPCO_USER_PORTAL_BASE_URL', {
  providedIn: 'root',
  factory: () => {
    const configured = (globalThis as { EBPCO_USER_PORTAL_BASE_URL?: unknown })
      .EBPCO_USER_PORTAL_BASE_URL;
    return typeof configured === 'string' ? configured.replace(/\/$/, '') : '';
  },
});
