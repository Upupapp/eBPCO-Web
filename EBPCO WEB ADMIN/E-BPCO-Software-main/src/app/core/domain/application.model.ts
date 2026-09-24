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
  /** From the server's queue row: whether the applicant's account has a profile photo. Undefined on local-demo rows. */
  applicantHasPhoto?: boolean;
  location: string;
  /**
   * The PUBLISHED permit name, or `null` when the portal cannot name it.
   *
   * The wire speaks a different vocabulary: the service keys records on short
   * internal names ('Civil/Structural'), while this union holds the published
   * names a citizen reads ('Civil / Structural Permit'). The mapper
   * used to cast one into the other, which put a value the union does not
   * contain into this field — and `REQUIREMENTS_CATALOG[permitType]` then
   * returns `undefined` for it, which its callers dereference. A TypeError on
   * real data, not a silent miss.
   *
   * Nullable so an unnameable row is visibly unnamed rather than mislabelled.
   */
  permitType: PermitType | null;
  applicationAction: ApplicationAction | null;
  officer: string;
  dateSubmitted: string;
  /** Same moment as dateSubmitted, kept as a real Date for sorting/range filtering. */
  dateValue: Date;
  /**
   * When this application last reached Released, Completed, or Rejected — the
   * server's own `completed_at` (`staff-queue.service.ts`), sourced from the
   * real `application_transitions` audit log, not a client-side guess.
   *
   * Optional, not `| null`, because most places that build an `ApplicationRecord`
   * (seed data, other tests) have no basis to say either way — `undefined`
   * means "not known here," while `null` from a real queue row means "the
   * server looked and this application genuinely hasn't reached one of those
   * statuses yet." A caller measuring elapsed processing time treats both the
   * same way: no completion to measure against.
   */
  completedAt?: Date | null;
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
  /**
   * The permit number a Renewal/Amendment names, when it resolved to a real
   * permit eBPCO itself issued — `null` for a New application and also
   * `null` on the unverified path (see `priorPermitClaim`). Absent from an
   * older server; the queue never carried this at all until 053.
   */
  renewsPermitNumber?: string | null;
  /**
   * The permit number a Renewal/Amendment names, self-reported by the
   * applicant, when it predates eBPCO and so has no record to link instead.
   * NEVER verified by the system — a claim for staff to judge from the
   * attached `prior-permit-proof` document, not a confirmed fact. Mutually
   * exclusive with `renewsPermitNumber`.
   */
  priorPermitClaim?: string | null;
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
  /** Mirrors `permitType`, so it is `null` for the same reason: the portal could not name the permit. */
  type: string | null;
  /**
   * What the server said was filed, verbatim — including a value this office
   * does not publish.
   *
   * NOT a duplicate of `permitType`. They answer different questions:
   * `permitType` is *"is this one of the office's own published types?"* and
   * is null when it is not; `filedAs` is *"what did the server call it?"*
   * and is null only when the server said nothing.
   *
   * `Business Permit` is the case that forced this. It is one extra value on
   * the wire, the legacy flow still files against it, and the owner's ruling is
   * that the office's published names stand — so it cannot join
   * `PermitType` without contradicting the ruling, and the full list is
   * asserted in `permit.model.spec.ts` and used by the cross-repo parity gate.
   *
   * Until 2 Sep such rows rendered **"Not recorded"**, which was false: the type
   * was recorded, the portal simply did not publish that name.
   */
  filedAs: string | null;
  status: CoarseStatus;
  /**
   * Optimistic-concurrency token from `GET /staff/applications`, threaded
   * back as `expectedVersion` on a transition so a stale edit is refused
   * rather than silently overwriting a decision made elsewhere in the
   * meantime. `undefined` for seed/local-only records, which have no server
   * row to be stale against.
   */
  version?: number;
}

/** Builds the two migration-bridge fields from the rest of a record — used by the store on every create/update so `type`/`status` never drift. */
export function withProjectedFields<
  T extends Omit<ApplicationRecord, 'type' | 'status' | 'filedAs'> & { filedAs?: string | null },
>(record: T): T & { type: string | null; status: CoarseStatus; filedAs: string | null } {
  return {
    ...record,
    type: record.permitType,
    // Defaults to the published name when the caller did not say otherwise, so
    // seeded records and older callers are unaffected.
    filedAs: record.filedAs ?? record.permitType,
    status: coarseStatus(record.lifecycleStatus),
  };
}

/**
 * Bare barangay name (e.g. "Poblacion") from a record's `location` display
 * string — the one place that mapping happens, so the Business Stages
 * board's Barangay filter and the intake form's location field never
 * diverge on how they derive it.
 *
 * A bare "Barangay Poblacion" string was the only shape this originally
 * handled (prefix-stripped below), with everything else falling back to
 * "whatever comes after the last comma" on the theory that a real street
 * address always ends "..., Barangay". That theory was never actually
 * true of this app's own real intake: `application-intake.ts`'s
 * `buildOnBehalfInput`/`submit` both write
 * `` `${addressLine}, Barangay ${barangay}, Castilla, Sorsogon` `` — FOUR
 * comma segments, with the barangay second and the *last* segment being
 * "Sorsogon", the province. The last-comma fallback was silently
 * extracting "Sorsogon" for every real, staff-encoded application, which
 * matches no option in `CASTILLA_BARANGAYS` — the Business Application
 * Stages board's own Barangay filter, and the Applications detail's
 * barangay column value pasted into it, both always came up empty (found
 * live 2026-09-25). Fixed by finding the literal "Barangay X" marker
 * wherever it falls in the string, not by assuming a fixed segment count.
 */
export function barangayOf(app: Pick<ApplicationRecord, 'location'>): string {
  const raw = app.location.trim();
  const marker = /\bBarangay\s+([^,]+)/i.exec(raw);
  if (marker?.[1]) return marker[1].trim();
  const lastComma = raw.lastIndexOf(',');
  return (lastComma === -1 ? raw : raw.slice(lastComma + 1)).trim();
}
