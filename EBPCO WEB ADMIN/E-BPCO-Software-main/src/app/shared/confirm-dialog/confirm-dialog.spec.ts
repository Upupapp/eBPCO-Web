import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';

import { ConfirmDialog } from './confirm-dialog';

/**
 * The reason a confirmation can require.
 *
 * Archiving an application must carry remarks: the server demands at least
 * three characters and refuses otherwise, and more importantly the remarks are
 * all that anyone reading the record later will have. Collecting them in the
 * same dialog as the decision means there is no second step to skip.
 */
@Component({
  imports: [ConfirmDialog],
  template: `
    <app-confirm-dialog
      title="Archive this?"
      confirmLabel="Archive"
      [reasonLabel]="label()"
      (confirmed)="captured.set($event)"
    />
  `,
})
class Host {
  readonly label = signal<string | null>('Why is this being archived?');
  readonly captured = signal<string | null>(null);
}

function mount(label: string | null = 'Why is this being archived?'): ComponentFixture<Host> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ imports: [Host] });
  const fixture = TestBed.createComponent(Host);
  fixture.componentInstance.label.set(label);
  fixture.detectChanges();
  return fixture;
}

function confirmButton(fixture: ComponentFixture<Host>): HTMLButtonElement {
  return [...fixture.nativeElement.querySelectorAll('button')].find(
    (b) => (b as HTMLElement).textContent?.trim() === 'Archive',
  ) as HTMLButtonElement;
}

describe('Confirm dialog', () => {
  it('will not confirm without the reason it asked for', () => {
    const fixture = mount();
    confirmButton(fixture).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.captured()).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Please give a reason');
  });

  it('rejects whitespace as a reason', () => {
    const fixture = mount();
    const box = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    box.value = '   ';
    box.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    confirmButton(fixture).click();

    expect(fixture.componentInstance.captured()).toBeNull();
  });

  it('confirms with the trimmed reason', async () => {
    const fixture = mount();
    const box = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    box.value = '  Duplicate filing.  ';
    box.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    confirmButton(fixture).click();

    expect(fixture.componentInstance.captured()).toBe('Duplicate filing.');
  });

  it('asks for nothing, and confirms straight away, when no reason is wanted', () => {
    const fixture = mount(null);

    // Existing callers that never wanted a reason must be unaffected.
    expect(fixture.nativeElement.querySelector('textarea')).toBeNull();
    confirmButton(fixture).click();
    expect(fixture.componentInstance.captured()).toBe('');
  });
});
