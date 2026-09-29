import { Location } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';

import { NAV_MODULES } from './permissions';

/** Screens outside the signed-in portal: a Back button never returns to one of them. */
const OUTSIDE = ['/login', '/register', '/reset-password', '/welcome'];

/**
 * The screens an officer has passed through in this tab, so a Back button
 * returns to the screen they came from — the Dashboard, a team, a citizen's
 * record — rather than to one fixed list (owner request, 2026-09-30).
 *
 * Mirrors the browser's own history: a Back button calls `location.back()`
 * only when the previous entry is a portal screen, and otherwise opens the
 * page's fallback. The portal keeps its session in memory, so this never
 * reloads the page.
 */
@Injectable({ providedIn: 'root' })
export class NavigationHistory {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly entries = signal<readonly string[]>([]);

  /** The screen before this one, or null when this is the first. */
  readonly previous = computed(() => {
    const list = this.entries();
    return list.length >= 2 ? list[list.length - 2] : null;
  });

  constructor() {
    let trigger: string = 'imperative';
    let replace = false;
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        trigger = event.navigationTrigger ?? 'imperative';
        replace = this.router.getCurrentNavigation()?.extras.replaceUrl === true;
        return;
      }
      if (!(event instanceof NavigationEnd)) return;
      const url = event.urlAfterRedirects;
      const path = url.split(/[?#]/)[0];
      if (path === '/' || OUTSIDE.some((outside) => path === outside || path.startsWith(`${outside}/`))) {
        this.entries.set([]);
        return;
      }
      this.entries.update((list) => {
        if (trigger === 'popstate') {
          const at = list.lastIndexOf(url);
          return at >= 0 ? list.slice(0, at + 1) : [url];
        }
        if (list[list.length - 1] === url) return list;
        if (replace && list.length > 0) return [...list.slice(0, -1), url];
        return [...list, url];
      });
    });
  }

  /** Back to the previous screen, or to `fallback` when there is none. */
  back(fallback: string): void {
    if (this.previous() !== null) this.location.back();
    else void this.router.navigateByUrl(fallback);
  }

  /** What the previous screen is called ("Dashboard", "Application"), or `fallback` when there is none. */
  previousLabel(fallback: string): string {
    const url = this.previous();
    return url === null ? fallback : labelFor(url) ?? fallback;
  }
}

/** A screen's name, from its path. */
export function labelFor(url: string): string | null {
  const path = url.split(/[?#]/)[0];
  if (/^\/applications\/[^/]+(\/edit)?$/.test(path)) return 'Application';
  if (/^\/citizens\/[^/]+$/.test(path)) return 'Citizen';
  if (path === '/user-roles' && url.includes('tab=teams')) return 'Teams';
  if (path === '/applications') return 'Applications';
  return NAV_MODULES.find((mod) => mod.path === path)?.label ?? null;
}
