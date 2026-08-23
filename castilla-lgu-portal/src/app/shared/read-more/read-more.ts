import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-read-more',
  imports: [],
  templateUrl: './read-more.html',
  styleUrl: './read-more.scss',
})
export class ReadMore {
  readonly text = input.required<string>();
  readonly collapsedChars = input<number>(220);

  readonly expanded = signal(false);

  isLong(text: string): boolean {
    return text.length > this.collapsedChars();
  }

  displayText(text: string): string {
    if (this.expanded() || !this.isLong(text)) {
      return text;
    }
    return text.slice(0, this.collapsedChars()).trimEnd() + '…';
  }

  toggle(): void {
    this.expanded.set(!this.expanded());
  }
}
