import { Component, computed, inject, input, output } from '@angular/core';
import { ApplicationStore } from '../../core/domain/application-store';
import { PaymentConfigStore } from '../../core/domain/payment-config-store';
import { requirementsFor } from '../../core/domain/requirements-catalog';
import { departmentName } from '../../core/domain/department.model';
import { totalAssessmentCentavos } from '../../core/domain/payment.model';

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

function formatPHP(centavos: number): string {
  return `₱${(centavos / 100).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Renders one printable SAMPLE document (application form, assessment,
 * evaluation notice, official receipt, permit/clearance, or release
 * form), populated entirely from the real ApplicationStore record for
 * `applicationId` — never invented figures. Every document carries a
 * persistent "SAMPLE — Not an Official Document" banner and no real LGU
 * seal/signature image, so it can never be mistaken for an actual
 * Castilla-issued document (per the "clearly mark reference documents as
 * SAMPLE" / "do not present as an official document" requirements). Print
 * uses the browser's own print-to-PDF, the same "download" mechanism
 * already used by Permit Release's printPdf().
 *
 * Structural layout only — replacing this component's template with an
 * LGU-approved layout (once Castilla confirms its own form) is meant to
 * be a drop-in swap; nothing else in the app depends on this file's
 * specific markup.
 */
@Component({
  selector: 'app-document-preview',
  templateUrl: './document-preview.html',
  styleUrl: './document-preview.scss',
})
export class DocumentPreview {
  private readonly store = inject(ApplicationStore);
  private readonly paymentConfig = inject(PaymentConfigStore);

  readonly applicationId = input.required<string>();
  readonly kind = input.required<SampleDocumentKind>();
  readonly closed = output<void>();

  protected readonly title = computed(() => KIND_TITLES[this.kind()]);

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
  protected readonly payments = computed(() => this.store.getPayments(this.applicationId()));
  protected readonly latestPayment = computed(() => {
    const txns = this.payments();
    return txns[txns.length - 1] ?? null;
  });
  protected readonly evaluations = computed(() => this.store.getEvaluations(this.applicationId()));

  protected readonly feeLines = computed(() => {
    const schedule = this.paymentConfig.feeSchedule();
    return [
      { label: 'Filing Fee', amount: formatPHP(schedule.filing) },
      { label: 'Processing Fee', amount: formatPHP(schedule.processing) },
      { label: 'Architectural Line Item', amount: formatPHP(schedule.architectural) },
      { label: 'Structural/Civil Line Item', amount: formatPHP(schedule.structural) },
      { label: 'Electrical Line Item', amount: formatPHP(schedule.electrical) },
      { label: 'Other Regulatory Fees', amount: formatPHP(schedule.others) },
    ];
  });

  protected readonly totalDue = computed(() => {
    const row = this.row();
    const amount =
      row?.assessedAmountCentavos ?? totalAssessmentCentavos(this.paymentConfig.feeSchedule());
    return formatPHP(amount);
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
