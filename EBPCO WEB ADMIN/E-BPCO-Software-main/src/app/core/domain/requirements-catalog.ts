import { PermitType, ALL_PERMIT_TYPES } from './permit.model';
import { EvaluationStage } from './status.model';

// Per-application-type requirement definitions — the single source every
// surface (the intake form's dynamic checklist, the Documents tab, the
// Evaluation view, the Workflow view, the Forms library) reads instead of
// each one inventing its own document list. Exactly one entry per value
// in `ALL_PERMIT_TYPES` (permit.model.ts) — no extra entries, no
// alternate names for the same type.
//
// SOURCE / VERIFICATION NOTICE: every entry's `sources` array records
// exactly where its content came from — see the `SRC_*` constants below
// for the real citations (title, URL, jurisdiction, effective date,
// verification status) gathered via live research on 2026-08-20. Two
// kinds of source appear:
//   - NATIONAL_LAW_VERIFIED: a national statute/IRR fetched and quoted
//     directly (PD 1096, RA 9514) — applies to every Philippine LGU,
//     Castilla included, as a legal baseline.
//   - SAMPLE_REFERENCE_ONLY: another LGU's own published document (Office
//     of the City Building Official, Puerto Princesa) used ONLY as a
//     structural example of how a Unified Application/checklist is laid
//     out — never presented as Castilla's own requirement.
//   - PENDING_CASTILLA_VERIFICATION: the Municipality of Castilla's own
//     Citizen's Charter/OBO checklist was not accessible during this
//     research pass (castillasorsogon.gov.ph blocked automated fetches);
//     every entry below carries this source so the gap is explicit rather
//     than silently assumed away.
//   - CASTILLA_OFFICIAL_FORM_VERIFIED: the actual official Municipality of
//     Castilla (or its local BFP Castilla Fire Station) application form
//     was obtained directly — bundled under public/assets/permits/ and
//     reviewed in full — so its `url` points to that bundled copy rather
//     than an external https link. This is the strongest verification
//     level short of a written confirmation from the office itself.
// `verified` stays `false` on every entry until Castilla's own office
// confirms it, OR the entry is built directly from an actual Castilla/BFP
// Castilla form obtained and reviewed in full (see CASTILLA_OFFICIAL_FORM_VERIFIED
// above) — do not flip it without one of those two conditions.
export interface RequirementDocument {
  id: string;
  label: string;
  required: boolean;
  reviewingDepartmentId: string;
  description?: string;
}

export interface EvaluationSequenceStep {
  stage: EvaluationStage;
  departmentId: string;
}

export type SourceVerificationStatus =
  | 'NATIONAL_LAW_VERIFIED'
  | 'SAMPLE_REFERENCE_ONLY'
  | 'PENDING_CASTILLA_VERIFICATION'
  | 'CASTILLA_OFFICIAL_FORM_VERIFIED';

export interface RequirementSource {
  title: string;
  url: string;
  jurisdiction: string;
  effectiveDate: string;
  verificationStatus: SourceVerificationStatus;
}

export interface ApplicationTypeRequirements {
  permitType: PermitType;
  requiredForm: string;
  documents: RequirementDocument[];
  responsibleDepartmentId: string;
  evaluationSequence: EvaluationSequenceStep[];
  paymentRequirements: string;
  inspectionRequirements: string;
  validityRules: string;
  /** Whole months of validity from issuance, or null when the permit type carries no fixed expiry (e.g. Certificate of Occupancy). Drives ApplicationStore.generatePermit's expiry date. */
  validityMonths: number | null;
  finalDocument: string;
  releaseRequirements: string;
  /** Short human-readable summary — kept for existing UI text; see `sources` for the actual citations. */
  sourceNote: string;
  /** Catalog-entry review date (when this record was last checked against its sources), not a source's own effective date. */
  effectiveDate: string;
  /** True only once the Municipality of Castilla has confirmed this entry — see the module notice above. */
  verified: boolean;
  /** Every source consulted for this entry, each independently dated and status-tagged. */
  sources: RequirementSource[];
}

const EFFECTIVE_DATE = '2026-08-20';

// ---- Real, independently fetched sources (2026-08-20) ----------------------

const SRC_PD1096: RequirementSource = {
  title:
    'Presidential Decree No. 1096 — National Building Code of the Philippines (official text, DPWH)',
  url: 'https://www.dpwh.gov.ph/DPWH/files/nbc/PD.pdf',
  jurisdiction: 'Republic of the Philippines — national law, binds every LGU including Castilla',
  effectiveDate: '1977-02-19',
  verificationStatus: 'NATIONAL_LAW_VERIFIED',
};

const SRC_RA9514: RequirementSource = {
  title:
    'Republic Act No. 9514 — Fire Code of the Philippines of 2008, Sec. 5(g) & 7(a) (Fire Safety Inspection Certificate is a prerequisite to any occupancy/operating permit)',
  url: 'https://lawphil.net/statutes/repacts/ra2008/ra_9514_2008.html',
  jurisdiction: 'Republic of the Philippines — national law, binds every LGU including Castilla',
  effectiveDate: '2008-12-19',
  verificationStatus: 'NATIONAL_LAW_VERIFIED',
};

const SRC_PPC_OCBO: RequirementSource = {
  title:
    'City of Puerto Princesa, Office of the City Building Official — "Documentary Requirements for Building Permit Applications" (structural reference only)',
  url: 'https://ocbo.puertoprincesa.ph/wp-content/uploads/2022/01/1.-Building-Permit-Checklist.pdf',
  jurisdiction:
    'City of Puerto Princesa, Palawan — NOT the Municipality of Castilla; used only as a structural example of how a Unified Application/Ancillary Permit checklist under PD 1096 is laid out',
  effectiveDate: '2022-01-01',
  verificationStatus: 'SAMPLE_REFERENCE_ONLY',
};

const SRC_CASTILLA_PENDING: RequirementSource = {
  title:
    "Municipality of Castilla, Sorsogon — official Citizen's Charter / OBO documentary checklist",
  url: 'https://www.castillasorsogon.gov.ph/',
  jurisdiction: 'Municipality of Castilla, Sorsogon',
  effectiveDate:
    'UNKNOWN — not accessible to automated research as of 2026-08-20; obtain directly from the Municipality of Castilla OBO before production use',
  verificationStatus: 'PENDING_CASTILLA_VERIFICATION',
};

const SRC_BFP_ARTA_CHARTER: RequirementSource = {
  title: "Bureau of Fire Protection — CY 2021 Updates on BFP Citizen's Charter (ARTA)",
  url: 'https://bfp.gov.ph/wp-content/uploads/2021/12/1-CY-2021-Updates-on-BFP-Citizens-Charter-for-ARTA-Final.pdf',
  jurisdiction:
    'Bureau of Fire Protection — national agency; a general/national-level citizen\'s charter, NOT the Municipality of Castilla\'s own BFP station checklist',
  effectiveDate: '2021-12-01',
  verificationStatus: 'SAMPLE_REFERENCE_ONLY',
};

// The actual Municipality of Castilla MPDO Locational Clearance / Certificate
// of Zoning Compliance form (FM-MPD-12, updated August 2024), obtained
// directly from "LGU Castilla BPCO Forms" and bundled at
// public/assets/permits/Zoning-Locational-Clearance-Form.pdf.
const SRC_CASTILLA_MPDO_ZONING_FORM: RequirementSource = {
  title:
    'Municipality of Castilla, Sorsogon — Municipal Planning and Development Office, "Application for Locational Clearance / Certificate of Zoning Compliance" (Form FM-MPD-12)',
  url: '/assets/permits/Zoning-Locational-Clearance-Form.pdf',
  jurisdiction: 'Municipality of Castilla, Sorsogon — Municipal Planning and Development Office (Zoning Section)',
  effectiveDate: '2024-08-01',
  verificationStatus: 'CASTILLA_OFFICIAL_FORM_VERIFIED',
};

// The actual BFP Castilla Fire Station Fire Safety Evaluation Clearance
// application form (BFP-QSF-FSED-001 Rev.02), obtained directly from "LGU
// Castilla BPCO Forms" and bundled at
// public/assets/permits/FSEC-for-Building-Permit-BFP.pdf.
const SRC_CASTILLA_BFP_FSEC_FORM: RequirementSource = {
  title:
    'Bureau of Fire Protection — Castilla Fire Station (Sorsogon Provincial Office, Region 5), "Fire Safety Evaluation Clearance Application Form" (BFP-QSF-FSED-001 Rev.02)',
  url: '/assets/permits/FSEC-for-Building-Permit-BFP.pdf',
  jurisdiction: 'Bureau of Fire Protection — Castilla Fire Station, Municipality of Castilla, Sorsogon',
  effectiveDate: '2020-08-24',
  verificationStatus: 'CASTILLA_OFFICIAL_FORM_VERIFIED',
};

// The actual BFP Castilla Fire Station Fire Safety Inspection Certificate
// application form (BFP-QSF-FSED-002 Rev.02), obtained directly from "LGU
// Castilla BPCO Forms" and bundled at
// public/assets/permits/FSIC-for-Occupancy-Permit-BFP.pdf.
const SRC_CASTILLA_BFP_FSIC_FORM: RequirementSource = {
  title:
    'Bureau of Fire Protection — Castilla Fire Station (Sorsogon Provincial Office, Region 5), "Fire Safety Inspection Certificate Application Form" (BFP-QSF-FSED-002 Rev.02)',
  url: '/assets/permits/FSIC-for-Occupancy-Permit-BFP.pdf',
  jurisdiction: 'Bureau of Fire Protection — Castilla Fire Station, Municipality of Castilla, Sorsogon',
  effectiveDate: '2020-08-24',
  verificationStatus: 'CASTILLA_OFFICIAL_FORM_VERIFIED',
};

const PERMIT_SOURCES: RequirementSource[] = [
  SRC_PD1096,
  SRC_RA9514,
  SRC_PPC_OCBO,
  SRC_CASTILLA_PENDING,
];

function doc(
  id: string,
  label: string,
  required: boolean,
  reviewingDepartmentId: string,
  description?: string,
): RequirementDocument {
  return { id, label, required, reviewingDepartmentId, description };
}

// Every permit type routes through the same office sequence — there is
// only one workflow domain in this system now (see the "one shared
// source of truth, no categories" requirement on the permit-type list
// itself), so a single evaluation sequence applies uniformly.
const EVAL_SEQUENCE: EvaluationSequenceStep[] = [
  { stage: 'Initial', departmentId: 'obo' },
  { stage: 'Zoning', departmentId: 'zoning' },
  { stage: 'Fire Safety', departmentId: 'bfp' },
  { stage: 'OBO', departmentId: 'obo' },
  { stage: 'Final Approval', departmentId: 'obo' },
];

interface PermitSpec {
  permitType: PermitType;
  requiredForm: string;
  professionalDoc: RequirementDocument | null;
  planDocs: RequirementDocument[];
  extraDocs?: RequirementDocument[];
  inspectionRequirements: string;
  validityMonths: number | null;
  validityRules: string;
  finalDocument: string;
  /** Defaults to 'obo'. Overridden for types routed to another office (Zoning, BFP). */
  responsibleDepartmentId?: string;
  /** Defaults to PERMIT_SOURCES (PD1096/RA9514/PPC-OCBO/Castilla-pending). Overridden for types whose honest sourcing is different (e.g. BFP citizen's charters for FSEC/FSIC). */
  sources?: RequirementSource[];
  /** Defaults to the generic PD1096/RA9514/OCBO paragraph below. */
  sourceNote?: string;
  /** Defaults to the generic building/permit-fee paragraph below. */
  paymentRequirements?: string;
  /** Defaults to the generic "OBO final sign-off" paragraph below. */
  releaseRequirements?: string;
  /** True only for Zoning/Locational Clearance, whose own checklist would otherwise circularly require "Locational Clearance" as one of its own documents. */
  skipLocationalCommonDoc?: boolean;
  /** Defaults to false. Set true only when this entry's documents were built directly from an actual Castilla/BFP Castilla form (CASTILLA_OFFICIAL_FORM_VERIFIED source) rather than a national-law baseline, a same-format sample, or a pending placeholder. */
  verified?: boolean;
}

const COMMON_DOCS = (prefix: string, opts?: { skipLocational?: boolean }): RequirementDocument[] => [
  doc(`${prefix}-land-title`, 'Land Title or Tax Declaration of the property', true, 'obo'),
  doc(
    `${prefix}-owner-consent`,
    "Owner's Written Consent (if applicant is not the lot owner)",
    false,
    'obo',
  ),
  doc(`${prefix}-brgy-clearance`, 'Barangay Clearance', true, 'zoning'),
  ...(opts?.skipLocational
    ? []
    : [doc(`${prefix}-locational`, 'Locational Clearance / Zoning Certification', true, 'zoning')]),
  doc(`${prefix}-id`, 'Valid Government-Issued ID of Applicant/Owner', true, 'obo'),
];

const DEFAULT_PAYMENT_REQUIREMENTS =
  'Building/permit fee, line-item fees per discipline (architectural/structural/electrical/mechanical/sanitary as applicable), and other regulatory fees assessed by the Municipal Treasurer’s Office based on project cost/floor area.';

const DEFAULT_RELEASE_REQUIREMENTS =
  'Full payment verified, OBO final sign-off recorded, and permit signed by the Municipal Engineer/Building Official.';

const DEFAULT_SOURCE_NOTE =
  "Legal basis: PD 1096 (National Building Code) for the permit itself and RA 9514 Sec. 5(g) where a Fire Safety Inspection Certificate is required; Puerto Princesa OCBO's published checklist used only as a structural example of the Unified Application/Ancillary Permit format. Castilla's own OBO checklist and fee schedule were not accessible during this research pass — see `sources` below.";

function buildRequirements(spec: PermitSpec): ApplicationTypeRequirements {
  const prefix = spec.permitType.toLowerCase().replace(/[^a-z]+/g, '-');
  const documents = [
    ...COMMON_DOCS(prefix, { skipLocational: spec.skipLocationalCommonDoc }),
    ...spec.planDocs,
    ...(spec.professionalDoc ? [spec.professionalDoc] : []),
    ...(spec.extraDocs ?? []),
  ];
  return {
    permitType: spec.permitType,
    requiredForm: spec.requiredForm,
    documents,
    responsibleDepartmentId: spec.responsibleDepartmentId ?? 'obo',
    evaluationSequence: EVAL_SEQUENCE,
    paymentRequirements: spec.paymentRequirements ?? DEFAULT_PAYMENT_REQUIREMENTS,
    inspectionRequirements: spec.inspectionRequirements,
    validityRules: spec.validityRules,
    validityMonths: spec.validityMonths,
    finalDocument: spec.finalDocument,
    releaseRequirements: spec.releaseRequirements ?? DEFAULT_RELEASE_REQUIREMENTS,
    sourceNote: spec.sourceNote ?? DEFAULT_SOURCE_NOTE,
    effectiveDate: EFFECTIVE_DATE,
    verified: spec.verified ?? false,
    sources: spec.sources ?? PERMIT_SOURCES,
  };
}

const BUILDING_PLAN_SET = (prefix: string): RequirementDocument[] => [
  doc(`${prefix}-arch-plan`, 'Architectural Plans (signed and sealed)', true, 'obo'),
  doc(
    `${prefix}-struct-plan`,
    'Structural/Civil Plans and Design Analysis (signed and sealed)',
    true,
    'obo',
  ),
  doc(`${prefix}-elec-plan`, 'Electrical Plans (signed and sealed)', true, 'obo'),
  doc(`${prefix}-mech-plan`, 'Mechanical Plans (signed and sealed, if applicable)', false, 'obo'),
  doc(`${prefix}-sanitary-plan`, 'Sanitary / Plumbing Plans (signed and sealed)', true, 'obo'),
  doc(`${prefix}-bom`, 'Bill of Materials and Specifications', true, 'obo'),
  doc(
    `${prefix}-prc`,
    'PRC License and current PTR/Professional Tax Receipt of each Engineer/Architect of Record',
    true,
    'obo',
  ),
];

// One entry per value in `ALL_PERMIT_TYPES` — same order, exact same
// spelling, no extras.
const PERMIT_SPECS: PermitSpec[] = [
  {
    permitType: 'Building Permit – New Construction',
    requiredForm: 'Application for Building Permit (New Construction)',
    professionalDoc: null,
    planDocs: BUILDING_PLAN_SET('building-permit-new-construction'),
    inspectionRequirements:
      'Site inspection prior to permit issuance; periodic inspections during construction; final inspection before Certificate of Occupancy.',
    validityMonths: 12,
    validityRules:
      'Valid for twelve (12) months from issuance; work must commence within one year or the permit lapses and must be renewed.',
    finalDocument: 'Building Permit – New Construction',
  },
  {
    permitType: 'Building Permit – Renovation / Alteration',
    requiredForm: 'Application for Building Permit (Renovation / Alteration)',
    professionalDoc: doc(
      'renovation-prc',
      'PRC License and PTR of Engineer/Architect of Record',
      true,
      'obo',
    ),
    planDocs: [
      doc('renovation-plan', 'Renovation/Alteration Plans (signed and sealed)', true, 'obo'),
      doc(
        'renovation-existing-permit',
        'Copy of Original Building Permit (if available)',
        false,
        'obo',
      ),
      doc('renovation-bom', 'Bill of Materials and Specifications', true, 'obo'),
    ],
    inspectionRequirements:
      'Site inspection to confirm scope matches submitted plans; final inspection upon completion.',
    validityMonths: 12,
    validityRules: 'Valid for twelve (12) months from issuance.',
    finalDocument: 'Building Permit – Renovation / Alteration',
  },
  {
    permitType: 'Building Permit – Addition / Extension',
    requiredForm: 'Application for Building Permit (Addition / Extension)',
    professionalDoc: doc(
      'addition-prc',
      'PRC License and PTR of Engineer/Architect of Record',
      true,
      'obo',
    ),
    planDocs: [
      doc('addition-plan', 'Addition / Extension Plans (signed and sealed)', true, 'obo'),
      doc(
        'addition-struct-plan',
        'Structural Analysis for the added load (signed and sealed)',
        true,
        'obo',
      ),
      doc('addition-bom', 'Bill of Materials and Specifications', true, 'obo'),
    ],
    inspectionRequirements:
      'Structural site inspection to verify the existing structure can carry the addition; final inspection upon completion.',
    validityMonths: 12,
    validityRules: 'Valid for twelve (12) months from issuance.',
    finalDocument: 'Building Permit – Addition / Extension',
  },
  {
    permitType: 'Demolition Permit',
    requiredForm: 'Application for Demolition Permit',
    professionalDoc: doc(
      'demolition-prc',
      'PRC License and PTR of Engineer of Record',
      true,
      'obo',
    ),
    planDocs: [
      doc('demolition-method', 'Method of Demolition / Work Plan', true, 'obo'),
      doc(
        'demolition-safety',
        'Structural Safety Assessment and Safety Measures Plan',
        true,
        'obo',
      ),
    ],
    extraDocs: [
      doc(
        'demolition-utility-clearance',
        'Utility Disconnection Clearance (water/power)',
        false,
        'obo',
      ),
    ],
    inspectionRequirements:
      'Pre-demolition site inspection for safety compliance; post-demolition site clearance inspection.',
    validityMonths: 6,
    validityRules: 'Valid for six (6) months from issuance.',
    finalDocument: 'Demolition Permit',
  },
  {
    // Document list matches the real Municipality of Castilla MPDO form
    // FM-MPD-12 "Application for Locational Clearance / Certificate of
    // Zoning Compliance" exactly (see SRC_CASTILLA_MPDO_ZONING_FORM) —
    // obtained directly from "LGU Castilla BPCO Forms", not general PH LGU
    // practice.
    permitType: 'Zoning / Locational Clearance',
    requiredForm:
      'Application for Locational Clearance / Certificate of Zoning Compliance (Form FM-MPD-12)',
    professionalDoc: null,
    planDocs: [
      doc(
        'zoning-letter-request',
        'Notarized Letter Request addressed to the Zoning Administrator',
        true,
        'zoning',
      ),
      doc('zoning-site-plan', 'Site Development Plan', true, 'zoning'),
      doc('zoning-vicinity-map', 'Vicinity Map', true, 'zoning'),
      doc('zoning-sketch-plan', 'Sketch Plan of the House', true, 'zoning'),
      doc('zoning-bom', 'Bill of Materials', true, 'zoning'),
    ],
    extraDocs: [
      doc('zoning-ownership', 'Proof of Ownership', true, 'zoning'),
      doc('zoning-tax-dec', 'Tax Declaration / Certificate of Title (COT) / OCT', true, 'zoning'),
      doc('zoning-land-tax', 'Land Tax Receipt (Current Year)', true, 'zoning'),
      doc('zoning-brgy-building-clearance', 'Barangay Building Clearance', true, 'zoning'),
      doc('zoning-cedula', 'Cedula (Photocopy)', true, 'zoning'),
      doc('zoning-dpwh', 'DPWH Clearance (if applicable)', false, 'zoning'),
      doc('zoning-ecc', 'Environmental Compliance Certificate / ECC (if applicable)', false, 'zoning'),
    ],
    inspectionRequirements:
      "Ocular site inspection and preparation of a project evaluation report by the Zoning Officer, per FM-MPD-12's own stated procedure.",
    validityMonths: 12,
    validityRules:
      "Valid for twelve (12) months from issuance, per standard LGU clearance practice — the Castilla MPDO form itself does not print a fixed validity period on its face.",
    finalDocument: 'Zoning / Locational Clearance',
    responsibleDepartmentId: 'zoning',
    skipLocationalCommonDoc: true,
    verified: true,
    sourceNote:
      "This clearance is a prerequisite before filing a Building Permit application (its output is the 'Locational Clearance / Zoning Certification' document required by every other permit type's checklist). Document list and procedure transcribed directly from the Municipality of Castilla's own MPDO form FM-MPD-12, obtained and reviewed in full — see `sources` below.",
    paymentRequirements:
      "Zoning fee ('Locational / Zoning of Land' line item) computed and assessed by the Zoning Administrator, per the Unified Application Form's own Box 6 fee schedule.",
    releaseRequirements:
      'Order of Payment issued and paid, evaluation and decision encoded, then the Locational / Zoning Clearance is approved and issued by the Zoning Administrator.',
    sources: [SRC_CASTILLA_MPDO_ZONING_FORM],
  },
  {
    permitType: 'Architectural Permit',
    requiredForm: 'Application for Architectural Permit',
    professionalDoc: doc('arch-prc', 'PRC License and PTR of Architect of Record', true, 'obo'),
    planDocs: [doc('arch-plan', 'Architectural Plans (signed and sealed)', true, 'obo')],
    inspectionRequirements:
      'Included as part of the overall Building Permit site inspection when filed jointly; independent site check when filed standalone.',
    validityMonths: 12,
    validityRules: 'Valid for twelve (12) months from issuance.',
    finalDocument: 'Architectural Permit',
  },
  {
    permitType: 'Civil / Structural Permit',
    requiredForm: 'Application for Civil / Structural Permit',
    professionalDoc: doc(
      'struct-prc',
      'PRC License and PTR of Civil Engineer of Record',
      true,
      'obo',
    ),
    planDocs: [
      doc('struct-plan', 'Structural Plans (signed and sealed)', true, 'obo'),
      doc('struct-analysis', 'Structural Design Analysis', true, 'obo'),
    ],
    inspectionRequirements:
      'Structural site inspection during key pours/erection stages; final structural inspection.',
    validityMonths: 12,
    validityRules: 'Valid for twelve (12) months from issuance.',
    finalDocument: 'Civil / Structural Permit',
  },
  {
    permitType: 'Electrical Permit',
    requiredForm: 'Application for Electrical Permit',
    professionalDoc: doc(
      'elec-prc',
      'PRC License and PTR of Professional Electrical Engineer of Record',
      true,
      'obo',
    ),
    planDocs: [doc('elec-plan', 'Electrical Plans (signed and sealed)', true, 'obo')],
    inspectionRequirements:
      'Electrical rough-in inspection and final electrical inspection prior to energization.',
    validityMonths: 12,
    validityRules: 'Valid for twelve (12) months from issuance.',
    finalDocument: 'Electrical Permit',
  },
  {
    permitType: 'Mechanical Permit',
    requiredForm: 'Application for Mechanical Permit',
    professionalDoc: doc(
      'mech-prc',
      'PRC License and PTR of Professional Mechanical Engineer of Record',
      true,
      'obo',
    ),
    planDocs: [doc('mech-plan', 'Mechanical Plans (signed and sealed)', true, 'obo')],
    inspectionRequirements: 'Mechanical equipment installation inspection prior to operation.',
    validityMonths: 12,
    validityRules: 'Valid for twelve (12) months from issuance.',
    finalDocument: 'Mechanical Permit',
  },
  {
    permitType: 'Sanitary Permit',
    requiredForm: 'Application for Sanitary Permit',
    professionalDoc: doc(
      'sanplumb-prc',
      'PRC License and PTR of Sanitary Engineer/Master Plumber of Record',
      true,
      'obo',
    ),
    planDocs: [doc('sanplumb-plan', 'Sanitary / Plumbing Plans (signed and sealed)', true, 'obo')],
    inspectionRequirements: 'Plumbing rough-in inspection and final sanitary inspection.',
    validityMonths: 12,
    validityRules: 'Valid for twelve (12) months from issuance.',
    finalDocument: 'Sanitary Permit',
  },
  {
    permitType: 'Plumbing Permit',
    requiredForm: 'Application for Plumbing Permit',
    professionalDoc: doc(
      'plumb-prc',
      'PRC License and PTR of Master Plumber of Record',
      true,
      'obo',
    ),
    planDocs: [doc('plumb-plan', 'Plumbing Layout Plans (signed and sealed)', true, 'obo')],
    inspectionRequirements: 'Plumbing rough-in and final inspection.',
    validityMonths: 12,
    validityRules: 'Valid for twelve (12) months from issuance.',
    finalDocument: 'Plumbing Permit',
  },
  {
    permitType: 'Electronics Permit',
    requiredForm: 'Application for Electronics Permit',
    professionalDoc: doc(
      'electronics-prc',
      'PRC License and PTR of Professional Electronics Engineer of Record',
      true,
      'obo',
    ),
    planDocs: [
      doc(
        'electronics-plan',
        'Electronics/Communications Layout Plans (signed and sealed)',
        true,
        'obo',
      ),
    ],
    inspectionRequirements:
      'Installation inspection of electronics/communication systems prior to operation.',
    validityMonths: 12,
    validityRules: 'Valid for twelve (12) months from issuance.',
    finalDocument: 'Electronics Permit',
  },
  {
    permitType: 'Interior Design Permit',
    requiredForm: 'Application for Interior Design Permit',
    professionalDoc: doc(
      'interior-prc',
      'PRC License and PTR of Interior Designer of Record',
      true,
      'obo',
    ),
    planDocs: [
      doc('interior-plan', 'Interior Design Layout Plans (signed and sealed)', true, 'obo'),
    ],
    inspectionRequirements:
      'Site verification that fit-out matches submitted layout and fire egress is preserved.',
    validityMonths: 12,
    validityRules: 'Valid for twelve (12) months from issuance.',
    finalDocument: 'Interior Design Permit',
  },
  {
    permitType: 'Fencing Permit',
    requiredForm: 'Application for Fencing Permit',
    professionalDoc: null,
    planDocs: [doc('fencing-plan', 'Fence Plan / Site Development Plan', true, 'obo')],
    inspectionRequirements: 'Site inspection to confirm fence height/setback compliance.',
    validityMonths: 6,
    validityRules: 'Valid for six (6) months from issuance.',
    finalDocument: 'Fencing Permit',
  },
  {
    permitType: 'Sign Permit',
    requiredForm: 'Application for Signboard/Billboard Permit',
    professionalDoc: doc(
      'sign-prc',
      'PRC License and PTR of Engineer of Record (required for elevated/structural signs)',
      false,
      'obo',
    ),
    planDocs: [
      doc(
        'sign-plan',
        'Sign Design and Structural Detail (if elevated or free-standing)',
        true,
        'obo',
      ),
    ],
    inspectionRequirements: 'Structural safety inspection for elevated or free-standing signs.',
    validityMonths: 12,
    validityRules: 'Valid for twelve (12) months from issuance; subject to annual renewal.',
    finalDocument: 'Sign Permit',
  },
  {
    permitType: 'Excavation Permit',
    requiredForm: 'Application for Excavation Permit',
    professionalDoc: doc(
      'excavation-prc',
      'PRC License and PTR of Engineer of Record',
      true,
      'obo',
    ),
    planDocs: [
      doc('excavation-plan', 'Excavation/Site Development Plan', true, 'obo'),
      doc(
        'excavation-geotech',
        'Geotechnical/Soil Assessment (if excavation exceeds regulated depth)',
        false,
        'obo',
      ),
    ],
    inspectionRequirements:
      'Pre-excavation site inspection for shoring/safety measures; ongoing monitoring for deep excavations.',
    validityMonths: 6,
    validityRules: 'Valid for six (6) months from issuance.',
    finalDocument: 'Excavation Permit',
  },
  {
    // Document list matches the real BFP Castilla Fire Station form
    // BFP-QSF-FSED-001 "Fire Safety Evaluation Clearance Application Form"
    // exactly (see SRC_CASTILLA_BFP_FSEC_FORM) — obtained directly from
    // "LGU Castilla BPCO Forms", not a national-charter generalization.
    permitType: 'FSEC for Building Permit (BFP)',
    requiredForm:
      'Fire Safety Evaluation Clearance Application Form (BFP-QSF-FSED-001, BFP Castilla Fire Station)',
    professionalDoc: null,
    planDocs: [
      doc(
        'fsec-plan-set',
        'Three (3) complete sets of proposed plans: Architectural, Civil/Structural, Electrical, Mechanical, Plumbing, Electronics, Sanitary, and Fire Protection documents',
        true,
        'bfp',
      ),
    ],
    extraDocs: [
      doc('fsec-fscr', 'Fire Safety Compliance Report (FSCR), one (1) set (if necessary)', false, 'bfp'),
      doc(
        'fsec-cost-estimate',
        "Cost Estimate of the building, including labor cost, signed and sealed by the designer/contractor and duly notarized, one (1) set",
        true,
        'bfp',
      ),
      doc(
        'fsec-hotworks-clearance',
        'Fire Safety Clearance for Welding, Cutting, and other Hot Work Operations (if required)',
        false,
        'bfp',
      ),
    ],
    inspectionRequirements:
      "Plan evaluation by BFP Castilla Fire Station personnel (CRO, FCA, FCCA, C,FSES, BPE, CFM/MFM per the form's own monitoring routing); the Fire Marshal approves or disapproves the FSEC application.",
    validityMonths: 12,
    validityRules:
      'Serves as a prerequisite to Building Permit issuance under RA 9514; the form itself does not print a fixed validity/expiry period.',
    finalDocument: 'FSEC for Building Permit (BFP)',
    responsibleDepartmentId: 'bfp',
    verified: true,
    sourceNote:
      "Legal basis: RA 9514 (Fire Code of the Philippines of 2008) — plan evaluation for fire-safety compliance is a statutory prerequisite to a Building Permit. Document list transcribed directly from the actual BFP Castilla Fire Station FSEC application form (BFP-QSF-FSED-001), obtained and reviewed in full — see `sources` below. (An authorized representative must present an authorization letter and a copy of the owner's ID, per the form's own note.)",
    paymentRequirements:
      "Fire Code Construction Tax and related fire-code fees under RA 9514 and its IRR, collected by BFP (see the Unified Application Form's own Box 6 'FOR FIRE SAFETY (BFP)' fee lines).",
    releaseRequirements:
      'Full payment verified and FSEC signed/certified by the BFP Castilla Fire Station Customer Relation Officer and Fire Marshal.',
    sources: [SRC_RA9514, SRC_CASTILLA_BFP_FSEC_FORM, SRC_BFP_ARTA_CHARTER],
  },
  {
    permitType: 'Certificate of Occupancy',
    requiredForm: 'Application for Certificate of Occupancy',
    professionalDoc: null,
    planDocs: [
      doc('coo-asbuilt', 'As-Built Plans', true, 'obo'),
      doc('coo-completion', 'Certificate of Completion', true, 'obo'),
      doc('coo-fsic', 'Fire Safety Inspection Certificate (final)', true, 'bfp'),
      doc('coo-electrical-final', 'Certificate of Final Electrical Inspection', true, 'obo'),
    ],
    inspectionRequirements:
      'Final multi-discipline inspection (architectural, structural, electrical, mechanical, sanitary, fire safety) confirming the completed structure matches approved plans.',
    validityMonths: null,
    validityRules:
      'Valid for the life of the structure unless a change in use, occupancy, or ownership requires re-certification.',
    finalDocument: 'Certificate of Occupancy',
  },
  {
    // Document list matches the real BFP Castilla Fire Station form
    // BFP-QSF-FSED-002 "Fire Safety Inspection Certificate Application
    // Form" — specifically its "FSIC FOR CERTIFICATE OF OCCUPANCY" section
    // (see SRC_CASTILLA_BFP_FSIC_FORM); the form's separate "FSIC FOR
    // BUSINESS PERMIT" section (new/renewal business) does not apply to
    // this permit type and is intentionally excluded here.
    permitType: 'FSIC for Occupancy Permit (BFP)',
    requiredForm:
      'Fire Safety Inspection Certificate Application Form — FSIC for Certificate of Occupancy (BFP-QSF-FSED-002, BFP Castilla Fire Station)',
    professionalDoc: null,
    planDocs: [
      doc(
        'fsic-asbuilt',
        'As-Built Plan (if necessary)',
        false,
        'bfp',
      ),
    ],
    extraDocs: [
      doc('fsic-obo-endorsement', 'Endorsement from the Office of the Building Official (OBO)', true, 'bfp'),
      doc('fsic-completion-cert', 'Certificate of Completion', true, 'bfp'),
      doc(
        'fsic-assessment-copy',
        'Certified True Copy of the Assessment Fee for securing the Certificate of Occupancy from OBO',
        true,
        'bfp',
      ),
      doc('fsic-fsccr', 'Fire Safety Compliance and Commissioning Report (FSCCR), one (1) set (if necessary)', false, 'bfp'),
    ],
    inspectionRequirements:
      "Final fire safety inspection by BFP Castilla Fire Station personnel confirming the completed building complies with fire safety standards, per the form's own monitoring routing (CRO, FCA, FCCA, C,FSES, FSI, CFM/MFM).",
    validityMonths: 12,
    validityRules:
      'A final FSIC is a statutory prerequisite to a Certificate of Occupancy under RA 9514 Sec. 5(g)/7(a); the form itself does not print a fixed validity/expiry period for the occupancy FSIC.',
    finalDocument: 'FSIC for Occupancy Permit (BFP)',
    responsibleDepartmentId: 'bfp',
    verified: true,
    sourceNote:
      "Legal basis: RA 9514 Sec. 5(g)/7(a) — a final Fire Safety Inspection Certificate is a statutory prerequisite to occupancy. This entry exposes FSIC as its own independently-filable permit type for applicants who file the fire inspection separately from the Certificate of Occupancy application itself (which retains its own bundled `coo-fsic` document requirement in the Certificate of Occupancy entry, unchanged). Document list transcribed directly from the actual BFP Castilla Fire Station FSIC application form (BFP-QSF-FSED-002), obtained and reviewed in full — see `sources` below.",
    paymentRequirements:
      "Fire code assessment fee under RA 9514 and its IRR, assessed by BFP and collected through/coordinated with the Municipal Treasurer's Office.",
    releaseRequirements:
      'Full payment verified and FSIC signed/certified by the BFP Castilla Fire Station Customer Relation Officer and Fire Marshal.',
    sources: [SRC_RA9514, SRC_CASTILLA_BFP_FSIC_FORM, SRC_BFP_ARTA_CHARTER],
  },
];

// ---- Assembled catalog ------------------------------------------------------

export const REQUIREMENTS_CATALOG: Record<PermitType, ApplicationTypeRequirements> =
  Object.fromEntries(
    PERMIT_SPECS.map((spec) => [spec.permitType, buildRequirements(spec)]),
  ) as Record<PermitType, ApplicationTypeRequirements>;

// Every catalog entry references a real PermitType from the centralized
// list (never a duplicate/inconsistent name) — asserted here rather than
// left implicit, so a future edit that forgets a type fails loudly.
export function assertCatalogComplete(): void {
  for (const type of ALL_PERMIT_TYPES) {
    if (!REQUIREMENTS_CATALOG[type]) {
      throw new Error(`REQUIREMENTS_CATALOG is missing an entry for permit type "${type}"`);
    }
  }
}

export function requirementsFor(permitType: PermitType): ApplicationTypeRequirements {
  return REQUIREMENTS_CATALOG[permitType];
}
