import { TestBed } from '@angular/core/testing';
import { provideRouter, UrlTree } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { SessionService } from './session.service';

function runGuard(url: string) {
  const state = { url } as RouterStateSnapshot;
  const route = {} as ActivatedRouteSnapshot;
  return TestBed.runInInjectionContext(() => authGuard(route, state));
}

describe('authGuard', () => {
  let session: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SessionService, provideRouter([])],
    });
    session = TestBed.inject(SessionService);
  });

  it('auto-establishes the mock session for an unauthenticated request instead of redirecting to /login', () => {
    expect(session.isAuthenticated()).toBe(false);
    const result = runGuard('/dashboard');
    expect(result).toBe(true);
    expect(session.isAuthenticated()).toBe(true);
  });

  it('allows an authenticated Super Admin into every module', () => {
    session.signIn('super@ebpco.gov.ph');
    for (const url of ['/dashboard', '/applications', '/evaluations', '/payments', '/permit-release', '/businesses', '/user-roles', '/workflow', '/system-logs']) {
      const result = runGuard(url);
      expect(result).toBe(true);
    }
  });

  it('denies direct navigation to a module the current role is not authorized for', () => {
    session.signIn('cashier@ebpco.gov.ph');
    session.setRole('Payment Officer');
    // Payment Officer is authorized for /payments...
    expect(runGuard('/payments')).toBe(true);
    // ...but not for /user-roles, which only Super Admin/Administrator see.
    const result = runGuard('/user-roles');
    expect(result instanceof UrlTree).toBe(true);
    expect((result as UrlTree).toString()).toBe('/dashboard');
  });

  it('allows every role into /dashboard regardless of their other permissions', () => {
    session.signIn('evaluator@ebpco.gov.ph');
    session.setRole('Evaluator');
    expect(runGuard('/dashboard')).toBe(true);
  });
});
