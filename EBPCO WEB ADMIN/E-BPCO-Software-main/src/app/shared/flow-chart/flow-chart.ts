import { Component, computed, input } from '@angular/core';

export type FlowNodeType = 'start' | 'end' | 'process' | 'decision';
export type FlowEdgeColor = 'gray' | 'red' | 'green' | 'pink' | 'blue';

export interface FlowNode {
  id: string;
  type: FlowNodeType;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  platform?: string;
}

export interface FlowEdge {
  path: string;
  color?: FlowEdgeColor;
  label?: string;
  labelX?: number;
  labelY?: number;
}

const EDGE_COLORS: Record<FlowEdgeColor, string> = {
  gray: '#6b7280',
  red: '#e0402c',
  green: '#22a55e',
  pink: '#d6389b',
  blue: '#2563eb',
};

@Component({
  selector: 'app-flow-chart',
  imports: [],
  templateUrl: './flow-chart.html',
  styleUrl: './flow-chart.scss',
})
export class FlowChart {
  readonly title = input<string>('');
  readonly nodes = input.required<FlowNode[]>();
  readonly edges = input.required<FlowEdge[]>();
  readonly viewBoxWidth = input<number>(1000);
  readonly viewBoxHeight = input<number>(800);

  protected readonly viewBox = computed(
    () => `0 0 ${this.viewBoxWidth()} ${this.viewBoxHeight()}`,
  );

  protected colorFor(edge: FlowEdge): string {
    return EDGE_COLORS[edge.color ?? 'gray'];
  }

  protected markerFor(edge: FlowEdge): string {
    return `url(#arrow-${edge.color ?? 'gray'})`;
  }

  protected diamondPoints(n: FlowNode): string {
    const { w, h } = n;
    return `${w / 2},0 ${w},${h / 2} ${w / 2},${h} 0,${h / 2}`;
  }

  protected transformFor(n: FlowNode): string {
    return `translate(${n.x},${n.y})`;
  }

  protected labelTransformFor(edge: FlowEdge): string {
    return `translate(${edge.labelX ?? 0},${edge.labelY ?? 0})`;
  }

  protected labelWidth(label: string): number {
    return Math.max(label.length * 6.4 + 14, 30);
  }
}
