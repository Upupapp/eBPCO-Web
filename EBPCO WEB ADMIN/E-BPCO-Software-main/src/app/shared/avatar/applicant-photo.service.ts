import { Injectable, Signal, WritableSignal, inject, signal } from '@angular/core';
import { StaffApplicationsApi } from '../../core/api/staff-applications.api';

/**
 * The applicant's real profile photo, for every staff screen that draws an
 * avatar beside an application.
 *
 * Until 2026-09-20 no staff route could read a citizen's photo — only the
 * citizen's own `GET /me/photo` — so a citizen who set one saw it on their
 * Profile while every officer saw two initials. `GET /staff/applications/:id/
 * applicant-photo` closes that; this service is the one place the fetch
 * happens, so the list, the detail banner, the Evaluations queue and the
 * Permit Release queue all show the same picture and fetch it once.
 *
 * Fetched only when the row's `applicantHasPhoto` says there is one — the
 * server sends that flag on every queue row precisely so twenty rows do not
 * turn into twenty 404s. Bearer-authenticated (the interceptor adds the token;
 * an `<img src>` could not), then shown from an object URL — which is why the
 * CSP allows `img-src blob:`. Kept for the session: a citizen who changes
 * their photo mid-session is seen on the officer's next page load.
 */
@Injectable({ providedIn: 'root' })
export class ApplicantPhotoService {
  private readonly api = inject(StaffApplicationsApi);
  private readonly urls = new Map<string, WritableSignal<string | null>>();
  private readonly requested = new Set<string>();

  /**
   * The object URL of the applicant's photo for this application, or `null`
   * while it loads, when there is none, or when the fetch failed (initials
   * are the honest fallback in every one of those cases).
   */
  urlFor(applicationId: string, hasPhoto: boolean | undefined): Signal<string | null> {
    let url = this.urls.get(applicationId);
    if (url === undefined) {
      url = signal<string | null>(null);
      this.urls.set(applicationId, url);
    }
    if (hasPhoto === true && !this.requested.has(applicationId)) {
      this.requested.add(applicationId);
      // Off the current change-detection pass: this is called from templates.
      queueMicrotask(() => void this.load(applicationId, url as WritableSignal<string | null>));
    }
    return url.asReadonly();
  }

  private async load(applicationId: string, into: WritableSignal<string | null>): Promise<void> {
    const blob = await this.api.applicantPhoto(applicationId);
    if (blob === null) return;
    const previous = into();
    into.set(URL.createObjectURL(blob));
    if (previous !== null) URL.revokeObjectURL(previous);
  }
}
