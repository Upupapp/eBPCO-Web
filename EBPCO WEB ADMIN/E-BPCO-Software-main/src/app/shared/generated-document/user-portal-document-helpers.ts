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

/** Splits "Building Permit – New Construction" into a title + scope subtitle; every other permit type's full name is already a clean standalone title. */
export function documentTitleFor(permitType: PermitType): DocumentTitleInfo {
  if (permitType.includes('–')) {
    const [title, subtitle] = permitType.split('–').map((s) => s.trim());
    return { title, subtitle: subtitle.toUpperCase() };
  }
  return { title: permitType, subtitle: null };
}
