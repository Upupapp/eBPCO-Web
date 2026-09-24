import { Injectable, inject } from '@angular/core';

import { ApiClient } from './api.client';
import { ApiError } from './problem';

/**
 * The Citizens module — `/staff/citizens/*`. Modelled line-for-line on
 * `staff-businesses.api.ts`: same discriminated-union result shape per
 * method, same `ApiError`/Problem Details handling, same
 * `crypto.randomUUID()` Idempotency-Key on every mutation.
 *
 * `forbidden` is its own variant here (businesses' client has none — every
 * businesses.* method folds 403 into `failed`) because a citizen account's
 * detail screen is reachable, in principle, by a caller whose token has
 * since lost `staff:administer` — a role change mid-session, not merely a
 * network failure, and worth telling apart on screen.
 */

export interface CitizenRow {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly emailVerified: boolean;
  readonly mobileVerified: boolean;
  readonly status: 'active' | 'disabled';
  readonly hasPhoto: boolean;
  /** RA 10173 s.16(e). Non-null means this account was erased — always also `status: 'disabled'`, but a stronger, permanent state the UI must tell apart from a plain disable. */
  readonly erasedAt: string | null;
  readonly registeredAt: string;
  readonly businessCount: number;
  readonly applicationCount: number;
}

export interface CitizenMetrics {
  readonly total: number;
  readonly active: number;
  readonly disabled: number;
  readonly emailVerified: number;
  readonly mobileVerified: number;
  readonly newLast30Days: number;
}

export interface CitizenSession {
  readonly id: string;
  readonly createdAt: string;
  readonly lastSeenAt: string | null;
  readonly device: string | null;
}

export interface CitizenAuditEntry {
  readonly sequence: number;
  readonly occurredAt: string;
  readonly action: string;
  readonly outcome: string;
  readonly actorAccountId: string | null;
  readonly actorRole: string | null;
}

export interface CitizenDetail extends CitizenRow {
  readonly mobileNumber: string | null;
  readonly disabledAt: string | null;
  readonly disabledReason: string | null;
  readonly middleName: string | null;
  readonly street: string | null;
  readonly barangay: string | null;
  readonly city: string | null;
  readonly province: string | null;
  readonly postalCode: string | null;
  readonly dateOfBirth: string | null;
  readonly sex: string | null;
  readonly civilStatus: string | null;
  readonly nationality: string | null;
  readonly businesses: ReadonlyArray<{ readonly id: string; readonly name: string; readonly status: string }>;
  readonly applications: ReadonlyArray<{
    readonly id: string; readonly referenceNumber: string; readonly permitType: string;
    readonly lifecycleStatus: string; readonly submittedAt: string | null;
  }>;
  readonly sessions: readonly CitizenSession[];
  readonly auditEntries: readonly CitizenAuditEntry[];
}

export interface CitizenRectifyInput {
  readonly firstName?: string;
  readonly middleName?: string | null;
  readonly lastName?: string;
  readonly mobileNumber?: string;
  readonly street?: string | null;
  readonly barangay?: string | null;
  readonly city?: string | null;
  readonly province?: string | null;
  readonly postalCode?: string | null;
}

export type CitizenListResult =
  | { readonly kind: 'ok'; readonly rows: readonly CitizenRow[]; readonly page: number; readonly pageSize: number; readonly total: number }
  | { readonly kind: 'forbidden' }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

export type CitizenMetricsResult =
  | { readonly kind: 'ok'; readonly metrics: CitizenMetrics }
  | { readonly kind: 'forbidden' }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

export type CitizenDetailResult =
  | { readonly kind: 'ok'; readonly detail: CitizenDetail }
  | { readonly kind: 'not-found' }
  | { readonly kind: 'forbidden' }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

export type CitizenSessionsResult =
  | { readonly kind: 'ok'; readonly sessions: readonly CitizenSession[] }
  | { readonly kind: 'not-found' }
  | { readonly kind: 'forbidden' }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

export type CitizenActionResult =
  | { readonly kind: 'done' }
  | { readonly kind: 'not-found' }
  | { readonly kind: 'forbidden' }
  | { readonly kind: 'refused'; readonly message: string }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

export type CitizenResetLinkResult =
  | { readonly kind: 'done'; readonly delivery: 'sent' | 'not-sent' | 'failed'; readonly detail: string }
  | { readonly kind: 'not-found' }
  | { readonly kind: 'forbidden' }
  | { readonly kind: 'refused'; readonly message: string }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

export type CitizenRectifyResult =
  | { readonly kind: 'done'; readonly mobileVerificationCleared: boolean }
  | { readonly kind: 'not-found' }
  | { readonly kind: 'forbidden' }
  | { readonly kind: 'refused'; readonly message: string }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

export type CitizenEraseResult =
  | {
      readonly kind: 'done';
      readonly acceptedAt: string;
      readonly erasedCategories: readonly string[];
      readonly retainedCategories: ReadonlyArray<{ readonly category: string; readonly basis: string; readonly until: string | null }>;
    }
  | { readonly kind: 'not-found' }
  | { readonly kind: 'forbidden' }
  | { readonly kind: 'refused'; readonly message: string }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

@Injectable({ providedIn: 'root' })
export class StaffCitizensApi {
  private readonly api = inject(ApiClient);

  async list(filters: {
    search?: string; status?: 'active' | 'disabled'; verified?: boolean; page?: number; pageSize?: number;
  } = {}): Promise<CitizenListResult> {
    try {
      const query: Record<string, string> = {};
      if (filters.search) query['search'] = filters.search;
      if (filters.status) query['status'] = filters.status;
      if (filters.verified !== undefined) query['verified'] = String(filters.verified);
      if (filters.page !== undefined) query['page'] = String(filters.page);
      if (filters.pageSize !== undefined) query['pageSize'] = String(filters.pageSize);
      const result = await this.api.get<{ rows: CitizenRow[]; page: number; pageSize: number; total: number }>(
        '/staff/citizens', query,
      );
      return { kind: 'ok', ...result };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 403) return { kind: 'forbidden' };
        if (error.status === 501) return { kind: 'unavailable' };
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }

  async metrics(): Promise<CitizenMetricsResult> {
    try {
      const metrics = await this.api.get<CitizenMetrics>('/staff/citizens/metrics');
      return { kind: 'ok', metrics };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 403) return { kind: 'forbidden' };
        if (error.status === 501) return { kind: 'unavailable' };
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }

  /**
   * `GET /staff/citizens/:id/photo` — the same real photo `ApplicantPhotoService`
   * fetches per-application, here keyed by the account id directly so a
   * screen with no application in context (the Businesses module's own
   * Contact Person avatar) can still show it. `null` for no photo or a
   * failed fetch — initials are the honest fallback either way.
   */
  async photo(accountId: string): Promise<Blob | null> {
    try {
      return await this.api.getBlob(`/staff/citizens/${encodeURIComponent(accountId)}/photo`);
    } catch {
      return null;
    }
  }

  async detail(citizenId: string): Promise<CitizenDetailResult> {
    try {
      const detail = await this.api.get<CitizenDetail>(`/staff/citizens/${encodeURIComponent(citizenId)}`);
      return { kind: 'ok', detail };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) return { kind: 'not-found' };
        if (error.status === 403) return { kind: 'forbidden' };
        if (error.status === 501) return { kind: 'unavailable' };
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }

  async sessions(citizenId: string): Promise<CitizenSessionsResult> {
    try {
      const result = await this.api.get<{ data: CitizenSession[] }>(
        `/staff/citizens/${encodeURIComponent(citizenId)}/sessions`,
      );
      return { kind: 'ok', sessions: result.data };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) return { kind: 'not-found' };
        if (error.status === 403) return { kind: 'forbidden' };
        if (error.status === 501) return { kind: 'unavailable' };
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }

  /** `DELETE /staff/citizens/:id/sessions` — every family, at once ("Sign out all sessions"). */
  async revokeAllSessions(citizenId: string, reason: string): Promise<CitizenActionResult> {
    try {
      await this.api.delete<{ revoked: number }>(
        `/staff/citizens/${encodeURIComponent(citizenId)}/sessions`, { reason }, crypto.randomUUID(),
      );
      return { kind: 'done' };
    } catch (error) {
      return this.mapActionFailure(error);
    }
  }

  async disable(citizenId: string, reason: string): Promise<CitizenActionResult> {
    try {
      await this.api.post(`/staff/citizens/${encodeURIComponent(citizenId)}/disable`, { reason }, crypto.randomUUID());
      return { kind: 'done' };
    } catch (error) {
      return this.mapActionFailure(error);
    }
  }

  async enable(citizenId: string, reason: string): Promise<CitizenActionResult> {
    try {
      await this.api.post(`/staff/citizens/${encodeURIComponent(citizenId)}/enable`, { reason }, crypto.randomUUID());
      return { kind: 'done' };
    } catch (error) {
      return this.mapActionFailure(error);
    }
  }

  /**
   * Staff never see or set a password (`sendPasswordResetLink` is the whole
   * point) — this triggers the same forgot-password flow a citizen would
   * trigger themselves, and reports whether the LGU's mail provider could
   * actually send it.
   */
  async sendPasswordResetLink(citizenId: string, reason: string): Promise<CitizenResetLinkResult> {
    try {
      const result = await this.api.post<{ delivery: 'sent' | 'not-sent' | 'failed'; detail: string }>(
        `/staff/citizens/${encodeURIComponent(citizenId)}/password-reset-link`, { reason }, crypto.randomUUID(),
      );
      return { kind: 'done', ...result };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) return { kind: 'not-found' };
        if (error.status === 403) return { kind: 'forbidden' };
        if (error.status === 501) return { kind: 'unavailable' };
        if (error.status === 409 || error.status === 422 || error.status === 400) {
          return { kind: 'refused', message: error.message };
        }
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }

  /** One field at a time, with a reason — never a free-edit form. Never accepts `email`; the server refuses it with a 400 if sent. */
  async rectify(citizenId: string, reason: string, changes: CitizenRectifyInput): Promise<CitizenRectifyResult> {
    try {
      const result = await this.api.post<{ rectified: true; mobileVerificationCleared: boolean }>(
        `/staff/citizens/${encodeURIComponent(citizenId)}/rectification`, { reason, changes }, crypto.randomUUID(),
      );
      return { kind: 'done', mobileVerificationCleared: result.mobileVerificationCleared };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) return { kind: 'not-found' };
        if (error.status === 403) return { kind: 'forbidden' };
        if (error.status === 501) return { kind: 'unavailable' };
        if (error.status === 409 || error.status === 422 || error.status === 400) {
          return { kind: 'refused', message: error.message };
        }
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }

  /** RA 10173 §16(e). `requestReference` is required — the counter's own paper trail for the request that led here. */
  async erase(citizenId: string, reason: string, requestReference: string): Promise<CitizenEraseResult> {
    try {
      const result = await this.api.post<{
        acceptedAt: string;
        erasedCategories: readonly string[];
        retainedCategories: ReadonlyArray<{ category: string; basis: string; until: string | null }>;
      }>(
        `/staff/citizens/${encodeURIComponent(citizenId)}/erasure`, { reason, requestReference }, crypto.randomUUID(),
      );
      return { kind: 'done', ...result };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) return { kind: 'not-found' };
        if (error.status === 403) return { kind: 'forbidden' };
        if (error.status === 501) return { kind: 'unavailable' };
        if (error.status === 409 || error.status === 422 || error.status === 400) {
          return { kind: 'refused', message: error.message };
        }
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }

  private mapActionFailure(error: unknown): CitizenActionResult {
    if (error instanceof ApiError) {
      if (error.status === 404) return { kind: 'not-found' };
      if (error.status === 403) return { kind: 'forbidden' };
      if (error.status === 501) return { kind: 'unavailable' };
      if (error.status === 409 || error.status === 422 || error.status === 400) {
        return { kind: 'refused', message: error.message };
      }
      return { kind: 'failed', message: error.message };
    }
    throw error;
  }
}
