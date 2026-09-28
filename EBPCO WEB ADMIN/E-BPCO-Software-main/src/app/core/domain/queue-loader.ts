import { Injectable, computed, inject, signal } from '@angular/core';

import { ApplicationStore } from './application-store';
import { PermitReleaseSessionCache } from './permit-release-session-cache';
import { StaffApplicationsApi } from '../api/staff-applications.api';
import { SessionService } from '../session/session.service';

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
  private readonly session = inject(SessionService);
  private readonly permitCache = inject(PermitReleaseSessionCache);

  /**
   * The account whose queue the store holds: undefined until this loader has
   * loaded anything.
   *
   * The store lives for the whole browser tab, and signing out and back in as
   * someone else does not reload the page. Before this, `ensureLoaded` saw
   * data already present and returned, so a cashier who signed in after the
   * super admin on the same tab was shown the super admin's applications,
   * counts and board (10 applications, where the cashier's own queue held 1).
   */
  private loadedFor: string | null | undefined = undefined;

  /** Drops another officer's data before anything can render it. */
  private forget(): void {
    this.loadedFor = undefined;
    this.store.replaceApplications([]);
    this.permitCache.clear();
  }

  private inFlight: Promise<void> | null = null;
  private readonly _loading = signal(false);

  readonly loading = this._loading.asReadonly();
  /** True once the server has answered, however it answered. */
  readonly loaded = computed(() => !this.store.isSeedData());

  /** Loads once. Repeat calls join the request in flight, or return. */
  async ensureLoaded(): Promise<void> {
    const account = this.session.accountId();
    if (this.loadedFor !== undefined && this.loadedFor !== account) {
      // Loaded for a different officer: cleared synchronously, before the
      // page that asked can render a single row of it.
      this.forget();
    } else if (this.loaded()) {
      // Already this officer's (or put there directly, before any load).
      this.loadedFor = account;
      return;
    }
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

  /**
   * Fetches the list again in the background and swaps in the rows, leaving
   * detail collections alone (`refreshApplicationList`). Quiet on failure: the
   * rows already on screen stay, rather than a flicker to an empty queue.
   */
  async refresh(): Promise<void> {
    const account = this.session.accountId();
    if (account === null || this.inFlight !== null) return;
    if (this.loadedFor !== account) return this.ensureLoaded();
    try {
      const page = await this.queue.page({ limit: 100 });
      if (this.session.accountId() !== account) return;
      this.store.refreshApplicationList(page.rows);
    } catch {
      // The next tick tries again; a full reload still reports failures.
    }
  }

  private async run(): Promise<void> {
    const account = this.session.accountId();
    try {
      const page = await this.queue.page({ limit: 100 });
      // Signed out or switched while this was in flight: the answer is for
      // someone who is no longer here.
      if (this.session.accountId() !== account) return;
      this.store.replaceApplications(page.rows);
      this.loadedFor = account;
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
