import { Injectable, computed, inject, signal } from '@angular/core';

import { ApplicationStore } from './application-store';
import { StaffApplicationsApi } from '../api/staff-applications.api';

/**
 * The one place the application queue is read from the server.
 *
 * ── Why this exists ─────────────────────────────────────────────────────
 *
 * Until 2 Sep, exactly one page called the API: Applications. Every other
 * surface — Dashboard, Evaluations, Payments, the Business Stages board —
 * read `ApplicationStore` and got whatever was in it. Login lands on
 * `/dashboard`, so on every sign-in an officer met a backlog, stage counts and
 * an overdue panel built from 50 generated applications (S-1).
 *
 * The seed notice made that honest. It did not make it useful: a dashboard that
 * says "these are samples" is still a dashboard with no figures on it.
 *
 * ── Loaded once, by the shell ───────────────────────────────────────────
 *
 * `AdminLayout` wraps every authenticated route, so calling this there means no
 * page has to remember. Pages that want to force a refresh — Applications after
 * a filter change — call `reload()`.
 *
 * `ensureLoaded` is idempotent and concurrency-safe: the in-flight promise is
 * held and returned, so two pages constructing at once produce one request
 * rather than two, and neither has to know about the other.
 *
 * ── Failure is recorded, never thrown ───────────────────────────────────
 *
 * A rejected promise here would surface as an unhandled error in a component
 * that only wanted to render. The store carries the failure instead, and every
 * page already shows it through the queue-load notice.
 */
@Injectable({ providedIn: 'root' })
export class QueueLoader {
  private readonly store = inject(ApplicationStore);
  private readonly queue = inject(StaffApplicationsApi);

  private inFlight: Promise<void> | null = null;
  private readonly _loading = signal(false);

  readonly loading = this._loading.asReadonly();
  /** True once the server has answered, however it answered. */
  readonly loaded = computed(() => !this.store.isSeedData());

  /** Loads once. Repeat calls join the request in flight, or return. */
  async ensureLoaded(): Promise<void> {
    if (this.loaded()) return;
    if (this.inFlight !== null) return this.inFlight;
    return this.reload();
  }

  /** Loads again regardless, replacing whatever is held. */
  async reload(): Promise<void> {
    if (this.inFlight !== null) return this.inFlight;
    this._loading.set(true);
    this.inFlight = this.run().finally(() => {
      this.inFlight = null;
      this._loading.set(false);
    });
    return this.inFlight;
  }

  private async run(): Promise<void> {
    try {
      const page = await this.queue.page({ limit: 100 });
      this.store.replaceApplications(page.rows);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'The queue could not be loaded.';
      // Both, and in this order: emptying first means no page renders stale
      // seed rows under a failure notice that says they are not current work.
      this.store.replaceApplications([]);
      this.store.recordLoadFailure(message);
    }
  }
}
