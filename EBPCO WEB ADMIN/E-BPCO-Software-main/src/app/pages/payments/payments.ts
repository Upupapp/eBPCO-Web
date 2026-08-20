import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Topbar } from '../../shared/topbar/topbar';
import { Icon } from '../../shared/icon/icon';
import { Avatar } from '../../shared/avatar/avatar';
import { KpiCard } from '../../shared/kpi-card/kpi-card';
import { Pagination } from '../../shared/pagination/pagination';
import { FilterPanel } from '../../shared/filter-panel/filter-panel';
import { downloadCsv } from '../../shared/utils/export-csv';
import { ApplicationStore } from '../../core/domain/application-store';
import { AssessmentStore } from '../../core/domain/assessment-store';
import { PaymentConfigStore } from '../../core/domain/payment-config-store';
import { SessionService } from '../../core/session/session.service';
import { ACTION_PERMISSIONS } from '../../core/session/permissions';
import { ALL_PERMIT_TYPES, PermitType } from '../../core/domain/permit.model';
import { departmentName } from '../../core/domain/department.model';
import {
  Assessment,
  AssessmentLineItem,
  AssessmentStatus,
} from '../../core/domain/assessment.model';
import {
  CollectingAgency,
  PaymentMethod,
  PaymentTransaction,
  PaymentTransactionStatus,
} from '../../core/domain/payment.model';
import { FeeApplicability, FeeRule } from '../../core/domain/fee-rule.model';
import { DocumentPreview } from '../../shared/document-preview/document-preview';

type PaymentsTab = 'assessments' | 'transactions' | 'matrix' | 'configuration';

function formatPHP(centavos: number | null): string {
  if (centavos === null) return 'Requires assessor input';
  return `₱${(centavos / 100).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function statusClass(status: string): string {
  return status.toLowerCase().replace(/[\s_]+/g, '-');
}

interface AssessmentRow {
  assessment: Assessment;
  applicationId: string;
  applicant: string;
  /** Canonical relationship — see ApplicationStore.getApplicationContext. Never derived from `applicant`; one applicant can own multiple businesses. */
  businessId: string;
  businessName: string;
  permitType: string;
}

interface TransactionRow {
  txn: PaymentTransaction;
  applicant: string;
  businessId: string;
  businessName: string;
  permitType: string;
  assessmentVersion: number;
}

@Component({
  selector: 'app-payments',
  imports: [Topbar, Icon, Avatar, KpiCard, Pagination, FormsModule, FilterPanel, DocumentPreview],
  templateUrl: './payments.html',
  styleUrl: './payments.scss',
})
export class Payments {
  private readonly store = inject(ApplicationStore);
  protected readonly assessmentStore = inject(AssessmentStore);
  protected readonly paymentConfig = inject(PaymentConfigStore);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  /** Bound to the `?tab=` query param (via withComponentInputBinding) — lets another page (Permit Release > Permit Types' "Manage Fee Rules" link) land directly on a specific tab. */
  readonly tab = input<PaymentsTab | null>(null);
  /** Bound to the `?permitType=` query param — pre-selects the Permit Fee Matrix tab's own permit-type filter. */
  readonly queryPermitType = input<PermitType | null>(null, { alias: 'permitType' });

  constructor() {
    // A due-date-derived status ('Overdue') is only ever true "as of
    // now" — refresh once per page load rather than trusting whatever
    // was computed at seed/construction time.
    this.assessmentStore.refreshOverdueStatuses();

    // Applies the incoming query params once, the same way selectTab()
    // would — deliberately NOT re-run on every input change so the
    // user's own subsequent tab clicks aren't overridden.
    effect(() => {
      const tab = this.tab();
      const permitType = this.queryPermitType();
      if (tab) this.activeTab.set(tab);
      if (permitType) this.matrixPermitType.set(permitType);
    });
  }

  // ---- Tabs ---------------------------------------------------------------

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

  protected readonly tabs: { key: PaymentsTab; label: string; icon: string }[] = [
    { key: 'assessments', label: 'Assessments', icon: 'file-text' },
    { key: 'transactions', label: 'Transactions', icon: 'wallet' },
    { key: 'matrix', label: 'Permit Fee Matrix', icon: 'grid' },
    { key: 'configuration', label: 'Configuration', icon: 'settings' },
  ];

  protected readonly visibleTabs = computed(() =>
    this.tabs.filter((t) => t.key !== 'configuration' || this.canConfigurePayments()),
  );

  protected readonly activeTab = signal<PaymentsTab>('assessments');

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
    businessId: string;
    businessName: string;
    permitType: string;
  } {
    const ctx = this.store.getApplicationContext(applicationId);
    return {
      applicant: ctx?.applicant ?? '—',
      businessId: ctx?.businessId ?? '',
      businessName: ctx?.businessLabel ?? 'Not provided',
      permitType: ctx?.permitType ?? '—',
    };
  }

  // ---- Tab 1: Assessments ---------------------------------------------------

  protected readonly assessmentStatusOptions: AssessmentStatus[] = [
    'Draft',
    'For Approval',
    'Issued',
    'Partially Paid',
    'Paid',
    'Overdue',
    'Superseded',
    'Voided',
  ];
  protected readonly assessmentStatusFilter = signal<'All' | AssessmentStatus>('All');

  protected readonly assessmentRows = computed<AssessmentRow[]>(() => {
    return this.assessmentStore
      .allAssessments()
      .map((assessment) => ({
        assessment,
        applicationId: assessment.applicationId,
        ...this.applicationLabel(assessment.applicationId),
      }))
      .sort(
        (a, b) => b.assessment.createdAtValue.getTime() - a.assessment.createdAtValue.getTime(),
      );
  });

  protected readonly filteredAssessmentRows = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.assessmentStatusFilter();
    return this.assessmentRows().filter((r) => {
      if (status !== 'All' && r.assessment.status !== status) return false;
      if (!term) return true;
      return (
        r.applicationId.toLowerCase().includes(term) ||
        r.applicant.toLowerCase().includes(term) ||
        r.businessName.toLowerCase().includes(term) ||
        r.permitType.toLowerCase().includes(term) ||
        (r.assessment.opsNumber ?? '').toLowerCase().includes(term)
      );
    });
  });

  protected readonly pagedAssessmentRows = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredAssessmentRows().slice(start, start + this.pageSize);
  });

  protected readonly assessmentSummary = computed(() => {
    const rows = this.assessmentStore.allAssessments();
    return {
      draft: rows.filter((a) => a.status === 'Draft').length,
      forApproval: rows.filter((a) => a.status === 'For Approval').length,
      issued: rows.filter((a) => a.status === 'Issued').length,
      partiallyPaid: rows.filter((a) => a.status === 'Partially Paid').length,
      paid: rows.filter((a) => a.status === 'Paid').length,
      overdue: rows.filter((a) => a.status === 'Overdue').length,
    };
  });

  protected readonly assessmentView = signal<'list' | 'detail'>('list');
  protected readonly selectedAssessmentId = signal<string | null>(null);
  protected readonly selectedAssessment = computed(() => {
    const id = this.selectedAssessmentId();
    return id ? this.assessmentStore.getAssessmentById(id) : undefined;
  });
  protected readonly selectedAssessmentApp = computed(() => {
    const a = this.selectedAssessment();
    return a ? this.store.getById(a.applicationId) : undefined;
  });
  protected readonly selectedAssessmentHistory = computed(() => {
    const a = this.selectedAssessment();
    return a ? this.assessmentStore.getAssessments(a.applicationId) : [];
  });
  protected readonly selectedAssessmentTransactions = computed(() => {
    const a = this.selectedAssessment();
    return a ? this.assessmentStore.getTransactionsForAssessment(a.id) : [];
  });

  openAssessment(row: AssessmentRow): void {
    this.selectedAssessmentId.set(row.assessment.id);
    this.assessmentView.set('detail');
  }

  backToAssessments(): void {
    this.assessmentView.set('list');
    this.selectedAssessmentId.set(null);
  }

  protected departmentLabel(id: string): string {
    return departmentName(id);
  }

  protected formatPHP = formatPHP;
  protected statusClass = statusClass;

  protected calculationSummary(
    rule: Pick<FeeRule, 'calculationType' | 'unitLabel' | 'percentageOf' | 'flatAmountCentavos'>,
  ): string {
    switch (rule.calculationType) {
      case 'flat':
        return rule.flatAmountCentavos !== null
          ? formatPHP(rule.flatAmountCentavos)
          : 'Flat — requires assessor input';
      case 'per-unit':
        return rule.unitLabel ? `Per-unit (${rule.unitLabel})` : 'Per-unit';
      case 'percentage':
        return rule.percentageOf ? `Percentage of ${rule.percentageOf}` : 'Percentage';
      case 'bracketed':
        return 'Bracketed (see legal basis for the schedule)';
      case 'manual':
        return 'Manual assessment';
    }
  }

  // ---- Draft editing (line amounts / inclusion / due date) ----------------

  protected setLineAmount(assessmentId: string, line: AssessmentLineItem, value: string): void {
    if (!this.canEditAssessment()) return;
    const pesos = Number(value);
    if (!Number.isFinite(pesos) || pesos < 0) return;
    this.assessmentStore.setLineAmount(
      assessmentId,
      line.feeRuleId,
      Math.round(pesos * 100),
      this.session.name() || 'Payment Officer',
      this.session.role() ?? 'Payment Officer',
    );
  }

  protected toggleLineIncluded(assessmentId: string, line: AssessmentLineItem): void {
    if (!this.canEditAssessment()) return;
    this.assessmentStore.setLineIncluded(
      assessmentId,
      line.feeRuleId,
      !line.included,
      this.session.name() || 'Payment Officer',
      this.session.role() ?? 'Payment Officer',
    );
  }

  protected updateDueDate(assessmentId: string, value: string): void {
    if (!this.canEditAssessment() || !value) return;
    this.assessmentStore.updateDraftAssessment(
      assessmentId,
      { dueDate: value },
      this.session.name() || 'Payment Officer',
      this.session.role() ?? 'Payment Officer',
    );
  }

  protected submitForApproval(assessment: Assessment): void {
    if (!this.canEditAssessment()) return;
    this.assessmentStore.submitForApproval(
      assessment.id,
      this.session.name() || 'Staff',
      this.session.role() ?? 'Payment Officer',
    );
  }

  protected approveAssessment(assessment: Assessment): void {
    if (!this.canApproveAssessment()) return;
    this.assessmentStore.approveAssessment(
      assessment.id,
      this.session.name() || 'Administrator',
      this.session.role() ?? 'Administrator',
    );
  }

  protected issueOrderOfPayment(assessment: Assessment): void {
    if (!this.canApproveAssessment()) return;
    this.assessmentStore.issueOrderOfPayment(
      assessment.id,
      this.session.name() || 'Administrator',
      this.session.role() ?? 'Administrator',
    );
    this.store.refreshPaymentProjection(
      assessment.applicationId,
      this.session.name() || 'Administrator',
      this.session.role() ?? 'Administrator',
    );
  }

  protected readonly canReviseSelected = computed(() => {
    const a = this.selectedAssessment();
    if (!a || (a.status !== 'Issued' && a.status !== 'Overdue' && a.status !== 'Partially Paid'))
      return false;
    return !this.selectedAssessmentTransactions().some((t) => t.status === 'Verified' && !t.isVoid);
  });

  protected reviseAssessment(): void {
    const a = this.selectedAssessment();
    const app = this.selectedAssessmentApp();
    if (!a || !app || !this.canEditAssessment() || !this.canReviseSelected()) return;
    const revised = this.assessmentStore.reviseIssuedAssessment(
      a.id,
      app.permitType,
      this.session.name() || 'Payment Officer',
      this.session.role() ?? 'Payment Officer',
    );
    if (revised) {
      this.store.refreshPaymentProjection(
        app.id,
        this.session.name() || 'Payment Officer',
        this.session.role() ?? 'Payment Officer',
      );
      this.selectedAssessmentId.set(revised.id);
    }
  }

  // ---- Recording a payment against the selected assessment ----------------

  protected readonly showPaymentForm = signal(false);
  protected readonly paymentFormError = signal('');
  protected paymentForm: {
    method: PaymentMethod;
    agency: CollectingAgency;
    amount: string;
    reference: string;
    proofFileName: string;
  } = { method: 'Onsite', agency: 'OBO/LGU', amount: '', reference: '', proofFileName: '' };

  protected openPaymentForm(): void {
    if (!this.canRecordPayment()) return;
    const balance = this.selectedAssessment()?.balanceCentavos ?? 0;
    this.paymentForm = {
      method: 'Onsite',
      agency: 'OBO/LGU',
      amount: (balance / 100).toFixed(2),
      reference: '',
      proofFileName: '',
    };
    this.paymentFormError.set('');
    this.showPaymentForm.set(true);
  }

  protected cancelPaymentForm(): void {
    this.showPaymentForm.set(false);
  }

  protected onProofFileChosen(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.paymentForm.proofFileName = input.files?.[0]?.name ?? '';
  }

  protected submitPaymentForm(): void {
    const a = this.selectedAssessment();
    if (!a || !this.canRecordPayment()) return;
    const amountCentavos = Math.round(Number(this.paymentForm.amount) * 100);
    const actor = this.session.name() || 'Cashier';
    const role = this.session.role() ?? 'Payment Officer';
    const txn =
      this.paymentForm.method === 'Onsite'
        ? this.assessmentStore.recordOnsitePayment(
            a.id,
            amountCentavos,
            this.paymentForm.reference,
            this.paymentForm.agency,
            actor,
            role,
          )
        : this.assessmentStore.submitBankTransferProof(
            a.id,
            amountCentavos,
            this.paymentForm.reference,
            this.paymentForm.proofFileName,
            this.paymentForm.agency,
            actor,
            role,
          );
    if (!txn) {
      this.paymentFormError.set(
        this.paymentForm.method === 'Bank Transfer' && !this.paymentForm.proofFileName
          ? 'A proof-of-payment file is required for a bank transfer.'
          : 'Could not record this payment — check the amount (must not exceed the outstanding balance) and that the reference number hasn’t already been used.',
      );
      return;
    }
    this.store.refreshPaymentProjection(a.applicationId, actor, role);
    this.showPaymentForm.set(false);
  }

  // ---- Tab 2: Transactions --------------------------------------------------

  protected readonly txnPermitTypeFilter = signal<'All' | PermitType>('All');
  protected readonly txnMethodFilter = signal<'All' | PaymentMethod>('All');
  protected readonly txnAgencyFilter = signal<'All' | CollectingAgency>('All');
  protected readonly txnStatusFilter = signal<'All' | PaymentTransactionStatus>('All');
  protected readonly permitTypeOptions = ALL_PERMIT_TYPES;
  protected readonly txnStatusOptions: PaymentTransactionStatus[] = [
    'Pending Verification',
    'Verified',
    'Rejected',
    'Voided',
  ];
  protected readonly methodOptions: PaymentMethod[] = ['Onsite', 'Bank Transfer'];
  protected readonly agencyOptions: CollectingAgency[] = ['OBO/LGU', 'BFP'];

  protected readonly transactionRows = computed<TransactionRow[]>(() => {
    return this.assessmentStore
      .allTransactions()
      .map((txn) => {
        const app = this.applicationLabel(txn.applicationId);
        const assessment = this.assessmentStore.getAssessmentById(txn.assessmentId);
        return {
          txn,
          applicant: app.applicant,
          businessId: app.businessId,
          businessName: app.businessName,
          permitType: app.permitType,
          assessmentVersion: assessment?.version ?? 0,
        };
      })
      .sort((a, b) => b.txn.submittedAtValue.getTime() - a.txn.submittedAtValue.getTime());
  });

  protected readonly txnActiveFilterCount = computed(
    () =>
      (this.txnPermitTypeFilter() !== 'All' ? 1 : 0) +
      (this.txnMethodFilter() !== 'All' ? 1 : 0) +
      (this.txnAgencyFilter() !== 'All' ? 1 : 0) +
      (this.txnStatusFilter() !== 'All' ? 1 : 0),
  );

  protected clearTxnFilters(): void {
    this.txnPermitTypeFilter.set('All');
    this.txnMethodFilter.set('All');
    this.txnAgencyFilter.set('All');
    this.txnStatusFilter.set('All');
    this.page.set(1);
  }

  protected readonly filteredTransactionRows = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const permitType = this.txnPermitTypeFilter();
    const method = this.txnMethodFilter();
    const agency = this.txnAgencyFilter();
    const status = this.txnStatusFilter();
    return this.transactionRows().filter((r) => {
      if (permitType !== 'All' && r.permitType !== permitType) return false;
      if (method !== 'All' && r.txn.method !== method) return false;
      if (agency !== 'All' && r.txn.agency !== agency) return false;
      if (status !== 'All' && r.txn.status !== status) return false;
      if (!term) return true;
      return (
        r.txn.id.toLowerCase().includes(term) ||
        r.txn.transactionReference.toLowerCase().includes(term) ||
        r.applicant.toLowerCase().includes(term) ||
        r.businessName.toLowerCase().includes(term) ||
        r.txn.applicationId.toLowerCase().includes(term)
      );
    });
  });

  protected readonly pagedTransactionRows = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredTransactionRows().slice(start, start + this.pageSize);
  });

  protected readonly transactionView = signal<'list' | 'detail'>('list');
  protected readonly selectedTransactionId = signal<string | null>(null);
  protected readonly selectedTransaction = computed(() => {
    const id = this.selectedTransactionId();
    return id ? this.assessmentStore.getTransactionById(id) : undefined;
  });
  /** The applicant/business context for the currently open transaction — mirrors selectedAssessmentApp above; this detail view previously showed neither. */
  protected readonly selectedTransactionApp = computed(() => {
    const t = this.selectedTransaction();
    return t ? this.store.getById(t.applicationId) : undefined;
  });
  protected readonly selectedTransactionAdjustments = computed(() => {
    const id = this.selectedTransactionId();
    return id ? this.assessmentStore.getAdjustmentsForTransaction(id) : [];
  });

  openTransaction(row: TransactionRow): void {
    this.selectedTransactionId.set(row.txn.id);
    this.transactionView.set('detail');
  }

  backToTransactions(): void {
    this.transactionView.set('list');
    this.selectedTransactionId.set(null);
  }

  protected verifyTransaction(txn: PaymentTransaction): void {
    if (!this.canVerifyPayment()) return;
    const actor = this.session.name() || 'Payment Officer';
    const role = this.session.role() ?? 'Payment Officer';
    if (this.assessmentStore.verifyTransaction(txn.id, actor, role)) {
      this.store.refreshPaymentProjection(txn.applicationId, actor, role);
    }
  }

  protected readonly rejectTarget = signal<PaymentTransaction | null>(null);
  protected rejectReason = '';

  protected openReject(txn: PaymentTransaction): void {
    if (!this.canVerifyPayment()) return;
    this.rejectReason = '';
    this.rejectTarget.set(txn);
  }

  protected cancelReject(): void {
    this.rejectTarget.set(null);
  }

  protected confirmReject(): void {
    const txn = this.rejectTarget();
    if (!txn || !this.rejectReason.trim()) return;
    const actor = this.session.name() || 'Payment Officer';
    const role = this.session.role() ?? 'Payment Officer';
    if (this.assessmentStore.rejectTransaction(txn.id, actor, role, this.rejectReason)) {
      this.store.refreshPaymentProjection(txn.applicationId, actor, role);
    }
    this.rejectTarget.set(null);
  }

  protected readonly adjustTarget = signal<{
    txn: PaymentTransaction;
    type: 'Void' | 'Reversal' | 'Refund';
  } | null>(null);
  protected adjustReason = '';

  protected openAdjust(txn: PaymentTransaction, type: 'Void' | 'Reversal' | 'Refund'): void {
    if (!this.canAdjustPayment()) return;
    this.adjustReason = '';
    this.adjustTarget.set({ txn, type });
  }

  protected cancelAdjust(): void {
    this.adjustTarget.set(null);
  }

  protected confirmAdjust(): void {
    const target = this.adjustTarget();
    if (!target || !this.adjustReason.trim()) return;
    const actor = this.session.name() || 'Administrator';
    const role = this.session.role() ?? 'Administrator';
    const { txn, type } = target;
    const ok =
      type === 'Void'
        ? this.assessmentStore.voidTransaction(txn.id, actor, role, this.adjustReason)
        : type === 'Reversal'
          ? this.assessmentStore.reverseTransaction(txn.id, actor, role, this.adjustReason)
          : this.assessmentStore.refundTransaction(txn.id, actor, role, this.adjustReason);
    if (ok) this.store.refreshPaymentProjection(txn.applicationId, actor, role);
    this.adjustTarget.set(null);
  }

  protected readonly orForm = { orNumber: '', orDate: '', orIssuedBy: '' };
  protected readonly showOrForm = signal(false);
  // Explicit target rather than reading `selectedTransaction()` — this form
  // is opened from more than one table (the standalone Transaction detail
  // view AND the Payment Transactions table nested in an Assessment's
  // detail view), and only the former actually sets `selectedTransactionId`.
  protected readonly orFormTarget = signal<PaymentTransaction | null>(null);

  protected openOrForm(txn: PaymentTransaction): void {
    this.orFormTarget.set(txn);
    this.orForm.orNumber = '';
    this.orForm.orDate = new Date().toISOString().slice(0, 10);
    this.orForm.orIssuedBy = this.session.name() || '';
    this.showOrForm.set(true);
  }

  protected cancelOrForm(): void {
    this.showOrForm.set(false);
    this.orFormTarget.set(null);
  }

  protected submitOrForm(): void {
    const txn = this.orFormTarget();
    if (!txn || !this.orForm.orNumber.trim()) return;
    this.assessmentStore.attachOfficialReceipt(
      txn.id,
      this.orForm.orNumber,
      this.orForm.orDate,
      this.orForm.orIssuedBy,
    );
    this.showOrForm.set(false);
    this.orFormTarget.set(null);
  }

  protected readonly showReceiptPreview = signal(false);
  protected openReceiptPreview(): void {
    this.showReceiptPreview.set(true);
  }
  protected closeReceiptPreview(): void {
    this.showReceiptPreview.set(false);
  }

  openApplicationRecord(applicationId: string): void {
    this.router.navigateByUrl(`/applications/${applicationId}`);
  }

  // ---- Tab 3: Permit Fee Matrix ----------------------------------------------

  protected readonly matrixPermitType = signal<PermitType>(ALL_PERMIT_TYPES[0]);

  protected readonly matrixRows = computed(() =>
    this.paymentConfig.feeMatrixFor(this.matrixPermitType()),
  );

  protected applicabilityLabel(a: FeeApplicability): string {
    return a === 'required' ? 'Required' : a === 'conditional' ? 'Conditional' : 'Not Applicable';
  }

  // ---- Tab 4: Configuration ---------------------------------------------------

  protected readonly feeRules = this.paymentConfig.activeFeeRules;
  protected readonly methods = this.paymentConfig.methods;

  protected toggleFeeRuleActive(rule: FeeRule): void {
    if (!this.canConfigurePayments()) return;
    this.paymentConfig.setFeeRuleActive(rule.id, !rule.active);
  }

  protected toggleMethodActive(
    methodId: string,
    active: boolean,
    domainMethod: string | null,
  ): void {
    if (!this.canConfigurePayments() || !domainMethod) return;
    this.paymentConfig.setMethodActive(methodId, active);
  }

  protected readonly editingRule = signal<FeeRule | null>(null);
  protected editForm: {
    amount: string;
    unitAmount: string;
    percentageRate: string;
    effectiveDate: string;
    applicability: Partial<Record<PermitType, FeeApplicability>>;
  } = { amount: '', unitAmount: '', percentageRate: '', effectiveDate: '', applicability: {} };

  protected openEditRule(rule: FeeRule): void {
    if (!this.canConfigurePayments()) return;
    this.editForm = {
      amount: rule.flatAmountCentavos !== null ? (rule.flatAmountCentavos / 100).toFixed(2) : '',
      unitAmount:
        rule.unitAmountCentavos !== null ? (rule.unitAmountCentavos / 100).toFixed(2) : '',
      percentageRate: rule.percentageRate !== null ? String(rule.percentageRate * 100) : '',
      effectiveDate: new Date().toISOString().slice(0, 10),
      applicability: { ...rule.applicability },
    };
    this.editingRule.set(rule);
  }

  protected cancelEditRule(): void {
    this.editingRule.set(null);
  }

  protected setApplicability(type: PermitType, value: FeeApplicability): void {
    this.editForm.applicability = { ...this.editForm.applicability, [type]: value };
  }

  protected saveEditRule(): void {
    const rule = this.editingRule();
    if (!rule || !this.canConfigurePayments()) return;
    const patch: Partial<FeeRule> = {
      applicability: this.editForm.applicability,
      effectiveDate: this.editForm.effectiveDate || undefined,
    };
    if (rule.calculationType === 'flat' && this.editForm.amount) {
      patch.flatAmountCentavos = Math.round(Number(this.editForm.amount) * 100);
    }
    if (rule.calculationType === 'per-unit' && this.editForm.unitAmount) {
      patch.unitAmountCentavos = Math.round(Number(this.editForm.unitAmount) * 100);
      patch.requiresAssessorInput = false;
    }
    if (rule.calculationType === 'percentage' && this.editForm.percentageRate) {
      patch.percentageRate = Number(this.editForm.percentageRate) / 100;
      patch.requiresAssessorInput = false;
    }
    this.paymentConfig.updateFeeRule(rule.id, patch, this.session.name() || 'Super Admin');
    this.editingRule.set(null);
  }

  protected readonly historyFor = signal<string | null>(null);

  protected toggleHistory(ruleId: string): void {
    this.historyFor.update((current) => (current === ruleId ? null : ruleId));
  }

  protected feeRuleHistory(ruleId: string): FeeRule[] {
    return this.paymentConfig.feeRuleHistory(ruleId);
  }

  // ---- Export ---------------------------------------------------------------

  protected exportAssessments(): void {
    downloadCsv(
      'assessments',
      this.filteredAssessmentRows().map((r) => ({
        'Assessment ID': r.assessment.id,
        'Application ID': r.applicationId,
        Applicant: r.applicant,
        'Business ID': r.businessId,
        'Business / Project': r.businessName,
        'Permit Type': r.permitType,
        Version: r.assessment.version,
        Status: r.assessment.status,
        'OPS No.': r.assessment.opsNumber ?? '',
        Total: formatPHP(r.assessment.totalCentavos),
        Balance: formatPHP(r.assessment.balanceCentavos),
        'Due Date': r.assessment.dueDate ?? '',
      })),
    );
  }

  protected exportTransactions(): void {
    downloadCsv(
      'transactions',
      this.filteredTransactionRows().map((r) => ({
        'Transaction ID': r.txn.id,
        'Application ID': r.txn.applicationId,
        Applicant: r.applicant,
        'Business ID': r.businessId,
        'Business / Project': r.businessName,
        'Permit Type': r.permitType,
        Method: r.txn.method,
        Agency: r.txn.agency,
        Reference: r.txn.transactionReference,
        Amount: formatPHP(r.txn.amountCentavos),
        Status: r.txn.status,
        'OR No.': r.txn.orNumber ?? '',
        'Submitted At': r.txn.submittedAt,
      })),
    );
  }
}
