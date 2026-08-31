import { Injectable, inject } from '@angular/core';

import { ApiClient } from './api.client';
import { ApiError } from './problem';
import { AccessLevel } from './access-request.api';
import { PermitType } from '../domain/permit.model';

/**
 * The staff directory — who holds an account, and what it lets them do.
 *
 * Owner ruling, 2026-08-31: ADMIN accounts are sub-typed by accessibility, not
 * by job title. What an account can do is (a) which forms it may work on and
 * (b) whether it may only view, or view and edit — respond to citizens and
 * decide applications.
 *
 * ── There is no delete ──────────────────────────────────────────────────
 *
 * Deliberately absent, and the absence is the feature. An account is disabled,
 * never removed: the applications it touched carry its name, and deleting the
 * account would leave an audit trail pointing at nobody. The API agrees — it
 * offers `disable` and `enable` and no destructive route for a staff user.
 */

export type StaffStatus = 'active' | 'disabled';

export interface StaffMember {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly role: string;
  readonly status: StaffStatus;
  readonly level: AccessLevel;
  readonly permitTypes: readonly string[];
  /** RFC 3339, or null when this account has never signed in. */
  readonly lastSignInAt: string | null;
}

/**
 * Three outcomes, because an empty table is not an answer.
 *
 * `unavailable` means this deployment has no staff directory endpoint, which is
 * a different fact from "no staff exist" and from "the read failed". Rendering
 * all three as an empty list is the defect fixed on five pages already.
 */
export type StaffListResult =
  | { readonly kind: 'ok'; readonly members: readonly StaffMember[] }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

/** A live sign-in. `current` marks the session making this request, if known. */
export interface StaffSession {
  readonly id: string;
  readonly device: string | null;
  readonly ipAddress: string | null;
  readonly lastSeenAt: string | null;
  readonly current?: boolean;
}

export type SessionListResult =
  | { readonly kind: 'ok'; readonly sessions: readonly StaffSession[] }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

export type StaffWriteResult =
  | { readonly kind: 'done' }
  | { readonly kind: 'refused'; readonly message: string }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

@Injectable({ providedIn: 'root' })
export class StaffDirectoryApi {
  private readonly api = inject(ApiClient);

  async list(): Promise<StaffListResult> {
    try {
      const page = await this.api.get<{ items?: readonly StaffMember[] }>('/staff/users');
      return { kind: 'ok', members: page.items ?? [] };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404 || error.status === 501) return { kind: 'unavailable' };
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }

  /**
   * Change what an account may do.
   *
   * Both halves travel together for the same reason the approval grant does:
   * a level applied without its forms, or the reverse, leaves the account in a
   * state nobody chose for however long the second call takes to fail.
   */
  async changeAccess(
    id: string,
    access: { level: AccessLevel; permitTypes: readonly PermitType[] },
    reason: string,
  ): Promise<StaffWriteResult> {
    return this.write(`/staff/users/${encodeURIComponent(id)}/roles`, {
      level: access.level,
      permitTypes: [...access.permitTypes],
      reason: reason.trim(),
    });
  }

  /** Disable an account. It is preserved — see the note on delete above. */
  async disable(id: string, reason: string): Promise<StaffWriteResult> {
    return this.write(`/staff/users/${encodeURIComponent(id)}/disable`, {
      reason: reason.trim(),
    });
  }

  async enable(id: string, reason: string): Promise<StaffWriteResult> {
    return this.write(`/staff/users/${encodeURIComponent(id)}/enable`, {
      reason: reason.trim(),
    });
  }

  /** The live sessions for an account. */
  async sessions(id: string): Promise<SessionListResult> {
    try {
      const page = await this.api.get<{ items?: readonly StaffSession[] }>(
        `/staff/users/${encodeURIComponent(id)}/sessions`,
      );
      return { kind: 'ok', sessions: page.items ?? [] };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404 || error.status === 501) return { kind: 'unavailable' };
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }

  /**
   * End one session.
   *
   * The only DELETE this portal issues. A session is not a record of anything
   * that happened — ending it removes an ability, not history, and the audit
   * trail keeps its own entry either way.
   */
  async revokeSession(userId: string, sessionId: string): Promise<StaffWriteResult> {
    try {
      await this.api.delete<void>(
        `/staff/users/${encodeURIComponent(userId)}/sessions/${encodeURIComponent(sessionId)}`,
      );
      return { kind: 'done' };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404 || error.status === 501) return { kind: 'unavailable' };
        if (error.status === 403 || error.status === 409) {
          return { kind: 'refused', message: error.message };
        }
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }

  private async write(path: string, body: unknown): Promise<StaffWriteResult> {
    try {
      await this.api.post<void>(path, body);
      return { kind: 'done' };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404 || error.status === 501) return { kind: 'unavailable' };
        // 403 and 409 are the server refusing on purpose — most importantly
        // when this would disable or demote the last super admin, which is the
        // one failure that cannot be repaired from inside the product. That
        // refusal is a correct answer and must be shown as the server worded
        // it, not flattened into "something went wrong".
        if (error.status === 403 || error.status === 409) {
          return { kind: 'refused', message: error.message };
        }
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }
}
