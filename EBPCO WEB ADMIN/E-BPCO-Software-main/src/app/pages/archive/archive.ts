import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ApplicationStore } from '../../core/domain/application-store';
import { ApplicationRecord } from '../../core/domain/application.model';
import { QueueLoadNotice } from '../../shared/queue-load-notice/queue-load-notice';
import { Topbar } from '../../shared/topbar/topbar';

/**
 * Everything that was set aside, and why.
 *
 * Owner ruling, 2026-08-31: no delete access anywhere — archive only, and all
 * archived items are preserved in an archive section.
 *
 * ── Why this page has to exist ──────────────────────────────────────────
 *
 * "Archived, not deleted" is a promise, and until now it was one nobody could
 * check. An application moved to Cancelled left the working queue and appeared
 * nowhere else; the difference between archiving and deleting was visible only
 * to somebody reading the store. A preservation guarantee with no way to see
 * what was preserved is indistinguishable from the deletion it replaced.
 *
 * ── Read-only, deliberately ─────────────────────────────────────────────
 *
 * Nothing here can be edited, re-archived or removed. Restoring an application
 * is a lifecycle transition and belongs to the workflow that governs
 * transitions, not to a list that exists to show what happened. A page whose
 * whole point is preservation must not be the place things can be changed from.
 */

interface ArchivedRow {
  readonly record: ApplicationRecord;
  readonly archivedBy: string | null;
  readonly archivedAt: string | null;
  readonly remarks: string | null;
}

/** Terminal statuses. An application in any of these has left the working queue. */
const ARCHIVED_STATUSES: readonly string[] = ['Cancelled', 'Rejected', 'Expired'];

@Component({
  selector: 'app-archive',
  imports: [QueueLoadNotice, Topbar],
  templateUrl: './archive.html',
  styleUrl: './archive.scss',
})
export class Archive {
  private readonly store = inject(ApplicationStore);
  private readonly router = inject(Router);

  protected readonly rows = computed<ArchivedRow[]>(() => {
    const audit = this.store.auditEvents();
    return this.store
      .applications()
      .filter((a) => ARCHIVED_STATUSES.includes(a.lifecycleStatus))
      .map((record) => {
        // The most recent archiving entry for this application. Most recent
        // rather than first: an application returned to the queue and set
        // aside again should show the decision that currently stands.
        const entry = audit
          .filter((e) => e.applicationId === record.id && /archiv|cancel/i.test(e.action))
          .sort((a, b) => b.timestampValue.getTime() - a.timestampValue.getTime())[0];
        return {
          record,
          archivedBy: entry?.actor ?? null,
          archivedAt: entry?.timestamp ?? null,
          remarks: entry?.remarks ?? null,
        };
      })
      .sort((a, b) => b.record.dateValue.getTime() - a.record.dateValue.getTime());
  });

  protected readonly count = computed(() => this.rows().length);

  /** True when the queue loaded and genuinely holds nothing archived. */
  protected readonly emptyAndKnown = computed(
    () => this.store.loadFailure() === null && this.count() === 0,
  );

  protected open(row: ArchivedRow): void {
    this.router.navigateByUrl(`/applications/${row.record.id}`);
  }
}
