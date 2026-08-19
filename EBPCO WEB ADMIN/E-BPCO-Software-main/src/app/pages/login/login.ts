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

  onSubmit(form: NgForm): void {
    this.submitted.set(true);
    this.loginError.set('');

    const normalized = this.email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalized)) {
      this.loginError.set('Please enter a valid email address.');
      return;
    }
    if (form.invalid) return;

    // Every successful staff login enters the same canonical dashboard —
    // URLs identify resources, not roles. The session (mock — see
    // SessionService) is what scopes content from here on, not which URL
    // tree got navigated into.
    this.session.signIn(normalized);
    this.router.navigateByUrl('/dashboard');
  }
}
