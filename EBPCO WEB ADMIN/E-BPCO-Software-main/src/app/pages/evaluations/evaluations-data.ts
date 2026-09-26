import { KpiIllustration, KpiTone } from '../../shared/kpi-card/kpi-card';
import { requirementsFor } from '../../core/domain/requirements-catalog';
import { departmentName } from '../../core/domain/department.model';
import { isValidPermitType } from '../../core/domain/permit.model';
import {
  EVALUATION_STAGES,
  EvaluationQueueRow,
  EvaluationStage,
} from '../../core/api/staff-evaluations.api';

// 'unrecorded' is not a stage an application can be AT — it is the absence of
// the fact. The staff queue does not send a stage once every one of the five
// has a decision (`nextStage: null`) — but that already-complete case IS
// findable in the tabs above, so 'unrecorded' here means specifically an
// application whose evaluations array is genuinely empty (no decision at
// any stage yet) AND whose `nextStage` — the server's own next-step field —
// is also null, which the server itself never actually sends for a fresh
// application (it sends 'Initial'). Kept as a bucket regardless, so a shape
// this portal has not seen before still lands somewhere named, not nowhere.
export type EvalTypeKey = 'initial' | 'zoning' | 'fire' | 'obo' | 'final' | 'unrecorded';
// Previously 4 buckets ('pending-review' and 'under-review' both meaning
// "nobody has ruled on this yet") — collapsed to 3, since the distinction
// never meant anything an admin could act on differently. 'passed' is a
// PERMANENT fact once a stage has a real Passed decision in the row's own
// `evaluations` array — an application that has since moved on to a later
// stage still shows here, under this stage's own Passed tab, rather than
// disappearing the moment it advances.
export type Stage = 'under-review' | 'returned' | 'passed';
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
  applicantHasPhoto?: boolean;
  businessId: string;
  businessName: string;
  type: string | null;
  dateSubmitted: string;
  /** The server assigns no named officer to an evaluation. */
  officer: string;
  status: RowStatus;
  stage: Stage;
  /**
   * False when this row is showing up under a stage's own "Passed" tab
   * for a stage the application has genuinely moved past already. Advance
   * Stage / Return for Revision must never be offered on such a row —
   * acting on it would record THIS stage's decision while the application
   * is actually being evaluated at a LATER one.
   */
  isCurrentStage: boolean;
  department: string;
  /** Kept for the record view and for recording a decision against the right application. */
  row: EvaluationQueueRow;
}

export const EVAL_KEY_TO_APP_STAGE: Record<EvalTypeKey, EvaluationStage | null> = {
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
  {
    key: 'unrecorded',
    title: 'Stage not recorded',
    description: 'Applications the server has not told this portal the evaluation stage for.',
    icon: 'help-circle',
    tone: 'info',
    illustration: 'evaluations',
  },
];

export const STAGE_STATUS: Record<Stage, RowStatus> = {
  'under-review': 'Under Review',
  returned: 'Revision Required',
  passed: 'Accepted',
};

function hasPassedStage(row: EvaluationQueueRow, appStage: EvaluationStage): boolean {
  return row.evaluations.some((e) => e.stage === appStage && e.result === 'Passed');
}

/** Adverse-terminal lifecycle statuses read as "returned" for a row currently sitting at this stage — mirrors the local-store version's rule, now over the server's own `lifecycleStatus`. */
function stageBucket(row: EvaluationQueueRow, appStage: EvaluationStage | null): Stage {
  if (appStage !== null && hasPassedStage(row, appStage)) return 'passed';
  if (row.lifecycleStatus === 'Revision Required' || row.lifecycleStatus === 'Rejected') {
    return 'returned';
  }
  return 'under-review';
}

function scopedRows(rows: EvaluationQueueRow[], stageKey: EvalTypeKey): EvaluationQueueRow[] {
  const appStage = EVAL_KEY_TO_APP_STAGE[stageKey];
  if (appStage === null) return rows.filter((r) => r.nextStage === null && r.evaluations.length === 0);

  const stageIdx = EVALUATION_STAGES.indexOf(appStage);
  return rows.filter((r) => {
    if (r.nextStage === appStage) return true;
    if (r.nextStage === null) {
      // Every stage decided — still belongs here if THIS stage was passed.
      return hasPassedStage(r, appStage);
    }
    return EVALUATION_STAGES.indexOf(r.nextStage) > stageIdx && hasPassedStage(r, appStage);
  });
}

export function buildEvalTypeCards(rows: EvaluationQueueRow[]): EvalTypeCard[] {
  return CARD_META.map((meta) => ({
    ...meta,
    count:
      meta.key === 'unrecorded'
        ? rows.filter((r) => r.nextStage === null && r.evaluations.length === 0).length
        : rows.filter((r) => r.nextStage === EVAL_KEY_TO_APP_STAGE[meta.key]).length,
  }));
}

export function buildEvalRows(rows: EvaluationQueueRow[], stageKey: EvalTypeKey): EvalRow[] {
  const appStage = EVAL_KEY_TO_APP_STAGE[stageKey];
  return scopedRows(rows, stageKey).map((r) => {
    const stage = stageBucket(r, appStage);
    const permitType = isValidPermitType(r.permitType) ? r.permitType : null;
    const departmentId =
      appStage === null || permitType === null
        ? undefined
        : requirementsFor(permitType).evaluationSequence.find((s) => s.stage === appStage)
            ?.departmentId;
    return {
      id: r.applicationId,
      applicant: r.applicantName,
      applicantHasPhoto: r.applicantHasPhoto === true,
      businessId: r.businessId ?? '',
      businessName: r.businessName ?? '—',
      type: permitType,
      dateSubmitted: r.submittedAt ? r.submittedAt.slice(0, 10) : '—',
      officer: '—',
      status: STAGE_STATUS[stage],
      stage,
      isCurrentStage: appStage !== null && r.nextStage === appStage,
      department: departmentId ? departmentName(departmentId) : '—',
      row: r,
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
}

export function buildEvalRingStats(
  rows: EvaluationQueueRow[],
  stageKey: EvalTypeKey,
  cardTitle?: string,
): EvalRingStat[] {
  const appStage = EVAL_KEY_TO_APP_STAGE[stageKey];
  const scoped = scopedRows(rows, stageKey);
  const total = scoped.length || 1;
  const stages = scoped.map((r) => stageBucket(r, appStage));
  const revisionRequired = stages.filter((s) => s === 'returned').length;
  const underReview = stages.filter((s) => s === 'under-review').length;
  const accepted = stages.filter((s) => s === 'passed').length;
  return [
    {
      // Named for what it actually counts — every status combined for this
      // evaluation type — since the worklist directly below only ever shows
      // ONE status tab at a time. A plain "Total Applications" read as a
      // claim about the table's own row count, and the two numbers
      // disagreeing (e.g. 3 here, 1 row showing under "Under Review") looked
      // like a bug rather than two different, both-correct scopes.
      label: cardTitle ? `Total in ${cardTitle}` : 'Total Applications',
      value: String(scoped.length),
      icon: 'logs',
      tone: 'info',
      illustration: 'applications',
      pct: 100,
      isTotal: true,
      // One line and the same full-width bar as its three neighbours, so all
      // four tinted footers are the same size. The mini bar chart this used
      // to carry made this one footer taller than the rest, and it repeated
      // the three numbers the cards beside it already show.
      support: 'All statuses in this evaluation',
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
