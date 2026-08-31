import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AssignedFormsNotice } from './assigned-forms-notice';
import { SessionService, Session } from '../../core/session/session.service';
import { API_BASE_URL } from '../../core/api/api.config';

/**
 * Explaining a scoped queue.
 *
 * "No applications" is three facts under one label — none exist, none in your
 * forms, or you hold no forms at all. The middle one costs a day: the queue
 * looks quiet while work sits in a permit type nobody assigned you. The third
 * is quieter still, because a newly approved account with no forms looks
 * exactly like an idle morning.
 */
function mount(session: Session | null) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [AssignedFormsNotice],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: API_BASE_URL, useValue: '' },
    ],
  });
  const service = TestBed.inject(SessionService);
  (service as unknown as { _session: { set(v: Session | null): void } })._session.set(session);
  const fixture = TestBed.createComponent(AssignedFormsNotice);
  fixture.detectChanges();
  return fixture;
}

const session = (assignedForms: readonly string[] | null): Session => ({
  name: 'Engr. Ana Reyes',
  email: 'ana@castillasorsogon.gov.ph',
  role: 'Evaluator',
  scopes: null,
  assignedForms,
});

describe('Assigned forms notice', () => {
  it('says nothing when the server did not report forms', () => {
    // Silence is not "none assigned". Guessing either way would be a claim
    // about this officer's access that nobody made.
    expect((mount(session(null)).nativeElement as HTMLElement).textContent?.trim()).toBe('');
  });

  it('warns, distinctly, when the account is assigned no forms', () => {
    const fixture = mount(session([]));
    const el: HTMLElement = fixture.nativeElement;

    expect(el.textContent).toContain('assigned no forms');
    expect(el.textContent).toContain('nothing can appear here');
    // Not an ordinary note: this account can see nothing, and it would
    // otherwise read as an idle morning.
    expect(el.querySelector('.warn')).not.toBeNull();
  });

  it('names the forms, and says other permit types are not shown', () => {
    const fixture = mount(session(['Fencing Permit', 'Sign Permit']));
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('2 forms');
    expect(text).toContain('Fencing Permit, Sign Permit');
    expect(text).toContain('not shown here');
    expect(fixture.nativeElement.querySelector('.warn')).toBeNull();
  });

  it('renders nothing at all when nobody is signed in', () => {
    expect((mount(null).nativeElement as HTMLElement).textContent?.trim()).toBe('');
  });
});
