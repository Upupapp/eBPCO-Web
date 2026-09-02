import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { QueueLoader } from '../../core/domain/queue-loader';
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
    void inject(QueueLoader).ensureLoaded();
  }
}
