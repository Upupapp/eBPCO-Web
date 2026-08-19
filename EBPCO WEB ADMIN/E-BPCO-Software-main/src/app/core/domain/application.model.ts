import {
  ApplicationLifecycleStatus,
  CoarseStatus,
  EvaluationResult,
  EvaluationStage,
  PaymentStatus,
  PermitReleaseStatus,
  coarseStatus,
} from './status.model';
import { ApplicationAction, PermitType, ServiceDomain } from './permit.model';

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
  businessId: string;
  businessName: string;
  applicantId: string;
  applicant: string;
  location: string;
  serviceDomain: ServiceDomain;
  permitType: PermitType;
  applicationAction: ApplicationAction;
  officer: string;
  dateSubmitted: string;
  /** Same moment as dateSubmitted, kept as a real Date for sorting/range filtering. */
  dateValue: Date;
  lifecycleStatus: ApplicationLifecycleStatus;
  evaluationStage: EvaluationStage;
  evaluationResult: EvaluationResult;
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
