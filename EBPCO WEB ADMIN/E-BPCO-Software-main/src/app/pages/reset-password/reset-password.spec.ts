import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NgForm } from '@angular/forms';

import { ResetPassword } from './reset-password';
import { IdentityApi } from '../../core/api/identity.api';

/**
 * Where the emailed "set your password" link lands.
 *
 * `token` is bound from the `?token=` query param by `withComponentInputBinding`
 * in production; these tests set the `input()` signal directly (the same
 * technique `payments.spec.ts` uses for `applicationId`) rather than routing
 * through a real navigation, which the router's input-binding tests already
 * cover elsewhere.
 */
type ResetOutcome =
  | { kind: 'done' } | { kind: 'invalid-link' } | { kind: 'weak-password'; message: string };

describe('ResetPassword', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<ResetPassword>>;
  let component: ResetPassword;
  /** What the last resetPassword call received, and what it will resolve to. */
  let lastCall: { token: string; password: string } | undefined;
  let nextResult: ResetOutcome;

  beforeEach(async () => {
    lastCall = undefined;
    nextResult = { kind: 'done' };
    const identity = {
      resetPassword: (token: string, password: string): Promise<ResetOutcome> => {
        lastCall = { token, password };
        return Promise.resolve(nextResult);
      },
    };

    await TestBed.configureTestingModule({
      imports: [ResetPassword],
      providers: [
        provideRouter([{ path: 'login', children: [] }]),
        { provide: IdentityApi, useValue: identity },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPassword);
    component = fixture.componentInstance;
  });

  const MOUNT_BUDGET = 20_000;

  // Composition-compliant (uppercase, lowercase, digit, punctuation, 12+
  // chars) — see core/domain/password-policy.ts. A password missing any of
  // those is now refused before match-checking or the API call even happen,
  // which these tests are not about.
  const VALID_PASSWORD = 'A-long-enough-passphrase-9!';

  const submitValid = (): Promise<void> => {
    component.password = VALID_PASSWORD;
    component.confirmPassword = VALID_PASSWORD;
    return component.onSubmit({ invalid: false } as NgForm);
  };

  it('shows an honest "incomplete link" state rather than a blank form when there is no token', () => {
    fixture.componentRef.setInput('token', undefined);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('This link is incomplete');
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  }, MOUNT_BUDGET);

  it('refuses to submit when the two passwords do not match, without calling the API', async () => {
    fixture.componentRef.setInput('token', 'a-real-token');
    fixture.detectChanges();

    component.password = VALID_PASSWORD;
    component.confirmPassword = 'A-different-one-entirely-9!';
    await component.onSubmit({ invalid: false } as NgForm);

    expect(lastCall).toBeUndefined();
    expect(component.formError()).toContain('do not match');
  }, MOUNT_BUDGET);

  it('sends the token and the new password, and shows success on "done"', async () => {
    fixture.componentRef.setInput('token', 'a-real-token');
    fixture.detectChanges();
    nextResult = { kind: 'done' };

    await submitValid();
    fixture.detectChanges();

    expect(lastCall).toEqual({ token: 'a-real-token', password: VALID_PASSWORD });
    expect(fixture.nativeElement.textContent).toContain('Password set');
  }, MOUNT_BUDGET);

  it('tells an expired/used/invalid link apart from a form error', async () => {
    fixture.componentRef.setInput('token', 'a-real-token');
    fixture.detectChanges();
    nextResult = { kind: 'invalid-link' };

    await submitValid();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('That link is no longer valid');
  }, MOUNT_BUDGET);

  it('surfaces the server\'s own reason for a weak password, in the field, on the form', async () => {
    fixture.componentRef.setInput('token', 'a-real-token');
    fixture.detectChanges();
    nextResult = { kind: 'weak-password', message: 'Too easy to guess.' };

    await submitValid();
    fixture.detectChanges();

    expect(component.formError()).toBe('Too easy to guess.');
    // Still on the form — a weak password is not "the link is invalid".
    expect(fixture.nativeElement.querySelector('form')).not.toBeNull();
  }, MOUNT_BUDGET);
});
