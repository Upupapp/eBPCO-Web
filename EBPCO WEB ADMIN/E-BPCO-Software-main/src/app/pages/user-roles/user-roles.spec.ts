import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { UserRoles } from './user-roles';
import { API_BASE_URL } from '../../core/api/api.config';
import { Session, SessionService } from '../../core/session/session.service';

/**
 * The staff directory.
 *
 * Pinned here:
 *
 * **The list is real, or it says it is not.** It used to be `buildUsers()` —
 * names and departments invented from hardcoded arrays. A fabricated LIST is
 * worse than a fabricated chart: an administrator believes these people hold
 * accounts, and the absence of somebody who does is invisible.
 *
 * **View and Edit are two screens.** They used to open the same one (owner,
 * 2026-09-26). View is the account read-only; Edit is its form — position,
 * evaluation stages, forms and level — and Save sends only what changed.
 *
 * **Delete is the super admin's.** Owner request, 2026-09-26, replacing the
 * earlier "no delete" ruling. The server decides whether that deletes the
 * account or retires it (its name is on decisions), and the page says which.
 */
const member = (over: Record<string, unknown> = {}) => ({
  id: 'USR-1',
  email: 'ana.reyes@castillasorsogon.gov.ph',
  fullName: 'Engr. Ana Reyes',
  roles: ['evaluator'],
  status: 'Active',
  mfaRequired: false,
  mfaEnrolled: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  lastSignInAt: null,
  ...over,
});

/** What `GET /staff/users/:id/access` answers — a separate call from the roster. */
const access = (over: Record<string, unknown> = {}) => ({
  level: 'view',
  permitTypes: ['Fencing Permit'],
  evaluationStages: [],
  ...over,
});

/** The signed-in viewer: a super admin unless a test says otherwise. */
const viewer = (over: Partial<Session> = {}): Session => ({
  accountId: 'ADMIN-1',
  name: 'Paul',
  email: 'paul@lguids.com.ph',
  role: 'Super Admin',
  scopes: ['staff:administer', 'applications:read', 'audit:read', 'citizens:read'],
  assignedForms: null,
  wireRoles: ['super-admin'],
  stages: null,
  position: 'Super Admin',
  ...over,
});

const administrator = (): Session => viewer({
  accountId: 'ADMIN-2', name: 'Rey', email: 'rey@castillasorsogon.gov.ph', role: 'Administrator',
  scopes: ['staff:administer', 'citizens:read'], wireRoles: ['administrator'], position: 'Administrator',
});

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Mounts the page as `as`, flushes `/staff/users` via `respond`, then
 * auto-flushes the per-row `GET /staff/users/:id/access` calls that roster
 * answer triggers — every row gets `access()`'s default unless overridden by
 * id in `accessById`.
 */
async function mount(
  respond: (http: HttpTestingController) => void,
  accessById: Record<string, Record<string, unknown>> = {},
  as: Session = viewer(),
): Promise<ComponentFixture<UserRoles>> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [UserRoles],
    providers: [
      provideRouter([]),
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: API_BASE_URL, useValue: '' },
    ],
  });
  const session = TestBed.inject(SessionService);
  (session as unknown as { _session: { set(v: Session | null): void } })._session.set(as);
  const fixture = TestBed.createComponent(UserRoles);
  fixture.detectChanges();
  const http = TestBed.inject(HttpTestingController);
  // `<app-topbar>` fetches the officer's notification inbox from its own
  // constructor — unrelated to this page, but a real request every mount makes.
  http.expectOne((r) => r.url === '/staff/notifications').flush({ notifications: [], unread: 0 });
  respond(http);
  await tick();
  flushAccess(http, accessById);
  await fixture.whenStable();
  await tick();
  fixture.detectChanges();
  return fixture;
}

function flushAccess(http: HttpTestingController, accessById: Record<string, Record<string, unknown>> = {}): void {
  for (const req of http.match((r) => /^\/staff\/users\/[^/]+\/access$/.test(r.url))) {
    const id = req.request.url.split('/')[3]!;
    req.flush(access(accessById[id] ?? {}));
  }
}

interface Page {
  view(): string;
  filteredUsers(): { id: string; email: string; status: string; position: string }[];
  openDetail(r: unknown): void;
  openEdit(r: unknown): void;
  openCreate(positionKey?: string | null): void;
  editLevel(): string;
  editFormCount(): number;
  editPositionKey(): string;
  editError(): string;
  isEditForm(t: string): boolean;
  isEditStage(s: string): boolean;
  toggleEditForm(t: string): void;
  selectAllForms(all: boolean): void;
  setEditLevel(l: string): void;
  choosePosition(key: string): void;
  editName: { set(v: string): void };
  editEmail: { set(v: string): void };
  saveEdit(): Promise<void>;
  createAccount(): Promise<void>;
  mayManage(r: unknown): boolean;
  deleteRefusal(r: unknown): string | null;
  requestDelete(r: unknown): void;
  confirmDelete(): Promise<void>;
  deleteTarget(): unknown;
  requestDisable(r: unknown): void;
  confirmDisable(reason: string): Promise<void>;
  disableRefused(): string;
  disableTarget(): unknown;
  requestEnable(r: unknown): void;
  confirmEnable(reason: string): Promise<void>;
  selectUserDetailTab(t: string): void;
  sessions(): unknown[];
}

const page = (fixture: ComponentFixture<UserRoles>) => fixture.componentInstance as unknown as Page;
const text = (fixture: ComponentFixture<UserRoles>) => (fixture.nativeElement as HTMLElement).textContent ?? '';

describe('Staff directory', () => {
  it('opens View and Edit as two different screens', async () => {
    const fixture = await mount((http) => http.expectOne('/staff/users').flush({ data: [member()] }));
    const c = page(fixture);

    c.openDetail(c.filteredUsers()[0]);
    expect(c.view()).toBe('detail');
    c.openEdit(c.filteredUsers()[0]);
    expect(c.view()).toBe('edit');
  });

  it('names the account by its position and office, and its forms separately', async () => {
    const fixture = await mount(
      (http) => http.expectOne('/staff/users').flush({ data: [member()] }),
      { 'USR-1': { level: 'view-edit', permitTypes: ['Fencing Permit', 'Sign Permit'], evaluationStages: ['Fire Safety'] } },
    );

    // An evaluator holding only the Fire Safety stage IS the Fire Safety
    // Evaluator — the office's word for the job, not "Evaluator".
    expect(text(fixture)).toContain('Fire Safety Evaluator');
    expect(text(fixture)).toContain('Bureau of Fire Protection');
    expect(text(fixture)).toContain('2 forms');
  });

  it('says an account has no forms rather than leaving it blank', async () => {
    const fixture = await mount(
      (http) => http.expectOne('/staff/users').flush({ data: [member()] }),
      { 'USR-1': { permitTypes: [] } },
    );

    expect(text(fixture)).toContain('No forms assigned');
  });

  it('seeds the edit form from what the account holds, not from its labels', async () => {
    const fixture = await mount(
      (http) => http.expectOne('/staff/users').flush({ data: [member()] }),
      { 'USR-1': { level: 'view-edit', permitTypes: ['Fencing Permit', 'Sign Permit'], evaluationStages: ['Zoning'] } },
    );
    const c = page(fixture);
    c.openEdit(c.filteredUsers()[0]);

    // From the raw values, never by parsing "2 forms" back out of a label.
    expect(c.editLevel()).toBe('view-edit');
    expect(c.editFormCount()).toBe(2);
    expect(c.isEditForm('Fencing Permit')).toBe(true);
    expect(c.isEditForm('Demolition Permit')).toBe(false);
    expect(c.isEditStage('Zoning')).toBe(true);
    expect(c.editPositionKey()).toBe('zoning-officer');
  });

  it('collects no reason it cannot send', async () => {
    const fixture = await mount((http) => http.expectOne('/staff/users').flush({ data: [member()] }));
    const c = page(fixture);
    c.openEdit(c.filteredUsers()[0]);
    fixture.detectChanges();

    // None of the access endpoints accepts a reason — they are `.strict()` —
    // so a field asking for one would collect text and discard it (F-24).
    expect(text(fixture).toLowerCase()).not.toContain('reason for this change');
  });

  it('saves only what changed: the forms, then the level, as two PUTs', async () => {
    const fixture = await mount((http) => http.expectOne('/staff/users').flush({ data: [member()] }));
    const c = page(fixture);
    c.openEdit(c.filteredUsers()[0]);
    c.toggleEditForm('Sign Permit');
    c.setEditLevel('view-edit');
    const pending = c.saveEdit();

    const http = TestBed.inject(HttpTestingController);
    // Nothing else changed, so nothing else is sent: no name, position or stages.
    const forms = http.expectOne('/staff/users/USR-1/access/forms');
    expect(forms.request.method).toBe('PUT');
    expect(forms.request.body).toEqual({ permitTypes: ['Fencing Permit', 'Sign Permit'] });
    forms.flush({ permitTypes: ['Fencing Permit', 'Sign Permit'] });

    await tick();
    const level = http.expectOne('/staff/users/USR-1/access/level');
    expect(level.request.body).toEqual({ level: 'view-edit' });
    level.flush({ level: 'view-edit' });

    await tick();
    http.expectOne('/staff/users').flush({ data: [member()] });
    await tick();
    flushAccess(http, { 'USR-1': { level: 'view-edit', permitTypes: ['Fencing Permit', 'Sign Permit'] } });
    await pending;

    expect(c.view()).toBe('detail');
  });

  it('says which part landed when a later one fails', async () => {
    const fixture = await mount((http) => http.expectOne('/staff/users').flush({ data: [member()] }));
    const c = page(fixture);
    c.openEdit(c.filteredUsers()[0]);
    c.toggleEditForm('Sign Permit');
    c.setEditLevel('view-edit');
    const pending = c.saveEdit();

    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/staff/users/USR-1/access/forms').flush({ permitTypes: [] });
    await tick();
    http.expectOne('/staff/users/USR-1/access/level').flush(
      { type: 'about:blank', title: 'Conflict', status: 409, detail: 'This is the last super admin and cannot be demoted.' },
      { status: 409, statusText: 'Conflict' },
    );
    await tick();
    http.expectOne('/staff/users').flush({ data: [member()] });
    await tick();
    flushAccess(http);
    await pending;

    // An administrator who does not know what took effect will guess, and
    // guessing about access is how somebody keeps authority they were meant
    // to lose.
    expect(c.editError()).toContain('Saved: forms.');
    expect(c.editError()).toContain('access level was not saved');
    expect(c.editError()).toContain('last super admin');
    expect(c.view()).toBe('edit');
  });

  it('will not save an account with no forms', async () => {
    const fixture = await mount((http) => http.expectOne('/staff/users').flush({ data: [member()] }));
    const c = page(fixture);
    c.openEdit(c.filteredUsers()[0]);
    c.selectAllForms(false);
    await c.saveEdit();

    TestBed.inject(HttpTestingController).verify();
    expect(c.editError()).toContain('at least one form');
  });

  it('choosing a position sets its roles and its one stage together', async () => {
    const fixture = await mount((http) => http.expectOne('/staff/users').flush({ data: [member()] }));
    const c = page(fixture);
    c.openEdit(c.filteredUsers()[0]);
    c.choosePosition('fire-safety-evaluator');
    const pending = c.saveEdit();

    // Already an evaluator, so only the stage changes — and only to Fire
    // Safety: a Fire Safety Evaluator cannot be given the Zoning stage by a
    // slip of a checkbox.
    const http = TestBed.inject(HttpTestingController);
    const stages = http.expectOne('/staff/users/USR-1/access/stages');
    expect(stages.request.body).toEqual({ stages: ['Fire Safety'] });
    stages.flush({ evaluationStages: ['Fire Safety'] });
    await tick();
    http.expectOne('/staff/users').flush({ data: [member()] });
    await tick();
    flushAccess(http, { 'USR-1': { evaluationStages: ['Fire Safety'] } });
    await pending;
  });

  it('creates an account with its position, stages, forms and level', async () => {
    const fixture = await mount((http) => http.expectOne('/staff/users').flush({ data: [member()] }));
    const c = page(fixture);
    c.openCreate('fire-safety-evaluator');
    c.editName.set('Insp. Jose Cruz');
    c.editEmail.set('jose.cruz@castillasorsogon.gov.ph');
    const pending = c.createAccount();

    const http = TestBed.inject(HttpTestingController);
    await tick();
    const created = http.expectOne((r) => r.url === '/staff/users' && r.method === 'POST');
    expect(created.request.body).toEqual({
      email: 'jose.cruz@castillasorsogon.gov.ph', fullName: 'Insp. Jose Cruz', roles: ['evaluator'],
    });
    created.flush({
      ...member({ id: 'USR-2', email: 'jose.cruz@castillasorsogon.gov.ph', fullName: 'Insp. Jose Cruz', status: 'Pending' }),
      nextStep: 'The officer must set a password through the account-recovery flow before they can sign in.',
    });
    await tick();
    const stages = http.expectOne('/staff/users/USR-2/access/stages');
    expect(stages.request.body).toEqual({ stages: ['Fire Safety'] });
    stages.flush({});
    await tick();
    const forms = http.expectOne('/staff/users/USR-2/access/forms');
    // Every form by default — an officer assigned none can reach nothing.
    expect((forms.request.body as { permitTypes: string[] }).permitTypes.length).toBe(17);
    forms.flush({});
    await tick();
    const level = http.expectOne('/staff/users/USR-2/access/level');
    expect(level.request.body).toEqual({ level: 'view-edit' });
    level.flush({});
    await tick();
    http.expectOne((r) => r.url === '/staff/users' && r.method === 'GET').flush({
      data: [member(), member({ id: 'USR-2', email: 'jose.cruz@castillasorsogon.gov.ph', status: 'Pending' })],
    });
    await tick();
    flushAccess(http, { 'USR-2': { level: 'view-edit', evaluationStages: ['Fire Safety'] } });
    await pending;

    expect(c.view()).toBe('detail');
  });

  it('an administrator cannot delete, nor edit a super admin', async () => {
    const fixture = await mount(
      (http) => http.expectOne('/staff/users').flush({
        data: [member({ id: 'USR-1', roles: ['super-admin'] }), member({ id: 'USR-2', email: 'two@castillasorsogon.gov.ph' })],
      }),
      {},
      administrator(),
    );
    const c = page(fixture);
    const superAdmin = c.filteredUsers().find((u) => u.id === 'USR-1');
    const evaluator = c.filteredUsers().find((u) => u.id === 'USR-2');

    // The server refuses both; the portal does not offer them.
    expect(c.mayManage(superAdmin)).toBe(false);
    expect(c.mayManage(evaluator)).toBe(true);
    expect(c.deleteRefusal(evaluator)).toContain('Only a super admin');
    const labels = [...(fixture.nativeElement as HTMLElement).querySelectorAll('[aria-label]')]
      .map((n) => (n.getAttribute('aria-label') ?? '').toLowerCase());
    expect(labels.some((l) => l.includes('delete'))).toBe(false);
  });

  it('the super admin deletes, and is told whether it was deleted or retired', async () => {
    const fixture = await mount((http) => http.expectOne('/staff/users').flush({ data: [member()] }));
    const c = page(fixture);
    c.requestDelete(c.filteredUsers()[0]);
    expect(c.deleteTarget()).not.toBeNull();
    const pending = c.confirmDelete();

    const http = TestBed.inject(HttpTestingController);
    await tick();
    const removal = http.expectOne('/staff/users/USR-1');
    expect(removal.request.method).toBe('DELETE');
    removal.flush({ mode: 'retired', detail: 'The account made decisions on record, so it was retired rather than deleted.' });
    await tick();
    http.expectOne('/staff/users').flush({ data: [] });
    await pending;

    expect(c.view()).toBe('list');
    expect(c.filteredUsers().length).toBe(0);
  });

  it('refuses deleting your own account before sending anything', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/users').flush({ data: [member({ email: 'paul@lguids.com.ph', roles: ['super-admin'] })] }),
    );
    const c = page(fixture);
    c.requestDelete(c.filteredUsers()[0]);

    TestBed.inject(HttpTestingController).verify();
    expect(c.deleteTarget()).toBeNull();
    expect(c.deleteRefusal(c.filteredUsers()[0])).toContain('your own account');
  });

  it('disabling keeps the account instead of removing the row', async () => {
    const fixture = await mount((http) => http.expectOne('/staff/users').flush({ data: [member()] }));
    const c = page(fixture);
    c.requestDisable(c.filteredUsers()[0]);
    const pending = c.confirmDisable('No longer with the LGU.');

    const http = TestBed.inject(HttpTestingController);
    await tick();
    http.expectOne('/staff/users/USR-1/disable').flush({});
    await tick();
    http.expectOne('/staff/users').flush({ data: [member({ status: 'Disabled' })] });
    await tick();
    flushAccess(http);
    await pending;

    const rows = c.filteredUsers();
    // Still there. Its past decisions stay attributable.
    expect(rows.length).toBe(1);
    expect(rows[0]!.status).toBe('Inactive');
  });

  it('a disabled account can be enabled again', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/users').flush({ data: [member({ status: 'Disabled' })] }),
    );
    const c = page(fixture);
    c.requestEnable(c.filteredUsers()[0]);
    const pending = c.confirmEnable('Rehired.');

    const http = TestBed.inject(HttpTestingController);
    await tick();
    http.expectOne('/staff/users/USR-1/enable').flush({});
    await tick();
    http.expectOne('/staff/users').flush({ data: [member({ status: 'Active' })] });
    await tick();
    flushAccess(http);
    await pending;

    expect(c.filteredUsers()[0]!.status).toBe('Active');
  });

  it('never invents a session list', async () => {
    const fixture = await mount((http) => http.expectOne('/staff/users').flush({ data: [member()] }));
    const c = page(fixture);
    c.openDetail(c.filteredUsers()[0]);
    c.selectUserDetailTab('security');

    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/staff/users/USR-1/sessions').flush({ data: [] });
    await tick();
    fixture.detectChanges();

    expect(c.sessions().length).toBe(0);
    expect(text(fixture)).toContain('not signed in anywhere');
  });

  it('does not say an account is signed in nowhere when it could not look', async () => {
    const fixture = await mount((http) => http.expectOne('/staff/users').flush({ data: [member()] }));
    const c = page(fixture);
    c.openDetail(c.filteredUsers()[0]);
    c.selectUserDetailTab('security');

    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/staff/users/USR-1/sessions').flush(
      { type: 'about:blank', title: 'Server Error', status: 500 },
      { status: 500, statusText: 'Server Error' },
    );
    await tick();
    fixture.detectChanges();

    expect(text(fixture)).toContain('not known whether this account is signed in');
    expect(text(fixture)).not.toContain('is not signed in anywhere.');
  });

  it('reads Activity from the real audit log, and says so when the viewer may not read it', async () => {
    const fixture = await mount(
      (http) => http.expectOne('/staff/users').flush({ data: [member()] }),
      {},
      administrator(),
    );
    const c = page(fixture);
    c.openDetail(c.filteredUsers()[0]);
    c.selectUserDetailTab('activity');

    const http = TestBed.inject(HttpTestingController);
    const forbidden = { type: 'about:blank', title: 'Forbidden', status: 403 };
    http.expectOne((r) => r.url === '/staff/audit' && r.params.get('actorAccountId') === 'USR-1')
      .flush(forbidden, { status: 403, statusText: 'Forbidden' });
    http.expectOne('/staff/audit/account/USR-1').flush(forbidden, { status: 403, statusText: 'Forbidden' });
    await tick();
    fixture.detectChanges();

    // No invented "Reviewed an application, 2 days ago" — the real trail, or
    // why it is not shown.
    expect(text(fixture)).toContain('needs the audit permission');
  });

  it('refuses to disable the last enabled super admin, before sending anything', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/users').flush({ data: [
        member({ id: 'USR-1', roles: ['super-admin'], email: 'only@castillasorsogon.gov.ph' }),
        member({ id: 'USR-2', roles: ['evaluator'], email: 'other@castillasorsogon.gov.ph' }),
      ] }),
    );
    const c = page(fixture);
    c.requestDisable(c.filteredUsers().find((u) => u.id === 'USR-1'));

    TestBed.inject(HttpTestingController).verify();
    expect(c.disableTarget()).toBeNull();
    expect(c.disableRefused()).toContain('last enabled super admin');
  });

  it('allows disabling a super admin while another remains enabled', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/users').flush({ data: [
        member({ id: 'USR-1', roles: ['super-admin'] }),
        member({ id: 'USR-2', roles: ['super-admin'], email: 'two@castillasorsogon.gov.ph' }),
      ] }),
    );
    const c = page(fixture);
    c.requestDisable(c.filteredUsers()[0]);

    expect(c.disableRefused()).toBe('');
    expect(c.disableTarget()).not.toBeNull();
  });

  it('counts only ENABLED super admins toward the last-one guard', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/users').flush({ data: [
        member({ id: 'USR-1', roles: ['super-admin'] }),
        member({ id: 'USR-2', roles: ['super-admin'], status: 'Disabled', email: 'two@castillasorsogon.gov.ph' }),
      ] }),
    );
    const c = page(fixture);
    c.requestDisable(c.filteredUsers().find((u) => u.id === 'USR-1'));

    expect(c.disableRefused()).toContain('last enabled super admin');
  });

  it('does not present an absent directory as an empty one', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/users').flush(
        { type: 'about:blank', title: 'Not Found', status: 404 },
        { status: 404, statusText: 'Not Found' },
      ),
    );

    expect(text(fixture)).toContain('no staff directory yet');
    expect(text(fixture)).not.toContain('No accounts match your search');
  });

  it('does not present a failed read as an empty one', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/users').flush(
        { type: 'about:blank', title: 'Server Error', status: 500 },
        { status: 500, statusText: 'Server Error' },
      ),
    );

    expect(text(fixture)).toContain('not a picture of who holds an account');
    expect(text(fixture)).not.toContain('No accounts match your search');
  });
});
