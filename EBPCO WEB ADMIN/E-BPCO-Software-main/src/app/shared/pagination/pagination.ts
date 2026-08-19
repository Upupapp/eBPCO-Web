import { Component, computed, input, model } from '@angular/core';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-pagination',
  imports: [Icon],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
})
export class Pagination {
  readonly totalItems = input.required<number>();
  readonly pageSize = input<number>(10);
  readonly page = model<number>(1);

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.pageSize())),
  );

  protected readonly pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1),
  );

  protected readonly rangeLabel = computed(() => {
    const total = this.totalItems();
    if (total === 0) {
      return `Showing 0 of 0`;
    }
    const start = (this.page() - 1) * this.pageSize() + 1;
    const end = Math.min(this.page() * this.pageSize(), total);
    return `Showing ${start}-${end} from ${total}`;
  });

  goTo(p: number): void {
    if (p >= 1 && p <= this.totalPages()) {
      this.page.set(p);
    }
  }

  first(): void {
    this.goTo(1);
  }

  last(): void {
    this.goTo(this.totalPages());
  }
}
