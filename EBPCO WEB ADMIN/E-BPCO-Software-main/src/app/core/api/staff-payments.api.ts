import { Injectable, inject } from '@angular/core';

import { ApiClient } from './api.client';
import { ApiError } from './problem';

/**
 * Assessments, Orders of Payment, and the cashier's verification queue —
 * `staff-assessments.controller.ts`, the payment/order routes on
 * `staff-actions.controller.ts`, and `staff-payments.controller.ts`.
 *
 * ── The real model is nothing like the one this page used to show ────────
 *
 * There is no bracket/percentage/per-unit fee catalog server-side — every
 * assessment has exactly six lines (`FEE_LINES` below), flat pesos each,
 * computed from whatever fee schedule is in force the day the draft opens.
 *
 * There is no partial payment. An Order of Payment is settled by exactly one
 * payment that matches its total to the centavo (ADR 0010) — once any payment
 * on an application is verified, no further one can be recorded or submitted
 * against it. "Partially Paid" is not a state the server has.
 *
 * Verifying a payment and recording its Official Receipt number are the same
 * call (`verify`) — there is no separate "attach OR later" step. A distinct
 * `receipt` route exists only to CORRECT an OR number already on a verified
 * payment, and requires a reason.
 *
 * An onsite (counter) payment is recorded already Paid and verified in one
 * call — there is no "Pending Verification" phase for it. Only a bank-transfer
 * proof (submitted by the applicant themselves; staff cannot originate one —
 * see the doc comment on `recordOnsitePayment`) goes through the
 * Pending-Verification → verify()/reject() two-step flow.
 */

export const FEE_LINES = ['filing', 'processing', 'architectural', 'structural', 'electrical', 'others'] as const;
export type FeeLine = (typeof FEE_LINES)[number];

export type AssessmentStatus = 'Draft' | 'Submitted' | 'Approved' | 'Issued' | 'Withdrawn';

export interface AssessmentLine {
  readonly line: FeeLine;
  /** What the fee schedule in force says this line should be. */
  readonly computedCentavos: number;
  /** What the officer actually set — may differ from `computedCentavos`; both are kept so an override is answerable later. */
  readonly amountCentavos: number;
  readonly basis: string;
  readonly included: boolean;
}

export interface Assessment {
  readonly id: string;
  readonly applicationId: string;
  readonly status: AssessmentStatus;
  readonly feeScheduleVersion: string;
  readonly dueDate: string | null;
  readonly lines: readonly AssessmentLine[];
  readonly totalCentavos: number;
  readonly createdBy: string;
  readonly submittedBy: string | null;
  readonly approvedBy: string | null;
}

export type AssessmentResult =
  | { readonly kind: 'done'; readonly assessment: Assessment }
  | { readonly kind: 'refused'; readonly message: string }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

export type AssessmentReadResult =
  | { readonly kind: 'ok'; readonly assessment: Assessment }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

/** `assessment: null` is a normal answer (nothing open right now), distinct from `unavailable`/`failed`. */
export type OpenAssessmentResult =
  | { readonly kind: 'ok'; readonly assessment: Assessment | null }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

export type OrderResult =
  | { readonly kind: 'done'; readonly orderId: string; readonly number: string; readonly totalCentavos: number }
  | { readonly kind: 'refused'; readonly message: string }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

export type OnsitePaymentResult =
  | { readonly kind: 'done'; readonly paymentId: string; readonly replayed: boolean }
  | { readonly kind: 'refused'; readonly message: string }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

export type PaymentStatus = 'Pending Verification' | 'Paid' | 'Not Yet Available' | 'Overdue';

/** One row of `GET /staff/payments` — the cashier's queue, not a per-application list (see `StaffApplicationsApi`'s `payments`/`orderOfPayment` on the application detail for that). */
export interface PaymentQueueRow {
  readonly id: string;
  readonly applicationId: string;
  readonly applicationReference: string;
  readonly referenceNumber: string;
  readonly applicantName: string;
  readonly amountCentavos: number;
  readonly method: string;
  readonly status: string;
  readonly submittedAt: string;
  readonly officialReceiptNumber: string | null;
}

export type PaymentQueueResult =
  | { readonly kind: 'ok'; readonly rows: readonly PaymentQueueRow[] }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

export type PaymentWriteResult =
  | { readonly kind: 'done' }
  | { readonly kind: 'refused'; readonly message: string }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

@Injectable({ providedIn: 'root' })
export class StaffPaymentsApi {
  private readonly api = inject(ApiClient);

  // ---- Assessment workflow --------------------------------------------

  /**
   * `POST /staff/applications/:id/assessments` — opens a Draft, pre-filled
   * from the fee schedule in force today. Refused with `no-schedule` if
   * nothing has been published yet, or `already-open` if a non-terminal
   * assessment already exists for this application (withdraw or issue it
   * first — see the doc comment on `AssessmentStatus`).
   */
  async draftAssessment(
    applicationId: string,
    options: { dueDate?: string; revision?: boolean } = {},
  ): Promise<AssessmentResult> {
    try {
      const assessment = await this.api.post<Assessment>(
        `/staff/applications/${encodeURIComponent(applicationId)}/assessments`,
        options,
      );
      return { kind: 'done', assessment };
    } catch (error) {
      return this.classifyAssessment(error);
    }
  }

  /** `GET /staff/assessments/:id` — re-opens a draft once its id is already known (e.g. from `draftAssessment`'s own response, within the session that opened it). For finding an application's open assessment WITHOUT already knowing its id — the normal case for the officer approving one someone else drafted — use `getOpenAssessment` instead. */
  async getAssessment(assessmentId: string): Promise<AssessmentReadResult> {
    try {
      const assessment = await this.api.get<Assessment>(`/staff/assessments/${encodeURIComponent(assessmentId)}`);
      return { kind: 'ok', assessment };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404 || error.status === 501) return { kind: 'unavailable' };
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }

  /** `GET /staff/applications/:id/assessments/open` — the application's own in-progress (Draft/Submitted/Approved) assessment, if any, found by applicationId rather than the assessment's own id. Answers `{ kind: 'ok', assessment: null }` when nothing is open — that is a normal state, not a failure. */
  async getOpenAssessment(applicationId: string): Promise<OpenAssessmentResult> {
    try {
      const assessment = await this.api.get<Assessment | null>(
        `/staff/applications/${encodeURIComponent(applicationId)}/assessments/open`,
      );
      return { kind: 'ok', assessment };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404 || error.status === 501) return { kind: 'unavailable' };
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }

  /** `PUT /staff/assessments/:id/lines/:line` — replaces one of the six fixed lines. A non-zero line needs a non-empty `basis` (the ordinance/issuance it rests on) before it can be submitted. */
  async setAssessmentLine(
    assessmentId: string,
    line: FeeLine,
    patch: { amountCentavos?: number; included?: boolean; basis?: string },
  ): Promise<AssessmentResult> {
    try {
      const assessment = await this.api.put<Assessment>(
        `/staff/assessments/${encodeURIComponent(assessmentId)}/lines/${encodeURIComponent(line)}`,
        patch,
      );
      return { kind: 'done', assessment };
    } catch (error) {
      return this.classifyAssessment(error);
    }
  }

  async submitAssessment(assessmentId: string): Promise<AssessmentResult> {
    try {
      const assessment = await this.api.post<Assessment>(
        `/staff/assessments/${encodeURIComponent(assessmentId)}/submit`,
      );
      return { kind: 'done', assessment };
    } catch (error) {
      return this.classifyAssessment(error);
    }
  }

  /**
   * `POST /staff/assessments/:id/approve` — refused (403, `self-approval`) if
   * this officer is the same one who drafted or submitted it. Never
   * re-derived client-side: the same account showing up as "Payment Officer"
   * for both duties is normal, and only the server knows which account did
   * what.
   */
  async approveAssessment(assessmentId: string): Promise<AssessmentResult> {
    try {
      const assessment = await this.api.post<Assessment>(
        `/staff/assessments/${encodeURIComponent(assessmentId)}/approve`,
      );
      return { kind: 'done', assessment };
    } catch (error) {
      return this.classifyAssessment(error);
    }
  }

  /** `POST /staff/orders-of-payment/:id/supersede` — replaces an issued Order with one from an approved revision. `reason` needs at least 10 characters; it is what the applicant reads to explain why their bill changed. */
  async supersedeOrder(orderId: string, reason: string): Promise<OrderResult> {
    try {
      const result = await this.api.post<{ orderId: string; number: string; totalCentavos: number }>(
        `/staff/orders-of-payment/${encodeURIComponent(orderId)}/supersede`,
        { reason },
      );
      return { kind: 'done', ...result };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 501) return { kind: 'unavailable' };
        // Every failure here — not-found included — comes back as a flat 422
        // from this one route (see the controller's own doc comment).
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }

  private classifyAssessment(error: unknown): AssessmentResult {
    if (error instanceof ApiError) {
      if (error.status === 501) return { kind: 'unavailable' };
      if (error.status === 403 || error.status === 404 || error.status === 422) {
        return { kind: 'refused', message: error.message };
      }
      return { kind: 'failed', message: error.message };
    }
    throw error;
  }

  // ---- Order of Payment / onsite payment (staff-actions.controller.ts) --

  /** `POST /staff/applications/:id/order-of-payment` — requires an Approved assessment; refused otherwise. */
  async issueOrderOfPayment(
    applicationId: string,
    options: { dueDate?: string } = {},
  ): Promise<OrderResult> {
    try {
      const result = await this.api.post<{ orderId: string; number: string; totalCentavos: number }>(
        `/staff/applications/${encodeURIComponent(applicationId)}/order-of-payment`,
        options,
      );
      return { kind: 'done', ...result };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 501) return { kind: 'unavailable' };
        return { kind: 'refused', message: error.message };
      }
      throw error;
    }
  }

  /**
   * `POST /staff/applications/:id/onsite-payment` — cash across a counter.
   * Records the payment already Paid and verified; there is no separate
   * verification step for this method (only bank-transfer proofs need one).
   * `amountCentavos` must equal the Order of Payment's total exactly — a
   * partial amount is refused, not accepted as a down payment. Requires a
   * fresh Idempotency-Key per attempt.
   *
   * There is no staff-side way to record a BANK TRANSFER on an applicant's
   * behalf — that route (`POST /applications/:id/payments`) is scoped to
   * applicants only. Staff can only verify/reject/void/reverse/refund/
   * correct-the-receipt-on one already submitted.
   */
  async recordOnsitePayment(
    applicationId: string,
    input: { officialReceiptNumber: string; amountCentavos: number },
  ): Promise<OnsitePaymentResult> {
    try {
      const result = await this.api.post<{ paymentId: string; replayed: boolean }>(
        `/staff/applications/${encodeURIComponent(applicationId)}/onsite-payment`,
        input,
        crypto.randomUUID(),
      );
      return { kind: 'done', ...result };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 501) return { kind: 'unavailable' };
        return { kind: 'refused', message: error.message };
      }
      throw error;
    }
  }

  // ---- Cashier's queue / verify / undo / receipt / reject ----------------

  /** `GET /staff/payments` — defaults to `Pending Verification`, the cashier's actual worklist. Pass `status` for the archive views. */
  async queue(options: { status?: PaymentStatus; limit?: number } = {}): Promise<PaymentQueueResult> {
    try {
      const page = await this.api.get<{ items?: readonly PaymentQueueRow[] }>('/staff/payments', {
        status: options.status,
        limit: options.limit,
      });
      return { kind: 'ok', rows: page.items ?? [] };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404 || error.status === 501) return { kind: 'unavailable' };
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }

  /** `POST /staff/payments/:id/verify` — verifying AND recording the Official Receipt number in one call. Refused (403) if this officer is the one who submitted/recorded the payment being verified. */
  async verifyPayment(paymentId: string, officialReceiptNumber: string): Promise<PaymentWriteResult> {
    return this.write(`/staff/payments/${encodeURIComponent(paymentId)}/verify`, { officialReceiptNumber });
  }

  /** `POST /staff/payments/:id/reject` — for a Pending-Verification payment only (a bank-transfer proof). `reason` travels to the applicant verbatim; needs 10+ characters. Every failure here — including a too-short reason — answers 404, so a refusal's wording is the only way to tell "no such payment" from "say more." */
  async rejectPayment(paymentId: string, reason: string): Promise<PaymentWriteResult> {
    return this.write(`/staff/payments/${encodeURIComponent(paymentId)}/reject`, { reason });
  }

  /** `POST /staff/payments/:id/void` — the record itself was a mistake. `reason` needs 10+ characters and is refused (403) if this officer is the one who verified the payment. */
  async voidPayment(paymentId: string, reason: string): Promise<PaymentWriteResult> {
    return this.write(`/staff/payments/${encodeURIComponent(paymentId)}/void`, { reason });
  }

  /** `POST /staff/payments/:id/reverse` — the money never actually came. Same shape/rules as `voidPayment`. */
  async reversePayment(paymentId: string, reason: string): Promise<PaymentWriteResult> {
    return this.write(`/staff/payments/${encodeURIComponent(paymentId)}/reverse`, { reason });
  }

  /** `POST /staff/payments/:id/refund` — it came, and is going back. Same shape/rules as `voidPayment`. Any of the three is also refused once a permit has been generated from the application — money can no longer be touched once an instrument exists. */
  async refundPayment(paymentId: string, reason: string): Promise<PaymentWriteResult> {
    return this.write(`/staff/payments/${encodeURIComponent(paymentId)}/refund`, { reason });
  }

  /** `POST /staff/payments/:id/receipt` — CORRECTS an Official Receipt number already on a verified payment. Not how a receipt is first assigned (that happens inside `verifyPayment`); `reason` needs 10+ characters. */
  async correctReceipt(
    paymentId: string,
    officialReceiptNumber: string,
    reason: string,
  ): Promise<PaymentWriteResult> {
    return this.write(`/staff/payments/${encodeURIComponent(paymentId)}/receipt`, {
      officialReceiptNumber,
      reason,
    });
  }

  private async write(path: string, body: unknown): Promise<PaymentWriteResult> {
    try {
      await this.api.post<unknown>(path, body);
      return { kind: 'done' };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 501) return { kind: 'unavailable' };
        if (error.status === 403 || error.status === 404 || error.status === 409) {
          return { kind: 'refused', message: error.message };
        }
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }
}
