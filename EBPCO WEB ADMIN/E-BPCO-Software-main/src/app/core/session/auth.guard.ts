import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from './session.service';
import { canAccessPath } from './permissions';

/**
 * There's no real backend or credential check behind login (see
 * SessionService) — every successful sign-in produces the same mock Super
 * Admin identity regardless of what was typed. So rather than bouncing a
 * direct URL (e.g. typing /dashboard straight into the address bar, or
 * refreshing, which drops the in-memory session) back to /login, this
 * guard just establishes that same mock session on the fly and lets the
 * navigation continue. Role-based path protection still applies below —
 * this only removes the login *redirect*, not authorization.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const session = inject(SessionService);
  const router = inject(Router);

  // Signed out means signed out. This used to CREATE a session here —
  // `signIn('staff@ebpco.gov.ph')` — which made every guarded route reachable
  // by anyone who typed its URL, because the guard's first act was to satisfy
  // itself. Harmless while the portal had no server and no real data behind it;
  // not harmless now that it does.
  if (!session.isAuthenticated()) {
    return router.parseUrl('/login');
  }
  const role = session.role();
  if (role && !canAccessPath(role, state.url)) {
    return router.parseUrl('/dashboard');
  }
  return true;
};
