import { EffectRef, Injectable, effect, inject, signal, untracked } from '@angular/core';

import { QueueLoader } from '../domain/queue-loader';

/**
 * Keeps every screen of the portal current without a reload (owner request,
 * 30 Sep 2026: "I had to manually refresh to see the updates").
 *
 * Until now only the application list refreshed itself (every 30 s). An open
 * application, the Evaluations page, the dashboard's stage figures, the bell
 * and the Teams board were read once, so a change another officer made stayed
 * invisible until the page was reloaded -- confirmed live: an assignment
 * changed by the Technical lead never reached an open record in 50 s.
 *
 * One pulse for the whole portal, driven by `AdminLayout`: every
 * `INTERVAL_MS` while the tab is visible, and at once when the officer comes
 * back to it. Each pulse first refreshes the shared application list, then
 * advances `tick`; a screen that holds data of its own reloads it quietly on
 * the tick (`onTick`). A pulse is skipped while the officer is typing or has a
 * dialog or menu open, so nothing they are in the middle of is redrawn under
 * them; the next pulse catches up.
 *
 * Polling, not push: an update appears within one interval, not instantly. The
 * API has no push channel, and at this office's volume a short poll is the
 * cheaper and sturdier way to get close.
 */
@Injectable({ providedIn: 'root' })
export class LiveRefresh {
  static readonly INTERVAL_MS = 15_000;

  private readonly loader = inject(QueueLoader);
  private readonly _tick = signal(0);
  private running = false;

  /** Advances after each completed pulse. Screens react to it through `onTick`. */
  readonly tick = this._tick.asReadonly();

  /**
   * One refresh of the portal: the shared list, then every screen's own data.
   * Skipped while the officer is busy or a pulse is already running.
   */
  async pulse(): Promise<void> {
    if (this.running || officerIsBusy()) return;
    this.running = true;
    try {
      await this.loader.refresh();
    } finally {
      this.running = false;
      this._tick.update((n) => n + 1);
    }
  }
}

/**
 * Runs `reload` on every pulse after the one current when it was called, for
 * as long as the calling component lives (the effect belongs to its injection
 * context and ends with it). Call from a constructor or field initializer.
 */
export function onTick(reload: () => void | Promise<void>): EffectRef {
  const live = inject(LiveRefresh);
  const start = live.tick();
  return effect(() => {
    const tick = live.tick();
    if (tick === start) return;
    untracked(() => void reload());
  });
}

/**
 * Whether the officer is in the middle of something a redraw could disturb:
 * typing in a field, or a dialog, dropdown or menu open.
 */
export function officerIsBusy(doc: Document = document): boolean {
  const active = doc.activeElement;
  if (active instanceof HTMLElement) {
    if (active.isContentEditable) return true;
    if (active.matches('textarea, select')) return true;
    if (active.matches('input') && !active.matches('[type=checkbox], [type=radio], [type=button], [type=submit], [type=reset]')) {
      return true;
    }
  }
  // Only one that is showing: several dialogs and menus stay in the page and
  // are hidden by CSS, and counting those would stop every pulse for good.
  const open = doc.querySelectorAll<HTMLElement>(
    'dialog[open], [role="dialog"], [role="alertdialog"], [aria-modal="true"], [role="menu"], .cdk-overlay-pane',
  );
  return [...open].some(isShown);
}

function isShown(element: HTMLElement): boolean {
  if (element.closest('[hidden]') !== null) return false;
  const check = (element as HTMLElement & { checkVisibility?: () => boolean }).checkVisibility;
  if (typeof check === 'function') return check.call(element);
  const style = element.ownerDocument.defaultView?.getComputedStyle(element);
  return style === undefined || (style.display !== 'none' && style.visibility !== 'hidden');
}
