import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthLayout } from '../../shared/auth-layout/auth-layout';
import { DilgSeal } from '../../shared/dilg-seal/dilg-seal';
import { SessionService } from '../../core/session/session.service';

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
  readonly submitted = signal(false);
  readonly loginError = signal('');
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
    this.loginError.set('');
  }

  readonly signingIn = signal(false);

  async onSubmit(form: NgForm): Promise<void> {
    this.submitted.set(true);
    this.loginError.set('');

    const normalized = this.email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalized)) {
      this.loginError.set('Please enter a valid email address.');
      return;
    }
    if (form.invalid) return;

    // Every successful staff login enters the same canonical dashboard —
    // URLs identify resources, not roles. The session is what scopes content
    // from here on, not which URL tree got navigated into.
    this.signingIn.set(true);
    try {
      await this.session.signIn(normalized, this.password);
      this.router.navigateByUrl('/dashboard');
    } catch (error) {
      // The API's own words where it wrote them for a reader. It answers the
      // same refusal for a wrong password and an unknown address, on purpose —
      // so this must not try to be more specific than the server was.
      this.loginError.set(
        error instanceof Error && error.message !== ''
          ? error.message
          : 'Sign-in failed. Check the address and password and try again.',
      );
    } finally {
      this.signingIn.set(false);
    }
  }
}
