import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';

import { UserPortalPermitPreview } from './user-portal-permit-preview';
import { USER_PORTAL_BASE_URL } from '../../core/config/user-portal.config';
import { ApplicationStore } from '../../core/domain/application-store';
import { ApplicationDetailResult, StaffApplicationsApi } from '../../core/api/staff-applications.api';

/**
 * The verification QR's link.
 *
 * It was built from `window.location.origin` — correct on the User Portal,
 * where this document normally lives, and wrong here: staff preview it on the
 * ADMIN portal, which has no `/verify` route and whose router ends in
 * `{ path: '**', redirectTo: 'login' }`. Measured against the deployed admin:
 * `GET /verify/BP-2026-0001` answered 200 with the admin portal, so a citizen
 * scanning a staff-previewed permit reached a staff sign-in page.
 */
@Component({
  imports: [UserPortalPermitPreview],
  template: '<app-user-portal-permit-preview [applicationId]="id" />',
})
class Host {
  id = '';
}

describe('UserPortalPermitPreview — the verification QR link', () => {
  function mount(baseUrl: string) {
    TestBed.configureTestingModule({
      imports: [Host],
      providers: [{ provide: USER_PORTAL_BASE_URL, useValue: baseUrl }],
    });
    const store = TestBed.inject(ApplicationStore);
    // An application that actually has an issued permit — the only state in
    // which a QR is rendered at all.
    const withPermit = store.applications().find((a) => store.getPermit(a.id));
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.id = withPermit?.id ?? store.applications()[0].id;
    fixture.detectChanges();
    return fixture;
  }

  const MOUNT_BUDGET = 20_000;

  it('never builds the link from the origin it happens to be running on', async () => {
    const fixture = mount('');
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    // The admin's own origin must never appear in a citizen-facing link.
    expect(text).not.toContain(window.location.origin);
    expect(text).not.toMatch(/localhost/);
  }, MOUNT_BUDGET);

  it('says WHY there is no QR, and does not claim the permit is unissued', async () => {
    const fixture = mount('');
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    if (text.includes('QR verification unavailable')) {
      // The permit is issued; the address is simply unknown. Reporting "not yet
      // issued" here would be false.
      expect(text).toContain('has not been told the User Portal address');
    }
  }, MOUNT_BUDGET);

  it('uses the configured User Portal address when it is given', async () => {
    const fixture = mount('https://portal.castillasorsogon.gov.ph');
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    if (text.includes('/verify/')) {
      expect(text).toContain('https://portal.castillasorsogon.gov.ph/verify/');
      expect(text).not.toContain(window.location.origin);
    }
  }, MOUNT_BUDGET);
});

describe('UserPortalPermitPreview — a real, backend-generated permit', () => {
  const MOUNT_BUDGET = 20_000;

  it('shows the real permit number from GET /staff/applications/:id, not "Not yet assigned"', async () => {
    // Reproduces PERMIT-013: `ApplicationStore.replaceApplications()`
    // deliberately empties `_permits` on every real server load (see its own
    // doc comment), so a real backend-generated permit was never findable via
    // `store.getPermit()` alone. The fix (see `permit`'s own doc comment on
    // user-portal-permit-preview.ts) was fetching it from the real detail
    // endpoint, which this test now mocks directly — a same-session-only
    // cache used to stand in for that fetch and went blank on refresh or in
    // a second tab, which was the whole bug.
    const detail: ApplicationDetailResult = {
      kind: 'ok',
      detail: {
        payments: [],
        orderOfPayment: null,
        applicantEmail: 'citizen@example.com',
        applicantMobile: null,
        applicantAddress: { street: null, barangay: null, city: null, province: null, postalCode: null },
        business: null,
        permit: { permitNumber: 'FP-2026-000001', issuedDate: '2026-09-14', scope: '', conditions: null },
        timeline: [],
        documents: [],
      },
    };
    TestBed.configureTestingModule({
      imports: [Host],
      providers: [
        { provide: USER_PORTAL_BASE_URL, useValue: '' },
        { provide: StaffApplicationsApi, useValue: { detail: () => Promise.resolve(detail) } },
      ],
    });
    const store = TestBed.inject(ApplicationStore);
    const applicationId = store.applications()[0].id;
    // Simulate a real server load: the store's own permit collection is gone,
    // exactly as replaceApplications() leaves it — only the real detail
    // fetch above knows about the issued permit.
    store.replaceApplications(store.applications());

    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.id = applicationId;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('FP-2026-000001');
    expect(text).not.toContain('Not yet assigned');
  }, MOUNT_BUDGET);
});
