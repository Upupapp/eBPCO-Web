import { UserRow } from './user-roles';
import { ACTION_PERMISSIONS, ALL_STAFF_ROLES, NAV_MODULES, StaffRole } from '../../core/session/permissions';

// Deterministic linked-record generator for the Staff User workspace —
// workload and audit activity, derived from the user's own row so a reload
// shows the same record instead of reshuffling. The backend/auth service
// itself is real (see SessionService), but it has no endpoint for a staff
// member's workload assignments or a free-text activity feed, so these two
// stay a local simulation — never presented as a real enforcement or audit
// record. Live session history (device-independent: issued/expires/last-used
// timestamps, no device or IP — the server tracks neither) is real, from
// `StaffDirectoryApi.sessions()`, and does not come from this file; see
// user-roles.ts's own comment on where `buildSessions` used to be called.

export interface PermissionMatrixRow {
  module: string;
  view: boolean;
  create: boolean;
  approve: boolean;
  verify: boolean;
  export: boolean;
  configure: boolean;
}

export interface WorkloadSummary {
  openAssignments: number;
  overdue: number;
  completedThisMonth: number;
}

export interface SessionEntry {
  device: string;
  ip: string;
  lastSeen: string;
}

export interface UserActivityItem {
  title: string;
  detail: string;
  timeAgo: string;
}

function seedFrom(id: string): () => number {
  let seed = 0;
  for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) | 0;
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed / 0x7fffffff) % 1;
  };
}

// Per-module action gates beyond plain view access, keyed by the same
// `NavModule.key` the sidebar/route guard already use — filled in only
// where a real ACTION_PERMISSIONS check (mirrored server-side) exists for
// that module. A module left out here has no action beyond view/export.
const MODULE_ACTIONS: Partial<
  Record<
    string,
    {
      create?: (role: StaffRole) => boolean;
      approve?: (role: StaffRole) => boolean;
      verify?: (role: StaffRole) => boolean;
      configure?: (role: StaffRole) => boolean;
      exportable?: boolean;
    }
  >
> = {
  dashboard: { exportable: true },
  applications: {
    create: ACTION_PERMISSIONS.createApplication,
    approve: ACTION_PERMISSIONS.approveApplication,
    verify: ACTION_PERMISSIONS.verifyContact,
    exportable: true,
  },
  evaluations: { approve: ACTION_PERMISSIONS.recordEvaluation, exportable: true },
  payments: {
    create: ACTION_PERMISSIONS.recordPayment,
    approve: ACTION_PERMISSIONS.approveAssessment,
    verify: ACTION_PERMISSIONS.verifyPayment,
    configure: ACTION_PERMISSIONS.configurePayments,
    exportable: true,
  },
  'permit-release': {
    create: ACTION_PERMISSIONS.generatePermit,
    approve: ACTION_PERMISSIONS.releasePermit,
    configure: ACTION_PERMISSIONS.configureRequirements,
    exportable: true,
  },
  businesses: { exportable: true },
  // Both roles that can even see this module (Super Admin, Administrator)
  // administer the roster with no further server-side split — there is no
  // separate "can view but not edit users" tier.
  'user-roles': { create: () => true, exportable: true },
  'system-logs': { exportable: true },
};

/**
 * The module × action grid a role actually holds, read straight from the
 * SAME registries the sidebar and route guard enforce (`NAV_MODULES`,
 * `ACTION_PERMISSIONS`) — not a regex over a role card's marketing copy.
 * This used to map `role.permissions` (three free-text labels like "User
 * Management") through pattern matching to guess at create/approve/verify;
 * an Evaluator's card said "View Applications, Record Evaluations" and the
 * regex read "Record Evaluations" as approving something, which is a guess
 * about English wording, not a fact about what the account can do. Every
 * cell below is either the real per-module role list or a real permission
 * function also used to gate the button that performs the action.
 */
export function buildPermissionMatrix(role: StaffRole | null): PermissionMatrixRow[] {
  if (role === null || !ALL_STAFF_ROLES.includes(role)) return [];
  return NAV_MODULES.map((mod) => {
    const view = mod.roles.includes(role);
    const actions = MODULE_ACTIONS[mod.key] ?? {};
    return {
      module: mod.label,
      view,
      create: view && (actions.create?.(role) ?? false),
      approve: view && (actions.approve?.(role) ?? false),
      verify: view && (actions.verify?.(role) ?? false),
      export: view && (actions.exportable ?? false),
      configure: view && (actions.configure?.(role) ?? false),
    };
  });
}

export function buildWorkload(user: UserRow): WorkloadSummary {
  // A Pending account has never signed in — it has no assignments to be
  // open, overdue, or completed, and a seeded-random number here would
  // directly contradict the "Pending"/"Last Active —" state shown two lines
  // above it on the same page. This is real, not mock: zero is the actual
  // fact about an account nothing has ever been assigned to yet.
  if (user.status === 'Pending') {
    return { openAssignments: 0, overdue: 0, completedThisMonth: 0 };
  }
  const rand = seedFrom(user.email);
  const openAssignments = Math.floor(rand() * 18) + 2;
  return {
    openAssignments,
    overdue: Math.floor(rand() * Math.min(openAssignments, 5)),
    completedThisMonth: Math.floor(rand() * 40) + 8,
  };
}

const DEVICES = ['Chrome / Windows', 'Safari / macOS', 'Edge / Windows', 'Chrome / Android'];



export function buildUserActivity(user: UserRow): UserActivityItem[] {
  const items: UserActivityItem[] = [
    {
      title: 'Role assigned',
      detail: `Assigned the "${user.role}" role in ${user.department}.`,
      timeAgo: '3 months ago',
    },
  ];
  if (user.status === 'Pending') {
    items.push({
      title: 'Invitation sent',
      detail: `An account invitation was sent to ${user.email}.`,
      timeAgo: '2 days ago',
    });
    return items;
  }
  items.push(
    { title: 'Signed in', detail: `Logged in from a recognized device.`, timeAgo: user.lastActive ?? '—' },
    { title: 'Reviewed an application', detail: 'Advanced an application to its next evaluation stage.', timeAgo: '2 days ago' },
    { title: 'Exported a report', detail: 'Downloaded a CSV export from their assigned module.', timeAgo: '6 days ago' },
  );
  if (user.status === 'Inactive') {
    items.unshift({ title: 'Account marked inactive', detail: 'No activity recorded in the last 30 days.', timeAgo: user.lastActive ?? '—' });
  }
  return items;
}
