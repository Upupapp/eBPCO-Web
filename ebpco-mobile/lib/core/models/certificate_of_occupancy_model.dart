import '../utils/validators.dart';
import 'document_model.dart';

/// Mock, frontend-only data model for the Certificate of Occupancy
/// application wizard. Based on the official Application for Certificate
/// of Occupancy form — unlike every ancillary permit in this app, the
/// official form is a single page, so this wizard deliberately uses only
/// 5 steps instead of the 9–10 steps used by the longer permit forms:
///  - Step 1 combines the Building Permit reference and the Full/Partial
///    certificate type — both belong to the same short "About this
///    application" section on the paper form.
///  - Step 4 (Requirements) and Step 5 (Certification/Review/Submission)
///    absorb what would otherwise be several additional steps in a
///    longer permit, since the paper form's remaining sections
///    (submitted-requirements checklist, applicant certification) are
///    each short enough to fit one focused step without crowding.
/// Like every other permit, this model never reads or mutates any other
/// permit provider's state, so it is fully decoupled.

/// A sample Building Permit record (number + issue date) presented as a
/// quick-pick so the applicant can auto-fill Step 1 instead of retyping
/// values already on file. Duplicated (not imported) from the other
/// ancillary permit models' simpler number-only lists, since this form
/// also needs the issue date.
class MockBuildingPermitRecord {
  final String number;
  final DateTime dateIssued;
  MockBuildingPermitRecord(this.number, this.dateIssued);
}

/// Not `const` — [DateTime]'s constructor isn't a const constructor.
final List<MockBuildingPermitRecord> occupancyMockBuildingPermits = [
  MockBuildingPermitRecord('BP-2026-100234', DateTime(2026, 1, 12)),
  MockBuildingPermitRecord('BP-2026-100567', DateTime(2026, 2, 20)),
  MockBuildingPermitRecord('BP-2026-100812', DateTime(2026, 3, 5)),
];

/// Step 1 — Full or Partial Certificate of Occupancy.
enum CertificateType { full, partial }

extension CertificateTypeX on CertificateType {
  String get label {
    switch (this) {
      case CertificateType.full:
        return 'Full';
      case CertificateType.partial:
        return 'Partial';
    }
  }
}

/// Step 1 — Building Permit reference and certificate type.
class OccupancyPermitInfo {
  String buildingPermitNumber = '';
  DateTime? buildingPermitDateIssued;
  CertificateType? certificateType;
  String partialDescription = '';
  DateTime applicationDate = DateTime.now();

  bool get isValid {
    if (Validators.required(
          buildingPermitNumber,
          fieldLabel: 'Building Permit Number',
        ) !=
        null) {
      return false;
    }
    if (buildingPermitDateIssued == null) return false;
    if (certificateType == null) return false;
    if (certificateType == CertificateType.partial &&
        Validators.required(partialDescription) != null) {
      return false;
    }
    return true;
  }
}

/// Step 2 — Owner and Project Information. Unlike other permits, the
/// owner's address is a single free-text field, matching this form's own
/// flat field list (no separate street/barangay/city breakdown).
class OccupancyOwnerInfo {
  String lastName = '';
  String firstName = '';
  String middleInitial = '';
  String address = '';
  String zipCode = '';
  String contactNumber = '';
  String projectName = '';

  bool get isValid =>
      Validators.required(lastName) == null &&
      Validators.required(firstName) == null &&
      Validators.required(address) == null &&
      Validators.required(
            contactNumber,
            fieldLabel: 'Telephone or mobile number',
          ) ==
          null &&
      Validators.required(projectName, fieldLabel: 'Project name') == null;
}

/// Duplicated (not imported) from the other permit models.
enum OccupancyGroup {
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

extension OccupancyGroupX on OccupancyGroup {
  String get label {
    switch (this) {
      case OccupancyGroup.groupA:
        return 'Group A — Residential Dwelling';
      case OccupancyGroup.groupB:
        return 'Group B — Residential Hotel or Apartment';
      case OccupancyGroup.groupC:
        return 'Group C — Education and Recreation';
      case OccupancyGroup.groupD:
        return 'Group D — Institutional';
      case OccupancyGroup.groupE:
        return 'Group E — Business and Mercantile';
      case OccupancyGroup.groupF:
        return 'Group F — Industrial';
      case OccupancyGroup.groupG:
        return 'Group G — Storage and Hazardous';
      case OccupancyGroup.groupH:
        return 'Group H — Assembly';
      case OccupancyGroup.groupI:
        return 'Group I — Assembly with Higher Occupant Load';
      case OccupancyGroup.groupJ:
        return 'Group J — Accessory';
      case OccupancyGroup.others:
        return 'Others';
    }
  }
}

/// Step 3 — Project Location and Building Details.
class OccupancyProjectDetails {
  String lotNumber = '';
  String blockNumber = '';
  String street = '';
  String barangay = '';
  String city = '';

  OccupancyGroup? occupancyGroup;
  String occupancyOtherDescription = '';

  String numberOfStoreys = '';
  String numberOfUnits = '';
  String totalFloorAreaSquareMeters = '';
  DateTime? dateOfCompletion;

  bool get isValid {
    if (Validators.required(lotNumber, fieldLabel: 'Lot number') != null) {
      return false;
    }
    if (Validators.required(street) != null ||
        Validators.required(barangay) != null ||
        Validators.required(city) != null) {
      return false;
    }
    if (occupancyGroup == null) return false;
    if (occupancyGroup == OccupancyGroup.others &&
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
    if (Validators.positiveWholeNumber(
          numberOfUnits,
          fieldLabel: 'Number of units',
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

/// A user-added "Other document" — the applicant names and describes a
/// requirement not covered by the fixed checklist, then attaches a file.
class OccupancyOtherDocument {
  String name;
  String description;
  DocumentModel? file;

  OccupancyOtherDocument({this.name = '', this.description = ''});

  bool get isValid => Validators.required(name) == null && file != null;
}

/// Step 4 — Requirements and Supporting Documents. The paper form's
/// request for three physical copies of the as-built plans is
/// represented as a single digital upload here.
class OccupancyRequiredDocuments {
  DocumentModel? asBuiltPlansUpload;
  DocumentModel? constructionLogbookUpload;
  DocumentModel? civilWorksCertificateUpload;
  DocumentModel? electricalCertificateUpload;

  // Conditionally required in practice ("when applicable" / "when
  // required" per the official form), so not blocking here.
  DocumentModel? otherDisciplineCertificatesUpload;
  DocumentModel? notarizedDocumentsUpload;
  DocumentModel? otherSupportingRequirementsUpload;

  final List<OccupancyOtherDocument> otherDocuments = [];

  bool isValid() {
    if (asBuiltPlansUpload == null) return false;
    if (constructionLogbookUpload == null) return false;
    if (civilWorksCertificateUpload == null) return false;
    if (electricalCertificateUpload == null) return false;
    for (final doc in otherDocuments) {
      if (!doc.isValid) return false;
    }
    return true;
  }
}

/// Step 5 — Applicant Certification.
class OccupancyCertification {
  String submittedByName = '';
  String ctcNumber = '';
  DateTime? ctcDateIssued;
  String ctcPlaceIssued = '';
  DocumentModel? signedDocumentUpload;

  bool get isValid =>
      Validators.required(submittedByName, fieldLabel: 'Submitted-by name') ==
          null &&
      Validators.required(ctcNumber, fieldLabel: 'CTC number') == null &&
      ctcDateIssued != null &&
      Validators.required(ctcPlaceIssued, fieldLabel: 'CTC place issued') ==
          null &&
      signedDocumentUpload != null;
}

/// Step 5 — Declaration required before submission.
class OccupancyDeclaration {
  bool certifiesInformationIsAccurate = false;
  bool certifiesConstructionMatchesApprovedPlans = false;
  bool certifiesDocumentsAreAuthentic = false;
  bool understandsSubjectToInspectionAndEvaluation = false;

  bool get isValid =>
      certifiesInformationIsAccurate &&
      certifiesConstructionMatchesApprovedPlans &&
      certifiesDocumentsAreAuthentic &&
      understandsSubjectToInspectionAndEvaluation;
}

/// The mocked, applicant-visible status sequence for a submitted
/// Certificate of Occupancy application. Frontend-only: nothing here
/// reflects real backend processing, but it follows the same
/// "ordered stage list with a current position" shape used for status
/// display elsewhere in this app.
enum CertificateApplicationStatus {
  submitted,
  documentVerification,
  inspectionScheduling,
  inspection,
  evaluation,
  approvedOrAdditionalRequirements,
  certificateIssued,
}

extension CertificateApplicationStatusX on CertificateApplicationStatus {
  String get label {
    switch (this) {
      case CertificateApplicationStatus.submitted:
        return 'Submitted';
      case CertificateApplicationStatus.documentVerification:
        return 'Document Verification';
      case CertificateApplicationStatus.inspectionScheduling:
        return 'Inspection Scheduling';
      case CertificateApplicationStatus.inspection:
        return 'Inspection';
      case CertificateApplicationStatus.evaluation:
        return 'Evaluation';
      case CertificateApplicationStatus.approvedOrAdditionalRequirements:
        return 'Approved or Additional Requirements';
      case CertificateApplicationStatus.certificateIssued:
        return 'Certificate Issued';
    }
  }
}

/// The ordered stage sequence shown on the Submitted screen, matching the
/// shape (though not the wiring) of `applicationStatusSequence` used by
/// the Business Permit application flow elsewhere in this app.
const List<CertificateApplicationStatus> certificateStatusSequence = [
  CertificateApplicationStatus.submitted,
  CertificateApplicationStatus.documentVerification,
  CertificateApplicationStatus.inspectionScheduling,
  CertificateApplicationStatus.inspection,
  CertificateApplicationStatus.evaluation,
  CertificateApplicationStatus.approvedOrAdditionalRequirements,
  CertificateApplicationStatus.certificateIssued,
];

enum CertificateOfOccupancyDraftStatus { draft, submitted }

/// The full mutable draft for one Certificate of Occupancy application
/// session.
class CertificateOfOccupancyDraft {
  final OccupancyPermitInfo permitInfo = OccupancyPermitInfo();
  final OccupancyOwnerInfo owner = OccupancyOwnerInfo();
  final OccupancyProjectDetails projectDetails = OccupancyProjectDetails();
  final OccupancyRequiredDocuments requiredDocuments =
      OccupancyRequiredDocuments();
  final OccupancyCertification certification = OccupancyCertification();
  final OccupancyDeclaration declaration = OccupancyDeclaration();

  CertificateOfOccupancyDraftStatus status =
      CertificateOfOccupancyDraftStatus.draft;
  DateTime? lastSavedAt;

  bool get isStep1Valid => permitInfo.isValid;
  bool get isStep2Valid => owner.isValid;
  bool get isStep3Valid => projectDetails.isValid;
  bool get isStep4Valid => requiredDocuments.isValid();
  bool get isStep5Valid => certification.isValid && declaration.isValid;
}
