import { Component, input, output } from '@angular/core';

// A single reusable confirmation prompt (built on the app's existing
// .modal-backdrop/.modal-box classes — see shared/styles/_modal.scss)
// for any "are you sure?" action, most commonly Delete. Callers own
// their own open/closed state and just render this conditionally.
@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog {
  readonly title = input.required<string>();
  readonly message = input<string>('');
  readonly confirmLabel = input<string>('Confirm');
  readonly cancelLabel = input<string>('Cancel');
  readonly tone = input<'danger' | 'default'>('default');

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
