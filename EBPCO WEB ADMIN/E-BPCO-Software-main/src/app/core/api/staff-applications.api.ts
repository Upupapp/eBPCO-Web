import { Injectable, inject } from '@angular/core';

import { ApiClient } from './api.client';
import { ApplicationRecord, withProjectedFields } from '../domain/application.model';
import { ApplicationLifecycleStatus, PermitReleaseStatus } from '../domain/status.model';
import { PermitType, ApplicationAction } from '../domain/permit.model';

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

function toRecord(row: QueueRow): ApplicationRecord {
  const submitted = row.submittedAt === null ? null : new Date(row.submittedAt);
  const lifecycleStatus = row.lifecycleStatus as ApplicationLifecycleStatus;
  return withProjectedFields({
    id: row.id,
    referenceNumber: row.referenceNumber,
    businessId: '',
    businessName: row.businessName ?? NOT_SENT,
    applicantId: '',
    applicant: row.applicantName,
    location: row.location ?? NOT_SENT,
    permitType: row.permitType as PermitType,
    applicationAction: row.applicationAction as ApplicationAction,
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
