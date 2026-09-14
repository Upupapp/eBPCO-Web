import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { TokenStore } from './token-store';
import { SessionService } from '../session/session.service';

/**
 * Attaches the bearer token, and gets out of the way of everything else.
 *
 * ── What it deliberately does not do ────────────────────────────────────
 *
 * It does not silently refresh on 401. A refresh interceptor has to queue the
 * requests that arrive mid-refresh, replay them, and decide what to do when the
 * refresh itself fails — and when it gets that wrong the symptom is a request
 * replayed twice, which against `POST /staff/payments/:id/verify` means an act
 * recorded twice. The API issues fifteen-minute access tokens and a refresh
 * endpoint; wiring that belongs in a change that can be tested on its own.
 *
 * It does not swallow the error either. The token is cleared and the local
 * session dropped so every `isAuthenticated()` check agrees immediately, and
 * the failure still propagates so the caller can say what did not happen.
 *
 * ── Why it redirects here, not just in the guard ────────────────────────
 *
 * The guard only runs on navigation. An officer sitting on a page whose token
 * expired mid-session never navigates anywhere — they just click the button
 * they were already looking at — so a guard-only fix left them stranded on
 * the same screen after every action failed with the same generic toast, with
 * no visible way out short of knowing to log out and back in by hand. Only a
 * request that WAS carrying a token counts as a session expiring; a 401 from
 * an unauthenticated call (wrong password at `/auth/token`, for instance) is
 * a normal refusal on that screen, not a session to tear down or redirect
 * away from.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const tokens = inject(TokenStore);
  const session = inject(SessionService);
  const router = inject(Router);
  const access = tokens.access();

  const authorised = access === null
    ? request
    : request.clone({ setHeaders: { authorization: `Bearer ${access}` } });

  return next(authorised).pipe(
    catchError((error: unknown) => {
      if (access !== null && error instanceof HttpErrorResponse && error.status === 401) {
        // The API answers 401 for expired, revoked and disabled alike, on
        // purpose. From here they are the same thing: this token no longer
        // works and holding it only produces more 401s.
        tokens.clear();
        session.forceSignOut();
        if (!router.url.startsWith('/login')) {
          router.navigate(['/login'], { queryParams: { reason: 'session-expired' } });
        }
      }
      return throwError(() => error);
    }),
  );
};
