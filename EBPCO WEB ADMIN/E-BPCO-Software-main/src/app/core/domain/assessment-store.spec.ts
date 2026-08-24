import { TestBed } from '@angular/core/testing';
import { AssessmentStore } from './assessment-store';
import { PaymentConfigStore } from './payment-config-store';

function draftAndResolve(store: AssessmentStore, applicationId: string, amount = 10000) {
  const draft = store.draftAssessment(applicationId, 'Building Permit – New Construction', 'Tester', 'Evaluator')!;
  for (const line of draft.lineItems) {
    if (line.amountCentavos === null)
      store.setLineAmount(draft.id, line.feeRuleId, amount, 'Tester', 'Evaluator');
  }
  return store.getAssessmentById(draft.id)!;
}

describe('AssessmentStore — draft / review / issue lifecycle', () => {
  let store: AssessmentStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AssessmentStore, PaymentConfigStore] });
    store = TestBed.inject(AssessmentStore);
  });

  it('draftAssessment builds line items from the fee rules that apply to the permit type, with required lines always included', () => {
    const draft = store.draftAssessment('APP-1', 'Building Permit – New Construction', 'Tester', 'Evaluator')!;
    expect(draft.status).toBe('Draft');
    expect(draft.version).toBe(1);
    const filing = draft.lineItems.find((l) => l.feeRuleId === 'filing-fee')!;
    expect(filing.included).toBe(true);
    expect(filing.applicability).toBe('required');
  });

  it('refuses to draft a second assessment while a non-terminal one already exists for the application', () => {
    store.draftAssessment('APP-2', 'Building Permit – New Construction', 'Tester', 'Evaluator');
    const second = store.draftAssessment('APP-2', 'Building Permit – New Construction', 'Tester', 'Evaluator');
    expect(second).toBeNull();
  });

  it('submitForApproval is refused while any included line still has amountCentavos === null (Requires assessor input)', () => {
    const draft = store.draftAssessment('APP-3', 'Building Permit – New Construction', 'Tester', 'Evaluator')!;
    expect(draft.hasUnresolvedLines).toBe(true);
    expect(store.submitForApproval(draft.id, 'Tester', 'Evaluator')).toBe(false);
  });

  it('a full draft -> submit -> approve -> issue sequence works once every line is resolved', () => {
    const draft = draftAndResolve(store, 'APP-4');
    expect(draft.hasUnresolvedLines).toBe(false);
    expect(store.submitForApproval(draft.id, 'Tester', 'Evaluator')).toBe(true);
    expect(store.getAssessmentById(draft.id)!.status).toBe('For Approval');
    expect(store.approveAssessment(draft.id, 'Admin', 'Administrator')).toBe(true);
    expect(store.getAssessmentById(draft.id)!.approvedBy).toBe('Admin');
    expect(store.issueOrderOfPayment(draft.id, 'Admin', 'Administrator')).toBe(true);
    const issued = store.getAssessmentById(draft.id)!;
    expect(issued.status).toBe('Issued');
    expect(issued.opsNumber).toBeTruthy();
    expect(issued.dueDateValue).toBeTruthy();
  });

  it('issueOrderOfPayment refuses without a prior approval', () => {
    const draft = draftAndResolve(store, 'APP-5');
    store.submitForApproval(draft.id, 'Tester', 'Evaluator');
    expect(store.issueOrderOfPayment(draft.id, 'Admin', 'Administrator')).toBe(false);
  });

  it('setLineIncluded refuses to drop a required line, but can toggle a conditional one', () => {
    const draft = store.draftAssessment('APP-6', 'Building Permit – New Construction', 'Tester', 'Evaluator')!;
    const requiredLine = draft.lineItems.find((l) => l.applicability === 'required')!;
    expect(
      store.setLineIncluded(draft.id, requiredLine.feeRuleId, false, 'Tester', 'Evaluator'),
    ).toBe(false);
    const conditionalLine = draft.lineItems.find((l) => l.applicability === 'conditional');
    if (conditionalLine) {
      expect(
        store.setLineIncluded(draft.id, conditionalLine.feeRuleId, false, 'Tester', 'Evaluator'),
      ).toBe(true);
      const updated = store
        .getAssessmentById(draft.id)!
        .lineItems.find((l) => l.feeRuleId === conditionalLine.feeRuleId)!;
      expect(updated.included).toBe(false);
    }
  });
});

describe('AssessmentStore — snapshot immutability and versioning', () => {
  let store: AssessmentStore;
  let paymentConfig: PaymentConfigStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AssessmentStore, PaymentConfigStore] });
    store = TestBed.inject(AssessmentStore);
    paymentConfig = TestBed.inject(PaymentConfigStore);
  });

  it('an issued assessment keeps its own line-item snapshot even after the underlying fee rule changes (effective-date change)', () => {
    const draft = draftAndResolve(store, 'APP-7');
    store.submitForApproval(draft.id, 'Tester', 'Evaluator');
    store.approveAssessment(draft.id, 'Admin', 'Administrator');
    store.issueOrderOfPayment(draft.id, 'Admin', 'Administrator');
    const issuedTotal = store.getAssessmentById(draft.id)!.totalCentavos;

    // A later fee-rule edit (new effective date, new amount) must never
    // retroactively change what was already issued.
    paymentConfig.updateFeeRule(
      'filing-fee',
      { flatAmountCentavos: 500000, effectiveDate: '2030-01-01' },
      'Admin',
    );

    expect(store.getAssessmentById(draft.id)!.totalCentavos).toBe(issuedTotal);
    const filingLine = store
      .getAssessmentById(draft.id)!
      .lineItems.find((l) => l.feeRuleId === 'filing-fee')!;
    expect(filingLine.amountCentavos).not.toBe(500000);
  });

  it('reviseIssuedAssessment creates a new Draft version that supersedes the issued one, only when nothing has been verified yet', () => {
    const draft = draftAndResolve(store, 'APP-8');
    store.submitForApproval(draft.id, 'Tester', 'Evaluator');
    store.approveAssessment(draft.id, 'Admin', 'Administrator');
    store.issueOrderOfPayment(draft.id, 'Admin', 'Administrator');

    const revised = store.reviseIssuedAssessment(
      draft.id,
      'Building Permit – New Construction',
      'Admin',
      'Administrator',
    );
    expect(revised).toBeTruthy();
    expect(revised!.version).toBe(2);
    expect(revised!.supersedesId).toBe(draft.id);
    expect(store.getAssessmentById(draft.id)!.status).toBe('Superseded');
  });

  it('reviseIssuedAssessment refuses once a transaction has been verified against the issued assessment', () => {
    const draft = draftAndResolve(store, 'APP-9');
    store.submitForApproval(draft.id, 'Tester', 'Evaluator');
    store.approveAssessment(draft.id, 'Admin', 'Administrator');
    store.issueOrderOfPayment(draft.id, 'Admin', 'Administrator');
    const issued = store.getAssessmentById(draft.id)!;
    const txn = store.recordOnsitePayment(
      issued.id,
      issued.balanceCentavos,
      'OR-1',
      'OBO/LGU',
      'Cashier',
      'Payment Officer',
    )!;
    store.verifyTransaction(txn.id, 'Officer', 'Payment Officer');

    const revised = store.reviseIssuedAssessment(
      draft.id,
      'Building Permit – New Construction',
      'Admin',
      'Administrator',
    );
    expect(revised).toBeNull();
  });
});

describe('AssessmentStore — payments: duplicate references, overpayment, bank proof, partial payment', () => {
  let store: AssessmentStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AssessmentStore, PaymentConfigStore] });
    store = TestBed.inject(AssessmentStore);
  });

  function issuedAssessment(appId: string) {
    const draft = draftAndResolve(store, appId);
    store.submitForApproval(draft.id, 'Tester', 'Evaluator');
    store.approveAssessment(draft.id, 'Admin', 'Administrator');
    store.issueOrderOfPayment(draft.id, 'Admin', 'Administrator');
    return store.getAssessmentById(draft.id)!;
  }

  it('a payment cannot be recorded against a Draft or For Approval assessment', () => {
    const draft = draftAndResolve(store, 'APP-10');
    expect(
      store.recordOnsitePayment(draft.id, 1000, 'OR-A', 'OBO/LGU', 'Cashier', 'Payment Officer'),
    ).toBeNull();
  });

  it('prevents duplicate transaction references, even across different assessments', () => {
    const a = issuedAssessment('APP-11');
    const b = issuedAssessment('APP-12');
    const first = store.recordOnsitePayment(
      a.id,
      1000,
      'OR-DUP',
      'OBO/LGU',
      'Cashier',
      'Payment Officer',
    );
    expect(first).toBeTruthy();
    const second = store.recordOnsitePayment(
      b.id,
      1000,
      'OR-DUP',
      'OBO/LGU',
      'Cashier',
      'Payment Officer',
    );
    expect(second).toBeNull();
  });

  it('prevents accidental overpayment — a transaction cannot exceed the outstanding balance', () => {
    const a = issuedAssessment('APP-13');
    const tooMuch = store.recordOnsitePayment(
      a.id,
      a.balanceCentavos + 100,
      'OR-OVER',
      'OBO/LGU',
      'Cashier',
      'Payment Officer',
    );
    expect(tooMuch).toBeNull();
  });

  it('supports genuine partial payment across multiple transactions', () => {
    const a = issuedAssessment('APP-14');
    const half = Math.floor(a.balanceCentavos / 2);
    const t1 = store.recordOnsitePayment(
      a.id,
      half,
      'OR-PART-1',
      'OBO/LGU',
      'Cashier',
      'Payment Officer',
    )!;
    store.verifyTransaction(t1.id, 'Officer', 'Payment Officer');
    expect(store.getAssessmentById(a.id)!.status).toBe('Partially Paid');
    const rest = store.getAssessmentById(a.id)!.balanceCentavos;
    const t2 = store.recordOnsitePayment(
      a.id,
      rest,
      'OR-PART-2',
      'OBO/LGU',
      'Cashier',
      'Payment Officer',
    )!;
    store.verifyTransaction(t2.id, 'Officer', 'Payment Officer');
    expect(store.getAssessmentById(a.id)!.status).toBe('Paid');
    expect(store.getAssessmentById(a.id)!.balanceCentavos).toBe(0);
  });

  it('a Bank Transfer payment requires a proof-of-payment file — refused without one', () => {
    const a = issuedAssessment('APP-15');
    const withoutProof = store.submitBankTransferProof(
      a.id,
      1000,
      'OR-BANK-1',
      '',
      'OBO/LGU',
      'Applicant',
      'Applicant',
    );
    expect(withoutProof).toBeNull();
    const withProof = store.submitBankTransferProof(
      a.id,
      1000,
      'OR-BANK-2',
      'deposit-slip.pdf',
      'OBO/LGU',
      'Applicant',
      'Applicant',
    );
    expect(withProof).toBeTruthy();
    expect(withProof!.proofFileName).toBe('deposit-slip.pdf');
  });
});

describe('AssessmentStore — verification is transaction-specific, never a sweep', () => {
  let store: AssessmentStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AssessmentStore, PaymentConfigStore] });
    store = TestBed.inject(AssessmentStore);
  });

  it('verifying one transaction never marks a different pending transaction (even on the same assessment) as verified', () => {
    const draft = draftAndResolve(store, 'APP-16', 20000);
    store.submitForApproval(draft.id, 'Tester', 'Evaluator');
    store.approveAssessment(draft.id, 'Admin', 'Administrator');
    store.issueOrderOfPayment(draft.id, 'Admin', 'Administrator');
    const issued = store.getAssessmentById(draft.id)!;
    const half = Math.floor(issued.balanceCentavos / 2);
    const t1 = store.recordOnsitePayment(
      issued.id,
      half,
      'OR-A1',
      'OBO/LGU',
      'Cashier',
      'Payment Officer',
    )!;
    const t2 = store.recordOnsitePayment(
      issued.id,
      issued.balanceCentavos - half,
      'OR-A2',
      'OBO/LGU',
      'Cashier',
      'Payment Officer',
    )!;

    store.verifyTransaction(t1.id, 'Officer', 'Payment Officer');

    expect(store.getTransactionById(t1.id)!.status).toBe('Verified');
    expect(store.getTransactionById(t2.id)!.status).toBe('Pending Verification'); // untouched
  });

  it('rejectTransaction requires a reason and never affects the assessment balance', () => {
    const a = draftAndResolve(store, 'APP-17');
    store.submitForApproval(a.id, 'Tester', 'Evaluator');
    store.approveAssessment(a.id, 'Admin', 'Administrator');
    store.issueOrderOfPayment(a.id, 'Admin', 'Administrator');
    const issued = store.getAssessmentById(a.id)!;
    const txn = store.recordOnsitePayment(
      issued.id,
      issued.balanceCentavos,
      'OR-REJ',
      'OBO/LGU',
      'Cashier',
      'Payment Officer',
    )!;
    expect(store.rejectTransaction(txn.id, 'Officer', 'Payment Officer', '')).toBe(false);
    expect(
      store.rejectTransaction(
        txn.id,
        'Officer',
        'Payment Officer',
        'Reference could not be verified with the bank.',
      ),
    ).toBe(true);
    expect(store.getTransactionById(txn.id)!.status).toBe('Rejected');
    expect(store.getAssessmentById(a.id)!.balanceCentavos).toBe(issued.balanceCentavos); // untouched
  });
});

describe('AssessmentStore — void/reversal/refund require a reason and never edit a Verified row directly', () => {
  let store: AssessmentStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AssessmentStore, PaymentConfigStore] });
    store = TestBed.inject(AssessmentStore);
  });

  function verifiedTransaction(appId: string) {
    const draft = draftAndResolve(store, appId);
    store.submitForApproval(draft.id, 'Tester', 'Evaluator');
    store.approveAssessment(draft.id, 'Admin', 'Administrator');
    store.issueOrderOfPayment(draft.id, 'Admin', 'Administrator');
    const issued = store.getAssessmentById(draft.id)!;
    const txn = store.recordOnsitePayment(
      issued.id,
      issued.balanceCentavos,
      'OR-V1',
      'OBO/LGU',
      'Cashier',
      'Payment Officer',
    )!;
    store.verifyTransaction(txn.id, 'Officer', 'Payment Officer');
    return { assessmentId: issued.id, txn };
  }

  it('voidTransaction refuses without a reason, and refuses on a non-Verified transaction', () => {
    const { txn } = verifiedTransaction('APP-18');
    expect(store.voidTransaction(txn.id, 'Admin', 'Administrator', '')).toBe(false);
    const draft2 = draftAndResolve(store, 'APP-19');
    store.submitForApproval(draft2.id, 'Tester', 'Evaluator');
    store.approveAssessment(draft2.id, 'Admin', 'Administrator');
    store.issueOrderOfPayment(draft2.id, 'Admin', 'Administrator');
    const pending = store.recordOnsitePayment(
      draft2.id,
      1000,
      'OR-PENDING',
      'OBO/LGU',
      'Cashier',
      'Payment Officer',
    )!;
    expect(store.voidTransaction(pending.id, 'Admin', 'Administrator', 'test')).toBe(false); // not Verified yet
  });

  it('voidTransaction with a reason marks the transaction voided, records an adjustment, and excludes it from the assessment balance', () => {
    const { assessmentId, txn } = verifiedTransaction('APP-20');
    expect(store.getAssessmentById(assessmentId)!.status).toBe('Paid');
    expect(
      store.voidTransaction(
        txn.id,
        'Admin',
        'Administrator',
        'Duplicate entry — voided per cashier request',
      ),
    ).toBe(true);
    expect(store.getTransactionById(txn.id)!.isVoid).toBe(true);
    expect(store.getAdjustmentsForTransaction(txn.id).length).toBe(1);
    expect(store.getAdjustmentsForTransaction(txn.id)[0].type).toBe('Void');
    // Balance is computed only from verified, non-voided transactions.
    expect(store.getAssessmentById(assessmentId)!.balanceCentavos).toBeGreaterThan(0);
    expect(store.getAssessmentById(assessmentId)!.status).not.toBe('Paid');
  });

  it('a Verified transaction is never mutated directly by void — its own amount/status/timestamps are untouched, only isVoid flips', () => {
    const { txn } = verifiedTransaction('APP-21');
    const before = store.getTransactionById(txn.id)!;
    store.voidTransaction(txn.id, 'Admin', 'Administrator', 'Refund issued to payer');
    const after = store.getTransactionById(txn.id)!;
    expect(after.amountCentavos).toBe(before.amountCentavos);
    expect(after.status).toBe(before.status); // still 'Verified' — void is layered on top via isVoid + an adjustment, never a status rewrite
    expect(after.isVoid).toBe(true);
  });
});

describe('AssessmentStore — permit-processing gate and overdue derivation', () => {
  let store: AssessmentStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AssessmentStore, PaymentConfigStore] });
    store = TestBed.inject(AssessmentStore);
  });

  it('canProcessPermit is false until the active assessment is fully Paid', () => {
    expect(store.canProcessPermit('APP-22')).toBe(false); // no assessment at all
    const draft = draftAndResolve(store, 'APP-22');
    expect(store.canProcessPermit('APP-22')).toBe(false); // Draft
    store.submitForApproval(draft.id, 'Tester', 'Evaluator');
    store.approveAssessment(draft.id, 'Admin', 'Administrator');
    store.issueOrderOfPayment(draft.id, 'Admin', 'Administrator');
    expect(store.canProcessPermit('APP-22')).toBe(false); // Issued, unpaid
    const issued = store.getAssessmentById(draft.id)!;
    const txn = store.recordOnsitePayment(
      issued.id,
      issued.balanceCentavos,
      'OR-GATE',
      'OBO/LGU',
      'Cashier',
      'Payment Officer',
    )!;
    expect(store.canProcessPermit('APP-22')).toBe(false); // pending verification, not yet verified
    store.verifyTransaction(txn.id, 'Officer', 'Payment Officer');
    expect(store.canProcessPermit('APP-22')).toBe(true); // fully paid and verified
  });

  it('refreshOverdueStatuses flips an unpaid Issued assessment past its due date to Overdue, and never touches a Paid one', () => {
    const draft = draftAndResolve(store, 'APP-23');
    store.submitForApproval(draft.id, 'Tester', 'Evaluator');
    store.approveAssessment(draft.id, 'Admin', 'Administrator');
    store.issueOrderOfPayment(draft.id, 'Admin', 'Administrator', -5); // due 5 days ago
    store.refreshOverdueStatuses();
    expect(store.getAssessmentById(draft.id)!.status).toBe('Overdue');

    const paidDraft = draftAndResolve(store, 'APP-24');
    store.submitForApproval(paidDraft.id, 'Tester', 'Evaluator');
    store.approveAssessment(paidDraft.id, 'Admin', 'Administrator');
    store.issueOrderOfPayment(paidDraft.id, 'Admin', 'Administrator', -5);
    const issuedPaid = store.getAssessmentById(paidDraft.id)!;
    const txn = store.recordOnsitePayment(
      issuedPaid.id,
      issuedPaid.balanceCentavos,
      'OR-PAID-OVERDUE',
      'OBO/LGU',
      'Cashier',
      'Payment Officer',
    )!;
    store.verifyTransaction(txn.id, 'Officer', 'Payment Officer');
    store.refreshOverdueStatuses();
    expect(store.getAssessmentById(paidDraft.id)!.status).toBe('Paid'); // never overwritten to Overdue once Paid
  });
});
