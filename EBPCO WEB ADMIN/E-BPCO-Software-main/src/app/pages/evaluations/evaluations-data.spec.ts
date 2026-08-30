import { ApplicationRecord, withProjectedFields } from '../../core/domain/application.model';
import { buildEvalRows, buildEvalTypeCards } from './evaluations-data';

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
    lifecycleStatus: 'Under Evaluation' as const,
    evaluationStage: 'Initial' as const,
    evaluationResult: 'Pending' as const,
    paymentStatus: 'Not Yet Available' as const,
    permitReleaseStatus: 'Not Ready' as const,
    assessedAmountCentavos: null,
    ...overrides,
  };
  return withProjectedFields(base);
}

describe('buildEvalRows — business/project context is preserved unchanged', () => {
  it('copies businessId and businessName straight off the source application, unmodified', () => {
    const app = makeApp({
      businessId: 'BIZ-042',
      businessName: 'Fajota Bakeshop',
      applicant: 'Grace Fajota',
    });
    const [row] = buildEvalRows([app], 'initial');
    expect(row.businessId).toBe('BIZ-042');
    expect(row.businessName).toBe('Fajota Bakeshop');
    expect(row.businessName).not.toBe(row.applicant);
  });

  it('never substitutes the applicant name for a missing/empty business name', () => {
    const app = makeApp({ businessId: '', businessName: '', applicant: 'Grace Fajota' });
    const [row] = buildEvalRows([app], 'initial');
    expect(row.businessName).toBe('');
    expect(row.businessName).not.toBe('Grace Fajota');
  });

  it('two applications from the same applicant but different businesses keep distinct business fields', () => {
    const appOne = makeApp({
      id: 'E-BPCO-2026-000010',
      businessId: 'BIZ-010',
      businessName: 'Villanueva Hardware',
      applicant: 'Raul Villanueva',
    });
    const appTwo = makeApp({
      id: 'E-BPCO-2026-000011',
      businessId: 'BIZ-011',
      businessName: 'Villanueva Auto Parts',
      applicant: 'Raul Villanueva',
    });
    const rows = buildEvalRows([appOne, appTwo], 'initial');
    expect(rows).toHaveLength(2);
    expect(rows[0].businessId).not.toBe(rows[1].businessId);
    expect(rows[0].businessName).not.toBe(rows[1].businessName);
  });

  it('only includes applications whose evaluationStage matches the requested stage key', () => {
    const initialApp = makeApp({ id: 'E-BPCO-2026-000020', evaluationStage: 'Initial' });
    const zoningApp = makeApp({ id: 'E-BPCO-2026-000021', evaluationStage: 'Zoning' });
    const rows = buildEvalRows([initialApp, zoningApp], 'initial');
    expect(rows.map((r) => r.id)).toEqual(['E-BPCO-2026-000020']);
  });
});


/**
 * Rows whose evaluation stage the server never sent.
 *
 * The staff queue carries no stage, and the mapper used to stamp every server
 * row `'Initial'`. `buildEvalTypeCards` therefore counted them all under Initial
 * Evaluation and `scopedApps` never placed one in a later stage's queue — an
 * officer opening Final Approval saw it empty with applications sitting in it.
 * Owner ruling, 29 Aug: give them their own bucket rather than a claim.
 */
describe('evaluations-data — applications with no recorded stage', () => {
  const unknown = makeApp({ id: 'SRV-1', evaluationStage: null, evaluationResult: null });
  const initial = makeApp({ id: 'SEED-1', evaluationStage: 'Initial' });

  it('counts them under "Stage not recorded", never under Initial', () => {
    const cards = buildEvalTypeCards([unknown, initial]);
    const by = (key: string) => cards.find((c) => c.key === key)!;

    expect(by('unrecorded').count).toBe(1);
    // The whole defect: this used to be 2.
    expect(by('initial').count).toBe(1);
    expect(by('unrecorded').title).toBe('Stage not recorded');
  });

  it('keeps them out of every real stage queue', () => {
    for (const key of ['initial', 'zoning', 'fire', 'obo', 'final'] as const) {
      const ids = buildEvalRows([unknown], key).map((r) => r.id);
      expect(ids).not.toContain('SRV-1');
    }
    expect(buildEvalRows([unknown], 'unrecorded').map((r) => r.id)).toEqual(['SRV-1']);
  });

  it('never marks an unknown stage as the current one', () => {
    // `null === null` would be true and would offer Passed / Return for Revision
    // on a row whose stage nobody knows.
    const [row] = buildEvalRows([unknown], 'unrecorded');
    expect(row.isCurrentStage).toBe(false);
  });
});
