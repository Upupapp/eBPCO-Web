import { ApplicationRecord } from '../../core/domain/application.model';
import { EVALUATION_STAGE_ORDER, EvaluationStage } from '../../core/domain/status.model';
import { EvaluationRecord } from '../../core/domain/evaluation.model';
import { KpiIllustration, KpiTone } from '../../shared/kpi-card/kpi-card';
import { requirementsFor } from '../../core/domain/requirements-catalog';
import { departmentName } from '../../core/domain/department.model';

// 'unrecorded' is not a stage an application can be AT — it is the absence of
// the fact. The staff queue does not send a stage, and every server row used to
// be stamped 'Initial', which counted them all under Initial Evaluation and kept
// them out of every later queue. They get their own bucket instead of a claim
// (owner ruling, 29 Aug).
export type EvalTypeKey = 'initial' | 'zoning' | 'fire' | 'obo' | 'final' | 'unrecorded';
// Previously 4 buckets ('pending-review' and 'under-review' both meaning
// "nobody has ruled on this yet") — collapsed to 3, since the distinction
// never meant anything an admin could act on differently. 'passed' is a
// PERMANENT fact once a stage has a real Passed EvaluationRecord (see
// stageBucket below) — an application that has since moved on to a later
// stage still shows here, under this stage's own Passed tab, rather than
// disappearing the moment it advances.
export type Stage = 'under-review' | 'returned' | 'passed';
// Loosely mirrors E-BPCO Mobile's per-document evaluation labels
// (ElectricalDocumentEvaluationStatus in electrical_permit_model.dart) —
// accepted -> 'Accepted', revisionRequired -> 'Revision Required'. Mobile's
// own 'pendingReview' is spelled 'Under Review' here to match this one
// merged Stage bucket's tab label (see Stage/STAGE_TABS above) rather than
// carrying two different words for the same thing.
export type RowStatus = 'Accepted' | 'Under Review' | 'Revision Required';

export interface EvalTypeCard {
  key: EvalTypeKey;
  title: string;
  description: string;
  count: number;
  icon: string;
  tone: KpiTone;
  illustration: KpiIllustration;
}

export interface EvalRow {
  id: string;
  applicant: string;
  /** Canonical relationship — see ApplicationStore.getApplicationContext. Never derived from `applicant`; one applicant can own multiple businesses. */
  businessId: string;
  businessName: string;
  /**
   * Required documents outstanding, or `null` when no document data is held for
   * the application. This was a hash of the application's ID rendered as fact;
   * `null` is the honest answer where a number cannot be supported.
   */
  missingDocuments: number | null;
  type: string;
  dateSubmitted: string;
  officer: string;
  status: RowStatus;
  stage: Stage;
  /**
   * False when this row is showing up under a stage's own "Passed" tab
   * for a stage the application has genuinely moved past already (the
   * application's real `evaluationStage` is now later than this card's).
   * Advance Stage / Return for Revision must never be offered on such a
   * row — acting on it would call `recordEvaluation` for THIS stage while
   * the application is actually being evaluated at a LATER one, silently
   * attributing the action to the wrong stage.
   */
  isCurrentStage: boolean;
  /** The office responsible for THIS row's evaluation card/stage on its own permit type — see requirements-catalog.ts's evaluationSequence (department mapping differs between the Business Permit and Construction Permit domains for the same stage key). */
  department: string;
}

/** `null` for the bucket that exists precisely because no stage is known. */
const EVAL_KEY_TO_APP_STAGE: Record<EvalTypeKey, EvaluationStage | null> = {
  initial: 'Initial',
  zoning: 'Zoning',
  fire: 'Fire Safety',
  obo: 'OBO',
  final: 'Final Approval',
  unrecorded: null,
};

const CARD_META: Omit<EvalTypeCard, 'count'>[] = [
  {
    key: 'initial',
    title: 'Initial Evaluation',
    description: 'Review and process building permit applications.',
    icon: 'file-check',
    tone: 'warning',
    illustration: 'evaluations',
  },
  {
    key: 'zoning',
    title: 'Zoning Evaluation',
    description: 'A local authority review for compliance with zoning and building regulations.',
    icon: 'map',
    tone: 'info',
    illustration: 'evaluations',
  },
  {
    key: 'fire',
    title: 'Fire Safety Evaluation',
    description: "An assessment of a building's compliance with fire safety standards.",
    icon: 'shield',
    tone: 'danger',
    illustration: 'evaluations',
  },
  {
    key: 'obo',
    title: 'OBO Evaluation',
    description: 'An OBO review for fire and building code compliance.',
    icon: 'building',
    tone: 'neutral',
    illustration: 'evaluations',
  },
  {
    key: 'final',
    title: 'Final Evaluation',
    description: 'A final sign-off confirming the application is ready for permit release.',
    icon: 'check-circle',
    tone: 'success',
    illustration: 'evaluations',
  },
  // Last, and described as what it is. These rows are not "at" this stage —
  // the portal simply has not been told where they are.
  {
    key: 'unrecorded',
    title: 'Stage not recorded',
    description: 'Applications the server has not told this portal the evaluation stage for.',
    icon: 'help-circle',
    tone: 'info',
    illustration: 'evaluations',
  },
];

// Status is derived from stage (not stored independently) so a row's badge
// never contradicts the stage tab it's filed under.
export const STAGE_STATUS: Record<Stage, RowStatus> = {
  'under-review': 'Under Review',
  returned: 'Revision Required',
  passed: 'Accepted',
};

/** Card counts are how many applications currently sit AT that stage's evaluation — the real number of live rows, not an unrelated fixed figure. */
export function buildEvalTypeCards(apps: ApplicationRecord[]): EvalTypeCard[] {
  return CARD_META.map((meta) => ({
    ...meta,
    // Both sides are null for the 'unrecorded' card, which is exactly the rows
    // whose stage the portal does not know.
    count: apps.filter((a) => a.evaluationStage === EVAL_KEY_TO_APP_STAGE[meta.key]).length,
  }));
}

/** True once a real EvaluationRecord shows this application actually passed this specific stage — a permanent fact, unaffected by whatever happens at a LATER stage afterward (see stageBucket below). */
function hasPassedStage(
  applicationId: string,
  appStage: EvaluationStage,
  allEvaluations: EvaluationRecord[],
): boolean {
  return allEvaluations.some(
    (r) => r.applicationId === applicationId && r.stage === appStage && r.result === 'Passed',
  );
}

/**
 * The one real-data rule both `buildEvalRows` and `buildEvalRingStats` key
 * off, replacing the old hash-randomized `toStage()` simulation:
 *  - 'passed' once a real EvaluationRecord shows this stage was actually
 *    passed — permanent, so an application that has since moved on to a
 *    later stage still shows here, under THIS stage's own Passed tab,
 *    rather than vanishing from it the moment it advances.
 *  - 'returned' while the application is CURRENTLY sitting at this stage
 *    with lifecycleStatus Revision Required/Rejected.
 *  - 'under-review' while currently sitting at this stage with no result
 *    yet — the old 'pending-review'/'under-review' split never meant
 *    anything an admin could act on differently, so it's one bucket now.
 */
function stageBucket(
  app: ApplicationRecord,
  appStage: EvaluationStage | null,
  allEvaluations: EvaluationRecord[],
): Stage {
  // With no stage there is nothing to have passed; the row still shows its
  // lifecycle-derived state so it is workable rather than inert.
  if (appStage !== null && hasPassedStage(app.id, appStage, allEvaluations)) return 'passed';
  if (app.lifecycleStatus === 'Revision Required' || app.lifecycleStatus === 'Rejected') {
    return 'returned';
  }
  return 'under-review';
}

// The one filter both `buildEvalRows` and `buildEvalRingStats` key off —
// keeping it in one place is what guarantees the ring header above the
// table always matches the table's own rows, for whichever evaluation
// type is currently open. An application belongs to this stage's table
// either because it's CURRENTLY here, or because it genuinely passed
// through here already (see hasPassedStage) and moved on — never because
// it hasn't reached this stage yet.
function scopedApps(
  apps: ApplicationRecord[],
  stageKey: EvalTypeKey,
  allEvaluations: EvaluationRecord[],
): ApplicationRecord[] {
  const appStage = EVAL_KEY_TO_APP_STAGE[stageKey];
  // The unknown-stage bucket holds exactly the rows with no stage, and no real
  // stage's queue may claim them — "past this stage" is meaningless without one.
  if (appStage === null) return apps.filter((a) => a.evaluationStage === null);

  const stageIdx = EVALUATION_STAGE_ORDER.indexOf(appStage);
  return apps.filter((a) => {
    if (a.evaluationStage === null) return false;
    if (a.evaluationStage === appStage) return true;
    return (
      EVALUATION_STAGE_ORDER.indexOf(a.evaluationStage) > stageIdx &&
      hasPassedStage(a.id, appStage, allEvaluations)
    );
  });
}

/** Every row for a card's stage — reads from the same store-backed pool every other page uses, instead of a fixed 10-row list. `allEvaluations` (ApplicationStore.evaluations()) is what makes 'passed' a real, permanent fact rather than a guess — defaults to empty for callers (tests) that don't care about cross-stage history. */
export function buildEvalRows(
  apps: ApplicationRecord[],
  stageKey: EvalTypeKey,
  allEvaluations: EvaluationRecord[] = [],
  /** ApplicationStore.missingRequiredDocuments. Defaults to "unknown" so a caller that cannot supply it says so rather than showing a number. */
  missingRequiredDocuments: (applicationId: string) => number | null = () => null,
): EvalRow[] {
  const appStage = EVAL_KEY_TO_APP_STAGE[stageKey];
  return scopedApps(apps, stageKey, allEvaluations).map((a) => {
    const stage = stageBucket(a, appStage, allEvaluations);
    const departmentId =
      appStage === null
        ? undefined
        : requirementsFor(a.permitType).evaluationSequence.find((s) => s.stage === appStage)
            ?.departmentId;
    return {
      id: a.id,
      applicant: a.applicant,
      businessId: a.businessId,
      businessName: a.businessName,
      missingDocuments: missingRequiredDocuments(a.id),
      type: a.permitType,
      dateSubmitted: a.dateSubmitted,
      officer: a.officer,
      status: STAGE_STATUS[stage],
      stage,
      // `null === null` would be true, which would offer Passed/Return on a row
      // whose stage nobody knows. An unknown stage is never "the current one".
      isCurrentStage: appStage !== null && a.evaluationStage === appStage,
      department: departmentId ? departmentName(departmentId) : '—',
    };
  });
}

export interface EvalRingStat {
  label: string;
  value: string;
  icon: string;
  tone: KpiTone;
  illustration: KpiIllustration;
  pct: number;
  isTotal: boolean;
  support?: string;
  bars?: number[];
}

/**
 * Scoped to the one evaluation type whose detail view is open, and its
 * 3-way breakdown is aggregated from the exact same `stageBucket()` call
 * the table below uses — so "Total Applications" here always equals the
 * table's own row count for that stage (now genuinely "currently here, or
 * already passed through" — not just "currently here"), and Revision
 * Required + Under Review + Accepted always sums to it exactly.
 */
export function buildEvalRingStats(
  apps: ApplicationRecord[],
  stageKey: EvalTypeKey,
  allEvaluations: EvaluationRecord[] = [],
): EvalRingStat[] {
  const appStage = EVAL_KEY_TO_APP_STAGE[stageKey];
  const scoped = scopedApps(apps, stageKey, allEvaluations);
  const total = scoped.length || 1;
  const stages = scoped.map((a) => stageBucket(a, appStage, allEvaluations));
  const revisionRequired = stages.filter((s) => s === 'returned').length;
  const underReview = stages.filter((s) => s === 'under-review').length;
  const accepted = stages.filter((s) => s === 'passed').length;
  return [
    {
      label: 'Total Applications',
      value: String(scoped.length),
      icon: 'logs',
      tone: 'info',
      illustration: 'applications',
      pct: 100,
      isTotal: true,
      support: 'Revision Required · Under Review · Accepted',
      bars: [revisionRequired, underReview, accepted],
    },
    {
      label: 'Revision Required',
      value: String(revisionRequired),
      icon: 'alert-triangle',
      tone: 'danger',
      illustration: 'critical',
      pct: Math.round((revisionRequired / total) * 100),
      isTotal: false,
      support: `${Math.round((revisionRequired / total) * 100)}% of all applications`,
    },
    {
      label: 'Under Review',
      value: String(underReview),
      icon: 'clock',
      tone: 'warning',
      illustration: 'pending',
      pct: Math.round((underReview / total) * 100),
      isTotal: false,
      support: `${Math.round((underReview / total) * 100)}% of all applications`,
    },
    {
      label: 'Accepted',
      value: String(accepted),
      icon: 'check-circle',
      tone: 'success',
      illustration: 'success',
      pct: Math.round((accepted / total) * 100),
      isTotal: false,
      support: `${Math.round((accepted / total) * 100)}% of all applications`,
    },
  ];
}

export const STAGE_TABS: { key: Stage; label: string; icon: string }[] = [
  { key: 'under-review', label: 'Under Review', icon: 'eye' },
  { key: 'returned', label: 'Returned', icon: 'alert-triangle' },
  { key: 'passed', label: 'Passed', icon: 'check-circle' },
];
