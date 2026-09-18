import { Component, HostListener, computed, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Icon } from '../icon/icon';
import { Avatar } from '../avatar/avatar';
import { SessionService } from '../../core/session/session.service';
import { ApplicationStore } from '../../core/domain/application-store';
import { AppNotification } from '../../core/domain/notification.model';
import { Capabilities } from '../../core/session/capabilities';
import { StaffNotificationsApi, StaffNotificationRow } from '../../core/api/staff-notifications.api';

function formatDateTime(iso: string): string {
  const when = new Date(iso);
  if (Number.isNaN(when.getTime())) return iso;
  return `${when.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })} · `
    + when.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
}

function toAppNotification(row: StaffNotificationRow): AppNotification {
  return {
    id: row.id,
    applicationId: row.applicationId,
    title: row.title,
    message: row.body,
    createdAtValue: new Date(row.createdAt),
    createdAt: formatDateTime(row.createdAt),
    isRead: row.readAt !== null,
  };
}

@Component({
  selector: 'app-topbar',
  imports: [Icon, Avatar],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar {
  /**
   * What this account may do, read from the one capability rather than
   * recomputed here. A second opinion in the topbar is how a portal ends up
   * telling an officer they may edit on the chrome and refusing them on the page.
   */
  protected readonly capabilities = inject(Capabilities);
  protected readonly assignedForms = this.capabilities.assignedForms;

  private readonly session = inject(SessionService);
  private readonly store = inject(ApplicationStore);
  private readonly notificationsApi = inject(StaffNotificationsApi);

  readonly title = input.required<string>();
  readonly logoutPath = input<string>('/login');

  // Name/role come from the central session — not a per-page hardcoded
  // string — so a person's displayed identity is the same everywhere and
  // changes the moment the session does.
  protected readonly userName = computed(() => this.session.name() || 'Guest');
  protected readonly userRole = computed(() => this.session.role() ?? '');

  // Search is a real controlled field either way. Pages with a matching
  // search signal of their own bind [searchTerm]/(searchChange) straight
  // into it; pages without one just get a working, typeable/clearable
  // input instead of dead markup.
  readonly searchTerm = input<string>('');
  readonly searchPlaceholder = input<string>('Search here...');
  readonly searchChange = output<string>();

  private readonly localSearch = signal('');
  /**
   * Real once fetched from `GET /staff/notifications` — this used to read
   * `ApplicationStore.notifications` unconditionally, a seed-only
   * collection `replaceApplications()` always wipes to `[]` on a real
   * queue load and nothing ever repopulates, so on this deployment every
   * officer's bell showed permanently empty (0 unread) no matter how many
   * real notices — evaluation-stage-passed, order-of-payment-issued, etc.
   * — the server had actually recorded for their account. A real
   * `staff/notifications` endpoint already existed on the backend; nothing
   * on this side had ever been wired to it.
   */
  private readonly realNotifications = signal<readonly StaffNotificationRow[] | null>(null);

  constructor(private readonly router: Router) {
    void this.notificationsApi.inbox().then((result) => {
      if (result.kind === 'ok') this.realNotifications.set(result.notifications);
    });
  }

  protected readonly notifications = computed<AppNotification[]>(() => {
    const real = this.realNotifications();
    if (real !== null) return real.map(toAppNotification);
    return this.store.notifications();
  });
  protected readonly notifPanelOpen = signal(false);
  protected readonly userMenuOpen = signal(false);
  // Narrow viewports only (see topbar.scss) — the search box itself is
  // still the full-width control ≥720px; below that it used to collapse to
  // `display: none` with nothing to reopen it, unlike the icon-triggered
  // collapse every other narrow-width control in this app already uses.
  protected readonly mobileSearchOpen = signal(false);

  protected currentSearch(): string {
    return this.searchTerm() || this.localSearch();
  }

  protected onSearchInput(value: string): void {
    this.localSearch.set(value);
    this.searchChange.emit(value);
  }

  protected clearSearch(): void {
    this.onSearchInput('');
  }

  protected readonly unreadCount = computed(
    () => this.notifications().filter((n) => !n.isRead).length,
  );

  protected toggleNotifPanel(): void {
    this.notifPanelOpen.update((open) => !open);
    this.userMenuOpen.set(false);
  }

  protected toggleUserMenu(): void {
    this.userMenuOpen.update((open) => !open);
    this.notifPanelOpen.set(false);
  }

  protected closeMenus(): void {
    this.notifPanelOpen.set(false);
    this.userMenuOpen.set(false);
    this.mobileSearchOpen.set(false);
  }

  protected toggleMobileSearch(): void {
    this.mobileSearchOpen.update((open) => !open);
    this.notifPanelOpen.set(false);
    this.userMenuOpen.set(false);
  }

  // Escape is the standard way to dismiss any open dropdown/menu. Listening
  // on the document (rather than the panel markup) catches it regardless of
  // which element inside the panel currently has focus.
  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.notifPanelOpen() || this.userMenuOpen() || this.mobileSearchOpen()) {
      this.closeMenus();
    }
  }

  protected markAllRead(): void {
    const real = this.realNotifications();
    if (real === null) {
      this.store.markAllNotificationsRead();
      return;
    }
    const now = new Date().toISOString();
    const unread = real.filter((n) => n.readAt === null);
    // Optimistic: reflect "read" immediately rather than waiting on every
    // call below, which — no bulk endpoint exists — is one request per
    // unread notice.
    this.realNotifications.set(real.map((n) => (n.readAt === null ? { ...n, readAt: now } : n)));
    for (const n of unread) void this.notificationsApi.markRead(n.id);
  }

  /** The business/project a notification's application belongs to, or null when the notification isn't tied to a real application — resolved through the store's real businessId relationship, never the applicant's name. */
  protected notifBusinessLabel(applicationId: string | null): string | null {
    if (!applicationId) return null;
    return this.store.getApplicationContext(applicationId)?.businessLabel ?? null;
  }

  protected selectNotification(id: string, applicationId: string | null): void {
    const real = this.realNotifications();
    if (real === null) {
      this.store.markNotificationRead(id);
    } else {
      const now = new Date().toISOString();
      this.realNotifications.set(real.map((n) => (n.id === id ? { ...n, readAt: now } : n)));
      void this.notificationsApi.markRead(id);
    }
    this.closeMenus();
    if (applicationId) {
      this.router.navigateByUrl(`/applications/${applicationId}`);
    }
  }

  protected logout(): void {
    this.session.signOut();
    this.router.navigateByUrl(this.logoutPath());
  }
}
