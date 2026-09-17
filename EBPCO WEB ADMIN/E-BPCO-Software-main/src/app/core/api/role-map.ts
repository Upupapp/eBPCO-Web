import { StaffRole } from '../session/permissions';

/**
 * The API's role identifiers, mapped to this portal's names.
 *
 * ── This is a SECOND copy and that is a known hazard ────────────────────
 *
 * The backend holds the same mapping as `PORTAL_ROLE_LABELS`, added when the
 * two vocabularies were reconciled. It is not served anywhere yet, so the
 * portal cannot read it and has to restate it — which is exactly the drift the
 * reconciliation removed, reintroduced one layer up.
 *
 * The fix is for `/me` to return the label beside the role, or for the contract
 * to publish the map. Until then this file is the thing to change when a role
 * is renamed, and a role the API sends that is missing here is treated as
 * unknown rather than guessed at: showing an officer a menu built from a role
 * nobody recognised is worse than showing them none.
 */
const BY_WIRE_NAME: Readonly<Record<string, StaffRole>> = {
  'receiving-officer': 'Administrator',
  'records-officer': 'Administrator',
  evaluator: 'Evaluator',
  assessor: 'Payment Officer',
  cashier: 'Payment Officer',
  'building-official': 'Approving Officer',
  'releasing-officer': 'Releasing Officer',
  administrator: 'Administrator',
  auditor: 'Auditor',
  'super-admin': 'Super Admin',
};

/**
 * The portal shows ONE role; an account may hold several.
 *
 * Resolved by breadth rather than by the first in the list, because the sidebar
 * a role produces is the set of screens that role can reach — and an officer
 * holding both `cashier` and `evaluator` who was shown only the narrower of the
 * two would be told a screen does not exist when the server would serve it.
 */
const BREADTH: readonly StaffRole[] = [
  'Super Admin', 'Administrator', 'Approving Officer', 'Payment Officer',
  'Evaluator', 'Releasing Officer', 'Auditor',
];

export function portalRoleFor(wireRoles: readonly string[] | undefined): StaffRole | null {
  const mapped = (wireRoles ?? [])
    .map((role) => BY_WIRE_NAME[role])
    .filter((role): role is StaffRole => role !== undefined);
  if (mapped.length === 0) return null;

  return BREADTH.find((role) => mapped.includes(role)) ?? null;
}

/**
 * The real 10 `StaffRole` wire values, each with the backend's own
 * per-role label (`PORTAL_ROLE_LABELS` in `identity/domain/account.ts`) —
 * a SECOND copy of that table, for the same reason `BY_WIRE_NAME` above is
 * one: it is not served anywhere yet. Deliberately NOT collapsed the way
 * `BY_WIRE_NAME` is — that table exists to pick the one role a signed-in
 * account's sidebar is built from, this one exists to let an administrator
 * choose among the real roles the server actually grants when creating a
 * new account, where collapsing `assessor`/`cashier` into one "Payment
 * Officer" choice would make it impossible to grant just one of the two.
 */
export const WIRE_ROLE_LABELS: Readonly<Record<string, string>> = {
  'receiving-officer': 'Receiving Officer',
  'records-officer': 'Records Officer',
  evaluator: 'Evaluator',
  assessor: 'Assessor',
  cashier: 'Cashier',
  'building-official': 'Approving Officer',
  'releasing-officer': 'Releasing Officer',
  administrator: 'Administrator',
  auditor: 'Auditor',
  'super-admin': 'Super Admin',
};

/** The real wire role identifiers, in the order `WIRE_ROLE_LABELS` lists them. */
export const ALL_WIRE_ROLES: readonly string[] = Object.keys(WIRE_ROLE_LABELS);
