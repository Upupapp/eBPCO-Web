import { Injectable, inject } from '@angular/core';

import { ApiClient } from './api.client';
import { ApiError } from './problem';

/**
 * The evaluator's worklist and the one action this app records against it —
 * `GET /staff/evaluations` and `POST /staff/applications/:id/evaluations`.
 *
 * The stage order is enforced by the SERVER (Initial → Zoning → Fire Safety
 * → OBO → Final Approval); a refusal for an out-of-order, already-decided,
 * self-reviewed, or remarks-less submission comes back as the server's own
 * wording rather than being re-derived here.
 */

export const EVALUATION_STAGES = ['Initial', 'Zoning', 'Fire Safety', 'OBO', 'Final Approval'] as const;
export type EvaluationStage = (typeof EVALUATION_STAGES)[number];

export const EVALUATION_RESULTS = ['Passed', 'Revision Required', 'Rejected'] as const;
export type EvaluationResult = (typeof EVALUATION_RESULTS)[number];

export interface EvaluationDecision {
  readonly id: string;
  readonly stage: EvaluationStage;
  readonly result: EvaluationResult | string;
  readonly remarks: string | null;
  readonly evaluatedAt: string | null;
}

/** One row of `GET /staff/evaluations`, exactly as the server sends it. */
export interface EvaluationQueueRow {
  readonly applicationId: string;
  readonly referenceNumber: string;
  readonly permitType: string;
  readonly lifecycleStatus: string;
  readonly applicantName: string;
  readonly businessId: string | null;
  readonly businessName: string | null;
  readonly submittedAt: string | null;
  readonly evaluations: readonly EvaluationDecision[];
  /** `null` once every stage has a decision. */
  readonly nextStage: EvaluationStage | null;
  readonly requiredDocumentCount: number;
  readonly attachedDocumentCount: number;
}

export type EvaluationQueueResult =
  | { readonly kind: 'ok'; readonly rows: readonly EvaluationQueueRow[] }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

export type EvaluationWriteResult =
  | { readonly kind: 'done'; readonly evaluationId: string; readonly evaluationsComplete: boolean }
  | { readonly kind: 'refused'; readonly message: string }
  | { readonly kind: 'failed'; readonly message: string };

@Injectable({ providedIn: 'root' })
export class StaffEvaluationsApi {
  private readonly api = inject(ApiClient);

  async queue(): Promise<EvaluationQueueResult> {
    try {
      const page = await this.api.get<{ items?: readonly EvaluationQueueRow[] }>(
        '/staff/evaluations',
        { limit: 100 },
      );
      return { kind: 'ok', rows: page.items ?? [] };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404 || error.status === 501) return { kind: 'unavailable' };
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }

  /**
   * Records one stage's decision. `remarks` is required by the server for
   * `Revision Required`/`Rejected` (at least ten characters, said in whole
   * sentences) — sending too little is a 422 whose wording this surfaces
   * verbatim rather than re-deriving.
   */
  async record(
    applicationId: string,
    decision: { stage: EvaluationStage; result: EvaluationResult; remarks?: string },
  ): Promise<EvaluationWriteResult> {
    try {
      const result = await this.api.post<{ evaluationId: string; evaluationsComplete: boolean }>(
        `/staff/applications/${encodeURIComponent(applicationId)}/evaluations`,
        decision,
      );
      return { kind: 'done', evaluationId: result.evaluationId, evaluationsComplete: result.evaluationsComplete };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 403 || error.status === 409 || error.status === 422) {
          return { kind: 'refused', message: error.message };
        }
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }
}
