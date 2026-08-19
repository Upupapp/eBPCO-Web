import { Component, input, output, signal } from '@angular/core';
import { Icon } from '../icon/icon';

// A reusable "Filters" trigger + popover shell (visually modeled on the
// filter-menu popover already built for business-stages-board). Each
// page projects its own filter controls in via content — the fields
// differ too much page to page (role+status, type+date, severity, …) to
// force into one generic config shape, so this only owns the open/close
// chrome and the "N active" badge.
@Component({
  selector: 'app-filter-panel',
  imports: [Icon],
  templateUrl: './filter-panel.html',
  styleUrl: './filter-panel.scss',
})
export class FilterPanel {
  readonly activeCount = input<number>(0);
  readonly showClear = input<boolean>(true);
  readonly clear = output<void>();

  protected readonly open = signal(false);

  protected toggle(): void {
    this.open.update((value) => !value);
  }

  protected close(): void {
    this.open.set(false);
  }
}
