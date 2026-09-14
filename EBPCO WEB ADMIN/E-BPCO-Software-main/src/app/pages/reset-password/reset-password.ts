import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthLayout } from '../../shared/auth-layout/auth-layout';
import { DilgSeal } from '../../shared/dilg-seal/dilg-seal';
import { IdentityApi } from '../../core/api/identity.api';

/**
 * Where the emailed "set your password" link lands.
 *
 * Reached two ways that look identical from here: an existing officer who
 * forgot their password, and a newly approved staff account that has never
 * had one (`unusablePasswordHash()` on the server — see
 * `access-request.service.ts`). Both redeem the same token against the same
 * endpoint, so this page does not need to know, or ask, which case it is.
 */
@Component({
  selector: 'app-reset-password',
  imports: [FormsModule, RouterLink, AuthLayout, DilgSeal],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword {
  private readonly identity = inject(IdentityApi);

  /** From `/reset-password?token=...` — the link the email sent. */
  readonly token = input<string>();

  password = '';
  confirmPassword = '';
  readonly showPassword = signal(false);

  readonly submitting = signal(false);
  readonly formError = signal('');
  readonly outcome = signal<'done' | 'invalid-link' | null>(null);

  /** A blank or missing token means the link itself was malformed — nothing to submit against. */
  readonly hasToken = computed(() => (this.token() ?? '').trim().length > 0);

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  onFieldChange(): void {
    this.formError.set('');
  }

  async onSubmit(form: NgForm): Promise<void> {
    if (this.submitting()) return;
    this.formError.set('');

    if (form.invalid) {
      this.formError.set('Please fill in both fields.');
      return;
    }
    if (this.password.length < 12) {
      // The server's own floor (see `PasswordPolicy`), matched here so it is
      // caught before a round trip rather than after one.
      this.formError.set('Use at least 12 characters.');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.formError.set('Those two passwords do not match.');
      return;
    }

    const token = this.token();
    if (token === undefined || token.trim().length === 0) {
      this.outcome.set('invalid-link');
      return;
    }

    this.submitting.set(true);
    try {
      const result = await this.identity.resetPassword(token, this.password);
      if (result.kind === 'done') {
        this.outcome.set('done');
        return;
      }
      if (result.kind === 'invalid-link') {
        this.outcome.set('invalid-link');
        return;
      }
      this.formError.set(result.message);
    } finally {
      this.submitting.set(false);
    }
  }
}
