// How a contact detail's current verification status was (or will be)
// established. 'Manual Administrator Confirmation' and 'Verified-Document
// Matching' are the two methods this frontend-only mock can actually
// perform (an admin ticking a box, or a document upload matching the
// declared value) — 'Email Verification Link' and 'Mobile OTP' are
// modeled as real methods records can carry, but nothing in this
// prototype can actually deliver an email/SMS, so a contact only ever
// reaches 'Verified' here through the two manual methods.
export type VerificationMethod =
  | 'Email Verification Link'
  | 'Mobile OTP'
  | 'Manual Administrator Confirmation'
  | 'Verified-Document Matching';

export type VerificationStatus =
  'Unverified' | 'Pending Verification' | 'Verified' | 'Verification Failed';

export interface ContactVerification {
  status: VerificationStatus;
  method: VerificationMethod | null;
  verifiedBy: string | null;
  verifiedAtValue: Date | null;
  verifiedAt: string | null;
}

export function unverifiedContact(): ContactVerification {
  return {
    status: 'Unverified',
    method: null,
    verifiedBy: null,
    verifiedAtValue: null,
    verifiedAt: null,
  };
}

// The business-owner/applicant person — the actual user of E-BPCO Mobile.
// The web admin never authenticates applicants (that experience stays in
// mobile); this exists only as a linked reference so a Business/Application
// record's applicant name is never fabricated from the business name.
//
// `emailVerification`/`mobileVerification` are tracked independently per
// the "do not display a verified status unless a real verification step
// has occurred" rule — a freshly-encoded walk-in applicant always starts
// 'Unverified' on both, never defaulted to 'Verified' just because a
// value was typed into the field.
export interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  landlineNumber: string | null;
  applicantType: 'Individual' | 'Authorized Representative' | 'Corporate Officer' | null;
  addressLine: string;
  barangay: string;
  emailVerification: ContactVerification;
  mobileVerification: ContactVerification;
}

export function applicantFullName(applicant: Applicant): string {
  return `${applicant.firstName} ${applicant.lastName}`;
}
