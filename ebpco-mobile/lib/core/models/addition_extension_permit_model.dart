import '../utils/validators.dart';
import 'document_model.dart';

/// Mock, frontend-only data model for the Addition / Extension Permit
/// application wizard. Deliberately kept fully separate from
/// [building_permit_model] (New Construction) and [renovation_permit_model]
/// (Renovation) — no shared mutable state — even though all three permits
/// derive from the same official Unified Application Form, so editing one
/// can never leak into or corrupt the others.

/// The DPWH-recognized Scope of Work value for this permit type. On the
/// official form the recognized value is "Addition" — an extension is
/// treated as an addition to an existing building, never as its own scope
/// — so this workflow only ever has one value. Modeled as an enum (rather
/// than a raw string) so callers compare/store a strongly-typed value
/// instead of the user-facing display string.
enum ScopeOfWork { addition }

extension ScopeOfWorkX on ScopeOfWork {
  /// The exact value stored/submitted on the official form.
  String get officialValue => 'addition';
  String get displayLabel => 'Addition';
}

/// "Form of Ownership" choices shown when the property is owned by an
/// enterprise. Duplicated (not imported) from the other permit models on
/// purpose, to keep all three models fully decoupled.
const List<String> additionExtensionFormsOfOwnership = [
  'Sole Proprietorship',
  'Partnership',
  'Corporation',
  'Cooperative',
  'Government',
  'Others',
];

/// Whether this is a brand-new filing, a renewal of an expired permit, or
/// an amendment to an already-filed application.
enum AdditionExtensionApplicationType { newApplication, renewal, amendatory }

extension AdditionExtensionApplicationTypeX on AdditionExtensionApplicationType {
  String get label {
    switch (this) {
      case AdditionExtensionApplicationType.newApplication:
        return 'New';
      case AdditionExtensionApplicationType.renewal:
        return 'Renewal';
      case AdditionExtensionApplicationType.amendatory:
        return 'Amendatory';
    }
  }
}

/// Step 1 — Applicant Information. Project Type is fixed to "Addition /
/// Extension" and Scope of Work is fixed to [ScopeOfWork.addition] — the
/// applicant can't change either, so neither has a settable field, just
/// fixed display text in the UI backed by the constant [ScopeOfWork]
/// value below.
class AdditionExtensionApplicantInfo {
  AdditionExtensionApplicationType applicationType =
      AdditionExtensionApplicationType.newApplication;
  String firstName = '';
  String middleName = '';
  String lastName = '';
  String tin = '';

  /// "Telephone / Mobile Number" — deliberately validated with `required`
  /// only (not a strict PH-mobile regex) since a landline is allowed.
  String contactNumber = '';

  bool isOwnedByEnterprise = false;
  String enterpriseName = '';
  String? formOfOwnership;

  bool get isValid {
    final basicsValid =
        Validators.required(firstName) == null &&
        Validators.required(lastName) == null &&
        Validators.required(
              contactNumber,
              fieldLabel: 'Telephone or mobile number',
            ) ==
            null;
    if (!basicsValid) return false;
    if (!isOwnedByEnterprise) return true;
    return Validators.required(enterpriseName) == null &&
        formOfOwnership != null;
  }
}

/// Step 2 (part 1) — Applicant Address.
class AdditionExtensionApplicantAddress {
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

/// Step 2 (part 2) — user-facing "Addition / Extension Location", mapped
/// internally to the official form's "Location of Construction" fields.
class AdditionExtensionLocation {
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

/// The general nature of the addition/extension — single-select (a
/// project has one primary addition type), matching the spec's "radio
/// tiles" wording as opposed to the multi-select affected-areas below.
enum AdditionType {
  horizontalExtension,
  verticalExtensionAdditionalStorey,
  newRoom,
  buildingWing,
  balcony,
  terrace,
  porchOrVeranda,
  garageOrCarport,
  kitchenExtension,
  bathroomExtension,
  stairwayExtension,
  roofedExtension,
  accessoryAreaConnectedToBuilding,
  others,
}

extension AdditionTypeX on AdditionType {
  String get label {
    switch (this) {
      case AdditionType.horizontalExtension:
        return 'Horizontal Extension';
      case AdditionType.verticalExtensionAdditionalStorey:
        return 'Vertical Extension / Additional Storey';
      case AdditionType.newRoom:
        return 'New Room';
      case AdditionType.buildingWing:
        return 'Building Wing';
      case AdditionType.balcony:
        return 'Balcony';
      case AdditionType.terrace:
        return 'Terrace';
      case AdditionType.porchOrVeranda:
        return 'Porch or Veranda';
      case AdditionType.garageOrCarport:
        return 'Garage or Carport';
      case AdditionType.kitchenExtension:
        return 'Kitchen Extension';
      case AdditionType.bathroomExtension:
        return 'Bathroom Extension';
      case AdditionType.stairwayExtension:
        return 'Stairway Extension';
      case AdditionType.roofedExtension:
        return 'Roofed Extension';
      case AdditionType.accessoryAreaConnectedToBuilding:
        return 'Accessory Area Connected to Building';
      case AdditionType.others:
        return 'Others';
    }
  }
}

/// Existing-building systems/components the addition/extension work
/// affects. Multi-select — driving which technical plans become
/// conditionally required in Step 7. [none] is mutually exclusive with
/// every other value (enforced by the UI, not this model).
enum AffectedBuildingArea {
  foundation,
  columns,
  beams,
  walls,
  roof,
  floorSlab,
  electricalSystem,
  plumbingSystem,
  sanitarySystem,
  mechanicalSystem,
  electronicsSystem,
  fireSafetySystem,
  doorsAndWindows,
  circulationAccess,
  none,
  others,
}

extension AffectedBuildingAreaX on AffectedBuildingArea {
  String get label {
    switch (this) {
      case AffectedBuildingArea.foundation:
        return 'Foundation';
      case AffectedBuildingArea.columns:
        return 'Columns';
      case AffectedBuildingArea.beams:
        return 'Beams';
      case AffectedBuildingArea.walls:
        return 'Walls';
      case AffectedBuildingArea.roof:
        return 'Roof';
      case AffectedBuildingArea.floorSlab:
        return 'Floor Slab';
      case AffectedBuildingArea.electricalSystem:
        return 'Electrical System';
      case AffectedBuildingArea.plumbingSystem:
        return 'Plumbing System';
      case AffectedBuildingArea.sanitarySystem:
        return 'Sanitary System';
      case AffectedBuildingArea.mechanicalSystem:
        return 'Mechanical System';
      case AffectedBuildingArea.electronicsSystem:
        return 'Electronics System';
      case AffectedBuildingArea.fireSafetySystem:
        return 'Fire Safety System';
      case AffectedBuildingArea.doorsAndWindows:
        return 'Doors and Windows';
      case AffectedBuildingArea.circulationAccess:
        return 'Circulation / Access';
      case AffectedBuildingArea.none:
        return 'None';
      case AffectedBuildingArea.others:
        return 'Others';
    }
  }
}

/// Structural systems whose selection drives "Civil / Structural Plans"
/// and "Structural Analysis and Design Calculations" conditional
/// requirements in Steps 5 and 7.
const Set<AffectedBuildingArea> _structuralAffectedAreas = {
  AffectedBuildingArea.foundation,
  AffectedBuildingArea.columns,
  AffectedBuildingArea.beams,
  AffectedBuildingArea.walls,
};

/// Step 3 — Addition / Extension Project Information. Scope of Work is
/// fixed to "Addition" (preselected and locked) — displayed as a
/// read-only card, not a model field, same as Project Type in Step 1.
class AdditionExtensionProjectInformation {
  String projectTitle = '';
  String generalDescription = '';
  String existingBuildingDescription = '';
  String purposeOfProposedAddition = '';
  String connectionToExistingBuilding = '';

  /// Optional supplementary free text ("Other Project Details").
  String otherProjectDetails = '';

  AdditionType? additionType;
  String otherAdditionTypeDescription = '';

  Set<AffectedBuildingArea> affectedAreas = {};
  String otherAffectedAreaDescription = '';

  bool get requiresStructuralPlans =>
      affectedAreas.intersection(_structuralAffectedAreas).isNotEmpty ||
      additionType == AdditionType.verticalExtensionAdditionalStorey;

  bool get requiresSiteDevelopmentPlan =>
      additionType == AdditionType.horizontalExtension;

  bool get isValid {
    if (Validators.required(projectTitle) != null) return false;
    if (Validators.required(generalDescription) != null) return false;
    if (Validators.required(existingBuildingDescription) != null) {
      return false;
    }
    if (Validators.required(purposeOfProposedAddition) != null) return false;
    if (Validators.required(connectionToExistingBuilding) != null) {
      return false;
    }
    if (additionType == null) return false;
    if (additionType == AdditionType.others &&
        Validators.required(otherAdditionTypeDescription) != null) {
      return false;
    }
    if (affectedAreas.isEmpty) return false;
    if (affectedAreas.contains(AffectedBuildingArea.others) &&
        Validators.required(otherAffectedAreaDescription) != null) {
      return false;
    }
    return true;
  }
}

/// Official "Use or Character of Occupancy" classification groups.
/// Duplicated (not imported) from the other permit models to keep all
/// three models fully decoupled.
enum AdditionExtensionOccupancyGroup {
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

extension AdditionExtensionOccupancyGroupX on AdditionExtensionOccupancyGroup {
  String get label {
    switch (this) {
      case AdditionExtensionOccupancyGroup.groupA:
        return 'Group A — Residential, Dwellings';
      case AdditionExtensionOccupancyGroup.groupB:
        return 'Group B — Residential Hotel, Apartment';
      case AdditionExtensionOccupancyGroup.groupC:
        return 'Group C — Educational, Recreational';
      case AdditionExtensionOccupancyGroup.groupD:
        return 'Group D — Institutional';
      case AdditionExtensionOccupancyGroup.groupE:
        return 'Group E — Business and Mercantile';
      case AdditionExtensionOccupancyGroup.groupF:
        return 'Group F — Industrial';
      case AdditionExtensionOccupancyGroup.groupG:
        return 'Group G — Industrial Storage and Hazardous';
      case AdditionExtensionOccupancyGroup.groupH:
        return 'Group H — Recreational, occupant load below 1,000';
      case AdditionExtensionOccupancyGroup.groupI:
        return 'Group I — Recreational, occupant load 1,000 or more';
      case AdditionExtensionOccupancyGroup.groupJ:
        return 'Group J — Agricultural, Accessory';
      case AdditionExtensionOccupancyGroup.others:
        return 'Others';
    }
  }
}

/// Step 4 — Existing Building & Proposed Addition Details. Resulting Total
/// Floor Area is deliberately NOT a stored field — it's always derived
/// from [existingFloorArea] + [proposedAddedFloorArea] via
/// [resultingTotalFloorArea], so it can never drift out of sync with its
/// inputs and is always safely computed even mid-edit (returns null
/// instead of NaN/throwing when either input isn't a valid number yet).
class BuildingAdditionDetails {
  AdditionExtensionOccupancyGroup? occupancyGroup;
  String occupancyOtherDescription = '';

  // Existing building.
  String existingOccupancyClassification = '';
  String existingNumberOfUnits = '';
  String existingNumberOfStoreys = '';
  String existingFloorArea = '';

  // Proposed addition.
  String proposedAddedNumberOfUnits = '';
  String proposedAdditionalStoreys = '';
  String proposedAddedFloorArea = '';
  String lotArea = '';
  String estimatedCost = '';
  DateTime? proposedStartDate;
  DateTime? expectedCompletionDate;

  /// Safely parses [proposedAdditionalStoreys], defaulting to 0 if it
  /// isn't a valid number yet (mid-edit/empty) — used to decide whether
  /// an additional storey conditionally requires structural documents.
  int get proposedAdditionalStoreysValue =>
      int.tryParse(proposedAdditionalStoreys.trim()) ?? 0;

  /// Null (not NaN/an exception) whenever either input isn't a valid
  /// positive number yet, e.g. while the field is empty during editing.
  double? get resultingTotalFloorArea {
    final existing = double.tryParse(existingFloorArea.trim());
    final added = double.tryParse(proposedAddedFloorArea.trim());
    if (existing == null || added == null) return null;
    return existing + added;
  }

  static String? _nonNegativeWholeNumber(String? value, String fieldLabel) {
    if (value == null || value.trim().isEmpty) {
      return '$fieldLabel is required.';
    }
    final parsed = int.tryParse(value.trim());
    if (parsed == null) return 'Enter a whole number.';
    if (parsed < 0) return '$fieldLabel cannot be negative.';
    return null;
  }

  static String? _nonNegativeDecimal(String? value, String fieldLabel) {
    if (value == null || value.trim().isEmpty) {
      return '$fieldLabel is required.';
    }
    final parsed = double.tryParse(value.trim());
    if (parsed == null) return 'Enter a valid number.';
    if (parsed < 0) return '$fieldLabel cannot be negative.';
    return null;
  }

  bool get isValid {
    if (occupancyGroup == null) return false;
    if (occupancyGroup == AdditionExtensionOccupancyGroup.others &&
        Validators.required(occupancyOtherDescription) != null) {
      return false;
    }
    if (Validators.required(existingOccupancyClassification) != null) {
      return false;
    }
    if (_nonNegativeWholeNumber(
          existingNumberOfUnits,
          'Existing number of units',
        ) !=
        null) {
      return false;
    }
    if (_nonNegativeWholeNumber(
          existingNumberOfStoreys,
          'Existing number of storeys',
        ) !=
        null) {
      return false;
    }
    if (Validators.positiveDecimal(
          existingFloorArea,
          fieldLabel: 'Existing floor area',
        ) !=
        null) {
      return false;
    }
    if (_nonNegativeWholeNumber(
          proposedAddedNumberOfUnits,
          'Proposed added number of units',
        ) !=
        null) {
      return false;
    }
    if (_nonNegativeWholeNumber(
          proposedAdditionalStoreys,
          'Proposed additional storeys',
        ) !=
        null) {
      return false;
    }
    if (Validators.positiveDecimal(
          proposedAddedFloorArea,
          fieldLabel: 'Proposed added floor area',
        ) !=
        null) {
      return false;
    }
    if (Validators.positiveDecimal(lotArea, fieldLabel: 'Lot area') != null) {
      return false;
    }
    if (_nonNegativeDecimal(estimatedCost, 'Estimated cost') != null) {
      return false;
    }
    if (resultingTotalFloorArea == null) return false;

    final proposed = proposedStartDate;
    final expected = expectedCompletionDate;
    if (proposed == null || expected == null) return false;
    if (expected.isBefore(proposed)) return false;

    return true;
  }
}

/// Licensed professional type required to supervise the addition/
/// extension work.
enum AdditionExtensionProfessionType { architect, civilEngineer }

extension AdditionExtensionProfessionTypeX on AdditionExtensionProfessionType {
  String get label => this == AdditionExtensionProfessionType.architect
      ? 'Architect'
      : 'Civil Engineer';
}

/// Step 5 — Professional in Charge. The Structural Analysis/Certification
/// upload is only required when [BuildingAdditionDetails] or
/// [AdditionExtensionProjectInformation] indicate structural involvement —
/// [isValid] takes that as a parameter so this class doesn't need to know
/// about the other steps' shapes.
class AdditionExtensionProfessionalInCharge {
  String fullName = '';
  AdditionExtensionProfessionType? profession;
  String professionalAddress = '';
  String prcNumber = '';
  DateTime? prcValidityDate;
  String ptrNumber = '';
  DateTime? ptrDateIssued;
  String ptrPlaceIssued = '';
  String tin = '';
  DateTime? dateSigned;

  DocumentModel? prcIdUpload;
  DocumentModel? ptrDocumentUpload;
  DocumentModel? signedSealedFormUpload;
  DocumentModel? signedSealedPlansUpload;

  /// "Structural Analysis or Certification, when applicable" — the same
  /// upload is reused (not duplicated) by Step 7's "Structural Analysis
  /// and Design Calculations" technical-document slot.
  DocumentModel? structuralAnalysisUpload;

  bool isValid({required bool requiresStructuralAnalysis}) {
    final baseValid =
        Validators.required(fullName) == null &&
        profession != null &&
        Validators.required(professionalAddress) == null &&
        Validators.required(prcNumber) == null &&
        prcValidityDate != null &&
        Validators.required(ptrNumber) == null &&
        ptrDateIssued != null &&
        Validators.required(ptrPlaceIssued) == null &&
        prcIdUpload != null &&
        ptrDocumentUpload != null &&
        signedSealedFormUpload != null &&
        signedSealedPlansUpload != null;
    if (!baseValid) return false;
    if (requiresStructuralAnalysis && structuralAnalysisUpload == null) {
      return false;
    }
    return true;
  }

  /// Non-blocking heads-up shown when the PRC validity date has passed.
  bool get prcAppearsExpired =>
      prcValidityDate != null && prcValidityDate!.isBefore(DateTime.now());

  /// Non-blocking heads-up shown if the PTR date issued is in the future.
  bool get ptrDateIssuedInFuture =>
      ptrDateIssued != null && ptrDateIssued!.isAfter(DateTime.now());
}

/// Step 6 — Ownership, Consent & Authorization. When the applicant is not
/// the registered owner, a representative's details, CTC info, and four
/// supporting uploads are required; when the applicant IS the owner, none
/// of that applies.
class AdditionExtensionConsentAuthorization {
  bool? isRegisteredOwner;

  String registeredOwnerFullName = '';
  String representativeFullName = '';
  String representativeAddress = '';
  String ctcNumber = '';
  DateTime? ctcDateIssued;
  String ctcPlaceIssued = '';

  DocumentModel? authorizationLetterUpload;
  DocumentModel? ownerValidIdUpload;
  DocumentModel? representativeValidIdUpload;
  DocumentModel? proofOfOwnershipUpload;

  bool get isValid {
    if (isRegisteredOwner == null) return false;
    if (isRegisteredOwner == true) return true;
    return Validators.required(registeredOwnerFullName) == null &&
        Validators.required(representativeFullName) == null &&
        Validators.required(representativeAddress) == null &&
        Validators.required(ctcNumber) == null &&
        ctcDateIssued != null &&
        Validators.required(ctcPlaceIssued) == null &&
        authorizationLetterUpload != null &&
        ownerValidIdUpload != null &&
        representativeValidIdUpload != null &&
        proofOfOwnershipUpload != null;
  }
}

/// One upload slot that can also be explicitly marked "not available" —
/// used for the "Existing Building Documents" category in Step 7, where
/// the applicant may genuinely not possess an old permit/CO/plan set.
class AdditionExtensionDocumentSlot {
  DocumentModel? upload;
  bool markedNotAvailable = false;

  bool get isSatisfied => upload != null || markedNotAvailable;
}

/// Step 7 — Required Documents: the full document-checklist annex,
/// grouped the same way the official form groups it. Professional
/// documents (PRC ID, PTR, signed & sealed form/plans, structural
/// analysis) are intentionally NOT duplicated here — Step 7's UI
/// reads/writes [AdditionExtensionProfessionalInCharge]'s fields directly
/// so the same file is never uploaded twice.
class AdditionExtensionRequiredDocuments {
  // Property Documents
  DocumentModel? landTitleUpload;
  DocumentModel? taxDeclarationUpload;
  DocumentModel? realPropertyTaxReceiptUpload;
  DocumentModel? proofOfOwnershipOrAuthorityUpload;

  // Existing Building Documents — upload OR marked not-available.
  final AdditionExtensionDocumentSlot existingBuildingPermit =
      AdditionExtensionDocumentSlot();
  final AdditionExtensionDocumentSlot existingCertificateOfOccupancy =
      AdditionExtensionDocumentSlot();
  final AdditionExtensionDocumentSlot existingApprovedBuildingPlans =
      AdditionExtensionDocumentSlot();
  final AdditionExtensionDocumentSlot recentPhotographs =
      AdditionExtensionDocumentSlot();

  /// Optional — "when available", never blocks Continue.
  DocumentModel? asBuiltPlansUpload;

  // Addition / Extension Technical Documents — always required.
  DocumentModel? additionExtensionPlansUpload;
  DocumentModel? architecturalPlansUpload;
  DocumentModel? technicalSpecificationsUpload;
  DocumentModel? billOfMaterialsUpload;
  DocumentModel? detailedCostEstimateUpload;

  // Conditionally required based on Step 3/4 selections.
  DocumentModel? siteDevelopmentPlanUpload;

  /// "Civil / Structural Plans" — distinct from
  /// [AdditionExtensionProfessionalInCharge.structuralAnalysisUpload]
  /// ("Structural Analysis and Design Calculations"): one is drawings,
  /// the other is calculations/certification, both conditionally required
  /// together when structural work is involved.
  DocumentModel? civilStructuralPlansUpload;
  DocumentModel? electricalPlansUpload;
  DocumentModel? mechanicalPlansUpload;
  DocumentModel? plumbingPlansUpload;
  DocumentModel? sanitaryPlansUpload;
  DocumentModel? electronicsPlansUpload;
  DocumentModel? fireSafetyPlansUpload;

  // Government Clearances
  DocumentModel? barangayClearanceUpload;
  DocumentModel? zoningClearanceUpload;
  DocumentModel? fireSafetyEvaluationUpload;

  /// Optional catch-all for any other LGU-required clearance.
  DocumentModel? otherLguClearanceUpload;

  bool isValid({
    required bool requiresStructuralPlans,
    required bool requiresSiteDevelopmentPlan,
    required bool requiresElectricalPlans,
    required bool requiresMechanicalPlans,
    required bool requiresPlumbingPlans,
    required bool requiresSanitaryPlans,
    required bool requiresElectronicsPlans,
    required bool requiresFireSafetyPlans,
  }) {
    final propertyDocsValid =
        landTitleUpload != null &&
        taxDeclarationUpload != null &&
        realPropertyTaxReceiptUpload != null &&
        proofOfOwnershipOrAuthorityUpload != null;
    if (!propertyDocsValid) return false;

    final existingDocsValid =
        existingBuildingPermit.isSatisfied &&
        existingCertificateOfOccupancy.isSatisfied &&
        existingApprovedBuildingPlans.isSatisfied &&
        recentPhotographs.isSatisfied;
    if (!existingDocsValid) return false;

    final baseTechnicalValid =
        additionExtensionPlansUpload != null &&
        architecturalPlansUpload != null &&
        technicalSpecificationsUpload != null &&
        billOfMaterialsUpload != null &&
        detailedCostEstimateUpload != null;
    if (!baseTechnicalValid) return false;

    if (requiresStructuralPlans && civilStructuralPlansUpload == null) {
      return false;
    }
    if (requiresSiteDevelopmentPlan && siteDevelopmentPlanUpload == null) {
      return false;
    }
    if (requiresElectricalPlans && electricalPlansUpload == null) {
      return false;
    }
    if (requiresMechanicalPlans && mechanicalPlansUpload == null) {
      return false;
    }
    if (requiresPlumbingPlans && plumbingPlansUpload == null) {
      return false;
    }
    if (requiresSanitaryPlans && sanitaryPlansUpload == null) {
      return false;
    }
    if (requiresElectronicsPlans && electronicsPlansUpload == null) {
      return false;
    }
    if (requiresFireSafetyPlans && fireSafetyPlansUpload == null) {
      return false;
    }

    return barangayClearanceUpload != null &&
        zoningClearanceUpload != null &&
        fireSafetyEvaluationUpload != null;
  }
}

/// Step 8 — Review & Declaration: six certifications specific to an
/// addition to or extension of an existing structure.
class AdditionExtensionReviewDeclaration {
  bool certifiesTrueAndCorrect = false;
  bool confirmsAdditionOrExtensionOfExistingBuilding = false;
  bool understandsAncillaryPermitsMayBeRequired = false;
  bool understandsPlansMustBeSignedAndSealed = false;
  bool confirmsAdditionAccuratelyRepresented = false;
  bool agreesToTerms = false;

  bool get isValid =>
      certifiesTrueAndCorrect &&
      confirmsAdditionOrExtensionOfExistingBuilding &&
      understandsAncillaryPermitsMayBeRequired &&
      understandsPlansMustBeSignedAndSealed &&
      confirmsAdditionAccuratelyRepresented &&
      agreesToTerms;
}

/// How the applicant intends to pay once assessment is complete.
enum AdditionExtensionPaymentMethod { payOnsite, bankTransfer }

extension AdditionExtensionPaymentMethodX on AdditionExtensionPaymentMethod {
  String get label => this == AdditionExtensionPaymentMethod.payOnsite
      ? 'Pay Onsite'
      : 'Bank Transfer';
}

/// Step 9 — Assessment & Payment. The applicant does not enter assessed
/// fees — every line item is "Pending Assessment" until the Office of the
/// Building Official evaluates the application, so this step has no
/// blocking validity condition.
class AdditionExtensionAssessmentPayment {
  AdditionExtensionPaymentMethod? selectedPaymentMethod;

  static const List<String> assessmentLineItems = [
    'Filing Fee',
    'Processing Fee',
    'Locational / Zoning of Land Use',
    'Line and Grade',
    'Fencing',
    'Architectural',
    'Civil / Structural',
    'Electrical',
    'Mechanical',
    'Sanitary',
    'Plumbing',
    'Electronics',
    'Interior',
    'Fire Code Construction Tax',
    'Surcharges',
    'Penalties',
  ];

  bool get isValid => true;
}

enum AdditionExtensionPermitDraftStatus { draft, submitted }

/// The full mutable draft for one Addition / Extension Permit application
/// session.
class AdditionExtensionPermitDraft {
  /// Fixed — the DPWH-recognized Scope of Work for this entire workflow.
  /// Never mutated after construction.
  final ScopeOfWork scopeOfWork = ScopeOfWork.addition;

  final AdditionExtensionApplicantInfo applicant =
      AdditionExtensionApplicantInfo();
  final AdditionExtensionApplicantAddress applicantAddress =
      AdditionExtensionApplicantAddress();
  final AdditionExtensionLocation projectLocation = AdditionExtensionLocation();
  final AdditionExtensionProjectInformation projectInformation =
      AdditionExtensionProjectInformation();
  final BuildingAdditionDetails buildingDetails = BuildingAdditionDetails();
  final AdditionExtensionProfessionalInCharge professional =
      AdditionExtensionProfessionalInCharge();
  final AdditionExtensionConsentAuthorization consentAuthorization =
      AdditionExtensionConsentAuthorization();
  final AdditionExtensionRequiredDocuments requiredDocuments =
      AdditionExtensionRequiredDocuments();
  final AdditionExtensionReviewDeclaration reviewDeclaration =
      AdditionExtensionReviewDeclaration();
  final AdditionExtensionAssessmentPayment assessmentPayment =
      AdditionExtensionAssessmentPayment();

  /// Whether the "Project location is the same as my address" toggle is
  /// on. Toggling it on copies the current applicant address into the
  /// project location fields once; the copied fields stay editable
  /// afterward and are not kept in sync on further edits.
  bool useApplicantAddressForProjectLocation = false;

  AdditionExtensionPermitDraftStatus status =
      AdditionExtensionPermitDraftStatus.draft;
  DateTime? lastSavedAt;

  bool get isStep1Valid => applicant.isValid;
  bool get isStep2Valid =>
      applicantAddress.isValid && projectLocation.isValid;
  bool get isStep3Valid => projectInformation.isValid;
  bool get isStep4Valid => buildingDetails.isValid;

  /// True when Step 3/4 selections indicate structural work — drives both
  /// Step 5's Structural Analysis upload and Step 7's Civil/Structural
  /// Plans + Structural Analysis conditional requirements.
  bool get requiresStructuralAnalysis =>
      projectInformation.requiresStructuralPlans ||
      buildingDetails.proposedAdditionalStoreysValue > 0;

  bool get isStep5Valid =>
      professional.isValid(requiresStructuralAnalysis: requiresStructuralAnalysis);
  bool get isStep6Valid => consentAuthorization.isValid;
  bool get isStep7Valid =>
      requiredDocuments.isValid(
        requiresStructuralPlans: requiresStructuralAnalysis,
        requiresSiteDevelopmentPlan:
            projectInformation.requiresSiteDevelopmentPlan,
        requiresElectricalPlans: projectInformation.affectedAreas.contains(
          AffectedBuildingArea.electricalSystem,
        ),
        requiresMechanicalPlans: projectInformation.affectedAreas.contains(
          AffectedBuildingArea.mechanicalSystem,
        ),
        requiresPlumbingPlans: projectInformation.affectedAreas.contains(
          AffectedBuildingArea.plumbingSystem,
        ),
        requiresSanitaryPlans: projectInformation.affectedAreas.contains(
          AffectedBuildingArea.sanitarySystem,
        ),
        requiresElectronicsPlans: projectInformation.affectedAreas.contains(
          AffectedBuildingArea.electronicsSystem,
        ),
        requiresFireSafetyPlans: projectInformation.affectedAreas.contains(
          AffectedBuildingArea.fireSafetySystem,
        ),
      ) &&
      (!requiresStructuralAnalysis || professional.structuralAnalysisUpload != null) &&
      professional.prcIdUpload != null &&
      professional.ptrDocumentUpload != null &&
      professional.signedSealedFormUpload != null &&
      professional.signedSealedPlansUpload != null;
  bool get isStep8Valid => reviewDeclaration.isValid;
  bool get isStep9Valid => assessmentPayment.isValid;

  /// Copies the applicant address into the project location's matching
  /// fields (street/barangay/city/province only — lot/block/title/tax
  /// declaration numbers have no applicant-address equivalent).
  void copyApplicantAddressToProjectLocation() {
    projectLocation
      ..street = applicantAddress.street
      ..barangay = applicantAddress.barangay
      ..city = applicantAddress.city
      ..province = applicantAddress.province;
  }
}
