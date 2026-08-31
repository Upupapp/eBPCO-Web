import { Injectable, inject } from '@angular/core';

import { ApiClient } from './api.client';
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
   * The permit types this account may work on, when the server reports them.
   *
   * Absent is not empty. Absent means the server did not say; empty means it
   * said "none", and an account assigned no forms can see nothing — a fact the
   * portal must be able to state rather than render as an ordinary empty list.
   */
  readonly permitTypes?: readonly string[];
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
    this.tokens.set({ accessToken: issued.accessToken, refreshToken: issued.refreshToken ?? null });
    return this.me();
  }

  me(): Promise<Me> {
    return this.api.get<Me>('/me');
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
}
