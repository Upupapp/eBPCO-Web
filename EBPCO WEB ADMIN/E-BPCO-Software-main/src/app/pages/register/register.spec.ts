import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { Register } from './register';
import { USER_PORTAL_BASE_URL } from '../../core/config/user-portal.config';

/**
 * The account-request page.
 *
 * Pinned because of what this page used to be: a form that collected a password
 * and, on a valid submit, navigated to `/login` without sending anything
 * anywhere. It passed the build and the suite — there was no suite — and it
 * looked, to a new officer, exactly like a successful registration.
 *
 * The first two tests are the ones that matter. They assert absence, which is
 * the only way to state this defect: no credential input on the page, and no
 * request leaving it.
 */
function mount(portal: string) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [Register],
    providers: [
      provideRouter([]),
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: USER_PORTAL_BASE_URL, useValue: portal },
    ],
  });
  const fixture = TestBed.createComponent(Register);
  fixture.detectChanges();
  return fixture;
}

describe('Register', () => {
  it('collects no credentials', () => {
    const el: HTMLElement = mount('').nativeElement;

    expect(el.querySelectorAll('input[type="password"]').length).toBe(0);
    expect(el.querySelectorAll('input').length).toBe(0);
    expect(el.querySelector('form')).toBeNull();
  });

  it('sends nothing anywhere', () => {
    mount('');
    // If this page ever regains a submit path, it must be a real one — an
    // unexpected request here is a better failure than a silent redirect.
    TestBed.inject(HttpTestingController).verify();
  });

  it('says accounts are issued by the LGU, not created here', () => {
    const text = (mount('').nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('cannot be created here');
    expect(text).toContain('LGU administrator');
  });

  it('invents no contact channel', () => {
    const text = (mount('').nativeElement as HTMLElement).textContent ?? '';

    // The LGU has not told this repository its provisioning channel. A page
    // that guessed one would be confidently wrong to every officer who read it.
    expect(text).not.toMatch(/@[a-z0-9.-]+\.[a-z]{2,}/i);
    expect(text).not.toMatch(/\b(?:09\d{9}|\+639\d{9}|\(\d{2,4}\)\s*\d{3})\b/);
  });

  it('offers no applicant link when the portal origin is unset', () => {
    const el: HTMLElement = mount('').nativeElement;

    // Scoped to the applicant note: the "Sign in" link is a routerLink and
    // renders an href of its own, so a bare a[href] check passes for the wrong
    // reason.
    expect(el.querySelector('.applicant-note a')).toBeNull();
    expect(el.textContent).toContain('it is for LGU staff');
  });

  it('links applicants to the portal once its origin is configured', () => {
    const el: HTMLElement = mount('https://apply.castilla.gov.ph').nativeElement;
    const link = el.querySelector<HTMLAnchorElement>('.applicant-note a');

    expect(link?.getAttribute('href')).toBe('https://apply.castilla.gov.ph');
  });
});
