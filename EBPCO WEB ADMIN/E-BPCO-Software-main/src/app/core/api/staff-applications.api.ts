import { Injectable, inject } from '@angular/core';

import { ApiClient } from './api.client';
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
}

interface QueuePage {
  readonly items: readonly QueueRow[];
  readonly nextCursor: string | null;
}

/** Absent, not empty. A blank cell reads as "none"; this reads as "not sent". */
export const NOT_SENT = '—';

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
  });
}
