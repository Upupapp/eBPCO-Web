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
const EXPIRES_AT = 'ebpco.expiresAt';

@Injectable({ providedIn: 'root' })
export class TokenStore {
  private readonly _access = signal<string | null>(read(ACCESS));
  private readonly _refresh = signal<string | null>(read(REFRESH));
  // Epoch ms the access token actually expires, from the server's own
  // `expiresIn` on whichever call last minted it (sign-in or a refresh) — so
  // SessionService can schedule the next proactive refresh from real
  // remaining time, including right after a reload, instead of only finding
  // out the token died on the next 401.
  private readonly _expiresAt = signal<number | null>(readNumber(EXPIRES_AT));

  readonly access = this._access.asReadonly();
  readonly hasSession = computed(() => this._access() !== null);

  set(tokens: { accessToken: string; refreshToken?: string | null; expiresIn?: number }): void {
    this._access.set(tokens.accessToken);
    write(ACCESS, tokens.accessToken);
    if (tokens.refreshToken !== undefined && tokens.refreshToken !== null) {
      this._refresh.set(tokens.refreshToken);
      write(REFRESH, tokens.refreshToken);
    }
    if (tokens.expiresIn !== undefined) {
      const at = Date.now() + tokens.expiresIn * 1000;
      this._expiresAt.set(at);
      write(EXPIRES_AT, String(at));
    }
  }

  refreshToken(): string | null {
    return this._refresh();
  }

  /** Seconds until the access token expires, or null when no expiry was ever recorded (a token stored before this field existed). */
  expiresInSeconds(): number | null {
    const at = this._expiresAt();
    if (at === null) return null;
    return Math.max(0, Math.round((at - Date.now()) / 1000));
  }

  clear(): void {
    this._access.set(null);
    this._refresh.set(null);
    this._expiresAt.set(null);
    write(ACCESS, null);
    write(REFRESH, null);
    write(EXPIRES_AT, null);
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

function readNumber(key: string): number | null {
  const raw = read(key);
  if (raw === null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
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
