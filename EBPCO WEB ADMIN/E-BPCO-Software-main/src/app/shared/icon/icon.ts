import { Component, computed, input } from '@angular/core';

type Shape =
  | { tag: 'path'; d: string; fill?: string }
  | { tag: 'circle'; cx: number; cy: number; r: number; fill?: string }
  | { tag: 'rect'; x: number; y: number; width: number; height: number; rx?: number; fill?: string }
  | { tag: 'line'; x1: number; y1: number; x2: number; y2: number };

const ICONS: Record<string, Shape[]> = {
  copy: [
    { tag: 'rect', x: 8.5, y: 8.5, width: 11.5, height: 11.5, rx: 1.4 },
    {
      tag: 'path',
      d: 'M15.5 8.5V5.9a1.4 1.4 0 0 0-1.4-1.4H5.9A1.4 1.4 0 0 0 4.5 5.9v8.2a1.4 1.4 0 0 0 1.4 1.4h2.6',
    },
  ],
  home: [
    { tag: 'path', d: 'M3 11.5 12 4l9 7.5' },
    { tag: 'path', d: 'M5.5 10v9a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-9' },
  ],
  users: [
    { tag: 'circle', cx: 9, cy: 8, r: 3 },
    { tag: 'path', d: 'M3.5 20c.8-3.2 3.2-5 5.5-5s4.7 1.8 5.5 5' },
    { tag: 'path', d: 'M15.5 5.5a3 3 0 0 1 0 5.8' },
    { tag: 'path', d: 'M16.5 15c2 .3 3.7 1.8 4.3 5' },
  ],
  'user-check': [
    { tag: 'circle', cx: 10, cy: 8, r: 3.2 },
    { tag: 'path', d: 'M4 20c.8-3.4 3.2-5.3 6-5.3s5.2 1.9 6 5.3' },
    { tag: 'path', d: 'M16 12.5l1.8 1.8 3.2-3.4' },
  ],
  logs: [
    { tag: 'path', d: 'M6 3.5h9l4 4V20a.8.8 0 0 1-.8.8H6a.8.8 0 0 1-.8-.8V4.3A.8.8 0 0 1 6 3.5Z' },
    { tag: 'path', d: 'M15 3.5V7a1 1 0 0 0 1 1h3.5' },
    { tag: 'line', x1: 8, y1: 12, x2: 16, y2: 12 },
    { tag: 'line', x1: 8, y1: 15.3, x2: 16, y2: 15.3 },
    { tag: 'line', x1: 8, y1: 18.6, x2: 13, y2: 18.6 },
  ],
  building: [
    { tag: 'rect', x: 4.5, y: 3.5, width: 11, height: 17, rx: 0.6 },
    { tag: 'path', d: 'M15.5 9.5H19a.8.8 0 0 1 .8.8v9.4a.8.8 0 0 1-.8.8h-3.5' },
    { tag: 'line', x1: 7.3, y1: 7, x2: 9, y2: 7 },
    { tag: 'line', x1: 10.7, y1: 7, x2: 12.4, y2: 7 },
    { tag: 'line', x1: 7.3, y1: 10.6, x2: 9, y2: 10.6 },
    { tag: 'line', x1: 10.7, y1: 10.6, x2: 12.4, y2: 10.6 },
    { tag: 'line', x1: 7.3, y1: 14.2, x2: 9, y2: 14.2 },
    { tag: 'line', x1: 10.7, y1: 14.2, x2: 12.4, y2: 14.2 },
    { tag: 'line', x1: 8, y1: 20.5, x2: 8, y2: 17.5 },
  ],
  map: [
    { tag: 'path', d: 'M4,6 L9,4 L15,6 L20,4 V18 L15,20 L9,18 L4,20 Z' },
    { tag: 'line', x1: 9, y1: 4, x2: 9, y2: 18 },
    { tag: 'line', x1: 15, y1: 6, x2: 15, y2: 20 },
  ],
  workflow: [
    { tag: 'circle', cx: 5.5, cy: 6, r: 2.3 },
    { tag: 'circle', cx: 5.5, cy: 18, r: 2.3 },
    { tag: 'circle', cx: 18.5, cy: 12, r: 2.3 },
    { tag: 'path', d: 'M7.6 6.7 16.4 11' },
    { tag: 'path', d: 'M7.6 17.3 16.4 13' },
  ],
  search: [
    { tag: 'circle', cx: 10.5, cy: 10.5, r: 6.3 },
    { tag: 'line', x1: 15.2, y1: 15.2, x2: 20, y2: 20 },
  ],
  bell: [
    { tag: 'path', d: 'M6 10.5a6 6 0 0 1 12 0c0 4.2 1.3 5.8 1.9 6.5H4.1c.6-.7 1.9-2.3 1.9-6.5Z' },
    { tag: 'path', d: 'M10.2 20a2 2 0 0 0 3.6 0' },
  ],
  'chevron-down': [{ tag: 'path', d: 'M5.5 8.5 12 15l6.5-6.5' }],
  'chevron-up': [{ tag: 'path', d: 'M5.5 15.5 12 9l6.5 6.5' }],
  'chevron-left': [{ tag: 'path', d: 'M14.5 5.5 8 12l6.5 6.5' }],
  'chevron-right': [{ tag: 'path', d: 'M9.5 5.5 16 12l-6.5 6.5' }],
  'chevrons-left': [
    { tag: 'path', d: 'M16 5.5 9.5 12l6.5 6.5' },
    { tag: 'path', d: 'M10.5 5.5 4 12l6.5 6.5' },
  ],
  'chevrons-right': [
    { tag: 'path', d: 'M8 5.5 14.5 12 8 18.5' },
    { tag: 'path', d: 'M13.5 5.5 20 12l-6.5 6.5' },
  ],
  filter: [{ tag: 'path', d: 'M4 5h16l-6.2 7.4V19l-3.6 1.8v-8.4Z' }],
  download: [
    { tag: 'path', d: 'M12 3.5v11.5' },
    { tag: 'path', d: 'M7.5 10.5 12 15l4.5-4.5' },
    { tag: 'path', d: 'M4.5 17v2.5a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1V17' },
  ],
  plus: [
    { tag: 'line', x1: 12, y1: 5, x2: 12, y2: 19 },
    { tag: 'line', x1: 5, y1: 12, x2: 19, y2: 12 },
  ],
  eye: [
    { tag: 'path', d: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z' },
    { tag: 'circle', cx: 12, cy: 12, r: 2.6 },
  ],
  'eye-off': [
    { tag: 'path', d: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z' },
    { tag: 'circle', cx: 12, cy: 12, r: 2.6 },
    { tag: 'path', d: 'm3 3 18 18' },
  ],
  edit: [
    { tag: 'path', d: 'M4 20h16' },
    {
      tag: 'path',
      d: 'M14.7 4.3a1.6 1.6 0 0 1 2.3 0l2.7 2.7a1.6 1.6 0 0 1 0 2.3L9.5 19.6 4.5 20l.4-5Z',
    },
  ],
  trash: [
    { tag: 'path', d: 'M5 7h14' },
    { tag: 'path', d: 'M9.5 7V5.2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V7' },
    { tag: 'path', d: 'M7 7l1 12.2a1 1 0 0 0 1 .9h6a1 1 0 0 0 1-.9L17 7' },
  ],
  mail: [
    { tag: 'rect', x: 3, y: 5, width: 18, height: 14, rx: 1.6 },
    { tag: 'path', d: 'm4 7 8 6 8-6' },
  ],
  lock: [
    { tag: 'rect', x: 5, y: 10.5, width: 14, height: 9.5, rx: 1.8 },
    { tag: 'path', d: 'M8 10.5V8a4 4 0 1 1 8 0v2.5' },
  ],
  user: [
    { tag: 'circle', cx: 12, cy: 8.2, r: 3.6 },
    { tag: 'path', d: 'M4.5 20c1-3.8 4.2-6 7.5-6s6.5 2.2 7.5 6' },
  ],
  'alert-circle': [
    { tag: 'circle', cx: 12, cy: 12, r: 8.5 },
    { tag: 'line', x1: 12, y1: 7.5, x2: 12, y2: 13 },
    { tag: 'circle', cx: 12, cy: 16.3, r: 0.9, fill: 'currentColor' },
  ],
  info: [
    { tag: 'circle', cx: 12, cy: 12, r: 8.5 },
    { tag: 'circle', cx: 12, cy: 8, r: 0.9, fill: 'currentColor' },
    { tag: 'line', x1: 12, y1: 11, x2: 12, y2: 16.5 },
  ],
  'alert-triangle': [
    { tag: 'path', d: 'M12 4 21.5 20H2.5Z' },
    { tag: 'line', x1: 12, y1: 10, x2: 12, y2: 14.5 },
    { tag: 'circle', cx: 12, cy: 17, r: 0.9, fill: 'currentColor' },
  ],
  'check-circle': [
    { tag: 'circle', cx: 12, cy: 12, r: 8.5 },
    { tag: 'path', d: 'm8 12.3 2.6 2.6 5.4-5.8' },
  ],
  'x-circle': [
    { tag: 'circle', cx: 12, cy: 12, r: 8.5 },
    { tag: 'line', x1: 9, y1: 9, x2: 15, y2: 15 },
    { tag: 'line', x1: 15, y1: 9, x2: 9, y2: 15 },
  ],
  clock: [
    { tag: 'circle', cx: 12, cy: 12, r: 8.5 },
    { tag: 'line', x1: 12, y1: 12, x2: 12, y2: 7.3 },
    { tag: 'line', x1: 12, y1: 12, x2: 15.3, y2: 13.6 },
  ],
  shield: [{ tag: 'path', d: 'M12 3.5 19 6v6c0 4.6-3 7.6-7 8.5-4-.9-7-3.9-7-8.5V6Z' }],
  key: [
    { tag: 'circle', cx: 8, cy: 15, r: 3.6 },
    { tag: 'path', d: 'm10.5 12.5 8-8' },
    { tag: 'path', d: 'M15.5 7.5 18 10' },
    { tag: 'path', d: 'M17.5 5.5 20 8' },
  ],
  gear: [
    { tag: 'circle', cx: 12, cy: 12, r: 3.2 },
    {
      tag: 'path',
      d: 'M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M17.7 6.3l-1.6 1.6M7.9 16.1l-1.6 1.6M17.7 17.7l-1.6-1.6M7.9 7.9 6.3 6.3',
    },
  ],
  cloud: [
    {
      tag: 'path',
      d: 'M7 18.5a4.2 4.2 0 0 1-.5-8.4 5.6 5.6 0 0 1 10.8-1.7A4.3 4.3 0 0 1 17 18.5Z',
    },
  ],
  plug: [
    { tag: 'path', d: 'M9 3v5' },
    { tag: 'path', d: 'M15 3v5' },
    { tag: 'path', d: 'M6.5 8h11v3.5a5.5 5.5 0 0 1-11 0Z' },
    { tag: 'path', d: 'M12 15.5V21' },
  ],
  save: [
    { tag: 'path', d: 'M5 4h11l3 3v13H5Z' },
    { tag: 'path', d: 'M8 4v5h7V4' },
    { tag: 'path', d: 'M8 14.5h8V20H8Z' },
  ],
  wallet: [
    {
      tag: 'path',
      d: 'M4 7.5a1.6 1.6 0 0 1 1.6-1.6H18a1.6 1.6 0 0 1 1.6 1.6v10.2A1.6 1.6 0 0 1 18 19.3H5.6A1.6 1.6 0 0 1 4 17.7Z',
    },
    { tag: 'path', d: 'M14.5 12.5h4v3h-4a1.5 1.5 0 0 1 0-3Z' },
    { tag: 'circle', cx: 16.2, cy: 14, r: 0.7, fill: 'currentColor' },
  ],
  'file-check': [
    { tag: 'path', d: 'M6 3.5h8l4 4V20a.8.8 0 0 1-.8.8H6a.8.8 0 0 1-.8-.8V4.3A.8.8 0 0 1 6 3.5Z' },
    { tag: 'path', d: 'M14 3.5V7a1 1 0 0 0 1 1h3.5' },
    { tag: 'path', d: 'm8.7 14.7 2 2 4-4.4' },
  ],
  sparkles: [
    { tag: 'path', d: 'M12 3.5 13.6 8l4.5 1.6-4.5 1.6L12 15.7l-1.6-4.5L5.9 9.6l4.5-1.6Z' },
    { tag: 'path', d: 'M18.5 15v3.2' },
    { tag: 'path', d: 'M17 16.6h3' },
    { tag: 'path', d: 'M5.5 15.5v2.4' },
    { tag: 'path', d: 'M4.3 16.7h2.4' },
  ],
  printer: [
    { tag: 'path', d: 'M7 8.5V4h10v4.5' },
    { tag: 'rect', x: 4, y: 8.5, width: 16, height: 7, rx: 1.2 },
    { tag: 'path', d: 'M7 14.5h10V20H7Z' },
    { tag: 'circle', cx: 16.5, cy: 11, r: 0.6, fill: 'currentColor' },
  ],
  send: [
    { tag: 'path', d: 'M4 12h15.5' },
    { tag: 'path', d: 'm14 6.5 5.5 5.5-5.5 5.5' },
  ],
  image: [
    { tag: 'rect', x: 3.5, y: 4.5, width: 17, height: 15, rx: 1.4 },
    { tag: 'circle', cx: 9, cy: 10, r: 1.6 },
    { tag: 'path', d: 'm5 17 5-5 3.5 3.5L17 12l3 3.5' },
  ],
  'trend-up': [
    { tag: 'path', d: 'M3.5 16 10 9.5l4 4 6.5-7' },
    { tag: 'path', d: 'M16.5 6.5H20.5V10.5' },
  ],
  'trend-down': [
    { tag: 'path', d: 'M3.5 8 10 14.5l4-4 6.5 7' },
    { tag: 'path', d: 'M16.5 17.5H20.5V13.5' },
  ],
  calendar: [
    { tag: 'rect', x: 3.5, y: 5, width: 17, height: 15.5, rx: 1.6 },
    { tag: 'line', x1: 3.5, y1: 9.5, x2: 20.5, y2: 9.5 },
    { tag: 'line', x1: 8, y1: 3, x2: 8, y2: 6.5 },
    { tag: 'line', x1: 16, y1: 3, x2: 16, y2: 6.5 },
  ],
  logout: [
    { tag: 'path', d: 'M9 20H5.5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1H9' },
    { tag: 'path', d: 'M16 16.5 20.5 12 16 7.5' },
    { tag: 'line', x1: 20.5, y1: 12, x2: 9.5, y2: 12 },
  ],
  'dots-vertical': [
    { tag: 'circle', cx: 12, cy: 5.5, r: 1, fill: 'currentColor' },
    { tag: 'circle', cx: 12, cy: 12, r: 1, fill: 'currentColor' },
    { tag: 'circle', cx: 12, cy: 18.5, r: 1, fill: 'currentColor' },
  ],
  'dots-horizontal': [
    { tag: 'circle', cx: 5.5, cy: 12, r: 1, fill: 'currentColor' },
    { tag: 'circle', cx: 12, cy: 12, r: 1, fill: 'currentColor' },
    { tag: 'circle', cx: 18.5, cy: 12, r: 1, fill: 'currentColor' },
  ],
  camera: [
    {
      tag: 'path',
      d: 'M4 8.5a1.2 1.2 0 0 1 1.2-1.2h1.6l1-1.6h8.4l1 1.6h1.6A1.2 1.2 0 0 1 20 8.5v9.3a1.2 1.2 0 0 1-1.2 1.2H5.2A1.2 1.2 0 0 1 4 17.8Z',
    },
    { tag: 'circle', cx: 12, cy: 13, r: 3.4 },
  ],
  smile: [
    { tag: 'circle', cx: 12, cy: 12, r: 8.5 },
    { tag: 'path', d: 'M8.3 14.2s1.5 2.3 3.7 2.3 3.7-2.3 3.7-2.3' },
    { tag: 'circle', cx: 9, cy: 10, r: 0.9, fill: 'currentColor' },
    { tag: 'circle', cx: 15, cy: 10, r: 0.9, fill: 'currentColor' },
  ],
  'thumb-up': [
    { tag: 'path', d: 'M7 11v9H4.5a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z' },
    {
      tag: 'path',
      d: 'M7 11l3.4-7a1.6 1.6 0 0 1 3 1v3.5H17a1.6 1.6 0 0 1 1.55 1.98l-1.3 5.5A1.6 1.6 0 0 1 15.7 17H7',
    },
  ],
  'arrow-up-right': [
    { tag: 'path', d: 'M7 17 17 7' },
    { tag: 'path', d: 'M9 7h8v8' },
  ],
  'thumb-down': [
    { tag: 'path', d: 'M17 13V4h2.5a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1Z' },
    {
      tag: 'path',
      d: 'M17 13l-3.4 7a1.6 1.6 0 0 1-3-1v-3.5H7a1.6 1.6 0 0 1-1.55-1.98l1.3-5.5A1.6 1.6 0 0 1 8.3 7H17',
    },
  ],
};

@Component({
  selector: 'app-icon',
  imports: [],
  templateUrl: './icon.html',
  styleUrl: './icon.scss',
})
export class Icon {
  readonly name = input.required<string>();
  readonly size = input<number>(20);
  readonly strokeWidth = input<number>(1.8);

  protected readonly shapes = computed<Shape[]>(() => ICONS[this.name()] ?? []);
}
