import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Topbar } from '../../shared/topbar/topbar';
import { Icon } from '../../shared/icon/icon';
import { Avatar } from '../../shared/avatar/avatar';
import { KpiCard, KpiIllustration, KpiTone } from '../../shared/kpi-card/kpi-card';
import { Pagination } from '../../shared/pagination/pagination';
import { FilterPanel } from '../../shared/filter-panel/filter-panel';
import { downloadCsv } from '../../shared/utils/export-csv';
import { ApplicationStore } from '../../core/domain/application-store';
import { SessionService } from '../../core/session/session.service';
import { ACTION_PERMISSIONS } from '../../core/session/permissions';
import { PaymentStatus } from '../../core/domain/status.model';
import { totalAssessmentCentavos } from '../../core/domain/payment.model';
import { PaymentConfigStore } from '../../core/domain/payment-config-store';
import { DocumentPreview } from '../../shared/document-preview/document-preview';

// Mirrors E-BPCO Mobile's PaymentAssessmentStatus labels
// (payment_assessment_model.dart). 'Not Yet Available' rows (not yet
// assessed) are excluded from this ledger entirely rather than shown with
// an invented amount.
type PayStatus = Exclude<PaymentStatus, 'Not Yet Available'>;

interface HistoryEntry {
  ref: string;
  amount: string;
  date: string;
  status: 'Paid' | 'Unsuccessful';
  method: string;
  verifiedBy: string;
}

interface PaymentRow {
  id: string;
  applicant: string;
  city: string;
  region: string;
  type: string;
  dateSubmitted: string;
  amountCentavos: number;
  amount: string;
  status: PayStatus;
  refNo: string;
  paymentMethod: string;
  // Mirrors E-BPCO Mobile's Building Permit fee line items exactly
  // (AssessmentPayment.assessmentLineItems in building_permit_model.dart).
  fees: {
    filing: string;
    processing: string;
    architectural: string;
    structural: string;
    electrical: string;
    others: string;
    total: string;
  };
  history: HistoryEntry[];
}

interface RingStat {
  label: string;
  value: string;
  icon: string;
  tone: KpiTone;
  illustration: KpiIllustration;
  pct: number;
  isTotal: boolean;
  support?: string;
  bars?: number[];
}

function formatPHP(centavos: number): string {
  return `₱${(centavos / 100).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

@Component({
  selector: 'app-payments',
  imports: [Topbar, Icon, Avatar, KpiCard, Pagination, FormsModule, FilterPanel, DocumentPreview],
  templateUrl: './payments.html',
  styleUrl: './payments.scss',
})
export class Payments {
  private readonly store = inject(ApplicationStore);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  // Fee amounts come from Super Admin Settings' PaymentConfigStore, never
  // a hardcoded literal in this component — a rate change there is
  // reflected here for anything not yet assessed, while an already-
  // recorded PaymentTransaction keeps the amount it was actually paid at.
  private readonly paymentConfig = inject(PaymentConfigStore);

  protected readonly canRecord = computed(() => {
    const role = this.session.role();
    return role ? ACTION_PERMISSIONS.recordPayment(role) : false;
  });
  protected readonly canVerify = computed(() => {
    const role = this.session.role();
    return role ? ACTION_PERMISSIONS.verifyPayment(role) : false;
  });

  protected readonly view = signal<'list' | 'detail'>('list');
  protected readonly selectedId = signal<string | null>(null);

  // Every row is derived from an actual ApplicationRecord + its real
  // PaymentTransaction history — the same records Applications/Dashboard
  // read, not a locally-invented 10-row table with its own IDs/dates.
  protected readonly rows = computed<PaymentRow[]>(() => {
    const feeSchedule = this.paymentConfig.feeSchedule();
    return this.store
      .applications()
      .filter((app) => app.paymentStatus !== 'Not Yet Available')
      .map((app): PaymentRow => {
        const txns = this.store.getPayments(app.id);
        const latest = txns[txns.length - 1];
        const amountCentavos = app.assessedAmountCentavos ?? totalAssessmentCentavos(feeSchedule);
        const history: HistoryEntry[] = txns.map((t) => ({
          ref: t.referenceNumber,
          amount: formatPHP(t.amountCentavos),
          date: t.submittedAt ?? app.dateSubmitted,
          status: t.status === 'Paid' ? 'Paid' : 'Unsuccessful',
          method: t.method ?? 'Onsite',
          verifiedBy: t.status === 'Paid' ? app.officer : '',
        }));
        return {
          id: app.id,
          applicant: app.applicant,
          city: app.location,
          region: 'Region V (Bicol Region)',
          type: app.permitType,
          dateSubmitted: app.dateSubmitted,
          amountCentavos,
          amount: formatPHP(amountCentavos),
          status: app.paymentStatus as PayStatus,
          refNo: latest?.referenceNumber ?? `OR-2026-${app.id.slice(-6)}`,
          paymentMethod: latest?.method ?? 'Onsite',
          fees: {
            filing: formatPHP(feeSchedule.filing),
            processing: formatPHP(feeSchedule.processing),
            architectural: formatPHP(feeSchedule.architectural),
            structural: formatPHP(feeSchedule.structural),
            electrical: formatPHP(feeSchedule.electrical),
            others: formatPHP(feeSchedule.others),
            total: formatPHP(amountCentavos),
          },
          history,
        };
      });
  });

  protected readonly selectedRow = computed(
    () => this.rows().find((r) => r.id === this.selectedId()) ?? null,
  );

  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly searchTerm = signal('');

  protected readonly statusFilter = signal<'All' | PayStatus>('All');
  protected readonly statusOptions: PayStatus[] = ['Paid', 'Pending Verification', 'Overdue'];

  protected readonly activeFilterCount = computed(() => (this.statusFilter() === 'All' ? 0 : 1));

  protected clearFilters(): void {
    this.statusFilter.set('All');
    this.page.set(1);
  }

  protected readonly filteredRows = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();
    return this.rows().filter((r) => {
      if (status !== 'All' && r.status !== status) return false;
      if (!term) return true;
      return (
        r.id.toLowerCase().includes(term) ||
        r.applicant.toLowerCase().includes(term) ||
        r.city.toLowerCase().includes(term) ||
        r.type.toLowerCase().includes(term)
      );
    });
  });

  protected readonly pagedRows = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredRows().slice(start, start + this.pageSize);
  });

  protected onSearchChange(): void {
    this.page.set(1);
  }

  // Ring totals are all derived from the same rows() the table shows —
  // "Total Payments" always equals the sum of the three status buckets,
  // and the buckets always equal what's actually filterable below.
  protected readonly ringStats = computed<RingStat[]>(() => {
    const rows = this.rows();
    const total = rows.length || 1;
    const pending = rows.filter((r) => r.status === 'Pending Verification').length;
    const paid = rows.filter((r) => r.status === 'Paid').length;
    const overdue = rows.filter((r) => r.status === 'Overdue').length;
    return [
      {
        label: 'Pending Verification',
        value: String(pending),
        icon: 'clock',
        tone: 'warning',
        illustration: 'pending',
        pct: Math.round((pending / total) * 100),
        isTotal: false,
        support: `${Math.round((pending / total) * 100)}% of all payments`,
      },
      {
        label: 'Paid',
        value: String(paid),
        icon: 'check-circle',
        tone: 'success',
        illustration: 'success',
        pct: Math.round((paid / total) * 100),
        isTotal: false,
        support: `${Math.round((paid / total) * 100)}% of all payments`,
      },
      {
        label: 'Overdue',
        value: String(overdue),
        icon: 'alert-triangle',
        tone: 'danger',
        illustration: 'critical',
        pct: Math.round((overdue / total) * 100),
        isTotal: false,
        support: `${Math.round((overdue / total) * 100)}% of all payments`,
      },
      {
        label: 'Total Payments',
        value: String(rows.length),
        icon: 'wallet',
        tone: 'info',
        illustration: 'payments',
        pct: 100,
        isTotal: true,
        support: 'Pending · Paid · Overdue',
        bars: [pending, paid, overdue],
      },
    ];
  });

  openDetail(row: PaymentRow): void {
    this.selectedId.set(row.id);
    this.view.set('detail');
  }

  backToList(): void {
    this.view.set('list');
  }

  openApplicationRecord(row: PaymentRow): void {
    this.router.navigateByUrl(`/applications/${row.id}`);
  }

  protected verifyPayment(row: PaymentRow): void {
    if (!this.canVerify()) return;
    this.store.verifyPayment(row.id, this.session.name() || 'Payment Officer');
  }

  // ---- Export / receipt ---------------------------------------------------

  private paymentCsvRow(row: PaymentRow) {
    return {
      'Application ID': row.id,
      Applicant: row.applicant,
      Location: row.city,
      Type: row.type,
      'Date Submitted': row.dateSubmitted,
      Amount: row.amount,
      Status: row.status,
      'Reference No.': row.refNo,
      'Payment Method': row.paymentMethod,
    };
  }

  protected exportVisible(): void {
    downloadCsv(
      'payments',
      this.filteredRows().map((row) => this.paymentCsvRow(row)),
    );
  }

  protected readonly showReceiptPreview = signal(false);

  protected openReceiptPreview(): void {
    this.showReceiptPreview.set(true);
  }

  protected closeReceiptPreview(): void {
    this.showReceiptPreview.set(false);
  }

  protected downloadReceipt(): void {
    const row = this.selectedRow();
    if (!row) return;
    downloadCsv(`receipt-${row.refNo}`, [
      {
        'Reference No.': row.refNo,
        Applicant: row.applicant,
        'Application ID': row.id,
        'Payment Method': row.paymentMethod,
        'Filing Fee': row.fees.filing,
        'Processing Fee': row.fees.processing,
        Architectural: row.fees.architectural,
        Structural: row.fees.structural,
        Electrical: row.fees.electrical,
        Others: row.fees.others,
        Total: row.fees.total,
        Status: row.status,
      },
    ]);
  }

  // ---- Record an onsite payment (the toolbar "+" action) -----------------
  // Per the "must attach to an existing assessed application, never
  // generate a new application ID" rule, this looks up an existing
  // application by ID rather than fabricating a new record.

  protected readonly showRecordPayment = signal(false);
  protected readonly recordPaymentError = signal('');
  protected newPayment = { applicationId: '', referenceNumber: '' };

  protected openRecordPayment(): void {
    if (!this.canRecord()) return;
    this.newPayment = { applicationId: '', referenceNumber: '' };
    this.recordPaymentError.set('');
    this.showRecordPayment.set(true);
  }

  protected cancelRecordPayment(): void {
    this.showRecordPayment.set(false);
  }

  protected createPayment(): void {
    if (!this.canRecord()) return;
    const applicationId = this.newPayment.applicationId.trim();
    const referenceNumber =
      this.newPayment.referenceNumber.trim() || `OR-2026-${Date.now().toString().slice(-6)}`;
    const app = this.store.getById(applicationId);
    if (!app) {
      this.recordPaymentError.set('No application with that ID exists.');
      return;
    }
    if (app.assessedAmountCentavos === null) {
      this.recordPaymentError.set(
        'That application has not been assessed yet — a fee must be assessed before a payment can be recorded.',
      );
      return;
    }
    this.store.recordOnsitePayment(
      applicationId,
      referenceNumber,
      this.session.name() || 'Cashier',
    );
    this.showRecordPayment.set(false);
  }
}
