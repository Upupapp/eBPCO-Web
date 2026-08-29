import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NgForm } from '@angular/forms';

import { Login } from './login';
import { SessionService } from '../../core/session/session.service';

/**
 * The sign-in button's pending state.
 *
 * `signingIn` was set on both sides of the network call and read by nothing —
 * declared, written twice, and invisible to the type checker, the compiler and
 * the suite, because a signal no template reads is not an error anywhere. The
 * button stayed live for the whole request, so a slow sign-in could be
 * submitted again and again, each click firing another /auth/token post.
 *
 * Both assertions below fail against the template as it was.
 */
describe('Login — the sign-in button while a request is in flight', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<Login>>;
  let component: Login;
  let button: HTMLButtonElement;
  /** Resolves/rejects the pending signIn so the in-flight window is observable. */
  let settle: { resolve: () => void; reject: (e: Error) => void };

  beforeEach(async () => {
    const session = {
      signIn: () =>
        new Promise<void>((resolve, reject) => {
          settle = { resolve: () => resolve(), reject };
        }),
    };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        // A successful sign-in navigates to /dashboard. With no route to match,
        // that navigation rejects as an unhandled NG04002 — which Vitest reports
        // as an error on the run and warns "might cause false positive tests".
        provideRouter([{ path: 'dashboard', children: [] }]),
        { provide: SessionService, useValue: session },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
    button = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
  });

  /** A valid form, so onSubmit reaches the network call rather than bailing on validation. */
  const submitValid = (): Promise<void> => {
    component.email = 'officer@lgu.gov.ph';
    component.password = 'correct-horse';
    return component.onSubmit({ invalid: false } as NgForm);
  };

  it('starts enabled and reading Login Account', () => {
    expect(button.disabled).toBe(false);
    expect(button.textContent?.trim()).toBe('Login Account');
  });

  it('disables itself and says so while signing in', async () => {
    const pending = submitValid();
    fixture.detectChanges();

    expect(button.disabled).toBe(true);
    expect(button.textContent?.trim()).toBe('Signing in…');
    expect(button.getAttribute('aria-busy')).toBe('true');

    settle.resolve();
    await pending;
  });

  it('comes back enabled when sign-in fails, so the officer can retry', async () => {
    const pending = submitValid();
    fixture.detectChanges();
    expect(button.disabled).toBe(true);

    settle.reject(new Error('Sign-in failed.'));
    await pending;
    fixture.detectChanges();

    expect(button.disabled).toBe(false);
    expect(button.getAttribute('aria-busy')).toBeNull();
    // The server's own words, surfaced rather than swallowed.
    expect(fixture.nativeElement.textContent).toContain('Sign-in failed.');
  });
});
