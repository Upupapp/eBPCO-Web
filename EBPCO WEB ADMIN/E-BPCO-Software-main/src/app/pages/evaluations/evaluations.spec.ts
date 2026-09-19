import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Evaluations } from './evaluations';
import { ApplicationStore } from '../../core/domain/application-store';
import { requirementsFor } from '../../core/domain/requirements-catalog';
import {
  EvaluationDecision,
  EvaluationQueueResult,
  EvaluationWriteResult,
  StaffEvaluationsApi,
} from '../../core/api/staff-evaluations.api';
import {
  ApplicationDetailResult,
  ApplicationDocumentRow,
  StaffApplicationsApi,
} from '../../core/api/staff-applications.api';
import { ApplicationRecord } from '../../core/domain/application.model';
import { EvaluationRecord } from '../../core/domain/evaluation.model';
import { EVALUATION_STAGE_ORDER } from '../../core/domain/status.model';

// `protected` members are accessed via `as any` throughout — the standard
// pattern in this codebase for exercising component-internal state from a
// spec without loosening the component's own public API (see
// businesses.spec.ts).
//
// `StaffEvaluationsApi` itself now talks real HTTP (`GET /staff/evaluations`,
// `POST /staff/applications/:id/evaluations` — see that file's own doc
// comment), and this suite never stands up a server. Rather than reach for
// HttpTestingController and hand-flush a request per test, `queue()`/
// `record()` are faked here exactly the way `applications.spec.ts` fakes
// `StaffApplicationsApi` — a `useValue` swap-in. Critically, the fake is not
// independently-invented data: `queue()` projects the SAME live
// `ApplicationStore` the rest of this suite already reads as ground truth,
// and `record()` really calls `store.recordEvaluation()` (the store's own
// validated mutator — see application-store.ts), so a "successful" decision
// here is a genuine store mutation, not a rubber stamp.
function toDecision(rec: EvaluationRecord): EvaluationDecision {
  return {
    id: rec.id,
    stage: rec.stage,
    result: rec.result,
    remarks: rec.remarks,
    evaluatedAt: rec.evaluatedAt,
  };
}

describe('Evaluations — record view is genuinely store-sourced (not the old Applications-page mock)', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<Evaluations>>;
  let component: any;
  let store: ApplicationStore;

  const fakeEvaluationsApi: Pick<StaffEvaluationsApi, 'queue' | 'record'> = {
    async queue(): Promise<EvaluationQueueResult> {
      const rows = store.applications().map((app: ApplicationRecord) => {
        const requiredCount = app.permitType
          ? requirementsFor(app.permitType).documents.filter((d) => d.required).length
          : 0;
        return {
          applicationId: app.id,
          referenceNumber: app.referenceNumber ?? app.id,
          permitType: app.permitType ?? '',
          lifecycleStatus: app.lifecycleStatus,
          applicantName: app.applicant,
          businessId: app.businessId || null,
          businessName: app.businessName || null,
          submittedAt: app.dateSubmitted || null,
          evaluations: store.getEvaluations(app.id).map(toDecision),
          // Mirrors the real server field: only an application still
          // genuinely `Under Evaluation` has a next stage waiting on a
          // decision — everything else (Approved, Rejected, Revision
          // Required, Assessed, …) has nothing pending.
          nextStage: app.lifecycleStatus === 'Under Evaluation' ? app.evaluationStage : null,
          requiredDocumentCount: requiredCount,
          attachedDocumentCount: store.getDocuments(app.id).length,
        };
      });
      return { kind: 'ok', rows };
    },
    async record(applicationId, decision): Promise<EvaluationWriteResult> {
      const ok = store.recordEvaluation(
        applicationId,
        decision.stage,
        decision.result,
        'Test Evaluator',
        decision.remarks,
      );
      return ok
        ? { kind: 'done', evaluationId: `TEST-${applicationId}`, evaluationsComplete: false }
        : { kind: 'refused', message: 'The server refused this decision.' };
    },
  };

  // `StaffApplicationsApi.detail()` backs the record view's real Documents
  // checklist fetch (`recordRealDocuments` in evaluations.ts) — faked the
  // same way `applications.spec.ts` fakes it. Defaults to 'unavailable' for
  // every application id, matching what the real backend genuinely sends
  // for a locally-generated seed id it has never heard of, so every
  // existing seed-data test below keeps exercising the
  // `store.getDocuments()` fallback path completely unchanged unless a test
  // explicitly configures a real result for one id.
  const fakeDetailResults = new Map<string, ApplicationDetailResult>();
  const fakeApplicationsApi: Pick<StaffApplicationsApi, 'detail'> = {
    async detail(applicationId: string): Promise<ApplicationDetailResult> {
      return fakeDetailResults.get(applicationId) ?? { kind: 'unavailable' };
    },
  };

  beforeEach(async () => {
    fakeDetailResults.clear();
    TestBed.configureTestingModule({
      imports: [Evaluations],
      providers: [
        provideRouter([]),
        { provide: StaffEvaluationsApi, useValue: fakeEvaluationsApi },
        { provide: StaffApplicationsApi, useValue: fakeApplicationsApi },
      ],
    });
    fixture = TestBed.createComponent(Evaluations);
    component = fixture.componentInstance;
    store = TestBed.inject(ApplicationStore);
    fixture.detectChanges();
    // `ngOnInit`'s queue load is asynchronous even against the fake above
    // (it's still a real `await`) — `whenStable` lets that settle (and the
    // effects it can unblock flush) before any test sets `applicationId`,
    // so every `it()` below starts from a fully loaded queue instead of
    // racing it.
    await fixture.whenStable();
    fixture.detectChanges();
  });

  function findUnderEvaluationApp() {
    const app = store.applications().find((a) => a.lifecycleStatus === 'Under Evaluation');
    if (!app) throw new Error('Seed data is expected to include an Under Evaluation application');
    return app;
  }

  /**
   * An 'Under Evaluation' seed application (same proven-safe bucket
   * `findUnderEvaluationApp()` uses — its `nextStage` is always set, so
   * `findRecordCardAndRow` always resolves it to a real card) whose own
   * permit type carries at least `min` required documents — so a "this one
   * required doc was uploaded, this other one genuinely wasn't" test isn't
   * gambling on which permit type `findUnderEvaluationApp()`'s single
   * `.find()` happens to land on first.
   */
  function findAppWithAtLeastRequiredDocs(min: number) {
    for (const app of store.applications()) {
      if (app.lifecycleStatus !== 'Under Evaluation' || !app.permitType) continue;
      const required = requirementsFor(app.permitType).documents.filter((d) => d.required);
      if (required.length >= min) return { app, required };
    }
    throw new Error(
      `Seed data is expected to include an Under Evaluation application whose permit type has at least ${min} required documents`,
    );
  }

  it('the `?applicationId=` query param opens the record view for the real application, without going through a stage card first', () => {
    const app = findUnderEvaluationApp();
    fixture.componentRef.setInput('applicationId', app.id);
    fixture.detectChanges();

    expect(component.view()).toBe('record');
    expect(component.selectedRow()?.id).toBe(app.id);
    expect(component.selectedCard()).toBeTruthy();
  });

  it('recordDocumentRows() matches the real requirements-catalog checklist for the application\'s permit type', () => {
    const app = findUnderEvaluationApp();
    fixture.componentRef.setInput('applicationId', app.id);
    fixture.detectChanges();

    const expectedDocs = requirementsFor(app.permitType).documents;
    const rows = component.recordDocumentRows();
    expect(rows.length).toBe(expectedDocs.length);
    expect(rows.map((r: { requirementId: string }) => r.requirementId).sort()).toEqual(
      expectedDocs.map((d) => d.id).sort(),
    );
  });

  it('recordEvaluationSteps() has exactly 5 real stages, with the application\'s real current stage marked current', () => {
    const app = findUnderEvaluationApp();
    fixture.componentRef.setInput('applicationId', app.id);
    fixture.detectChanges();

    const steps = component.recordEvaluationSteps();
    expect(steps.length).toBe(5);
    const current = steps.find((s: { isCurrent: boolean }) => s.isCurrent);
    expect(current?.stage).toBe(app.evaluationStage);
  });

  it('advanceStage() reached via the `?applicationId=` entry path really advances the application through ApplicationStore', () => {
    const app = findUnderEvaluationApp();
    const startingStage = app.evaluationStage;
    fixture.componentRef.setInput('applicationId', app.id);
    fixture.detectChanges();

    const row = component.selectedRow();
    component.advanceStage(row);
    fixture.detectChanges();

    expect(component.actionError()).toBeNull();
    const updated = store.getById(app.id)!;
    // Either the application moved to the next real evaluation stage, or
    // (if it was already at Final Approval) on to fee assessment — either
    // way it must have genuinely moved, not just flipped a local mock flag.
    expect(
      updated.evaluationStage !== startingStage || updated.lifecycleStatus !== 'Under Evaluation',
    ).toBe(true);
  });

  it('returnForRevision() reached via the record view requires remarks and really moves the application in ApplicationStore', () => {
    const app = findUnderEvaluationApp();
    fixture.componentRef.setInput('applicationId', app.id);
    fixture.detectChanges();

    const row = component.selectedRow();
    component.returnForRevision(row);
    expect(store.getById(app.id)!.lifecycleStatus).toBe('Under Evaluation');

    component.revisionRemarks.set('Missing signature on plans');
    component.returnForRevision(row);

    expect(component.actionError()).toBeNull();
    expect(store.getById(app.id)!.lifecycleStatus).toBe('Revision Required');
  });

  it('recordAuditTrail() reflects a real audit event after a real mutation, not a hardcoded timeline', () => {
    const app = findUnderEvaluationApp();
    fixture.componentRef.setInput('applicationId', app.id);
    fixture.detectChanges();

    const before = component.recordAuditTrail().length;
    component.returnForRevision(component.selectedRow());
    component.revisionRemarks.set('Missing signature on plans');
    component.returnForRevision(component.selectedRow());
    fixture.detectChanges();

    const after = component.recordAuditTrail();
    expect(after.length).toBeGreaterThan(before);
    expect(after.every((e: { applicationId: string | null }) => e.applicationId === app.id)).toBe(
      true,
    );
  });

  // ---- Documents checklist: real per-application data, not the seed-only
  // ApplicationStore ---------------------------------------------------------
  // `ApplicationStore.replaceApplications()` always wipes `_documents` to
  // `[]` on a real queue load (seed-only, same as `_businesses`/
  // `_applicants`/`_auditEvents`) — so on a real application,
  // `store.getDocuments()` can never return anything, and every requirement
  // used to render as "Missing" regardless of what was actually uploaded and
  // scan-cleared through the real backend. `recordDocumentRows()` now
  // prefers `StaffApplicationsApi.detail()`'s real `documents[]` (matched by
  // `requirementCode`) the moment that fetch resolves 'ok', mirroring
  // applications.ts's own `documentRows`/`realDetail` split.

  /** Builds a minimal 'ok' `ApplicationDetailResult` carrying just the given real documents. */
  function realDetailWith(documents: readonly ApplicationDocumentRow[]): ApplicationDetailResult {
    return {
      kind: 'ok',
      detail: {
        payments: [],
        orderOfPayment: null,
        applicantEmail: 'citizen@example.com',
        applicantMobile: null,
        applicantAddress: { street: null, barangay: null, city: null, province: null, postalCode: null },
        business: null,
        permit: null,
        timeline: [],
        documents,
      },
    };
  }

  it("recordDocumentRows() shows a real, genuinely citizen-uploaded, scan-cleared document as NOT missing, joined by label — the real wire shape has requirementCode: null, by the wizard's own deliberate design (application-wizard.page.ts's uploadReal(), which never sends the Admin Portal's requirement id — two incompatible id schemes with no shared source of truth), so requirementCode can never be the join key for a real citizen upload", async () => {
    const app = findUnderEvaluationApp();
    const requirements = requirementsFor(app.permitType).documents;
    expect(requirements.length).toBeGreaterThan(0);
    const uploadedReq = requirements[0];

    fakeDetailResults.set(
      app.id,
      realDetailWith([
        {
          id: 'REAL-DOC-1',
          label: uploadedReq.label, // byte-identical to the requirement's own label — confirmed live
          fileName: 'valid-government-id.pdf',
          contentType: 'application/pdf',
          byteSize: 123_456,
          status: 'Approved', // the malware scanner's verdict — NOT what this screen should show
          scanCleared: true,
          requirementCode: null, // the real wire shape for every citizen upload — see uploadReal()'s own comment
          reviewStatus: 'Accepted', // the staff verdict — what this screen SHOULD show
          reviewRemark: null,
          expiresOn: null,
          certifiedOn: null,
          uploadedAt: '2026-09-01T10:00:00.000Z',
          reviewedAt: '2026-09-02T08:00:00.000Z',
        },
      ]),
    );

    fixture.componentRef.setInput('applicationId', app.id);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const row = component
      .recordDocumentRows()
      .find((r: { requirementId: string }) => r.requirementId === uploadedReq.id);
    expect(row.doc).not.toBeNull();
    expect(row.doc.fileName).toBe('valid-government-id.pdf');
    expect(row.doc.uploadedAt).toBe('2026-09-01T10:00:00.000Z');
    // The staff verdict, not the malware scanner's 'Approved'.
    expect(row.doc.status).toBe('Accepted');
  });

  it('recordDocumentRows() still matches by requirementCode when a real document genuinely carries one (a staff-attached document via StaffApplicationsApi.attachDocument, which DOES send a real matching requirementCode) — the label join is an addition, not a replacement, for that path', async () => {
    const app = findUnderEvaluationApp();
    const requirements = requirementsFor(app.permitType).documents;
    const targetReq = requirements[0];

    fakeDetailResults.set(
      app.id,
      realDetailWith([
        {
          id: 'REAL-DOC-2',
          label: 'A staff-entered label that does not match the catalog wording',
          fileName: 'staff-attached.pdf',
          contentType: 'application/pdf',
          byteSize: 999,
          status: 'Approved',
          scanCleared: true,
          requirementCode: targetReq.id, // a real, correctly-attributed staff attachment
          reviewStatus: 'Accepted',
          reviewRemark: null,
          expiresOn: null,
          certifiedOn: null,
          uploadedAt: '2026-09-03T10:00:00.000Z',
          reviewedAt: '2026-09-03T11:00:00.000Z',
        },
      ]),
    );

    fixture.componentRef.setInput('applicationId', app.id);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const row = component
      .recordDocumentRows()
      .find((r: { requirementId: string }) => r.requirementId === targetReq.id);
    expect(row.doc).not.toBeNull();
    expect(row.doc.fileName).toBe('staff-attached.pdf');
  });

  it("recordDocumentRows() still correctly shows a real application's genuinely missing required document as \"Missing\", even once another requirement's real upload has loaded", async () => {
    const { app, required: requiredReqs } = findAppWithAtLeastRequiredDocs(2);
    const [uploadedReq, ...stillMissingReqs] = requiredReqs;
    fakeDetailResults.set(
      app.id,
      realDetailWith([
        {
          id: 'REAL-DOC-1',
          label: uploadedReq.label, // the real citizen-upload join key
          fileName: 'uploaded.pdf',
          contentType: 'application/pdf',
          byteSize: 1,
          status: 'Approved',
          scanCleared: true,
          requirementCode: null, // real citizen uploads never send this — see the label-matching test above
          reviewStatus: null, // uploaded, not yet reviewed by staff
          reviewRemark: null,
          expiresOn: null,
          certifiedOn: null,
          uploadedAt: '2026-09-01T10:00:00.000Z',
          reviewedAt: null,
        },
      ]),
    );

    fixture.componentRef.setInput('applicationId', app.id);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows = component.recordDocumentRows();
    const uploadedRow = rows.find((r: { requirementId: string }) => r.requirementId === uploadedReq.id);
    expect(uploadedRow.doc).not.toBeNull();
    // No staff verdict recorded yet — falls back to 'Uploaded', never 'Missing'.
    expect(uploadedRow.doc.status).toBe('Uploaded');

    for (const req of stillMissingReqs) {
      const missingRow = rows.find((r: { requirementId: string }) => r.requirementId === req.id);
      expect(missingRow.doc).toBeNull();
    }
    expect(component.recordMissingRequiredCount()).toBe(stillMissingReqs.length);
  });

  it("recordDocumentRows() keeps reading the seed-only ApplicationStore unchanged when StaffApplicationsApi.detail() has no real answer for this application (the default in every test above that never configures fakeDetailResults)", () => {
    const app = findUnderEvaluationApp();
    fixture.componentRef.setInput('applicationId', app.id);
    fixture.detectChanges();

    const expectedDocs = requirementsFor(app.permitType).documents;
    const rows = component.recordDocumentRows();
    const stored = store.getDocuments(app.id);
    const byRequirement = new Map(stored.map((d) => [d.requirementId, d]));
    for (const req of expectedDocs) {
      const row = rows.find((r: { requirementId: string }) => r.requirementId === req.id);
      const seedDoc = byRequirement.get(req.id) ?? null;
      expect(row.doc?.fileName ?? null).toBe(seedDoc?.fileName ?? null);
    }
  });

  // ---- Advance Stage: the record view must target the application's REAL
  // current stage, not whichever stage it was originally opened under ------

  it('advanceStage() from the record view targets the NEW current stage on a second click, instead of resubmitting the stage the record view was originally opened under (regression: a stale selectedCard/selectedRow used to make every subsequent click resubmit the FIRST stage, which a real server correctly refuses with a 409 "already been decided")', async () => {
    const app = findUnderEvaluationApp();
    fixture.componentRef.setInput('applicationId', app.id);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const stage1 = app.evaluationStage!;
    const stage1Idx = EVALUATION_STAGE_ORDER.indexOf(stage1);
    // Needs real room ahead of it to prove click 2 lands on a genuinely
    // DIFFERENT stage than click 1 — every seed 'Under Evaluation'
    // application starts at 'Zoning' (one stage already Passed at seed
    // time), which always satisfies this.
    expect(stage1Idx).toBeLessThan(EVALUATION_STAGE_ORDER.length - 2);
    const stage2 = EVALUATION_STAGE_ORDER[stage1Idx + 1];
    const decidedBefore = store.getEvaluations(app.id).length;

    // Click 1 — correctly passes stage1.
    await component.advanceStage(component.selectedRow());
    fixture.detectChanges();
    expect(component.actionError()).toBeNull();
    expect(store.getById(app.id)!.evaluationStage).toBe(stage2);

    // Click 2 — reads `selectedRow()` fresh, exactly like the template's
    // `(click)="advanceStage(row)"` does off `selectedRow(); as row`. Under
    // the bug, `selectedCard`/`selectedRow` never moved past stage1, so
    // this resubmitted stage1 again instead of stage2.
    await component.advanceStage(component.selectedRow());
    fixture.detectChanges();

    expect(component.actionError()).toBeNull();
    const decidedStages = store
      .getEvaluations(app.id)
      .slice(decidedBefore)
      .map((e: EvaluationRecord) => e.stage);
    expect(decidedStages).toEqual([stage1, stage2]);
    // Genuinely moved two stages forward — under the bug this stalled at
    // stage2 (a duplicate stage1 decision doesn't advance anything further).
    expect(store.getById(app.id)!.evaluationStage).toBe(EVALUATION_STAGE_ORDER[stage1Idx + 2]);
  });

  it('advanceStage() re-syncs selectedCard to the new stage too, so the record view\'s own header/labels never keep describing the stage that was just passed', async () => {
    const app = findUnderEvaluationApp();
    fixture.componentRef.setInput('applicationId', app.id);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const stage1 = app.evaluationStage!;
    const stage1Idx = EVALUATION_STAGE_ORDER.indexOf(stage1);
    const stage2 = EVALUATION_STAGE_ORDER[stage1Idx + 1];

    await component.advanceStage(component.selectedRow());
    fixture.detectChanges();

    expect(component.actionError()).toBeNull();
    expect(component.selectedCard()?.key).not.toBe('zoning'); // no longer parked on the passed stage's own card
    const stageKeyForStage2 = (Object.entries({
      initial: 'Initial',
      zoning: 'Zoning',
      fire: 'Fire Safety',
      obo: 'OBO',
      final: 'Final Approval',
    }).find(([, v]) => v === stage2) ?? [])[0];
    expect(component.selectedCard()?.key).toBe(stageKeyForStage2);
    expect(component.selectedRow()?.id).toBe(app.id);
  });
});
