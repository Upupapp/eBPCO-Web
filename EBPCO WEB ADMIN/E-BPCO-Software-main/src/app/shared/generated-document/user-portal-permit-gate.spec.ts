import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';

import { UserPortalPermitPreview } from './user-portal-permit-preview';
import { USER_PORTAL_BASE_URL } from '../../core/config/user-portal.config';
import { ApplicationStore } from '../../core/domain/application-store';
import { AssessmentStore } from '../../core/domain/assessment-store';
import { ApplicationRecord, withProjectedFields } from '../../core/domain/application.model';

/**
 * The watermark gate.
 *
 * This is the control that decides whether a generated document declares itself
 * `NOT VALID AS AN OFFICIAL PERMIT`. It arrived with the feature and with no
 * test, which made it the least-covered safety-critical thing in the portal: a
 * wrong branch here either brands a genuine permit as invalid, or — far worse —
 * lets a document that is not a permit print without saying so.
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

/** @param permit a store-issued permit record, the authoritative "genuinely issued" signal. */
function mount(opts: { permit?: unknown; canApprove: boolean; paymentFinal: boolean }) {
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
      { provide: USER_PORTAL_BASE_URL, useValue: '' },
    ],
  });
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

const BUDGET = 20_000;

describe('UserPortalPermitPreview — the watermark gate', () => {
  it('an issued permit carries NO watermark', () => {
    // A real store-issued permit record is the authoritative signal. Watermarking
    // a genuine permit would make staff doubt a valid document.
    const text = mount({ permit: { permitNumber: 'BP-2026-0001' }, canApprove: true, paymentFinal: true });
    expect(text).not.toContain('DRAFT');
    expect(text).not.toContain('FOR REVIEW');
    expect(text).not.toContain('NOT VALID AS AN OFFICIAL PERMIT');
  }, BUDGET);

  it('says DRAFT when the application cannot even be approved', () => {
    const text = mount({ canApprove: false, paymentFinal: false });
    expect(text).toContain('DRAFT');
  }, BUDGET);

  it('says FOR REVIEW when approvable but payment is not final', () => {
    const text = mount({ canApprove: true, paymentFinal: false });
    expect(text).toContain('FOR REVIEW');
    expect(text).not.toContain('NOT VALID AS AN OFFICIAL PERMIT');
  }, BUDGET);

  it('says NOT VALID AS AN OFFICIAL PERMIT when everything passes but no permit was issued', () => {
    // The most dangerous state: it looks complete, and is not a permit. If this
    // branch ever fell through to no watermark, a document that is not a permit
    // would print as though it were one.
    const text = mount({ canApprove: true, paymentFinal: true });
    expect(text).toContain('NOT VALID AS AN OFFICIAL PERMIT');
  }, BUDGET);

  it('never leaves an unissued document unmarked, whatever the combination', () => {
    for (const canApprove of [true, false]) {
      for (const paymentFinal of [true, false]) {
        const text = mount({ canApprove, paymentFinal });
        const marked =
          text.includes('DRAFT') ||
          text.includes('FOR REVIEW') ||
          text.includes('NOT VALID AS AN OFFICIAL PERMIT');
        expect(marked).toBe(true);
      }
    }
  }, BUDGET);
});
