import { Authority, StaffRole } from './permissions';

/**
 * An officer's position, as the office would say it — "Fire Safety
 * Evaluator", "Cashier", "Building Official" — from the account's real roles
 * and evaluation stages (officer positions, 2026-09-26).
 *
 * The portal's older single role collapsed ten server roles into seven labels
 * (a Receiving Officer read "Administrator"), which is fine for choosing a
 * menu and wrong for telling an officer, or a colleague, what their job is.
 */

/** The five evaluation stages, in the order an application meets them. */
export const EVALUATION_STAGES = ['Initial', 'Zoning', 'Fire Safety', 'OBO', 'Final Approval'] as const;

/** The office behind each evaluation stage — the same names the server's `responsibility.ts` uses. */
export const STAGE_POSITION: Readonly<Record<string, string>> = {
  Initial: 'Initial Evaluator',
  Zoning: 'Zoning Officer',
  'Fire Safety': 'Fire Safety Evaluator',
  OBO: 'Technical Evaluator',
  'Final Approval': 'Building Official',
};

const ROLE_POSITION: Readonly<Record<string, string>> = {
  'super-admin': 'Super Admin',
  administrator: 'Administrator',
  'building-official': 'Building Official',
  'receiving-officer': 'Receiving Officer',
  'records-officer': 'Records Officer',
  assessor: 'Assessor',
  cashier: 'Cashier',
  'releasing-officer': 'Releasing Officer',
  auditor: 'Auditor',
  evaluator: 'Evaluator',
};

/** Most senior first: an account holding two roles is named by the broader one. */
const ORDER = [
  'super-admin', 'administrator', 'building-official', 'receiving-officer', 'records-officer',
  'assessor', 'cashier', 'releasing-officer', 'evaluator', 'auditor',
];

export function positionFor(wireRoles: readonly string[], stages: readonly string[] | null): string {
  const primary = ORDER.find((role) => wireRoles.includes(role));
  if (primary === undefined) return 'Staff';
  if (primary !== 'evaluator') return ROLE_POSITION[primary]!;
  // An evaluator is named by the stage they decide.
  const held = stages ?? [];
  if (held.length === 1) return STAGE_POSITION[held[0]!] ?? 'Evaluator';
  if (held.length > 1) return `Evaluator (${held.join(', ')})`;
  return 'Evaluator';
}

// ── The positions an office fills (officer positions, 2026-09-26) ────────

/**
 * One job in the permit office, as a preset: the server roles it holds and
 * the evaluation stages it decides. Choosing a position on the Staff screen
 * sets both at once, so a Fire Safety Evaluator cannot be created holding the
 * Zoning stage by a slip of a checkbox.
 */
export interface OfficerPosition {
  readonly key: string;
  readonly title: string;
  readonly office: string;
  /** The server's role identifiers. */
  readonly roles: readonly string[];
  /** The evaluation stages it decides — empty for every position that decides none. */
  readonly stages: readonly string[];
  /** What the position does, in one line. */
  readonly does: string;
  /** What it may not do, when that is the point of the position. */
  readonly doesNot: string | null;
  /** The access level a new account in this position starts at. */
  readonly level: 'view' | 'view-edit';
}

const OBO = 'Office of the Building Official';

export const OFFICER_POSITIONS: readonly OfficerPosition[] = [
  {
    key: 'super-admin', title: 'Super Admin', office: 'LGU IT',
    roles: ['super-admin'], stages: [], level: 'view-edit',
    does: 'Everything, in every module — including deleting staff accounts.',
    doesNot: null,
  },
  {
    key: 'administrator', title: 'Administrator', office: 'LGU IT',
    roles: ['administrator'], stages: [], level: 'view-edit',
    does: 'Manages staff accounts, citizens and the workflow settings.',
    doesNot: 'Decide any permit, or touch a super admin account.',
  },
  {
    key: 'receiving-officer', title: 'Receiving Officer', office: OBO,
    roles: ['receiving-officer'], stages: [], level: 'view-edit',
    does: 'Receives submissions and starts the document check.',
    doesNot: 'Evaluate or approve.',
  },
  {
    key: 'records-officer', title: 'Records Officer', office: OBO,
    roles: ['records-officer'], stages: [], level: 'view-edit',
    does: 'Backs up receiving, files walk-in applications, withdraws or expires records, archives.',
    doesNot: 'Evaluate or approve.',
  },
  {
    key: 'initial-evaluator', title: 'Initial Evaluator', office: OBO,
    roles: ['evaluator'], stages: ['Initial'], level: 'view-edit',
    does: 'The Initial evaluation: moves applications into evaluation, or back for revision.',
    doesNot: 'Decide any other evaluation stage.',
  },
  {
    key: 'zoning-officer', title: 'Zoning Officer', office: 'Municipal Planning and Development Office',
    roles: ['evaluator'], stages: ['Zoning'], level: 'view-edit',
    does: 'The Zoning evaluation.',
    doesNot: 'Decide any other evaluation stage.',
  },
  {
    key: 'fire-safety-evaluator', title: 'Fire Safety Evaluator', office: 'Bureau of Fire Protection',
    roles: ['evaluator'], stages: ['Fire Safety'], level: 'view-edit',
    does: 'The Fire Safety evaluation.',
    doesNot: 'Decide any other evaluation stage.',
  },
  {
    key: 'technical-evaluator', title: 'Technical Evaluator', office: OBO,
    roles: ['evaluator'], stages: ['OBO'], level: 'view-edit',
    does: 'The OBO technical evaluation.',
    doesNot: 'Decide any other evaluation stage.',
  },
  {
    key: 'assessor', title: 'Assessor', office: OBO,
    roles: ['assessor'], stages: [], level: 'view-edit',
    does: 'Computes the fees and issues the Order of Payment.',
    doesNot: 'Verify a payment — the Cashier confirms what the Assessor charged.',
  },
  {
    key: 'cashier', title: 'Cashier', office: "Municipal Treasurer's Office",
    roles: ['cashier'], stages: [], level: 'view-edit',
    does: 'Verifies payments and sends paid applications for approval.',
    doesNot: 'Assess a fee.',
  },
  {
    key: 'building-official', title: 'Building Official', office: OBO,
    roles: ['building-official', 'evaluator'], stages: ['Final Approval'], level: 'view-edit',
    does: 'The Final Approval evaluation; approves or rejects the application and generates the permit.',
    doesNot: 'Decide the earlier evaluation stages.',
  },
  {
    key: 'releasing-officer', title: 'Releasing Officer', office: OBO,
    roles: ['releasing-officer'], stages: [], level: 'view-edit',
    does: 'Prepares the release and hands the permit over.',
    doesNot: 'Approve.',
  },
  {
    key: 'auditor', title: 'Auditor', office: 'Internal Audit',
    roles: ['auditor'], stages: [], level: 'view',
    does: 'Reads everything, including the audit log.',
    doesNot: 'Change anything.',
  },
];

const sameSet = (a: readonly string[], b: readonly string[]): boolean =>
  a.length === b.length && a.every((item) => b.includes(item));

/** The position an account's roles and stages match exactly, or null — a custom combination. */
export function presetFor(roles: readonly string[], stages: readonly string[]): OfficerPosition | null {
  return OFFICER_POSITIONS.find((p) => sameSet(p.roles, roles) && sameSet(p.stages, stages)) ?? null;
}

/**
 * The server's role → scope table (`ROLE_SCOPES` in the API's
 * identity/domain/account.ts), mirrored so this screen can say what an
 * account it is looking at may open and do. A mirror, like `MOVE_SCOPE`: the
 * server stays the judge of every request, and a drift here would mislabel a
 * screen, never grant anything.
 */
export const WIRE_ROLE_SCOPES: Readonly<Record<string, readonly string[]>> = {
  'receiving-officer': ['applications:read', 'documents:read', 'staff:receive', 'staff:annotate', 'citizens:read'],
  'records-officer': [
    'applications:read', 'applications:write', 'documents:read', 'documents:write',
    'staff:receive', 'staff:annotate', 'citizens:read',
  ],
  evaluator: ['applications:read', 'documents:read', 'staff:evaluate', 'staff:annotate'],
  assessor: ['applications:read', 'payments:read', 'staff:assess', 'staff:annotate'],
  cashier: ['applications:read', 'payments:read', 'staff:verify-payment', 'staff:annotate'],
  'building-official': ['applications:read', 'documents:read', 'payments:read', 'staff:approve', 'staff:annotate'],
  'releasing-officer': ['applications:read', 'staff:release', 'staff:annotate'],
  administrator: ['staff:administer', 'citizens:read'],
  auditor: ['applications:read', 'documents:read', 'payments:read', 'audit:read'],
};

/** A super admin holds every scope any other role holds (owner ruling, 2026-09-13). */
const SUPER_ADMIN_SCOPES = [...new Set(Object.values(WIRE_ROLE_SCOPES).flat())];

/** The server's rule for which scopes a view-only level withholds. */
const grantsAuthority = (scope: string): boolean => scope.endsWith(':write') || scope.startsWith('staff:');

/**
 * What an account may do, from its roles, stages and level — the same shape
 * the signed-in officer's own session answers with, so every permission rule
 * in this portal can be asked about somebody else.
 */
export function authorityForAccount(
  roles: readonly string[],
  stages: readonly string[] | null,
  level: 'view' | 'view-edit' | null,
  portalRole: StaffRole,
): Authority {
  const superAdmin = roles.includes('super-admin');
  const granted = new Set<string>();
  for (const role of roles) {
    for (const scope of role === 'super-admin' ? SUPER_ADMIN_SCOPES : WIRE_ROLE_SCOPES[role] ?? []) {
      granted.add(scope);
    }
  }
  const scopes = level === 'view' ? [...granted].filter((scope) => !grantsAuthority(scope)) : [...granted];
  return { role: portalRole, scopes, stages, superAdmin };
}
