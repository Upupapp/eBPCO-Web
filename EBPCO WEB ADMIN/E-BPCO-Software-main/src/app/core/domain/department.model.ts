import { EvaluationStage } from './status.model';

// The consistent office directory every surface that shows "which
// department owns this" (Application Details, Document Checklist,
// Evaluation view, Workflow view, Forms library, Information Portal)
// reads from — so an office name/contact never drifts between screens.
//
// SAMPLE DATA NOTICE: office names follow the standard functional units
// every Philippine municipality organizes around (BPLO, Office of the
// Building Official, Municipal Planning & Development, local BFP
// station, Municipal Health Office, Municipal Treasurer, Office of the
// Mayor) per DILG's Local Government Code / BPLS structure — but the
// exact office names, contact numbers, and office hours below are
// UNVERIFIED placeholders and must be confirmed against the Municipality
// of Castilla's actual organizational chart before production use. Do
// not present this list as Castilla's official directory until verified.
export interface Department {
  id: string;
  name: string;
  shortName: string;
  responsibility: string;
  formsHandled: string[];
  documentsReviewed: string[];
  evaluationStages: EvaluationStage[];
  contactEmail: string;
  contactPhone: string;
  officeHours: string;
  verified: false;
}

export const DEPARTMENTS: Department[] = [
  {
    id: 'bplo',
    name: 'Business Permits and Licensing Office',
    shortName: 'BPLO',
    responsibility:
      'Receives and processes new, renewal, and amendment Business Permit applications; issues the Mayor’s/Business Permit.',
    formsHandled: ['New Business Permit', 'Business Permit Renewal', 'Business Permit Amendment'],
    documentsReviewed: [
      'DTI/SEC/CDA Registration',
      'Barangay Business Clearance',
      "Previous Year's Business Permit",
      'Lease Contract or Land Title',
      'Community Tax Certificate (Cedula)',
    ],
    evaluationStages: ['Initial', 'Final Approval'],
    contactEmail: 'bplo@castilla.gov.ph',
    contactPhone: '(056) 000-0001',
    officeHours: 'Monday–Friday, 8:00 AM–5:00 PM',
    verified: false,
  },
  {
    id: 'obo',
    name: 'Office of the Municipal Engineer / Building Official',
    shortName: 'OBO',
    responsibility:
      'Evaluates and issues Building Permits and all ancillary construction/engineering permits under the National Building Code (PD 1096).',
    formsHandled: [
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
    ],
    documentsReviewed: [
      'Building Permit Application',
      'Architectural/Structural/Electrical/Mechanical/Sanitary Plans',
      'Bill of Materials',
      'Structural Design Analysis',
      "Professional's PRC ID and PTR",
    ],
    evaluationStages: ['Initial', 'OBO', 'Final Approval'],
    contactEmail: 'obo@castilla.gov.ph',
    contactPhone: '(056) 000-0002',
    officeHours: 'Monday–Friday, 8:00 AM–5:00 PM',
    verified: false,
  },
  {
    id: 'zoning',
    name: 'Municipal Planning and Development Office (Zoning Section)',
    shortName: 'MPDO – Zoning',
    responsibility:
      'Reviews land-use classification, zoning compliance, and locational clearance for both business and construction applications.',
    formsHandled: ['Locational Clearance', 'Zoning Certification'],
    documentsReviewed: [
      'Locational Clearance',
      'Land Use/Zoning Compliance Certificate',
      'Site Development Plan',
    ],
    evaluationStages: ['Zoning'],
    contactEmail: 'mpdo@castilla.gov.ph',
    contactPhone: '(056) 000-0003',
    officeHours: 'Monday–Friday, 8:00 AM–5:00 PM',
    verified: false,
  },
  {
    id: 'bfp',
    name: 'Bureau of Fire Protection – Castilla Fire Station',
    shortName: 'BFP Castilla',
    responsibility:
      'Conducts fire safety inspection and issues the Fire Safety Inspection Certificate (FSIC) required under RA 9514 (Fire Code of the Philippines).',
    formsHandled: [
      'Fire Safety Evaluation Clearance (FSEC)',
      'Fire Safety Inspection Certificate (FSIC)',
    ],
    documentsReviewed: [
      'Fire Safety Inspection Certificate',
      'Fire Safety Evaluation Report',
      'Fire Insurance (if applicable)',
    ],
    evaluationStages: ['Fire Safety'],
    contactEmail: 'bfp.castilla@bfp.gov.ph',
    contactPhone: '(056) 000-0004',
    officeHours: 'Monday–Friday, 8:00 AM–5:00 PM (inspections by schedule)',
    verified: false,
  },
  {
    id: 'health',
    name: 'Municipal Health Office (Sanitary Permit Unit)',
    shortName: 'MHO',
    responsibility:
      'Reviews sanitation compliance and issues the Sanitary Permit required for business establishments and occupancy.',
    formsHandled: ['Sanitary Permit'],
    documentsReviewed: ['Sanitary Permit', 'Health Certificate of Employees/Owner'],
    evaluationStages: ['OBO'],
    contactEmail: 'mho@castilla.gov.ph',
    contactPhone: '(056) 000-0005',
    officeHours: 'Monday–Friday, 8:00 AM–5:00 PM',
    verified: false,
  },
  {
    id: 'treasury',
    name: "Municipal Treasurer's Office (Assessment & Collection)",
    shortName: 'MTO',
    responsibility:
      'Computes fees and taxes due, and receives payment for every permit/license application.',
    formsHandled: ['Order of Payment / Assessment Form', 'Official Receipt'],
    documentsReviewed: ['Order of Payment', 'Proof of Payment'],
    evaluationStages: [],
    contactEmail: 'treasury@castilla.gov.ph',
    contactPhone: '(056) 000-0006',
    officeHours: 'Monday–Friday, 8:00 AM–5:00 PM',
    verified: false,
  },
  {
    id: 'mayor',
    name: 'Office of the Municipal Mayor (Releasing Unit)',
    shortName: 'Mayor’s Office',
    responsibility:
      'Approves and signs the final permit/license and releases the completed document to the applicant or authorized representative.',
    formsHandled: ['Mayor’s Permit', 'Release Form'],
    documentsReviewed: ['Approval Notice', 'Release Form'],
    evaluationStages: ['Final Approval'],
    contactEmail: 'mayors.office@castilla.gov.ph',
    contactPhone: '(056) 000-0007',
    officeHours: 'Monday–Friday, 8:00 AM–5:00 PM',
    verified: false,
  },
];

const DEPARTMENT_BY_ID = new Map(DEPARTMENTS.map((d) => [d.id, d]));

export function departmentById(id: string): Department | undefined {
  return DEPARTMENT_BY_ID.get(id);
}

export function departmentName(id: string): string {
  return DEPARTMENT_BY_ID.get(id)?.name ?? id;
}

export function departmentsForStage(stage: EvaluationStage): Department[] {
  return DEPARTMENTS.filter((d) => d.evaluationStages.includes(stage));
}
