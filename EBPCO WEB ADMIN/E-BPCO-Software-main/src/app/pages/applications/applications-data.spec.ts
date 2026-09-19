import { ApplicationRecord, withProjectedFields } from '../../core/domain/application.model';
import { Applicant, unverifiedContact } from '../../core/domain/applicant.model';
import { buildDetailFor } from './applications-data';

/**
 * Guards: an applicant's own address must never be guessed from the
 * construction site's barangay.
 *
 * `barangay` used to fall back to `row.location.replace(/^Barangay\s+/i, '')`
 * whenever the local mock `Applicant` record did not resolve — which is
 * every real, server-created application, since `applicant` only ever
 * matches the frontend's own seed data. The site an applicant is building
 * on is not where they live; the two only coincidentally shared a barangay
 * for anyone who lived where they were also building.
 */
const row = (over: Partial<ApplicationRecord> = {}): ApplicationRecord =>
  withProjectedFields({
    id: 'APP-1',
    businessId: 'BIZ-1',
    businessName: 'Villanueva Hardware',
    applicantId: 'APL-1',
    applicant: 'Raul Villanueva',
    location: 'Barangay Poblacion',
    permitType: 'Fencing Permit',
    applicationAction: 'New',
    officer: 'Engr. Tester',
    dateSubmitted: '2026-08-01',
    dateValue: new Date('2026-08-01T00:00:00.000Z'),
    lifecycleStatus: 'Submitted',
    evaluationStage: null,
    evaluationResult: null,
    ...over,
  } as ApplicationRecord);

describe('buildDetailFor: the applicant\'s real address, not a guess from the site', () => {
  it('uses the real applicantAddress.barangay when the backend has one on file', () => {
    const detail = buildDetailFor(
      row({ location: 'Barangay Poblacion' }),
      undefined,
      undefined,
      undefined,
      { barangay: 'Mayon' },
    );

    expect(detail.barangay).toBe('Mayon');
  });

  it('says "Not on file" rather than guessing from the construction site\'s barangay', () => {
    // A real, server-created application: no local mock Applicant record
    // resolves, and the backend has nothing on file for this citizen yet.
    const detail = buildDetailFor(
      row({ location: 'Barangay Poblacion' }),
      undefined,
      undefined,
      undefined,
      { barangay: null },
    );

    expect(detail.barangay).not.toBe('Poblacion');
    expect(detail.barangay).toBe('Not on file');
  });

  it('still falls back to the local mock record when no real address was fetched at all', () => {
    const mockApplicant: Applicant = {
      id: 'APL-1', firstName: 'Raul', lastName: 'Villanueva',
      email: 'raul@example.ph', mobileNumber: '09171234567', landlineNumber: null,
      applicantType: null, addressLine: '', barangay: 'Salvacion',
      emailVerification: unverifiedContact(), mobileVerification: unverifiedContact(),
    };
    const detail = buildDetailFor(
      row({ location: 'Barangay Poblacion' }),
      mockApplicant,
      undefined,
      undefined,
      undefined,
    );

    expect(detail.barangay).toBe('Salvacion');
  });
});
