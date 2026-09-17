import { Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApplicationStore } from '../../core/domain/application-store';
import { AssessmentStore } from '../../core/domain/assessment-store';
import { requirementsFor } from '../../core/domain/requirements-catalog';
import { departmentName } from '../../core/domain/department.model';
import { permitFormUrl, permitChecklistUrl } from '../../core/domain/permit-form-templates';
import {
  ApplicationDetail,
  ApplicationOrderOfPayment,
  ApplicationPaymentRow,
  StaffApplicationsApi,
} from '../../core/api/staff-applications.api';
import { FeeLine, FEE_LINES } from '../../core/api/staff-payments.api';

export type SampleDocumentKind =
  | 'application-form'
  | 'assessment'
  | 'evaluation-notice'
  | 'official-receipt'
  | 'permit'
  | 'release-form';

const KIND_TITLES: Record<SampleDocumentKind, string> = {
  'application-form': 'Application Form',
  assessment: 'Order of Payment / Assessment Form',
  'evaluation-notice': 'Evaluation Notice',
  'official-receipt': 'Official Receipt',
  permit: 'Permit / Clearance',
  'release-form': 'Release Form',
};

const RECEIPT_LINE_LABELS: Record<FeeLine, string> = {
  filing: 'Filing Fee',
  processing: 'Processing Fee',
  architectural: 'Architectural Fee',
  structural: 'Structural Fee',
  electrical: 'Electrical Fee',
  others: 'Other Fees',
};

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const when = new Date(iso);
  if (Number.isNaN(when.getTime())) return iso;
  return `${when.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })} · `
    + when.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
}

function formatPHP(centavos: number | null): string {
  if (centavos === null) return 'Requires assessor input';
  return `₱${(centavos / 100).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const GROUPS = ['', ' Thousand', ' Million', ' Billion'];

function threeDigitsToWords(value: number): string {
  let n = value;
  let str = '';
  if (n >= 100) {
    str += `${ONES[Math.floor(n / 100)]} Hundred `;
    n %= 100;
  }
  if (n >= 20) {
    str += `${TENS[Math.floor(n / 10)]} `;
    n %= 10;
  }
  if (n > 0) str += `${ONES[n]} `;
  return str.trim();
}

function pesosToWords(pesos: number): string {
  if (pesos === 0) return 'Zero';
  let n = Math.floor(pesos);
  const parts: string[] = [];
  let groupIndex = 0;
  while (n > 0) {
    const chunk = n % 1000;
    if (chunk > 0) parts.unshift(`${threeDigitsToWords(chunk)}${GROUPS[groupIndex]}`);
    n = Math.floor(n / 1000);
    groupIndex++;
  }
  return parts.join(' ');
}

/** Amount-in-words phrasing with centavos spelled out (not as a "XX/100" fraction), e.g. "One Thousand Two Hundred Fifty Pesos and Fifty Centavos" — omitted entirely when there are no centavos. */
function amountInWords(centavos: number): string {
  const pesos = Math.floor(centavos / 100);
  const cents = Math.round(centavos % 100);
  const pesosPart = `${pesosToWords(pesos)} Peso${pesos === 1 ? '' : 's'}`;
  if (cents === 0) return pesosPart;
  return `${pesosPart} and ${threeDigitsToWords(cents)} Centavo${cents === 1 ? '' : 's'}`;
}

/**
 * Renders one printable document (application form, assessment, evaluation
 * notice, official receipt / payment acknowledgment, permit/clearance, or
 * release form).
 *
 * Every kind but 'official-receipt' is populated from the local
 * ApplicationStore/AssessmentStore records — never invented figures.
 * 'official-receipt' is populated from the REAL backend
 * (`StaffApplicationsApi.detail()`'s `payments`/`orderOfPayment`) instead:
 * the local stores are a client-side demo engine that the real Payments
 * page (`pages/payments/payments.ts`) never writes to, so a payment
 * genuinely recorded through the real Record-Onsite-Payment/verify flow was
 * invisible here — this screen said "no payment has been recorded yet" for
 * a payment that plainly had been.
 *
 * The "never present a placeholder OR number as an official receipt" rule
 * still holds: the title and header both read "Payment Acknowledgment"
 * unless the payment being shown carries a real `officialReceiptNumber`
 * (every Onsite payment gets one immediately; a verified bank-transfer
 * payment gets one when the cashier verifies it) — and the PAID stamp only
 * ever renders once that real OR number is on file.
 */
@Component({
  selector: 'app-document-preview',
  imports: [DecimalPipe],
  templateUrl: './document-preview.html',
  styleUrl: './document-preview.scss',
})
export class DocumentPreview {
  private readonly store = inject(ApplicationStore);
  private readonly assessmentStore = inject(AssessmentStore);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly applicationsApi = inject(StaffApplicationsApi);

  readonly applicationId = input.required<string>();
  readonly kind = input.required<SampleDocumentKind>();
  /** Optional — when the caller already knows which payment to show (e.g. the Transactions tab), pin the receipt view to that one rather than "the latest". */
  readonly transactionId = input<string | null>(null);
  readonly closed = output<void>();

  protected readonly formatDateTime = formatDateTime;

  // Owner decision (same as the generated permit): this system produces no
  // real receipts — there is no real LGU behind it — so this always shows,
  // never gated on payment/verification status.
  protected readonly receiptWatermarkText = 'SAMPLE — NOT AN OFFICIAL RECEIPT';

  // ---- Real backend data, for the 'official-receipt' kind only -----------

  private readonly detail = signal<ApplicationDetail | null>(null);

  constructor() {
    effect(() => {
      const id = this.applicationId();
      if (this.kind() !== 'official-receipt') return;
      untracked(() => void this.loadDetail(id));
    });
  }

  private async loadDetail(applicationId: string): Promise<void> {
    const result = await this.applicationsApi.detail(applicationId);
    this.detail.set(result.kind === 'ok' ? result.detail : null);
  }

  protected readonly receiptOrder = computed<ApplicationOrderOfPayment | null>(
    () => this.detail()?.orderOfPayment ?? null,
  );

  protected readonly focusedPayment = computed<ApplicationPaymentRow | null>(() => {
    const pinned = this.transactionId();
    const rows = this.detail()?.payments ?? [];
    if (pinned) return rows.find((p) => p.id === pinned) ?? null;
    // Default to the latest Paid payment (a real payment acknowledgment/
    // receipt only ever represents money actually confirmed received),
    // falling back to the latest of any status so a still-pending
    // bank-transfer submission can at least show what was submitted.
    const paid = [...rows].reverse().find((p) => p.status === 'Paid');
    return paid ?? rows[rows.length - 1] ?? null;
  });

  protected readonly receiptFeeLines = computed(() => {
    const order = this.receiptOrder();
    if (!order) return [];
    const centavosByLine: Record<FeeLine, number> = {
      filing: order.filingCentavos,
      processing: order.processingCentavos,
      architectural: order.architecturalCentavos,
      structural: order.structuralCentavos,
      electrical: order.electricalCentavos,
      others: order.othersCentavos,
    };
    return FEE_LINES
      .filter((line) => centavosByLine[line] > 0)
      .map((line) => ({ label: RECEIPT_LINE_LABELS[line], amount: formatPHP(centavosByLine[line]) }));
  });

  protected readonly receiptTotalDue = computed(() => {
    const order = this.receiptOrder();
    return order ? formatPHP(order.totalCentavos) : 'Not yet assessed';
  });

  protected readonly row = computed(() => this.store.getById(this.applicationId()));
  protected readonly applicant = computed(() => {
    const row = this.row();
    return row ? this.store.getApplicant(row.applicantId) : undefined;
  });
  protected readonly business = computed(() => {
    const row = this.row();
    return row ? this.store.getBusiness(row.businessId) : undefined;
  });
  /** The real linked Business's name -> the application's own denormalized businessName (legacy fallback) -> 'Not provided'. Never the applicant's name — mirrors ApplicationStore.getApplicationContext's fallback rule. */
  protected readonly businessLabel = computed(() => {
    const row = this.row();
    if (!row) return 'Not provided';
    return this.business()?.name || row.businessName || 'Not provided';
  });
  protected readonly requirements = computed(() => {
    const row = this.row();
    return row ? requirementsFor(row.permitType) : null;
  });
  protected readonly permit = computed(() => this.store.getPermit(this.applicationId()));
  /** The official permit form PDF for this application's permit type, bundled under public/assets/permits/. Null when no matching file was provided for that permit type. */
  protected readonly permitFormUrl = computed(() => {
    const row = this.row();
    // No permit type means no form to point at — a link built from a guess
    // would download the wrong LGU form.
    return row?.permitType ? permitFormUrl(row.permitType) : null;
  });
  protected readonly permitFormSafeUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.permitFormUrl();
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });
  /** The real Castilla OBO documentary-requirements checklist for this application's permit type, when it applies (Building Permit family + Certificate of Occupancy). Plain URL, not sanitized as a resource — opened as a normal link, not embedded in an iframe. */
  protected readonly permitChecklistUrl = computed(() => {
    const row = this.row();
    return row?.permitType ? permitChecklistUrl(row.permitType) : null;
  });
  protected readonly release = computed(() => this.store.getRelease(this.applicationId()));

  protected readonly assessment = computed(() =>
    this.assessmentStore.getActiveAssessment(this.applicationId()),
  );

  /** True only once the focused payment carries a real, cashier-entered OR number — see the module notice above. */
  protected readonly hasOfficialReceipt = computed(() => !!this.focusedPayment()?.officialReceiptNumber);

  protected readonly amountInWordsText = computed(() => {
    const order = this.receiptOrder();
    return order ? amountInWords(order.totalCentavos) : '';
  });

  protected readonly generatedOn = new Date().toLocaleString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  protected readonly title = computed(() => {
    if (this.kind() === 'official-receipt' && !this.hasOfficialReceipt()) {
      return 'Payment Acknowledgment';
    }
    return KIND_TITLES[this.kind()];
  });

  protected readonly evaluations = computed(() => this.store.getEvaluations(this.applicationId()));

  protected readonly feeLines = computed(() => {
    const assessment = this.assessment();
    if (!assessment) return [];
    return assessment.lineItems
      .filter((l) => l.included)
      .map((l) => ({
        label: l.name,
        amount: formatPHP(l.amountCentavos),
        legalBasisTitle: l.legalBasisTitle,
        legalBasisUrl: l.legalBasisUrl,
        requiresAssessorInput: l.requiresAssessorInput && l.amountCentavos === null,
      }));
  });

  protected readonly totalDue = computed(() => {
    const assessment = this.assessment();
    return assessment ? formatPHP(assessment.totalCentavos) : 'Not yet assessed';
  });

  protected readonly balanceDue = computed(() => {
    const assessment = this.assessment();
    return assessment ? formatPHP(assessment.balanceCentavos) : '—';
  });

  protected departmentLabel(id: string): string {
    return departmentName(id);
  }

  protected close(): void {
    this.closed.emit();
  }

  protected print(): void {
    window.print();
  }
}
