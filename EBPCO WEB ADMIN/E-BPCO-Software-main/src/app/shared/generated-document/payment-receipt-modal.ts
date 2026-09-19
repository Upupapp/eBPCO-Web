import { Component, input, output } from '@angular/core';
import { PaymentQueueRow } from '../../core/api/staff-payments.api';

function formatPHP(centavos: number): string {
  return `₱${(centavos / 100).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

/**
 * A printable view of one real, already-verified payment.
 *
 * Every field here is read straight off the `PaymentQueueRow` the caller
 * already fetched from `GET /staff/payments` / `GET /staff/applications/:id`
 * — the same real row the Payments page's own detail table shows. Nothing is
 * generated, computed, or stored anywhere by opening this: unlike a permit
 * (`generated_permits`, written once by `POST .../permit`), the server has no
 * separate "receipt" record to create — the Official Receipt number IS the
 * receipt, recorded the moment a payment is verified (see
 * `staff-payments.api.ts`'s own doc comment). This view exists only to show
 * that real record formatted for printing, the same relationship
 * `UserPortalPermitPreview` has to a real `ApplicationGeneratedPermit`.
 */
@Component({
  selector: 'app-payment-receipt-modal',
  templateUrl: './payment-receipt-modal.html',
  styleUrl: './payment-receipt-modal.scss',
})
export class PaymentReceiptModal {
  readonly payment = input.required<PaymentQueueRow>();
  readonly closed = output<void>();

  protected readonly formatPHP = formatPHP;
  protected readonly formatDateTime = formatDateTime;

  protected close(): void {
    this.closed.emit();
  }

  protected print(): void {
    window.print();
  }
}
