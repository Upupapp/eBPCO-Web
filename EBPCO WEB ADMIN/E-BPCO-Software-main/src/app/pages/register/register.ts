import { Component, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthLayout } from '../../shared/auth-layout/auth-layout';
import { DilgSeal } from '../../shared/dilg-seal/dilg-seal';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, AuthLayout, DilgSeal],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';

  readonly showPassword = signal(false);
  readonly registerError = signal('');
  readonly emailInvalid = signal(false);
  readonly passwordMismatch = signal(false);

  constructor(private readonly router: Router) {}

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  onEmailChange(): void {
    this.emailInvalid.set(false);
    this.registerError.set('');
  }

  onPasswordChange(): void {
    this.passwordMismatch.set(false);
    this.registerError.set('');
  }

  onSubmit(form: NgForm): void {
    this.registerError.set('');
    this.emailInvalid.set(false);
    this.passwordMismatch.set(false);

    if (form.invalid) {
      this.registerError.set('Please fill in all required fields.');
      return;
    }
    if (!EMAIL_PATTERN.test(this.email.trim().toLowerCase())) {
      this.emailInvalid.set(true);
      this.registerError.set('Please enter a valid email address.');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.passwordMismatch.set(true);
      this.registerError.set('Passwords do not match.');
      return;
    }

    this.router.navigateByUrl('/login');
  }
}
