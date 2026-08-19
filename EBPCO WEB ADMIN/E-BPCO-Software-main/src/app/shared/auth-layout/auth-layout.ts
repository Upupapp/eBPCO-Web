import { Component, signal } from '@angular/core';
import { DilgSeal } from '../dilg-seal/dilg-seal';

@Component({
  selector: 'app-auth-layout',
  imports: [DilgSeal],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayout {
  protected readonly currentYear = new Date().getFullYear();

  // A small mouse-parallax on the visual panel's seal/tagline — cheap
  // depth cue that doesn't require a 3D scene. Skipped entirely under
  // reduced-motion so it never fights a user who's opted out of motion.
  protected readonly visualParallax = signal('translate3d(0, 0, 0) rotate(0deg)');

  protected onVisualMouseMove(event: MouseEvent): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const shell = event.currentTarget as HTMLElement;
    const rect = shell.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    const x = nx * 14;
    const y = ny * 10;
    const rotate = nx * 2;
    this.visualParallax.set(`translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg)`);
  }

  protected onVisualMouseLeave(): void {
    this.visualParallax.set('translate3d(0, 0, 0) rotate(0deg)');
  }
}
