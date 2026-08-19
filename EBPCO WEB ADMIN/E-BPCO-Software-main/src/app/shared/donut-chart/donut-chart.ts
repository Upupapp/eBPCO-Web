import { Component, computed, input } from '@angular/core';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutArc {
  label: string;
  value: number;
  color: string;
  pct: number;
  dashArray: string;
  dashOffset: number;
  labelX: number;
  labelY: number;
  labelColor: string;
  showLabel: boolean;
}

function readableTextColor(hex: string): string {
  const c = hex.replace('#', '');
  if (c.length !== 6) return '#ffffff';
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  const luminance = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return luminance > 0.5 ? '#1f2430' : '#ffffff';
}

@Component({
  selector: 'app-donut-chart',
  imports: [],
  templateUrl: './donut-chart.html',
  styleUrl: './donut-chart.scss',
})
export class DonutChart {
  readonly segments = input.required<DonutSegment[]>();
  readonly size = input<number>(200);
  readonly holeColor = input<string>('#fff');
  readonly showLabels = input<boolean>(true);
  readonly ringWidth = input<number>(21);
  readonly showCenterTotal = input<boolean>(false);
  readonly centerLabel = input<string>('');

  private readonly viewBoxSize = 100;
  private readonly gapDeg = 2.5;

  protected readonly total = computed(() => this.segments().reduce((sum, s) => sum + s.value, 0));

  protected readonly strokeWidthVb = computed(
    () => (this.ringWidth() / this.size()) * this.viewBoxSize,
  );

  protected readonly radius = computed(() => (this.viewBoxSize - this.strokeWidthVb()) / 2 - 1);

  protected readonly innerRadius = computed(() => this.radius() - this.strokeWidthVb() / 2);

  protected readonly circumference = computed(() => 2 * Math.PI * this.radius());

  protected readonly arcs = computed<DonutArc[]>(() => {
    const segs = this.segments();
    const total = this.total();
    const circumference = this.circumference();
    const gapLen = segs.length > 1 && total > 0 ? (this.gapDeg / 360) * circumference : 0;
    let cumulative = 0;

    return segs.map((s) => {
      const pct = total > 0 ? s.value / total : 0;
      const rawLength = pct * circumference;
      const length = Math.max(rawLength - gapLen, 0);
      const dashOffset = -(cumulative + gapLen / 2);
      const midFraction = (cumulative + rawLength / 2) / circumference;
      cumulative += rawLength;

      const angleRad = midFraction * 2 * Math.PI - Math.PI / 2;
      const labelR = this.radius();

      return {
        label: s.label,
        value: s.value,
        color: s.color,
        pct,
        dashArray: `${length} ${Math.max(circumference - length, 0)}`,
        dashOffset,
        labelX: 50 + labelR * Math.cos(angleRad),
        labelY: 50 + labelR * Math.sin(angleRad),
        labelColor: readableTextColor(s.color),
        showLabel: pct >= 0.06,
      };
    });
  });

  protected round(value: number): number {
    return Math.round(value);
  }

  protected formatTotal(value: number): string {
    return value.toLocaleString();
  }
}
