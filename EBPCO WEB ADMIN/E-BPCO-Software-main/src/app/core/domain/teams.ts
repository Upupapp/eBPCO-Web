import { Responsibility } from './responsibility';

/**
 * The teams of the permit office, and what the signed-in officer may do with
 * an application (owner request, 2026-09-29: team leads and team members;
 * every officer sees every application, and works on one only at their stage).
 *
 * A mirror of the API's `domain/teams.ts` and `StepGuard`: the server decides
 * every request and says why when it refuses. This only lets a screen show the
 * right buttons, and the reason, before the click.
 */

export interface Team {
  readonly key: string;
  readonly name: string;
  readonly position: string;
  readonly ownsStep: boolean;
}

export const TEAMS: readonly Team[] = [
  { key: 'receiving', name: 'Receiving', position: 'Receiving Officer', ownsStep: true },
  { key: 'initial-evaluation', name: 'Initial Evaluation', position: 'Initial Evaluator', ownsStep: true },
  { key: 'zoning', name: 'Zoning', position: 'Zoning Officer', ownsStep: true },
  { key: 'fire-safety', name: 'Fire Safety', position: 'Fire Safety Evaluator', ownsStep: true },
  { key: 'technical', name: 'Technical Evaluation (OBO)', position: 'Technical Evaluator', ownsStep: true },
  { key: 'assessment', name: 'Assessment', position: 'Assessor', ownsStep: true },
  { key: 'cashier', name: 'Cashier', position: 'Cashier', ownsStep: true },
  { key: 'building-official', name: 'Building Official', position: 'Building Official', ownsStep: true },
  { key: 'releasing', name: 'Releasing', position: 'Releasing Officer', ownsStep: true },
  { key: 'records', name: 'Records', position: 'Records Officer', ownsStep: false },
  { key: 'audit', name: 'Audit', position: 'Auditor', ownsStep: false },
  { key: 'administration', name: 'Administration', position: 'Administrator', ownsStep: false },
];

export function teamName(key: string | null | undefined): string {
  return TEAMS.find((team) => team.key === key)?.name ?? 'another';
}

/** The signed-in officer, as the rules below need them. */
export interface Worker {
  readonly accountId: string | null;
  readonly teams: readonly string[];
  readonly lead: boolean;
  readonly superAdmin: boolean;
  /** The Records Officer's record-keeping (`applications:write`), at any step. */
  readonly keepsRecords: boolean;
}

export interface WorkState {
  /** May edit it and act on it right now. */
  readonly canWork: boolean;
  /** Why not, in a sentence for the screen; null when they can. */
  readonly reason: string | null;
  /** The team whose step it is, or null when none. */
  readonly team: string | null;
  readonly assignee: { readonly id: string; readonly name: string } | null;
  /** It is with this officer. */
  readonly mine: boolean;
  /** Leads this team (or a super admin): may give it to any member. */
  readonly mayAssign: boolean;
  /** A member of this team, and nobody has it: may take it. */
  readonly mayTake: boolean;
}

const NOTHING: WorkState = {
  canWork: false, reason: null, team: null, assignee: null, mine: false, mayAssign: false, mayTake: false,
};

export function workStateFor(responsibility: Responsibility | null | undefined, me: Worker): WorkState {
  if (!responsibility) return me.superAdmin || me.keepsRecords ? { ...NOTHING, canWork: true } : NOTHING;
  const team = responsibility.team ?? null;
  const assignee = responsibility.assignee ?? null;
  const mine = assignee !== null && assignee.id === me.accountId;
  const inTeam = team !== null && me.teams.includes(team);

  if (me.superAdmin) {
    return { canWork: true, reason: null, team, assignee, mine, mayAssign: team !== null, mayTake: false };
  }
  // An older server says nothing about teams: leave the decision to it.
  if (responsibility.team === undefined) return { ...NOTHING, canWork: true, team, assignee };

  if (!inTeam) {
    const reason = team === null
      ? (responsibility.awaitingApplicant
        ? 'It is with the applicant right now, so there is nothing for an officer to change.'
        : 'It is not at any office’s step right now.')
      : `It is at the “${responsibility.step}” step, which is the ${teamName(team)} team’s. You can view it; only that team can work on it now.`;
    return { canWork: me.keepsRecords, reason: me.keepsRecords ? null : reason, team, assignee, mine, mayAssign: false, mayTake: false };
  }
  if (assignee !== null && !mine && !me.lead) {
    return {
      canWork: false,
      reason: `It is assigned to ${assignee.name}. Only they or your team lead can work on it; ask your lead to reassign it if it should be yours.`,
      team, assignee, mine, mayAssign: false, mayTake: false,
    };
  }
  return { canWork: true, reason: null, team, assignee, mine, mayAssign: me.lead, mayTake: assignee === null };
}
