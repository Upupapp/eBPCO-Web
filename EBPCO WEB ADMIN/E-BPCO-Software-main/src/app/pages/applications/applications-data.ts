import { ApplicationRecord, AppStatus } from '../../core/domain/application.model';
import {
  Applicant,
  ContactVerification,
  unverifiedContact,
} from '../../core/domain/applicant.model';
import { Business } from '../../core/domain/business.model';

export type { AppStatus };

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
  id: string;
  author: string;
  timeAgo: string;
  text: string;
  depth: 0 | 1 | 2;
}

export interface TimelineItem {
  num: string;
  event: string;
  date: string;
  time: string;
  detail: string;
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
    /** `null` when the portal could not name the permit type. */
    projectType: string | null;
  };
  applicationType: {
    type: string;
    ifCompany: string;
    authorizedRep: string;
    /** `null` when the portal could not name the permit type. */
    businessPermit: string | null;
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
//
// `realContact` is the applicant's own account contact info from
// `GET /staff/applications/:id` (`applicantEmail`/`applicantMobile`) — the
// real backend record, present for every application the API actually
// created. `applicant` above only resolves for the frontend's own local
// mock seed data, which a real (server-created) application never matches;
// this used to silently fall through to a FABRICATED email (the applicant's
// display name, lowercased, stripped of spaces, plus "@gmail.com") and a
// hardcoded fake phone number whenever that happened — real data existed
// one call away and a made-up value was shown instead. Priority is real API
// data, then the local mock record, then an honest "not on file" rather
// than ever inventing a value again.
//
// `barangay` had the identical defect until this same fix was extended to
// it: it fell back to `row.location.replace(/^Barangay\s+/i, '')` — the
// CONSTRUCTION SITE'S barangay, not the applicant's own — whenever the
// local mock record did not resolve, which is every real application.
export function buildDetailFor(
  row: AppRow,
  applicant?: Applicant,
  business?: Business,
  realContact?: { email: string; mobile: string | null },
  /**
   * The applicant's own real address (`GET /staff/applications/:id`'s
   * `applicantAddress`, backend migration 036) — same priority as
   * `realContact` above and for the same reason: `barangay` used to fall
   * back to `row.location` (the CONSTRUCTION SITE, not where the applicant
   * lives) whenever the local mock `Applicant` record did not resolve,
   * which is every real, server-created application. That was a guess
   * wearing a real-looking value, not a fallback — the exact defect this
   * function's own doc comment already describes fixing for email/phone,
   * left in place for this one field.
   */
  realAddress?: { barangay: string | null },
): AppDetail {
  const businessLabel = business?.name || row.businessName || 'Not provided';
  return {
    row,
    businessLabel,
    region: 'Region V (Bicol Region)',
    email: realContact?.email || applicant?.email || 'Not on file',
    phone: realContact?.mobile || applicant?.mobileNumber || 'Not on file',
    lastUpdated: row.dateSubmitted,
    emailVerification: applicant?.emailVerification ?? unverifiedContact(),
    mobileVerification: applicant?.mobileVerification ?? unverifiedContact(),
    barangay: realAddress?.barangay || applicant?.barangay || 'Not on file',
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
