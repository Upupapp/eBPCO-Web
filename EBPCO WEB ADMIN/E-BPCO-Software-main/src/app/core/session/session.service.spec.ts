import { TestBed } from '@angular/core/testing';
import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [SessionService] });
    service = TestBed.inject(SessionService);
  });

  it('starts unauthenticated', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.role()).toBeNull();
  });

  it('signs in as Super Admin regardless of what the email string contains', () => {
    // The old login flow branched on `email.includes('tenant')`; every
    // successful sign-in should now behave identically no matter what the
    // email looks like.
    service.signIn('someone.tenant@ebpco.gov.ph');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.role()).toBe('Super Admin');

    service.signOut();
    service.signIn('someone.else@ebpco.gov.ph');
    expect(service.role()).toBe('Super Admin');
  });

  it('signs out and clears the session', () => {
    service.signIn('user@ebpco.gov.ph');
    service.signOut();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.role()).toBeNull();
  });

  it('setRole only changes an already-signed-in session', () => {
    service.setRole('Evaluator');
    expect(service.role()).toBeNull();

    service.signIn('user@ebpco.gov.ph');
    service.setRole('Evaluator');
    expect(service.role()).toBe('Evaluator');
  });
});
