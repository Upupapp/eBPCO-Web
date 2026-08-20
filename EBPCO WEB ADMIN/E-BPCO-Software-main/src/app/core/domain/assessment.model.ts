import {
  FeeApplicability,
  FeeAuthority,
  FeeCalculationType,
  FeeRuleVerificationStatus,
} from './fee-rule.model';

// An Order of Payment / assessment for one application — versioned so a
// correction made after issuance never rewrites what was actually issued
// (and possibly already partly paid against). Replaces the old
// `assessedAmountCentavos` single-number field: an ApplicationRecord's
// projected total is now always read back from the latest Assessment's
// `totalCentavos`, but the line items behind that total are preserved
// here instead of being silently rebuilt from whatever Settings says
// today (the "receipts rebuild line items from current settings" defect).
export type AssessmentStatus =
  | 'Draft'
  | 'For Approval'
  | 'Issued'
  | 'Partially Paid'
  | 'Paid'
  | 'Overdue'
  | 'Superseded'
  | 'Voided';

export const ASSESSMENT_STATUS_ORDER: AssessmentStatus[] = [
  'Draft',
  'For Approval',
  'Issued',
  'Partially Paid',
  'Overdue',
  'Paid',
  'Superseded',
  'Voided',
];

/**
 * One fee line as it existed at the moment this assessment version was
 * built — an immutable copy of the FeeRule's relevant fields, not a live
 * reference. Editing the FeeRule catalog later (a rate change, a
 * re-scoped applicability) never alters a line item already captured
 * here; a correction after issuance instead creates a whole new
 * Assessment version (see AssessmentStore.reviseIssuedAssessment).
 */
export interface AssessmentLineItem {
  feeRuleId: string;
  code: string;
  name: string;
  family: string;
  authority: FeeAuthority;
  collectingOfficeId: string;
  calculationType: FeeCalculationType;
  applicability: FeeApplicability;
  /** Whatever inputs the assessor supplied to compute this line (e.g. { floorAreaSqm: 120 }) — empty object for a flat fee or one still awaiting input. */
  inputs: Record<string, number>;
  /** Null while `requiresAssessorInput` is true and no manual amount has been entered yet — never a fabricated number. */
  amountCentavos: number | null;
  requiresAssessorInput: boolean;
  /** Whether this conditional line was kept on the assessment (always true once 'required'). */
  included: boolean;
  legalBasisUrl: string;
  legalBasisTitle: string;
  verificationStatus: FeeRuleVerificationStatus;
}

export interface Assessment {
  id: string;
  applicationId: string;
  /** 1 for the first assessment on an application; increments each time reviseIssuedAssessment creates a replacement. */
  version: number;
  /** The assessment this one replaces, or null for the first version. */
  supersedesId: string | null;
  status: AssessmentStatus;
  assessorName: string;
  assessorRole: string;
  lineItems: AssessmentLineItem[];
  /** Sum of every included line's amountCentavos (nulls treated as 0 — a line still awaiting assessor input never blocks the rest of the total from being visible, but see `hasUnresolvedLines`). */
  totalCentavos: number;
  /** True while at least one included line has `amountCentavos === null` — the assessment cannot be issued while this is true. */
  hasUnresolvedLines: boolean;
  amountPaidCentavos: number;
  balanceCentavos: number;
  /** Order of Payment Slip number — assigned only once issued. */
  opsNumber: string | null;
  dueDateValue: Date | null;
  dueDate: string | null;
  remarks: string | null;
  createdAtValue: Date;
  createdAt: string;
  approvedBy: string | null;
  approvedAtValue: Date | null;
  approvedAt: string | null;
  issuedAtValue: Date | null;
  issuedAt: string | null;
}

export function computeLineTotal(lineItems: AssessmentLineItem[]): {
  totalCentavos: number;
  hasUnresolvedLines: boolean;
} {
  let total = 0;
  let unresolved = false;
  for (const line of lineItems) {
    if (!line.included) continue;
    if (line.amountCentavos === null) {
      unresolved = true;
      continue;
    }
    total += line.amountCentavos;
  }
  return { totalCentavos: total, hasUnresolvedLines: unresolved };
}

/** Derives whether an Issued/Partially Paid assessment counts as overdue right now — never stored independently, so it can never drift from `dueDateValue`/`balanceCentavos`. */
export function isAssessmentOverdue(
  assessment: Pick<Assessment, 'status' | 'dueDateValue' | 'balanceCentavos'>,
  now: Date = new Date(),
): boolean {
  if (
    assessment.status !== 'Issued' &&
    assessment.status !== 'Partially Paid' &&
    assessment.status !== 'Overdue'
  ) {
    return false;
  }
  if (assessment.balanceCentavos <= 0) return false;
  if (!assessment.dueDateValue) return false;
  return assessment.dueDateValue.getTime() < now.getTime();
}

export const NON_TERMINAL_ASSESSMENT_STATUSES: ReadonlySet<AssessmentStatus> = new Set([
  'Draft',
  'For Approval',
  'Issued',
  'Partially Paid',
  'Overdue',
]);
