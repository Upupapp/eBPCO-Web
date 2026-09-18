import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';

import { UserPortalPermitPreview } from './user-portal-permit-preview';
import { USER_PORTAL_BASE_URL } from '../../core/config/user-portal.config';
import { ApplicationStore } from '../../core/domain/application-store';
import { AssessmentStore } from '../../core/domain/assessment-store';
import { ApplicationRecord, withProjectedFields } from '../../core/domain/application.model';
import { ApplicationDetailResult, StaffApplicationsApi } from '../../core/api/staff-applications.api';

/**
 * The watermark gate.
 *
 * Originally the control that decided whether a generated document declared
 * itself DRAFT / FOR REVIEW / NOT VALID AS AN OFFICIAL PERMIT depending on
 * approval and payment state. An explicit owner decision (see
 * `user-portal-permit-preview.ts`'s `gate` computed) replaced that
 * progression: this system issues no real permits, so EVERY document gets
 * the same 'SAMPLE — NOT AN OFFICIAL PERMIT' watermark regardless of state —
 * a progression that got more confident as an application moved along would
 * misrepresent a preview that is never going to become a real permit.
 *
 * What is still safety-critical, and still branches, is `cleared`: whether a
 * genuine issued-permit record exists gates the QR/verification link. A
 * citizen must never be handed a verification link for a permit that was
 * never actually issued. That is what this file actually tests now.
 *
 * Stubbed stores rather than seed data, because the point is to pin each branch
 * exactly, including combinations the seed may not happen to contain.
 */
@Component({
  imports: [UserPortalPermitPreview],
  template: '<app-user-portal-permit-preview [applicationId]="id" />',
})
class Host {
  id = 'APP-1';
}

const row = (): ApplicationRecord =>
  withProjectedFields({
    id: 'APP-1',
    businessId: 'BIZ-1',
    businessName: 'Villanueva Hardware',
    applicantId: 'APL-1',
    applicant: 'Raul Villanueva',
    location: 'Barangay Poblacion',
    permitType: 'Building Permit – New Construction',
    applicationAction: 'New',
    officer: 'Engr. Tester',
    dateSubmitted: '2026-08-01',
    dateValue: new Date('2026-08-01T00:00:00.000Z'),
    lifecycleStatus: 'Under Evaluation',
    evaluationStage: 'Initial',
    evaluationResult: 'Pending',
    paymentStatus: 'Not Yet Available',
    permitReleaseStatus: 'Not Ready',
    assessedAmountCentavos: null,
  });

/** Never resolves 'ok' — these tests pin behavior purely off the stubbed `store`/`assessments`, same as before this fetch existed. */
const NO_REAL_DETAIL = {
  detail: (): Promise<ApplicationDetailResult> => Promise.resolve({ kind: 'unavailable' } as const),
};

/** @param permit a store-issued permit record, the authoritative "genuinely issued" signal. */
function mount(opts: { permit?: unknown; canApprove: boolean; paymentFinal: boolean; baseUrl?: string }) {
  const store = {
    getById: () => row(),
    getApplicant: () => undefined,
    getBusiness: () => undefined,
    getPermit: () => opts.permit,
    canApprove: () => opts.canApprove,
  };
  const assessments = {
    getActiveAssessment: () => undefined,
    canProcessPermit: () => opts.paymentFinal,
  };

  // Each mount is its own module: TestBed refuses to be reconfigured once
  // instantiated, so the combination test below would fail on its second pass.
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [Host],
    providers: [
      { provide: ApplicationStore, useValue: store },
      { provide: AssessmentStore, useValue: assessments },
      { provide: StaffApplicationsApi, useValue: NO_REAL_DETAIL },
      { provide: USER_PORTAL_BASE_URL, useValue: opts.baseUrl ?? '' },
    ],
  });
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

const BUDGET = 20_000;
const WATERMARK = 'SAMPLE — NOT AN OFFICIAL PERMIT';

describe('UserPortalPermitPreview — the watermark gate', () => {
  it('shows the same SAMPLE watermark whatever the approval/payment state — this system issues no real permits', () => {
    for (const canApprove of [true, false]) {
      for (const paymentFinal of [true, false]) {
        const text = mount({ canApprove, paymentFinal });
        expect(text).toContain(WATERMARK);
      }
    }
  }, BUDGET);

  it('shows the same SAMPLE watermark even once a real permit has genuinely been issued', () => {
    // A progression that got more confident as an application moved along —
    // the old DRAFT/FOR REVIEW/NOT VALID behavior — would misrepresent this
    // preview as becoming a real permit. It never does.
    const text = mount({ permit: { permitNumber: 'BP-2026-0001' }, canApprove: true, paymentFinal: true });
    expect(text).toContain(WATERMARK);
  }, BUDGET);

  it('says the permit has not been issued when there is no real permit record', () => {
    // The safety-critical branch now: a citizen must never be handed a
    // verification link for a permit that was never actually issued.
    const text = mount({ canApprove: true, paymentFinal: true, baseUrl: 'https://portal.castillasorsogon.gov.ph' });
    expect(text).toContain('QR verification not yet available — this permit has not been issued.');
    expect(text).not.toContain('/verify/');
  }, BUDGET);

  it('offers a real verification link once a real permit record exists and the User Portal address is configured', () => {
    const text = mount({
      permit: { permitNumber: 'BP-2026-0001' }, canApprove: true, paymentFinal: true,
      baseUrl: 'https://portal.castillasorsogon.gov.ph',
    });
    expect(text).toContain('https://portal.castillasorsogon.gov.ph/verify/BP-2026-0001');
  }, BUDGET);
});
