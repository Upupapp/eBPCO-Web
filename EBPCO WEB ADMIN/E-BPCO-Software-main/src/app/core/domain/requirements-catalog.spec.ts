import { ALL_PERMIT_TYPES, PermitType } from './permit.model';
import {
  REQUIREMENTS_CATALOG,
  assertCatalogComplete,
  requirementsFor,
} from './requirements-catalog';

// Types whose documentary requirements are built directly from a real,
// bundled Castilla/BFP Castilla form (CASTILLA_OFFICIAL_FORM_VERIFIED —
// see requirements-catalog.ts) rather than a national-law baseline, a
// same-format sample, or a pending placeholder. They carry honest sourcing
// that has nothing to do with Puerto Princesa's OCBO checklist (used only
// as a structural reference for the still-unverified building-code types)
// — they need their own assertions rather than being forced through the
// Puerto-Princesa-specific checks below.
const NEW_BFP_ZONING_TYPES: PermitType[] = [
  'Zoning / Locational Clearance',
  'FSEC for Building Permit (BFP)',
  'FSIC for Occupancy Permit (BFP)',
  'Building Permit – New Construction',
];
const PUERTO_PRINCESA_REFERENCED_TYPES = ALL_PERMIT_TYPES.filter(
  (t) => !NEW_BFP_ZONING_TYPES.includes(t),
);

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

  // Zoning/FSEC/FSIC/Building Permit – New Construction are the only 4
  // entries built directly from an actual Castilla/BFP Castilla form
  // obtained and reviewed in full (see requirements-catalog.ts's
  // CASTILLA_OFFICIAL_FORM_VERIFIED sources) — every other entry stays
  // unverified/pending until Castilla's own office confirms it directly.
  const CASTILLA_FORM_VERIFIED_TYPES: PermitType[] = NEW_BFP_ZONING_TYPES;
  const NOT_YET_CASTILLA_VERIFIED_TYPES = ALL_PERMIT_TYPES.filter(
    (t) => !CASTILLA_FORM_VERIFIED_TYPES.includes(t),
  );

  it('every entry without an actual Castilla/BFP form on hand is explicitly unverified (never fabricated as official)', () => {
    for (const type of NOT_YET_CASTILLA_VERIFIED_TYPES) {
      expect(requirementsFor(type).verified).toBe(false);
    }
  });

  it('Zoning, FSEC, FSIC, and Building Permit – New Construction are marked verified — built directly from the actual Castilla/BFP Castilla forms on hand', () => {
    for (const type of CASTILLA_FORM_VERIFIED_TYPES) {
      expect(requirementsFor(type).verified).toBe(true);
    }
  });

  it('every entry cites at least one real source with a URL and verification status', () => {
    for (const type of ALL_PERMIT_TYPES) {
      const sources = requirementsFor(type).sources;
      expect(sources.length).toBeGreaterThan(0);
      for (const src of sources) {
        // CASTILLA_OFFICIAL_FORM_VERIFIED sources point at the actual form
        // bundled under public/assets/permits/ rather than an external URL.
        if (src.verificationStatus === 'CASTILLA_OFFICIAL_FORM_VERIFIED') {
          expect(src.url).toMatch(/^\/assets\/permits\//);
        } else {
          expect(src.url).toMatch(/^https:\/\//);
        }
        expect([
          'NATIONAL_LAW_VERIFIED',
          'SAMPLE_REFERENCE_ONLY',
          'PENDING_CASTILLA_VERIFICATION',
          'CASTILLA_OFFICIAL_FORM_VERIFIED',
        ]).toContain(src.verificationStatus);
      }
    }
  });

  it('every entry without an actual Castilla/BFP form on hand carries a PENDING_CASTILLA_VERIFICATION source — the local checklist is never presented as confirmed', () => {
    for (const type of NOT_YET_CASTILLA_VERIFIED_TYPES) {
      const sources = requirementsFor(type).sources;
      expect(sources.some((s) => s.verificationStatus === 'PENDING_CASTILLA_VERIFICATION')).toBe(
        true,
      );
    }
  });

  it('Zoning, FSEC, FSIC, and Building Permit – New Construction each carry a CASTILLA_OFFICIAL_FORM_VERIFIED source instead — the gap is closed, not just pending', () => {
    for (const type of CASTILLA_FORM_VERIFIED_TYPES) {
      const sources = requirementsFor(type).sources;
      expect(sources.some((s) => s.verificationStatus === 'CASTILLA_OFFICIAL_FORM_VERIFIED')).toBe(
        true,
      );
    }
  });

  it('no construction/building-code entry ever cites a source claiming to BE an official Castilla document', () => {
    for (const type of PUERTO_PRINCESA_REFERENCED_TYPES) {
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

  it('FSEC and FSIC (BFP-issued) never cite a source claiming to BE an official Castilla document', () => {
    for (const type of ['FSEC for Building Permit (BFP)', 'FSIC for Occupancy Permit (BFP)'] as PermitType[]) {
      const sources = requirementsFor(type).sources;
      const sampleSources = sources.filter((s) => s.verificationStatus === 'SAMPLE_REFERENCE_ONLY');
      expect(sampleSources.length).toBeGreaterThan(0);
      for (const s of sampleSources) {
        expect(s.jurisdiction.toLowerCase()).toContain('bureau of fire protection');
        expect(s.jurisdiction.toLowerCase()).toContain('not the municipality of castilla');
      }
    }
  });

  it('Zoning / Locational Clearance cites no fabricated sample source — only the honest pending-Castilla citation', () => {
    // Unlike the other 18 types, no verifiable non-Castilla reference
    // document was available during research for this type, so it
    // deliberately carries zero SAMPLE_REFERENCE_ONLY sources rather than
    // inventing one — see requirements-catalog.ts's module notice.
    const sources = requirementsFor('Zoning / Locational Clearance').sources;
    expect(sources.filter((s) => s.verificationStatus === 'SAMPLE_REFERENCE_ONLY').length).toBe(0);
  });
});

describe('Requirements catalog — Building Permit – Renovation / Alteration (mandatory sample type)', () => {
  it('has a real, non-generic required form and final document', () => {
    const renovation = requirementsFor('Building Permit – Renovation / Alteration');
    expect(renovation.requiredForm.toLowerCase()).toContain('renovation');
    expect(renovation.finalDocument.toLowerCase()).toContain('permit');
    expect(renovation.validityMonths).toBeGreaterThan(0);
  });
});
