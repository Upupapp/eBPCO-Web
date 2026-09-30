import { Component, Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { LiveRefresh, officerIsBusy, onTick } from './live-refresh';
import { QueueLoader } from '../domain/queue-loader';

/**
 * The portal's one refresh pulse (owner report, 30 Sep 2026: updates only
 * showed after a manual reload). The list refreshed itself; an open record,
 * Evaluations, the bell and the Teams board did not.
 */
describe('LiveRefresh', () => {
  let refreshes: number;

  function setup() {
    refreshes = 0;
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: QueueLoader, useValue: { refresh: () => { refreshes += 1; return Promise.resolve(); } } }],
    });
    return TestBed.inject(LiveRefresh);
  }

  afterEach(() => {
    document.body.innerHTML = '';
    (document.activeElement as HTMLElement | null)?.blur();
  });

  it('refreshes the shared list, then advances the tick', async () => {
    const live = setup();

    await live.pulse();

    expect(refreshes).toBe(1);
    expect(live.tick()).toBe(1);
  });

  it('skips a pulse while the officer is typing, and catches up on the next', async () => {
    const live = setup();
    const field = document.createElement('input');
    document.body.appendChild(field);
    field.focus();

    await live.pulse();
    expect(refreshes).toBe(0);
    expect(live.tick()).toBe(0);

    field.blur();
    await live.pulse();
    expect(live.tick()).toBe(1);
  });

  it('runs a screen reload on each pulse after it subscribed, not at once', async () => {
    const live = setup();
    let reloads = 0;
    runInInjectionContext(TestBed.inject(Injector), () => onTick(() => { reloads += 1; }));
    TestBed.tick();
    expect(reloads).toBe(0);

    await live.pulse();
    TestBed.tick();
    expect(reloads).toBe(1);

    await live.pulse();
    TestBed.tick();
    expect(reloads).toBe(2);
  });

  it('stops reloading a screen once it is gone', async () => {
    let reloads = 0;
    @Component({ template: '' })
    class Screen {
      readonly follow = onTick(() => { reloads += 1; });
    }
    const live = setup();
    const fixture = TestBed.createComponent(Screen);
    fixture.destroy();

    await live.pulse();
    TestBed.tick();

    expect(reloads).toBe(0);
  });
});

describe('officerIsBusy', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('is busy while a text field or a select has focus', () => {
    for (const html of ['<input type="text">', '<textarea></textarea>', '<select><option>a</option></select>']) {
      document.body.innerHTML = html;
      (document.body.firstElementChild as HTMLElement).focus();
      expect(officerIsBusy()).toBe(true);
    }
  });

  it('is not busy with a checkbox or a button focused', () => {
    document.body.innerHTML = '<input type="checkbox"><button>Go</button>';
    (document.querySelector('input') as HTMLElement).focus();
    expect(officerIsBusy()).toBe(false);
    (document.querySelector('button') as HTMLElement).focus();
    expect(officerIsBusy()).toBe(false);
  });

  it('is busy while a dialog is showing, and not for one that is hidden', () => {
    document.body.innerHTML = '<div role="dialog" hidden>Archive?</div>';
    expect(officerIsBusy()).toBe(false);

    document.body.innerHTML = '<div role="dialog" style="display:none">Archive?</div>';
    expect(officerIsBusy()).toBe(false);

    document.body.innerHTML = '<div role="dialog" aria-modal="true">Archive?</div>';
    expect(officerIsBusy()).toBe(true);
  });
});
