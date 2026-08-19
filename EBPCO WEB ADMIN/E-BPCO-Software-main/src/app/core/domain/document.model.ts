// Full document lifecycle — replaces the old 4-value status. 'Missing'
// exists only as a checklist projection (see `documentChecklistFor` in
// requirements-catalog.ts) for a required document with no matching
// ApplicationDocument row yet; every row actually stored here starts at
// 'Uploaded' and moves forward from there.
export type DocumentStatus =
  | 'Missing'
  | 'Uploaded'
  | 'Submitted'
  | 'Under Review'
  | 'Accepted'
  | 'Rejected'
  | 'Revision Required'
  | 'Expired';

export const DOCUMENT_STATUS_ORDER: DocumentStatus[] = [
  'Missing',
  'Uploaded',
  'Submitted',
  'Under Review',
  'Accepted',
  'Rejected',
  'Revision Required',
  'Expired',
];

/** Statuses that block final approval while any required document still carries one of them — see ApplicationStore.canApprove. */
export const UNRESOLVED_DOCUMENT_STATUSES: ReadonlySet<DocumentStatus> = new Set([
  'Missing',
  'Uploaded',
  'Submitted',
  'Under Review',
  'Rejected',
  'Revision Required',
  'Expired',
]);

// One entry per submitted file for a resubmission chain — resubmitting a
// rejected/revision-required document appends a new ApplicationDocument
// row (see ApplicationStore.resubmitDocument) and keeps this one as
// history rather than overwriting it, so "support resubmission without
// losing document history" holds structurally.
export interface DocumentHistoryEntry {
  fileName: string;
  uploadedAtValue: Date;
  uploadedAt: string;
  status: DocumentStatus;
  remarks: string | null;
}

// Belongs to exactly one application — replaces the old single
// module-level DOCUMENTS array that every application used to share.
// `requirementId` links back to the permit type's requirements-catalog
// entry (see requirements-catalog.ts) so the checklist can show each
// document's reviewing office and required/optional flag without
// duplicating that metadata onto every row.
export interface ApplicationDocument {
  id: string;
  applicationId: string;
  requirementId: string;
  label: string;
  fileName: string;
  uploadedAtValue: Date;
  uploadedAt: string;
  status: DocumentStatus;
  /** The document's own issuing office/agency (e.g. "Bureau of Fire Protection – Castilla"), distinct from the reviewing department recorded on the requirement itself. Null when not applicable/unknown. */
  issuingOffice: string | null;
  issueDateValue: Date | null;
  issueDate: string | null;
  expiryDateValue: Date | null;
  expiryDate: string | null;
  /** Required whenever status is 'Rejected' or 'Revision Required' — enforced by the store. */
  remarks: string | null;
  /** Earlier submissions for this same requirement, oldest first — never cleared on resubmission. */
  history: DocumentHistoryEntry[];
}
