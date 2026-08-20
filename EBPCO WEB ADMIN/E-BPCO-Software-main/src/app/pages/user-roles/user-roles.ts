import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Topbar } from '../../shared/topbar/topbar';
import { KpiCard, KpiIllustration, KpiTone } from '../../shared/kpi-card/kpi-card';
import { Icon } from '../../shared/icon/icon';
import { Avatar } from '../../shared/avatar/avatar';
import { Pagination } from '../../shared/pagination/pagination';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { downloadCsv } from '../../shared/utils/export-csv';
import { SessionService } from '../../core/session/session.service';
import {
  buildPermissionMatrix,
  buildSessions,
  buildUserActivity,
  buildWorkload,
} from './user-detail-data';

type Tab = 'users' | 'roles';
type UserDetailTab = 'profile' | 'permissions' | 'workload' | 'security' | 'activity';
type UserStatus = 'Active' | 'Inactive' | 'Pending';

export interface UserRow {
  name: string;
  email: string;
  role: string;
  department: string;
  status: UserStatus;
  lastActive: string;
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

function buildUsers(): UserRow[] {
  return NAMES.map((name, i) => {
    const status: UserStatus = i % 9 === 8 ? 'Pending' : i % 7 === 6 ? 'Inactive' : 'Active';
    const lastActive =
      status === 'Pending'
        ? 'Invited — not yet accepted'
        : status === 'Inactive'
          ? `${7 + (i % 20)} days ago`
          : i % 5 === 0
            ? 'Online now'
            : `${(i % 11) + 1}h ago`;
    return {
      name,
      email: emailFor(name),
      role: ROLE_ORDER[i % ROLE_ORDER.length],
      department: DEPARTMENTS[i % DEPARTMENTS.length],
      status,
      lastActive,
    };
  });
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
  imports: [Topbar, KpiCard, Icon, Avatar, Pagination, FormsModule, ConfirmDialog],
  templateUrl: './user-roles.html',
  styleUrl: './user-roles.scss',
})
export class UserRoles {
  private readonly session = inject(SessionService);

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

  private readonly users = signal<UserRow[]>(buildUsers());
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
    const active = all.filter((u) => u.status === 'Active').length;
    const pending = all.filter((u) => u.status === 'Pending').length;
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
        value: String(active),
        footnote: `${Math.round((active / (all.length || 1)) * 100)}% of total`,
      },
      {
        icon: 'alert-triangle',
        tone: 'warning',
        illustration: 'pending',
        label: 'Pending Invites',
        value: String(pending),
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

  protected readonly sessions = computed(() => {
    const row = this.selectedUser();
    return row ? buildSessions(row) : [];
  });

  protected readonly userActivity = computed(() => {
    const row = this.selectedUser();
    return row ? buildUserActivity(row) : [];
  });

  openDetail(row: UserRow): void {
    this.selectedUser.set(row);
    this.userDetailTab.set('profile');
    this.view.set('detail');
  }

  protected selectUserDetailTab(tab: UserDetailTab): void {
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
    downloadCsv(
      'users',
      this.filteredUsers().map((row) => this.userCsvRow(row)),
    );
  }

  // ---- Delete -------------------------------------------------------------

  protected readonly deleteTarget = signal<UserRow | null>(null);

  protected requestDelete(row: UserRow): void {
    this.deleteTarget.set(row);
  }

  protected cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  protected confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;
    this.users.update((rows) => rows.filter((row) => row.email !== target.email));
    this.deleteTarget.set(null);
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
    if (!name) return;
    this.users.update((rows) => [
      {
        name,
        email: this.newUser.email.trim() || emailFor(name),
        role: this.newUser.role,
        department: this.newUser.department,
        status: 'Pending',
        lastActive: 'Invited — not yet accepted',
      },
      ...rows,
    ]);
    this.showAddUser.set(false);
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
  }

  protected viewUsersForRole(roleName: string): void {
    this.roleFilter.set(roleName);
    this.onFilterChange();
    this.selectTab('users');
  }
}
