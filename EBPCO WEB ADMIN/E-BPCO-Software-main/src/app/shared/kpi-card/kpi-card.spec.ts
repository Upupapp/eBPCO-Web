import { TestBed } from '@angular/core/testing';
import { KpiCard } from './kpi-card';

describe('KpiCard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [KpiCard] }).compileComponents();
  });

  function render(inputs: Partial<{ [K in keyof KpiCard]: unknown }> = {}) {
    const fixture = TestBed.createComponent(KpiCard);
    fixture.componentRef.setInput('label', 'Total Applications');
    fixture.componentRef.setInput('value', '1,204');
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value);
    }
    fixture.detectChanges();
    return fixture;
  }

  it('renders label and value with a programmatic relationship between them', () => {
    const fixture = render();
    const label = fixture.nativeElement.querySelector('.kpi-label') as HTMLElement;
    const value = fixture.nativeElement.querySelector('.kpi-value') as HTMLElement;
    expect(label.textContent?.trim()).toBe('Total Applications');
    expect(value.textContent?.trim()).toBe('1,204');
    expect(label.id).toBeTruthy();
    expect(value.getAttribute('aria-describedby')).toBe(label.id);
  });

  it('renders as a static, non-focusable div by default', () => {
    const fixture = render();
    expect(fixture.nativeElement.querySelector('button.kpi-card')).toBeNull();
    const card = fixture.nativeElement.querySelector('div.kpi-card') as HTMLElement;
    expect(card).toBeTruthy();
    expect(card.hasAttribute('tabindex')).toBe(false);
  });

  it('renders as a real button with an accessible name when interactive, and shows the nav arrow', () => {
    const fixture = render({ interactive: true, description: '46 in this stage' });
    const button = fixture.nativeElement.querySelector('button.kpi-card') as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(button.getAttribute('aria-label')).toBe('Total Applications, 1,204, 46 in this stage');
    expect(fixture.nativeElement.querySelector('.kpi-nav-arrow')).toBeTruthy();

    let emitted = 0;
    fixture.componentInstance.activated.subscribe(() => emitted++);
    button.click();
    expect(emitted).toBe(1);
  });

  it('never shows the nav arrow on a static, non-navigating card', () => {
    const fixture = render();
    expect(fixture.nativeElement.querySelector('.kpi-nav-arrow')).toBeNull();
  });

  it('lets an explicit ariaLabel override the computed accessible name', () => {
    const fixture = render({ interactive: true, ariaLabel: 'Open Zoning Evaluation' });
    const button = fixture.nativeElement.querySelector('button.kpi-card') as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Open Zoning Evaluation');
  });

  it('renders the dimensional illustration from the shared concept library, with no separate icon badge on the standard card', () => {
    const fixture = render({ icon: 'logs', tone: 'info', illustration: 'logs' });
    expect(fixture.nativeElement.querySelector('.kpi-illustration-svg')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.kpi-main .kpi-icon')).toBeNull();
  });

  it('renders the icon badge on the compact density, where there is no illustration to carry it', () => {
    const fixture = render({ icon: 'logs', density: 'compact' });
    expect(fixture.nativeElement.querySelector('.kpi-icon app-icon')).toBeTruthy();
  });

  it('renders no illustration when neither illustration nor artwork is given', () => {
    const fixture = render({ icon: 'logs' });
    expect(fixture.nativeElement.querySelector('.kpi-illustration')).toBeNull();
  });

  it('renders a real artwork image instead of the SVG concept when artwork is set, with empty decorative alt text', () => {
    const fixture = render({ illustration: 'users', artwork: '/assets/kpi/users.webp' });
    const img = fixture.nativeElement.querySelector('.kpi-illustration-img') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('/assets/kpi/users.webp');
    expect(img.getAttribute('alt')).toBe('');
    expect(fixture.nativeElement.querySelector('.kpi-illustration-svg')).toBeNull();
  });

  it('renders a live count badge over the artwork instead of baking a number into the asset', () => {
    const fixture = render({ illustration: 'users', artworkBadge: '12' });
    expect(
      fixture.nativeElement.querySelector('.kpi-illustration-badge')?.textContent?.trim(),
    ).toBe('12');
  });

  it('hides the illustration from assistive technology', () => {
    const fixture = render({ icon: 'logs', illustration: 'logs' });
    expect(
      fixture.nativeElement.querySelector('.kpi-illustration')?.getAttribute('aria-hidden'),
    ).toBe('true');
  });

  it('hides the compact density icon badge from assistive technology', () => {
    const fixture = render({ icon: 'logs', density: 'compact' });
    expect(fixture.nativeElement.querySelector('.kpi-icon')?.getAttribute('aria-hidden')).toBe(
      'true',
    );
  });

  it('renders progress as a labeled bar, never a decorative ring, using the real percentage', () => {
    const fixture = render({ tone: 'success', progress: 62 });
    expect(fixture.nativeElement.querySelector('.kpi-ring')).toBeNull();
    const track = fixture.nativeElement.querySelector('.kpi-bar-track') as HTMLElement;
    expect(track).toBeTruthy();
    expect(track.getAttribute('aria-label')).toBe('Total Applications progress: 62 percent');
    const fill = track.querySelector('.kpi-bar-fill') as HTMLElement;
    expect(fill.style.width).toBe('62%');
  });

  it('clamps out-of-range progress values instead of producing a broken bar', () => {
    const fixture = render({ progress: 140 });
    expect(fixture.componentInstance['progressPct']()).toBe(100);
    const negative = render({ progress: -20 });
    expect(negative.componentInstance['progressPct']()).toBe(0);
  });

  it('applies positive/negative trend classes independently of arrow direction', () => {
    const fixture = render({ trend: { label: '12.5%', direction: 'up', sentiment: 'negative' } });
    const trend = fixture.nativeElement.querySelector('.kpi-trend') as HTMLElement;
    expect(trend.classList.contains('negative')).toBe(true);
    expect(trend.classList.contains('positive')).toBe(false);
    expect(trend.textContent?.trim()).toContain('12.5%');
  });

  it('renders description in the main area, separate from the footer', () => {
    const fixture = render({ description: 'All Time' });
    const mainDescription = fixture.nativeElement.querySelector('.kpi-main .kpi-description');
    expect(mainDescription?.textContent?.trim()).toBe('All Time');
    expect(fixture.nativeElement.querySelector('.kpi-footer')).toBeNull();
  });

  it('renders support as a footer footnote, separate from the main-area description', () => {
    const fixture = render({ support: '68% of all applications' });
    expect(fixture.nativeElement.querySelector('.kpi-main .kpi-caption')).toBeNull();
    const caption = fixture.nativeElement.querySelector('.kpi-footer .kpi-caption');
    expect(caption?.textContent?.trim()).toBe('68% of all applications');
  });

  it('pairs a trend chip with its comparison period in the same footer row, from the trend object itself', () => {
    const fixture = render({
      trend: {
        label: '12.5%',
        direction: 'up',
        sentiment: 'positive',
        comparison: 'vs previous 30 days',
      },
    });
    const row = fixture.nativeElement.querySelector('.kpi-footnote-row');
    expect(row.querySelector('.kpi-trend')).toBeTruthy();
    expect(row.querySelector('.kpi-caption').textContent.trim()).toBe('vs previous 30 days');
    expect(fixture.nativeElement.textContent.match(/vs previous 30 days/g)?.length).toBe(1);
  });

  it('does not show a stray support caption alongside a trend that has no comparison text', () => {
    const fixture = render({
      trend: { label: '12.5%', direction: 'up', sentiment: 'positive' },
      support: 'should not render',
    });
    expect(fixture.nativeElement.textContent).not.toContain('should not render');
  });

  it('renders the trend chip in the main area instead of the footer when trendPlacement is "main", leaving the footer free for support', () => {
    const fixture = render({
      trend: { label: '+18%', direction: 'up', sentiment: 'positive', comparison: 'vs last month' },
      trendPlacement: 'main',
      support: '31 this month',
    });
    const mainTrend = fixture.nativeElement.querySelector('.kpi-main .kpi-trend');
    expect(mainTrend?.textContent?.trim()).toContain('+18%');
    expect(fixture.nativeElement.querySelector('.kpi-main .kpi-caption')?.textContent?.trim()).toBe(
      'vs last month',
    );
    // The footer keeps its own, separate content — support isn't swallowed
    // by the trend now living in the main area.
    expect(fixture.nativeElement.querySelector('.kpi-footer .kpi-trend')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('.kpi-footer .kpi-caption')?.textContent?.trim(),
    ).toBe('31 this month');
  });

  it('keeps the trend chip in the footer by default (trendPlacement omitted)', () => {
    const fixture = render({
      trend: { label: '+18%', direction: 'up', sentiment: 'positive' },
    });
    expect(fixture.nativeElement.querySelector('.kpi-main .kpi-trend')).toBeNull();
    expect(fixture.nativeElement.querySelector('.kpi-footer .kpi-trend')).toBeTruthy();
  });

  it('applies the compact density class and skips the illustration/footer entirely', () => {
    const fixture = render({
      density: 'compact',
      icon: 'logs',
      illustration: 'logs',
      description: 'All Time',
      trend: { label: '5%', direction: 'up', sentiment: 'positive' },
    });
    expect(fixture.nativeElement.querySelector('.kpi-card')?.className).toContain(
      'density-compact',
    );
    expect(fixture.nativeElement.querySelector('.kpi-illustration')).toBeNull();
    expect(fixture.nativeElement.querySelector('.kpi-footer')).toBeNull();
    // Compact still shows its caption, just inline rather than in a footer.
    expect(fixture.nativeElement.querySelector('.kpi-caption')?.textContent?.trim()).toBe(
      'All Time',
    );
  });

  it('renders a unit as a secondary suffix next to the value, and folds it into the accessible name', () => {
    const fixture = render({ value: '3.6', unit: 'days', interactive: true });
    const value = fixture.nativeElement.querySelector('.kpi-value') as HTMLElement;
    const unitEl = value.querySelector('.kpi-unit') as HTMLElement;
    expect(unitEl.textContent?.trim()).toBe('days');
    expect(value.textContent?.replace(/\s+/g, ' ').trim()).toBe('3.6 days');
    const button = fixture.nativeElement.querySelector('button.kpi-card') as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Total Applications, 3.6 days');
  });

  it('omits the unit span entirely when no unit is given', () => {
    const fixture = render();
    expect(fixture.nativeElement.querySelector('.kpi-unit')).toBeNull();
  });

  it('renders no footer at all when there is no trend, support, or any insight data', () => {
    const fixture = render();
    expect(fixture.nativeElement.querySelector('.kpi-footer')).toBeNull();
  });

  it('renders a sparkline from real values with a readable text alternative', () => {
    const fixture = render({ tone: 'info', sparkline: [10, 14, 9, 20] });
    const svg = fixture.nativeElement.querySelector('.kpi-sparkline') as SVGElement;
    expect(svg).toBeTruthy();
    expect(svg.getAttribute('aria-label')).toBe('Trend across 4 periods, from 10 to 20');
    const polyline = svg.querySelector('polyline') as SVGPolylineElement;
    expect(polyline.getAttribute('stroke')).toBe('#2563eb');
  });

  it('does not render a sparkline for fewer than two points', () => {
    const fixture = render({ sparkline: [42] });
    expect(fixture.nativeElement.querySelector('.kpi-sparkline')).toBeNull();
  });

  it('renders a real bar series with a readable text alternative', () => {
    const fixture = render({ bars: [4, 9, 2] });
    const bars = fixture.nativeElement.querySelectorAll('.kpi-bar');
    expect(bars.length).toBe(3);
    expect(fixture.nativeElement.querySelector('.kpi-bars').getAttribute('aria-label')).toBe(
      '3 categories: 4, 9, 2',
    );
  });

  it('renders a single real record in the footer', () => {
    const fixture = render({ record: { label: 'Villanueva Hardware', meta: '36 days overdue' } });
    expect(fixture.nativeElement.querySelector('.kpi-record-label')?.textContent?.trim()).toBe(
      'Villanueva Hardware',
    );
    expect(fixture.nativeElement.querySelector('.kpi-record-meta')?.textContent?.trim()).toBe(
      '36 days overdue',
    );
  });

  it('renders an avatar stack with a readable text alternative', () => {
    const fixture = render({ avatars: [{ initials: 'GF' }, { initials: 'RV' }] });
    const avatars = fixture.nativeElement.querySelectorAll('.kpi-avatar');
    expect(avatars.length).toBe(2);
    expect(fixture.nativeElement.querySelector('.kpi-avatars').getAttribute('aria-label')).toBe(
      '2 people: GF, RV',
    );
  });

  it('only shows one insight at a time, prioritizing progress over other variants', () => {
    const fixture = render({ progress: 40, sparkline: [1, 2, 3], bars: [1, 2] });
    expect(fixture.nativeElement.querySelector('.kpi-bar-track')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.kpi-sparkline')).toBeNull();
    expect(fixture.nativeElement.querySelector('.kpi-bars')).toBeNull();
  });

  it('applies the compact density min-height, distinct from the standard card', () => {
    const standard = render();
    const compact = render({ density: 'compact' });
    const standardMinHeight = getComputedStyle(
      standard.nativeElement.querySelector('.kpi-card'),
    ).minHeight;
    const compactMinHeight = getComputedStyle(
      compact.nativeElement.querySelector('.kpi-card'),
    ).minHeight;
    expect(compact.nativeElement.querySelector('.kpi-card').className).toContain('density-compact');
    expect(standardMinHeight).not.toBe(compactMinHeight);
  });
});
