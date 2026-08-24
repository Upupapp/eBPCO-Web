import '../utils/validators.dart';
import 'document_model.dart';

/// Mock, frontend-only data model for the FSIC for Occupancy Permit (BFP)
/// application wizard — the Fire Safety Inspection Certificate issued by
/// the Bureau of Fire Protection as a prerequisite for a Certificate of
/// Occupancy, per RA 9514 Sec. 5(g)/7(a) (Fire Code of the Philippines).
///
/// Unlike FSEC, this permit genuinely depends on a completed building —
/// its Step 1 reference to the related Occupancy/Building Permit DOES
/// gate on approval, mirroring the Sign/Fencing Permits' own "related
/// Building Permit" pattern.
///
/// Structured as a 5-step flow: Related Occupancy/Building Permit,
/// Applicant Information, Building & Project Information, Required
/// Documents, and Review & Declaration. The document checklist is drawn
/// from BFP Castilla Fire Station Form BFP-QSF-FSED-002's "FSIC FOR
/// CERTIFICATE OF OCCUPANCY" section specifically (its separate "FSIC
/// FOR BUSINESS PERMIT" section does not apply to this permit type).
/// Like every other permit, this model never reads or mutates any other
/// permit provider's state, so it is fully decoupled.

/// A handful of sample Occupancy/Building Permit numbers presented as
/// quick-pick suggestions. Duplicated (not imported) from the other
/// ancillary permit models to keep them fully decoupled.
const List<String> fsicMockOccupancyPermitNumbers = [
  'COO-2026-100234',
  'COO-2026-100567',
  'COO-2026-100812',
];

/// Step 1 — Related Occupancy/Building Permit. Unlike FSEC's purely
/// informational reference, this permit genuinely depends on a completed
/// building, so [isValid] gates on the referenced permit's status the
/// same way the Sign/Fencing Permits' own related-Building-Permit step
/// does.
enum FsicRelatedOccupancyPermitStatus {
  pending,
  submitted,
  underEvaluation,
  approved,
  rejected,
  expired,
}

extension FsicRelatedOccupancyPermitStatusX
    on FsicRelatedOccupancyPermitStatus {
  String get label {
    switch (this) {
      case FsicRelatedOccupancyPermitStatus.pending:
        return 'Pending';
      case FsicRelatedOccupancyPermitStatus.submitted:
        return 'Submitted';
      case FsicRelatedOccupancyPermitStatus.underEvaluation:
        return 'Under Evaluation';
      case FsicRelatedOccupancyPermitStatus.approved:
        return 'Approved';
      case FsicRelatedOccupancyPermitStatus.rejected:
        return 'Rejected';
      case FsicRelatedOccupancyPermitStatus.expired:
        return 'Expired';
    }
  }
}

class FsicRelatedOccupancyPermit {
  String occupancyPermitNumber = '';
  FsicRelatedOccupancyPermitStatus status =
      FsicRelatedOccupancyPermitStatus.pending;

  bool get hasValidOccupancyPermitReference =>
      status == FsicRelatedOccupancyPermitStatus.approved &&
      Validators.required(occupancyPermitNumber) == null;

  bool get isValid {
    if (status == FsicRelatedOccupancyPermitStatus.approved) {
      return Validators.required(
            occupancyPermitNumber,
            fieldLabel: 'Occupancy Permit Number',
          ) ==
          null;
    }
    return true;
  }
}

/// Step 2 — Applicant Information.
class FsicApplicantInfo {
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

/// Duplicated (not imported) from the other permit models.
enum FsicOccupancyGroup {
  groupA,
  groupB,
  groupC,
  groupD,
  groupE,
  groupF,
  groupG,
  groupH,
  groupI,
  groupJ,
  others,
}

extension FsicOccupancyGroupX on FsicOccupancyGroup {
  String get label {
    switch (this) {
      case FsicOccupancyGroup.groupA:
        return 'Group A — Residential Dwelling';
      case FsicOccupancyGroup.groupB:
        return 'Group B — Residential Hotel or Apartment';
      case FsicOccupancyGroup.groupC:
        return 'Group C — Education and Recreation';
      case FsicOccupancyGroup.groupD:
        return 'Group D — Institutional';
      case FsicOccupancyGroup.groupE:
        return 'Group E — Business and Mercantile';
      case FsicOccupancyGroup.groupF:
        return 'Group F — Industrial';
      case FsicOccupancyGroup.groupG:
        return 'Group G — Storage and Hazardous';
      case FsicOccupancyGroup.groupH:
        return 'Group H — Assembly';
      case FsicOccupancyGroup.groupI:
        return 'Group I — Assembly with Higher Occupant Load';
      case FsicOccupancyGroup.groupJ:
        return 'Group J — Accessory';
      case FsicOccupancyGroup.others:
        return 'Others';
    }
  }
}

/// Step 3 — Building & Project Information.
class FsicBuildingProjectInformation {
  String projectName = '';
  String street = '';
  String barangay = '';
  String city = '';
  String province = '';

  FsicOccupancyGroup? occupancyGroup;
  String occupancyOtherDescription = '';

  String numberOfStoreys = '';
  String totalFloorAreaSquareMeters = '';
  DateTime? dateOfCompletion;

  bool get isValid {
    if (Validators.required(projectName, fieldLabel: 'Project name') !=
        null) {
      return false;
    }
    if (Validators.required(street) != null ||
        Validators.required(barangay) != null ||
        Validators.required(city) != null ||
        Validators.required(province) != null) {
      return false;
    }
    if (occupancyGroup == null) return false;
    if (occupancyGroup == FsicOccupancyGroup.others &&
        Validators.required(occupancyOtherDescription) != null) {
      return false;
    }
    if (Validators.positiveWholeNumber(
          numberOfStoreys,
          fieldLabel: 'Number of storeys',
        ) !=
        null) {
      return false;
    }
    if (Validators.positiveDecimal(
          totalFloorAreaSquareMeters,
          fieldLabel: 'Total floor area',
        ) !=
        null) {
      return false;
    }
    if (dateOfCompletion == null) return false;
    if (dateOfCompletion!.isAfter(DateTime.now())) return false;
    return true;
  }
}

/// Step 4 — Required Documents, based on BFP Castilla Fire Station Form
/// BFP-QSF-FSED-002's "FSIC FOR CERTIFICATE OF OCCUPANCY" section
/// specifically (its separate "FSIC FOR BUSINESS PERMIT" section does
/// not apply to this permit type). Both the As-Built Plan and the Fire
/// Safety Compliance and Commissioning Report are only required "if
/// necessary" per the official form, so both stay optional uploads.
class FsicRequiredDocuments {
  DocumentModel? oboEndorsementUpload;
  DocumentModel? certificateOfCompletionUpload;
  DocumentModel? assessmentFeeCertifiedCopyUpload;

  // Optional — "if necessary" per the official form.
  DocumentModel? asBuiltPlanUpload;
  DocumentModel? fireSafetyComplianceAndCommissioningReportUpload;

  bool isValid() {
    return oboEndorsementUpload != null &&
        certificateOfCompletionUpload != null &&
        assessmentFeeCertifiedCopyUpload != null;
  }
}

/// Step 5 — Review & Declaration: the certifications required before the
/// FSIC application can be submitted.
class FsicReviewDeclaration {
  bool certifiesInformationIsAccurate = false;
  bool certifiesDocumentsAreAuthentic = false;
  bool understandsSubjectToFireSafetyInspection = false;
  bool agreesToTerms = false;

  bool get isValid =>
      certifiesInformationIsAccurate &&
      certifiesDocumentsAreAuthentic &&
      understandsSubjectToFireSafetyInspection &&
      agreesToTerms;
}

/// Frontend-only permit status values the applicant can observe but never
/// set. [invalidWithoutOccupancyPermit] is never chosen directly — it is
/// always derived (see [FsicPermitDraft.derivedPermitStatus]).
enum FsicPermitStatus {
  submitted,
  underEvaluation,
  forInspection,
  approved,
  rejected,
  invalidWithoutOccupancyPermit,
  completed,
}

extension FsicPermitStatusX on FsicPermitStatus {
  String get label {
    switch (this) {
      case FsicPermitStatus.submitted:
        return 'Submitted';
      case FsicPermitStatus.underEvaluation:
        return 'Under Evaluation';
      case FsicPermitStatus.forInspection:
        return 'For Fire Safety Inspection';
      case FsicPermitStatus.approved:
        return 'Approved';
      case FsicPermitStatus.rejected:
        return 'Rejected';
      case FsicPermitStatus.invalidWithoutOccupancyPermit:
        return 'Invalid Without Occupancy Permit';
      case FsicPermitStatus.completed:
        return 'Completed';
    }
  }
}

enum FsicPermitDraftStatus { draft, submitted }

/// The full mutable draft for one FSIC for Occupancy Permit (BFP)
/// application session.
class FsicPermitDraft {
  final FsicRelatedOccupancyPermit relatedOccupancyPermit =
      FsicRelatedOccupancyPermit();
  final FsicApplicantInfo applicant = FsicApplicantInfo();
  final FsicBuildingProjectInformation buildingProjectInformation =
      FsicBuildingProjectInformation();
  final FsicRequiredDocuments requiredDocuments = FsicRequiredDocuments();
  final FsicReviewDeclaration reviewDeclaration = FsicReviewDeclaration();

  FsicPermitDraftStatus status = FsicPermitDraftStatus.draft;
  DateTime? lastSavedAt;

  bool get isStep1Valid => relatedOccupancyPermit.isValid;
  bool get isStep2Valid => applicant.isValid;
  bool get isStep3Valid => buildingProjectInformation.isValid;
  bool get isStep4Valid => requiredDocuments.isValid();
  bool get isStep5Valid => reviewDeclaration.isValid;

  /// The permit can never be displayed as valid/issued while the related
  /// Occupancy Permit isn't Approved — this is the single source of
  /// truth the Submitted screen renders from.
  FsicPermitStatus get derivedPermitStatus {
    if (!relatedOccupancyPermit.hasValidOccupancyPermitReference) {
      return FsicPermitStatus.invalidWithoutOccupancyPermit;
    }
    return FsicPermitStatus.submitted;
  }
}
