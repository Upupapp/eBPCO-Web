import { ProfileField } from '../models/official.model';

export const MUNICIPALITY_NAME = 'Municipality of Castilla';
export const PROVINCE_NAME = 'Sorsogon';
export const COUNTRY_NAME = 'Republic of the Philippines';

// Fields marked isPlaceholder are still pending confirmation from an
// official LGU Castilla data source and must not be treated as verified.
// The rest were sourced 2026-08-23 from: Wikipedia "Castilla, Sorsogon"
// (population, land area, PSGC, ZIP, income class), PhilAtlas.com (2020 PSA
// census cross-check), and the official LGU history page (founding year) —
// see HISTORY_PLACEHOLDER's replacement below for that citation chain.
// Demonym and an exact PSA year-over-year population trend beyond the 2020
// census were not found from any citable source, so they stay pending.
export const PROFILE_FIELDS: ProfileField[] = [
  { label: 'Province', value: 'Sorsogon', isPlaceholder: false },
  { label: 'Region', value: 'Region V — Bicol Region', isPlaceholder: false },
  { label: 'Country', value: 'Republic of the Philippines', isPlaceholder: false },
  { label: 'Income Classification', value: '3rd class municipality', isPlaceholder: false },
  { label: 'Number of Barangays', value: '34', isPlaceholder: false },
  { label: 'Population', value: '60,635 (2020 Census)', isPlaceholder: false },
  { label: 'Land Area', value: '186.20 km²', isPlaceholder: false },
  { label: 'ZIP Code', value: '4713', isPlaceholder: false },
  { label: 'PSGC Code', value: '0506206000', isPlaceholder: false },
  { label: 'Founding / Establishment', value: '1827', isPlaceholder: false },
  // Sourced 2026-08-23: the Castilla Public Information Office's own
  // January 2026 post uses "mga kababayang Castillano". Older/local usage
  // sometimes has "Castillanon" or "Castillanun", but current LGU usage
  // supports "Castillano".
  { label: 'Demonym', value: 'Castillano', isPlaceholder: false },
];

export const ABOUT_OVERVIEW =
  'Castilla is a coastal municipality in the province of Sorsogon, in the Bicol Region of the Philippines. ' +
  'This portal brings together public information about the municipality, its local government leadership, ' +
  'and the offices that serve residents, businesses, and visitors.';

// Sourced 2026-08-23 from the official LGU Castilla history page
// (castillasorsogon.gov.ph/history-of-castilla) via a cross-referencing
// community mirror (marvelos.wixsite.com/castillasorsogon/history), since
// the official domain blocks automated fetching — facts corroborated
// against independent web-search results before being written here.
export const HISTORY_TEXT =
  'Before 1827, the settlement that became Castilla was a barrio of Bulabog (in what is now Sorsogon City), ' +
  'formed from the nearby settlements of Inarihan, Capuy, Macalaya, and Cumadcad. Spanish Dominican friars had ' +
  'founded the original town along the western coast of Sorsogon Bay, and in 1827 it was formalized as an ' +
  'independent town under the old Provincia de Albay. Don Eugenio Santos Martinez, a wealthy Spanish landowner ' +
  'native to Castilla, Spain, recommended both relocating the seat of government and renaming the town in honor ' +
  'of his hometown — itself the birthplace of Queen Isabella I of Castile (r. 1451–1504). Castilla received its ' +
  'own parish in 1876, with Father Teodosio Homillano as its first priest; the church’s inauguration fell on the ' +
  'Feast of Saint John the Baptist, June 24, still celebrated locally today. When Sorsogon was separated into its ' +
  'own province in 1894, Castilla was annexed as one of its constituent towns.';

// Found only as a truncated fragment ("A premier agri-ecotourism…") in
// search results — the official page (castillasorsogon.gov.ph/vision-and-mission)
// blocks automated fetching, so the complete statement could not be
// verified. Left as a placeholder rather than publishing an incomplete quote.
export const VISION_PLACEHOLDER =
  'The municipality’s official Vision statement will be published here once confirmed with LGU Castilla.';

// Sourced 2026-08-23 from the official LGU Castilla Vision and Mission page
// (castillasorsogon.gov.ph/vision-and-mission), via search-result extraction
// since the page itself blocks automated fetching. Unlike the Vision
// statement, this sentence was returned complete (no truncation marker).
export const MISSION_TEXT =
  'To pursue a holistic development of Castilla in an ecologically-sound environment through the convergent ' +
  'efforts in the provision of quality basic services and equitable distribution of resources and opportunities.';

// Description below is a plain visual transcription of the elements
// actually present in the official seal artwork used on this portal —
// it does not assert heraldic or symbolic meaning, which is left to the
// official LGU description once available.
export const SEAL_DESCRIPTION =
  'The official seal of Castilla — "Sagisag ng Bayan ng Castilla" — features a mountain range, a coconut palm, ' +
  'farm produce, and a leaping dolphin over a coastline, framed by a golden rope border, with the municipality’s ' +
  'name and "Sorsogon" inscribed along the rim. A full official description of the seal’s symbolism is pending ' +
  'confirmation from LGU Castilla.';
