import { Component, computed, input } from '@angular/core';

const PALETTE = ['#c81e2c', '#2563eb', '#059669', '#d97706', '#7c3aed', '#0891b2', '#db2777'];

@Component({
  selector: 'app-avatar',
  imports: [],
  templateUrl: './avatar.html',
  styleUrl: './avatar.scss',
})
export class Avatar {
  readonly name = input.required<string>();
  readonly size = input<number>(36);

  protected readonly initials = computed(() => {
    const parts = this.name().trim().split(/\s+/);
    const chars = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '');
    return chars.join('') || '?';
  });

  protected readonly color = computed(() => {
    const value = this.name();
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    }
    return PALETTE[hash % PALETTE.length];
  });
}
