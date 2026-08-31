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
  it('offers no way to delete an account', async () => {
    const fixture = await mount((http) =>
      http.expectOne('/staff/users').flush({ items: [member()] }),
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
      http.expectOne('/staff/users').flush({ items: [member()] }),
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
      http.expectOne('/staff/users').flush({ items: [member({ status: 'disabled' })] }),
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
      http.expectOne('/staff/users').flush({
        items: [member({ level: 'view-edit', permitTypes: ['Fencing Permit', 'Sign Permit'] })],
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
      http.expectOne('/staff/users').flush({ items: [member({ permitTypes: [] })] }),
    );

    // An account with no forms can see nothing. A blank cell reads as
    // "unremarkable"; this one is remarkable.
    expect(fixture.nativeElement.textContent).toContain('No forms assigned');
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
