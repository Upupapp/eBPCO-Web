import { ACTION_PERMISSIONS, ALL_STAFF_ROLES, StaffRole } from './permissions';

function allowedRoles(fn: (role: StaffRole) => boolean): StaffRole[] {
  return ALL_STAFF_ROLES.filter(fn);
}

describe('ACTION_PERMISSIONS — payment-assessment workflow enforcement', () => {
  it('editAssessment (drafting/editing line items) is limited to Super Admin, Administrator, and Payment Officer — never an Evaluator or Approving/Releasing Officer', () => {
    const allowed = allowedRoles(ACTION_PERMISSIONS.editAssessment);
    expect(allowed).toEqual(['Super Admin', 'Administrator', 'Payment Officer']);
  });

  it('approveAssessment (approve + issue Order of Payment) is limited to Super Admin and Administrator — narrower than editAssessment, since authorizing collection is more sensitive than drafting', () => {
    const allowed = allowedRoles(ACTION_PERMISSIONS.approveAssessment);
    expect(allowed).toEqual(['Super Admin', 'Administrator']);
    for (const role of allowed) expect(ACTION_PERMISSIONS.editAssessment(role)).toBe(true);
  });

  it('recordPayment and verifyPayment both include Payment Officer', () => {
    expect(ACTION_PERMISSIONS.recordPayment('Payment Officer')).toBe(true);
    expect(ACTION_PERMISSIONS.verifyPayment('Payment Officer')).toBe(true);
  });

  it('adjustPayment (void/reversal/refund of an already-Verified transaction) is limited to Super Admin and Administrator — narrower than verifyPayment, since undoing a confirmed payment is more sensitive than confirming one', () => {
    const allowed = allowedRoles(ACTION_PERMISSIONS.adjustPayment);
    expect(allowed).toEqual(['Super Admin', 'Administrator']);
    expect(ACTION_PERMISSIONS.adjustPayment('Payment Officer')).toBe(false);
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
});
