import { Component, input } from '@angular/core';

@Component({
  selector: 'app-placeholder-tag',
  imports: [],
  template: `<span class="placeholder-tag">{{ label() }}</span>`,
  styleUrl: './placeholder-tag.scss',
})
export class PlaceholderTag {
  readonly label = input<string>('Pending verification');
}
