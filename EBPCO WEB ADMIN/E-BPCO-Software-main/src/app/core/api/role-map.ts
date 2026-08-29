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
