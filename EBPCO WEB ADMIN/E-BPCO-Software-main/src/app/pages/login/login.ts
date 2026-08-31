import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthLayout } from '../../shared/auth-layout/auth-layout';
import { DilgSeal } from '../../shared/dilg-seal/dilg-seal';
import { SessionService } from '../../core/session/session.service';
import { ApiError } from '../../core/api/problem';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, AuthLayout, DilgSeal],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
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

  private readonly session = inject(SessionService);

  constructor(private readonly router: Router) {}

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  openForgotPassword(): void {
    this.showForgotPassword.set(true);
  }

  closeForgotPassword(): void {
    this.showForgotPassword.set(false);
  }

  onEmailChange(): void {
    this.emailError.set('');
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
    // `submitted` used to be set here and read by nothing — dead state rather
    // than a validation gate. Validation is `emailError` plus `form.invalid`.
    this.emailError.set('');
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
