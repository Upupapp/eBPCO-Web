import { ApplicationRecord, withProjectedFields } from './application.model';
import {
  ApplicationLifecycleStatus,
  EVALUATION_STAGE_ORDER,
  EvaluationResult,
  EvaluationStage,
  PaymentStatus,
  PermitReleaseStatus,
} from './status.model';
import { Applicant, ContactVerification } from './applicant.model';
import { Business, BusinessCategory } from './business.model';
import {
  ALL_PERMIT_TYPES,
  ApplicationAction,
  GeneratedPermit,
  PermitReleaseRecord,
  PermitType,
} from './permit.model';
import { ApplicationDocument, DocumentHistoryEntry, DocumentStatus } from './document.model';
import { EvaluationRecord } from './evaluation.model';
import { AuditEvent } from './audit.model';
import { AppNotification } from './notification.model';
import { RequirementDocument, requirementsFor } from './requirements-catalog';
import { departmentName } from './department.model';

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
  {
    name: 'Villanueva Hardware & Construction Supply',
    category: 'Retail',
    owner: ['Raul', 'Villanueva'],
  },
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

// Doubles as the seed's barangay list — every `location`/`barangay` value
// in this dataset is drawn from here, so the Business Application Stages
// board's "All Barangays" filter (built from the real application data,
// per that requirement) only ever offers barangays that genuinely appear.
const LOCATIONS = [
  'Barangay Poblacion',
  'Barangay Buenavista',
  'Barangay Cogon',
  'Barangay Bonga',
  'Barangay Burabod',
  'Barangay Salvacion',
  'Barangay San Isidro',
];

// The centralized permit-type catalog (permit.model.ts) IS the "one
// centralized list" this weighting reuses — no separate/duplicated type
// list lives here, and every weight key is one of the exact 16 supported
// values (no aliases). Weighted toward Building Permit and Renovation
// Permit as the highest real-world volume, with the remaining ancillary/
// certificate types sharing the rest.
const PERMIT_WEIGHTS: [PermitType, number][] = [
  ['Building Permit', 0.2],
  ['Architectural Permit', 0.05],
  ['Civil / Structural Permit', 0.05],
  ['Demolition Permit', 0.03],
  ['Addition / Extension Permit', 0.06],
  ['Renovation Permit', 0.1],
  ['Electrical Permit', 0.08],
  ['Electronics Permit', 0.03],
  ['Mechanical Permit', 0.04],
  ['Plumbing Permit', 0.04],
  ['Sanitary / Plumbing Permit', 0.05],
  ['Interior Design Permit', 0.04],
  ['Fencing Permit', 0.06],
  ['Sign Permit', 0.06],
  ['Excavation & Ground Preparation Permit', 0.04],
  ['Certificate of Occupancy', 0.07],
];

// A permit can genuinely be filed as New, a Renewal of a prior permit, or
// an Amendment to one already on file — rolled independently of which of
// the 16 permit types it is.
const APPLICATION_ACTIONS: ApplicationAction[] = ['New', 'New', 'New', 'Renewal', 'Amendment'];

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

function addMonths(base: Date, months: number): Date {
  const d = new Date(base);
  d.setMonth(d.getMonth() + months);
  return d;
}

// A document's real-world issuing office (who handed the applicant this
// paper) is often different from the LGU office that reviews it — e.g.
// DTI issues the registration certificate, but BPLO reviews it. This is a
// light heuristic over the requirement id/label, not a second source of
// truth: falls back to the reviewing department's own name when nothing
// more specific applies.
function guessIssuingOffice(requirement: RequirementDocument, barangay: string): string | null {
  const id = requirement.id;
  if (id.includes('dti')) return 'DTI Provincial Office – Sorsogon';
  if (id.includes('brgy')) return `Barangay ${barangay} Hall`;
  if (id.includes('fsic') || id.includes('fire'))
    return 'Bureau of Fire Protection – Castilla Fire Station';
  if (id.includes('sanitary')) return 'Municipal Health Office';
  if (id.includes('prc')) return 'Professional Regulation Commission';
  if (id.includes('locational') || id.includes('zoning'))
    return 'Municipal Planning and Development Office';
  if (id.includes('land-title')) return 'Registry of Deeds – Sorsogon';
  if (id.includes('id') && !id.includes('bfp')) return null; // government-issued IDs have no single "office" worth naming
  return departmentName(requirement.reviewingDepartmentId);
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
  const evaluating = new Set<ApplicationLifecycleStatus>([
    'Document Verification',
    'Under Evaluation',
  ]);
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
  else if (status === 'Payment Submitted' || status === 'Payment Under Verification')
    paymentStatus = 'Pending Verification';
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
  if (status === 'Permit Generated' || status === 'Ready for Release')
    permitReleaseStatus = 'Ready for Release';
  else if (status === 'Released' || status === 'Completed') permitReleaseStatus = 'Released';

  return {
    evaluationStage,
    evaluationResult,
    evaluationStagesPassed,
    paymentStatus,
    permitReleaseStatus,
  };
}

// ---- Public seed shape ------------------------------------------------------

export interface SeedResult {
  applicants: Applicant[];
  businesses: Business[];
  applications: ApplicationRecord[];
  documents: ApplicationDocument[];
  evaluations: EvaluationRecord[];
  permits: GeneratedPermit[];
  releases: PermitReleaseRecord[];
  auditEvents: AuditEvent[];
  notifications: AppNotification[];
}

interface BuildContext {
  rand: () => number;
  referenceDate: Date;
  applications: ApplicationRecord[];
  documents: ApplicationDocument[];
  evaluations: EvaluationRecord[];
  permits: GeneratedPermit[];
  releases: PermitReleaseRecord[];
  auditEvents: AuditEvent[];
}

/**
 * Builds one fully cross-linked application "bundle" (the application
 * record plus its documents/evaluations/payment/permit/release/audit
 * trail) and appends it to `ctx`'s collections. Shared by both the
 * randomized volume pool and the guaranteed one-per-permit-type showcase
 * pass below, so the two never drift on how a record's related data is
 * derived from its lifecycle status.
 */
function buildApplicationBundle(
  ctx: BuildContext,
  index: number,
  business: Business,
  applicant: Applicant,
  permitType: PermitType,
  opts: {
    forcedStatus?: ApplicationLifecycleStatus;
    forceRevisionLoop?: boolean;
    daysAgo?: number;
  } = {},
): ApplicationRecord {
  const { rand, referenceDate } = ctx;
  const requirements = requirementsFor(permitType);

  let daysAgo = opts.daysAgo ?? Math.floor(-Math.log(1 - rand()) * 9);
  if (daysAgo > 59) daysAgo = 59;
  const submitted = new Date(referenceDate);
  submitted.setDate(submitted.getDate() - daysAgo);
  submitted.setHours(9 + Math.floor(rand() * 8), Math.floor(rand() * 60), 0, 0);

  const lifecycleStatus = opts.forcedStatus ?? pickWeighted(rand, STATUS_WEIGHTS);
  const pos = derivePipelinePosition(lifecycleStatus);
  const officer = OFFICERS[Math.floor(rand() * OFFICERS.length)];
  const applicationAction: ApplicationAction =
    APPLICATION_ACTIONS[Math.floor(rand() * APPLICATION_ACTIONS.length)];

  const id = `E-BPCO-2026-${String(100 + index).padStart(6, '0')}`;

  const record = withProjectedFields({
    id,
    businessId: business.id,
    businessName: business.name,
    applicantId: applicant.id,
    applicant: `${applicant.firstName} ${applicant.lastName}`,
    location: `Barangay ${business.barangay}`,
    permitType,
    applicationAction,
    officer,
    dateValue: submitted,
    dateSubmitted: formatDate(submitted),
    lifecycleStatus,
    evaluationStage: pos.evaluationStage,
    evaluationResult: pos.evaluationResult,
    paymentStatus: pos.paymentStatus,
    permitReleaseStatus: pos.permitReleaseStatus,
    // Always starts null — ApplicationStore's constructor drives the real
    // AssessmentStore workflow for every eligible seed record (see
    // ApplicationStore.seedAssessmentFor) and then re-derives this field
    // from that real assessment, instead of a flat total computed here.
    assessedAmountCentavos: null,
  });
  ctx.applications.push(record);

  let cursor = submitted;
  ctx.auditEvents.push({
    id: `AUD-${id}-1`,
    applicationId: id,
    actor: `${applicant.firstName} ${applicant.lastName}`,
    role: 'Applicant',
    action: 'Submitted application',
    timestampValue: cursor,
    timestamp: formatDate(cursor),
    remarks: null,
  });

  // Documents — one per requirement in this permit type's own catalog
  // entry (see requirements-catalog.ts), never a generic rotating list —
  // status follows how far the application actually got.
  requirements.documents.forEach((req, d) => {
    let status: DocumentStatus =
      pos.evaluationStagesPassed >= 1 || lifecycleStatus === 'Rejected' ? 'Accepted' : 'Submitted';
    if (
      lifecycleStatus === 'Revision Required' &&
      d === requirements.documents.length - 1 &&
      req.required
    ) {
      status = 'Revision Required';
    }
    if (lifecycleStatus === 'Rejected' && req.required && rand() < 0.4) status = 'Rejected';
    if (!req.required && rand() < 0.35 && early(lifecycleStatus)) status = 'Missing';

    const uploadedAt = addHours(submitted, 2 + d);
    const history: DocumentHistoryEntry[] = [
      {
        fileName: fileNameFor(req.label, id),
        uploadedAtValue: uploadedAt,
        uploadedAt: formatDate(uploadedAt),
        status,
        remarks: null,
      },
    ];
    ctx.documents.push({
      id: `DOC-${id}-${d + 1}`,
      applicationId: id,
      requirementId: req.id,
      label: req.label,
      fileName: fileNameFor(req.label, id),
      uploadedAtValue: uploadedAt,
      uploadedAt: formatDate(uploadedAt),
      status,
      issuingOffice: guessIssuingOffice(req, business.barangay),
      issueDateValue: uploadedAt,
      issueDate: formatDate(uploadedAt),
      expiryDateValue: null,
      expiryDate: null,
      remarks:
        status === 'Rejected' || status === 'Revision Required'
          ? 'Please submit a clearer/updated copy of this document.'
          : null,
      history,
    });
  });

  // Evaluations — one record per stage already reached, department drawn
  // from this permit type's own evaluation sequence.
  const stageDept = new Map(requirements.evaluationSequence.map((s) => [s.stage, s.departmentId]));
  if (opts.forceRevisionLoop) {
    cursor = addHours(cursor, 10);
    ctx.evaluations.push({
      id: `EVAL-${id}-r0`,
      applicationId: id,
      stage: 'Zoning',
      result: 'Revision Required',
      evaluator: officer,
      departmentId: stageDept.get('Zoning') ?? 'zoning',
      remarks:
        'Submitted plans did not match the declared scope of work — please revise and resubmit the site development plan.',
      evaluatedAtValue: cursor,
      evaluatedAt: formatDate(cursor),
    });
    ctx.auditEvents.push({
      id: `AUD-${id}-r0`,
      applicationId: id,
      actor: officer,
      role: 'Evaluator',
      action: 'Zoning evaluation: Revision Required',
      timestampValue: cursor,
      timestamp: formatDate(cursor),
      remarks: 'Revision requested — see evaluation remarks.',
    });
    cursor = addHours(cursor, 30);
    ctx.auditEvents.push({
      id: `AUD-${id}-r1`,
      applicationId: id,
      actor: `${applicant.firstName} ${applicant.lastName}`,
      role: 'Applicant',
      action: 'Resubmitted revised site development plan',
      timestampValue: cursor,
      timestamp: formatDate(cursor),
      remarks: null,
    });
  }

  const stagesToWrite = Math.max(
    pos.evaluationStagesPassed,
    lifecycleStatus === 'Revision Required' ? 3 : 0,
  );
  for (let s = 0; s < EVALUATION_STAGE_ORDER.length; s++) {
    const stage = EVALUATION_STAGE_ORDER[s];
    if (s > stagesToWrite) break;
    const isCurrentStage = stage === pos.evaluationStage;
    const result: EvaluationResult =
      s < pos.evaluationStagesPassed ? 'Passed' : isCurrentStage ? pos.evaluationResult : 'Pending';
    if (result === 'Pending' && s !== pos.evaluationStagesPassed) continue;
    cursor = addHours(cursor, 6 + s * 4);
    const needsRemarks = result === 'Revision Required' || result === 'Rejected';
    ctx.evaluations.push({
      id: `EVAL-${id}-${s + 1}`,
      applicationId: id,
      stage,
      result,
      evaluator: officer,
      departmentId: stageDept.get(stage) ?? 'obo',
      remarks: needsRemarks
        ? 'Submitted documents incomplete — please provide updated supporting documents.'
        : null,
      evaluatedAtValue: result === 'Pending' ? null : cursor,
      evaluatedAt: result === 'Pending' ? null : formatDate(cursor),
    });
    if (result !== 'Pending') {
      ctx.auditEvents.push({
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

  // Payment — the assessment/transaction chain itself is built by
  // ApplicationStore's constructor DRIVING AssessmentStore's real API
  // (see ApplicationStore.seedAssessmentFor) rather than hand-constructed
  // here, since this is a plain pure function with no access to that
  // stateful service. `pos.paymentStatus` (already computed above) is the
  // target state that pass reproduces.
  if (pos.paymentStatus !== 'Not Yet Available') {
    cursor = addHours(cursor, 24);
  }

  // Permit + release — only once generated/released.
  if (pos.permitReleaseStatus !== 'Not Ready') {
    cursor = addHours(cursor, 24);
    const permitNumber = `PERMIT-2026-${String(1000 + index).padStart(6, '0')}`;
    const approvingOffice = departmentName(requirements.responsibleDepartmentId);
    ctx.permits.push({
      applicationId: id,
      permitNumber,
      issuedDateValue: cursor,
      issuedDate: formatDate(cursor),
      expiryDateValue: requirements.validityMonths
        ? addMonths(cursor, requirements.validityMonths)
        : null,
      expiryDate: requirements.validityMonths
        ? formatDate(addMonths(cursor, requirements.validityMonths))
        : null,
      approvingOfficial: officer,
      approvingOffice,
    });
    ctx.auditEvents.push({
      id: `AUD-${id}-permit`,
      applicationId: id,
      actor: officer,
      role: 'Approving Officer',
      action: `Permit ${permitNumber} generated`,
      timestampValue: cursor,
      timestamp: formatDate(cursor),
      remarks: null,
    });
    if (pos.permitReleaseStatus === 'Released') {
      cursor = addHours(cursor, 24);
      ctx.releases.push({
        applicationId: id,
        permitNumber,
        releasingOfficer: officer,
        claimantName: `${applicant.firstName} ${applicant.lastName}`,
        releaseMethod: rand() < 0.85 ? 'Physical Claim' : 'Authorized Representative',
        releasedAtValue: cursor,
        releasedAt: formatDate(cursor),
      });
      ctx.auditEvents.push({
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

  return record;
}

function early(status: ApplicationLifecycleStatus): boolean {
  return (
    status === 'Draft' ||
    status === 'Submitted' ||
    status === 'Received' ||
    status === 'Document Verification'
  );
}

function fileNameFor(label: string, applicationId: string): string {
  const slug = label
    .toLowerCase()
    .replace(/[()]/g, '')
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .slice(0, 3)
    .join('-');
  return `${slug}-${applicationId}.pdf`;
}

function buildVerification(
  rand: () => number,
  referenceDate: Date,
  verifier: string,
): ContactVerification {
  const roll = rand();
  if (roll < 0.72) {
    const verifiedAt = new Date(referenceDate);
    verifiedAt.setDate(verifiedAt.getDate() - Math.floor(rand() * 200));
    return {
      status: 'Verified',
      method: 'Manual Administrator Confirmation',
      verifiedBy: verifier,
      verifiedAtValue: verifiedAt,
      verifiedAt: formatDate(verifiedAt),
    };
  }
  if (roll < 0.88) {
    return {
      status: 'Pending Verification',
      method: 'Email Verification Link',
      verifiedBy: null,
      verifiedAtValue: null,
      verifiedAt: null,
    };
  }
  if (roll < 0.95) {
    return {
      status: 'Unverified',
      method: null,
      verifiedBy: null,
      verifiedAtValue: null,
      verifiedAt: null,
    };
  }
  return {
    status: 'Verification Failed',
    method: 'Mobile OTP',
    verifiedBy: null,
    verifiedAtValue: null,
    verifiedAt: null,
  };
}

/**
 * Generates one deterministic, fully cross-linked dataset — every entity
 * everywhere in the admin (dashboard, applications, evaluations, payments,
 * permit release, business stages board, notifications, audit log) reads
 * from this single pass, so a given application ID represents the same
 * applicant, business, dates, and related records on every page.
 *
 * Includes one guaranteed, fully-resolved (Completed/Released) sample
 * application per permit type in `ALL_PERMIT_TYPES` — every supported
 * application type has at least one complete, browsable example with
 * documents, evaluation results, a payment + receipt, a generated permit,
 * and a release record, on top of the larger randomized volume pool.
 */
export function buildSeed(referenceDate: Date = new Date()): SeedResult {
  const rand = mulberry32(20260813);

  // Applicants — one per distinct owner name pair in BUSINESS_SEED.
  const applicantKey = (o: [string, string]) => `${o[0]}|${o[1]}`;
  const applicantIdByKey = new Map<string, string>();
  const applicants: Applicant[] = [];
  BUSINESS_SEED.forEach((b, i) => {
    const key = applicantKey(b.owner);
    if (applicantIdByKey.has(key)) return;
    const id = `APL-${String(applicants.length + 1).padStart(4, '0')}`;
    applicantIdByKey.set(key, id);
    const emailLocal = `${b.owner[0]}.${b.owner[1]}`.toLowerCase().replace(/[^a-z.]/g, '');
    const barangay = LOCATIONS[i % LOCATIONS.length].replace('Barangay ', '');
    // "9" + a 9-digit subscriber block == the 10-digit core of a PH
    // mobile number (canonical "+63 9XX XXX XXXX" form validateMobileNumber
    // itself produces — see shared/utils/validators.ts).
    const core = `9${String(150000000 + applicants.length * 137).padStart(9, '0')}`;
    applicants.push({
      id,
      firstName: b.owner[0],
      lastName: b.owner[1],
      email: `${emailLocal}@gmail.com`,
      mobileNumber: `+63 ${core.slice(0, 3)} ${core.slice(3, 6)} ${core.slice(6)}`,
      landlineNumber:
        rand() < 0.3
          ? `(056) ${String(200 + applicants.length).padStart(3, '0')} ${String(1000 + applicants.length * 7).padStart(4, '0')}`
          : null,
      applicantType: rand() < 0.85 ? 'Individual' : 'Authorized Representative',
      addressLine: `Purok ${1 + (i % 4)}, Barangay ${barangay}`,
      barangay,
      emailVerification: buildVerification(rand, referenceDate, 'Ma. Andrea Belarmino'),
      mobileVerification: buildVerification(rand, referenceDate, 'Ma. Andrea Belarmino'),
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

  const ctx: BuildContext = {
    rand,
    referenceDate,
    applications: [],
    documents: [],
    evaluations: [],
    permits: [],
    releases: [],
    auditEvents: [],
  };

  let cursor = 0;

  // ---- Guaranteed showcase: one complete, fully-resolved sample per
  // permit type (satisfies "create a sample package for every application
  // type"). The Renovation showcase specifically demonstrates a revision
  // loop before final approval, per the "Required renovation example".
  for (const permitType of ALL_PERMIT_TYPES) {
    const business = businesses[cursor % businesses.length];
    const applicant = applicants.find((a) => a.id === business.ownerApplicantId)!;
    buildApplicationBundle(ctx, cursor, business, applicant, permitType, {
      forcedStatus: 'Completed',
      forceRevisionLoop: permitType === 'Renovation Permit',
      daysAgo: 20 + (cursor % 30),
    });
    cursor++;
  }

  // ---- Randomized volume pool — realistic funnel distribution across
  // every stage, still only ever assigning a real, centralized permit
  // type (never the removed generic "Business Permit" value).
  const poolCount = 50;
  for (let i = 0; i < poolCount; i++) {
    const business = businesses[cursor % businesses.length];
    const applicant = applicants.find((a) => a.id === business.ownerApplicantId)!;
    const permitType = pickWeighted(rand, PERMIT_WEIGHTS);
    buildApplicationBundle(ctx, cursor, business, applicant, permitType);
    cursor++;
  }

  ctx.applications.sort((a, b) => b.dateValue.getTime() - a.dateValue.getTime());

  // Notifications — derived from a slice of the audit trail itself, so
  // every referenced application/permit/reference number genuinely exists.
  const notifSource = ctx.auditEvents.filter((e) => e.applicationId).slice(-24);
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

  return {
    applicants,
    businesses,
    applications: ctx.applications,
    documents: ctx.documents,
    evaluations: ctx.evaluations,
    permits: ctx.permits,
    releases: ctx.releases,
    auditEvents: ctx.auditEvents,
    notifications,
  };
}

/** @deprecated Use `buildSeed()` and its `.applications` field — kept only so any not-yet-migrated call site still compiles during the transition. */
export function buildApplicationRecords(referenceDate: Date = new Date()): ApplicationRecord[] {
  return buildSeed(referenceDate).applications;
}
