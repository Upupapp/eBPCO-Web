import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Workflow } from './workflow';

/**
 * The flow filter picks ONE diagram.
 *
 * `selectFilter` replaces `activeFilter`, so the control is single-select — but
 * it rendered checkboxes, which tell a screen reader (and anyone reading the
 * shape) that several may be chosen. The behaviour then contradicts the
 * affordance: ticking a second one silently unticks the first.
 */
describe('Workflow — the flow filter', () => {
  function open() {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [Workflow], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Workflow);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    (el.querySelector('.filter-toggle') as HTMLButtonElement).click();
    fixture.detectChanges();
    return { fixture, el };
  }

  it('offers the filters as radios, because only one flow can be shown', () => {
    const { el } = open();
    expect(el.querySelectorAll('input[type="checkbox"]').length).toBe(0);
    const radios = el.querySelectorAll<HTMLInputElement>('input[type="radio"]');
    expect(radios.length).toBeGreaterThan(1);
    // One group, so the browser itself enforces the single choice.
    expect(new Set(Array.from(radios).map((r) => r.name)).size).toBe(1);
  });

  it('has exactly one selected at a time', () => {
    const { el } = open();
    const checked = el.querySelectorAll('input[type="radio"]:checked');
    expect(checked.length).toBe(1);
  });
});
