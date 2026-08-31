import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Icon } from '../icon/icon';
import { Avatar } from '../avatar/avatar';
import { SessionService } from '../../core/session/session.service';
import { ApplicationStore } from '../../core/domain/application-store';
import { Capabilities } from '../../core/session/capabilities';

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
  // Notifications are generated from real domain events (see
  // ApplicationStore's seed) instead of a disconnected static array, so
  // every `applicationId` here genuinely exists and clicking one opens a
  // real record.
  protected readonly notifications = this.store.notifications;
  protected readonly notifPanelOpen = signal(false);
  protected readonly userMenuOpen = signal(false);

  constructor(private readonly router: Router) {}

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
  }

  protected markAllRead(): void {
    this.store.markAllNotificationsRead();
  }

  /** The business/project a notification's application belongs to, or null when the notification isn't tied to a real application — resolved through the store's real businessId relationship, never the applicant's name. */
  protected notifBusinessLabel(applicationId: string | null): string | null {
    if (!applicationId) return null;
    return this.store.getApplicationContext(applicationId)?.businessLabel ?? null;
  }

  protected selectNotification(id: string, applicationId: string | null): void {
    this.store.markNotificationRead(id);
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
