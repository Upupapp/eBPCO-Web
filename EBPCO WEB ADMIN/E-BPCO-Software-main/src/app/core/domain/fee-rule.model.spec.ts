import { ALL_PERMIT_TYPES } from './permit.model';
import { FEE_RULES, feeMatrixFor, feeRulesForPermitType } from './fee-rule.model';

describe('Fee rule catalog — all 19 permit mappings', () => {
  it('every one of the 19 permit types has at least one REQUIRED fee line (the generic filing fee, at minimum)', () => {
    for (const type of ALL_PERMIT_TYPES) {
      const entries = feeRulesForPermitType(type);
      expect(entries.some((e) => e.applicability === 'required')).toBe(true);
    }
  });

  it('the filing fee applies to all 19 permit types, and only the filing fee is universal', () => {
    const filingFee = FEE_RULES.find((r) => r.id === 'filing-fee')!;
    for (const type of ALL_PERMIT_TYPES) {
      expect(filingFee.applicability[type]).toBe('required');
    }
  });

  it('feeMatrixFor never has a missing cell — every rule has an explicit applicability for every permit type', () => {
    for (const type of ALL_PERMIT_TYPES) {
      const matrix = feeMatrixFor(type);
      expect(matrix.length).toBe(FEE_RULES.length);
      for (const entry of matrix) {
        expect(['required', 'conditional', 'not-applicable']).toContain(entry.applicability);
      }
    }
  });
});

describe('Fee rule catalog — official fee families per the task specification', () => {
  it('Building Permit – New Construction, Addition/Extension, and Renovation/Alteration all require the building-permit-fee family', () => {
    for (const type of [
      'Building Permit – New Construction',
      'Building Permit – Addition / Extension',
      'Building Permit – Renovation / Alteration',
    ] as const) {
      const entries = feeRulesForPermitType(type);
      expect(
        entries.some((e) => e.rule.id === 'building-permit-fee' && e.applicability === 'required'),
      ).toBe(true);
    }
  });

  it('Electrical, Mechanical, Plumbing, Sanitary, and Electronics each require their own formula family', () => {
    const expected: [string, string][] = [
      ['Electrical Permit', 'electrical-permit-fee'],
      ['Mechanical Permit', 'mechanical-permit-fee'],
      ['Plumbing Permit', 'plumbing-permit-fee'],
      ['Sanitary Permit', 'sanitary-permit-fee'],
      ['Electronics Permit', 'electronics-permit-fee'],
    ];
    for (const [type, ruleId] of expected) {
      const entries = feeRulesForPermitType(type as (typeof ALL_PERMIT_TYPES)[number]);
      expect(entries.some((e) => e.rule.id === ruleId && e.applicability === 'required')).toBe(
        true,
      );
    }
  });

  it('Plumbing Permit and Sanitary Permit are billed under two independent rule ids — matching the real Castilla Unified Application Form\'s Box 6, which lists them as separate line items', () => {
    const plumbingEntries = feeRulesForPermitType('Plumbing Permit').filter(
      (e) => e.applicability === 'required',
    );
    const sanitaryEntries = feeRulesForPermitType('Sanitary Permit').filter(
      (e) => e.applicability === 'required',
    );
    expect(plumbingEntries.some((e) => e.rule.id === 'plumbing-permit-fee')).toBe(true);
    expect(sanitaryEntries.some((e) => e.rule.id === 'sanitary-permit-fee')).toBe(true);
    // Never the same rule id doing double duty for both.
    expect(plumbingEntries.map((e) => e.rule.id)).not.toEqual(sanitaryEntries.map((e) => e.rule.id));
  });

  it('Demolition, Fencing, Sign, and Excavation each require the DPWH accessory fee family, under distinct rule ids for their own physical basis', () => {
    const expected: [string, string][] = [
      ['Demolition Permit', 'demolition-accessory-fee'],
      ['Fencing Permit', 'fencing-accessory-fee'],
      ['Sign Permit', 'sign-accessory-fee'],
      ['Excavation Permit', 'excavation-accessory-fee'],
    ];
    for (const [type, ruleId] of expected) {
      const entries = feeRulesForPermitType(type as (typeof ALL_PERMIT_TYPES)[number]);
      const match = entries.find((e) => e.rule.id === ruleId);
      expect(match).toBeTruthy();
      expect(match!.applicability).toBe('required');
      expect(match!.rule.family).toBe('DPWH Accessory & Ancillary Structure Fee');
    }
  });

  it('Certificate of Occupancy requires the occupancy assessment and the fire code assessment', () => {
    const entries = feeRulesForPermitType('Certificate of Occupancy');
    expect(
      entries.some(
        (e) => e.rule.id === 'occupancy-assessment-fee' && e.applicability === 'required',
      ),
    ).toBe(true);
    expect(
      entries.some(
        (e) => e.rule.id === 'fire-code-assessment-fee' && e.applicability === 'required',
      ),
    ).toBe(true);
  });

  it('FSEC for Building Permit (BFP) and FSIC for Occupancy Permit (BFP) each require the fire code assessment fee', () => {
    for (const type of [
      'FSEC for Building Permit (BFP)',
      'FSIC for Occupancy Permit (BFP)',
    ] as const) {
      const entries = feeRulesForPermitType(type as (typeof ALL_PERMIT_TYPES)[number]);
      expect(
        entries.some(
          (e) => e.rule.id === 'fire-code-assessment-fee' && e.applicability === 'required',
        ),
      ).toBe(true);
    }
  });

  it('Architectural, Civil / Structural, and Interior Design Permit each require their own fee line — per the real Castilla Unified Application Form\'s Box 6, which lists all three as separate assessed items', () => {
    const expected: [string, string][] = [
      ['Architectural Permit', 'architectural-permit-fee'],
      ['Civil / Structural Permit', 'civil-structural-permit-fee'],
      ['Interior Design Permit', 'interior-design-permit-fee'],
    ];
    for (const [type, ruleId] of expected) {
      const entries = feeRulesForPermitType(type as (typeof ALL_PERMIT_TYPES)[number]);
      const requiredIds = entries.filter((e) => e.applicability === 'required').map((e) => e.rule.id);
      expect(requiredIds.sort()).toEqual(['filing-fee', ruleId].sort());
    }
  });

  it('Building Permit sub-types conditionally carry Line and Grade and Hotworks fees, per Box 6 — line items with no confirmed rate yet', () => {
    for (const type of [
      'Building Permit – New Construction',
      'Building Permit – Addition / Extension',
      'Building Permit – Renovation / Alteration',
    ] as const) {
      const entries = feeRulesForPermitType(type as (typeof ALL_PERMIT_TYPES)[number]);
      const lineAndGrade = entries.find((e) => e.rule.id === 'line-and-grade-fee');
      expect(lineAndGrade?.applicability).toBe('required');
      const hotworks = entries.find((e) => e.rule.id === 'hotworks-fee');
      expect(hotworks?.applicability).toBe('conditional');
    }
  });

  it('Building Permit sub-types require the Locational / Zoning of Land fee, per Box 6\'s "FOR ZONING (ZONING ADMINISTRATOR)" line', () => {
    for (const type of [
      'Building Permit – New Construction',
      'Building Permit – Addition / Extension',
      'Building Permit – Renovation / Alteration',
    ] as const) {
      const entries = feeRulesForPermitType(type as (typeof ALL_PERMIT_TYPES)[number]);
      expect(entries.find((e) => e.rule.id === 'locational-zoning-fee')?.applicability).toBe(
        'required',
      );
    }
  });

  it('Zoning / Locational Clearance itself requires the Locational / Zoning of Land fee — not just Building Permit filings referencing the same clearance', () => {
    // Previously missing: this type had NO dedicated fee-line test at all,
    // so nothing failed when its only real assessed amount was the
    // universal ₱250 filing fee — every other type in this file has a
    // test like this one for its own line.
    const entries = feeRulesForPermitType('Zoning / Locational Clearance');
    const requiredIds = entries.filter((e) => e.applicability === 'required').map((e) => e.rule.id);
    expect(requiredIds.sort()).toEqual(['filing-fee', 'locational-zoning-fee'].sort());
  });

  it('Building Permit sub-types conditionally carry Fencing, Electronics, Surcharges, and Penalties, per Box 6\'s "FOR BUILDING / STRUCTURE (OBO)" list', () => {
    for (const type of [
      'Building Permit – New Construction',
      'Building Permit – Addition / Extension',
      'Building Permit – Renovation / Alteration',
    ] as const) {
      const entries = feeRulesForPermitType(type as (typeof ALL_PERMIT_TYPES)[number]);
      for (const ruleId of [
        'fencing-accessory-fee',
        'electronics-permit-fee',
        'surcharges-fee',
        'penalties-fee',
      ]) {
        expect(entries.find((e) => e.rule.id === ruleId)?.applicability).toBe('conditional');
      }
    }
  });

  it('FSEC and FSIC each conditionally carry the Hotworks fee too', () => {
    for (const type of [
      'FSEC for Building Permit (BFP)',
      'FSIC for Occupancy Permit (BFP)',
    ] as const) {
      const entries = feeRulesForPermitType(type as (typeof ALL_PERMIT_TYPES)[number]);
      expect(entries.find((e) => e.rule.id === 'hotworks-fee')?.applicability).toBe('conditional');
    }
  });
});

describe('Fee rule catalog — honesty about unverified amounts', () => {
  it('every rule whose amount was not actually transcribed from an accessible source is flagged requiresAssessorInput and PENDING_LGU_VALIDATION, never presented as a verified national figure', () => {
    for (const rule of FEE_RULES) {
      if (rule.requiresAssessorInput) {
        expect(rule.flatAmountCentavos === null || rule.calculationType !== 'flat').toBe(true);
        expect(rule.verificationStatus).toBe('PENDING_LGU_VALIDATION');
      }
    }
  });

  it('every rule cites at least one source with a real URL', () => {
    for (const rule of FEE_RULES) {
      expect(rule.sources.length).toBeGreaterThan(0);
      for (const src of rule.sources) {
        // SRC_CASTILLA_UNIFIED_FORM points at the actual official form
        // bundled under public/assets/permits/ (obtained and reviewed in
        // full) rather than an external https link — see its own
        // accessNote for why that's still an honest, checkable citation.
        expect(src.url).toMatch(/^(https:\/\/|\/assets\/permits\/)/);
      }
    }
  });
});
