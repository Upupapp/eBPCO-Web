import { Component, DestroyRef, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { QueueLoader } from '../../core/domain/queue-loader';
import { LiveRefresh } from '../../core/session/live-refresh';
import { Sidebar } from '../../shared/sidebar/sidebar';

/**
 * The shell every authenticated route renders inside.
 *
 * It loads the application queue, and that is the whole reason it now has a
 * constructor. Until 2 Sep exactly one page called the API — Applications —
 * and every other surface read whatever happened to be in the store. Login
 * lands on `/dashboard`, so on every sign-in an officer met figures built from
 * 50 generated applications (S-1).
 *
 * Loading here rather than in each page means no page has to remember, and a
 * page added later inherits it. `ensureLoaded` is idempotent, so this costs one
 * request per session rather than one per navigation.
 *
 * Deliberately not awaited: the shell renders immediately and every surface
 * already states which of the three states it is in — seed, failed, or loaded.
 * Blocking the shell on a request would trade an honest interim reading for a
 * blank screen.
 */
@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, Sidebar],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  constructor() {
    const loader = inject(QueueLoader);
    const live = inject(LiveRefresh);
    void loader.ensureLoaded();

    // Every screen refreshes on one pulse (see LiveRefresh): on a timer while
    // the tab is visible, and at once when the officer comes back to it.
    const visible = (): boolean => document.visibilityState === 'visible';
    const timer = setInterval(() => {
      if (visible()) void live.pulse();
    }, LiveRefresh.INTERVAL_MS);
    const onVisible = (): void => {
      if (visible()) void live.pulse();
    };
    document.addEventListener('visibilitychange', onVisible);
    inject(DestroyRef).onDestroy(() => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    });
  }
}
