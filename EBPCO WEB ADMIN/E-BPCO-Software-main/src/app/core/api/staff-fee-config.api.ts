import { Injectable, inject } from '@angular/core';

import { ApiClient } from './api.client';
import { ApiError } from './problem';
import { FeeLine } from './staff-payments.api';

/**
 * What the LGU charges, and how it accepts the money —
 * `staff-fee-config.controller.ts`. Both are gated `staff:administer`
 * (a Super Admin/Administrator duty), never `staff:assess` — setting a fee is
 * a different job from applying one to a bill.
 *
 * A fee schedule is never edited in place: a change PUBLISHES a new version,
 * effective from a date, closing whichever one it replaces on that date. The
 * table ships genuinely empty — no invented default figures — so drafting any
 * assessment refuses with "no schedule" until at least one version is
 * published here.
 */

export interface FeeScheduleEntry {
  readonly permitType: string;
  readonly line: FeeLine;
  readonly amountCentavos: number;
  readonly basis: string;
}

export interface FeeSchedule {
  readonly version: string;
  readonly effectiveFrom: string;
  readonly effectiveTo: string | null;
  readonly publishedBy: string | null;
  readonly status: 'Superseded' | 'In force' | 'Scheduled';
  readonly entries: readonly FeeScheduleEntry[];
}

export type FeeScheduleListResult =
  | { readonly kind: 'ok'; readonly schedules: readonly FeeSchedule[] }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

export type FeeSchedulePublishResult =
  | { readonly kind: 'done'; readonly schedule: FeeSchedule }
  | { readonly kind: 'refused'; readonly message: string }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

export interface PaymentMethodConfig {
  readonly method: string;
  readonly label: string;
  readonly active: boolean;
  readonly instructions: string;
}

export type PaymentMethodListResult =
  | { readonly kind: 'ok'; readonly methods: readonly PaymentMethodConfig[] }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

export type PaymentMethodWriteResult =
  | { readonly kind: 'done'; readonly method: string; readonly active: boolean }
  | { readonly kind: 'refused'; readonly message: string }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

@Injectable({ providedIn: 'root' })
export class StaffFeeConfigApi {
  private readonly api = inject(ApiClient);

  /** `GET /staff/config/fee-schedules` — every version ever published, not only the one in force; each carries its own computed `status`. */
  async schedules(): Promise<FeeScheduleListResult> {
    try {
      const page = await this.api.get<{ data?: readonly FeeSchedule[] }>('/staff/config/fee-schedules');
      return { kind: 'ok', schedules: page.data ?? [] };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404 || error.status === 501) return { kind: 'unavailable' };
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }

  /**
   * `POST /staff/config/fee-schedules` — publishes a new version. Refused if
   * `effectiveFrom` is in the past, the version string is already used, the
   * schedule has no entries, or any `entries[].permitType` isn't one the LGU
   * actually issues (the internal catalog name, not necessarily the published
   * 19-name union — verify against a live response before assuming either).
   */
  async publish(input: {
    version: string;
    effectiveFrom: string;
    publishedBy: string;
    entries: readonly FeeScheduleEntry[];
  }): Promise<FeeSchedulePublishResult> {
    try {
      const schedule = await this.api.post<FeeSchedule>('/staff/config/fee-schedules', input);
      return { kind: 'done', schedule };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 501) return { kind: 'unavailable' };
        return { kind: 'refused', message: error.message };
      }
      throw error;
    }
  }

  /** `GET /staff/config/payment-methods` */
  async methods(): Promise<PaymentMethodListResult> {
    try {
      const page = await this.api.get<{ data?: readonly PaymentMethodConfig[] }>('/staff/config/payment-methods');
      return { kind: 'ok', methods: page.data ?? [] };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404 || error.status === 501) return { kind: 'unavailable' };
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }

  /** `PUT /staff/config/payment-methods/:method` — refused if turning the last active method off, or the method name isn't one this deployment handles at all. */
  async setMethod(
    method: string,
    patch: { active?: boolean; label?: string; instructions?: string },
  ): Promise<PaymentMethodWriteResult> {
    try {
      const result = await this.api.put<{ method: string; active: boolean }>(
        `/staff/config/payment-methods/${encodeURIComponent(method)}`,
        patch,
      );
      return { kind: 'done', ...result };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) return { kind: 'refused', message: error.message };
        if (error.status === 501) return { kind: 'unavailable' };
        return { kind: 'refused', message: error.message };
      }
      throw error;
    }
  }
}
