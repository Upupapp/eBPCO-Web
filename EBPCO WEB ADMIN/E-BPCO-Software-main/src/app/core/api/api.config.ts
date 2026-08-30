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
 * Set from `public/config.js`, which index.html loads before the application
 * bundle — so an operator (or a deploy job) can change it without a rebuild.
 *
 * That file did not exist until 30 Aug. This docblock previously said the value
 * was "overridden in main.ts", and main.ts does not mention it: the override
 * story was documented but not built, so the token had always resolved to its
 * empty default no matter what anyone set.
 */
export const API_BASE_URL = new InjectionToken<string>('EBPCO_API_BASE_URL', {
  providedIn: 'root',
  factory: () => {
    const configured = (globalThis as { EBPCO_API_BASE_URL?: unknown }).EBPCO_API_BASE_URL;
    return typeof configured === 'string' ? configured.replace(/\/$/, '') : '';
  },
});
