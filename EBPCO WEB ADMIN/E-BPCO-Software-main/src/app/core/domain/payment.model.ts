// Transaction-based payment ledger — replaces the old application-keyed
// model (one loosely-typed row per application, "verify" flipping every
// pending row for that application to Paid at once). Every payment
// ATTEMPT is its own PaymentTransaction scoped to one Assessment; a
// partial payment, a rejected attempt, and a later successful attempt are
// three distinct rows, never merged or overwritten.

export type PaymentMethod = 'Bank Transfer' | 'Onsite';

export type PaymentTransactionStatus = 'Pending Verification' | 'Verified' | 'Rejected' | 'Voided';

/** Which liability this transaction pays toward — OBO/LGU fees (building/ancillary/filing) are collected separately from BFP fire-code fees in real practice, and each carries its own OR series. */
export type CollectingAgency = 'OBO/LGU' | 'BFP';

/**
 * An official OR number must be entered from an authorized source (the
 * cashier's actual receipt book / the LGU's e-receipting system) — this
 * app can generate its own internal transaction id, but never invents an
 * OR number on someone's behalf. While `orNumber` is null, every
 * generated document referencing this transaction must read "Payment
 * Acknowledgment", never "Official Receipt" (see document-preview.ts).
 */
export interface PaymentTransaction {
  id: string;
  assessmentId: string;
  applicationId: string;
  amountCentavos: number;
  method: PaymentMethod;
  agency: CollectingAgency;
  /** Payer/cashier-supplied reference (bank transaction id, deposit slip number, or an internal counter reference for onsite cash) — must be unique across every transaction, never reused. */
  transactionReference: string;
  /** File name of the uploaded proof of payment — required for every Bank Transfer transaction, always null for Onsite. */
  proofFileName: string | null;
  status: PaymentTransactionStatus;
  submittedAtValue: Date;
  submittedAt: string;
  verifiedAtValue: Date | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
  /** Required whenever status is 'Rejected'. */
  rejectionReason: string | null;
  /** Staff member who recorded an onsite payment; null for applicant-submitted bank transfers. */
  recordedBy: string | null;
  /** Never auto-filled — see the module notice above. */
  orNumber: string | null;
  orDate: string | null;
  orIssuedBy: string | null;
  /** True once voided (see PaymentAdjustment) — a voided transaction is kept for audit history but excluded from every balance/total computation. */
  isVoid: boolean;
}

export type PaymentAdjustmentType = 'Void' | 'Reversal' | 'Refund' | 'Correction';

/**
 * The only way a Verified transaction's effect on a balance is ever
 * undone — a Verified row is never edited or deleted directly. Every
 * adjustment carries a required reason and an actor, and is itself
 * permanent (append-only), so the audit trail always shows both the
 * original transaction and what was later done to it.
 */
export interface PaymentAdjustment {
  id: string;
  transactionId: string;
  type: PaymentAdjustmentType;
  amountCentavos: number;
  reason: string;
  actor: string;
  role: string;
  timestampValue: Date;
  timestamp: string;
}
