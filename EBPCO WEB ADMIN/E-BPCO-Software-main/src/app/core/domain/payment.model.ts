import { PaymentStatus } from './status.model';

// Mirrors PaymentMethod in payment_assessment_model.dart.
export type PaymentMethod = 'Bank Transfer' | 'Onsite';

// Currency stored as centavos (integer) everywhere in the domain layer —
// only formatted to PHP display strings in the UI. Fee lines mirror
// AssessmentPayment's shape used elsewhere in this app (Filing/Processing/
// Architectural/Structural/Electrical/Others).
export interface AssessmentFeeCentavos {
  filing: number;
  processing: number;
  architectural: number;
  structural: number;
  electrical: number;
  others: number;
}

export function totalAssessmentCentavos(fee: AssessmentFeeCentavos): number {
  return fee.filing + fee.processing + fee.architectural + fee.structural + fee.electrical + fee.others;
}

// A payment transaction always attaches to an existing, already-assessed
// application — recording one must never create a new application ID.
export interface PaymentTransaction {
  id: string;
  applicationId: string;
  referenceNumber: string;
  amountCentavos: number;
  method: PaymentMethod | null;
  status: PaymentStatus;
  submittedAtValue: Date | null;
  submittedAt: string | null;
  verifiedAtValue: Date | null;
  verifiedAt: string | null;
  /** Staff member who recorded an onsite payment; null for applicant-submitted bank transfers. */
  recordedBy: string | null;
}
