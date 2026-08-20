import { ALL_PERMIT_TYPES } from './permit.model';
import {
  REQUIREMENTS_CATALOG,
  assertCatalogComplete,
  requirementsFor,
} from './requirements-catalog';

describe('Requirements catalog — completeness', () => {
  // This is the test that fails loudly if a new PermitType is introduced
  // (in permit.model.ts) without a matching requirements-catalog entry —
  // the exact "fail if unsupported permit types are introduced" guard the
  // spec asks for. Do not special-case a new type here; add it to
  // REQUIREMENTS_CATALOG instead.
  it('assertCatalogComplete does not throw — every permit type has an entry', () => {
    expect(() => assertCatalogComplete()).not.toThrow();
  });

  it('has exactly one entry per centralized permit type, no extras', () => {
    const catalogKeys = Object.keys(REQUIREMENTS_CATALOG);
    expect(catalogKeys.sort()).toEqual([...ALL_PERMIT_TYPES].sort());
  });

  it('requirementsFor never falls through to undefined for a real type', () => {
    for (const type of ALL_PERMIT_TYPES) {
      expect(requirementsFor(type)).toBeTruthy();
      expect(requirementsFor(type).permitType).toBe(type);
    }
  });
});

describe('Requirements catalog — per-entry shape', () => {
  it('every entry has at least one required document', () => {
    for (const type of ALL_PERMIT_TYPES) {
      const entry = requirementsFor(type);
      expect(entry.documents.some((d) => d.required)).toBe(true);
    }
  });

  it('every document requirement has a unique id within its entry', () => {
    for (const type of ALL_PERMIT_TYPES) {
      const ids = requirementsFor(type).documents.map((d) => d.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('every entry has a non-empty evaluation sequence with a department per step', () => {
    for (const type of ALL_PERMIT_TYPES) {
      const seq = requirementsFor(type).evaluationSequence;
      expect(seq.length).toBeGreaterThan(0);
      for (const step of seq) expect(step.departmentId.length).toBeGreaterThan(0);
    }
  });

  it('every entry is explicitly unverified until Castilla confirms it (never fabricated as official)', () => {
    for (const type of ALL_PERMIT_TYPES) {
      expect(requirementsFor(type).verified).toBe(false);
    }
  });

  it('every entry cites at least one real source with a URL and verification status', () => {
    for (const type of ALL_PERMIT_TYPES) {
      const sources = requirementsFor(type).sources;
      expect(sources.length).toBeGreaterThan(0);
      for (const src of sources) {
        expect(src.url).toMatch(/^https:\/\//);
        expect([
          'NATIONAL_LAW_VERIFIED',
          'SAMPLE_REFERENCE_ONLY',
          'PENDING_CASTILLA_VERIFICATION',
        ]).toContain(src.verificationStatus);
      }
    }
  });

  it('every entry carries a PENDING_CASTILLA_VERIFICATION source — the local checklist is never presented as confirmed', () => {
    for (const type of ALL_PERMIT_TYPES) {
      const sources = requirementsFor(type).sources;
      expect(sources.some((s) => s.verificationStatus === 'PENDING_CASTILLA_VERIFICATION')).toBe(
        true,
      );
    }
  });

  it('no entry ever cites a source claiming to BE an official Castilla document', () => {
    for (const type of ALL_PERMIT_TYPES) {
      const sources = requirementsFor(type).sources;
      // The one non-national, non-pending source used for construction
      // types is Puerto Princesa's own document — must be explicitly
      // marked SAMPLE_REFERENCE_ONLY, name its real (non-Castilla)
      // jurisdiction, and explicitly disclaim being Castilla's.
      const sampleSources = sources.filter((s) => s.verificationStatus === 'SAMPLE_REFERENCE_ONLY');
      expect(sampleSources.length).toBeGreaterThan(0);
      for (const s of sampleSources) {
        expect(s.jurisdiction.toLowerCase()).toContain('puerto princesa');
        expect(s.jurisdiction.toLowerCase()).toContain('not the municipality of castilla');
      }
    }
  });
});

describe('Requirements catalog — Renovation Permit (mandatory sample type)', () => {
  it('has a real, non-generic required form and final document', () => {
    const renovation = requirementsFor('Renovation Permit');
    expect(renovation.requiredForm.toLowerCase()).toContain('renovation');
    expect(renovation.finalDocument.toLowerCase()).toContain('permit');
    expect(renovation.validityMonths).toBeGreaterThan(0);
  });
});
