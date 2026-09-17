import { Injectable, inject } from '@angular/core';

import { ApiClient } from './api.client';
import { ApiError } from './problem';
import { TokenStore } from './token-store';

/**
 * Signing in, and finding out who signed in.
 *
 * The two are separate calls on purpose: the token says the credentials were
 * right, and `/me` says what this account may do. A portal that inferred a role
 * from the email address — which this one used to do — is a portal whose menu
 * and the server's answer disagree the first time somebody is promoted.
 */

export interface TokenResponse {
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly expiresIn?: number;
}

export interface Me {
  readonly id: string;
  readonly email: string;
  readonly kind: 'applicant' | 'staff';
  readonly roles?: readonly string[];
  readonly scopes?: readonly string[];
  /**
   * The permit types this account may work on.
   *
   * Absent is not empty. Absent means the server did not say; empty means it
   * said "none", and an account assigned no forms can see nothing — a fact the
   * portal must be able to state rather than render as an ordinary empty list.
   *
   * Sent since the backend closed F-32 (3 Sep). It is `liveAccessFor`, so a
   * RETIRED permit type is not listed even though the officer still holds the
   * grant — the grant is what keeps their historical work attributable, and
   * this is what they may file against today. The portal does not yet
   * distinguish the two, and does not need to while it only offers filing.
   */
  readonly permitTypes?: readonly string[];

  /** The officer's name. Null means genuinely not on record, not blank. */
  readonly fullName?: string | null;

  /** `view` or `view-edit`. Scopes already encode it; this states it plainly. */
  readonly level?: string;
  readonly firstName?: string;
  readonly lastName?: string;
}

@Injectable({ providedIn: 'root' })
export class IdentityApi {
  private readonly api = inject(ApiClient);
  private readonly tokens = inject(TokenStore);

  async signIn(email: string, password: string, totp?: string): Promise<Me> {
    const issued = await this.api.post<TokenResponse>('/auth/token', {
      // `grantType` is required by the API and was missing until the portal was
      // pointed at a running server for the first time: every sign-in answered
      // 400 with a pointer at a field this client did not know existed. The
      // literal is the contract, not a formality — the endpoint refuses
      // anything else.
      grantType: 'password',
      email, password, ...(totp === undefined ? {} : { totp }),
    });
    this.tokens.set({
      accessToken: issued.accessToken,
      refreshToken: issued.refreshToken ?? null,
      expiresIn: issued.expiresIn,
    });
    return this.me();
  }

  me(): Promise<Me> {
    return this.api.get<Me>('/me');
  }

  /**
   * Spends the stored refresh token for a new access token, before the old
   * one expires — the proactive half of session-keeping (see
   * `SessionService`'s refresh timer). The reactive alternative — refreshing
   * only after a request 401s — was rejected: it would need to queue and
   * replay in-flight requests, and getting that wrong risks something like
   * `POST /staff/payments/:id/verify` being submitted twice. A background
   * timer never touches an in-flight request, so it sidesteps that risk
   * entirely.
   *
   * The server's refresh tokens are single-use and ROTATE on every call — the
   * new one returned here must replace the stored one, which is why this
   * always re-stores both tokens rather than just the access token. Presenting
   * an already-spent refresh token reads as theft server-side and revokes the
   * whole session, so this must never be called twice concurrently with the
   * same stored token.
   */
  async refresh(): Promise<TokenResponse> {
    const refreshToken = this.tokens.refreshToken();
    if (refreshToken === null) throw new Error('No refresh token to spend.');
    const issued = await this.api.post<TokenResponse>('/auth/token/refresh', { refreshToken });
    this.tokens.set({
      accessToken: issued.accessToken,
      refreshToken: issued.refreshToken ?? null,
      expiresIn: issued.expiresIn,
    });
    return issued;
  }

  async signOut(): Promise<void> {
    const refresh = this.tokens.refreshToken();
    try {
      // Best effort. The server revoking the session is what makes signing out
      // mean something to a token already issued, but an officer closing a
      // laptop must not be left signed in because the network was down.
      if (refresh !== null) await this.api.post('/auth/revoke', { refreshToken: refresh });
    } catch {
      // Deliberately ignored; the local clear below is what the officer sees.
    } finally {
      this.tokens.clear();
    }
  }

  /**
   * Start account recovery.
   *
   * Always resolves — never throws for the address being unknown, because the
   * server answers 202 identically either way, on purpose: an endpoint that
   * answered differently would let anyone learn which addresses have accounts
   * just by asking. This method must not undo that by surfacing a different
   * outcome on the client for the two cases the server treats as one.
   */
  async requestPasswordReset(email: string): Promise<void> {
    await this.api.post('/auth/password/forgot', { email });
  }

  /**
   * Finish account recovery with the token from the emailed link.
   *
   * A typed result rather than a throw for the expected failures. Both are
   * reported by the server as 400 — a weak password AND an already-used,
   * expired, or never-valid link — so the two are told apart the same way the
   * server tells them apart internally: a weak password comes back with
   * `fieldErrors` pointing at `/password`, and "link no longer valid" does not
   * (see `auth.controller.ts`'s `reset()` — one branch is
   * `ProblemException.validation`, the other is a plain `ProblemException`
   * with none). Anything else is a real failure the caller re-throws.
   *
   * The `/password` pointer check matters, not just "any field errors": a
   * malformed token (never issued, or the wrong shape entirely) also fails
   * the server's Zod schema and comes back as a 400 with a field error too —
   * pointing at `/token`, carrying that field's own raw validator message
   * ("must be a reset token"). Treating every field error as a weak password
   * used to surface that string verbatim on this screen instead of the
   * intended "link no longer valid" message.
   */
  async resetPassword(
    token: string, password: string,
  ): Promise<{ kind: 'done' } | { kind: 'invalid-link' } | { kind: 'weak-password'; message: string }> {
    try {
      await this.api.post('/auth/password/reset', { token, password });
      return { kind: 'done' };
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        const fieldErrors = error.problem.fieldErrors ?? [];
        const passwordErrors = fieldErrors.filter((e) => e.pointer === '/password');
        if (passwordErrors.length > 0) {
          return { kind: 'weak-password', message: passwordErrors.map((e) => e.message).join(' ') };
        }
        return { kind: 'invalid-link' };
      }
      throw error;
    }
  }
}
