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
    roles: ['Super Admin', 'Administrator', 'Evaluator', 'Approving Officer'],
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
    key: 'user-roles',
    label: 'Users & Roles',
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
  /** Approving a submitted assessment and issuing its Order of Payment — kept distinct from drafting/editing so an Evaluator can start an assessment without being able to authorize collection. */
  approveAssessment: (role: StaffRole): boolean =>
    role === 'Super Admin' || role === 'Administrator',
  recordPayment: (role: StaffRole): boolean =>
    role === 'Super Admin' || role === 'Administrator' || role === 'Payment Officer',
  verifyPayment: (role: StaffRole): boolean =>
    role === 'Super Admin' || role === 'Administrator' || role === 'Payment Officer',
  /** Void/reversal/refund of an already-Verified transaction — more sensitive than recording or verifying a fresh one, so narrowed to admin-level roles. */
  adjustPayment: (role: StaffRole): boolean => role === 'Super Admin' || role === 'Administrator',
  generatePermit: (role: StaffRole): boolean =>
    role === 'Super Admin' || role === 'Administrator' || role === 'Approving Officer',
  releasePermit: (role: StaffRole): boolean =>
    role === 'Super Admin' || role === 'Administrator' || role === 'Releasing Officer',
  configurePayments: (role: StaffRole): boolean => role === 'Super Admin',
  /** Editing a permit type's required-document checklist (Permit Release > Permit Types). Anyone who can reach Permit Release may VIEW it; only these roles may add/edit/remove a document. */
  configureRequirements: (role: StaffRole): boolean =>
    role === 'Super Admin' || role === 'Administrator',
};
