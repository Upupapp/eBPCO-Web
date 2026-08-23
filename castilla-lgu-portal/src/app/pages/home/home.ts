import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PROFILE_FIELDS, MUNICIPALITY_NAME, PROVINCE_NAME } from '../../core/data/municipality.data';

interface QuickNavItem {
  title: string;
  description: string;
  path: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  readonly municipalityName = MUNICIPALITY_NAME;
  readonly municipalityShortName = 'Castilla';
  readonly provinceName = PROVINCE_NAME;
  // Unconfirmed fields (e.g. Demonym) are omitted rather than shown with a
  // "pending" placeholder — this panel only ever displays verified facts.
  readonly profileFields = PROFILE_FIELDS.filter((f) => !f.isPlaceholder);

  readonly quickNav: QuickNavItem[] = [
    { title: 'About Castilla', description: 'Learn about the municipality.', path: '/about' },
    { title: 'Local Government', description: 'Meet the municipal leadership.', path: '/local-government' },
    { title: 'Municipal Offices', description: 'Find the office you need.', path: '/offices' },
    { title: 'Contact & Location', description: 'Get in touch with LGU Castilla.', path: '/contact' },
  ];
}
