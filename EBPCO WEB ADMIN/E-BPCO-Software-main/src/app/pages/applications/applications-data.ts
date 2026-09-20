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
  barangay: string;
  meta: {
    dateSubmitted: string;
    /** The human reference number (E-BPCO-YYYY-NNNNNN). */
    referenceNumber: string;
    currentStatus: AppStatus;
    /** The server's own 19-status lifecycle state, which `currentStatus` coarsens. */
    lifecycleStatus: string;
    /** `null` when the portal could not name the permit type. */
    permitType: string | null;
    applicationAction: string;
  };
  /**
   * What the application says about the work — the site, and the answers
   * filed on its `form`. Every field is `null` when the record does not hold
   * it; the template renders that as "Not on file", never as a sample value.
   * This section used to be a lot area, a floor area and a floor count that
   * no route had ever sent — "150 sqm" on every application in the system.
   */
  project: {
    location: string;
    scopeOfWork: string | null;
    professionalName: string | null;
    prcNumber: string | null;
    dateReceived: string | null;
  };
  /** How, and by whom, it was filed. `filedAtCounter` is `null` when the record predates the flag. */
  filing: {
    applicantType: string | null;
    ownerOrRepresentative: string | null;
    landlineNumber: string | null;
    filedAtCounter: boolean | null;
  };
  /** The applicant's own address on their record (migration 036). Null fields have never been given. */
  applicantAddress: {
    street: string | null;
    barangay: string | null;
    city: string | null;
    province: string | null;
    postalCode: string | null;
  };
  /** The linked Business's real record, or `null` when the application has none linked. */
  business: {
    name: string;
    tradeName: string | null;
    category: string;
    street: string;
    barangay: string;
    city: string;
    province: string;
    registrationNumber: string;
    dateRegistered: string;
    status: string;
  } | null;
}

/** A `form` answer as a trimmed string, or `null` when absent, empty, or not a string. */
function formText(form: Readonly<Record<string, unknown>> | undefined, key: string): string | null {
  const value = form?.[key];
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
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
  realContact?: { email: string; mobile: string | null; emailVerifiedAt?: string | null },
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
  /**
   * The rest of `GET /staff/applications/:id` this view reads: the filed
   * `form`, the applicant's full address, and the linked Business's own row.
   * Absent for a local-demo row, whose sections then read "Not on file".
   */
  real?: {
    form?: Readonly<Record<string, unknown>>;
    lifecycleStatus?: string;
    applicantAddress?: {
      street: string | null; barangay: string | null; city: string | null;
      province: string | null; postalCode: string | null;
    };
    business?: {
      name: string; category: string; street: string; barangay: string; city: string;
      province: string; registrationNumber: string; dateRegistered: string; status: string;
    } | null;
  },
): AppDetail {
  const businessLabel = real?.business?.name || business?.name || row.businessName || 'Not provided';
  const form = real?.form;
  const filedAtCounter = form?.['filedAtCounter'];
  return {
    row,
    businessLabel,
    region: 'Region V (Bicol Region)',
    email: realContact?.email || applicant?.email || 'Not on file',
    phone: realContact?.mobile || applicant?.mobileNumber || 'Not on file',
    lastUpdated: row.dateSubmitted,
    // The account's own `email_verified_at` when the server supplied the
    // contact; the local mock only for a local-demo row. No mobile
    // counterpart: the LGU records mobile numbers and does not verify them.
    emailVerification: realContact
      ? (realContact.emailVerifiedAt
        ? verifiedContact(realContact.emailVerifiedAt)
        : unverifiedContact())
      : (applicant?.emailVerification ?? unverifiedContact()),
    barangay: realAddress?.barangay || applicant?.barangay || 'Not on file',
    meta: {
      dateSubmitted: row.dateSubmitted,
      referenceNumber: row.id,
      currentStatus: row.status,
      lifecycleStatus: real?.lifecycleStatus ?? row.lifecycleStatus,
      permitType: row.permitType,
      applicationAction: row.applicationAction ?? 'New',
    },
    project: {
      location: row.location,
      scopeOfWork: formText(form, 'scopeOfWork'),
      professionalName: formText(form, 'professionalName'),
      prcNumber: formText(form, 'prcNumber'),
      dateReceived: formText(form, 'dateReceived'),
    },
    filing: {
      applicantType: formText(form, 'applicantType') ?? applicant?.applicantType ?? null,
      ownerOrRepresentative: formText(form, 'ownerOrRepresentative'),
      landlineNumber: formText(form, 'landlineNumber'),
      filedAtCounter: typeof filedAtCounter === 'boolean' ? filedAtCounter : null,
    },
    applicantAddress: {
      street: real?.applicantAddress?.street ?? null,
      barangay: real?.applicantAddress?.barangay ?? applicant?.barangay ?? null,
      city: real?.applicantAddress?.city ?? null,
      province: real?.applicantAddress?.province ?? null,
      postalCode: real?.applicantAddress?.postalCode ?? null,
    },
    business: real?.business
      ? { ...real.business, tradeName: formText(form, 'tradeName') }
      : business
        ? {
            name: business.name, tradeName: null, category: business.category, street: business.street,
            barangay: business.barangay, city: business.city, province: business.province,
            registrationNumber: business.registrationNumber, dateRegistered: business.dateRegistered,
            status: business.status,
          }
        : null,
  };
}

/** The account confirmed a code sent to its email address at `verifiedAt`. `verifiedBy` is the citizen themself — no officer vouched for it. */
function verifiedContact(verifiedAt: string): ContactVerification {
  const when = new Date(verifiedAt);
  return {
    status: 'Verified', method: 'Email Verification Link', verifiedBy: null,
    verifiedAtValue: Number.isNaN(when.getTime()) ? null : when, verifiedAt,
  };
}
