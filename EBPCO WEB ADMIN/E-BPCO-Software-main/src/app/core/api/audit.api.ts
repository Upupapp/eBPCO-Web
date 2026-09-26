import { Injectable, inject } from '@angular/core';

import { ApiClient } from './api.client';
import { ApiError } from './problem';

/**
 * The server's audit trail.
 *
 * `GET /staff/audit` exposes three named streams — `activity`, `access` and
 * `security` — matching three of System Logs' tabs by name. Until this existed
 * in the portal, those tabs were built from hardcoded arrays and labelled as
 * sample data; the real record was there the whole time and nothing read it.
 *
 * Access decisions land on the `security` stream: who approved whom, at what
 * level, over which forms, and every later change. An access-control system
 * nobody can review is one nobody can trust.
 */

export type AuditStream = 'activity' | 'access' | 'security';

/**
 * One row, exactly as `GET /staff/audit` sends it.
 *
 * There is no `id` — the server orders and identifies rows by `sequence`, a
 * number. There is no combined `actor` string either, and no `detail` field
 * at all: the server instead names WHO acted (`actorAccountId`,
 * `actorRole`), WHETHER the action was allowed (`outcome`), and WHERE it
 * came from (`sourceAddress`) — a security stream's own vocabulary, not the
 * generic shape this used to assume.
 */
export interface AuditEntry {
  readonly sequence: number;
  readonly action: string;
  readonly outcome: 'allowed' | 'denied';
  readonly actorAccountId: string | null;
  readonly actorRole: string | null;
  readonly subjectType: string | null;
  readonly subjectId: string | null;
  readonly sourceAddress: string | null;
  readonly occurredAt: string;
}

/**
 * Three outcomes. `unavailable` is separated from `failed` for the same reason
 * everywhere else in this portal: a deployment without the endpoint is a
 * different fact from a broken one, and an empty log would say neither — while
 * looking exactly like "nothing happened", which on a security stream is the
 * most misleading thing it could say.
 */
export type AuditResult =
  | { readonly kind: 'ok'; readonly entries: readonly AuditEntry[] }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

/**
 * One account's slice of the trail, for the Staff screen. `forbidden` is its
 * own answer: the viewer lacks `audit:read` (an Administrator), which is not
 * the same as the account having done nothing.
 */
export type AccountAuditResult = AuditResult | { readonly kind: 'forbidden' };

@Injectable({ providedIn: 'root' })
export class AuditApi {
  private readonly api = inject(ApiClient);

  async stream(name: AuditStream, limit = 100): Promise<AuditResult> {
    try {
      const page = await this.api.get<{ entries?: readonly AuditEntry[] }>('/staff/audit', {
        stream: name,
        limit,
      });
      return { kind: 'ok', entries: page.entries ?? [] };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404 || error.status === 501) return { kind: 'unavailable' };
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }

  /** What one officer did, newest first — `?actorAccountId=`. */
  async byActor(accountId: string, limit = 25): Promise<AccountAuditResult> {
    return this.accountSlice(async () => {
      const page = await this.api.get<{ entries?: readonly AuditEntry[] }>('/staff/audit', {
        actorAccountId: accountId,
        limit,
      });
      return page.entries ?? [];
    });
  }

  /** What was done TO one staff account — created, re-roled, disabled — newest first. */
  async accountHistory(accountId: string): Promise<AccountAuditResult> {
    return this.accountSlice(async () => {
      const page = await this.api.get<{ entries?: readonly Omit<AuditEntry, 'subjectType' | 'subjectId' | 'sourceAddress'>[] }>(
        `/staff/audit/account/${encodeURIComponent(accountId)}`,
      );
      // The server answers oldest first; every other list here is newest first.
      return [...(page.entries ?? [])].reverse().map((entry) => ({
        ...entry, subjectType: 'account', subjectId: accountId, sourceAddress: null,
      }));
    });
  }

  private async accountSlice(read: () => Promise<readonly AuditEntry[]>): Promise<AccountAuditResult> {
    try {
      return { kind: 'ok', entries: await read() };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 403) return { kind: 'forbidden' };
        if (error.status === 404 || error.status === 501) return { kind: 'unavailable' };
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }
}

/** An audit action, said the way an office would ("Signed in", "Recorded an evaluation"). */
export function describeAuditAction(action: string): string {
  const known: Readonly<Record<string, string>> = {
    'session.started': 'Signed in',
    'session.ended': 'Signed out',
    'session.refused': 'Sign-in refused',
    'mfa.failed': 'Wrong authenticator code',
    'mfa.enrolled': 'Set up the authenticator app',
    'authorisation.refused': 'Tried something not permitted',
    'application.viewed': 'Opened an application',
    'application.transitioned': 'Moved an application to its next status',
    'application.edited': 'Corrected an application',
    'application.note-added': 'Added an internal note',
    'application.archived': 'Archived an application',
    'evaluation.recorded': 'Recorded an evaluation decision',
    'document.reviewed': 'Reviewed a document',
    'assessment.drafted': 'Drafted an assessment',
    'assessment.submitted': 'Submitted an assessment',
    'assessment.approved': 'Approved an assessment',
    'permit.generated': 'Generated a permit',
    'permit.release-prepared': 'Prepared a permit release',
    'permit.released': 'Released a permit',
    'staff.account.created': 'Staff account created',
    'staff.account.roles-changed': 'Position changed',
    'staff.account.renamed': 'Name corrected',
    'staff.account.disabled': 'Account disabled',
    'staff.account.enabled': 'Account enabled',
    'staff.account.removed': 'Account deleted',
    'access.level-changed': 'Access level changed',
    'access.forms-changed': 'Assigned forms changed',
    'access.stages-changed': 'Evaluation stages changed',
    'access.approved': 'Access request approved',
  };
  const said = known[action];
  if (said !== undefined) return said;
  const words = action.replace(/[.-]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}
