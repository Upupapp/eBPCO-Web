import { MunicipalOffice, OfficeCategoryInfo, OfficeContact, OfficeHead } from '../models/office.model';

// Per-office telephone/email are unverified for most offices — the UI hides
// those two rows rather than showing "Pending confirmation" text (see
// office-detail.html). Location and hours are shown plainly: location was
// corrected 2026-08-23 (the seat of government is Barangay Cumadcad, not
// Poblacion — see contact.ts for source notes), and standard Mon–Fri 8–5
// hours are the Civil Service Commission's default schedule for LGU
// offices, a reasonable default rather than an invented specific.
function placeholderContact(
  location = 'Castilla Municipal Hall, 1st Floor, Cumadcad, Castilla, Sorsogon',
): OfficeContact {
  return {
    telephone: 'Pending confirmation',
    email: 'Pending confirmation',
    location,
    hours: 'Monday–Friday, 8:00 AM–5:00 PM',
    isPlaceholder: true,
  };
}

function placeholderHead(position: string): OfficeHead {
  return {
    name: 'Name pending confirmation',
    position,
    isPlaceholder: true,
  };
}

export const OFFICE_CATEGORIES: OfficeCategoryInfo[] = [
  { id: 'executive', label: 'Executive' },
  { id: 'administrative', label: 'Administrative' },
  { id: 'finance', label: 'Finance' },
  { id: 'social-services', label: 'Social Services' },
  { id: 'development', label: 'Development' },
  { id: 'public-safety', label: 'Public Safety' },
];

export const MUNICIPAL_OFFICES: MunicipalOffice[] = [
  {
    slug: 'office-of-the-mayor',
    name: 'Office of the Municipal Mayor',
    category: 'executive',
    shortDescription: 'Leads the executive administration of the municipality and oversees all local government operations.',
    aboutText:
      'The Office of the Municipal Mayor exercises general supervision over all municipal offices, implements local policies and ordinances, and represents the municipality in official and ceremonial functions.',
    head: placeholderHead('Municipal Mayor'),
    services: [
      'Executive supervision of municipal departments and offices',
      'Enforcement of laws, ordinances, and executive issuances',
      'Public assistance and constituent concerns',
      'Representation of the municipality in official matters',
    ],
    contact: placeholderContact(),
    relatedOfficeSlugs: ['office-of-the-vice-mayor', 'sangguniang-bayan', 'municipal-administrator'],
  },
  {
    slug: 'office-of-the-vice-mayor',
    name: 'Office of the Municipal Vice Mayor',
    category: 'executive',
    shortDescription: 'Presides over the Sangguniang Bayan and assumes executive duties in the Mayor’s absence.',
    aboutText:
      'The Office of the Municipal Vice Mayor presides over sessions of the Sangguniang Bayan, the municipality’s legislative body, and performs executive functions as provided under the Local Government Code.',
    head: placeholderHead('Municipal Vice Mayor'),
    services: [
      'Presiding officer of the Sangguniang Bayan',
      'Legislative session scheduling and records oversight',
      'Assumption of mayoral duties when required by law',
    ],
    contact: placeholderContact(),
    relatedOfficeSlugs: ['office-of-the-mayor', 'sangguniang-bayan'],
  },
  {
    slug: 'sangguniang-bayan',
    name: 'Sangguniang Bayan',
    category: 'executive',
    shortDescription: 'The municipality’s legislative council, responsible for enacting local ordinances and resolutions.',
    aboutText:
      'The Sangguniang Bayan is the legislative body of the municipality. It enacts ordinances, approves resolutions, and appropriates funds for the general welfare of Castilla in accordance with the Local Government Code.',
    // Sourced 2026-08-23: identified in Sorsogon State University institutional material.
    head: { name: 'Reynaldo C. Marchan', position: 'Sangguniang Bayan Secretary', isPlaceholder: false },
    services: [
      'Enactment of municipal ordinances and resolutions',
      'Review of barangay ordinances',
      'Public hearings and legislative inquiries',
      'Approval of the annual municipal budget',
    ],
    contact: placeholderContact(),
    relatedOfficeSlugs: ['office-of-the-vice-mayor', 'office-of-the-mayor'],
  },
  {
    slug: 'municipal-administrator',
    name: 'Municipal Administrator',
    category: 'administrative',
    shortDescription: 'Coordinates the day-to-day management of municipal departments on behalf of the Mayor.',
    aboutText:
      'The Office of the Municipal Administrator assists the Mayor in coordinating the activities of all municipal departments, ensuring efficient delivery of services and implementation of programs.',
    // Sourced 2026-08-23: LGU Citizen's Charter, corroborated by a PSA
    // Sorsogon publication (2024 CBMS presentation, August 2025).
    head: { name: 'Atty. Marilyn D. Valino', position: 'Municipal Administrator', isPlaceholder: false },
    services: [
      'Inter-office coordination and program monitoring',
      'Administrative policy implementation',
      'Personnel and operations oversight support',
    ],
    // Direct phone/email/room not found — the Mayor's Office line should
    // not be presented as the Administrator's direct contact. Hours are
    // the Administrator's own published schedule (Citizen's Charter).
    contact: { ...placeholderContact(), hours: 'Monday–Friday, 8:00 AM–5:00 PM (no noon break)' },
    relatedOfficeSlugs: ['office-of-the-mayor', 'human-resource-management', 'general-services'],
  },
  {
    slug: 'municipal-treasurer',
    name: "Municipal Treasurer's Office",
    category: 'finance',
    shortDescription: 'Manages collection, custody, and disbursement of municipal funds.',
    aboutText:
      'The Municipal Treasurer’s Office is responsible for the collection of local taxes, fees, and charges, and for the custody and proper disbursement of municipal funds.',
    // The 2023 Citizen's Charter named a Treasurer, but Castilla
    // subsequently advertised this post (Municipal Government Department
    // Head I – Municipal Treasurer) as vacant in late 2025 — publishing
    // that name now risks naming someone no longer in the role, so the
    // head stays unconfirmed. The office's own floor is unaffected by who
    // staffs it, so that alone is updated.
    head: placeholderHead('Municipal Treasurer'),
    services: [
      'Collection of real property and business taxes',
      'Issuance of official receipts and tax clearances',
      'Cash management and fund custody',
      'Disbursement processing for municipal obligations',
    ],
    contact: placeholderContact('Castilla Municipal Hall, 1st Floor, Cumadcad, Castilla, Sorsogon'),
    relatedOfficeSlugs: ['municipal-assessor', 'municipal-accounting', 'municipal-budget', 'business-permits-licensing'],
  },
  {
    slug: 'municipal-assessor',
    name: "Municipal Assessor's Office",
    category: 'finance',
    shortDescription: 'Handles the appraisal and assessment of real properties for taxation purposes.',
    aboutText:
      'The Municipal Assessor’s Office appraises and assesses real properties within Castilla, maintains property records, and issues certifications used for taxation and land transactions.',
    // Sourced 2026-08-23 from the LGU Citizen's Charter.
    head: { name: 'Gemma H. Arogante', position: 'Municipal Assessor', isPlaceholder: false },
    services: [
      'Real property appraisal and assessment',
      'Tax declaration issuance and updates',
      'Property record certification',
    ],
    contact: {
      telephone: '0970-864-2404',
      email: 'magierrogante@gmail.com',
      location: 'Castilla Municipal Hall, 1st Floor, Cumadcad, Castilla, Sorsogon',
      hours: 'Monday–Friday, 8:00 AM–5:00 PM',
      isPlaceholder: false,
    },
    relatedOfficeSlugs: ['municipal-treasurer', 'municipal-planning-development'],
  },
  {
    slug: 'municipal-accounting',
    name: 'Municipal Accounting Office',
    category: 'finance',
    shortDescription: 'Maintains municipal financial records and processes payment vouchers.',
    aboutText:
      'The Municipal Accounting Office maintains the books of accounts of the municipality, processes disbursement vouchers, and prepares financial statements and reports.',
    // Sourced 2026-08-23 from the LGU Citizen's Charter.
    head: { name: 'Susan B. Marvida', position: 'Municipal Accountant', isPlaceholder: false },
    services: [
      'Processing of disbursement vouchers and payrolls',
      'Maintenance of municipal books of accounts',
      'Preparation of financial statements',
    ],
    contact: {
      telephone: '0970-864-2405',
      email: 'lgucastilla@gmail.com',
      location: 'Castilla Municipal Hall, 2nd Floor, Cumadcad, Castilla, Sorsogon',
      hours: 'Monday–Friday, 8:00 AM–5:00 PM (no noon break)',
      isPlaceholder: false,
    },
    relatedOfficeSlugs: ['municipal-treasurer', 'municipal-budget'],
  },
  {
    slug: 'municipal-budget',
    name: 'Municipal Budget Office',
    category: 'finance',
    shortDescription: 'Prepares and administers the annual municipal budget.',
    aboutText:
      'The Municipal Budget Office prepares the annual and supplemental budgets of the municipality and monitors the utilization of appropriated funds across departments.',
    // Sourced 2026-08-23 from the LGU Citizen's Charter.
    head: { name: 'Roselyn M. Marbella', position: 'Municipal Budget Officer', isPlaceholder: false },
    services: [
      'Preparation of the annual municipal budget',
      'Budget monitoring and utilization reports',
      'Review of departmental budget proposals',
    ],
    contact: {
      telephone: '0970-864-2406',
      email: 'mbocastilla07@gmail.com',
      location: 'Castilla Municipal Hall, 2nd Floor, Cumadcad, Castilla, Sorsogon',
      hours: 'Monday–Friday, 8:00 AM–5:00 PM (no noon break)',
      isPlaceholder: false,
    },
    relatedOfficeSlugs: ['municipal-accounting', 'municipal-treasurer', 'municipal-planning-development'],
  },
  {
    slug: 'municipal-planning-development',
    name: 'Municipal Planning and Development Office',
    category: 'development',
    shortDescription: 'Formulates the municipality’s development plans, programs, and investment priorities.',
    aboutText:
      'The Municipal Planning and Development Office formulates integrated development plans, monitors program implementation, and coordinates local development projects for Castilla.',
    // Sourced 2026-08-23: LGU Citizen's Charter, corroborated by a PSA
    // Sorsogon publication (2025 CBMS presentation).
    head: {
      name: 'Raquel J. Dollison',
      position: 'Municipal Planning and Development Coordinator',
      isPlaceholder: false,
    },
    services: [
      'Formulation of the Comprehensive Development Plan',
      'Project monitoring and evaluation',
      'Local investment and development coordination',
    ],
    contact: {
      telephone: '0970-864-2407',
      email: 'raqueljdollison@gmail.com',
      location: 'Castilla Municipal Hall, 2nd Floor, Cumadcad, Castilla, Sorsogon',
      hours: 'Monday–Friday, 8:00 AM–5:00 PM',
      isPlaceholder: false,
    },
    relatedOfficeSlugs: ['municipal-engineering', 'municipal-budget', 'municipal-agriculture'],
  },
  {
    slug: 'municipal-engineering',
    name: 'Municipal Engineering Office',
    category: 'development',
    shortDescription: 'Oversees public infrastructure planning, construction, and maintenance.',
    aboutText:
      'The Municipal Engineering Office plans, designs, and supervises the construction and maintenance of municipal infrastructure such as roads, buildings, and public facilities.',
    // Sourced 2026-08-23 from the LGU Citizen's Charter. The published
    // email looks like a personal address rather than an office mailbox,
    // but it's what the LGU itself lists — shown as published, not "corrected".
    head: { name: 'Jesus D. Abitria Jr.', position: 'Municipal Engineer', isPlaceholder: false },
    services: [
      'Infrastructure project design and supervision',
      'Building permit technical evaluation',
      'Public works maintenance planning',
    ],
    contact: {
      telephone: '0970-864-2409',
      email: 'arlyn.balmes1971@gmail.com',
      location: 'Castilla Municipal Hall, 2nd Floor, Cumadcad, Castilla, Sorsogon',
      hours: 'Monday–Friday, 8:00 AM–5:00 PM (no noon break)',
      isPlaceholder: false,
    },
    relatedOfficeSlugs: ['municipal-planning-development', 'general-services'],
  },
  {
    slug: 'municipal-civil-registrar',
    name: 'Municipal Civil Registrar',
    category: 'administrative',
    shortDescription: 'Handles civil registration records including birth, marriage, and death certificates.',
    aboutText:
      'The Office of the Municipal Civil Registrar registers vital events — births, marriages, and deaths — occurring within Castilla, and issues certified civil registry documents.',
    // Sourced 2026-08-23 from the LGU Citizen's Charter.
    head: { name: 'Cecilia B. Loterte', position: 'Municipal Civil Registrar', isPlaceholder: false },
    services: [
      'Registration of births, marriages, and deaths',
      'Issuance of certified civil registry documents',
      'Processing of legal corrections and annotations',
    ],
    contact: {
      telephone: '0970-864-2411',
      email: 'mcrocastilla@gmail.com',
      location: 'Castilla Municipal Hall, 1st Floor, Cumadcad, Castilla, Sorsogon',
      hours: 'Monday–Friday, 8:00 AM–5:00 PM',
      isPlaceholder: false,
    },
    relatedOfficeSlugs: ['municipal-health', 'municipal-social-welfare'],
  },
  {
    slug: 'municipal-health',
    name: 'Municipal Health Office',
    category: 'social-services',
    shortDescription: 'Delivers primary healthcare services and public health programs to residents.',
    aboutText:
      'The Municipal Health Office provides primary healthcare, maternal and child health services, disease prevention programs, and sanitation oversight for the municipality.',
    // Sourced 2026-08-23 via web search.
    head: { name: 'Dr. Melquiades D. Boque', position: 'Municipal Health Officer', isPlaceholder: false },
    services: [
      'Primary care and outpatient consultation',
      'Maternal, child, and immunization programs',
      'Public health and sanitation inspection',
    ],
    contact: placeholderContact(),
    relatedOfficeSlugs: ['municipal-social-welfare', 'municipal-civil-registrar', 'municipal-disaster-risk-reduction'],
  },
  {
    slug: 'municipal-social-welfare',
    name: 'Municipal Social Welfare and Development Office',
    category: 'social-services',
    shortDescription: 'Administers social welfare programs for vulnerable and disadvantaged residents.',
    aboutText:
      'The Municipal Social Welfare and Development Office implements assistance programs for children, senior citizens, persons with disabilities, and families in crisis, and coordinates with national social welfare agencies.',
    // Sourced 2026-08-23 from the LGU Citizen's Charter.
    head: {
      name: 'Roland A. Cortezano, RSW',
      position: 'Municipal Social Welfare and Development Officer',
      isPlaceholder: false,
    },
    services: [
      'Assistance programs for indigent and vulnerable residents',
      'Senior citizen and PWD affairs',
      'Case management and referral services',
    ],
    // Exact floor/room within the office building wasn't specified in the
    // source, only the office itself — location left at that level.
    contact: {
      telephone: '0930-345-8569',
      email: 'mswdo1castilla@gmail.com',
      location: 'Municipal Social Welfare and Development Office, Cumadcad, Castilla, Sorsogon',
      hours: 'Monday–Friday, 8:00 AM–5:00 PM (no noon break)',
      isPlaceholder: false,
    },
    relatedOfficeSlugs: ['municipal-health', 'municipal-disaster-risk-reduction'],
  },
  {
    slug: 'municipal-agriculture',
    name: 'Municipal Agriculture Office',
    category: 'development',
    shortDescription: 'Supports local farmers and fisherfolk through extension services and programs.',
    aboutText:
      'The Municipal Agriculture Office provides technical assistance, extension services, and program support to farmers and fisherfolk to improve agricultural productivity in Castilla.',
    // Sourced 2026-08-23 from an official LGU Castilla document (Agricultures.pdf).
    head: { name: 'Manuel L. Marantal', position: 'Municipal Agriculturist', isPlaceholder: false },
    services: [
      'Agricultural extension and technical assistance',
      'Farmer and fisherfolk registration support',
      'Distribution of program inputs and assistance',
    ],
    contact: placeholderContact(),
    relatedOfficeSlugs: ['municipal-environment-natural-resources', 'municipal-planning-development'],
  },
  {
    slug: 'municipal-environment-natural-resources',
    name: 'Municipal Environment and Natural Resources Office',
    category: 'development',
    shortDescription: 'Oversees environmental protection, waste management, and natural resource programs.',
    aboutText:
      'The Municipal Environment and Natural Resources Office implements environmental protection measures, solid waste management, and natural resource conservation programs within the municipality.',
    // Sourced 2026-08-23 from the LGU Citizen's Charter.
    head: {
      name: 'Ricardo L. Averilla',
      position: 'Municipal Environment and Natural Resources Officer',
      isPlaceholder: false,
    },
    services: [
      'Solid waste management program implementation',
      'Environmental compliance monitoring',
      'Coastal and natural resource protection initiatives',
    ],
    contact: {
      telephone: '0970-864-2408',
      email: 'cherokeekessellopez@gmail.com',
      location: 'Castilla Municipal Hall, 2nd Floor, Cumadcad, Castilla, Sorsogon',
      hours: 'Monday–Friday, 8:00 AM–5:00 PM',
      isPlaceholder: false,
    },
    relatedOfficeSlugs: ['municipal-agriculture', 'municipal-disaster-risk-reduction'],
  },
  {
    slug: 'municipal-disaster-risk-reduction',
    name: 'Municipal Disaster Risk Reduction and Management Office',
    category: 'public-safety',
    shortDescription: 'Coordinates disaster preparedness, response, and risk reduction efforts.',
    aboutText:
      'The Municipal Disaster Risk Reduction and Management Office leads preparedness planning, early warning coordination, and emergency response operations to protect residents from natural and human-induced hazards.',
    // Name sourced 2026-08-23, independently corroborated: first surfaced
    // as a lower-confidence inference from the office email's username,
    // then confirmed via LGU-published MDRRMO material naming him directly.
    head: { name: 'Edgar D. Ardales Jr.', position: 'MDRRM Officer', isPlaceholder: false },
    services: [
      'Disaster preparedness planning and drills',
      'Early warning and hazard monitoring',
      'Emergency response coordination',
    ],
    // Exact floor within the Municipal Building wasn't specified in any
    // source found, only the building itself. Hours distinguish ordinary
    // administrative business from the office's actual emergency-response
    // function, which runs continuously.
    contact: {
      telephone: '0928-949-6045',
      email: 'mdrrmcastilla@yahoo.com',
      location: 'Municipal Building, Cumadcad, Castilla, Sorsogon',
      hours: 'Administrative: Monday–Friday, 8:00 AM–5:00 PM · Emergency response: 24/7',
      isPlaceholder: false,
    },
    relatedOfficeSlugs: ['municipal-health', 'municipal-social-welfare', 'municipal-environment-natural-resources'],
  },
  {
    slug: 'business-permits-licensing',
    name: 'Business Permits and Licensing Office',
    category: 'administrative',
    shortDescription: 'Processes business permit applications, renewals, and licensing requirements.',
    aboutText:
      'The Business Permits and Licensing Office processes the issuance and renewal of business permits, coordinates with regulatory offices for evaluation, and maintains the municipal business registry.',
    // Sourced 2026-08-23: named on an official Castilla business-permit
    // application form and the LGU Citizen's Charter (as Administrative
    // Assistant II handling BPLO review/validation).
    head: { name: 'Loriejane N. Excija', position: 'Business Permits and Licensing Officer', isPlaceholder: false },
    services: [
      'New business permit application processing',
      'Annual business permit renewal',
      'Business registry maintenance',
    ],
    contact: placeholderContact(),
    relatedOfficeSlugs: ['municipal-treasurer', 'municipal-engineering'],
  },
  {
    slug: 'human-resource-management',
    name: 'Human Resource Management Office',
    category: 'administrative',
    shortDescription: 'Manages municipal personnel administration, recruitment, and employee welfare.',
    aboutText:
      'The Human Resource Management Office administers recruitment, employee records, benefits, and personnel development programs for municipal government employees.',
    // Sourced 2026-08-23: LGU Citizen's Charter, corroborated by recent
    // Civil Service recruitment postings still directing applicants to her.
    head: {
      name: 'Gelita Inocencio Arcos, MPA',
      position: 'Human Resource Management Officer',
      isPlaceholder: false,
    },
    services: [
      'Recruitment and appointment processing',
      'Employee records and leave administration',
      'Personnel training and development coordination',
    ],
    contact: {
      telephone: '0970-864-2412',
      email: 'lguofcastillasorsogon.mhrmo@gmail.com',
      location: 'Castilla Municipal Hall, 3rd Floor, Cumadcad, Castilla, Sorsogon',
      hours: 'Monday–Friday, 8:00 AM–5:00 PM (no noon break)',
      isPlaceholder: false,
    },
    relatedOfficeSlugs: ['municipal-administrator', 'general-services'],
  },
  {
    slug: 'general-services',
    name: 'General Services Office',
    category: 'administrative',
    shortDescription: 'Manages municipal property, procurement support, and general facilities upkeep.',
    aboutText:
      'The General Services Office manages municipal government property and equipment, supports procurement processes, and maintains municipal facilities and vehicles.',
    head: placeholderHead('General Services Officer'),
    services: [
      'Municipal property and supply management',
      'Facilities and vehicle maintenance',
      'Procurement support services',
    ],
    contact: placeholderContact(),
    relatedOfficeSlugs: ['municipal-administrator', 'municipal-engineering'],
  },
];
