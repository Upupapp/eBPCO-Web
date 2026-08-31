import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AccessLevel, AccessRequestApi } from '../../core/api/access-request.api';
import { USER_PORTAL_BASE_URL } from '../../core/config/user-portal.config';
import { ALL_PERMIT_TYPES, PermitType } from '../../core/domain/permit.model';
import { AuthLayout } from '../../shared/auth-layout/auth-layout';
import { DilgSeal } from '../../shared/dilg-seal/dilg-seal';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// The API's own rule, copied deliberately rather than loosened: a number this
// form accepts and the server rejects is a request the officer cannot make and
// cannot see why.
const MOBILE_PATTERN = /^(09\d{9}|\+639\d{9})$/;
/** The server requires 20 characters. Matched exactly, so neither side surprises. */
const MIN_JUSTIFICATION = 20;

/**
 * Requesting an account. It does not create one.
 *
 * Owner ruling, 2026-08-31: sign-up on the admin portal is not allowed, least
 * of all as super admin. Every request is subject to a super admin's approval,
 * who assigns which forms may be worked on and at what level.
 *
 * ── What this page used to do ───────────────────────────────────────────
 *
 * It collected a password, validated it, and ran `navigateByUrl('/login')`.
 * Nothing was sent, no account was made, the password was discarded, and the
 * redirect read as success (F-24). This page still creates nothing — but now
 * it says so while actually forwarding the request to someone who can.
 *
 * ── No password here, on purpose ────────────────────────────────────────
 *
 * A credential chosen before an account exists is a credential stored
 * somewhere, for an account that may never be approved. The password is set
 * when the account is created, by the person it belongs to.
 *
 * ── Least access is the default ─────────────────────────────────────────
 *
 * `requestedLevel` starts at 'view' and no form is pre-ticked. A request
 * defaulting to full access across every permit type is one an approver waves
 * through, and the assignment that results is nobody's decision.
 */
@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, AuthLayout, DilgSeal],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private readonly requests = inject(AccessRequestApi);
  protected readonly userPortal = inject(USER_PORTAL_BASE_URL);
  protected readonly permitTypes = ALL_PERMIT_TYPES;

  protected fullName = '';
  protected email = '';
  protected mobileNumber = '';
  protected position = '';
  protected justification = '';
  protected requestedLevel: AccessLevel = 'view';

  private readonly selected = signal<ReadonlySet<PermitType>>(new Set());
  protected readonly selectedCount = computed(() => this.selected().size);

  protected readonly submitting = signal(false);
  /** null until submitted; then the honest outcome, which is never "approved". */
  protected readonly outcome = signal<'received' | 'unavailable' | null>(null);
  protected readonly formError = signal('');
  protected readonly emailInvalid = signal(false);
  protected readonly mobileInvalid = signal(false);

  protected isSelected(type: PermitType): boolean {
    return this.selected().has(type);
  }

  protected toggle(type: PermitType): void {
    const next = new Set(this.selected());
    if (!next.delete(type)) next.add(type);
    this.selected.set(next);
    this.formError.set('');
  }

  protected onFieldChange(): void {
    this.formError.set('');
    this.emailInvalid.set(false);
    this.mobileInvalid.set(false);
  }

  async onSubmit(form: NgForm): Promise<void> {
    if (this.submitting()) return;
    this.onFieldChange();

    if (form.invalid) {
      this.formError.set('Please fill in every field.');
      return;
    }
    if (!EMAIL_PATTERN.test(this.email.trim().toLowerCase())) {
      this.emailInvalid.set(true);
      this.formError.set('Please enter a valid email address.');
      return;
    }
    if (!MOBILE_PATTERN.test(this.mobileNumber.trim())) {
      this.mobileInvalid.set(true);
      this.formError.set('Enter a mobile number as 09XXXXXXXXX or +639XXXXXXXXX.');
      return;
    }
    if (this.selected().size === 0) {
      this.formError.set('Choose at least one form you need access to.');
      return;
    }
    // The server's own floor, with the server's own reason: an approver given
    // "pls" has been given nothing to weigh. Enforced here so it is caught in
    // the field rather than as a 400 after submitting.
    if (this.justification.trim().length < MIN_JUSTIFICATION) {
      this.formError.set(
        `Say a little more about why you need access — at least ${MIN_JUSTIFICATION} characters. `
          + 'An administrator has to decide from this.',
      );
      return;
    }

    this.submitting.set(true);
    try {
      const result = await this.requests.submit({
        fullName: this.fullName,
        email: this.email,
        mobileNumber: this.mobileNumber,
        position: this.position,
        requestedPermitTypes: [...this.selected()],
        requestedLevel: this.requestedLevel,
        justification: this.justification,
      });

      if (result.kind === 'rejected') {
        this.formError.set(result.message);
        return;
      }
      this.outcome.set(result.kind);
    } finally {
      this.submitting.set(false);
    }
  }
}
