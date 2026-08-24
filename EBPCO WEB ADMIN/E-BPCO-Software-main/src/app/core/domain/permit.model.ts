// The single, fixed, complete list of permit types this system supports.
// Exactly these 19 values, in exactly this order and wording — nothing
// more, nothing less. There is deliberately no domain/category grouping
// on top of this list (no "Business Permit" vs "Construction Permit"
// split, no aliases) — every surface that shows or accepts a permit type
// (Dashboard, Applications, Business Application Stages, Evaluations,
// Payments, Permit Release, filters, forms, seed/sample data) reads this
// exact array/union and nothing else. Do not add, rename, reorder, or
// alias any entry without updating this file — every other reference to
// a permit type in the codebase derives from here.
export type PermitType =
  | 'Building Permit – New Construction'
  | 'Building Permit – Renovation / Alteration'
  | 'Building Permit – Addition / Extension'
  | 'Demolition Permit'
  | 'Zoning / Locational Clearance'
  | 'Architectural Permit'
  | 'Civil / Structural Permit'
  | 'Electrical Permit'
  | 'Mechanical Permit'
  | 'Sanitary Permit'
  | 'Plumbing Permit'
  | 'Electronics Permit'
  | 'Interior Design Permit'
  | 'Fencing Permit'
  | 'Sign Permit'
  | 'Excavation Permit'
  | 'FSEC for Building Permit (BFP)'
  | 'Certificate of Occupancy'
  | 'FSIC for Occupancy Permit (BFP)';

/** The full list, in the exact required order — the one place this order is defined. */
export const ALL_PERMIT_TYPES: PermitType[] = [
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

const ALL_PERMIT_TYPES_SET: ReadonlySet<string> = new Set(ALL_PERMIT_TYPES);

/** Runtime validation guard — the one place a permit-type value from an untyped source (form input, URL param, imported data) is checked against the fixed list, so nothing outside these 16 exact strings can ever be accepted. */
export function isValidPermitType(value: string): value is PermitType {
  return ALL_PERMIT_TYPES_SET.has(value);
}

// Mirrors ApplicationType in application_model.dart.
export type ApplicationAction = 'New' | 'Renewal' | 'Amendment';

export interface GeneratedPermit {
  applicationId: string;
  permitNumber: string;
  issuedDateValue: Date;
  issuedDate: string;
  /** Null while the permit type carries no fixed validity period — set by ApplicationStore.generatePermit from the requirements catalog's validity rule for the application's permit type. */
  expiryDateValue: Date | null;
  expiryDate: string | null;
  approvingOfficial: string;
  approvingOffice: string;
}

// The mobile app itself has not implemented a releasing-officer/claimant/
// release-method model yet (its ApplicationModel only stamps
// permitNumber + issuedDate on release) — this richer shape follows
// docs/08-Reusable-Stitch/16-Permit-Release-and-Completion-Stitch.md's
// documented intent instead, since the web admin's release desk genuinely
// needs to record who released what to whom. Documented here as
// aspirational-but-implemented-on-web, not something mobile already does.
export type ReleaseMethod = 'Physical Claim' | 'Authorized Representative';

export interface PermitReleaseRecord {
  applicationId: string;
  permitNumber: string;
  releasingOfficer: string;
  claimantName: string;
  releaseMethod: ReleaseMethod;
  releasedAtValue: Date;
  releasedAt: string;
}
