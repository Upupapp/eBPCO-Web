// serviceDomain distinguishes the two structurally separate prototype
// systems that exist in E-BPCO Mobile — the generic "Business Permit" flow
// (ApplicationModel/ApplicationType in application_model.dart) and the 15
// decoupled construction/ancillary/certificate permit wizards (each with
// its own model file, e.g. architectural_permit_model.dart,
// electrical_permit_model.dart, ...). A single "Business Application"
// label would conflate two things mobile itself keeps apart.
export type ServiceDomain = 'Business Permit' | 'Construction Permit';

// The full permit-type catalog, matching the grouping mobile's own
// Applications screen uses (New Applications -> Building Permit /
// Ancillary Permits / Other Permits / Certificates groups in
// ebpco-mobile/lib/features/applications/presentation/applications_screen.dart).
// 'Business Permit' is the one type used when serviceDomain is
// 'Business Permit' rather than one of the construction permit types.
export type PermitType =
  | 'New Construction'
  | 'Renovation'
  | 'Addition/Extension'
  | 'Demolition'
  | 'Architectural'
  | 'Civil/Structural'
  | 'Electrical'
  | 'Mechanical'
  | 'Sanitary/Plumbing'
  | 'Plumbing'
  | 'Electronics'
  | 'Interior Design'
  | 'Fencing'
  | 'Sign'
  | 'Excavation'
  | 'Certificate of Occupancy'
  | 'Business Permit';

export const CONSTRUCTION_PERMIT_TYPES: PermitType[] = [
  'New Construction',
  'Renovation',
  'Addition/Extension',
  'Demolition',
  'Architectural',
  'Civil/Structural',
  'Electrical',
  'Mechanical',
  'Sanitary/Plumbing',
  'Plumbing',
  'Electronics',
  'Interior Design',
  'Fencing',
  'Sign',
  'Excavation',
  'Certificate of Occupancy',
];

// Mirrors ApplicationType in application_model.dart.
export type ApplicationAction = 'New' | 'Renewal' | 'Amendment';

export interface GeneratedPermit {
  applicationId: string;
  permitNumber: string;
  issuedDateValue: Date;
  issuedDate: string;
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
