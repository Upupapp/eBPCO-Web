import { Component, computed, input } from '@angular/core';

export interface StackedBarSegment {
  label: string;
  value: number;
  color: string;
}

export interface StackedBarRow {
  label: string;
  total: number;
  segments: StackedBarSegment[];
  tooltip: string;
}

@Component({
  selector: 'app-stacked-bar-chart',
  imports: [],
  templateUrl: './stacked-bar-chart.html',
  styleUrl: './stacked-bar-chart.scss',
})
export class StackedBarChart {
  readonly rows = input.required<StackedBarRow[]>();

  // Bar length encodes each row's total queue volume (comparable across
  // permit types); the fill within that length encodes status composition.
  protected readonly maxTotal = computed(() =>
    Math.max(...this.rows().map((r) => r.total), 1),
  );

  protected trackWidth(total: number): number {
    return Math.max((total / this.maxTotal()) * 100, 4);
  }

  protected segmentWidth(value: number, total: number): number {
    return total > 0 ? (value / total) * 100 : 0;
  }
}
