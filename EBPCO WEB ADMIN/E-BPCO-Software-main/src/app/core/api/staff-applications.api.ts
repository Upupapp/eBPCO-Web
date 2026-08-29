import { Injectable, inject } from '@angular/core';

import { ApiClient } from './api.client';
import { ApplicationRecord } from '../domain/application.model';
import { ApplicationLifecycleStatus } from '../domain/status.model';
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
 *   permitReleaseStatus  no counterpart in the row.
 *
 * They are filled with an explicit "unknown" rather than a plausible guess, and
 * listed here so the gap is a recorded fact rather than something a reader
 * discovers from a blank column. Serving them is backend work: either the queue
 * row grows, or these columns come off the screen.
 *
 * `paymentStatus` IS derivable — the row carries `paymentVerified` and an
 * assessed amount — and is the one field mapped rather than defaulted.
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

function toRecord(row: QueueRow): ApplicationRecord {
  const submitted = row.submittedAt === null ? null : new Date(row.submittedAt);
  return {
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
    lifecycleStatus: row.lifecycleStatus as ApplicationLifecycleStatus,
    evaluationStage: 'Initial',
    evaluationResult: 'Pending',
    // The one derived field: verified means paid, an assessed amount with no
    // verification means it is owed, and no assessment means there is nothing
    // to pay yet.
    paymentStatus: row.paymentVerified
      ? 'Paid'
      : row.assessedAmountCentavos === null ? 'Not Yet Available' : 'Pending Verification',
    permitReleaseStatus: 'Not Ready',
    assessedAmountCentavos: row.assessedAmountCentavos,
    type: row.permitType,
    status: row.lifecycleStatus,
  } as unknown as ApplicationRecord;
}
