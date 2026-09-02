import { Component, inject } from '@angular/core';

import { ApplicationStore } from '../../core/domain/application-store';
import { Icon } from '../icon/icon';

/**
 * Says, on any page, that the application queue could not be read.
 *
 * Five pages read `ApplicationStore.applications()` and only one of them
 * fetches. When that fetch failed the store was emptied and every other page
 * carried on as normal — Permit Release showing "Ready for Release 0",
 * Dashboard showing an empty backlog, Evaluations showing empty stage queues.
 * Each of those is a claim about the LGU's workload, and none of them was true:
 * the portal had not been told anything, it had failed to ask.
 *
 * One component rather than a copied block per page, so the wording cannot
 * drift and a page that gains this later gains the same sentence.
 *
 * ── Three states, not two ───────────────────────────────────────────────
 *
 * A failed load is one of them. The other, added 2026-08-31, is that no load
 * has been ATTEMPTED — the store still holds its 50-application seed, and every
 * figure on the page is derived from work that does not exist.
 *
 * That state was invisible and it was the common one: only Applications called
 * the server, and login lands on Dashboard, so every officer met a fabricated
 * backlog on every sign-in (S-1). The failure notice could not cover it, because
 * nothing had failed.
 *
 * Renders nothing once the server has answered, so it is safe to place
 * unconditionally under a page's topbar.
 */
@Component({
  selector: 'app-queue-load-notice',
  imports: [Icon],
  template: `
    @if (message(); as text) {
      <div class="queue-load-notice" role="alert">
        <app-icon name="alert-triangle" [size]="16" />
        <span>
          The application queue could not be loaded, so the figures on this page
          are not a picture of current work. {{ text }}
        </span>
      </div>
    } @else if (isSeedData()) {
      <!--
        Not asked, as distinct from asked and refused. Until the server has
        answered, these figures are generated sample applications — 50 of them —
        and every number on the page is derived from work that does not exist.
      -->
      <div class="queue-load-notice seed" role="note">
        <app-icon name="alert-triangle" [size]="16" />
        <span>
          These are <strong>sample applications</strong>, not the office's real
          workload. Nothing on this page has been read from the server yet.
        </span>
      </div>
    }
  `,
  styleUrl: './queue-load-notice.scss',
})
export class QueueLoadNotice {
  private readonly store = inject(ApplicationStore);
  protected readonly message = this.store.loadFailure;
  protected readonly isSeedData = this.store.isSeedData;
}
