import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';

import { Archive } from './archive';
import { ArchiveKind, ArchivedItem, TeamsApi, Write } from '../../core/api/teams.api';
import { ToastService } from '../../shared/toast/toast.service';
import { ALL_STAFF_ROLES, canAccessPath } from '../../core/session/permissions';

/**
 * The Archive (owner request, 2026-09-29): nothing is deleted, by anyone, and
 * everything archived — of every kind — can be found here and restored by
 * the officers the server allows.
 */
const item = (over: Partial<ArchivedItem> = {}): ArchivedItem => ({
  kind: 'application', id: 'a1', title: 'E-BPCO-2026-000101', subtitle: 'Fencing Permit · Maria Santos · Cancelled',
  archivedAt: '2026-09-28T02:00:00.000Z', archivedBy: 'Joel Dimaano', reason: 'Duplicate filing', canRestore: true,
  ...over,
});

const ITEMS: readonly ArchivedItem[] = [
  item(),
  item({ kind: 'staff', id: 's1', title: 'Ben Reyes', subtitle: 'ben@castilla.test · evaluator', reason: 'Transferred', canRestore: false }),
  item({ kind: 'business', id: 'b1', title: 'Santos Store', subtitle: 'BN-1', reason: null }),
  item({ kind: 'requirement', id: 'r1', title: 'Fence plan', subtitle: 'Checklist: Fencing Permit', reason: null }),
];

function render(restore: (kind: ArchiveKind, id: string) => Promise<Write> = async () => ({ kind: 'done', detail: 'Restored.' })) {
  const api = { archived: vi.fn(async () => ({ kind: 'ok' as const, value: ITEMS })), restore: vi.fn(restore) };
  const toast = { success: vi.fn(), error: vi.fn(), info: vi.fn() };
  TestBed.configureTestingModule({
    imports: [Archive],
    providers: [
      provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
      { provide: TeamsApi, useValue: api },
      { provide: ToastService, useValue: toast },
    ],
  });
  const fixture = TestBed.createComponent(Archive);
  return { fixture, api, toast };
}

const settle = async (fixture: ReturnType<typeof render>['fixture']) => {
  await fixture.whenStable();
  fixture.detectChanges();
};

describe('Archive', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('is reachable by every staff role, an Administrator included', () => {
    for (const role of ALL_STAFF_ROLES) {
      expect(canAccessPath({ role, scopes: [], stages: null, superAdmin: role === 'Super Admin' }, '/archive')).toBe(true);
    }
  });

  it('lists every kind that was archived, with who and why', async () => {
    const { fixture } = render();
    await settle(fixture);
    const page = fixture.nativeElement as HTMLElement;

    const titles = Array.from(page.querySelectorAll('.item-title')).map((el) => el.textContent?.trim());
    expect(titles).toEqual(['E-BPCO-2026-000101', 'Ben Reyes', 'Santos Store', 'Fence plan']);
    expect(page.textContent).toContain('Joel Dimaano');
    expect(page.textContent).toContain('Duplicate filing');
    expect(page.textContent).toContain('Not recorded');
  });

  it('filters by kind, with a count on every tab', async () => {
    const { fixture } = render();
    await settle(fixture);
    const page = fixture.nativeElement as HTMLElement;

    const tab = Array.from(page.querySelectorAll<HTMLButtonElement>('.tab-btn')).find((b) => b.textContent?.includes('Businesses'))!;
    expect(tab.textContent).toContain('1');
    tab.click();
    fixture.detectChanges();
    expect(Array.from(page.querySelectorAll('.item-title')).map((el) => el.textContent?.trim())).toEqual(['Santos Store']);
  });

  it('offers Restore only where the server says the officer may', async () => {
    const { fixture } = render();
    await settle(fixture);
    const page = fixture.nativeElement as HTMLElement;

    const restoreLabels = Array.from(page.querySelectorAll('.restore-btn')).map((b) => b.getAttribute('aria-label'));
    expect(restoreLabels).not.toContain('Restore Ben Reyes');
    expect(restoreLabels).toContain('Restore Santos Store');
  });

  it('restores after a confirmation, says so, and takes the item off the list', async () => {
    const { fixture, api, toast } = render();
    await settle(fixture);
    const page = fixture.nativeElement as HTMLElement;

    page.querySelector<HTMLButtonElement>('[aria-label="Restore Santos Store"]')!.click();
    fixture.detectChanges();
    const confirm = Array.from(page.querySelectorAll<HTMLButtonElement>('.modal-btn')).find((b) => b.textContent?.trim() === 'Restore')!;
    confirm.click();
    await settle(fixture);

    expect(api.restore).toHaveBeenCalledWith('business', 'b1');
    expect(toast.success).toHaveBeenCalledWith('Restored.');
    expect(Array.from(page.querySelectorAll('.item-title')).map((el) => el.textContent?.trim())).not.toContain('Santos Store');
  });

  it('shows the server’s refusal as it is', async () => {
    const { fixture, toast } = render(async () => ({ kind: 'refused', message: 'Only a super admin can restore a staff account.' }));
    await settle(fixture);
    const page = fixture.nativeElement as HTMLElement;

    page.querySelector<HTMLButtonElement>('[aria-label="Restore Santos Store"]')!.click();
    fixture.detectChanges();
    Array.from(page.querySelectorAll<HTMLButtonElement>('.modal-btn')).find((b) => b.textContent?.trim() === 'Restore')!.click();
    await settle(fixture);

    expect(toast.error).toHaveBeenCalledWith('Only a super admin can restore a staff account.');
  });

  it('never offers a way to delete anything', async () => {
    const { fixture } = render();
    await settle(fixture);
    expect((fixture.nativeElement as HTMLElement).textContent?.toLowerCase()).not.toContain('delete ');
  });
});
