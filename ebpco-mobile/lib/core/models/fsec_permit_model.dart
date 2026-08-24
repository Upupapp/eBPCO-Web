import '../utils/validators.dart';
import 'document_model.dart';

/// Mock, frontend-only data model for the FSEC for Building Permit (BFP)
/// application wizard — the Fire Safety Evaluation Clearance issued by
/// the Bureau of Fire Protection as a prerequisite for a Building
/// Permit's approval, per RA 9514 (Fire Code of the Philippines).
///
/// Unlike the Sign/Fencing Permits' "related Building Permit" step, the
/// reference kept here is deliberately OPTIONAL and informational only —
/// an FSEC is typically filed and evaluated BEFORE the Building Permit it
/// supports has been approved (it is one of the inputs to that approval,
/// not a follow-on to it), so [FsecRelatedBuildingPermit.isValid] never
/// gates on the referenced permit's status the way the Sign/Fencing
/// Permits' does.
///
/// Structured as a 6-step flow: Related Building Permit, Applicant
/// Information, Project & Fire-Safety Information, Design Professional /
/// Engineer of Record, Required Documents, and Review & Declaration.
/// Like every other permit, this model never reads or mutates any other
/// permit provider's state, so it is fully decoupled.

/// A handful of sample Building Permit numbers presented as quick-pick
/// suggestions. Duplicated (not imported) from the other ancillary permit
/// models to keep them fully decoupled.
const List<String> fsecMockBuildingPermitNumbers = [
  'BP-2026-100234',
  'BP-2026-100567',
  'BP-2026-100812',
];

/// Step 1 — Related Building Permit. Purely informational: an FSEC
/// commonly supports a Building Permit application still awaiting
/// approval, so no status here blocks continuing.
class FsecRelatedBuildingPermit {
  String buildingPermitApplicationNumber = '';

  bool get isValid => true;
}

/// Step 2 — Applicant Information.
class FsecApplicantInfo {
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
enum FsecOccupancyGroup {
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

extension FsecOccupancyGroupX on FsecOccupancyGroup {
  String get label {
    switch (this) {
      case FsecOccupancyGroup.groupA:
        return 'Group A — Residential Dwelling';
      case FsecOccupancyGroup.groupB:
        return 'Group B — Residential Hotel or Apartment';
      case FsecOccupancyGroup.groupC:
        return 'Group C — Education and Recreation';
      case FsecOccupancyGroup.groupD:
        return 'Group D — Institutional';
      case FsecOccupancyGroup.groupE:
        return 'Group E — Business and Mercantile';
      case FsecOccupancyGroup.groupF:
        return 'Group F — Industrial';
      case FsecOccupancyGroup.groupG:
        return 'Group G — Storage and Hazardous';
      case FsecOccupancyGroup.groupH:
        return 'Group H — Assembly';
      case FsecOccupancyGroup.groupI:
        return 'Group I — Assembly with Higher Occupant Load';
      case FsecOccupancyGroup.groupJ:
        return 'Group J — Accessory';
      case FsecOccupancyGroup.others:
        return 'Others';
    }
  }
}

/// Step 3 — Project & Fire-Safety Information.
class FsecProjectInformation {
  String projectName = '';
  String street = '';
  String barangay = '';
  String city = '';
  String province = '';

  FsecOccupancyGroup? occupancyGroup;
  String occupancyOtherDescription = '';

  String numberOfStoreys = '';
  String totalFloorAreaSquareMeters = '';
  bool hasFireDetectionOrSprinklerSystem = false;
  String fireProtectionFeaturesDescription = '';

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
    if (occupancyGroup == FsecOccupancyGroup.others &&
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
    return true;
  }
}

/// Step 4 — Design Professional / Engineer or Architect of Record.
enum FsecProfessionType { architect, civilEngineer, mechanicalEngineer }

extension FsecProfessionTypeX on FsecProfessionType {
  String get label {
    switch (this) {
      case FsecProfessionType.architect:
        return 'Architect';
      case FsecProfessionType.civilEngineer:
        return 'Civil Engineer';
      case FsecProfessionType.mechanicalEngineer:
        return 'Mechanical Engineer';
    }
  }
}

class FsecDesignProfessional {
  String fullName = '';
  FsecProfessionType? profession;
  String professionalAddress = '';
  String prcNumber = '';
  DateTime? prcValidityDate;
  String ptrNumber = '';
  DateTime? ptrDateIssued;
  String ptrPlaceIssued = '';

  bool get isValid =>
      Validators.required(fullName) == null &&
      profession != null &&
      Validators.required(professionalAddress) == null &&
      Validators.required(prcNumber, fieldLabel: 'PRC number') == null &&
      prcValidityDate != null &&
      Validators.required(ptrNumber, fieldLabel: 'PTR number') == null &&
      ptrDateIssued != null &&
      Validators.required(
            ptrPlaceIssued,
            fieldLabel: 'PTR place issued',
          ) ==
          null;
}

/// Step 5 — Required Documents, based on BFP Castilla Fire Station Form
/// BFP-QSF-FSED-001 "Fire Safety Evaluation Clearance Application Form".
/// The Fire Safety Compliance Report and the Hot Work Clearance are only
/// required "if necessary"/"if required" per the official form, so both
/// stay optional uploads.
class FsecRequiredDocuments {
  /// Three (3) complete sets of proposed plans, covering Architectural,
  /// Civil/Structural, Electrical, Mechanical, Plumbing, Electronics,
  /// Sanitary, and Fire Protection documents — modeled as one
  /// multi-discipline plan-set upload, per the official form's own
  /// single checklist line item.
  DocumentModel? proposedPlansUpload;

  // Optional — "if necessary"/"if required" per the official form.
  DocumentModel? fireSafetyComplianceReportUpload;
  DocumentModel? hotWorkClearanceUpload;

  DocumentModel? costEstimateUpload;

  bool isValid() {
    return proposedPlansUpload != null && costEstimateUpload != null;
  }
}

/// Step 6 — Review & Declaration: the certifications required before the
/// FSEC application can be submitted.
class FsecReviewDeclaration {
  bool certifiesInformationIsAccurate = false;
  bool certifiesPlansComplyWithFireCode = false;
  bool understandsProfessionalDocumentsMustBeAuthentic = false;
  bool agreesToTerms = false;

  bool get isValid =>
      certifiesInformationIsAccurate &&
      certifiesPlansComplyWithFireCode &&
      understandsProfessionalDocumentsMustBeAuthentic &&
      agreesToTerms;
}

enum FsecPermitDraftStatus { draft, submitted }

/// The full mutable draft for one FSEC for Building Permit (BFP)
/// application session.
class FsecPermitDraft {
  final FsecRelatedBuildingPermit relatedBuildingPermit =
      FsecRelatedBuildingPermit();
  final FsecApplicantInfo applicant = FsecApplicantInfo();
  final FsecProjectInformation projectInformation = FsecProjectInformation();
  final FsecDesignProfessional designProfessional = FsecDesignProfessional();
  final FsecRequiredDocuments requiredDocuments = FsecRequiredDocuments();
  final FsecReviewDeclaration reviewDeclaration = FsecReviewDeclaration();

  FsecPermitDraftStatus status = FsecPermitDraftStatus.draft;
  DateTime? lastSavedAt;

  bool get isStep1Valid => relatedBuildingPermit.isValid;
  bool get isStep2Valid => applicant.isValid;
  bool get isStep3Valid => projectInformation.isValid;
  bool get isStep4Valid => designProfessional.isValid;
  bool get isStep5Valid => requiredDocuments.isValid();
  bool get isStep6Valid => reviewDeclaration.isValid;
}
