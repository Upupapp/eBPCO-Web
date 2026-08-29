import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { TokenStore } from './token-store';

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
 * It does not swallow the error either. The token is cleared so the guard sends
 * the officer to sign in, and the failure still propagates so the caller can
 * say what did not happen.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const tokens = inject(TokenStore);
  const access = tokens.access();

  const authorised = access === null
    ? request
    : request.clone({ setHeaders: { authorization: `Bearer ${access}` } });

  return next(authorised).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // The API answers 401 for expired, revoked and disabled alike, on
        // purpose. From here they are the same thing: this token no longer
        // works and holding it only produces more 401s.
        tokens.clear();
      }
      return throwError(() => error);
    }),
  );
};
