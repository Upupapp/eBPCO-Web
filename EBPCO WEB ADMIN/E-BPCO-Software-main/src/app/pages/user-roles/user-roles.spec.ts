import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { UserRoles } from './user-roles';
import { API_BASE_URL } from '../../core/api/api.config';

/**
 * The staff directory.
 *
 * Two rulings are pinned here, both from the owner on 2026-08-31.
 *
 * **No delete.** This page used to offer "Remove user?", and confirming it ran
 * `rows.filter(...)` — the row was gone. An officer's name is on every
 * application they touched, so deleting the account leaves that audit trail
 * pointing at nobody, and a permit decided by a person the system can no longer
 * identify is a permit nobody can defend. Accounts are disabled and kept.
 *
 * **The list is real, or it says it is not.** It used to be `buildUsers()` —
 * names and departments invented from hardcoded arrays. A fabricated LIST is
 * worse than a fabricated chart: an administrator believes these people hold
 * accounts, and the absence of somebody who does is invisible.
 */
async function mount(
  respond: (http: HttpTestingController) => void,
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
  const fixture = TestBed.createComponent(UserRoles);
  fixture.detectChanges();
  respond(TestBed.inject(HttpTestingController));
  await fixture.whenStable();
  await new Promise((resolve) => setTimeout(resolve, 0));
  fixture.detectChanges();
  return fixture;
}

const member = (over: Record<string, unknown> = {}) => ({
  id: 'USR-1',
  fullName: 'Engr. Ana Reyes',
  email: 'ana.reyes@castillasorsogon.gov.ph',
  role: 'evaluator',
  status: 'active',
  level: 'view',
  permitTypes: ['Fencing Permit'],
  lastSignInAt: null,
  ...over,
});

describe('User directory', () => {
  it('collects no reason it cannot send', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/users').flush({ data: [member()] }),
    );
    const c = fixture.componentInstance as unknown as {
      openDetail(r: unknown): void; startEditAccess(): void; filteredUsers(): unknown[];
    };
    c.openDetail(c.filteredUsers()[0]);
    c.startEditAccess();
    fixture.detectChanges();

    // Neither access endpoint accepts a reason -- both are `.strict()` -- so a
    // field asking for one was collecting text and discarding it, which is the
    // F-24 defect exactly. Asking an administrator to justify a change and then
    // dropping the justification is worse than not asking.
    const text = ((fixture.nativeElement as HTMLElement).textContent ?? '').toLowerCase();
    expect(text).not.toContain('reason for this change');
    expect(fixture.nativeElement.querySelector('#accessReason')).toBeNull();
  });

  it('sends forms first, then level, as two PUTs', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/users').flush({ data: [member()] }),
    );
    const c = fixture.componentInstance as unknown as {
      openDetail(r: unknown): void; startEditAccess(): void;
      setAccessLevel(l: string): void; saveAccess(): Promise<void>; filteredUsers(): unknown[];
    };
    c.openDetail(c.filteredUsers()[0]);
    c.startEditAccess();
    c.setAccessLevel('view-edit');
    const pending = c.saveAccess();

    const http = TestBed.inject(HttpTestingController);
    // The server has TWO endpoints, not one. The old code posted a combined
    // body to /roles, which takes `{ roles }` alone -- it could never have
    // landed (F-31).
    const forms = http.expectOne('/staff/users/USR-1/access/forms');
    expect(forms.request.method).toBe('PUT');
    expect(forms.request.body).toEqual({ permitTypes: ['Fencing Permit'] });
    forms.flush({ permitTypes: ['Fencing Permit'] });

    await new Promise((resolve) => setTimeout(resolve, 0));
    const level = http.expectOne('/staff/users/USR-1/access/level');
    expect(level.request.method).toBe('PUT');
    expect(level.request.body).toEqual({ level: 'view-edit' });
    level.flush({ level: 'view-edit' });

    await new Promise((resolve) => setTimeout(resolve, 0));
    http.expectOne('/staff/users').flush({ data: [member({ level: 'view-edit' })] });
    await pending;
  });

  it('says which half landed when the second call fails', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/users').flush({ data: [member()] }),
    );
    const c = fixture.componentInstance as unknown as {
      openDetail(r: unknown): void; startEditAccess(): void;
      saveAccess(): Promise<void>; accessError(): string; filteredUsers(): unknown[];
    };
    c.openDetail(c.filteredUsers()[0]);
    c.startEditAccess();
    const pending = c.saveAccess();

    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/staff/users/USR-1/access/forms').flush({ permitTypes: ['Fencing Permit'] });
    await new Promise((resolve) => setTimeout(resolve, 0));
    http.expectOne('/staff/users/USR-1/access/level').flush(
      { type: 'about:blank', title: 'Conflict', status: 409,
        detail: 'This is the last super admin and cannot be demoted.' },
      { status: 409, statusText: 'Conflict' },
    );
    await pending;

    // An administrator who does not know what took effect will guess, and
    // guessing about access is how somebody keeps authority they were meant
    // to lose.
    expect(c.accessError()).toContain('forms were updated but the level was not');
    expect(c.accessError()).toContain('last super admin');
  });

  it('offers no way to delete an account', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/users').flush({ data: [member()] }),
    );
    const el: HTMLElement = fixture.nativeElement;
    const labels = [...el.querySelectorAll('[aria-label]')].map((n) =>
      (n.getAttribute('aria-label') ?? '').toLowerCase(),
    );

    expect(labels.some((l) => l.includes('remove'))).toBe(false);
    expect(labels.some((l) => l.includes('delete'))).toBe(false);
    expect(labels.some((l) => l.includes('disable'))).toBe(true);
  });

  it('disabling keeps the account instead of removing the row', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/users').flush({ data: [member()] }),
    );
    const c = fixture.componentInstance as unknown as {
      requestDisable(r: unknown): void; confirmDisable(): void;
      filteredUsers(): { name: string; status: string }[];
    };
    c.requestDisable(c.filteredUsers()[0]);
    c.confirmDisable();
    fixture.detectChanges();

    const rows = c.filteredUsers();
    // Still there. Its past decisions stay attributable.
    expect(rows.length).toBe(1);
    expect(rows[0].name).toBe('Engr. Ana Reyes');
    expect(rows[0].status).toBe('Inactive');
  });

  it('a disabled account can be enabled again', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/users').flush({ data: [member({ status: 'disabled' })] }),
    );
    const c = fixture.componentInstance as unknown as {
      enableUser(r: unknown): void; filteredUsers(): { status: string }[];
    };
    expect(c.filteredUsers()[0].status).toBe('Inactive');

    c.enableUser(c.filteredUsers()[0]);
    fixture.detectChanges();
    expect(c.filteredUsers()[0].status).toBe('Active');
  });

  it('describes an account by its access, not a job title', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/users').flush({ data: [member({ level: 'view-edit', permitTypes: ['Fencing Permit', 'Sign Permit'] })],
      }),
    );
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    // An ADMIN sub-type is defined by accessibility — which forms, and view or
    // view-and-edit — not by what the post is called.
    expect(text).toContain('View and edit');
    expect(text).toContain('2 forms');
  });

  it('says an account has no forms rather than leaving it blank', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/users').flush({ data: [member({ permitTypes: [] })] }),
    );

    // An account with no forms can see nothing. A blank cell reads as
    // "unremarkable"; this one is remarkable.
    expect(fixture.nativeElement.textContent).toContain('No forms assigned');
  });

  it('seeds an access edit from what the account holds, not from its labels', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/users').flush({ data: [member({ level: 'view-edit', permitTypes: ['Fencing Permit', 'Sign Permit'] })],
      }),
    );
    const c = fixture.componentInstance as unknown as {
      openDetail(r: unknown): void; startEditAccess(): void;
      accessLevel(): string; isAccessForm(t: string): boolean; accessFormCount(): number;
      filteredUsers(): unknown[];
    };
    c.openDetail(c.filteredUsers()[0]);
    c.startEditAccess();

    // From the raw values, never by parsing "2 forms" back out of a label — a
    // round trip through display text is how an edit quietly grants something
    // nobody chose.
    expect(c.accessLevel()).toBe('view-edit');
    expect(c.accessFormCount()).toBe(2);
    expect(c.isAccessForm('Fencing Permit')).toBe(true);
    expect(c.isAccessForm('Demolition Permit')).toBe(false);
  });

  
  it('will not save an access change that grants no forms', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/users').flush({ data: [member()] }),
    );
    const c = fixture.componentInstance as unknown as {
      openDetail(r: unknown): void; startEditAccess(): void;
      toggleAccessForm(t: string): void; saveAccess(): Promise<void>;
      accessError(): string; filteredUsers(): unknown[];
    };
    c.openDetail(c.filteredUsers()[0]);
    c.startEditAccess();
    c.toggleAccessForm('Fencing Permit');
    await c.saveAccess();

    TestBed.inject(HttpTestingController).verify();
    expect(c.accessError()).toContain('at least one form');
  });

  
  
  it('never invents a session list', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/users').flush({ data: [member()] }),
    );
    const c = fixture.componentInstance as unknown as {
      openDetail(r: unknown): void; selectUserDetailTab(t: string): void;
      sessions(): unknown[]; filteredUsers(): unknown[];
    };
    c.openDetail(c.filteredUsers()[0]);
    c.selectUserDetailTab('security');

    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/staff/users/USR-1/sessions').flush({ data: [] });
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();

    // This is the screen an administrator opens when they suspect an account is
    // compromised. Generated devices and IPs would answer with invented
    // reassurance.
    expect(c.sessions().length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('not signed in anywhere');
  });

  it('does not say an account is signed in nowhere when it could not look', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/users').flush({ data: [member()] }),
    );
    const c = fixture.componentInstance as unknown as {
      openDetail(r: unknown): void; selectUserDetailTab(t: string): void;
      filteredUsers(): unknown[];
    };
    c.openDetail(c.filteredUsers()[0]);
    c.selectUserDetailTab('security');

    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/staff/users/USR-1/sessions').flush(
      { type: 'about:blank', title: 'Server Error', status: 500 },
      { status: 500, statusText: 'Server Error' },
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('not known whether this account is signed in');
    expect(text).not.toContain('is not signed in anywhere.');
  });

  it('refuses to disable the last enabled super admin, before sending anything', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/users').flush({ data: [
          member({ id: 'USR-1', role: 'super-admin', fullName: 'Only Super Admin' }),
          member({ id: 'USR-2', role: 'evaluator', email: 'other@castillasorsogon.gov.ph' }),
        ],
      }),
    );
    const c = fixture.componentInstance as unknown as {
      requestDisable(r: unknown): void; disableRefused(): string;
      disableTarget(): unknown; filteredUsers(): { serverRole: string }[];
    };
    const superAdmin = c.filteredUsers().find((u) => u.serverRole === 'super-admin');
    c.requestDisable(superAdmin);

    // The single failure this product cannot repair from inside itself: an LGU
    // with no super admin has nobody who can grant anybody access, including
    // to undo this.
    TestBed.inject(HttpTestingController).verify();
    expect(c.disableTarget()).toBeNull();
    expect(c.disableRefused()).toContain('last enabled super admin');
  });

  it('allows disabling a super admin while another remains enabled', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/users').flush({ data: [
          member({ id: 'USR-1', role: 'super-admin' }),
          member({ id: 'USR-2', role: 'super-admin', email: 'two@castillasorsogon.gov.ph' }),
        ],
      }),
    );
    const c = fixture.componentInstance as unknown as {
      requestDisable(r: unknown): void; disableRefused(): string;
      disableTarget(): unknown; filteredUsers(): unknown[];
    };
    c.requestDisable(c.filteredUsers()[0]);

    // The guard must not be a blanket refusal on the role — it counts.
    expect(c.disableRefused()).toBe('');
    expect(c.disableTarget()).not.toBeNull();
  });

  it('counts only ENABLED super admins toward the last-one guard', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/users').flush({ data: [
          member({ id: 'USR-1', role: 'super-admin' }),
          member({
            id: 'USR-2', role: 'super-admin', status: 'disabled',
            email: 'two@castillasorsogon.gov.ph',
          }),
        ],
      }),
    );
    const c = fixture.componentInstance as unknown as {
      requestDisable(r: unknown): void; disableRefused(): string; filteredUsers(): unknown[];
    };
    c.requestDisable(c.filteredUsers()[0]);

    // A disabled super admin cannot grant anybody anything, so it is not a
    // second one. Counting it would let the last usable account be switched off.
    expect(c.disableRefused()).toContain('last enabled super admin');
  });

  it('does not present an absent directory as an empty one', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/users').flush(
        { type: 'about:blank', title: 'Not Found', status: 404 },
        { status: 404, statusText: 'Not Found' },
      ),
    );
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('no staff directory yet');
    expect(text).not.toContain('No users match your search');
  });

  it('does not present a failed read as an empty one', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/users').flush(
        { type: 'about:blank', title: 'Server Error', status: 500 },
        { status: 500, statusText: 'Server Error' },
      ),
    );
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('not a picture of who holds an account');
    expect(text).not.toContain('No users match your search');
  });
});
