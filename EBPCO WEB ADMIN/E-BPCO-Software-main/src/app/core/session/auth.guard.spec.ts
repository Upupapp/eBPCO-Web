import { TestBed } from '@angular/core/testing';
import { provideRouter, UrlTree } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { SessionService } from './session.service';
import { IdentityApi } from '../api/identity.api';
import { FakeIdentityApi } from '../api/identity.api.fake';
import { TokenStore } from '../api/token-store';

function runGuard(url: string) {
  const state = { url } as RouterStateSnapshot;
  const route = {} as ActivatedRouteSnapshot;
  return TestBed.runInInjectionContext(() => authGuard(route, state));
}

describe('authGuard', () => {
  let session: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SessionService,
        provideRouter([]),
        // The network, stubbed. These tests are about what the guard does once
        // somebody is signed in, not about signing in.
        { provide: IdentityApi, useFactory: () => new FakeIdentityApi(TestBed.inject(TokenStore)) },
      ],
    });
    session = TestBed.inject(SessionService);
  });

  it('REDIRECTS an unauthenticated request to /login instead of inventing a session', async () => {
    // This asserted the opposite until the portal had a server: the guard's
    // first act was `signIn('staff@ebpco.gov.ph')`, so it satisfied itself and
    // every guarded route was reachable by anyone who typed its URL. Harmless
    // against a seed file; not harmless against real applications.
    expect(session.isAuthenticated()).toBe(false);

    const result = runGuard('/dashboard');

    expect(result instanceof UrlTree).toBe(true);
    expect((result as UrlTree).toString()).toBe('/login');
    expect(session.isAuthenticated()).toBe(false);
  });

  it('allows an authenticated Super Admin into every module', async () => {
    await session.signIn('super@ebpco.gov.ph', 'correct-horse');
    for (const url of ['/dashboard', '/applications', '/evaluations', '/payments', '/permit-release', '/businesses', '/user-roles', '/workflow', '/system-logs']) {
      const result = runGuard(url);
      expect(result).toBe(true);
    }
  });

  it('denies direct navigation to a module the current role is not authorized for', async () => {
    await session.signIn('cashier@ebpco.gov.ph', 'correct-horse');
    session.setRole('Payment Officer');
    // Payment Officer is authorized for /payments...
    expect(runGuard('/payments')).toBe(true);
    // ...but not for /user-roles, which only Super Admin/Administrator see.
    const result = runGuard('/user-roles');
    expect(result instanceof UrlTree).toBe(true);
    expect((result as UrlTree).toString()).toBe('/dashboard');
  });

  it('allows every role into /dashboard regardless of their other permissions', async () => {
    await session.signIn('evaluator@ebpco.gov.ph', 'correct-horse');
    session.setRole('Evaluator');
    expect(runGuard('/dashboard')).toBe(true);
  });
});
