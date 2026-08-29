import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { IdentityApi } from './identity.api';
import { TokenStore } from './token-store';

/**
 * The wire shape of sign-in.
 *
 * Written after pointing this portal at a running server for the first time and
 * watching every sign-in answer 400: the API requires `grantType`, and this
 * client did not send it. Nothing in the portal's own test suite could have
 * caught that — 304 tests passed against a client that could not sign in —
 * because a stubbed `IdentityApi` proves what the SERVICE does with a session,
 * never what the REQUEST looks like.
 */
describe('IdentityApi', () => {
  let api: IdentityApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), IdentityApi, TokenStore],
    });
    api = TestBed.inject(IdentityApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    // The token store persists to sessionStorage, which outlives a TestBed.
    // Without this the token minted here is still there when the next spec's
    // store is constructed, and a suite that asserts "starts unauthenticated"
    // fails for a reason that has nothing to do with it.
    TestBed.inject(TokenStore).clear();
  });

  /** Lets the promise chain inside `signIn` reach its second request. */
  const tick = (): Promise<void> => new Promise((resolve) => { setTimeout(resolve, 0); });

  it('SENDS grantType, which the API refuses the request without', async () => {
    const signedIn = api.signIn('officer@lgu.gov.ph', 'correct-horse');

    const token = http.expectOne('/auth/token');
    expect(token.request.method).toBe('POST');
    expect(token.request.body).toMatchObject({
      grantType: 'password',
      email: 'officer@lgu.gov.ph',
      password: 'correct-horse',
    });
    token.flush({ accessToken: 'a-token' });
    await tick();

    const me = http.expectOne('/me');
    me.flush({ id: 'id', email: 'officer@lgu.gov.ph', kind: 'staff', roles: ['records-officer'] });

    await expect(signedIn).resolves.toMatchObject({ email: 'officer@lgu.gov.ph' });
  });

  it('omits totp entirely rather than sending an empty one', async () => {
    // `totp: undefined` and no `totp` are different bodies, and the endpoint's
    // shape is strict about which it accepts.
    const signedIn = api.signIn('officer@lgu.gov.ph', 'correct-horse');

    const token = http.expectOne('/auth/token');
    expect(Object.keys(token.request.body as Record<string, unknown>)).not.toContain('totp');
    token.flush({ accessToken: 'a-token' });
    await tick();
    http.expectOne('/me').flush({ id: 'id', email: 'x@y.ph', kind: 'staff', roles: [] });
    await signedIn;
  });

  it('sends the code when a second factor is given', async () => {
    const signedIn = api.signIn('assessor@lgu.gov.ph', 'correct-horse', '123456');

    const token = http.expectOne('/auth/token');
    expect(token.request.body).toMatchObject({ totp: '123456' });
    token.flush({ accessToken: 'a-token' });
    await tick();
    http.expectOne('/me').flush({ id: 'id', email: 'x@y.ph', kind: 'staff', roles: [] });
    await signedIn;
  });

  it('keeps the token so the interceptor can attach it', async () => {
    const tokens = TestBed.inject(TokenStore);
    const signedIn = api.signIn('officer@lgu.gov.ph', 'correct-horse');

    http.expectOne('/auth/token').flush({ accessToken: 'a-token', refreshToken: 'a-refresh' });
    await tick();
    http.expectOne('/me').flush({ id: 'id', email: 'x@y.ph', kind: 'staff', roles: [] });
    await signedIn;

    expect(tokens.access()).toBe('a-token');
    expect(tokens.refreshToken()).toBe('a-refresh');
    tokens.clear();
  });
});
