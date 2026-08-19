import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../icon/icon';
import { DilgSeal } from '../dilg-seal/dilg-seal';
import { SessionService } from '../../core/session/session.service';
import { NAV_MODULES, NavGroup, NavModule } from '../../core/session/permissions';

interface NavSection {
  group: NavGroup;
  label: string | null;
  items: NavModule[];
}

const GROUP_ORDER: { group: NavGroup; label: string | null }[] = [
  { group: 'root', label: null },
  { group: 'operations', label: 'Operations' },
  { group: 'administration', label: 'Administration' },
];

/**
 * The one sidebar for the whole authenticated app — there is no separate
 * "Super Admin" vs "Admin" nav array anymore. Its sections/items come
 * straight from `NAV_MODULES` (core/session/permissions.ts), filtered by
 * the current session's role, so the sidebar and the route guard can
 * never disagree about who's allowed to see what — they both read the
 * same registry.
 */
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, Icon, DilgSeal],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private readonly session = inject(SessionService);

  readonly logoutPath = input<string>('/login');

  protected readonly sections = computed<NavSection[]>(() => {
    const role = this.session.role();
    const visible = role ? NAV_MODULES.filter((m) => m.roles.includes(role)) : NAV_MODULES;
    return GROUP_ORDER.map((g) => ({ ...g, items: visible.filter((m) => m.group === g.group) })).filter(
      (section) => section.items.length > 0,
    );
  });

  constructor(private readonly router: Router) {}

  logout(): void {
    this.session.signOut();
    this.router.navigateByUrl(this.logoutPath());
  }
}
