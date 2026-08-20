import { PermitType } from './permit.model';
import { AssessmentFeeCentavos } from './payment.model';

// Configurable fee/charge types — Super Admin Settings is the one place
// these are edited; every page that shows or computes a fee (Assessments,
// Payment entry, Payment verification, Receipts, Reports, Permit release)
// reads from PaymentConfigStore instead of a hardcoded literal, per the
// "avoid hardcoding configurable payment information in page components"
// requirement.
//
// `id` intentionally matches the six AssessmentFeeCentavos keys
// (filing/processing/architectural/structural/electrical/others) — the
// receipt/assessment line-item shape used across the seed data and the
// Payments page — so `feeScheduleCentavos` below can fold the
// configurable list back into that fixed shape without a second parallel
// naming scheme.
export interface FeeConfig {
  id: 'filing' | 'processing' | 'architectural' | 'structural' | 'electrical' | 'others';
  name: string;
  description: string;
  amountCentavos: number;
  /** Empty = applies to every permit type. */
  applicablePermitTypes: PermitType[];
  collectingOfficeId: string;
  effectiveDate: string;
  active: boolean;
}

export const DEFAULT_FEE_CONFIGS: FeeConfig[] = [
  {
    id: 'filing',
    name: 'Filing Fee',
    description: 'Base fee charged for accepting and logging any application.',
    amountCentavos: 25000,
    applicablePermitTypes: [],
    collectingOfficeId: 'treasury',
    effectiveDate: '2026-01-01',
    active: true,
  },
  {
    id: 'processing',
    name: 'Processing Fee',
    description: 'Administrative processing charge covering document verification and encoding.',
    amountCentavos: 15000,
    applicablePermitTypes: [],
    collectingOfficeId: 'treasury',
    effectiveDate: '2026-01-01',
    active: true,
  },
  {
    id: 'architectural',
    name: 'Architectural Line Item',
    description: 'Charged when an architectural plan review is part of the application.',
    amountCentavos: 30000,
    applicablePermitTypes: [
      'New Construction',
      'Renovation',
      'Addition / Extension',
      'Architectural',
    ],
    collectingOfficeId: 'treasury',
    effectiveDate: '2026-01-01',
    active: true,
  },
  {
    id: 'structural',
    name: 'Structural/Civil Line Item',
    description: 'Charged when a structural/civil plan review is part of the application.',
    amountCentavos: 30000,
    applicablePermitTypes: [
      'New Construction',
      'Renovation',
      'Addition / Extension',
      'Civil / Structural',
    ],
    collectingOfficeId: 'treasury',
    effectiveDate: '2026-01-01',
    active: true,
  },
  {
    id: 'electrical',
    name: 'Electrical Line Item',
    description: 'Charged when an electrical plan review is part of the application.',
    amountCentavos: 25000,
    applicablePermitTypes: ['New Construction', 'Renovation', 'Addition / Extension', 'Electrical'],
    collectingOfficeId: 'treasury',
    effectiveDate: '2026-01-01',
    active: true,
  },
  {
    id: 'others',
    name: 'Other Regulatory Fees',
    description: 'Sanitary, zoning, fire code, and other regulatory fees not itemized separately.',
    amountCentavos: 15000,
    applicablePermitTypes: [],
    collectingOfficeId: 'treasury',
    effectiveDate: '2026-01-01',
    active: true,
  },
];

/** Folds the configurable fee list back into the fixed 6-key shape the seed/receipt code already uses — an inactive fee contributes 0 rather than being removed from the shape entirely, so a receipt line still renders (as ₱0.00) instead of breaking. */
export function feeScheduleCentavos(fees: FeeConfig[]): AssessmentFeeCentavos {
  const byId = new Map(fees.map((f) => [f.id, f]));
  const amount = (id: FeeConfig['id']): number => {
    const f = byId.get(id);
    return f?.active ? f.amountCentavos : 0;
  };
  return {
    filing: amount('filing'),
    processing: amount('processing'),
    architectural: amount('architectural'),
    structural: amount('structural'),
    electrical: amount('electrical'),
    others: amount('others'),
  };
}

// Payment methods configurable from Settings. 'Cash (Onsite)' and 'Bank
// Payment' are the two this prototype's ApplicationStore can actually
// record a transaction against today (see PaymentMethod in
// payment.model.ts — 'Onsite'/'Bank Transfer'); 'Online Payment' and
// 'Government Payment Gateway' are modeled as configuration entries an
// LGU could enable once a real payment integration exists, and are
// inactive by default so this build never implies a capability it
// doesn't have.
export interface PaymentMethodConfig {
  id: string;
  /** The domain-layer PaymentMethod this config entry maps to, or null for methods not yet wired to an actual recording flow. */
  domainMethod: 'Onsite' | 'Bank Transfer' | null;
  name: string;
  description: string;
  active: boolean;
}

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
    description: 'Deposited or transferred to the LGU’s official bank account.',
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
