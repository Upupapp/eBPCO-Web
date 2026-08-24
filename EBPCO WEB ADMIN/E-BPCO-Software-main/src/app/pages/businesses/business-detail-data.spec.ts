import { ApplicationRecord, withProjectedFields } from '../../core/domain/application.model';
import { buildBusinessDetail } from './business-detail-data';

function makeRow(
  overrides: Partial<{
    id: string;
    code: string;
    contactName: string;
    dateCreated: string;
    userCount: number;
  }> = {},
) {
  return {
    id: 'BIZ-001',
    code: 'REG-2026-000001',
    contactName: 'Raul Villanueva',
    dateCreated: '01 Jan 2026',
    userCount: 3,
    ...overrides,
  };
}

function makeApp(overrides: Partial<ApplicationRecord> = {}): ApplicationRecord {
  const base = {
    id: 'E-BPCO-2026-000001',
    businessId: 'BIZ-001',
    businessName: 'Villanueva Hardware',
    applicantId: 'APL-001',
    applicant: 'Raul Villanueva',
    location: 'Barangay Poblacion',
    permitType: 'Building Permit – New Construction' as const,
    applicationAction: 'New' as const,
    officer: 'Engr. Tester',
    dateSubmitted: '01 Jan 2026',
    dateValue: new Date('2026-01-01'),
    lifecycleStatus: 'Completed' as const,
    evaluationStage: 'Final Approval' as const,
    evaluationResult: 'Passed' as const,
    paymentStatus: 'Paid' as const,
    permitReleaseStatus: 'Released' as const,
    assessedAmountCentavos: 100000,
    ...overrides,
  };
  return withProjectedFields(base);
}

describe('buildBusinessDetail — linked permits come only from the passed-in real applications', () => {
  it('returns an empty permits list (never a random count) when no applications are linked', () => {
    const detail = buildBusinessDetail(makeRow(), []);
    expect(detail.permits).toEqual([]);
    expect(detail.metrics.totalApplications).toBe(0);
    expect(detail.metrics.approvedPermits).toBe(0);
  });

  it('maps each linked application 1:1 to a LinkedPermit, keeping applicationId and permitNumber separate', () => {
    const app = makeApp({ id: 'E-BPCO-2026-000042', lifecycleStatus: 'Completed' as const });
    const detail = buildBusinessDetail(makeRow(), [
      { application: app, permitNumber: 'PN-2026-000042' },
    ]);
    expect(detail.permits).toHaveLength(1);
    const [permit] = detail.permits;
    expect(permit.applicationId).toBe('E-BPCO-2026-000042');
    expect(permit.permitNumber).toBe('PN-2026-000042');
    expect(permit.type).toBe(app.permitType);
    expect(permit.status).toBe(app.status);
  });

  it('keeps permitNumber null when no permit has actually been generated yet — never fabricated', () => {
    const app = makeApp({ id: 'E-BPCO-2026-000043' });
    const detail = buildBusinessDetail(makeRow(), [{ application: app, permitNumber: null }]);
    expect(detail.permits[0].permitNumber).toBeNull();
  });

  it('permit count and approved count exactly match the passed-in applications — never a seeded-random 3-6 range', () => {
    const apps = [
      makeApp({ id: 'A-1', lifecycleStatus: 'Completed' as const }),
      makeApp({ id: 'A-2', lifecycleStatus: 'Under Evaluation' as const }),
      makeApp({ id: 'A-3', lifecycleStatus: 'Approved' as const }),
    ];
    const detail = buildBusinessDetail(
      makeRow(),
      apps.map((application) => ({ application, permitNumber: null })),
    );
    expect(detail.metrics.totalApplications).toBe(3);
    expect(detail.metrics.approvedPermits).toBe(2);
    expect(detail.permits.map((p) => p.applicationId).sort()).toEqual(['A-1', 'A-2', 'A-3']);
  });

  it('is deterministic — calling it twice with the same input produces the same permit list', () => {
    const apps = [makeApp({ id: 'A-1' }), makeApp({ id: 'A-2' })];
    const linked = apps.map((application) => ({ application, permitNumber: null }));
    const first = buildBusinessDetail(makeRow(), linked);
    const second = buildBusinessDetail(makeRow(), linked);
    expect(first.permits).toEqual(second.permits);
  });
});
