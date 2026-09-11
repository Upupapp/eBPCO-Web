import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from './session.service';
import { canAccessPath } from './permissions';

// QA-PASS TOGGLE: false while testing the real /login and /register screens
// (so the guard actually redirects there instead of skipping past them).
// Set back to true afterward to restore the dev bypass.
const DEV_BYPASS_ENABLED = false;

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

  // TEMPORARY DEV BYPASS: no backend is running locally right now, so real
  // sign-in can't succeed. Auto-establish a mock Super Admin session instead
  // of redirecting to /login (this used to be the guard's normal behavior —
  // see git blame on this file — before a real backend existed). Remove this
  // block and SessionService.devBypass once a backend is available again.
  if (!session.isAuthenticated()) {
    if (DEV_BYPASS_ENABLED) {
      session.devBypass();
      return true;
    }
    return router.parseUrl('/login');
  }
  const role = session.role();
  if (role && !canAccessPath(role, state.url)) {
    return router.parseUrl('/dashboard');
  }
  return true;
};
