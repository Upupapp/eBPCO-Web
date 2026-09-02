import { Injectable, computed, inject, signal } from '@angular/core';
import { ApplicationRecord, withProjectedFields } from './application.model';
import {
  ApplicationLifecycleStatus,
  EVALUATION_STAGE_ORDER,
  PaymentStatus,
  canTransition,
  coarseStatus,
} from './status.model';
import { buildSeed } from './application-seed';
import { Applicant, ContactVerification, VerificationMethod } from './applicant.model';
import { Business } from './business.model';
import { GeneratedPermit, PermitReleaseRecord, PermitType, ReleaseMethod } from './permit.model';
import {
  ApplicationDocument,
  DocumentHistoryEntry,
  DocumentStatus,
  UNRESOLVED_DOCUMENT_STATUSES,
} from './document.model';
import { EvaluationRecord } from './evaluation.model';
import { AuditEvent } from './audit.model';
import { AppNotification } from './notification.model';

function addMonths(date: Date, months: number): Date {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}
import { requirementsFor } from './requirements-catalog';
import { departmentName } from './department.model';
import { PaymentConfigStore } from './payment-config-store';
import { AssessmentStore } from './assessment-store';
import { CollectingAgency } from './payment.model';

/**
 * Single in-memory source of truth for applications and every record
 * linked to one (business, applicant, documents, evaluations, payments,
 * permits, releases, audit trail, notifications) — shared by every page
 * that lists, opens, or acts on an application. A mutation made through
 * any one of them is immediately visible everywhere else that reads the
 * same application ID, since they all read the same underlying signals
 * instead of each owning an independent copy.
 *
 * This is still a frontend-only mock: state lives for the browser session
 * and resets on reload. There is no persistence layer to swap in yet —
 * the method signatures below are written so a future HTTP-backed
 * implementation could satisfy the same call sites.
 */
@Injectable({ providedIn: 'root' })
export class ApplicationStore {
  private readonly paymentConfig = inject(PaymentConfigStore);
  private readonly assessmentStore = inject(AssessmentStore);
  private readonly seed = buildSeed();

  private readonly _applications = signal<ApplicationRecord[]>(this.seed.applications);
  private readonly _businesses = signal<Business[]>(this.seed.businesses);
  private readonly _applicants = signal<Applicant[]>(this.seed.applicants);
  private readonly _documents = signal<ApplicationDocument[]>(this.seed.documents);
  private readonly _evaluations = signal<EvaluationRecord[]>(this.seed.evaluations);
  private readonly _permits = signal<GeneratedPermit[]>(this.seed.permits);
  private readonly _releases = signal<PermitReleaseRecord[]>(this.seed.releases);
  private readonly _auditEvents = signal<AuditEvent[]>(this.seed.auditEvents);
  private readonly _notifications = signal<AppNotification[]>(this.seed.notifications);

  constructor() {
    // The seed builds applications/documents/evaluations/permits/releases
    // as plain data (see application-seed.ts), but every assessment and
    // payment transaction is produced by DRIVING AssessmentStore's own
    // real methods (draft -> submit -> approve -> issue -> pay -> verify)
    // rather than hand-constructing Assessment/PaymentTransaction rows —
    // seed data can therefore never violate an invariant the live UI
    // itself enforces (duplicate references, overpayment, unresolved
    // lines blocking issuance, etc.).
    for (const app of this.seed.applications) {
      this.seedAssessmentFor(app);
    }
    this.assessmentStore.refreshOverdueStatuses();
    for (const app of this.seed.applications) {
      this.syncPaymentProjection(app.id, app.officer, 'Evaluator');
    }
  }

  readonly applications = this._applications.asReadonly();
  readonly businesses = this._businesses.asReadonly();
  readonly applicants = this._applicants.asReadonly();
  readonly notifications = this._notifications.asReadonly();
  readonly auditEvents = this._auditEvents.asReadonly();
  /** Every evaluation record across every application — used for stage-wide aggregates (e.g. the Dashboard's per-stage breakdown) rather than looping `getEvaluations()` per application. */
  readonly evaluations = this._evaluations.asReadonly();

  // ---- Single-record lookups ------------------------------------------------

  /**
   * Replaces the in-memory applications with what the server holds.
   *
   * The seed stays as the starting value rather than being deleted, and that is
   * deliberate: the other stores here (assessments, payments) are driven FROM
   * the seeded applications at construction, so emptying this one at boot would
   * leave them describing applications that no longer exist. The server's rows
   * replace the list once they arrive.
   *
   * It does not merge. A merge would leave an application on screen that the
   * server has archived — the queue's whole job is to show what is live, and a
   * row that survives because it was once seeded is the opposite of that.
   */
  /**
   * The server's answer replaces local state — the seed included.
   *
   * Owner ruling, 29 Aug 2026. Swapping only `_applications` left every child
   * collection seeded, so real applications rendered beside fabricated
   * documents, evaluations, businesses and payments with nothing on screen
   * telling an officer which was which. The queue row carries no `businessId`
   * or `applicantId` either, so those joins could not have resolved anyway.
   *
   * Empty sections are the honest answer until the detail endpoints exist:
   * "nothing recorded" is a smaller claim than a fabricated document list, and
   * it is the same rule ADR 0001 set for the applications themselves.
   *
   * Passing an empty array is how a FAILED load clears the screen.
   */
  replaceApplications(rows: readonly ApplicationRecord[]): void {
    // The server has answered. Even an empty answer is an answer, and is not
    // the seed.
    this._dataSource.set('server');
    this._loadFailure.set(null);
    this._applications.set([...rows]);
    this._businesses.set([]);
    this._applicants.set([]);
    this._documents.set([]);
    this._evaluations.set([]);
    this._permits.set([]);
    this._releases.set([]);
    this._auditEvents.set([]);
    this._notifications.set([]);
    // Assessments and payments live in their own store, and the payments page
    // lists them globally rather than per application.
    this.assessmentStore.clear();
  }

  /**
   * Whether these rows came from the server, or are the seed.
   *
   * ── Why this has to exist ───────────────────────────────────────────────
   *
   * The store starts holding 50 generated applications — reasonable as a
   * fallback, and a genuine hazard without a way to ask. Only Applications
   * called the server, and login lands on Dashboard, so on every sign-in an
   * officer met a backlog, stage counts, an overdue panel and a business
   * breakdown that were all invented, with nothing saying so (S-1).
   *
   * The queue-load notice could not help: it reports a load that FAILED, and
   * here no load had been attempted. "Not asked" and "asked and refused" are
   * different states and the portal could only express one of them.
   */
  private readonly _dataSource = signal<'seed' | 'server'>('seed');
  /** 'seed' until the server has answered, successfully or not. */
  readonly dataSource = this._dataSource.asReadonly();
  /** True while any page would be showing generated applications as real. */
  readonly isSeedData = computed(() => this._dataSource() === 'seed');

  private readonly _loadFailure = signal<string | null>(null);

  /**
   * Why the queue could not be read, or `null`.
   *
   * It lives here rather than on the page that fetches, because **five pages
   * read `applications()` and only one of them fetches**. A failed load empties
   * this store, and Dashboard, Evaluations, Permit Release and Businesses then
   * showed confident zeros — "nothing is ready for release", "no applications
   * under review" — with nothing on screen saying the portal had simply failed
   * to ask. The Applications page knew; the rest could not.
   *
   * Cleared by any successful `replaceApplications`, including an empty one:
   * a load that genuinely returns no rows is not a failure.
   */
  readonly loadFailure = this._loadFailure.asReadonly();

  /** Records that the queue could not be read. The rows are cleared separately, by `replaceApplications([])`. */
  recordLoadFailure(message: string): void {
    this._loadFailure.set(message);
  }

  getById(id: string): ApplicationRecord | undefined {
    return this._applications().find((row) => row.id === id);
  }

  getBusiness(businessId: string): Business | undefined {
    return this._businesses().find((b) => b.id === businessId);
  }

  getApplicant(applicantId: string): Applicant | undefined {
    return this._applicants().find((a) => a.id === applicantId);
  }

  /**
   * The one place "which applicant, and which BUSINESS, does this
   * application belong to" is resolved — every table/detail/export/
   * notification that needs that context should call this instead of
   * re-deriving its own join. `businessId` is the canonical relationship;
   * it is never derived from the applicant's name (one applicant can own
   * multiple businesses — see the seed's Raul Villanueva/Grace Fajota
   * multi-business owners). `businessLabel` resolves in this order: the
   * real linked `Business.name` -> the application's own denormalized
   * `businessName` (a legacy display fallback for a stale/unresolvable
   * businessId) -> the literal string 'Not provided'. It never falls
   * back to the applicant's name.
   */
  getApplicationContext(applicationId: string):
    | {
        applicationId: string;
        applicant: string;
        applicantId: string;
        businessId: string;
        business: Business | undefined;
        businessLabel: string;
        permitType: PermitType | null;
      }
    | undefined {
    const app = this.getById(applicationId);
    if (!app) return undefined;
    const business = this.getBusiness(app.businessId);
    const businessLabel = business?.name || app.businessName || 'Not provided';
    return {
      applicationId: app.id,
      applicant: app.applicant,
      applicantId: app.applicantId,
      businessId: app.businessId,
      business,
      businessLabel,
      permitType: app.permitType,
    };
  }

  getDocuments(applicationId: string): ApplicationDocument[] {
    return this._documents().filter((d) => d.applicationId === applicationId);
  }

  getEvaluations(applicationId: string): EvaluationRecord[] {
    return this._evaluations().filter((e) => e.applicationId === applicationId);
  }

  /** Every assessment version ever drafted for this application, oldest first — see AssessmentStore for the versioning rules (issuing/revising). */
  getAssessments(applicationId: string) {
    return this.assessmentStore.getAssessments(applicationId);
  }

  /** The one assessment version that's still "live" (not superseded/voided), or undefined if none has been drafted yet. */
  getActiveAssessment(applicationId: string) {
    return this.assessmentStore.getActiveAssessment(applicationId);
  }

  /** Every payment transaction ever recorded against this application, across every assessment version. */
  getTransactions(applicationId: string) {
    return this.assessmentStore.getTransactionsForApplication(applicationId);
  }

  getPermit(applicationId: string): GeneratedPermit | undefined {
    return this._permits().find((p) => p.applicationId === applicationId);
  }

  getRelease(applicationId: string): PermitReleaseRecord | undefined {
    return this._releases().find((r) => r.applicationId === applicationId);
  }

  /**
   * Merges this store's own audit events with AssessmentStore's (every
   * draft/submit/approve/issue/pay/verify/reject/void/reversal/refund
   * action writes there, not here — see AssessmentStore.audit) into one
   * chronological timeline, so "a complete audit timeline" holds for an
   * application regardless of which store actually recorded a given
   * event. AssessmentStore has no dependency back on this class (avoiding
   * a circular injection), so merging happens here instead.
   */
  getAuditTrail(applicationId: string): AuditEvent[] {
    return [...this._auditEvents(), ...this.assessmentStore.auditEvents()]
      .filter((e) => e.applicationId === applicationId)
      .sort((a, b) => a.timestampValue.getTime() - b.timestampValue.getTime());
  }

  // ---- Aggregate selectors ----------------------------------------------------
  // Every KPI/percentage/badge count across the app should read one of
  // these (or compose from `applications()` directly) rather than a
  // hardcoded literal, so totals always equal their visible breakdowns.

  readonly totalApplications = computed(() => this._applications().length);

  countByLifecycle(status: ApplicationLifecycleStatus): number {
    return this._applications().filter((a) => a.lifecycleStatus === status).length;
  }

  countByLifecycleIn(statuses: ApplicationLifecycleStatus[]): number {
    const set = new Set(statuses);
    return this._applications().filter((a) => set.has(a.lifecycleStatus)).length;
  }

  // Same predicates as the totals above, narrowed to `dateValue` inside a
  // real day-range window — actual submission dates, not a fabricated
  // delta — so a KPI card can show a genuine period-over-period trend.
  // `startDaysAgo`/`endDaysAgo` bound a window (e.g. 0–30 = "the last 30
  // days", 30–60 = "the 30 days before that").
  private countInWindow(
    matches: (a: ApplicationRecord) => boolean,
    startDaysAgo: number,
    endDaysAgo: number,
  ): number {
    const now = Date.now();
    const from = now - endDaysAgo * 24 * 60 * 60 * 1000;
    const to = now - startDaysAgo * 24 * 60 * 60 * 1000;
    return this._applications().filter(
      (a) => matches(a) && a.dateValue.getTime() >= from && a.dateValue.getTime() < to,
    ).length;
  }

  /** The last 30 days vs. the 30 days before that, for a given predicate — the raw counts a card needs to compute its own real month-over-month percentage (or recognize it has no real baseline to compare against). */
  private monthOverMonth(matches: (a: ApplicationRecord) => boolean): {
    recent: number;
    previous: number;
  } {
    return {
      recent: this.countInWindow(matches, 0, 30),
      previous: this.countInWindow(matches, 30, 60),
    };
  }

  private static readonly PENDING_STATUSES: ApplicationLifecycleStatus[] = [
    'Submitted',
    'Received',
    'Document Verification',
    'Under Evaluation',
  ];
  private static readonly APPROVED_STATUSES: ApplicationLifecycleStatus[] = [
    'Approved',
    'Permit Generated',
    'Ready for Release',
    'Released',
    'Completed',
  ];

  readonly pendingUnderReview = computed(() =>
    this.countByLifecycleIn(ApplicationStore.PENDING_STATUSES),
  );
  readonly revisionRequired = computed(() => this.countByLifecycle('Revision Required'));
  readonly paymentsAwaitingVerification = computed(() =>
    this.countByLifecycle('Payment Under Verification'),
  );
  readonly approvedTotal = computed(() =>
    this.countByLifecycleIn(ApplicationStore.APPROVED_STATUSES),
  );
  readonly readyForRelease = computed(() => this.countByLifecycle('Ready for Release'));

  readonly totalApplicationsMonthly = computed(() => this.monthOverMonth(() => true));
  readonly pendingUnderReviewMonthly = computed(() =>
    this.monthOverMonth((a) => ApplicationStore.PENDING_STATUSES.includes(a.lifecycleStatus)),
  );
  readonly paymentsAwaitingVerificationMonthly = computed(() =>
    this.monthOverMonth((a) => a.lifecycleStatus === 'Payment Under Verification'),
  );
  readonly approvedMonthly = computed(() =>
    this.monthOverMonth((a) => ApplicationStore.APPROVED_STATUSES.includes(a.lifecycleStatus)),
  );
  readonly readyForReleaseMonthly = computed(() =>
    this.monthOverMonth((a) => a.lifecycleStatus === 'Ready for Release'),
  );

  private appAudit(
    actor: string,
    role: string,
    applicationId: string | null,
    action: string,
    remarks: string | null = null,
  ): void {
    const now = new Date();
    this._auditEvents.update((events) => [
      ...events,
      {
        id: `AUD-${applicationId ?? 'sys'}-${events.length + 1}`,
        applicationId,
        actor,
        role,
        action,
        timestampValue: now,
        timestamp: now.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        remarks,
      },
    ]);
  }

  // ---- Status transitions -----------------------------------------------------

  /**
   * Validates the transition against `VALID_TRANSITIONS` before applying
   * it — this is the one place status can change, so the Business Stages
   * board (or any other action) can never push an application through an
   * illegal jump. Revision/rejection require remarks. Returns false (no
   * mutation) on an invalid transition or missing required remarks.
   */
  transitionStatus(
    id: string,
    to: ApplicationLifecycleStatus,
    actor: string,
    role: string,
    remarks?: string,
  ): boolean {
    const row = this.getById(id);
    if (!row) return false;
    if (!canTransition(row.lifecycleStatus, to)) return false;
    if ((to === 'Revision Required' || to === 'Rejected') && !remarks?.trim()) return false;
    // "Prevent final approval while mandatory documents remain
    // unresolved" — checked here rather than only in the UI, so no
    // caller (Business Stages board drag, Applications' quick status
    // menu, a future API) can push an application to Approved around it.
    if (to === 'Approved' && !this.canApprove(id)) return false;

    this._applications.update((rows) =>
      rows.map((r) =>
        r.id === id
          ? withProjectedFields({
              ...r,
              lifecycleStatus: to,
              // permitReleaseStatus used to be a field only `releasePermit`
              // and the seed data ever wrote — reaching 'Ready for
              // Release' via a real generatePermit() call (or any future
              // caller) never updated it, so the Permit Release Queue
              // (filtered on `permitReleaseStatus !== 'Not Ready'`) could
              // never show a genuinely-processed application; only
              // seed-data rows (which hand-set both fields together)
              // ever appeared there. Deriving it here, in the one place
              // lifecycleStatus is validated and set, means it can never
              // drift out of sync again.
              ...(to === 'Ready for Release' ? { permitReleaseStatus: 'Ready for Release' as const } : {}),
            })
          : r,
      ),
    );
    this.appAudit(actor, role, id, `Status changed to ${to}`, remarks ?? null);
    return true;
  }

  /** @deprecated Coarse-status compatibility shim for not-yet-migrated call sites — prefer `transitionStatus`. */
  updateFields(id: string, patch: Partial<Omit<ApplicationRecord, 'id'>>): void {
    this._applications.update((rows) =>
      rows.map((row) => (row.id === id ? withProjectedFields({ ...row, ...patch }) : row)),
    );
  }

  /**
   * Records an application-level evaluation result. Revision/rejection
   * require remarks. Advances the application's own lifecycle status when
   * the result completes or blocks the current stage, so the evaluation
   * record and the application's own status can never disagree.
   */
  recordEvaluation(
    applicationId: string,
    stage: EvaluationRecord['stage'],
    result: EvaluationRecord['result'],
    evaluator: string,
    remarks?: string,
  ): boolean {
    const row = this.getById(applicationId);
    if (!row) return false;
    if ((result === 'Revision Required' || result === 'Rejected') && !remarks?.trim()) return false;
    // Check the underlying lifecycle transition would actually be legal
    // BEFORE appending anything — `transitionStatus` was already called
    // below for these two results, but its own boolean return was never
    // checked, so a caller (e.g. an application still 'Submitted', not
    // yet at Document Verification/Under Evaluation/For Approval) got an
    // EvaluationRecord written and `recordEvaluation` returning `true`
    // even though the application's lifecycleStatus never actually
    // moved — an audit trail entry describing something that didn't
    // happen. Refusing upfront means no such entry is ever written.
    if (
      (result === 'Revision Required' || result === 'Rejected') &&
      !canTransition(row.lifecycleStatus, result)
    ) {
      return false;
    }
    // Advancing a stage only makes sense while the application is
    // genuinely 'Under Evaluation' — refuse it once the application has
    // already been sent back for revision, rejected, or moved past
    // evaluation entirely (e.g. already Assessed). Without this, the
    // Evaluations page's "Advance Stage" menu item could force-pass a
    // row sitting in the "Returned" tab (a real Revision Required/
    // Rejected application — every row there is genuinely one of those,
    // it's not synthetic like the other tabs), silently advancing
    // evaluationStage/evaluationResult while lifecycleStatus stayed
    // Revision Required/Rejected — an internally inconsistent record
    // ("evaluation says Passed, lifecycle says Rejected") with no error
    // shown anywhere, reachable by one misclick next to "Return for
    // Revision" in the same menu.
    if (result === 'Passed' && row.lifecycleStatus !== 'Under Evaluation') return false;

    const now = new Date();
    const departmentId =
      requirementsFor(row.permitType).evaluationSequence.find((s) => s.stage === stage)
        ?.departmentId ?? 'obo';
    this._evaluations.update((rows) => [
      ...rows,
      {
        id: `EVAL-${applicationId}-${rows.length + 1}`,
        applicationId,
        stage,
        result,
        evaluator,
        departmentId,
        remarks: remarks ?? null,
        evaluatedAtValue: now,
        evaluatedAt: now.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      },
    ]);

    if (result === 'Revision Required') {
      this.transitionStatus(applicationId, 'Revision Required', evaluator, 'Evaluator', remarks);
    } else if (result === 'Rejected') {
      this.transitionStatus(applicationId, 'Rejected', evaluator, 'Evaluator', remarks);
    } else if (result === 'Passed') {
      if (stage === 'Final Approval') {
        // Reuse assessFee() rather than transitioning straight to
        // 'Assessed' — it also drafts the real fee assessment (and
        // auto-issues the Order of Payment when every line is already
        // resolvable), so passing Final Approval doesn't leave the
        // application in 'Assessed' with no assessment for Payments to
        // show. assessFee() itself only transitions when still 'Under
        // Evaluation', matching the row's real status at this point.
        this.assessFee(applicationId, evaluator, 'Evaluator');
      } else {
        // Passing a non-final stage advances the row's own evaluationStage
        // to the next stage in the sequence, so the Evaluations page's
        // per-stage cards and the Applications-detail "Evaluate" cards both
        // genuinely walk the application forward instead of leaving it
        // parked under whichever stage it started at. `evaluationResult`
        // resets to 'Pending' rather than carrying over 'Passed' — 'Passed'
        // described the stage that was JUST completed (already recorded as
        // its own EvaluationRecord above), not the new current stage, which
        // hasn't been evaluated yet. Leaving it as 'Passed' made a freshly
        // -advanced application look already resolved/approved for a stage
        // no one had reviewed — it should show as pending review instead.
        const stageIdx = EVALUATION_STAGE_ORDER.indexOf(stage);
        const nextStage = EVALUATION_STAGE_ORDER[stageIdx + 1] ?? stage;
        this._applications.update((rows) =>
          rows.map((r) =>
            r.id === applicationId
              ? withProjectedFields({ ...r, evaluationStage: nextStage, evaluationResult: 'Pending' })
              : r,
          ),
        );
      }
    }
    return true;
  }

  /**
   * A cashier/officer recording an onsite payment against the
   * application's currently ISSUED assessment, for the full outstanding
   * balance in one go. Per the "must attach to an existing assessed
   * application, never generate a new application ID" rule, this only
   * accepts an application whose active assessment has actually been
   * issued (an Order of Payment exists) — it appends a transaction, it
   * never creates an application or an assessment. For a genuine PARTIAL
   * payment or a specific peso amount/agency, use AssessmentStore's own
   * `recordOnsitePayment` directly (the Payments > Transactions tab does
   * this) — this wrapper exists only to keep the existing single-click
   * call sites (Payments' legacy "Record Payment" action) working
   * unchanged.
   */
  recordOnsitePayment(applicationId: string, referenceNumber: string, recordedBy: string): boolean {
    const assessment = this.assessmentStore.getActiveAssessment(applicationId);
    if (!assessment || assessment.balanceCentavos <= 0) return false;
    const txn = this.assessmentStore.recordOnsitePayment(
      assessment.id,
      assessment.balanceCentavos,
      referenceNumber,
      'OBO/LGU',
      recordedBy,
      'Cashier',
    );
    if (!txn) return false;
    this.syncPaymentProjection(applicationId, recordedBy, 'Cashier');
    return true;
  }

  /**
   * Verifies exactly the ONE transaction named by `transactionId` — never
   * every pending transaction for the application (that was the old
   * defect: verifying one payment used to mark every other pending
   * transaction as paid too). Every caller, including the legacy
   * single-payment flow, must know which transaction it's verifying.
   */
  verifyPayment(applicationId: string, transactionId: string, verifiedBy: string): boolean {
    const ok = this.assessmentStore.verifyTransaction(transactionId, verifiedBy, 'Payment Officer');
    if (!ok) return false;
    this.syncPaymentProjection(applicationId, verifiedBy, 'Payment Officer');
    return true;
  }

  /**
   * Builds the assessment/transaction chain for one seeded application by
   * driving AssessmentStore's real API to the state its already-assigned
   * `paymentStatus` implies — never hand-constructs an Assessment/
   * PaymentTransaction row, so seeded data can't violate an invariant the
   * live UI enforces (see the constructor's comment above).
   */
  private static readonly PAYMENT_ELIGIBLE_STATUSES: ReadonlySet<ApplicationLifecycleStatus> =
    new Set([
      'Assessed',
      'Payment Submitted',
      'Payment Under Verification',
      'Payment Verified',
      'For Approval',
      'Approved',
      'Permit Generated',
      'Ready for Release',
      'Released',
      'Completed',
      'Expired',
    ]);

  private seedAssessmentFor(app: ApplicationRecord): void {
    if (!ApplicationStore.PAYMENT_ELIGIBLE_STATUSES.has(app.lifecycleStatus)) return;
    // No permit type, no fee schedule to assess against.
    if (app.permitType === null) return;
    const draft = this.assessmentStore.draftAssessment(
      app.id,
      app.permitType,
      app.officer,
      'Evaluator',
    );
    if (!draft) return;
    // Resolve every line still awaiting assessor input with a modest,
    // clearly-a-placeholder sample amount so the seed can demonstrate a
    // full workflow — this is sample-package data (see the app-wide
    // SAMPLE DATA convention), never presented as a verified national
    // rate; each line keeps its own PENDING_LGU_VALIDATION status and
    // legal-basis citation regardless of this seeded number.
    for (const line of draft.lineItems) {
      if (line.amountCentavos === null) {
        const sample = 15000 + (line.feeRuleId.length % 7) * 5000;
        this.assessmentStore.setLineAmount(
          draft.id,
          line.feeRuleId,
          sample,
          app.officer,
          'Evaluator',
        );
      }
    }
    if (!this.assessmentStore.submitForApproval(draft.id, app.officer, 'Evaluator')) return;
    if (
      !this.assessmentStore.approveAssessment(draft.id, 'Engr. Ricardo Buenaflor', 'Administrator')
    )
      return;

    const overdue = app.paymentStatus === 'Overdue';
    if (
      !this.assessmentStore.issueOrderOfPayment(
        draft.id,
        'Engr. Ricardo Buenaflor',
        'Administrator',
        overdue ? -15 : 15,
      )
    ) {
      return;
    }
    // 'Not Yet Available' (still 'Assessed') or 'Overdue' (expired, never
    // paid) both stop here — issued, no transaction recorded.
    if (app.paymentStatus !== 'Pending Verification' && app.paymentStatus !== 'Paid') return;

    const issued = this.assessmentStore.getAssessmentById(draft.id);
    if (!issued) return;
    const txn = this.assessmentStore.recordOnsitePayment(
      draft.id,
      issued.balanceCentavos,
      `OR-2026-${app.id.slice(-6)}`,
      'OBO/LGU',
      app.officer,
      'Cashier',
    );
    if (!txn) return;
    if (app.paymentStatus === 'Paid') {
      this.assessmentStore.verifyTransaction(txn.id, 'Payment Officer', 'Payment Officer');
    }
    // 'Pending Verification' target: leave the transaction unverified.
  }

  /** Recomputes `paymentStatus`/`assessedAmountCentavos` from the application's active assessment, and advances `lifecycleStatus` one legal hop at a time through the Assessed -> ... -> For Approval sub-sequence when the payment state now supports it. The ONE place that sub-sequence is driven — every payment action (assess, pay, verify, reject, void) funnels through here afterward, so a caller can never leave the lifecycle status stale relative to the payment ledger. */
  private syncPaymentProjection(applicationId: string, actor: string, role: string): void {
    const row = this.getById(applicationId);
    if (!row) return;
    const assessment = this.assessmentStore.getActiveAssessment(applicationId);

    // ── Two screens must not give two answers for one fact ────────────────
    //
    // `paymentStatus` has two sources. The wire sets it from `paymentVerified`
    // on the queue row; this method recomputes it from the local assessment
    // store. They are only ever consistent when the assessment store is the
    // authority, and after a server load it is EMPTY — `replaceApplications`
    // calls `assessmentStore.clear()`.
    //
    // So without this guard: a server row that says the payment was verified
    // shows "Paid" in Applications, and the first Payments action touching it
    // recomputes from no assessment, gets 'Not Yet Available', and silently
    // overwrites it. A verified payment becomes an unpaid one because a local
    // store that was never told anything disagreed with the server.
    //
    // Raised by the citizen web portal lane on 2 Sep, who found the same
    // divergence on their side. This is the lane where a wrong answer about
    // payment has consequences: it gates permit release.
    if (assessment === undefined && this.dataSource() === 'server') return;
    const { paymentStatus, assessedAmountCentavos } = this.derivePaymentProjection(assessment);

    const paymentSubSequence: ApplicationLifecycleStatus[] = [
      'Assessed',
      'Payment Submitted',
      'Payment Under Verification',
      'Payment Verified',
      'For Approval',
    ];
    const idx = paymentSubSequence.indexOf(row.lifecycleStatus);
    let lifecycleStatus = row.lifecycleStatus;
    if (idx !== -1) {
      let targetIdx = idx;
      if (paymentStatus === 'Pending Verification' || paymentStatus === 'Partially Paid') {
        targetIdx = Math.max(idx, 2);
      } else if (paymentStatus === 'Paid') {
        targetIdx = Math.max(idx, 4);
      }
      lifecycleStatus = paymentSubSequence[Math.min(targetIdx, paymentSubSequence.length - 1)];
    }

    const changed =
      paymentStatus !== row.paymentStatus ||
      assessedAmountCentavos !== row.assessedAmountCentavos ||
      lifecycleStatus !== row.lifecycleStatus;
    if (!changed) return;

    this._applications.update((rows) =>
      rows.map((r) =>
        r.id === applicationId
          ? withProjectedFields({ ...r, paymentStatus, assessedAmountCentavos, lifecycleStatus })
          : r,
      ),
    );
    if (lifecycleStatus !== row.lifecycleStatus) {
      this.appAudit(actor, role, applicationId, `Status changed to ${lifecycleStatus}`);
    }
  }

  private derivePaymentProjection(assessment: ReturnType<AssessmentStore['getActiveAssessment']>): {
    paymentStatus: PaymentStatus;
    assessedAmountCentavos: number | null;
  } {
    if (!assessment || assessment.status === 'Draft' || assessment.status === 'For Approval') {
      return { paymentStatus: 'Not Yet Available', assessedAmountCentavos: null };
    }
    const assessedAmountCentavos = assessment.totalCentavos;
    if (assessment.status === 'Paid') return { paymentStatus: 'Paid', assessedAmountCentavos };
    if (assessment.status === 'Partially Paid')
      return { paymentStatus: 'Partially Paid', assessedAmountCentavos };
    if (assessment.status === 'Overdue')
      return { paymentStatus: 'Overdue', assessedAmountCentavos };
    const hasPending = this.assessmentStore
      .getTransactionsForAssessment(assessment.id)
      .some((t) => t.status === 'Pending Verification');
    return {
      paymentStatus: hasPending ? 'Pending Verification' : 'Not Yet Available',
      assessedAmountCentavos,
    };
  }

  /**
   * Called by the Payments UI after any transaction-level action it
   * performs directly against AssessmentStore (verify/reject/void/
   * reversal/refund, or a new manual payment) so the owning application's
   * projected fields and lifecycle status stay in sync without every
   * caller having to know the sync/derive rules above.
   */
  refreshPaymentProjection(applicationId: string, actor: string, role: string): void {
    this.syncPaymentProjection(applicationId, actor, role);
  }

  /**
   * Requires an approved application, a verified payment, and a generated
   * permit — and refuses a second release for the same application. On
   * success, records the release and marks the application Completed, per
   * the documented release flow.
   */
  releasePermit(
    applicationId: string,
    releasingOfficer: string,
    claimantName: string,
    releaseMethod: ReleaseMethod,
  ): boolean {
    const row = this.getById(applicationId);
    if (!row) return false;
    if (this.getRelease(applicationId)) return false; // duplicate release
    const permit = this.getPermit(applicationId);
    if (!permit) return false;
    if (!this.assessmentStore.canProcessPermit(applicationId)) return false;
    if (row.lifecycleStatus !== 'Ready for Release') return false;

    const now = new Date();
    this._releases.update((rows) => [
      ...rows,
      {
        applicationId,
        permitNumber: permit.permitNumber,
        releasingOfficer,
        claimantName,
        releaseMethod,
        releasedAtValue: now,
        releasedAt: now.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      },
    ]);
    this._applications.update((rows) =>
      rows.map((r) =>
        r.id === applicationId
          ? withProjectedFields({
              ...r,
              lifecycleStatus: 'Completed',
              permitReleaseStatus: 'Released',
            })
          : r,
      ),
    );
    this.appAudit(
      releasingOfficer,
      'Releasing Officer',
      applicationId,
      `Permit ${permit.permitNumber} released to ${claimantName}`,
    );
    return true;
  }

  /**
   * Replaces hard deletion. Submitted applications, verified payments,
   * permits, releases, and audit history are never removed from the
   * store — this moves the application to the terminal `Cancelled` status
   * instead, which is still visible everywhere (filterable, auditable)
   * rather than silently disappearing.
   */
  archive(ids: ReadonlySet<string>, actor: string, role: string, remarks?: string): void {
    this._applications.update((rows) =>
      rows.map((r) =>
        ids.has(r.id) && !['Rejected', 'Cancelled', 'Completed'].includes(r.lifecycleStatus)
          ? withProjectedFields({ ...r, lifecycleStatus: 'Cancelled' })
          : r,
      ),
    );
    ids.forEach((id) =>
      this.appAudit(actor, role, id, 'Application cancelled/archived', remarks ?? null),
    );
  }

  /** Moves an existing record to the front of the list without changing its date, so it surfaces at the top of "recent" slices. */
  bringToFront(id: string): void {
    this._applications.update((rows) => {
      const index = rows.findIndex((row) => row.id === id);
      if (index <= 0) return rows;
      const [row] = rows.splice(index, 1);
      return [row, ...rows];
    });
  }

  /**
   * Assisted/onsite filing — a staff member creating an application on an
   * applicant's behalf at the counter. Kept as a permission-gated
   * capability (see `PERMISSIONS.applications.create` in
   * `core/session/permissions.ts`) rather than the previous open
   * "Create Application" button every role could see; pages must check
   * that permission before showing the entry point to this method.
   */
  create(
    record: Omit<ApplicationRecord, 'id' | 'dateValue' | 'type' | 'status'> & { dateValue?: Date },
    actor: string,
    role: string,
  ): ApplicationRecord {
    const id = this.nextId();
    const dateValue = record.dateValue ?? new Date();
    const created = withProjectedFields({ ...record, id, dateValue });
    this._applications.update((rows) => [created, ...rows]);
    this.appAudit(actor, role, id, 'Application filed (assisted/onsite)');
    return created;
  }

  /** Records a freeform note against an application's audit timeline — used for the intake form's optional "Initial Remarks" field, and any other place a plain note (not a status change) needs to be on the record. */
  addNote(applicationId: string, actor: string, role: string, note: string): void {
    this.appAudit(actor, role, applicationId, 'Note added', note);
  }

  // ---- Applicant / business records for manual intake -------------------
  // Used by the "+ Application" walk-in intake form so an encoded
  // application links to a REAL Applicant/Business record (name, contact
  // details, barangay, etc.) rather than the old WALKIN-<id> placeholder
  // pair that carried no real information.

  addApplicant(applicant: Omit<Applicant, 'id'>): Applicant {
    const id = `APL-${String(this._applicants().length + 1).padStart(4, '0')}`;
    const created: Applicant = { ...applicant, id };
    this._applicants.update((rows) => [...rows, created]);
    return created;
  }

  addBusiness(business: Omit<Business, 'id' | 'dateRegisteredValue' | 'dateRegistered'>): Business {
    const id = `REG-2026-${String(this._businesses().length + 1).padStart(6, '0')}`;
    const now = new Date();
    const created: Business = {
      ...business,
      id,
      dateRegisteredValue: now,
      dateRegistered: now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };
    this._businesses.update((rows) => [...rows, created]);
    return created;
  }

  /** Manual/administrator confirmation of a contact detail (or marking it failed/pending) — the only verification paths this frontend-only mock can actually perform, since it can't deliver a real email link or SMS OTP. Never call this to silently default a fresh applicant to 'Verified'. */
  setContactVerification(
    applicantId: string,
    channel: 'email' | 'mobile',
    status: ContactVerification['status'],
    method: VerificationMethod | null,
    actor: string,
  ): boolean {
    const applicant = this.getApplicant(applicantId);
    if (!applicant) return false;
    const now = new Date();
    const verification: ContactVerification = {
      status,
      method,
      verifiedBy: status === 'Verified' ? actor : null,
      verifiedAtValue: status === 'Verified' ? now : null,
      verifiedAt:
        status === 'Verified'
          ? now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          : null,
    };
    this._applicants.update((rows) =>
      rows.map((a) =>
        a.id === applicantId
          ? {
              ...a,
              [channel === 'email' ? 'emailVerification' : 'mobileVerification']: verification,
            }
          : a,
      ),
    );
    this.appAudit(
      actor,
      'Administrator',
      null,
      `${channel === 'email' ? 'Email' : 'Mobile number'} for ${applicant.firstName} ${applicant.lastName} marked ${status}`,
    );
    return true;
  }

  // ---- Document lifecycle -------------------------------------------------

  getDocument(applicationId: string, requirementId: string): ApplicationDocument | undefined {
    return this._documents().find(
      (d) => d.applicationId === applicationId && d.requirementId === requirementId,
    );
  }

  /**
   * True only when every REQUIRED document for this application's permit
   * type (see requirements-catalog.ts) has reached the sole "resolved"
   * status, 'Accepted' — an optional document, or one that's merely
   * Uploaded/Submitted/Under Review, never blocks approval on its own,
   * but a Missing/Rejected/Revision Required/Expired required document
   * always does.
   */
  canApprove(applicationId: string): boolean {
    const row = this.getById(applicationId);
    if (!row) return false;
    const required = requirementsFor(row.permitType).documents.filter((d) => d.required);
    const docs = this.getDocuments(applicationId);
    return required.every((req) => {
      const match = docs.find((d) => d.requirementId === req.id);
      return !!match && !UNRESOLVED_DOCUMENT_STATUSES.has(match.status);
    });
  }

  /**
   * How many REQUIRED documents are missing or unresolved — or `null` when we
   * have no document data for this application at all.
   *
   * The Evaluations table used to fill this column with
   * `Math.abs(hash(id)) % 4` — a number between 0 and 3 derived from the
   * application's ID string, with no relationship to any document. It was
   * rendered to officers and written into the CSV export as "Missing
   * Documents", so it was actionable fiction: chase an applicant for papers
   * that are not missing, or fail to chase for ones that are.
   *
   * `null` rather than `0` when nothing is recorded, because "no required
   * document is outstanding" and "we hold no documents for this application"
   * are different claims and only one of them is safe to make. Since a server
   * load clears child collections (see `replaceApplications`), server rows are
   * exactly that second case until a detail endpoint exists.
   *
   * Same rule as `canApprove`: a required document that is absent, or present
   * but in an unresolved state, counts against the application.
   */
  missingRequiredDocuments(applicationId: string): number | null {
    const row = this.getById(applicationId);
    if (!row) return null;
    const docs = this.getDocuments(applicationId);
    if (docs.length === 0) return null;
    const required = requirementsFor(row.permitType).documents.filter((d) => d.required);
    return required.filter((req) => {
      const match = docs.find((d) => d.requirementId === req.id);
      return !match || UNRESOLVED_DOCUMENT_STATUSES.has(match.status);
    }).length;
  }

  /** Attaches a new document for a requirement that has none yet, or resubmits over an existing one (preserving its history) — the one entry point the intake form and the Documents tab's upload control both go through. */
  attachDocument(
    applicationId: string,
    requirementId: string,
    label: string,
    fileName: string,
    actor: string,
    meta: {
      issuingOffice?: string | null;
      issueDate?: string | null;
      expiryDate?: string | null;
    } = {},
  ): ApplicationDocument {
    const existing = this.getDocument(applicationId, requirementId);
    if (existing) {
      this.resubmitDocument(applicationId, existing.id, fileName, actor);
      return this.getDocument(applicationId, requirementId)!;
    }
    const now = new Date();
    const created: ApplicationDocument = {
      id: `DOC-${applicationId}-${this._documents().length + 1}`,
      applicationId,
      requirementId,
      label,
      fileName,
      uploadedAtValue: now,
      uploadedAt: now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      status: 'Submitted',
      issuingOffice: meta.issuingOffice ?? null,
      issueDateValue: meta.issueDate ? new Date(meta.issueDate) : null,
      issueDate: meta.issueDate ?? null,
      expiryDateValue: meta.expiryDate ? new Date(meta.expiryDate) : null,
      expiryDate: meta.expiryDate ?? null,
      remarks: null,
      history: [],
    };
    this._documents.update((rows) => [...rows, created]);
    this.appAudit(actor, 'Staff', applicationId, `Document attached: ${label}`);
    return created;
  }

  /** Required whenever `status` is 'Rejected' or 'Revision Required'. */
  setDocumentStatus(
    applicationId: string,
    documentId: string,
    status: DocumentStatus,
    actor: string,
    remarks?: string,
  ): boolean {
    const needsRemarks = status === 'Rejected' || status === 'Revision Required';
    if (needsRemarks && !remarks?.trim()) return false;
    const target = this._documents().find(
      (d) => d.id === documentId && d.applicationId === applicationId,
    );
    if (!target) return false;
    this._documents.update((rows) =>
      rows.map((d) =>
        d.id === documentId ? { ...d, status, remarks: remarks?.trim() || null } : d,
      ),
    );
    this.appAudit(
      actor,
      'Evaluator',
      applicationId,
      `Document "${target.label}" marked ${status}`,
      remarks ?? null,
    );
    return true;
  }

  /** Resubmits a rejected/revision-required document — appends the file/status it's replacing to `history` rather than discarding it, so resubmission never loses document history. */
  resubmitDocument(
    applicationId: string,
    documentId: string,
    fileName: string,
    actor: string,
  ): boolean {
    const now = new Date();
    const target = this._documents().find(
      (d) => d.id === documentId && d.applicationId === applicationId,
    );
    if (!target) return false;
    const historyEntry: DocumentHistoryEntry = {
      fileName: target.fileName,
      uploadedAtValue: target.uploadedAtValue,
      uploadedAt: target.uploadedAt,
      status: target.status,
      remarks: target.remarks,
    };
    this._documents.update((rows) =>
      rows.map((d) =>
        d.id === documentId
          ? {
              ...d,
              fileName,
              uploadedAtValue: now,
              uploadedAt: now.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              }),
              status: 'Submitted',
              remarks: null,
              history: [...d.history, historyEntry],
            }
          : d,
      ),
    );
    this.appAudit(actor, 'Applicant', applicationId, `Document "${target.label}" resubmitted`);
    return true;
  }

  // ---- Fee assessment + permit generation --------------------------------

  /**
   * Starts the versioned, rules-based assessment for this application —
   * drafts it from the fee rules that apply to the application's permit
   * type (see fee-rule.model.ts / AssessmentStore.draftAssessment).
   * Fully AUTO-ISSUES the Order of Payment only when every applicable
   * line already has a real amount (no "Requires assessor input" lines) —
   * otherwise it stops at Draft and a Payment Officer must finish it from
   * Payments > Assessments (enter the manual line amounts, submit for
   * approval, and issue), which is the real required workflow this
   * one-click Evaluator action can only ever be the FIRST step of. Once a
   * non-terminal assessment already exists for this application, this
   * simply returns true without creating a second one (idempotent —
   * re-clicking "Assess Fee" never forks a duplicate assessment).
   */
  assessFee(applicationId: string, actor: string, role: string): boolean {
    const row = this.getById(applicationId);
    if (!row) return false;
    const existing = this.assessmentStore.getActiveAssessment(applicationId);
    if (existing) return true; // already drafted/issued — nothing more for this one-click action to do
    // No permit type means no fee schedule to draft against.
    if (row.permitType === null) return false;
    const draft = this.assessmentStore.draftAssessment(applicationId, row.permitType, actor, role);
    if (!draft) return false;
    if (!draft.hasUnresolvedLines) {
      if (
        this.assessmentStore.submitForApproval(draft.id, actor, role) &&
        this.assessmentStore.approveAssessment(draft.id, actor, role)
      ) {
        this.assessmentStore.issueOrderOfPayment(draft.id, actor, role);
      }
    }
    this.syncPaymentProjection(applicationId, actor, role);
    if (row.lifecycleStatus === 'Under Evaluation') {
      this.transitionStatus(applicationId, 'Assessed', actor, role);
    }
    return true;
  }

  /**
   * Generates the actual permit/clearance record for an Approved,
   * fully-paid application — requires Approved + Paid + no existing
   * permit, then advances the application straight through 'Permit
   * Generated' to 'Ready for Release' (both legal single-path
   * transitions per VALID_TRANSITIONS, so nothing else can happen to the
   * record in between). Expiry is computed from the permit type's own
   * validity rule in requirements-catalog.ts, never guessed per-call.
   */
  generatePermit(applicationId: string, actor: string, role: string): boolean {
    const row = this.getById(applicationId);
    if (!row) return false;
    if (row.lifecycleStatus !== 'Approved') return false;
    // "Allow permit processing only when all mandatory balances are
    // verified" — checked against the real assessment (every mandatory
    // line fully paid via verified, non-voided transactions), not just
    // the coarse `paymentStatus === 'Paid'` projection.
    if (!this.assessmentStore.canProcessPermit(applicationId)) return false;
    if (this.getPermit(applicationId)) return false;
    const req = requirementsFor(row.permitType);
    const now = new Date();
    const permitNumber = `PERMIT-2026-${String(2000 + this._permits().length + 1).padStart(6, '0')}`;
    const expiryDateValue = req.validityMonths ? addMonths(now, req.validityMonths) : null;
    const permit: GeneratedPermit = {
      applicationId,
      permitNumber,
      issuedDateValue: now,
      issuedDate: now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      expiryDateValue,
      expiryDate: expiryDateValue
        ? expiryDateValue.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : null,
      approvingOfficial: actor,
      approvingOffice: departmentName(req.responsibleDepartmentId),
    };
    this._permits.update((rows) => [...rows, permit]);
    this.transitionStatus(applicationId, 'Permit Generated', actor, role);
    this.transitionStatus(applicationId, 'Ready for Release', actor, role);
    this.appAudit(actor, role, applicationId, `${req.finalDocument} ${permitNumber} generated`);
    return true;
  }

  markNotificationRead(id: string): void {
    this._notifications.update((rows) =>
      rows.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  }

  markAllNotificationsRead(): void {
    this._notifications.update((rows) => rows.map((n) => ({ ...n, isRead: true })));
  }

  private nextId(): string {
    const nums = this._applications()
      .map((row) => parseInt(row.id.replace('E-BPCO-2026-', ''), 10))
      .filter((n) => !Number.isNaN(n));
    const next = (nums.length ? Math.max(...nums) : 0) + 1;
    return `E-BPCO-2026-${String(next).padStart(6, '0')}`;
  }
}
