import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AccessRequests } from './access-requests';
import { API_BASE_URL } from '../../core/api/api.config';
import { canAccessPath } from '../../core/session/permissions';

/**
 * The super admin's approval queue.
 *
 * Two things are pinned. First, that only a Super Admin reaches it — an
 * Administrator who could approve requests could grant themselves anything by
 * approving their own second account. Second, that "no requests waiting" is
 * only ever said when the server actually said so: this page has three empty
 * states where every other page in this portal historically had one, and
 * collapsing them is the defect fixed in F-15, F-21, F-22 and F-25.
 */
async function mount(
  respond: (http: HttpTestingController) => void,
): Promise<ComponentFixture<AccessRequests>> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [AccessRequests],
    providers: [
      provideRouter([]),
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: API_BASE_URL, useValue: '' },
    ],
  });
  const fixture = TestBed.createComponent(AccessRequests);
  fixture.detectChanges();
  respond(TestBed.inject(HttpTestingController));
  // `whenStable()` alone leaves the page on "Loading…": ngOnInit awaits the
  // API promise, and resolving the HttpTestingController request only queues
  // its continuation. Drain the task queue before asserting on rendered text.
  await fixture.whenStable();
  await new Promise((resolve) => setTimeout(resolve, 0));
  fixture.detectChanges();
  return fixture;
}

const request = (over: Record<string, unknown> = {}) => ({
  id: 'REQ-1',
  fullName: 'Engr. Ana Reyes',
  email: 'ana.reyes@castillasorsogon.gov.ph',
  mobileNumber: '09171234567',
  position: 'Municipal Engineering Office — Evaluator',
  requestedPermitTypes: ['Building Permit – New Construction'],
  requestedLevel: 'view',
  justification: 'Assigned to evaluate structural submissions.',
  requestedAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
  ...over,
});

describe('Access Requests', () => {
  it('is reachable by Super Admin alone', () => {
    expect(canAccessPath('Super Admin', '/access-requests')).toBe(true);

    // Every other role, including Administrator. Approving access is the one
    // authority that can manufacture more authority.
    expect(canAccessPath('Administrator', '/access-requests')).toBe(false);
    expect(canAccessPath('Auditor', '/access-requests')).toBe(false);
    expect(canAccessPath('Evaluator', '/access-requests')).toBe(false);
  });

  it('lists a pending request with its level, forms and age', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/access-requests').flush({ items: [request()] }),
    );
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Engr. Ana Reyes');
    expect(text).toContain('View only');
    expect(text).toContain('Building Permit – New Construction');
    expect(text).toContain('Waiting 3 days');
  });

  it('marks a view-and-edit request as carrying authority', async () => {
    const fixture = await mount((http) =>
      http
        .expectOne('/staff/access-requests')
        .flush({ items: [request({ requestedLevel: 'view-edit' })] }),
    );

    expect(fixture.nativeElement.querySelector('.level.elevated')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('View and edit');
  });

  it('says nobody is waiting only when the server said so', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/access-requests').flush({ items: [] }),
    );

    expect(fixture.nativeElement.textContent).toContain('The server was asked and answered');
  });

  it('does not call an absent capability an empty queue', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/access-requests').flush(
        { type: 'about:blank', title: 'Not Found', status: 404 },
        { status: 404, statusText: 'Not Found' },
      ),
    );
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('cannot receive access requests yet');
    expect(text).not.toContain('No requests are waiting');
  });

  it('does not call a failed read an empty queue', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/access-requests').flush(
        { type: 'about:blank', title: 'Server Error', status: 500 },
        { status: 500, statusText: 'Server Error' },
      ),
    );
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('not a picture of who is waiting');
    expect(text).not.toContain('No requests are waiting');
  });

  it('does not borrow the RA 11032 pledge language for staff onboarding', async () => {
    const fixture = await mount((http) =>
      http
        .expectOne('/staff/access-requests')
        .flush({ items: [request({ requestedAt: new Date(Date.now() - 40 * 86_400_000).toISOString() })] }),
    );
    const text = ((fixture.nativeElement as HTMLElement).textContent ?? '').toLowerCase();

    // A 40-day-old request is not "overdue" against any standard anyone set.
    // Inventing one here is exactly what the dashboard did with 5 days (F-26).
    expect(text).toContain('waiting 40 days');
    expect(text).not.toContain('overdue');
    expect(text).not.toContain('pledge');
  });
});
