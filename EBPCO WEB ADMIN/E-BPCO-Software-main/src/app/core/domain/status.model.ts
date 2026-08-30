// Canonical status/workflow dimensions for the E-BPCO admin domain.
//
// Deliberately NOT one shared three-value status reused for everything —
// evaluation, payment, and permit release are separate concerns that move
// independently (a payment can be "Paid" while the permit release is still
// "Not Ready"). See ApplicationRecord in application.model.ts for how these
// compose on one record.

// The application's overall position in its lifecycle. Mirrors E-BPCO
// Mobile's applicant-facing ApplicationStatus sequence (draft -> submitted
// -> underReview -> paymentVerification -> approved -> released, in
// ebpco-mobile/lib/core/models/application_model.dart) but broken into the
// finer internal stages the web admin's own review process needs (document
// verification, evaluation, a revision loop, staged payment verification,
// permit generation). Mobile's 7 applicant-visible values are a coarser
// projection of this list — see LIFECYCLE_TO_MOBILE_LABEL below for the
// explicit mapping, so the two apps are documented as describing the same
// underlying record rather than two disconnected vocabularies.
export type ApplicationLifecycleStatus =
  | 'Draft'
  | 'Submitted'
  | 'Received'
  | 'Document Verification'
  | 'Under Evaluation'
  | 'Revision Required'
  | 'Assessed'
  | 'Payment Submitted'
  | 'Payment Under Verification'
  | 'Payment Verified'
  | 'For Approval'
  | 'Approved'
  | 'Permit Generated'
  | 'Ready for Release'
  | 'Released'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled'
  | 'Expired';

// Every member of the union, terminal ones included. NOT `LIFECYCLE_SEQUENCE`
// — that is the fifteen-step happy path and omits 'Revision Required',
// 'Rejected', 'Cancelled' and 'Expired', so validating against it would refuse
// four perfectly valid statuses. Guarded by a spec that counts both.
const ALL_LIFECYCLE_STATUSES: ReadonlySet<ApplicationLifecycleStatus> = new Set([
  'Draft', 'Submitted', 'Received', 'Document Verification', 'Under Evaluation',
  'Revision Required', 'Assessed', 'Payment Submitted', 'Payment Under Verification',
  'Payment Verified', 'For Approval', 'Approved', 'Permit Generated',
  'Ready for Release', 'Released', 'Completed', 'Rejected', 'Cancelled', 'Expired',
]);

/**
 * The companion to `isValidPermitType`, for the same reason: the wire is an
 * untyped source and `as ApplicationLifecycleStatus` puts whatever arrived into
 * a typed field.
 *
 * Unlike the permit vocabulary the two ends agree here — the service's own
 * `LIFECYCLE_STATUSES` is these same 19 names in this same order — so this
 * guards against DRIFT rather than a standing mismatch. An unknown status used
 * to coerce silently: `coarseStatus` falls through to 'Under Review', so a
 * status this portal had never heard of was displayed as a claim about where
 * the application stands.
 */
export function isValidLifecycleStatus(value: string): value is ApplicationLifecycleStatus {
  return ALL_LIFECYCLE_STATUSES.has(value as ApplicationLifecycleStatus);
}

// The ordered "happy path" through the non-terminal states — used to
// render a status timeline. Revision Required is reachable from Document
// Verification/Under Evaluation/For Approval and loops back rather than
// being a fixed point in this sequence; Rejected/Cancelled/Expired are
// terminal exits reachable from most non-terminal states.
export const LIFECYCLE_SEQUENCE: ApplicationLifecycleStatus[] = [
  'Draft',
  'Submitted',
  'Received',
  'Document Verification',
  'Under Evaluation',
  'Assessed',
  'Payment Submitted',
  'Payment Under Verification',
  'Payment Verified',
  'For Approval',
  'Approved',
  'Permit Generated',
  'Ready for Release',
  'Released',
  'Completed',
];

const TERMINAL_STATUSES: ReadonlySet<ApplicationLifecycleStatus> = new Set([
  'Rejected',
  'Cancelled',
  'Expired',
  'Completed',
]);

export function isTerminalStatus(status: ApplicationLifecycleStatus): boolean {
  return TERMINAL_STATUSES.has(status);
}

// Valid forward transitions, keyed by current status. Anything not listed
// here (e.g. "Under Evaluation" straight to "Approved") is not a legal
// direct transition — the Business Stages board and any status-change
// action must consult this instead of allowing an arbitrary drop, per the
// "no arbitrary drag-and-drop without transition validation" requirement.
export const VALID_TRANSITIONS: Record<ApplicationLifecycleStatus, ApplicationLifecycleStatus[]> = {
  Draft: ['Submitted', 'Cancelled'],
  Submitted: ['Received', 'Cancelled'],
  Received: ['Document Verification', 'Cancelled'],
  'Document Verification': ['Under Evaluation', 'Revision Required', 'Rejected'],
  'Under Evaluation': ['Assessed', 'Revision Required', 'Rejected'],
  'Revision Required': ['Under Evaluation', 'Cancelled', 'Expired'],
  Assessed: ['Payment Submitted', 'Cancelled', 'Expired'],
  'Payment Submitted': ['Payment Under Verification'],
  'Payment Under Verification': ['Payment Verified', 'Payment Submitted'],
  'Payment Verified': ['For Approval'],
  'For Approval': ['Approved', 'Revision Required', 'Rejected'],
  Approved: ['Permit Generated'],
  'Permit Generated': ['Ready for Release'],
  'Ready for Release': ['Released'],
  Released: ['Completed'],
  Completed: [],
  Rejected: [],
  Cancelled: [],
  Expired: [],
};

export function canTransition(
  from: ApplicationLifecycleStatus,
  to: ApplicationLifecycleStatus,
): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

// Explicit mapping to mobile's coarser 7-value ApplicationStatus, so the
// two apps' vocabularies are documented as the same record viewed at two
// levels of detail rather than silently redefined.
export const LIFECYCLE_TO_MOBILE_LABEL: Record<ApplicationLifecycleStatus, string> = {
  Draft: 'Draft',
  Submitted: 'Submitted',
  Received: 'Submitted',
  'Document Verification': 'Under Review',
  'Under Evaluation': 'Under Review',
  'Revision Required': 'Under Review',
  Assessed: 'Payment Verification',
  'Payment Submitted': 'Payment Verification',
  'Payment Under Verification': 'Payment Verification',
  'Payment Verified': 'Payment Verification',
  'For Approval': 'Payment Verification',
  Approved: 'Approved',
  'Permit Generated': 'Approved',
  'Ready for Release': 'Ready for Release',
  Released: 'Ready for Release',
  Completed: 'Ready for Release',
  Rejected: 'Rejected',
  Cancelled: 'Rejected',
  Expired: 'Rejected',
};

// Coarse 3-value projection several existing table/board/stat-card
// surfaces already render (e.g. the Business Stages board's three
// columns). Derived — never stored independently — so it can't drift from
// `lifecycleStatus`.
export type CoarseStatus = 'Approved' | 'Under Review' | 'Rejected';

export function coarseStatus(status: ApplicationLifecycleStatus): CoarseStatus {
  if (
    status === 'Approved' ||
    status === 'Permit Generated' ||
    status === 'Ready for Release' ||
    status === 'Released' ||
    status === 'Completed'
  ) {
    return 'Approved';
  }
  if (status === 'Rejected' || status === 'Cancelled' || status === 'Expired') {
    return 'Rejected';
  }
  return 'Under Review';
}

// Internal evaluation stages the web admin's review pipeline uses —
// unchanged from the app's existing evaluation-card ordering.
export type EvaluationStage = 'Initial' | 'Zoning' | 'Fire Safety' | 'OBO' | 'Final Approval';
export const EVALUATION_STAGE_ORDER: EvaluationStage[] = [
  'Initial',
  'Zoning',
  'Fire Safety',
  'OBO',
  'Final Approval',
];

export type EvaluationResult = 'Pending' | 'Passed' | 'Revision Required' | 'Rejected';

// Mirrors PaymentAssessmentStatus in
// ebpco-mobile/lib/core/models/payment_assessment_model.dart, extended
// with 'Partially Paid' — the versioned Assessment/PaymentTransaction
// model (see assessment.model.ts) supports genuine partial payment of a
// staged/legally-prescribed charge, which mobile's coarser 4-value status
// has no room to represent; every consumer of this type must handle it
// explicitly rather than falling through a default case.
export type PaymentStatus =
  'Not Yet Available' | 'Pending Verification' | 'Partially Paid' | 'Paid' | 'Overdue';

export type PermitReleaseStatus = 'Not Ready' | 'Ready for Release' | 'Released';
