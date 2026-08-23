import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section-heading',
  imports: [],
  templateUrl: './section-heading.html',
  styleUrl: './section-heading.scss',
})
export class SectionHeading {
  readonly eyebrow = input<string>();
  readonly heading = input.required<string>();
  readonly subtitle = input<string>();
  readonly align = input<'left' | 'center'>('left');
  readonly dark = input<boolean>(false);
}
