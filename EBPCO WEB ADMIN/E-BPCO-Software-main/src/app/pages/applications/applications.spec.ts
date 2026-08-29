import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Applications } from './applications';
import { StaffApplicationsApi } from '../../core/api/staff-applications.api';
import { ApplicationStore } from '../../core/domain/application-store';

/**
 * The queue-failure state, rendered.
 *
 * The store specs already prove a failed load empties the store. They cannot
 * prove the officer is TOLD, because they never render a template — and the
 * first version of this feature put the alert inside the page's `detail`
 * branch instead of its `list` branch. Every spec passed. The portal showed a
 * cleared table reading "No applications match your search" with no error
 * anywhere: "there is nothing there" in place of "we could not ask", which is
 * the one claim ADR 0001 forbids. It was found by running the app and looking
 * at it, not by the suite.
 *
 * So this asserts the alert reaches the DOM of the screen the officer is
 * actually on.
 */
describe('Applications — a failed queue load is visible on the list', () => {
  function mount(page: () => Promise<unknown>) {
    TestBed.configureTestingModule({
      imports: [Applications],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: StaffApplicationsApi, useValue: { page } },
      ],
    });
    const fixture = TestBed.createComponent(Applications);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the error and a retry on the LIST screen, not only in the detail branch', async () => {
    const fixture = mount(() => Promise.reject(new Error('The queue is down for maintenance.')));
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('The queue could not be loaded, so no applications are shown.');
    expect(text).toContain('The queue is down for maintenance.');

    const alerts = (fixture.nativeElement as HTMLElement).querySelectorAll('[role="alert"]');
    expect(alerts.length).toBeGreaterThan(0);

    const retry = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).filter((b) => b.textContent?.includes('Try again'));
    expect(retry.length).toBe(1);
  });

  it('clears the seeded rows rather than showing applications that do not exist', async () => {
    // `inject` before `configureTestingModule` instantiates the module and the
    // configure call then throws — mount first, resolve the store after.
    const fixture = mount(() => Promise.reject(new Error('nope')));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(TestBed.inject(ApplicationStore).applications()).toEqual([]);
  });

  it('renders the permit reference beside the id', async () => {
    const row = {
      id: 'SRV-1', referenceNumber: 'BP-2026-0042',
      businessId: '', businessName: '—', applicantId: '', applicant: 'Raul Villanueva',
      location: 'Barangay Poblacion', permitType: 'Building Permit – New Construction',
      applicationAction: 'New', officer: '—', dateSubmitted: '2026-08-01',
      dateValue: new Date('2026-08-01T00:00:00.000Z'), lifecycleStatus: 'Submitted',
      evaluationStage: 'Initial', evaluationResult: 'Pending',
      paymentStatus: 'Not Yet Available', permitReleaseStatus: 'Not Ready',
      assessedAmountCentavos: null, type: 'Building Permit – New Construction',
      status: 'Under Review',
    };
    const fixture = mount(() => Promise.resolve({ rows: [row], nextCursor: null }));
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    // Both: the id is the identity routes and aria labels use, the reference is
    // what an applicant quotes.
    expect(text).toContain('SRV-1');
    expect(text).toContain('BP-2026-0042');
  });

  it('shows no error when the queue loads', async () => {
    const fixture = mount(() => Promise.resolve({ rows: [], nextCursor: null }));
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).not.toContain('The queue could not be loaded');
  });
});
