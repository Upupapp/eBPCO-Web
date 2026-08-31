import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture } from '@angular/core/testing';

import { Register } from './register';
import { USER_PORTAL_BASE_URL } from '../../core/config/user-portal.config';
import { API_BASE_URL } from '../../core/api/api.config';

/**
 * The account-request page.
 *
 * Pinned hard because of what this page used to be: a form that collected a
 * password and, on a valid submit, navigated to `/login` without sending
 * anything anywhere. It had no suite, so nothing failed, and it looked to a new
 * officer exactly like a successful registration (F-24).
 *
 * It now raises a real request, and the tests that matter still assert
 * ABSENCE — no password leaves this page, and the page never claims an account
 * exists. Owner ruling, 2026-08-31: sign-up on the admin portal is not allowed,
 * least of all as super admin, and every request is subject to approval.
 */
function mount(portal = ''): ComponentFixture<Register> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [Register],
    providers: [
      provideRouter([]),
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: API_BASE_URL, useValue: '' },
      { provide: USER_PORTAL_BASE_URL, useValue: portal },
    ],
  });
  const fixture = TestBed.createComponent(Register);
  fixture.detectChanges();
  return fixture;
}

/** Fills every field with something valid and ticks one form. */
function fillValid(fixture: ComponentFixture<Register>): void {
  const c = fixture.componentInstance as unknown as {
    fullName: string; email: string; mobileNumber: string; position: string;
    justification: string; toggle(t: string): void;
  };
  c.fullName = 'Engr. Ana Reyes';
  c.email = 'ana.reyes@castillasorsogon.gov.ph';
  c.mobileNumber = '09171234567';
  c.position = 'Municipal Engineering Office — Evaluator';
  c.justification = 'Assigned to evaluate structural submissions.';
  c.toggle('Building Permit – New Construction');
  fixture.detectChanges();
}

describe('Register — requesting an account', () => {
  it('never collects a password', () => {
    const el: HTMLElement = mount().nativeElement;

    // A credential chosen before an account exists is a credential stored for
    // an account that may never be approved. The invariant is that no password
    // field exists — the word itself appears in the copy saying exactly that,
    // so a blanket text check would fail on the reassurance.
    expect(el.querySelectorAll('input[type="password"]').length).toBe(0);
    expect(el.querySelector('input[autocomplete="new-password"]')).toBeNull();
    expect((el.textContent ?? '').toLowerCase()).toContain('no password is set here');
  });

  it('defaults to the least access: view only, no forms ticked', async () => {
    const fixture = mount();
    // ngModel writes the radio's checked state on a later turn than the first
    // detectChanges, so reading it immediately sees nothing selected and passes
    // for entirely the wrong reason.
    await fixture.whenStable();
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const ticked = el.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked');
    const level = el.querySelector<HTMLInputElement>('input[name="requestedLevel"]:checked');

    // A request arriving with every form pre-selected is one an approver waves
    // through, and the assignment that results is nobody's decision.
    expect(ticked.length).toBe(0);
    expect(level?.value).toBe('view');
  });

  it('offers every published permit type as a form, and no more', () => {
    const el: HTMLElement = mount().nativeElement;

    expect(el.querySelectorAll('input[type="checkbox"]').length).toBe(19);
  });

  it('sends nothing until the form is valid', () => {
    const fixture = mount();
    (fixture.componentInstance as unknown as { onSubmit(f: unknown): void })
      .onSubmit({ invalid: true });

    TestBed.inject(HttpTestingController).verify();
  });

  it('refuses a request with no forms chosen', async () => {
    const fixture = mount();
    const c = fixture.componentInstance as unknown as {
      fullName: string; email: string; mobileNumber: string; position: string;
      justification: string; onSubmit(f: unknown): Promise<void>;
    };
    c.fullName = 'Engr. Ana Reyes';
    c.email = 'ana@castillasorsogon.gov.ph';
    c.mobileNumber = '09171234567';
    c.position = 'MEO';
    c.justification = 'Evaluations.';

    await c.onSubmit({ invalid: false });

    // No forms means an account that can see nothing — a request nobody can
    // sensibly approve.
    TestBed.inject(HttpTestingController).verify();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('at least one form');
  });

  it('posts the request, carrying the chosen forms and level', async () => {
    const fixture = mount();
    fillValid(fixture);
    const pending = (fixture.componentInstance as unknown as {
      onSubmit(f: unknown): Promise<void>;
    }).onSubmit({ invalid: false });

    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne('/auth/access-request');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.requestedPermitTypes).toEqual(['Building Permit – New Construction']);
    expect(req.request.body.requestedLevel).toBe('view');
    // The password is not merely absent from the form — it is absent from the wire.
    expect(Object.keys(req.request.body)).not.toContain('password');

    req.flush(null, { status: 202, statusText: 'Accepted' });
    await pending;
    http.verify();
  });

  it('never says an account was created', async () => {
    const fixture = mount();
    fillValid(fixture);
    const pending = (fixture.componentInstance as unknown as {
      onSubmit(f: unknown): Promise<void>;
    }).onSubmit({ invalid: false });

    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/auth/access-request').flush(null, { status: 202, statusText: 'Accepted' });
    await pending;
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    // 202 is returned identically whether or not the address is known, so the
    // only true statement is that the request was accepted for review.
    expect(text).toContain('No account exists yet');
    expect(text.toLowerCase()).not.toContain('account has been created');
    expect(text.toLowerCase()).not.toContain('account created');
    // "if it is approved" is the honest conditional and must survive; what must
    // never appear is a claim that approval HAS happened.
    expect(text.toLowerCase()).not.toContain('has been approved');
    expect(text.toLowerCase()).not.toContain('your request was approved');
  });

  it('distinguishes a missing capability from a failed request', async () => {
    const fixture = mount();
    fillValid(fixture);
    const pending = (fixture.componentInstance as unknown as {
      onSubmit(f: unknown): Promise<void>;
    }).onSubmit({ invalid: false });

    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/auth/access-request').flush(
      { type: 'about:blank', title: 'Not Found', status: 404 },
      { status: 404, statusText: 'Not Found' },
    );
    await pending;
    fixture.detectChanges();

    // A 404 means this deployment has no such endpoint — different from "your
    // request failed", and it leads to different advice. Telling an officer to
    // retry something that cannot work wastes their afternoon.
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('cannot take access requests yet');
    expect(text).toContain('Nothing was submitted');
  });

  it('invents no contact channel', () => {
    const text = (mount().nativeElement as HTMLElement).textContent ?? '';

    expect(text).not.toMatch(/@[a-z0-9.-]+\.[a-z]{2,}\b(?!.*example)/i);
    expect(text).not.toMatch(/\b(?:09\d{9}|\+639\d{9})\b/);
  });

  it('links business owners onward only when that portal is configured', () => {
    expect(mount('').nativeElement.querySelector('.applicant-note a')).toBeNull();
    expect(
      mount('https://apply.castilla.gov.ph')
        .nativeElement.querySelector('.applicant-note a')
        ?.getAttribute('href'),
    ).toBe('https://apply.castilla.gov.ph');
  });
});
