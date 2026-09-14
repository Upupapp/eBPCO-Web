import { Injectable, inject } from '@angular/core';

import { ApiClient } from './api.client';
import { ApiError } from './problem';
import { ApplicationRecord, withProjectedFields } from '../domain/application.model';
import {
  ApplicationLifecycleStatus,
  PermitReleaseStatus,
  isValidLifecycleStatus,
} from '../domain/status.model';
import {
  ApplicationAction,
  PermitType,
  isValidApplicationAction,
  isValidPermitType,
} from '../domain/permit.model';

/**
 * The staff queue, from the server.
 *
 * ── What the server sends, and what this screen renders ─────────────────
 *
 * These are not the same list, and the difference is the first field-level
 * measurement this portal has ever had. `QueueRow` carries the application, its
 * status, its applicant and business names, its location and its assessed
 * amount. `ApplicationRecord` additionally expects:
 *
 *   businessId           the row has the NAME but not the id; the detail
 *                        endpoint has it. Rendering a link from a name would
 *                        be wrong the moment two businesses share one.
 *   officer              no counterpart at all. Nothing in the API assigns an
 *                        application to a named officer.
 *   evaluationStage      the detail endpoint carries evaluations; the queue
 *   evaluationResult     row does not.
 *
 * Where the type allows it these are filled with an explicit "unknown" (NOT_SENT)
 * rather than a plausible guess, and listed here so the gap is a recorded fact
 * rather than something a reader discovers from a blank column. `evaluationStage`
 * and `evaluationResult` are closed unions with no "unknown" member, so they
 * still take their first-step defaults — that IS a guess, and the honest fix is
 * a widened type or a queue row that carries them. Serving them is backend work:
 * either the queue row grows, or these columns come off the screen.
 *
 * Three fields ARE derivable and are derived rather than defaulted:
 *
 *   paymentStatus        the row carries `paymentVerified` and an assessed amount.
 *   permitReleaseStatus  follows from `lifecycleStatus`. Hardcoding 'Not Ready'
 *                        made every server row invisible to the Permit Release
 *                        Queue, which filters on `permitReleaseStatus !== 'Not
 *                        Ready'` — the same defect ApplicationStore had already
 *                        found and fixed on its own write path.
 *   type / status        via `withProjectedFields`, the one place those two
 *                        migration-bridge fields are built. Writing them by hand
 *                        here set `status` to the raw lifecycleStatus instead of
 *                        the 3-value CoarseStatus, so server rows matched none of
 *                        the 'Approved'/'Under Review'/'Rejected' buckets and the
 *                        dashboard counters silently under-counted them. An
 *                        `as unknown as` cast was hiding the mismatch.
 */

interface QueueRow {
  readonly id: string;
  readonly referenceNumber: string;
  readonly permitType: string;
  /**
   * The PUBLISHED name, which the service is adding alongside `permitType`.
   * Optional until it lands; preferred the moment it does, with no further
   * change here.
   */
  readonly permitTypeName?: string | null;
  readonly applicationAction: string;
  readonly lifecycleStatus: string;
  readonly businessName: string | null;
  readonly applicantName: string;
  readonly location: string | null;
  readonly submittedAt: string | null;
  readonly assessedAmountCentavos: number | null;
  readonly paymentVerified: boolean;
  /** Optimistic-concurrency token — threaded back as `expectedVersion` on a transition so a stale edit is refused rather than silently overwriting a decision made elsewhere in the meantime. */
  readonly version?: number;
}

interface QueuePage {
  readonly items: readonly QueueRow[];
  readonly nextCursor: string | null;
}

/** One row of the `payments` array on `GET /staff/applications/:id` — every payment ever submitted against this application, any status, in submission order. Distinct from `StaffPaymentsApi.PaymentQueueRow`, which is the cashier's global Pending-Verification-first worklist, not scoped to one application. */
export interface ApplicationPaymentRow {
  readonly id: string;
  readonly referenceNumber: string;
  readonly amountCentavos: number;
  readonly method: string;
  readonly status: string;
  readonly submittedAt: string;
  readonly verifiedAt: string | null;
  readonly officialReceiptNumber: string | null;
}

/** The most recent non-superseded Order of Payment, or `null` before one is issued. Never an in-progress Draft/Submitted/Approved assessment — see `StaffPaymentsApi.getAssessment`'s own doc comment for why that has no per-application lookup at all. */
export interface ApplicationOrderOfPayment {
  readonly id: string;
  readonly number: string;
  readonly totalCentavos: number;
  readonly filingCentavos: number;
  readonly processingCentavos: number;
  readonly architecturalCentavos: number;
  readonly structuralCentavos: number;
  readonly electricalCentavos: number;
  readonly othersCentavos: number;
  readonly feeScheduleVersion: string;
  readonly assessedAt: string;
  readonly dueDate: string | null;
}

/** One row of the `timeline` array on `GET /staff/applications/:id` — the record's own transition history, written by the database trigger on every committed transition (never the security/audit log, which also records refused attempts). */
export interface ApplicationTimelineEvent {
  readonly fromStatus: string | null;
  readonly toStatus: string;
  readonly occurredAt: string;
  readonly office: string | null;
  readonly remarks: string | null;
}

export interface ApplicationDetail {
  readonly payments: readonly ApplicationPaymentRow[];
  readonly orderOfPayment: ApplicationOrderOfPayment | null;
  /** The applicant's real email, from their account — never fabricated from the display name. */
  readonly applicantEmail: string;
  /** The applicant's real mobile number, from their account, or `null` when the account has none on file. */
  readonly applicantMobile: string | null;
  readonly timeline: readonly ApplicationTimelineEvent[];
}

export type ApplicationDetailResult =
  | { readonly kind: 'ok'; readonly detail: ApplicationDetail }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

/** Absent, not empty. A blank cell reads as "none"; this reads as "not sent". */
export const NOT_SENT = '—';

/** `POST /staff/applications` — the assisted/onsite filing an officer submits on an applicant's behalf. */
export interface FileOnBehalfInput {
  applicant: {
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber?: string;
  };
  /** Give exactly one of `business`/`businessId` — a new business, or an existing one this same applicant already owns. */
  business?: {
    name: string;
    category: string;
    street: string;
    barangay: string;
    city: string;
    province: string;
    registrationNumber: string;
    /** `YYYY-MM-DD` */
    dateRegistered: string;
  };
  businessId?: string;
  permitType: string;
  applicationAction: ApplicationAction;
  renewsPermitNumber?: string | null;
  location?: string;
}

export type FileOnBehalfResult =
  | { readonly kind: 'done'; readonly applicationId: string; readonly referenceNumber: string; readonly applicantId: string }
  | { readonly kind: 'refused'; readonly message: string }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

/**
 * Every distinct reason `POST /staff/applications/:id/transitions` refuses,
 * kept apart rather than flattened into one message — `stale-version` means
 * "reload and look again", `precondition-unmet` means "something is still
 * missing", and the two call for different next actions from whoever reads
 * them.
 */
export type TransitionRefusalReason =
  | 'not-permitted'
  | 'illegal-transition'
  | 'precondition-unmet'
  | 'stale-version'
  | 'not-found'
  | 'other';

export type TransitionResult =
  | { readonly kind: 'done'; readonly status: string; readonly version: number }
  | { readonly kind: 'refused'; readonly reason: TransitionRefusalReason; readonly message: string }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

export type ArchiveResult =
  | { readonly kind: 'done' }
  | { readonly kind: 'refused'; readonly message: string }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly message: string };

@Injectable({ providedIn: 'root' })
export class StaffApplicationsApi {
  private readonly api = inject(ApiClient);

  async page(options: { limit?: number; cursor?: string; status?: string } = {}): Promise<{
    rows: ApplicationRecord[];
    nextCursor: string | null;
  }> {
    const page = await this.api.get<QueuePage>('/staff/applications', {
      limit: options.limit ?? 50,
      cursor: options.cursor,
      status: options.status,
    });
    return { rows: page.items.map(toRecord), nextCursor: page.nextCursor };
  }

  /**
   * `GET /staff/applications/:id` — the one place an issued Order of Payment
   * and every payment ever submitted against this application can be read.
   * The queue row (`page()` above) carries neither: `orderOfPayment` is
   * `null` until an Order has actually been issued, and holds only the
   * issued snapshot — not an in-progress Draft/Submitted/Approved assessment,
   * which has no per-application lookup at all (see `StaffPaymentsApi`'s own
   * doc comment on `getAssessment`).
   */
  async detail(applicationId: string): Promise<ApplicationDetailResult> {
    try {
      const detail = await this.api.get<ApplicationDetail>(
        `/staff/applications/${encodeURIComponent(applicationId)}`,
      );
      return { kind: 'ok', detail };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404 || error.status === 501) return { kind: 'unavailable' };
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }

  /**
   * `POST /staff/applications` — files a new application for someone who
   * came in at the counter/by phone rather than through their own account.
   * The server creates the applicant's account too (with an unusable
   * password — they set one later through account recovery).
   */
  async fileOnBehalf(input: FileOnBehalfInput): Promise<FileOnBehalfResult> {
    try {
      const result = await this.api.post<{
        applicationId: string;
        referenceNumber: string;
        applicantId: string;
      }>('/staff/applications', input, crypto.randomUUID());
      return { kind: 'done', ...result };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404 || error.status === 501) return { kind: 'unavailable' };
        // 409 = the Idempotency-Key collided with a different request; 422 =
        // the server's own SubmissionService refused the filing itself
        // (e.g. staff filing under their own address, a business that isn't
        // this applicant's). Both are answers this screen can act on.
        if (error.status === 409 || error.status === 422) {
          return { kind: 'refused', message: error.message };
        }
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }

  /**
   * `POST /staff/applications/:id/transitions` — the one real place an
   * application's lifecycle status moves. `expectedVersion` is the row's own
   * `version` (see `QueueRow`/`ApplicationRecord`) — omit it and the server
   * accepts any current state; send it and a `stale-version` refusal comes
   * back if somebody else changed the row first.
   */
  async transition(
    applicationId: string,
    to: ApplicationLifecycleStatus,
    options: { expectedVersion?: number; remarks?: string } = {},
  ): Promise<TransitionResult> {
    try {
      const result = await this.api.post<{ status: string; version: number }>(
        `/staff/applications/${encodeURIComponent(applicationId)}/transitions`,
        {
          to,
          ...(options.expectedVersion === undefined ? {} : { expectedVersion: options.expectedVersion }),
          ...(options.remarks === undefined ? {} : { remarks: options.remarks }),
        },
        crypto.randomUUID(),
      );
      return { kind: 'done', ...result };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 501) return { kind: 'unavailable' };
        // The visibility check answers a not-found/not-yours application
        // with the same 404 a genuinely missing one gets — either way,
        // there is nothing this screen can act on but tell the caller so.
        if (error.status === 404) return { kind: 'refused', reason: 'not-found', message: error.message };
        if (error.status === 403) return { kind: 'refused', reason: 'not-permitted', message: error.message };
        if (error.status === 409) return { kind: 'refused', reason: 'illegal-transition', message: error.message };
        if (error.status === 422) return { kind: 'refused', reason: 'precondition-unmet', message: error.message };
        if (error.status === 412) return { kind: 'refused', reason: 'stale-version', message: error.message };
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }

  /**
   * `POST /staff/applications/archive` — moves one or more applications to
   * Cancelled. There is no delete on a filed application anywhere in this
   * system (see `ApplicationStore`'s own note); this is the only way one
   * leaves the active queue.
   */
  async archive(applicationIds: readonly string[], remarks: string): Promise<ArchiveResult> {
    try {
      await this.api.post<{ archived: unknown }>(
        '/staff/applications/archive',
        { applicationIds: [...applicationIds], remarks },
        crypto.randomUUID(),
      );
      return { kind: 'done' };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 501) return { kind: 'unavailable' };
        if (error.status === 404 || error.status === 422) {
          return { kind: 'refused', message: error.message };
        }
        return { kind: 'failed', message: error.message };
      }
      throw error;
    }
  }
}

/**
 * The queue row has no release field, but `lifecycleStatus` already implies it —
 * and leaving every row at 'Not Ready' hid all server data from the release
 * queue. Mirrors ApplicationStore's own rule so the two paths cannot disagree.
 */
function releaseStatusFor(status: ApplicationLifecycleStatus): PermitReleaseStatus {
  if (status === 'Released' || status === 'Completed') return 'Released';
  if (status === 'Ready for Release') return 'Ready for Release';
  return 'Not Ready';
}

/**
 * The permit type as a name this portal's vocabulary contains — or `null`.
 *
 * **The wire and this union speak different vocabularies.** The service keys its
 * records on 17 short internal names (`'New Construction'`, `'Civil/Structural'`,
 * `'Fencing'`); `PermitType` holds the 19 published names a citizen reads
 * (`'Building Permit – New Construction'`, `'Civil / Structural Permit'`,
 * `'Fencing Permit'`). They are two vocabularies on purpose, not a mismatch to
 * repair here.
 *
 * This used to be `row.permitType as PermitType`. The cast silenced the
 * compiler and put an internal key into a typed field, where
 * `REQUIREMENTS_CATALOG[permitType]` returns `undefined` and its callers
 * dereference it — **a TypeError on real data**, not merely a silent miss.
 *
 * No mapping is done here on purpose. Translating internal keys to published
 * names would put a third copy of a vocabulary that already exists in the
 * service, and it cannot be done honestly anyway: two internal keys have no
 * agreed published name. The service is adding `permitTypeName`; this prefers
 * it the moment it arrives.
 */
function publishedPermitType(row: QueueRow): PermitType | null {
  const published = row.permitTypeName;
  if (typeof published === 'string' && isValidPermitType(published)) return published;
  // A row that already speaks the published vocabulary (seeded or legacy).
  if (isValidPermitType(row.permitType)) return row.permitType;
  return null;
}

function toRecord(row: QueueRow): ApplicationRecord {
  const submitted = row.submittedAt === null ? null : new Date(row.submittedAt);
  // The last cast at this boundary, replaced by a check rather than a nullable
  // field — and the difference from `permitType` is deliberate.
  //
  // There the two ends genuinely disagree (internal keys vs published names), so
  // an unnameable permit is a NORMAL state a row can be in, and the record
  // carries `null` for it. Here the vocabularies MATCH: the service's own
  // `LIFECYCLE_STATUSES` is these same 19 names in this order. An unrecognised
  // status is therefore not a normal state — it means this portal is older than
  // the service, and every row of that status is affected, not one.
  //
  // So it fails the load with a precise message instead of threading `null`
  // through sixteen call sites and a template that lowercases the projection.
  // Coercing was the third option and the worst: `coarseStatus` falls through
  // to 'Under Review', so a status this portal had never heard of would be
  // displayed as a confident claim about where the application stands.
  if (!isValidLifecycleStatus(row.lifecycleStatus)) {
    throw new Error(
      `The server sent an application status this portal does not recognise: `
        + `"${row.lifecycleStatus}". The portal is likely older than the service.`,
    );
  }
  const lifecycleStatus = row.lifecycleStatus;
  return withProjectedFields({
    id: row.id,
    referenceNumber: row.referenceNumber,
    businessId: '',
    businessName: row.businessName ?? NOT_SENT,
    applicantId: '',
    applicant: row.applicantName,
    location: row.location ?? NOT_SENT,
    permitType: publishedPermitType(row),
    // What the server called it, verbatim — including `Business Permit`, a
    // twentieth value the office does not publish and the legacy flow still
    // files against. `permitType` is null for it; this is not, so the portal
    // can say what was filed instead of "Not recorded" (2 Sep).
    filedAs: row.permitTypeName ?? row.permitType,
    applicationAction: isValidApplicationAction(row.applicationAction)
      ? row.applicationAction
      : null,
    officer: NOT_SENT,
    dateSubmitted: submitted === null ? NOT_SENT : submitted.toISOString().slice(0, 10),
    dateValue: submitted ?? new Date(0),
    lifecycleStatus,
    // The queue row carries neither. `null` says so; 'Initial' claimed a stage
    // this portal has no basis for, and put every server row in the wrong queue.
    evaluationStage: null,
    evaluationResult: null,
    // Verified means paid, an assessed amount with no verification means it is
    // owed, and no assessment means there is nothing to pay yet.
    paymentStatus: (row.paymentVerified
      ? 'Paid'
      : row.assessedAmountCentavos === null
        ? 'Not Yet Available'
        : 'Pending Verification') as ApplicationRecord['paymentStatus'],
    permitReleaseStatus: releaseStatusFor(lifecycleStatus),
    assessedAmountCentavos: row.assessedAmountCentavos,
    version: row.version,
  });
}
