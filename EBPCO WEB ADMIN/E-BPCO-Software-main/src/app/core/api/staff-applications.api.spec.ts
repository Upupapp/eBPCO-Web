import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { NOT_SENT, StaffApplicationsApi } from './staff-applications.api';

/**
 * What the queue mapping actually produces.
 *
 * This is the only path by which real server data reaches the portal, and until
 * now nothing tested it — 308 tests passed while every server row carried a
 * `status` the rest of the app could not match and a `permitReleaseStatus` that
 * hid it from the release queue. A suite that never exercises the mapper proves
 * what the pages do with a record, never whether the record is right.
 *
 * Every assertion below fails against the mapper as it was written.
 */
describe('StaffApplicationsApi', () => {
  let api: StaffApplicationsApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), StaffApplicationsApi],
    });
    api = TestBed.inject(StaffApplicationsApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  /** A queue row with every field the server actually sends. */
  const row = (over: Record<string, unknown> = {}) => ({
    id: 'APP-1',
    referenceNumber: 'BP-2026-0001',
    permitType: 'Building Permit',
    applicationAction: 'New',
    lifecycleStatus: 'Submitted',
    businessName: 'Villanueva Hardware',
    applicantName: 'Raul Villanueva',
    location: 'Barangay Poblacion',
    submittedAt: '2026-08-01T00:00:00.000Z',
    assessedAmountCentavos: null,
    paymentVerified: false,
    ...over,
  });

  const fetchOne = async (over: Record<string, unknown> = {}) => {
    const pending = api.page({ limit: 10 });
    const req = http.expectOne((r) => r.url === '/staff/applications');
    expect(req.request.method).toBe('GET');
    req.flush({ items: [row(over)], nextCursor: null });
    const { rows } = await pending;
    return rows[0];
  };

  it('projects status to the 3-value CoarseStatus, not the raw lifecycle status', async () => {
    // The dashboard counters and the status filter bucket on
    // 'Approved' | 'Under Review' | 'Rejected'. A row carrying its lifecycle
    // status here matches none of them and is silently uncounted.
    const submitted = await fetchOne({ lifecycleStatus: 'Submitted' });
    expect(submitted.status).toBe('Under Review');

    const ready = await fetchOne({ lifecycleStatus: 'Ready for Release' });
    expect(ready.status).toBe('Approved');

    const cancelled = await fetchOne({ lifecycleStatus: 'Cancelled' });
    expect(cancelled.status).toBe('Rejected');
  });

  it('derives permitReleaseStatus so the release queue can see server rows', async () => {
    // The Permit Release Queue filters on `permitReleaseStatus !== 'Not Ready'`.
    // Defaulting every row to 'Not Ready' made it permanently empty of real data.
    expect((await fetchOne({ lifecycleStatus: 'Ready for Release' })).permitReleaseStatus)
      .toBe('Ready for Release');
    expect((await fetchOne({ lifecycleStatus: 'Released' })).permitReleaseStatus).toBe('Released');
    expect((await fetchOne({ lifecycleStatus: 'Completed' })).permitReleaseStatus).toBe('Released');
    expect((await fetchOne({ lifecycleStatus: 'Submitted' })).permitReleaseStatus).toBe('Not Ready');
  });

  it('keeps the permit reference the server sends', async () => {
    // Mapped all along, but ApplicationRecord did not declare it, so no
    // template could bind it and the value was discarded on arrival.
    const record = await fetchOne({ referenceNumber: 'BP-2026-0042' });
    expect(record.referenceNumber).toBe('BP-2026-0042');
  });

  it('says the evaluation stage is unknown rather than guessing Initial', async () => {
    // The queue sends neither. Stamping 'Initial' counted every server row under
    // Initial Evaluation and kept it out of every later queue.
    const record = await fetchOne();
    expect(record.evaluationStage).toBeNull();
    expect(record.evaluationResult).toBeNull();
  });

  it('mirrors type from permitType', async () => {
    expect((await fetchOne({ permitType: 'Electrical Permit' })).type).toBe('Electrical Permit');
  });

  it('derives paymentStatus from the two fields the row does carry', async () => {
    expect((await fetchOne({ paymentVerified: true })).paymentStatus).toBe('Paid');
    expect((await fetchOne({ assessedAmountCentavos: null })).paymentStatus)
      .toBe('Not Yet Available');
    expect((await fetchOne({ assessedAmountCentavos: 50_000 })).paymentStatus)
      .toBe('Pending Verification');
  });

  it('marks absent fields as not-sent rather than blank', async () => {
    // A blank cell reads as "none"; these are "the server did not send it".
    const record = await fetchOne({ businessName: null, location: null });
    expect(record.businessName).toBe(NOT_SENT);
    expect(record.location).toBe(NOT_SENT);
    expect(record.officer).toBe(NOT_SENT);
  });

  it('keeps a missing submission date out of the sort order rather than dating it today', async () => {
    const record = await fetchOne({ submittedAt: null });
    expect(record.dateSubmitted).toBe(NOT_SENT);
    expect(record.dateValue.getTime()).toBe(0);
  });
});
