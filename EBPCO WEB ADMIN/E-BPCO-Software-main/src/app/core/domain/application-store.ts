import { Injectable, computed, inject, signal } from '@angular/core';
import { ApplicationRecord, withProjectedFields } from './application.model';
import { ApplicationLifecycleStatus, canTransition, coarseStatus } from './status.model';
import { buildSeed } from './application-seed';
import { Applicant, ContactVerification, VerificationMethod } from './applicant.model';
import { Business } from './business.model';
import { GeneratedPermit, PermitReleaseRecord, ReleaseMethod } from './permit.model';
import {
  ApplicationDocument,
  DocumentHistoryEntry,
  DocumentStatus,
  UNRESOLVED_DOCUMENT_STATUSES,
} from './document.model';
import { EvaluationRecord } from './evaluation.model';
import { PaymentTransaction, totalAssessmentCentavos } from './payment.model';
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
  private readonly seed = buildSeed();

  private readonly _applications = signal<ApplicationRecord[]>(this.seed.applications);
  private readonly _businesses = signal<Business[]>(this.seed.businesses);
  private readonly _applicants = signal<Applicant[]>(this.seed.applicants);
  private readonly _documents = signal<ApplicationDocument[]>(this.seed.documents);
  private readonly _evaluations = signal<EvaluationRecord[]>(this.seed.evaluations);
  private readonly _payments = signal<PaymentTransaction[]>(this.seed.payments);
  private readonly _permits = signal<GeneratedPermit[]>(this.seed.permits);
  private readonly _releases = signal<PermitReleaseRecord[]>(this.seed.releases);
  private readonly _auditEvents = signal<AuditEvent[]>(this.seed.auditEvents);
  private readonly _notifications = signal<AppNotification[]>(this.seed.notifications);

  readonly applications = this._applications.asReadonly();
  readonly businesses = this._businesses.asReadonly();
  readonly applicants = this._applicants.asReadonly();
  readonly notifications = this._notifications.asReadonly();
  readonly auditEvents = this._auditEvents.asReadonly();
  /** Every evaluation record across every application — used for stage-wide aggregates (e.g. the Dashboard's per-stage breakdown) rather than looping `getEvaluations()` per application. */
  readonly evaluations = this._evaluations.asReadonly();

  // ---- Single-record lookups ------------------------------------------------

  getById(id: string): ApplicationRecord | undefined {
    return this._applications().find((row) => row.id === id);
  }

  getBusiness(businessId: string): Business | undefined {
    return this._businesses().find((b) => b.id === businessId);
  }

  getApplicant(applicantId: string): Applicant | undefined {
    return this._applicants().find((a) => a.id === applicantId);
  }

  getDocuments(applicationId: string): ApplicationDocument[] {
    return this._documents().filter((d) => d.applicationId === applicationId);
  }

  getEvaluations(applicationId: string): EvaluationRecord[] {
    return this._evaluations().filter((e) => e.applicationId === applicationId);
  }

  getPayments(applicationId: string): PaymentTransaction[] {
    return this._payments().filter((p) => p.applicationId === applicationId);
  }

  getPermit(applicationId: string): GeneratedPermit | undefined {
    return this._permits().find((p) => p.applicationId === applicationId);
  }

  getRelease(applicationId: string): PermitReleaseRecord | undefined {
    return this._releases().find((r) => r.applicationId === applicationId);
  }

  getAuditTrail(applicationId: string): AuditEvent[] {
    return this._auditEvents()
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
      rows.map((r) => (r.id === id ? withProjectedFields({ ...r, lifecycleStatus: to }) : r)),
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
    } else if (result === 'Passed' && stage === 'Final Approval') {
      this.transitionStatus(applicationId, 'Assessed', evaluator, 'Evaluator');
    }
    return true;
  }

  /**
   * A cashier/officer recording an onsite payment. Per the "must attach to
   * an existing assessed application, never generate a new application
   * ID" rule, this only accepts an application that has already been
   * assessed (has a non-null `assessedAmountCentavos`) — it appends a
   * transaction to that application, it never creates one.
   */
  recordOnsitePayment(applicationId: string, referenceNumber: string, recordedBy: string): boolean {
    const row = this.getById(applicationId);
    if (!row || row.assessedAmountCentavos === null) return false;

    const now = new Date();
    this._payments.update((rows) => [
      ...rows,
      {
        id: `PAY-${applicationId}-${rows.length + 1}`,
        applicationId,
        referenceNumber,
        amountCentavos: row.assessedAmountCentavos!,
        method: 'Onsite',
        status: 'Pending Verification',
        submittedAtValue: now,
        submittedAt: now.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        verifiedAtValue: null,
        verifiedAt: null,
        recordedBy,
      },
    ]);
    this._applications.update((rows) =>
      rows.map((r) =>
        r.id === applicationId
          ? withProjectedFields({ ...r, paymentStatus: 'Pending Verification' })
          : r,
      ),
    );
    this.appAudit(
      recordedBy,
      'Cashier',
      applicationId,
      `Onsite payment recorded (${referenceNumber})`,
    );
    return true;
  }

  verifyPayment(applicationId: string, verifiedBy: string): boolean {
    const row = this.getById(applicationId);
    if (!row || row.paymentStatus !== 'Pending Verification') return false;
    const now = new Date();
    this._payments.update((rows) =>
      rows.map((p) =>
        p.applicationId === applicationId && p.status === 'Pending Verification'
          ? {
              ...p,
              status: 'Paid',
              verifiedAtValue: now,
              verifiedAt: now.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              }),
            }
          : p,
      ),
    );
    this._applications.update((rows) =>
      rows.map((r) =>
        r.id === applicationId ? withProjectedFields({ ...r, paymentStatus: 'Paid' }) : r,
      ),
    );
    this.appAudit(verifiedBy, 'Payment Officer', applicationId, 'Payment verified');
    return true;
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
    if (row.paymentStatus !== 'Paid') return false;
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

  /** Computes the assessed amount from the CURRENT Super Admin Settings fee schedule (PaymentConfigStore) rather than a hardcoded literal — an application assessed before a settings change keeps its own snapshot (`assessedAmountCentavos`), so editing fees later never rewrites history. */
  assessFee(applicationId: string, actor: string, role: string): boolean {
    const row = this.getById(applicationId);
    if (!row || row.assessedAmountCentavos !== null) return false;
    const total = totalAssessmentCentavos(this.paymentConfig.feeSchedule());
    this._applications.update((rows) =>
      rows.map((r) =>
        r.id === applicationId ? withProjectedFields({ ...r, assessedAmountCentavos: total }) : r,
      ),
    );
    if (row.lifecycleStatus === 'Under Evaluation') {
      this.transitionStatus(applicationId, 'Assessed', actor, role);
    }
    this.appAudit(actor, role, applicationId, `Fee assessed (₱${(total / 100).toFixed(2)})`);
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
    if (row.lifecycleStatus !== 'Approved' || row.paymentStatus !== 'Paid') return false;
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
