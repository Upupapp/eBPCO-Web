import { ACTION_PERMISSIONS, Authority, NAV_MODULES, mayOpen } from '../../core/session/permissions';

/**
 * The module × action grid for one staff account, read from the SAME rules
 * the sidebar, the route guard and every button use (`NAV_MODULES`,
 * `ACTION_PERMISSIONS`), asked about that account's own scopes — not a guess
 * from its label. It used to be asked about the portal's seven coarse roles,
 * which filed a Receiving Officer under "Administrator" and showed them Staff
 * & Roles; it now asks what the account's roles actually grant
 * (`authorityForAccount`).
 *
 * The workload and activity generators that lived here are gone. They drew
 * assignment counts and "Reviewed an application, 2 days ago" from a seeded
 * random number, labelled as sample data; the Staff screen now reads the real
 * queue ("waiting on this officer") and the real audit trail instead.
 */

export interface PermissionMatrixRow {
  module: string;
  view: boolean;
  create: boolean;
  approve: boolean;
  verify: boolean;
  export: boolean;
  configure: boolean;
}

type Check = (who: Authority) => boolean;

// Per-module action gates beyond plain view access, keyed by the same
// `NavModule.key` the sidebar/route guard already use — filled in only where
// a real ACTION_PERMISSIONS check (mirrored server-side) exists for that
// module. A module left out here has no action beyond view/export.
const MODULE_ACTIONS: Partial<
  Record<string, { create?: Check; approve?: Check; verify?: Check; configure?: Check; exportable?: boolean }>
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
  'user-roles': { create: (who) => who.superAdmin || (who.scopes ?? []).includes('staff:administer'), exportable: true },
  'system-logs': { exportable: true },
};

export function buildPermissionMatrix(who: Authority | null): PermissionMatrixRow[] {
  if (who === null) return [];
  return NAV_MODULES.map((mod) => {
    const view = mayOpen(mod, who);
    const actions = MODULE_ACTIONS[mod.key] ?? {};
    return {
      module: mod.label,
      view,
      create: view && (actions.create?.(who) ?? false),
      approve: view && (actions.approve?.(who) ?? false),
      verify: view && (actions.verify?.(who) ?? false),
      export: view && (actions.exportable ?? false),
      configure: view && (actions.configure?.(who) ?? false),
    };
  });
}
