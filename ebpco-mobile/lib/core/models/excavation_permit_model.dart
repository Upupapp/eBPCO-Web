import '../utils/validators.dart';
import 'document_model.dart';

/// Mock, frontend-only data model for the Excavation & Ground Preparation
/// Permit (EGPP) application wizard. Based on the official EGPP form
/// (Boxes 1–7), and — like every other ancillary permit in this app —
/// references a related Building Permit but never reads or mutates any
/// other permit provider's state, so this model is fully decoupled from
/// every other permit model.
///
/// The official form's sections map onto exactly 9 steps, reusing
/// patterns already established by other ancillary permits:
///  - Related Building Permit gets its own Step 1, as in the Fencing and
///    Sign Permits.
///  - Box 1's "Use or Character of Occupancy" field and the form's
///    separate, fuller Occupancy Classification list (Groups A–J) refer
///    to the same underlying value — rather than asking for it twice,
///    this model exposes a single [ExcavationApplicantInfo.occupancyGroup]
///    field that is entered once, in the dedicated Step 5 "Occupancy
///    Classification" step (which is where the full Group A–J option
///    list belongs), not duplicated as a second control in Step 2.
///  - The Design Professional (Box 2) and Full-Time Inspector /
///    Supervisor (Box 3) are kept as two SEPARATE steps (7 and 8), as in
///    the Fencing/Sign Permits, rather than combined into one step.
///  - Step 9 combines Owner Consent, the full application Review, and
///    the Submit action into a single step, exactly as specified — there
///    is no separate Evaluation & Permit Status step.
/// See the step files for the full mapping.

/// Duplicated (not imported) from the other permit models to keep all
/// permit models fully decoupled.
const List<String> excavationFormsOfOwnership = [
  'Sole Proprietorship',
  'Partnership',
  'Corporation',
  'Cooperative',
  'Government',
  'Others',
];

/// Step 5 — Occupancy Classification. Uses this permit's own official
/// group labels (distinct wording from other permits' occupancy lists).
enum ExcavationOccupancyGroup {
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

extension ExcavationOccupancyGroupX on ExcavationOccupancyGroup {
  String get label {
    switch (this) {
      case ExcavationOccupancyGroup.groupA:
        return 'Group A – Residential Dwellings';
      case ExcavationOccupancyGroup.groupB:
        return 'Group B – Residential Hotel / Apartment';
      case ExcavationOccupancyGroup.groupC:
        return 'Group C – Educational / Recreational';
      case ExcavationOccupancyGroup.groupD:
        return 'Group D – Institutional';
      case ExcavationOccupancyGroup.groupE:
        return 'Group E – Business and Mercantile';
      case ExcavationOccupancyGroup.groupF:
        return 'Group F – Industrial';
      case ExcavationOccupancyGroup.groupG:
        return 'Group G – Industrial Storage and Hazardous';
      case ExcavationOccupancyGroup.groupH:
        return 'Group H – Recreational / Assembly (Occupant Load Less Than 1000)';
      case ExcavationOccupancyGroup.groupI:
        return 'Group I – Recreational / Assembly (Occupant Load 1000 or More)';
      case ExcavationOccupancyGroup.groupJ:
        return 'Group J – Agricultural / Accessory';
      case ExcavationOccupancyGroup.others:
        return 'Others';
    }
  }
}

/// Step 2 — Owner / Applicant Information (Box 1). [occupancyGroup] and
/// [occupancyOtherDescription] are entered in Step 5, not here — see this
/// file's top doc-comment.
class ExcavationApplicantInfo {
  String lastName = '';
  String firstName = '';
  String middleInitial = '';
  String tin = '';
  String contactNumber = '';

  bool isOwnedByEnterprise = false;
  String enterpriseName = '';
  String? formOfOwnership;

  ExcavationOccupancyGroup? occupancyGroup;
  String occupancyOtherDescription = '';

  String addressNumber = '';
  String street = '';
  String barangay = '';
  String city = '';
  String zipCode = '';

  bool get isValid {
    final basicsValid =
        Validators.required(firstName) == null &&
        Validators.required(lastName) == null &&
        Validators.required(
              contactNumber,
              fieldLabel: 'Telephone or mobile number',
            ) ==
            null &&
        Validators.required(street) == null &&
        Validators.required(barangay) == null &&
        Validators.required(city) == null;
    if (!basicsValid) return false;
    if (!isOwnedByEnterprise) return true;
    return Validators.required(enterpriseName) == null &&
        formOfOwnership != null;
  }

  bool get isOccupancyValid {
    if (occupancyGroup == null) return false;
    if (occupancyGroup == ExcavationOccupancyGroup.others &&
        Validators.required(occupancyOtherDescription) != null) {
      return false;
    }
    return true;
  }
}

/// Step 3 — Construction Location. No province field, matching the
/// official form's field list for this permit.
class ExcavationConstructionLocation {
  String lotNumber = '';
  String blockNumber = '';
  String tctNumber = '';
  String taxDeclarationNumber = '';
  String street = '';
  String barangay = '';
  String city = '';

  bool get isValid =>
      Validators.required(lotNumber) == null &&
      Validators.required(street) == null &&
      Validators.required(barangay) == null &&
      Validators.required(city) == null;
}

/// A handful of sample Building Permit numbers presented as quick-pick
/// suggestions. Duplicated (not imported) from the other ancillary permit
/// models to keep them fully decoupled.
const List<String> excavationMockBuildingPermitNumbers = [
  'BP-2026-100234',
  'BP-2026-100567',
  'BP-2026-100812',
];

/// Step 1 — Permit Information. The official permit notes it supports
/// construction activities without replacing, and without guaranteeing
/// the granting of, the Building Permit.
enum RelatedBuildingPermitStatus {
  pending,
  submitted,
  underEvaluation,
  approved,
  rejected,
  expired,
}

extension RelatedBuildingPermitStatusX on RelatedBuildingPermitStatus {
  String get label {
    switch (this) {
      case RelatedBuildingPermitStatus.pending:
        return 'Pending';
      case RelatedBuildingPermitStatus.submitted:
        return 'Submitted';
      case RelatedBuildingPermitStatus.underEvaluation:
        return 'Under Evaluation';
      case RelatedBuildingPermitStatus.approved:
        return 'Approved';
      case RelatedBuildingPermitStatus.rejected:
        return 'Rejected';
      case RelatedBuildingPermitStatus.expired:
        return 'Expired';
    }
  }
}

class ExcavationRelatedBuildingPermit {
  String buildingPermitNumber = '';
  RelatedBuildingPermitStatus status = RelatedBuildingPermitStatus.pending;

  bool get hasValidBuildingPermitReference =>
      status == RelatedBuildingPermitStatus.approved &&
      Validators.required(buildingPermitNumber) == null;

  bool get isValid {
    if (status == RelatedBuildingPermitStatus.approved) {
      return Validators.required(
            buildingPermitNumber,
            fieldLabel: 'Building Permit Number',
          ) ==
          null;
    }
    return true;
  }
}

/// Step 4 — Scope of Work (Box 1). Matches the official form's own,
/// shorter list for this permit.
enum ExcavationScopeType {
  newConstruction,
  erection,
  addition,
  renovation,
  repair,
  others,
}

extension ExcavationScopeTypeX on ExcavationScopeType {
  String get label {
    switch (this) {
      case ExcavationScopeType.newConstruction:
        return 'New Construction';
      case ExcavationScopeType.erection:
        return 'Erection';
      case ExcavationScopeType.addition:
        return 'Addition';
      case ExcavationScopeType.renovation:
        return 'Renovation';
      case ExcavationScopeType.repair:
        return 'Repair';
      case ExcavationScopeType.others:
        return 'Others';
    }
  }
}

class ExcavationScopeOfWork {
  final Set<ExcavationScopeType> selectedScopes = {};
  String otherScopeDescription = '';

  bool get isValid {
    if (selectedScopes.isEmpty) return false;
    if (selectedScopes.contains(ExcavationScopeType.others) &&
        Validators.required(otherScopeDescription) != null) {
      return false;
    }
    return true;
  }
}

/// Step 6 — Excavation Details (Box 6). Multiple excavation work types may
/// apply to the same project, so this is a multi-select, matching the
/// Scope of Work step's chip pattern.
enum ExcavationWorkType {
  excavationAndFills,
  foundationAndRetainingWalls,
  pileFoundations,
  gradingAndEarthworks,
  others,
}

extension ExcavationWorkTypeX on ExcavationWorkType {
  String get label {
    switch (this) {
      case ExcavationWorkType.excavationAndFills:
        return 'Excavation and Fills';
      case ExcavationWorkType.foundationAndRetainingWalls:
        return 'Foundation and Retaining Walls';
      case ExcavationWorkType.pileFoundations:
        return 'Pile Foundations';
      case ExcavationWorkType.gradingAndEarthworks:
        return 'Grading and Earthworks';
      case ExcavationWorkType.others:
        return 'Others';
    }
  }
}

class ExcavationDetails {
  final Set<ExcavationWorkType> selectedWorkTypes = {};
  String otherWorkTypeDescription = '';

  String excavationDepthMeters = '';
  String excavationVolumeCubicMeters = '';

  /// Larger excavations (per the permit conditions) may require a cash
  /// bond — this is informational only; no fee is calculated or
  /// collected in this frontend-only prototype.
  bool get exceedsDepthThreshold {
    final depth = double.tryParse(excavationDepthMeters.trim());
    return depth != null && depth > 2;
  }

  bool get exceedsVolumeThreshold {
    final volume = double.tryParse(excavationVolumeCubicMeters.trim());
    return volume != null && volume > 50;
  }

  bool get isValid {
    if (selectedWorkTypes.isEmpty) return false;
    if (selectedWorkTypes.contains(ExcavationWorkType.others) &&
        Validators.required(otherWorkTypeDescription) != null) {
      return false;
    }
    if (Validators.positiveDecimal(
          excavationDepthMeters,
          fieldLabel: 'Excavation depth',
        ) !=
        null) {
      return false;
    }
    if (Validators.positiveDecimal(
          excavationVolumeCubicMeters,
          fieldLabel: 'Excavation volume',
        ) !=
        null) {
      return false;
    }
    return true;
  }
}

/// Both the Design Professional (Step 7) and the Full-Time Inspector /
/// Supervisor (Step 8) choose from the same profession list, per the
/// official form's "Architect or Civil Engineer" label on both boxes.
enum ExcavationProfessionType { architect, civilEngineer }

extension ExcavationProfessionTypeX on ExcavationProfessionType {
  String get label {
    switch (this) {
      case ExcavationProfessionType.architect:
        return 'Architect';
      case ExcavationProfessionType.civilEngineer:
        return 'Civil Engineer';
    }
  }
}

/// Shared license/contact shape for both the Design Professional and the
/// Supervisor — kept internal to this model only, so it introduces no
/// coupling with any other permit.
class ExcavationProfessionalInfo {
  String fullName = '';
  ExcavationProfessionType? profession;
  String address = '';
  String prcNumber = '';
  DateTime? prcValidityDate;
  String ptrNumber = '';
  DateTime? ptrDateIssued;
  String ptrPlaceIssued = '';
  String tin = '';
  DateTime? dateSigned;

  bool get isValid =>
      Validators.required(fullName) == null &&
      profession != null &&
      Validators.required(address) == null &&
      Validators.required(prcNumber) == null &&
      prcValidityDate != null &&
      Validators.required(ptrNumber) == null &&
      ptrDateIssued != null &&
      Validators.required(ptrPlaceIssued) == null;

  bool get prcAppearsExpired =>
      prcValidityDate != null && prcValidityDate!.isBefore(DateTime.now());
  bool get ptrDateIssuedInFuture =>
      ptrDateIssued != null && ptrDateIssued!.isAfter(DateTime.now());
}

/// Steps 7–8 — Design Professional and Full-Time Inspector / Supervisor.
/// Kept as two independent wizard steps (see [ExcavationPermitDraft]'s
/// `isStep7Valid`/`isStep8Valid`), but grouped into one class here since
/// they share the same shape and the "copy" action. Each role has exactly
/// one signed-and-sealed document upload, matching the official form.
class ExcavationProfessionals {
  final ExcavationProfessionalInfo designProfessional =
      ExcavationProfessionalInfo();
  DocumentModel? designSignedDocumentUpload;

  final ExcavationProfessionalInfo supervisor = ExcavationProfessionalInfo();
  DocumentModel? supervisorSignedDocumentUpload;

  /// Explicit, one-shot "use the same information" copy action — triggered
  /// only when the applicant checks the Step 8 checkbox, never kept in
  /// sync automatically afterward.
  void copyDesignProfessionalToSupervisor() {
    supervisor
      ..fullName = designProfessional.fullName
      ..profession = designProfessional.profession
      ..address = designProfessional.address
      ..prcNumber = designProfessional.prcNumber
      ..prcValidityDate = designProfessional.prcValidityDate
      ..ptrNumber = designProfessional.ptrNumber
      ..ptrDateIssued = designProfessional.ptrDateIssued
      ..ptrPlaceIssued = designProfessional.ptrPlaceIssued
      ..tin = designProfessional.tin
      ..dateSigned = designProfessional.dateSigned;
  }

  bool get isDesignProfessionalValid =>
      designProfessional.isValid && designSignedDocumentUpload != null;

  bool get isSupervisorValid =>
      supervisor.isValid && supervisorSignedDocumentUpload != null;

  bool get isValid => isDesignProfessionalValid && isSupervisorValid;
}

/// Shared identity shape for both the Owner and the Lot Owner in Step 9 —
/// internal to this model only.
class ExcavationConsentPerson {
  String printedName = '';
  String address = '';
  String ctcNumber = '';
  DateTime? ctcDateIssued;
  String ctcPlaceIssued = '';
  DateTime? dateSigned;

  bool get isValid =>
      Validators.required(printedName) == null &&
      Validators.required(address) == null &&
      Validators.required(ctcNumber) == null &&
      ctcDateIssued != null &&
      Validators.required(ctcPlaceIssued) == null;
}

/// Step 9 (part 1) — Owner & Lot Owner Consent (Boxes 4–5).
class ExcavationOwnerConsent {
  final ExcavationConsentPerson owner = ExcavationConsentPerson();
  DocumentModel? ownerSignedDocumentUpload;

  bool? isOwnerAlsoLotOwner;
  final ExcavationConsentPerson lotOwner = ExcavationConsentPerson();
  DocumentModel? lotOwnerSignedDocumentUpload;

  bool get needsSeparateLotOwner => isOwnerAlsoLotOwner == false;

  bool get isValid {
    if (!owner.isValid) return false;
    if (ownerSignedDocumentUpload == null) return false;
    if (isOwnerAlsoLotOwner == null) return false;
    if (needsSeparateLotOwner) {
      if (!lotOwner.isValid) return false;
      if (lotOwnerSignedDocumentUpload == null) return false;
    }
    return true;
  }
}

/// Step 9 (part 2) — Review & Submission: the certifications required
/// before the excavation application can be submitted.
class ExcavationReviewDeclaration {
  bool certifiesInformationIsAccurate = false;
  bool understandsMustFollowApprovedPlansAndRegulations = false;
  bool understandsDependsOnRelatedBuildingPermit = false;
  bool understandsProfessionalDocumentsMustBeAuthentic = false;

  bool get isValid =>
      certifiesInformationIsAccurate &&
      understandsMustFollowApprovedPlansAndRegulations &&
      understandsDependsOnRelatedBuildingPermit &&
      understandsProfessionalDocumentsMustBeAuthentic;
}

/// Frontend-only permit status values the applicant can observe but never
/// set. [invalidWithoutBuildingPermit] is never chosen directly — it is
/// always derived (see [ExcavationPermitDraft.derivedPermitStatus]).
enum ExcavationPermitStatus {
  submitted,
  underEvaluation,
  revisionRequired,
  additionalDocumentsRequired,
  forApproval,
  approved,
  rejected,
  invalidWithoutBuildingPermit,
  completed,
}

extension ExcavationPermitStatusX on ExcavationPermitStatus {
  String get label {
    switch (this) {
      case ExcavationPermitStatus.submitted:
        return 'Submitted';
      case ExcavationPermitStatus.underEvaluation:
        return 'Under Evaluation';
      case ExcavationPermitStatus.revisionRequired:
        return 'Revision Required';
      case ExcavationPermitStatus.additionalDocumentsRequired:
        return 'Additional Documents Required';
      case ExcavationPermitStatus.forApproval:
        return 'For Approval';
      case ExcavationPermitStatus.approved:
        return 'Approved';
      case ExcavationPermitStatus.rejected:
        return 'Rejected';
      case ExcavationPermitStatus.invalidWithoutBuildingPermit:
        return 'Invalid Without Building Permit';
      case ExcavationPermitStatus.completed:
        return 'Completed';
    }
  }
}

/// The official permit's office-only sections: Verification (Land Use &
/// Zoning, Line & Grade, Courtyard & Parking), Recommendation for
/// Approval, Action Taken, and Permit Issuance. Every field is
/// office-controlled — there is no applicant-editable state in this
/// class — and every field starts out `null`/unset, since this is a
/// frontend-only prototype with no real backend to populate them. Not
/// surfaced as a wizard step, but modeled here so a future staff-side or
/// application-status surface can display them read-only without any
/// shape changes.
class ExcavationProcessingInfo {
  String? landUseAndZoningVerification;
  String? lineAndGradeVerification;
  String? courtyardAndParkingVerification;
  String? recommendationForApproval;
  String? actionTaken;
  String? permitIssuanceStatus;
  double? filingFee;
  double? processingFee;
  double? otherAssessedFees;
  String? officialReceiptNumber;
  DateTime? datePaid;
  String? processedBy;

  double? get totalAssessedFees {
    if (filingFee == null && processingFee == null && otherAssessedFees == null) {
      return null;
    }
    return (filingFee ?? 0) + (processingFee ?? 0) + (otherAssessedFees ?? 0);
  }

  String get paymentStatus => datePaid != null ? 'Paid' : 'Not yet paid';

  static const List<String> progressStages = [
    'EGPP Documents Received',
    'Land Use & Zoning Verification',
    'Line & Grade Verification',
    'Courtyard & Parking Verification',
    'Recommending Approval',
    'Building Official Decision',
  ];

  static const List<String> permitConditions = [
    'Excavation and ground preparation work must follow the approved '
        'plans and applicable regulations.',
    'A licensed professional must supervise or take charge of the work.',
    'Required signed and sealed professional documents must be authentic.',
    'This permit supports construction activities but does not replace, '
        'and does not guarantee the granting of, the Building Permit.',
    'Larger excavations may require a cash bond per the permit '
        'conditions.',
  ];

  bool get isValid => true;
}

enum ExcavationPermitDraftStatus { draft, submitted }

/// The full mutable draft for one Excavation & Ground Preparation Permit
/// application session.
class ExcavationPermitDraft {
  final ExcavationRelatedBuildingPermit relatedBuildingPermit =
      ExcavationRelatedBuildingPermit();
  final ExcavationApplicantInfo applicant = ExcavationApplicantInfo();
  final ExcavationConstructionLocation constructionLocation =
      ExcavationConstructionLocation();
  final ExcavationScopeOfWork scopeOfWork = ExcavationScopeOfWork();
  final ExcavationDetails excavationDetails = ExcavationDetails();
  final ExcavationProfessionals professionals = ExcavationProfessionals();
  final ExcavationOwnerConsent ownerConsent = ExcavationOwnerConsent();
  final ExcavationReviewDeclaration reviewDeclaration =
      ExcavationReviewDeclaration();
  final ExcavationProcessingInfo processingInfo = ExcavationProcessingInfo();

  bool useApplicantAddressForConstructionLocation = false;
  ExcavationPermitDraftStatus status = ExcavationPermitDraftStatus.draft;
  DateTime? lastSavedAt;

  bool get isStep1Valid => relatedBuildingPermit.isValid;
  bool get isStep2Valid => applicant.isValid;
  bool get isStep3Valid => constructionLocation.isValid;
  bool get isStep4Valid => scopeOfWork.isValid;
  bool get isStep5Valid => applicant.isOccupancyValid;
  bool get isStep6Valid => excavationDetails.isValid;
  bool get isStep7Valid => professionals.isDesignProfessionalValid;
  bool get isStep8Valid => professionals.isSupervisorValid;
  bool get isStep9Valid => ownerConsent.isValid && reviewDeclaration.isValid;

  void copyApplicantAddressToConstructionLocation() {
    constructionLocation
      ..street = applicant.street
      ..barangay = applicant.barangay
      ..city = applicant.city;
  }

  /// The permit can never be displayed as valid/issued while the related
  /// Building Permit isn't Approved — this is the single source of truth
  /// the Submitted screen renders from.
  ExcavationPermitStatus get derivedPermitStatus {
    if (!relatedBuildingPermit.hasValidBuildingPermitReference) {
      return ExcavationPermitStatus.invalidWithoutBuildingPermit;
    }
    return ExcavationPermitStatus.submitted;
  }
}
