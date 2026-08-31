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
  readonly tone = input<'danger' | 'default'>('default');

  /** Set to collect a reason. Null (the default) shows no field. */
  readonly reasonLabel = input<string | null>(null);
  readonly reasonPlaceholder = input<string>('');
  /** The server's own floor is 3 characters; matching it avoids a round trip. */
  readonly reasonMinLength = input<number>(3);

  readonly confirmed = output<string>();
  readonly cancelled = output<void>();

  protected readonly reason = signal('');
  protected readonly touched = signal(false);

  protected readonly reasonTooShort = computed(
    () => this.reason().trim().length < this.reasonMinLength(),
  );

  protected onConfirm(): void {
    if (this.reasonLabel() === null) {
      this.confirmed.emit('');
      return;
    }
    this.touched.set(true);
    if (this.reasonTooShort()) return;
    this.confirmed.emit(this.reason().trim());
  }
}
