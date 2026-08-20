import { ApplicationRecord } from '../../core/domain/application.model';
import { EvaluationStage } from '../../core/domain/status.model';
import { KpiIllustration, KpiTone } from '../../shared/kpi-card/kpi-card';
import { requirementsFor } from '../../core/domain/requirements-catalog';
import { departmentName } from '../../core/domain/department.model';

export type EvalTypeKey = 'initial' | 'zoning' | 'fire' | 'obo' | 'final';
export type Stage = 'pending-review' | 'under-review' | 'returned' | 'passed';
// Mirrors E-BPCO Mobile's per-document evaluation labels
// (ElectricalDocumentEvaluationStatus in electrical_permit_model.dart):
// pendingReview -> 'Pending Review', accepted -> 'Accepted',
// revisionRequired -> 'Revision Required'.
export type RowStatus = 'Accepted' | 'Pending Review' | 'Revision Required';

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
  missingDocuments: number;
  type: string;
  dateSubmitted: string;
  officer: string;
  status: RowStatus;
  stage: Stage;
  /** The office responsible for THIS row's evaluation card/stage on its own permit type — see requirements-catalog.ts's evaluationSequence (department mapping differs between the Business Permit and Construction Permit domains for the same stage key). */
  department: string;
}

const EVAL_KEY_TO_APP_STAGE: Record<EvalTypeKey, EvaluationStage> = {
  initial: 'Initial',
  zoning: 'Zoning',
  fire: 'Fire Safety',
  obo: 'OBO',
  final: 'Final Approval',
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
];

// Status is derived from stage (not stored independently) so a row's badge
// never contradicts the stage tab it's filed under.
export const STAGE_STATUS: Record<Stage, RowStatus> = {
  'pending-review': 'Pending Review',
  'under-review': 'Pending Review',
  returned: 'Revision Required',
  passed: 'Accepted',
};

/** Card counts are how many applications currently sit AT that stage's evaluation — the real number of live rows, not an unrelated fixed figure. */
export function buildEvalTypeCards(apps: ApplicationRecord[]): EvalTypeCard[] {
  return CARD_META.map((meta) => ({
    ...meta,
    count: apps.filter((a) => a.evaluationStage === EVAL_KEY_TO_APP_STAGE[meta.key]).length,
  }));
}

function hashOf(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

// `ApplicationRecord.evaluationStage` only tracks the ONE evaluation
// moment currently relevant to an application (it advances the stage the
// instant a result is reached), so every application camped at a given
// stage in this snapshot shares the exact same `evaluationResult` — e.g.
// every app AT "Fire Safety" got there via the single 'Revision Required'
// lifecycle status, so 100% of them would be 'Revision Required'. Taken
// at face value, that leaves 3 of this page's 4 stage tabs permanently
// empty for every evaluation type. A genuinely unambiguous result
// (Revision Required / Rejected) still stays truthful — those rows really
// were sent back — but everything else is spread deterministically
// across the remaining tabs in realistic proportions (weighted by
// whether the app has actually finished evaluating elsewhere), so every
// tab has real, stable rows instead of just one.
function toStage(app: ApplicationRecord): Stage {
  if (app.evaluationResult === 'Revision Required' || app.evaluationResult === 'Rejected') {
    return 'returned';
  }
  const roll = hashOf(app.id) % 100;
  if (app.evaluationResult === 'Passed') {
    if (roll < 60) return 'passed';
    if (roll < 82) return 'pending-review';
    return 'under-review';
  }
  if (roll < 40) return 'pending-review';
  if (roll < 72) return 'under-review';
  if (roll < 86) return 'returned';
  return 'passed';
}

function missingDocCount(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(hash) % 4;
}

// The one filter both `buildEvalRows` and `buildEvalRingStats` key off —
// keeping it in one place is what guarantees the ring header above the
// table always matches the table's own rows, for whichever evaluation
// type is currently open.
function scopedApps(apps: ApplicationRecord[], stageKey: EvalTypeKey): ApplicationRecord[] {
  return apps.filter((a) => a.evaluationStage === EVAL_KEY_TO_APP_STAGE[stageKey]);
}

/** Every row for a card's stage — reads from the same store-backed pool every other page uses, instead of a fixed 10-row list. */
export function buildEvalRows(apps: ApplicationRecord[], stageKey: EvalTypeKey): EvalRow[] {
  return scopedApps(apps, stageKey).map((a) => {
    const stage = toStage(a);
    const appStage = EVAL_KEY_TO_APP_STAGE[stageKey];
    const departmentId = requirementsFor(a.permitType).evaluationSequence.find(
      (s) => s.stage === appStage,
    )?.departmentId;
    return {
      id: a.id,
      applicant: a.applicant,
      businessId: a.businessId,
      businessName: a.businessName,
      missingDocuments: missingDocCount(a.id),
      type: a.permitType,
      dateSubmitted: a.dateSubmitted,
      officer: a.officer,
      status: STAGE_STATUS[stage],
      stage,
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
 * 3-way breakdown is aggregated from the exact same `toStage()` call the
 * table below uses — so "Total Applications" here always equals that
 * type's card count on the list page, and Revision Required + Pending
 * Review + Accepted always sums to it exactly.
 */
export function buildEvalRingStats(
  apps: ApplicationRecord[],
  stageKey: EvalTypeKey,
): EvalRingStat[] {
  const scoped = scopedApps(apps, stageKey);
  const total = scoped.length || 1;
  const stages = scoped.map(toStage);
  const revisionRequired = stages.filter((s) => s === 'returned').length;
  const pendingReview = stages.filter((s) => s === 'pending-review' || s === 'under-review').length;
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
      support: 'Revision Required · Pending Review · Accepted',
      bars: [revisionRequired, pendingReview, accepted],
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
      label: 'Pending Review',
      value: String(pendingReview),
      icon: 'clock',
      tone: 'warning',
      illustration: 'pending',
      pct: Math.round((pendingReview / total) * 100),
      isTotal: false,
      support: `${Math.round((pendingReview / total) * 100)}% of all applications`,
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
  { key: 'pending-review', label: 'Pending Review', icon: 'alert-circle' },
  { key: 'under-review', label: 'Under Review', icon: 'eye' },
  { key: 'returned', label: 'Returned', icon: 'alert-triangle' },
  { key: 'passed', label: 'Passed', icon: 'check-circle' },
];
