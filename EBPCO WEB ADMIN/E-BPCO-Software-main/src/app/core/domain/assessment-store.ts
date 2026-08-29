import { Injectable, computed, inject, signal } from '@angular/core';
import {
  Assessment,
  AssessmentLineItem,
  AssessmentStatus,
  NON_TERMINAL_ASSESSMENT_STATUSES,
  computeLineTotal,
  isAssessmentOverdue,
} from './assessment.model';
import {
  CollectingAgency,
  PaymentAdjustment,
  PaymentAdjustmentType,
  PaymentTransaction,
  PaymentMethod,
} from './payment.model';
import { PermitType } from './permit.model';
import { PaymentConfigStore } from './payment-config-store';
import { AuditEvent } from './audit.model';

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

const DEFAULT_DUE_DAYS = 15;

/**
 * The payment-assessment workflow engine — owns every Assessment,
 * PaymentTransaction, and PaymentAdjustment in the system. This is
 * intentionally a separate store from ApplicationStore (which still owns
 * the application record itself and its lifecycle status): ApplicationStore
 * injects and calls into this one to keep its own `assessedAmountCentavos`/
 * `paymentStatus` projections in sync, but this store has no dependency
 * back on ApplicationStore, so an Assessment's own correctness (versioning,
 * balances, transaction integrity) never depends on how any particular
 * page chooses to project it.
 *
 * Required workflow this store implements end to end: draft assessment ->
 * review/submit for approval -> issue Order of Payment -> record onsite
 * payment or submit bank-transfer proof -> verify or reject that ONE
 * transaction -> partially paid or paid, derived from verified
 * non-voided transactions only -> permit processing allowed only once
 * every mandatory line is paid (see canProcessPermit).
 */
@Injectable({ providedIn: 'root' })
export class AssessmentStore {
  private readonly paymentConfig = inject(PaymentConfigStore);

  private readonly _assessments = signal<Assessment[]>([]);
  private readonly _transactions = signal<PaymentTransaction[]>([]);
  private readonly _adjustments = signal<PaymentAdjustment[]>([]);
  private readonly _auditEvents = signal<AuditEvent[]>([]);

  readonly assessments = this._assessments.asReadonly();
  readonly transactions = this._transactions.asReadonly();
  readonly adjustments = this._adjustments.asReadonly();
  readonly auditEvents = this._auditEvents.asReadonly();

  private seq = 1;
  private nextAssessmentId(applicationId: string): string {
    return `ASMT-${applicationId}-${this.seq++}`;
  }
  private nextTransactionId(): string {
    return `TXN-${String(this._transactions().length + 1).padStart(6, '0')}-${this.seq++}`;
  }
  private nextAdjustmentId(): string {
    return `ADJ-${String(this._adjustments().length + 1).padStart(6, '0')}-${this.seq++}`;
  }

  private audit(
    applicationId: string,
    actor: string,
    role: string,
    action: string,
    remarks: string | null = null,
  ): void {
    const now = new Date();
    this._auditEvents.update((rows) => [
      ...rows,
      {
        id: `AUD-ASMT-${rows.length + 1}`,
        applicationId,
        actor,
        role,
        action,
        timestampValue: now,
        timestamp: formatDate(now),
        remarks,
      },
    ]);
  }

  /** Seeds these stores directly (used by application-seed.ts) — appends rather than replacing, so tests/pages can also seed incrementally. */
  seedFrom(
    assessments: Assessment[],
    transactions: PaymentTransaction[],
    adjustments: PaymentAdjustment[] = [],
  ): void {
    this._assessments.update((rows) => [...rows, ...assessments]);
    this._transactions.update((rows) => [...rows, ...transactions]);
    this._adjustments.update((rows) => [...rows, ...adjustments]);
    const maxSeq = assessments.length + transactions.length + adjustments.length + 1;
    this.seq = Math.max(this.seq, maxSeq);
  }

  /**
   * Drops everything, including the seed.
   *
   * Called when the server's applications replace the local ones. The payments
   * page lists `allTransactions()` globally rather than per application, so
   * seeded money records stay on screen beside real applications unless they
   * are cleared here — and a fabricated peso figure beside a real permit is the
   * most consequential thing this portal can show.
   */
  clear(): void {
    this._assessments.set([]);
    this._transactions.set([]);
    this._adjustments.set([]);
    this._auditEvents.set([]);
  }

  // ---- Lookups --------------------------------------------------------

  getAssessments(applicationId: string): Assessment[] {
    return this._assessments()
      .filter((a) => a.applicationId === applicationId)
      .sort((a, b) => a.version - b.version);
  }

  getAssessmentById(id: string): Assessment | undefined {
    return this._assessments().find((a) => a.id === id);
  }

  /** The one assessment version that is still "live" (not superseded/voided) for an application, or null if none exists yet. Every page that needs "the current assessment" reads this rather than picking the last array element. */
  getActiveAssessment(applicationId: string): Assessment | undefined {
    return this._assessments()
      .filter(
        (a) =>
          a.applicationId === applicationId && a.status !== 'Superseded' && a.status !== 'Voided',
      )
      .sort((a, b) => b.version - a.version)[0];
  }

  getTransactionsForAssessment(assessmentId: string): PaymentTransaction[] {
    return this._transactions()
      .filter((t) => t.assessmentId === assessmentId)
      .sort((a, b) => a.submittedAtValue.getTime() - b.submittedAtValue.getTime());
  }

  getTransactionsForApplication(applicationId: string): PaymentTransaction[] {
    return this._transactions()
      .filter((t) => t.applicationId === applicationId)
      .sort((a, b) => a.submittedAtValue.getTime() - b.submittedAtValue.getTime());
  }

  getTransactionById(id: string): PaymentTransaction | undefined {
    return this._transactions().find((t) => t.id === id);
  }

  getAdjustmentsForTransaction(transactionId: string): PaymentAdjustment[] {
    return this._adjustments().filter((a) => a.transactionId === transactionId);
  }

  /** Live overdue projection — an assessment's stored `status` is refreshed to 'Overdue' on every recompute, but this lets a caller check "right now" without waiting for a mutation to trigger that refresh. */
  isOverdue(assessment: Assessment): boolean {
    return isAssessmentOverdue(assessment);
  }

  // ---- Draft / review / issue ------------------------------------------

  /**
   * Builds a new Draft assessment from the fee rules that apply to
   * `permitType` right now — 'required' lines included and locked in,
   * 'conditional' lines included but toggleable while still Draft. Fails
   * (returns null) if a non-terminal assessment already exists for this
   * application, so a caller can never accidentally fork two live
   * assessments for the same application at once.
   */
  draftAssessment(
    applicationId: string,
    permitType: PermitType,
    assessorName: string,
    assessorRole: string,
  ): Assessment | null {
    const existing = this.getActiveAssessment(applicationId);
    if (existing && NON_TERMINAL_ASSESSMENT_STATUSES.has(existing.status)) return null;
    return this.buildDraft(
      applicationId,
      permitType,
      assessorName,
      assessorRole,
      existing?.id ?? null,
      existing ? existing.version + 1 : 1,
    );
  }

  /** Shared by draftAssessment (fresh application) and reviseIssuedAssessment (a correction after issuance) — the only difference between the two callers is what `supersedesId`/`version` to stamp, and whether a non-terminal existing assessment is allowed to stand in the way (reviseIssuedAssessment already validated its own precondition, so it bypasses that guard here). */
  private buildDraft(
    applicationId: string,
    permitType: PermitType,
    assessorName: string,
    assessorRole: string,
    supersedesId: string | null,
    version: number,
  ): Assessment {
    const entries = this.paymentConfig.feeRulesForPermitType(permitType);
    const lineItems: AssessmentLineItem[] = entries.map(({ rule, applicability }) => ({
      feeRuleId: rule.id,
      code: rule.code,
      name: rule.name,
      family: rule.family,
      authority: rule.authority,
      collectingOfficeId: rule.collectingOfficeId,
      calculationType: rule.calculationType,
      applicability,
      inputs: {},
      amountCentavos: rule.requiresAssessorInput ? null : rule.flatAmountCentavos,
      requiresAssessorInput: rule.requiresAssessorInput,
      included: true,
      legalBasisUrl: rule.legalBasisUrl,
      legalBasisTitle: rule.legalBasisTitle,
      verificationStatus: rule.verificationStatus,
    }));
    const { totalCentavos, hasUnresolvedLines } = computeLineTotal(lineItems);

    const now = new Date();
    const assessment: Assessment = {
      id: this.nextAssessmentId(applicationId),
      applicationId,
      version,
      supersedesId,
      status: 'Draft',
      assessorName,
      assessorRole,
      lineItems,
      totalCentavos,
      hasUnresolvedLines,
      amountPaidCentavos: 0,
      balanceCentavos: totalCentavos,
      opsNumber: null,
      dueDateValue: null,
      dueDate: null,
      remarks: null,
      createdAtValue: now,
      createdAt: formatDate(now),
      approvedBy: null,
      approvedAtValue: null,
      approvedAt: null,
      issuedAtValue: null,
      issuedAt: null,
    };
    this._assessments.update((rows) => [...rows, assessment]);
    this.audit(
      applicationId,
      assessorName,
      assessorRole,
      `Assessment ${assessment.id} drafted (v${version})`,
    );
    return assessment;
  }

  /** Allowed only while Draft — toggling a conditional line, entering a manual amount, or changing an input recomputes the total every time so the draft is never stale. */
  updateDraftAssessment(
    assessmentId: string,
    patch: { lineItems?: AssessmentLineItem[]; dueDate?: string; remarks?: string },
    actor: string,
    role: string,
  ): boolean {
    const current = this.getAssessmentById(assessmentId);
    if (!current || current.status !== 'Draft') return false;
    const lineItems = patch.lineItems ?? current.lineItems;
    const { totalCentavos, hasUnresolvedLines } = computeLineTotal(lineItems);
    this._assessments.update((rows) =>
      rows.map((a) =>
        a.id === assessmentId
          ? {
              ...a,
              lineItems,
              totalCentavos,
              hasUnresolvedLines,
              balanceCentavos: totalCentavos - a.amountPaidCentavos,
              dueDate: patch.dueDate ?? a.dueDate,
              dueDateValue: patch.dueDate ? new Date(patch.dueDate) : a.dueDateValue,
              remarks: patch.remarks ?? a.remarks,
            }
          : a,
      ),
    );
    this.audit(current.applicationId, actor, role, `Assessment ${assessmentId} updated`);
    return true;
  }

  /** Sets a single line's manual amount (the "Requires assessor input" fields) — a thin wrapper over updateDraftAssessment so the UI doesn't have to rebuild the whole array itself. */
  setLineAmount(
    assessmentId: string,
    feeRuleId: string,
    amountCentavos: number,
    actor: string,
    role: string,
  ): boolean {
    const current = this.getAssessmentById(assessmentId);
    if (!current || current.status !== 'Draft') return false;
    if (!Number.isFinite(amountCentavos) || amountCentavos < 0) return false;
    const lineItems = current.lineItems.map((l) =>
      l.feeRuleId === feeRuleId ? { ...l, amountCentavos } : l,
    );
    return this.updateDraftAssessment(assessmentId, { lineItems }, actor, role);
  }

  setLineIncluded(
    assessmentId: string,
    feeRuleId: string,
    included: boolean,
    actor: string,
    role: string,
  ): boolean {
    const current = this.getAssessmentById(assessmentId);
    if (!current || current.status !== 'Draft') return false;
    const line = current.lineItems.find((l) => l.feeRuleId === feeRuleId);
    if (!line || line.applicability === 'required') return false; // required lines can never be dropped
    const lineItems = current.lineItems.map((l) =>
      l.feeRuleId === feeRuleId ? { ...l, included } : l,
    );
    return this.updateDraftAssessment(assessmentId, { lineItems }, actor, role);
  }

  submitForApproval(assessmentId: string, actor: string, role: string): boolean {
    const current = this.getAssessmentById(assessmentId);
    if (!current || current.status !== 'Draft') return false;
    if (current.hasUnresolvedLines) return false; // every included line must have a real amount before review
    this._assessments.update((rows) =>
      rows.map((a) => (a.id === assessmentId ? { ...a, status: 'For Approval' } : a)),
    );
    this.audit(
      current.applicationId,
      actor,
      role,
      `Assessment ${assessmentId} submitted for approval`,
    );
    return true;
  }

  approveAssessment(assessmentId: string, approver: string, role: string): boolean {
    const current = this.getAssessmentById(assessmentId);
    if (!current || current.status !== 'For Approval') return false;
    const now = new Date();
    this._assessments.update((rows) =>
      rows.map((a) =>
        a.id === assessmentId
          ? { ...a, approvedBy: approver, approvedAtValue: now, approvedAt: formatDate(now) }
          : a,
      ),
    );
    this.audit(current.applicationId, approver, role, `Assessment ${assessmentId} approved`);
    return true;
  }

  /** Issues the Order of Payment — requires prior approval, stamps an OPS number and due date, and from this point on the line-item snapshot is permanent (see reviseIssuedAssessment for the only way to change anything after this). */
  issueOrderOfPayment(
    assessmentId: string,
    actor: string,
    role: string,
    dueInDays: number = DEFAULT_DUE_DAYS,
  ): boolean {
    const current = this.getAssessmentById(assessmentId);
    if (!current || current.status !== 'For Approval' || !current.approvedBy) return false;
    const now = new Date();
    const due = addDays(now, dueInDays);
    const opsNumber = `OPS-2026-${String(this._assessments().filter((a) => a.opsNumber).length + 1).padStart(6, '0')}`;
    this._assessments.update((rows) =>
      rows.map((a) =>
        a.id === assessmentId
          ? {
              ...a,
              status: 'Issued',
              opsNumber,
              dueDateValue: due,
              dueDate: formatDate(due),
              issuedAtValue: now,
              issuedAt: formatDate(now),
            }
          : a,
      ),
    );
    if (current.supersedesId) {
      this._assessments.update((rows) =>
        rows.map((a) => (a.id === current.supersedesId ? { ...a, status: 'Superseded' } : a)),
      );
    }
    this.audit(
      current.applicationId,
      actor,
      role,
      `Order of Payment ${opsNumber} issued for assessment ${assessmentId}`,
    );
    return true;
  }

  /**
   * The ONLY way to change an assessment after it's been issued —
   * creates a whole new Draft version (supersedesId = the issued one) so
   * the correction goes through review/approval/issue again rather than
   * silently rewriting a document that may already be in the applicant's
   * hands. Refused if any transaction against the current version has
   * already been verified (that money has to be voided/reversed first,
   * not silently reattributed to a different line-item snapshot).
   */
  reviseIssuedAssessment(
    assessmentId: string,
    permitType: PermitType,
    actor: string,
    role: string,
  ): Assessment | null {
    const current = this.getAssessmentById(assessmentId);
    if (!current) return null;
    if (current.status !== 'Issued' && current.status !== 'Overdue') return null;
    const hasVerified = this.getTransactionsForAssessment(assessmentId).some(
      (t) => t.status === 'Verified' && !t.isVoid,
    );
    if (hasVerified) return null;
    // Goes straight to buildDraft rather than the public draftAssessment
    // — `current` itself is still the "active" non-terminal assessment
    // right up until this call, so draftAssessment's own guard would
    // otherwise refuse to create the replacement version.
    const next = this.buildDraft(
      current.applicationId,
      permitType,
      actor,
      role,
      current.id,
      current.version + 1,
    );
    this._assessments.update((rows) =>
      rows.map((a) => (a.id === current.id ? { ...a, status: 'Superseded' } : a)),
    );
    return next;
  }

  // ---- Payments ----------------------------------------------------------

  private referenceIsDuplicate(transactionReference: string): boolean {
    return this._transactions().some(
      (t) =>
        t.transactionReference.trim().toLowerCase() === transactionReference.trim().toLowerCase(),
    );
  }

  private recordTransaction(
    assessment: Assessment,
    amountCentavos: number,
    method: PaymentMethod,
    agency: CollectingAgency,
    transactionReference: string,
    proofFileName: string | null,
    actor: string,
    role: string,
  ): PaymentTransaction | null {
    if (
      assessment.status !== 'Issued' &&
      assessment.status !== 'Partially Paid' &&
      assessment.status !== 'Overdue'
    ) {
      return null;
    }
    const ref = transactionReference.trim();
    if (!ref || this.referenceIsDuplicate(ref)) return null; // prevent duplicate references
    if (!Number.isFinite(amountCentavos) || amountCentavos <= 0) return null;
    if (amountCentavos > assessment.balanceCentavos) return null; // prevent accidental overpayment
    if (method === 'Bank Transfer' && !proofFileName) return null; // bank-proof requirement

    const now = new Date();
    const txn: PaymentTransaction = {
      id: this.nextTransactionId(),
      assessmentId: assessment.id,
      applicationId: assessment.applicationId,
      amountCentavos,
      method,
      agency,
      transactionReference: ref,
      proofFileName,
      status: 'Pending Verification',
      submittedAtValue: now,
      submittedAt: formatDate(now),
      verifiedAtValue: null,
      verifiedAt: null,
      verifiedBy: null,
      rejectionReason: null,
      recordedBy: method === 'Onsite' ? actor : null,
      orNumber: null,
      orDate: null,
      orIssuedBy: null,
      isVoid: false,
    };
    this._transactions.update((rows) => [...rows, txn]);
    this.audit(
      assessment.applicationId,
      actor,
      role,
      `${method} payment of ₱${(amountCentavos / 100).toFixed(2)} recorded (${ref}) against assessment ${assessment.id}`,
    );
    return txn;
  }

  recordOnsitePayment(
    assessmentId: string,
    amountCentavos: number,
    transactionReference: string,
    agency: CollectingAgency,
    recordedBy: string,
    role: string,
  ): PaymentTransaction | null {
    const assessment = this.getAssessmentById(assessmentId);
    if (!assessment) return null;
    return this.recordTransaction(
      assessment,
      amountCentavos,
      'Onsite',
      agency,
      transactionReference,
      null,
      recordedBy,
      role,
    );
  }

  submitBankTransferProof(
    assessmentId: string,
    amountCentavos: number,
    transactionReference: string,
    proofFileName: string,
    agency: CollectingAgency,
    submittedBy: string,
    role: string,
  ): PaymentTransaction | null {
    const assessment = this.getAssessmentById(assessmentId);
    if (!assessment) return null;
    if (!proofFileName.trim()) return null;
    return this.recordTransaction(
      assessment,
      amountCentavos,
      'Bank Transfer',
      agency,
      transactionReference,
      proofFileName,
      submittedBy,
      role,
    );
  }

  /** Recomputes one assessment's paid/balance/status from ONLY its Verified, non-voided transactions — never swept across every application's pending rows (the old application-wide "verify everything" bug this replaces). */
  private recomputeAssessment(assessmentId: string): void {
    const assessment = this.getAssessmentById(assessmentId);
    if (!assessment) return;
    const paid = this.getTransactionsForAssessment(assessmentId)
      .filter((t) => t.status === 'Verified' && !t.isVoid)
      .reduce((sum, t) => sum + t.amountCentavos, 0);
    const balance = Math.max(0, assessment.totalCentavos - paid);
    let status: AssessmentStatus = assessment.status;
    // 'Paid' is included here too — a void/reversal/refund adjustment
    // can reduce the verified total on an already-Paid assessment back
    // down, and the status must reflect that instead of staying frozen
    // at 'Paid' with a balance that's actually positive again.
    if (
      status === 'Issued' ||
      status === 'Partially Paid' ||
      status === 'Overdue' ||
      status === 'Paid'
    ) {
      if (balance <= 0) status = 'Paid';
      else if (paid > 0) status = 'Partially Paid';
      else
        status = isAssessmentOverdue({ ...assessment, balanceCentavos: balance })
          ? 'Overdue'
          : 'Issued';
    }
    this._assessments.update((rows) =>
      rows.map((a) =>
        a.id === assessmentId
          ? { ...a, amountPaidCentavos: paid, balanceCentavos: balance, status }
          : a,
      ),
    );
  }

  /**
   * Verifies exactly ONE transaction — fixes the defect where verifying
   * a payment marked every other pending transaction for the same
   * application as paid too. Does not, by itself, attach an official OR
   * number (see attachOfficialReceipt) — a transaction can be genuinely
   * Verified (money confirmed received) before the cashier's OR number
   * has been keyed in, during which every generated document must still
   * read "Payment Acknowledgment".
   */
  verifyTransaction(transactionId: string, verifiedBy: string, role: string): boolean {
    const txn = this.getTransactionById(transactionId);
    if (!txn || txn.status !== 'Pending Verification') return false;
    const now = new Date();
    this._transactions.update((rows) =>
      rows.map((t) =>
        t.id === transactionId
          ? {
              ...t,
              status: 'Verified',
              verifiedAtValue: now,
              verifiedAt: formatDate(now),
              verifiedBy,
            }
          : t,
      ),
    );
    this.recomputeAssessment(txn.assessmentId);
    this.audit(txn.applicationId, verifiedBy, role, `Transaction ${transactionId} verified`);
    return true;
  }

  rejectTransaction(
    transactionId: string,
    rejectedBy: string,
    role: string,
    reason: string,
  ): boolean {
    const txn = this.getTransactionById(transactionId);
    if (!txn || txn.status !== 'Pending Verification') return false;
    if (!reason.trim()) return false;
    this._transactions.update((rows) =>
      rows.map((t) =>
        t.id === transactionId ? { ...t, status: 'Rejected', rejectionReason: reason.trim() } : t,
      ),
    );
    this.audit(
      txn.applicationId,
      rejectedBy,
      role,
      `Transaction ${transactionId} rejected`,
      reason.trim(),
    );
    return true;
  }

  /** Never allowed on anything but a Verified transaction — a Verified row is otherwise immutable, so undoing its effect always goes through this auditable path instead of a direct edit. */
  voidTransaction(transactionId: string, actor: string, role: string, reason: string): boolean {
    return this.adjustTransaction(transactionId, 'Void', actor, role, reason);
  }

  reverseTransaction(transactionId: string, actor: string, role: string, reason: string): boolean {
    return this.adjustTransaction(transactionId, 'Reversal', actor, role, reason);
  }

  refundTransaction(transactionId: string, actor: string, role: string, reason: string): boolean {
    return this.adjustTransaction(transactionId, 'Refund', actor, role, reason);
  }

  private adjustTransaction(
    transactionId: string,
    type: PaymentAdjustmentType,
    actor: string,
    role: string,
    reason: string,
  ): boolean {
    if (!reason.trim()) return false;
    const txn = this.getTransactionById(transactionId);
    if (!txn || txn.status !== 'Verified' || txn.isVoid) return false;
    const now = new Date();
    this._transactions.update((rows) =>
      rows.map((t) => (t.id === transactionId ? { ...t, isVoid: true } : t)),
    );
    this._adjustments.update((rows) => [
      ...rows,
      {
        id: this.nextAdjustmentId(),
        transactionId,
        type,
        amountCentavos: txn.amountCentavos,
        reason: reason.trim(),
        actor,
        role,
        timestampValue: now,
        timestamp: formatDate(now),
      },
    ]);
    this.recomputeAssessment(txn.assessmentId);
    this.audit(
      txn.applicationId,
      actor,
      role,
      `Transaction ${transactionId} ${type.toLowerCase()}d`,
      reason.trim(),
    );
    return true;
  }

  /** Optional follow-up to verifyTransaction — attaches the real, cashier-supplied OR number. Until this is called, every document referencing the transaction must present as "Payment Acknowledgment", never "Official Receipt" — see document-preview.ts. */
  attachOfficialReceipt(
    transactionId: string,
    orNumber: string,
    orDate: string,
    orIssuedBy: string,
  ): boolean {
    const txn = this.getTransactionById(transactionId);
    if (!txn || txn.status !== 'Verified' || !orNumber.trim()) return false;
    this._transactions.update((rows) =>
      rows.map((t) =>
        t.id === transactionId ? { ...t, orNumber: orNumber.trim(), orDate, orIssuedBy } : t,
      ),
    );
    return true;
  }

  // ---- Permit-processing gate --------------------------------------------

  /**
   * True only once every mandatory (required-applicability) line on the
   * application's active assessment is fully paid — the assessment as a
   * whole is 'Paid' AND that assessment isn't stale (superseded by a
   * later version). Conditional lines that were never included don't
   * block this; a required line always must be, by construction (see
   * setLineIncluded, which refuses to drop a required line).
   */
  canProcessPermit(applicationId: string): boolean {
    const assessment = this.getActiveAssessment(applicationId);
    if (!assessment) return false;
    return assessment.status === 'Paid';
  }

  /** Flips any Issued/Partially Paid assessment whose due date has passed to 'Overdue' — a due-date derived status is only ever true "as of now", so this is called once at startup (seeding) and again whenever the Assessments tab loads, rather than stored as something a mutation could leave stale. */
  refreshOverdueStatuses(now: Date = new Date()): void {
    this._assessments.update((rows) =>
      rows.map((a) => {
        if (
          (a.status === 'Issued' || a.status === 'Partially Paid') &&
          isAssessmentOverdue(a, now)
        ) {
          return { ...a, status: 'Overdue' };
        }
        return a;
      }),
    );
  }

  readonly allAssessments = computed(() => this._assessments());
  readonly allTransactions = computed(() => this._transactions());
}
