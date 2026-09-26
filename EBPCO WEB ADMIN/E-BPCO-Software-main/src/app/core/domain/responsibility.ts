/**
 * Who an application is waiting on — "Assigned to" (officer positions,
 * 2026-09-26).
 *
 * The server's own answer (`responsibility.ts` in the API), carried on every
 * applications and evaluations queue row and never worked out here. Each step
 * of the lifecycle belongs to one position by rule — the scope its transition
 * needs, and for an evaluation the stage — and the officers are whoever holds
 * that position for the application's permit type today. A portal that
 * guessed would be a second opinion on "whose is this", free to disagree with
 * who the server actually lets act.
 */
export interface Responsibility {
  /** What happens next, in the office's words ("Decide the Fire Safety evaluation"). */
  readonly step: string;
  /** The position that does it ("Fire Safety Evaluator"), 'Applicant' when the citizen must act, null once closed. */
  readonly holder: string | null;
  /** The evaluation stage, when the step is one. */
  readonly stage: string | null;
  readonly awaitingApplicant: boolean;
  /**
   * The officers holding this step for this permit type. Never super admins —
   * they hold every step. Empty means no officer is assigned yet.
   */
  readonly officers: ReadonlyArray<{ readonly id: string; readonly name: string }>;
}

/** One line for a table cell: the officer, or who else the step waits on. */
export function assignedToLabel(responsibility: Responsibility | null | undefined): string {
  if (!responsibility) return '—';
  if (responsibility.awaitingApplicant) return 'Applicant';
  if (responsibility.holder === null) return '—';
  const [first, ...others] = responsibility.officers;
  if (first === undefined) return `${responsibility.holder} (no officer yet)`;
  return others.length === 0 ? first.name : `${first.name} +${others.length}`;
}

/** Every officer's name, for a tooltip or a detail line. */
export function assignedOfficerNames(responsibility: Responsibility | null | undefined): string {
  return (responsibility?.officers ?? []).map((officer) => officer.name).join(', ');
}

/** Whether this account is one of the officers the step is waiting on. */
export function isAssignedTo(responsibility: Responsibility | null | undefined, accountId: string | null): boolean {
  if (!responsibility || accountId === null) return false;
  return responsibility.officers.some((officer) => officer.id === accountId);
}
