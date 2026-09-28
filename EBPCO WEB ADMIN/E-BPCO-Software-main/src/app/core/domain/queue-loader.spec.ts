import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { QueueLoader } from './queue-loader';
import { ApplicationStore } from './application-store';
import { StaffApplicationsApi } from '../api/staff-applications.api';
import { SessionService } from '../session/session.service';
import { ApplicationRecord } from './application.model';

/**
 * One request per session, made in one place.
 *
 * Until 2 Sep exactly one page called the server — Applications — and every
 * other surface read whatever was in the store. Login lands on `/dashboard`,
 * so every officer met figures built from 50 generated applications (S-1).
 *
 * The seed notice made that honest. This makes it unnecessary.
 */
describe('QueueLoader', () => {
  let calls: number;

  function setup(page: () => Promise<unknown>) {
    calls = 0;
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: StaffApplicationsApi,
          useValue: {
            page: () => {
              calls += 1;
              return page();
            },
          },
        },
      ],
    });
    return {
      loader: TestBed.inject(QueueLoader),
      store: TestBed.inject(ApplicationStore),
    };
  }

  const ok = () => Promise.resolve({ rows: [], nextCursor: null });

  it('asks the server once, however many pages ask it to', async () => {
    const { loader } = setup(ok);

    await Promise.all([loader.ensureLoaded(), loader.ensureLoaded(), loader.ensureLoaded()]);
    await loader.ensureLoaded();

    // Two pages constructing at once must produce one request, and neither has
    // to know the other exists.
    expect(calls).toBe(1);
  });

  it('leaves the store saying the server answered, even with no rows', async () => {
    const { loader, store } = setup(ok);
    expect(store.isSeedData()).toBe(true);

    await loader.ensureLoaded();

    // An empty answer is still an answer. Staying on 'seed' here would keep
    // every page apologising for figures that are now real.
    expect(store.isSeedData()).toBe(false);
    expect(store.loadFailure()).toBeNull();
  });

  it('records a failure instead of throwing it at whichever page asked', async () => {
    const { loader, store } = setup(() => Promise.reject(new Error('The queue is down.')));

    // A rejection here would surface as an unhandled error in a component that
    // only wanted to render.
    await expect(loader.ensureLoaded()).resolves.toBeUndefined();
    expect(store.loadFailure()).toBe('The queue is down.');
  });

  it('empties the store on failure, so no seed row hides under the notice', async () => {
    const { loader, store } = setup(() => Promise.reject(new Error('down')));
    expect(store.applications().length).toBeGreaterThan(0);

    await loader.ensureLoaded();

    // The notice says the figures are not current work. Leaving 50 seeded rows
    // beneath it would make that sentence describe a screen full of numbers.
    expect(store.applications().length).toBe(0);
  });

  it('reload asks again even when already loaded', async () => {
    const { loader } = setup(ok);
    await loader.ensureLoaded();

    await loader.reload();

    expect(calls).toBe(2);
  });
});

/**
 * The queue belongs to whoever loaded it.
 *
 * Signing out and in as someone else does not reload the page, and the store
 * outlives both sessions. A cashier who signed in after the super admin on the
 * same tab was shown the super admin's 10 applications, where her own queue
 * held 1.
 */
describe('QueueLoader — a different officer on the same tab', () => {
  function setup() {
    TestBed.resetTestingModule();
    const account = signal<string | null>('super-admin');
    const answers: Record<string, number> = {};
    let seed: readonly ApplicationRecord[] = [];
    TestBed.configureTestingModule({
      providers: [
        { provide: SessionService, useValue: { accountId: account.asReadonly() } },
        {
          provide: StaffApplicationsApi,
          useValue: {
            page: () => {
              const who = account() ?? 'nobody';
              answers[who] = (answers[who] ?? 0) + 1;
              // The super admin sees ten; the cashier sees one.
              return Promise.resolve({ rows: seed.slice(0, who === 'super-admin' ? 10 : 1), nextCursor: null });
            },
          },
        },
      ],
    });
    const store = TestBed.inject(ApplicationStore);
    seed = store.applications();
    return { loader: TestBed.inject(QueueLoader), store, account, answers };
  }

  it("does not show the next officer the previous officer's applications", async () => {
    const { loader, store, account, answers } = setup();
    await loader.ensureLoaded();
    expect(store.applications().length).toBe(10);

    account.set('cashier');
    const loading = loader.ensureLoaded();
    // Cleared before the new request even answers — nothing of the super
    // admin's can render in the meantime.
    expect(store.applications().length).toBe(0);
    await loading;

    expect(store.applications().length).toBe(1);
    expect(answers['cashier']).toBe(1);
  });

  it('keeps one request per officer: the same officer asking again does not reload', async () => {
    const { loader, answers } = setup();
    await loader.ensureLoaded();
    await loader.ensureLoaded();

    expect(answers['super-admin']).toBe(1);
  });

  it("a background refresh after the switch loads the new officer's queue, not a stale one", async () => {
    const { loader, store, account } = setup();
    await loader.ensureLoaded();

    account.set('cashier');
    await loader.refresh();

    expect(store.applications().length).toBe(1);
  });
});
