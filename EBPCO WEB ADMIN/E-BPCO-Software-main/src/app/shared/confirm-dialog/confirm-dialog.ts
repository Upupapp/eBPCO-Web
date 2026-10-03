import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * A single reusable confirmation prompt, built on the app's existing
 * `.modal-backdrop` / `.modal-box` classes. Callers own their open/closed
 * state and render this conditionally.
 *
 * ── Optionally, a reason ────────────────────────────────────────────────
 *
 * When `reasonLabel` is set the dialog collects one and will not confirm
 * without it. Archiving an application requires remarks — the server demands
 * them and refuses the request otherwise — and the reason belongs in the same
 * dialog as the decision rather than in a second step somebody can skip.
 *
 * `confirmed` carries the reason, empty when none was asked for. Callers that
 * ignore the payload are unaffected.
 */
@Component({
  selector: 'app-confirm-dialog',
  imports: [FormsModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog {
  readonly title = input.required<string>();
  readonly message = input<string>('');
  readonly confirmLabel = input<string>('Confirm');
  readonly cancelLabel = input<string>('Cancel');
  /** 'archive': amber, a filing box — setting something aside, never the red of a delete. */
  readonly tone = input<'danger' | 'default' | 'archive'>('default');

  /** Set to collect a reason. Null (the default) shows no field. */
  readonly reasonLabel = input<string | null>(null);
  readonly reasonPlaceholder = input<string>('');
  /** The server's own floor is 3 characters; matching it avoids a round trip. */
  readonly reasonMinLength = input<number>(3);
  /**
   * For a field that is not a reason (an Official Receipt number): checks the
   * value and returns what is wrong with it, or null. Its message replaces
   * "Please give a reason", which made no sense under a receipt number (QA
   * TC-08, 2026-10-03).
   */
  readonly valueCheck = input<((value: string) => string | null) | null>(null);

  readonly confirmed = output<string>();
  readonly cancelled = output<void>();

  protected readonly reason = signal('');
  protected readonly touched = signal(false);

  protected readonly reasonTooShort = computed(
    () => this.reason().trim().length < this.reasonMinLength(),
  );

  /** What is wrong with the value, by `valueCheck`; null when there is no check or nothing is wrong. */
  protected readonly valueProblem = computed(() => this.valueCheck()?.(this.reason()) ?? null);

  protected onConfirm(): void {
    if (this.reasonLabel() === null) {
      this.confirmed.emit('');
      return;
    }
    this.touched.set(true);
    if (this.valueCheck() !== null ? this.valueProblem() !== null : this.reasonTooShort()) return;
    this.confirmed.emit(this.reason().trim());
  }
}
