import { Injectable, inject } from '@angular/core';

import { ApiClient } from './api.client';
import { ApiError } from './problem';

/**
 * Teams, assignment and the Archive (ebpco-api 062). Every refusal carries the
 * server's own sentence — whose step it is, who has it, why it cannot be
 * archived — which a screen shows as it is.
 */

export interface TeamMember {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly lead: boolean;
  readonly canWork: boolean;
  /** Applications at this team's step assigned to this officer. */
  readonly assigned: number;
}

export interface TeamOverview {
  readonly key: string;
  readonly name: string;
  readonly position: string;
  readonly ownsStep: boolean;
  readonly members: readonly TeamMember[];
  readonly waiting: number;
  readonly unassigned: number;
}

export type ArchiveKind = 'application' | 'staff' | 'citizen' | 'business' | 'requirement' | 'permit-type';

export interface ArchivedItem {
  readonly kind: ArchiveKind;
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly archivedAt: string | null;
  readonly archivedBy: string | null;
  readonly reason: string | null;
  readonly canRestore: boolean;
}

export type Read<T> =
  | { readonly kind: 'ok'; readonly value: T }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

export type Write =
  | { readonly kind: 'done'; readonly detail: string }
  | { readonly kind: 'refused'; readonly message: string }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

@Injectable({ providedIn: 'root' })
export class TeamsApi {
  private readonly api = inject(ApiClient);

  /** `GET /staff/teams` — every team, its lead first, and the work waiting on it. */
  async overview(): Promise<Read<readonly TeamOverview[]>> {
    return this.read(async () => (await this.api.get<{ data: readonly TeamOverview[] }>('/staff/teams')).data);
  }

  /**
   * `POST /staff/applications/:id/assignment` — a lead gives an application to
   * a member (null: back to unassigned); a member takes an unassigned one or
   * hands theirs back.
   */
  async assign(applicationId: string, assigneeId: string | null): Promise<Write> {
    return this.write(async () => (await this.api.post<{ detail: string }>(
      `/staff/applications/${encodeURIComponent(applicationId)}/assignment`, { assigneeId },
    )).detail);
  }

  /** `GET /staff/archive` — everything archived, of every kind. */
  async archived(): Promise<Read<readonly ArchivedItem[]>> {
    return this.read(async () => (await this.api.get<{ data: readonly ArchivedItem[] }>('/staff/archive')).data);
  }

  /** `POST /staff/archive/:kind/:id` — archives a citizen account or a business, with the reason. */
  async archive(kind: 'citizen' | 'business', id: string, reason: string): Promise<Write> {
    return this.write(async () => (await this.api.post<{ detail: string }>(
      `/staff/archive/${kind}/${encodeURIComponent(id)}`, { reason },
    )).detail);
  }

  /** `POST /staff/archive/:kind/:id/restore` — brings any archived item back. */
  async restore(kind: ArchiveKind, id: string): Promise<Write> {
    return this.write(async () => (await this.api.post<{ detail: string }>(
      `/staff/archive/${kind}/${encodeURIComponent(id)}/restore`,
    )).detail);
  }

  private async read<T>(run: () => Promise<T>): Promise<Read<T>> {
    try {
      return { kind: 'ok', value: await run() };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404 || error.status === 501) return { kind: 'unavailable' };
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }

  private async write(run: () => Promise<string>): Promise<Write> {
    try {
      return { kind: 'done', detail: await run() };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 501) return { kind: 'unavailable' };
        if (error.status === 403 || error.status === 409 || error.status === 422 || error.status === 404
          || error.status === 400) {
          return { kind: 'refused', message: error.message };
        }
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }
}
