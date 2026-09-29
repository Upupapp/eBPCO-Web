import { Injectable, signal } from '@angular/core';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  tone: ToastTone;
  text: string;
}

/**
 * The one place a page reports "that action just succeeded" or "that
 * action just failed" to the user — every mutating action across this app
 * used to either say nothing at all (the common case) or hand-roll its
 * own page-local signal/banner (quickActionError, actionError,
 * paymentFormError, releaseError, dropError — four independent copies of
 * the same idea, and none of them had a success-side equivalent). This
 * replaces "silent no-op on success" everywhere; the existing contextual
 * banners stay for explaining *why* a specific control is blocked, since
 * a toast disappears and they don't.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();
  private nextId = 1;

  success(text: string): void {
    this.push('success', text);
  }

  error(text: string): void {
    this.push('error', text);
  }

  info(text: string): void {
    this.push('info', text);
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private push(tone: ToastTone, text: string): void {
    const id = this.nextId++;
    this._toasts.update((list) => [...list, { id, tone, text }]);
    setTimeout(() => this.dismiss(id), toastDuration(tone, text));
  }
}

/**
 * Long enough to read. A fixed 4s (6s for an error) took a reason such as
 * "Review the documents the Initial stage checks before passing it: …" away
 * before it was read. About a quarter of a second a word on top of the old
 * floor, which errors keep higher, up to 15s.
 */
export function toastDuration(tone: ToastTone, text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const floor = tone === 'error' ? 6_000 : 4_000;
  return Math.min(15_000, Math.max(floor, 1_500 + words * 280));
}
