import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DilgSeal } from '../../shared/dilg-seal/dilg-seal';
import { Icon } from '../../shared/icon/icon';

// The informational gateway between the splash reveal and the login form —
// tells an authorized staff member what E-BPCO Administration is before
// asking them to sign in. Purely presentational: no session/auth state,
// no form, nothing SessionService or authGuard need know about.
@Component({
  selector: 'app-welcome',
  imports: [RouterLink, DilgSeal, Icon],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss',
})
export class Welcome {
  protected readonly currentYear = new Date().getFullYear();
}
