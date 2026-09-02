import { TestBed } from '@angular/core/testing';

import { QueueLoadNotice } from './queue-load-notice';
import { ApplicationStore } from '../../core/domain/application-store';

/**
 * Five pages read `ApplicationStore.applications()`; one fetches.
 *
 * When that fetch failed the store was emptied and every other page carried on
 * as normal — Permit Release showing "Ready for Release 0", Dashboard an empty
 * backlog. Each is a claim about the LGU's workload, and none was true: the
 * portal had failed to ask, not been told nothing.
 */
describe('QueueLoadNotice', () => {
  let store: ApplicationStore;

  function mount() {
    const fixture = TestBed.createComponent(QueueLoadNotice);
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [ApplicationStore] });
    store = TestBed.inject(ApplicationStore);
  });

  it('renders nothing once the server has answered, so it is safe to place unconditionally', () => {
    // The store starts on its seed, which is now a state worth naming. Silence
    // is correct only after the server has said something.
    store.replaceApplications([]);
    expect(mount().trim()).toBe('');
  });

  it('says the figures are samples when nothing has been loaded yet', () => {
    // The common case, and it was invisible: only Applications called the
    // server and login lands on Dashboard, so every officer met a fabricated
    // backlog on every sign-in (S-1). No load had failed, so the failure
    // notice could not cover it.
    const text = mount();

    expect(text).toContain('sample applications');
    expect(text).toContain('not the office');
    expect(text).not.toContain('could not be loaded');
  });

  it('prefers the failure over the sample notice when a load actually failed', () => {
    store.recordLoadFailure('The request failed');
    const text = mount();

    // Both are true at once — the rows are seed AND the read failed — but the
    // failure is the more actionable of the two, and two banners saying
    // different things about the same numbers is worse than either.
    expect(text).toContain('could not be loaded');
    expect(text).not.toContain('sample applications');
  });

  it('says the figures are not current work when the queue failed', () => {
    store.recordLoadFailure('The request failed');
    const text = mount();
    expect(text).toContain('could not be loaded');
    expect(text).toContain('not a picture of current work');
    expect(text).toContain('The request failed');
  });

  it('a successful load clears it — including one that genuinely returns no rows', () => {
    store.recordLoadFailure('The request failed');
    expect(mount()).toContain('could not be loaded');

    // An empty result is not a failure, and must not keep the warning up.
    store.replaceApplications([]);
    expect(mount().trim()).toBe('');
  });

});
