import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Topbar } from '../../shared/topbar/topbar';
import { KpiCard, KpiIllustration, KpiTone } from '../../shared/kpi-card/kpi-card';
import { Icon } from '../../shared/icon/icon';
import { Avatar } from '../../shared/avatar/avatar';
import { Pagination } from '../../shared/pagination/pagination';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { downloadCsv } from '../../shared/utils/export-csv';
import { SessionService } from '../../core/session/session.service';
import { StaffDirectoryApi, StaffMember, StaffSession } from '../../core/api/staff-directory.api';
import { AccessLevel } from '../../core/api/access-request.api';
import { Capabilities } from '../../core/session/capabilities';
import { ViewOnlyNotice } from '../../shared/view-only-notice/view-only-notice';
import { ALL_PERMIT_TYPES, PermitType } from '../../core/domain/permit.model';
import { ToastService } from '../../shared/toast/toast.service';
import {
  buildPermissionMatrix,
  buildUserActivity,
  buildWorkload,
} from './user-detail-data';

type Tab = 'users' | 'roles';
type UserDetailTab = 'profile' | 'permissions' | 'workload' | 'security' | 'activity';
/**
 * `null` where the portal does not know. There is no user endpoint, and status
 * used to be derived from the row's INDEX — `i % 9 === 8 ? 'Pending' : ...` —
 * so an administrator could read "Inactive" off a number with no account
 * behind it. Owner ruling, 29 Aug: show what is known, dash what is not.
 */
type UserStatus = 'Active' | 'Inactive' | 'Pending' | null;

export interface UserRow {
  /** The server's account id. Empty only for a row this page has not saved. */
  id: string;
  /**
   * The access this account actually holds, carried raw as well as rendered.
   *
   * `role` and `department` are display strings derived from these two. Editing
   * access has to start from the real values, not from parsing "2 forms" back
   * out of a label — a round trip through display text is how an edit quietly
   * grants something nobody chose.
   */
  level: AccessLevel;
  permitTypes: readonly string[];
  /**
   * The role the SERVER holds for this account, kept raw.
   *
   * `role` below is a display label derived from the level. This is the thing
   * the last-super-admin guard has to count, and counting a display string
   * would break the moment the label is reworded.
   */
  serverRole: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: UserStatus;
  /** `null` when unknown — it used to be index arithmetic ("Online now", "3h ago"). */
  lastActive: string | null;
}

export interface RoleRow {
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
  iconBg: string;
}

const NAMES = [
  'Engr. Ricardo Buenaflor',
  'Arch. Jonathan Dizon',
  'Julius Bragais',
  'Ma. Teresa Arquero',
  'Carlo Salvador',
  'Leonardo Ariola',
  'Rowena Escueta',
  'Danilo Olivar',
  'Cristina Fajota',
  'Ferdinand Rosales',
  'Jasmine Realuyo',
  'Noel Buban',
  'Karen Joy Estioco',
  'Reynaldo Gultiano',
  'Angelica Villareal',
  'Bryan Sarita',
  'Ma. Corazon Bermudez',
  'Vincent Bonghanoy',
  'Charmaine Bordios',
  'Allan Bermas',
  'Jenny Rose Casipong',
  'Michael Buban',
  'Sheila Marie Estioco',
  'Rodel Panti',
];

const DEPARTMENTS = [
  'Office of the Building Official',
  'Zoning Administration',
  'Bureau of Fire Protection Liaison',
  'Treasury / Cashiering',
  'Releasing Unit',
  'City Administrator Office',
];

const ROLE_ORDER = [
  'Super Admin',
  'Tenant Admin',
  'Initial Evaluator',
  'Zoning Evaluator',
  'Fire Safety Evaluator',
  'OBO Evaluator',
  'Cashier',
  'Releasing Officer',
  'Viewer / Auditor',
];

function emailFor(name: string): string {
  const handle = name
    .toLowerCase()
    .replace(/^(engr\.|arch\.|ma\.)\s*/, '')
    .replace(/[^a-z\s]/g, '')
    .trim()
    .replace(/\s+/g, '.');
  return `${handle}@ebpco.gov.ph`;
}

/**
 * A server staff record as this page's row.
 *
 * `role` shows the LEVEL rather than a job title, because that is what the
 * owner's model actually grants: an ADMIN sub-type is defined by accessibility
 * — which forms, and view or view-and-edit — not by what the post is called.
 */
function toUserRow(member: StaffMember): UserRow {
  return {
    id: member.id,
    level: member.level,
    permitTypes: member.permitTypes,
    serverRole: member.role,
    name: member.fullName,
    email: member.email,
    role: member.level === 'view-edit' ? 'View and edit' : 'View only',
    department: member.permitTypes.length === 0
      ? 'No forms assigned'
      : `${member.permitTypes.length} form${member.permitTypes.length === 1 ? '' : 's'}`,
    status: member.status === 'disabled' ? 'Inactive' : 'Active',
    lastActive: member.lastSignInAt,
  };
}

const ROLES: RoleRow[] = [
  {
    name: 'Super Admin',
    description: 'Full platform access across LGU Castilla and all its modules.',
    userCount: 3,
    permissions: ['All Modules', 'User Management', 'System Settings'],
    iconBg: '#c81e2c',
  },
  {
    name: 'Tenant Admin',
    description:
      'Manages tenant (business owner / applicant) accounts, verification, and profile settings.',
    userCount: 12,
    permissions: ['Tenant Settings', 'User Management', 'Reports'],
    iconBg: '#2563eb',
  },
  {
    name: 'Initial Evaluator',
    description: 'Performs first-level document verification and checklist review.',
    userCount: 18,
    permissions: ['View Applications', 'Initial Evaluation'],
    iconBg: '#7c3aed',
  },
  {
    name: 'Zoning Evaluator',
    description: 'Reviews land-use classification and zoning compliance.',
    userCount: 14,
    permissions: ['View Applications', 'Zoning Evaluation'],
    iconBg: '#f59e0b',
  },
  {
    name: 'Fire Safety Evaluator',
    description: 'Validates Bureau of Fire Protection compliance and inspection reports.',
    userCount: 9,
    permissions: ['View Applications', 'Fire Safety Evaluation'],
    iconBg: '#dc2626',
  },
  {
    name: 'OBO Evaluator',
    description: 'Office of the Building Official engineering review and sign-off.',
    userCount: 11,
    permissions: ['View Applications', 'OBO Evaluation', 'Final Approval'],
    iconBg: '#16a34a',
  },
  {
    name: 'Cashier',
    description: 'Processes application fee payments and issues official receipts.',
    userCount: 7,
    permissions: ['View Applications', 'Payment Processing'],
    iconBg: '#0891b2',
  },
  {
    name: 'Releasing Officer',
    description: 'Generates and releases approved permit documents to applicants.',
    userCount: 5,
    permissions: ['View Applications', 'Document Release'],
    iconBg: '#65a30d',
  },
  {
    name: 'Viewer / Auditor',
    description: 'Read-only access across applications and reports for oversight.',
    userCount: 6,
    permissions: ['View Applications', 'View Reports'],
    iconBg: '#565c6b',
  },
];

@Component({
  selector: 'app-user-roles',
  imports: [ViewOnlyNotice, Topbar, KpiCard, Icon, Avatar, Pagination, FormsModule, ConfirmDialog],
  templateUrl: './user-roles.html',
  styleUrl: './user-roles.scss',
})
export class UserRoles implements OnInit {
  protected readonly capabilities = inject(Capabilities);

  private readonly session = inject(SessionService);
  private readonly toast = inject(ToastService);

  // Payment fee-rule/method configuration moved to Payments > Configuration
  // (still Super Admin-only, gated by the same ACTION_PERMISSIONS.configurePayments)
  // — one source for that settings surface instead of two.
  protected readonly tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'users', label: 'Users', icon: 'user' },
    { key: 'roles', label: 'Roles & Permissions', icon: 'shield' },
  ];

  protected readonly visibleTabs = computed(() => this.tabs);

  protected readonly activeTab = signal<Tab>('users');
  protected readonly page = signal(1);
  protected readonly pageSize = 8;
  protected readonly searchTerm = signal('');
  protected readonly roleFilter = signal('All Roles');
  protected readonly statusFilter = signal('All Statuses');

  private readonly directory = inject(StaffDirectoryApi);

  /**
   * The staff list, read from the server.
   *
   * It used to be `buildUsers()` — names and departments invented from
   * hardcoded arrays. A fabricated LIST is worse than a fabricated chart: an
   * administrator reading it believes these people hold accounts, and the
   * absence of somebody who does hold one is invisible.
   *
   * Three states, because an empty table is not an answer: loaded, capability
   * absent, read failed. `directoryLoaded` is false until the server has
   * actually answered, so the page never presents an empty list as "no staff".
   */
  private readonly users = signal<UserRow[]>([]);
  protected readonly directoryLoading = signal(true);
  protected readonly directoryUnavailable = signal(false);
  protected readonly directoryError = signal<string | null>(null);
  protected readonly roles = signal<RoleRow[]>(ROLES);
  protected readonly roleOptions = ROLE_ORDER;
  protected readonly statusOptions: UserStatus[] = ['Active', 'Inactive', 'Pending'];
  protected readonly departments = DEPARTMENTS;

  // Every value here is derived from the same `users` list the table
  // below renders, so "Total Users" always equals the real row count
  // instead of an unrelated hardcoded figure.
  protected readonly stats = computed<
    {
      icon: string;
      tone: KpiTone;
      illustration: KpiIllustration;
      label: string;
      value: string;
      footnote?: string;
    }[]
  >(() => {
    const all = this.users();
    // Counting a status nobody knows gives 0, and 0 is a claim — "no user is
    // active" — not an absence. Total Users is real: the roster length.
    const anyStatusKnown = all.some((u) => u.status !== null);
    const active = anyStatusKnown ? String(all.filter((u) => u.status === 'Active').length) : '—';
    const pending = anyStatusKnown ? String(all.filter((u) => u.status === 'Pending').length) : '—';
    return [
      {
        icon: 'users',
        tone: 'info',
        illustration: 'users',
        label: 'Total Users',
        value: String(all.length),
        footnote: 'Across All Departments',
      },
      {
        icon: 'check-circle',
        tone: 'success',
        illustration: 'active',
        label: 'Active Users',
        value: active,
        footnote: anyStatusKnown
          ? `${Math.round((Number(active) / (all.length || 1)) * 100)}% of total`
          : 'Status not recorded',
      },
      {
        icon: 'alert-triangle',
        tone: 'warning',
        illustration: 'pending',
        label: 'Pending Invites',
        value: pending,
        footnote: 'Awaiting acceptance',
      },
      {
        icon: 'user-check',
        tone: 'neutral',
        illustration: 'roles',
        label: 'Roles Defined',
        value: `${ROLES.length}`,
        footnote: 'Across the platform',
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
        this.users.set(result.members.map(toUserRow));
        return;
      }
      this.users.set([]);
      if (result.kind === 'unavailable') this.directoryUnavailable.set(true);
      else this.directoryError.set(result.message);
    } finally {
      this.directoryLoading.set(false);
    }
  }

  protected readonly filteredUsers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const role = this.roleFilter();
    const status = this.statusFilter();
    return this.users().filter((u) => {
      if (role !== 'All Roles' && u.role !== role) return false;
      if (status !== 'All Statuses' && u.status !== status) return false;
      if (!term) return true;
      return (
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term)
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

  protected readonly view = signal<'list' | 'detail'>('list');
  protected readonly selectedUser = signal<UserRow | null>(null);
  protected readonly userDetailTab = signal<UserDetailTab>('profile');

  protected readonly selectedUserRole = computed(() => {
    const row = this.selectedUser();
    if (!row) return null;
    return this.roles().find((r) => r.name === row.role) ?? null;
  });

  protected readonly permissionMatrix = computed(() => {
    const role = this.selectedUserRole();
    return role ? buildPermissionMatrix(role) : [];
  });

  protected readonly workload = computed(() => {
    const row = this.selectedUser();
    return row ? buildWorkload(row) : null;
  });

  // ---- A-09 · Live sessions ----------------------------------------------

  /**
   * The account's live sign-ins, read from the server.
   *
   * These used to be `buildSessions(row)` — devices, IP addresses and
   * last-seen times generated from the row. A fabricated session list is a
   * particular kind of harmful: it is the screen an administrator opens when
   * they suspect an account is compromised, and it would have answered with
   * invented reassurance.
   */
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
      // No server id means this row was never saved, so it has no sessions to
      // show. Saying "unavailable" is truer than an empty table.
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

    this.revoking.set(session.id);
    try {
      const result = await this.directory.revokeSession(row.id, session.id);
      if (result.kind === 'done') {
        this.toast.success('Session ended.');
        await this.loadSessions();
        return;
      }
      this.sessionsError.set(
        result.kind === 'unavailable'
          ? 'This deployment cannot end sessions yet.'
          : result.message,
      );
    } finally {
      this.revoking.set(null);
    }
  }

  protected readonly userActivity = computed(() => {
    const row = this.selectedUser();
    return row ? buildUserActivity(row) : [];
  });

  openDetail(row: UserRow): void {
    this.selectedUser.set(row);
    this.userDetailTab.set('profile');
    this.view.set('detail');
  }

  // ---- A-10 · Guards that must hold before anything is sent --------------

  /**
   * Refusing an action here as well as on the server.
   *
   * The server is the authority and refuses these too. Checking first is not
   * duplication for its own sake: an officer who clicks Disable, waits, and is
   * then told the server said no has been given a worse answer than one who was
   * told immediately and shown why. It also means the reason is worded by the
   * portal in the portal's own voice, rather than depending on an error body.
   *
   * The one that genuinely matters is the last super admin. Every other refusal
   * here is a convenience; that one guards the single failure this product
   * cannot repair from inside itself — an LGU with no super admin has nobody
   * who can grant anybody access, including to fix it.
   */
  private isSelf(row: UserRow): boolean {
    const email = this.session.session()?.email;
    return email !== undefined && email.toLowerCase() === row.email.toLowerCase();
  }

  private isSuperAdmin(row: UserRow): boolean {
    return row.serverRole === 'super-admin';
  }

  private enabledSuperAdmins(): UserRow[] {
    return this.users().filter((u) => this.isSuperAdmin(u) && u.status !== 'Inactive');
  }

  /** Why this account may not be disabled, or null when it may be. */
  protected disableRefusal(row: UserRow): string | null {
    if (this.isSelf(row)) {
      return 'You cannot disable your own account — you would be signed out with no way back in.';
    }
    if (this.isSuperAdmin(row) && this.enabledSuperAdmins().length <= 1) {
      return 'This is the last enabled super admin. Disabling it would leave nobody able to grant access, including to undo this.';
    }
    return null;
  }

  /** Why this account's access may not be changed, or null when it may be. */
  protected accessRefusal(row: UserRow, nextLevel: AccessLevel): string | null {
    if (this.isSelf(row) && nextLevel === 'view') {
      return 'You cannot reduce your own access — an administrator has to do it.';
    }
    return null;
  }

  // ---- A-07 · Changing what an account may do ----------------------------

  /**
   * Editing access is one operation, not two.
   *
   * The level and the forms are sent together for the same reason the approval
   * grant is: applying one without the other leaves the account in a state
   * nobody chose, for however long the second call takes to fail.
   *
   * The reason is mandatory and is not decoration. Every access change lands in
   * the audit stream, and an entry saying "level changed" without saying why is
   * a record that answers the easy question and not the one anybody asks.
   */
  protected readonly permitTypes = ALL_PERMIT_TYPES;
  protected readonly editingAccess = signal(false);
  protected readonly accessLevel = signal<AccessLevel>('view');
  private readonly accessForms = signal<ReadonlySet<string>>(new Set());
  protected accessReason = '';
  protected readonly accessError = signal('');
  protected readonly accessWorking = signal(false);

  protected readonly accessFormCount = computed(() => this.accessForms().size);

  protected isAccessForm(type: PermitType): boolean {
    return this.accessForms().has(type);
  }

  protected toggleAccessForm(type: PermitType): void {
    const next = new Set(this.accessForms());
    if (!next.delete(type)) next.add(type);
    this.accessForms.set(next);
    this.accessError.set('');
  }

  protected setAccessLevel(level: AccessLevel): void {
    this.accessLevel.set(level);
    this.accessError.set('');
  }

  protected startEditAccess(): void {
    const row = this.selectedUser();
    if (!row) return;
    // Seeded from what the account HOLDS, so the editor sees the current state
    // and changes it, rather than composing a replacement from memory.
    this.accessLevel.set(row.level);
    this.accessForms.set(new Set(row.permitTypes));
    this.accessReason = '';
    this.accessError.set('');
    this.editingAccess.set(true);
  }

  protected cancelEditAccess(): void {
    this.editingAccess.set(false);
    this.accessError.set('');
    this.accessReason = '';
  }

  async saveAccess(): Promise<void> {
    const row = this.selectedUser();
    if (!row || this.accessWorking()) return;

    if (!row.id) {
      this.accessError.set('This account has not been created on the server yet.');
      return;
    }
    const refusal = this.accessRefusal(row, this.accessLevel());
    if (refusal !== null) {
      this.accessError.set(refusal);
      return;
    }
    if (this.accessForms().size === 0) {
      this.accessError.set('Choose at least one form. An account with no forms can see nothing.');
      return;
    }
    if (this.accessReason.trim().length < 3) {
      this.accessError.set('Give a reason. It is recorded against this change.');
      return;
    }

    this.accessWorking.set(true);
    try {
      const result = await this.directory.changeAccess(
        row.id,
        {
          level: this.accessLevel(),
          permitTypes: [...this.accessForms()] as PermitType[],
        },
        this.accessReason,
      );

      if (result.kind === 'done') {
        this.editingAccess.set(false);
        this.accessReason = '';
        this.toast.success(`Access updated for ${row.name}.`);
        await this.loadDirectory();
        // Re-select from the reloaded list so the panel shows what the SERVER
        // now holds, not what this page hoped it sent.
        this.selectedUser.set(this.filteredUsers().find((u) => u.id === row.id) ?? null);
        return;
      }
      if (result.kind === 'refused') {
        // The server refusing on purpose — most importantly when this would
        // strip the last super admin. That is a correct answer, and it is shown
        // as the server worded it rather than flattened into a generic failure.
        this.accessError.set(result.message);
        return;
      }
      this.accessError.set(
        result.kind === 'unavailable'
          ? 'This deployment cannot change access yet.'
          : result.message,
      );
    } finally {
      this.accessWorking.set(false);
    }
  }

  protected selectUserDetailTab(tab: UserDetailTab): void {
    if (tab === 'security') void this.loadSessions();
    this.userDetailTab.set(tab);
  }

  backToList(): void {
    this.view.set('list');
  }

  // ---- Filters / export --------------------------------------------------

  protected readonly hasActiveFilters = computed(
    () =>
      this.roleFilter() !== 'All Roles' ||
      this.statusFilter() !== 'All Statuses' ||
      !!this.searchTerm().trim(),
  );

  protected clearFilters(): void {
    this.roleFilter.set('All Roles');
    this.statusFilter.set('All Statuses');
    this.searchTerm.set('');
    this.onFilterChange();
  }

  private userCsvRow(row: UserRow) {
    return {
      Name: row.name,
      Email: row.email,
      Role: row.role,
      Department: row.department,
      Status: row.status,
      'Last Active': row.lastActive,
    };
  }

  protected exportUsers(): void {
    const rows = this.filteredUsers();
    downloadCsv(
      'users',
      rows.map((row) => this.userCsvRow(row)),
    );
    this.toast.success(`Exported ${rows.length} row${rows.length === 1 ? '' : 's'}.`);
  }

  // ---- Delete -------------------------------------------------------------

  /**
   * Disabling an account. There is no delete, and the absence is the feature.
   *
   * Owner ruling, 2026-08-31: no delete access anywhere — archive or disable,
   * and what is set aside is preserved. This control used to remove the row
   * from the list outright:
   *
   *     this.users.update((rows) => rows.filter((r) => r.email !== target.email));
   *
   * An officer's name is on every application they touched. Deleting the
   * account leaves that audit trail pointing at nobody, and a permit decided by
   * a person the system can no longer identify is a permit nobody can defend.
   * The API agrees: it offers `disable` and `enable` and no destructive route
   * for a staff user.
   */
  protected readonly disableTarget = signal<UserRow | null>(null);

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

  protected confirmDisable(): void {
    const target = this.disableTarget();
    if (!target) return;
    // Preserved, not removed. The row stays and its status changes, so the
    // account remains attributable everywhere it has already acted.
    this.users.update((rows) =>
      rows.map((row) => (row.email === target.email ? { ...row, status: 'Inactive' } : row)),
    );
    this.disableTarget.set(null);
    this.toast.success(`"${target.name}" disabled. The account is kept, not deleted.`);
  }

  protected enableUser(row: UserRow): void {
    this.users.update((rows) =>
      rows.map((r) => (r.email === row.email ? { ...r, status: 'Active' } : r)),
    );
    this.toast.success(`"${row.name}" enabled.`);
  }

  // ---- Add user -----------------------------------------------------------

  protected readonly showAddUser = signal(false);
  protected newUser = { name: '', email: '', role: ROLE_ORDER[0], department: DEPARTMENTS[0] };

  protected openAddUser(): void {
    this.newUser = { name: '', email: '', role: ROLE_ORDER[0], department: DEPARTMENTS[0] };
    this.showAddUser.set(true);
  }

  protected cancelAddUser(): void {
    this.showAddUser.set(false);
  }

  protected createUser(): void {
    const name = this.newUser.name.trim();
    if (!name) {
      this.toast.error('Enter a name before adding this user.');
      return;
    }
    const email = this.newUser.email.trim() || emailFor(name);
    if (this.users().some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      this.toast.error(`A user with the email "${email}" already exists.`);
      return;
    }
    this.users.update((rows) => [
      {
        name,
        // No server id: this row has not been saved anywhere. The empty
        // string says so rather than a fabricated identifier that would look
        // like a real account to every later read.
        id: '',
        level: 'view' as AccessLevel,
        permitTypes: [],
        serverRole: '',
        email,
        role: this.newUser.role,
        department: this.newUser.department,
        status: 'Pending',
        lastActive: 'Invited — not yet accepted',
      },
      ...rows,
    ]);
    this.showAddUser.set(false);
    this.toast.success(`"${name}" invited.`);
  }

  // ---- Role card actions ---------------------------------------------

  protected readonly editingRole = signal<RoleRow | null>(null);

  protected openEditRole(role: RoleRow): void {
    this.editingRole.set({ ...role });
  }

  protected cancelEditRole(): void {
    this.editingRole.set(null);
  }

  protected saveEditRole(): void {
    const edited = this.editingRole();
    if (!edited) return;
    this.roles.update((rows) => rows.map((r) => (r.name === edited.name ? edited : r)));
    this.editingRole.set(null);
    this.toast.success(`"${edited.name}" role updated.`);
  }

  protected viewUsersForRole(roleName: string): void {
    this.roleFilter.set(roleName);
    this.onFilterChange();
    this.selectTab('users');
  }
}
