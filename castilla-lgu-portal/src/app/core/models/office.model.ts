export type OfficeCategory =
  | 'executive'
  | 'administrative'
  | 'finance'
  | 'social-services'
  | 'development'
  | 'public-safety';

export interface OfficeCategoryInfo {
  id: OfficeCategory;
  label: string;
}

export interface OfficeHead {
  name: string;
  position: string;
  isPlaceholder: boolean;
}

export interface OfficeContact {
  telephone: string;
  email: string;
  location: string;
  hours: string;
  isPlaceholder: boolean;
}

export interface MunicipalOffice {
  slug: string;
  name: string;
  category: OfficeCategory;
  shortDescription: string;
  aboutText: string;
  head: OfficeHead;
  services: string[];
  contact: OfficeContact;
  relatedOfficeSlugs: string[];
}
