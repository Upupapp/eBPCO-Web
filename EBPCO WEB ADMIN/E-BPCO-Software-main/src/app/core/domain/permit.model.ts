// serviceDomain distinguishes the two structurally separate prototype
// systems that exist in E-BPCO Mobile — the generic "Business Permit" flow
// (ApplicationModel/ApplicationType in application_model.dart) and the 15
// decoupled construction/ancillary/certificate permit wizards (each with
// its own model file, e.g. architectural_permit_model.dart,
// electrical_permit_model.dart, ...). A single "Business Application"
// label would conflate two things mobile itself keeps apart.
export type ServiceDomain = 'Business Permit' | 'Construction Permit';

// The full permit-type catalog — the single centralized list every
// surface (Dashboard, Applications, Business Application Stages,
// Evaluations, Payments, Permit Release, filters, forms, seed data) reads
// from, so a permit type is defined exactly once. The three Business
// Permit variants replace the old single generic 'Business Permit' value
// — mobile's Business Permit flow doesn't distinguish New/Renewal/
// Amendment as separate *types* the way the construction wizards do, but
// showing every business-permit sample application as the literal string
// "Business Permit" gave every business-domain row in the Overall
// Applications Queue an identical, non-diagnostic label. These three
// mirror the same New/Renewal/Amendment transaction categories
// ApplicationAction already tracks, expressed as permit-type labels so
// the queue, filters, and stage notes have something specific to show.
// Every value below (past the three Business Permit variants) is copied
// verbatim from E-BPCO Mobile's own Applications screen —
// ebpco-mobile/lib/features/applications/presentation/applications_screen.dart's
// `_PermitOption.title` strings across its Building Permit / Ancillary
// Permits / Other Permits / Certificates sections — not an independent
// naming convention invented for the web admin. Two of these are
// deliberately inconsistent with the rest ('Sign Permit' keeps its
// suffix, 'Interior' has none) because that inconsistency is what mobile
// itself actually displays; "fixing" it here would make this list
// disagree with the app it's supposed to mirror. "Building Permit" is
// mobile's section HEADER for New Construction/Renovation/Addition-
// Extension/Demolition, not itself a selectable type — it correctly has
// no entry of its own here.
export type PermitType =
  | 'New Business Permit'
  | 'Business Permit Renewal'
  | 'Business Permit Amendment'
  | 'New Construction'
  | 'Renovation'
  | 'Addition / Extension'
  | 'Demolition'
  | 'Architectural'
  | 'Civil / Structural'
  | 'Electrical'
  | 'Mechanical'
  | 'Sanitary / Plumbing'
  | 'Plumbing'
  | 'Electronics'
  | 'Interior'
  | 'Fencing'
  | 'Sign Permit'
  | 'Excavation'
  | 'Certificate of Occupancy';

export interface PermitTypeInfo {
  type: PermitType;
  domain: ServiceDomain;
  /** Compact label for tight UI (stage-board sticky notes, table cells) — identical to `type` except for the three Business Permit variants. */
  shortLabel: string;
}

// Ordered for display grouping: Business Permit variants first, then the
// construction/ancillary/certificate types in the same order mobile's own
// Applications screen groups them (New Applications -> Building Permit /
// Ancillary Permits / Other Permits / Certificates, in
// ebpco-mobile/lib/features/applications/presentation/applications_screen.dart).
export const PERMIT_TYPE_CATALOG: PermitTypeInfo[] = [
  { type: 'New Business Permit', domain: 'Business Permit', shortLabel: 'New Business Permit' },
  { type: 'Business Permit Renewal', domain: 'Business Permit', shortLabel: 'BP Renewal' },
  { type: 'Business Permit Amendment', domain: 'Business Permit', shortLabel: 'BP Amendment' },
  { type: 'New Construction', domain: 'Construction Permit', shortLabel: 'New Construction' },
  { type: 'Renovation', domain: 'Construction Permit', shortLabel: 'Renovation' },
  {
    type: 'Addition / Extension',
    domain: 'Construction Permit',
    shortLabel: 'Addition / Extension',
  },
  { type: 'Demolition', domain: 'Construction Permit', shortLabel: 'Demolition' },
  { type: 'Architectural', domain: 'Construction Permit', shortLabel: 'Architectural' },
  { type: 'Civil / Structural', domain: 'Construction Permit', shortLabel: 'Civil / Structural' },
  { type: 'Electrical', domain: 'Construction Permit', shortLabel: 'Electrical' },
  { type: 'Mechanical', domain: 'Construction Permit', shortLabel: 'Mechanical' },
  { type: 'Sanitary / Plumbing', domain: 'Construction Permit', shortLabel: 'Sanitary / Plumbing' },
  { type: 'Plumbing', domain: 'Construction Permit', shortLabel: 'Plumbing' },
  { type: 'Electronics', domain: 'Construction Permit', shortLabel: 'Electronics' },
  { type: 'Interior', domain: 'Construction Permit', shortLabel: 'Interior' },
  { type: 'Fencing', domain: 'Construction Permit', shortLabel: 'Fencing' },
  { type: 'Sign Permit', domain: 'Construction Permit', shortLabel: 'Sign Permit' },
  { type: 'Excavation', domain: 'Construction Permit', shortLabel: 'Excavation' },
  {
    type: 'Certificate of Occupancy',
    domain: 'Construction Permit',
    shortLabel: 'Certificate of Occupancy',
  },
];

export const ALL_PERMIT_TYPES: PermitType[] = PERMIT_TYPE_CATALOG.map((p) => p.type);

export const BUSINESS_PERMIT_TYPES: PermitType[] = PERMIT_TYPE_CATALOG.filter(
  (p) => p.domain === 'Business Permit',
).map((p) => p.type);

export const CONSTRUCTION_PERMIT_TYPES: PermitType[] = PERMIT_TYPE_CATALOG.filter(
  (p) => p.domain === 'Construction Permit',
).map((p) => p.type);

const PERMIT_TYPE_BY_VALUE = new Map(PERMIT_TYPE_CATALOG.map((p) => [p.type, p]));

export function permitTypeInfo(type: PermitType): PermitTypeInfo {
  return PERMIT_TYPE_BY_VALUE.get(type) ?? PERMIT_TYPE_CATALOG[0];
}

export function permitTypeDomain(type: PermitType): ServiceDomain {
  return permitTypeInfo(type).domain;
}

export function permitShortLabel(type: PermitType): string {
  return permitTypeInfo(type).shortLabel;
}

/** Permit types belonging to a given service domain — used by the intake form's "Permit Type" select, which is scoped to whichever Application Type/domain the encoder picked first. */
export function permitTypesForDomain(domain: ServiceDomain): PermitType[] {
  return PERMIT_TYPE_CATALOG.filter((p) => p.domain === domain).map((p) => p.type);
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
