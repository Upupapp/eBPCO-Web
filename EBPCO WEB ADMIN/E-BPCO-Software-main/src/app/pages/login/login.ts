import { Component, inject, input, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthLayout } from '../../shared/auth-layout/auth-layout';
import { DilgSeal } from '../../shared/dilg-seal/dilg-seal';
import { SessionService } from '../../core/session/session.service';
import { IdentityApi } from '../../core/api/identity.api';
import { ApiError } from '../../core/api/problem';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, AuthLayout, DilgSeal],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  /**
   * `/login?reason=session-expired` — sent here by `auth.interceptor.ts`
   * when a request that was carrying a token comes back 401, rather than
   * leaving the officer on the page they were on with no visible way out.
   */
  readonly reason = input<string>('');

  email = '';
  password = '';
  rememberMe = false;

  readonly showPassword = signal(false);
  /**
   * A malformed email address — a fact about THIS field, so the field is
   * marked invalid and describes itself with the message.
   */
  readonly emailError = signal('');
  /**
   * Sign-in refused or unreachable. Not a fact about the email field, and it
   * used to be rendered as one: the input turned red, `aria-invalid` went true
   * and `aria-describedby` pointed at it, so an officer with a perfectly good
   * address was told their address was wrong — and a screen-reader user was
   * told it in those words — when the server was simply down.
   */
  readonly signInError = signal('');
  readonly showForgotPassword = signal(false);
  /** Prefilled from whatever is already in the email field, editable from there. */
  forgotPasswordEmail = '';
  readonly forgotPasswordSending = signal(false);
  /**
   * Set once a request has been sent. Deliberately one message regardless of
   * whether the address has an account — the server answers
   * `POST /auth/password/forgot` identically either way, on purpose (see its
   * doc comment in `auth.controller.ts`), and a portal that said something
   * different for a known address would be the enumeration oracle that
   * endpoint exists to prevent.
   */
  readonly forgotPasswordSent = signal(false);
  readonly forgotPasswordError = signal('');
  /**
   * A missing password — a fact about THIS field, same treatment as
   * `emailError`. Previously `form.invalid` silently blocked submission with
   * no feedback at all: clicking "Login Account" with an empty password did
   * nothing visible, and an officer had no way to tell why.
   */
  readonly passwordError = signal('');

  private readonly session = inject(SessionService);
  private readonly identity = inject(IdentityApi);

  constructor(private readonly router: Router) {}

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  openForgotPassword(): void {
    this.forgotPasswordEmail = this.email;
    this.forgotPasswordSent.set(false);
    this.forgotPasswordError.set('');
    this.showForgotPassword.set(true);
  }

  closeForgotPassword(): void {
    this.showForgotPassword.set(false);
  }

  async sendForgotPassword(): Promise<void> {
    if (this.forgotPasswordSending()) return;
    this.forgotPasswordError.set('');
    const normalized = this.forgotPasswordEmail.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalized)) {
      this.forgotPasswordError.set('Please enter a valid email address.');
      return;
    }

    this.forgotPasswordSending.set(true);
    try {
      await this.identity.requestPasswordReset(normalized);
      this.forgotPasswordSent.set(true);
    } catch (error) {
      // A real network/server failure IS reported — that is a fact about the
      // connection, not about the address. Anything the server itself
      // answered (202 always, whatever the address) already reads as success
      // above and must not be second-guessed here.
      this.forgotPasswordError.set(
        error instanceof Error && error.message !== ''
          ? error.message
          : 'That could not be sent. Try again.',
      );
    } finally {
      this.forgotPasswordSending.set(false);
    }
  }

  onEmailChange(): void {
    this.emailError.set('');
    this.signInError.set('');
  }

  onPasswordChange(): void {
    this.passwordError.set('');
    this.signInError.set('');
  }

  readonly signingIn = signal(false);

  /**
   * The second factor, once the server has asked for one.
   *
   * ── Why this was missing, and what it cost ──────────────────────────────
   *
   * Staff accounts require MFA. `/auth/token` answers a correct password with
   * `/problems/mfa-required` and the detail "Enter the code from your
   * authenticator app." The portal had no field to enter it in, and rendered
   * that sentence as a sign-in failure — so **no staff member could sign in at
   * all**, and the screen said the credentials were the problem.
   *
   * `IdentityApi.signIn` has taken a `totp` argument the whole time. Nothing
   * ever passed one, which is why nothing failed: the parameter and its caller
   * agreed with each other and neither had met the server (F-33).
   *
   * Two steps rather than a code field always on show: an officer without MFA
   * enrolled would otherwise be asked for a code that does not exist, and the
   * server is the only thing that knows which accounts need one.
   */
  readonly mfaRequired = signal(false);
  totp = '';

  async onSubmit(form: NgForm): Promise<void> {
    // The `[disabled]` binding on the submit button is not enough on its own —
    // it only takes effect once Angular's change detection repaints the DOM,
    // and two click events dispatched in quick succession (a fast double-click,
    // an impatient double-tap) can both invoke onSubmit before that repaint
    // happens, firing two concurrent /auth/token POSTs. This early return is
    // the real guard; `[disabled]` is only the visual signal for it.
    if (this.signingIn()) return;

    // `submitted` used to be set here and read by nothing — dead state rather
    // than a validation gate. Validation is `emailError` plus `passwordError`.
    this.emailError.set('');
    this.passwordError.set('');
    this.signInError.set('');

    if (this.mfaRequired() && !/^\d{6}$/.test(this.totp.trim())) {
      // The server's own rule, matched exactly so it is caught in the field.
      this.signInError.set('Enter the six-digit code from your authenticator app.');
      return;
    }

    const normalized = this.email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalized)) {
      this.emailError.set('Please enter a valid email address.');
      return;
    }
    if (!this.password) {
      this.passwordError.set('Enter your password.');
      return;
    }
    if (form.invalid) return;

    // Every successful staff login enters the same canonical dashboard —
    // URLs identify resources, not roles. The session is what scopes content
    // from here on, not which URL tree got navigated into.
    this.signingIn.set(true);
    try {
      await this.session.signIn(
        normalized,
        this.password,
        this.mfaRequired() && this.totp !== '' ? this.totp.trim() : undefined,
      );
      this.router.navigateByUrl('/dashboard');
    } catch (error) {
      // Not a failure — a step. The password was accepted; the server is
      // asking for the second factor, and saying "sign-in failed" here would
      // send an officer to re-check a password that was already right.
      if (error instanceof ApiError && error.problem.type === '/problems/mfa-required') {
        this.mfaRequired.set(true);
        this.totp = '';
        this.signInError.set('');
        return;
      }
      // The API's own words where it wrote them for a reader. It answers the
      // same refusal for a wrong password and an unknown address, on purpose —
      // so this must not try to be more specific than the server was.
      this.signInError.set(
        error instanceof Error && error.message !== ''
          ? error.message
          : 'Sign-in failed. Check the address and password and try again.',
      );
      // A wrong code is not a wrong password: stay on the second step so the
      // officer retypes six digits rather than their whole credential.
    } finally {
      this.signingIn.set(false);
    }
  }
}
