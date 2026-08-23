import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SectionHeading } from '../../shared/section-heading/section-heading';

interface ContactField {
  label: string;
  value: string;
}

@Component({
  selector: 'app-contact',
  imports: [SectionHeading],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  private readonly sanitizer = inject(DomSanitizer);

  // Sourced 2026-08-23: OpenStreetMap identifies this building directly as
  // "Castilla Municipal Hall" (amenity=townhall, way 262485769) — a
  // building-level pin, not the municipality's general town-center
  // coordinate used previously.
  readonly directionsUrl = 'https://www.google.com/maps/search/?api=1&query=12.97844,123.80029';

  readonly mapEmbedUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    'https://www.openstreetmap.org/export/embed.html?bbox=123.79529%2C12.97344%2C123.80529%2C12.98344&layer=mapnik&marker=12.97844%2C123.80029',
  );

  // Sourced 2026-08-23 via web search (official domain blocks automated
  // fetching, so these are search-result extractions, not direct page
  // reads — worth a manual spot-check against castillasorsogon.gov.ph when
  // it's reachable). The address was corrected from a prior "Poblacion"
  // guess: multiple independent sources place the actual seat of
  // government in Barangay Cumadcad — the old Poblacion municipal building
  // was converted into a Museum and Research Center. Office hours reflect
  // the Civil Service Commission's standard schedule for LGU offices.
  //
  // No "Official Social Media" row: the only Facebook page found ("Kadi na
  // sa Castilla") is directory-classified as a tour agency, not confirmed
  // as LGU-owned — a "Castilla - Public Information Office" page appears
  // to be the actual current official presence, but no confirmed handle/URL
  // for it was found, so the row is omitted rather than guessed.
  readonly fields: ContactField[] = [
    { label: 'Municipal Hall Address', value: '1st Floor, Municipal Town Hall, Cumadcad, Castilla, Sorsogon' },
    { label: 'Telephone', value: '(056) 311-2112' },
    { label: 'Official Email', value: 'castilla.itdept@gmail.com' },
    { label: 'Office Hours', value: 'Monday–Friday, 8:00 AM–5:00 PM' },
    { label: 'Official Website', value: 'https://www.castillasorsogon.gov.ph' },
  ];
}
