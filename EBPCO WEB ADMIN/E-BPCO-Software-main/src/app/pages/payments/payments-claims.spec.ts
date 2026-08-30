import { TestBed } from '@angular/core/testing';

import { AssessmentStore } from '../../core/domain/assessment-store';
import { ApplicationStore } from '../../core/domain/application-store';

/**
 * "Zero" and "we hold nothing" are different claims.
 *
 * The Payments page shows six status tiles — Draft, For Approval, Issued,
 * Partially Paid, Paid, Overdue — counted over `allAssessments()`. Assessments
 * have no endpoint, so a successful queue load clears them (see
 * `ApplicationStore.replaceApplications`). Every tile then counts zero, and six
 * zeros read as "no assessment is in any of these states" — a claim about the
 * LGU's books, made when the portal simply holds no assessment data.
 *
 * The same shape as the Users & Roles tiles (F-16) and the Missing Documents
 * column (F-14): a count over unknown data returns 0, and 0 looks like
 * knowledge.
 */
describe('Payments — assessment counts distinguish zero from unknown', () => {
  let store: ApplicationStore;
  let assessments: AssessmentStore;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [ApplicationStore, AssessmentStore] });
    store = TestBed.inject(ApplicationStore);
    assessments = TestBed.inject(AssessmentStore);
  });

  it('the seed really does hold assessments, so the clearing below is a real change', () => {
    expect(assessments.allAssessments().length).toBeGreaterThan(0);
  });

  it('a server load clears them, which is what makes every tile read zero', () => {
    // Not a bug in itself — the portal has no assessment endpoint, so the
    // honest state after a real load is "nothing recorded".
    store.replaceApplications([]);
    expect(assessments.allAssessments()).toEqual([]);
  });

  it('with no assessment data every status count is zero — the number that must NOT be shown as a fact', () => {
    store.replaceApplications([]);
    const rows = assessments.allAssessments();
    for (const status of ['Draft', 'For Approval', 'Issued', 'Partially Paid', 'Paid', 'Overdue']) {
      expect(rows.filter((a) => a.status === status).length).toBe(0);
    }
    // The page renders '—' rather than these zeros; see `assessmentCount` and
    // `hasNoAssessmentData` in payments.ts.
    expect(rows.length).toBe(0);
  });
});
