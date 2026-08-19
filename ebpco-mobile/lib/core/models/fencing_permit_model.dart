import '../utils/validators.dart';
import 'document_model.dart';

/// Mock, frontend-only data model for the Fencing Permit application
/// wizard. Based on the official Fencing Permit form (Boxes 1–8), and —
/// like every other ancillary permit in this app — references a related
/// Building Permit but never reads or mutates any other permit provider's
/// state, so this model is fully decoupled from every other permit model.
///
/// Unlike Electronics/Interior Design (whose official forms list more
/// sections than fit in 9 steps and had to be folded together), the
/// Fencing Permit's official form maps onto exactly 9 steps as given, with
/// two notable differences from every other permit's canonical shape:
///  - The Design Professional (Box 2) and Full-Time Inspector / Supervisor
///    (Box 3) are kept as two SEPARATE steps (5 and 6) instead of being
///    combined into one "Professionals" step.
///  - There is no separate Required Documents step or Evaluation & Permit
///    Status step — document uploads are collected inline within the
///    Professional/Consent steps themselves, and Step 9 combines Review
///    with the Submit action, matching the spec's exact 9-step structure.
/// The paper form's Notarial Acknowledgment (part of Boxes 4–5) and its
/// internal-processing sections (Boxes 7–8) are modeled but never exposed
/// as applicant-editable UI — see [FencingNotarialAcknowledgment] and
/// [FencingProcessingInfo].

/// Duplicated (not imported) from the other permit models to keep all
/// permit models fully decoupled.
const List<String> fencingFormsOfOwnership = [
  'Sole Proprietorship',
  'Partnership',
  'Corporation',
  'Cooperative',
  'Government',
  'Others',
];

/// Step 2 — Owner / Applicant Information (Box 1). Notably, per the
/// official form's field list for this permit, there is no contact number
/// or province field (unlike other ancillary permits' applicant sections).
class FencingApplicantInfo {
  String lastName = '';
  String firstName = '';
  String middleInitial = '';
  String tin = '';

  bool isOwnedByEnterprise = false;
  String enterpriseName = '';
  String? formOfOwnership;

  String addressNumber = '';
  String street = '';
  String barangay = '';
  String city = '';
  String zipCode = '';

  bool get isValid {
    final basicsValid =
        Validators.required(firstName) == null &&
        Validators.required(lastName) == null &&
        Validators.required(street) == null &&
        Validators.required(barangay) == null &&
        Validators.required(city) == null;
    if (!basicsValid) return false;
    if (!isOwnedByEnterprise) return true;
    return Validators.required(enterpriseName) == null &&
        formOfOwnership != null;
  }
}

/// Step 3 — Construction Location. Also has no province field, matching
/// the official form's field list for this permit.
class FencingConstructionLocation {
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
const List<String> fencingMockBuildingPermitNumbers = [
  'BP-2026-100234',
  'BP-2026-100567',
  'BP-2026-100812',
];

/// Step 1 — Permit Information. The official form states the Fencing
/// Permit is associated with a Building Permit when applicable.
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

class FencingRelatedBuildingPermit {
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
/// shorter list for this permit (no Alteration, Renovation, Conversion,
/// Moving, or Accessory Building/Structure, unlike other ancillary
/// permits' scope lists).
enum FencingScopeType {
  newConstruction,
  erection,
  addition,
  repair,
  demolition,
  others,
}

extension FencingScopeTypeX on FencingScopeType {
  String get label {
    switch (this) {
      case FencingScopeType.newConstruction:
        return 'New Construction';
      case FencingScopeType.erection:
        return 'Erection';
      case FencingScopeType.addition:
        return 'Addition';
      case FencingScopeType.repair:
        return 'Repair';
      case FencingScopeType.demolition:
        return 'Demolition';
      case FencingScopeType.others:
        return 'Others';
    }
  }
}

class FencingScopeOfWork {
  final Set<FencingScopeType> selectedScopes = {};
  String otherScopeDescription = '';

  bool get isValid {
    if (selectedScopes.isEmpty) return false;
    if (selectedScopes.contains(FencingScopeType.others) &&
        Validators.required(otherScopeDescription) != null) {
      return false;
    }
    return true;
  }
}

/// Both the Design Professional (Step 5) and the Full-Time Inspector /
/// Supervisor (Step 6) choose from the same profession list, per the
/// official form's "Architect or Civil Engineer" label on both boxes —
/// unlike the Interior Design Permit, where the two roles draw from
/// different role-specific subsets.
enum FencingProfessionType { architect, civilEngineer }

extension FencingProfessionTypeX on FencingProfessionType {
  String get label {
    switch (this) {
      case FencingProfessionType.architect:
        return 'Architect';
      case FencingProfessionType.civilEngineer:
        return 'Civil Engineer';
    }
  }
}

/// Shared license/contact shape for both the Design Professional and the
/// Supervisor — kept internal to this model only, so it introduces no
/// coupling with any other permit.
class FencingProfessionalInfo {
  String fullName = '';
  FencingProfessionType? profession;
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

/// Steps 5–6 — Design Professional and Full-Time Inspector / Supervisor.
/// Kept as two independent steps by the wizard (see [FencingPermitDraft]'s
/// `isStep5Valid`/`isStep6Valid`), but grouped into one class here since
/// they share the same shape and the "copy" action. Each role has exactly
/// one signed-and-sealed document upload, matching the official form.
class FencingProfessionals {
  final FencingProfessionalInfo designProfessional = FencingProfessionalInfo();
  DocumentModel? designSignedDocumentUpload;

  final FencingProfessionalInfo supervisor = FencingProfessionalInfo();
  DocumentModel? supervisorSignedDocumentUpload;

  /// Explicit, one-shot "use the same information" copy action — triggered
  /// only when the applicant checks the Step 6 checkbox, never kept in
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

/// Shared identity shape for both the Applicant and the Lot Owner in
/// Step 7 — internal to this model only.
class FencingConsentPerson {
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

/// Step 7 — Applicant & Lot Owner Consent (Boxes 4–5). The paper form's
/// Notarial Acknowledgment section is intentionally not represented here
/// — see [FencingNotarialAcknowledgment], which is modeled separately and
/// never surfaced in applicant-facing UI.
class FencingApplicantLotOwnerConsent {
  final FencingConsentPerson applicant = FencingConsentPerson();
  DocumentModel? applicantSignedDocumentUpload;

  bool? isApplicantAlsoLotOwner;
  final FencingConsentPerson lotOwner = FencingConsentPerson();
  DocumentModel? lotOwnerSignedDocumentUpload;

  bool get needsSeparateLotOwner => isApplicantAlsoLotOwner == false;

  bool get isValid {
    if (!applicant.isValid) return false;
    if (applicantSignedDocumentUpload == null) return false;
    if (isApplicantAlsoLotOwner == null) return false;
    if (needsSeparateLotOwner) {
      if (!lotOwner.isValid) return false;
      if (lotOwnerSignedDocumentUpload == null) return false;
    }
    return true;
  }
}

/// Part of Boxes 4–5 on the paper form. Applicant-facing UI never reads or
/// writes these fields — they exist only so a future staff-side surface
/// can populate them during the official notarization/processing
/// workflow without any shape changes here.
class FencingNotarialAcknowledgment {
  String? documentNumber;
  String? pageNumber;
  String? bookNumber;
  String? seriesOfYear;
  String? notaryPublicName;
  String? notaryCommissionNumber;
  DateTime? notarizedDate;
}

/// Step 8 — Fence Specifications (Box 6). Matches the official form's
/// fencing-material options.
enum FencingType {
  indigenousMaterials,
  reinforcedConcrete,
  rcAndHollowBlocks,
  rcAndBricks,
  rcAndInterlinkCycloneWire,
  steelMatting,
  rcBarbedWire,
  others,
}

extension FencingTypeX on FencingType {
  String get label {
    switch (this) {
      case FencingType.indigenousMaterials:
        return 'Indigenous Materials';
      case FencingType.reinforcedConcrete:
        return 'Reinforced Concrete (R.C.)';
      case FencingType.rcAndHollowBlocks:
        return 'R.C. and Hollow Blocks';
      case FencingType.rcAndBricks:
        return 'R.C. and Bricks';
      case FencingType.rcAndInterlinkCycloneWire:
        return 'R.C. and Interlink/Cyclone Wire';
      case FencingType.steelMatting:
        return 'Steel Matting';
      case FencingType.rcBarbedWire:
        return 'R.C. Barbed Wire';
      case FencingType.others:
        return 'Others';
    }
  }
}

class FencingSpecifications {
  String fenceLengthMeters = '';
  String fenceHeightMeters = '';
  final Set<FencingType> selectedTypes = {};
  String otherTypeDescription = '';

  bool get isValid {
    if (Validators.positiveDecimal(
          fenceLengthMeters,
          fieldLabel: 'Fence length',
        ) !=
        null) {
      return false;
    }
    if (Validators.positiveDecimal(
          fenceHeightMeters,
          fieldLabel: 'Fence height',
        ) !=
        null) {
      return false;
    }
    if (selectedTypes.isEmpty) return false;
    if (selectedTypes.contains(FencingType.others) &&
        Validators.required(otherTypeDescription) != null) {
      return false;
    }
    return true;
  }
}

/// Step 9 — Review & Submission: the certifications required before the
/// fencing application can be submitted.
class FencingReviewDeclaration {
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
/// always derived (see [FencingPermitDraft.derivedPermitStatus]).
enum FencingPermitStatus {
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

extension FencingPermitStatusX on FencingPermitStatus {
  String get label {
    switch (this) {
      case FencingPermitStatus.submitted:
        return 'Submitted';
      case FencingPermitStatus.underEvaluation:
        return 'Under Evaluation';
      case FencingPermitStatus.revisionRequired:
        return 'Revision Required';
      case FencingPermitStatus.additionalDocumentsRequired:
        return 'Additional Documents Required';
      case FencingPermitStatus.forApproval:
        return 'For Approval';
      case FencingPermitStatus.approved:
        return 'Approved';
      case FencingPermitStatus.rejected:
        return 'Rejected';
      case FencingPermitStatus.invalidWithoutBuildingPermit:
        return 'Invalid Without Building Permit';
      case FencingPermitStatus.completed:
        return 'Completed';
    }
  }
}

/// Boxes 7–8 on the paper form: progress flow, processing division,
/// assessed fees, official receipt, and permit issuance information.
/// Every field is office-controlled — there is no applicant-editable
/// state in this class — and every field starts out `null`/unset, since
/// this is a frontend-only prototype with no real backend to populate
/// them. Not surfaced as a wizard step (the official form's Boxes 7–8 are
/// explicitly office-only), but modeled here so a future staff-side or
/// application-status surface can display them read-only without any
/// shape changes.
class FencingProcessingInfo {
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
    'Fencing Permit Documents Received',
    'Fencing Section Review',
    'Structural Review',
    'Recommending Approval',
    'Building Official Decision',
  ];

  static const List<String> permitConditions = [
    'Fence construction must follow the approved plans and applicable regulations.',
    'A licensed professional must supervise or take charge of the work.',
    'Required signed and sealed professional documents must be authentic.',
    'The Fencing Permit is invalid without the related Building Permit.',
  ];

  bool get isValid => true;
}

enum FencingPermitDraftStatus { draft, submitted }

/// The full mutable draft for one Fencing Permit application session.
class FencingPermitDraft {
  final FencingRelatedBuildingPermit relatedBuildingPermit =
      FencingRelatedBuildingPermit();
  final FencingApplicantInfo applicant = FencingApplicantInfo();
  final FencingConstructionLocation constructionLocation =
      FencingConstructionLocation();
  final FencingScopeOfWork scopeOfWork = FencingScopeOfWork();
  final FencingProfessionals professionals = FencingProfessionals();
  final FencingApplicantLotOwnerConsent consent =
      FencingApplicantLotOwnerConsent();
  final FencingNotarialAcknowledgment notarialAcknowledgment =
      FencingNotarialAcknowledgment();
  final FencingSpecifications specifications = FencingSpecifications();
  final FencingReviewDeclaration reviewDeclaration = FencingReviewDeclaration();
  final FencingProcessingInfo processingInfo = FencingProcessingInfo();

  bool useApplicantAddressForConstructionLocation = false;
  FencingPermitDraftStatus status = FencingPermitDraftStatus.draft;
  DateTime? lastSavedAt;

  bool get isStep1Valid => relatedBuildingPermit.isValid;
  bool get isStep2Valid => applicant.isValid;
  bool get isStep3Valid => constructionLocation.isValid;
  bool get isStep4Valid => scopeOfWork.isValid;
  bool get isStep5Valid => professionals.isDesignProfessionalValid;
  bool get isStep6Valid => professionals.isSupervisorValid;
  bool get isStep7Valid => consent.isValid;
  bool get isStep8Valid => specifications.isValid;
  bool get isStep9Valid => reviewDeclaration.isValid;

  void copyApplicantAddressToConstructionLocation() {
    constructionLocation
      ..street = applicant.street
      ..barangay = applicant.barangay
      ..city = applicant.city;
  }

  /// The permit can never be displayed as valid/issued while the related
  /// Building Permit isn't Approved — this is the single source of truth
  /// the Submitted screen renders from.
  FencingPermitStatus get derivedPermitStatus {
    if (!relatedBuildingPermit.hasValidBuildingPermitReference) {
      return FencingPermitStatus.invalidWithoutBuildingPermit;
    }
    return FencingPermitStatus.submitted;
  }
}
