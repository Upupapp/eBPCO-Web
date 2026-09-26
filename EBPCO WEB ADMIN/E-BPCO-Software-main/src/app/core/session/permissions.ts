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
  /**
   * The server scopes that open this module — any one of them (officer
   * positions, 2026-09-26). The sidebar and the route guard both read this
   * whenever `/me` reported scopes, so a screen is shown to exactly the
   * accounts whose requests it would make succeed: a Receiving Officer no
   * longer sees Staff & Roles because the portal once filed them under
   * "Administrator". `'any'` is every signed-in officer.
   */
  scopes: readonly string[] | 'any';
  /** Super admin only, whatever the scopes say (the owner's ruling for Access Requests). */
  superAdminOnly?: boolean;
  /** The portal roles that see it — used only when `/me` reported no scopes. */
  roles: StaffRole[];
}

/**
 * What the signed-in officer may do, as one value the sidebar, the route
 * guard and every button ask — the server's own scopes, the account's
 * evaluation stages, and the portal role as a fallback for a session with no
 * scopes (an offline dev bypass).
 */
export interface Authority {
  readonly role: StaffRole;
  /** Null when `/me` did not report scopes — silence, not "none". */
  readonly scopes: readonly string[] | null;
  /** The evaluation stages this account decides; null when `/me` did not say. */
  readonly stages: readonly string[] | null;
  readonly superAdmin: boolean;
}

/** Whether this officer may open a module. */
export function mayOpen(mod: NavModule, who: Authority | StaffRole): boolean {
  if (typeof who === 'string') return mod.roles.includes(who);
  if (mod.superAdminOnly === true) return who.superAdmin;
  if (who.scopes === null) return mod.roles.includes(who.role);
  if (mod.scopes === 'any') return true;
  return mod.scopes.some((scope) => who.scopes!.includes(scope));
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
    scopes: 'any',
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
    scopes: ['applications:read'],
    roles: ['Super Admin', 'Administrator', 'Evaluator', 'Approving Officer', 'Payment Officer'],
  },
  {
    key: 'evaluations',
    label: 'Evaluations',
    icon: 'calendar',
    path: '/evaluations',
    group: 'operations',
    scopes: ['staff:evaluate', 'audit:read'],
    roles: ['Super Admin', 'Administrator', 'Evaluator'],
  },
  {
    key: 'payments',
    label: 'Payments',
    icon: 'wallet',
    path: '/payments',
    group: 'operations',
    scopes: ['staff:assess', 'staff:verify-payment', 'audit:read'],
    roles: ['Super Admin', 'Administrator', 'Payment Officer'],
  },
  {
    key: 'permit-release',
    label: 'Permit Release',
    icon: 'file-check',
    path: '/permit-release',
    group: 'operations',
    scopes: ['staff:release', 'staff:approve', 'audit:read'],
    roles: ['Super Admin', 'Administrator', 'Releasing Officer'],
  },

  {
    key: 'businesses',
    label: 'Businesses',
    icon: 'building',
    path: '/businesses',
    group: 'administration',
    scopes: ['applications:write', 'staff:administer', 'citizens:read'],
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
    scopes: ['citizens:read'],
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
    scopes: ['staff:administer'],
    superAdminOnly: true,
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
    scopes: ['staff:administer'],
    roles: ['Super Admin', 'Administrator'],
  },
  {
    key: 'workflow',
    label: 'Workflow',
    icon: 'workflow',
    path: '/workflow',
    group: 'administration',
    scopes: ['staff:administer'],
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
    scopes: ['applications:read'],
    roles: ALL_STAFF_ROLES,
  },

  {
    key: 'system-logs',
    label: 'System Logs',
    icon: 'logs',
    path: '/system-logs',
    group: 'administration',
    scopes: ['audit:read'],
    roles: ['Super Admin', 'Administrator', 'Auditor'],
  },
];

/** True if `role` may see/enter the module that owns `path` (matches the module's own path or a `path/:id`-style child). Paths not registered as a module (public pages, the detail sub-route) are treated as accessible — the guard checks the parent module's own path for those. */
export function canAccessPath(who: Authority | StaffRole, path: string): boolean {
  const mod = NAV_MODULES.find((m) => path === m.path || path.startsWith(`${m.path}/`));
  if (!mod) return true;
  return mayOpen(mod, who);
}

/**
 * One action: allowed to whoever holds any of `scopes`, or — for a session
 * that reported no scopes — to the listed portal roles, as before.
 */
function action(scopes: readonly string[], roles: readonly StaffRole[]) {
  return (who: Authority | StaffRole): boolean => {
    if (typeof who === 'string') return roles.includes(who);
    if (who.scopes === null) return roles.includes(who.role);
    return scopes.some((scope) => who.scopes!.includes(scope));
  };
}

/**
 * Whether this officer decides `stage` (migration 057): the evaluate scope
 * AND the stage assigned — the server refuses any other stage, so the portal
 * offers no button for one. A session whose `/me` did not report stages (an
 * older server) is not second-guessed.
 */
export function mayEvaluateStage(who: Authority | null, stage: string): boolean {
  if (who === null) return false;
  if (who.scopes !== null && !who.scopes.includes('staff:evaluate')) return false;
  if (who.scopes === null && !['Super Admin', 'Administrator', 'Evaluator'].includes(who.role)) return false;
  return who.superAdmin || who.stages === null || who.stages.includes(stage);
}

/**
 * The scope each staff status move needs — the server's `lifecycle_transitions`
 * as seeded. The Workflow screen can edit that table and the server stays the
 * judge; this only keeps the Action menu from offering a Cashier "Mark
 * Received" or a Zoning Officer a move on the Fire Safety stage.
 */
const MOVE_SCOPE: Readonly<Record<string, string>> = {
  'Draft>Submitted': 'applications:write',
  'Draft>Cancelled': 'applications:write',
  'Submitted>Received': 'staff:receive',
  'Submitted>Cancelled': 'applications:write',
  'Received>Document Verification': 'staff:receive',
  'Received>Cancelled': 'applications:write',
  'Document Verification>Under Evaluation': 'staff:evaluate',
  'Document Verification>Revision Required': 'staff:evaluate',
  'Document Verification>Rejected': 'staff:approve',
  'Under Evaluation>Assessed': 'staff:assess',
  'Under Evaluation>Revision Required': 'staff:evaluate',
  'Under Evaluation>Rejected': 'staff:approve',
  'Revision Required>Cancelled': 'applications:write',
  'Revision Required>Expired': 'applications:write',
  'Assessed>Cancelled': 'staff:assess',
  'Assessed>Expired': 'staff:assess',
  'Payment Submitted>Payment Under Verification': 'staff:verify-payment',
  'Payment Under Verification>Payment Verified': 'staff:verify-payment',
  'Payment Under Verification>Payment Submitted': 'staff:verify-payment',
  'Payment Verified>For Approval': 'staff:verify-payment',
  'For Approval>Approved': 'staff:approve',
  'For Approval>Revision Required': 'staff:approve',
  'For Approval>Rejected': 'staff:approve',
  'Approved>Permit Generated': 'staff:approve',
  'Permit Generated>Ready for Release': 'staff:release',
  'Ready for Release>Released': 'staff:release',
  'Released>Completed': 'staff:release',
  'Cancelled>Submitted': 'staff:approve',
  'Rejected>Submitted': 'staff:approve',
  'Expired>Submitted': 'staff:approve',
};

/**
 * Whether this officer may make the move `from` → `to`. For an evaluation
 * move the stage matters too: out of Document Verification it is the Initial
 * stage's, out of Under Evaluation it is `stageOnHand`'s (the stage the
 * application is waiting on) — the same rule the server enforces.
 */
export function mayMove(who: Authority | null, from: string, to: string, stageOnHand: string | null): boolean {
  if (who === null) return false;
  const scope = MOVE_SCOPE[`${from}>${to}`];
  // A move this table does not know (added on the Workflow screen) is the server's to judge.
  if (scope === undefined || who.scopes === null) return true;
  if (!who.scopes.includes(scope)) return false;
  if (scope !== 'staff:evaluate') return true;
  const stage = from === 'Document Verification' ? 'Initial' : stageOnHand;
  return stage === null || mayEvaluateStage(who, stage);
}

// Action-level permissions beyond "can see the module" — e.g. every
// Evaluator can open Applications, but only these roles can act on the
// specific admin actions described in the consolidation spec.
export const ACTION_PERMISSIONS = {
  // Each action names the SERVER scope its request needs, so a button shows
  // exactly when the server would accept it (officer positions, 2026-09-26).
  // The role list after it is only the fallback for a session that reported no
  // scopes, and keeps what each action allowed before.
  createApplication: action(['applications:write'], ['Super Admin', 'Administrator']),
  /**
   * Opening an application to work on it — the Edit button, as against View.
   * Any acting scope: each control inside is still gated by its own action, and
   * the server judges every request. An Auditor holds none, so sees View only.
   */
  workOnApplication: action(
    [
      'applications:write', 'staff:receive', 'staff:evaluate', 'staff:assess', 'staff:verify-payment',
      'staff:approve', 'staff:release', 'staff:annotate',
    ],
    ['Super Admin', 'Administrator', 'Evaluator', 'Payment Officer', 'Approving Officer', 'Releasing Officer'],
  ),
  archiveApplication: action(['applications:write'], ['Super Admin', 'Administrator']),
  /** Correcting, deactivating or reactivating a registered business — the server's `applications:write`. */
  editBusiness: action(['applications:write'], ['Super Admin', 'Administrator']),
  /** Passing or returning an evaluation stage. Which STAGE is `mayEvaluateStage`'s question. */
  recordEvaluation: action(['staff:evaluate'], ['Super Admin', 'Administrator', 'Evaluator']),
  /** Approving the application record — the Building Official's act, separate from passing the Final Approval stage. */
  approveApplication: action(['staff:approve'], ['Super Admin', 'Administrator', 'Approving Officer']),
  /** Manual administrator confirmation of an applicant's email — the LGU verifies email only, not mobile. */
  verifyContact: action(['staff:administer'], ['Super Admin', 'Administrator']),
  /** Issuing the Order of Payment — the Assessor's `staff:assess`. */
  assessFee: action(['staff:assess'], ['Super Admin', 'Administrator', 'Evaluator']),
  /** Editing a Draft assessment's line items/due date, and submitting it for approval. */
  editAssessment: action(['staff:assess'], ['Super Admin', 'Administrator', 'Payment Officer']),
  /**
   * Approving a submitted assessment and issuing its Order of Payment. The
   * server still refuses an assessor approving their OWN draft, whoever they are.
   */
  approveAssessment: action(['staff:assess'], ['Super Admin', 'Administrator', 'Payment Officer']),
  /** Recording an on-site (cashier-window) payment — `staff:verify-payment`, the Cashier's. */
  recordPayment: action(['staff:verify-payment'], ['Super Admin', 'Administrator', 'Payment Officer']),
  verifyPayment: action(['staff:verify-payment'], ['Super Admin', 'Administrator', 'Payment Officer']),
  /** Void/reversal/refund of an already-verified transaction. */
  adjustPayment: action(['staff:verify-payment'], ['Super Admin', 'Administrator', 'Payment Officer']),
  generatePermit: action(['staff:approve'], ['Super Admin', 'Administrator', 'Approving Officer']),
  releasePermit: action(['staff:release'], ['Super Admin', 'Administrator', 'Releasing Officer']),
  /** The fee schedule and payment channels — the super admin's alone (owner ruling). */
  configurePayments: (who: Authority | StaffRole): boolean =>
    typeof who === 'string' ? who === 'Super Admin' : who.superAdmin,
  /** Editing a permit type's required-document checklist. Anyone who can reach Permit Release may VIEW it. */
  configureRequirements: action(['staff:administer'], ['Super Admin', 'Administrator']),

  // ── Citizens module ──────────────────────────────────────────────────
  //
  // Every one of these matches the server's own `staff:administer` gate
  // (`staff-citizens.controller.ts`); hiding the button is still correct UX —
  // a control that can only ever come back refused should not be shown.
  'citizen.signOutSessions': action(['staff:administer'], ['Super Admin', 'Administrator']),
  'citizen.disable': action(['staff:administer'], ['Super Admin', 'Administrator']),
  'citizen.enable': action(['staff:administer'], ['Super Admin', 'Administrator']),
  'citizen.sendResetLink': action(['staff:administer'], ['Super Admin', 'Administrator']),
  'citizen.rectify': action(['staff:administer'], ['Super Admin', 'Administrator']),
  'citizen.erase': action(['staff:administer'], ['Super Admin', 'Administrator']),
};
