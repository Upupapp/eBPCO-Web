import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { USER_PORTAL_BASE_URL } from '../../core/config/user-portal.config';
import { AuthLayout } from '../../shared/auth-layout/auth-layout';
import { DilgSeal } from '../../shared/dilg-seal/dilg-seal';

/**
 * Says how an account for this portal is obtained. It does not create one.
 *
 * ── What this page used to do ───────────────────────────────────────────
 *
 * It collected a full name, an email address and a password, validated them,
 * and on success ran exactly one statement:
 *
 *     this.router.navigateByUrl('/login');
 *
 * No request was made. No account was created. The password was typed into a
 * form that discarded it, and the redirect to the sign-in screen reads as
 * success — so a new officer would believe they had an account, try to sign in,
 * and be told their details were wrong. The portal never said the difference.
 *
 * ── Why wiring it up was the wrong fix ──────────────────────────────────
 *
 * The service does expose `POST /auth/register`, so the obvious repair is to
 * call it. Measured against the API, that would have been worse than the bug:
 *
 *   - `identity.service.ts` saves the new account as `kind: 'applicant'` with
 *     `roles: []`. That is a BUSINESS OWNER, not LGU staff.
 *   - This portal's role gate fails closed. An applicant account therefore
 *     cannot use this portal at all — so the form would have "worked",
 *     issued the wrong kind of account, and still ended at a refused sign-in.
 *   - Applicant sign-up (the LGU calls the same people business owners)
 *     belongs to the business owners portal, which is a separate repository
 *     and a separate origin.
 *   - The request would have been rejected anyway: the endpoint requires
 *     `firstName`, `lastName` and a Philippine `mobileNumber`, and this form
 *     collected a single `fullName` and no number.
 *
 * Staff accounts are not self-service. An LGU permitting portal that let anyone
 * on the internet mint a staff login would be a hole, not a feature.
 *
 * ── What this page must not do ──────────────────────────────────────────
 *
 * It must not name an office, an email address or a telephone number. Nobody
 * has told this repository what the LGU's provisioning channel actually is, and
 * this project has already shipped an invented contact route once. "Ask your
 * administrator" is true and useless-if-vague; a fabricated address is false
 * and actively harmful. The gap is filed as an LGU input, not papered over.
 *
 * The business owners link renders only when `USER_PORTAL_BASE_URL` is
 * configured, on the same rule the permit QR uses: an unset origin means say
 * nothing, never guess.
 */
@Component({
  selector: 'app-register',
  imports: [RouterLink, AuthLayout, DilgSeal],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  protected readonly userPortal = inject(USER_PORTAL_BASE_URL);
}
