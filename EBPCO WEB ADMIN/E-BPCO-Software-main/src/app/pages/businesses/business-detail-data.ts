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
    pendingPayments: string;
    activeUsers: number;
  };
}

const STAFF_NAMES = [
  'Liza Fernandez',
  'Marco Dizon',
  'Angelo Reyes',
  'Cristina Ong',
  'Paolo Santos',
  'Bea Corpuz',
];

// Small deterministic PRNG seeded from the business's own ID, so every reload
// shows the same linked records for the same business instead of reshuffling.
function seedFrom(id: string): () => number {
  let seed = 0;
  for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) | 0;
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed / 0x7fffffff) % 1;
  };
}

export function buildBusinessDetail(
  row: {
    id: string;
    code: string;
    contactName: string;
    dateCreated: string;
    userCount: number;
  },
  linkedApplications: { application: ApplicationRecord; permitNumber: string | null }[],
): BusinessDetail {
  const rand = seedFrom(row.id);

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

  // Mirrors E-BPCO Mobile's generic Business Permit minimum requirements
  // (Valid Government ID, Barangay Clearance, Proof of Business Address).
  const documents: BusinessDocument[] = [
    { name: 'Valid Government ID', status: 'Verified', uploadedDate: row.dateCreated },
    {
      name: 'Barangay Clearance',
      status: rand() > 0.25 ? 'Verified' : 'Pending Review',
      uploadedDate: row.dateCreated,
    },
    {
      name: 'Proof of Business Address',
      status: rand() > 0.15 ? 'Verified' : 'Missing',
      uploadedDate: row.dateCreated,
    },
  ];

  const staffCount = Math.min(row.userCount - 1, 5);
  const users: BusinessUser[] = [
    { name: row.contactName, role: 'Owner', status: 'Active' },
    ...Array.from({ length: Math.max(staffCount, 0) }, (_, i) => ({
      name: STAFF_NAMES[i % STAFF_NAMES.length],
      role: 'Staff' as const,
      status: rand() > 0.15 ? ('Active' as const) : ('Inactive' as const),
    })),
  ];

  const activity: BusinessActivityItem[] = [
    {
      actor: row.contactName,
      title: 'Account registered',
      detail: `${row.code} was registered on the platform.`,
      timeAgo: row.dateCreated,
    },
    {
      actor: row.contactName,
      title: 'Documents submitted',
      detail: 'Valid Government ID and Barangay Clearance uploaded for verification.',
      timeAgo: '2 weeks ago',
    },
    {
      actor: 'Engr. Ricardo Buenaflor',
      title: `${permits[0]?.type ?? 'Building Permit'} application received`,
      detail: `${permits[0]?.applicationId ?? 'No applications yet'} moved to Under Review.`,
      timeAgo: '9 days ago',
    },
    {
      actor: 'System',
      title: 'Payment verified',
      detail: 'Filing fee payment confirmed via Bank Transfer.',
      timeAgo: '5 days ago',
    },
    {
      actor: 'Engr. Ricardo Buenaflor',
      title: approvedPermits > 0 ? 'Permit approved' : 'Evaluation in progress',
      detail:
        approvedPermits > 0
          ? `${permits.find((p) => p.status === 'Approved')?.applicationId} approved and ready for release.`
          : 'Application is still under technical review.',
      timeAgo: '1 day ago',
    },
  ];

  const pendingCentavos = 1500 + Math.floor(rand() * 8500);
  const pendingPayments = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(permits.some((p) => p.status !== 'Approved') ? pendingCentavos : 0);

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
