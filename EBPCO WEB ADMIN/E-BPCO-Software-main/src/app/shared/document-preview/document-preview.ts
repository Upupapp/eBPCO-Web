import { Component, computed, inject, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ApplicationStore } from '../../core/domain/application-store';
import { AssessmentStore } from '../../core/domain/assessment-store';
import { requirementsFor } from '../../core/domain/requirements-catalog';
import { departmentName } from '../../core/domain/department.model';

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

/**
 * Renders one printable SAMPLE document (application form, assessment,
 * evaluation notice, official receipt / payment acknowledgment,
 * permit/clearance, or release form), populated entirely from the real
 * ApplicationStore/AssessmentStore records for `applicationId` — never
 * invented figures. Every document carries a persistent "SAMPLE — Not an
 * Official Document" banner and no real LGU seal/signature image, so it
 * can never be mistaken for an actual Castilla-issued document.
 *
 * The 'official-receipt' kind is the one place the "never present a
 * placeholder OR number as an official receipt" rule is enforced: the
 * title and header both read "Payment Acknowledgment" unless the
 * transaction being shown actually carries a real, cashier-entered
 * `orNumber` (see AssessmentStore.attachOfficialReceipt) — an internally
 * generated transaction id is never substituted for one.
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
  protected readonly requirements = computed(() => {
    const row = this.row();
    return row ? requirementsFor(row.permitType) : null;
  });
  protected readonly permit = computed(() => this.store.getPermit(this.applicationId()));
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
