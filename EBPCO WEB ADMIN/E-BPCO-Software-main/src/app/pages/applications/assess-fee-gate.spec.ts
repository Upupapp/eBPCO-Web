import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Applications } from './applications';
import { StaffApplicationsApi, ApplicationEvaluation } from '../../core/api/staff-applications.api';

/**
 * Assess Fee must not be offered — or reachable server-side — before every
 * evaluation stage has actually passed.
 *
 * Found live: an application still "Under Evaluation" with Zoning not yet
 * decided showed an active Assess Fee button anyway, because canAssessFee()
 * only ever checked lifecycleStatus and assessedAmountCentavos — never the
 * real evaluations GET /staff/applications/:id already sent
 * (staff-queue.service.ts's own detail() reads them), which this client
 * never declared on ApplicationDetail until now. AssessmentService.issue()
 * gained the same gate server-side (sibling ebpco-api commit) — this proves
 * the client-side hint agrees with it, not that either alone is sufficient.
 */
describe('Applications — Assess Fee is gated on every evaluation stage having passed', () => {
  function mount() {
    TestBed.configureTestingModule({
      imports: [Applications],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: StaffApplicationsApi, useValue: { page: () => Promise.resolve({ rows: [], nextCursor: null }) } },
      ],
    });
    const fixture = TestBed.createComponent(Applications);
    fixture.detectChanges();
    return fixture.componentInstance as unknown as {
      realDetail: { set(value: unknown): void };
      evaluationsComplete(): boolean;
    };
  }

  const MOUNT_BUDGET = 20_000;

  const passed = (stage: ApplicationEvaluation['stage']): ApplicationEvaluation => ({
    id: `eval-${stage}`, stage, result: 'Passed', remarks: null, evaluatedAt: '2026-09-19T00:00:00.000Z',
  });

  it('is false with no evaluations at all', () => {
    const component = mount();
    component.realDetail.set({ evaluations: [] });
    expect(component.evaluationsComplete()).toBe(false);
  }, MOUNT_BUDGET);

  it('is false while any one stage (e.g. Zoning) has not passed — the exact live bug', () => {
    const component = mount();
    component.realDetail.set({
      evaluations: [passed('Initial'), { ...passed('Zoning'), result: 'Revision Required' }, passed('Fire Safety'), passed('OBO'), passed('Final Approval')],
    });
    expect(component.evaluationsComplete()).toBe(false);
  }, MOUNT_BUDGET);

  it('is true once all five stages have passed', () => {
    const component = mount();
    component.realDetail.set({
      evaluations: [passed('Initial'), passed('Zoning'), passed('Fire Safety'), passed('OBO'), passed('Final Approval')],
    });
    expect(component.evaluationsComplete()).toBe(true);
  }, MOUNT_BUDGET);
});
