import { AfterViewInit, Component, ElementRef, OnDestroy, inject } from '@angular/core';
import { SectionHeading } from '../../shared/section-heading/section-heading';
import { MAYOR, VICE_MAYOR, SB_MEMBERS, SB_EXOFFICIO_MEMBERS } from '../../core/data/officials.data';

@Component({
  selector: 'app-local-government',
  imports: [SectionHeading],
  templateUrl: './local-government.html',
  styleUrl: './local-government.scss',
})
export class LocalGovernment implements AfterViewInit, OnDestroy {
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

  readonly mayor = MAYOR;
  readonly viceMayor = VICE_MAYOR;
  readonly sbMembers = SB_MEMBERS;
  // The ABC President and SK Federation President weren't found in any
  // citable source — omitted rather than shown as "Name pending
  // confirmation". Currently filters out to an empty array.
  readonly sbExOfficio = SB_EXOFFICIO_MEMBERS.filter((m) => !m.isPlaceholder);

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

  // Same one-time fade/rise-into-view pattern used on the home and about
  // pages: each .reveal element is observed until it intersects, then
  // unobserved so it never replays on subsequent scrolls.
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
