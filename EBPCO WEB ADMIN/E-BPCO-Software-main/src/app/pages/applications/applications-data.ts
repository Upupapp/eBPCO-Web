import { ApplicationRecord, AppStatus } from '../../core/domain/application.model';
import {
  Applicant,
  ContactVerification,
  unverifiedContact,
} from '../../core/domain/applicant.model';
import { Business } from '../../core/domain/business.model';

export type { AppStatus };
export type EvalKey = 'initial' | 'zoning' | 'fire' | 'obo' | 'final';

// Same shape as the shared ApplicationStore record — this page reads its
// row list from that store rather than a locally-hardcoded array (see
// tenant-applications.ts), but keeps this alias so the rest of the file
// doesn't need a mechanical rename.
export type AppRow = ApplicationRecord;

export interface DocumentItem {
  name: string;
  filename: string;
  uploadedDate: string;
  status: 'Approved' | 'Rejected' | 'Missing' | 'Pending';
}

export interface CommentItem {
  author: string;
  timeAgo: string;
  text: string;
  depth: 0 | 1 | 2;
  thumbnails?: string[];
}

export interface TimelineItem {
  num: string;
  event: string;
  date: string;
  time: string;
  detail: string;
}

export interface EvalCard {
  key: EvalKey;
  title: string;
  statusLabel: string;
  statusTone: 'good' | 'progress';
  description: string;
  documents: number;
  comments: number;
  officerInitials: string[];
  progressPct: number;
}

export interface ChecklistItem {
  label: string;
  filename: string;
  status: 'Approved' | 'For Review' | 'Pending' | 'Return' | 'Reject' | 'Missing';
  checked: boolean;
}

export interface ReviewStep {
  num: string;
  label: string;
  status: 'Approved' | 'In Review' | 'Pending';
  detail?: string;
}

export interface EvalDetailConfig {
  title: string;
  checklistTitle: string;
  checklistSubtitle: string;
  checklist: ChecklistItem[];
  progressDone: number;
  progressTotal: number;
  reviewSteps?: ReviewStep[];
  rightPanel: 'qr' | 'preview' | 'map';
  primaryActionLabel: string;
}

// Mirrors E-BPCO Mobile's Building Permit Step 7 "Required Documents"
// checklist exactly (building_permit_model.dart), grouped there into
// Property / Technical / Professional / Government Clearance documents.
export const DOCUMENTS: DocumentItem[] = [
  // Property Documents
  {
    name: 'Land Title',
    filename: 'land_title.pdf',
    uploadedDate: 'Sun-Apr 14, 2026',
    status: 'Approved',
  },
  {
    name: 'Tax Declaration',
    filename: 'tax_declaration.pdf',
    uploadedDate: 'Sun-Apr 14, 2026',
    status: 'Approved',
  },
  {
    name: 'Real Property Tax Receipt',
    filename: 'rpt_receipt.pdf',
    uploadedDate: 'Sun-Apr 14, 2026',
    status: 'Approved',
  },
  // Technical Documents
  {
    name: 'Plans',
    filename: 'building_plans.pdf',
    uploadedDate: 'Sun-Apr 14, 2026',
    status: 'Approved',
  },
  {
    name: 'Specifications',
    filename: 'specifications.pdf',
    uploadedDate: 'Sun-Apr 14, 2026',
    status: 'Missing',
  },
  {
    name: 'Bill of Materials',
    filename: 'bill_of_materials.pdf',
    uploadedDate: 'Sun-Apr 14, 2026',
    status: 'Pending',
  },
  // Professional Documents
  { name: 'PRC ID', filename: 'prc_id.pdf', uploadedDate: 'Sun-Apr 14, 2026', status: 'Approved' },
  { name: 'PTR', filename: 'ptr.pdf', uploadedDate: 'Sun-Apr 14, 2026', status: 'Approved' },
  {
    name: 'Signed Forms',
    filename: 'signed_forms.pdf',
    uploadedDate: 'Sun-Apr 14, 2026',
    status: 'Rejected',
  },
  // Government Clearances
  {
    name: 'Barangay Clearance',
    filename: 'barangay_clearance.pdf',
    uploadedDate: 'Sun-Apr 14, 2026',
    status: 'Approved',
  },
  {
    name: 'Zoning Clearance',
    filename: 'zoning_clearance.pdf',
    uploadedDate: 'Sun-Apr 14, 2026',
    status: 'Pending',
  },
  {
    name: 'Fire-Related Requirements',
    filename: 'fire_requirements.pdf',
    uploadedDate: 'Sun-Apr 14, 2026',
    status: 'Missing',
  },
];

export const COMMENTS: CommentItem[] = [
  {
    author: 'Engr. Ricardo Buenaflor',
    timeAgo: 'about 2 minutes ago',
    text: 'Initial Interview Done!',
    depth: 0,
    thumbnails: ['#8b5a2b', '#1f2430', '#7c3aed'],
  },
  {
    author: 'Engr. Julius Bragais',
    timeAgo: 'about 1 hour ago',
    text: 'Wow impressive!',
    depth: 0,
  },
  {
    author: 'Engr. Ma. Teresa Arquero',
    timeAgo: 'about 2 hours ago',
    text: 'Wow, that is really nice.',
    depth: 1,
  },
  {
    author: 'Engr. Carlo Salvador',
    timeAgo: 'about 3 hours ago',
    text: 'Nice work, makes me think of The Money Pit.',
    depth: 2,
  },
  {
    author: 'Engr. Leonardo Ariola',
    timeAgo: 'about 4 hours ago',
    text: 'Some Documents Are Missing. Please upload a copy of Site Development',
    depth: 0,
  },
  {
    author: 'Applicant',
    timeAgo: 'about 10 hours ago',
    text: 'Uploaded the requested Documents.',
    depth: 0,
  },
];

export const TIMELINE: TimelineItem[] = [
  {
    num: '03',
    event: 'Application Approved',
    date: '18 Jun, 2026',
    time: '10:30 AM',
    detail: 'Application Approved by Engr. Ricardo Buenaflor',
  },
  {
    num: '02',
    event: 'Under Review',
    date: '28 May, 2026',
    time: '11:30 AM',
    detail: 'Application Reviewed by Engr. Ricardo Buenaflor',
  },
  {
    num: '01',
    event: 'Application Received',
    date: '13 May, 2026',
    time: '1:30 PM',
    detail: 'Application received by Engr. Ricardo Buenaflor',
  },
];

export const SHARED_TIMELINE: { label: string; date: string; who: string; role: string }[] = [
  {
    label: 'Application Submitted',
    date: 'April 12, 2026 | 10:30 AM',
    who: 'Juan Dela Cruz',
    role: 'Applicant',
  },
  {
    label: 'Initial Evaluation - Application in Building Approved',
    date: 'April 13, 2026 | 12:07 AM',
    who: 'Arnold M. Bermas',
    role: 'Engr.',
  },
  {
    label: 'Initial Evaluation - Architectural Permit Approved',
    date: 'April 13, 2026 | 2:07 AM',
    who: 'Jonathan Dizon',
    role: 'Architect',
  },
];

export const EVAL_CARDS: EvalCard[] = [
  {
    key: 'initial',
    title: 'Initial Evaluation',
    statusLabel: 'Ready to Review',
    statusTone: 'good',
    description: 'Application is completed and ready for review',
    documents: 6,
    comments: 12,
    officerInitials: ['ES', 'DM', 'RL'],
    progressPct: 100,
  },
  {
    key: 'zoning',
    title: 'Zoning Evaluation',
    statusLabel: 'In Progress',
    statusTone: 'progress',
    description: 'Application is still in Progress',
    documents: 4,
    comments: 0,
    officerInitials: ['AB', 'CD'],
    progressPct: 60,
  },
  {
    key: 'fire',
    title: 'Fire Safety Evaluation',
    statusLabel: 'In Progress',
    statusTone: 'progress',
    description: 'Application is still in Progress',
    documents: 9,
    comments: 0,
    officerInitials: ['EF', 'GH'],
    progressPct: 90,
  },
  {
    key: 'obo',
    title: 'OBO Review',
    statusLabel: 'In Progress',
    statusTone: 'progress',
    description: 'Application is still in Progress',
    documents: 0,
    comments: 0,
    officerInitials: ['IJ', 'KL', 'MN'],
    progressPct: 0,
  },
  {
    key: 'final',
    title: 'Final Evaluation',
    statusLabel: 'In Progress',
    statusTone: 'progress',
    description: 'Application is still in Progress',
    documents: 0,
    comments: 0,
    officerInitials: ['OP'],
    progressPct: 0,
  },
];

export interface AppDetail {
  row: AppRow;
  /** The application's real linked Business — resolved via businessId (never the applicant's name); 'Not provided' only when neither the real Business record nor the legacy businessName can be resolved. */
  businessLabel: string;
  region: string;
  email: string;
  phone: string;
  lastUpdated: string;
  emailVerification: ContactVerification;
  mobileVerification: ContactVerification;
  barangay: string;
  meta: { dateSubmitted: string; applicationNumber: string; currentStatus: AppStatus };
  project: {
    location: string;
    lotArea: string;
    floorArea: string;
    floors: string;
    projectType: string;
  };
  applicationType: {
    type: string;
    ifCompany: string;
    authorizedRep: string;
    businessPermit: string;
  };
  govId: { idType: string; contactNumber: string; tin: string };
  professional: { architect: string; civilEngineer: string; electricalEngineer: string };
  ownership: { lotOwnerName: string; relationship: string; ownershipType: string };
}

// `applicant` (the real linked Applicant record) is optional only so this
// keeps compiling for any not-yet-migrated caller — every current call
// site passes it, so the real email/mobile number is used rather than a
// fabricated one. `business` is likewise optional (and resolved by the
// caller via ApplicationStore.getBusiness, never by matching on the
// applicant's name) — falls back to the application's own denormalized
// businessName, then to 'Not provided', per getApplicationContext's rule.
export function buildDetailFor(row: AppRow, applicant?: Applicant, business?: Business): AppDetail {
  const businessLabel = business?.name || row.businessName || 'Not provided';
  return {
    row,
    businessLabel,
    region: 'Region V (Bicol Region)',
    email: applicant?.email ?? `${row.applicant.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
    phone: applicant?.mobileNumber ?? '+63 912 345 6789',
    lastUpdated: row.dateSubmitted,
    emailVerification: applicant?.emailVerification ?? unverifiedContact(),
    mobileVerification: applicant?.mobileVerification ?? unverifiedContact(),
    barangay: applicant?.barangay ?? row.location.replace(/^Barangay\s+/i, ''),
    meta: {
      dateSubmitted: row.dateSubmitted,
      applicationNumber: row.id,
      currentStatus: row.status,
    },
    project: {
      location: `78 Sampaguita Street, ${row.location}, Castilla, Sorsogon, 4703 Philippines`,
      lotArea: '150 sqm',
      floorArea: '85 sqm',
      floors: '2',
      projectType: row.type,
    },
    applicationType: {
      type: applicant?.applicantType ?? 'Individual',
      ifCompany: businessLabel,
      authorizedRep: '',
      businessPermit: row.permitType,
    },
    govId: {
      idType: 'National ID',
      contactNumber: '+63 918 765 4321',
      tin: '123-1242302-4234',
    },
    professional: {
      architect: '',
      civilEngineer: '',
      electricalEngineer: '',
    },
    ownership: {
      lotOwnerName: 'Juan Dela Cruz',
      relationship: 'Customer',
      ownershipType: 'Owned',
    },
  };
}

export const EVAL_DETAILS: Record<EvalKey, EvalDetailConfig> = {
  initial: {
    title: 'Initial Evaluation',
    checklistTitle: 'Documents Checklist',
    checklistSubtitle: 'Lorem ipsum sit dolor amet consecturer.',
    checklist: [
      {
        label: 'Application for Building Permit',
        filename: 'ApplicationforBuildingPermit.pdf',
        status: 'Approved',
        checked: true,
      },
      {
        label: 'Architectural Permit',
        filename: 'ArchitecturaPermit.pdf',
        status: 'Approved',
        checked: true,
      },
      {
        label: 'Civil Structural Permit',
        filename: 'CivilStructuralPermit.pdf',
        status: 'Return',
        checked: false,
      },
      {
        label: 'Demolition Permit',
        filename: 'DemolitionPermit.pdf',
        status: 'Missing',
        checked: false,
      },
    ],
    progressDone: 2,
    progressTotal: 4,
    rightPanel: 'preview',
    primaryActionLabel: 'Forward to Zoning Evaluation',
  },
  zoning: {
    title: 'Zoning Evaluation',
    checklistTitle: 'Zoning Compliance Checklist',
    checklistSubtitle: 'Lorem ipsum sit dolor amet consecturer.',
    checklist: [
      { label: 'Land Use / Zoning Compliance', filename: '', status: 'Approved', checked: true },
      { label: 'Minimal Area', filename: '', status: 'Approved', checked: true },
      { label: 'Setback Requirements', filename: '', status: 'Pending', checked: false },
      { label: 'Building Coverage', filename: '', status: 'Reject', checked: false },
    ],
    progressDone: 2,
    progressTotal: 10,
    rightPanel: 'map',
    primaryActionLabel: 'Forward to Fire Evaluation',
  },
  fire: {
    title: 'Fire Evaluation',
    checklistTitle: 'Documents Checklist',
    checklistSubtitle: 'Synced from Bureau of Fire Protection evaluation portal',
    checklist: [
      {
        label: 'BFP Citizens Charter',
        filename: 'ApplicationforBuildingPermit.pdf',
        status: 'Approved',
        checked: true,
      },
      {
        label: 'Fire Safety Inspection',
        filename: 'ArchitecturaPermit.pdf',
        status: 'Approved',
        checked: true,
      },
      {
        label: 'Fire Safety Evaluation Report',
        filename: 'CivilStructuralPermit.pdf',
        status: 'For Review',
        checked: false,
      },
    ],
    progressDone: 2,
    progressTotal: 3,
    rightPanel: 'qr',
    primaryActionLabel: 'Forward to Zoning',
  },
  obo: {
    title: 'OBO Evaluation',
    checklistTitle: 'Documents Checklist',
    checklistSubtitle: 'Multi-discipline sign-off records',
    checklist: [
      {
        label: 'OBO Assessment Form',
        filename: 'OBOAssessmentForm.pdf',
        status: 'Approved',
        checked: true,
      },
      {
        label: 'Multi-Discipline Sign-off',
        filename: 'MultiDisciplineSignoff.pdf',
        status: 'Approved',
        checked: true,
      },
      {
        label: 'Building Official Certification',
        filename: 'BuildingOfficialCert.pdf',
        status: 'For Review',
        checked: false,
      },
    ],
    progressDone: 2,
    progressTotal: 3,
    reviewSteps: [
      {
        num: '01',
        label: 'Technical Review',
        status: 'Approved',
        detail: 'May 4, 2025 | Arch. Doe',
      },
      { num: '02', label: 'Architectural', status: 'In Review', detail: 'Current Stage' },
      { num: '03', label: 'Civil Structural', status: 'Pending' },
      { num: '04', label: 'Sanitary/Plumbing', status: 'Pending' },
      { num: '05', label: 'Electrical', status: 'Pending' },
      { num: '06', label: 'Mechanical', status: 'Pending' },
      { num: '07', label: 'Electronics', status: 'Pending' },
      { num: '08', label: 'Site Verification', status: 'Pending' },
      { num: '09', label: 'Processing & Assesment', status: 'Pending' },
      { num: '10', label: 'Final Approval', status: 'Pending' },
    ],
    rightPanel: 'preview',
    primaryActionLabel: 'Approve',
  },
  final: {
    title: 'Final Evaluation',
    checklistTitle: 'Documents Checklist',
    checklistSubtitle: 'Final release requirements',
    checklist: [
      {
        label: 'Order of Payment',
        filename: 'OrderOfPayment.pdf',
        status: 'Approved',
        checked: true,
      },
      {
        label: 'Final Inspection Report',
        filename: 'FinalInspectionReport.pdf',
        status: 'Approved',
        checked: true,
      },
      {
        label: 'Certificate of Occupancy Draft',
        filename: 'CertOfOccupancy.pdf',
        status: 'For Review',
        checked: false,
      },
    ],
    progressDone: 2,
    progressTotal: 3,
    rightPanel: 'preview',
    primaryActionLabel: 'Forward to Permit Release',
  },
};
