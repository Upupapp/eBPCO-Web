import { Component, inject } from '@angular/core';

import { Capabilities } from '../../core/session/capabilities';
import { Icon } from '../icon/icon';

/**
 * Says, once and in one wording, that this account may look but not act.
 *
 * ── Why a component rather than a disabled attribute ────────────────────
 *
 * A greyed-out button is not an explanation. An officer meeting one has three
 * candidate readings — the record is in the wrong state, the portal is broken,
 * or they lack the access — and only the third is true. They will try the other
 * two first: reload, re-open the record, ask a colleague to check it, and
 * eventually raise it as a bug. That is the cost of an unexplained control,
 * and it is paid every time, by a different person.
 *
 * This portal has already fixed the same shape four times in dead range
 * selects (F-27): a control that names something and does nothing.
 *
 * Renders nothing when the account may edit, so it is safe to place
 * unconditionally above any write surface.
 */
@Component({
  selector: 'app-view-only-notice',
  imports: [Icon],
  template: `
    @if (capabilities.isViewOnly()) {
      <div class="view-only-notice" role="note">
        <app-icon name="info" [size]="16" />
        <span>{{ capabilities.viewOnlyReason() }}</span>
      </div>
    }
  `,
  styleUrl: './view-only-notice.scss',
})
export class ViewOnlyNotice {
  protected readonly capabilities = inject(Capabilities);
}
