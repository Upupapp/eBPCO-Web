import {
  ACTION_PERMISSIONS, ALL_STAFF_ROLES, Authority, NAV_MODULES, StaffRole, canAccessPath,
  mayEvaluateStage, mayMove, mayOpen,
} from './permissions';

function allowedRoles(fn: (role: StaffRole) => boolean): StaffRole[] {
  return ALL_STAFF_ROLES.filter(fn);
}

describe('ACTION_PERMISSIONS — payment-assessment workflow enforcement', () => {
  it('editAssessment (drafting/editing line items) is limited to Super Admin, Administrator, and Payment Officer — never an Evaluator or Approving/Releasing Officer', () => {
    const allowed = allowedRoles(ACTION_PERMISSIONS.editAssessment);
    expect(allowed).toEqual(['Super Admin', 'Administrator', 'Payment Officer']);
  });

  it('approveAssessment (approve + issue Order of Payment) includes Payment Officer alongside Super Admin/Administrator — the real backend gates this on `staff:assess`, held by assessor/cashier accounts (surfaced here as Payment Officer) and, since 2026-09-13, by Super Admin as well; Administrator still holds no real path to it', () => {
    const allowed = allowedRoles(ACTION_PERMISSIONS.approveAssessment);
    expect(allowed).toEqual(['Super Admin', 'Administrator', 'Payment Officer']);
    for (const role of allowed) expect(ACTION_PERMISSIONS.editAssessment(role)).toBe(true);
  });

  it('recordPayment and verifyPayment both include Payment Officer', () => {
    expect(ACTION_PERMISSIONS.recordPayment('Payment Officer')).toBe(true);
    expect(ACTION_PERMISSIONS.verifyPayment('Payment Officer')).toBe(true);
  });

  it('adjustPayment (void/reversal/refund of an already-Verified transaction) includes Payment Officer alongside Super Admin/Administrator — the real backend gates this on `staff:verify-payment`, a cashier-only scope Super Admin also holds since 2026-09-13; Administrator still holds no path to it', () => {
    const allowed = allowedRoles(ACTION_PERMISSIONS.adjustPayment);
    expect(allowed).toEqual(['Super Admin', 'Administrator', 'Payment Officer']);
    expect(ACTION_PERMISSIONS.adjustPayment('Payment Officer')).toBe(true);
  });

  it('configurePayments (the Payments > Configuration tab, incl. fee-rule applicability edits) is Super Admin only', () => {
    const allowed = allowedRoles(ACTION_PERMISSIONS.configurePayments);
    expect(allowed).toEqual(['Super Admin']);
  });

  it('no role outside the ones explicitly listed can perform any payment-workflow action', () => {
    const untouchedRoles: StaffRole[] = [
      'Evaluator',
      'Approving Officer',
      'Releasing Officer',
      'Auditor',
    ];
    for (const role of untouchedRoles) {
      expect(ACTION_PERMISSIONS.approveAssessment(role)).toBe(false);
      expect(ACTION_PERMISSIONS.adjustPayment(role)).toBe(false);
      expect(ACTION_PERMISSIONS.configurePayments(role)).toBe(false);
    }
  });
});

describe('ACTION_PERMISSIONS — application approval', () => {
  it('approveApplication (the Applications detail page\'s "Mark Approved" quick action) is limited to Super Admin, Administrator, and Approving Officer — same tier as generatePermit, never an Evaluator', () => {
    const allowed = allowedRoles(ACTION_PERMISSIONS.approveApplication);
    expect(allowed).toEqual(['Super Admin', 'Administrator', 'Approving Officer']);
    expect(ACTION_PERMISSIONS.approveApplication('Evaluator')).toBe(false);
    for (const role of allowed) expect(ACTION_PERMISSIONS.generatePermit(role)).toBe(true);
  });
});

describe('ACTION_PERMISSIONS — permit-type requirements configuration', () => {
  it('configureRequirements (Permit Release > Permit Types document-checklist edits) is limited to Super Admin and Administrator — even a Releasing Officer, who can reach the page, cannot edit', () => {
    const allowed = allowedRoles(ACTION_PERMISSIONS.configureRequirements);
    expect(allowed).toEqual(['Super Admin', 'Administrator']);
    expect(ACTION_PERMISSIONS.configureRequirements('Releasing Officer')).toBe(false);
  });

  it('configureRequirements is an exact match for the real staff:administer scope holders — unlike Payments\' approveAssessment/adjustPayment, no real holder is missing here', () => {
    const allowed = allowedRoles(ACTION_PERMISSIONS.configureRequirements);
    expect(allowed).toEqual(['Super Admin', 'Administrator']);
  });
});

describe('ACTION_PERMISSIONS — permit generation and release (Stage 4)', () => {
  it('generatePermit is held for real by Approving Officer (staff:approve, building-official) and, since 2026-09-13, by Super Admin as well — Administrator is still included only for visibility/consistency with approveApplication\'s tier and has no real path to `staff:approve`', () => {
    const allowed = allowedRoles(ACTION_PERMISSIONS.generatePermit);
    expect(allowed).toEqual(['Super Admin', 'Administrator', 'Approving Officer']);
    expect(ACTION_PERMISSIONS.generatePermit('Releasing Officer')).toBe(false);
    expect(ACTION_PERMISSIONS.generatePermit('Evaluator')).toBe(false);
  });

  it('releasePermit is held for real by Releasing Officer (staff:release, releasing-officer) and, since 2026-09-13, by Super Admin as well — Administrator is still included only for visibility and has no real path to `staff:release`; the same gate also covers preparing a release, since prepare and release share the identical scope', () => {
    const allowed = allowedRoles(ACTION_PERMISSIONS.releasePermit);
    expect(allowed).toEqual(['Super Admin', 'Administrator', 'Releasing Officer']);
    expect(ACTION_PERMISSIONS.releasePermit('Approving Officer')).toBe(false);
    expect(ACTION_PERMISSIONS.releasePermit('Evaluator')).toBe(false);
  });

  it('no role outside the ones explicitly listed can generate, prepare, or release a permit', () => {
    const untouchedRoles: StaffRole[] = ['Evaluator', 'Payment Officer', 'Auditor'];
    for (const role of untouchedRoles) {
      expect(ACTION_PERMISSIONS.generatePermit(role)).toBe(false);
      expect(ACTION_PERMISSIONS.releasePermit(role)).toBe(false);
    }
  });
});

describe('the Citizens module', () => {
  it('is registered immediately after Businesses in the sidebar order', () => {
    const keys = NAV_MODULES.map((m) => m.key);
    const businessesIndex = keys.indexOf('businesses');
    expect(keys[businessesIndex + 1]).toBe('citizens');
  });

  it('is visible to Super Admin and Administrator, and to nobody else', () => {
    const citizens = NAV_MODULES.find((m) => m.key === 'citizens')!;
    expect(citizens.roles).toEqual(['Super Admin', 'Administrator']);
  });

  it('canAccessPath resolves /citizens/:id to the Citizens module, the same generalisation applications/:id already relies on', () => {
    const someId = '3f6e6b1a-2222-4a11-9c3d-000000000001';
    expect(canAccessPath('Administrator', `/citizens/${someId}`)).toBe(true);
    expect(canAccessPath('Super Admin', `/citizens/${someId}`)).toBe(true);
    expect(canAccessPath('Evaluator', `/citizens/${someId}`)).toBe(false);
    expect(canAccessPath('Auditor', '/citizens')).toBe(false);
  });

  it('every citizen action is limited to Super Admin and Administrator', () => {
    const actions = [
      'citizen.signOutSessions', 'citizen.disable', 'citizen.enable',
      'citizen.sendResetLink', 'citizen.rectify', 'citizen.erase',
    ] as const;
    for (const action of actions) {
      const allowed = allowedRoles(ACTION_PERMISSIONS[action]);
      expect(allowed).toEqual(['Super Admin', 'Administrator']);
    }
  });
});

describe('the renamed Staff & Roles module', () => {
  it('kept its key and path so nothing that reads either breaks, and only changed its label', () => {
    const mod = NAV_MODULES.find((m) => m.key === 'user-roles')!;
    expect(mod.label).toBe('Staff & Roles');
    expect(mod.path).toBe('/user-roles');
  });
});

// ── Officer positions (2026-09-26) ─────────────────────────────────────
//
// The scopes below are the server's own (`ROLE_SCOPES` in the API's
// identity/domain/account.ts), copied rather than invented, so each test asks
// "would the server accept this officer's request?".

const SCOPES = {
  receiving: ['applications:read', 'documents:read', 'staff:receive', 'staff:annotate', 'citizens:read'],
  evaluator: ['applications:read', 'documents:read', 'staff:evaluate', 'staff:annotate'],
  assessor: ['applications:read', 'payments:read', 'staff:assess', 'staff:annotate'],
  cashier: ['applications:read', 'payments:read', 'staff:verify-payment', 'staff:annotate'],
  administrator: ['staff:administer', 'citizens:read'],
  auditor: ['applications:read', 'documents:read', 'payments:read', 'audit:read'],
} as const;

const officer = (
  scopes: readonly string[],
  stages: readonly string[] | null = [],
  role: StaffRole = 'Evaluator',
): Authority => ({ role, scopes, stages, superAdmin: false });
const superAdmin: Authority = { role: 'Super Admin', scopes: ['staff:administer'], stages: null, superAdmin: true };
const opens = (who: Authority) => NAV_MODULES.filter((m) => mayOpen(m, who)).map((m) => m.key);

describe('officer positions — which screens an officer sees', () => {
  it('a Receiving Officer sees intake and citizens, not Staff & Roles — the portal used to file them under Administrator', () => {
    expect(opens(officer(SCOPES.receiving, null, 'Administrator'))).toEqual([
      'dashboard', 'applications', 'businesses', 'citizens', 'archive',
    ]);
  });

  it('a Cashier sees Payments, never Evaluations or Permit Release', () => {
    expect(opens(officer(SCOPES.cashier, null, 'Payment Officer'))).toEqual([
      'dashboard', 'applications', 'payments', 'archive',
    ]);
  });

  it('an Administrator manages staff and citizens but holds no application scope, so Applications stays hidden', () => {
    const keys = opens(officer(SCOPES.administrator, null, 'Administrator'));
    expect(keys).toContain('user-roles');
    expect(keys).toContain('workflow');
    expect(keys).not.toContain('applications');
    // The owner's ruling: approving access requests is the super admin's alone.
    expect(keys).not.toContain('access-requests');
  });

  it('the super admin opens every module', () => {
    const everyScope: Authority = {
      ...superAdmin,
      scopes: [
        'applications:read', 'applications:write', 'staff:evaluate', 'staff:assess', 'staff:verify-payment',
        'staff:approve', 'staff:release', 'staff:administer', 'citizens:read', 'audit:read',
      ],
    };
    for (const mod of NAV_MODULES) expect(mayOpen(mod, everyScope)).toBe(true);
  });

  it('a session with no scopes (an offline dev bypass) falls back to the portal role, as before', () => {
    const bypass: Authority = { role: 'Auditor', scopes: null, stages: null, superAdmin: false };
    expect(canAccessPath(bypass, '/system-logs')).toBe(true);
    expect(canAccessPath(bypass, '/user-roles')).toBe(false);
  });
});

describe('officer positions — evaluation stages', () => {
  const fireSafety = officer(SCOPES.evaluator, ['Fire Safety']);

  it('a Fire Safety Evaluator decides the Fire Safety stage and no other', () => {
    expect(mayEvaluateStage(fireSafety, 'Fire Safety')).toBe(true);
    for (const stage of ['Initial', 'Zoning', 'OBO', 'Final Approval']) {
      expect(mayEvaluateStage(fireSafety, stage)).toBe(false);
    }
  });

  it('the super admin decides every stage', () => {
    const everything: Authority = { ...superAdmin, scopes: ['staff:evaluate'], stages: [] };
    for (const stage of ['Initial', 'Zoning', 'Fire Safety', 'OBO', 'Final Approval']) {
      expect(mayEvaluateStage(everything, stage)).toBe(true);
    }
  });

  it('a stage assigned to an account without the evaluate scope still decides nothing', () => {
    expect(mayEvaluateStage(officer(SCOPES.cashier, ['Fire Safety']), 'Fire Safety')).toBe(false);
  });

  it('an older server that reports no stages is not second-guessed — it stays the judge', () => {
    expect(mayEvaluateStage(officer(SCOPES.evaluator, null), 'Zoning')).toBe(true);
  });
});

describe('officer positions — the status moves offered', () => {
  const fireSafety = officer(SCOPES.evaluator, ['Fire Safety']);
  const initial = officer(SCOPES.evaluator, ['Initial']);

  it('a Fire Safety Evaluator returns an application only while Fire Safety is the stage on hand', () => {
    expect(mayMove(fireSafety, 'Under Evaluation', 'Revision Required', 'Fire Safety')).toBe(true);
    expect(mayMove(fireSafety, 'Under Evaluation', 'Revision Required', 'Zoning')).toBe(false);
  });

  it('moving out of Document Verification is the Initial stage\'s decision', () => {
    expect(mayMove(initial, 'Document Verification', 'Under Evaluation', null)).toBe(true);
    expect(mayMove(fireSafety, 'Document Verification', 'Under Evaluation', null)).toBe(false);
  });

  it('a Cashier is never offered "Mark Received", and a Receiving Officer never "Verify Payment"', () => {
    expect(mayMove(officer(SCOPES.cashier), 'Submitted', 'Received', null)).toBe(false);
    expect(mayMove(officer(SCOPES.receiving), 'Submitted', 'Received', null)).toBe(true);
    expect(mayMove(officer(SCOPES.receiving), 'Payment Under Verification', 'Payment Verified', null)).toBe(false);
    expect(mayMove(officer(SCOPES.cashier), 'Payment Under Verification', 'Payment Verified', null)).toBe(true);
  });

  it('a move the Workflow screen added, which this table does not know, is left for the server to judge', () => {
    expect(mayMove(officer(SCOPES.cashier), 'Assessed', 'Some New Status', null)).toBe(true);
  });

  it('nobody signed in moves nothing', () => {
    expect(mayMove(null, 'Submitted', 'Received', null)).toBe(false);
  });
});

describe('officer positions — actions follow the server scope, not the portal role', () => {
  it('the Assessor issues the Order of Payment and the Cashier confirms it, never the other way round', () => {
    const assessor = officer(SCOPES.assessor, null, 'Payment Officer');
    const cashier = officer(SCOPES.cashier, null, 'Payment Officer');
    expect(ACTION_PERMISSIONS.approveAssessment(assessor)).toBe(true);
    expect(ACTION_PERMISSIONS.verifyPayment(assessor)).toBe(false);
    expect(ACTION_PERMISSIONS.approveAssessment(cashier)).toBe(false);
    expect(ACTION_PERMISSIONS.verifyPayment(cashier)).toBe(true);
  });

  it('an Auditor reads everything and acts on nothing', () => {
    const auditor = officer(SCOPES.auditor, null, 'Auditor');
    for (const [name, allowed] of Object.entries(ACTION_PERMISSIONS)) {
      expect({ name, allowed: allowed(auditor) }).toEqual({ name, allowed: false });
    }
  });

  it('only the super admin configures payments, whatever scopes an Administrator holds', () => {
    expect(ACTION_PERMISSIONS.configurePayments(officer(SCOPES.administrator, null, 'Administrator'))).toBe(false);
    expect(ACTION_PERMISSIONS.configurePayments(superAdmin)).toBe(true);
  });
});
