export type DocumentStatus = 'Approved' | 'Rejected' | 'Missing' | 'Pending';

// Belongs to exactly one application — replaces the old single
// module-level DOCUMENTS array that every application used to share.
export interface ApplicationDocument {
  id: string;
  applicationId: string;
  label: string;
  fileName: string;
  uploadedAtValue: Date;
  uploadedAt: string;
  status: DocumentStatus;
}
