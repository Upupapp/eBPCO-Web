import { TestBed } from '@angular/core/testing';

import { AssessmentStore } from '../../core/domain/assessment-store';
import { ApplicationStore } from '../../core/domain/application-store';
import { ACTION_PERMISSIONS, StaffRole } from '../../core/session/permissions';

/**
 * The refusals on the money path.
 *
 * Payments is 2,682 lines and had three specs, all about the same thing — that
 * clearing assessments makes every tile read zero. Nothing covered the
 * transaction guards, which are the only thing standing between a typo and a
 * permit released against a payment that was never made.
 *
 * These sit at the STORE rather than the page. The page checks a permission and
 * hands the amount over; every guard that decides whether money was actually
 * received is here, and the store is what stands whatever any screen decides to
 * offer. `permit-release.spec.ts` makes the same argument.
 */
describe('Payment guards', () => {
  let assessments: AssessmentStore;
  let applications: ApplicationStore;

  function issuedAssessment() {
    const withAssessment = applications
      .applications()
      .map((a) => assessments.getActiveAssessment(a.id))
      .find((x) => x !== undefined && x.balanceCentavos > 0);
    // If the seed stops producing one, that is a finding, not a reason to skip.
    expect(withAssessment).toBeDefined();
    return withAssessment;
  }

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [ApplicationStore, AssessmentStore] });
    applications = TestBed.inject(ApplicationStore);
    assessments = TestBed.inject(AssessmentStore);
  });

  it('refuses an amount that is not a number', () => {
    const a = issuedAssessment();
    if (!a) return;

    // The page computes `Math.round(Number(form.amount) * 100)`. A field that
    // is empty or non-numeric produces NaN, and NaN passes `> 0` checks
    // written the obvious way. This one is written the other way round.
    expect(assessments.recordOnsitePayment(a.id, Number.NaN, 'REF-NAN', 'OBO/LGU', 'Cashier', 'Payment Officer'))
      .toBeNull();
  });

  it('refuses zero and negative amounts', () => {
    const a = issuedAssessment();
    if (!a) return;

    expect(assessments.recordOnsitePayment(a.id, 0, 'REF-ZERO', 'OBO/LGU', 'Cashier', 'Payment Officer')).toBeNull();
    expect(assessments.recordOnsitePayment(a.id, -5000, 'REF-NEG', 'OBO/LGU', 'Cashier', 'Payment Officer')).toBeNull();
  });

  it('refuses more than the outstanding balance', () => {
    const a = issuedAssessment();
    if (!a) return;

    // An overpayment is a refund the office then owes, created by a keystroke.
    expect(
      assessments.recordOnsitePayment(a.id, a.balanceCentavos + 1, 'REF-OVER', 'OBO/LGU', 'Cashier', 'Payment Officer'),
    ).toBeNull();
  });

  it('refuses a reference number already used', () => {
    const a = issuedAssessment();
    if (!a) return;

    const first = assessments.recordOnsitePayment(a.id, 1000, 'REF-DUP-1', 'OBO/LGU', 'Cashier', 'Payment Officer');
    expect(first).not.toBeNull();

    // The reference is how a payment is traced back to the bank or the counter
    // receipt. Two transactions sharing one is two records of what may be a
    // single payment.
    expect(assessments.recordOnsitePayment(a.id, 1000, 'REF-DUP-1', 'OBO/LGU', 'Cashier', 'Payment Officer')).toBeNull();
  });

  it('keeps voiding a verified payment narrower than recording one', () => {
    const roles: StaffRole[] = ['Payment Officer', 'Administrator', 'Super Admin', 'Auditor'];
    const can = (f: (r: StaffRole) => boolean) => roles.filter(f);

    // A cashier may take money and confirm it arrived. Reversing a payment the
    // office has already accepted is an admin act — it changes what the record
    // says happened.
    expect(can(ACTION_PERMISSIONS.recordPayment)).toContain('Payment Officer');
    expect(can(ACTION_PERMISSIONS.adjustPayment)).not.toContain('Payment Officer');
    expect(can(ACTION_PERMISSIONS.recordPayment)).not.toContain('Auditor');
    expect(can(ACTION_PERMISSIONS.verifyPayment)).not.toContain('Auditor');
  });

  it('requires proof for a bank transfer — and the proof is only a FILE NAME', () => {
    const a = issuedAssessment();
    if (!a) return;

    expect(
      assessments.submitBankTransferProof(a.id, 1000, 'REF-NOPROOF', '', 'OBO/LGU', 'Cashier', 'Payment Officer'),
    ).toBeNull();

    // KNOWN LIMITATION, pinned so it is not mistaken for a control. The portal
    // has no upload path (S-6): a chosen file contributes only its NAME, so
    // this requirement is satisfied by typing one. It stops an officer
    // forgetting to attach something; it is not evidence a transfer happened.
    expect(
      assessments.submitBankTransferProof(
        a.id, 1000, 'REF-WITHPROOF', 'deposit-slip.pdf', 'OBO/LGU', 'Cashier', 'Payment Officer',
      ),
    ).not.toBeNull();
  });
});
