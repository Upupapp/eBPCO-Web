import { PermitType, ALL_PERMIT_TYPES } from './permit.model';

// Versioned, rules-based fee catalog — replaces the old six-field
// AssessmentFeeCentavos/FeeConfig shape, which could not represent the
// real national fee families (a per-floor-area building-permit formula,
// per-discipline electrical/mechanical/plumbing formulas, DPWH accessory
// fees, BFP fire-code fees) and silently applied every active fee to
// every permit type regardless of `applicablePermitTypes`. Every consumer
// (Assessments, Permit Fee Matrix, Configuration, the draft-assessment
// builder) reads this one catalog through `feeRulesForPermitType`.

export type FeeAuthority = 'DPWH' | 'BFP' | 'LGU';

export type FeeCalculationType = 'flat' | 'per-unit' | 'percentage' | 'bracketed' | 'manual';

/**
 * Whether a fee line applies to a given permit type at all:
 *  - 'required': always charged when this permit type is assessed.
 *  - 'conditional': may apply depending on project specifics (e.g. an
 *    ancillary electrical line item on a Building Permit that already
 *    includes electrical work) — included in a draft assessment but
 *    flagged so an assessor can confirm/remove it before issuing.
 *  - 'not-applicable': this fee family never applies to this permit type
 *    — shown in the Permit Fee Matrix as explicitly non-applicable
 *    rather than silently absent.
 */
export type FeeApplicability = 'required' | 'conditional' | 'not-applicable';

/**
 * Never 'NATIONAL_LAW_VERIFIED' or 'LOCAL_CHARTER_VERIFIED' for a specific
 * peso figure unless that figure was actually read from an accessible,
 * parseable source during this build — see the module notice below for
 * what was and wasn't reachable. A rule's *applicability* (e.g. "COO
 * requires a final FSIC under RA 9514") can be verified independently of
 * whether its *amount* is verified.
 */
export type FeeRuleVerificationStatus =
  'NATIONAL_LAW_VERIFIED' | 'LOCAL_CHARTER_VERIFIED' | 'PENDING_LGU_VALIDATION';

export interface FeeBracket {
  /** Upper bound of this bracket (in the unit named by `unitLabel`), or null for "and above". */
  uptoValue: number | null;
  amountCentavos: number | null;
  label: string;
}

export interface FeeRuleSource {
  title: string;
  url: string;
  publisher: string;
  effectiveDate: string;
  /** What research actually established, so a reader can see why the amount is or isn't verified. */
  accessNote: string;
}

export interface FeeRule {
  id: string;
  code: string;
  name: string;
  /** Groups related per-permit-type rows under one family label in the Permit Fee Matrix (e.g. "Building Permit Fee", "Fire Code Assessment"). */
  family: string;
  authority: FeeAuthority;
  collectingOfficeId: string;
  description: string;
  calculationType: FeeCalculationType;
  /** Names of values an assessor must supply to compute this line (e.g. ['floorAreaSqm']) — empty for a flat fee. */
  requiredInputs: string[];
  flatAmountCentavos: number | null;
  unitAmountCentavos: number | null;
  unitLabel: string | null;
  percentageOf: string | null;
  percentageRate: number | null;
  brackets: FeeBracket[] | null;
  minimumCentavos: number | null;
  maximumCentavos: number | null;
  /** True when no verified/transcribed rate exists yet — the assessment builder must show "Requires assessor input" and leave the line amount for manual entry rather than compute a number. */
  requiresAssessorInput: boolean;
  applicability: Partial<Record<PermitType, FeeApplicability>>;
  effectiveDate: string;
  supersededDate: string | null;
  legalBasisUrl: string;
  legalBasisTitle: string;
  verificationStatus: FeeRuleVerificationStatus;
  active: boolean;
  version: number;
  /** Id of the version this one replaced, or null for the first version. */
  supersedesId: string | null;
  sources: FeeRuleSource[];
}

// ---- Source citations -------------------------------------------------
// Every URL the task named, with an honest accessNote — see the
// implementation report for the actual fetch attempts made this session.

const SRC_DPWH_2016: FeeRuleSource = {
  title: 'DPWH 2016 National Building Code Implementing Rules and Regulations — Fee Schedule',
  url: 'https://www.dpwh.gov.ph/DPWH/files/nbc/NEW.pdf',
  publisher: 'Department of Public Works and Highways',
  effectiveDate: '2016-01-01',
  accessNote:
    'Fetched (481KB) but the PDF text stream could not be parsed into readable text with the tools available during this build (no PDF-rendering utility installed) — bracket tables and rates are therefore NOT transcribed; treat every DPWH-authority line here as PENDING_LGU_VALIDATION until an assessor confirms the actual rate from this document or Castilla OBO.',
};

const SRC_JMC_2018: FeeRuleSource = {
  title:
    '2018 Joint Memorandum Circular — Streamlined Business Permit and Licensing System assessment guidance',
  url: 'https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/10/89926',
  publisher: 'DILG / DTI / ARTA (via Supreme Court e-Library)',
  effectiveDate: '2018-01-01',
  accessNote:
    'Fetch failed (TLS certificate error from this environment) — cited per the task instruction as a source to record, not as a confirmed source of any specific amount.',
};

const SRC_CASTILLA_CHARTER: FeeRuleSource = {
  title: "Municipality of Castilla, Sorsogon — Engineering Office Citizen's Charter",
  url: 'https://www.castillasorsogon.gov.ph/wp-content/uploads/2023/09/Engineerings.pdf',
  publisher: 'Municipality of Castilla, Sorsogon',
  effectiveDate: '2023-09-01',
  accessNote:
    'Fetch returned HTTP 403 Forbidden (consistent with the earlier requirements-catalog.ts research pass finding castillasorsogon.gov.ph unreachable to automated fetches) — no amount from this charter is transcribed here; PENDING_LGU_VALIDATION until Castilla OBO/Treasury confirms directly.',
};

const SRC_RA9514: FeeRuleSource = {
  title: 'Republic Act No. 9514 — Fire Code of the Philippines of 2008',
  url: 'https://lawphil.net/statutes/repacts/ra2008/ra_9514_2008.html',
  publisher: 'Republic of the Philippines',
  effectiveDate: '2008-12-19',
  accessNote:
    'Successfully verified in an earlier research pass (see requirements-catalog.ts SRC_RA9514) that Sec. 5(g)/7(a) make a Fire Safety Inspection Certificate a prerequisite to occupancy — that APPLICABILITY fact is national-law-verified; the fee AMOUNT is not stated in the Act itself (set by IRR/BFP circular) and is not transcribed here.',
};

const SRC_BFP_MC2021_020: FeeRuleSource = {
  title:
    'BFP Memorandum Circular 2021-020 — Supplemental Guidelines on Assessment and Collection of Fire Code Fees',
  url: 'https://bfp.gov.ph/wp-content/uploads/2022/06/MC-2021-020-SUPPLEMENTAL-GUIDELINES-ASSESSMENT-COLLECTION-OF-FIRE-CODE-FEES-REL.-TO-THE-IMPLEMENTATION-OF-RA-9514-OTHERWISE-KNOWN-AS-THE-FIRE-CODE-OF-THE-PHILIPPINES-OF-2008-ITS-REVISED-IRR-OF-2019.pdf',
  publisher: 'Bureau of Fire Protection',
  effectiveDate: '2021-01-01',
  accessNote:
    'Fetch returned HTTP 403 Forbidden — no fire-code fee rate is transcribed here; PENDING_LGU_VALIDATION until an assessor confirms the actual rate from this circular or the local BFP station.',
};

const ALL_SOURCES = [
  SRC_DPWH_2016,
  SRC_JMC_2018,
  SRC_CASTILLA_CHARTER,
  SRC_RA9514,
  SRC_BFP_MC2021_020,
];

export const FEE_RULE_SOURCES: FeeRuleSource[] = ALL_SOURCES;

// ---- Applicability builder ----------------------------------------------

function applicabilityFor(
  required: PermitType[],
  conditional: PermitType[] = [],
): Partial<Record<PermitType, FeeApplicability>> {
  const map: Partial<Record<PermitType, FeeApplicability>> = {};
  for (const t of ALL_PERMIT_TYPES) map[t] = 'not-applicable';
  for (const t of required) map[t] = 'required';
  for (const t of conditional) map[t] = 'conditional';
  return map;
}

const EFFECTIVE_DATE = '2026-08-20';

function rule(
  partial: Omit<
    FeeRule,
    'version' | 'supersedesId' | 'active' | 'effectiveDate' | 'supersededDate'
  >,
): FeeRule {
  return {
    ...partial,
    effectiveDate: EFFECTIVE_DATE,
    supersededDate: null,
    active: true,
    version: 1,
    supersedesId: null,
  };
}

// ---- The catalog ----------------------------------------------------------
// One row per official fee family named in the task. Every row's
// `applicability` covers all 16 ALL_PERMIT_TYPES values (via
// applicabilityFor's not-applicable default) so the Permit Fee Matrix can
// always show required/conditional/not-applicable for any (type, family)
// pair without a missing-cell gap.

export const FEE_RULES: FeeRule[] = [
  // Generic LGU filing/administrative fee — applies to every permit type.
  // This is the one line an LGU can reasonably charge before its own
  // Citizen's Charter is confirmed, so it stays editable in Configuration
  // (the other lines are locked to "Requires assessor input" until a real
  // rate is transcribed).
  rule({
    id: 'filing-fee',
    code: 'LGU-FIL-01',
    name: 'Filing / Application Fee',
    family: 'Filing & Processing',
    authority: 'LGU',
    collectingOfficeId: 'treasury',
    description:
      'Base administrative charge for accepting and logging any permit application, regardless of type.',
    calculationType: 'flat',
    requiredInputs: [],
    flatAmountCentavos: 25000,
    unitAmountCentavos: null,
    unitLabel: null,
    percentageOf: null,
    percentageRate: null,
    brackets: null,
    minimumCentavos: null,
    maximumCentavos: null,
    requiresAssessorInput: false,
    applicability: applicabilityFor(ALL_PERMIT_TYPES),
    legalBasisUrl: SRC_CASTILLA_CHARTER.url,
    legalBasisTitle: SRC_CASTILLA_CHARTER.title,
    verificationStatus: 'PENDING_LGU_VALIDATION',
    sources: [SRC_CASTILLA_CHARTER],
  }),

  // Building formula — Building, Addition/Extension, Renovation.
  rule({
    id: 'building-permit-fee',
    code: 'DPWH-BLD-01',
    name: 'Building Permit Fee',
    family: 'Building Permit Fee',
    authority: 'DPWH',
    collectingOfficeId: 'obo',
    description:
      'National Building Code building-permit fee, computed from floor area / construction cost per the DPWH fee schedule referenced in the IRR.',
    calculationType: 'bracketed',
    requiredInputs: ['floorAreaSqm', 'constructionCostCentavos'],
    flatAmountCentavos: null,
    unitAmountCentavos: null,
    unitLabel: 'per square meter of floor area',
    percentageOf: null,
    percentageRate: null,
    brackets: null,
    minimumCentavos: null,
    maximumCentavos: null,
    requiresAssessorInput: true,
    applicability: applicabilityFor(
      ['Building Permit', 'Addition / Extension Permit', 'Renovation Permit'],
      ['Architectural Permit', 'Civil / Structural Permit'],
    ),
    legalBasisUrl: SRC_DPWH_2016.url,
    legalBasisTitle: SRC_DPWH_2016.title,
    verificationStatus: 'PENDING_LGU_VALIDATION',
    sources: [SRC_DPWH_2016],
  }),

  // Electrical formula.
  rule({
    id: 'electrical-permit-fee',
    code: 'DPWH-ELC-01',
    name: 'Electrical Permit Fee',
    family: 'Electrical Permit Fee',
    authority: 'DPWH',
    collectingOfficeId: 'obo',
    description:
      'Electrical installation fee, computed per outlet/fixture/load per the DPWH fee schedule.',
    calculationType: 'per-unit',
    requiredInputs: ['connectedLoadKva'],
    flatAmountCentavos: null,
    unitAmountCentavos: null,
    unitLabel: 'per kVA of connected load',
    percentageOf: null,
    percentageRate: null,
    brackets: null,
    minimumCentavos: null,
    maximumCentavos: null,
    requiresAssessorInput: true,
    applicability: applicabilityFor(
      ['Electrical Permit'],
      ['Building Permit', 'Addition / Extension Permit', 'Renovation Permit'],
    ),
    legalBasisUrl: SRC_DPWH_2016.url,
    legalBasisTitle: SRC_DPWH_2016.title,
    verificationStatus: 'PENDING_LGU_VALIDATION',
    sources: [SRC_DPWH_2016],
  }),

  // Mechanical formula.
  rule({
    id: 'mechanical-permit-fee',
    code: 'DPWH-MEC-01',
    name: 'Mechanical Permit Fee',
    family: 'Mechanical Permit Fee',
    authority: 'DPWH',
    collectingOfficeId: 'obo',
    description: 'Mechanical equipment/installation fee per the DPWH fee schedule.',
    calculationType: 'per-unit',
    requiredInputs: ['equipmentHp'],
    flatAmountCentavos: null,
    unitAmountCentavos: null,
    unitLabel: 'per horsepower of installed equipment',
    percentageOf: null,
    percentageRate: null,
    brackets: null,
    minimumCentavos: null,
    maximumCentavos: null,
    requiresAssessorInput: true,
    applicability: applicabilityFor(
      ['Mechanical Permit'],
      ['Building Permit', 'Addition / Extension Permit', 'Renovation Permit'],
    ),
    legalBasisUrl: SRC_DPWH_2016.url,
    legalBasisTitle: SRC_DPWH_2016.title,
    verificationStatus: 'PENDING_LGU_VALIDATION',
    sources: [SRC_DPWH_2016],
  }),

  // Plumbing / Sanitary — ONE shared rule for both permit types so a
  // project that files under either name is never charged twice for the
  // same underlying plumbing-fixture fee family.
  rule({
    id: 'plumbing-sanitary-permit-fee',
    code: 'DPWH-PLB-01',
    name: 'Plumbing / Sanitary Permit Fee',
    family: 'Plumbing / Sanitary Permit Fee',
    authority: 'DPWH',
    collectingOfficeId: 'obo',
    description:
      'Plumbing fixture fee per the DPWH fee schedule. Shared by Plumbing Permit and Sanitary / Plumbing Permit — the same underlying fixture-count formula, never charged as two separate line items on one assessment.',
    calculationType: 'per-unit',
    requiredInputs: ['fixtureCount'],
    flatAmountCentavos: null,
    unitAmountCentavos: null,
    unitLabel: 'per plumbing fixture',
    percentageOf: null,
    percentageRate: null,
    brackets: null,
    minimumCentavos: null,
    maximumCentavos: null,
    requiresAssessorInput: true,
    applicability: applicabilityFor(
      ['Plumbing Permit', 'Sanitary / Plumbing Permit'],
      ['Building Permit', 'Addition / Extension Permit', 'Renovation Permit'],
    ),
    legalBasisUrl: SRC_DPWH_2016.url,
    legalBasisTitle: SRC_DPWH_2016.title,
    verificationStatus: 'PENDING_LGU_VALIDATION',
    sources: [SRC_DPWH_2016],
  }),

  // Electronics formula.
  rule({
    id: 'electronics-permit-fee',
    code: 'DPWH-ELN-01',
    name: 'Electronics Permit Fee',
    family: 'Electronics Permit Fee',
    authority: 'DPWH',
    collectingOfficeId: 'obo',
    description: 'Electronics/communications installation fee per the DPWH fee schedule.',
    calculationType: 'per-unit',
    requiredInputs: ['deviceCount'],
    flatAmountCentavos: null,
    unitAmountCentavos: null,
    unitLabel: 'per installed device/point',
    percentageOf: null,
    percentageRate: null,
    brackets: null,
    minimumCentavos: null,
    maximumCentavos: null,
    requiresAssessorInput: true,
    applicability: applicabilityFor(['Electronics Permit']),
    legalBasisUrl: SRC_DPWH_2016.url,
    legalBasisTitle: SRC_DPWH_2016.title,
    verificationStatus: 'PENDING_LGU_VALIDATION',
    sources: [SRC_DPWH_2016],
  }),

  // DPWH accessory-structure fees — Demolition, Fencing, Sign, Excavation.
  // Kept as four distinct rows (different physical basis each) rather
  // than one generic line, but all under the same family label and all
  // "Requires assessor input" until the actual DPWH accessory schedule is
  // transcribed.
  rule({
    id: 'demolition-accessory-fee',
    code: 'DPWH-ACC-DEM',
    name: 'Demolition Permit Fee',
    family: 'DPWH Accessory & Ancillary Structure Fee',
    authority: 'DPWH',
    collectingOfficeId: 'obo',
    description:
      'Demolition fee, typically based on structure valuation/floor area per the DPWH accessory fee schedule.',
    calculationType: 'manual',
    requiredInputs: ['structureValuationCentavos'],
    flatAmountCentavos: null,
    unitAmountCentavos: null,
    unitLabel: null,
    percentageOf: 'declared structure valuation',
    percentageRate: null,
    brackets: null,
    minimumCentavos: null,
    maximumCentavos: null,
    requiresAssessorInput: true,
    applicability: applicabilityFor(['Demolition Permit']),
    legalBasisUrl: SRC_DPWH_2016.url,
    legalBasisTitle: SRC_DPWH_2016.title,
    verificationStatus: 'PENDING_LGU_VALIDATION',
    sources: [SRC_DPWH_2016],
  }),
  rule({
    id: 'fencing-accessory-fee',
    code: 'DPWH-ACC-FEN',
    name: 'Fencing Permit Fee',
    family: 'DPWH Accessory & Ancillary Structure Fee',
    authority: 'DPWH',
    collectingOfficeId: 'obo',
    description:
      'Fence permit fee, typically per linear meter per the DPWH accessory fee schedule.',
    calculationType: 'per-unit',
    requiredInputs: ['lengthLinearMeters'],
    flatAmountCentavos: null,
    unitAmountCentavos: null,
    unitLabel: 'per linear meter of fence',
    percentageOf: null,
    percentageRate: null,
    brackets: null,
    minimumCentavos: null,
    maximumCentavos: null,
    requiresAssessorInput: true,
    applicability: applicabilityFor(['Fencing Permit']),
    legalBasisUrl: SRC_DPWH_2016.url,
    legalBasisTitle: SRC_DPWH_2016.title,
    verificationStatus: 'PENDING_LGU_VALIDATION',
    sources: [SRC_DPWH_2016],
  }),
  rule({
    id: 'sign-accessory-fee',
    code: 'DPWH-ACC-SIGN',
    name: 'Sign / Billboard Permit Fee',
    family: 'DPWH Accessory & Ancillary Structure Fee',
    authority: 'DPWH',
    collectingOfficeId: 'obo',
    description:
      'Signboard/billboard permit fee, typically per square meter of sign face per the DPWH accessory fee schedule.',
    calculationType: 'per-unit',
    requiredInputs: ['signAreaSqm'],
    flatAmountCentavos: null,
    unitAmountCentavos: null,
    unitLabel: 'per square meter of sign face',
    percentageOf: null,
    percentageRate: null,
    brackets: null,
    minimumCentavos: null,
    maximumCentavos: null,
    requiresAssessorInput: true,
    applicability: applicabilityFor(['Sign Permit']),
    legalBasisUrl: SRC_DPWH_2016.url,
    legalBasisTitle: SRC_DPWH_2016.title,
    verificationStatus: 'PENDING_LGU_VALIDATION',
    sources: [SRC_DPWH_2016],
  }),
  rule({
    id: 'excavation-accessory-fee',
    code: 'DPWH-ACC-EXC',
    name: 'Excavation & Ground Preparation Permit Fee',
    family: 'DPWH Accessory & Ancillary Structure Fee',
    authority: 'DPWH',
    collectingOfficeId: 'obo',
    description:
      'Excavation/ground-preparation fee, typically per cubic meter of excavated volume per the DPWH accessory fee schedule.',
    calculationType: 'per-unit',
    requiredInputs: ['volumeCubicMeters'],
    flatAmountCentavos: null,
    unitAmountCentavos: null,
    unitLabel: 'per cubic meter excavated',
    percentageOf: null,
    percentageRate: null,
    brackets: null,
    minimumCentavos: null,
    maximumCentavos: null,
    requiresAssessorInput: true,
    applicability: applicabilityFor(['Excavation & Ground Preparation Permit']),
    legalBasisUrl: SRC_DPWH_2016.url,
    legalBasisTitle: SRC_DPWH_2016.title,
    verificationStatus: 'PENDING_LGU_VALIDATION',
    sources: [SRC_DPWH_2016],
  }),

  // Certificate of Occupancy — occupancy assessment.
  rule({
    id: 'occupancy-assessment-fee',
    code: 'DPWH-COO-01',
    name: 'Certificate of Occupancy — Occupancy Assessment Fee',
    family: 'Occupancy Assessment',
    authority: 'DPWH',
    collectingOfficeId: 'obo',
    description:
      'Occupancy permit assessment fee per the DPWH fee schedule, typically based on floor area/use.',
    calculationType: 'bracketed',
    requiredInputs: ['floorAreaSqm'],
    flatAmountCentavos: null,
    unitAmountCentavos: null,
    unitLabel: 'per square meter of floor area',
    percentageOf: null,
    percentageRate: null,
    brackets: null,
    minimumCentavos: null,
    maximumCentavos: null,
    requiresAssessorInput: true,
    applicability: applicabilityFor(['Certificate of Occupancy']),
    legalBasisUrl: SRC_DPWH_2016.url,
    legalBasisTitle: SRC_DPWH_2016.title,
    verificationStatus: 'PENDING_LGU_VALIDATION',
    sources: [SRC_DPWH_2016],
  }),

  // Fire Code Assessment (BFP, RA 9514) — required on Certificate of
  // Occupancy (final FSIC is a statutory prerequisite — see SRC_RA9514),
  // conditional ancillary line on the building-formula types.
  rule({
    id: 'fire-code-assessment-fee',
    code: 'BFP-FSIC-01',
    name: 'Fire Code Assessment (FSEC/FSIC)',
    family: 'Fire Code Assessment',
    authority: 'BFP',
    collectingOfficeId: 'bfp',
    description:
      'Fire Safety Evaluation Clearance / Fire Safety Inspection Certificate fee under RA 9514 and its IRR. A final FSIC is a statutory prerequisite to a Certificate of Occupancy (RA 9514 Sec. 5(g)/7(a)); applicability of that requirement is verified even though the fee amount is not.',
    calculationType: 'percentage',
    requiredInputs: ['buildingPermitFeeCentavos'],
    flatAmountCentavos: null,
    unitAmountCentavos: null,
    unitLabel: null,
    percentageOf: 'assessed Building Permit Fee',
    percentageRate: null,
    brackets: null,
    minimumCentavos: null,
    maximumCentavos: null,
    requiresAssessorInput: true,
    applicability: applicabilityFor(
      ['Certificate of Occupancy'],
      ['Building Permit', 'Addition / Extension Permit', 'Renovation Permit'],
    ),
    legalBasisUrl: SRC_RA9514.url,
    legalBasisTitle: SRC_RA9514.title,
    verificationStatus: 'PENDING_LGU_VALIDATION',
    sources: [SRC_RA9514, SRC_BFP_MC2021_020],
  }),
];

// Architectural Permit, Civil / Structural Permit, and Interior Design
// Permit deliberately have NO dedicated rule of their own beyond the
// generic Filing Fee and (for the first two) a conditional line under the
// Building Permit Fee family — the DPWH 2016 schedule does not name a
// separate flat formula for these three, and the task instructs not to
// invent one. If Castilla later configures an authorized local charge for
// one of these with a verified legal basis, add it here as a new FeeRule
// rather than reusing/renaming an unrelated family.

const FEE_RULE_BY_ID = new Map(FEE_RULES.map((r) => [r.id, r]));

export function feeRuleById(id: string): FeeRule | undefined {
  return FEE_RULE_BY_ID.get(id);
}

/**
 * The fee rules that apply to `permitType` — active rules only, ordered
 * required-then-conditional, excluding every 'not-applicable' row. This
 * is the ONE place permit-type applicability is consulted; a draft
 * assessment, the Permit Fee Matrix, and the fee-rule tests all call this
 * rather than filtering FEE_RULES ad hoc.
 */
export function feeRulesForPermitType(
  permitType: PermitType,
  rules: FeeRule[] = FEE_RULES,
): { rule: FeeRule; applicability: FeeApplicability }[] {
  return rules
    .filter((r) => r.active)
    .map((r) => ({ rule: r, applicability: r.applicability[permitType] ?? 'not-applicable' }))
    .filter((entry) => entry.applicability !== 'not-applicable')
    .sort((a, b) =>
      a.applicability === b.applicability ? 0 : a.applicability === 'required' ? -1 : 1,
    );
}

/** Every (family, permitType) applicability cell, for the Permit Fee Matrix — includes 'not-applicable' cells so the matrix never has a silent gap. */
export function feeMatrixFor(
  permitType: PermitType,
  rules: FeeRule[] = FEE_RULES,
): { rule: FeeRule; applicability: FeeApplicability }[] {
  return rules
    .filter((r) => r.active)
    .map((r) => ({ rule: r, applicability: r.applicability[permitType] ?? 'not-applicable' }));
}
