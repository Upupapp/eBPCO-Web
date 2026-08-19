import { ALL_PERMIT_TYPES } from './permit.model';
import { requirementsFor } from './requirements-catalog';
import {
  DEPARTMENTS,
  departmentById,
  departmentName,
  departmentsForStage,
} from './department.model';
import { EVALUATION_STAGE_ORDER } from './status.model';

describe('Department registry — internal consistency', () => {
  it('has no duplicate department ids', () => {
    const ids = DEPARTMENTS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has no duplicate department names (consistent naming everywhere)', () => {
    const names = DEPARTMENTS.map((d) => d.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('every department is explicitly marked unverified sample data', () => {
    for (const d of DEPARTMENTS) expect(d.verified).toBe(false);
  });

  it('departmentById resolves every registered id, and returns undefined for an unknown one', () => {
    for (const d of DEPARTMENTS) expect(departmentById(d.id)?.name).toBe(d.name);
    expect(departmentById('not-a-real-department-id')).toBeUndefined();
  });

  it('departmentName falls back to the raw id for an unknown id, rather than throwing', () => {
    expect(departmentName('unknown-id')).toBe('unknown-id');
  });

  it('every evaluation stage has at least one department that owns it', () => {
    for (const stage of EVALUATION_STAGE_ORDER) {
      expect(departmentsForStage(stage).length).toBeGreaterThan(0);
    }
  });
});

describe('Department registry — routing agrees with the requirements catalog', () => {
  it("every departmentId referenced by every permit type's evaluation sequence and documents resolves to a real department", () => {
    for (const type of ALL_PERMIT_TYPES) {
      const req = requirementsFor(type);
      for (const step of req.evaluationSequence) {
        expect(departmentById(step.departmentId)).toBeTruthy();
      }
      for (const doc of req.documents) {
        expect(departmentById(doc.reviewingDepartmentId)).toBeTruthy();
      }
      expect(departmentById(req.responsibleDepartmentId)).toBeTruthy();
    }
  });
});
