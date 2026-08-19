// The business-owner/applicant person — the actual user of E-BPCO Mobile.
// The web admin never authenticates applicants (that experience stays in
// mobile); this exists only as a linked reference so a Business/Application
// record's applicant name is never fabricated from the business name.
export interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
}

export function applicantFullName(applicant: Applicant): string {
  return `${applicant.firstName} ${applicant.lastName}`;
}
