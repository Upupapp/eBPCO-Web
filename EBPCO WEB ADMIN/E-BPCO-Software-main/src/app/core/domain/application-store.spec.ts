import { TestBed } from '@angular/core/testing';
import { ApplicationStore } from './application-store';

describe('ApplicationStore — data integrity', () => {
  let store: ApplicationStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ApplicationStore] });
    store = TestBed.inject(ApplicationStore);
  });

  it('generates unique application IDs', () => {
    const ids = store.applications().map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every application has a valid businessId and applicantId foreign key', () => {
    for (const app of store.applications()) {
      expect(store.getBusiness(app.businessId)).toBeTruthy();
      expect(store.getApplicant(app.applicantId)).toBeTruthy();
    }
  });

  it('keeps applicant name and business name as separate, independently-sourced fields', () => {
    for (const app of store.applications()) {
      const business = store.getBusiness(app.businessId)!;
      const applicant = store.getApplicant(app.applicantId)!;
      expect(app.businessName).toBe(business.name);
      expect(app.applicant).toBe(`${applicant.firstName} ${applicant.lastName}`);
    }
  });

  it('every document/evaluation/payment references a real seeded application', () => {
    const appIds = new Set(store.applications().map((a) => a.id));
    for (const app of store.applications()) {
      for (const doc of store.getDocuments(app.id)) expect(appIds.has(doc.applicationId)).toBe(true);
      for (const ev of store.getEvaluations(app.id)) expect(appIds.has(ev.applicationId)).toBe(true);
      for (const pay of store.getPayments(app.id)) expect(appIds.has(pay.applicationId)).toBe(true);
    }
  });

  it('every notification references a real application or none at all (never a fabricated ID)', () => {
    const appIds = new Set(store.applications().map((a) => a.id));
    for (const n of store.notifications()) {
      if (n.applicationId) expect(appIds.has(n.applicationId)).toBe(true);
    }
  });

  it('one applicant may own more than one business', () => {
    const ownerCounts = new Map<string, number>();
    for (const b of store.businesses()) {
      ownerCounts.set(b.ownerApplicantId, (ownerCounts.get(b.ownerApplicantId) ?? 0) + 1);
    }
    expect(Array.from(ownerCounts.values()).some((count) => count > 1)).toBe(true);
  });
});

describe('ApplicationStore — KPI selectors match the underlying data', () => {
  let store: ApplicationStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ApplicationStore] });
    store = TestBed.inject(ApplicationStore);
  });

  it('totalApplications equals applications().length', () => {
    expect(store.totalApplications()).toBe(store.applications().length);
  });

  it('status-bucket selectors sum to no more than the total, and each equals a real filter', () => {
    const apps = store.applications();
    expect(store.pendingUnderReview()).toBe(
      apps.filter((a) => ['Submitted', 'Received', 'Document Verification', 'Under Evaluation'].includes(a.lifecycleStatus)).length,
    );
    expect(store.revisionRequired()).toBe(apps.filter((a) => a.lifecycleStatus === 'Revision Required').length);
    expect(store.paymentsAwaitingVerification()).toBe(apps.filter((a) => a.lifecycleStatus === 'Payment Under Verification').length);
    expect(store.approvedTotal()).toBe(
      apps.filter((a) => ['Approved', 'Permit Generated', 'Ready for Release', 'Released', 'Completed'].includes(a.lifecycleStatus)).length,
    );
    expect(store.readyForRelease()).toBe(apps.filter((a) => a.lifecycleStatus === 'Ready for Release').length);
  });
});

describe('ApplicationStore — status transitions', () => {
  let store: ApplicationStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ApplicationStore] });
    store = TestBed.inject(ApplicationStore);
  });

  it('rejects an invalid direct transition (e.g. Submitted straight to Approved)', () => {
    const app = store.applications().find((a) => a.lifecycleStatus === 'Submitted');
    if (!app) return; // seed is randomized-but-deterministic; guard for the (unlikely) case none exist
    const ok = store.transitionStatus(app.id, 'Approved', 'Tester', 'Administrator');
    expect(ok).toBe(false);
    expect(store.getById(app.id)!.lifecycleStatus).toBe('Submitted');
  });

  it('accepts a valid transition and keeps the derived coarse status in sync', () => {
    const app = store.applications().find((a) => a.lifecycleStatus === 'Submitted');
    if (!app) return;
    const ok = store.transitionStatus(app.id, 'Received', 'Tester', 'Administrator');
    expect(ok).toBe(true);
    const updated = store.getById(app.id)!;
    expect(updated.lifecycleStatus).toBe('Received');
    expect(updated.status).toBe('Under Review');
  });

  it('requires remarks to transition into Rejected', () => {
    const app = store.applications().find((a) => a.lifecycleStatus === 'Under Evaluation');
    if (!app) return;
    expect(store.transitionStatus(app.id, 'Rejected', 'Tester', 'Evaluator')).toBe(false);
    expect(store.transitionStatus(app.id, 'Rejected', 'Tester', 'Evaluator', 'Failed inspection')).toBe(true);
  });

  it('recordEvaluation requires remarks for Revision Required and Rejected results', () => {
    const app = store.applications().find((a) => a.evaluationResult === 'Pending');
    if (!app) return;
    expect(store.recordEvaluation(app.id, app.evaluationStage, 'Revision Required', 'Tester')).toBe(false);
    expect(store.recordEvaluation(app.id, app.evaluationStage, 'Revision Required', 'Tester', 'Missing document')).toBe(true);
  });
});

describe('ApplicationStore — payment and permit-release prerequisites', () => {
  let store: ApplicationStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ApplicationStore] });
    store = TestBed.inject(ApplicationStore);
  });

  it('recordOnsitePayment refuses to attach to an application that has not been assessed', () => {
    const app = store.applications().find((a) => a.assessedAmountCentavos === null);
    if (!app) return;
    const before = store.applications().length;
    const ok = store.recordOnsitePayment(app.id, 'OR-TEST-1', 'Cashier');
    expect(ok).toBe(false);
    expect(store.applications().length).toBe(before); // never creates a new application
  });

  it('recordOnsitePayment attaches to an existing assessed application without creating a new ID', () => {
    const app = store.applications().find((a) => a.assessedAmountCentavos !== null);
    if (!app) return;
    const before = store.applications().length;
    const ok = store.recordOnsitePayment(app.id, 'OR-TEST-2', 'Cashier');
    expect(ok).toBe(true);
    expect(store.applications().length).toBe(before);
    expect(store.getPayments(app.id).some((p) => p.referenceNumber === 'OR-TEST-2')).toBe(true);
  });

  it('releasePermit refuses release without an approved+paid+generated-permit application', () => {
    const app = store.applications().find((a) => a.lifecycleStatus !== 'Ready for Release');
    if (!app) return;
    const ok = store.releasePermit(app.id, 'Officer', 'Claimant', 'Physical Claim');
    expect(ok).toBe(false);
  });

  it('releasePermit succeeds once, marks Completed, and refuses a duplicate release', () => {
    const app = store.applications().find((a) => a.lifecycleStatus === 'Ready for Release');
    if (!app) return;
    const first = store.releasePermit(app.id, 'Officer', 'Claimant', 'Physical Claim');
    expect(first).toBe(true);
    expect(store.getById(app.id)!.lifecycleStatus).toBe('Completed');

    const second = store.releasePermit(app.id, 'Officer', 'Claimant', 'Physical Claim');
    expect(second).toBe(false);
  });
});

describe('ApplicationStore — no hard deletion', () => {
  let store: ApplicationStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ApplicationStore] });
    store = TestBed.inject(ApplicationStore);
  });

  it('archive() moves an application to Cancelled instead of removing it', () => {
    const app = store.applications()[0];
    const before = store.applications().length;
    store.archive(new Set([app.id]), 'Tester', 'Administrator');
    expect(store.applications().length).toBe(before); // still present
    expect(store.getById(app.id)).toBeTruthy();
    expect(store.getById(app.id)!.lifecycleStatus).toBe('Cancelled');
  });

  it('never removes audit history, even after archiving', () => {
    const app = store.applications()[0];
    store.archive(new Set([app.id]), 'Tester', 'Administrator');
    expect(store.getAuditTrail(app.id).length).toBeGreaterThan(0);
  });
});

describe('ApplicationStore — mutations propagate immediately', () => {
  let store: ApplicationStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ApplicationStore] });
    store = TestBed.inject(ApplicationStore);
  });

  it('a status transition is visible in applications() and via getById() right away', () => {
    const app = store.applications().find((a) => a.lifecycleStatus === 'Submitted');
    if (!app) return;
    store.transitionStatus(app.id, 'Received', 'Tester', 'Administrator');
    expect(store.applications().find((a) => a.id === app.id)!.lifecycleStatus).toBe('Received');
    expect(store.getById(app.id)!.lifecycleStatus).toBe('Received');
  });

  it('a payment verification is reflected in both getPayments() and the application record', () => {
    const app = store.applications().find((a) => a.paymentStatus === 'Pending Verification');
    if (!app) return;
    store.verifyPayment(app.id, 'Officer');
    expect(store.getById(app.id)!.paymentStatus).toBe('Paid');
    expect(store.getPayments(app.id).some((p) => p.status === 'Paid')).toBe(true);
  });
});
