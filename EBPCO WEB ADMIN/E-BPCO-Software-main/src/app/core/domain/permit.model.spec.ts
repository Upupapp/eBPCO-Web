import {
  ALL_PERMIT_TYPES,
  BUSINESS_PERMIT_TYPES,
  CONSTRUCTION_PERMIT_TYPES,
  PERMIT_TYPE_CATALOG,
  PermitType,
  permitShortLabel,
  permitTypeDomain,
  permitTypesForDomain,
} from './permit.model';

describe('Centralized permit-type catalog', () => {
  it('has no duplicate permit type values', () => {
    expect(new Set(ALL_PERMIT_TYPES).size).toBe(ALL_PERMIT_TYPES.length);
  });

  it('never includes the removed generic "Business Permit" value', () => {
    expect(ALL_PERMIT_TYPES).not.toContain('Business Permit');
    expect(PERMIT_TYPE_CATALOG.some((p) => (p.type as string) === 'Business Permit')).toBe(false);
  });

  it('every catalog entry has a non-empty type, domain, and shortLabel', () => {
    for (const entry of PERMIT_TYPE_CATALOG) {
      expect(entry.type.length).toBeGreaterThan(0);
      expect(['Business Permit', 'Construction Permit']).toContain(entry.domain);
      expect(entry.shortLabel.length).toBeGreaterThan(0);
    }
  });

  it('BUSINESS_PERMIT_TYPES and CONSTRUCTION_PERMIT_TYPES exactly partition ALL_PERMIT_TYPES', () => {
    const union = new Set([...BUSINESS_PERMIT_TYPES, ...CONSTRUCTION_PERMIT_TYPES]);
    expect(union.size).toBe(ALL_PERMIT_TYPES.length);
    for (const t of ALL_PERMIT_TYPES) expect(union.has(t)).toBe(true);
    // No overlap between the two domain buckets.
    const overlap = BUSINESS_PERMIT_TYPES.filter((t) =>
      (CONSTRUCTION_PERMIT_TYPES as PermitType[]).includes(t),
    );
    expect(overlap.length).toBe(0);
  });

  it('permitTypeDomain agrees with the catalog for every type', () => {
    for (const entry of PERMIT_TYPE_CATALOG) {
      expect(permitTypeDomain(entry.type)).toBe(entry.domain);
    }
  });

  it('permitTypesForDomain returns exactly the types tagged with that domain', () => {
    const business = permitTypesForDomain('Business Permit');
    const construction = permitTypesForDomain('Construction Permit');
    expect(business.sort()).toEqual([...BUSINESS_PERMIT_TYPES].sort());
    expect(construction.sort()).toEqual([...CONSTRUCTION_PERMIT_TYPES].sort());
  });

  it('permitShortLabel never returns an empty string for a real type', () => {
    for (const t of ALL_PERMIT_TYPES) {
      expect(permitShortLabel(t).length).toBeGreaterThan(0);
    }
  });

  it('the three Business Permit variants replace the old generic value with specific transaction-nature labels', () => {
    expect(BUSINESS_PERMIT_TYPES).toEqual(
      expect.arrayContaining([
        'New Business Permit',
        'Business Permit Renewal',
        'Business Permit Amendment',
      ]),
    );
    expect(BUSINESS_PERMIT_TYPES.length).toBe(3);
  });
});
