import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AccessLevel, AccessRequestApi, PendingAccessRequest } from '../../core/api/access-request.api';
import { ALL_PERMIT_TYPES, PermitType } from '../../core/domain/permit.model';
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
  imports: [FormsModule, Icon, Topbar],
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

  // ── Deciding (A-04, A-05) ───────────────────────────────────────────────

  protected readonly permitTypes = ALL_PERMIT_TYPES;

  /** The request being decided, if any. One at a time, deliberately. */
  protected readonly deciding = signal<PendingAccessRequest | null>(null);
  protected readonly decisionMode = signal<'approve' | 'reject' | null>(null);
  protected readonly working = signal(false);
  protected readonly decisionError = signal('');
  /**
   * A message that must outlive the decision panel.
   *
   * `decisionError` lives inside the panel and `cancelDecision()` clears it —
   * which silently swallowed the "someone else already decided this" notice,
   * since that path closes the panel by design. A message about why the list
   * just changed has to survive the thing that changed it.
   */
  protected readonly notice = signal('');
  protected rejectReason = '';

  /**
   * What the approver is about to grant. Seeded from what the requester ASKED
   * for, never silently accepted: the approver must look at it, and changing it
   * is one click. Seeding it empty would be worse — an approver who has to
   * rebuild the request's own list from scratch will pick something easier.
   */
  private readonly grantForms = signal<ReadonlySet<PermitType>>(new Set());
  protected readonly grantLevel = signal<AccessLevel>('view');
  protected readonly grantCount = computed(() => this.grantForms().size);

  protected isGranted(type: PermitType): boolean {
    return this.grantForms().has(type);
  }

  protected toggleGrant(type: PermitType): void {
    const next = new Set(this.grantForms());
    if (!next.delete(type)) next.add(type);
    this.grantForms.set(next);
    this.decisionError.set('');
  }

  protected setLevel(level: AccessLevel): void {
    this.grantLevel.set(level);
    this.decisionError.set('');
  }

  protected startApprove(request: PendingAccessRequest): void {
    this.deciding.set(request);
    this.decisionMode.set('approve');
    this.decisionError.set('');
    this.rejectReason = '';
    // Seed from the request, filtered to permit types this portal publishes —
    // a retired or unknown type must not become a grant just because it was
    // asked for.
    const asked = request.requestedPermitTypes.filter((t): t is PermitType =>
      (ALL_PERMIT_TYPES as readonly string[]).includes(t),
    );
    this.grantForms.set(new Set(asked));
    this.grantLevel.set(request.requestedLevel);
  }

  protected startReject(request: PendingAccessRequest): void {
    this.deciding.set(request);
    this.decisionMode.set('reject');
    this.decisionError.set('');
    this.rejectReason = '';
  }

  protected cancelDecision(): void {
    this.deciding.set(null);
    this.decisionMode.set(null);
    this.decisionError.set('');
    this.rejectReason = '';
  }

  /** Any permit type the requester asked for that this portal does not publish. */
  protected unknownRequested(request: PendingAccessRequest): readonly string[] {
    return request.requestedPermitTypes.filter(
      (t) => !(ALL_PERMIT_TYPES as readonly string[]).includes(t),
    );
  }

  async confirmApprove(): Promise<void> {
    const request = this.deciding();
    if (!request || this.working()) return;

    if (this.grantForms().size === 0) {
      this.decisionError.set(
        'Choose at least one form. An account with no forms can see nothing.',
      );
      return;
    }

    this.working.set(true);
    try {
      const result = await this.api.approve(request.id, {
        permitTypes: [...this.grantForms()],
        level: this.grantLevel(),
      });
      await this.afterDecision(result);
    } finally {
      this.working.set(false);
    }
  }

  async confirmReject(): Promise<void> {
    const request = this.deciding();
    if (!request || this.working()) return;

    if (this.rejectReason.trim().length < 3) {
      // The requester is a colleague who will ask why. An unexplained refusal
      // is one the approver has to remember and re-explain out of band.
      this.decisionError.set('Give a reason. The requester should be told why.');
      return;
    }

    this.working.set(true);
    try {
      await this.afterDecision(await this.api.reject(request.id, this.rejectReason));
    } finally {
      this.working.set(false);
    }
  }

  private async afterDecision(
    result: { kind: 'done' | 'stale' | 'unavailable' | 'failed'; message?: string },
  ): Promise<void> {
    if (result.kind === 'failed') {
      this.decisionError.set(result.message ?? 'The decision could not be recorded.');
      return;
    }
    if (result.kind === 'unavailable') {
      this.decisionError.set('This deployment cannot record access decisions yet.');
      return;
    }
    if (result.kind === 'stale') {
      this.notice.set('This request has already been decided by someone else.');
    }
    // Reload on both 'done' and 'stale': in either case the server's list is
    // now the truth and this page's copy is not.
    this.cancelDecision();
    await this.reload();
  }

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  protected dismissNotice(): void {
    this.notice.set('');
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
