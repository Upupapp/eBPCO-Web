import { Injectable, inject } from '@angular/core';

import { ApiClient } from './api.client';
import { ApiError } from './problem';

/**
 * An officer's own real notice inbox — `GET /staff/notifications` and
 * `POST /staff/notifications/:id/read` (`staff-notifications.controller.ts`).
 * Scoped to the calling account by the server itself, not filtered here.
 */

/** One row of `GET /staff/notifications`, exactly as the server sends it. */
export interface StaffNotificationRow {
  readonly id: string;
  readonly type: string;
  readonly applicationId: string | null;
  readonly routedToRole: string;
  readonly title: string;
  readonly body: string;
  readonly deepLink: string | null;
  readonly createdAt: string;
  readonly readAt: string | null;
}

export type StaffInboxResult =
  | { readonly kind: 'ok'; readonly notifications: readonly StaffNotificationRow[]; readonly unread: number }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

@Injectable({ providedIn: 'root' })
export class StaffNotificationsApi {
  private readonly api = inject(ApiClient);

  async inbox(): Promise<StaffInboxResult> {
    try {
      const result = await this.api.get<{ notifications?: readonly StaffNotificationRow[]; unread?: number }>(
        '/staff/notifications',
        { limit: 50 },
      );
      return { kind: 'ok', notifications: result.notifications ?? [], unread: result.unread ?? 0 };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404 || error.status === 501) return { kind: 'unavailable' };
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }

  /** Best-effort: a read receipt that fails to save is not worth blocking the officer over. */
  async markRead(notificationId: string): Promise<boolean> {
    try {
      await this.api.post(`/staff/notifications/${encodeURIComponent(notificationId)}/read`);
      return true;
    } catch {
      return false;
    }
  }
}
