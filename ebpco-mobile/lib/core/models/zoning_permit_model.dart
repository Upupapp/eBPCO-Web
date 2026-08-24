import '../utils/validators.dart';
import 'document_model.dart';

/// Mock, frontend-only data model for the Zoning / Locational Clearance
/// application wizard. Unlike every ancillary permit in this app, a
/// Locational Clearance is typically filed BEFORE a Building Permit — it
/// is a prerequisite of that permit rather than a follow-on to it, so
/// this model deliberately has no "related Building Permit" step. Its
/// document checklist reflects general Philippine LGU zoning/locational-
/// clearance practice (no confirmed Castilla-specific source).
///
/// Structured as a compact 4-step flow — Applicant Information, Property
/// & Location Information, Required Documents, and Review & Declaration
/// — reflecting the shorter official Locational Clearance application
/// relative to the longer building-code permits. Like every other permit,
/// this model never reads or mutates any other permit provider's state,
/// so it is fully decoupled.

/// Step 1 — Applicant Information.
class ZoningApplicantInfo {
  String firstName = '';
  String middleName = '';
  String lastName = '';
  String tin = '';
  String contactNumber = '';

  bool get isValid =>
      Validators.required(firstName, fieldLabel: 'First name') == null &&
      Validators.required(lastName, fieldLabel: 'Last name') == null &&
      Validators.required(
            contactNumber,
            fieldLabel: 'Telephone or mobile number',
          ) ==
          null;
}

/// Step 2 — Property & Location Information.
class ZoningPropertyLocation {
  String lotNumber = '';
  String blockNumber = '';
  String tctOrTaxDeclarationNumber = '';
  String street = '';
  String barangay = '';
  String city = '';
  String province = '';

  String existingLandUse = '';
  String intendedUseOrPurpose = '';

  bool get isValid =>
      Validators.required(lotNumber, fieldLabel: 'Lot number') == null &&
      Validators.required(street) == null &&
      Validators.required(barangay) == null &&
      Validators.required(city) == null &&
      Validators.required(province) == null &&
      Validators.required(
            intendedUseOrPurpose,
            fieldLabel: 'Intended use or purpose',
          ) ==
          null;
}

/// Step 3 — Required Documents, based on Castilla's own MPDO Form
/// FM-MPD-12 "Application for Locational Clearance / Certificate of
/// Zoning Compliance". The DPWH Clearance and ECC are only required when
/// applicable to the specific project (e.g. national-road frontage or an
/// environmentally critical area/project), which this app cannot
/// determine on the applicant's behalf, so both stay optional uploads
/// rather than being gated on another field.
class ZoningRequiredDocuments {
  DocumentModel? notarizedLetterRequestUpload;
  DocumentModel? siteDevelopmentPlanUpload;
  DocumentModel? vicinityMapUpload;
  DocumentModel? proofOfOwnershipUpload;
  DocumentModel? taxDeclarationOrTitleUpload;
  DocumentModel? landTaxReceiptUpload;
  DocumentModel? sketchPlanOfHouseUpload;
  DocumentModel? barangayBuildingClearanceUpload;
  DocumentModel? billOfMaterialsUpload;
  DocumentModel? cedulaUpload;

  // Optional — required only "if applicable" per the official form.
  DocumentModel? dpwhClearanceUpload;
  DocumentModel? environmentalComplianceCertificateUpload;

  bool isValid() {
    return notarizedLetterRequestUpload != null &&
        siteDevelopmentPlanUpload != null &&
        vicinityMapUpload != null &&
        proofOfOwnershipUpload != null &&
        taxDeclarationOrTitleUpload != null &&
        landTaxReceiptUpload != null &&
        sketchPlanOfHouseUpload != null &&
        barangayBuildingClearanceUpload != null &&
        billOfMaterialsUpload != null &&
        cedulaUpload != null;
  }
}

/// Step 4 — Review & Declaration: the certifications required before the
/// Zoning / Locational Clearance application can be submitted.
class ZoningReviewDeclaration {
  bool certifiesInformationIsAccurate = false;
  bool certifiesDocumentsAreAuthentic = false;
  bool understandsSubjectToInspectionAndZoningReview = false;
  bool agreesToTerms = false;

  bool get isValid =>
      certifiesInformationIsAccurate &&
      certifiesDocumentsAreAuthentic &&
      understandsSubjectToInspectionAndZoningReview &&
      agreesToTerms;
}

enum ZoningPermitDraftStatus { draft, submitted }

/// The full mutable draft for one Zoning / Locational Clearance
/// application session.
class ZoningPermitDraft {
  final ZoningApplicantInfo applicant = ZoningApplicantInfo();
  final ZoningPropertyLocation propertyLocation = ZoningPropertyLocation();
  final ZoningRequiredDocuments requiredDocuments = ZoningRequiredDocuments();
  final ZoningReviewDeclaration reviewDeclaration = ZoningReviewDeclaration();

  ZoningPermitDraftStatus status = ZoningPermitDraftStatus.draft;
  DateTime? lastSavedAt;

  bool get isStep1Valid => applicant.isValid;
  bool get isStep2Valid => propertyLocation.isValid;
  bool get isStep3Valid => requiredDocuments.isValid();
  bool get isStep4Valid => reviewDeclaration.isValid;
}
