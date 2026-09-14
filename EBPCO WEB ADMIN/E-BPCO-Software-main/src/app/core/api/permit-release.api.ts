import { Injectable, inject } from '@angular/core';

import { ApiClient } from './api.client';
import { ApiError } from './problem';

/**
 * The real generate → prepare-release → release chain —
 * `staff-actions.controller.ts`, all three under
 * `staff/applications/:applicationId`. Each step is a real, DB-enforced
 * precondition on the one before it (release-preparation refuses without an
 * existing permit; release refuses without an existing preparation) — not a
 * client-side convention.
 *
 * None of the three reads an Idempotency-Key header (only `onsite-payment`
 * on this same controller does), so none is sent here.
 *
 * Every refusal on these three routes carries only a human `detail` string —
 * there is no structured `reason` field on the wire, unlike
 * `StaffApplicationsApi.TransitionResult`. Two distinct causes collapse onto
 * the same HTTP status in two places (generate's 422, prepareRelease's 422,
 * release's 422) with nothing to discriminate them by, so the message is
 * surfaced verbatim rather than a reason enum being invented for a wire that
 * doesn't provide one.
 */

export interface GeneratePermitInput {
  readonly scope: string;
  readonly conditions?: readonly string[];
}

export type GeneratePermitResult =
  | { readonly kind: 'done'; readonly permitNumber: string; readonly issuedDate: string }
  | { readonly kind: 'refused'; readonly message: string }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

export interface PrepareReleaseInput {
  readonly claimLocation: string;
  readonly officeHours: string;
  readonly bringWithYou?: readonly string[];
}

export type PrepareReleaseResult =
  | { readonly kind: 'done' }
  | { readonly kind: 'refused'; readonly message: string }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

export interface ReleasePermitInput {
  readonly claimantName: string;
  readonly method: 'Physical Claim' | 'Authorized Representative';
}

export type ReleasePermitResult =
  | { readonly kind: 'done'; readonly releasedAt: string }
  | { readonly kind: 'refused'; readonly message: string }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

@Injectable({ providedIn: 'root' })
export class PermitReleaseApi {
  private readonly api = inject(ApiClient);

  /** `POST /staff/applications/:id/permit` — scope `staff:approve` (Approving Officer only). Refused: not-found, already-generated, not-approved, invalid (the server's real floor on `scope` is stricter than 1-char — surface its message verbatim rather than re-deriving a different minimum client-side). */
  async generatePermit(
    applicationId: string,
    input: GeneratePermitInput,
  ): Promise<GeneratePermitResult> {
    try {
      const result = await this.api.post<{ permitNumber: string; issuedDate: string }>(
        `/staff/applications/${encodeURIComponent(applicationId)}/permit`,
        input,
      );
      return { kind: 'done', ...result };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 501) return { kind: 'unavailable' };
        if (error.status === 404 || error.status === 409 || error.status === 422) {
          return { kind: 'refused', message: error.message };
        }
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }

  /** `POST /staff/applications/:id/release-preparation` — scope `staff:release` (Releasing Officer only). Refused: not-found, no-permit ("No permit has been generated for this application"), invalid. */
  async prepareRelease(
    applicationId: string,
    input: PrepareReleaseInput,
  ): Promise<PrepareReleaseResult> {
    try {
      await this.api.post<{ prepared: true }>(
        `/staff/applications/${encodeURIComponent(applicationId)}/release-preparation`,
        input,
      );
      return { kind: 'done' };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 501) return { kind: 'unavailable' };
        if (error.status === 404 || error.status === 422) {
          return { kind: 'refused', message: error.message };
        }
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }

  /** `POST /staff/applications/:id/release` — scope `staff:release`. Refused: not-found, already-released, not-ready (covers both "wrong lifecycle status" and "no prepared release" — same code, not distinguishable client-side), invalid. */
  async release(
    applicationId: string,
    input: ReleasePermitInput,
  ): Promise<ReleasePermitResult> {
    try {
      const result = await this.api.post<{ releasedAt: string }>(
        `/staff/applications/${encodeURIComponent(applicationId)}/release`,
        input,
      );
      return { kind: 'done', ...result };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 501) return { kind: 'unavailable' };
        if (error.status === 404 || error.status === 409 || error.status === 422) {
          return { kind: 'refused', message: error.message };
        }
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }
}
