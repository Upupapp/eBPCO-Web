import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideRouter } from '@angular/router';

import { TeamsBoard } from './teams-board';
import { IdentityApi, Me } from '../../core/api/identity.api';
import { TokenStore } from '../../core/api/token-store';
import { TeamOverview, TeamsApi } from '../../core/api/teams.api';
import { StaffDirectoryApi } from '../../core/api/staff-directory.api';
import { ApplicationStore } from '../../core/domain/application-store';
import { ApplicationRecord } from '../../core/domain/application.model';
import { QueueLoader } from '../../core/domain/queue-loader';
import { SessionService } from '../../core/session/session.service';

const LEAD = { id: 'lead-1', name: 'EnP. Dennis Gonzaga', email: 'dennis@castilla.test', lead: true, canWork: true, assigned: 1 };
const MEMBER = { id: 'member-1', name: 'EnP. Carlo Reyes', email: 'carlo@castilla.test', lead: false, canWork: true, assigned: 0 };

const TEAMS: TeamOverview[] = [
  { key: 'zoning', name: 'Zoning', position: 'Zoning Officer', ownsStep: true, members: [LEAD, MEMBER], waiting: 1, unassigned: 1 },
  { key: 'fire-safety', name: 'Fire Safety', position: 'Fire Safety Evaluator', ownsStep: true, members: [], waiting: 0, unassigned: 0 },
  { key: 'audit', name: 'Audit', position: 'Auditor', ownsStep: false, members: [], waiting: 0, unassigned: 0 },
];

const WAITING = {
  id: 'app-59', referenceNumber: 'E-BPCO-2026-000059', type: 'Fencing Permit', applicant: 'Michaela Cailing',
  businessName: '—',
  responsibility: {
    step: 'Decide the Zoning evaluation', holder: 'Zoning Officer', stage: 'Zoning', awaitingApplicant: false,
    officers: [LEAD, MEMBER], team: 'zoning', assignee: null,
  },
} as unknown as ApplicationRecord;

const SCOPES = {
  superAdmin: ['applications:read', 'staff:administer', 'staff:evaluate', 'citizens:read'],
  administrator: ['staff:administer', 'citizens:read'],
  evaluator: ['applications:read', 'documents:read', 'staff:evaluate', 'staff:annotate'],
};

/** The officer the stubbed `/me` describes, set by each test before it signs in. */
let profile: Me;

async function signInAs(me: Partial<Me>): Promise<void> {
  profile = { id: 'viewer', email: 'viewer@castilla.test', kind: 'staff', ...me };
  await TestBed.inject(SessionService).signIn(profile.email, 'x');
}

async function render(scope: 'all' | 'mine'): Promise<HTMLElement> {
  TestBed.inject(ApplicationStore).replaceApplications([WAITING]);
  const fixture = TestBed.createComponent(TeamsBoard);
  fixture.componentRef.setInput('scope', scope);
  // The board loads on its own (the teams, then the queue): let those settle.
  for (let tick = 0; tick < 5; tick += 1) {
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve));
  }
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

const texts = (root: HTMLElement, selector: string) =>
  Array.from(root.querySelectorAll(selector)).map((el) => (el.textContent ?? '').replace(/\s+/g, ' ').trim());

describe('TeamsBoard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: TeamsApi, useValue: { overview: () => Promise.resolve({ kind: 'ok', value: TEAMS }), assign: vi.fn() } },
        { provide: StaffDirectoryApi, useValue: { setTeamRole: vi.fn() } },
        { provide: QueueLoader, useValue: { ensureLoaded: () => Promise.resolve(), reload: () => Promise.resolve() } },
        {
          provide: IdentityApi,
          useFactory: (): Partial<IdentityApi> => {
            const tokens = TestBed.inject(TokenStore);
            return {
              signIn: () => { tokens.set({ accessToken: 't' }); return Promise.resolve(profile); },
              me: () => Promise.resolve(profile),
              signOut: () => Promise.resolve(),
            };
          },
        },
      ],
    });
    TestBed.inject(TokenStore).clear();
  });

  it('shows a super admin every team, lets them set who leads, and assign any team\'s work', async () => {
    await signInAs({ roles: ['super-admin'], scopes: SCOPES.superAdmin, teams: [], teamRole: null });
    const root = await render('all');

    expect(texts(root, '.team-item-name')).toEqual(['Zoning', 'Fire Safety', 'Audit']);
    expect(root.querySelector('.panel-title h3')?.textContent).toContain('Zoning');
    expect(root.querySelectorAll('.role-toggle').length).toBe(2);
    expect(root.querySelector('select.assign-select')).not.toBeNull();
    expect(texts(root, '.action-cell button')).toContain('Assign');
  });

  it('lets an administrator set who leads, but not hand out a team\'s work they cannot open', async () => {
    await signInAs({ roles: ['administrator'], scopes: SCOPES.administrator, teams: ['administration'], teamRole: 'lead' });
    const root = await render('all');

    expect(root.querySelectorAll('.role-toggle').length).toBe(2);
    expect(root.querySelector('select.assign-select')).toBeNull();
    expect(root.querySelector('.panel-note')?.textContent).toContain('counted but not listed');
  });

  it('shows a team lead only their own team, with Assign and no Lead / Member switch', async () => {
    await signInAs({ roles: ['evaluator'], scopes: SCOPES.evaluator, evaluationStages: ['Zoning'], teams: ['zoning'], teamRole: 'lead' });
    const root = await render('mine');

    expect(root.querySelector('.team-list')).toBeNull();
    expect(root.querySelector('.mine-pill')?.textContent).toContain('You lead this team');
    expect(root.querySelector('.role-toggle')).toBeNull();
    expect(root.querySelector('select.assign-select')).not.toBeNull();
  });

  it('gives a member Take it on unassigned work, and no way to give it to someone else', async () => {
    await signInAs({ roles: ['evaluator'], scopes: SCOPES.evaluator, evaluationStages: ['Zoning'], teams: ['zoning'], teamRole: 'member' });
    const root = await render('mine');

    expect(root.querySelector('.mine-pill')?.textContent).toContain('Your team');
    expect(root.querySelector('select.assign-select')).toBeNull();
    expect(texts(root, '.action-cell button')).toEqual(['Take it']);
  });
});
