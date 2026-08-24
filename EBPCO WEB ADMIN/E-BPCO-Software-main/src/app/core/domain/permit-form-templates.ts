import { PermitType } from './permit.model';

// Blank official application-form PDFs bundled under public/assets/permits/
// for presentation/reference only — sample/dummy data, never a real issued
// permit. Most of these are the ACTUAL Municipality of Castilla / BFP
// Castilla Fire Station forms (from "LGU Castilla BPCO Forms"): the OBO's
// own trade-permit forms (Electrical, Mechanical, Plumbing, Sanitary,
// Electronics, Excavation, Fencing, Civil/Structural), the real Unified
// Application Form for Building Permit (covers New Construction,
// Renovation/Alteration, and Addition/Extension alike via its Scope of
// Work checkboxes — the same physical form serves all three), the real
// MPDO Locational Clearance/Zoning Compliance form, and the real BFP
// Castilla Fire Station FSEC and FSIC application forms. Not every one of
// the 19 PermitType values has a matching source file (Architectural,
// Interior Design, Sign, Demolition, and Certificate of Occupancy still
// use earlier non-Castilla-specific reference templates); where truly none
// exists the value is left undefined rather than guessing at an unrelated
// document.
const PERMIT_FORM_FILES: Partial<Record<PermitType, string>> = {
  // Real Castilla Unified Application Form for Building Permit — one
  // physical form, shared across all three Building Permit sub-types via
  // its own Scope of Work checkboxes (New Construction / Renovation /
  // Addition / etc.).
  'Building Permit – New Construction': 'New-Construction.pdf',
  'Building Permit – Renovation / Alteration': 'New-Construction.pdf',
  'Building Permit – Addition / Extension': 'New-Construction.pdf',
  'Architectural Permit': 'Architectural-Permit.pdf',
  'Civil / Structural Permit': 'Civil-Structural-Permit.pdf',
  'Demolition Permit': 'Demolition-Permit.pdf',
  'Zoning / Locational Clearance': 'Zoning-Locational-Clearance-Form.pdf',
  'Electrical Permit': 'Electrical-Permit-Form.pdf',
  'Electronics Permit': 'Electronics-Permit.pdf',
  'Mechanical Permit': 'Mechanical-Permit.pdf',
  'Plumbing Permit': 'Plumbing-Permit.pdf',
  'Sanitary Permit': 'Sanitary-Plumbing-Permit.pdf',
  'Interior Design Permit': 'Interior-Design-Permit.pdf',
  'Fencing Permit': 'Fencing-Permit-Form.pdf',
  'Sign Permit': 'Sign-Permit-Form.pdf',
  'Excavation Permit': 'Excavation-Permit-Form.pdf',
  'FSEC for Building Permit (BFP)': 'FSEC-for-Building-Permit-BFP.pdf',
  'Certificate of Occupancy': 'Application-for-Certificate-of-Occupancy.pdf',
  'FSIC for Occupancy Permit (BFP)': 'FSIC-for-Occupancy-Permit-BFP.pdf',
};

/** The public URL of the blank reference form PDF for a permit type, or null when none was provided. */
export function permitFormUrl(permitType: PermitType): string | null {
  const file = PERMIT_FORM_FILES[permitType];
  return file ? `/assets/permits/${encodeURIComponent(file)}` : null;
}

// The real Municipality of Castilla Office of the Municipal Engineer
// documentary-requirements checklist — one combined reference sheet
// covering both the Building Permit family and Certificate of Occupancy,
// used as a supplementary "what you need" reference alongside (not
// instead of) each type's own blank application form above.
const PERMIT_CHECKLIST_TYPES: ReadonlySet<PermitType> = new Set<PermitType>([
  'Building Permit – New Construction',
  'Building Permit – Renovation / Alteration',
  'Building Permit – Addition / Extension',
  'Certificate of Occupancy',
]);

const PERMIT_CHECKLIST_FILE = 'Building-Permit-and-Occupancy-Checklist.pdf';

/** The public URL of the real Castilla OBO documentary-requirements checklist for a permit type, or null when it doesn't apply. */
export function permitChecklistUrl(permitType: PermitType): string | null {
  return PERMIT_CHECKLIST_TYPES.has(permitType)
    ? `/assets/permits/${encodeURIComponent(PERMIT_CHECKLIST_FILE)}`
    : null;
}
