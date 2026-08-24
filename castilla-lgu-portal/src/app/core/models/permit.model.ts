// Groups mirror who actually issues the permit, since that's what a citizen
// needs to know before they show up at a window: the Office of the Building
// Official (housed under the Municipal Engineering Office), the Zoning
// Section of the Municipal Planning and Development Office, or the Bureau
// of Fire Protection (a national agency, not a Castilla LGU office at all).
export type PermitOfficeGroup = 'engineering' | 'zoning' | 'bfp';

export interface PermitOfficeGroupInfo {
  id: PermitOfficeGroup;
  label: string;
}

export interface PublicPermitType {
  slug: string;
  /** Canonical name — must match the 19-item catalog verbatim and in order. */
  name: string;
  officeGroup: PermitOfficeGroup;
  /**
   * Slug of the matching entry in offices.data.ts, when one exists.
   * Zoning permits point at the Municipal Planning and Development Office
   * ('municipal-planning-development') and everything else OBO-related
   * points at the Municipal Engineering Office ('municipal-engineering').
   * BFP permits are null: no Bureau of Fire Protection / Castilla Fire
   * Station entry exists in offices.data.ts yet, since it is a national
   * agency office rather than a municipal government office. issuingOfficeName
   * is shown in its place instead of a broken cross-link.
   */
  issuingOfficeSlug: string | null;
  issuingOfficeName: string;
  description: string;
  requirements: string[];
  validity: string;
  /** Shown when one permit is a typical prerequisite/follow-on to another. */
  processNote?: string;
  /**
   * Public URL of the actual official Municipality of Castilla / BFP
   * Castilla Fire Station blank application form PDF, bundled under
   * public/assets/permits/ — the same real forms wired into the Web
   * Admin's `permitFormUrl()`. Omitted where no matching source file
   * exists (e.g. Architectural, Interior Design, Sign, Demolition,
   * Certificate of Occupancy) rather than guessing at an unrelated
   * document.
   */
  formUrl?: string;
  /**
   * True for every entry today: this catalog reflects general Philippine
   * LGU/National Building Code/Fire Code practice, condensed for citizens,
   * and has not yet been confirmed against Castilla's own OBO/BFP citizen's
   * charter documents. Mirrors the same "don't overclaim confirmed facts"
   * discipline used for office heads/contacts in offices.data.ts.
   */
  isPlaceholder: boolean;
}
