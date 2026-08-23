import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Seal } from '../../shared/seal/seal';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink, Seal],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss',
})
export class SiteFooter {
  readonly year = new Date().getFullYear();
}
