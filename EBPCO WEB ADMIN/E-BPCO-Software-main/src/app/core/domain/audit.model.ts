// Immutable audit trail entry — actor, role, timestamp, action, and the
// related application, generated from real domain mutations (status
// changes, payment recording, permit release) rather than a disconnected
// static array. Audit events are append-only: nothing in the store ever
// removes or edits one once written.
export interface AuditEvent {
  id: string;
  applicationId: string | null;
  actor: string;
  role: string;
  action: string;
  timestampValue: Date;
  timestamp: string;
  remarks: string | null;
}
