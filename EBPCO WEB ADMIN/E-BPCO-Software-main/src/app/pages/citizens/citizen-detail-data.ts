// Pure view-model helpers for the Citizens detail workspace. Unlike
// `businesses/business-detail-data.ts` (which invents linked permits,
// documents and activity from a seeded row because the Businesses screen
// has no real backing for them), everything this page shows comes from
// `GET /staff/citizens/:id` — there is nothing to generate here. What this
// file DOES do is the formatting/mapping `citizens.html` would otherwise
// have to inline: which CSS modifier class a status pill wears, and how a
// raw audit action name reads to an officer.

import { CitizenAuditEntry } from '../../core/api/staff-citizens.api';

/**
 * `_data-table.scss`'s `.status-pill` recognises `active`/`inactive`
 * (among others) as its two-tone vocabulary — not `active`/`disabled`,
 * which is the API's own wire value. Kept as a one-line map rather than
 * changing the CSS (which several other screens' pills already rely on)
 * or the API (`'disabled'` is the honest word for what the column means).
 */
export function statusPillClass(status: 'active' | 'disabled'): 'active' | 'inactive' {
  return status === 'active' ? 'active' : 'inactive';
}

/**
 * "Disabled" reads as reversible — an officer can imagine an Enable button
 * fixing it. An erased account cannot be re-enabled (migration 011's
 * `erased_account_holds_no_personal_data` CHECK forbids it), so it gets its
 * own word rather than sharing "Disabled" with an account an officer merely
 * suspended.
 */
export function statusLabel(row: { status: 'active' | 'disabled'; erasedAt: string | null }): string {
  if (row.erasedAt !== null) return 'Deleted';
  return row.status === 'active' ? 'Active' : 'Disabled';
}

const ACTIVITY_LABELS: Readonly<Record<string, string>> = {
  'citizen.viewed': 'Record viewed by staff',
  'citizen.disabled': 'Account disabled',
  'citizen.enabled': 'Account enabled',
  'citizen.sessions.revoked': 'Signed out of all sessions',
  'citizen.password-reset-link-sent': 'Password-reset link sent',
  'citizen.rectified': 'Details corrected by staff',
  'profile.rectified': 'Details corrected',
  'citizen.erasure.requested': 'Erasure requested',
  'account.erased': 'Account erased',
  'authorisation.refused': 'An action was refused (insufficient permission)',
  // `historyOf('account', citizenId)` (see citizen-directory.service.ts) pulls
  // every security-log entry against this account, not just the citizen.*
  // administrative ones above — a citizen signing in/out themselves shows up
  // here too, and used to fall through to the raw action string (found live
  // 2026-09-20, e.g. "session.started").
  'session.started': 'Signed in',
  'session.ended': 'Signed out',
  'session.refused': 'Sign-in attempt refused',
  'session.replay-detected': 'Suspicious sign-in activity detected — session revoked',
  'mfa.failed': 'Entered the wrong two-factor code',
};

/** Falls back to the raw action name rather than hiding an entry this map has not caught up with. */
export function activityLabel(entry: Pick<CitizenAuditEntry, 'action'>): string {
  return ACTIVITY_LABELS[entry.action] ?? entry.action;
}

/**
 * `'2026-09-20T04:12:00.000Z'` → `'Sep 20, 2026, 12:12 PM'`, the same
 * `en-PH` locale format `businesses.ts`'s own `formatDateTime` uses, so a
 * citizen's Activity tab reads the same way a business's does.
 */
export function formatTimestamp(iso: string): string {
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) return iso;
  return `${value.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}, `
    + value.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
}

/** `null` (never verified) is shown as an explicit fact, not an empty cell. */
export function verifiedLabel(verified: boolean): string {
  return verified ? 'Verified' : 'Not verified';
}
