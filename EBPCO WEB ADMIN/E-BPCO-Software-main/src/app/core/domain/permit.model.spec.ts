import { ALL_PERMIT_TYPES, PermitType, isValidPermitType } from './permit.model';

// The exact, fixed, ordered list this system supports — verbatim wording
// and order, nothing more. This test is the literal spec: if this array
// and `ALL_PERMIT_TYPES` ever disagree, one of them is wrong.
const EXPECTED_PERMIT_TYPES: PermitType[] = [
  'Building Permit – New Construction',
  'Building Permit – Renovation / Alteration',
  'Building Permit – Addition / Extension',
  'Demolition Permit',
  'Zoning / Locational Clearance',
  'Architectural Permit',
  'Civil / Structural Permit',
  'Electrical Permit',
  'Mechanical Permit',
  'Sanitary Permit',
  'Plumbing Permit',
  'Electronics Permit',
  'Interior Design Permit',
  'Fencing Permit',
  'Sign Permit',
  'Excavation Permit',
  'FSEC for Building Permit (BFP)',
  'Certificate of Occupancy',
  'FSIC for Occupancy Permit (BFP)',
];

describe('Centralized permit-type list', () => {
  it('is exactly the 19 required types, in exactly the required order', () => {
    expect(ALL_PERMIT_TYPES).toEqual(EXPECTED_PERMIT_TYPES);
  });

  it('has exactly 19 entries — no extras, no omissions', () => {
    expect(ALL_PERMIT_TYPES.length).toBe(19);
  });

  it('has no duplicate values', () => {
    expect(new Set(ALL_PERMIT_TYPES).size).toBe(ALL_PERMIT_TYPES.length);
  });

  it('never includes the old generic "Business Permit" value or any Business Permit variant', () => {
    for (const forbidden of [
      'Business Permit',
      'New Business Permit',
      'Business Permit Renewal',
      'Business Permit Amendment',
    ]) {
      expect(ALL_PERMIT_TYPES as string[]).not.toContain(forbidden);
    }
  });

  it('never includes an unsuffixed/aliased variant of a required name (e.g. "Interior" instead of "Interior Design Permit")', () => {
    for (const forbidden of [
      'New Construction',
      'Renovation',
      'Addition / Extension',
      'Civil / Structural',
      'Sanitary / Plumbing',
      'Interior',
      'Excavation',
      'Electrical',
      'Architectural',
      'Demolition',
      'Fencing',
    ]) {
      expect(ALL_PERMIT_TYPES as string[]).not.toContain(forbidden);
    }
  });

  it('never includes a now-obsolete previous canonical name from before the 19-item catalog rework', () => {
    for (const forbidden of [
      'Building Permit',
      'Renovation Permit',
      'Addition / Extension Permit',
      'Sanitary / Plumbing Permit',
      'Excavation & Ground Preparation Permit',
    ]) {
      expect(ALL_PERMIT_TYPES as string[]).not.toContain(forbidden);
    }
  });
});

describe('isValidPermitType — runtime validation guard', () => {
  it('accepts every one of the 19 required values', () => {
    for (const type of EXPECTED_PERMIT_TYPES) {
      expect(isValidPermitType(type)).toBe(true);
    }
  });

  it('rejects a value not on the list, including near-miss aliases', () => {
    expect(isValidPermitType('Business Permit')).toBe(false);
    expect(isValidPermitType('New Business Permit')).toBe(false);
    expect(isValidPermitType('Renovation')).toBe(false); // missing " Permit" suffix
    expect(isValidPermitType('Renovation Permit')).toBe(false); // old canonical name, now obsolete
    expect(isValidPermitType('building permit')).toBe(false); // case-sensitive
    expect(isValidPermitType('Building Permit – New Construction ')).toBe(false); // trailing space
    expect(isValidPermitType('')).toBe(false);
  });
});
