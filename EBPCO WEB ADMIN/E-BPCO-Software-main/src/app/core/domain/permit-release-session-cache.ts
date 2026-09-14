import { Injectable, signal } from '@angular/core';

import { ReleaseMethod } from './permit.model';

/**
 * The honest answer to a real backend gap: there is no `GET` route anywhere
 * that reads back an already-generated permit's number, an already-prepared
 * release's claim location/office hours, or an already-completed release's
 * claimant/method — `staff-actions.controller.ts` only exposes the three
 * write routes, and `GET /staff/applications/:id` carries neither.
 *
 * This cache is populated ONLY by this browser session's own successful
 * `PermitReleaseApi` calls, and is never wiped by
 * `ApplicationStore.replaceApplications()` (unlike the old, fully-local
 * `ApplicationStore._permits`/`_releases`, which are). A row whose
 * `lifecycleStatus` implies a permit/preparation/release exists but the
 * cache holds nothing for it (a different officer's session, or state from
 * before this session started) should show an explicit "not available in
 * this session" line — see permit-release.ts/applications.ts — rather than
 * a blank or a fabricated value.
 */

export interface CachedPermit {
  readonly permitNumber: string;
  readonly issuedDate: string;
}

export interface CachedPreparation {
  readonly claimLocation: string;
  readonly officeHours: string;
  readonly bringWithYou: readonly string[];
}

export interface CachedRelease {
  readonly claimantName: string;
  readonly method: ReleaseMethod;
  readonly releasedAt: string;
}

@Injectable({ providedIn: 'root' })
export class PermitReleaseSessionCache {
  private readonly _permits = signal<Record<string, CachedPermit>>({});
  private readonly _preparations = signal<Record<string, CachedPreparation>>({});
  private readonly _releases = signal<Record<string, CachedRelease>>({});

  permitFor(applicationId: string): CachedPermit | undefined {
    return this._permits()[applicationId];
  }

  recordPermit(applicationId: string, value: CachedPermit): void {
    this._permits.update((byId) => ({ ...byId, [applicationId]: value }));
  }

  preparationFor(applicationId: string): CachedPreparation | undefined {
    return this._preparations()[applicationId];
  }

  recordPreparation(applicationId: string, value: CachedPreparation): void {
    this._preparations.update((byId) => ({ ...byId, [applicationId]: value }));
  }

  releaseFor(applicationId: string): CachedRelease | undefined {
    return this._releases()[applicationId];
  }

  recordRelease(applicationId: string, value: CachedRelease): void {
    this._releases.update((byId) => ({ ...byId, [applicationId]: value }));
  }
}
