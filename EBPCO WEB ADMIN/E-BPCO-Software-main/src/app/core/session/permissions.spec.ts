import { ACTION_PERMISSIONS, ALL_STAFF_ROLES, NAV_MODULES, StaffRole, canAccessPath } from './permissions';

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
