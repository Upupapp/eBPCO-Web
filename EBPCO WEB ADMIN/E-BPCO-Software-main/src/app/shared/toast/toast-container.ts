import { Component, inject } from '@angular/core';
import { Icon } from '../icon/icon';
import { ToastService, ToastTone } from './toast.service';

const TONE_ICON: Record<ToastTone, string> = {
  success: 'check-circle',
  error: 'alert-triangle',
  info: 'alert-circle',
};

/** Mounted once, at the app root (see app.html) — every page gets it for free without adding anything to its own template. */
@Component({
  selector: 'app-toast-container',
  imports: [Icon],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.scss',
})
export class ToastContainer {
  protected readonly service = inject(ToastService);

  protected toneIcon(tone: ToastTone): string {
    return TONE_ICON[tone];
  }
}
