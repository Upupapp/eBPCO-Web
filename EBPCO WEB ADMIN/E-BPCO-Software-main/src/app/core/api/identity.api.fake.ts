import { IdentityApi, Me } from './identity.api';
import { TokenStore } from './token-store';

/**
 * A signed-in officer, without a server.
 *
 * Specs that arrange a session are not testing sign-in — they are testing what
 * a sidebar or a guard does once somebody is signed in. Before the portal had a
 * backend, `signIn(email)` was that arrangement. Now it makes two HTTP calls,
 * so the arrangement has to stub them rather than the service growing a
 * "become anyone" method that production could reach for.
 */
export class FakeIdentityApi implements Partial<IdentityApi> {
  constructor(
    private readonly tokens: TokenStore,
    private readonly roles: readonly string[] = ['super-admin'],
  ) {}

  signIn(email: string): Promise<Me> {
    this.tokens.set({ accessToken: 'test-token' });
    return Promise.resolve(this.me(email));
  }

  me(email = 'someone@lgu.gov.ph'): Promise<Me> {
    return Promise.resolve({
      id: '00000000-0000-4000-8000-000000000000',
      email,
      kind: 'staff' as const,
      roles: [...this.roles],
    });
  }

  signOut(): Promise<void> {
    this.tokens.clear();
    return Promise.resolve();
  }
}
