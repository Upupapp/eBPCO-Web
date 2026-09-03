import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Capabilities } from './capabilities';
import { SessionService, Session } from './session.service';
import { API_BASE_URL } from '../api/api.config';

/**
 * One answer to "may this officer act?".
 *
 * The failure this prevents is not hypothetical in this portal: a badge was
 * once correct on one screen and permanently wrong on another because two
 * surfaces answered the same question separately. A permission answered in
 * eleven places is wrong in at least one, and the wrong one is always the
 * screen nobody opened.
 */
function withSession(session: Session | null): Capabilities {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '' }],
  });
  const service = TestBed.inject(SessionService);
  (service as unknown as { _session: { set(v: Session | null): void } })._session.set(session);
  return TestBed.inject(Capabilities);
}

const session = (over: Partial<Session> = {}): Session => ({
  name: 'Engr. Ana Reyes',
  email: 'ana@castillasorsogon.gov.ph',
  role: 'Evaluator',
  scopes: null,
  assignedForms: null,
  ...over,
});

describe('Capabilities', () => {
  it('cannot edit when nobody is signed in', () => {
    const c = withSession(null);

    // The safe answer, and the one that keeps a half-restored session from
    // briefly showing write controls.
    expect(c.canEdit()).toBe(false);
    expect(c.isViewOnly()).toBe(false);
    expect(c.source()).toBe('none');
  });

  it('prefers the server scopes when it reported them', () => {
    const c = withSession(session({ role: 'Auditor', scopes: ['applications:write'] }));

    // The role says auditor; the server says this token may write. The server
    // is the authority and the role must not override it.
    expect(c.canEdit()).toBe(true);
    expect(c.source()).toBe('scopes');
  });

  it('treats an explicitly empty scope list as no authority', () => {
    const c = withSession(session({ role: 'Evaluator', scopes: [] }));

    expect(c.canEdit()).toBe(false);
    expect(c.isViewOnly()).toBe(true);
    expect(c.source()).toBe('scopes');
  });

  it('reads read-only scopes as sight, not authority', () => {
    const c = withSession(
      session({ scopes: ['applications:read', 'documents:read', 'audit:read'] }),
    );

    expect(c.canEdit()).toBe(false);
  });

  it('falls back to the role when the server reported no scopes at all', () => {
    // Null is "the server did not say", not "it said none". Collapsing the two
    // would disable every write control against a server that has not shipped
    // the field yet.
    expect(withSession(session({ role: 'Evaluator', scopes: null })).canEdit()).toBe(true);
    expect(withSession(session({ role: 'Evaluator', scopes: null })).source()).toBe('role');
  });

  it('never grants edit to an auditor by role', () => {
    const c = withSession(session({ role: 'Auditor', scopes: null }));

    // The API had a defect until 2026-08-30 where an auditor could move
    // applications through intake because a transition rule named a read scope
    // as its authority. This must not reintroduce it on the client.
    expect(c.canEdit()).toBe(false);
    expect(c.isViewOnly()).toBe(true);
  });

  it('carries the forms the server assigned, so the scoped screens can speak', () => {
    const c = withSession(session({ assignedForms: ['Fencing Permit', 'Sign Permit'] }));

    // Null until 3 Sep, because /me sent no permitTypes — which left A-15 to
    // A-17 rendering nothing at all. They were correct to render nothing: the
    // server had not said. Now it does.
    expect(c.assignedForms()).toEqual(['Fencing Permit', 'Sign Permit']);
    expect(c.hasNoForms()).toBe(false);
  });

  it('distinguishes an officer assigned nothing from one the server did not describe', () => {
    // The distinction the whole three-state design rests on.
    expect(withSession(session({ assignedForms: [] })).hasNoForms()).toBe(true);
    expect(withSession(session({ assignedForms: null })).hasNoForms()).toBe(false);
    expect(withSession(session({ assignedForms: null })).assignedForms()).toBeNull();
  });

  it('explains view-only in one wording, and says nothing otherwise', () => {
    expect(withSession(session({ role: 'Auditor' })).viewOnlyReason()).toContain('View only');
    expect(withSession(session({ role: 'Evaluator' })).viewOnlyReason()).toBe('');
  });
});
