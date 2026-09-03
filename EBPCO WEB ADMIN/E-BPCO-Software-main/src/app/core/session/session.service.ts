import { Injectable, computed, inject, signal } from '@angular/core';
import { StaffRole } from './permissions';
import { IdentityApi } from '../api/identity.api';
import { TokenStore } from '../api/token-store';
import { portalRoleFor } from '../api/role-map';

export interface Session {
  name: string;
  email: string;
  role: StaffRole;
  /**
   * The scopes `/me` reported, or null when it reported none.
   *
   * Null is not "no scopes" — it is "the server did not say", and the two must
   * not collapse. Treating silence as an empty set would disable every write
   * control against a server that simply does not send the field yet; treating
   * it as full access would do the opposite. `Capabilities` decides, in one
   * place, and says which source it used.
   */
  scopes: readonly string[] | null;
  /**
   * The forms this account may work on, or null when `/me` did not report them.
   *
   * Same distinction as `scopes`: null is silence, `[]` is "none assigned".
   * The queue is scoped by the SERVER — this is carried so the portal can
   * explain an empty result, never so it can filter one.
   */
  assignedForms: readonly string[] | null;
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
  private readonly identity = inject(IdentityApi);
  private readonly tokens = inject(TokenStore);

  /**
   * Signs in against the API.
   *
   * The role comes from `/me`, never from the email address. This service used
   * to hand everyone Super Admin because there was no server to ask — which
   * meant the sidebar and the server's answer were two different opinions, and
   * the first person to be promoted would find the menu offering screens the
   * API refuses.
   *
   * An account the API authenticates but whose roles this portal does not
   * recognise is refused HERE rather than shown an empty menu: a staff portal
   * that signs someone in and then hides everything is indistinguishable from
   * one that is broken.
   */
  async signIn(email: string, password: string, totp?: string): Promise<void> {
    const me = await this.identity.signIn(email, password, totp);
    const role = portalRoleFor(me.roles);
    if (me.kind !== 'staff' || role === null) {
      this.tokens.clear();
      throw new Error(
        me.kind === 'staff'
          ? 'This account holds no role this portal recognises. Ask an administrator.'
          : 'This is an applicant account. Staff sign in here; applicants use the mobile app.',
      );
    }
    // `fullName` for staff, first/last for applicants, email as the last
    // resort. Until the backend closed F-32 there was no name for staff at
    // all, so every officer saw their own email address in the topbar — the
    // fallback was working exactly as written, on a field that never arrived.
    const composed = [me.firstName, me.lastName].filter(Boolean).join(' ');
    const name = me.fullName ?? (composed === '' ? null : composed);
    this._session.set({
      name: name ?? me.email,
      email: me.email,
      role,
      scopes: me.scopes ?? null,
      assignedForms: me.permitTypes ?? null,
    });
  }

  async signOut(): Promise<void> {
    await this.identity.signOut();
    this._session.set(null);
  }

  /**
   * Re-establishes a session from a token that survived a reload.
   *
   * Without this, refreshing the page signs the officer out even though the
   * token is still valid — which trains them to keep the tab open and defeats
   * the point of storing it at all.
   */
  async restore(): Promise<void> {
    if (!this.tokens.hasSession() || this._session() !== null) return;
    try {
      const me = await this.identity.me();
      const role = portalRoleFor(me.roles);
      if (me.kind !== 'staff' || role === null) {
        this.tokens.clear();
        return;
      }
      const composed = [me.firstName, me.lastName].filter(Boolean).join(' ');
      const name = me.fullName ?? (composed === '' ? null : composed);
      this._session.set({
        name: name ?? me.email,
        email: me.email,
        role,
        scopes: me.scopes ?? null,
        assignedForms: me.permitTypes ?? null,
      });
    } catch {
      // An expired or revoked token is not an error worth showing on load; the
      // guard will send them to sign in.
      this.tokens.clear();
    }
  }

  /** Mock-only: switches the current session's role in place, for demonstrating/testing role-scoped sidebar and route access without a real per-account role store. */
  setRole(role: StaffRole): void {
    const current = this._session();
    if (current) this._session.set({ ...current, role });
  }
}
