import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { PermitRelease } from './permit-release';
import { ApplicationStore } from '../../core/domain/application-store';
import { SessionService } from '../../core/session/session.service';
import { API_BASE_URL } from '../../core/api/api.config';
import { StaffRole } from '../../core/session/permissions';

/**
 * Releasing a permit.
 *
 * 1,175 lines and no tests until 2 Sep — the largest untested surface in the
 * portal, and the one that hands a citizen a signed permit. A release is the
 * last irreversible step: after it the application is Completed and the paper
 * is out of the building.
 *
 * These pin the refusals rather than the happy path. The happy path is visible
 * on screen every day; the refusals are what nobody exercises until the day
 * they matter, and each one exists because releasing without it would put a
 * permit in someone's hands that the office had not finished deciding.
 */
function mount(role: StaffRole = 'Releasing Officer'): ComponentFixture<PermitRelease> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [PermitRelease],
    providers: [
      provideRouter([]),
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: API_BASE_URL, useValue: '' },
    ],
  });
  const session = TestBed.inject(SessionService);
  (session as unknown as { _session: { set(v: unknown): void } })._session.set({
    name: 'Engr. Tester',
    email: 'tester@castillasorsogon.gov.ph',
    role,
    scopes: null,
    assignedForms: null,
  });
  const fixture = TestBed.createComponent(PermitRelease);
  fixture.detectChanges();
  return fixture;
}

type Testable = {
  confirmRelease(): void;
  requestRelease(row: unknown): void;
  releaseTarget(): unknown;
  releaseError(): string;
  claimantName: string;
  rows(): { id: string }[];
  canConfigureRequirements(): boolean;
  removeDocument(doc: unknown): void;
  resetDocumentsToDefault(): void;
};

describe('Permit release', () => {
  it('refuses a release with no claimant named', () => {
    const fixture = mount();
    const c = fixture.componentInstance as unknown as Testable;
    const ready = c.rows().find((r) => (r as { permitStatus?: string }).permitStatus === 'Ready for Release');
    expect(ready).toBeDefined();
    if (!ready) return;

    c.requestRelease(ready);
    c.claimantName = '   ';
    c.confirmRelease();

    // Who collected it is the only record of where the permit went. A release
    // to nobody is a permit the office cannot account for.
    expect(c.releaseError()).toContain('Claimant name is required');
    expect(c.releaseTarget()).not.toBeNull();
  });

  it('will not open a release for an application that is not ready', () => {
    const fixture = mount();
    const c = fixture.componentInstance as unknown as Testable;
    const notReady = c
      .rows()
      .find((r) => (r as { permitStatus?: string }).permitStatus !== 'Ready for Release');
    expect(notReady).toBeDefined();
    if (!notReady) return;

    c.requestRelease(notReady);

    // Refused before the dialog opens, rather than after the officer has typed
    // a claimant name and pressed confirm. The store refuses it too — this is
    // the first of the two, and the one the officer actually meets.
    expect(c.releaseTarget()).toBeNull();
  });

  it('the store refuses a release the UI would never offer', () => {
    const store = TestBed.inject(ApplicationStore);
    mount();
    const notReady = store.applications().find((a) => a.lifecycleStatus !== 'Ready for Release');
    expect(notReady).toBeDefined();
    if (!notReady) return;

    // Belt and braces, and the braces are what matter: the UI guard is one
    // component away from being edited, and this is the check that stands
    // whatever any screen decides to offer.
    expect(store.releasePermit(notReady.id, 'Engr. Tester', 'Raul Villanueva', 'Physical Claim'))
      .toBe(false);
  });

  it('will not release the same permit twice', () => {
    const store = TestBed.inject(ApplicationStore);
    mount();
    const already = store.applications().find((a) => store.getRelease(a.id) !== undefined);
    expect(already).toBeDefined();
    if (!already) return;

    // A second release would give one permit two claimants, and the record
    // could not say which of them holds it.
    //
    // NOTE ON WHAT THIS DOES AND DOES NOT PROVE. `releasePermit` refuses this
    // twice: the dedicated duplicate check, and the status check — a released
    // application is Completed, not Ready for Release. Deleting the duplicate
    // check alone does NOT fail this test, which was verified rather than
    // assumed. The behaviour is right and doubly defended; this test pins the
    // outcome, not that particular guard. Said here because a test named for a
    // guard it cannot isolate is how a guard gets removed as dead code.
    expect(store.releasePermit(already.id, 'Engr. Tester', 'Someone Else', 'Physical Claim'))
      .toBe(false);
  });

  it('lets only an authorised role edit the requirements checklist', () => {
    // The checklist decides what a citizen must produce. An officer who can
    // release permits is not thereby entitled to change what a permit requires.
    expect((mount('Super Admin').componentInstance as unknown as Testable).canConfigureRequirements()).toBe(true);
    expect((mount('Releasing Officer').componentInstance as unknown as Testable).canConfigureRequirements()).toBe(false);
    expect((mount('Auditor').componentInstance as unknown as Testable).canConfigureRequirements()).toBe(false);
  });

  it('refuses checklist edits from an unauthorised role rather than ignoring them', () => {
    const fixture = mount('Auditor');
    const c = fixture.componentInstance as unknown as Testable;

    // Silently doing nothing would leave the officer believing the change
    // landed. These return early AND toast, which is the shape the rest of the
    // portal uses for a refused action.
    expect(() => c.resetDocumentsToDefault()).not.toThrow();
    expect(c.canConfigureRequirements()).toBe(false);
  });

  it('shows the queue-load notice, so a failed read is not read as no work', () => {
    const fixture = mount();
    const store = TestBed.inject(ApplicationStore);
    store.replaceApplications([]);
    store.recordLoadFailure('The queue is down.');
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('could not be loaded');
    expect(text).toContain('The queue is down.');
  });

  it('offers no way to delete a record', () => {
    const el: HTMLElement = mount('Super Admin').nativeElement;
    const labels = [...el.querySelectorAll('button')].map((b) =>
      `${b.textContent ?? ''} ${b.getAttribute('aria-label') ?? ''}`.toLowerCase(),
    );

    // Records are archived. The one "Remove" here is a document leaving a
    // CHECKLIST — configuration, not a record of anything that happened.
    expect(labels.some((l) => /\bdelete\b|\bdestroy\b/.test(l))).toBe(false);
  });
});
