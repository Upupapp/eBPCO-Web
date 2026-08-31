import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { AccessRequestApi, PendingAccessRequest } from '../../core/api/access-request.api';
import { Icon } from '../../shared/icon/icon';
import { Topbar } from '../../shared/topbar/topbar';

/**
 * Access requests awaiting a super admin's decision.
 *
 * Owner ruling, 2026-08-31: nobody signs themselves up on the admin portal.
 * A request is raised at `/register`, and a super admin approves it, assigning
 * which forms may be worked on and at what level.
 *
 * Super Admin alone, registered as such in `permissions.ts` so the sidebar and
 * the route guard read one list. An Administrator who could approve requests
 * could grant themselves anything by approving their own second account.
 *
 * ── Three empty states, not one ─────────────────────────────────────────
 *
 * "No pending requests" is a claim. It is only true when the server answered
 * and said so. This page therefore distinguishes:
 *
 *   ok + none     nobody is waiting — the all-clear, and it is earned
 *   unavailable   this deployment has no such endpoint (404/501)
 *   failed        the request broke, so nothing is known either way
 *
 * A single empty table would render all three identically, which is the defect
 * this sweep has now fixed on four other pages (F-15, F-21, F-22, F-25).
 */
@Component({
  selector: 'app-access-requests',
  imports: [Icon, Topbar],
  templateUrl: './access-requests.html',
  styleUrl: './access-requests.scss',
})
export class AccessRequests implements OnInit {
  private readonly api = inject(AccessRequestApi);

  protected readonly loading = signal(true);
  protected readonly requests = signal<readonly PendingAccessRequest[]>([]);
  protected readonly unavailable = signal(false);
  protected readonly failure = signal<string | null>(null);

  protected readonly pendingCount = computed(() => this.requests().length);

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  protected async reload(): Promise<void> {
    this.loading.set(true);
    this.unavailable.set(false);
    this.failure.set(null);
    try {
      const result = await this.api.listPending();
      if (result.kind === 'ok') {
        this.requests.set(result.requests);
        return;
      }
      this.requests.set([]);
      if (result.kind === 'unavailable') this.unavailable.set(true);
      else this.failure.set(result.message);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * How long this request has been waiting, in whole days.
   *
   * Plain elapsed days and nothing more. This is not a pledge and must not be
   * dressed as one: the RA 11032 clock belongs to applications, and borrowing
   * its language for staff onboarding would invent a standard nobody set —
   * which the dashboard's 5-day "Overdue" rule already did once (F-26).
   */
  protected waitingDays(request: PendingAccessRequest): number | null {
    const raised = new Date(request.requestedAt).getTime();
    if (Number.isNaN(raised)) return null;
    return Math.max(0, Math.floor((Date.now() - raised) / 86_400_000));
  }

  protected waitingLabel(request: PendingAccessRequest): string {
    const days = this.waitingDays(request);
    if (days === null) return 'Waiting — date not recorded';
    if (days === 0) return 'Raised today';
    return `Waiting ${days} day${days === 1 ? '' : 's'}`;
  }

  protected levelLabel(request: PendingAccessRequest): string {
    return request.requestedLevel === 'view-edit' ? 'View and edit' : 'View only';
  }
}
