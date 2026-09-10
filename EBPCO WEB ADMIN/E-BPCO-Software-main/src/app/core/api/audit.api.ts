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
}
