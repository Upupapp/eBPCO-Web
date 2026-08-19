import '../utils/validators.dart';
import 'document_model.dart';

/// Mock, frontend-only data model for the Interior Design Permit
/// application wizard. Based on the official two-page Interior Design
/// Permit form (Boxes 1–10), and — like every other ancillary permit in
/// this app — references a related Building Permit but never reads or
/// mutates any other permit provider's state, so this model is fully
/// decoupled from every other permit model.
///
/// The official form's sections are mapped onto this app's established
/// 9-step wizard shape (shared by all prior permits) rather than a
/// bespoke flow:
///  - "Permit Information" (application/permit numbers, Related Building
///    Permit) is folded into Step 2, alongside Address & Location of
///    Construction — exactly where every other permit already keeps its
///    Related Building Permit reference.
///  - The Licensed Design Professional (Box 3) and Full-Time Inspector /
///    Supervisor (Box 4) are combined into one Step 5 "Professionals"
///    step with a same-person "copy from Design Professional" action,
///    matching every other permit's Professionals step.
/// See the step files for the full mapping.

enum PermitType { interiorDesign }

extension PermitTypeX on PermitType {
  String get label => 'Interior Design Permit';
}

/// Duplicated (not imported) from the other permit models to keep all
/// permit models fully decoupled.
const List<String> interiorFormsOfOwnership = [
  'Sole Proprietorship',
  'Partnership',
  'Corporation',
  'Cooperative',
  'Government',
  'Others',
];

/// Duplicated (not imported) from the other permit models.
enum InteriorOccupancyGroup {
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

extension InteriorOccupancyGroupX on InteriorOccupancyGroup {
  String get label {
    switch (this) {
      case InteriorOccupancyGroup.groupA:
        return 'Group A — Residential Dwelling';
      case InteriorOccupancyGroup.groupB:
        return 'Group B — Residential Hotel or Apartment';
      case InteriorOccupancyGroup.groupC:
        return 'Group C — Education and Recreation';
      case InteriorOccupancyGroup.groupD:
        return 'Group D — Institutional';
      case InteriorOccupancyGroup.groupE:
        return 'Group E — Business and Mercantile';
      case InteriorOccupancyGroup.groupF:
        return 'Group F — Industrial';
      case InteriorOccupancyGroup.groupG:
        return 'Group G — Storage and Hazardous';
      case InteriorOccupancyGroup.groupH:
        return 'Group H — Assembly';
      case InteriorOccupancyGroup.groupI:
        return 'Group I — Assembly with Higher Occupant Load';
      case InteriorOccupancyGroup.groupJ:
        return 'Group J — Accessory';
      case InteriorOccupancyGroup.others:
        return 'Others';
    }
  }
}

/// Step 1 — Applicant Information (Box 1, minus address — collected in
/// Step 2 — and minus the Permit Information / Related Building Permit
/// reference, also collected in Step 2). Permit Type is fixed to
/// "Interior Design Permit".
class InteriorApplicantInfo {
  final PermitType permitType = PermitType.interiorDesign;

  String firstName = '';
  String middleInitial = '';
  String lastName = '';
  String tin = '';
  String contactNumber = '';

  bool isOwnedByEnterprise = false;
  String enterpriseName = '';
  String? formOfOwnership;

  InteriorOccupancyGroup? occupancyGroup;
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
    if (occupancyGroup == InteriorOccupancyGroup.others &&
        Validators.required(occupancyOtherDescription) != null) {
      return false;
    }
    if (!isOwnedByEnterprise) return true;
    return Validators.required(enterpriseName) == null &&
        formOfOwnership != null;
  }
}

/// Step 2 (part 1) — Applicant Address.
class InteriorApplicantAddress {
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
class InteriorProjectLocation {
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
const List<String> interiorMockBuildingPermitNumbers = [
  'BP-2026-100234',
  'BP-2026-100567',
  'BP-2026-100812',
];

/// Step 2 (part 3) — Related Building Permit. The official form states
/// the Interior Design Permit is not valid without a Building Permit.
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

class InteriorRelatedBuildingPermit {
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

/// Step 3 — Scope of Work (Box 1). Matches the official form's own list
/// for this permit (notably without "Raising", unlike some other
/// ancillary permits' scope lists).
enum InteriorScopeType {
  newConstruction,
  erection,
  addition,
  alteration,
  renovation,
  conversion,
  repair,
  moving,
  demolition,
  accessoryBuildingOrStructure,
  others,
}

extension InteriorScopeTypeX on InteriorScopeType {
  String get label {
    switch (this) {
      case InteriorScopeType.newConstruction:
        return 'New Construction';
      case InteriorScopeType.erection:
        return 'Erection';
      case InteriorScopeType.addition:
        return 'Addition';
      case InteriorScopeType.alteration:
        return 'Alteration';
      case InteriorScopeType.renovation:
        return 'Renovation';
      case InteriorScopeType.conversion:
        return 'Conversion';
      case InteriorScopeType.repair:
        return 'Repair';
      case InteriorScopeType.moving:
        return 'Moving';
      case InteriorScopeType.demolition:
        return 'Demolition';
      case InteriorScopeType.accessoryBuildingOrStructure:
        return 'Accessory Building or Structure';
      case InteriorScopeType.others:
        return 'Others';
    }
  }
}

class InteriorScopeOfWork {
  final Set<InteriorScopeType> selectedScopes = {};
  String otherScopeDescription = '';

  bool get isValid {
    if (selectedScopes.isEmpty) return false;
    if (selectedScopes.contains(InteriorScopeType.others) &&
        Validators.required(otherScopeDescription) != null) {
      return false;
    }
    return true;
  }
}

/// Step 4 — Nature of Interior Works (Box 2). Multi-select; at least one
/// option is required. A short project description/remarks field is
/// optional.
enum InteriorWorkNatureType {
  renovationOfRoomsOrAreas,
  repairOfExistingInterior,
  spacePlanningAndAllocation,
  newInteriorConstruction,
  relocationOfPartitionsStairsAndDoors,
  ceilingDesignAndLightingLayout,
  newSurfaceMaterialsAndFinishes,
  additionOrExtensionOfBathroomsKitchensAndSimilarAreas,
}

extension InteriorWorkNatureTypeX on InteriorWorkNatureType {
  String get label {
    switch (this) {
      case InteriorWorkNatureType.renovationOfRoomsOrAreas:
        return 'Renovation of Rooms or Areas';
      case InteriorWorkNatureType.repairOfExistingInterior:
        return 'Repair of Existing Interior';
      case InteriorWorkNatureType.spacePlanningAndAllocation:
        return 'Space Planning and Allocation';
      case InteriorWorkNatureType.newInteriorConstruction:
        return 'New Interior Construction';
      case InteriorWorkNatureType.relocationOfPartitionsStairsAndDoors:
        return 'Relocation of Partitions, Stairs, and Doors';
      case InteriorWorkNatureType.ceilingDesignAndLightingLayout:
        return 'Ceiling Design and Lighting Layout';
      case InteriorWorkNatureType.newSurfaceMaterialsAndFinishes:
        return 'New Surface Materials and Finishes';
      case InteriorWorkNatureType
          .additionOrExtensionOfBathroomsKitchensAndSimilarAreas:
        return 'Addition or Extension of Bathrooms, Kitchens, and Similar Areas';
    }
  }
}

class InteriorWorkNature {
  final Set<InteriorWorkNatureType> selectedNatures = {};
  String projectDescription = '';

  bool get isValid => selectedNatures.isNotEmpty;
}

/// Both the Licensed Design Professional and the Full-Time Inspector /
/// Supervisor choose a profession, but from different, role-specific
/// option sets — see [designProfessionalOptions]/[supervisorOptions].
enum InteriorProfessionType { interiorDesigner, architect, civilEngineer }

extension InteriorProfessionTypeX on InteriorProfessionType {
  String get label {
    switch (this) {
      case InteriorProfessionType.interiorDesigner:
        return 'Interior Designer';
      case InteriorProfessionType.architect:
        return 'Architect';
      case InteriorProfessionType.civilEngineer:
        return 'Civil Engineer';
    }
  }
}

/// Per Box 3: the Design Professional is either an Interior Designer or
/// an Architect.
const List<InteriorProfessionType> interiorDesignProfessionalOptions = [
  InteriorProfessionType.interiorDesigner,
  InteriorProfessionType.architect,
];

/// Per Box 4: the Full-Time Inspector / Supervisor is either an Architect
/// or a Civil Engineer.
const List<InteriorProfessionType> interiorSupervisorOptions = [
  InteriorProfessionType.architect,
  InteriorProfessionType.civilEngineer,
];

/// Shared license/contact shape for both the Design Professional and the
/// Supervisor — kept internal to this model only, so it introduces no
/// coupling with any other permit.
class InteriorProfessionalInfo {
  String fullName = '';
  InteriorProfessionType? profession;
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

/// Step 5 — Interior Design Professionals: the Licensed Design
/// Professional (Box 3) and the Full-Time Inspector / Supervisor (Box 4),
/// combined into one step matching every other permit's Professionals
/// step. Unlike most other permits, the two roles are never assumed to
/// be the same person by default — the applicant must explicitly opt in
/// via "Use the same professional information as the Licensed Design
/// Professional" each time, per the spec's explicit instruction not to
/// auto-assume they're the same. Each role has exactly one signed-and-
/// sealed document upload, matching the official form.
class InteriorProfessionals {
  final InteriorProfessionalInfo designProfessional =
      InteriorProfessionalInfo();
  DocumentModel? designSignedDocumentUpload;

  final InteriorProfessionalInfo supervisor = InteriorProfessionalInfo();
  DocumentModel? supervisorSignedDocumentUpload;

  /// Explicit, one-shot "copy from Design Professional" action — never
  /// automatically kept in sync afterward, so editing the Design
  /// Professional later does not silently change the Supervisor's
  /// already-copied values.
  void copyDesignProfessionalToSupervisor() {
    supervisor
      ..fullName = designProfessional.fullName
      ..address = designProfessional.address
      ..prcNumber = designProfessional.prcNumber
      ..prcValidityDate = designProfessional.prcValidityDate
      ..ptrNumber = designProfessional.ptrNumber
      ..ptrDateIssued = designProfessional.ptrDateIssued
      ..ptrPlaceIssued = designProfessional.ptrPlaceIssued
      ..tin = designProfessional.tin
      ..dateSigned = designProfessional.dateSigned;
    if (interiorSupervisorOptions.contains(designProfessional.profession)) {
      supervisor.profession = designProfessional.profession;
    }
  }

  bool get isValid =>
      designProfessional.isValid &&
      designSignedDocumentUpload != null &&
      supervisor.isValid &&
      supervisorSignedDocumentUpload != null;
}

/// Shared owner-identity shape for both the Building Owner and the Lot
/// Owner in Step 6 — internal to this model only. Includes "Date Signed"
/// in addition to the CTC fields, per the official form's Boxes 5–6.
class InteriorOwnerInfo {
  String fullName = '';
  String address = '';
  String ctcNumber = '';
  DateTime? ctcDateIssued;
  String ctcPlaceIssued = '';
  DateTime? dateSigned;

  bool get isValid =>
      Validators.required(fullName) == null &&
      Validators.required(address) == null &&
      Validators.required(ctcNumber) == null &&
      ctcDateIssued != null &&
      Validators.required(ctcPlaceIssued) == null;
}

/// Step 6 — Building Owner & Lot Owner Consent (Boxes 5–6).
class InteriorOwnershipConsent {
  final InteriorOwnerInfo buildingOwner = InteriorOwnerInfo();
  DocumentModel? buildingOwnerSignedDocumentUpload;

  bool? isBuildingOwnerAlsoLotOwner;
  final InteriorOwnerInfo lotOwner = InteriorOwnerInfo();
  DocumentModel? lotOwnerConsentUpload;

  bool get needsSeparateLotOwner => isBuildingOwnerAlsoLotOwner == false;

  bool get isValid {
    if (!buildingOwner.isValid) return false;
    if (buildingOwnerSignedDocumentUpload == null) return false;
    if (isBuildingOwnerAlsoLotOwner == null) return false;
    if (needsSeparateLotOwner) {
      if (!lotOwner.isValid) return false;
      if (lotOwnerConsentUpload == null) return false;
    }
    return true;
  }
}

/// Step 7 — Required Documents (Box 7): the official form's ~20
/// individual line items, grouped into clear upload categories rather
/// than one long unstructured list. Professional documents already
/// collected in Step 5 are intentionally NOT duplicated here — the UI
/// reads/writes [InteriorProfessionals]'s fields directly.
class InteriorRequiredDocuments {
  // Interior Layout Documents.
  DocumentModel? interiorPlanAndLayoutUpload;
  DocumentModel? wallPartitionsUpload;
  DocumentModel? furnitureLayoutUpload;
  DocumentModel? equipmentAndApplianceLayoutUpload;

  // Elevations and Perspectives.
  DocumentModel? interiorWallElevationsUpload;
  DocumentModel? crossWindowSectionsUpload;
  DocumentModel? interiorPerspectiveFromMainEntrancesUpload;

  // Finishes and Fixtures.
  DocumentModel? finishesUpload;
  DocumentModel? switchesUpload;
  DocumentModel? doorsUpload;
  DocumentModel? convenienceOutletsUpload;
  DocumentModel? decorationsUpload;

  // Ceiling and Lighting.
  DocumentModel? reflectedCeilingPlanUpload;
  DocumentModel? lightingFixtureSpecificationsUpload;

  // Life Safety and Mechanical.
  DocumentModel? airConditioningExhaustAndReturnGrillesUpload;
  DocumentModel? sprinklerNozzleLocationsUpload; // optional, "when applicable"
  DocumentModel? fireResistivityRatingsUpload;
  DocumentModel? toxicityRatingsUpload;

  // Cost and Material Documents.
  DocumentModel? listOfMaterialsUpload;
  DocumentModel? detailedCostEstimatesUpload;

  // Supporting Documents.
  DocumentModel? relatedBuildingPermitUpload;
  DocumentModel? otherSupportingDocumentsUpload; // optional

  bool isValid() {
    return interiorPlanAndLayoutUpload != null &&
        wallPartitionsUpload != null &&
        furnitureLayoutUpload != null &&
        equipmentAndApplianceLayoutUpload != null &&
        interiorWallElevationsUpload != null &&
        crossWindowSectionsUpload != null &&
        interiorPerspectiveFromMainEntrancesUpload != null &&
        finishesUpload != null &&
        switchesUpload != null &&
        doorsUpload != null &&
        convenienceOutletsUpload != null &&
        decorationsUpload != null &&
        reflectedCeilingPlanUpload != null &&
        lightingFixtureSpecificationsUpload != null &&
        airConditioningExhaustAndReturnGrillesUpload != null &&
        fireResistivityRatingsUpload != null &&
        toxicityRatingsUpload != null &&
        listOfMaterialsUpload != null &&
        detailedCostEstimatesUpload != null &&
        relatedBuildingPermitUpload != null;
  }
}

/// Step 8 — Review & Declaration: the certifications required before the
/// interior design application can be submitted, matching the four
/// points explicitly listed in the spec.
class InteriorReviewDeclaration {
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
/// always derived (see [InteriorPermitDraft.derivedPermitStatus]).
enum InteriorPermitStatus {
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

extension InteriorPermitStatusX on InteriorPermitStatus {
  String get label {
    switch (this) {
      case InteriorPermitStatus.submitted:
        return 'Submitted';
      case InteriorPermitStatus.underEvaluation:
        return 'Under Evaluation';
      case InteriorPermitStatus.revisionRequired:
        return 'Revision Required';
      case InteriorPermitStatus.additionalDocumentsRequired:
        return 'Additional Documents Required';
      case InteriorPermitStatus.forApproval:
        return 'For Approval';
      case InteriorPermitStatus.approved:
        return 'Approved';
      case InteriorPermitStatus.rejected:
        return 'Rejected';
      case InteriorPermitStatus.invalidWithoutBuildingPermit:
        return 'Invalid Without Building Permit';
      case InteriorPermitStatus.completed:
        return 'Completed';
    }
  }
}

/// Step 9 — Evaluation & Permit Status: the official form's "internal
/// processing" sections (Boxes 8–10's progress-flow, review, fee,
/// payment, and issuance information). Every field is office-controlled
/// — there is no applicant-editable state in this class — and every
/// field starts out `null`/unset, since this is a frontend-only
/// prototype with no real backend to populate them. The applicant sees
/// them as read-only "Pending"/"Not yet available" status until real
/// data exists. Modeled as clean, typed, nullable fields now so a future
/// staff-side surface can populate them without any shape changes here.
/// Office-only names/divisions from the paper form are represented as
/// data (a `currentOffice` string, set by staff later), never as
/// applicant-editable fields.
class InteriorProcessingInfo {
  String? reviewStage;
  String? currentOffice;
  String? remarks;
  double? filingFee;
  double? processingFee;
  double? otherAssessedFees;
  String? officialReceiptNumber;
  DateTime? datePaid;
  String? reviewedBy;
  String? recommendationForIssuance;
  String? permitIssuanceStatus;

  double? get totalAssessedFees {
    if (filingFee == null && processingFee == null && otherAssessedFees == null) {
      return null;
    }
    return (filingFee ?? 0) + (processingFee ?? 0) + (otherAssessedFees ?? 0);
  }

  String get paymentStatus => datePaid != null ? 'Paid' : 'Not yet paid';

  static const List<String> progressStages = [
    'Interior Design Documents Received',
    'Interior Design Section Review',
    'Electrical Review',
    'Other Review Sections',
    'Recommending Approval',
    'Building Official Decision',
  ];

  static const List<String> permitConditions = [
    'Interior works must follow the approved plans and applicable regulations.',
    'A licensed professional must supervise or take charge of the work.',
    'Required signed and sealed professional documents must be authentic.',
    'The Interior Design Permit is invalid without the related Building Permit.',
  ];

  bool get isValid => true;
}

enum InteriorPermitDraftStatus { draft, submitted }

/// The full mutable draft for one Interior Design Permit application
/// session.
class InteriorPermitDraft {
  final InteriorApplicantInfo applicant = InteriorApplicantInfo();
  final InteriorApplicantAddress applicantAddress = InteriorApplicantAddress();
  final InteriorProjectLocation projectLocation = InteriorProjectLocation();
  final InteriorRelatedBuildingPermit relatedBuildingPermit =
      InteriorRelatedBuildingPermit();
  final InteriorScopeOfWork scopeOfWork = InteriorScopeOfWork();
  final InteriorWorkNature workNature = InteriorWorkNature();
  final InteriorProfessionals professionals = InteriorProfessionals();
  final InteriorOwnershipConsent ownershipConsent = InteriorOwnershipConsent();
  final InteriorRequiredDocuments requiredDocuments =
      InteriorRequiredDocuments();
  final InteriorReviewDeclaration reviewDeclaration =
      InteriorReviewDeclaration();
  final InteriorProcessingInfo processingInfo = InteriorProcessingInfo();

  bool useApplicantAddressForProjectLocation = false;
  InteriorPermitDraftStatus status = InteriorPermitDraftStatus.draft;
  DateTime? lastSavedAt;

  bool get isStep1Valid => applicant.isValid;
  bool get isStep2Valid =>
      applicantAddress.isValid &&
      projectLocation.isValid &&
      relatedBuildingPermit.isValid;
  bool get isStep3Valid => scopeOfWork.isValid;
  bool get isStep4Valid => workNature.isValid;
  bool get isStep5Valid => professionals.isValid;
  bool get isStep6Valid => ownershipConsent.isValid;
  bool get isStep7Valid => requiredDocuments.isValid();
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
  InteriorPermitStatus get derivedPermitStatus {
    if (!relatedBuildingPermit.hasValidBuildingPermitReference) {
      return InteriorPermitStatus.invalidWithoutBuildingPermit;
    }
    return InteriorPermitStatus.submitted;
  }
}
