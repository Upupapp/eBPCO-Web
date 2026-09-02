import { TestBed } from '@angular/core/testing';

import { ApplicationStore } from '../../core/domain/application-store';
import { VALID_TRANSITIONS } from '../../core/domain/status.model';

/**
 * What may happen to an application, and what may not.
 *
 * Applications is 2,558 lines — the largest surface in the portal, and the
 * queue every other page reads. Its four existing specs cover the load states.
 * Nothing covered the transitions, which decide whether a permit can be moved
 * toward approval without the steps in between.
 *
 * Pinned at the store, for the same reason as payments and permit release: the
 * page filters the menu it offers, and the store is what stands whatever the
 * menu decides to show. The page's own comment calls its filtering "defense in
 * depth, not the primary guard" — these test the primary one.
 */
describe('Application transitions', () => {
  let store: ApplicationStore;

  const anyWith = (status: string) =>
    store.applications().find((a) => a.lifecycleStatus === status);

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [ApplicationStore] });
    store = TestBed.inject(ApplicationStore);
  });

  it('refuses a jump the transition table does not permit', () => {
    const draft = anyWith('Draft') ?? store.applications()[0];
    expect(draft).toBeDefined();

    // Draft may go to Submitted or Cancelled. Approved is four decisions away,
    // and every one of them is somebody signing something.
    expect(VALID_TRANSITIONS[draft.lifecycleStatus]).not.toContain('Approved');
    expect(store.transitionStatus(draft.id, 'Approved', 'Engr. Tester', 'Administrator')).toBe(false);
    expect(store.getById(draft.id)?.lifecycleStatus).toBe(draft.lifecycleStatus);
  });

  it('refuses a rejection with no reason given', () => {
    const row = store.applications().find((a) => VALID_TRANSITIONS[a.lifecycleStatus].includes('Rejected'));
    expect(row).toBeDefined();
    if (!row) return;

    // A rejection is the end of an application. The remark is the whole record
    // of why, and it is what the citizen is told.
    expect(store.transitionStatus(row.id, 'Rejected', 'Engr. Tester', 'Evaluator')).toBe(false);
    expect(store.transitionStatus(row.id, 'Rejected', 'Engr. Tester', 'Evaluator', '   ')).toBe(false);
    expect(store.getById(row.id)?.lifecycleStatus).toBe(row.lifecycleStatus);
  });

  it('refuses a revision request with no reason given', () => {
    const row = store
      .applications()
      .find((a) => VALID_TRANSITIONS[a.lifecycleStatus].includes('Revision Required'));
    expect(row).toBeDefined();
    if (!row) return;

    // Sending an application back without saying what to fix asks a citizen to
    // guess, and they will guess wrong and resubmit the same thing.
    expect(store.transitionStatus(row.id, 'Revision Required', 'Engr. Tester', 'Evaluator')).toBe(false);
  });

  it('allows a permitted move, with a reason where one is required', () => {
    const row = store.applications().find((a) => VALID_TRANSITIONS[a.lifecycleStatus].includes('Rejected'));
    expect(row).toBeDefined();
    if (!row) return;

    expect(
      store.transitionStatus(row.id, 'Rejected', 'Engr. Tester', 'Evaluator', 'Lot plan does not match the title.'),
    ).toBe(true);
    expect(store.getById(row.id)?.lifecycleStatus).toBe('Rejected');
  });

  it('records who moved it and why, because a status with no author is unanswerable', () => {
    const row = store.applications().find((a) => VALID_TRANSITIONS[a.lifecycleStatus].includes('Rejected'));
    expect(row).toBeDefined();
    if (!row) return;

    store.transitionStatus(row.id, 'Rejected', 'Engr. Ana Reyes', 'Evaluator', 'Lot plan mismatch.');
    const entry = store
      .getAuditTrail(row.id)
      .find((e) => e.remarks === 'Lot plan mismatch.');

    expect(entry).toBeDefined();
    expect(entry?.actor).toBe('Engr. Ana Reyes');
  });

  it('a terminal status is terminal', () => {
    const row = store.applications().find((a) => VALID_TRANSITIONS[a.lifecycleStatus].includes('Rejected'));
    expect(row).toBeDefined();
    if (!row) return;

    store.transitionStatus(row.id, 'Rejected', 'Engr. Tester', 'Evaluator', 'Rejected for cause.');

    // Nothing follows Rejected in the table. An application that could be
    // revived after rejection would make the rejection a suggestion.
    expect(VALID_TRANSITIONS['Rejected']).toEqual([]);
    expect(store.transitionStatus(row.id, 'Under Evaluation', 'Engr. Tester', 'Evaluator')).toBe(false);
  });
});
