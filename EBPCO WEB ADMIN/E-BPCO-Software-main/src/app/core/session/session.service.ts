import { Injectable, computed, signal } from '@angular/core';
import { StaffRole } from './permissions';

export interface Session {
  name: string;
  email: string;
  role: StaffRole;
}

/**
 * MOCK session adapter. This prototype has no backend, so there is no
 * real authentication token or server-verified role — this service exists
 * purely so role/permission behavior comes from ONE place instead of a
 * hardcoded `"Admin"`/`"Super Admin"` string on individual pages or a
 * `email.includes('tenant')` branch in the login form. It is written so a
 * future real auth service can implement the same shape (`session`,
 * `isAuthenticated`, `role`, `signIn`, `signOut`) and every consumer below
 * (Topbar, Sidebar, the route guard, permission checks) keeps working
 * unchanged.
 *
 * Do NOT treat this as production security: the "session" is an
 * in-memory signal any script on the page can overwrite, there is no
 * token, and it resets on reload — consistent with the rest of this
 * frontend-only mock (see ApplicationStore's own doc comment).
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly _session = signal<Session | null>(null);
  readonly session = this._session.asReadonly();

  readonly isAuthenticated = computed(() => this._session() !== null);
  readonly role = computed<StaffRole | null>(() => this._session()?.role ?? null);
  readonly name = computed(() => this._session()?.name ?? '');

  /**
   * Every successful staff login enters with the same mock identity —
   * there is no real credential check to derive a role from, so this
   * always signs in as Super Admin (full access) rather than branching on
   * anything in the email string. `setRole` below exists so the mock can
   * still demonstrate role-scoped behavior (sidebar/guards) without a
   * real per-account role store.
   */
  signIn(email: string): void {
    this._session.set({ name: 'Ma. Andrea Belarmino', email, role: 'Super Admin' });
  }

  signOut(): void {
    this._session.set(null);
  }

  /** Mock-only: switches the current session's role in place, for demonstrating/testing role-scoped sidebar and route access without a real per-account role store. */
  setRole(role: StaffRole): void {
    const current = this._session();
    if (current) this._session.set({ ...current, role });
  }
}
