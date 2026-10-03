import { officialReceiptProblem } from './official-receipt';
import { stageForApplication } from './requirements-catalog';
import { displayReference } from './draft-reference';
import { auditActorLabel } from '../api/audit.api';

/** The admin portal's side of the QA run of 2026-10-03. */
describe('QA findings, 2026-10-03', () => {
  describe('TC-01: the stage that checks a document', () => {
    const doc = (id: string, label: string) => ({ id, label, required: true, reviewingDepartmentId: 'obo' });

    it('reads the application\'s own checklist first', () => {
      const checklist = [{ code: 'bpnc-oct-tct', label: 'Certified True Copy of OCT/TCT', stage: 'Initial' }];
      expect(stageForApplication(doc('bpnc-oct-tct', 'Certified True Copy of OCT/TCT'), checklist)).toBe('Initial');
    });

    it('matches by label when the code differs', () => {
      const checklist = [{ code: 'x-1', label: 'Unified Application Form', stage: 'Initial' }];
      expect(stageForApplication(doc('other-code', 'Unified Application Form'), checklist)).toBe('Initial');
    });

    it('without a checklist, still files the title and the unified form under Initial', () => {
      expect(stageForApplication(doc('bpnc-oct-tct', 'OCT/TCT'), undefined)).toBe('Initial');
      expect(stageForApplication(doc('bpnc-unified-form', 'Unified Application Form'), null)).toBe('Initial');
      expect(stageForApplication(doc('bpnc-structural-plans', 'Structural Plans'), null)).toBe('OBO');
    });
  });

  describe('TC-02: who did it', () => {
    it('names the officer and their position', () => {
      expect(auditActorLabel({ actorName: 'Ana Cruz', actorPosition: 'Initial Evaluator', actorRole: 'staff' }))
        .toBe('Ana Cruz (Initial Evaluator)');
      expect(auditActorLabel({ actorName: null, actorPosition: null, actorRole: null })).toBe('System');
    });
  });

  describe('TC-03 / TC-08: the Official Receipt number', () => {
    it('asks for the number, not for "a reason", when it is empty', () => {
      expect(officialReceiptProblem('  ')).toContain('Enter the Official Receipt number');
    });

    it('refuses what cannot be a receipt number', () => {
      expect(officialReceiptProblem('abc')).toContain('at least 4 digits');
      expect(officialReceiptProblem('#OR-1234')).not.toBeNull();
    });

    it('accepts a printed receipt number', () => {
      expect(officialReceiptProblem('OR-2026-000101')).toBeNull();
      expect(officialReceiptProblem('8812345')).toBeNull();
    });
  });

  it('TC-37: a walk-in draft has no number to quote yet', () => {
    expect(displayReference('DRAFT-0A1B2C3D4E')).toBe('Draft (no number yet)');
    expect(displayReference('E-BPCO-2026-000003')).toBe('E-BPCO-2026-000003');
  });
});
