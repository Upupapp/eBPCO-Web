import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AccessRequestApi } from './access-request.api';
import { StaffDirectoryApi } from './staff-directory.api';
import { API_BASE_URL } from './api.config';

import meApplicant from './contract/me-applicant.json';
import meStaff from './contract/me-staff.json';
import accessRequests from './contract/staff-access-requests.json';
import staffUsers from './contract/staff-users.json';

/**
 * The portal's PARSING, fed the shape the server actually sends.
 *
 * ── The defect class ────────────────────────────────────────────────────
 *
 * F-30 to F-33 were four wire defects invisible to 429 green tests, because
 * every test asserted against a mock this portal had written. The mock and the
 * code agreed with each other and neither had met the server.
 *
 * ── Why the fixture is the INPUT, not the subject ───────────────────────
 *
 * The first version of this file asserted that the fixture contained `data` and
 * not `items` — which is trivially true, because the fixture was written here.
 * A test that checks a file against itself passes forever and proves nothing;
 * the lifecycle diagram taught the same lesson a day earlier.
 *
 * So the fixture body is flushed through `HttpTestingController` and the
 * assertion is on what the portal MAKES of it. Rename a key back in the API
 * layer and these fail, which is the whole point.
 *
 * ── Provenance ──────────────────────────────────────────────────────────
 *
 * Each fixture says `recorded` (bytes a server sent) or `derived` (read out of
 * the API's source). Derived is accurate as far as it goes and is not evidence
 * that the server sends it — a schema can be right while a handler forgets a
 * field. Upgrade with `node scripts/record-responses.mjs --token=<jwt>`.
 */
type Fixture = { source: string; body: Record<string, unknown> };

function setup() {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: API_BASE_URL, useValue: '' },
    ],
  });
  return TestBed.inject(HttpTestingController);
}

describe('Wire contract — what the portal makes of a real response', () => {
  it('reads the pending queue out of the server envelope, not ours', async () => {
    const http = setup();
    const pending = TestBed.inject(AccessRequestApi).listPending();
    http.expectOne('/staff/access-requests').flush((accessRequests as Fixture).body);
    const result = await pending;

    // Reading `items` here returned [] and the page said "No requests are
    // waiting" — in the exact wording chosen to signal certainty (F-31).
    expect(result.kind).toBe('ok');
    if (result.kind !== 'ok') return;
    expect(result.requests.length).toBe(1);
  });

  it('reads a pending request\'s fields by the server\'s names', async () => {
    const http = setup();
    const pending = TestBed.inject(AccessRequestApi).listPending();
    http.expectOne('/staff/access-requests').flush((accessRequests as Fixture).body);
    const result = await pending;
    if (result.kind !== 'ok') throw new Error('expected ok');

    // Four of eight were wrong until 2 Sep, and `undefined` renders as an
    // empty cell rather than an error.
    const row = result.requests[0];
    expect(row.mobile).toBe('09171234567');
    expect(row.officePosition).toContain('MEO');
    expect(row.permitTypes).toEqual(['Fencing Permit']);
    expect(row.raisedAt).toBeTruthy();
  });

  it('reads the staff directory out of the server envelope', async () => {
    const http = setup();
    const pending = TestBed.inject(StaffDirectoryApi).list();
    http.expectOne('/staff/users').flush({
      ...(staffUsers as Fixture).body,
      data: [{ id: 'USR-1', fullName: 'Engr. Ana Reyes', email: 'a@b.ph', role: 'evaluator',
               status: 'active', level: 'view', permitTypes: [], lastSignInAt: null }],
    });
    const result = await pending;

    expect(result.kind).toBe('ok');
    if (result.kind !== 'ok') return;
    // Reading `items` here emptied the directory and said so as though it had
    // looked.
    expect(result.members.length).toBe(1);
  });

  it('/me now carries the three fields three screens were waiting on', () => {
    // This test used to assert the OPPOSITE — that `permitTypes` was absent,
    // which is why `Capabilities.assignedForms` was null and A-15 to A-17
    // rendered nothing. The backend closed F-32 on 3 Sep and the fixture went
    // stale within a day of being written.
    //
    // Worth keeping as the record of that: a derived fixture is a snapshot of
    // somebody else's source, and it goes out of date without anything here
    // changing. It is the argument for recording over deriving.
    const body = (meStaff as Fixture).body;
    for (const field of ['fullName', 'level', 'permitTypes', 'roles', 'scopes']) {
      expect(Object.keys(body)).toContain(field);
    }
    // Applicants keep their own profile shape; the two branches differ.
    expect(Object.keys((meApplicant as Fixture).body)).toContain('firstName');
    expect(Object.keys(body)).not.toContain('firstName');
  });
});
