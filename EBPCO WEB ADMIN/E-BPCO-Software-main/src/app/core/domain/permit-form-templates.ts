import { PermitType } from './permit.model';

// Blank official application-form PDFs bundled under public/assets/permits/
// for presentation/reference only — sample/dummy data, never a real issued
// permit. Not every one of the 16 PermitType values has an obviously
// matching source file; where none exists the value is left undefined
// rather than guessing at an unrelated document.
const PERMIT_FORM_FILES: Partial<Record<PermitType, string>> = {
  // No file named for "Building Permit" specifically — New Construction is
  // the closest real-world equivalent among the provided templates.
  'Building Permit': 'New-Construction.pdf',
  'Architectural Permit': 'Architectural-Permit.pdf',
  'Civil / Structural Permit': 'Civil-Structural-Permit.pdf',
  'Demolition Permit': 'Demolition-Permit.pdf',
  'Electrical Permit': 'Electrical-Permit-Form.pdf',
  'Electronics Permit': 'Electronics-Permit.pdf',
  'Mechanical Permit': 'Mechanical-Permit.pdf',
  'Plumbing Permit': 'Plumbing-Permit.pdf',
  'Sanitary / Plumbing Permit': 'Sanitary-Plumbing-Permit.pdf',
  'Interior Design Permit': 'Interior-Design-Permit.pdf',
  'Fencing Permit': 'Fencing-Permit-Form.pdf',
  'Sign Permit': 'Sign-Permit-Form.pdf',
  'Excavation & Ground Preparation Permit': 'Excavation-Permit-Form.pdf',
  'Certificate of Occupancy': 'Application-for-Certificate-of-Occupancy.pdf',
  // 'Addition / Extension Permit' and 'Renovation Permit' have no matching
  // source file among the provided templates.
};

/** The public URL of the blank reference form PDF for a permit type, or null when none was provided. */
export function permitFormUrl(permitType: PermitType): string | null {
  const file = PERMIT_FORM_FILES[permitType];
  return file ? `/assets/permits/${encodeURIComponent(file)}` : null;
}
