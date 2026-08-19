import { ApplicationRecord, withProjectedFields } from './application.model';
import {
  ApplicationLifecycleStatus,
  EVALUATION_STAGE_ORDER,
  EvaluationResult,
  EvaluationStage,
  PaymentStatus,
  PermitReleaseStatus,
} from './status.model';
import { Applicant } from './applicant.model';
import { Business, BusinessCategory } from './business.model';
import { ApplicationAction, GeneratedPermit, PermitReleaseRecord, PermitType, ServiceDomain } from './permit.model';
import { ApplicationDocument, DocumentStatus } from './document.model';
import { EvaluationRecord } from './evaluation.model';
import { AssessmentFeeCentavos, PaymentTransaction, totalAssessmentCentavos } from './payment.model';
import { AuditEvent } from './audit.model';
import { AppNotification } from './notification.model';

// ---- Deterministic PRNG ----------------------------------------------------
// So the seeded dataset (and every count an admin sees) stays stable across
// reloads instead of reshuffling every mount.
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- Reference data --------------------------------------------------------

const BUSINESS_SEED: { name: string; category: BusinessCategory; owner: [string, string] }[] = [
  { name: 'Villanueva Hardware & Construction Supply', category: 'Retail', owner: ['Raul', 'Villanueva'] },
  { name: 'Simbulan Sari-Sari Store', category: 'Retail', owner: ['Fe', 'Simbulan'] },
  { name: 'Rodrigo Bakeshop', category: 'Food Service', owner: ['David', 'Rodrigo'] },
  { name: 'Zaballero Auto Repair Shop', category: 'Services', owner: ['Jaime', 'Zaballero'] },
  { name: 'Martirez Rice Mill', category: 'Manufacturing', owner: ['Denise', 'Martirez'] },
  { name: 'Nuñez Feeds & Agri Supply', category: 'Wholesale', owner: ['Jake', 'Nuñez'] },
  { name: 'Villareal Eatery', category: 'Food Service', owner: ['Anthony', 'Villareal'] },
  { name: 'Barrera Internet Café', category: 'Services', owner: ['Axel', 'Barrera'] },
  { name: 'Morales General Merchandise', category: 'Retail', owner: ['Glenn', 'Morales'] },
  { name: 'Bermudez Furniture Shop', category: 'Manufacturing', owner: ['Corazon', 'Bermudez'] },
  { name: 'Salazar Water Refilling Station', category: 'Services', owner: ['Raul', 'Villanueva'] }, // second business, same owner as #1 — demonstrates one applicant owning multiple businesses
  { name: 'Fajota Trading Corp.', category: 'Wholesale', owner: ['Grace', 'Fajota'] },
  { name: "Juan's Coffee Shop", category: 'Food Service', owner: ['Juan', 'Bragais'] },
  { name: 'Reyes Pharmacy', category: 'Retail', owner: ['Liza', 'Reyes'] },
  { name: 'Delos Santos Tailoring', category: 'Services', owner: ['Grace', 'Fajota'] }, // second business, same owner as Fajota Trading
  { name: 'Aquino Poultry Supply', category: 'Wholesale', owner: ['Mark', 'Aquino'] },
];

const OFFICERS = ['Engr. Ricardo Buenaflor', 'Engr. Miriam Castañares', 'Engr. Paolo Ventura'];

const LOCATIONS = [
  'Barangay Poblacion',
  'Barangay Buenavista',
  'Barangay Cogon',
  'Barangay Bonga',
  'Barangay Burabod',
  'Barangay Salvacion',
  'Barangay San Isidro',
];

const DOCUMENT_LABELS = [
  'DTI/SEC Registration',
  'Barangay Clearance',
  "Mayor's Permit (Previous Year)",
  'Lease Contract / Land Title',
  'Fire Safety Inspection Certificate',
  'Sanitary Permit',
  'Locational Clearance',
  'Community Tax Certificate (Cedula)',
];

// One service-domain + permit-type per application, weighted so most
// applications are ordinary Business Permit filings with a smaller share
// of construction/ancillary permit types — matches the relative volume a
// real municipal office would see.
const PERMIT_CHOICES: { domain: ServiceDomain; type: PermitType }[] = [
  { domain: 'Business Permit', type: 'Business Permit' },
  { domain: 'Business Permit', type: 'Business Permit' },
  { domain: 'Business Permit', type: 'Business Permit' },
  { domain: 'Business Permit', type: 'Business Permit' },
  { domain: 'Construction Permit', type: 'New Construction' },
  { domain: 'Construction Permit', type: 'Renovation' },
  { domain: 'Construction Permit', type: 'Addition/Extension' },
  { domain: 'Construction Permit', type: 'Electrical' },
  { domain: 'Construction Permit', type: 'Sanitary/Plumbing' },
  { domain: 'Construction Permit', type: 'Sign' },
];

const ACTIONS: ApplicationAction[] = ['New', 'New', 'New', 'Renewal', 'Renewal', 'Amendment'];

const FEE_SCHEDULE_CENTAVOS: AssessmentFeeCentavos = {
  filing: 25000,
  processing: 15000,
  architectural: 30000,
  structural: 30000,
  electrical: 25000,
  others: 15000,
};

// Weighted lifecycle-status buckets — sums to 1. Skewed toward a realistic
// operational funnel: more mid-pipeline volume than either extreme, with
// enough Revision Required / Payment Under Verification / Ready for
// Release representation that those pages have real rows to show instead
// of being backed by a handful of hardcoded IDs.
const STATUS_WEIGHTS: [ApplicationLifecycleStatus, number][] = [
  ['Submitted', 0.06],
  ['Received', 0.05],
  ['Document Verification', 0.07],
  ['Under Evaluation', 0.1],
  ['Revision Required', 0.08],
  ['Assessed', 0.06],
  ['Payment Submitted', 0.05],
  ['Payment Under Verification', 0.09],
  ['Payment Verified', 0.05],
  ['For Approval', 0.05],
  ['Approved', 0.05],
  ['Permit Generated', 0.04],
  ['Ready for Release', 0.06],
  ['Released', 0.06],
  ['Completed', 0.04],
  ['Rejected', 0.06],
  ['Cancelled', 0.02],
  ['Expired', 0.01],
];

function pickWeighted<T>(rand: () => number, choices: [T, number][]): T {
  const roll = rand();
  let acc = 0;
  for (const [value, weight] of choices) {
    acc += weight;
    if (roll < acc) return value;
  }
  return choices[choices.length - 1][0];
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function addHours(base: Date, hours: number): Date {
  const d = new Date(base);
  d.setHours(d.getHours() + hours);
  return d;
}

// Derives the "how far did evaluation get" and "how far did payment get"
// sub-states from one lifecycle status, so every downstream collection
// (documents, evaluation records, payment, permit/release) is internally
// consistent with the application's actual position instead of being
// independently rolled.
function derivePipelinePosition(status: ApplicationLifecycleStatus): {
  evaluationStage: EvaluationStage;
  evaluationResult: EvaluationResult;
  evaluationStagesPassed: number; // how many of the 5 stages are fully Passed
  paymentStatus: PaymentStatus;
  permitReleaseStatus: PermitReleaseStatus;
} {
  const early = new Set<ApplicationLifecycleStatus>(['Draft', 'Submitted', 'Received']);
  const evaluating = new Set<ApplicationLifecycleStatus>(['Document Verification', 'Under Evaluation']);
  const pastEvaluation = new Set<ApplicationLifecycleStatus>([
    'Assessed',
    'Payment Submitted',
    'Payment Under Verification',
    'Payment Verified',
    'For Approval',
    'Approved',
    'Permit Generated',
    'Ready for Release',
    'Released',
    'Completed',
  ]);

  let evaluationStage: EvaluationStage = 'Initial';
  let evaluationResult: EvaluationResult = 'Pending';
  let evaluationStagesPassed = 0;

  if (early.has(status)) {
    evaluationStage = 'Initial';
    evaluationResult = 'Pending';
    evaluationStagesPassed = 0;
  } else if (evaluating.has(status)) {
    evaluationStage = status === 'Document Verification' ? 'Initial' : 'Zoning';
    evaluationResult = 'Pending';
    evaluationStagesPassed = status === 'Document Verification' ? 0 : 1;
  } else if (status === 'Revision Required') {
    evaluationStage = 'Fire Safety';
    evaluationResult = 'Revision Required';
    evaluationStagesPassed = 2;
  } else if (status === 'Rejected') {
    evaluationStage = 'OBO';
    evaluationResult = 'Rejected';
    evaluationStagesPassed = 3;
  } else if (pastEvaluation.has(status)) {
    evaluationStage = 'Final Approval';
    evaluationResult = 'Passed';
    evaluationStagesPassed = 5;
  } else {
    // Cancelled / Expired — evaluation had reached wherever it stopped.
    evaluationStage = 'Zoning';
    evaluationResult = 'Pending';
    evaluationStagesPassed = 1;
  }

  let paymentStatus: PaymentStatus = 'Not Yet Available';
  if (status === 'Assessed') paymentStatus = 'Not Yet Available';
  else if (status === 'Payment Submitted' || status === 'Payment Under Verification') paymentStatus = 'Pending Verification';
  else if (
    status === 'Payment Verified' ||
    status === 'For Approval' ||
    status === 'Approved' ||
    status === 'Permit Generated' ||
    status === 'Ready for Release' ||
    status === 'Released' ||
    status === 'Completed'
  ) {
    paymentStatus = 'Paid';
  } else if (status === 'Expired') {
    paymentStatus = 'Overdue';
  }

  let permitReleaseStatus: PermitReleaseStatus = 'Not Ready';
  if (status === 'Permit Generated' || status === 'Ready for Release') permitReleaseStatus = 'Ready for Release';
  else if (status === 'Released' || status === 'Completed') permitReleaseStatus = 'Released';

  return { evaluationStage, evaluationResult, evaluationStagesPassed, paymentStatus, permitReleaseStatus };
}

// ---- Public seed shape ------------------------------------------------------

export interface SeedResult {
  applicants: Applicant[];
  businesses: Business[];
  applications: ApplicationRecord[];
  documents: ApplicationDocument[];
  evaluations: EvaluationRecord[];
  payments: PaymentTransaction[];
  permits: GeneratedPermit[];
  releases: PermitReleaseRecord[];
  auditEvents: AuditEvent[];
  notifications: AppNotification[];
}

/**
 * Generates one deterministic, fully cross-linked dataset — every entity
 * everywhere in the admin (dashboard, applications, evaluations, payments,
 * permit release, business stages board, notifications, audit log) reads
 * from this single pass, so a given application ID represents the same
 * applicant, business, dates, and related records on every page.
 */
export function buildSeed(referenceDate: Date = new Date()): SeedResult {
  const rand = mulberry32(20260813);

  // Applicants — one per distinct owner name pair in BUSINESS_SEED.
  const applicantKey = (o: [string, string]) => `${o[0]}|${o[1]}`;
  const applicantIdByKey = new Map<string, string>();
  const applicants: Applicant[] = [];
  BUSINESS_SEED.forEach((b) => {
    const key = applicantKey(b.owner);
    if (applicantIdByKey.has(key)) return;
    const id = `APL-${String(applicants.length + 1).padStart(4, '0')}`;
    applicantIdByKey.set(key, id);
    const emailLocal = `${b.owner[0]}.${b.owner[1]}`.toLowerCase().replace(/[^a-z.]/g, '');
    applicants.push({
      id,
      firstName: b.owner[0],
      lastName: b.owner[1],
      email: `${emailLocal}@gmail.com`,
      mobileNumber: `09${String(150000000 + applicants.length * 137).padStart(9, '0')}`,
    });
  });

  // Businesses — REG-2026-###### IDs, each linked to its owner applicant.
  const businesses: Business[] = BUSINESS_SEED.map((b, i) => {
    const regDate = new Date(referenceDate);
    regDate.setFullYear(regDate.getFullYear() - (1 + (i % 6)));
    regDate.setMonth(i % 12);
    return {
      id: `REG-2026-${String(i + 1).padStart(6, '0')}`,
      name: b.name,
      category: b.category,
      ownerApplicantId: applicantIdByKey.get(applicantKey(b.owner))!,
      street: `${100 + i} Rizal Street`,
      barangay: LOCATIONS[i % LOCATIONS.length].replace('Barangay ', ''),
      city: 'Castilla',
      province: 'Sorsogon',
      registrationNumber: `DTI-${2020 + (i % 6)}-${String(10000 + i * 37).padStart(6, '0')}`,
      dateRegisteredValue: regDate,
      dateRegistered: formatDate(regDate),
      status: rand() < 0.94 ? 'Active' : 'Inactive',
    };
  });

  const count = 50;
  const meanDaysAgo = 9;

  const applications: ApplicationRecord[] = [];
  const documents: ApplicationDocument[] = [];
  const evaluations: EvaluationRecord[] = [];
  const payments: PaymentTransaction[] = [];
  const permits: GeneratedPermit[] = [];
  const releases: PermitReleaseRecord[] = [];
  const auditEvents: AuditEvent[] = [];

  for (let i = 0; i < count; i++) {
    const business = businesses[i % businesses.length];
    const applicant = applicants.find((a) => a.id === business.ownerApplicantId)!;

    let daysAgo = Math.floor(-Math.log(1 - rand()) * meanDaysAgo);
    if (daysAgo > 59) daysAgo = 59;
    const submitted = new Date(referenceDate);
    submitted.setDate(submitted.getDate() - daysAgo);
    submitted.setHours(9 + Math.floor(rand() * 8), Math.floor(rand() * 60), 0, 0);

    const lifecycleStatus = pickWeighted(rand, STATUS_WEIGHTS);
    const pos = derivePipelinePosition(lifecycleStatus);
    const permitChoice = PERMIT_CHOICES[Math.floor(rand() * PERMIT_CHOICES.length)];
    const officer = OFFICERS[Math.floor(rand() * OFFICERS.length)];

    const id = `E-BPCO-2026-${String(100 + i).padStart(6, '0')}`;

    const record = withProjectedFields({
      id,
      businessId: business.id,
      businessName: business.name,
      applicantId: applicant.id,
      applicant: `${applicant.firstName} ${applicant.lastName}`,
      location: LOCATIONS[Math.floor(rand() * LOCATIONS.length)],
      serviceDomain: permitChoice.domain,
      permitType: permitChoice.type,
      applicationAction: ACTIONS[Math.floor(rand() * ACTIONS.length)],
      officer,
      dateValue: submitted,
      dateSubmitted: formatDate(submitted),
      lifecycleStatus,
      evaluationStage: pos.evaluationStage,
      evaluationResult: pos.evaluationResult,
      paymentStatus: pos.paymentStatus,
      permitReleaseStatus: pos.permitReleaseStatus,
      assessedAmountCentavos: pos.paymentStatus === 'Not Yet Available' ? null : totalAssessmentCentavos(FEE_SCHEDULE_CENTAVOS),
    });
    applications.push(record);

    // Audit: submission event always exists.
    let cursor = submitted;
    auditEvents.push({
      id: `AUD-${id}-1`,
      applicationId: id,
      actor: `${applicant.firstName} ${applicant.lastName}`,
      role: 'Applicant',
      action: 'Submitted application',
      timestampValue: cursor,
      timestamp: formatDate(cursor),
      remarks: null,
    });

    // Documents — a handful drawn from the standard checklist, status
    // following how far the application actually got.
    const docCount = 4 + Math.floor(rand() * 4);
    for (let d = 0; d < docCount; d++) {
      const label = DOCUMENT_LABELS[d % DOCUMENT_LABELS.length];
      let status: DocumentStatus = 'Pending';
      if (pos.evaluationStagesPassed >= 1) status = 'Approved';
      if (record.lifecycleStatus === 'Revision Required' && d === docCount - 1) status = 'Rejected';
      if (record.lifecycleStatus === 'Rejected') status = rand() < 0.5 ? 'Rejected' : 'Approved';
      documents.push({
        id: `DOC-${id}-${d + 1}`,
        applicationId: id,
        label,
        fileName: `${label.split(' ')[0].toLowerCase()}-${id}.pdf`,
        uploadedAtValue: addHours(submitted, 2 + d),
        uploadedAt: formatDate(addHours(submitted, 2 + d)),
        status,
      });
    }

    // Evaluations — one record per stage already reached.
    const stagesToWrite = Math.max(pos.evaluationStagesPassed, record.lifecycleStatus === 'Revision Required' ? 3 : 0);
    for (let s = 0; s < EVALUATION_STAGE_ORDER.length; s++) {
      const stage = EVALUATION_STAGE_ORDER[s];
      if (s > stagesToWrite) break;
      const isCurrentStage = stage === pos.evaluationStage;
      const result: EvaluationResult = s < pos.evaluationStagesPassed ? 'Passed' : isCurrentStage ? pos.evaluationResult : 'Pending';
      if (result === 'Pending' && s !== pos.evaluationStagesPassed) continue;
      cursor = addHours(cursor, 6 + s * 4);
      const needsRemarks = result === 'Revision Required' || result === 'Rejected';
      evaluations.push({
        id: `EVAL-${id}-${s + 1}`,
        applicationId: id,
        stage,
        result,
        evaluator: officer,
        remarks: needsRemarks ? 'Submitted documents incomplete — please provide updated Fire Safety Inspection Certificate.' : null,
        evaluatedAtValue: result === 'Pending' ? null : cursor,
        evaluatedAt: result === 'Pending' ? null : formatDate(cursor),
      });
      if (result !== 'Pending') {
        auditEvents.push({
          id: `AUD-${id}-eval-${s + 1}`,
          applicationId: id,
          actor: officer,
          role: 'Evaluator',
          action: `${stage} evaluation: ${result}`,
          timestampValue: cursor,
          timestamp: formatDate(cursor),
          remarks: needsRemarks ? 'Revision requested — see evaluation remarks.' : null,
        });
      }
    }

    // Payment — only once assessed.
    if (pos.paymentStatus !== 'Not Yet Available') {
      cursor = addHours(cursor, 24);
      const amount = totalAssessmentCentavos(FEE_SCHEDULE_CENTAVOS);
      const method = rand() < 0.6 ? 'Onsite' : 'Bank Transfer';
      payments.push({
        id: `PAY-${id}`,
        applicationId: id,
        referenceNumber: `OR-2026-${String(400000 + i * 41).padStart(6, '0')}`,
        amountCentavos: amount,
        method,
        status: pos.paymentStatus,
        submittedAtValue: cursor,
        submittedAt: formatDate(cursor),
        verifiedAtValue: pos.paymentStatus === 'Paid' ? addHours(cursor, 12) : null,
        verifiedAt: pos.paymentStatus === 'Paid' ? formatDate(addHours(cursor, 12)) : null,
        recordedBy: method === 'Onsite' ? officer : null,
      });
      auditEvents.push({
        id: `AUD-${id}-pay`,
        applicationId: id,
        actor: method === 'Onsite' ? officer : applicant.firstName + ' ' + applicant.lastName,
        role: method === 'Onsite' ? 'Cashier' : 'Applicant',
        action: `Payment ${pos.paymentStatus === 'Paid' ? 'verified' : 'recorded'} (${method})`,
        timestampValue: cursor,
        timestamp: formatDate(cursor),
        remarks: null,
      });
    }

    // Permit + release — only once generated/released.
    if (pos.permitReleaseStatus !== 'Not Ready') {
      cursor = addHours(cursor, 24);
      const permitNumber = `PERMIT-2026-${String(1000 + i).padStart(6, '0')}`;
      permits.push({
        applicationId: id,
        permitNumber,
        issuedDateValue: cursor,
        issuedDate: formatDate(cursor),
      });
      if (pos.permitReleaseStatus === 'Released') {
        cursor = addHours(cursor, 24);
        releases.push({
          applicationId: id,
          permitNumber,
          releasingOfficer: officer,
          claimantName: `${applicant.firstName} ${applicant.lastName}`,
          releaseMethod: rand() < 0.85 ? 'Physical Claim' : 'Authorized Representative',
          releasedAtValue: cursor,
          releasedAt: formatDate(cursor),
        });
        auditEvents.push({
          id: `AUD-${id}-release`,
          applicationId: id,
          actor: officer,
          role: 'Releasing Officer',
          action: `Permit ${permitNumber} released`,
          timestampValue: cursor,
          timestamp: formatDate(cursor),
          remarks: null,
        });
      }
    }
  }

  applications.sort((a, b) => b.dateValue.getTime() - a.dateValue.getTime());

  // Notifications — derived from a slice of the audit trail itself, so
  // every referenced application/permit/reference number genuinely exists.
  const notifSource = auditEvents.filter((e) => e.applicationId).slice(-24);
  const notifications: AppNotification[] = [];
  for (let n = 0; n < Math.min(6, notifSource.length); n++) {
    const e = notifSource[notifSource.length - 1 - n];
    notifications.push({
      id: `NOTIF-${n + 1}`,
      applicationId: e.applicationId,
      title: `${e.applicationId} — ${e.action}`,
      message: `${e.action} by ${e.actor} (${e.role}).`,
      createdAtValue: e.timestampValue,
      createdAt: e.timestamp,
      isRead: n > 2,
    });
  }

  return { applicants, businesses, applications, documents, evaluations, payments, permits, releases, auditEvents, notifications };
}

/** @deprecated Use `buildSeed()` and its `.applications` field — kept only so any not-yet-migrated call site still compiles during the transition. */
export function buildApplicationRecords(referenceDate: Date = new Date()): ApplicationRecord[] {
  return buildSeed(referenceDate).applications;
}
