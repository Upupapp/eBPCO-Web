import { Injectable, computed, inject } from '@angular/core';

import { SessionService } from './session.service';

/**
 * What the signed-in officer may do, in one place.
 *
 * Owner ruling, 2026-08-31: an ADMIN account's sub-type is its accessibility —
 * which forms it may work on, and whether it may only view or may also respond
 * to citizens and decide applications.
 *
 * ── Why one capability rather than a flag per component ─────────────────
 *
 * Every screen that decides for itself whether the officer may write is a
 * screen that can decide differently. That is not hypothetical here: this
 * portal already shipped a badge that was correct on one page and permanently
 * wrong on another because two surfaces answered the same question separately.
 * A permission answered in eleven places is a permission that is wrong in at
 * least one of them, and the wrong one is always the one nobody opened.
 *
 * ── This is not security ────────────────────────────────────────────────
 *
 * `canEdit` decides what to SHOW. The server decides what may happen, and it
 * fails closed on its own. Hiding a control is a courtesy to the officer — it
 * stops them composing a decision the API will refuse — and it is never the
 * thing that stops anybody. Anyone treating this as the enforcement point has
 * misread it; `permissions.ts` carries the same warning for navigation.
 *
 * ── Silence is not denial ───────────────────────────────────────────────
 *
 * `session.scopes` is null when `/me` did not report scopes at all, which is a
 * different fact from reporting none. Treating silence as an empty set would
 * disable every write control against a server that has not shipped the field;
 * treating it as full access would grant edit to an auditor. So: prefer the
 * server's scopes when they exist, fall back to the role otherwise, and say
 * which was used — a capability whose provenance is invisible is one nobody
 * can debug when it is wrong.
 */

/** Scopes that confer authority rather than sight. Mirrors the API's own split. */
const AUTHORITY_SCOPES: readonly string[] = [
  'applications:write',
  'documents:write',
  'payments:write',
  'notifications:write',
  'staff:receive',
  'staff:evaluate',
  'staff:assess',
  'staff:verify-payment',
  'staff:approve',
  'staff:release',
  'staff:administer',
];

/**
 * Roles that may act, used only when the server reported no scopes.
 *
 * `Auditor` is deliberately absent: it is defined as read everything, change
 * nothing. The API had a defect until 2026-08-30 where an auditor could move
 * applications through intake because a transition rule named a read scope as
 * its authority — this list must not reintroduce that on the client.
 */
const EDITING_ROLES: readonly string[] = [
  'Super Admin',
  'Administrator',
  'Evaluator',
  'Payment Officer',
  'Approving Officer',
  'Releasing Officer',
];

export type CapabilitySource = 'scopes' | 'role' | 'none';

@Injectable({ providedIn: 'root' })
export class Capabilities {
  private readonly session = inject(SessionService);

  /** Where `canEdit` got its answer. Surfaced so a wrong answer is debuggable. */
  readonly source = computed<CapabilitySource>(() => {
    const current = this.session.session();
    if (current === null) return 'none';
    return current.scopes === null ? 'role' : 'scopes';
  });

  /**
   * Whether this officer may respond to citizens and decide applications.
   *
   * False when nobody is signed in — the safe answer, and the one that keeps a
   * half-restored session from briefly showing write controls.
   */
  readonly canEdit = computed<boolean>(() => {
    const current = this.session.session();
    if (current === null) return false;
    if (current.scopes !== null) {
      return current.scopes.some((scope) => AUTHORITY_SCOPES.includes(scope));
    }
    return EDITING_ROLES.includes(current.role);
  });

  /**
   * The forms this officer may work on, as the server reported them.
   *
   * `null` means the server did not say. The queue is scoped SERVER-side and
   * this is never used to filter — filtering a full list here would leak the
   * existence and count of applications the officer may not see, which is the
   * thing the scoping exists to prevent. It is carried so an empty queue can be
   * explained, and so an officer can see what they hold without asking.
   */
  readonly assignedForms = computed<readonly string[] | null>(
    () => this.session.session()?.assignedForms ?? null,
  );
  // MEASURED 2026-08-31 (F-32): `/me` does not return `permitTypes` for staff,
  // so this is currently ALWAYS null and every surface reading it renders
  // nothing. That is the designed behaviour for "the server did not say" — it
  // is why none of them shows a wrong answer — but it means the forms-scoped
  // explanations never appear. `GET /staff/users/:id/access` has the data and
  // requires `staff:administer`, so an officer cannot read their own. Filed
  // for the backend; nothing on this side can close it.

  /** True when the server said this account is assigned no forms at all. */
  readonly hasNoForms = computed(() => this.assignedForms()?.length === 0);

  /** True when signed in and unable to edit — the state that needs explaining. */
  readonly isViewOnly = computed(() => this.session.session() !== null && !this.canEdit());

  /**
   * One sentence for every view-only surface, so the wording cannot drift and
   * an officer meets the same explanation wherever they hit the limit.
   */
  readonly viewOnlyReason = computed(() =>
    this.isViewOnly()
      ? 'Your account has View only access, so this is shown as a record rather than a form. '
        + 'An administrator can change what you may do.'
      : '',
  );
}
