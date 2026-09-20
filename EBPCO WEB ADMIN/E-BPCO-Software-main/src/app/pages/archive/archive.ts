import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { Router } from '@angular/router';

import { ApplicationStore } from '../../core/domain/application-store';
import { ApplicationRecord } from '../../core/domain/application.model';
import { QueueLoadNotice } from '../../shared/queue-load-notice/queue-load-notice';
import { Topbar } from '../../shared/topbar/topbar';
import { StaffApplicationsApi } from '../../core/api/staff-applications.api';
import { Avatar } from '../../shared/avatar/avatar';
import { Icon } from '../../shared/icon/icon';

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

interface Attribution {
  readonly archivedBy: string | null;
  readonly archivedAt: string | null;
  readonly remarks: string | null;
}

const NO_ATTRIBUTION: Attribution = { archivedBy: null, archivedAt: null, remarks: null };

/** Terminal statuses. An application in any of these has left the working queue. */
const ARCHIVED_STATUSES: readonly string[] = ['Cancelled', 'Rejected', 'Expired'];

/** The server's raw ISO timestamp, in the form the table already shows for other dates. */
function formatWhen(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-PH', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

@Component({
  selector: 'app-archive',
  imports: [QueueLoadNotice, Topbar, Avatar, Icon],
  templateUrl: './archive.html',
  styleUrl: './archive.scss',
})
export class Archive {
  private readonly store = inject(ApplicationStore);
  private readonly router = inject(Router);
  private readonly applicationsApi = inject(StaffApplicationsApi);

  /**
   * `store.auditEvents()` is seed-only — `replaceApplications` wipes it to
   * `[]` on every real load (see `ApplicationStore`'s own doc comment on
   * `_businesses`/`_applicants` for the same pattern), so "Set aside by" and
   * "Reason" were always blank on real data even though the record's own
   * timeline (`GET /staff/applications/:id`, now carrying `actorName` — see
   * `ApplicationTimelineEvent`'s own doc comment) genuinely has the answer.
   * Fetched per archived row, once, and cached here rather than refetched on
   * every `rows()` recomputation.
   */
  private readonly realAttribution = signal<ReadonlyMap<string, Attribution>>(new Map());
  private readonly fetching = new Set<string>();

  private readonly baseRows = computed<ApplicationRecord[]>(() =>
    this.store
      .applications()
      .filter((a) => ARCHIVED_STATUSES.includes(a.lifecycleStatus))
      .sort((a, b) => b.dateValue.getTime() - a.dateValue.getTime()),
  );

  constructor() {
    effect(() => {
      const isSeed = this.store.isSeedData();
      const ids = this.baseRows().map((r) => r.id);
      if (!isSeed) untracked(() => this.loadRealAttribution(ids));
    });
  }

  private async loadRealAttribution(ids: readonly string[]): Promise<void> {
    const toFetch = ids.filter((id) => !this.realAttribution().has(id) && !this.fetching.has(id));
    for (const id of toFetch) this.fetching.add(id);
    await Promise.all(
      toFetch.map(async (id) => {
        const result = await this.applicationsApi.detail(id);
        const attribution: Attribution = result.kind === 'ok'
          ? this.attributionFromTimeline(result.detail.timeline)
          : NO_ATTRIBUTION;
        this.realAttribution.update((current) => new Map(current).set(id, attribution));
        this.fetching.delete(id);
      }),
    );
  }

  private attributionFromTimeline(
    timeline: ReadonlyArray<{ toStatus: string; occurredAt: string; actorName: string | null; remarks: string | null }>,
  ): Attribution {
    // The most recent archiving entry for this application. Most recent
    // rather than first: an application returned to the queue and set aside
    // again should show the decision that currently stands.
    const entry = [...timeline]
      .filter((e) => ARCHIVED_STATUSES.includes(e.toStatus))
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())[0];
    if (!entry) return NO_ATTRIBUTION;
    return {
      archivedBy: entry.actorName,
      archivedAt: formatWhen(entry.occurredAt),
      remarks: entry.remarks,
    };
  }

  protected readonly rows = computed<ArchivedRow[]>(() => {
    if (!this.store.isSeedData()) {
      const attribution = this.realAttribution();
      return this.baseRows().map((record) => ({
        record,
        ...(attribution.get(record.id) ?? NO_ATTRIBUTION),
      }));
    }
    const audit = this.store.auditEvents();
    return this.baseRows().map((record) => {
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
    });
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
