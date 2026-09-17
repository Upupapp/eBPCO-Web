import { RoleRow, UserRow } from './user-roles';

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

// Turns a role's own free-text permission labels into a real module ×
// action grid — derived from data the role already carries rather than a
// second, disconnected permission source.
export function buildPermissionMatrix(role: RoleRow): PermissionMatrixRow[] {
  return role.permissions.map((label) => {
    const lower = label.toLowerCase();
    const isAll = lower === 'all modules';
    return {
      module: label,
      view: isAll || true, // every listed permission implies at least view access to it
      create: isAll || /management|settings/.test(lower),
      approve: isAll || /evaluation|approval|release/.test(lower),
      verify: isAll || /payment/.test(lower),
      export: isAll || /report/.test(lower),
      configure: isAll || /settings/.test(lower),
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
