import { TestBed } from '@angular/core/testing';
import { ApplicationStore } from './application-store';
import { AssessmentStore } from './assessment-store';
import { PaymentConfigStore } from './payment-config-store';
import { ALL_PERMIT_TYPES } from './permit.model';
import { requirementsFor } from './requirements-catalog';
import { UNRESOLVED_DOCUMENT_STATUSES } from './document.model';

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
      for (const doc of store.getDocuments(app.id))
        expect(appIds.has(doc.applicationId)).toBe(true);
      for (const ev of store.getEvaluations(app.id))
        expect(appIds.has(ev.applicationId)).toBe(true);
      for (const pay of store.getTransactions(app.id))
        expect(appIds.has(pay.applicationId)).toBe(true);
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

describe('ApplicationStore — getApplicationContext (business/project resolution)', () => {
  let store: ApplicationStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ApplicationStore] });
    store = TestBed.inject(ApplicationStore);
  });

  it('returns undefined for an application id that does not exist', () => {
    expect(store.getApplicationContext('NOT-A-REAL-ID')).toBeUndefined();
  });

  it('resolves the real linked Business — never the applicant name standing in for it', () => {
    for (const app of store.applications()) {
      const ctx = store.getApplicationContext(app.id)!;
      const business = store.getBusiness(app.businessId)!;
      expect(ctx.businessId).toBe(app.businessId);
      expect(ctx.business).toBe(business);
      expect(ctx.businessLabel).toBe(business.name);
      expect(ctx.businessLabel).not.toBe(ctx.applicant);
    }
  });

  it('an applicant who owns more than one business resolves each of their applications to the correct distinct business by businessId (never by applicant name)', () => {
    const ownerCounts = new Map<string, number>();
    for (const b of store.businesses()) {
      ownerCounts.set(b.ownerApplicantId, (ownerCounts.get(b.ownerApplicantId) ?? 0) + 1);
    }
    const multiBusinessOwnerId = Array.from(ownerCounts.entries()).find(
      ([, count]) => count > 1,
    )?.[0];
    expect(multiBusinessOwnerId).toBeTruthy();

    const ownedBusinessIds = new Set(
      store
        .businesses()
        .filter((b) => b.ownerApplicantId === multiBusinessOwnerId)
        .map((b) => b.id),
    );
    const appsForOwner = store.applications().filter((a) => a.applicantId === multiBusinessOwnerId);
    expect(appsForOwner.length).toBeGreaterThan(0);

    for (const app of appsForOwner) {
      const ctx = store.getApplicationContext(app.id)!;
      expect(ownedBusinessIds.has(ctx.businessId)).toBe(true);
      expect(ctx.business!.id).toBe(app.businessId);
    }

    // If this owner's businesses differ in name, confirm two of their
    // applications with different businessId resolve to different labels
    // (proving the join is per-application, not collapsed to one name).
    const distinctBusinessIdsUsed = new Set(appsForOwner.map((a) => a.businessId));
    if (distinctBusinessIdsUsed.size > 1) {
      const labels = new Set(
        appsForOwner.map((a) => store.getApplicationContext(a.id)!.businessLabel),
      );
      expect(labels.size).toBeGreaterThan(1);
    }
  });

  it('falls back to the legacy businessName, then to "Not provided" — never to the applicant name — when no real Business resolves', () => {
    const applicant = store.applicants()[0];
    const record = store.create(
      {
        businessId: 'MISSING-BUSINESS-ID',
        businessName: 'Legacy Denormalized Name',
        applicantId: applicant.id,
        applicant: 'Some Applicant Name',
        location: 'Barangay Poblacion',
        permitType: 'Building Permit – New Construction',
        applicationAction: 'New',
        officer: 'Test Officer',
        dateSubmitted: '01 Jan 2026',
        lifecycleStatus: 'Submitted',
        evaluationStage: 'Initial',
        evaluationResult: 'Pending',
        paymentStatus: 'Not Yet Available',
        permitReleaseStatus: 'Not Ready',
        assessedAmountCentavos: null,
      },
      'Tester',
      'Administrator',
    );

    const ctx = store.getApplicationContext(record.id)!;
    expect(ctx.business).toBeUndefined();
    expect(ctx.businessLabel).toBe('Legacy Denormalized Name');
    expect(ctx.businessLabel).not.toBe(ctx.applicant);

    const record2 = store.create(
      {
        businessId: 'MISSING-BUSINESS-ID-2',
        businessName: '',
        applicantId: applicant.id,
        applicant: 'Some Applicant Name',
        location: 'Barangay Poblacion',
        permitType: 'Building Permit – New Construction',
        applicationAction: 'New',
        officer: 'Test Officer',
        dateSubmitted: '01 Jan 2026',
        lifecycleStatus: 'Submitted',
        evaluationStage: 'Initial',
        evaluationResult: 'Pending',
        paymentStatus: 'Not Yet Available',
        permitReleaseStatus: 'Not Ready',
        assessedAmountCentavos: null,
      },
      'Tester',
      'Administrator',
    );
    const ctx2 = store.getApplicationContext(record2.id)!;
    expect(ctx2.businessLabel).toBe('Not provided');
    expect(ctx2.businessLabel).not.toBe(ctx2.applicant);
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
      apps.filter((a) =>
        ['Submitted', 'Received', 'Document Verification', 'Under Evaluation'].includes(
          a.lifecycleStatus,
        ),
      ).length,
    );
    expect(store.revisionRequired()).toBe(
      apps.filter((a) => a.lifecycleStatus === 'Revision Required').length,
    );
    expect(store.paymentsAwaitingVerification()).toBe(
      apps.filter((a) => a.lifecycleStatus === 'Payment Under Verification').length,
    );
    expect(store.approvedTotal()).toBe(
      apps.filter((a) =>
        ['Approved', 'Permit Generated', 'Ready for Release', 'Released', 'Completed'].includes(
          a.lifecycleStatus,
        ),
      ).length,
    );
    expect(store.readyForRelease()).toBe(
      apps.filter((a) => a.lifecycleStatus === 'Ready for Release').length,
    );
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
    expect(
      store.transitionStatus(app.id, 'Rejected', 'Tester', 'Evaluator', 'Failed inspection'),
    ).toBe(true);
  });

  it('recordEvaluation requires remarks for Revision Required and Rejected results', () => {
    // Must genuinely be 'Under Evaluation' — that's the only lifecycle
    // status Revision Required is a legal transition from among the
    // seed's likely candidates (Document Verification/For Approval also
    // qualify, but Under Evaluation is the common case and what
    // evaluationStage/evaluationResult actually describe).
    const app = store.applications().find((a) => a.lifecycleStatus === 'Under Evaluation');
    if (!app) return;
    expect(store.recordEvaluation(app.id, app.evaluationStage, 'Revision Required', 'Tester')).toBe(
      false,
    );
    expect(
      store.recordEvaluation(
        app.id,
        app.evaluationStage,
        'Revision Required',
        'Tester',
        'Missing document',
      ),
    ).toBe(true);
  });

  it('recordEvaluation refuses to force-pass a stage once the application is already Rejected/Revision Required — it must not silently corrupt evaluationStage/evaluationResult out of sync with the real lifecycleStatus', () => {
    const app = store.applications().find((a) => a.lifecycleStatus === 'Under Evaluation');
    if (!app) return;
    const sentBack = store.recordEvaluation(
      app.id,
      app.evaluationStage,
      'Revision Required',
      'Tester',
      'Needs fixing',
    );
    expect(sentBack).toBe(true);
    expect(store.getById(app.id)!.lifecycleStatus).toBe('Revision Required');

    // This is the exact scenario the Evaluations page's "Advance Stage"
    // menu item used to allow: a row genuinely sitting in the "Returned"
    // tab (Revision Required) getting force-passed anyway.
    const before = store.getById(app.id)!;
    const forcedPass = store.recordEvaluation(app.id, before.evaluationStage, 'Passed', 'Tester');
    expect(forcedPass).toBe(false);
    const after = store.getById(app.id)!;
    expect(after.lifecycleStatus).toBe('Revision Required');
    expect(after.evaluationStage).toBe(before.evaluationStage);
    expect(after.evaluationResult).toBe(before.evaluationResult);
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
    const app = store
      .applications()
      .find((a) => (store.getActiveAssessment(a.id)?.balanceCentavos ?? 0) > 0);
    if (!app) return;
    const before = store.applications().length;
    const ok = store.recordOnsitePayment(app.id, 'OR-TEST-2', 'Cashier');
    expect(ok).toBe(true);
    expect(store.applications().length).toBe(before);
    expect(store.getTransactions(app.id).some((p) => p.transactionReference === 'OR-TEST-2')).toBe(
      true,
    );
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

  it('a payment verification is reflected in both getTransactions() and the application record', () => {
    const app = store.applications().find((a) => a.paymentStatus === 'Pending Verification');
    if (!app) return;
    const pending = store.getTransactions(app.id).find((t) => t.status === 'Pending Verification')!;
    store.verifyPayment(app.id, pending.id, 'Officer');
    expect(store.getById(app.id)!.paymentStatus).toBe('Paid');
    expect(store.getTransactions(app.id).some((p) => p.status === 'Verified')).toBe(true);
  });
});

describe('ApplicationStore — seed-data validity', () => {
  let store: ApplicationStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ApplicationStore] });
    store = TestBed.inject(ApplicationStore);
  });

  it('every application uses a real, centralized permit type — never the old generic "Business Permit" value', () => {
    for (const app of store.applications()) {
      expect(app.permitType as string).not.toBe('Business Permit');
      expect(ALL_PERMIT_TYPES).toContain(app.permitType);
    }
  });

  it("every application's `type` projection matches its own `permitType` (never independently drifted)", () => {
    for (const app of store.applications()) {
      expect(app.type).toBe(app.permitType);
    }
  });

  it('includes at least one guaranteed, fully-resolved (Completed) sample application per permit type', () => {
    for (const type of ALL_PERMIT_TYPES) {
      const sample = store
        .applications()
        .find((a) => a.permitType === type && a.lifecycleStatus === 'Completed');
      expect(sample).toBeTruthy();
    }
  });

  it('the guaranteed Renovation sample has a complete audit trail from submission through release', () => {
    const renovation = store
      .applications()
      .find((a) => a.permitType === 'Building Permit – Renovation / Alteration' && a.lifecycleStatus === 'Completed')!;
    expect(renovation).toBeTruthy();
    expect(store.getPermit(renovation.id)).toBeTruthy();
    expect(store.getRelease(renovation.id)).toBeTruthy();
    expect(store.getTransactions(renovation.id).some((p) => p.status === 'Verified')).toBe(true);
    const audit = store.getAuditTrail(renovation.id);
    expect(audit.length).toBeGreaterThan(3);
  });

  it('the guaranteed Renovation sample demonstrates a real revision loop (not just a straight pass)', () => {
    const renovation = store
      .applications()
      .find((a) => a.permitType === 'Building Permit – Renovation / Alteration' && a.lifecycleStatus === 'Completed')!;
    const evaluations = store.getEvaluations(renovation.id);
    expect(evaluations.some((e) => e.result === 'Revision Required')).toBe(true);
    // ...followed by an eventual Passed on the same stage, proving the loop resolved.
    const revisionStage = evaluations.find((e) => e.result === 'Revision Required')!.stage;
    expect(evaluations.some((e) => e.stage === revisionStage && e.result === 'Passed')).toBe(true);
  });

  it("every seeded document belongs to a requirement genuinely listed for that application's permit type", () => {
    for (const app of store.applications()) {
      const validIds = new Set(requirementsFor(app.permitType).documents.map((d) => d.id));
      for (const doc of store.getDocuments(app.id)) {
        expect(validIds.has(doc.requirementId)).toBe(true);
      }
    }
  });

  it("every seeded evaluation's departmentId is a real one drawn from that permit type's own evaluation sequence", () => {
    for (const app of store.applications()) {
      const validDeptIds = new Set(
        requirementsFor(app.permitType).evaluationSequence.map((s) => s.departmentId),
      );
      for (const ev of store.getEvaluations(app.id)) {
        expect(validDeptIds.has(ev.departmentId)).toBe(true);
      }
    }
  });

  it('every applicant starts with typed, non-empty contact-verification records (never a bare boolean)', () => {
    for (const applicant of store.applicants()) {
      expect(['Unverified', 'Pending Verification', 'Verified', 'Verification Failed']).toContain(
        applicant.emailVerification.status,
      );
      expect(['Unverified', 'Pending Verification', 'Verified', 'Verification Failed']).toContain(
        applicant.mobileVerification.status,
      );
    }
  });
});

describe('ApplicationStore — document lifecycle and approval blocking', () => {
  let store: ApplicationStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ApplicationStore] });
    store = TestBed.inject(ApplicationStore);
  });

  // A freshly created application (never touched by the seed's own
  // document generation) — every test in this block needs a record it
  // knows for certain starts with zero attached documents, which no
  // seeded row guarantees (the seed attaches a document per requirement
  // for every application once its evaluation has progressed at all).
  function freshApplication(): string {
    const stamp = Math.random().toString(36).slice(2);
    const record = store.create(
      {
        businessId: `TEST-BIZ-${stamp}`,
        businessName: 'Test Business',
        applicantId: `TEST-APL-${stamp}`,
        applicant: 'Test Applicant',
        location: 'Barangay Poblacion',
        permitType: 'Building Permit – New Construction',
        applicationAction: 'New',
        officer: 'Test Officer',
        dateSubmitted: '01 Jan 2026',
        lifecycleStatus: 'Submitted',
        evaluationStage: 'Initial',
        evaluationResult: 'Pending',
        paymentStatus: 'Not Yet Available',
        permitReleaseStatus: 'Not Ready',
        assessedAmountCentavos: null,
      },
      'Tester',
      'Administrator',
    );
    return record.id;
  }

  it('attachDocument creates a new document tied to the right requirement, defaulting to Submitted', () => {
    const appId = freshApplication();
    const requirement = requirementsFor('Building Permit – New Construction').documents[0];
    expect(store.getDocuments(appId).length).toBe(0);
    const created = store.attachDocument(
      appId,
      requirement.id,
      requirement.label,
      'test-file.pdf',
      'Tester',
    );
    expect(created.status).toBe('Submitted');
    expect(store.getDocuments(appId).length).toBe(1);
  });

  it('resubmitDocument replaces the file/status but preserves the prior version in history', () => {
    const appId = freshApplication();
    const requirement = requirementsFor('Building Permit – New Construction').documents[0];
    const created = store.attachDocument(
      appId,
      requirement.id,
      requirement.label,
      'first.pdf',
      'Tester',
    );
    store.setDocumentStatus(appId, created.id, 'Rejected', 'Evaluator', 'Blurry scan');
    const ok = store.resubmitDocument(appId, created.id, 'second.pdf', 'Applicant');
    expect(ok).toBe(true);
    const updated = store.getDocument(appId, requirement.id)!;
    expect(updated.fileName).toBe('second.pdf');
    expect(updated.status).toBe('Submitted');
    expect(updated.history.length).toBe(1);
    expect(updated.history[0].fileName).toBe('first.pdf');
    expect(updated.history[0].status).toBe('Rejected');
  });

  it('attachDocument called again for the SAME requirement resubmits (via history) instead of creating a duplicate row', () => {
    const appId = freshApplication();
    const requirement = requirementsFor('Building Permit – New Construction').documents[0];
    store.attachDocument(appId, requirement.id, requirement.label, 'first.pdf', 'Tester');
    store.attachDocument(appId, requirement.id, requirement.label, 'replacement.pdf', 'Tester');
    const docs = store.getDocuments(appId).filter((d) => d.requirementId === requirement.id);
    expect(docs.length).toBe(1);
    expect(docs[0].fileName).toBe('replacement.pdf');
    expect(docs[0].history.length).toBe(1);
  });

  it('setDocumentStatus refuses Rejected/Revision Required without remarks', () => {
    const appId = freshApplication();
    const requirement = requirementsFor('Building Permit – New Construction').documents[0];
    const created = store.attachDocument(
      appId,
      requirement.id,
      requirement.label,
      'file.pdf',
      'Tester',
    );
    expect(store.setDocumentStatus(appId, created.id, 'Rejected', 'Evaluator')).toBe(false);
    expect(store.setDocumentStatus(appId, created.id, 'Rejected', 'Evaluator', 'Incomplete')).toBe(
      true,
    );
  });

  it('canApprove is false for a freshly created application with no documents attached at all', () => {
    const appId = freshApplication();
    expect(store.canApprove(appId)).toBe(false);
  });

  it('canApprove is false while even one required document remains unresolved', () => {
    const appId = freshApplication();
    const requirements = requirementsFor('Building Permit – New Construction').documents.filter((d) => d.required);
    requirements.forEach((req, i) => {
      const doc = store.attachDocument(appId, req.id, req.label, `${req.id}.pdf`, 'Tester');
      if (i < requirements.length - 1)
        store.setDocumentStatus(appId, doc.id, 'Accepted', 'Evaluator');
      // The last required document is deliberately left at 'Submitted'.
    });
    expect(store.canApprove(appId)).toBe(false);
  });

  it('canApprove is true only once every required document is Accepted; optional documents never block it', () => {
    const appId = freshApplication();
    const requirements = requirementsFor('Building Permit – New Construction').documents;
    for (const req of requirements) {
      const doc = store.attachDocument(appId, req.id, req.label, `${req.id}.pdf`, 'Tester');
      if (req.required) store.setDocumentStatus(appId, doc.id, 'Accepted', 'Evaluator');
      // Optional documents are deliberately left at 'Submitted'.
    }
    expect(store.canApprove(appId)).toBe(true);
  });

  // `create()` accepts any starting lifecycleStatus directly (it's the
  // assisted/onsite-filing entry point, not itself transition-validated)
  // — used here only to deterministically PLACE a test fixture at "For
  // Approval" without walking the full 9-step transition chain, so these
  // two tests isolate the approval-gate behavior specifically.
  function applicationAtForApproval(): string {
    const stamp = Math.random().toString(36).slice(2);
    const record = store.create(
      {
        businessId: `TEST-BIZ-${stamp}`,
        businessName: 'Test Business',
        applicantId: `TEST-APL-${stamp}`,
        applicant: 'Test Applicant',
        location: 'Barangay Poblacion',
        permitType: 'Building Permit – New Construction',
        applicationAction: 'New',
        officer: 'Test Officer',
        dateSubmitted: '01 Jan 2026',
        lifecycleStatus: 'For Approval',
        evaluationStage: 'Final Approval',
        evaluationResult: 'Passed',
        paymentStatus: 'Paid',
        permitReleaseStatus: 'Not Ready',
        assessedAmountCentavos: 100000,
      },
      'Tester',
      'Administrator',
    );
    return record.id;
  }

  it('transitionStatus to Approved is blocked while required documents remain unresolved, with an understandable failure (no mutation)', () => {
    const appId = applicationAtForApproval();
    // No documents attached at all — every required one is "Missing".
    const ok = store.transitionStatus(appId, 'Approved', 'Tester', 'Administrator');
    expect(ok).toBe(false);
    expect(store.getById(appId)!.lifecycleStatus).toBe('For Approval'); // unchanged
  });

  it('transitionStatus to Approved succeeds once every required document is Accepted', () => {
    const appId = applicationAtForApproval();
    for (const req of requirementsFor('Building Permit – New Construction').documents.filter((d) => d.required)) {
      const doc = store.attachDocument(appId, req.id, req.label, `${req.id}.pdf`, 'Tester');
      store.setDocumentStatus(appId, doc.id, 'Accepted', 'Evaluator');
    }
    const ok = store.transitionStatus(appId, 'Approved', 'Tester', 'Administrator');
    expect(ok).toBe(true);
    expect(store.getById(appId)!.lifecycleStatus).toBe('Approved');
  });

  it('UNRESOLVED_DOCUMENT_STATUSES treats every status except Accepted as blocking', () => {
    expect(UNRESOLVED_DOCUMENT_STATUSES.has('Accepted')).toBe(false);
    for (const s of [
      'Missing',
      'Uploaded',
      'Submitted',
      'Under Review',
      'Rejected',
      'Revision Required',
      'Expired',
    ] as const) {
      expect(UNRESOLVED_DOCUMENT_STATUSES.has(s)).toBe(true);
    }
  });
});

describe('ApplicationStore — contact verification (never fabricated)', () => {
  let store: ApplicationStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ApplicationStore] });
    store = TestBed.inject(ApplicationStore);
  });

  it('addApplicant never auto-verifies a contact just because its stored value is well-formed', () => {
    const applicant = store.addApplicant({
      firstName: 'Test',
      lastName: 'Applicant',
      email: 'test.applicant@gmail.com',
      mobileNumber: '+63 917 000 0000',
      landlineNumber: null,
      applicantType: 'Individual',
      addressLine: '1 Test Street',
      barangay: 'Poblacion',
      emailVerification: {
        status: 'Unverified',
        method: null,
        verifiedBy: null,
        verifiedAtValue: null,
        verifiedAt: null,
      },
      mobileVerification: {
        status: 'Unverified',
        method: null,
        verifiedBy: null,
        verifiedAtValue: null,
        verifiedAt: null,
      },
    });
    expect(applicant.emailVerification.status).toBe('Unverified');
    expect(applicant.mobileVerification.status).toBe('Unverified');
  });

  it('setContactVerification moves a contact through Pending -> Verified via manual administrator confirmation, stamping who/when', () => {
    const applicant = store.applicants()[0];
    store.setContactVerification(
      applicant.id,
      'email',
      'Pending Verification',
      'Email Verification Link',
      'Admin',
    );
    expect(store.getApplicant(applicant.id)!.emailVerification.status).toBe('Pending Verification');

    store.setContactVerification(
      applicant.id,
      'email',
      'Verified',
      'Manual Administrator Confirmation',
      'Admin One',
    );
    const verified = store.getApplicant(applicant.id)!.emailVerification;
    expect(verified.status).toBe('Verified');
    expect(verified.method).toBe('Manual Administrator Confirmation');
    expect(verified.verifiedBy).toBe('Admin One');
    expect(verified.verifiedAt).toBeTruthy();
  });

  it('setContactVerification can record a Verification Failed outcome distinct from Unverified', () => {
    const applicant = store.applicants()[0];
    store.setContactVerification(
      applicant.id,
      'mobile',
      'Verification Failed',
      'Mobile OTP',
      'Admin',
    );
    const result = store.getApplicant(applicant.id)!.mobileVerification;
    expect(result.status).toBe('Verification Failed');
    expect(result.verifiedBy).toBeNull(); // only a *successful* verification stamps a verifier
  });

  it('email and mobile verification are tracked independently on the same applicant', () => {
    const applicant = store.applicants()[0];
    store.setContactVerification(
      applicant.id,
      'email',
      'Verified',
      'Manual Administrator Confirmation',
      'Admin',
    );
    const updated = store.getApplicant(applicant.id)!;
    expect(updated.emailVerification.status).toBe('Verified');
    expect(updated.mobileVerification.status).not.toBe('Verified');
  });
});

describe('ApplicationStore — fee assessment reads the live fee-rule catalog and preserves history', () => {
  let store: ApplicationStore;
  let assessmentStore: AssessmentStore;
  let paymentConfig: PaymentConfigStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApplicationStore, AssessmentStore, PaymentConfigStore],
    });
    store = TestBed.inject(ApplicationStore);
    assessmentStore = TestBed.inject(AssessmentStore);
    paymentConfig = TestBed.inject(PaymentConfigStore);
  });

  it('assessFee drafts a real, rules-based assessment built from the current fee-rule catalog for that permit type', () => {
    const app = store
      .applications()
      .find((a) => a.assessedAmountCentavos === null && a.lifecycleStatus === 'Under Evaluation');
    if (!app) return;
    const ok = store.assessFee(app.id, 'Tester', 'Evaluator');
    expect(ok).toBe(true);
    const draft = assessmentStore.getActiveAssessment(app.id);
    expect(draft).toBeTruthy();
    expect(draft!.lineItems.length).toBeGreaterThan(0);
    expect(draft!.lineItems.some((l) => l.feeRuleId === 'filing-fee')).toBe(true);
  });

  it('once issued, changing a fee rule AFTER assessment never rewrites the already-issued line-item snapshot (no silent recalculation of historical figures)', () => {
    const app = store
      .applications()
      .find((a) => a.assessedAmountCentavos === null && a.lifecycleStatus === 'Under Evaluation');
    if (!app) return;
    store.assessFee(app.id, 'Tester', 'Evaluator');
    const draft = assessmentStore.getActiveAssessment(app.id)!;
    for (const line of draft.lineItems) {
      if (line.amountCentavos === null) {
        assessmentStore.setLineAmount(draft.id, line.feeRuleId, 10000, 'Tester', 'Evaluator');
      }
    }
    assessmentStore.submitForApproval(draft.id, 'Tester', 'Evaluator');
    assessmentStore.approveAssessment(draft.id, 'Admin', 'Administrator');
    assessmentStore.issueOrderOfPayment(draft.id, 'Admin', 'Administrator');
    store.refreshPaymentProjection(app.id, 'Admin', 'Administrator');
    const assessedAmount = store.getById(app.id)!.assessedAmountCentavos;
    expect(assessedAmount).not.toBeNull();

    paymentConfig.updateFeeRule('filing-fee', { flatAmountCentavos: 999999 }, 'Tester');

    expect(store.getById(app.id)!.assessedAmountCentavos).toBe(assessedAmount);
    const filingLine = assessmentStore
      .getAssessmentById(draft.id)!
      .lineItems.find((l) => l.feeRuleId === 'filing-fee')!;
    expect(filingLine.amountCentavos).not.toBe(999999);
  });

  it('assessFee is idempotent — calling it again after a draft already exists never forks a second assessment', () => {
    const app = store
      .applications()
      .find((a) => a.assessedAmountCentavos === null && a.lifecycleStatus === 'Under Evaluation');
    if (!app) return;
    store.assessFee(app.id, 'Tester', 'Evaluator');
    const countBefore = assessmentStore.getAssessments(app.id).length;
    const ok = store.assessFee(app.id, 'Tester', 'Evaluator');
    expect(ok).toBe(true);
    expect(assessmentStore.getAssessments(app.id).length).toBe(countBefore);
  });
});

describe('ApplicationStore — permit generation', () => {
  let store: ApplicationStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ApplicationStore] });
    store = TestBed.inject(ApplicationStore);
  });

  it('refuses to generate a permit for an application that is not Approved + Paid', () => {
    const app = store.applications().find((a) => a.lifecycleStatus !== 'Approved');
    if (!app) return;
    expect(store.generatePermit(app.id, 'Officer', 'Approving Officer')).toBe(false);
  });

  it('generates a real permit (number/issue date/approving office) and advances straight to Ready for Release', () => {
    const app = store
      .applications()
      .find(
        (a) =>
          a.lifecycleStatus === 'Approved' && a.paymentStatus === 'Paid' && !store.getPermit(a.id),
      );
    if (!app) return;
    const ok = store.generatePermit(app.id, 'Engr. Test Officer', 'Approving Officer');
    expect(ok).toBe(true);
    const permit = store.getPermit(app.id)!;
    expect(permit.permitNumber).toBeTruthy();
    expect(permit.approvingOfficial).toBe('Engr. Test Officer');
    expect(permit.approvingOffice).toBeTruthy();
    expect(store.getById(app.id)!.lifecycleStatus).toBe('Ready for Release');
    // Regression guard: transitionStatus used to only ever write
    // lifecycleStatus, never the separate permitReleaseStatus field —
    // seed data hand-computed both together, masking that the live
    // generatePermit() path left permitReleaseStatus stuck at
    // 'Not Ready' forever. permit-release.ts's Release Queue filters on
    // `permitReleaseStatus !== 'Not Ready'`, so a real (non-seeded)
    // application could reach 'Ready for Release' with a real permit
    // and still never appear in the Release Queue at all — no error,
    // no button, just silently invisible.
    expect(store.getById(app.id)!.permitReleaseStatus).toBe('Ready for Release');
  });

  it('refuses to generate a second permit for the same application', () => {
    const app = store.applications().find((a) => !!store.getPermit(a.id));
    if (!app) return;
    expect(store.generatePermit(app.id, 'Officer', 'Approving Officer')).toBe(false);
  });
});

describe('ApplicationStore — permit processing is blocked until every mandatory balance is verified (partial payment)', () => {
  let store: ApplicationStore;
  let assessmentStore: AssessmentStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ApplicationStore, AssessmentStore] });
    store = TestBed.inject(ApplicationStore);
    assessmentStore = TestBed.inject(AssessmentStore);
  });

  it('generatePermit refuses while the assessment is only Partially Paid, and succeeds once the balance reaches zero', () => {
    const applicant = store.addApplicant({
      firstName: 'Partial',
      lastName: 'Payer',
      email: 'partial.payer@gmail.com',
      mobileNumber: '+63 917 555 0001',
      landlineNumber: null,
      applicantType: 'Individual',
      addressLine: 'Purok 1, Rizal Street',
      barangay: 'Poblacion',
      emailVerification: {
        status: 'Unverified',
        method: null,
        verifiedBy: null,
        verifiedAtValue: null,
        verifiedAt: null,
      },
      mobileVerification: {
        status: 'Unverified',
        method: null,
        verifiedBy: null,
        verifiedAtValue: null,
        verifiedAt: null,
      },
    });
    const business = store.addBusiness({
      name: 'Partial Payer Store',
      category: 'Retail',
      ownerApplicantId: applicant.id,
      street: '1 Rizal Street',
      barangay: 'Poblacion',
      city: 'Castilla',
      province: 'Sorsogon',
      registrationNumber: 'PENDING',
      status: 'Active',
    });
    const record = store.create(
      {
        businessId: business.id,
        businessName: business.name,
        applicantId: applicant.id,
        applicant: 'Partial Payer',
        location: 'Barangay Poblacion',
        permitType: 'Fencing Permit',
        applicationAction: 'New',
        officer: 'Engr. Tester',
        dateSubmitted: '01 Jan 2026',
        lifecycleStatus: 'Approved',
        evaluationStage: 'Final Approval',
        evaluationResult: 'Passed',
        paymentStatus: 'Not Yet Available',
        permitReleaseStatus: 'Not Ready',
        assessedAmountCentavos: null,
      },
      'Engr. Tester',
      'Administrator',
    );

    const draft = assessmentStore.draftAssessment(
      record.id,
      'Fencing Permit',
      'Tester',
      'Evaluator',
    )!;
    for (const line of draft.lineItems) {
      if (line.amountCentavos === null)
        assessmentStore.setLineAmount(draft.id, line.feeRuleId, 20000, 'Tester', 'Evaluator');
    }
    assessmentStore.submitForApproval(draft.id, 'Tester', 'Evaluator');
    assessmentStore.approveAssessment(draft.id, 'Admin', 'Administrator');
    assessmentStore.issueOrderOfPayment(draft.id, 'Admin', 'Administrator');
    const issued = assessmentStore.getAssessmentById(draft.id)!;

    const half = Math.floor(issued.balanceCentavos / 2);
    const t1 = assessmentStore.recordOnsitePayment(
      issued.id,
      half,
      'OR-BLOCK-1',
      'OBO/LGU',
      'Cashier',
      'Payment Officer',
    )!;
    assessmentStore.verifyTransaction(t1.id, 'Officer', 'Payment Officer');
    store.refreshPaymentProjection(record.id, 'Officer', 'Payment Officer');

    expect(store.getById(record.id)!.paymentStatus).toBe('Partially Paid');
    expect(store.generatePermit(record.id, 'Officer', 'Approving Officer')).toBe(false);

    const remaining = assessmentStore.getAssessmentById(draft.id)!.balanceCentavos;
    const t2 = assessmentStore.recordOnsitePayment(
      issued.id,
      remaining,
      'OR-BLOCK-2',
      'OBO/LGU',
      'Cashier',
      'Payment Officer',
    )!;
    assessmentStore.verifyTransaction(t2.id, 'Officer', 'Payment Officer');
    store.refreshPaymentProjection(record.id, 'Officer', 'Payment Officer');

    expect(store.getById(record.id)!.paymentStatus).toBe('Paid');
    expect(store.generatePermit(record.id, 'Officer', 'Approving Officer')).toBe(true);
  });
});

describe('ApplicationStore — complete end-to-end Renovation workflow', () => {
  let store: ApplicationStore;
  let assessmentStore: AssessmentStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ApplicationStore, AssessmentStore] });
    store = TestBed.inject(ApplicationStore);
    assessmentStore = TestBed.inject(AssessmentStore);
  });

  it('walks a brand-new Renovation application through every real stage to a released permit, entirely through public store methods', () => {
    const actor = 'Engr. Integration Tester';
    const adminRole = 'Administrator';

    // 1-2. Administrator creates a manual application; required fields validated
    // by the caller (this test supplies complete, valid data directly).
    const applicant = store.addApplicant({
      firstName: 'Maria',
      lastName: 'Santos',
      email: 'maria.santos@gmail.com',
      mobileNumber: '+63 917 555 0000',
      landlineNumber: null,
      applicantType: 'Individual',
      addressLine: 'Purok 2, Rizal Street',
      barangay: 'Cogon',
      // 3-4. Contact verification is handled honestly — starts Unverified.
      emailVerification: {
        status: 'Unverified',
        method: null,
        verifiedBy: null,
        verifiedAtValue: null,
        verifiedAt: null,
      },
      mobileVerification: {
        status: 'Unverified',
        method: null,
        verifiedBy: null,
        verifiedAtValue: null,
        verifiedAt: null,
      },
    });
    const business = store.addBusiness({
      name: 'Santos Residence Renovation',
      category: 'Other',
      ownerApplicantId: applicant.id,
      street: '45 Rizal Street',
      barangay: 'Cogon',
      city: 'Castilla',
      province: 'Sorsogon',
      registrationNumber: 'PENDING',
      status: 'Active',
    });

    const record = store.create(
      {
        businessId: business.id,
        businessName: business.name,
        applicantId: applicant.id,
        applicant: 'Maria Santos',
        location: 'Barangay Cogon',
        permitType: 'Building Permit – Renovation / Alteration',
        applicationAction: 'New',
        officer: actor,
        dateSubmitted: '01 Jan 2026',
        lifecycleStatus: 'Submitted',
        evaluationStage: 'Initial',
        evaluationResult: 'Pending',
        paymentStatus: 'Not Yet Available',
        permitReleaseStatus: 'Not Ready',
        assessedAmountCentavos: null,
      },
      actor,
      adminRole,
    );
    expect(record.lifecycleStatus).toBe('Submitted');
    expect(record.evaluationResult).toBe('Pending'); // honest starting state — nothing fabricated as complete

    // 5. Required documents are attached.
    const requirements = requirementsFor('Building Permit – Renovation / Alteration').documents;
    for (const req of requirements) {
      store.attachDocument(record.id, req.id, req.label, `${req.id}.pdf`, actor);
    }
    for (const req of requirements.filter((d) => d.required)) {
      const doc = store.getDocument(record.id, req.id)!;
      store.setDocumentStatus(record.id, doc.id, 'Accepted', 'Evaluator');
    }

    // 6-7. Initial review + routes through the real evaluation sequence
    // for Renovation (Initial -> Zoning -> Fire Safety -> OBO -> Final Approval).
    expect(store.transitionStatus(record.id, 'Received', actor, adminRole)).toBe(true);
    expect(store.transitionStatus(record.id, 'Document Verification', actor, adminRole)).toBe(true);
    expect(store.transitionStatus(record.id, 'Under Evaluation', actor, adminRole)).toBe(true);

    // 8. A revision request is handled realistically before passing.
    expect(
      store.recordEvaluation(
        record.id,
        'Zoning',
        'Revision Required',
        'Zoning Evaluator',
        'Setback not compliant',
      ),
    ).toBe(true);
    expect(store.getById(record.id)!.lifecycleStatus).toBe('Revision Required');
    expect(store.transitionStatus(record.id, 'Under Evaluation', actor, adminRole)).toBe(true);
    expect(store.recordEvaluation(record.id, 'Zoning', 'Passed', 'Zoning Evaluator')).toBe(true);
    expect(store.recordEvaluation(record.id, 'Fire Safety', 'Passed', 'BFP Inspector')).toBe(true);
    expect(store.recordEvaluation(record.id, 'OBO', 'Passed', 'OBO Reviewer')).toBe(true);
    expect(store.recordEvaluation(record.id, 'Final Approval', 'Passed', 'Building Official')).toBe(
      true,
    );
    // A Passed Final Approval evaluation moves the application's STATUS to
    // 'Assessed' (see ApplicationStore.recordEvaluation), but the actual
    // fee amount is a separate, explicit act — assessFee() below.
    expect(store.getById(record.id)!.lifecycleStatus).toBe('Assessed');

    // 9-11. Fees assessed through the real rules-based workflow: draft ->
    // resolve every "Requires assessor input" line -> submit for approval
    // -> approve -> issue the Order of Payment -> record payment ->
    // verify that ONE transaction. `assessFee` only drafts (never
    // fabricates a total) since Building Permit – Renovation / Alteration's building-formula line
    // requires assessor input; the rest is driven directly against
    // AssessmentStore, exactly as the Payments > Assessments tab does.
    expect(store.getById(record.id)!.assessedAmountCentavos).toBeNull();
    expect(store.assessFee(record.id, actor, adminRole)).toBe(true);
    const draft = assessmentStore.getActiveAssessment(record.id)!;
    expect(draft.status).toBe('Draft');
    for (const line of draft.lineItems) {
      if (line.amountCentavos === null) {
        assessmentStore.setLineAmount(draft.id, line.feeRuleId, 20000, actor, adminRole);
      }
    }
    expect(assessmentStore.submitForApproval(draft.id, actor, adminRole)).toBe(true);
    expect(assessmentStore.approveAssessment(draft.id, actor, adminRole)).toBe(true);
    expect(assessmentStore.issueOrderOfPayment(draft.id, actor, adminRole)).toBe(true);
    store.refreshPaymentProjection(record.id, actor, adminRole);
    expect(store.getById(record.id)!.assessedAmountCentavos).not.toBeNull();
    // Issued but not yet paid — the lifecycle status stays at 'Assessed'
    // rather than being fabricated forward.
    expect(store.getById(record.id)!.lifecycleStatus).toBe('Assessed');

    // Recording and verifying a payment now advances lifecycleStatus
    // automatically (see ApplicationStore.syncPaymentProjection) — this
    // is the direct fix for "payment actions do not consistently advance
    // lifecycle status", so no separate manual transitionStatus call is
    // needed for the Payment Submitted / Payment Under Verification /
    // Payment Verified hops.
    expect(store.recordOnsitePayment(record.id, 'OR-RENOVATION-TEST', 'Cashier')).toBe(true);
    expect(store.getById(record.id)!.paymentStatus).toBe('Pending Verification');
    expect(store.getById(record.id)!.lifecycleStatus).toBe('Payment Under Verification');

    const pendingTxn = store
      .getTransactions(record.id)
      .find((t) => t.status === 'Pending Verification')!;
    expect(store.verifyPayment(record.id, pendingTxn.id, 'Payment Officer')).toBe(true);
    expect(store.getById(record.id)!.paymentStatus).toBe('Paid');
    expect(store.getById(record.id)!.lifecycleStatus).toBe('For Approval');

    // 12. Final approval — blocked-then-allowed once documents are resolved (already Accepted above).
    expect(store.transitionStatus(record.id, 'Approved', actor, 'Approving Officer')).toBe(true);

    // 13-14. Permit generated with a real number/office; previewable via GeneratedPermit fields.
    expect(store.generatePermit(record.id, 'Engr. Building Official', 'Approving Officer')).toBe(
      true,
    );
    const permit = store.getPermit(record.id)!;
    expect(permit.permitNumber).toBeTruthy();
    expect(store.getById(record.id)!.lifecycleStatus).toBe('Ready for Release');
    // This is the exact scenario the permitReleaseStatus regression above
    // guards — a real, freshly-created (not seeded) application must
    // actually become visible in the Permit Release Queue at this point.
    expect(store.getById(record.id)!.permitReleaseStatus).toBe('Ready for Release');

    // 15-17. Permit released; release + receipt recorded.
    expect(
      store.releasePermit(record.id, 'Releasing Officer', 'Maria Santos', 'Physical Claim'),
    ).toBe(true);
    expect(store.getById(record.id)!.lifecycleStatus).toBe('Completed');
    expect(store.getRelease(record.id)).toBeTruthy();

    // 18. Every event appears in the audit timeline, in order.
    const audit = store.getAuditTrail(record.id);
    expect(audit.length).toBeGreaterThan(8);
    const actions = audit.map((e) => e.action).join(' | ');
    expect(actions).toContain('Revision Required');
    expect(actions).toContain('released');

    // Integration: the same record is visible everywhere via the shared store.
    expect(store.applications().find((a) => a.id === record.id)!.lifecycleStatus).toBe('Completed');
    expect(store.getById(record.id)!.status).toBe('Approved'); // coarse projection stays in sync
  });
});
