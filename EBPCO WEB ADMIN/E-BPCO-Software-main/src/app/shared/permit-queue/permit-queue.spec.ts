import { TestBed } from '@angular/core/testing';
import { ApplicationStore } from '../../core/domain/application-store';
import { ALL_PERMIT_TYPES } from '../../core/domain/permit.model';
import { buildPermitQueueRows } from './permit-queue';

// Cross-module count consistency: the permit-queue chart (Dashboard) must
// never show a total that disagrees with the shared ApplicationStore that
// every other module (Applications, Business Stages, Evaluations,
// Payments, Permit Release) reads from.
describe('buildPermitQueueRows — cross-module count consistency', () => {
  let store: ApplicationStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ApplicationStore] });
    store = TestBed.inject(ApplicationStore);
  });

  it('has exactly one row per centralized permit type, in the same order', () => {
    const rows = buildPermitQueueRows(store.applications());
    expect(rows.map((r) => r.label)).toEqual(ALL_PERMIT_TYPES);
  });

  it("every row's total equals the real count of applications with that permit type", () => {
    const apps = store.applications();
    const rows = buildPermitQueueRows(apps);
    for (const row of rows) {
      const real = apps.filter((a) => a.permitType === row.label).length;
      expect(row.total).toBe(real);
    }
  });

  it("the sum of every row's total equals the store's own total application count", () => {
    const apps = store.applications();
    const rows = buildPermitQueueRows(apps);
    const sum = rows.reduce((acc, r) => acc + r.total, 0);
    expect(sum).toBe(store.totalApplications());
  });

  it("each row's three segments (Under Review/Approved/Rejected) sum to that row's own total", () => {
    const rows = buildPermitQueueRows(store.applications());
    for (const row of rows) {
      const segmentSum = row.segments.reduce((acc, s) => acc + s.value, 0);
      expect(segmentSum).toBe(row.total);
    }
  });

  it('reacts to a newly created application immediately — the new row total goes up by exactly one', () => {
    const before = buildPermitQueueRows(store.applications()).find(
      (r) => r.label === 'Fencing Permit',
    )!.total;
    store.create(
      {
        businessId: 'TEST-BIZ',
        businessName: 'Test Business',
        applicantId: 'TEST-APL',
        applicant: 'Test Applicant',
        location: 'Barangay Poblacion',
        permitType: 'Fencing Permit',
        applicationAction: 'New',
        officer: 'Test Officer',
        dateSubmitted: '01 Jan 2026',
        lifecycleStatus: 'Submitted',
        evaluationStage: 'Initial',
        evaluationResult: 'Pending',
        paymentStatus: 'Not Yet Available',
        permitReleaseStatus: 'Not Ready',
        assessedAmountCentavos: null,
      },
      'Tester',
      'Administrator',
    );
    const after = buildPermitQueueRows(store.applications()).find(
      (r) => r.label === 'Fencing Permit',
    )!.total;
    expect(after).toBe(before + 1);
  });
});
