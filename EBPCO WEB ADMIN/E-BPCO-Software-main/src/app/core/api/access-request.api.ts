import { Injectable, inject } from '@angular/core';

import { ApiClient } from './api.client';
import { ApiError } from './problem';
import { PermitType } from '../domain/permit.model';

/**
 * Asking for an account on the admin portal.
 *
 * Nobody signs themselves up here. A request is raised, a super admin approves
 * it, and only then does an account exist — with the forms and the level the
 * approver chose. This service raises the request and nothing else; it cannot
 * create, elevate, or approve anything.
 *
 * ── Why a request rather than a registration ────────────────────────────
 *
 * `/register` used to validate a password and navigate to `/login`, creating
 * nothing (F-24). Wiring it to `POST /auth/register` would have been worse:
 * that endpoint mints `kind: 'applicant'`, `roles: []` — a business owner —
 * and this portal's role gate refuses those, so the account it made could not
 * use the portal it was requested for.
 *
 * Owner ruling, 2026-08-31: sign-up on the admin portal is not allowed, least
 * of all as super admin; every request is subject to a super admin's approval,
 * who assigns which forms may be worked on and at what level.
 */

/** What an approver may grant. `view-edit` includes responding and deciding. */
export type AccessLevel = 'view' | 'view-edit';

export interface AccessRequest {
  readonly fullName: string;
  readonly email: string;
  readonly mobileNumber: string;
  readonly position: string;
  readonly requestedPermitTypes: readonly PermitType[];
  readonly requestedLevel: AccessLevel;
  readonly justification: string;
}

/**
 * How the submission ended, as far as this portal can honestly tell.
 *
 * `received` is deliberately not "created" and not "approved". The endpoint
 * answers 202 identically whether or not the address is already known — the
 * same anti-enumeration rule `POST /auth/register` follows — so the only true
 * statement afterwards is that the request was accepted for review.
 *
 * `unavailable` exists because the capability may not be deployed yet. A 404
 * or 501 means this deployment has no access-request endpoint, which is a
 * different fact from "your request failed" and leads to different advice.
 * Reporting it as a failure would send an officer to retry something that
 * cannot work.
 */
/** A request awaiting a super admin's decision. */
export interface PendingAccessRequest {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly mobileNumber: string;
  readonly position: string;
  readonly requestedPermitTypes: readonly string[];
  readonly requestedLevel: AccessLevel;
  readonly justification: string;
  /** RFC 3339, as the API sends it. */
  readonly requestedAt: string;
}

/**
 * How a read of the pending queue ended.
 *
 * `unavailable` is separated from `failed` for the same reason it is on submit:
 * a deployment without the endpoint is a different fact from a broken one, and
 * an empty table would say neither. A super admin looking at "no pending
 * requests" must be able to tell whether that means none exist or that nobody
 * can tell.
 */
export type PendingListResult =
  | { readonly kind: 'ok'; readonly requests: readonly PendingAccessRequest[] }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

export type AccessRequestOutcome =
  | { readonly kind: 'received' }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'rejected'; readonly message: string };

/**
 * What approving a request grants.
 *
 * Both halves are required and neither has a default here. An approval that
 * could be sent without naming the forms or the level would let the server
 * choose, and whatever it chose would be nobody's decision — which is the whole
 * failure this feature exists to prevent.
 */
export interface AccessGrant {
  readonly permitTypes: readonly PermitType[];
  readonly level: AccessLevel;
}

/** How a decision ended. `stale` means somebody else already decided it. */
export type DecisionOutcome =
  | { readonly kind: 'done' }
  | { readonly kind: 'stale' }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

@Injectable({ providedIn: 'root' })
export class AccessRequestApi {
  private readonly api = inject(ApiClient);

  async submit(request: AccessRequest): Promise<AccessRequestOutcome> {
    try {
      await this.api.post<void>('/auth/access-request', {
        fullName: request.fullName.trim(),
        email: request.email.trim().toLowerCase(),
        mobileNumber: request.mobileNumber.trim(),
        position: request.position.trim(),
        requestedPermitTypes: [...request.requestedPermitTypes],
        requestedLevel: request.requestedLevel,
        justification: request.justification.trim(),
      });
      return { kind: 'received' };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404 || error.status === 501) return { kind: 'unavailable' };
        return { kind: 'rejected', message: error.message };
      }
      throw error;
    }
  }

  /**
   * The pending queue, for a super admin.
   *
   * Never throws for an expected condition. The caller renders three different
   * sentences for three different facts, and an exception would collapse them
   * into one.
   */
  async listPending(): Promise<PendingListResult> {
    try {
      const page = await this.api.get<{ items?: readonly PendingAccessRequest[] }>(
        '/staff/access-requests',
      );
      return { kind: 'ok', requests: page.items ?? [] };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404 || error.status === 501) return { kind: 'unavailable' };
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }

  /**
   * Approve a request, creating the account with exactly this access.
   *
   * The grant travels WITH the approval rather than as a follow-up call. Two
   * requests would leave a window in which an approved account exists with
   * undefined access, and if the second failed the window would never close.
   */
  async approve(id: string, grant: AccessGrant): Promise<DecisionOutcome> {
    return this.decide(`/staff/access-requests/${encodeURIComponent(id)}/approve`, {
      permitTypes: [...grant.permitTypes],
      level: grant.level,
    });
  }

  /** Reject a request. The reason is required by the server and by this portal. */
  async reject(id: string, reason: string): Promise<DecisionOutcome> {
    return this.decide(`/staff/access-requests/${encodeURIComponent(id)}/reject`, {
      reason: reason.trim(),
    });
  }

  private async decide(path: string, body: unknown): Promise<DecisionOutcome> {
    try {
      await this.api.post<void>(path, body);
      return { kind: 'done' };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404 || error.status === 501) return { kind: 'unavailable' };
        // 409 means the request is no longer pending — another super admin got
        // there first. Reporting that as a failure would invite a retry that
        // cannot succeed, and hide the fact that a decision already exists.
        if (error.status === 409) return { kind: 'stale' };
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }
}
