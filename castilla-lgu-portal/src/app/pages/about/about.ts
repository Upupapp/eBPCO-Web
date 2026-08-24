import { AfterViewInit, Component, ElementRef, OnDestroy, inject } from '@angular/core';
import { ReadMore } from '../../shared/read-more/read-more';
import { Seal } from '../../shared/seal/seal';
import { Icon } from '../../shared/icon/icon';
import { ABOUT_OVERVIEW, HISTORY_TEXT, MISSION_TEXT, SEAL_DESCRIPTION } from '../../core/data/municipality.data';

// The official Vision statement was only found as a truncated search-result
// fragment ("A premier agri-ecotourism…") — the official page blocks
// automated fetching, so the complete statement couldn't be verified. Per
// the standing "don't display unverified content" policy, that card is
// omitted here entirely rather than shown with a placeholder — see
// VISION_PLACEHOLDER in municipality.data.ts for the sourcing note, and
// bring the card back once the full statement is confirmed.
@Component({
  selector: 'app-about',
  imports: [ReadMore, Seal, Icon],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About implements AfterViewInit, OnDestroy {
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

  readonly overview = ABOUT_OVERVIEW;
  readonly history = HISTORY_TEXT;
  readonly mission = MISSION_TEXT;
  readonly sealDescription = SEAL_DESCRIPTION;

  private revealObserver?: IntersectionObserver;
  private readonly reducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  ngAfterViewInit(): void {
    this.setupScrollReveal();
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
  }

  // Same one-time fade/rise-into-view pattern used on the home page: each
  // .reveal element is observed until it intersects, then unobserved so it
  // never replays on subsequent scrolls.
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
}
