import { Injectable, signal } from '@angular/core';

import { ReleaseMethod } from './permit.model';

/**
 * Written for a backend gap that has since closed: originally no `GET` route
 * read back a generated permit's number or a release's claim details, so
 * this cache held ONLY what this browser session's own `PermitReleaseApi`
 * calls had returned. `GET /staff/applications/:id` now carries `permit` and
 * `release` (`staff-queue.service.ts`), and the Permit Release page fills
 * this cache from them on load (`hydrateFromServer`) — so a permit another
 * officer generated, or one generated before this page was opened, reads
 * back from the record. The cache remains the one place the templates read;
 * it is never wiped by `ApplicationStore.replaceApplications()`.
 *
 * A row whose `lifecycleStatus` implies a permit/preparation/release exists
 * but for which neither this session nor the server supplied one still shows
 * an explicit "not available in this session" line rather than a blank or a
 * fabricated value.
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
