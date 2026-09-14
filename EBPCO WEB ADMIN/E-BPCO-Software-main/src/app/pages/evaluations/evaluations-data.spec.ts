import { EvaluationDecision, EvaluationQueueRow } from '../../core/api/staff-evaluations.api';
import { buildEvalRows, buildEvalTypeCards } from './evaluations-data';

function makeRow(overrides: Partial<EvaluationQueueRow> = {}): EvaluationQueueRow {
  return {
    applicationId: 'E-BPCO-2026-000001',
    referenceNumber: 'E-BPCO-2026-000001',
    permitType: 'Building Permit – New Construction',
    lifecycleStatus: 'Under Evaluation',
    applicantName: 'Raul Villanueva',
    businessId: 'BIZ-001',
    businessName: 'Villanueva Hardware',
    submittedAt: '2026-01-01T00:00:00.000Z',
    evaluations: [] as readonly EvaluationDecision[],
    nextStage: 'Initial',
    requiredDocumentCount: 0,
    attachedDocumentCount: 0,
    ...overrides,
  };
}

describe('buildEvalRows — business/project context is preserved unchanged', () => {
  it('copies businessId and businessName straight off the source application, unmodified', () => {
    const row = makeRow({
      businessId: 'BIZ-042',
      businessName: 'Fajota Bakeshop',
      applicantName: 'Grace Fajota',
    });
    const [result] = buildEvalRows([row], 'initial');
    expect(result.businessId).toBe('BIZ-042');
    expect(result.businessName).toBe('Fajota Bakeshop');
    expect(result.businessName).not.toBe(result.applicant);
  });

  it('never substitutes the applicant name for a missing/empty business name', () => {
    const row = makeRow({ businessId: '', businessName: '', applicantName: 'Grace Fajota' });
    const [result] = buildEvalRows([row], 'initial');
    expect(result.businessName).toBe('');
    expect(result.businessName).not.toBe('Grace Fajota');
  });

  it('two applications from the same applicant but different businesses keep distinct business fields', () => {
    const rowOne = makeRow({
      applicationId: 'E-BPCO-2026-000010',
      businessId: 'BIZ-010',
      businessName: 'Villanueva Hardware',
      applicantName: 'Raul Villanueva',
    });
    const rowTwo = makeRow({
      applicationId: 'E-BPCO-2026-000011',
      businessId: 'BIZ-011',
      businessName: 'Villanueva Auto Parts',
      applicantName: 'Raul Villanueva',
    });
    const results = buildEvalRows([rowOne, rowTwo], 'initial');
    expect(results).toHaveLength(2);
    expect(results[0].businessId).not.toBe(results[1].businessId);
    expect(results[0].businessName).not.toBe(results[1].businessName);
  });

  it('only includes applications whose next stage matches the requested stage key', () => {
    const initialRow = makeRow({ applicationId: 'E-BPCO-2026-000020', nextStage: 'Initial' });
    const zoningRow = makeRow({ applicationId: 'E-BPCO-2026-000021', nextStage: 'Zoning' });
    const results = buildEvalRows([initialRow, zoningRow], 'initial');
    expect(results.map((r) => r.id)).toEqual(['E-BPCO-2026-000020']);
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
  const unknown = makeRow({ applicationId: 'SRV-1', nextStage: null, evaluations: [] });
  const initial = makeRow({ applicationId: 'SEED-1', nextStage: 'Initial' });

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
