import { FlowEdge, FlowEdgeColor, FlowNode } from '../../shared/flow-chart/flow-chart';

export const ROW_GAP = 90;
const GAP = ROW_GAP;

export class FlowBuilder {
  readonly nodes: FlowNode[] = [];
  readonly edges: FlowEdge[] = [];

  private cursorY = 40;
  private counter = 0;

  constructor(
    private readonly centerX = 455,
    private readonly idPrefix = 'n',
  ) {}

  get cursor(): number {
    return this.cursorY;
  }

  setCursor(y: number): void {
    this.cursorY = y;
  }

  private nextId(): string {
    return `${this.idPrefix}${this.counter++}`;
  }

  start(label = 'START'): FlowNode {
    const n: FlowNode = {
      id: this.nextId(),
      type: 'start',
      x: this.centerX - 55,
      y: this.cursorY,
      w: 110,
      h: 64,
      label,
    };
    this.nodes.push(n);
    this.cursorY += n.h + GAP;
    return n;
  }

  end(label: string): FlowNode {
    const n: FlowNode = {
      id: this.nextId(),
      type: 'end',
      x: this.centerX - 85,
      y: this.cursorY,
      w: 170,
      h: 100,
      label,
    };
    this.nodes.push(n);
    this.cursorY += n.h + GAP;
    return n;
  }

  process(
    label: string,
    platform?: string,
    opts: { h?: number; w?: number; cx?: number; y?: number; advance?: boolean } = {},
  ): FlowNode {
    const h = opts.h ?? 110;
    const w = opts.w ?? 220;
    const cx = opts.cx ?? this.centerX;
    const y = opts.y ?? this.cursorY;
    const n: FlowNode = { id: this.nextId(), type: 'process', x: cx - w / 2, y, w, h, label, platform };
    this.nodes.push(n);
    if (opts.advance !== false && opts.y === undefined) {
      this.cursorY += h + GAP;
    }
    return n;
  }

  decision(
    label: string,
    opts: { h?: number; w?: number; cx?: number; y?: number; advance?: boolean } = {},
  ): FlowNode {
    const h = opts.h ?? 150;
    const w = opts.w ?? 210;
    const cx = opts.cx ?? this.centerX;
    const y = opts.y ?? this.cursorY;
    const n: FlowNode = { id: this.nextId(), type: 'decision', x: cx - w / 2, y, w, h, label };
    this.nodes.push(n);
    if (opts.advance !== false && opts.y === undefined) {
      this.cursorY += h + GAP;
    }
    return n;
  }

  linkDown(a: FlowNode, b: FlowNode, color: FlowEdgeColor = 'gray', label?: string): FlowEdge {
    const ax = a.x + a.w / 2;
    const ay = a.y + a.h;
    const bx = b.x + b.w / 2;
    const by = b.y;
    let path: string;
    let labelX: number;
    let labelY: number;

    if (Math.abs(ax - bx) < 1) {
      path = `M${ax},${ay} L${bx},${by}`;
      labelX = ax + 24;
      labelY = (ay + by) / 2;
    } else {
      const midY = ay + (by - ay) / 2;
      path = `M${ax},${ay} L${ax},${midY} L${bx},${midY} L${bx},${by}`;
      labelX = (ax + bx) / 2;
      labelY = midY - 10;
    }

    const e: FlowEdge = { path, color, label, labelX, labelY };
    this.edges.push(e);
    return e;
  }

  linkAround(
    a: FlowNode,
    b: FlowNode,
    color: FlowEdgeColor,
    label: string | undefined,
    opts: { fromSide: 'left' | 'right' | 'bottom' | 'top'; toSide: 'left' | 'right' | 'top' | 'bottom'; viaX?: number; viaY?: number },
  ): FlowEdge {
    let fx: number, fy: number;
    switch (opts.fromSide) {
      case 'right':
        fx = a.x + a.w;
        fy = a.y + a.h / 2;
        break;
      case 'left':
        fx = a.x;
        fy = a.y + a.h / 2;
        break;
      case 'top':
        fx = a.x + a.w / 2;
        fy = a.y;
        break;
      default:
        fx = a.x + a.w / 2;
        fy = a.y + a.h;
    }

    let tx: number, ty: number;
    switch (opts.toSide) {
      case 'right':
        tx = b.x + b.w;
        ty = b.y + b.h / 2;
        break;
      case 'left':
        tx = b.x;
        ty = b.y + b.h / 2;
        break;
      case 'bottom':
        tx = b.x + b.w / 2;
        ty = b.y + b.h;
        break;
      default:
        tx = b.x + b.w / 2;
        ty = b.y;
    }

    let path: string;
    let labelX: number;
    let labelY: number;

    if (opts.viaX !== undefined) {
      path = `M${fx},${fy} L${opts.viaX},${fy} L${opts.viaX},${ty} L${tx},${ty}`;
      labelX = opts.viaX;
      labelY = (fy + ty) / 2;
    } else {
      const viaY = opts.viaY ?? (fy + ty) / 2;
      path = `M${fx},${fy} L${fx},${viaY} L${tx},${viaY} L${tx},${ty}`;
      labelX = (fx + tx) / 2;
      labelY = viaY - 10;
    }

    const e: FlowEdge = { path, color, label, labelX, labelY };
    this.edges.push(e);
    return e;
  }

  translated(dx: number, dy: number): { nodes: FlowNode[]; edges: FlowEdge[] } {
    const nodes = this.nodes.map((n) => ({ ...n, x: n.x + dx, y: n.y + dy }));
    const edges = this.edges.map((e) => ({
      ...e,
      path: translatePath(e.path, dx, dy),
      labelX: e.labelX !== undefined ? e.labelX + dx : undefined,
      labelY: e.labelY !== undefined ? e.labelY + dy : undefined,
    }));
    return { nodes, edges };
  }
}

function translatePath(path: string, dx: number, dy: number): string {
  return path.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_match, x, y) => {
    const nx = parseFloat(x) + dx;
    const ny = parseFloat(y) + dy;
    return `${nx},${ny}`;
  });
}
