import { Component, computed, inject } from '@angular/core';

import { Capabilities } from '../../core/session/capabilities';
import { Icon } from '../icon/icon';

/**
 * Explains a queue that is scoped to the officer's assigned forms.
 *
 * ── Why an empty queue needs a sentence ─────────────────────────────────
 *
 * "No applications" is three different facts wearing one label:
 *
 *   there are none          the office has nothing in flight
 *   none in YOUR forms      there is work, but not work you are assigned to
 *   you have no forms       your account can see nothing at all
 *
 * The second is the one that costs a day. An officer sees an empty queue,
 * concludes the office is quiet, and does not ask — while applications sit in
 * a permit type they were never assigned. The third is worse and quieter: a
 * newly approved account with no forms looks exactly like an idle morning.
 *
 * ── This never filters ──────────────────────────────────────────────────
 *
 * The queue is scoped by the SERVER. Filtering a full list on the client would
 * leak the existence and the count of applications the officer may not see,
 * which is the thing the scoping exists to prevent. This component only reads
 * what the server said the account holds, to explain what the officer is
 * looking at.
 *
 * Renders nothing when the server did not report forms, rather than guessing.
 */
@Component({
  selector: 'app-assigned-forms-notice',
  imports: [Icon],
  template: `
    @if (message(); as text) {
      <div class="assigned-forms-notice" [class.warn]="capabilities.hasNoForms()" role="note">
        <app-icon [name]="capabilities.hasNoForms() ? 'alert-triangle' : 'info'" [size]="16" />
        <span>{{ text }}</span>
      </div>
    }
  `,
  styleUrl: './assigned-forms-notice.scss',
})
export class AssignedFormsNotice {
  protected readonly capabilities = inject(Capabilities);

  protected readonly message = computed(() => {
    const forms = this.capabilities.assignedForms();
    if (forms === null) return '';
    if (forms.length === 0) {
      return 'Your account is assigned no forms, so nothing can appear here. '
        + 'An administrator has to assign at least one.';
    }
    return `You are assigned ${forms.length} form${forms.length === 1 ? '' : 's'}: `
      + `${forms.join(', ')}. Applications for other permit types are not shown here.`;
  });
}
