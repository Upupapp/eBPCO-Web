import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { Seal } from '../../shared/seal/seal';

interface NavLink {
  label: string;
  path: string;
}

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive, Seal],
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
})
export class SiteHeader {
  private readonly router = inject(Router);

  readonly navLinks: NavLink[] = [
    { label: 'Home', path: '/' },
    { label: 'About Castilla', path: '/about' },
    { label: 'Local Government', path: '/local-government' },
    { label: 'Offices', path: '/offices' },
    { label: 'Permits & Services', path: '/permits' },
    { label: 'Contact', path: '/contact' },
  ];

  readonly scrolled = signal(false);
  readonly mobileOpen = signal(false);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  private readonly isHome = computed(() => this.currentUrl() === '/');

  // Only the home hero has a dark full-bleed background behind the header —
  // everywhere else (and once scrolled past the hero) the header needs its
  // normal solid, dark-on-light styling to stay legible.
  readonly transparent = computed(() => this.isHome() && !this.scrolled());

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  toggleMobile(): void {
    this.mobileOpen.set(!this.mobileOpen());
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }
}
