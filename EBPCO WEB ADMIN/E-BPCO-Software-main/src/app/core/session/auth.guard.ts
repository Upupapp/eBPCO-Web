import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from './session.service';
import { canAccessPath } from './permissions';

// Kept `false` in every normal run, including this one — login is real (see
// SessionService) and this guard's job in that state is exactly what it
// looks like below: redirect an unauthenticated visitor to /login. Flip to
// `true` only as a LOCAL, offline convenience when no backend is reachable
// at all (e.g. developing away from the LGU network) — it substitutes a
// same-machine Super Admin session for a real sign-in so the rest of the
// portal can still be exercised. Never enable this against a deployment
// anyone else can reach; it bypasses authentication entirely.
const DEV_BYPASS_ENABLED = false;

/**
 * Redirects an unauthenticated visitor to `/login`, and enforces role-based
 * path protection for one who is signed in (a real session, from the real
 * `SessionService`/`IdentityApi` — see their own doc comments). The one
 * exception is `DEV_BYPASS_ENABLED` above, an offline-only escape hatch that
 * is off by default and stays off in every normal run.
 *
 * `SessionService.restore()` is awaited here, first, whenever the in-memory
 * session is empty — which it always is on a fresh page load, since nothing
 * else in this app's bootstrap (`app.config.ts` has no `APP_INITIALIZER` for
 * it) ever calls `restore()`. Without this, `isAuthenticated()` read the
 * in-memory signal before it had ever had a chance to be filled from the
 * real token in `sessionStorage`, so this guard sent a genuinely still-
 * signed-in officer to `/login` on every single refresh — the exact
 * "logged out on reload" complaint `restore()` itself was written to
 * prevent (see its own doc comment), just never wired to the one place a
 * reload actually goes through.
 */
export const authGuard: CanActivateFn = async (_route, state) => {
  const session = inject(SessionService);
  const router = inject(Router);

  if (!session.isAuthenticated()) {
    await session.restore();
  }

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
