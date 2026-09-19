import { PermitType } from '../../core/domain/permit.model';

// Ported verbatim from ebpco-user-portal's
// core/domain/generated-document.helpers.ts so UserPortalPermitPreview
// renders the exact same header/title an applicant sees on their own
// permit page — keep both copies in sync if either changes.

export interface AgencyHeaderInfo {
  line1: string;
  line2: string;
  line3?: string;
  officeLine: string;
  isBfp: boolean;
}

/** Republic/Province/Municipality (OBO or Zoning) vs. DILG/BFP header — decided from the same real `reviewingOffice` string requirements-catalog.ts already carries for every permit type. */
export function agencyHeaderFor(reviewingOffice: string): AgencyHeaderInfo {
  const isBfp = /fire protection|bfp/i.test(reviewingOffice);
  if (isBfp) {
    return {
      line1: 'Republic of the Philippines',
      line2: 'Department of the Interior and Local Government',
      line3: 'Bureau of Fire Protection',
      officeLine: reviewingOffice,
      isBfp: true,
    };
  }
  return {
    line1: 'Republic of the Philippines',
    line2: 'Province of Sorsogon',
    line3: 'Municipality of Castilla',
    officeLine: reviewingOffice,
    isBfp: false,
  };
}

export interface DocumentTitleInfo {
  title: string;
  subtitle: string | null;
}

/**
 * Every permit type's full name is a clean standalone title.
 *
 * Until migration 047 consolidated the three Building Permit sub-types,
 * their names ("Building Permit – New Construction" and so on) carried an
 * em dash this function split into a title + scope subtitle. No `PermitType`
 * value contains one any more.
 */
export function documentTitleFor(permitType: PermitType): DocumentTitleInfo {
  return { title: permitType, subtitle: null };
}
