import { Injectable, computed, signal } from '@angular/core';

/**
 * The tokens a signed-in officer holds.
 *
 * ── Why sessionStorage and not localStorage ─────────────────────────────
 *
 * These are shared terminals. An LGU counter machine is used by whoever is on
 * shift, and a token in `localStorage` survives the browser closing — so the
 * next officer opens the portal already signed in as the last one, and every
 * act they take is attributed to somebody else. `sessionStorage` dies with the
 * tab, which is the closest a browser gets to "while this person is here".
 *
 * It is still readable by any script on the page. That is a real limitation and
 * the honest mitigation is a short access-token lifetime, which the API already
 * enforces — not a claim that this is secure storage.
 */

const ACCESS = 'ebpco.access';
const REFRESH = 'ebpco.refresh';

@Injectable({ providedIn: 'root' })
export class TokenStore {
  private readonly _access = signal<string | null>(read(ACCESS));
  private readonly _refresh = signal<string | null>(read(REFRESH));

  readonly access = this._access.asReadonly();
  readonly hasSession = computed(() => this._access() !== null);

  set(tokens: { accessToken: string; refreshToken?: string | null }): void {
    this._access.set(tokens.accessToken);
    write(ACCESS, tokens.accessToken);
    if (tokens.refreshToken !== undefined && tokens.refreshToken !== null) {
      this._refresh.set(tokens.refreshToken);
      write(REFRESH, tokens.refreshToken);
    }
  }

  refreshToken(): string | null {
    return this._refresh();
  }

  clear(): void {
    this._access.set(null);
    this._refresh.set(null);
    write(ACCESS, null);
    write(REFRESH, null);
  }
}

/**
 * Storage can throw, and does: a browser set to block site data raises on
 * access rather than returning null, and so does a page opened from `file://`.
 * A portal that cannot read a token should ask the officer to sign in, not
 * fail to start.
 */
function read(key: string): string | null {
  try {
    return globalThis.sessionStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value === null) globalThis.sessionStorage?.removeItem(key);
    else globalThis.sessionStorage?.setItem(key, value);
  } catch {
    // Nothing to do. The signal above is the live copy; persistence is a
    // convenience across a reload, not the source of truth.
  }
}
