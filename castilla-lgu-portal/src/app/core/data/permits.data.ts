import { PermitOfficeGroupInfo, PublicPermitType } from '../models/permit.model';

// Condensed, citizen-facing catalog of the 19-item permit/service list also
// standardized in the Web Admin (`requirements-catalog.ts`) and mobile apps.
// Names and order are canonical and must match those apps verbatim. Content
// here is a plain-language summary, not the full legal-citation checklist —
// see permit.model.ts's `isPlaceholder` doc comment for the sourcing caveat
// that applies to every entry below.

export const PERMIT_OFFICE_GROUPS: PermitOfficeGroupInfo[] = [
  { id: 'engineering', label: 'Office of the Building Official' },
  { id: 'zoning', label: 'Zoning / Planning' },
  { id: 'bfp', label: 'Bureau of Fire Protection' },
];

const OBO_OFFICE_SLUG = 'municipal-engineering';
const ZONING_OFFICE_SLUG = 'municipal-planning-development';
const OBO_OFFICE_NAME = 'Office of the Building Official (Municipal Engineering Office)';
const ZONING_OFFICE_NAME = 'Municipal Planning and Development Office';
const BFP_OFFICE_NAME = 'Bureau of Fire Protection – Castilla Fire Station';

/** Public URL of a real Castilla/BFP form bundled under public/assets/permits/ — the same files wired into the Web Admin's permitFormUrl(). */
function formFile(file: string): string {
  return `/assets/permits/${file}`;
}

export const PUBLIC_PERMIT_TYPES: PublicPermitType[] = [
  {
    slug: 'building-permit-new-construction',
    name: 'Building Permit – New Construction',
    officeGroup: 'engineering',
    issuingOfficeSlug: OBO_OFFICE_SLUG,
    issuingOfficeName: OBO_OFFICE_NAME,
    description:
      'Required before starting construction of a new building or structure, confirming that plans meet the National Building Code and local zoning rules.',
    requirements: [
      'Land title or tax declaration for the property',
      'Barangay clearance',
      'Locational/zoning clearance',
      'Valid government-issued ID of the applicant',
      'Signed and sealed architectural, structural, electrical, and sanitary plans',
      'Bill of materials',
      'PRC license and PTR of the engineer/architect of record',
    ],
    validity: '12 months from date of issuance',
    processNote: 'A Zoning / Locational Clearance is typically secured first and filed as part of this application.',
    formUrl: formFile('Building-Permit-Unified-Application-Form.pdf'),
    isPlaceholder: true,
  },
  {
    slug: 'building-permit-renovation-alteration',
    name: 'Building Permit – Renovation / Alteration',
    officeGroup: 'engineering',
    issuingOfficeSlug: OBO_OFFICE_SLUG,
    issuingOfficeName: OBO_OFFICE_NAME,
    description: 'Covers renovation or alteration work on an existing building that changes its structure, layout, or utilities.',
    requirements: [
      'Renovation/alteration plans',
      'Copy of the original Building Permit, if available',
      'Bill of materials',
      'PRC license and PTR of the engineer/architect of record',
    ],
    validity: '12 months from date of issuance',
    formUrl: formFile('Building-Permit-Unified-Application-Form.pdf'),
    isPlaceholder: true,
  },
  {
    slug: 'building-permit-addition-extension',
    name: 'Building Permit – Addition / Extension',
    officeGroup: 'engineering',
    issuingOfficeSlug: OBO_OFFICE_SLUG,
    issuingOfficeName: OBO_OFFICE_NAME,
    description: 'Covers adding floor area or extending an existing structure, such as a new floor or wing.',
    requirements: [
      'Addition/extension plans',
      'Structural analysis covering the added load',
      'Bill of materials',
      'PRC license and PTR of the engineer/architect of record',
    ],
    validity: '12 months from date of issuance',
    formUrl: formFile('Building-Permit-Unified-Application-Form.pdf'),
    isPlaceholder: true,
  },
  {
    slug: 'demolition-permit',
    name: 'Demolition Permit',
    officeGroup: 'engineering',
    issuingOfficeSlug: OBO_OFFICE_SLUG,
    issuingOfficeName: OBO_OFFICE_NAME,
    description: 'Required before tearing down all or part of an existing structure.',
    requirements: [
      'Method of demolition / work plan',
      'Structural safety assessment',
      'Utility disconnection clearance (water, power, etc.)',
      'PRC license and PTR of the engineer of record',
    ],
    validity: '6 months from date of issuance',
    isPlaceholder: true,
  },
  {
    slug: 'zoning-locational-clearance',
    name: 'Zoning / Locational Clearance',
    officeGroup: 'zoning',
    issuingOfficeSlug: ZONING_OFFICE_SLUG,
    issuingOfficeName: ZONING_OFFICE_NAME,
    description:
      'Confirms that a proposed project or business location is consistent with the municipality’s zoning ordinance and land use plan. Usually the first step before applying for a Building Permit.',
    requirements: [
      'Notarized letter request addressed to the Zoning Administrator',
      'Site development plan',
      'Vicinity map',
      'Sketch plan of the house',
      'Bill of materials',
      'Proof of ownership',
      'Tax declaration / Certificate of Title (COT) / OCT',
      'Land tax receipt (current year)',
      'Barangay building clearance',
      'Cedula (photocopy)',
      'DPWH clearance, if applicable',
      'Environmental Compliance Certificate (ECC), if applicable',
    ],
    validity: '12 months from date of issuance',
    processNote: 'Typically filed and secured before submitting a Building Permit application.',
    formUrl: formFile('Zoning-Locational-Clearance-Form.pdf'),
    isPlaceholder: true,
  },
  {
    slug: 'architectural-permit',
    name: 'Architectural Permit',
    officeGroup: 'engineering',
    issuingOfficeSlug: OBO_OFFICE_SLUG,
    issuingOfficeName: OBO_OFFICE_NAME,
    description: 'Covers the architectural design aspect of a construction project.',
    requirements: ['Architectural plans', 'PRC license and PTR of the architect of record'],
    validity: '12 months from date of issuance',
    isPlaceholder: true,
  },
  {
    slug: 'civil-structural-permit',
    name: 'Civil / Structural Permit',
    officeGroup: 'engineering',
    issuingOfficeSlug: OBO_OFFICE_SLUG,
    issuingOfficeName: OBO_OFFICE_NAME,
    description: 'Covers the structural design and civil works aspect of a construction project.',
    requirements: [
      'Structural plans',
      'Structural design analysis',
      'PRC license and PTR of the civil engineer of record',
    ],
    validity: '12 months from date of issuance',
    formUrl: formFile('Civil-Structural-Permit-Form.pdf'),
    isPlaceholder: true,
  },
  {
    slug: 'electrical-permit',
    name: 'Electrical Permit',
    officeGroup: 'engineering',
    issuingOfficeSlug: OBO_OFFICE_SLUG,
    issuingOfficeName: OBO_OFFICE_NAME,
    description: 'Covers the electrical installation aspect of a construction project.',
    requirements: ['Electrical plans', 'PRC license and PTR of the electrical engineer of record'],
    validity: '12 months from date of issuance',
    formUrl: formFile('Electrical-Permit-Form.pdf'),
    isPlaceholder: true,
  },
  {
    slug: 'mechanical-permit',
    name: 'Mechanical Permit',
    officeGroup: 'engineering',
    issuingOfficeSlug: OBO_OFFICE_SLUG,
    issuingOfficeName: OBO_OFFICE_NAME,
    description: 'Covers mechanical systems such as elevators, HVAC, and other mechanical equipment installations.',
    requirements: ['Mechanical plans', 'PRC license and PTR of the mechanical engineer of record'],
    validity: '12 months from date of issuance',
    formUrl: formFile('Mechanical-Permit-Form.pdf'),
    isPlaceholder: true,
  },
  {
    slug: 'sanitary-permit',
    name: 'Sanitary Permit',
    officeGroup: 'engineering',
    issuingOfficeSlug: OBO_OFFICE_SLUG,
    issuingOfficeName: OBO_OFFICE_NAME,
    description: 'Covers sanitary and plumbing systems within a building, such as waste and water lines.',
    requirements: [
      'Sanitary/plumbing plans',
      'PRC license and PTR of the sanitary engineer or master plumber of record',
    ],
    validity: '12 months from date of issuance',
    formUrl: formFile('Sanitary-Permit-Form.pdf'),
    isPlaceholder: true,
  },
  {
    slug: 'plumbing-permit',
    name: 'Plumbing Permit',
    officeGroup: 'engineering',
    issuingOfficeSlug: OBO_OFFICE_SLUG,
    issuingOfficeName: OBO_OFFICE_NAME,
    description: 'Covers the plumbing layout and fixtures of a building.',
    requirements: ['Plumbing layout plans', 'PRC license and PTR of the master plumber of record'],
    validity: '12 months from date of issuance',
    formUrl: formFile('Plumbing-Permit-Form.pdf'),
    isPlaceholder: true,
  },
  {
    slug: 'electronics-permit',
    name: 'Electronics Permit',
    officeGroup: 'engineering',
    issuingOfficeSlug: OBO_OFFICE_SLUG,
    issuingOfficeName: OBO_OFFICE_NAME,
    description: 'Covers electronics and communications wiring/equipment installed within a building.',
    requirements: [
      'Electronics/communications layout plans',
      'PRC license and PTR of the electronics engineer of record',
    ],
    validity: '12 months from date of issuance',
    formUrl: formFile('Electronics-Permit-Form.pdf'),
    isPlaceholder: true,
  },
  {
    slug: 'interior-design-permit',
    name: 'Interior Design Permit',
    officeGroup: 'engineering',
    issuingOfficeSlug: OBO_OFFICE_SLUG,
    issuingOfficeName: OBO_OFFICE_NAME,
    description: 'Covers interior design and fit-out work within a building.',
    requirements: ['Interior design layout plans', 'PRC license and PTR of the interior designer of record'],
    validity: '12 months from date of issuance',
    isPlaceholder: true,
  },
  {
    slug: 'fencing-permit',
    name: 'Fencing Permit',
    officeGroup: 'engineering',
    issuingOfficeSlug: OBO_OFFICE_SLUG,
    issuingOfficeName: OBO_OFFICE_NAME,
    description: 'Required before constructing a perimeter fence or wall.',
    requirements: ['Fence plan / site development plan'],
    validity: '6 months from date of issuance',
    formUrl: formFile('Fencing-Permit-Form.pdf'),
    isPlaceholder: true,
  },
  {
    slug: 'sign-permit',
    name: 'Sign Permit',
    officeGroup: 'engineering',
    issuingOfficeSlug: OBO_OFFICE_SLUG,
    issuingOfficeName: OBO_OFFICE_NAME,
    description: 'Required for billboards, signages, and similar structures, especially elevated or free-standing signs.',
    requirements: [
      'Sign design and structural detail',
      'PRC license and PTR of the engineer of record, if the sign is elevated or structural',
    ],
    validity: '12 months from date of issuance, subject to annual renewal',
    isPlaceholder: true,
  },
  {
    slug: 'excavation-permit',
    name: 'Excavation Permit',
    officeGroup: 'engineering',
    issuingOfficeSlug: OBO_OFFICE_SLUG,
    issuingOfficeName: OBO_OFFICE_NAME,
    description: 'Required before excavation or ground preparation work on a site.',
    requirements: [
      'Excavation / site development plan',
      'Geotechnical or soil assessment, if excavation exceeds the regulated depth',
      'PRC license and PTR of the engineer of record',
    ],
    validity: '6 months from date of issuance',
    formUrl: formFile('Excavation-Permit-Form.pdf'),
    isPlaceholder: true,
  },
  {
    slug: 'fsec-building-permit',
    name: 'FSEC for Building Permit (BFP)',
    officeGroup: 'bfp',
    // No Bureau of Fire Protection / Castilla Fire Station entry exists in
    // offices.data.ts yet — BFP is a national agency office, not a
    // municipal government office, so there is no municipal directory page
    // to cross-link to.
    issuingOfficeSlug: null,
    issuingOfficeName: BFP_OFFICE_NAME,
    description:
      'The Fire Safety Evaluation Clearance (FSEC) is issued by the Bureau of Fire Protection before a Building Permit is granted, confirming that building plans meet fire safety requirements under the Fire Code of the Philippines.',
    requirements: [
      'Three (3) complete sets of proposed plans covering: Architectural, Civil/Structural, Electrical, Mechanical, Plumbing, Electronics, Sanitary, and Fire Protection documents',
      'Fire Safety Compliance Report (FSCR), one (1) set, if necessary',
      'Cost estimate of the building, including labor cost, signed and sealed by the designer/contractor and duly notarized',
      'Fire Safety Clearance for Welding, Cutting, and other Hot Work Operations, if required',
    ],
    validity: 'Valid for the specific project/plans evaluated; not a recurring renewal item',
    processNote: 'Normally required before the Building Permit itself is approved.',
    formUrl: formFile('FSEC-for-Building-Permit-BFP.pdf'),
    isPlaceholder: true,
  },
  {
    slug: 'certificate-of-occupancy',
    name: 'Certificate of Occupancy',
    officeGroup: 'engineering',
    issuingOfficeSlug: OBO_OFFICE_SLUG,
    issuingOfficeName: OBO_OFFICE_NAME,
    description: 'Certifies that a completed building may be legally occupied or used, issued after final inspection.',
    requirements: [
      'As-built plans',
      'Certificate of completion',
      'Final Fire Safety Inspection Certificate',
      'Certificate of final electrical inspection',
    ],
    validity: 'No fixed expiry — valid for the life of the structure unless its use, occupancy, or ownership changes',
    isPlaceholder: true,
  },
  {
    slug: 'fsic-occupancy-permit',
    name: 'FSIC for Occupancy Permit (BFP)',
    officeGroup: 'bfp',
    // Same BFP caveat as the FSEC entry above.
    issuingOfficeSlug: null,
    issuingOfficeName: BFP_OFFICE_NAME,
    description:
      'The Fire Safety Inspection Certificate (FSIC) is issued by the Bureau of Fire Protection after construction, confirming that the completed building matches its approved fire safety plans (FSEC) before it can be occupied.',
    requirements: [
      'Endorsement from the Office of the Building Official (OBO)',
      'Certificate of completion',
      'Certified true copy of the assessment fee for securing the Certificate of Occupancy, from OBO',
      'As-built plan, if necessary',
      'Fire Safety Compliance and Commissioning Report (FSCCR), one (1) set, if necessary',
    ],
    validity: 'Required once, as a prerequisite to occupancy; re-inspection may be required if occupancy or use later changes',
    processNote: 'A statutory prerequisite to occupancy, issued after the FSEC and after construction is complete.',
    formUrl: formFile('FSIC-for-Occupancy-Permit-BFP.pdf'),
    isPlaceholder: true,
  },
];
