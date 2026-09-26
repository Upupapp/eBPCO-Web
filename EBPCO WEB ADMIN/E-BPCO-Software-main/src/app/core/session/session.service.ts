import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Authority, StaffRole } from './permissions';
import { IdentityApi, type Me } from '../api/identity.api';
import { TokenStore } from '../api/token-store';
import { portalRoleFor } from '../api/role-map';
import { positionFor } from './position';

export interface Session {
  /** The account's own id, from `/me` — what "Assigned to you" is matched on. Empty for an offline dev bypass. */
  accountId: string;
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
  /** The server's own role identifiers (`evaluator`, `cashier`, ...), as `/me` sent them. */
  wireRoles: readonly string[];
  /**
   * The evaluation stages this officer decides, or null when `/me` did not
   * say (an older server) — the same null-is-silence rule as `scopes`.
   */
  stages: readonly string[] | null;
  /** "Fire Safety Evaluator", "Cashier" — see `positionFor`. */
  position: string;
}

/** The session's fields that come from `/me`, built the same way on sign-in and on restore. */
function fromMe(me: Me, role: StaffRole): Session {
  // `fullName` for staff, first/last for applicants, email as the last
  // resort. Until the backend closed F-32 there was no name for staff at
  // all, so every officer saw their own email address in the topbar — the
  // fallback was working exactly as written, on a field that never arrived.
  const composed = [me.firstName, me.lastName].filter(Boolean).join(' ');
  const name = me.fullName ?? (composed === '' ? null : composed);
  const wireRoles = me.roles ?? [];
  const stages = me.evaluationStages ?? null;
  return {
    accountId: me.id,
    name: name ?? me.email,
    email: me.email,
    role,
    scopes: me.scopes ?? null,
    assignedForms: me.permitTypes ?? null,
    wireRoles,
    stages,
    position: positionFor(wireRoles, stages),
  };
}

/**
 * The session adapter, against the real API.
 *
 * `signIn` calls the real `IdentityApi`, the role comes from the server's
 * own `/me` answer (never guessed from the email address or a hardcoded
 * default), and the access/refresh tokens are real, held by `TokenStore`
 * and proactively refreshed in the background (see `scheduleRefresh`
 * below) — none of that is a mock. What stays true to the "one place"
 * design this class started from: role/permission behavior still comes
 * from here alone rather than a hardcoded `"Admin"`/`"Super Admin"` string
 * scattered across pages, and every consumer below (Topbar, Sidebar, the
 * route guard, permission checks) reads this same shape (`session`,
 * `isAuthenticated`, `role`, `signIn`, `signOut`).
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly _session = signal<Session | null>(null);
  readonly session = this._session.asReadonly();

  readonly isAuthenticated = computed(() => this._session() !== null);
  readonly role = computed<StaffRole | null>(() => this._session()?.role ?? null);
  readonly name = computed(() => this._session()?.name ?? '');
  /** The signed-in account's id, or null when nobody is (or an offline bypass, which has none). */
  readonly accountId = computed(() => this._session()?.accountId || null);
  /** The officer's position ("Fire Safety Evaluator"), for display. */
  readonly position = computed(() => this._session()?.position ?? '');

  /**
   * What this officer may do — the one value the sidebar, the route guard and
   * every button ask (see `Authority` in permissions.ts).
   */
  readonly authority = computed<Authority | null>(() => {
    const current = this._session();
    if (current === null) return null;
    return {
      role: current.role,
      scopes: current.scopes,
      stages: current.stages,
      superAdmin: current.wireRoles.includes('super-admin') || current.role === 'Super Admin',
    };
  });

  private readonly identity = inject(IdentityApi);
  private readonly tokens = inject(TokenStore);
  private readonly router = inject(Router);

  // The access token is 15 minutes; this is what keeps a staff member signed
  // in for as long as they're actually here instead of being timed out
  // mid-shift. It refreshes itself in the background, well before expiry, so
  // nothing the officer is doing ever races a token dying underneath it — see
  // `IdentityApi.refresh()`'s comment for why this is proactive rather than
  // reactive-on-401. Only an explicit "Log Out", or the refresh token itself
  // finally being refused (30 days unused, or revoked), ends the session.
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

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
    this._session.set(fromMe(me, role));
    this.scheduleRefresh();
  }

  async signOut(): Promise<void> {
    this.clearRefreshTimer();
    await this.identity.signOut();
    this._session.set(null);
  }

  /**
   * Drops the local session without calling the API.
   *
   * For when the server has already told us the token is no good (a 401 on
   * an authenticated request — see `auth.interceptor.ts`) rather than the
   * officer choosing to sign out. `signOut()` would try to revoke a token
   * that is, by definition, already refused; this just matches the client's
   * belief about the session to reality so the guard and every `@if
   * (isAuthenticated())` check agree with it immediately, instead of only
   * after a reload happens to call `restore()`.
   */
  forceSignOut(): void {
    this.clearRefreshTimer();
    this._session.set(null);
  }

  /**
   * Re-establishes a session from a token that survived a reload.
   *
   * Without this, refreshing the page signs the officer out even though the
   * token is still valid — which trains them to keep the tab open and defeats
   * the point of storing it at all.
   *
   * Spends the refresh token first (when one is stored) rather than trusting
   * whatever access token survived the reload: the tab may have sat open past
   * the 15-minute access-token TTL, and going straight to `/me` would 401 and
   * read as an expired session even though the officer never left. Refreshing
   * first also re-arms the proactive timer below with the real remaining time.
   */
  async restore(): Promise<void> {
    if (!this.tokens.hasSession() || this._session() !== null) return;
    try {
      if (this.tokens.refreshToken() !== null) {
        await this.identity.refresh();
      }
      const me = await this.identity.me();
      const role = portalRoleFor(me.roles);
      if (me.kind !== 'staff' || role === null) {
        this.tokens.clear();
        return;
      }
      this._session.set(fromMe(me, role));
      this.scheduleRefresh();
    } catch {
      // An expired or revoked token is not an error worth showing on load; the
      // guard will send them to sign in.
      this.tokens.clear();
    }
  }

  /**
   * Arms the background refresh for whatever time is actually left on the
   * access token, per `TokenStore.expiresInSeconds()`. Fires at 80% of the
   * remaining life (capped to a 90-second-before-expiry floor) so it lands
   * comfortably before the token dies even under a slow network, and
   * reschedules itself from the fresh `expiresIn` each time it succeeds — so
   * the session renews indefinitely while the tab stays open. No refresh
   * token, or no recorded expiry (an older stored session), means nothing to
   * schedule; the existing reactive 401 handling in `auth.interceptor.ts`
   * remains the fallback for that case.
   */
  private scheduleRefresh(): void {
    this.clearRefreshTimer();
    if (this.tokens.refreshToken() === null) return;
    const remaining = this.tokens.expiresInSeconds();
    if (remaining === null) return;
    const buffer = Math.min(90, Math.floor(remaining * 0.2));
    const delaySeconds = Math.max(5, remaining - buffer);
    this.refreshTimer = setTimeout(() => void this.performRefresh(), delaySeconds * 1000);
  }

  private clearRefreshTimer(): void {
    if (this.refreshTimer !== null) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * The refresh timer's own callback. A failure here means the refresh token
   * itself was refused — expired past its 30-day life, or revoked (e.g. an
   * administrator forced a sign-out, or the family was revoked because a
   * stale refresh token got replayed) — a genuine end of session, not a bug,
   * so it ends the session the same way `auth.interceptor.ts` does on a 401.
   */
  private async performRefresh(): Promise<void> {
    try {
      await this.identity.refresh();
      this.scheduleRefresh();
    } catch {
      this.tokens.clear();
      this._session.set(null);
      if (!this.router.url.startsWith('/login')) {
        void this.router.navigate(['/login'], { queryParams: { reason: 'session-expired' } });
      }
    }
  }

  /** Test-only: overrides the current (real) session's role in place, so a spec can exercise role-scoped sidebar/route behavior for every role without signing in as ten different real accounts. Never called from production code — see the grep-checkable absence of any call site outside `*.spec.ts`. */
  setRole(role: StaffRole): void {
    const current = this._session();
    if (current) this._session.set({ ...current, role });
  }

  /**
   * Offline escape hatch — establishes a local Super Admin session without
   * calling the API, for exercising the portal on a machine with no backend
   * reachable at all (see `auth.guard.ts`'s own doc comment on
   * `DEV_BYPASS_ENABLED`, which gates whether this is ever called). Login
   * itself is real; this exists specifically for the case where there is no
   * server to sign in against.
   */
  devBypass(): void {
    // A real session survives a hard navigation (typing a URL, hitting
    // refresh); this bypass one normally resets to Super Admin every time
    // because there is no persisted role behind it. Reading a role stashed
    // in sessionStorage (set via `qaSetRoleAcrossReload`) lets a manual
    // role/permission-matrix pass simulate "already signed in as Evaluator"
    // surviving a direct URL entry, while offline.
    const qaRole = sessionStorage.getItem('qa-dev-bypass-role') as StaffRole | null;
    this._session.set({
      accountId: '',
      name: 'Dev Bypass (Super Admin)',
      email: 'dev-bypass@ebpco.local',
      role: qaRole ?? 'Super Admin',
      scopes: null,
      assignedForms: null,
      wireRoles: [],
      stages: null,
      position: qaRole ?? 'Super Admin',
    });
  }

  /** QA-PASS ONLY: see `devBypass`. Call before a hard navigation to make the next devBypass() come up as this role. */
  qaSetRoleAcrossReload(role: StaffRole | null): void {
    if (role) sessionStorage.setItem('qa-dev-bypass-role', role);
    else sessionStorage.removeItem('qa-dev-bypass-role');
  }
}
