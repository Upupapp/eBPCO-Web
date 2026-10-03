// Generated from domain actions (see application-store.ts's mutation
// methods) rather than a disconnected static array — every
// `applicationId` here is guaranteed to reference a real seeded
// application, so opening a notification never 404s.
export interface AppNotification {
  id: string;
  applicationId: string | null;
  /** Where a notice about no application opens -- "/access-requests" for a new account request (QA TC-13). */
  deepLink?: string | null;
  title: string;
  message: string;
  createdAtValue: Date;
  createdAt: string;
  isRead: boolean;
}
