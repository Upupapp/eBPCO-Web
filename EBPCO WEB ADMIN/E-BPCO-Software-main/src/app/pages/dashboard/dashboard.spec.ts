import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Dashboard } from './dashboard';
import { ApplicationStore } from '../../core/domain/application-store';
import { ApplicationRecord, withProjectedFields } from '../../core/domain/application.model';

/**
 * The dashboard's overdue panel.
 *
 * It rendered "Nothing overdue right now." whenever its list came back empty,
 * and against live data the list is ALWAYS empty: the panel requires
 * `evaluationResult === 'Pending'`, and the queue endpoint sends no review
 * state at all — `staff-applications.api.ts` sets it to null for every row.
 *
 * So the portal issued an all-clear on the LGU's backlog without having been
 * told one thing about it. These tests pin the difference between none and
 * unknown, which is the distinction the whole sweep turns on.
 */
const row = (over: Partial<ApplicationRecord> = {}): ApplicationRecord =>
  withProjectedFields({
    id: 'APP-1',
    businessId: 'BIZ-1',
    businessName: 'Villanueva Hardware',
    applicantId: 'APL-1',
    applicant: 'Raul Villanueva',
    location: 'Barangay Poblacion',
    permitType: 'Building Permit – New Construction',
    applicationAction: 'New',
    officer: 'Engr. Tester',
    dateSubmitted: '2026-08-01',
    dateValue: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    lifecycleStatus: 'Under Evaluation',
    evaluationStage: null,
    evaluationResult: null,
    ...over,
  } as ApplicationRecord);

function mount(rows: ApplicationRecord[]) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [Dashboard],
    providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
  });
  TestBed.inject(ApplicationStore).replaceApplications(rows);
  const fixture = TestBed.createComponent(Dashboard);
  fixture.detectChanges();
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

describe('Dashboard — overdue panel', () => {
  it('does not claim an all-clear when the rows carry no review state', () => {
    // Exactly what the live queue returns: real applications, null review state.
    const text = mount([row(), row({ id: 'APP-2' })]);

    expect(text).not.toContain('Nothing overdue right now');
    expect(text).toContain('cannot be identified');
  });

  it('says nothing is overdue when there is genuinely nothing to be overdue', () => {
    // No applications at all: nothing CAN be overdue, so the all-clear is true.
    expect(mount([])).toContain('Nothing overdue right now');
  });

  it('still reports real overdue work when review state is present', () => {
    const text = mount([row({ evaluationResult: 'Pending', evaluationStage: 'Zoning' })]);

    expect(text).toContain('Raul Villanueva');
    expect(text).not.toContain('Nothing overdue right now');
    expect(text).not.toContain('cannot be identified');
  });
});
