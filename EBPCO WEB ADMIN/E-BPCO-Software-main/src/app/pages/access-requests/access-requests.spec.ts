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

  it('seeds the grant from what was asked, so the approver edits rather than rebuilds', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/access-requests').flush({
        items: [request({
          requestedPermitTypes: ['Fencing Permit', 'Sign Permit'],
          requestedLevel: 'view-edit',
        })],
      }),
    );
    const c = fixture.componentInstance as unknown as {
      startApprove(r: unknown): void; isGranted(t: string): boolean;
      grantLevel(): string; grantCount(): number;
    };
    c.startApprove((fixture.componentInstance as unknown as { requests(): unknown[] }).requests()[0]);

    // Seeded, not silently accepted and not empty: an approver made to rebuild
    // the list from scratch will pick something easier than the right answer.
    expect(c.isGranted('Fencing Permit')).toBe(true);
    expect(c.isGranted('Sign Permit')).toBe(true);
    expect(c.isGranted('Demolition Permit')).toBe(false);
    expect(c.grantLevel()).toBe('view-edit');
  });

  it('never grants a permit type this portal does not publish', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/access-requests').flush({
        items: [request({ requestedPermitTypes: ['Fencing Permit', 'Sorcery Permit'] })],
      }),
    );
    const c = fixture.componentInstance as unknown as {
      startApprove(r: unknown): void; grantCount(): number;
      unknownRequested(r: unknown): readonly string[]; requests(): unknown[];
    };
    const row = c.requests()[0];
    c.startApprove(row);
    fixture.detectChanges();

    // Filtered out of the grant, but SHOWN — a grant that quietly omits what
    // somebody asked for is one they will assume they have.
    expect(c.grantCount()).toBe(1);
    expect(c.unknownRequested(row)).toEqual(['Sorcery Permit']);
    expect(fixture.nativeElement.textContent).toContain('Sorcery Permit');
  });

  it('refuses to approve with no forms — an account that can see nothing', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/access-requests').flush({ items: [request()] }),
    );
    const c = fixture.componentInstance as unknown as {
      startApprove(r: unknown): void; toggleGrant(t: string): void;
      confirmApprove(): Promise<void>; requests(): unknown[];
    };
    c.startApprove(c.requests()[0]);
    c.toggleGrant('Building Permit – New Construction');
    await c.confirmApprove();

    TestBed.inject(HttpTestingController).verify();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('at least one form');
  });

  it('sends the grant WITH the approval, in one request', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/access-requests').flush({ items: [request()] }),
    );
    const c = fixture.componentInstance as unknown as {
      startApprove(r: unknown): void; setLevel(l: string): void;
      confirmApprove(): Promise<void>; requests(): unknown[];
    };
    c.startApprove(c.requests()[0]);
    c.setLevel('view-edit');
    (c as unknown as { toggleGrantRole(k: string): void }).toggleGrantRole('evaluator');
    const pending = c.confirmApprove();

    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne('/staff/access-requests/REQ-1/approve');
    // One call, not two: a second request would leave a window in which an
    // approved account exists with undefined access, and if it failed the
    // window would never close.
    expect(req.request.method).toBe('POST');
    expect(req.request.body.level).toBe('view-edit');
    expect(req.request.body.permitTypes).toEqual(['Building Permit – New Construction']);
    // `roles` is required by the server and non-empty. The portal used to send
    // only level and permitTypes, so every approval would have failed (F-30).
    expect(req.request.body.roles).toEqual(['evaluator']);
    req.flush(null, { status: 204, statusText: 'No Content' });

    // The reload is queued behind the decision's promise, so it does not exist
    // until the task queue drains.
    await new Promise((resolve) => setTimeout(resolve, 0));
    http.expectOne('/staff/access-requests').flush({ items: [] });
    await pending;
  });

  it('refuses to reject without a reason', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/access-requests').flush({ items: [request()] }),
    );
    const c = fixture.componentInstance as unknown as {
      startReject(r: unknown): void; confirmReject(): Promise<void>; requests(): unknown[];
    };
    c.startReject(c.requests()[0]);
    await c.confirmReject();

    TestBed.inject(HttpTestingController).verify();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Give a reason');
  });

  it('tells the approver when someone else already decided, rather than failing', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/access-requests').flush({ items: [request()] }),
    );
    const c = fixture.componentInstance as unknown as {
      startReject(r: unknown): void; confirmReject(): Promise<void>;
      rejectReason: string; requests(): unknown[];
    };
    c.startReject(c.requests()[0]);
    c.rejectReason = 'Not required for this role.';
    const pending = c.confirmReject();

    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/staff/access-requests/REQ-1/reject').flush(
      { type: 'about:blank', title: 'Conflict', status: 409 },
      { status: 409, statusText: 'Conflict' },
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    http.expectOne('/staff/access-requests').flush({ items: [] });
    await pending;
    fixture.detectChanges();

    // A 409 is not a failure to retry — a decision already exists.
    expect(fixture.nativeElement.textContent).toContain('already been decided');
  });

  it('warns when View and edit would grant nothing', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/access-requests').flush({ items: [request()] }),
    );
    const c = fixture.componentInstance as unknown as {
      startApprove(r: unknown): void; toggleGrantRole(k: string): void;
      setLevel(l: string): void; levelAddsNothing(): boolean; requests(): unknown[];
    };
    c.startApprove(c.requests()[0]);
    c.toggleGrantRole('auditor');
    c.setLevel('view-edit');
    fixture.detectChanges();

    // The level SUBTRACTS and never adds: the server withholds authority at
    // `view` and issues the role's scopes unchanged at `view-edit`. An auditor
    // holds none, so this combination grants exactly what it would without it,
    // and an approver ticking it believes otherwise.
    expect(c.levelAddsNothing()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('adds nothing');
  });

  it('does not warn when a role that can act is also selected', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/access-requests').flush({ items: [request()] }),
    );
    const c = fixture.componentInstance as unknown as {
      startApprove(r: unknown): void; toggleGrantRole(k: string): void;
      setLevel(l: string): void; levelAddsNothing(): boolean; requests(): unknown[];
    };
    c.startApprove(c.requests()[0]);
    c.toggleGrantRole('auditor');
    c.toggleGrantRole('evaluator');
    c.setLevel('view-edit');

    // Mixed with anything that can act, the level is doing real work.
    expect(c.levelAddsNothing()).toBe(false);
  });

  it('does not warn at view level, where the point does not arise', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/access-requests').flush({ items: [request()] }),
    );
    const c = fixture.componentInstance as unknown as {
      startApprove(r: unknown): void; toggleGrantRole(k: string): void;
      setLevel(l: string): void; levelAddsNothing(): boolean; requests(): unknown[];
    };
    c.startApprove(c.requests()[0]);
    c.toggleGrantRole('auditor');
    c.setLevel('view');

    expect(c.levelAddsNothing()).toBe(false);
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
