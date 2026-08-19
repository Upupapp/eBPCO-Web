import { Component, input } from '@angular/core';

@Component({
  selector: 'app-dilg-seal',
  imports: [],
  templateUrl: './dilg-seal.html',
  styleUrl: './dilg-seal.scss',
})
export class DilgSeal {
  readonly size = input<number>(96);
  // Opt-in medallion treatment (bevel, gold rim-light, grounding shadow,
  // subtle 3D tilt) for the one or two "hero" placements — the small inline
  // brand marks in the sidebar/topbar/forms stay flat by default.
  readonly dimensional = input<boolean>(false);
}
