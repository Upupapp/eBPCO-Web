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
 * Renders nothing when there is no failure, so it is safe to place
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
    }
  `,
  styleUrl: './queue-load-notice.scss',
})
export class QueueLoadNotice {
  private readonly store = inject(ApplicationStore);
  protected readonly message = this.store.loadFailure;
}
