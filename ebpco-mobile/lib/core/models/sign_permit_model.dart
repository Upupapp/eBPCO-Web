import '../utils/validators.dart';
import 'document_model.dart';

/// Mock, frontend-only data model for the Sign Permit application wizard.
/// Based on the official Sign Permit form (Boxes 1–9), and — like every
/// other ancillary permit in this app — references a related Building
/// Permit but never reads or mutates any other permit provider's state,
/// so this model is fully decoupled from every other permit model.
///
/// The official form's sections map onto exactly 10 steps, combining
/// patterns already established by other ancillary permits:
///  - Related Building Permit gets its own Step 1 (as in the Fencing
///    Permit), rather than being folded into Address & Location.
///  - The Design Professional (Box 3) and Full-Time Inspector /
///    Supervisor (Box 4) are kept as two SEPARATE steps (7 and 8), as in
///    the Fencing Permit, rather than combined into one step.
///  - Required Documents (Box 2) gets its own Step 6, as in the
///    Electronics/Interior Design Permits, rather than being folded into
///    the professional/consent steps.
///  - Step 10 combines Review with the Submit action, as in the Fencing
///    Permit — there is no separate Evaluation & Permit Status step.
/// See the step files for the full mapping.

/// Duplicated (not imported) from the other permit models to keep all
/// permit models fully decoupled.
const List<String> signFormsOfOwnership = [
  'Sole Proprietorship',
  'Partnership',
  'Corporation',
  'Cooperative',
  'Government',
  'Others',
];

/// Duplicated (not imported) from the other permit models.
enum SignOccupancyGroup {
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

extension SignOccupancyGroupX on SignOccupancyGroup {
  String get label {
    switch (this) {
      case SignOccupancyGroup.groupA:
        return 'Group A — Residential Dwelling';
      case SignOccupancyGroup.groupB:
        return 'Group B — Residential Hotel or Apartment';
      case SignOccupancyGroup.groupC:
        return 'Group C — Education and Recreation';
      case SignOccupancyGroup.groupD:
        return 'Group D — Institutional';
      case SignOccupancyGroup.groupE:
        return 'Group E — Business and Mercantile';
      case SignOccupancyGroup.groupF:
        return 'Group F — Industrial';
      case SignOccupancyGroup.groupG:
        return 'Group G — Storage and Hazardous';
      case SignOccupancyGroup.groupH:
        return 'Group H — Assembly';
      case SignOccupancyGroup.groupI:
        return 'Group I — Assembly with Higher Occupant Load';
      case SignOccupancyGroup.groupJ:
        return 'Group J — Accessory';
      case SignOccupancyGroup.others:
        return 'Others';
    }
  }
}

/// Step 2 — Applicant Information (Box 1).
class SignApplicantInfo {
  String lastName = '';
  String firstName = '';
  String middleInitial = '';
  String tin = '';
  String contactNumber = '';

  bool isOwnedByEnterprise = false;
  String enterpriseName = '';
  String? formOfOwnership;

  SignOccupancyGroup? occupancyGroup;
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
        occupancyGroup != null &&
        Validators.required(street) == null &&
        Validators.required(barangay) == null &&
        Validators.required(city) == null;
    if (!basicsValid) return false;
    if (occupancyGroup == SignOccupancyGroup.others &&
        Validators.required(occupancyOtherDescription) != null) {
      return false;
    }
    if (!isOwnedByEnterprise) return true;
    return Validators.required(enterpriseName) == null &&
        formOfOwnership != null;
  }
}

/// Step 3 — Construction Location. No province field, matching the
/// official form's field list for this permit.
class SignConstructionLocation {
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
const List<String> signMockBuildingPermitNumbers = [
  'BP-2026-100234',
  'BP-2026-100567',
  'BP-2026-100812',
];

/// Step 1 — Permit Information. The official form states the Sign Permit
/// is associated with a Building Permit when applicable.
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

class SignRelatedBuildingPermit {
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

/// Step 4 — Scope of Work (Box 1). Matches the official form's own list
/// for this permit.
enum SignScopeType {
  newInstallation,
  erection,
  addition,
  alteration,
  renovation,
  conversion,
  repair,
  moving,
  demolition,
  ancillaryBuildingOrStructure,
  others,
}

extension SignScopeTypeX on SignScopeType {
  String get label {
    switch (this) {
      case SignScopeType.newInstallation:
        return 'New Installation';
      case SignScopeType.erection:
        return 'Erection';
      case SignScopeType.addition:
        return 'Addition';
      case SignScopeType.alteration:
        return 'Alteration';
      case SignScopeType.renovation:
        return 'Renovation';
      case SignScopeType.conversion:
        return 'Conversion';
      case SignScopeType.repair:
        return 'Repair';
      case SignScopeType.moving:
        return 'Moving';
      case SignScopeType.demolition:
        return 'Demolition';
      case SignScopeType.ancillaryBuildingOrStructure:
        return 'Ancillary Building / Structure';
      case SignScopeType.others:
        return 'Others';
    }
  }
}

class SignScopeOfWork {
  final Set<SignScopeType> selectedScopes = {};
  String otherScopeDescription = '';

  bool get isValid {
    if (selectedScopes.isEmpty) return false;
    if (selectedScopes.contains(SignScopeType.others) &&
        Validators.required(otherScopeDescription) != null) {
      return false;
    }
    return true;
  }
}

/// Step 5 — Sign Information ("Use or Character of Occupancy" section).
enum SignDisplayFaceType { singleFace, doubleFace, multiMedia }

extension SignDisplayFaceTypeX on SignDisplayFaceType {
  String get label {
    switch (this) {
      case SignDisplayFaceType.singleFace:
        return 'Single Face';
      case SignDisplayFaceType.doubleFace:
        return 'Double Face';
      case SignDisplayFaceType.multiMedia:
        return 'Multi-Media';
    }
  }
}

enum SignDisplayType { neon, illuminated, paintedOn, other }

extension SignDisplayTypeX on SignDisplayType {
  String get label {
    switch (this) {
      case SignDisplayType.neon:
        return 'Neon';
      case SignDisplayType.illuminated:
        return 'Illuminated';
      case SignDisplayType.paintedOn:
        return 'Painted-on';
      case SignDisplayType.other:
        return 'Other';
    }
  }
}

enum SignInstallationType {
  businessWallType,
  businessProjectingType,
  businessGroundType,
  businessTemporary,
  advertisingGroundType,
  advertisingWallType,
  advertisingOther,
}

extension SignInstallationTypeX on SignInstallationType {
  String get label {
    switch (this) {
      case SignInstallationType.businessWallType:
        return 'Business Sign – Wall Type';
      case SignInstallationType.businessProjectingType:
        return 'Business Sign – Projecting Type';
      case SignInstallationType.businessGroundType:
        return 'Business Sign – Ground Type';
      case SignInstallationType.businessTemporary:
        return 'Business Sign – Temporary';
      case SignInstallationType.advertisingGroundType:
        return 'Advertising Sign – Ground Type';
      case SignInstallationType.advertisingWallType:
        return 'Advertising Sign – Wall Type';
      case SignInstallationType.advertisingOther:
        return 'Advertising Sign – Other';
    }
  }
}

class SignInformation {
  SignDisplayFaceType? displayFaceType;

  SignDisplayType? displayType;
  String otherDisplayTypeDescription = '';

  SignInstallationType? installationType;
  String otherInstallationDescription = '';

  String lengthMeters = '';
  String widthMeters = '';

  /// Automatically derived from [lengthMeters] × [widthMeters] — never a
  /// directly-settable field, and shown as a read-only value in the UI.
  double? get displayAreaSquareMeters {
    final length = double.tryParse(lengthMeters.trim());
    final width = double.tryParse(widthMeters.trim());
    if (length == null || width == null) return null;
    return length * width;
  }

  bool get isValid {
    if (displayFaceType == null) return false;
    if (displayType == null) return false;
    if (displayType == SignDisplayType.other &&
        Validators.required(otherDisplayTypeDescription) != null) {
      return false;
    }
    if (installationType == null) return false;
    if (installationType == SignInstallationType.advertisingOther &&
        Validators.required(otherInstallationDescription) != null) {
      return false;
    }
    if (Validators.positiveDecimal(lengthMeters, fieldLabel: 'Length') !=
        null) {
      return false;
    }
    if (Validators.positiveDecimal(widthMeters, fieldLabel: 'Width') !=
        null) {
      return false;
    }
    return true;
  }
}

/// Step 6 — Required Supporting Documents (Box 2). Whether the applicant
/// owns the property is asked directly in this step, since it determines
/// whether the Contract of Lease upload is required — the official form
/// does not ask this anywhere else.
class SignRequiredDocuments {
  bool? isApplicantPropertyOwner;

  DocumentModel? tctOrOctCopyUpload;
  DocumentModel? taxDeclarationUpload;
  DocumentModel? realtyTaxReceiptUpload;
  DocumentModel? contractOfLeaseUpload;
  DocumentModel? lotPlanUpload;
  DocumentModel? siteDevelopmentPlanUpload;
  DocumentModel? signStructurePlansUpload;
  DocumentModel? structuralDesignAndComputationsUpload;
  DocumentModel? specificationsUpload;
  DocumentModel? costEstimatesUpload;

  bool get needsContractOfLease => isApplicantPropertyOwner == false;

  bool isValid() {
    if (isApplicantPropertyOwner == null) return false;
    if (needsContractOfLease && contractOfLeaseUpload == null) return false;
    return tctOrOctCopyUpload != null &&
        taxDeclarationUpload != null &&
        realtyTaxReceiptUpload != null &&
        lotPlanUpload != null &&
        siteDevelopmentPlanUpload != null &&
        signStructurePlansUpload != null &&
        structuralDesignAndComputationsUpload != null &&
        specificationsUpload != null &&
        costEstimatesUpload != null;
  }
}

/// Both the Design Professional (Step 7) and the Full-Time Inspector /
/// Supervisor (Step 8) choose from the same profession list, per the
/// official form's "Architect / Civil Engineer" label on both boxes.
enum SignProfessionType { architect, civilEngineer }

extension SignProfessionTypeX on SignProfessionType {
  String get label {
    switch (this) {
      case SignProfessionType.architect:
        return 'Architect';
      case SignProfessionType.civilEngineer:
        return 'Civil Engineer';
    }
  }
}

/// Shared license/contact shape for both the Design Professional and the
/// Supervisor — kept internal to this model only, so it introduces no
/// coupling with any other permit.
class SignProfessionalInfo {
  String fullName = '';
  SignProfessionType? profession;
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
/// Kept as two independent wizard steps (see [SignPermitDraft]'s
/// `isStep7Valid`/`isStep8Valid`), but grouped into one class here since
/// they share the same shape and the "copy" action. Each role has exactly
/// one signed-and-sealed document upload, matching the official form.
class SignProfessionals {
  final SignProfessionalInfo designProfessional = SignProfessionalInfo();
  DocumentModel? designSignedDocumentUpload;

  final SignProfessionalInfo supervisor = SignProfessionalInfo();
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

/// Shared identity shape for both the Applicant and the Building Owner in
/// Step 9 — internal to this model only. TIN is optional for both, per
/// this app's established convention for TIN fields elsewhere.
class SignConsentPerson {
  String printedName = '';
  String address = '';
  String ctcNumber = '';
  DateTime? ctcDateIssued;
  String ctcPlaceIssued = '';
  String tin = '';
  DateTime? dateSigned;

  bool get isValid =>
      Validators.required(printedName) == null &&
      Validators.required(address) == null &&
      Validators.required(ctcNumber) == null &&
      ctcDateIssued != null &&
      Validators.required(ctcPlaceIssued) == null;
}

/// Step 9 — Applicant & Owner Consent (Boxes 5–6).
class SignApplicantOwnerConsent {
  final SignConsentPerson applicant = SignConsentPerson();
  DocumentModel? applicantSignedDocumentUpload;

  bool? isApplicantAlsoBuildingOwner;
  final SignConsentPerson buildingOwner = SignConsentPerson();
  DocumentModel? buildingOwnerSignedDocumentUpload;

  bool get needsSeparateBuildingOwner => isApplicantAlsoBuildingOwner == false;

  bool get isValid {
    if (!applicant.isValid) return false;
    if (applicantSignedDocumentUpload == null) return false;
    if (isApplicantAlsoBuildingOwner == null) return false;
    if (needsSeparateBuildingOwner) {
      if (!buildingOwner.isValid) return false;
      if (buildingOwnerSignedDocumentUpload == null) return false;
    }
    return true;
  }
}

/// Step 10 — Review & Submission: the certifications required before the
/// sign application can be submitted.
class SignReviewDeclaration {
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
/// always derived (see [SignPermitDraft.derivedPermitStatus]).
enum SignPermitStatus {
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

extension SignPermitStatusX on SignPermitStatus {
  String get label {
    switch (this) {
      case SignPermitStatus.submitted:
        return 'Submitted';
      case SignPermitStatus.underEvaluation:
        return 'Under Evaluation';
      case SignPermitStatus.revisionRequired:
        return 'Revision Required';
      case SignPermitStatus.additionalDocumentsRequired:
        return 'Additional Documents Required';
      case SignPermitStatus.forApproval:
        return 'For Approval';
      case SignPermitStatus.approved:
        return 'Approved';
      case SignPermitStatus.rejected:
        return 'Rejected';
      case SignPermitStatus.invalidWithoutBuildingPermit:
        return 'Invalid Without Building Permit';
      case SignPermitStatus.completed:
        return 'Completed';
    }
  }
}

/// Boxes 8–9 on the paper form: processing, fees, official receipt,
/// action taken, and permit issuance information. Every field is
/// office-controlled — there is no applicant-editable state in this
/// class — and every field starts out `null`/unset, since this is a
/// frontend-only prototype with no real backend to populate them. Not
/// surfaced as a wizard step (the official form's Boxes 8–9 are
/// explicitly office-only), but modeled here so a future staff-side or
/// application-status surface can display them read-only without any
/// shape changes.
class SignProcessingInfo {
  String? reviewStage;
  String? processingDivision;
  String? actionTaken;
  double? filingFee;
  double? processingFee;
  double? otherAssessedFees;
  String? officialReceiptNumber;
  DateTime? datePaid;
  String? processedBy;
  String? permitIssuanceStatus;

  double? get totalAssessedFees {
    if (filingFee == null && processingFee == null && otherAssessedFees == null) {
      return null;
    }
    return (filingFee ?? 0) + (processingFee ?? 0) + (otherAssessedFees ?? 0);
  }

  String get paymentStatus => datePaid != null ? 'Paid' : 'Not yet paid';

  static const List<String> progressStages = [
    'Sign Permit Documents Received',
    'Sign Permit Section Review',
    'Structural Review',
    'Recommending Approval',
    'Building Official Decision',
  ];

  static const List<String> permitConditions = [
    'Sign installation must follow the approved plans and applicable regulations.',
    'A licensed professional must supervise or take charge of the work.',
    'Required signed and sealed professional documents must be authentic.',
    'The Sign Permit is invalid without the related Building Permit.',
  ];

  bool get isValid => true;
}

enum SignPermitDraftStatus { draft, submitted }

/// The full mutable draft for one Sign Permit application session.
class SignPermitDraft {
  final SignRelatedBuildingPermit relatedBuildingPermit =
      SignRelatedBuildingPermit();
  final SignApplicantInfo applicant = SignApplicantInfo();
  final SignConstructionLocation constructionLocation =
      SignConstructionLocation();
  final SignScopeOfWork scopeOfWork = SignScopeOfWork();
  final SignInformation signInformation = SignInformation();
  final SignRequiredDocuments requiredDocuments = SignRequiredDocuments();
  final SignProfessionals professionals = SignProfessionals();
  final SignApplicantOwnerConsent consent = SignApplicantOwnerConsent();
  final SignReviewDeclaration reviewDeclaration = SignReviewDeclaration();
  final SignProcessingInfo processingInfo = SignProcessingInfo();

  bool useApplicantAddressForConstructionLocation = false;
  SignPermitDraftStatus status = SignPermitDraftStatus.draft;
  DateTime? lastSavedAt;

  bool get isStep1Valid => relatedBuildingPermit.isValid;
  bool get isStep2Valid => applicant.isValid;
  bool get isStep3Valid => constructionLocation.isValid;
  bool get isStep4Valid => scopeOfWork.isValid;
  bool get isStep5Valid => signInformation.isValid;
  bool get isStep6Valid => requiredDocuments.isValid();
  bool get isStep7Valid => professionals.isDesignProfessionalValid;
  bool get isStep8Valid => professionals.isSupervisorValid;
  bool get isStep9Valid => consent.isValid;
  bool get isStep10Valid => reviewDeclaration.isValid;

  void copyApplicantAddressToConstructionLocation() {
    constructionLocation
      ..street = applicant.street
      ..barangay = applicant.barangay
      ..city = applicant.city;
  }

  /// The permit can never be displayed as valid/issued while the related
  /// Building Permit isn't Approved — this is the single source of truth
  /// the Submitted screen renders from.
  SignPermitStatus get derivedPermitStatus {
    if (!relatedBuildingPermit.hasValidBuildingPermitReference) {
      return SignPermitStatus.invalidWithoutBuildingPermit;
    }
    return SignPermitStatus.submitted;
  }
}
