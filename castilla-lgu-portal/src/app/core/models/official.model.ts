export interface Official {
  name: string;
  position: string;
  office: string;
  initials: string;
  isPlaceholder: boolean;
  // Optional — most officials fall back to an initials avatar; only set
  // this when a real, verified photo of the person is available.
  photoUrl?: string;
}

export interface ProfileField {
  label: string;
  value: string;
  isPlaceholder: boolean;
}
