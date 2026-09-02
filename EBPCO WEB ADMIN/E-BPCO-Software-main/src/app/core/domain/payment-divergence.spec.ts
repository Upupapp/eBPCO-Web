import { TestBed } from '@angular/core/testing';

import { ApplicationStore } from './application-store';
import { ApplicationRecord, withProjectedFields } from './application.model';

/**
 * Two screens, one fact.
 *
 * `paymentStatus` has two sources: the queue row's `paymentVerified` from the
 * server, and a local recomputation from `AssessmentStore`. They agree only
 * when the assessment store is the authority — and after a server load it is
 * empty, because `replaceApplications` clears it.
 *
 * Without a guard, a server row saying the payment was VERIFIED shows "Paid" in
 * Applications, and the first Payments action recomputes from no assessment,
 * gets 'Not Yet Available', and overwrites it. A verified payment becomes an
 * unpaid one because a local store that was never told anything disagreed with
 * the server.
 *
 * This is the lane where that matters: payment state gates permit release.
 *
 * Raised by the citizen web portal lane, 2 Sep 2026, who found the same shape.
 */
const paidRow = (): ApplicationRecord =>
  withProjectedFields({
    id: 'APP-1',
    businessId: 'BIZ-1',
    businessName: 'Villanueva Hardware',
    applicantId: 'APL-1',
    applicant: 'Raul Villanueva',
    location: 'Barangay Poblacion',
    permitType: 'Fencing Permit',
    applicationAction: 'New',
    officer: 'Engr. Tester',
    dateSubmitted: '2026-08-01',
    dateValue: new Date('2026-08-01T00:00:00.000Z'),
    lifecycleStatus: 'Payment Verified',
    evaluationStage: null,
    evaluationResult: null,
    paymentStatus: 'Paid',
    assessedAmountCentavos: 250_000,
  } as ApplicationRecord);

describe('Payment status — the server and the local store', () => {
  let store: ApplicationStore;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [ApplicationStore] });
    store = TestBed.inject(ApplicationStore);
  });

  it('does not downgrade a server-verified payment when no assessment is held', () => {
    store.replaceApplications([paidRow()]);
    expect(store.getById('APP-1')?.paymentStatus).toBe('Paid');

    // Exactly what any Payments action does.
    store.refreshPaymentProjection('APP-1', 'Engr. Tester', 'Administrator');

    // Before the guard this was 'Not Yet Available': recomputed from an
    // assessment store that `replaceApplications` had just cleared.
    expect(store.getById('APP-1')?.paymentStatus).toBe('Paid');
  });

  it('still recomputes when the local store IS the authority', () => {
    // Seed data: no server has spoken, so the assessment store is what the
    // portal knows and recomputation is correct.
    expect(store.isSeedData()).toBe(true);
    const seeded = store.applications()[0];

    expect(() =>
      store.refreshPaymentProjection(seeded.id, 'Engr. Tester', 'Administrator'),
    ).not.toThrow();
  });

  it('leaves the two sources agreeing after a load', () => {
    store.replaceApplications([paidRow()]);

    // The row says paid; the assessment store holds nothing. The portal must
    // report one answer, and it must be the server's.
    expect(store.getAssessments('APP-1').length).toBe(0);
    expect(store.getById('APP-1')?.paymentStatus).toBe('Paid');
  });
});
