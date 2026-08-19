import { Component, computed, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Icon } from '../icon/icon';

export type KpiTone = 'brand' | 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'violet';
export type KpiDensity = 'standard' | 'compact';
export type KpiSize = 'standard' | 'large';
export type KpiInsight = 'progress' | 'sparkline' | 'bars' | 'record' | 'avatars' | 'none';
/** Where the trend chip renders — `'footer'` (default) pairs it with the footer's other content, matching the original insight-footer design; `'main'` puts it directly under the value, for a card whose primary story *is* the trend. */
export type KpiTrendPlacement = 'main' | 'footer';

// A closed library of reusable "dimensional" illustration concepts, grouped
// by domain/semantic meaning rather than one bespoke asset per card — e.g.
// every pending-state metric across Applications/Payments/Permit
// Release/System Logs reuses 'pending', tinted by that card's own `tone`.
// Rendered today as layered, glass-gradient SVG (glow + shadow + acrylic
// highlight); `artwork` below is the drop-in slot for real rendered WebP/PNG
// assets later without touching any call site.
export type KpiIllustration =
  | 'totals'
  | 'users'
  | 'active'
  | 'pending'
  | 'roles'
  | 'applications'
  | 'businesses'
  | 'evaluations'
  | 'payments'
  | 'permit'
  | 'logs'
  | 'success'
  | 'critical'
  | 'warning';

export interface KpiTrend {
  label: string;
  direction: 'up' | 'down';
  /** Meaning is independent of direction — a rising "Overdue" count is negative, a rising "Approved" count is positive. */
  sentiment: 'positive' | 'negative';
  /** The comparison period shown next to the chip, e.g. "vs previous 30 days". Only set this when a real prior-period comparison backs it. */
  comparison?: string;
}

/** A single most-relevant record surfaced in the footer — e.g. the oldest overdue item. Never invented; only pass this when a real record backs it. */
export interface KpiRecord {
  label: string;
  meta: string;
}

export interface KpiAvatar {
  initials: string;
}

let uid = 0;

// The one canonical KPI/stat/metric surface for the whole app — every
// dashboard stat card, ring-stat row, and detail-view metric tile
// consolidates into this single component instead of the four
// independent implementations (StatCard, raw .ring-card markup, the
// shared .metric-tile, and businesses.scss's colliding local
// .metric-tile) that existed before. Colors are a closed `tone` enum
// resolved against shared/styles/_tokens.scss — pages never pass a raw
// hex value in.
const TONE_ACCENT: Record<KpiTone, string> = {
  brand: '#c81e2c',
  neutral: '#565c6b',
  info: '#2563eb',
  success: '#16a34a',
  warning: '#f59e0b',
  danger: '#dc2626',
  violet: '#7c3aed',
};

@Component({
  selector: 'app-kpi-card',
  imports: [Icon, NgTemplateOutlet],
  templateUrl: './kpi-card.html',
  styleUrl: './kpi-card.scss',
})
export class KpiCard {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  /** A unit/suffix rendered smaller and muted next to the value (e.g. "days", "GB"). Omit for currency, where the symbol is conventionally part of the value itself. */
  readonly unit = input<string>('');
  /** A short one-line explainer of what this metric IS, rendered under the value in the main area (e.g. "Review and process building permit applications."). Distinct from `support`, which is a computed footnote about the current number and lives in the footer. */
  readonly description = input<string>('');
  /** A footer footnote about the current number — e.g. "68% of all applications". Never invented; omit rather than fabricate. */
  readonly support = input<string>('');
  readonly icon = input<string>('');
  readonly tone = input<KpiTone>('neutral');
  /** Selects a reusable illustration concept from the shared library. Omit to render no illustration (rare — only for compact tiles). */
  readonly illustration = input<KpiIllustration | ''>('');
  /** Path to a real rendered WebP/PNG 3D asset. When set, this replaces the SVG illustration entirely — the concept library stays as the fallback/default rendering path. */
  readonly artwork = input<string>('');
  /** A live count rendered as a small badge over the artwork/illustration's corner — never bake a number into the asset itself. */
  readonly artworkBadge = input<string>('');
  readonly trend = input<KpiTrend | null>(null);
  readonly trendPlacement = input<KpiTrendPlacement>('footer');
  /** 0–100. Renders as a slim labeled progress bar in the footer — never a decorative ring — so it reads as one system with the other insight variants instead of a separate donut-card style. */
  readonly progress = input<number | null>(null);
  /** Raw historical values, oldest first — only pass this when the numbers are real (e.g. an existing chart's own series). Never fabricate a trend just to fill the footer; omit this input instead. */
  readonly sparkline = input<number[] | null>(null);
  /** A short real value series (e.g. per-status counts) rendered as a compact vertical bar cluster. */
  readonly bars = input<number[] | null>(null);
  /** The single most relevant real record for this metric — e.g. the oldest overdue item. */
  readonly record = input<KpiRecord | null>(null);
  readonly avatars = input<KpiAvatar[] | null>(null);
  readonly density = input<KpiDensity>('standard');
  /** Scales up the illustration/value/type for a page where these cards are the primary navigation surface rather than a dense KPI row (e.g. Evaluations) — that grid opts into wrapping instead of the shared single-row contract, so there's room for it. */
  readonly size = input<KpiSize>('standard');
  /** Only set this when the card genuinely navigates or performs an action — it renders a real button with a nav arrow, hover, and focus affordances. Static cards stay visually inert and show no arrow. */
  readonly interactive = input(false);
  /** Overrides the button's computed accessible name; only relevant when `interactive` is true. */
  readonly ariaLabel = input<string>('');

  readonly activated = output<void>();

  protected readonly labelId = `kpi-label-${uid++}`;
  protected readonly illustrationId = `kpi-illust-${uid++}`;

  protected readonly hostClass = computed(
    () =>
      `tone-${this.tone()} density-${this.density()} size-${this.size()}${this.interactive() ? ' is-interactive' : ''}`,
  );

  protected readonly toneAccent = computed(() => TONE_ACCENT[this.tone()]);

  // Splits `trend()` by where it should render, so the template doesn't
  // repeat the `trendPlacement() === 'x'` check in two places (once to
  // decide whether to show it at all, once to decide which content wins
  // the footer's trend-vs-support slot).
  protected readonly mainTrend = computed(() =>
    this.trendPlacement() === 'main' ? this.trend() : null,
  );
  protected readonly footerTrend = computed(() =>
    this.trendPlacement() === 'footer' ? this.trend() : null,
  );

  // A small, deterministic per-card offset for the illustration's particle
  // and glow placement, derived from the icon name (not Math.random()) so
  // the same metric always renders identically and a row of cards doesn't
  // look perfectly stamped-out, without reshuffling on re-render.
  protected readonly illustrationSeed = computed(() => {
    const name = this.icon() || this.label();
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
    return Math.abs(hash) % 100;
  });

  // Which visual insight the footer renders — the first one, in this
  // priority order, whose data was actually provided. This is separate
  // from the trend chip / support caption row above it (see kpi-card.html)
  // so a card can show "12.5% · Vs Previous 30 days" *and* a sparkline
  // together, matching how the real Businesses Analytics data already
  // pairs a trend with commentary.
  protected readonly insight = computed<KpiInsight>(() => {
    if (this.progress() !== null) return 'progress';
    if (this.sparklinePoints()) return 'sparkline';
    if (this.bars()?.length) return 'bars';
    if (this.record()) return 'record';
    if (this.avatars()?.length) return 'avatars';
    return 'none';
  });

  protected readonly progressPct = computed(() => {
    const pct = this.progress();
    if (pct === null || pct === undefined) return 0;
    return Math.min(Math.max(pct, 0), 100);
  });

  protected readonly sparklinePoints = computed(() => {
    const values = this.sparkline();
    if (!values || values.length < 2) return null;
    const w = 100;
    const h = 26;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const step = w / (values.length - 1);
    return values
      .map((v, i) => `${(i * step).toFixed(1)},${(h - ((v - min) / range) * h).toFixed(1)}`)
      .join(' ');
  });

  protected readonly sparklineSummary = computed(() => {
    const values = this.sparkline();
    if (!values || values.length < 2) return '';
    return `Trend across ${values.length} periods, from ${values[0]} to ${values[values.length - 1]}`;
  });

  protected readonly barHeights = computed(() => {
    const values = this.bars();
    if (!values || values.length === 0) return [];
    const max = Math.max(...values) || 1;
    return values.map((v) => Math.round((v / max) * 100));
  });

  protected readonly barsSummary = computed(() => {
    const values = this.bars();
    if (!values || values.length === 0) return '';
    return `${values.length} categories: ${values.join(', ')}`;
  });

  protected readonly avatarsSummary = computed(() => {
    const list = this.avatars();
    if (!list || list.length === 0) return '';
    return `${list.length} people: ${list.map((a) => a.initials).join(', ')}`;
  });

  protected readonly accessibleLabel = computed(() => {
    const override = this.ariaLabel();
    if (override) return override;
    const value = this.unit() ? `${this.value()} ${this.unit()}` : this.value();
    const parts = [this.label(), value];
    if (this.description()) parts.push(this.description());
    const main = this.mainTrend();
    if (main) parts.push(main.comparison ? `${main.label} ${main.comparison}` : main.label);
    if (this.support()) parts.push(this.support());
    return parts.join(', ');
  });

  protected roundPct(value: number): number {
    return Math.round(value);
  }

  protected onActivate(): void {
    this.activated.emit();
  }
}
