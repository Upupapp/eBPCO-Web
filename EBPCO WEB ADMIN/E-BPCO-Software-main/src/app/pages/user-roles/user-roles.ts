import { Component, computed, inject, signal, OnInit } from '@angular/core';
import qrcodegen from 'qrcode-generator';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Topbar } from '../../shared/topbar/topbar';
import { KpiCard, KpiIllustration, KpiTone } from '../../shared/kpi-card/kpi-card';
import { Icon } from '../../shared/icon/icon';
import { Avatar } from '../../shared/avatar/avatar';
import { Pagination } from '../../shared/pagination/pagination';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { downloadCsv } from '../../shared/utils/export-csv';
import { SessionService } from '../../core/session/session.service';
import {
  StaffAccess, StaffDirectoryApi, StaffMember, StaffSession, StaffWriteResult,
} from '../../core/api/staff-directory.api';
import { AccountAuditResult, AuditApi, AuditEntry, describeAuditAction } from '../../core/api/audit.api';
import { ALL_WIRE_ROLES, WIRE_ROLE_LABELS, portalRoleFor } from '../../core/api/role-map';
import { AccessLevel } from '../../core/api/access-request.api';
import { Capabilities } from '../../core/session/capabilities';
import { ViewOnlyNotice } from '../../shared/view-only-notice/view-only-notice';
import { ALL_PERMIT_TYPES, PermitType } from '../../core/domain/permit.model';
import { ApplicationStore } from '../../core/domain/application-store';
import { QueueLoader } from '../../core/domain/queue-loader';
import { isAssignedTo } from '../../core/domain/responsibility';
import { ToastService } from '../../shared/toast/toast.service';
import {
  EVALUATION_STAGES, OFFICER_POSITIONS, OfficerPosition, authorityForAccount, positionFor, presetFor,
} from '../../core/session/position';
import { buildPermissionMatrix } from './user-detail-data';

type Tab = 'users' | 'positions';
/** The list; one account read-only; one account's edit form; a new account's form. */
type PageView = 'list' | 'detail' | 'edit' | 'create';
type UserDetailTab = 'profile' | 'access' | 'assignments' | 'security' | 'activity';
/**
 * `null` where the portal does not know. Status used to be derived from the
 * row's INDEX — `i % 9 === 8 ? 'Pending' : ...` — so an administrator could
 * read "Inactive" off a number with no account behind it. Owner ruling,
 * 29 Aug: show what is known, dash what is not.
 */
type UserStatus = 'Active' | 'Inactive' | 'Pending' | null;

const CUSTOM = 'custom';

export interface UserRow {
  /** The server's account id. */
  id: string;
  /**
   * The access this account actually holds, carried raw as well as rendered.
   *
   * Editing has to start from the real values, not from parsing "2 forms" back
   * out of a label — a round trip through display text is how an edit quietly
   * grants something nobody chose. `null` until this row's
   * `GET /staff/users/:id/access` call has answered.
   */
  level: AccessLevel | null;
  permitTypes: readonly string[] | null;
  /** The evaluation stages it decides; `null` until access has loaded (or from an older server). */
  stages: readonly string[] | null;
  /**
   * The roles the SERVER holds for this account, kept raw. The
   * last-super-admin guard checks these, never a display string.
   */
  serverRoles: readonly string[];
  /** The officer's own name, or null when never recorded. */
  fullName: string | null;
  /** What the page shows as the name — the full name, else the email. */
  name: string;
  email: string;
  /** The portal's coarse role, for the permission rules that still take one. */
  role: string;
  /** "Fire Safety Evaluator", "Cashier" — the account's position. */
  position: string;
  /** The office behind the position, when it is one of the presets. */
  office: string | null;
  /** "View and edit · 17 forms", or why that is not known. */
  department: string;
  status: UserStatus;
  mfaRequired: boolean;
  mfaEnrolled: boolean;
  createdAt: string | null;
  /** `null` when unknown — it used to be index arithmetic ("Online now", "3h ago"). */
  lastActive: string | null;
}

/**
 * The server's raw ISO timestamp, in a form an officer reads without decoding
 * it themselves. Anything that is not a real timestamp is left as it was.
 */
function formatLastActive(value: string | null): string | null {
  if (!value) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-PH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function describePosition(roles: readonly string[], stages: readonly string[] | null): {
  position: string; office: string | null;
} {
  const preset = presetFor(roles, stages ?? []);
  if (preset !== null) return { position: preset.title, office: preset.office };
  if (roles.length === 0) return { position: 'No position yet', office: null };
  return { position: positionFor(roles, stages), office: null };
}

/** A server staff record as this page's row. Access (level, forms, stages) follows in `withAccess`. */
function toUserRow(member: StaffMember): UserRow {
  const fullName = member.fullName?.trim() || null;
  return {
    id: member.id,
    level: null,
    permitTypes: null,
    stages: null,
    serverRoles: member.roles,
    fullName,
    name: fullName ?? member.email,
    email: member.email,
    role: portalRoleFor(member.roles) ?? 'Role not recognised',
    ...describePosition(member.roles, null),
    department: 'Access not yet loaded',
    status: member.status === 'Disabled' ? 'Inactive' : member.status === 'Pending' ? 'Pending' : 'Active',
    mfaRequired: member.mfaRequired,
    mfaEnrolled: member.mfaEnrolled,
    createdAt: member.createdAt ?? null,
    lastActive: formatLastActive(member.lastSignInAt),
  };
}

/** Folds a `GET /staff/users/:id/access` answer into a row already on screen. */
function withAccess(row: UserRow, access: StaffAccess | null): UserRow {
  if (access === null) {
    return { ...row, department: 'Access could not be read' };
  }
  const stages = access.evaluationStages ?? null;
  const count = access.permitTypes.length;
  return {
    ...row,
    level: access.level,
    permitTypes: access.permitTypes,
    stages,
    ...describePosition(row.serverRoles, stages),
    department: count === 0
      ? 'No forms assigned'
      : `${access.level === 'view-edit' ? 'View and edit' : 'View only'} · ${count} form${count === 1 ? '' : 's'}`,
  };
}

const sameSet = (a: Iterable<string>, b: Iterable<string>): boolean => {
  const left = new Set(a);
  const right = new Set(b);
  return left.size === right.size && [...left].every((item) => right.has(item));
};

@Component({
  selector: 'app-user-roles',
  imports: [ViewOnlyNotice, Topbar, KpiCard, Icon, Avatar, Pagination, FormsModule, ConfirmDialog],
  templateUrl: './user-roles.html',
  styleUrl: './user-roles.scss',
})
export class UserRoles implements OnInit {
  protected readonly capabilities = inject(Capabilities);
  protected readonly formatLastActive = formatLastActive;
  protected readonly describeAuditAction = describeAuditAction;

  private readonly session = inject(SessionService);
  private readonly toast = inject(ToastService);
  private readonly directory = inject(StaffDirectoryApi);
  private readonly audit = inject(AuditApi);
  private readonly store = inject(ApplicationStore);
  private readonly loader = inject(QueueLoader);
  private readonly router = inject(Router);

  protected readonly tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'users', label: 'Staff Accounts', icon: 'user' },
    { key: 'positions', label: 'Positions', icon: 'shield' },
  ];

  protected readonly activeTab = signal<Tab>('users');
  protected readonly page = signal(1);
  protected readonly pageSize = 8;
  protected readonly searchTerm = signal('');
  protected readonly positionFilter = signal('All Positions');
  protected readonly statusFilter = signal('All Statuses');

  /** The viewer is a super admin — the only one who may delete, and who may act on another super admin. */
  protected readonly viewerIsSuperAdmin = computed(() => this.session.authority()?.superAdmin === true);

  /**
   * The staff list, read from the server — never invented. Three states,
   * because an empty table is not an answer: loaded, capability absent, read
   * failed. `directoryLoading` is true until the server has answered, so the
   * page never presents an empty list as "no staff".
   */
  private readonly users = signal<UserRow[]>([]);
  protected readonly directoryLoading = signal(true);
  protected readonly directoryUnavailable = signal(false);
  protected readonly directoryError = signal<string | null>(null);

  protected readonly positions = OFFICER_POSITIONS;
  protected readonly positionOptions = [...OFFICER_POSITIONS.map((p) => p.title), 'Custom'];
  protected readonly statusOptions: UserStatus[] = ['Active', 'Inactive', 'Pending'];

  /** How many ENABLED accounts hold each preset position. */
  protected holdersOf(position: OfficerPosition): number {
    return this.users().filter((u) => u.status !== 'Inactive' && u.position === position.title).length;
  }

  protected readonly stats = computed<
    { icon: string; tone: KpiTone; illustration: KpiIllustration; label: string; value: string; footnote?: string }[]
  >(() => {
    const all = this.users();
    const active = all.filter((u) => u.status === 'Active').length;
    const pending = all.filter((u) => u.status === 'Pending').length;
    // The officer positions, not counting the super admin's own: which of the
    // office's jobs has somebody able to do it today.
    const officerPositions = OFFICER_POSITIONS.filter((p) => p.key !== 'super-admin');
    const filled = officerPositions.filter((p) => this.holdersOf(p) > 0).length;
    return [
      {
        icon: 'users', tone: 'info', illustration: 'users',
        label: 'Staff Accounts', value: String(all.length), footnote: 'Every account on the server',
      },
      {
        icon: 'check-circle', tone: 'success', illustration: 'active',
        label: 'Active', value: String(active),
        footnote: `${Math.round((active / (all.length || 1)) * 100)}% have signed in`,
      },
      {
        icon: 'alert-triangle', tone: 'warning', illustration: 'pending',
        label: 'Not Yet Signed In', value: String(pending), footnote: 'Password not set yet',
      },
      {
        icon: 'user-check', tone: 'neutral', illustration: 'roles',
        label: 'Positions Filled', value: `${filled} / ${officerPositions.length}`,
        footnote: 'Officer positions with an account',
      },
    ];
  });

  async ngOnInit(): Promise<void> {
    await this.loadDirectory();
  }

  protected async loadDirectory(): Promise<void> {
    this.directoryLoading.set(true);
    this.directoryUnavailable.set(false);
    this.directoryError.set(null);
    try {
      const result = await this.directory.list();
      if (result.kind === 'ok') {
        const rows = result.members.map(toUserRow);
        // The roster alone does not say what each account may do — that is a
        // separate call per account, fired in parallel once it answers.
        this.users.set(rows);
        await this.loadAccessFor(rows);
        return;
      }
      this.users.set([]);
      if (result.kind === 'unavailable') this.directoryUnavailable.set(true);
      else this.directoryError.set(result.message);
    } finally {
      this.directoryLoading.set(false);
    }
  }

  private async loadAccessFor(rows: readonly UserRow[]): Promise<void> {
    const answers = await Promise.all(
      rows.map(async (row) => {
        const result = await this.directory.access(row.id);
        return { id: row.id, access: result.kind === 'ok' ? result.access : null };
      }),
    );
    const byId = new Map(answers.map((a) => [a.id, a.access] as const));
    this.users.update((current) =>
      current.map((row) => (byId.has(row.id) ? withAccess(row, byId.get(row.id)!) : row)),
    );
  }

  protected readonly filteredUsers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const position = this.positionFilter();
    const status = this.statusFilter();
    const presetTitles = new Set(OFFICER_POSITIONS.map((p) => p.title));
    return this.users().filter((u) => {
      if (position === 'Custom' && presetTitles.has(u.position)) return false;
      if (position !== 'All Positions' && position !== 'Custom' && u.position !== position) return false;
      if (status !== 'All Statuses' && u.status !== status) return false;
      if (!term) return true;
      return (
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.position.toLowerCase().includes(term)
      );
    });
  });

  protected readonly totalItems = computed(() => this.filteredUsers().length);

  protected readonly pagedUsers = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredUsers().slice(start, start + this.pageSize);
  });

  selectTab(tab: Tab): void {
    this.activeTab.set(tab);
    this.page.set(1);
  }

  onFilterChange(): void {
    this.page.set(1);
  }

  // ---- Which account is open, and how ------------------------------------

  protected readonly view = signal<PageView>('list');
  protected readonly selectedUser = signal<UserRow | null>(null);
  protected readonly userDetailTab = signal<UserDetailTab>('profile');

  /** The row's View — the account, read-only. */
  openDetail(row: UserRow): void {
    this.selectedUser.set(row);
    this.userDetailTab.set('profile');
    this.view.set('detail');
  }

  backToList(): void {
    this.view.set('list');
  }

  /** What the open account may do, asked of the same rules the portal enforces. */
  protected readonly selectedAuthority = computed(() => {
    const row = this.selectedUser();
    if (!row) return null;
    const portalRole = portalRoleFor(row.serverRoles) ?? 'Auditor';
    return authorityForAccount(row.serverRoles, row.stages, row.level, portalRole);
  });

  protected readonly permissionMatrix = computed(() => buildPermissionMatrix(this.selectedAuthority()));

  protected readonly selectedPreset = computed(() => {
    const row = this.selectedUser();
    return row ? presetFor(row.serverRoles, row.stages ?? []) : null;
  });

  protected selectUserDetailTab(tab: UserDetailTab): void {
    if (tab === 'security') void this.loadSessions();
    if (tab === 'activity') void this.loadActivity();
    if (tab === 'assignments') void this.loadAssignments();
    this.userDetailTab.set(tab);
  }

  // ---- Guards that hold before anything is sent ---------------------------
  //
  // The server refuses all of these too. Checking first means the officer is
  // told immediately, in the portal's own words, instead of after a wait. The
  // one that genuinely matters is the last super admin: an LGU with none has
  // nobody who can grant anybody access, including to fix it.

  protected isSelf(row: UserRow): boolean {
    const email = this.session.session()?.email;
    return email !== undefined && email.toLowerCase() === row.email.toLowerCase();
  }

  private isSuperAdmin(row: UserRow): boolean {
    return row.serverRoles.includes('super-admin');
  }

  private enabledSuperAdmins(): UserRow[] {
    return this.users().filter((u) => this.isSuperAdmin(u) && u.status !== 'Inactive');
  }

  /** Whether this viewer may change the account at all — a super admin's is the super admin's alone. */
  protected mayManage(row: UserRow): boolean {
    return this.capabilities.canEdit() && (this.viewerIsSuperAdmin() || !this.isSuperAdmin(row));
  }

  /** Why this account may not be disabled, or null when it may be. */
  protected disableRefusal(row: UserRow): string | null {
    if (this.isSelf(row)) {
      return 'You cannot disable your own account — you would be signed out with no way back in.';
    }
    if (!this.viewerIsSuperAdmin() && this.isSuperAdmin(row)) {
      return 'Only a super admin can disable a super admin account.';
    }
    if (this.isSuperAdmin(row) && this.enabledSuperAdmins().length <= 1) {
      return 'This is the last enabled super admin. Disabling it would leave nobody able to grant access, including to undo this.';
    }
    return null;
  }

  /** Why this account may not be deleted, or null when it may be. */
  protected deleteRefusal(row: UserRow): string | null {
    if (!this.viewerIsSuperAdmin()) return 'Only a super admin can delete a staff account.';
    if (this.isSelf(row)) return 'You cannot delete your own account.';
    if (this.isSuperAdmin(row) && this.enabledSuperAdmins().length <= 1 && row.status !== 'Inactive') {
      return 'This is the last enabled super admin. Deleting it would leave nobody able to grant access.';
    }
    return null;
  }

  // ---- Live sessions -------------------------------------------------------
  //
  // Read from the server. These used to be generated devices and IP addresses —
  // on the screen an administrator opens when they suspect a compromised
  // account, which would have answered with invented reassurance.

  protected readonly sessions = signal<readonly StaffSession[]>([]);
  protected readonly sessionsLoading = signal(false);
  protected readonly sessionsUnavailable = signal(false);
  protected readonly sessionsError = signal<string | null>(null);
  protected readonly revoking = signal<string | null>(null);

  protected async loadSessions(): Promise<void> {
    const row = this.selectedUser();
    this.sessions.set([]);
    this.sessionsUnavailable.set(false);
    this.sessionsError.set(null);
    if (!row?.id) {
      this.sessionsUnavailable.set(true);
      return;
    }
    this.sessionsLoading.set(true);
    try {
      const result = await this.directory.sessions(row.id);
      if (result.kind === 'ok') {
        this.sessions.set(result.sessions);
        return;
      }
      if (result.kind === 'unavailable') this.sessionsUnavailable.set(true);
      else this.sessionsError.set(result.message);
    } finally {
      this.sessionsLoading.set(false);
    }
  }

  async revokeSession(session: StaffSession): Promise<void> {
    const row = this.selectedUser();
    if (!row?.id || this.revoking()) return;

    this.revoking.set(session.sessionId);
    try {
      const result = await this.directory.revokeSession(row.id, session.sessionId);
      if (result.kind === 'done') {
        this.toast.success('Session ended.');
        await this.loadSessions();
        return;
      }
      this.sessionsError.set(
        result.kind === 'unavailable' ? 'This deployment cannot end sessions yet.' : result.message,
      );
    } finally {
      this.revoking.set(null);
    }
  }

  // ---- Activity: the real audit trail -------------------------------------

  protected readonly actorActivity = signal<AccountAuditResult | null>(null);
  protected readonly accountChanges = signal<AccountAuditResult | null>(null);

  protected async loadActivity(): Promise<void> {
    const row = this.selectedUser();
    this.actorActivity.set(null);
    this.accountChanges.set(null);
    if (!row?.id) return;
    const [did, changes] = await Promise.all([
      this.audit.byActor(row.id),
      this.audit.accountHistory(row.id),
    ]);
    if (this.selectedUser()?.id !== row.id) return; // moved to another account meanwhile
    this.actorActivity.set(did);
    this.accountChanges.set(changes);
  }

  protected entriesOf(result: AccountAuditResult | null): readonly AuditEntry[] {
    return result?.kind === 'ok' ? result.entries : [];
  }

  // ---- Assignments: what is waiting on this officer -----------------------

  /** Whether the viewer can read applications at all — an Administrator cannot, by design. */
  protected readonly viewerReadsApplications = computed(() => {
    const who = this.session.authority();
    if (!who) return false;
    return who.superAdmin || who.scopes === null || who.scopes.includes('applications:read');
  });

  protected readonly assignmentsLoading = signal(false);

  protected async loadAssignments(): Promise<void> {
    if (!this.viewerReadsApplications()) return;
    this.assignmentsLoading.set(true);
    try {
      await this.loader.ensureLoaded();
    } finally {
      this.assignmentsLoading.set(false);
    }
  }

  /** The applications whose current step names this officer — the server's own responsibility. */
  protected readonly assignments = computed(() => {
    const row = this.selectedUser();
    if (!row) return [];
    return this.store.applications().filter((app) => isAssignedTo(app.responsibility, row.id));
  });

  protected openApplication(id: string): void {
    this.router.navigateByUrl(`/applications/${id}`);
  }

  // ---- The account form: Edit, and Add Staff Account ----------------------

  protected readonly permitTypes = ALL_PERMIT_TYPES;
  protected readonly evaluationStages = EVALUATION_STAGES;
  protected readonly wireRoleOptions = ALL_WIRE_ROLES;
  /** The role's name as the positions say it — "Building Official", not the older "Approving Officer". */
  protected wireRoleLabel(role: string): string {
    return role === 'building-official' ? 'Building Official' : WIRE_ROLE_LABELS[role] ?? role;
  }

  protected readonly editName = signal('');
  protected readonly editEmail = signal('');
  protected readonly editPositionKey = signal<string>(CUSTOM);
  protected readonly editRoles = signal<ReadonlySet<string>>(new Set());
  protected readonly editStages = signal<ReadonlySet<string>>(new Set());
  protected readonly editLevel = signal<AccessLevel>('view-edit');
  private readonly editForms = signal<ReadonlySet<string>>(new Set());
  protected readonly editError = signal('');
  protected readonly editWorking = signal(false);

  /** The positions this viewer may give — the super admin's only by a super admin. */
  protected readonly assignablePositions = computed(() =>
    OFFICER_POSITIONS.filter((p) => p.key !== 'super-admin' || this.viewerIsSuperAdmin()),
  );

  protected readonly assignableRoles = computed(() =>
    ALL_WIRE_ROLES.filter((role) => role !== 'super-admin' || this.viewerIsSuperAdmin()),
  );

  protected readonly editPreset = computed(
    () => OFFICER_POSITIONS.find((p) => p.key === this.editPositionKey()) ?? null,
  );

  protected readonly editIsCustom = computed(() => this.editPositionKey() === CUSTOM);

  /** Stages matter only to an account that evaluates; a super admin decides every stage already. */
  protected readonly editDecidesStages = computed(() => {
    const roles = this.editRoles();
    return roles.has('evaluator') && !roles.has('super-admin');
  });

  protected readonly editFormCount = computed(() => this.editForms().size);

  /** Editing your own account: the server refuses your own roles, and the portal your own level. */
  protected readonly editingSelf = computed(() => {
    const row = this.selectedUser();
    return this.view() === 'edit' && row !== null && this.isSelf(row);
  });

  protected isEditRole(role: string): boolean {
    return this.editRoles().has(role);
  }

  protected isEditStage(stage: string): boolean {
    return this.editStages().has(stage);
  }

  protected isEditForm(type: PermitType): boolean {
    return this.editForms().has(type);
  }

  protected choosePosition(key: string): void {
    this.editPositionKey.set(key);
    this.editError.set('');
    const preset = OFFICER_POSITIONS.find((p) => p.key === key);
    if (preset === undefined) return; // Custom keeps whatever is ticked.
    this.editRoles.set(new Set(preset.roles));
    this.editStages.set(new Set(preset.stages));
    if (this.view() === 'create') this.editLevel.set(preset.level);
  }

  protected toggleEditRole(role: string): void {
    const next = new Set(this.editRoles());
    if (!next.delete(role)) next.add(role);
    this.editRoles.set(next);
    this.syncPositionKey();
  }

  protected toggleEditStage(stage: string): void {
    const next = new Set(this.editStages());
    if (!next.delete(stage)) next.add(stage);
    this.editStages.set(next);
    this.syncPositionKey();
  }

  /** Ticking boxes by hand lands on a preset when it matches one. */
  private syncPositionKey(): void {
    this.editPositionKey.set(presetFor([...this.editRoles()], [...this.editStages()])?.key ?? CUSTOM);
    this.editError.set('');
  }

  protected toggleEditForm(type: PermitType): void {
    const next = new Set(this.editForms());
    if (!next.delete(type)) next.add(type);
    this.editForms.set(next);
    this.editError.set('');
  }

  protected selectAllForms(all: boolean): void {
    this.editForms.set(new Set(all ? ALL_PERMIT_TYPES : []));
    this.editError.set('');
  }

  protected setEditLevel(level: AccessLevel): void {
    this.editLevel.set(level);
    this.editError.set('');
  }

  /** The row's Edit — the account's form, seeded from what the account HOLDS. */
  protected openEdit(row: UserRow): void {
    if (!this.mayManage(row)) {
      this.toast.error('Only a super admin can change a super admin account.');
      return;
    }
    if (row.level === null || row.permitTypes === null) {
      this.toast.error("This account's current access hasn't finished loading yet.");
      return;
    }
    this.selectedUser.set(row);
    this.editName.set(row.fullName ?? '');
    this.editEmail.set(row.email);
    this.editRoles.set(new Set(row.serverRoles));
    this.editStages.set(new Set(row.stages ?? []));
    this.editPositionKey.set(presetFor(row.serverRoles, row.stages ?? [])?.key ?? CUSTOM);
    this.editLevel.set(row.level);
    this.editForms.set(new Set(row.permitTypes));
    this.editError.set('');
    this.view.set('edit');
  }

  /** "Add Staff Account", or "Add officer" from a position card with that position chosen. */
  protected openCreate(positionKey: string | null = null): void {
    this.selectedUser.set(null);
    this.editName.set('');
    this.editEmail.set('');
    this.editRoles.set(new Set());
    this.editStages.set(new Set());
    this.editPositionKey.set(CUSTOM);
    this.editLevel.set('view-edit');
    // Every form by default: an officer assigned none can reach nothing, and
    // the office narrows it here when a post covers only some permits.
    this.editForms.set(new Set(ALL_PERMIT_TYPES));
    this.editError.set('');
    this.view.set('create');
    if (positionKey !== null) this.choosePosition(positionKey);
  }

  protected cancelEdit(): void {
    const row = this.selectedUser();
    this.editError.set('');
    if (this.view() === 'edit' && row) this.view.set('detail');
    else this.view.set('list');
  }

  /** The roles to save: stages without the evaluator role are dropped, not kept dangling. */
  private formStages(): string[] {
    return this.editDecidesStages() ? EVALUATION_STAGES.filter((s) => this.editStages().has(s)) : [];
  }

  /** Checks shared by both forms; the refusal, or null. */
  private formRefusal(creating: boolean): string | null {
    const name = this.editName().trim();
    if (creating && name.length < 2) return "Enter the officer's full name — it is shown on every decision they make.";
    if (!creating && name.length > 0 && name.length < 2) return 'A name needs at least two characters.';
    if (creating && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.editEmail().trim())) {
      return 'Enter a valid email address — the officer sets their password from it.';
    }
    if (this.editRoles().size === 0) return 'Choose a position.';
    if (this.editRoles().has('super-admin') && !this.viewerIsSuperAdmin()) {
      return 'Only a super admin can give the Super Admin position.';
    }
    if (creating && this.editDecidesStages() && this.formStages().length === 0) {
      return 'Choose the evaluation stage this officer decides.';
    }
    if (this.editForms().size === 0) {
      return 'Choose at least one form. An account with no forms can see nothing.';
    }
    return null;
  }

  /**
   * Save the edit form — only what changed, one request per part, in an order
   * that narrows before it widens: name, position, stages, forms, then level.
   *
   * The parts are separate endpoints on the server, so a failure part-way is
   * possible, and the officer is told exactly which parts landed. An
   * administrator who does not know what took effect will guess, and guessing
   * about access is how somebody keeps authority they were meant to lose.
   */
  protected async saveEdit(): Promise<void> {
    const row = this.selectedUser();
    if (!row || this.editWorking()) return;
    const refusal = this.formRefusal(false);
    if (refusal !== null) {
      this.editError.set(refusal);
      return;
    }
    const name = this.editName().trim();
    const roles = ALL_WIRE_ROLES.filter((r) => this.editRoles().has(r));
    const stages = this.formStages();
    const forms = ALL_PERMIT_TYPES.filter((t) => this.editForms().has(t));
    const level = this.editLevel();

    if (this.isSelf(row) && !sameSet(roles, row.serverRoles)) {
      this.editError.set('You cannot change your own position — another administrator has to.');
      return;
    }
    if (this.isSelf(row) && level === 'view' && row.level === 'view-edit') {
      this.editError.set('You cannot reduce your own access — an administrator has to do it.');
      return;
    }

    const steps: { label: string; run: () => Promise<StaffWriteResult> }[] = [];
    if (name !== '' && name !== (row.fullName ?? '')) {
      steps.push({ label: 'name', run: () => this.directory.rename(row.id, name) });
    }
    if (!sameSet(roles, row.serverRoles)) {
      steps.push({ label: 'position', run: () => this.directory.setRoles(row.id, roles) });
    }
    if (!sameSet(stages, row.stages ?? [])) {
      steps.push({ label: 'evaluation stages', run: () => this.directory.setStages(row.id, stages) });
    }
    if (!sameSet(forms, row.permitTypes ?? [])) {
      steps.push({ label: 'forms', run: () => this.directory.setForms(row.id, forms) });
    }
    if (level !== row.level) {
      steps.push({ label: 'access level', run: () => this.directory.setLevel(row.id, level) });
    }
    if (steps.length === 0) {
      this.toast.info('Nothing changed.');
      this.view.set('detail');
      return;
    }

    this.editWorking.set(true);
    try {
      const outcome = await this.runSteps(steps);
      await this.reloadKeeping(row.id);
      if (outcome === null) {
        this.toast.success(`Saved ${this.selectedUser()?.name ?? row.name}.`);
        this.view.set('detail');
        return;
      }
      this.editError.set(outcome);
    } finally {
      this.editWorking.set(false);
    }
  }

  /**
   * Create the account, then give it its stages, forms and level — four
   * requests, because the server keeps them apart. A failure after the first
   * leaves a real account behind, so the officer is taken to its Edit form to
   * finish rather than told "failed" about something that half-exists.
   */
  protected async createAccount(): Promise<void> {
    if (this.editWorking()) return;
    const refusal = this.formRefusal(true);
    if (refusal !== null) {
      this.editError.set(refusal);
      return;
    }
    const name = this.editName().trim();
    const email = this.editEmail().trim();
    const roles = ALL_WIRE_ROLES.filter((r) => this.editRoles().has(r));
    const stages = this.formStages();
    const forms = ALL_PERMIT_TYPES.filter((t) => this.editForms().has(t));
    const level = this.editLevel();

    this.editWorking.set(true);
    try {
      const created = await this.directory.create(email, roles, name);
      if (created.kind !== 'done') {
        this.editError.set(
          created.kind === 'unavailable' ? 'This deployment cannot create staff accounts yet.' : created.message,
        );
        return;
      }
      const id = created.member.id;
      const steps: { label: string; run: () => Promise<StaffWriteResult> }[] = [];
      if (stages.length > 0) steps.push({ label: 'evaluation stages', run: () => this.directory.setStages(id, stages) });
      steps.push({ label: 'forms', run: () => this.directory.setForms(id, forms) });
      steps.push({ label: 'access level', run: () => this.directory.setLevel(id, level) });
      const outcome = await this.runSteps(steps);
      await this.reloadKeeping(id);
      const row = this.selectedUser();
      if (outcome !== null && row) {
        this.openEdit(row);
        this.editError.set(`The account was created. ${outcome} Finish it here.`);
        return;
      }
      this.toast.success(
        `${name}'s account is ready. Ask them to open this portal, choose "Forgot password" and enter `
        + `${email} — the email lets them set a password.`
        + (created.member.mfaRequired ? ' Their position needs an authenticator app, which they set up at first sign-in.' : ''),
      );
      this.view.set(row ? 'detail' : 'list');
    } finally {
      this.editWorking.set(false);
    }
  }

  /** Run the parts in order; null when all landed, else the sentence saying which did. */
  private async runSteps(
    steps: readonly { label: string; run: () => Promise<StaffWriteResult> }[],
  ): Promise<string | null> {
    const done: string[] = [];
    for (const [index, step] of steps.entries()) {
      const result = await step.run();
      if (result.kind === 'done') {
        done.push(step.label);
        continue;
      }
      const why = result.kind === 'unavailable' ? 'this deployment cannot change it yet.' : result.message;
      const untried = steps.slice(index + 1).map((s) => s.label);
      return [
        done.length > 0 ? `Saved: ${done.join(', ')}.` : '',
        `The ${step.label} was not saved — ${why}`,
        untried.length > 0 ? `Not sent: ${untried.join(', ')}.` : '',
      ].filter(Boolean).join(' ');
    }
    return null;
  }

  /** Reload the directory and re-select the account from what the SERVER now holds. */
  private async reloadKeeping(id: string): Promise<void> {
    await this.loadDirectory();
    this.selectedUser.set(this.users().find((u) => u.id === id) ?? null);
  }

  // ---- Filters / export ----------------------------------------------------

  protected readonly hasActiveFilters = computed(
    () =>
      this.positionFilter() !== 'All Positions' ||
      this.statusFilter() !== 'All Statuses' ||
      !!this.searchTerm().trim(),
  );

  protected clearFilters(): void {
    this.positionFilter.set('All Positions');
    this.statusFilter.set('All Statuses');
    this.searchTerm.set('');
    this.onFilterChange();
  }

  protected exportUsers(): void {
    const rows = this.filteredUsers();
    // `downloadCsv` writes nothing for an empty set, so "Exported 0 rows."
    // announced a file that was never created.
    if (rows.length === 0) {
      this.toast.info('Nothing to export — no accounts match the current view.');
      return;
    }
    downloadCsv(
      'staff-accounts',
      rows.map((row) => ({
        Name: row.name,
        Email: row.email,
        Position: row.position,
        Office: row.office ?? '',
        'Evaluation Stages': (row.stages ?? []).join('; '),
        Access: row.department,
        Status: row.status,
        'Last Active': row.lastActive,
      })),
    );
    this.toast.success(`Exported ${rows.length} row${rows.length === 1 ? '' : 's'}.`);
  }

  protected viewOfficersIn(position: OfficerPosition): void {
    this.positionFilter.set(position.title);
    this.onFilterChange();
    this.selectTab('users');
  }

  // ---- Disable / enable ----------------------------------------------------
  //
  // Disabling keeps the account — its past decisions stay attributable — and
  // it can be enabled again.

  protected readonly disableTarget = signal<UserRow | null>(null);
  protected readonly disableWorking = signal(false);
  protected readonly disableRefused = signal('');

  protected requestDisable(row: UserRow): void {
    const refusal = this.disableRefusal(row);
    if (refusal !== null) {
      this.disableRefused.set(refusal);
      return;
    }
    this.disableRefused.set('');
    this.disableTarget.set(row);
  }

  protected dismissDisableRefusal(): void {
    this.disableRefused.set('');
  }

  protected cancelDisable(): void {
    this.disableTarget.set(null);
  }

  protected async confirmDisable(reason: string): Promise<void> {
    const target = this.disableTarget();
    if (!target || this.disableWorking()) return;
    this.disableTarget.set(null);
    this.disableWorking.set(true);
    try {
      const result = await this.directory.disable(target.id, reason);
      if (result.kind === 'done') {
        this.toast.success(`"${target.name}" disabled. The account is kept and can be enabled again.`);
        await this.reloadKeeping(target.id);
        return;
      }
      this.toast.error(
        result.kind === 'unavailable' ? 'This deployment cannot disable accounts yet.' : result.message,
      );
    } finally {
      this.disableWorking.set(false);
    }
  }

  protected readonly enableTarget = signal<UserRow | null>(null);
  protected readonly enableWorking = signal(false);

  protected requestEnable(row: UserRow): void {
    if (!this.mayManage(row)) {
      this.toast.error('Only a super admin can enable a super admin account.');
      return;
    }
    this.enableTarget.set(row);
  }

  protected cancelEnable(): void {
    this.enableTarget.set(null);
  }

  protected async confirmEnable(reason: string): Promise<void> {
    const target = this.enableTarget();
    if (!target || this.enableWorking()) return;
    this.enableTarget.set(null);
    this.enableWorking.set(true);
    try {
      const result = await this.directory.enable(target.id, reason);
      if (result.kind === 'done') {
        this.toast.success(`"${target.name}" enabled.`);
        await this.reloadKeeping(target.id);
        return;
      }
      this.toast.error(
        result.kind === 'unavailable' ? 'This deployment cannot enable accounts yet.' : result.message,
      );
    } finally {
      this.enableWorking.set(false);
    }
  }

  // ---- Authenticator ---------------------------------------------------------
  //
  // Five positions (and the super admin) sign in with a code from an
  // authenticator app, and the server offers no way to set one up from the
  // sign-in page: an officer in one of those positions cannot sign in at all
  // until an administrator issues their key here. Also the fix for a lost
  // phone. The QR code is shown once and never stored by this page.

  protected readonly mfaTarget = signal<UserRow | null>(null);
  protected readonly mfaWorking = signal(false);
  protected readonly mfaOffer = signal<{
    name: string; email: string; key: string; nextStep: string;
    count: number; cells: readonly { x: number; y: number }[];
  } | null>(null);

  protected requestMfaReissue(row: UserRow): void {
    if (!this.mayManage(row) || this.isSelf(row)) return;
    this.mfaTarget.set(row);
  }

  protected cancelMfaReissue(): void {
    this.mfaTarget.set(null);
  }

  protected async confirmMfaReissue(): Promise<void> {
    const target = this.mfaTarget();
    if (!target || this.mfaWorking()) return;
    this.mfaTarget.set(null);
    this.mfaWorking.set(true);
    try {
      const result = await this.directory.reissueMfa(target.id);
      if (result.kind !== 'done') {
        this.toast.error(
          result.kind === 'unavailable' ? 'This deployment cannot set up authenticators yet.' : result.message,
        );
        return;
      }
      const qr = qrcodegen(0, 'M');
      qr.addData(result.uri);
      qr.make();
      const count = qr.getModuleCount();
      const cells: { x: number; y: number }[] = [];
      for (let y = 0; y < count; y++) {
        for (let x = 0; x < count; x++) if (qr.isDark(y, x)) cells.push({ x, y });
      }
      this.mfaOffer.set({
        name: target.name,
        email: target.email,
        key: /[?&]secret=([A-Z2-7]+)/i.exec(result.uri)?.[1] ?? '',
        nextStep: result.nextStep,
        count,
        cells,
      });
      await this.reloadKeeping(target.id);
    } finally {
      this.mfaWorking.set(false);
    }
  }

  /** Closing forgets it: the key is not kept anywhere on this page. */
  protected closeMfaOffer(): void {
    this.mfaOffer.set(null);
  }

  protected spacedKey(key: string): string {
    return key.replace(/(.{4})(?=.)/g, '$1 ');
  }

  // ---- Delete (super admin) -------------------------------------------------
  //
  // Owner request, 2026-09-26. The server decides what deleting means: an
  // account that never acted is deleted outright; one whose name is on
  // decisions is RETIRED — it can never sign in again and leaves this list,
  // and its name stays on what it did. The answer says which happened.

  protected readonly deleteTarget = signal<UserRow | null>(null);
  protected readonly deleteWorking = signal(false);
  protected readonly deleteRefused = signal('');

  protected requestDelete(row: UserRow): void {
    const refusal = this.deleteRefusal(row);
    if (refusal !== null) {
      this.deleteRefused.set(refusal);
      return;
    }
    this.deleteRefused.set('');
    this.deleteTarget.set(row);
  }

  protected dismissDeleteRefusal(): void {
    this.deleteRefused.set('');
  }

  protected cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  protected async confirmDelete(): Promise<void> {
    const target = this.deleteTarget();
    if (!target || this.deleteWorking()) return;
    this.deleteTarget.set(null);
    this.deleteWorking.set(true);
    try {
      const result = await this.directory.remove(target.id);
      if (result.kind === 'done') {
        this.toast.success(`${target.name}: ${result.detail}`);
        this.selectedUser.set(null);
        this.view.set('list');
        await this.loadDirectory();
        return;
      }
      this.toast.error(
        result.kind === 'unavailable' ? 'This deployment cannot delete staff accounts yet.' : result.message,
      );
    } finally {
      this.deleteWorking.set(false);
    }
  }
}
