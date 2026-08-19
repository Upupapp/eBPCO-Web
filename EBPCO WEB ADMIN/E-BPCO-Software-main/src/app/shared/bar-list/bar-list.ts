import { Component, computed, input } from '@angular/core';
import { Avatar } from '../avatar/avatar';

export interface BarListRow {
  name: string;
  value: number;
}

@Component({
  selector: 'app-bar-list',
  imports: [Avatar],
  templateUrl: './bar-list.html',
  styleUrl: './bar-list.scss',
})
export class BarList {
  readonly rows = input.required<BarListRow[]>();
  readonly barColor = input<string>('#c81e2c');

  protected readonly maxValue = computed(() =>
    Math.max(...this.rows().map((r) => r.value), 1),
  );

  protected widthFor(value: number): number {
    return Math.max((value / this.maxValue()) * 100, 6);
  }
}
