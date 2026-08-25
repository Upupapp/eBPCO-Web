import { Component, computed, inject, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApplicationStore } from '../../core/domain/application-store';
import { AssessmentStore } from '../../core/domain/assessment-store';
import { requirementsFor } from '../../core/domain/requirements-catalog';
import { departmentName } from '../../core/domain/department.model';
import { permitFormUrl, permitChecklistUrl } from '../../core/domain/permit-form-templates';

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
 * release form), populated entirely from the real ApplicationStore/
 * AssessmentStore records for `applicationId` — never invented figures.
 *
 * The 'official-receipt' kind is the one place the "never present a
 * placeholder OR number as an official receipt" rule is enforced: the
 * title and header both read "Payment Acknowledgment" unless the
 * transaction being shown actually carries a real, cashier-entered
 * `orNumber` (see AssessmentStore.attachOfficialReceipt) — an internally
 * generated transaction id is never substituted for one, and the PAID
 * stamp only ever renders once that real OR number is on file.
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

  readonly applicationId = input.required<string>();
  readonly kind = input.required<SampleDocumentKind>();
  /** Optional — when the caller already knows which transaction to show (e.g. the Transactions tab), pin the receipt view to that one rather than "the latest". */
  readonly transactionId = input<string | null>(null);
  readonly closed = output<void>();

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
    return row ? permitFormUrl(row.permitType) : null;
  });
  protected readonly permitFormSafeUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.permitFormUrl();
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });
  /** The real Castilla OBO documentary-requirements checklist for this application's permit type, when it applies (Building Permit family + Certificate of Occupancy). Plain URL, not sanitized as a resource — opened as a normal link, not embedded in an iframe. */
  protected readonly permitChecklistUrl = computed(() => {
    const row = this.row();
    return row ? permitChecklistUrl(row.permitType) : null;
  });
  protected readonly release = computed(() => this.store.getRelease(this.applicationId()));

  protected readonly assessment = computed(() =>
    this.assessmentStore.getActiveAssessment(this.applicationId()),
  );

  protected readonly transactions = computed(() =>
    this.assessmentStore.getTransactionsForApplication(this.applicationId()),
  );

  protected readonly focusedTransaction = computed(() => {
    const pinned = this.transactionId();
    const txns = this.transactions();
    if (pinned) return txns.find((t) => t.id === pinned) ?? null;
    // Default to the latest Verified transaction (a real payment
    // acknowledgment/receipt only ever represents money actually
    // confirmed received), falling back to the latest of any status so a
    // still-pending payment can at least show what was submitted.
    const verified = [...txns].reverse().find((t) => t.status === 'Verified');
    return verified ?? txns[txns.length - 1] ?? null;
  });

  /** True only once the focused transaction carries a real, cashier-entered OR number — see the module notice above. */
  protected readonly hasOfficialReceipt = computed(() => !!this.focusedTransaction()?.orNumber);

  protected readonly amountInWordsText = computed(() => {
    const txn = this.focusedTransaction();
    return txn ? amountInWords(txn.amountCentavos) : '';
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
