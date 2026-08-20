import { PermitType, ALL_PERMIT_TYPES, permitTypeDomain } from './permit.model';
import { EvaluationStage } from './status.model';

// Per-application-type requirement definitions — the single source every
// surface (the intake form's dynamic checklist, the Documents tab, the
// Evaluation view, the Workflow view, the Forms library) reads instead of
// each one inventing its own document list.
//
// SOURCE / VERIFICATION NOTICE: every entry's `sources` array records
// exactly where its content came from — see the `SRC_*` constants below
// for the real citations (title, URL, jurisdiction, effective date,
// verification status) gathered via live research on 2026-08-20. Two
// kinds of source appear:
//   - NATIONAL_LAW_VERIFIED: a national statute/IRR/circular fetched and
//     quoted directly (PD 1096, RA 9514, the DILG/DTI/ARTA BPLS circular,
//     DTI's own registration portal) — these apply to every Philippine
//     LGU, Castilla included, as a legal baseline.
//   - SAMPLE_REFERENCE_ONLY: another LGU's own published document (Office
//     of the City Building Official, Puerto Princesa) used ONLY as a
//     structural example of how a Unified Application/checklist is laid
//     out — never presented as Castilla's own requirement.
//   - PENDING_CASTILLA_VERIFICATION: the Municipality of Castilla's own
//     Citizen's Charter/BPLO checklist was not accessible during this
//     research pass (castillasorsogon.gov.ph blocked automated fetches);
//     every entry below carries this source so the gap is explicit rather
//     than silently assumed away.
// The national circular itself (ARTA-DTI-DILG-DICT JMC No. 01 s. 2021)
// states that documents not listed in an LGU's OWN Citizen's Charter must
// not be required — meaning the exact per-document checklist is
// genuinely LGU-determined, not something this catalog can finalize
// without Castilla's own published list. `verified` stays `false` on
// every entry until that confirmation happens — do not flip it without
// that step.
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
  'NATIONAL_LAW_VERIFIED' | 'SAMPLE_REFERENCE_ONLY' | 'PENDING_CASTILLA_VERIFICATION';

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
  /** Whole months of validity from issuance, or null when the permit type carries no fixed expiry (e.g. most Certificates). Drives ApplicationStore.generatePermit's expiry date. */
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
    'Republic Act No. 9514 — Fire Code of the Philippines of 2008, Sec. 5(g) & 7(a) (Fire Safety Inspection Certificate is a prerequisite to any occupancy/business/operating permit)',
  url: 'https://lawphil.net/statutes/repacts/ra2008/ra_9514_2008.html',
  jurisdiction: 'Republic of the Philippines — national law, binds every LGU including Castilla',
  effectiveDate: '2008-12-19',
  verificationStatus: 'NATIONAL_LAW_VERIFIED',
};

const SRC_BPLS_JMC: RequirementSource = {
  title:
    'ARTA-DTI-DILG-DICT Joint Memorandum Circular No. 01, s. 2021 — Guidelines for Processing Business Permits, Related Clearances and Licenses (mandates a Unified Application Form; a document NOT listed in an LGU’s own Citizen’s Charter may not be required)',
  url: 'https://www.dilg.gov.ph/issuances/jc/Revised-Standards-in-Processing-Business-Permits-and-Licenses-in-All-Cities-and-Municipalities-/65',
  jurisdiction:
    'Republic of the Philippines — national guidance to all LGUs; does not itself fix Castilla’s specific checklist',
  effectiveDate: '2021-01-01',
  verificationStatus: 'NATIONAL_LAW_VERIFIED',
};

const SRC_DTI_BNRS: RequirementSource = {
  title:
    'DTI Business Name Registration System (BNRS) — official registration portal (5-year certificate validity)',
  url: 'https://bnrs.dti.gov.ph/registration',
  jurisdiction: 'Republic of the Philippines — Department of Trade and Industry (national)',
  effectiveDate: '2026-08-20',
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
    "Municipality of Castilla, Sorsogon — official Citizen's Charter / BPLO documentary checklist",
  url: 'https://www.castillasorsogon.gov.ph/',
  jurisdiction: 'Municipality of Castilla, Sorsogon',
  effectiveDate:
    'UNKNOWN — not accessible to automated research as of 2026-08-20; obtain directly from the Municipality of Castilla BPLO/OBO before production use',
  verificationStatus: 'PENDING_CASTILLA_VERIFICATION',
};

const BUSINESS_SOURCES: RequirementSource[] = [
  SRC_BPLS_JMC,
  SRC_RA9514,
  SRC_DTI_BNRS,
  SRC_CASTILLA_PENDING,
];
const CONSTRUCTION_SOURCES: RequirementSource[] = [
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

// ---- Business Permit variants ---------------------------------------------

const BUSINESS_BASE_DOCS: RequirementDocument[] = [
  doc(
    'bp-dti',
    'DTI Certificate of Registration (sole proprietorship) or SEC/CDA Certificate (partnership/corporation/cooperative)',
    true,
    'bplo',
  ),
  doc('bp-brgy-clearance', 'Barangay Business Clearance', true, 'bplo'),
  doc('bp-lease', 'Lease Contract or Land Title/Tax Declaration of business address', true, 'bplo'),
  doc('bp-locational', 'Locational Clearance / Zoning Certification', true, 'zoning'),
  doc('bp-fsic', 'Fire Safety Inspection Certificate (FSIC)', true, 'bfp'),
  doc('bp-sanitary', 'Sanitary Permit', true, 'health'),
  doc('bp-cedula', 'Community Tax Certificate (Cedula)', true, 'bplo'),
  doc('bp-id', 'Valid Government-Issued ID of Owner/Authorized Representative', true, 'bplo'),
  doc(
    'bp-authorization',
    'Special Power of Attorney / Authorization Letter (if filed by a representative)',
    false,
    'bplo',
  ),
  doc('bp-insurance', 'Fire Insurance Policy (if applicable to business type)', false, 'bfp'),
];

const BUSINESS_EVAL_SEQUENCE: EvaluationSequenceStep[] = [
  { stage: 'Initial', departmentId: 'bplo' },
  { stage: 'Zoning', departmentId: 'zoning' },
  { stage: 'Fire Safety', departmentId: 'bfp' },
  { stage: 'OBO', departmentId: 'health' },
  { stage: 'Final Approval', departmentId: 'mayor' },
];

function businessRequirements(
  permitType: Extract<
    PermitType,
    'New Business Permit' | 'Business Permit Renewal' | 'Business Permit Amendment'
  >,
): ApplicationTypeRequirements {
  const isRenewal = permitType === 'Business Permit Renewal';
  const isAmendment = permitType === 'Business Permit Amendment';
  const documents = isRenewal
    ? [
        doc('bp-prev-permit', "Previous Year's Business Permit", true, 'bplo'),
        ...BUSINESS_BASE_DOCS,
      ]
    : isAmendment
      ? [
          doc('bp-prev-permit', 'Current Business Permit (to be amended)', true, 'bplo'),
          doc(
            'bp-amendment-basis',
            'Proof of change (e.g. updated DTI/SEC record, new lease contract)',
            true,
            'bplo',
          ),
          ...BUSINESS_BASE_DOCS,
        ]
      : BUSINESS_BASE_DOCS;
  return {
    permitType,
    requiredForm: isRenewal
      ? 'Unified/Application Form for Business Permit Renewal'
      : isAmendment
        ? 'Application Form for Business Permit Amendment'
        : 'Unified/Application Form for New Business Permit',
    documents,
    responsibleDepartmentId: 'bplo',
    evaluationSequence: BUSINESS_EVAL_SEQUENCE,
    paymentRequirements:
      'Mayor’s Permit fee, business tax (computed from declared gross receipts/capital), and regulatory fees (sanitary, zoning, fire code) assessed by the Municipal Treasurer’s Office.',
    inspectionRequirements:
      'Fire safety inspection by BFP and sanitary inspection by the Municipal Health Office prior to approval; zoning site verification for new locations.',
    validityRules:
      'Valid for one (1) calendar year from date of issuance; must be renewed on or before January 20 of the following year.',
    validityMonths: 12,
    finalDocument: 'Business Permit (Mayor’s Permit)',
    releaseRequirements:
      'Full payment verified and Business Permit signed by the Municipal Mayor or authorized representative.',
    sourceNote:
      "Legal basis: ARTA-DTI-DILG-DICT JMC No. 01 s.2021 (Unified Application Form) and RA 9514 Sec. 5(g) (FSIC prerequisite); DTI BNRS for the registration certificate. The exact per-document checklist and fee schedule are set by Castilla's own Citizen's Charter, which was not accessible during this research pass — see `sources` below.",
    effectiveDate: EFFECTIVE_DATE,
    verified: false,
    sources: BUSINESS_SOURCES,
  };
}

// ---- Construction / ancillary / certificate permit types ------------------

const CONSTRUCTION_EVAL_SEQUENCE: EvaluationSequenceStep[] = [
  { stage: 'Initial', departmentId: 'obo' },
  { stage: 'Zoning', departmentId: 'zoning' },
  { stage: 'Fire Safety', departmentId: 'bfp' },
  { stage: 'OBO', departmentId: 'obo' },
  { stage: 'Final Approval', departmentId: 'obo' },
];

interface ConstructionSpec {
  permitType: PermitType;
  requiredForm: string;
  professionalDoc: RequirementDocument | null;
  planDocs: RequirementDocument[];
  extraDocs?: RequirementDocument[];
  inspectionRequirements: string;
  validityMonths: number | null;
  validityRules: string;
  finalDocument: string;
}

const CONSTRUCTION_COMMON_DOCS = (prefix: string): RequirementDocument[] => [
  doc(`${prefix}-land-title`, 'Land Title or Tax Declaration of the property', true, 'obo'),
  doc(
    `${prefix}-owner-consent`,
    "Owner's Written Consent (if applicant is not the lot owner)",
    false,
    'obo',
  ),
  doc(`${prefix}-brgy-clearance`, 'Barangay Clearance', true, 'zoning'),
  doc(`${prefix}-locational`, 'Locational Clearance / Zoning Certification', true, 'zoning'),
  doc(`${prefix}-id`, 'Valid Government-Issued ID of Applicant/Owner', true, 'obo'),
];

function constructionRequirements(spec: ConstructionSpec): ApplicationTypeRequirements {
  const prefix = spec.permitType.toLowerCase().replace(/[^a-z]+/g, '-');
  const documents = [
    ...CONSTRUCTION_COMMON_DOCS(prefix),
    ...spec.planDocs,
    ...(spec.professionalDoc ? [spec.professionalDoc] : []),
    ...(spec.extraDocs ?? []),
  ];
  return {
    permitType: spec.permitType,
    requiredForm: spec.requiredForm,
    documents,
    responsibleDepartmentId: 'obo',
    evaluationSequence: CONSTRUCTION_EVAL_SEQUENCE,
    paymentRequirements:
      'Building permit fee, line-item fees per discipline (architectural/structural/electrical/mechanical/sanitary as applicable), and other regulatory fees assessed by the Municipal Treasurer’s Office based on project cost/floor area.',
    inspectionRequirements: spec.inspectionRequirements,
    validityRules: spec.validityRules,
    validityMonths: spec.validityMonths,
    finalDocument: spec.finalDocument,
    releaseRequirements:
      'Full payment verified, OBO final sign-off recorded, and permit signed by the Municipal Engineer/Building Official.',
    sourceNote:
      "Legal basis: PD 1096 (National Building Code) for the permit itself and RA 9514 Sec. 5(g) where a Fire Safety Inspection Certificate is required; Puerto Princesa OCBO's published checklist used only as a structural example of the Unified Application/Ancillary Permit format. Castilla's own OBO checklist and fee schedule were not accessible during this research pass — see `sources` below.",
    effectiveDate: EFFECTIVE_DATE,
    verified: false,
    sources: CONSTRUCTION_SOURCES,
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

const CONSTRUCTION_SPECS: ConstructionSpec[] = [
  {
    permitType: 'New Construction',
    requiredForm: 'Application for Building Permit (New Construction)',
    professionalDoc: null,
    planDocs: BUILDING_PLAN_SET('new-construction'),
    inspectionRequirements:
      'Site inspection prior to permit issuance; periodic inspections during construction; final inspection before Certificate of Occupancy.',
    validityMonths: 12,
    validityRules:
      'Valid for twelve (12) months from issuance; work must commence within one year or the permit lapses and must be renewed.',
    finalDocument: 'Building Permit',
  },
  {
    permitType: 'Renovation',
    requiredForm: 'Application for Building Permit (Renovation/Alteration)',
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
    finalDocument: 'Building Permit (Renovation/Alteration)',
  },
  {
    permitType: 'Addition / Extension',
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
    finalDocument: 'Building Permit (Addition / Extension)',
  },
  {
    permitType: 'Demolition',
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
    permitType: 'Architectural',
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
    permitType: 'Civil / Structural',
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
    permitType: 'Electrical',
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
    permitType: 'Mechanical',
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
    permitType: 'Sanitary / Plumbing',
    requiredForm: 'Application for Sanitary / Plumbing Permit',
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
    finalDocument: 'Sanitary / Plumbing Permit',
  },
  {
    permitType: 'Plumbing',
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
    permitType: 'Electronics',
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
    permitType: 'Interior',
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
    permitType: 'Fencing',
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
    permitType: 'Excavation',
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
];

// ---- Assembled catalog ------------------------------------------------------

export const REQUIREMENTS_CATALOG: Record<PermitType, ApplicationTypeRequirements> = {
  'New Business Permit': businessRequirements('New Business Permit'),
  'Business Permit Renewal': businessRequirements('Business Permit Renewal'),
  'Business Permit Amendment': businessRequirements('Business Permit Amendment'),
  ...Object.fromEntries(
    CONSTRUCTION_SPECS.map((spec) => [spec.permitType, constructionRequirements(spec)]),
  ),
} as Record<PermitType, ApplicationTypeRequirements>;

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

/** True if `type` is one of the three Business Permit variants — the requirements catalog's own domain check, kept here rather than re-deriving `permitTypeDomain` at every call site. */
export function isBusinessPermitType(type: PermitType): boolean {
  return permitTypeDomain(type) === 'Business Permit';
}
