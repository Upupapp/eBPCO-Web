import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { StaffApplicationsApi } from './staff-applications.api';
import { API_BASE_URL } from './api.config';
import { ALL_PERMIT_TYPES } from '../domain/permit.model';

/**
 * The twentieth permit type.
 *
 * D-10 made the office's published name the server's key, so `permitTypeName`
 * now always equals `permitType` and the translation table is gone. One value
 * survives outside the office's nineteen: `Business Permit`, which the legacy
 * flow still files against and the server still sends.
 *
 * The nineteen are asserted in `permit.model.spec.ts` and used by the
 * cross-repo parity gate, so the union cannot simply absorb a twentieth. Before
 * this, such rows had `permitType: null` and rendered **"Not recorded"** —
 * false, because the type WAS recorded and the portal merely does not publish
 * that name.
 */
function row(permitType: string) {
  return {
    id: 'APP-1',
    referenceNumber: 'BP-2026-0001',
    permitType,
    permitTypeName: permitType,
    applicationAction: 'New',
    lifecycleStatus: 'Submitted',
    businessName: 'Villanueva Hardware',
    applicantName: 'Raul Villanueva',
    location: 'Barangay Poblacion',
    submittedAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
    assessedAmountCentavos: null,
    paymentVerified: false,
  };
}

async function fetchOne(permitType: string) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: API_BASE_URL, useValue: '' },
    ],
  });
  const api = TestBed.inject(StaffApplicationsApi);
  const pending = api.page({ limit: 10 });
  TestBed.inject(HttpTestingController)
    .expectOne((r) => r.url === '/staff/applications')
    .flush({ items: [row(permitType)], nextCursor: null });
  return (await pending).rows[0];
}

describe('A permit type the office does not publish', () => {
  it('keeps the office vocabulary at nineteen', () => {
    // Asserted here too, because this file is the reason somebody would be
    // tempted to add a twentieth.
    expect(ALL_PERMIT_TYPES.length).toBe(19);
    expect(ALL_PERMIT_TYPES).not.toContain('Business Permit');
  });

  it('says what was filed instead of "Not recorded"', async () => {
    const record = await fetchOne('Business Permit');

    // Two questions, two answers. Is it one of ours? No. What was filed?
    // Business Permit. Both are true and the portal can now say both.
    expect(record.permitType).toBeNull();
    expect(record.filedAs).toBe('Business Permit');
  });

  it('carries the published name in both fields for the office\'s own permits', async () => {
    const record = await fetchOne('Fencing Permit');

    expect(record.permitType).toBe('Fencing Permit');
    expect(record.filedAs).toBe('Fencing Permit');
  });

  it('leaves both null when the server names nothing it recognises', async () => {
    const record = await fetchOne('Sorcery Permit');

    // Invented values are still refused. `filedAs` reports what the server
    // said; it does not make an unknown type into a known one.
    expect(record.permitType).toBeNull();
    expect(record.filedAs).toBe('Sorcery Permit');
  });
});
