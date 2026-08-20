// The single, fixed, complete list of permit types this system supports.
// Exactly these 16 values, in exactly this order and wording — nothing
// more, nothing less. There is deliberately no domain/category grouping
// on top of this list (no "Business Permit" vs "Construction Permit"
// split, no aliases) — every surface that shows or accepts a permit type
// (Dashboard, Applications, Business Application Stages, Evaluations,
// Payments, Permit Release, filters, forms, seed/sample data) reads this
// exact array/union and nothing else. Do not add, rename, reorder, or
// alias any entry without updating this file — every other reference to
// a permit type in the codebase derives from here.
export type PermitType =
  | 'Building Permit'
  | 'Architectural Permit'
  | 'Civil / Structural Permit'
  | 'Demolition Permit'
  | 'Addition / Extension Permit'
  | 'Renovation Permit'
  | 'Electrical Permit'
  | 'Electronics Permit'
  | 'Mechanical Permit'
  | 'Plumbing Permit'
  | 'Sanitary / Plumbing Permit'
  | 'Interior Design Permit'
  | 'Fencing Permit'
  | 'Sign Permit'
  | 'Excavation & Ground Preparation Permit'
  | 'Certificate of Occupancy';

/** The full list, in the exact required order — the one place this order is defined. */
export const ALL_PERMIT_TYPES: PermitType[] = [
  'Building Permit',
  'Architectural Permit',
  'Civil / Structural Permit',
  'Demolition Permit',
  'Addition / Extension Permit',
  'Renovation Permit',
  'Electrical Permit',
  'Electronics Permit',
  'Mechanical Permit',
  'Plumbing Permit',
  'Sanitary / Plumbing Permit',
  'Interior Design Permit',
  'Fencing Permit',
  'Sign Permit',
  'Excavation & Ground Preparation Permit',
  'Certificate of Occupancy',
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
