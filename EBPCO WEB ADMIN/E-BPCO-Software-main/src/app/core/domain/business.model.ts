// Mirrors BusinessModel/BusinessCategory/BusinessStatus in
// ebpco-mobile/lib/core/models/business_model.dart.
export type BusinessCategory = 'Retail' | 'Food Service' | 'Services' | 'Manufacturing' | 'Wholesale' | 'Other';
export type BusinessStatus = 'Active' | 'Inactive';

// Mobile's BusinessRepository.fetchAll() returns a List<BusinessModel> per
// applicant — one applicant can own several businesses — so `ownerApplicantId`
// is a many-to-one link, never assumed to be one business per user.
export interface Business {
  id: string;
  name: string;
  category: BusinessCategory;
  ownerApplicantId: string;
  street: string;
  barangay: string;
  city: string;
  province: string;
  registrationNumber: string;
  dateRegisteredValue: Date;
  dateRegistered: string;
  status: BusinessStatus;
}
