import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Topbar } from '../../shared/topbar/topbar';
import { Icon } from '../../shared/icon/icon';
import { ToastService } from '../../shared/toast/toast.service';
import { TeamOverview, TeamsApi } from '../../core/api/teams.api';
import { ApplicationStore } from '../../core/domain/application-store';
import { ApplicationRecord } from '../../core/domain/application.model';
import { QueueLoader } from '../../core/domain/queue-loader';
import { SessionService } from '../../core/session/session.service';

/**
 * The permit office's teams (owner request, 2026-09-29: "a full hierarchy of
 * the user and staffs ... a team lead and team members").
 *
 * Every team: its lead and members, the work waiting at its step, and who has
 * what. A team lead (or a super admin) hands the team's applications out from
 * here; a member takes an unassigned one. The server decides every assignment
 * and says why when it refuses, and that sentence is the toast.
 */
@Component({
  selector: 'app-teams',
  imports: [Topbar, Icon, FormsModule],
  templateUrl: './teams.html',
  styleUrl: './teams.scss',
})
export class Teams {
  private readonly api = inject(TeamsApi);
  private readonly toast = inject(ToastService);
  private readonly store = inject(ApplicationStore);
  private readonly loader = inject(QueueLoader);
  private readonly router = inject(Router);
  protected readonly session = inject(SessionService);

  protected readonly teams = signal<readonly TeamOverview[]>([]);
  protected readonly state = signal<'loading' | 'ready' | 'failed'>('loading');
  protected readonly failure = signal('');
  protected readonly busyId = signal<string | null>(null);
  /** Chosen assignee per application id, for the lead's selects. */
  protected choice: Record<string, string> = {};

  constructor() {
    void this.load();
  }

  /** The signed-in officer's own team(s) first, then the rest. */
  protected readonly ordered = computed(() => {
    const mine = new Set(this.session.worker().teams);
    return [...this.teams()].sort((a, b) => Number(mine.has(b.key)) - Number(mine.has(a.key)));
  });

  protected isMine(team: TeamOverview): boolean {
    return this.session.worker().teams.includes(team.key);
  }

  /** Whether this officer hands out this team's work: its lead, or a super admin. */
  protected leads(team: TeamOverview): boolean {
    const me = this.session.worker();
    return me.superAdmin || (me.lead && me.teams.includes(team.key));
  }

  /** Applications waiting at this team's step, from the shared queue. */
  protected waitingFor(team: TeamOverview): readonly ApplicationRecord[] {
    return this.store.applications().filter((row) => row.responsibility?.team === team.key);
  }

  protected async load(): Promise<void> {
    this.state.set('loading');
    const [overview] = await Promise.all([this.api.overview(), this.loader.ensureLoaded()]);
    if (overview.kind === 'ok') {
      this.teams.set(overview.value);
      this.choice = {};
      for (const row of this.store.applications()) {
        const assignee = row.responsibility?.assignee;
        if (assignee) this.choice[row.id] = assignee.id;
      }
      this.state.set('ready');
    } else {
      this.failure.set(overview.kind === 'unavailable' ? 'This server does not know about teams yet.' : overview.message);
      this.state.set('failed');
    }
  }

  protected async assign(row: ApplicationRecord, assigneeId: string | null): Promise<void> {
    if (this.busyId() !== null) return;
    this.busyId.set(row.id);
    try {
      const result = await this.api.assign(row.id, assigneeId);
      if (result.kind === 'done') {
        this.toast.success(result.detail);
        await this.loader.reload();
        await this.load();
      } else {
        this.toast.error(result.kind === 'unavailable' ? 'This server does not support assignment yet.' : result.message);
      }
    } finally {
      this.busyId.set(null);
    }
  }

  protected open(row: ApplicationRecord): void {
    void this.router.navigateByUrl(`/applications/${row.id}`);
  }
}
