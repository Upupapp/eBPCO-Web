import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { Router } from '@angular/router';
import { Topbar } from '../../shared/topbar/topbar';
import { Icon } from '../../shared/icon/icon';
import { Avatar } from '../../shared/avatar/avatar';
import { Pagination } from '../../shared/pagination/pagination';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { ToastService } from '../../shared/toast/toast.service';
import { downloadCsv } from '../../shared/utils/export-csv';
import { ApplicationStore } from '../../core/domain/application-store';
import { PaymentConfigStore } from '../../core/domain/payment-config-store';
import { DEFAULT_BANK_INFO, OfficeBankInfo } from '../../core/domain/payment-config.model';
import { PayrollStore } from '../../core/domain/payroll-store';
import { PayrollStaffMember } from '../../core/domain/payroll.model';
import { SessionService } from '../../core/session/session.service';
import { ACTION_PERMISSIONS } from '../../core/session/permissions';
import { ALL_PERMIT_TYPES, PermitType } from '../../core/domain/permit.model';
import {
  StaffApplicationsApi,
  type ApplicationPaymentRow,
  type ApplicationOrderOfPayment,
} from '../../core/api/staff-applications.api';
import {
  StaffPaymentsApi,
  Assessment,
  FeeLine,
  FEE_LINES,
  PaymentQueueRow,
  PaymentStatus,
} from '../../core/api/staff-payments.api';
import {
  StaffFeeConfigApi,
  FeeSchedule,
  FeeScheduleEntry,
  PaymentMethodConfig,
} from '../../core/api/staff-fee-config.api';
import { QueueLoadNotice } from '../../shared/queue-load-notice/queue-load-notice';
import { DocumentPreview } from '../../shared/document-preview/document-preview';

type PaymentsTab = 'transactions' | 'fee-schedule' | 'configuration';
type ConfigSubTab = 'payment-methods' | 'bank-information' | 'payroll';

function formatPHP(centavos: number | null): string {
  if (centavos === null) return '—';
  return `₱${(centavos / 100).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// The server sends raw ISO timestamps (e.g. "2026-09-17T12:36:15.463Z").
// Rendering that directly, as `order.assessedAt` used to, reads like a
// debug log rather than something written for an officer to read.
function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  const when = new Date(iso);
  if (Number.isNaN(when.getTime())) return iso;
  return `${when.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })} · `
    + when.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
}

function statusClass(status: string): string {
  return status.toLowerCase().replace(/[\s_]+/g, '-');
}

const LINE_LABELS: Record<FeeLine, string> = {
  filing: 'Filing Fee',
  processing: 'Processing Fee',
  architectural: 'Architectural Fee',
  structural: 'Structural Fee',
  electrical: 'Electrical Fee',
  others: 'Other Fees',
};

interface PaymentRow {
  readonly payment: PaymentQueueRow;
  readonly applicant: string;
  readonly businessName: string;
  readonly permitType: string;
}

/**
 * Payments, against the real backend.
 *
 * ── Why this page has no browsable "Assessments" list ────────────────────
 *
 * There is no such endpoint. An assessment lives entirely inside one
 * application — opened, edited, submitted, approved and issued from THAT
 * application's own record — and the server has no route that lists every
 * assessment across every application the way `GET /staff/evaluations` lists
 * every evaluation. Applications' own detail header links here with
 * `?applicationId=`, exactly the way it already links to Evaluations, and
 * this page opens straight into that one application's Assessment Workspace.
 *
 * ── The real model, not the one this page used to show ──────────────────
 *
 * Six fixed lines (`FEE_LINES`), flat pesos each, no bracket/percentage/
 * per-unit catalog. No partial payment — one payment settles an Order of
 * Payment's total exactly, or it is refused. Verifying a payment and
 * recording its Official Receipt number are the SAME call; there is no
 * separate "attach OR" step. An onsite payment is recorded already Paid and
 * verified in one call; only a bank-transfer proof (submitted by the
 * applicant, never by staff — see `StaffPaymentsApi.recordOnsitePayment`'s
 * own doc comment) goes through a later verify()/reject().
 */
@Component({
  selector: 'app-payments',
  imports: [
    QueueLoadNotice,
    Topbar,
    Icon,
    Avatar,
    Pagination,
    FormsModule,
    SlicePipe,
    ConfirmDialog,
    OverlayModule,
    DocumentPreview,
  ],
  templateUrl: './payments.html',
  styleUrl: './payments.scss',
})
export class Payments {
  private readonly store = inject(ApplicationStore);
  private readonly applicationsApi = inject(StaffApplicationsApi);
  protected readonly paymentsApi = inject(StaffPaymentsApi);
  protected readonly feeConfigApi = inject(StaffFeeConfigApi);
  protected readonly paymentConfig = inject(PaymentConfigStore);
  protected readonly payrollStore = inject(PayrollStore);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  /** Bound to the `?applicationId=` query param — Applications' own detail header links straight to one application's Assessment Workspace here, the same way it already links to Evaluations. */
  readonly applicationId = input<string>();

  /** Bound to the `?tab=` query param — Permit Release's "View Fee Schedule" link deep-links here. Only a recognized tab key is honored; anything else is ignored rather than erroring. */
  readonly tab = input<string>();

  constructor() {
    effect(() => {
      const id = this.applicationId();
      if (id) untracked(() => this.loadWorkspace(id));
    });
    effect(() => {
      const requested = this.tab();
      if (requested === 'transactions' || requested === 'fee-schedule' || requested === 'configuration') {
        untracked(() => this.activeTab.set(requested));
      }
    });
  }

  protected formatPHP = formatPHP;
  protected formatDateTime = formatDateTime;
  protected statusClass = statusClass;
  protected readonly feeLines = FEE_LINES;
  protected lineLabel(line: FeeLine): string {
    return LINE_LABELS[line];
  }

  /** What the fee schedule in force said this line should be, before any officer override — kept beside the officer-set `amountCentavos` on every line so "charged less than the ordinance prescribes" is answerable later (see StaffPaymentsApi's own doc comment). */
  protected computedForLine(assessment: Assessment, line: FeeLine): number {
    return assessment.lines.find((l) => l.line === line)?.computedCentavos ?? 0;
  }

  // ---- Permissions ---------------------------------------------------------

  protected readonly canConfigurePayments = computed(() => {
    const role = this.session.role();
    return !!role && ACTION_PERMISSIONS.configurePayments(role);
  });
  protected readonly canEditAssessment = computed(() => {
    const role = this.session.role();
    return !!role && ACTION_PERMISSIONS.editAssessment(role);
  });
  protected readonly canApproveAssessment = computed(() => {
    const role = this.session.role();
    return !!role && ACTION_PERMISSIONS.approveAssessment(role);
  });
  protected readonly canRecordPayment = computed(() => {
    const role = this.session.role();
    return !!role && ACTION_PERMISSIONS.recordPayment(role);
  });
  protected readonly canVerifyPayment = computed(() => {
    const role = this.session.role();
    return !!role && ACTION_PERMISSIONS.verifyPayment(role);
  });
  protected readonly canAdjustPayment = computed(() => {
    const role = this.session.role();
    return !!role && ACTION_PERMISSIONS.adjustPayment(role);
  });

  // ---- Tabs ------------------------------------------------------------

  protected readonly tabs: { key: PaymentsTab; label: string; icon: string }[] = [
    { key: 'transactions', label: 'Payment Queue', icon: 'wallet' },
    { key: 'fee-schedule', label: 'Fee Schedule', icon: 'grid' },
    { key: 'configuration', label: 'Configuration', icon: 'settings' },
  ];

  protected readonly visibleTabs = computed(() =>
    this.tabs.filter((t) => t.key !== 'configuration' || this.canConfigurePayments()),
  );

  protected readonly activeTab = signal<PaymentsTab>('transactions');

  protected selectTab(tab: PaymentsTab): void {
    if (tab === 'configuration' && !this.canConfigurePayments()) return;
    this.activeTab.set(tab);
    this.page.set(1);
  }

  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly searchTerm = signal('');

  protected onSearchChange(): void {
    this.page.set(1);
  }

  private applicationLabel(applicationId: string): {
    applicant: string;
    businessName: string;
    permitType: string;
  } {
    const ctx = this.store.getApplicationContext(applicationId);
    return {
      applicant: ctx?.applicant ?? '—',
      businessName: ctx?.businessLabel ?? 'Not provided',
      permitType: ctx?.permitType ?? '—',
    };
  }

  // ============================================================
  // Assessment Workspace — one application at a time (?applicationId=)
  // ============================================================

  protected readonly workspaceApp = computed(() => {
    const id = this.applicationId();
    return id ? this.store.getById(id) : undefined;
  });

  protected readonly workspaceLoading = signal(false);
  protected readonly workspaceWorking = signal(false);
  protected readonly workspaceError = signal<string | null>(null);
  protected readonly workspaceAssessment = signal<Assessment | null>(null);
  protected readonly workspaceOrder = signal<ApplicationOrderOfPayment | null>(null);
  protected readonly workspacePayments = signal<readonly ApplicationPaymentRow[]>([]);

  /**
   * The one in-progress (Draft/Submitted/Approved) assessment id THIS
   * session has drafted or touched, per application — an optimization only.
   * `loadWorkspace` no longer depends on it to find an existing assessment
   * (it now asks the server directly via `getOpenAssessment`, which is what
   * lets a second officer — the normal case for approval, since the drafter
   * may not approve their own work — find and act on an assessment they
   * never personally opened). This map still exists so `startAssessment`'s
   * `already-open` branch can immediately show what was just drafted in
   * this same call without a second round trip.
   */
  private readonly knownAssessmentId = new Map<string, string>();

  /**
   * The editable draft for each of the six lines, kept as a plain mutable
   * object rather than a signal — the same reasoning as `application-intake.
   * ts`'s form state: this binds to `ngModel` across six rows, and nothing
   * here needs to be reactively derived FROM. Reset from the server's own
   * values every time an assessment is loaded or one line is saved, so an
   * unsaved edit to a DIFFERENT line is never silently discarded by that
   * save's response.
   */
  protected lineDrafts: Record<FeeLine, { amount: string; basis: string; included: boolean }> =
    this.emptyLineDrafts();

  private emptyLineDrafts(): Record<FeeLine, { amount: string; basis: string; included: boolean }> {
    return {
      filing: { amount: '0.00', basis: '', included: true },
      processing: { amount: '0.00', basis: '', included: true },
      architectural: { amount: '0.00', basis: '', included: true },
      structural: { amount: '0.00', basis: '', included: true },
      electrical: { amount: '0.00', basis: '', included: true },
      others: { amount: '0.00', basis: '', included: true },
    };
  }

  private setWorkspaceAssessment(assessment: Assessment | null): void {
    this.workspaceAssessment.set(assessment);
    const drafts = this.emptyLineDrafts();
    if (assessment) {
      for (const line of assessment.lines) {
        drafts[line.line] = {
          amount: (line.amountCentavos / 100).toFixed(2),
          basis: line.basis,
          included: line.included,
        };
      }
    }
    this.lineDrafts = drafts;
  }

  private async loadWorkspace(applicationId: string): Promise<void> {
    this.workspaceLoading.set(true);
    this.workspaceError.set(null);
    this.setWorkspaceAssessment(null);
    this.workspaceOrder.set(null);
    this.workspacePayments.set([]);
    try {
      const detail = await this.applicationsApi.detail(applicationId);
      if (detail.kind === 'ok') {
        this.workspaceOrder.set(detail.detail.orderOfPayment);
        this.workspacePayments.set(detail.detail.payments);
      } else if (detail.kind === 'failed') {
        this.workspaceError.set(detail.message);
      }

      const open = await this.paymentsApi.getOpenAssessment(applicationId);
      if (open.kind === 'ok' && open.assessment) {
        this.knownAssessmentId.set(applicationId, open.assessment.id);
        this.setWorkspaceAssessment(open.assessment);
      } else {
        this.knownAssessmentId.delete(applicationId);
      }
    } finally {
      this.workspaceLoading.set(false);
    }
  }

  protected backFromWorkspace(): void {
    const id = this.applicationId();
    if (id) this.router.navigateByUrl(`/applications/${id}`);
  }

  protected async startAssessment(): Promise<void> {
    const id = this.applicationId();
    if (!id || !this.canEditAssessment()) return;
    this.workspaceWorking.set(true);
    try {
      const result = await this.paymentsApi.draftAssessment(id);
      if (result.kind === 'done') {
        this.knownAssessmentId.set(id, result.assessment.id);
        this.setWorkspaceAssessment(result.assessment);
        this.toast.success('Assessment drafted from the fee schedule in force today.');
        return;
      }
      // `already-open` lands here too — a race between this workspace's own
      // load and someone else drafting one in between. Fetch and show the
      // real one rather than leaving the officer looking at a toast and a
      // "Start Assessment" button that would just fail the same way again.
      if (result.kind === 'refused' && result.message.includes('already')) {
        const open = await this.paymentsApi.getOpenAssessment(id);
        if (open.kind === 'ok' && open.assessment) {
          this.knownAssessmentId.set(id, open.assessment.id);
          this.setWorkspaceAssessment(open.assessment);
          return;
        }
      }
      this.toast.error(
        result.kind === 'unavailable' ? 'This deployment cannot draft assessments yet.' : result.message,
      );
    } finally {
      this.workspaceWorking.set(false);
    }
  }

  protected async saveLine(line: FeeLine): Promise<void> {
    const assessment = this.workspaceAssessment();
    if (!assessment || !this.canEditAssessment()) return;
    const draft = this.lineDrafts[line];
    const pesos = Number(draft.amount);
    if (!Number.isFinite(pesos) || pesos < 0) {
      this.toast.error('Enter a valid, non-negative amount.');
      return;
    }
    this.workspaceWorking.set(true);
    try {
      const result = await this.paymentsApi.setAssessmentLine(assessment.id, line, {
        amountCentavos: Math.round(pesos * 100),
        included: draft.included,
        basis: draft.basis.trim(),
      });
      if (result.kind === 'done') {
        this.setWorkspaceAssessment(result.assessment);
        this.toast.success(`${this.lineLabel(line)} updated.`);
        return;
      }
      this.toast.error(
        result.kind === 'unavailable' ? 'This deployment cannot edit assessment lines yet.' : result.message,
      );
    } finally {
      this.workspaceWorking.set(false);
    }
  }

  protected async submitAssessment(): Promise<void> {
    const assessment = this.workspaceAssessment();
    if (!assessment || !this.canEditAssessment()) return;
    this.workspaceWorking.set(true);
    try {
      const result = await this.paymentsApi.submitAssessment(assessment.id);
      if (result.kind === 'done') {
        this.setWorkspaceAssessment(result.assessment);
        this.toast.success('Assessment submitted for approval.');
        return;
      }
      this.toast.error(
        result.kind === 'unavailable' ? 'This deployment cannot submit assessments yet.' : result.message,
      );
    } finally {
      this.workspaceWorking.set(false);
    }
  }

  protected async approveWorkspaceAssessment(): Promise<void> {
    const assessment = this.workspaceAssessment();
    if (!assessment || !this.canApproveAssessment()) return;
    this.workspaceWorking.set(true);
    try {
      const result = await this.paymentsApi.approveAssessment(assessment.id);
      if (result.kind === 'done') {
        this.setWorkspaceAssessment(result.assessment);
        this.toast.success('Assessment approved.');
        return;
      }
      // Self-approval surfaces here as the server's own wording — the same
      // account drafted or submitted it, and a DIFFERENT officer has to
      // approve it instead.
      this.toast.error(
        result.kind === 'unavailable' ? 'This deployment cannot approve assessments yet.' : result.message,
      );
    } finally {
      this.workspaceWorking.set(false);
    }
  }

  protected async issueOrder(): Promise<void> {
    const assessment = this.workspaceAssessment();
    const appId = this.applicationId();
    if (!assessment || !appId || !this.canApproveAssessment()) return;
    this.workspaceWorking.set(true);
    try {
      const result = await this.paymentsApi.issueOrderOfPayment(appId);
      if (result.kind === 'done') {
        // The server makes `Under Evaluation -> Assessed` itself as part of
        // issuing the Order (the Order is what "Assessed" means) and reports
        // where the application now stands. Before this, nothing did: every
        // stage passed, a real Order in force, and the application still
        // read "Under Evaluation" everywhere until an officer found "Send to
        // Assessed" in a menu — found live. The fallback below is for an
        // older server that does not report a status, or a refused move;
        // against the current server it never runs.
        let status = result.lifecycleStatus ?? null;
        if (status !== 'Assessed') {
          const moved = await this.applicationsApi.transition(appId, 'Assessed');
          if (moved.kind === 'done') status = moved.status;
        }
        this.toast.success(
          status === 'Assessed'
            ? `Order of Payment ${result.number} issued — the application is now Assessed and the applicant has been notified.`
            : `Order of Payment ${result.number} issued, but the application could not be moved to Assessed. Check its status.`,
        );
        this.knownAssessmentId.delete(appId);
        await this.loadWorkspace(appId);
        return;
      }
      this.toast.error(
        result.kind === 'unavailable' ? 'This deployment cannot issue an Order of Payment yet.' : result.message,
      );
    } finally {
      this.workspaceWorking.set(false);
    }
  }

  // ---- Recording an onsite payment against the issued Order --------------
  // No partial payment exists server-side: the amount must equal the
  // Order's total exactly, so this form has nothing to compute — only an OR
  // number to key in. There is no way for staff to originate a bank-transfer
  // payment on an applicant's behalf (see StaffPaymentsApi's own doc
  // comment) — a bank-transfer proof only ever arrives already submitted,
  // and shows up in `workspacePayments` for staff to verify/reject.

  protected readonly showPaymentForm = signal(false);
  protected paymentForm = { officialReceiptNumber: '' };

  protected openPaymentForm(): void {
    if (!this.canRecordPayment()) {
      this.toast.error("You don't have permission to record a payment.");
      return;
    }
    this.paymentForm = { officialReceiptNumber: '' };
    this.showPaymentForm.set(true);
  }

  protected cancelPaymentForm(): void {
    this.showPaymentForm.set(false);
  }

  protected async submitPaymentForm(): Promise<void> {
    const appId = this.applicationId();
    const order = this.workspaceOrder();
    if (!appId || !order || !this.canRecordPayment()) return;
    if (!this.paymentForm.officialReceiptNumber.trim()) {
      this.toast.error('Enter the Official Receipt number.');
      return;
    }
    this.workspaceWorking.set(true);
    try {
      const result = await this.paymentsApi.recordOnsitePayment(appId, {
        officialReceiptNumber: this.paymentForm.officialReceiptNumber.trim(),
        amountCentavos: order.totalCentavos,
      });
      if (result.kind === 'done') {
        this.toast.success('Onsite payment recorded and verified.');
        this.showPaymentForm.set(false);
        await this.loadWorkspace(appId);
        return;
      }
      this.toast.error(
        result.kind === 'unavailable' ? 'This deployment cannot record onsite payments yet.' : result.message,
      );
    } finally {
      this.workspaceWorking.set(false);
    }
  }

  /** Adapts one row of the Assessment Workspace's own payment list (`ApplicationPaymentRow`, from the application detail) into the shape `openVerify`/`openReject`/`openAdjust`/`openCorrectReceipt` expect (`PaymentQueueRow`, from the global queue) — same underlying `payments` table row, two different read shapes, one set of write actions. */
  protected toQueueRow(payment: ApplicationPaymentRow, applicationId: string): PaymentQueueRow {
    const app = this.workspaceApp();
    return {
      id: payment.id,
      applicationId,
      applicationReference: app?.referenceNumber ?? applicationId,
      referenceNumber: payment.referenceNumber,
      applicantName: app?.applicant ?? '—',
      amountCentavos: payment.amountCentavos,
      method: payment.method,
      status: payment.status,
      submittedAt: payment.submittedAt,
      officialReceiptNumber: payment.officialReceiptNumber,
    };
  }

  // ============================================================
  // Payment Queue tab — GET /staff/payments (real bulk endpoint)
  // ============================================================

  // Defaults to 'All', not 'Pending Verification': an officer landing here
  // after recording an Onsite payment (already 'Paid', never passes through
  // verification) found it simply missing, with nothing on screen to say the
  // queue was filtered rather than empty.
  protected readonly queueStatusFilter = signal<PaymentStatus | 'All'>('All');
  protected readonly queueStatusOptions: (PaymentStatus | 'All')[] = [
    'All',
    'Pending Verification',
    'Paid',
    'Not Yet Available',
    'Overdue',
  ];
  protected readonly queueLoading = signal(false);
  protected readonly queueUnavailable = signal(false);
  protected readonly queueError = signal<string | null>(null);
  protected readonly queueRows = signal<readonly PaymentQueueRow[]>([]);

  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadQueue(), this.loadSchedules(), this.loadPaymentMethods()]);
  }

  protected async loadQueue(): Promise<void> {
    this.queueLoading.set(true);
    this.queueUnavailable.set(false);
    this.queueError.set(null);
    try {
      const filter = this.queueStatusFilter();
      const result = await this.paymentsApi.queue({
        status: filter === 'All' ? undefined : filter,
        limit: 100,
      });
      if (result.kind === 'ok') {
        this.queueRows.set(result.rows);
        return;
      }
      this.queueRows.set([]);
      if (result.kind === 'unavailable') this.queueUnavailable.set(true);
      else this.queueError.set(result.message);
    } finally {
      this.queueLoading.set(false);
    }
  }

  protected onQueueStatusChange(): void {
    this.page.set(1);
    void this.loadQueue();
  }

  protected readonly queueTableRows = computed<PaymentRow[]>(() =>
    this.queueRows().map((payment) => ({
      payment,
      ...this.applicationLabel(payment.applicationId),
    })),
  );

  protected readonly filteredQueueRows = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.queueTableRows();
    return this.queueTableRows().filter(
      (r) =>
        r.payment.referenceNumber.toLowerCase().includes(term) ||
        r.payment.applicationReference.toLowerCase().includes(term) ||
        r.applicant.toLowerCase().includes(term) ||
        r.businessName.toLowerCase().includes(term),
    );
  });

  protected readonly pagedQueueRows = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredQueueRows().slice(start, start + this.pageSize);
  });

  protected readonly queueView = signal<'list' | 'detail'>('list');
  protected readonly selectedPaymentId = signal<string | null>(null);
  protected readonly selectedPayment = computed(() => {
    const id = this.selectedPaymentId();
    return id ? this.queueRows().find((r) => r.id === id) ?? null : null;
  });

  protected openPayment(row: PaymentRow): void {
    this.selectedPaymentId.set(row.payment.id);
    this.queueView.set('detail');
  }

  protected backToQueue(): void {
    this.queueView.set('list');
    this.selectedPaymentId.set(null);
  }

  openApplicationRecord(applicationId: string): void {
    this.router.navigateByUrl(`/applications/${applicationId}`);
  }

  // ---- Verify / reject / void / reverse / refund / correct-receipt -------
  // Verifying and recording the Official Receipt number are the SAME real
  // call — there is no separate "attach OR" step (see StaffPaymentsApi).

  protected readonly verifyTarget = signal<PaymentQueueRow | null>(null);

  protected openVerify(payment: PaymentQueueRow): void {
    if (!this.canVerifyPayment()) {
      this.toast.error("You don't have permission to verify this payment.");
      return;
    }
    this.verifyTarget.set(payment);
  }

  protected cancelVerify(): void {
    this.verifyTarget.set(null);
  }

  protected async confirmVerify(officialReceiptNumber: string): Promise<void> {
    const payment = this.verifyTarget();
    this.verifyTarget.set(null);
    if (!payment || !officialReceiptNumber.trim()) {
      this.toast.error('Enter the Official Receipt number before verifying.');
      return;
    }
    const result = await this.paymentsApi.verifyPayment(payment.id, officialReceiptNumber.trim());
    if (result.kind === 'done') {
      this.toast.success('Payment verified.');
      await this.afterPaymentChange(payment.applicationId);
    } else {
      // Self-verification (the officer who submitted/recorded this payment
      // may not also confirm it) comes back here as the server's own wording.
      this.toast.error(
        result.kind === 'unavailable' ? 'This deployment cannot verify payments yet.' : result.message,
      );
    }
  }

  protected readonly rejectTarget = signal<PaymentQueueRow | null>(null);

  protected openReject(payment: PaymentQueueRow): void {
    if (!this.canVerifyPayment()) {
      this.toast.error("You don't have permission to reject this payment.");
      return;
    }
    this.rejectTarget.set(payment);
  }

  protected cancelReject(): void {
    this.rejectTarget.set(null);
  }

  protected async confirmReject(reason: string): Promise<void> {
    const payment = this.rejectTarget();
    this.rejectTarget.set(null);
    if (!payment || !reason.trim()) {
      this.toast.error('Add a reason before rejecting this payment.');
      return;
    }
    const result = await this.paymentsApi.rejectPayment(payment.id, reason.trim());
    if (result.kind === 'done') {
      this.toast.success('Payment rejected.');
      await this.afterPaymentChange(payment.applicationId);
    } else {
      this.toast.error(result.kind === 'unavailable' ? 'This deployment cannot reject payments yet.' : result.message);
    }
  }

  protected readonly adjustTarget = signal<{ payment: PaymentQueueRow; type: 'Void' | 'Reverse' | 'Refund' } | null>(null);

  protected openAdjust(payment: PaymentQueueRow, type: 'Void' | 'Reverse' | 'Refund'): void {
    if (!this.canAdjustPayment()) {
      this.toast.error("You don't have permission to adjust this payment.");
      return;
    }
    this.adjustTarget.set({ payment, type });
  }

  protected cancelAdjust(): void {
    this.adjustTarget.set(null);
  }

  protected async confirmAdjust(reason: string): Promise<void> {
    const target = this.adjustTarget();
    this.adjustTarget.set(null);
    if (!target || !reason.trim()) {
      this.toast.error('Add a reason before continuing.');
      return;
    }
    const { payment, type } = target;
    const trimmed = reason.trim();
    const result =
      type === 'Void'
        ? await this.paymentsApi.voidPayment(payment.id, trimmed)
        : type === 'Reverse'
          ? await this.paymentsApi.reversePayment(payment.id, trimmed)
          : await this.paymentsApi.refundPayment(payment.id, trimmed);
    if (result.kind === 'done') {
      this.toast.success(`Payment ${type === 'Void' ? 'voided' : type === 'Reverse' ? 'reversed' : 'refunded'}.`);
      await this.afterPaymentChange(payment.applicationId);
    } else {
      this.toast.error(
        result.kind === 'unavailable' ? 'This deployment cannot adjust payments yet.' : result.message,
      );
    }
  }

  /**
   * A printable view of a real, verified payment — every field on it (OR
   * number, reference, amount, method, payer, application) already lives on
   * this same `PaymentQueueRow`, fetched from `GET /staff/payments`/
   * `GET /staff/applications/:id`. Nothing here is generated or stored server
   * side; it is a formatted read of the one real payment row, the same way
   * `openCorrectReceipt` below opens a form over that row rather than a copy
   * of it.
   */
  protected readonly receiptTarget = signal<PaymentQueueRow | null>(null);

  protected openReceipt(payment: PaymentQueueRow): void {
    this.receiptTarget.set(payment);
  }

  protected closeReceipt(): void {
    this.receiptTarget.set(null);
  }

  protected printReceipt(): void {
    window.print();
  }

  protected readonly correctReceiptTarget = signal<PaymentQueueRow | null>(null);
  protected correctReceiptForm = { officialReceiptNumber: '', reason: '' };

  protected openCorrectReceipt(payment: PaymentQueueRow): void {
    if (!this.canVerifyPayment()) return;
    this.correctReceiptForm = { officialReceiptNumber: payment.officialReceiptNumber ?? '', reason: '' };
    this.correctReceiptTarget.set(payment);
  }

  protected cancelCorrectReceipt(): void {
    this.correctReceiptTarget.set(null);
  }

  protected async confirmCorrectReceipt(): Promise<void> {
    const payment = this.correctReceiptTarget();
    if (!payment || !this.correctReceiptForm.officialReceiptNumber.trim() || !this.correctReceiptForm.reason.trim()) {
      this.toast.error('Enter both the corrected OR number and a reason.');
      return;
    }
    const result = await this.paymentsApi.correctReceipt(
      payment.id,
      this.correctReceiptForm.officialReceiptNumber.trim(),
      this.correctReceiptForm.reason.trim(),
    );
    if (result.kind === 'done') {
      this.toast.success('Official Receipt number corrected.');
      await this.afterPaymentChange(payment.applicationId);
    } else {
      this.toast.error(
        result.kind === 'unavailable' ? 'This deployment cannot correct a receipt yet.' : result.message,
      );
    }
    this.correctReceiptTarget.set(null);
  }

  /** Reloads whichever real data just changed underneath — the global queue always, and the Assessment Workspace too when the payment belonged to the application currently open there. */
  private async afterPaymentChange(applicationId: string): Promise<void> {
    await this.loadQueue();
    if (this.applicationId() === applicationId) await this.loadWorkspace(applicationId);
    if (this.queueView() === 'detail') this.backToQueue();
  }

  // ============================================================
  // Fee Schedule tab — GET/POST /staff/config/fee-schedules
  // ============================================================

  protected readonly permitTypeOptions = ALL_PERMIT_TYPES;
  protected readonly schedulesLoading = signal(false);
  protected readonly schedulesUnavailable = signal(false);
  protected readonly schedulesError = signal<string | null>(null);
  protected readonly schedules = signal<readonly FeeSchedule[]>([]);

  protected async loadSchedules(): Promise<void> {
    this.schedulesLoading.set(true);
    this.schedulesUnavailable.set(false);
    this.schedulesError.set(null);
    try {
      const result = await this.feeConfigApi.schedules();
      if (result.kind === 'ok') {
        this.schedules.set(result.schedules);
        return;
      }
      this.schedules.set([]);
      if (result.kind === 'unavailable') this.schedulesUnavailable.set(true);
      else this.schedulesError.set(result.message);
    } finally {
      this.schedulesLoading.set(false);
    }
  }

  protected readonly expandedScheduleVersion = signal<string | null>(null);
  protected toggleSchedule(version: string): void {
    this.expandedScheduleVersion.update((current) => (current === version ? null : version));
  }

  // ---- Publishing a new schedule (minimal: build entries one at a time) --

  protected readonly showPublishForm = signal(false);
  protected publishForm = { version: '', effectiveFrom: '', publishedBy: '' };
  protected readonly publishEntries = signal<FeeScheduleEntry[]>([]);
  protected newEntry: { permitType: PermitType; line: FeeLine; amount: string; basis: string } = {
    permitType: ALL_PERMIT_TYPES[0],
    line: 'filing',
    amount: '',
    basis: '',
  };

  protected openPublishForm(): void {
    if (!this.canConfigurePayments()) return;
    this.publishForm = { version: '', effectiveFrom: new Date().toISOString().slice(0, 10), publishedBy: '' };
    this.publishEntries.set([]);
    this.showPublishForm.set(true);
  }

  protected cancelPublishForm(): void {
    this.showPublishForm.set(false);
  }

  protected addPublishEntry(): void {
    const pesos = Number(this.newEntry.amount);
    if (!Number.isFinite(pesos) || pesos < 0) {
      this.toast.error('Enter a valid, non-negative amount.');
      return;
    }
    if (!this.newEntry.basis.trim()) {
      this.toast.error('Name the ordinance or issuance this line rests on.');
      return;
    }
    const entry: FeeScheduleEntry = {
      permitType: this.newEntry.permitType,
      line: this.newEntry.line,
      amountCentavos: Math.round(pesos * 100),
      basis: this.newEntry.basis.trim(),
    };
    this.publishEntries.update((rows) => [
      ...rows.filter((r) => !(r.permitType === entry.permitType && r.line === entry.line)),
      entry,
    ]);
    this.newEntry = { ...this.newEntry, amount: '', basis: '' };
  }

  protected removePublishEntry(entry: FeeScheduleEntry): void {
    this.publishEntries.update((rows) =>
      rows.filter((r) => !(r.permitType === entry.permitType && r.line === entry.line)),
    );
  }

  protected async confirmPublish(): Promise<void> {
    if (!this.canConfigurePayments()) return;
    const { version, effectiveFrom, publishedBy } = this.publishForm;
    if (!version.trim() || !effectiveFrom || !publishedBy.trim()) {
      this.toast.error('Version, effective date, and the authorizing ordinance/issuance are all required.');
      return;
    }
    if (this.publishEntries().length === 0) {
      this.toast.error('Add at least one fee line before publishing.');
      return;
    }
    // `feeConfigApi.publish()` only ever REJECTS for something that isn't an
    // `ApiError` at all (a genuine network failure, a non-Problem-Details
    // response) — its own catch block turns every real HTTP refusal,
    // including this one, into a resolved `{kind:'refused', message}`. That
    // rejection path had nothing here to catch it: an uncaught rejection is
    // silent to a user (Angular only logs it to the console), which is
    // exactly the "no toast, no inline error, nothing" symptom a past-date
    // Effective From produced — the server's own clear, helpful refusal
    // reason was being computed and then never given anywhere to land.
    try {
      const result = await this.feeConfigApi.publish({
        version: version.trim(),
        effectiveFrom,
        publishedBy: publishedBy.trim(),
        entries: this.publishEntries(),
      });
      if (result.kind === 'done') {
        this.toast.success(`Fee schedule "${result.schedule.version}" published.`);
        this.showPublishForm.set(false);
        await this.loadSchedules();
        return;
      }
      this.toast.error(
        result.kind === 'unavailable' ? 'This deployment cannot publish a fee schedule yet.' : result.message,
      );
    } catch (error) {
      this.toast.error(
        error instanceof Error && error.message !== '' ? error.message : 'That could not be published. Try again.',
      );
    }
  }

  // ============================================================
  // Configuration tab
  // ============================================================

  protected readonly configSubTabs: { key: ConfigSubTab; label: string }[] = [
    { key: 'payment-methods', label: 'Payment Methods' },
    { key: 'bank-information', label: 'Bank Information' },
    { key: 'payroll', label: 'Payroll' },
  ];
  protected readonly configSubTab = signal<ConfigSubTab>('payment-methods');

  // ---- Payment Methods sub-tab — GET/PUT /staff/config/payment-methods ---

  protected readonly methodsLoading = signal(false);
  protected readonly methodsUnavailable = signal(false);
  protected readonly methodsError = signal<string | null>(null);
  protected readonly paymentMethods = signal<readonly PaymentMethodConfig[]>([]);

  protected async loadPaymentMethods(): Promise<void> {
    this.methodsLoading.set(true);
    this.methodsUnavailable.set(false);
    this.methodsError.set(null);
    try {
      const result = await this.feeConfigApi.methods();
      if (result.kind === 'ok') {
        this.paymentMethods.set(result.methods);
        return;
      }
      this.paymentMethods.set([]);
      if (result.kind === 'unavailable') this.methodsUnavailable.set(true);
      else this.methodsError.set(result.message);
    } finally {
      this.methodsLoading.set(false);
    }
  }

  protected async toggleMethodActive(method: PaymentMethodConfig, event: Event): Promise<void> {
    const checkbox = event.target as HTMLInputElement;
    if (!this.canConfigurePayments()) {
      // The click already flipped the checkbox's own DOM state before this
      // handler ran (native checkbox behavior) — revert it immediately
      // rather than leaving it showing the attempted, refused value.
      checkbox.checked = method.active;
      this.toast.error("You don't have permission to change payment methods.");
      return;
    }
    const result = await this.feeConfigApi.setMethod(method.method, { active: !method.active });
    if (result.kind === 'done') {
      this.toast.success(`"${method.label}" ${result.active ? 'activated' : 'deactivated'}.`);
      await this.loadPaymentMethods();
    } else {
      // Real refusal (e.g. turning off the last active method would leave
      // applicants with no way to pay at all) — `method.active` never
      // changed, but the checkbox's own DOM property already flipped as
      // soon as it was clicked. Angular's `[checked]="method.active"`
      // binding only rewrites the DOM `checked` property when the BOUND
      // VALUE changes since it last wrote it; here the value is still the
      // same `true`/`false` it always was, so Angular sees nothing to
      // update and leaves the browser's own already-flipped state in
      // place — the checkbox is left showing exactly the attempted (and
      // rejected) value. Setting the DOM property back explicitly is the
      // only thing that actually corrects it.
      checkbox.checked = method.active;
      this.toast.error(
        result.kind === 'unavailable' ? 'This deployment cannot change payment methods yet.' : result.message,
      );
    }
  }

  protected readonly editingMethodInstructions = signal<string | null>(null);
  protected instructionsDraft = '';

  protected openEditInstructions(method: PaymentMethodConfig): void {
    if (!this.canConfigurePayments()) return;
    this.instructionsDraft = method.instructions;
    this.editingMethodInstructions.set(method.method);
  }

  protected cancelEditInstructions(): void {
    this.editingMethodInstructions.set(null);
  }

  protected async saveInstructions(method: PaymentMethodConfig): Promise<void> {
    const result = await this.feeConfigApi.setMethod(method.method, { instructions: this.instructionsDraft });
    if (result.kind === 'done') {
      this.toast.success(`Instructions for "${method.label}" saved.`);
      this.editingMethodInstructions.set(null);
      await this.loadPaymentMethods();
    } else {
      this.toast.error(
        result.kind === 'unavailable' ? 'This deployment cannot change payment methods yet.' : result.message,
      );
    }
  }

  // ---- Bank Information sub-tab -------------------------------------------
  // Left as a clearly-labeled local-only mock — see the note in the
  // template. The real, wired equivalent is the free-text "instructions" on
  // the Bank Transfer payment method above; the backend has no structured
  // bank-account record at all.

  protected readonly bankInfo = this.paymentConfig.bankInfo;
  protected readonly editingBankInfo = signal(false);
  protected bankInfoForm: OfficeBankInfo = { ...DEFAULT_BANK_INFO };

  protected openEditBankInfo(): void {
    if (!this.canConfigurePayments()) return;
    this.bankInfoForm = { ...this.bankInfo() };
    this.editingBankInfo.set(true);
  }

  protected cancelEditBankInfo(): void {
    this.editingBankInfo.set(false);
  }

  protected saveBankInfo(): void {
    if (!this.canConfigurePayments()) {
      this.toast.error("You don't have permission to edit bank information.");
      return;
    }
    const { bankName, accountName, accountNumber, branch } = this.bankInfoForm;
    if (!bankName.trim() || !accountName.trim() || !accountNumber.trim()) {
      this.toast.error('Bank Name, Account Name, and Account Number are required.');
      return;
    }
    this.paymentConfig.updateBankInfo(
      { bankName: bankName.trim(), accountName: accountName.trim(), accountNumber: accountNumber.trim(), branch: branch.trim() },
      this.session.name() || 'Super Admin',
    );
    this.editingBankInfo.set(false);
    this.toast.success('Bank information saved (local only — not sent anywhere real; see the note above).');
  }

  // ---- Payroll sub-tab — untouched, out of scope for this pass -----------

  protected readonly payrollRows = this.payrollStore.staff;
  protected readonly editingPayrollId = signal<string | null>(null);
  protected payrollForm: {
    name: string;
    position: string;
    monthlySalary: string;
    dateHired: string;
  } = { name: '', position: '', monthlySalary: '', dateHired: '' };

  protected openAddPayroll(): void {
    if (!this.canConfigurePayments()) return;
    this.payrollForm = { name: '', position: '', monthlySalary: '', dateHired: '' };
    this.editingPayrollId.set('new');
  }

  protected openEditPayroll(staff: PayrollStaffMember): void {
    if (!this.canConfigurePayments()) return;
    this.payrollForm = {
      name: staff.name,
      position: staff.position,
      monthlySalary:
        staff.monthlySalaryCentavos !== null ? (staff.monthlySalaryCentavos / 100).toFixed(2) : '',
      dateHired: staff.dateHired ?? '',
    };
    this.editingPayrollId.set(staff.id);
  }

  protected cancelEditPayroll(): void {
    this.editingPayrollId.set(null);
  }

  protected savePayroll(): void {
    if (!this.canConfigurePayments()) {
      this.toast.error("You don't have permission to edit payroll.");
      return;
    }
    const id = this.editingPayrollId();
    if (!id) return;
    if (!this.payrollForm.name.trim() || !this.payrollForm.position.trim()) {
      this.toast.error('Name and Position are required.');
      return;
    }
    const actor = this.session.name() || 'Super Admin';
    const patch = {
      name: this.payrollForm.name.trim(),
      position: this.payrollForm.position.trim(),
      monthlySalaryCentavos: this.payrollForm.monthlySalary
        ? Math.round(Number(this.payrollForm.monthlySalary) * 100)
        : null,
      dateHired: this.payrollForm.dateHired || null,
    };
    if (id === 'new') {
      this.payrollStore.addStaff(patch, actor);
      this.toast.success(`"${patch.name}" added to the payroll roster.`);
    } else {
      this.payrollStore.updateStaff(id, patch, actor);
      this.toast.success(`"${patch.name}" updated.`);
    }
    this.editingPayrollId.set(null);
  }

  protected togglePayrollStatus(staff: PayrollStaffMember): void {
    if (!this.canConfigurePayments()) {
      this.toast.error("You don't have permission to change payroll status.");
      return;
    }
    const nextStatus = staff.status === 'Active' ? 'Inactive' : 'Active';
    this.payrollStore.setStaffStatus(staff.id, nextStatus, this.session.name() || 'Super Admin');
    this.toast.success(`"${staff.name}" marked ${nextStatus}.`);
  }

  // ---- Export ---------------------------------------------------------------

  protected exportQueue(): void {
    const rows = this.filteredQueueRows();
    // `downloadCsv` writes nothing for an empty set, so "Exported 0
    // payments." announced a file that was never created.
    if (rows.length === 0) {
      this.toast.info('Nothing to export — no payments match the current view.');
      return;
    }
    downloadCsv(
      'payments',
      rows.map((r) => ({
        'Payment ID': r.payment.id,
        Application: r.payment.applicationReference,
        Applicant: r.applicant,
        'Business / Project': r.businessName,
        Amount: formatPHP(r.payment.amountCentavos),
        Method: r.payment.method,
        Status: r.payment.status,
        'OR No.': r.payment.officialReceiptNumber ?? '',
        'Submitted At': r.payment.submittedAt,
      })),
    );
    this.toast.success(`Exported ${rows.length} payment${rows.length === 1 ? '' : 's'}.`);
  }
}
