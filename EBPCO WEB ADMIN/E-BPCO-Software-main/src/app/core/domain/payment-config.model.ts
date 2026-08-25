// Payment-method configuration — Super Admin Settings (now the Payments >
// Configuration tab) is the one place these are edited; the payment
// recording form (onsite/bank-transfer) reads `activeMethods` instead of
// hardcoding which methods are offered, so disabling a method here
// actually removes it from the form (previously the form ignored this
// list entirely). Fee amounts/applicability now live in fee-rule.model.ts
// (FeeRule), which supersedes the old six-field FeeConfig shape that
// could not represent a real formula and ignored `applicablePermitTypes`.
export interface PaymentMethodConfig {
  id: string;
  /** The domain-layer PaymentMethod this config entry maps to, or null for methods not yet wired to an actual recording flow. */
  domainMethod: 'Onsite' | 'Bank Transfer' | null;
  name: string;
  description: string;
  active: boolean;
}

// The office's own receiving-bank details — referenced by the "Bank
// Payment" method above ("Deposited or transferred to the LGU's official
// bank account") but never actually specified anywhere until now. Starts
// entirely blank rather than a fabricated bank name/account number — a
// real Municipal Treasurer's Office must fill this in before "Bank
// Payment" is presented to applicants as a genuinely usable method.
export interface OfficeBankInfo {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  /** ISO date string (yyyy-MM-dd) of the last edit, or null if never configured. */
  lastUpdated: string | null;
  lastUpdatedBy: string | null;
}

export const DEFAULT_BANK_INFO: OfficeBankInfo = {
  bankName: '',
  accountName: '',
  accountNumber: '',
  branch: '',
  lastUpdated: null,
  lastUpdatedBy: null,
};

export const DEFAULT_PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: 'cash-onsite',
    domainMethod: 'Onsite',
    name: 'Cash (Onsite)',
    description: 'Paid in person at the Municipal Treasurer’s Office cashier window.',
    active: true,
  },
  {
    id: 'bank-payment',
    domainMethod: 'Bank Transfer',
    name: 'Bank Payment',
    description:
      'Deposited or transferred to the LGU’s official bank account. Requires proof of payment upload.',
    active: true,
  },
  {
    id: 'online-payment',
    domainMethod: null,
    name: 'Online Payment',
    description:
      'Not yet available in this build — shown for configuration only pending an online payment integration.',
    active: false,
  },
  {
    id: 'gov-payment-gateway',
    domainMethod: null,
    name: 'Government Payment Gateway (e.g. GCash/PayMongo via eGov PH)',
    description:
      'Not yet available in this build — shown for configuration only pending LGU adoption of a government payment gateway.',
    active: false,
  },
];
