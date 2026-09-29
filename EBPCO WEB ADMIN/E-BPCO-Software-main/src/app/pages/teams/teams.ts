import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Topbar } from '../../shared/topbar/topbar';
import { TeamsBoard } from '../../shared/teams-board/teams-board';
import { managesStaff } from '../../core/session/permissions';
import { SessionService } from '../../core/session/session.service';

/**
 * My Team: the signed-in officer's team, its lead and members, and the work
 * at its step. A staff administrator has every team in Staff & Roles, so an
 * old link to /teams takes them there.
 */
@Component({
  selector: 'app-teams',
  imports: [Topbar, TeamsBoard],
  templateUrl: './teams.html',
  styleUrl: './teams.scss',
})
export class Teams {
  protected readonly session = inject(SessionService);
  private readonly router = inject(Router);

  constructor() {
    if (managesStaff(this.session.authority())) {
      void this.router.navigate(['/user-roles'], { queryParams: { tab: 'teams' }, replaceUrl: true });
    }
  }
}
