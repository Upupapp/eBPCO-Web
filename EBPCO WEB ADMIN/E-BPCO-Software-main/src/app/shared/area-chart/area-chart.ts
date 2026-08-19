import { Component, ElementRef, computed, input, signal, viewChild } from '@angular/core';

export interface AreaSeriesInput {
  name: string;
  color: string;
  values: number[];
}

interface SeriesGeometry {
  name: string;
  color: string;
  values: number[];
  linePath: string;
  areaPath: string;
  points: { x: number; y: number }[];
}

const VB_WIDTH = 1000;
const VB_HEIGHT = 300;
const PAD_TOP = 24;

function catmullRomPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M${points[0].x},${points[0].y}`;

  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
  }
  return d;
}

// Rounds to a "clean" tick step (1/2/5 * 10^n) so the y-axis reads 0, 100,
// 200… instead of arbitrary fractions of the data's actual max.
function niceTicks(max: number, count = 5): number[] {
  if (max <= 0) return [0];
  const rawStep = max / (count - 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const residual = rawStep / magnitude;
  let step: number;
  if (residual > 5) step = 10 * magnitude;
  else if (residual > 2) step = 5 * magnitude;
  else if (residual > 1) step = 2 * magnitude;
  else step = magnitude;

  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(Math.round(v));
  return ticks.reverse();
}

@Component({
  selector: 'app-area-chart',
  imports: [],
  templateUrl: './area-chart.html',
  styleUrl: './area-chart.scss',
})
export class AreaChart {
  readonly series = input<AreaSeriesInput[]>([
    {
      name: 'New Applications',
      color: '#2563eb',
      values: [32, 38, 41, 35, 47, 52, 58, 63, 55, 61, 68, 74],
    },
    {
      name: 'Approved Applications',
      color: '#f59e0b',
      values: [210, 225, 240, 232, 255, 270, 290, 305, 298, 315, 335, 352],
    },
  ]);
  readonly xLabels = input<string[]>([
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]);

  protected readonly chartArea = viewChild<ElementRef<HTMLDivElement>>('chartArea');
  protected readonly hoveredIndex = signal<number | null>(null);

  protected readonly domainMax = computed(() =>
    Math.max(...this.series().flatMap((s) => s.values), 1),
  );

  protected readonly ticks = computed(() => niceTicks(this.domainMax()));
  private readonly tickMax = computed(() => this.ticks()[0] || 1);

  protected readonly xStep = computed(() => {
    const n = this.xLabels().length;
    return n > 1 ? VB_WIDTH / (n - 1) : VB_WIDTH;
  });

  private yFor(value: number): number {
    const usable = VB_HEIGHT - PAD_TOP;
    return PAD_TOP + (1 - value / this.tickMax()) * usable;
  }

  protected readonly geometry = computed<SeriesGeometry[]>(() => {
    const step = this.xStep();
    return this.series().map((s) => {
      const points = s.values.map((v, i) => ({ x: i * step, y: this.yFor(v) }));
      const last = points[points.length - 1];
      const first = points[0];
      const linePath = catmullRomPath(points);
      const areaPath = `${linePath} L${last.x},${VB_HEIGHT} L${first.x},${VB_HEIGHT} Z`;
      return { name: s.name, color: s.color, values: s.values, linePath, areaPath, points };
    });
  });

  protected readonly crosshairX = computed(() => {
    const i = this.hoveredIndex();
    return i === null ? null : i * this.xStep();
  });

  protected readonly tooltip = computed(() => {
    const i = this.hoveredIndex();
    if (i === null) return null;
    return {
      label: this.xLabels()[i],
      rows: this.series().map((s) => ({ name: s.name, color: s.color, value: s.values[i] })),
    };
  });

  onPointerMove(event: MouseEvent): void {
    const el = this.chartArea()?.nativeElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return;
    const ratio = (event.clientX - rect.left) / rect.width;
    const n = this.xLabels().length;
    const idx = Math.round(ratio * (n - 1));
    this.hoveredIndex.set(Math.min(Math.max(idx, 0), n - 1));
  }

  onPointerLeave(): void {
    this.hoveredIndex.set(null);
  }

  protected yForTick(tick: number): number {
    return this.yFor(tick);
  }

  protected formatTick(value: number): string {
    return value >= 1000 ? `${Math.round(value / 100) / 10}k` : `${value}`;
  }
}
