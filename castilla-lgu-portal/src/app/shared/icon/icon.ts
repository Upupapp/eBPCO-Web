import { Component, input } from '@angular/core';

export type IconName =
  | 'landmark'
  | 'users'
  | 'briefcase'
  | 'pin'
  | 'map'
  | 'flag'
  | 'chart'
  | 'grid'
  | 'person'
  | 'landscape'
  | 'mail'
  | 'id'
  | 'calendar';

@Component({
  selector: 'app-icon',
  imports: [],
  templateUrl: './icon.html',
  styleUrl: './icon.scss',
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input<number>(20);
}
