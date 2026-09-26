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
 * ── Delete is the super admin's, and it keeps the record ────────────────
 *
 * Owner request, 2026-09-26: the super admin may delete a staff account. The
 * server decides what that means (`remove` below): an account that never acted
 * is deleted outright; one whose name is on decisions is RETIRED — it can never
 * sign in again and leaves the directory, but its name stays on what it did, so
 * the audit trail never points at nobody. An administrator still only disables.
 */

export type StaffStatus = 'Active' | 'Disabled' | 'Pending';

/**
 * A roster row, exactly as `GET /staff/users` sends it.
 *
 * There is no `fullName` here — staff accounts carry no name column on the
 * backend, only `email` and `roles`. There is no `level`/`permitTypes`
 * either: those live on the separate `GET /staff/users/:id/access` call
 * (see `access()` below) because the roster and an account's specific grant
 * are two different questions the server answers separately.
 */
export interface StaffMember {
  readonly id: string;
  readonly email: string;
  /** The officer's own name. Null for an account made before names were recorded; absent from an older server. */
  readonly fullName?: string | null;
  readonly roles: readonly string[];
  readonly status: StaffStatus;
  readonly mfaRequired: boolean;
  readonly mfaEnrolled: boolean;
  readonly createdAt: string;
  /** RFC 3339, or null when this account has never signed in. */
  readonly lastSignInAt: string | null;
}

/** What `GET /staff/users/:id/access` reports for one account. */
export interface StaffAccess {
  readonly level: AccessLevel;
  readonly permitTypes: readonly string[];
  /**
   * The evaluation stages this officer decides (officer positions, 2026-09-26).
   * Absent from an older server — which is silence, not "none".
   */
  readonly evaluationStages?: readonly string[];
}

export type StaffAccessResult =
  | { readonly kind: 'ok'; readonly access: StaffAccess }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

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

/**
 * A live sign-in, exactly as `GET /staff/users/:id/sessions` sends it.
 *
 * No `device`, `ipAddress`, or `current` — the backend tracks none of
 * those for a session, only when it was issued, when it expires, and when
 * it was last used.
 */
export interface StaffSession {
  readonly sessionId: string;
  readonly issuedAt: string;
  readonly expiresAt: string;
  readonly lastUsedAt: string | null;
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

/** What deleting an account did — the server's own words in `detail`. */
export type StaffRemoveResult =
  | { readonly kind: 'done'; readonly mode: 'deleted' | 'retired'; readonly detail: string }
  | { readonly kind: 'refused'; readonly message: string }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

export type StaffCreateResult =
  | { readonly kind: 'done'; readonly member: StaffMember; readonly nextStep: string }
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
   * One account's grant — the level and forms `GET /staff/users` itself
   * does not carry. Called per-row rather than assumed, because the roster
   * and an account's specific access are two different questions on this
   * server.
   */
  async access(id: string): Promise<StaffAccessResult> {
    try {
      const access = await this.api.get<StaffAccess>(
        `/staff/users/${encodeURIComponent(id)}/access`,
      );
      return { kind: 'ok', access };
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

  /**
   * Creates a real staff account, without a password — the officer sets one
   * through the account-recovery flow, which is exactly what the server's
   * own `nextStep` (returned here, never re-worded) tells the caller. An
   * account with no roles is a legitimate call (the server defaults `roles`
   * to `[]`), created ahead of a posting being confirmed.
   */
  async create(email: string, roles: readonly string[], fullName?: string): Promise<StaffCreateResult> {
    try {
      const name = fullName?.trim();
      const response = await this.api.post<StaffMember & { nextStep: string }>('/staff/users', {
        email,
        ...(name ? { fullName: name } : {}),
        roles: [...roles],
      });
      const { nextStep, ...member } = response;
      return { kind: 'done', member, nextStep };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404 || error.status === 501) return { kind: 'unavailable' };
        if (error.status === 403 || error.status === 409) return { kind: 'refused', message: error.message };
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }

  /**
   * Replace an account's roles — the complete set, which the server swaps in
   * wholesale. It refuses an administrator changing their own, and anyone but a
   * super admin touching the super admin role.
   */
  async setRoles(id: string, roles: readonly string[]): Promise<StaffWriteResult> {
    return this.write(`/staff/users/${encodeURIComponent(id)}/roles`, { roles: [...roles] });
  }

  /** Replace the forms an account may work on. The server refuses an empty list. */
  async setForms(id: string, permitTypes: readonly string[]): Promise<StaffWriteResult> {
    return this.put(`/staff/users/${encodeURIComponent(id)}/access/forms`, { permitTypes: [...permitTypes] });
  }

  /** View only, or view and edit. */
  async setLevel(id: string, level: AccessLevel): Promise<StaffWriteResult> {
    return this.put(`/staff/users/${encodeURIComponent(id)}/access/level`, { level });
  }

  /** Replace the evaluation stages this officer decides. An empty list takes every stage away. */
  async setStages(id: string, stages: readonly string[]): Promise<StaffWriteResult> {
    return this.put(`/staff/users/${encodeURIComponent(id)}/access/stages`, { stages: [...stages] });
  }

  /** Correct the name an officer's decisions are shown under. The address cannot be changed. */
  async rename(id: string, fullName: string): Promise<StaffWriteResult> {
    try {
      await this.api.patch<void>(`/staff/users/${encodeURIComponent(id)}`, { fullName: fullName.trim() });
      return { kind: 'done' };
    } catch (error) {
      return this.classify(error);
    }
  }

  /**
   * Delete an account — the super admin's alone. The answer says whether it was
   * deleted outright or retired because its name is on decisions.
   */
  async remove(id: string): Promise<StaffRemoveResult> {
    try {
      const answer = await this.api.delete<{ mode: 'deleted' | 'retired'; detail: string }>(
        `/staff/users/${encodeURIComponent(id)}`,
      );
      return { kind: 'done', mode: answer.mode, detail: answer.detail };
    } catch (error) {
      return this.classify(error);
    }
  }

  /** Disable an account. It is preserved, and can be enabled again. */
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
   * A session is not a record of anything that happened — ending it removes
   * an ability, not history, and the audit trail keeps its own entry either
   * way. (Was "the only DELETE this portal issues" until the Citizens
   * module's own "Sign out all sessions" added a second.)
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
  private classify(error: unknown): Exclude<StaffWriteResult, { readonly kind: 'done' }> {
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
