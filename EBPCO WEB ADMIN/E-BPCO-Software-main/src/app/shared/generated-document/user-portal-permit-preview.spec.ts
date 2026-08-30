import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';

import { UserPortalPermitPreview } from './user-portal-permit-preview';
import { USER_PORTAL_BASE_URL } from '../../core/config/user-portal.config';
import { ApplicationStore } from '../../core/domain/application-store';

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
