import { Component } from '@angular/core';
import { SectionHeading } from '../../shared/section-heading/section-heading';
import { ReadMore } from '../../shared/read-more/read-more';
import { Seal } from '../../shared/seal/seal';
import { ABOUT_OVERVIEW, HISTORY_TEXT, MISSION_TEXT, SEAL_DESCRIPTION } from '../../core/data/municipality.data';

// The official Vision statement was only found as a truncated search-result
// fragment ("A premier agri-ecotourism…") — the official page blocks
// automated fetching, so the complete statement couldn't be verified. Per
// the standing "don't display unverified content" policy, that card is
// omitted here entirely rather than shown with a placeholder — see
// VISION_PLACEHOLDER in municipality.data.ts for the sourcing note, and
// bring the card back once the full statement is confirmed.
@Component({
  selector: 'app-about',
  imports: [SectionHeading, ReadMore, Seal],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  readonly overview = ABOUT_OVERVIEW;
  readonly history = HISTORY_TEXT;
  readonly mission = MISSION_TEXT;
  readonly sealDescription = SEAL_DESCRIPTION;
}
