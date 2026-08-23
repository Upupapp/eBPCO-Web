import { Component } from '@angular/core';
import { SectionHeading } from '../../shared/section-heading/section-heading';
import { MAYOR, VICE_MAYOR, SB_MEMBERS, SB_EXOFFICIO_MEMBERS } from '../../core/data/officials.data';

@Component({
  selector: 'app-local-government',
  imports: [SectionHeading],
  templateUrl: './local-government.html',
  styleUrl: './local-government.scss',
})
export class LocalGovernment {
  readonly mayor = MAYOR;
  readonly viceMayor = VICE_MAYOR;
  readonly sbMembers = SB_MEMBERS;
  // The ABC President and SK Federation President weren't found in any
  // citable source — omitted rather than shown as "Name pending
  // confirmation". Currently filters out to an empty array.
  readonly sbExOfficio = SB_EXOFFICIO_MEMBERS.filter((m) => !m.isPlaceholder);
}
