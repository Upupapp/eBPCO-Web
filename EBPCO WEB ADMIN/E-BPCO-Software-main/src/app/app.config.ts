import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { authInterceptor } from './core/api/auth.interceptor';

/**
 * The portal's first HTTP client.
 *
 * Until this, `ebpco-admin` had zero call sites — no `HttpClient`, no fetch,
 * and `@angular/common/http` was not even a dependency. Every screen ran from
 * an in-memory store hydrated from a seed file, which is why a browser refresh
 * lost an officer's work.
 *
 * `withInterceptors`, not the class-based form: the functional interceptor can
 * `inject()` directly, which is how it reaches the token store without a
 * provider dance.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes, withComponentInputBinding()),
  ],
};
