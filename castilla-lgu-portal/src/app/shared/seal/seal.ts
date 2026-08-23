import { Component, input } from '@angular/core';

@Component({
  selector: 'app-seal',
  imports: [],
  templateUrl: './seal.html',
  styleUrl: './seal.scss',
})
export class Seal {
  readonly size = input<number>(48);
  // Opt-in medallion treatment (bevel, gold rim-light, grounding shadow) for
  // the one or two hero placements — inline header/footer marks stay flat.
  readonly dimensional = input<boolean>(false);
}
