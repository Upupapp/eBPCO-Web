import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// A clean brand reveal — no loading ring, no scroll-jank — just transform,
// opacity, and a brief spark accent at the end. The whole timeline lives
// in CSS (see splash.scss); this class only locks page scroll while the
// intro is on screen and listens for the final fade to end so it can hand
// off to the router — no setTimeout chains, no JS-driven animation logic.
@Component({
  selector: 'app-splash',
  templateUrl: './splash.html',
  styleUrl: './splash.scss',
})
export class Splash implements OnInit, OnDestroy {
  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  // `animationend` bubbles up from the logo's own animations too, so this
  // only acts on the overlay's own fade-out — the last step in the
  // sequence. Matched with `endsWith` rather than `===` because Angular's
  // emulated view encapsulation scopes `@keyframes` names with a generated
  // `_ngcontent-*` prefix at runtime.
  protected onAnimationEnd(event: AnimationEvent): void {
    if (event.animationName.endsWith('splash-reveal')) {
      // `replaceUrl` so Back from the welcome screen returns to wherever the
      // user was before the app loaded, not back into a replayed splash.
      this.router.navigateByUrl('/welcome', { replaceUrl: true });
    }
  }
}
