// Deterministic linked-record generator for the Business detail workspace.
// The business list itself only tracks the fields shown in the table (see
// businesses.ts's BusinessRow) — this builds the *linked* records a real
// business account would have (permits, documents, staff, activity) from
// that same row, so every business's detail view is fully populated and
// internally consistent without a second hand-authored dataset per business.

import { PermitType } from '../../core/domain/permit.model';
import { ApplicationRecord } from '../../core/domain/application.model';

export type PermitStatus = 'Approved' | 'Under Review' | 'Rejected';

export interface LinkedPermit {
  /** The application's own id (e.g. "E-BPCO-2026-000116") — always present. */
  applicationId: string;
  /** The real generated permit number (see ApplicationStore.generatePermit) — null until one has actually been issued. Never the application id presented as if it were the permit number. */
  permitNumber: string | null;
  type: PermitType;
  status: PermitStatus;
  dateSubmitted: string;
}

export interface BusinessDocument {
  name: string;
  status: 'Verified' | 'Pending Review' | 'Missing';
  uploadedDate: string;
}

export interface BusinessUser {
  name: string;
  role: 'Owner' | 'Staff';
  status: 'Active' | 'Inactive';
}

export interface BusinessActivityItem {
  actor: string;
  title: string;
  detail: string;
  timeAgo: string;
}

export interface BusinessDetail {
  permits: LinkedPermit[];
  documents: BusinessDocument[];
  users: BusinessUser[];
  activity: BusinessActivityItem[];
  metrics: {
    totalApplications: number;
    approvedPermits: number;
    /** `null` when the portal holds no payment data for the business — it used to be `1500 + rand()*8500` centavos, formatted as pesos. */
    pendingPayments: string | null;
    activeUsers: number;
  };
}

export function buildBusinessDetail(
  row: {
    id: string;
    code: string;
    contactName: string;
    dateCreated: string;
    /** Unused since the staff list stopped being invented from it; kept so the row shape matches. */
    userCount: number | null;
  },
  linkedApplications: { application: ApplicationRecord; permitNumber: string | null }[],
): BusinessDetail {

  // The real join — every application whose businessId matches this
  // business's own id, via ApplicationRecord.businessId (never matched by
  // applicant name, never a random count). An application's coarse
  // `status` ('Approved' | 'Under Review' | 'Rejected') is exactly
  // PermitStatus's own vocabulary, so it maps straight across. The real
  // permit number (when one has actually been generated) is kept
  // separate from the application id — never presented as the same thing.
  const permits: LinkedPermit[] = linkedApplications.map(({ application: a, permitNumber }) => ({
    applicationId: a.id,
    permitNumber,
    type: a.permitType,
    status: a.status,
    dateSubmitted: a.dateSubmitted,
  }));

  const approvedPermits = permits.filter((p) => p.status === 'Approved').length;

  // Owner ruling, 29 Aug: no document data is held for a business, so none is
  // claimed. This used to be three named documents whose "Verified" /
  // "Pending Review" / "Missing" statuses came from a PRNG seeded on the
  // business id — a "Missing" clearance is something an officer acts on.
  const documents: BusinessDocument[] = [];

  // The owner is real — it is the linked applicant's own name. The staff rows
  // were names from a fixed list with PRNG Active/Inactive statuses.
  const users: BusinessUser[] = [{ name: row.contactName, role: 'Owner', status: 'Active' }];

  // Only the registration entry is a fact the portal holds. The rest was an
  // invented timeline — "Payment verified", "Documents submitted", each with a
  // made-up "2 weeks ago" — presented beside real application ids.
  const activity: BusinessActivityItem[] = [
    {
      actor: row.contactName,
      title: 'Account registered',
      detail: `${row.code} was registered on the platform.`,
      timeAgo: row.dateCreated,
    },
  ];

  // No payment endpoint exists for a business, so there is no figure to show.
  const pendingPayments: string | null = null;

  return {
    permits,
    documents,
    users,
    activity,
    metrics: {
      totalApplications: permits.length,
      approvedPermits,
      pendingPayments,
      activeUsers: users.filter((u) => u.status === 'Active').length,
    },
  };
}
