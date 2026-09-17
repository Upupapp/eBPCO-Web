import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { Archive } from './archive';
import { ApplicationStore } from '../../core/domain/application-store';
import { ApplicationRecord, withProjectedFields } from '../../core/domain/application.model';
import { API_BASE_URL } from '../../core/api/api.config';
import { canAccessPath } from '../../core/session/permissions';

/**
 * The archive section.
 *
 * "Archived, not deleted" is a promise, and until this page existed it was one
 * nobody could check: an application moved to Cancelled left the working queue
 * and appeared nowhere else, so the difference between archiving and deleting
 * was visible only to somebody reading the store. A preservation guarantee with
 * no way to see what was preserved is indistinguishable from the deletion it
 * replaced.
 */
const row = (over: Partial<ApplicationRecord> = {}): ApplicationRecord =>
  withProjectedFields({
    id: 'APP-1',
    businessId: 'BIZ-1',
    businessName: 'Villanueva Hardware',
    applicantId: 'APL-1',
    applicant: 'Raul Villanueva',
    location: 'Barangay Poblacion',
    permitType: 'Fencing Permit',
    applicationAction: 'New',
    officer: 'Engr. Tester',
    dateSubmitted: '2026-08-01',
    dateValue: new Date('2026-08-01T00:00:00.000Z'),
    lifecycleStatus: 'Cancelled',
    evaluationStage: null,
    evaluationResult: null,
    ...over,
  } as ApplicationRecord);

interface TimelineEntryFixture {
  toStatus: string;
  occurredAt: string;
  actorName: string | null;
  remarks: string | null;
}

/**
 * Mounts the page against `replaceApplications(rows)` — which is real/server
 * data the moment it's called (`ApplicationStore.isSeedData()` goes `false`
 * — see `_dataSource`'s own doc comment) — then flushes whichever real
 * `GET /staff/applications/:id` calls the page actually makes: one per
 * ARCHIVED row, never for a row still in flight, since the component only
 * fetches attribution for the rows it already knows are archived.
 * `timelineByAppId` supplies each one's timeline; a row with no entry gets
 * `{ timeline: [] }`, which is a legitimate real answer ("no archiving entry
 * on this record's own timeline"), not a test shortcut.
 */
async function mount(
  rows: ApplicationRecord[],
  timelineByAppId: Record<string, readonly TimelineEntryFixture[]> = {},
): Promise<ComponentFixture<Archive>> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [Archive],
    providers: [
      provideRouter([]),
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: API_BASE_URL, useValue: '' },
    ],
  });
  const store = TestBed.inject(ApplicationStore);
  store.replaceApplications(rows);
  const fixture = TestBed.createComponent(Archive);
  fixture.detectChanges();
  const http = TestBed.inject(HttpTestingController);
  await new Promise((resolve) => setTimeout(resolve, 0));
  for (const req of http.match((r) => /^\/staff\/applications\/[^/]+$/.test(r.url))) {
    const id = req.request.url.split('/').pop()!;
    req.flush({ timeline: timelineByAppId[id] ?? [] });
  }
  await new Promise((resolve) => setTimeout(resolve, 0));
  fixture.detectChanges();
  return fixture;
}

describe('Archive', () => {
  it('is reachable by every staff role', () => {
    // A preservation guarantee only counts if the people relying on it can look.
    expect(canAccessPath('Auditor', '/archive')).toBe(true);
    expect(canAccessPath('Evaluator', '/archive')).toBe(true);
    expect(canAccessPath('Super Admin', '/archive')).toBe(true);
  });

  it('lists what was set aside, with who and why — from the record\'s own real timeline', async () => {
    const fixture = await mount([row({ lifecycleStatus: 'Cancelled' })], {
      'APP-1': [
        {
          toStatus: 'Cancelled',
          occurredAt: '2026-08-05T10:00:00.000Z',
          actorName: 'Engr. Ana Reyes',
          remarks: 'Duplicate filing.',
        },
      ],
    });
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Raul Villanueva');
    expect(text).toContain('Engr. Ana Reyes');
    expect(text).toContain('Duplicate filing.');
  });

  it('shows the most recent archiving entry when a record was set aside more than once', async () => {
    const fixture = await mount([row({ lifecycleStatus: 'Cancelled' })], {
      'APP-1': [
        {
          toStatus: 'Cancelled',
          occurredAt: '2026-01-01T00:00:00.000Z',
          actorName: 'Engr. Old Decision',
          remarks: 'First reason.',
        },
        {
          toStatus: 'Cancelled',
          occurredAt: '2026-08-05T10:00:00.000Z',
          actorName: 'Engr. Ana Reyes',
          remarks: 'Duplicate filing.',
        },
      ],
    });
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Engr. Ana Reyes');
    expect(text).toContain('Duplicate filing.');
    expect(text).not.toContain('Engr. Old Decision');
    expect(text).not.toContain('First reason.');
  });

  it('holds rejected and expired applications too, not only cancelled ones', async () => {
    const fixture = await mount([
      row({ id: 'APP-1', lifecycleStatus: 'Rejected' }),
      row({ id: 'APP-2', lifecycleStatus: 'Expired' }),
    ]);
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    // Every terminal status has left the working queue. Showing only Cancelled
    // would mean rejected applications had nowhere to be found either.
    expect(text).toContain('Rejected');
    expect(text).toContain('Expired');
  });

  it('does not show applications still in flight', async () => {
    const fixture = await mount([row({ lifecycleStatus: 'Under Evaluation' })]);

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Nothing has been archived');
  });

  it('says a reason was not recorded rather than leaving it blank', async () => {
    const fixture = await mount([row()]);
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    // Archives made before remarks were required. A blank cell reads as "no
    // reason was needed"; this says the reason is missing.
    expect(text).toContain('No reason was recorded');
  });

  it('offers no way to change or remove anything', async () => {
    const fixture = await mount([row()]);
    const el: HTMLElement = fixture.nativeElement;
    const labels = [...el.querySelectorAll('button')].map((b) =>
      (b.textContent ?? '').toLowerCase(),
    );

    // A page whose whole point is preservation must not be the place things
    // can be changed from.
    expect(labels.some((l) => /delete|remove|restore|edit/.test(l))).toBe(false);
  });
});
