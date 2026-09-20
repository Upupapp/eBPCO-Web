import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { Citizens } from './citizens';
import { SessionService } from '../../core/session/session.service';
import { CitizenDetail, CitizenRow } from '../../core/api/staff-citizens.api';

// `protected` members are accessed via `as any` throughout — the standard
// pattern this codebase already uses for exercising component-internal
// state from a spec (see businesses.spec.ts's own note on this).

type CitizensFixture = ReturnType<typeof TestBed.createComponent<Citizens>>;

/**
 * Lets a `flush()`'d HTTP response actually reach the component's signals
 * and the rendered DOM before the next assertion — the same settle dance
 * `user-roles.spec.ts`'s own `mount()` uses, for the identical reason: a
 * `flush()` resolves the Observable synchronously, but the `async`
 * method awaiting it (here, every `Citizens` load/action method) only
 * resumes on a LATER microtask, and `detectChanges()` called before that
 * has happened renders the state from before the response arrived.
 */
async function settle(fixture: CitizensFixture): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await fixture.whenStable();
  await new Promise((resolve) => setTimeout(resolve, 0));
  fixture.detectChanges();
}

function citizenRow(overrides: Partial<CitizenRow> = {}): CitizenRow {
  return {
    id: 'c1111111-1111-4111-8111-111111111111',
    firstName: 'Maria',
    lastName: 'Santos',
    email: 'maria.santos@example.ph',
    emailVerified: true,
    mobileVerified: false,
    status: 'active',
    registeredAt: '2026-01-15T00:00:00.000Z',
    businessCount: 1,
    applicationCount: 2,
    ...overrides,
  };
}

function citizenDetail(overrides: Partial<CitizenDetail> = {}): CitizenDetail {
  return {
    ...citizenRow(),
    mobileNumber: '09171234567',
    disabledAt: null,
    disabledReason: null,
    middleName: null,
    street: 'Purok 3',
    barangay: 'Poblacion',
    city: 'Castilla',
    province: 'Sorsogon',
    postalCode: '4713',
    dateOfBirth: '1990-05-12',
    sex: 'Female',
    civilStatus: 'Single',
    nationality: 'Filipino',
    businesses: [],
    applications: [],
    sessions: [],
    auditEntries: [],
    ...overrides,
  };
}

describe('Citizens — list', () => {
  let fixture: CitizensFixture;
  let component: any;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [Citizens],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(Citizens);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    // <app-topbar>'s own constructor always fetches the notifications inbox,
    // regardless of which page hosts it — not this page's own concern, so
    // every test here flushes it once, up front, rather than repeating this
    // in each `it()`.
    http.expectOne((r) => r.url === '/staff/notifications').flush({ notifications: [], unread: 0 });
  });

  afterEach(() => http.verify());

  it('renders rows from the API response, not a fabricated dataset', async () => {
    http.expectOne((r) => r.url === '/staff/citizens').flush({
      rows: [citizenRow()], page: 1, pageSize: 10, total: 1,
    });
    http.expectOne((r) => r.url === '/staff/citizens/metrics').flush({
      total: 1, active: 1, disabled: 0, emailVerified: 1, mobileVerified: 0, newLast30Days: 1,
    });
    await settle(fixture);

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Maria');
    expect(text).toContain('Santos');
    expect(component.rows().length).toBe(1);
  });

  it('renders the real metrics onto the KPI cards', async () => {
    http.expectOne((r) => r.url === '/staff/citizens').flush({ rows: [], page: 1, pageSize: 10, total: 0 });
    http.expectOne((r) => r.url === '/staff/citizens/metrics').flush({
      total: 42, active: 40, disabled: 2, emailVerified: 30, mobileVerified: 10, newLast30Days: 5,
    });
    await settle(fixture);

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('42');
    expect(text).toContain('40');
  });

  it('debounces search input and sends it as `search=` once, not per keystroke', async () => {
    http.expectOne((r) => r.url === '/staff/citizens').flush({ rows: [], page: 1, pageSize: 10, total: 0 });
    http.expectOne((r) => r.url === '/staff/citizens/metrics').flush({
      total: 0, active: 0, disabled: 0, emailVerified: 0, mobileVerified: 0, newLast30Days: 0,
    });
    await settle(fixture);

    vi.useFakeTimers();
    try {
      component.searchTerm.set('San');
      component.onSearchChange();
      component.searchTerm.set('Santos');
      component.onSearchChange();

      http.expectNone((r) => r.url === '/staff/citizens' && r.params.get('search') !== null);
      vi.advanceTimersByTime(400);

      const req = http.expectOne((r) => r.url === '/staff/citizens');
      expect(req.request.params.get('search')).toBe('Santos');
      req.flush({ rows: [], page: 1, pageSize: 10, total: 0 });
    } finally {
      vi.useRealTimers();
    }
  });

  it('pagination sends the requested page number', async () => {
    http.expectOne((r) => r.url === '/staff/citizens').flush({ rows: [], page: 1, pageSize: 10, total: 30 });
    http.expectOne((r) => r.url === '/staff/citizens/metrics').flush({
      total: 30, active: 30, disabled: 0, emailVerified: 0, mobileVerified: 0, newLast30Days: 0,
    });
    await settle(fixture);

    component.onPageChange(3);
    const req = http.expectOne((r) => r.url === '/staff/citizens');
    expect(req.request.params.get('page')).toBe('3');
    req.flush({ rows: [], page: 3, pageSize: 10, total: 30 });
    await settle(fixture);
  });

  it('shows an unavailable notice on a 501, without fabricating rows', async () => {
    http.expectOne((r) => r.url === '/staff/citizens')
      .flush({ type: '/problems/not-implemented', title: 'not implemented', status: 501 }, { status: 501, statusText: 'Not Implemented' });
    http.expectOne((r) => r.url === '/staff/citizens/metrics')
      .flush({ type: '/problems/not-implemented', title: 'not implemented', status: 501 }, { status: 501, statusText: 'Not Implemented' });
    await settle(fixture);

    expect(component.listUnavailable()).toBe(true);
    expect(component.rows()).toEqual([]);
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toMatch(/isn't reachable/);
  });
});

describe('Citizens — detail', () => {
  let fixture: CitizensFixture;
  let component: any;
  let http: HttpTestingController;
  let session: SessionService;

  async function mount(id: string): Promise<void> {
    fixture = TestBed.createComponent(Citizens);
    fixture.componentRef.setInput('id', id);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    // Same Topbar-inbox fetch as the list describe block above.
    http.expectOne((r) => r.url === '/staff/notifications').flush({ notifications: [], unread: 0 });
    await settle(fixture);
  }

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [Citizens],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    session = TestBed.inject(SessionService);
    session.devBypass();
    session.setRole('Administrator');
  });

  afterEach(() => http.verify());

  it('loads a citizen and switches tabs', async () => {
    await mount('c1111111-1111-4111-8111-111111111111');
    http.expectOne((r) => r.url === '/staff/citizens/c1111111-1111-4111-8111-111111111111')
      .flush(citizenDetail({ applications: [{ id: 'a1', referenceNumber: 'BP-1', permitType: 'Fencing Permit', lifecycleStatus: 'Submitted', submittedAt: null }] }));
    await settle(fixture);

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Maria');

    component.selectDetailTab('businesses-applications');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('BP-1');
  });

  it('renders a not-found notice for a 404, without a crash', async () => {
    await mount('c2222222-2222-4222-8222-222222222222');
    http.expectOne((r) => r.url === '/staff/citizens/c2222222-2222-4222-8222-222222222222')
      .flush({ type: '/problems/not-found', title: 'No such resource', status: 404 }, { status: 404, statusText: 'Not Found' });
    await settle(fixture);

    expect(component.detailNotFound()).toBe(true);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No such citizen account');
  });

  it('Disable posts a real Idempotency-Key and the given reason, and reloads on success', async () => {
    await mount('c1111111-1111-4111-8111-111111111111');
    http.expectOne((r) => r.url === '/staff/citizens/c1111111-1111-4111-8111-111111111111')
      .flush(citizenDetail());
    await settle(fixture);

    component.disableTarget.set(component.detail());
    void component.confirmDisable('front-desk correction, citizen present');
    await new Promise((resolve) => setTimeout(resolve, 0));

    const req = http.expectOne((r) => r.url === '/staff/citizens/c1111111-1111-4111-8111-111111111111/disable');
    expect(req.request.body).toEqual({ reason: 'front-desk correction, citizen present' });
    expect(req.request.headers.has('idempotency-key')).toBe(true);
    req.flush({ status: 'disabled', reason: 'front-desk correction, citizen present' });
    await new Promise((resolve) => setTimeout(resolve, 0));

    http.expectOne((r) => r.url === '/staff/citizens/c1111111-1111-4111-8111-111111111111')
      .flush(citizenDetail({ status: 'disabled', disabledAt: '2026-09-20T00:00:00.000Z', disabledReason: 'front-desk correction, citizen present' }));
    await settle(fixture);

    expect(component.detail()?.status).toBe('disabled');
  });

  it('never calls disable/enable/erase without a reason — ConfirmDialog withholds `confirmed` until one is typed', async () => {
    await mount('c1111111-1111-4111-8111-111111111111');
    http.expectOne((r) => r.url === '/staff/citizens/c1111111-1111-4111-8111-111111111111')
      .flush(citizenDetail());
    await settle(fixture);

    component.disableTarget.set(component.detail());
    fixture.detectChanges();

    const confirmButton = (fixture.nativeElement as HTMLElement)
      .querySelector('app-confirm-dialog .modal-actions button.modal-btn:not(.neutral)') as HTMLButtonElement | null;
    expect(confirmButton).toBeTruthy();
    // No reason typed — clicking Confirm must not fire the API call.
    confirmButton?.click();
    fixture.detectChanges();
    http.expectNone((r) => r.url.includes('/disable'));
  });

  it('a role with no citizen-administration permission sees no action buttons', async () => {
    session.setRole('Auditor');
    await mount('c1111111-1111-4111-8111-111111111111');
    http.expectOne((r) => r.url === '/staff/citizens/c1111111-1111-4111-8111-111111111111')
      .flush(citizenDetail());
    await settle(fixture);

    expect(component.canDisable()).toBe(false);
    expect(component.canErase()).toBe(false);
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).not.toContain('Disable Account');
    expect(text).not.toContain('Erase Account');
  });

  it('erasure requires a request reference before Erase Account is enabled', async () => {
    await mount('c1111111-1111-4111-8111-111111111111');
    http.expectOne((r) => r.url === '/staff/citizens/c1111111-1111-4111-8111-111111111111')
      .flush(citizenDetail());
    await settle(fixture);

    expect(component.eraseReferenceValid()).toBe(false);
    component.eraseReference.set('walk-in-log-42');
    expect(component.eraseReferenceValid()).toBe(true);
  });

  it('erasure is a genuine two-step confirm: the reason dialog does not itself call the API', async () => {
    await mount('c1111111-1111-4111-8111-111111111111');
    http.expectOne((r) => r.url === '/staff/citizens/c1111111-1111-4111-8111-111111111111')
      .flush(citizenDetail());
    await settle(fixture);

    component.eraseReference.set('walk-in-log-42');
    component.startErase();
    expect(component.eraseStep()).toBe(1);

    component.onEraseStep1Confirmed('citizen requested erasure in person');
    // Step 1 only advances to the final confirmation — no HTTP call yet.
    expect(component.eraseStep()).toBe(2);
    http.expectNone((r) => r.url.includes('/erasure'));
  });
});
