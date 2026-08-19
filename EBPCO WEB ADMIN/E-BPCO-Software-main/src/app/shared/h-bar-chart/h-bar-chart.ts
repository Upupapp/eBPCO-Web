import { Component, computed, input } from '@angular/core';

export interface HBarRow {
  label: string;
  value: number;
}

@Component({
  selector: 'app-h-bar-chart',
  imports: [],
  templateUrl: './h-bar-chart.html',
  styleUrl: './h-bar-chart.scss',
})
export class HBarChart {
  readonly rows = input.required<HBarRow[]>();
  readonly maxValue = input<number>(700);
  readonly ticks = input<number[]>([0, 175, 350, 525, 700]);
  readonly color = input<string>('#2563eb');

  protected widthFor(value: number): number {
    return Math.min((value / this.maxValue()) * 100, 100);
  }

  protected readonly tickPositions = computed(() =>
    this.ticks().map((t) => ({ value: t, pct: (t / this.maxValue()) * 100 })),
  );
}
