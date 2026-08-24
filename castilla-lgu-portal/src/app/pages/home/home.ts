import { AfterViewInit, Component, ElementRef, OnDestroy, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PROFILE_FIELDS, PROVINCE_NAME } from '../../core/data/municipality.data';
import { Icon, IconName } from '../../shared/icon/icon';

interface QuickNavItem {
  title: string;
  description: string;
  path: string;
  icon: IconName;
}

// Maps each "at a glance" field to a representative icon. Fields not listed
// here (there are none currently, but new ones default gracefully) fall
// back to 'id' in fieldIcon() below.
const FIELD_ICONS: Record<string, IconName> = {
  Province: 'pin',
  Region: 'map',
  Country: 'flag',
  'Income Classification': 'chart',
  'Number of Barangays': 'grid',
  Population: 'person',
  'Land Area': 'landscape',
  'ZIP Code': 'mail',
  'PSGC Code': 'id',
  'Founding / Establishment': 'calendar',
  Demonym: 'users',
};

@Component({
  selector: 'app-home',
  imports: [RouterLink, DecimalPipe, Icon],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements AfterViewInit, OnDestroy {
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

  readonly municipalityShortName = 'Castilla';
  readonly provinceName = PROVINCE_NAME;
  // Unconfirmed fields (e.g. Demonym) are omitted rather than shown with a
  // "pending" placeholder — this panel only ever displays verified facts.
  readonly profileFields = PROFILE_FIELDS.filter((f) => !f.isPlaceholder);

  readonly quickNav: QuickNavItem[] = [
    { title: 'About Castilla', description: 'Learn about the municipality.', path: '/about', icon: 'landmark' },
    {
      title: 'Local Government',
      description: 'Meet the municipal leadership.',
      path: '/local-government',
      icon: 'users',
    },
    { title: 'Municipal Offices', description: 'Find the office you need.', path: '/offices', icon: 'briefcase' },
    {
      title: 'Contact & Location',
      description: 'Get in touch with LGU Castilla.',
      path: '/contact',
      icon: 'pin',
    },
  ];

  // Count-up display values for the three "at a glance" fields that are
  // genuine magnitudes (identifiers like ZIP/PSGC render their static text
  // as-is — counting up a postal code would be meaningless).
  readonly populationCount = signal(0);
  readonly landAreaCount = signal(0);
  readonly barangaysCount = signal(0);

  private revealObserver?: IntersectionObserver;
  private countersObserver?: IntersectionObserver;
  private onScroll?: () => void;
  private parallaxRaf: number | null = null;
  private readonly reducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  fieldIcon(label: string): IconName {
    return FIELD_ICONS[label] ?? 'id';
  }

  ngAfterViewInit(): void {
    this.setupScrollReveal();
    this.setupCounters();
    this.setupParallax();
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
    this.countersObserver?.disconnect();
    if (this.onScroll) window.removeEventListener('scroll', this.onScroll);
    if (this.parallaxRaf !== null) cancelAnimationFrame(this.parallaxRaf);
  }

  // Fades/rises each .reveal element in once it scrolls into view, then
  // stops observing it — a one-time entrance, not a replay-on-every-scroll
  // gimmick.
  private setupScrollReveal(): void {
    const targets = this.host.nativeElement.querySelectorAll<HTMLElement>('.reveal');
    if (!targets.length) return;

    if (this.reducedMotion) {
      targets.forEach((el) => el.classList.add('in-view'));
      return;
    }

    this.revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            this.revealObserver?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );
    targets.forEach((el) => this.revealObserver!.observe(el));
  }

  private setupCounters(): void {
    const glance = this.host.nativeElement.querySelector<HTMLElement>('.glance-grid');
    if (!glance) return;

    if (this.reducedMotion) {
      this.populationCount.set(60635);
      this.landAreaCount.set(186.2);
      this.barangaysCount.set(34);
      return;
    }

    this.countersObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          this.animateCount((v) => this.populationCount.set(v), 60635);
          this.animateCount((v) => this.landAreaCount.set(v), 186.2);
          this.animateCount((v) => this.barangaysCount.set(v), 34);
          this.countersObserver?.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    this.countersObserver.observe(glance);
  }

  private animateCount(setValue: (v: number) => void, to: number, durationMs = 1400): void {
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic — quick start, gentle settle
      setValue(to * eased);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // Restrained depth cue on the hero photo: it drifts a few pixels slower
  // than the page scrolls, capped well inside the oversized buffer in
  // home.scss so the photo never exposes an edge.
  private setupParallax(): void {
    if (this.reducedMotion) return;
    const photo = this.host.nativeElement.querySelector<HTMLElement>('.hero-photo');
    if (!photo) return;

    this.onScroll = () => {
      if (this.parallaxRaf !== null) return;
      this.parallaxRaf = requestAnimationFrame(() => {
        const offset = Math.min(window.scrollY * 0.15, 60);
        photo.style.transform = `translateY(${-offset}px)`;
        this.parallaxRaf = null;
      });
    };
    window.addEventListener('scroll', this.onScroll, { passive: true });
  }
}
