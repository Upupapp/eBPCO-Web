// Central permission registry — the sidebar and the route guards both
// read from this SAME list, so hiding a link and authorizing a URL can
// never drift apart (per the "hiding a link is not authorization"
// requirement). Role names follow docs/08-Reusable-Stitch/02-User-Roles.md's
// hierarchy, narrowed to the roles this internal staff portal actually
// serves (the external "Business Owner" role lives in mobile, not here).
export type StaffRole =
  | 'Super Admin'
  | 'Administrator'
  | 'Evaluator'
  | 'Payment Officer'
  | 'Approving Officer'
  | 'Releasing Officer'
  | 'Auditor';

export const ALL_STAFF_ROLES: StaffRole[] = [
  'Super Admin',
  'Administrator',
  'Evaluator',
  'Payment Officer',
  'Approving Officer',
  'Releasing Officer',
  'Auditor',
];

export type NavGroup = 'root' | 'operations' | 'administration';

export interface NavModule {
  key: string;
  label: string;
  icon: string;
  path: string;
  group: NavGroup;
  /** Which roles see this module in the sidebar AND may load its route directly. */
  roles: StaffRole[];
}

// Sidebar order == this array's order == the grouping the user specified:
// Dashboard, then Operations (Applications/Evaluations/Payments/Permit
// Release), then Administration (Businesses/Users & Roles/Workflow/System
// Logs). Super Admin sees everything; every other role is scoped to the
// modules its job actually touches.
export const NAV_MODULES: NavModule[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'home',
    path: '/dashboard',
    group: 'root',
    roles: ALL_STAFF_ROLES,
  },

  {
    key: 'applications',
    label: 'Applications',
    icon: 'user',
    path: '/applications',
    group: 'operations',
    // Payment Officer added alongside the 'Send to Approval' quick action
    // (Payment Verified -> For Approval, `staff:verify-payment`) —
    // without this, the officer who holds the only scope that can make
    // that hop had no route to the page the action lives on at all.
    roles: ['Super Admin', 'Administrator', 'Evaluator', 'Approving Officer', 'Payment Officer'],
  },
  {
    key: 'evaluations',
    label: 'Evaluations',
    icon: 'calendar',
    path: '/evaluations',
    group: 'operations',
    roles: ['Super Admin', 'Administrator', 'Evaluator'],
  },
  {
    key: 'payments',
    label: 'Payments',
    icon: 'wallet',
    path: '/payments',
    group: 'operations',
    roles: ['Super Admin', 'Administrator', 'Payment Officer'],
  },
  {
    key: 'permit-release',
    label: 'Permit Release',
    icon: 'file-check',
    path: '/permit-release',
    group: 'operations',
    roles: ['Super Admin', 'Administrator', 'Releasing Officer'],
  },

  {
    key: 'businesses',
    label: 'Businesses',
    icon: 'building',
    path: '/businesses',
    group: 'administration',
    roles: ['Super Admin', 'Administrator'],
  },
  {
    key: 'citizens',
    label: 'Citizens',
    icon: 'users',
    path: '/citizens',
    group: 'administration',
    // Same two roles as Businesses, immediately after it — and NOT, despite
    // the module brief's literal wording, a four-role list naming
    // 'Receiving Officer'/'Records Officer' directly: this portal has no
    // such `StaffRole` values at all. `role-map.ts`'s own `BY_WIRE_NAME`
    // already collapses both backend roles (`receiving-officer`,
    // `records-officer`, both of which hold the server's `citizens:read`
    // scope) into 'Administrator' for every screen in this portal, so
    // gating on 'Administrator' here reaches those officers exactly as
    // asked — through the SAME collapse Businesses, Users & Roles and every
    // other administration-group module already rely on, not a new one
    // invented for this module alone. See CITIZENS-HANDOFF.md.
    roles: ['Super Admin', 'Administrator'],
  },
  {
    key: 'access-requests',
    label: 'Access Requests',
    icon: 'user',
    path: '/access-requests',
    group: 'administration',
    // Super Admin ALONE. The owner's ruling is that approval is the super
    // admin's, and an Administrator who could approve access requests could
    // grant themselves anything by approving their own second account.
    roles: ['Super Admin'],
  },

  {
    key: 'user-roles',
    // Label only — 'Staff & Roles' now that Citizens exists as its own
    // module and 'Users' would be ambiguous between the two. `key` and
    // `path` are UNCHANGED ('user-roles'/'/user-roles') so nothing that
    // reads either breaks.
    label: 'Staff & Roles',
    icon: 'user-check',
    path: '/user-roles',
    group: 'administration',
    roles: ['Super Admin', 'Administrator'],
  },
  {
    key: 'workflow',
    label: 'Workflow',
    icon: 'workflow',
    path: '/workflow',
    group: 'administration',
    roles: ['Super Admin', 'Administrator'],
  },
  {
    key: 'archive',
    label: 'Archive',
    icon: 'archive',
    path: '/archive',
    group: 'administration',
    // Everyone who can see applications can see what was set aside. A
    // preservation guarantee only counts if the people relying on it can look.
    roles: ALL_STAFF_ROLES,
  },

  {
    key: 'system-logs',
    label: 'System Logs',
    icon: 'logs',
    path: '/system-logs',
    group: 'administration',
    roles: ['Super Admin', 'Administrator', 'Auditor'],
  },
];

/** True if `role` may see/enter the module that owns `path` (matches the module's own path or a `path/:id`-style child). Paths not registered as a module (public pages, the detail sub-route) are treated as accessible — the guard checks the parent module's own path for those. */
export function canAccessPath(role: StaffRole, path: string): boolean {
  const mod = NAV_MODULES.find((m) => path === m.path || path.startsWith(`${m.path}/`));
  if (!mod) return true;
  return mod.roles.includes(role);
}

// Action-level permissions beyond "can see the module" — e.g. every
// Evaluator can open Applications, but only these roles can act on the
// specific admin actions described in the consolidation spec.
export const ACTION_PERMISSIONS = {
  createApplication: (role: StaffRole): boolean =>
    role === 'Super Admin' || role === 'Administrator',
  archiveApplication: (role: StaffRole): boolean =>
    role === 'Super Admin' || role === 'Administrator',
  recordEvaluation: (role: StaffRole): boolean =>
    role === 'Super Admin' || role === 'Administrator' || role === 'Evaluator',
  /** The Applications detail page's "Mark Approved" quick action — same role tier as generatePermit, since approving and generating the permit are the same office's responsibility. Kept distinct from `recordEvaluation`'s own Final-Approval-stage "Approve" (Evaluators legitimately pass evaluation stages; this is the separate, later step of actually approving the application record). */
  approveApplication: (role: StaffRole): boolean =>
    role === 'Super Admin' || role === 'Administrator' || role === 'Approving Officer',
  /** Manual administrator confirmation of an applicant's email/mobile — the only verification path this frontend-only mock can honestly perform (see setContactVerification in application-store.ts). */
  verifyContact: (role: StaffRole): boolean => role === 'Super Admin' || role === 'Administrator',
  assessFee: (role: StaffRole): boolean =>
    role === 'Super Admin' || role === 'Administrator' || role === 'Evaluator',
  /** Editing a Draft assessment's line items/due date, and submitting it for approval. */
  editAssessment: (role: StaffRole): boolean =>
    role === 'Super Admin' || role === 'Administrator' || role === 'Payment Officer',
  /**
   * Approving a submitted assessment and issuing its Order of Payment.
   *
   * Payment Officer holds this via the real `staff:assess` scope (assessor/
   * cashier accounts). Super Admin was ALSO granted `staff:assess` on the
   * backend directly (2026-09-13, owner's explicit request — a deliberate
   * reversal of the separation-of-duty design `account.ts`'s `ROLE_SCOPES`
   * used to enforce for this role), so it is not merely shown the button for
   * visibility here: it genuinely holds the scope now. Administrator still
   * does not, and would still be refused server-side. The server still
   * separately refuses an assessor approving their OWN draft (self-approval,
   * checked by account, not role) — that check applies to Super Admin too.
   */
  approveAssessment: (role: StaffRole): boolean =>
    role === 'Super Admin' || role === 'Administrator' || role === 'Payment Officer',
  recordPayment: (role: StaffRole): boolean =>
    role === 'Super Admin' || role === 'Administrator' || role === 'Payment Officer',
  verifyPayment: (role: StaffRole): boolean =>
    role === 'Super Admin' || role === 'Administrator' || role === 'Payment Officer',
  /**
   * Void/reversal/refund of an already-Verified transaction.
   *
   * Includes Payment Officer for the same reason as `approveAssessment`
   * above: `staff:verify-payment` is a cashier-only scope in the real
   * backend. Super Admin holds it too, for the same reason it holds
   * `staff:assess` now — see `approveAssessment`'s comment. Administrator
   * still does not, and would still be refused server-side.
   */
  adjustPayment: (role: StaffRole): boolean =>
    role === 'Super Admin' || role === 'Administrator' || role === 'Payment Officer',
  generatePermit: (role: StaffRole): boolean =>
    role === 'Super Admin' || role === 'Administrator' || role === 'Approving Officer',
  releasePermit: (role: StaffRole): boolean =>
    role === 'Super Admin' || role === 'Administrator' || role === 'Releasing Officer',
  configurePayments: (role: StaffRole): boolean => role === 'Super Admin',
  /** Editing a permit type's required-document checklist (Permit Release > Permit Types). Anyone who can reach Permit Release may VIEW it; only these roles may add/edit/remove a document. */
  configureRequirements: (role: StaffRole): boolean =>
    role === 'Super Admin' || role === 'Administrator',

  // ── Citizens module ──────────────────────────────────────────────────
  //
  // Every one of these matches the server's own `staff:administer` gate
  // (`staff-citizens.controller.ts`) — no portal role short of that scope
  // could make the call succeed even with the button shown, but hiding it
  // is still correct UX ("hiding a link is not authorization" applies to
  // buttons the same as routes): a role that cannot act should not be shown
  // a control that will only ever come back refused.
  'citizen.signOutSessions': (role: StaffRole): boolean =>
    role === 'Super Admin' || role === 'Administrator',
  'citizen.disable': (role: StaffRole): boolean =>
    role === 'Super Admin' || role === 'Administrator',
  'citizen.enable': (role: StaffRole): boolean =>
    role === 'Super Admin' || role === 'Administrator',
  'citizen.sendResetLink': (role: StaffRole): boolean =>
    role === 'Super Admin' || role === 'Administrator',
  'citizen.rectify': (role: StaffRole): boolean =>
    role === 'Super Admin' || role === 'Administrator',
  'citizen.erase': (role: StaffRole): boolean =>
    role === 'Super Admin' || role === 'Administrator',
};
