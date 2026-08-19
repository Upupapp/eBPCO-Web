import '../utils/validators.dart';
import 'document_model.dart';

/// Mock, frontend-only data model for the Electronics Permit application
/// wizard. Based on the official Electronics Permit form (Boxes 1–9), and
/// — like every other ancillary permit in this app — references a related
/// Building Permit but never reads or mutates any other permit provider's
/// state, so this model is fully decoupled from every other permit model.
///
/// The official form's 10 numbered sections are mapped onto this app's
/// established 9-step wizard shape (shared by all prior permits) rather
/// than introduced as a bespoke 10-step flow:
///  - Box "Permit and Related Application Information" is folded into
///    Step 2, alongside Address & Project Location — exactly where every
///    other permit already keeps its Related Building Permit reference.
///  - Design Professional (Box 3) and Supervisor / Person in Charge
///    (Box 4) are combined into one Step 5 "Professionals" step with a
///    same-person toggle, matching every other permit's Professionals
///    step.
/// See the step files for the full mapping.

enum PermitType { electronics }

extension PermitTypeX on PermitType {
  String get label => 'Electronics Permit';
}

/// Duplicated (not imported) from the other permit models to keep all
/// permit models fully decoupled.
const List<String> electronicsFormsOfOwnership = [
  'Sole Proprietorship',
  'Partnership',
  'Corporation',
  'Cooperative',
  'Government',
  'Others',
];

/// Duplicated (not imported) from the other permit models.
enum ElectronicsOccupancyGroup {
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

extension ElectronicsOccupancyGroupX on ElectronicsOccupancyGroup {
  String get label {
    switch (this) {
      case ElectronicsOccupancyGroup.groupA:
        return 'Group A — Residential Dwelling';
      case ElectronicsOccupancyGroup.groupB:
        return 'Group B — Residential Hotel or Apartment';
      case ElectronicsOccupancyGroup.groupC:
        return 'Group C — Education and Recreation';
      case ElectronicsOccupancyGroup.groupD:
        return 'Group D — Institutional';
      case ElectronicsOccupancyGroup.groupE:
        return 'Group E — Business and Mercantile';
      case ElectronicsOccupancyGroup.groupF:
        return 'Group F — Industrial';
      case ElectronicsOccupancyGroup.groupG:
        return 'Group G — Storage and Hazardous';
      case ElectronicsOccupancyGroup.groupH:
        return 'Group H — Assembly';
      case ElectronicsOccupancyGroup.groupI:
        return 'Group I — Assembly with Higher Occupant Load';
      case ElectronicsOccupancyGroup.groupJ:
        return 'Group J — Accessory';
      case ElectronicsOccupancyGroup.others:
        return 'Others';
    }
  }
}

/// Step 1 — Applicant Information (from Box 1, minus address — collected
/// in Step 2 — and minus the Related Building Permit reference, also
/// collected in Step 2). Permit Type is fixed to "Electronics Permit".
class ElectronicsApplicantInfo {
  final PermitType permitType = PermitType.electronics;

  String firstName = '';
  String middleInitial = '';
  String lastName = '';
  String tin = '';
  String contactNumber = '';

  bool isOwnedByEnterprise = false;
  String enterpriseName = '';
  String? formOfOwnership;

  ElectronicsOccupancyGroup? occupancyGroup;
  String occupancyOtherDescription = '';

  bool get isValid {
    final basicsValid =
        Validators.required(firstName) == null &&
        Validators.required(lastName) == null &&
        Validators.required(
              contactNumber,
              fieldLabel: 'Telephone or mobile number',
            ) ==
            null &&
        occupancyGroup != null;
    if (!basicsValid) return false;
    if (occupancyGroup == ElectronicsOccupancyGroup.others &&
        Validators.required(occupancyOtherDescription) != null) {
      return false;
    }
    if (!isOwnedByEnterprise) return true;
    return Validators.required(enterpriseName) == null &&
        formOfOwnership != null;
  }
}

/// Step 2 (part 1) — Applicant Address.
class ElectronicsApplicantAddress {
  String houseNumber = '';
  String street = '';
  String barangay = '';
  String city = '';
  String province = '';
  String zipCode = '';

  bool get isValid =>
      Validators.required(street) == null &&
      Validators.required(barangay) == null &&
      Validators.required(city) == null &&
      Validators.required(province) == null;
}

/// Step 2 (part 2) — Location of Construction.
class ElectronicsProjectLocation {
  String lotNumber = '';
  String blockNumber = '';
  String tctNumber = '';
  String taxDeclarationNumber = '';
  String street = '';
  String barangay = '';
  String city = '';
  String province = '';

  bool get isValid =>
      Validators.required(lotNumber) == null &&
      Validators.required(street) == null &&
      Validators.required(barangay) == null &&
      Validators.required(city) == null &&
      Validators.required(province) == null;
}

/// A handful of sample Building Permit numbers presented as quick-pick
/// suggestions — a lightweight stand-in for "selection from mock locally
/// stored Building Permit applications" that avoids reading
/// [BuildingPermitProvider]'s real (mutable, single-draft) state.
/// Duplicated (not imported) from the other ancillary permit models to
/// keep them fully decoupled.
const List<String> electronicsMockBuildingPermitNumbers = [
  'BP-2026-100234',
  'BP-2026-100567',
  'BP-2026-100812',
];

/// Step 2 (part 3) — Related Building Permit. The official form states
/// the Electronics Permit is null and void unless accompanied by a
/// Building Permit.
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

class ElectronicsRelatedBuildingPermit {
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

/// Step 3 — Scope of Work. A smaller, permit-specific set of options
/// (unlike the 12-option scope list used by the other ancillary permits)
/// — the official Electronics Permit form only distinguishes these three.
enum ElectronicsScopeType { newInstallation, annualInspection, others }

extension ElectronicsScopeTypeX on ElectronicsScopeType {
  String get label {
    switch (this) {
      case ElectronicsScopeType.newInstallation:
        return 'New Installation';
      case ElectronicsScopeType.annualInspection:
        return 'Annual Inspection';
      case ElectronicsScopeType.others:
        return 'Others';
    }
  }
}

class ElectronicsScopeOfWork {
  final Set<ElectronicsScopeType> selectedScopes = {};
  String otherScopeDescription = '';

  bool get isValid {
    if (selectedScopes.isEmpty) return false;
    if (selectedScopes.contains(ElectronicsScopeType.others) &&
        Validators.required(otherScopeDescription) != null) {
      return false;
    }
    return true;
  }
}

/// Step 4 — Nature of Electronics Installation (Box 2). Multi-select; the
/// final "Any Other" option requires a specification when selected.
enum ElectronicsSystemType {
  telecommunicationSystem,
  broadcastingSystem,
  televisionSystem,
  informationTechnologySystem,
  securityAndAlarmSystem,
  electronicFireAlarmSystem,
  soundCommunicationSystem,
  centralizedClockSystem,
  soundSystem,
  electronicsControlAndConveyorSystem,
  electronicsComputerizedProcessControlsAutomationSystem,
  buildingAutomationManagementAndControlSystem,
  buildingWiringCopperFiberOpticOrOtherMedia,
  anyOtherElectronicsAndItSystem,
}

extension ElectronicsSystemTypeX on ElectronicsSystemType {
  String get label {
    switch (this) {
      case ElectronicsSystemType.telecommunicationSystem:
        return 'Telecommunication System';
      case ElectronicsSystemType.broadcastingSystem:
        return 'Broadcasting System';
      case ElectronicsSystemType.televisionSystem:
        return 'Television System';
      case ElectronicsSystemType.informationTechnologySystem:
        return 'Information Technology System';
      case ElectronicsSystemType.securityAndAlarmSystem:
        return 'Security and Alarm System';
      case ElectronicsSystemType.electronicFireAlarmSystem:
        return 'Electronic Fire Alarm System';
      case ElectronicsSystemType.soundCommunicationSystem:
        return 'Sound Communication System';
      case ElectronicsSystemType.centralizedClockSystem:
        return 'Centralized Clock System';
      case ElectronicsSystemType.soundSystem:
        return 'Sound System';
      case ElectronicsSystemType.electronicsControlAndConveyorSystem:
        return 'Electronics Control and Conveyor System';
      case ElectronicsSystemType
          .electronicsComputerizedProcessControlsAutomationSystem:
        return 'Electronics Computerized Process Controls Automation System';
      case ElectronicsSystemType
          .buildingAutomationManagementAndControlSystem:
        return 'Building Automation Management and Control System';
      case ElectronicsSystemType.buildingWiringCopperFiberOpticOrOtherMedia:
        return 'Building Wiring Utilizing Copper Cable, Fiber-Optic Cable, or Other Media';
      case ElectronicsSystemType.anyOtherElectronicsAndItSystem:
        return 'Any Other Electronics and IT System, Equipment, Apparatus, Device, or Component';
    }
  }
}

class ElectronicsInstallationNature {
  final Set<ElectronicsSystemType> selectedSystems = {};
  String otherSystemSpecification = '';

  bool get isValid {
    if (selectedSystems.isEmpty) return false;
    if (selectedSystems.contains(
          ElectronicsSystemType.anyOtherElectronicsAndItSystem,
        ) &&
        Validators.required(otherSystemSpecification) != null) {
      return false;
    }
    return true;
  }
}

/// Both the Design Professional and Supervisor are always a "Professional
/// Electronics Engineer" per the official form — a single profession,
/// like the Architectural/Civil-Structural/Electrical/Mechanical Permits'
/// locked-profession pattern (unlike the Sanitary / Plumbing Permit's
/// two-option choice).
class ElectronicsProfessionalInfo {
  String fullName = '';
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

/// Step 5 — Electronics Professionals: the Design Professional (Box 3)
/// and the Supervisor / Person in Charge (Box 4), combined into one step
/// with a same-person toggle, matching every other permit's Professionals
/// step. When the Supervisor is the same person, their own fields/
/// uploads are never populated — Step 7's document checklist reads the
/// Design Professional's uploads for both roles in that case.
class ElectronicsProfessionals {
  final ElectronicsProfessionalInfo designProfessional =
      ElectronicsProfessionalInfo();
  DocumentModel? designPrcIdUpload;
  DocumentModel? designPtrDocumentUpload;
  DocumentModel? signedSealedPlansUpload;
  DocumentModel? signedSealedSpecificationsUpload;
  DocumentModel? signedDesignCalculationsUpload; // optional, "where required"

  bool isSupervisorSameAsDesignProfessional = true;
  final ElectronicsProfessionalInfo supervisor = ElectronicsProfessionalInfo();
  DocumentModel? supervisorPrcIdUpload;
  DocumentModel? supervisorPtrUpload;
  DocumentModel? signedSupervisorConfirmationUpload;

  bool get isValid {
    final designValid =
        designProfessional.isValid &&
        designPrcIdUpload != null &&
        designPtrDocumentUpload != null &&
        signedSealedPlansUpload != null &&
        signedSealedSpecificationsUpload != null;
    if (!designValid) return false;
    if (isSupervisorSameAsDesignProfessional) return true;
    return supervisor.isValid &&
        supervisorPrcIdUpload != null &&
        supervisorPtrUpload != null &&
        signedSupervisorConfirmationUpload != null;
  }
}

/// Shared owner-identity shape for both the Building Owner and the Lot
/// Owner in Step 6 — internal to this model only.
class ElectronicsOwnerInfo {
  String fullName = '';
  String address = '';
  String ctcNumber = '';
  DateTime? ctcDateIssued;
  String ctcPlaceIssued = '';

  bool get isValid =>
      Validators.required(fullName) == null &&
      Validators.required(address) == null &&
      Validators.required(ctcNumber) == null &&
      ctcDateIssued != null &&
      Validators.required(ctcPlaceIssued) == null;
}

/// Step 6 — Building Owner & Lot Owner Consent (Boxes 5–6).
class ElectronicsOwnershipConsent {
  bool? isApplicantBuildingOwner;
  final ElectronicsOwnerInfo buildingOwner = ElectronicsOwnerInfo();

  bool? isBuildingOwnerAlsoLotOwner;
  final ElectronicsOwnerInfo lotOwner = ElectronicsOwnerInfo();

  DocumentModel? buildingOwnerValidIdUpload;
  DocumentModel? lotOwnerValidIdUpload;
  DocumentModel? proofOfOwnershipUpload;
  DocumentModel? lotOwnerConsentUpload;

  /// Required only when the applicant isn't the Building Owner.
  DocumentModel? authorizationLetterUpload;

  bool get isRepresentative => isApplicantBuildingOwner == false;
  bool get needsSeparateLotOwner => isBuildingOwnerAlsoLotOwner == false;

  bool get isValid {
    if (isApplicantBuildingOwner == null) return false;
    if (isRepresentative) {
      if (!buildingOwner.isValid) return false;
      if (buildingOwnerValidIdUpload == null) return false;
      if (authorizationLetterUpload == null) return false;
    }
    if (isBuildingOwnerAlsoLotOwner == null) return false;
    if (needsSeparateLotOwner) {
      if (!lotOwner.isValid) return false;
      if (lotOwnerValidIdUpload == null) return false;
      if (lotOwnerConsentUpload == null) return false;
    }
    return proofOfOwnershipUpload != null;
  }
}

/// Step 7 — Required Electronics Documents (Box 7). Professional
/// documents already collected in Step 5 are intentionally NOT duplicated
/// here — the UI reads/writes [ElectronicsProfessionals]'s fields
/// directly.
class ElectronicsRequiredDocuments {
  // Core Electronics Documents (Electronics Plans/Specifications) are
  // intentionally NOT duplicated here — Step 7's UI reuses
  // [ElectronicsProfessionals.signedSealedPlansUpload]/
  // [signedSealedSpecificationsUpload] directly, and [isValid] doesn't
  // need to re-check them: Step 5's own validation already guarantees
  // both are non-null before the applicant can ever reach Step 7.

  // Cost and Material Documents.
  DocumentModel? billOfMaterialsUpload;
  DocumentModel? costEstimatesUpload;

  // Supporting Documents.
  DocumentModel? relatedBuildingPermitUpload;
  DocumentModel? otherSupportingDocumentsUpload; // optional

  bool isValid() {
    return billOfMaterialsUpload != null &&
        costEstimatesUpload != null &&
        relatedBuildingPermitUpload != null;
  }
}

/// Step 8 — Review & Declaration: the certifications required before the
/// electronics application can be submitted.
class ElectronicsReviewDeclaration {
  bool certifiesTrueAndCorrect = false;
  bool confirmsPlansPreparedByLicensedProfessional = false;
  bool understandsMustFollowApprovedPlansAndCodes = false;
  bool understandsRequiresLicensedSupervisor = false;
  bool understandsNoticeOfConstructionMayBeRequired = false;
  bool understandsCompletionDocumentsMayBeRequired = false;
  bool understandsRequiresValidBuildingPermit = false;
  bool agreesToTerms = false;

  bool get isValid =>
      certifiesTrueAndCorrect &&
      confirmsPlansPreparedByLicensedProfessional &&
      understandsMustFollowApprovedPlansAndCodes &&
      understandsRequiresLicensedSupervisor &&
      understandsNoticeOfConstructionMayBeRequired &&
      understandsCompletionDocumentsMayBeRequired &&
      understandsRequiresValidBuildingPermit &&
      agreesToTerms;
}

/// Frontend-only permit status values the applicant can observe but never
/// set. [invalidWithoutBuildingPermit] is never chosen directly — it is
/// always derived (see [ElectronicsPermitDraft.derivedPermitStatus]).
enum ElectronicsPermitStatus {
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

extension ElectronicsPermitStatusX on ElectronicsPermitStatus {
  String get label {
    switch (this) {
      case ElectronicsPermitStatus.submitted:
        return 'Submitted';
      case ElectronicsPermitStatus.underEvaluation:
        return 'Under Evaluation';
      case ElectronicsPermitStatus.revisionRequired:
        return 'Revision Required';
      case ElectronicsPermitStatus.additionalDocumentsRequired:
        return 'Additional Documents Required';
      case ElectronicsPermitStatus.forApproval:
        return 'For Approval';
      case ElectronicsPermitStatus.approved:
        return 'Approved';
      case ElectronicsPermitStatus.rejected:
        return 'Rejected';
      case ElectronicsPermitStatus.invalidWithoutBuildingPermit:
        return 'Invalid Without Building Permit';
      case ElectronicsPermitStatus.completed:
        return 'Completed';
    }
  }
}

/// Step 9 — Evaluation & Permit Status: the "internal processing"
/// section (Boxes 7–9's processing/progress-flow/assessed-fee/approval/
/// issuance fields). Every field is office-controlled — there is no
/// applicant-editable state in this class — and every field starts out
/// `null`/unset, since this is a frontend-only prototype with no real
/// backend to populate them. The applicant sees them as read-only
/// "Pending"/"Not yet available" status until real data exists. Modeled
/// as clean, typed, nullable fields now so a future staff-side surface
/// can populate them without any shape changes here.
class ElectronicsProcessingInfo {
  DateTime? receivedDate;
  String? receivedBy;
  String? processingProgress;
  double? assessedFees;
  String? officialReceiptNumber;
  DateTime? datePaid;
  String? processedBy;
  String? recommendedApproval;
  String? permitIssuanceStatus;
  String? permitIssuer;
  String? internalRemarks;

  static const List<String> progressStages = [
    'Electronics Documents Received',
    'Plan Review',
    'System Review',
    'Technical Evaluation',
    'Recommending Approval',
    'Building Official Decision',
  ];

  static const List<String> permitConditions = [
    'Electronics work must follow approved plans and applicable electronics and building regulations.',
    'A Notice of Construction must be submitted when required before work begins.',
    'A licensed Professional Electronics Engineer must supervise or take charge of the work.',
    'Required logbook entries, as-built plans, and completion documents must be submitted.',
    'The Electronics Permit is invalid without the related Building Permit.',
  ];

  bool get isValid => true;
}

enum ElectronicsPermitDraftStatus { draft, submitted }

/// The full mutable draft for one Electronics Permit application session.
class ElectronicsPermitDraft {
  final ElectronicsApplicantInfo applicant = ElectronicsApplicantInfo();
  final ElectronicsApplicantAddress applicantAddress =
      ElectronicsApplicantAddress();
  final ElectronicsProjectLocation projectLocation =
      ElectronicsProjectLocation();
  final ElectronicsRelatedBuildingPermit relatedBuildingPermit =
      ElectronicsRelatedBuildingPermit();
  final ElectronicsScopeOfWork scopeOfWork = ElectronicsScopeOfWork();
  final ElectronicsInstallationNature installationNature =
      ElectronicsInstallationNature();
  final ElectronicsProfessionals professionals = ElectronicsProfessionals();
  final ElectronicsOwnershipConsent ownershipConsent =
      ElectronicsOwnershipConsent();
  final ElectronicsRequiredDocuments requiredDocuments =
      ElectronicsRequiredDocuments();
  final ElectronicsReviewDeclaration reviewDeclaration =
      ElectronicsReviewDeclaration();
  final ElectronicsProcessingInfo processingInfo = ElectronicsProcessingInfo();

  bool useApplicantAddressForProjectLocation = false;
  ElectronicsPermitDraftStatus status = ElectronicsPermitDraftStatus.draft;
  DateTime? lastSavedAt;

  bool get isStep1Valid => applicant.isValid;
  bool get isStep2Valid =>
      applicantAddress.isValid &&
      projectLocation.isValid &&
      relatedBuildingPermit.isValid;
  bool get isStep3Valid => scopeOfWork.isValid;
  bool get isStep4Valid => installationNature.isValid;
  bool get isStep5Valid => professionals.isValid;
  bool get isStep6Valid => ownershipConsent.isValid;
  bool get isStep7Valid =>
      requiredDocuments.isValid() &&
      professionals.designPrcIdUpload != null &&
      professionals.designPtrDocumentUpload != null &&
      (professionals.isSupervisorSameAsDesignProfessional ||
          (professionals.supervisorPrcIdUpload != null &&
              professionals.supervisorPtrUpload != null));
  bool get isStep8Valid => reviewDeclaration.isValid;
  bool get isStep9Valid => processingInfo.isValid;

  void copyApplicantAddressToProjectLocation() {
    projectLocation
      ..street = applicantAddress.street
      ..barangay = applicantAddress.barangay
      ..city = applicantAddress.city
      ..province = applicantAddress.province;
  }

  /// The permit can never be displayed as valid/issued while the related
  /// Building Permit isn't Approved — this is the single source of truth
  /// Step 9's read-only status card renders from.
  ElectronicsPermitStatus get derivedPermitStatus {
    if (!relatedBuildingPermit.hasValidBuildingPermitReference) {
      return ElectronicsPermitStatus.invalidWithoutBuildingPermit;
    }
    return ElectronicsPermitStatus.submitted;
  }
}
