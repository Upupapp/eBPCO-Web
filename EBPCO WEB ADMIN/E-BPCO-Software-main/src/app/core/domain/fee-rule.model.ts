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

// The actual Municipality of Castilla "Unified Application Form for
// Building Permit" (back-to-back), obtained directly from "LGU Castilla
// BPCO Forms" and reviewed in full. Box 6 of this form ("Assessed Fees,"
// filled by the Processing and Evaluation Division) is the source of
// truth that Architectural, Civil/Structural, Sanitary, Plumbing, and
// Interior are each billed as their own separate line item locally, and
// that "Line and Grade (Geodetic)" and "Hotworks" are real fee lines with
// no equivalent anywhere in the previously-modeled DPWH-only catalog. The
// form itself is a blank application form, not a published fee schedule
// — it names every line item Castilla actually assesses, but prints no
// peso amounts, so every new rule sourced from it is PENDING_LGU_VALIDATION
// like everything else authority-DPWH/BFP in this file.
const SRC_CASTILLA_UNIFIED_FORM: FeeRuleSource = {
  title:
    'Municipality of Castilla, Sorsogon — "Unified Application Form for Building Permit" (Box 6: Assessed Fees)',
  url: '/assets/permits/New-Construction.pdf',
  publisher: 'Municipality of Castilla, Sorsogon — Office of the Building Official',
  effectiveDate: '2026-08-24',
  accessNote:
    "Obtained directly and reviewed in full (bundled at public/assets/permits/New-Construction.pdf) — confirms these fee lines are genuinely assessed by Castilla, but the form itself prints no peso amounts, so every rate here remains PENDING_LGU_VALIDATION until an assessor or the Citizen's Charter confirms the actual figure.",
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
  SRC_CASTILLA_UNIFIED_FORM,
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
      [
        'Building Permit – New Construction',
        'Building Permit – Addition / Extension',
        'Building Permit – Renovation / Alteration',
      ],
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
      [
        'Building Permit – New Construction',
        'Building Permit – Addition / Extension',
        'Building Permit – Renovation / Alteration',
      ],
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
      [
        'Building Permit – New Construction',
        'Building Permit – Addition / Extension',
        'Building Permit – Renovation / Alteration',
      ],
    ),
    legalBasisUrl: SRC_DPWH_2016.url,
    legalBasisTitle: SRC_DPWH_2016.title,
    verificationStatus: 'PENDING_LGU_VALIDATION',
    sources: [SRC_DPWH_2016],
  }),

  // Plumbing and Sanitary — two independent rules. These used to share
  // ONE rule (on the theory that a project filed under either name draws
  // from the same fixture-count formula) — but the real Castilla Unified
  // Application Form's Box 6 lists "SANITARY" and "PLUMBING" as two
  // separate assessed-fee line items, so they're billed independently
  // here to match.
  rule({
    id: 'plumbing-permit-fee',
    code: 'DPWH-PLB-01',
    name: 'Plumbing Permit Fee',
    family: 'Plumbing Permit Fee',
    authority: 'DPWH',
    collectingOfficeId: 'obo',
    description: 'Plumbing fixture fee per the DPWH fee schedule.',
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
      ['Plumbing Permit'],
      [
        'Building Permit – New Construction',
        'Building Permit – Addition / Extension',
        'Building Permit – Renovation / Alteration',
      ],
    ),
    legalBasisUrl: SRC_DPWH_2016.url,
    legalBasisTitle: SRC_DPWH_2016.title,
    verificationStatus: 'PENDING_LGU_VALIDATION',
    sources: [SRC_DPWH_2016, SRC_CASTILLA_UNIFIED_FORM],
  }),
  rule({
    id: 'sanitary-permit-fee',
    code: 'DPWH-SAN-01',
    name: 'Sanitary Permit Fee',
    family: 'Sanitary Permit Fee',
    authority: 'DPWH',
    collectingOfficeId: 'obo',
    description: 'Sanitary installation fee per the DPWH fee schedule, billed separately from the Plumbing Permit Fee per Castilla\'s own Box 6 assessment sheet.',
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
      ['Sanitary Permit'],
      [
        'Building Permit – New Construction',
        'Building Permit – Addition / Extension',
        'Building Permit – Renovation / Alteration',
      ],
    ),
    legalBasisUrl: SRC_DPWH_2016.url,
    legalBasisTitle: SRC_DPWH_2016.title,
    verificationStatus: 'PENDING_LGU_VALIDATION',
    sources: [SRC_DPWH_2016, SRC_CASTILLA_UNIFIED_FORM],
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
    // Also billed as a conditional Box 6 ("FOR BUILDING / STRUCTURE (OBO)")
    // line item on a Building Permit filing whose scope includes
    // electronics/communications work — see SRC_CASTILLA_UNIFIED_FORM.
    applicability: applicabilityFor(
      ['Electronics Permit'],
      [
        'Building Permit – New Construction',
        'Building Permit – Addition / Extension',
        'Building Permit – Renovation / Alteration',
      ],
    ),
    legalBasisUrl: SRC_DPWH_2016.url,
    legalBasisTitle: SRC_DPWH_2016.title,
    verificationStatus: 'PENDING_LGU_VALIDATION',
    sources: [SRC_DPWH_2016, SRC_CASTILLA_UNIFIED_FORM],
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
    // Also billed as a conditional Box 6 ("FOR BUILDING / STRUCTURE (OBO)")
    // line item on a Building Permit filing whose scope includes fencing
    // — see SRC_CASTILLA_UNIFIED_FORM.
    applicability: applicabilityFor(
      ['Fencing Permit'],
      [
        'Building Permit – New Construction',
        'Building Permit – Addition / Extension',
        'Building Permit – Renovation / Alteration',
      ],
    ),
    legalBasisUrl: SRC_DPWH_2016.url,
    legalBasisTitle: SRC_DPWH_2016.title,
    verificationStatus: 'PENDING_LGU_VALIDATION',
    sources: [SRC_DPWH_2016, SRC_CASTILLA_UNIFIED_FORM],
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
    name: 'Excavation Permit Fee',
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
    applicability: applicabilityFor(['Excavation Permit']),
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
  // Occupancy and on the standalone FSEC/FSIC types themselves (final
  // FSIC is a statutory prerequisite — see SRC_RA9514), conditional
  // ancillary line on the building-formula types.
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
      ['Certificate of Occupancy', 'FSEC for Building Permit (BFP)', 'FSIC for Occupancy Permit (BFP)'],
      [
        'Building Permit – New Construction',
        'Building Permit – Addition / Extension',
        'Building Permit – Renovation / Alteration',
      ],
    ),
    legalBasisUrl: SRC_RA9514.url,
    legalBasisTitle: SRC_RA9514.title,
    verificationStatus: 'PENDING_LGU_VALIDATION',
    sources: [SRC_RA9514, SRC_BFP_MC2021_020],
  }),

  // Architectural, Civil/Structural, and Interior each used to have NO
  // dedicated rule beyond the generic Filing Fee (the DPWH 2016 schedule
  // names no separate flat formula for them, and no real local rate had
  // been confirmed) — but the real Castilla Unified Application Form's
  // Box 6 lists all three as their own separately-assessed line items, so
  // they're modeled here even though the peso amount remains unconfirmed.
  rule({
    id: 'architectural-permit-fee',
    code: 'CASTILLA-ARC-01',
    name: 'Architectural Fee',
    family: 'Architectural Fee',
    authority: 'LGU',
    collectingOfficeId: 'obo',
    description:
      "Architectural-discipline assessment line under Box 6 (\"FOR BUILDING / STRUCTURE (OBO)\") of Castilla's Unified Application Form — a real local line item with no confirmed rate yet.",
    calculationType: 'manual',
    requiredInputs: [],
    flatAmountCentavos: null,
    unitAmountCentavos: null,
    unitLabel: null,
    percentageOf: null,
    percentageRate: null,
    brackets: null,
    minimumCentavos: null,
    maximumCentavos: null,
    requiresAssessorInput: true,
    applicability: applicabilityFor(
      ['Architectural Permit'],
      [
        'Building Permit – New Construction',
        'Building Permit – Addition / Extension',
        'Building Permit – Renovation / Alteration',
      ],
    ),
    legalBasisUrl: SRC_CASTILLA_UNIFIED_FORM.url,
    legalBasisTitle: SRC_CASTILLA_UNIFIED_FORM.title,
    verificationStatus: 'PENDING_LGU_VALIDATION',
    sources: [SRC_CASTILLA_UNIFIED_FORM],
  }),
  rule({
    id: 'civil-structural-permit-fee',
    code: 'CASTILLA-CVL-01',
    name: 'Civil / Structural Fee',
    family: 'Civil / Structural Fee',
    authority: 'LGU',
    collectingOfficeId: 'obo',
    description:
      "Civil/Structural-discipline assessment line under Box 6 of Castilla's Unified Application Form — a real local line item with no confirmed rate yet.",
    calculationType: 'manual',
    requiredInputs: [],
    flatAmountCentavos: null,
    unitAmountCentavos: null,
    unitLabel: null,
    percentageOf: null,
    percentageRate: null,
    brackets: null,
    minimumCentavos: null,
    maximumCentavos: null,
    requiresAssessorInput: true,
    applicability: applicabilityFor(
      ['Civil / Structural Permit'],
      [
        'Building Permit – New Construction',
        'Building Permit – Addition / Extension',
        'Building Permit – Renovation / Alteration',
      ],
    ),
    legalBasisUrl: SRC_CASTILLA_UNIFIED_FORM.url,
    legalBasisTitle: SRC_CASTILLA_UNIFIED_FORM.title,
    verificationStatus: 'PENDING_LGU_VALIDATION',
    sources: [SRC_CASTILLA_UNIFIED_FORM],
  }),
  rule({
    id: 'interior-design-permit-fee',
    code: 'CASTILLA-INT-01',
    name: 'Interior Fee',
    family: 'Interior Fee',
    authority: 'LGU',
    collectingOfficeId: 'obo',
    description:
      "Interior-discipline assessment line under Box 6 of Castilla's Unified Application Form — a real local line item with no confirmed rate yet. Previously Interior Design Permit had no dedicated fee line at all.",
    calculationType: 'manual',
    requiredInputs: [],
    flatAmountCentavos: null,
    unitAmountCentavos: null,
    unitLabel: null,
    percentageOf: null,
    percentageRate: null,
    brackets: null,
    minimumCentavos: null,
    maximumCentavos: null,
    requiresAssessorInput: true,
    applicability: applicabilityFor(
      ['Interior Design Permit'],
      [
        'Building Permit – New Construction',
        'Building Permit – Addition / Extension',
        'Building Permit – Renovation / Alteration',
      ],
    ),
    legalBasisUrl: SRC_CASTILLA_UNIFIED_FORM.url,
    legalBasisTitle: SRC_CASTILLA_UNIFIED_FORM.title,
    verificationStatus: 'PENDING_LGU_VALIDATION',
    sources: [SRC_CASTILLA_UNIFIED_FORM],
  }),

  // "Line and Grade (Geodetic)" — a real OBO fee line under Box 6 with no
  // dedicated PermitType of its own; it's a geodetic-survey verification
  // charge on any Building Permit filing, not a separate ancillary permit.
  rule({
    id: 'line-and-grade-fee',
    code: 'CASTILLA-LNG-01',
    name: 'Line and Grade (Geodetic) Fee',
    family: 'Line and Grade Fee',
    authority: 'LGU',
    collectingOfficeId: 'obo',
    description:
      "Geodetic line-and-grade verification fee under Box 6 (\"FOR BUILDING / STRUCTURE (OBO)\") of Castilla's Unified Application Form — a real local line item with no confirmed rate yet, and no equivalent in any national DPWH schedule reviewed so far.",
    calculationType: 'manual',
    requiredInputs: [],
    flatAmountCentavos: null,
    unitAmountCentavos: null,
    unitLabel: null,
    percentageOf: null,
    percentageRate: null,
    brackets: null,
    minimumCentavos: null,
    maximumCentavos: null,
    requiresAssessorInput: true,
    applicability: applicabilityFor([
      'Building Permit – New Construction',
      'Building Permit – Addition / Extension',
      'Building Permit – Renovation / Alteration',
    ]),
    legalBasisUrl: SRC_CASTILLA_UNIFIED_FORM.url,
    legalBasisTitle: SRC_CASTILLA_UNIFIED_FORM.title,
    verificationStatus: 'PENDING_LGU_VALIDATION',
    sources: [SRC_CASTILLA_UNIFIED_FORM],
  }),

  // "Hotworks" — a real BFP fee line under Box 6, distinct from the Fire
  // Code Construction Tax (fire-code-assessment-fee above) — this one
  // specifically covers welding/cutting/hot-work operations, applicable
  // wherever such work is declared on a Building Permit filing or an FSEC/
  // FSIC application (both already reference an optional "Fire Safety
  // Clearance for Welding, Cutting, and other Hot Work Operations"
  // document — this is the fee line that document pairs with).
  rule({
    id: 'hotworks-fee',
    code: 'CASTILLA-HOT-01',
    name: 'Hotworks Fee',
    family: 'Fire Code Assessment',
    authority: 'BFP',
    collectingOfficeId: 'bfp',
    description:
      "Fee for a Fire Safety Clearance covering welding, cutting, and other hot-work operations, under Box 6 (\"FOR FIRE SAFETY (BFP)\") of Castilla's Unified Application Form — distinct from the Fire Code Construction Tax; a real local line item with no confirmed rate yet.",
    calculationType: 'manual',
    requiredInputs: [],
    flatAmountCentavos: null,
    unitAmountCentavos: null,
    unitLabel: null,
    percentageOf: null,
    percentageRate: null,
    brackets: null,
    minimumCentavos: null,
    maximumCentavos: null,
    requiresAssessorInput: true,
    applicability: applicabilityFor(
      [],
      [
        'Building Permit – New Construction',
        'Building Permit – Addition / Extension',
        'Building Permit – Renovation / Alteration',
        'FSEC for Building Permit (BFP)',
        'FSIC for Occupancy Permit (BFP)',
      ],
    ),
    legalBasisUrl: SRC_CASTILLA_UNIFIED_FORM.url,
    legalBasisTitle: SRC_CASTILLA_UNIFIED_FORM.title,
    verificationStatus: 'PENDING_LGU_VALIDATION',
    sources: [SRC_CASTILLA_UNIFIED_FORM],
  }),

  // "Locational / Zoning of Land" — Box 6's own "FOR ZONING (ZONING
  // ADMINISTRATOR)" line, assessed on the same Unified Application Form
  // alongside the OBO/BFP lines above (the Locational Clearance document
  // is already a required intake document for a Building Permit — this is
  // the monetary assessment tied to that same clearance). Also required
  // directly for 'Zoning / Locational Clearance' itself — this is the fee
  // FOR that clearance, not just an ancillary line on someone else's
  // filing; requirements-catalog.ts's own paymentRequirements text for
  // that type already promised this exact line, but it was never actually
  // wired into this rule's applicability, so filing a standalone Zoning
  // application drafted a ₱250-filing-fee-only assessment with nothing
  // else to pay — a real gap, not an intentional omission.
  rule({
    id: 'locational-zoning-fee',
    code: 'CASTILLA-ZON-01',
    name: 'Locational / Zoning of Land Fee',
    family: 'Locational / Zoning Fee',
    authority: 'LGU',
    collectingOfficeId: 'zoning',
    description:
      'Zoning Administrator assessment under Box 6 ("FOR ZONING (ZONING ADMINISTRATOR)") of Castilla\'s Unified Application Form — a real local line item with no confirmed rate yet.',
    calculationType: 'manual',
    requiredInputs: [],
    flatAmountCentavos: null,
    unitAmountCentavos: null,
    unitLabel: null,
    percentageOf: null,
    percentageRate: null,
    brackets: null,
    minimumCentavos: null,
    maximumCentavos: null,
    requiresAssessorInput: true,
    applicability: applicabilityFor([
      'Building Permit – New Construction',
      'Building Permit – Addition / Extension',
      'Building Permit – Renovation / Alteration',
      'Zoning / Locational Clearance',
    ]),
    legalBasisUrl: SRC_CASTILLA_UNIFIED_FORM.url,
    legalBasisTitle: SRC_CASTILLA_UNIFIED_FORM.title,
    verificationStatus: 'PENDING_LGU_VALIDATION',
    sources: [SRC_CASTILLA_UNIFIED_FORM],
  }),

  // "Surcharges" and "Penalties" — Box 6's own two line items under "FOR
  // BUILDING / STRUCTURE (OBO)", distinct from every discipline fee above:
  // situational charges an assessor adds only when they apply (e.g. late
  // filing, work started without a permit) rather than a fee family every
  // application draws from. Conditional rather than required for exactly
  // that reason — included so an assessor can add one during assessment,
  // never assumed to apply by default.
  rule({
    id: 'surcharges-fee',
    code: 'CASTILLA-SUR-01',
    name: 'Surcharges',
    family: 'Surcharges & Penalties',
    authority: 'LGU',
    collectingOfficeId: 'obo',
    description:
      'Surcharge assessed under Box 6 of Castilla\'s Unified Application Form for situations such as late filing or construction started ahead of permit issuance — a real local line item with no confirmed rate/basis yet.',
    calculationType: 'manual',
    requiredInputs: [],
    flatAmountCentavos: null,
    unitAmountCentavos: null,
    unitLabel: null,
    percentageOf: null,
    percentageRate: null,
    brackets: null,
    minimumCentavos: null,
    maximumCentavos: null,
    requiresAssessorInput: true,
    applicability: applicabilityFor(
      [],
      [
        'Building Permit – New Construction',
        'Building Permit – Addition / Extension',
        'Building Permit – Renovation / Alteration',
      ],
    ),
    legalBasisUrl: SRC_CASTILLA_UNIFIED_FORM.url,
    legalBasisTitle: SRC_CASTILLA_UNIFIED_FORM.title,
    verificationStatus: 'PENDING_LGU_VALIDATION',
    sources: [SRC_CASTILLA_UNIFIED_FORM],
  }),
  rule({
    id: 'penalties-fee',
    code: 'CASTILLA-PEN-01',
    name: 'Penalties',
    family: 'Surcharges & Penalties',
    authority: 'LGU',
    collectingOfficeId: 'obo',
    description:
      'Penalty assessed under Box 6 of Castilla\'s Unified Application Form for violations found during evaluation/inspection — a real local line item with no confirmed rate/basis yet.',
    calculationType: 'manual',
    requiredInputs: [],
    flatAmountCentavos: null,
    unitAmountCentavos: null,
    unitLabel: null,
    percentageOf: null,
    percentageRate: null,
    brackets: null,
    minimumCentavos: null,
    maximumCentavos: null,
    requiresAssessorInput: true,
    applicability: applicabilityFor(
      [],
      [
        'Building Permit – New Construction',
        'Building Permit – Addition / Extension',
        'Building Permit – Renovation / Alteration',
      ],
    ),
    legalBasisUrl: SRC_CASTILLA_UNIFIED_FORM.url,
    legalBasisTitle: SRC_CASTILLA_UNIFIED_FORM.title,
    verificationStatus: 'PENDING_LGU_VALIDATION',
    sources: [SRC_CASTILLA_UNIFIED_FORM],
  }),
];

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
