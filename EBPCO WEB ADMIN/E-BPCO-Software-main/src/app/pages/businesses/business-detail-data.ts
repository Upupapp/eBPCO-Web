// Deterministic linked-record generator for the Business detail workspace.
// The business list itself only tracks the fields shown in the table (see
// businesses.ts's BusinessRow) — this builds the *linked* records a real
// business account would have (permits, documents, staff, activity) from
// that same row, so every business's detail view is fully populated and
// internally consistent without a second hand-authored dataset per business.

import { ALL_PERMIT_TYPES, PermitType } from '../../core/domain/permit.model';

export type PermitStatus = 'Approved' | 'Under Review' | 'Rejected';

export interface LinkedPermit {
  id: string;
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

// Reads the one centralized permit-type list (permit.model.ts) — never a
// second, independently-invented set (this used to hardcode its own
// 5-item list including "Fire Safety Certificate", which isn't a
// supported permit type at all).
const PERMIT_TYPES = ALL_PERMIT_TYPES;
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

export function buildBusinessDetail(row: {
  id: string;
  code: string;
  contactName: string;
  dateCreated: string;
  userCount: number;
}): BusinessDetail {
  const rand = seedFrom(row.id);
  const permitCount = 3 + Math.floor(rand() * 4); // 3–6

  const permits: LinkedPermit[] = Array.from({ length: permitCount }, (_, i) => {
    const statusRoll = rand();
    const status: PermitStatus =
      statusRoll < 0.55 ? 'Approved' : statusRoll < 0.85 ? 'Under Review' : 'Rejected';
    return {
      id: `PERMIT-2026-${(100 + i).toString().padStart(6, '0')}`,
      type: PERMIT_TYPES[Math.floor(rand() * PERMIT_TYPES.length)],
      status,
      dateSubmitted: `${1 + Math.floor(rand() * 27)} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][Math.floor(rand() * 6)]} 2026`,
    };
  });

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
      detail: `${permits[0]?.id ?? 'PERMIT-2026-000100'} moved to Under Review.`,
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
          ? `${permits.find((p) => p.status === 'Approved')?.id} approved and ready for release.`
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
