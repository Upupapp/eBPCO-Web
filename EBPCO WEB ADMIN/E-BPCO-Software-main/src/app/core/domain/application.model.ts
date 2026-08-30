import {
  ApplicationLifecycleStatus,
  CoarseStatus,
  EvaluationResult,
  EvaluationStage,
  PaymentStatus,
  PermitReleaseStatus,
  coarseStatus,
} from './status.model';
import { ApplicationAction, PermitType } from './permit.model';

// Re-exported so existing imports of `AppStatus`/`ApplicationRecord` from
// this file keep working through the migration.
export type { CoarseStatus as AppStatus };

// The single shared shape for "an application record" — every surface
// that lists or opens an application reads/writes through ApplicationStore
// against this one type, so a status change made in one place (e.g. the
// Business Stages board) is immediately visible everywhere else that shows
// the same application ID. `businessName` and `applicant` are always kept
// as two separate fields — one applicant can own several businesses, and a
// business's registered name is never assumed to equal its owner's name.
export interface ApplicationRecord {
  id: string;
  /**
   * The permit reference an applicant and an officer actually quote — the
   * number that ends up printed on the permit, e.g. `BP-2026-0001`.
   *
   * Optional because the seed does not carry one and twenty-odd files build
   * records; required would break every one of them. The queue endpoint DOES
   * send it, and the mapper always did — but this interface never declared it,
   * so no template could bind it and the value was mapped and then discarded.
   * `id` stays the identity used by routes, selection and aria labels.
   */
  referenceNumber?: string;
  businessId: string;
  businessName: string;
  applicantId: string;
  applicant: string;
  location: string;
  permitType: PermitType;
  applicationAction: ApplicationAction;
  officer: string;
  dateSubmitted: string;
  /** Same moment as dateSubmitted, kept as a real Date for sorting/range filtering. */
  dateValue: Date;
  lifecycleStatus: ApplicationLifecycleStatus;
  /**
   * Where this application sits in its evaluation sequence, or `null` when the
   * portal does not know.
   *
   * The staff queue does not send it, and the mapper used to stamp every server
   * row `'Initial'` — so `buildEvalTypeCards` counted them all under Initial
   * Evaluation and `scopedApps` never placed one in a later stage's queue. An
   * officer opening Final Approval saw it empty with applications sitting in it.
   *
   * Nullable rather than widened with an 'Unknown' member, because "unknown" is
   * not a stage an application can be AT — it is the absence of the fact. Rows
   * with null are surfaced in their own "Stage not recorded" bucket (owner
   * ruling, 29 Aug) rather than hidden or claimed.
   */
  evaluationStage: EvaluationStage | null;
  evaluationResult: EvaluationResult | null;
  paymentStatus: PaymentStatus;
  permitReleaseStatus: PermitReleaseStatus;
  assessedAmountCentavos: number | null;
  /**
   * Migration-bridge fields: several existing table/detail templates bind
   * `row.type`/`row.status` directly. Rather than touching every template
   * in one pass, these two are kept as denormalized projections —
   * `type` mirrors `permitType`, `status` mirrors `coarseStatus(lifecycleStatus)`
   * — and are set by the SAME store mutation that sets the field they
   * project from, so they can never independently drift.
   */
  type: string;
  status: CoarseStatus;
}

/** Builds the two migration-bridge fields from the rest of a record — used by the store on every create/update so `type`/`status` never drift. */
export function withProjectedFields<T extends Omit<ApplicationRecord, 'type' | 'status'>>(
  record: T,
): T & { type: string; status: CoarseStatus } {
  return { ...record, type: record.permitType, status: coarseStatus(record.lifecycleStatus) };
}

/** Bare barangay name (e.g. "Poblacion") from a record's `location` display string (e.g. "Barangay Poblacion") — the one place that mapping happens, so the Business Stages board's Barangay filter and the intake form's location field never diverge on how they derive it. */
export function barangayOf(app: Pick<ApplicationRecord, 'location'>): string {
  return app.location.replace(/^Barangay\s+/i, '').trim();
}
