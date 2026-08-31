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
      // `data`, not `items` — see F-31. Reading the wrong key here rendered
      // the directory permanently empty and said so as though it had looked.
      const page = await this.api.get<{ data?: readonly StaffMember[] }>('/staff/users');
      return { kind: 'ok', members: page.data ?? [] };
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
   * ── Two calls, because the server has two endpoints ─────────────────────
   *
   * This method used to post `{ level, permitTypes, reason }` to
   * `/staff/users/:id/roles`, and every part of that was wrong: that route
   * takes `{ roles }` alone and is `.strict()`, while level and forms live at
   * `PUT :id/access/level` and `PUT :id/access/forms` (F-31). It could never
   * have succeeded.
   *
   * The comment it replaced claimed both halves travelled together, "for the
   * same reason the approval grant does". That was a description of an
   * intention rather than of the wire — approval genuinely is one transaction
   * server-side; this is not, and no amount of wishing in a client comment
   * makes it so.
   *
   * So: forms first, then level. If the second fails the caller is told which
   * landed, rather than being handed a generic failure after a partial change
   * — an administrator who does not know what took effect will guess, and
   * guessing about access is how somebody keeps authority they were meant to
   * lose. Forms first is deliberate: narrowing what an account can reach
   * before changing whether it may act fails in the safer order.
   *
   * `reason` is gone. Neither endpoint accepts one, both being `.strict()`, so
   * the field was collecting text and discarding it — the F-24 defect exactly.
   * Filed for the backend instead.
   */
  async changeAccess(
    id: string,
    access: { level: AccessLevel; permitTypes: readonly PermitType[] },
  ): Promise<StaffWriteResult> {
    const account = encodeURIComponent(id);

    const forms = await this.put(`/staff/users/${account}/access/forms`, {
      permitTypes: [...access.permitTypes],
    });
    if (forms.kind !== 'done') return forms;

    const level = await this.put(`/staff/users/${account}/access/level`, {
      level: access.level,
    });
    if (level.kind === 'done') return level;

    return {
      kind: 'refused',
      message:
        'The forms were updated but the level was not, so this account now has the new '
        + `forms at its previous level. ${'message' in level ? level.message : ''}`.trim(),
    };
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
      // `data`, not `items`. This is the screen an administrator opens when
      // they suspect an account is compromised, and the wrong key answered
      // "not signed in anywhere" every time.
      const page = await this.api.get<{ data?: readonly StaffSession[] }>(
        `/staff/users/${encodeURIComponent(id)}/sessions`,
      );
      return { kind: 'ok', sessions: page.data ?? [] };
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

  private async put(path: string, body: unknown): Promise<StaffWriteResult> {
    try {
      await this.api.put<void>(path, body);
      return { kind: 'done' };
    } catch (error) {
      return this.classify(error);
    }
  }

  private async write(path: string, body: unknown): Promise<StaffWriteResult> {
    try {
      await this.api.post<void>(path, body);
      return { kind: 'done' };
    } catch (error) {
      return this.classify(error);
    }
  }

  /**
   * One reading of a failure, shared by every write.
   *
   * 403 and 409 are the server refusing on purpose — most importantly when the
   * change would disable or demote the last super admin, the one failure that
   * cannot be repaired from inside the product. That refusal is a correct
   * answer and must reach the screen as the server worded it, not flattened
   * into "something went wrong".
   */
  private classify(error: unknown): StaffWriteResult {
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
