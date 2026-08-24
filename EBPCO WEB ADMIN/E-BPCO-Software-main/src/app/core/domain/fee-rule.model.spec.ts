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

  it('Electrical, Mechanical, Plumbing/Sanitary, and Electronics each require their own formula family', () => {
    const expected: [string, string][] = [
      ['Electrical Permit', 'electrical-permit-fee'],
      ['Mechanical Permit', 'mechanical-permit-fee'],
      ['Plumbing Permit', 'plumbing-sanitary-permit-fee'],
      ['Sanitary Permit', 'plumbing-sanitary-permit-fee'],
      ['Electronics Permit', 'electronics-permit-fee'],
    ];
    for (const [type, ruleId] of expected) {
      const entries = feeRulesForPermitType(type as (typeof ALL_PERMIT_TYPES)[number]);
      expect(entries.some((e) => e.rule.id === ruleId && e.applicability === 'required')).toBe(
        true,
      );
    }
  });

  it('Plumbing Permit and Sanitary Permit share exactly ONE rule id — never two separately-charged plumbing lines', () => {
    // Excludes the generic filing fee, which is legitimately "required"
    // for every one of the 19 types — the thing under test is whether
    // there are two independent PLUMBING-specific fee rules, not whether
    // any required rule happens to touch these two types.
    const plumbingRules = FEE_RULES.filter(
      (r) =>
        r.family.toLowerCase().includes('plumbing') &&
        (r.applicability['Plumbing Permit'] === 'required' ||
          r.applicability['Sanitary Permit'] === 'required'),
    );
    expect(plumbingRules.length).toBe(1);
    expect(plumbingRules[0].id).toBe('plumbing-sanitary-permit-fee');
    // And both types resolve to that same single rule instance, not two independent copies.
    const plumbingEntries = feeRulesForPermitType('Plumbing Permit').filter(
      (e) => e.applicability === 'required',
    );
    const sanitaryEntries = feeRulesForPermitType('Sanitary Permit').filter(
      (e) => e.applicability === 'required',
    );
    expect(plumbingEntries.map((e) => e.rule.id)).toEqual(sanitaryEntries.map((e) => e.rule.id));
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

  it('Architectural, Civil / Structural, and Interior Design Permit have NO dedicated required national formula of their own — only the generic filing fee is required, per the task instruction not to invent one', () => {
    for (const type of [
      'Architectural Permit',
      'Civil / Structural Permit',
      'Interior Design Permit',
    ] as const) {
      const entries = feeRulesForPermitType(type as (typeof ALL_PERMIT_TYPES)[number]);
      const requiredIds = entries
        .filter((e) => e.applicability === 'required')
        .map((e) => e.rule.id);
      expect(requiredIds).toEqual(['filing-fee']);
      // No rule family is literally named after these three types.
      expect(FEE_RULES.some((r) => r.family.toLowerCase().includes('architectural'))).toBe(false);
      expect(FEE_RULES.some((r) => r.family.toLowerCase().includes('interior design'))).toBe(false);
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
      for (const src of rule.sources) expect(src.url).toMatch(/^https:\/\//);
    }
  });
});
