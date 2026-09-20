import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Topbar } from '../../shared/topbar/topbar';
import { Icon } from '../../shared/icon/icon';
import { Avatar } from '../../shared/avatar/avatar';
import { KpiCard, KpiIllustration, KpiTone } from '../../shared/kpi-card/kpi-card';
import { Pagination } from '../../shared/pagination/pagination';
import { FilterPanel } from '../../shared/filter-panel/filter-panel';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { ViewOnlyNotice } from '../../shared/view-only-notice/view-only-notice';
import { ToastService } from '../../shared/toast/toast.service';
import { SessionService } from '../../core/session/session.service';
import { ACTION_PERMISSIONS } from '../../core/session/permissions';
import {
  CitizenDetail, CitizenRectifyInput, CitizenRow, CitizenMetrics, StaffCitizensApi,
} from '../../core/api/staff-citizens.api';
import { activityLabel, formatTimestamp, statusPillClass, verifiedLabel } from './citizen-detail-data';

/**
 * The Citizens module — staff-side administration of a citizen's OWN
 * account, as distinct from Businesses/Applications, which already show a
 * citizen only indirectly. Deliberately real end to end: every value shown
 * comes from `StaffCitizensApi`, and every action is a real
 * `/staff/citizens/*` call recorded in the audit chain. No seed data, no
 * queue store of any kind, no fabricated rows — see the module handoff for
 * the "all data in the database" checklist this page was built against.
 *
 * One component servers both `/citizens` and `/citizens/:id`
 * (`app.routes.ts`), the same shape `pages/applications/applications.ts`
 * already uses for its own list/detail split: `id` is bound to the optional
 * route segment via `withComponentInputBinding`, and its presence alone
 * decides which half of this template renders.
 */

type DetailTab = 'profile' | 'businesses-applications' | 'sessions' | 'activity';

/** Same shape `businesses.ts`'s own `RingStat` uses, for the same KPI-card treatment. */
interface KpiTile {
  label: string;
  value: string;
  icon: string;
  tone: KpiTone;
  illustration: KpiIllustration;
  pct: number;
  isTotal: boolean;
  support: string;
}

type RectifiableField =
  | 'firstName' | 'middleName' | 'lastName' | 'mobileNumber'
  | 'street' | 'barangay' | 'city' | 'province' | 'postalCode';

const RECTIFIABLE_FIELDS: ReadonlyArray<{ value: RectifiableField; label: string }> = [
  { value: 'firstName', label: 'First Name' },
  { value: 'middleName', label: 'Middle Name' },
  { value: 'lastName', label: 'Last Name' },
  { value: 'mobileNumber', label: 'Mobile Number' },
  { value: 'street', label: 'House Number / Street' },
  { value: 'barangay', label: 'Barangay' },
  { value: 'city', label: 'City / Municipality' },
  { value: 'province', label: 'Province' },
  { value: 'postalCode', label: 'Postal Code' },
];

/** The server floor for every citizens mutation's reason (`z.string().min(5)`). Matching it here avoids a round trip just to be told the same thing. */
const REASON_MIN_LENGTH = 5;

@Component({
  selector: 'app-citizens',
  imports: [
    FormsModule, RouterLink, Topbar, Icon, Avatar, KpiCard, Pagination, FilterPanel, ConfirmDialog, ViewOnlyNotice,
  ],
  templateUrl: './citizens.html',
  styleUrl: './citizens.scss',
})
export class Citizens {
  private readonly api = inject(StaffCitizensApi);
  private readonly toast = inject(ToastService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  readonly id = input<string>();

  protected readonly role = this.session.role;

  // Same shape `applications.ts` uses throughout: computed here, never
  // `ACTION_PERMISSIONS.x(role()!)` inline in the template — a signed-out
  // instant between a session ending and this page's own redirect is a
  // real state a template-level non-null assertion would crash on.
  protected readonly canDisable = computed(() => {
    const r = this.role();
    return !!r && ACTION_PERMISSIONS['citizen.disable'](r);
  });
  protected readonly canEnable = computed(() => {
    const r = this.role();
    return !!r && ACTION_PERMISSIONS['citizen.enable'](r);
  });
  protected readonly canSignOutSessions = computed(() => {
    const r = this.role();
    return !!r && ACTION_PERMISSIONS['citizen.signOutSessions'](r);
  });
  protected readonly canSendResetLink = computed(() => {
    const r = this.role();
    return !!r && ACTION_PERMISSIONS['citizen.sendResetLink'](r);
  });
  protected readonly canRectify = computed(() => {
    const r = this.role();
    return !!r && ACTION_PERMISSIONS['citizen.rectify'](r);
  });
  protected readonly canErase = computed(() => {
    const r = this.role();
    return !!r && ACTION_PERMISSIONS['citizen.erase'](r);
  });
  protected readonly canActOnStatus = computed(() => this.canDisable() || this.canEnable());

  protected readonly statusPillClass = statusPillClass;
  protected readonly activityLabel = activityLabel;
  protected readonly formatTimestamp = formatTimestamp;
  protected readonly verifiedLabel = verifiedLabel;
  protected readonly rectifiableFields = RECTIFIABLE_FIELDS;

  // ── List state ──────────────────────────────────────────────────────
  // Never null: an empty array both before the first load resolves and
  // after one that found nothing, so `@for` in the template always has a
  // real iterable rather than a case `listLoading()` has to gate perfectly
  // in time — the constructor's own `effect()` does not run before this
  // component's first render, and the template must survive that gap.
  protected readonly rows = signal<readonly CitizenRow[]>([]);
  protected readonly total = signal(0);
  protected readonly metrics = signal<CitizenMetrics | null>(null);

  /** Same treatment as businesses.ts's own `ringStats`: a support line and a percent-of-total bar on every tile but the headline total. */
  protected readonly kpiTiles = computed<readonly KpiTile[]>(() => {
    const m = this.metrics();
    if (!m) return [];
    const pctOfTotal = (n: number) => (m.total ? Math.round((n / m.total) * 100) : 0);
    return [
      {
        label: 'Total Citizens', value: m.total.toLocaleString(), icon: 'users',
        tone: 'brand', illustration: 'users', pct: 100, isTotal: true,
        support: 'Registered in the citizen register',
      },
      {
        label: 'Active', value: m.active.toLocaleString(), icon: 'check-circle',
        tone: 'success', illustration: 'active', pct: pctOfTotal(m.active), isTotal: false,
        support: `${pctOfTotal(m.active)}% of total citizens`,
      },
      {
        label: 'Disabled', value: m.disabled.toLocaleString(), icon: 'slash',
        tone: 'danger', illustration: 'warning', pct: pctOfTotal(m.disabled), isTotal: false,
        support: `${pctOfTotal(m.disabled)}% of total citizens`,
      },
      {
        label: 'Verified Email', value: m.emailVerified.toLocaleString(), icon: 'check',
        tone: 'info', illustration: 'success', pct: pctOfTotal(m.emailVerified), isTotal: false,
        support: `${pctOfTotal(m.emailVerified)}% of total citizens`,
      },
      {
        label: 'New This Month', value: m.newLast30Days.toLocaleString(), icon: 'user-check',
        tone: 'violet', illustration: 'pending', pct: pctOfTotal(m.newLast30Days), isTotal: false,
        support: `${pctOfTotal(m.newLast30Days)}% of total citizens`,
      },
    ];
  });

  protected readonly listError = signal<string | null>(null);
  protected readonly listUnavailable = signal(false);
  protected readonly listLoading = signal(false);

  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal<'active' | 'disabled' | ''>('');
  protected readonly verifiedFilter = signal<'verified' | 'unverified' | ''>('');
  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly activeFilterCount = computed(
    () => (this.statusFilter() ? 1 : 0) + (this.verifiedFilter() ? 1 : 0),
  );
  protected readonly openMenuFor = signal<string | null>(null);
  private searchDebounce: ReturnType<typeof setTimeout> | null = null;

  // ── Detail state ────────────────────────────────────────────────────
  protected readonly detail = signal<CitizenDetail | null>(null);
  protected readonly detailError = signal<string | null>(null);
  protected readonly detailNotFound = signal(false);
  protected readonly detailUnavailable = signal(false);
  protected readonly detailLoading = signal(false);
  protected readonly detailTab = signal<DetailTab>('profile');

  // ── Dialogs: sessions / disable / enable / reset link ──────────────
  protected readonly revokeTarget = signal<CitizenDetail | null>(null);
  protected readonly disableTarget = signal<CitizenDetail | null>(null);
  protected readonly enableTarget = signal<CitizenDetail | null>(null);
  protected readonly resetLinkTarget = signal<CitizenDetail | null>(null);
  protected readonly working = signal(false);

  // ── Rectification: one field at a time ─────────────────────────────
  protected readonly rectifyField = signal<RectifiableField | ''>('');
  protected readonly rectifyValue = signal('');
  protected readonly rectifyConfirming = signal(false);

  // ── Erasure: two-step confirm + a request reference ────────────────
  protected readonly eraseReference = signal('');
  protected readonly eraseStep = signal<0 | 1 | 2>(0);
  private pendingEraseReason = '';

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => {
        this.openMenuFor.set(null);
        if (id) {
          this.detailTab.set('profile');
          this.rectifyField.set('');
          this.rectifyValue.set('');
          this.eraseReference.set('');
          this.eraseStep.set(0);
          void this.loadDetail(id);
        } else {
          this.detail.set(null);
          this.page.set(1);
          void this.loadList();
          void this.loadMetrics();
        }
      });
    });
  }

  // ── List loading ────────────────────────────────────────────────────

  private async loadList(): Promise<void> {
    this.listLoading.set(true);
    this.listError.set(null);
    this.listUnavailable.set(false);
    const result = await this.api.list({
      ...(this.searchTerm().trim() ? { search: this.searchTerm().trim() } : {}),
      ...(this.statusFilter() ? { status: this.statusFilter() as 'active' | 'disabled' } : {}),
      ...(this.verifiedFilter() ? { verified: this.verifiedFilter() === 'verified' } : {}),
      page: this.page(),
      pageSize: this.pageSize,
    });
    this.listLoading.set(false);
    if (result.kind === 'ok') {
      this.rows.set(result.rows);
      this.total.set(result.total);
      return;
    }
    this.rows.set([]);
    this.total.set(0);
    if (result.kind === 'unavailable') {
      this.listUnavailable.set(true);
    } else if (result.kind === 'forbidden') {
      this.listError.set('Your account does not hold permission to view the citizen register.');
    } else {
      this.listError.set(`Could not load citizens: ${result.message}`);
    }
  }

  private async loadMetrics(): Promise<void> {
    const result = await this.api.metrics();
    this.metrics.set(result.kind === 'ok' ? result.metrics : null);
  }

  protected onSearchChange(): void {
    if (this.searchDebounce !== null) clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.page.set(1);
      void this.loadList();
    }, 350);
  }

  protected applyFilters(): void {
    this.page.set(1);
    void this.loadList();
  }

  protected clearFilters(): void {
    this.statusFilter.set('');
    this.verifiedFilter.set('');
    this.page.set(1);
    void this.loadList();
  }

  protected onPageChange(page: number): void {
    this.page.set(page);
    void this.loadList();
  }

  // ── Detail loading ──────────────────────────────────────────────────

  private async loadDetail(citizenId: string): Promise<void> {
    this.detailLoading.set(true);
    this.detailError.set(null);
    this.detailNotFound.set(false);
    this.detailUnavailable.set(false);
    const result = await this.api.detail(citizenId);
    this.detailLoading.set(false);
    if (result.kind === 'ok') {
      this.detail.set(result.detail);
      return;
    }
    this.detail.set(null);
    if (result.kind === 'not-found') this.detailNotFound.set(true);
    else if (result.kind === 'unavailable') this.detailUnavailable.set(true);
    else if (result.kind === 'forbidden') this.detailError.set('Your account does not hold permission to view this citizen.');
    else this.detailError.set(`Could not load this citizen: ${'message' in result ? result.message : 'unknown error'}`);
  }

  protected async reloadDetail(): Promise<void> {
    const id = this.id();
    if (id) await this.loadDetail(id);
  }

  protected openDetail(row: CitizenRow): void {
    this.openMenuFor.set(null);
    this.router.navigateByUrl(`/citizens/${row.id}`);
  }

  protected backToList(): void {
    this.router.navigateByUrl('/citizens');
  }

  protected selectDetailTab(tab: DetailTab): void {
    this.detailTab.set(tab);
  }

  protected toggleRowMenu(citizenId: string): void {
    this.openMenuFor.update((current) => (current === citizenId ? null : citizenId));
  }

  protected closeRowMenu(): void {
    this.openMenuFor.set(null);
  }

  // ── Sign out all sessions ──────────────────────────────────────────

  protected async confirmRevoke(reason: string): Promise<void> {
    const target = this.revokeTarget();
    this.revokeTarget.set(null);
    if (!target || this.working()) return;
    this.working.set(true);
    try {
      const result = await this.api.revokeAllSessions(target.id, reason);
      if (result.kind === 'done') {
        this.toast.success(`${target.firstName} ${target.lastName} was signed out of every session.`);
        await this.reloadDetail();
        return;
      }
      this.toast.error(this.actionFailureMessage(result));
    } finally {
      this.working.set(false);
    }
  }

  // ── Disable / enable ────────────────────────────────────────────────

  protected async confirmDisable(reason: string): Promise<void> {
    const target = this.disableTarget();
    this.disableTarget.set(null);
    if (!target || this.working()) return;
    this.working.set(true);
    try {
      const result = await this.api.disable(target.id, reason);
      if (result.kind === 'done') {
        this.toast.success(`${target.firstName} ${target.lastName}’s account is disabled.`);
        await this.reloadDetail();
        return;
      }
      this.toast.error(this.actionFailureMessage(result));
    } finally {
      this.working.set(false);
    }
  }

  protected async confirmEnable(reason: string): Promise<void> {
    const target = this.enableTarget();
    this.enableTarget.set(null);
    if (!target || this.working()) return;
    this.working.set(true);
    try {
      const result = await this.api.enable(target.id, reason);
      if (result.kind === 'done') {
        this.toast.success(`${target.firstName} ${target.lastName}’s account is active again.`);
        await this.reloadDetail();
        return;
      }
      this.toast.error(this.actionFailureMessage(result));
    } finally {
      this.working.set(false);
    }
  }

  // ── Password-reset link ─────────────────────────────────────────────

  protected async confirmResetLink(reason: string): Promise<void> {
    const target = this.resetLinkTarget();
    this.resetLinkTarget.set(null);
    if (!target || this.working()) return;
    this.working.set(true);
    try {
      const result = await this.api.sendPasswordResetLink(target.id, reason);
      if (result.kind === 'done') {
        if (result.delivery === 'sent') this.toast.success(result.detail);
        else this.toast.info(result.detail);
        await this.reloadDetail();
        return;
      }
      this.toast.error(this.actionFailureMessage(result));
    } finally {
      this.working.set(false);
    }
  }

  // ── Rectification (one field at a time) ─────────────────────────────

  protected readonly rectifyValueValid = computed(() => {
    const field = this.rectifyField();
    const value = this.rectifyValue().trim();
    if (field === '') return false;
    if (field === 'mobileNumber') return /^(09\d{9}|\+639\d{9})$/.test(value);
    if (field === 'postalCode') return /^\d{4}$/.test(value);
    // Middle name is the one field a citizen may genuinely have none of —
    // an empty value there means "clear it," not "invalid."
    if (field === 'middleName') return true;
    return value.length > 0;
  });

  protected readonly rectifyConfirmMessage = computed(() => {
    const field = this.rectifyField();
    if (field === '') return '';
    const label = RECTIFIABLE_FIELDS.find((f) => f.value === field)?.label ?? field;
    const value = this.rectifyValue().trim();
    return field === 'middleName' && value === ''
      ? `${label} will be cleared.`
      : `${label} will be set to "${value}".`;
  });

  protected requestRectify(): void {
    if (this.rectifyValueValid()) this.rectifyConfirming.set(true);
  }

  protected cancelRectify(): void {
    this.rectifyConfirming.set(false);
  }

  protected async confirmRectify(reason: string): Promise<void> {
    const target = this.detail();
    const field = this.rectifyField();
    this.rectifyConfirming.set(false);
    if (!target || field === '' || this.working()) return;
    this.working.set(true);
    try {
      const trimmed = this.rectifyValue().trim();
      const changes: CitizenRectifyInput = field === 'middleName' && trimmed === ''
        ? { middleName: null }
        : { [field]: trimmed };
      const result = await this.api.rectify(target.id, reason, changes);
      if (result.kind === 'done') {
        this.toast.success('The correction was saved.');
        this.rectifyField.set('');
        this.rectifyValue.set('');
        await this.reloadDetail();
        return;
      }
      this.toast.error(this.actionFailureMessage(result));
    } finally {
      this.working.set(false);
    }
  }

  // ── Erasure (two-step confirm + a request reference) ───────────────

  protected readonly eraseReferenceValid = computed(() => this.eraseReference().trim().length > 0);

  protected startErase(): void {
    if (this.eraseReferenceValid()) this.eraseStep.set(1);
  }

  protected cancelErase(): void {
    this.eraseStep.set(0);
  }

  /** Step 1: collects the reason, then advances to a final, no-going-back confirmation rather than erasing immediately. */
  protected onEraseStep1Confirmed(reason: string): void {
    this.pendingEraseReason = reason;
    this.eraseStep.set(2);
  }

  protected async onEraseStep2Confirmed(): Promise<void> {
    const target = this.detail();
    const reference = this.eraseReference().trim();
    this.eraseStep.set(0);
    if (!target || this.working()) return;
    this.working.set(true);
    try {
      const result = await this.api.erase(target.id, this.pendingEraseReason, reference);
      if (result.kind === 'done') {
        this.toast.success('The erasure was recorded. This account no longer appears in the register.');
        this.router.navigateByUrl('/citizens');
        return;
      }
      this.toast.error(this.actionFailureMessage(result));
    } finally {
      this.working.set(false);
    }
  }

  private actionFailureMessage(result: { kind: string; message?: string }): string {
    if (result.kind === 'refused' || result.kind === 'failed') return result.message ?? 'The request was refused.';
    if (result.kind === 'forbidden') return 'Your account does not hold permission to do this.';
    if (result.kind === 'not-found') return 'This citizen account could not be found. It may have just been erased.';
    if (result.kind === 'unavailable') return 'This deployment cannot perform this action yet.';
    return 'Something went wrong. Please try again.';
  }
}
