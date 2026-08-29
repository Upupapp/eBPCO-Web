import { InjectionToken } from '@angular/core';

/**
 * Where the eBPCO API lives.
 *
 * An injection token rather than a compiled-in constant, because the value
 * differs per environment and a portal that has to be rebuilt to point at a
 * different server is one that gets pointed at the wrong one. Empty means
 * same-origin, which is what a portal served behind the same gateway as the
 * API wants.
 *
 * Overridden in `main.ts` from a `window` global at boot, so an operator can
 * change it in a deployed bundle without a rebuild.
 */
export const API_BASE_URL = new InjectionToken<string>('EBPCO_API_BASE_URL', {
  providedIn: 'root',
  factory: () => {
    const configured = (globalThis as { EBPCO_API_BASE_URL?: unknown }).EBPCO_API_BASE_URL;
    return typeof configured === 'string' ? configured.replace(/\/$/, '') : '';
  },
});
