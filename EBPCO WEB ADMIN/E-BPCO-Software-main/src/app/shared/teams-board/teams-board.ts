import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Avatar } from '../avatar/avatar';
import { Icon } from '../icon/icon';
import { ToastService } from '../toast/toast.service';
import { TeamMember, TeamOverview, TeamsApi } from '../../core/api/teams.api';
import { StaffDirectoryApi } from '../../core/api/staff-directory.api';
import { ApplicationStore } from '../../core/domain/application-store';
import { ApplicationRecord } from '../../core/domain/application.model';
import { QueueLoader } from '../../core/domain/queue-loader';
import { Capabilities } from '../../core/session/capabilities';
import { managesStaff } from '../../core/session/permissions';
import { OFFICER_POSITIONS } from '../../core/session/position';
import { SessionService } from '../../core/session/session.service';
import { onTick } from '../../core/session/live-refresh';

const TEAM_ICONS: Record<string, string> = {
  receiving: 'mail',
  'initial-evaluation': 'file-check',
  zoning: 'map',
  'fire-safety': 'shield',
  technical: 'building',
  assessment: 'logs',
  cashier: 'wallet',
  'building-official': 'check-circle',
  releasing: 'send',
  records: 'archive',
  audit: 'eye',
  administration: 'gear',
};

/**
 * The permit office's teams: each position is a team with a lead and members.
 * The lead hands out the applications waiting at the team's step, a member
 * takes one nobody has yet, and an administrator decides who leads.
 *
 * `all` is the Teams tab of Staff & Roles; `mine` is the My Team page of an
 * officer who does not manage staff. The server decides every change and its
 * sentence is the toast.
 */
@Component({
  selector: 'app-teams-board',
  imports: [Avatar, Icon, FormsModule],
  templateUrl: './teams-board.html',
  styleUrl: './teams-board.scss',
})
export class TeamsBoard {
  readonly scope = input<'all' | 'mine'>('all');
  /** A team role changed here, so a list elsewhere on the page can follow. */
  readonly teamRoleChanged = output<{ id: string; teamRole: 'lead' | 'member' }>();

  private readonly api = inject(TeamsApi);
  private readonly directory = inject(StaffDirectoryApi);
  private readonly toast = inject(ToastService);
  private readonly store = inject(ApplicationStore);
  private readonly loader = inject(QueueLoader);
  private readonly router = inject(Router);
  private readonly capabilities = inject(Capabilities);
  protected readonly session = inject(SessionService);

  protected readonly teams = signal<readonly TeamOverview[]>([]);
  protected readonly state = signal<'loading' | 'ready' | 'failed'>('loading');
  protected readonly failure = signal('');
  /** The application or officer id being saved. */
  protected readonly busy = signal<string | null>(null);
  private readonly selectedKey = signal<string | null>(null);
  /** The lead's pick per application id; null is "Unassigned". */
  protected choice: Record<string, string | null> = {};

  constructor() {
    void this.load();
  }

  protected readonly visibleTeams = computed(() => {
    if (this.scope() === 'all') return this.teams();
    const mine = new Set(this.session.worker().teams);
    return this.teams().filter((team) => mine.has(team.key));
  });

  protected readonly selected = computed<TeamOverview | null>(() => {
    const list = this.visibleTeams();
    const chosen = list.find((team) => team.key === this.selectedKey());
    if (chosen) return chosen;
    const mine = new Set(this.session.worker().teams);
    return list.find((team) => team.ownsStep && mine.has(team.key))
      ?? list.find((team) => team.waiting > 0)
      ?? list[0]
      ?? null;
  });

  protected readonly totals = computed(() => {
    const list = this.visibleTeams();
    return {
      officers: new Set(list.flatMap((team) => team.members.map((member) => member.id))).size,
      waiting: list.reduce((sum, team) => sum + team.waiting, 0),
      unassigned: list.reduce((sum, team) => sum + team.unassigned, 0),
    };
  });

  /** Administrators and the super admin decide who leads; nobody else. */
  protected readonly managesTeams = computed(
    () => this.scope() === 'all' && this.capabilities.canEdit() && managesStaff(this.session.authority()),
  );

  /** Without `applications:read` the waiting applications are counted but cannot be listed. */
  protected readonly readsApplications = computed(() => {
    const who = this.session.authority();
    if (!who) return false;
    return who.superAdmin || who.scopes === null || who.scopes.includes('applications:read');
  });

  protected select(team: TeamOverview): void {
    this.selectedKey.set(team.key);
  }

  protected iconFor(team: TeamOverview): string {
    return TEAM_ICONS[team.key] ?? 'users';
  }

  protected officeOf(team: TeamOverview): string {
    return OFFICER_POSITIONS.find((position) => position.title === team.position)?.office ?? '';
  }

  protected leadNames(team: TeamOverview): string {
    return team.members.filter((member) => member.lead).map((member) => member.name).join(', ');
  }

  protected isMine(team: TeamOverview): boolean {
    return this.session.worker().teams.includes(team.key);
  }

  protected isMe(member: TeamMember): boolean {
    return member.id === this.session.accountId();
  }

  /** Hands this team's work out: its lead, or a super admin. */
  protected leads(team: TeamOverview): boolean {
    const me = this.session.worker();
    return me.superAdmin || (me.lead && me.teams.includes(team.key) && this.capabilities.canEdit());
  }

  /** A working member of this team, who may take an unassigned one or hand theirs back. */
  protected works(team: TeamOverview): boolean {
    return this.isMine(team) && this.capabilities.canEdit();
  }

  protected workingMembers(team: TeamOverview): readonly TeamMember[] {
    return team.members.filter((member) => member.canWork);
  }

  /** Applications waiting at this team's step, from the shared queue. */
  protected waitingFor(team: TeamOverview): readonly ApplicationRecord[] {
    return this.store.applications().filter((row) => row.responsibility?.team === team.key);
  }

  /** The business or project named on the application, or null when there is none ("—" included). */
  protected businessOf(row: ApplicationRecord): string | null {
    const name = row.businessName?.trim() ?? '';
    return name === '' || name === '—' ? null : name;
  }

  protected assigneeOf(row: ApplicationRecord): { id: string; name: string } | null {
    return row.responsibility?.assignee ?? null;
  }

  protected unchanged(row: ApplicationRecord): boolean {
    return (this.choice[row.id] ?? null) === (this.assigneeOf(row)?.id ?? null);
  }

  protected async load(): Promise<void> {
    this.state.set('loading');
    const [overview] = await Promise.all([
      this.api.overview(),
      this.readsApplications() ? this.loader.ensureLoaded() : Promise.resolve(),
    ]);
    if (overview.kind === 'ok') {
      this.teams.set(overview.value);
      this.resetChoices();
      this.state.set('ready');
    } else {
      this.failure.set(overview.kind === 'unavailable' ? 'This server does not know about teams yet.' : overview.message);
      this.state.set('failed');
    }
  }

  private async refresh(): Promise<void> {
    const [overview] = await Promise.all([
      this.api.overview(),
      this.readsApplications() ? this.loader.reload() : Promise.resolve(),
    ]);
    if (overview.kind === 'ok') this.teams.set(overview.value);
    this.resetChoices();
  }

  /**
   * The board follows the portal's pulse (LiveRefresh): another lead's
   * assignment, or an application reaching a team's step, shows without a
   * reload. The shared list was just refreshed by the pulse itself; a lead's
   * pick that has not been saved yet is kept.
   */
  private readonly followPulse = onTick(async () => {
    if (this.busy() !== null || this.state() !== 'ready') return;
    const overview = await this.api.overview();
    if (overview.kind === 'ok') this.teams.set(overview.value);
    for (const row of this.store.applications()) {
      const current = row.responsibility?.assignee?.id ?? null;
      const picked = this.choice[row.id];
      // Untouched since the last sync: follow the server. Changed by the lead
      // and not yet saved: keep their pick.
      if (picked === undefined || picked === (this.synced[row.id] ?? null)) this.choice[row.id] = current;
      this.synced[row.id] = current;
    }
  });

  /** Each application's assignee as of the last time `choice` was synced with the server. */
  private synced: Record<string, string | null> = {};

  private resetChoices(): void {
    this.choice = {};
    this.synced = {};
    for (const row of this.store.applications()) {
      const current = row.responsibility?.assignee?.id ?? null;
      this.choice[row.id] = current;
      this.synced[row.id] = current;
    }
  }

  protected async assign(row: ApplicationRecord, assigneeId: string | null): Promise<void> {
    if (this.busy() !== null) return;
    this.busy.set(row.id);
    try {
      const result = await this.api.assign(row.id, assigneeId);
      if (result.kind === 'done') {
        this.toast.success(result.detail);
        await this.refresh();
      } else {
        this.toast.error(result.kind === 'unavailable' ? 'This server does not support assignment yet.' : result.message);
      }
    } finally {
      this.busy.set(null);
    }
  }

  protected async setTeamRole(team: TeamOverview, member: TeamMember, teamRole: 'lead' | 'member'): Promise<void> {
    if (this.busy() !== null || member.lead === (teamRole === 'lead')) return;
    this.busy.set(member.id);
    try {
      const result = await this.directory.setTeamRole(member.id, teamRole);
      if (result.kind === 'done') {
        const leftWithoutLead = teamRole === 'member' && team.members.every((m) => m.id === member.id || !m.lead);
        this.toast.success(teamRole === 'lead'
          ? `${member.name} now leads the ${team.name} team.`
          : `${member.name} is now a member of the ${team.name} team.`);
        if (leftWithoutLead && team.ownsStep) {
          this.toast.info(`The ${team.name} team has no lead now. Make someone lead so its work can be handed out.`);
        }
        this.teamRoleChanged.emit({ id: member.id, teamRole });
        await this.refresh();
      } else {
        this.toast.error(result.kind === 'unavailable' ? 'This server cannot change team roles yet.' : result.message);
      }
    } finally {
      this.busy.set(null);
    }
  }

  protected open(row: ApplicationRecord): void {
    void this.router.navigateByUrl(`/applications/${row.id}`);
  }
}
