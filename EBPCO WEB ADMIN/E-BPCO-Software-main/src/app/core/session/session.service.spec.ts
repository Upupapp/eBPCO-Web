import { TestBed } from '@angular/core/testing';
import { SessionService } from './session.service';
import { IdentityApi } from '../api/identity.api';
import { FakeIdentityApi } from '../api/identity.api.fake';
import { TokenStore } from '../api/token-store';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [SessionService,
      { provide: IdentityApi, useFactory: () => new FakeIdentityApi(TestBed.inject(TokenStore)) },
    ] });
    service = TestBed.inject(SessionService);
  });

  it('starts unauthenticated', async () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.role()).toBeNull();
  });

  it('takes the role from the SERVER, never from the email address', async () => {
    // Two behaviours have been retired here. The original flow branched on
    // `email.includes('tenant')`; the mock that replaced it handed everyone
    // Super Admin because there was no server to ask. Both meant the sidebar
    // and the API could disagree about what an officer may do, and the API is
    // the one that decides.
    //
    // The stub answers `super-admin` for any address, so this asserts the role
    // follows what the identity endpoint said rather than anything typed in.
    await service.signIn('someone.tenant@ebpco.gov.ph', 'correct-horse');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.role()).toBe('Super Admin');

    await service.signOut();
    await service.signIn('someone.else@ebpco.gov.ph', 'correct-horse');
    expect(service.role()).toBe('Super Admin');
  });

  it('signs out and clears the session', async () => {
    await service.signIn('user@ebpco.gov.ph', 'correct-horse');
    await service.signOut();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.role()).toBeNull();
  });

  it('REFUSES an account whose roles this portal does not recognise', async () => {
    // Signing someone in and then showing them an empty menu is
    // indistinguishable from a broken portal. Refusing at the door says what
    // actually happened, and clears the token so the next attempt is clean.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        SessionService,
        {
          provide: IdentityApi,
          useFactory: () => new FakeIdentityApi(TestBed.inject(TokenStore), ['chief-vibes-officer']),
        },
      ],
    });
    const narrow = TestBed.inject(SessionService);

    await expect(narrow.signIn('stranger@lgu.gov.ph', 'correct-horse')).rejects.toThrow(/no role/i);
    expect(narrow.isAuthenticated()).toBe(false);
    expect(TestBed.inject(TokenStore).hasSession()).toBe(false);
  });

  it('setRole only changes an already-signed-in session', async () => {
    service.setRole('Evaluator');
    expect(service.role()).toBeNull();

    await service.signIn('user@ebpco.gov.ph', 'correct-horse');
    service.setRole('Evaluator');
    expect(service.role()).toBe('Evaluator');
  });
});
