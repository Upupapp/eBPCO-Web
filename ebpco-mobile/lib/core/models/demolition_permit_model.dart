import '../utils/validators.dart';
import 'document_model.dart';

/// Mock, frontend-only data model for the Demolition Permit application
/// wizard. Based on the dedicated official Demolition Permit form (not the
/// Unified Building Permit form New Construction/Renovation/Addition-
/// Extension use), so it is a genuinely separate document checklist and
/// field set, not a variant of those three. Deliberately kept fully
/// separate from all three other permit models — no shared mutable state.

/// Strongly typed permit identifier — used instead of comparing display
/// strings, per the requirement to avoid string-based type checks. This
/// workflow only ever has one value.
enum PermitType { demolition }

extension PermitTypeX on PermitType {
  String get label => 'Demolition';
}

/// "Form of Ownership" choices shown when the property is owned by an
/// enterprise. Duplicated (not imported) from the other permit models to
/// keep all four models fully decoupled.
const List<String> demolitionFormsOfOwnership = [
  'Sole Proprietorship',
  'Partnership',
  'Corporation',
  'Cooperative',
  'Government',
  'Others',
];

/// Official "Use or Character of Occupancy" classification groups.
/// Duplicated (not imported) from the other permit models to keep all
/// four models fully decoupled.
enum DemolitionOccupancyGroup {
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

extension DemolitionOccupancyGroupX on DemolitionOccupancyGroup {
  String get label {
    switch (this) {
      case DemolitionOccupancyGroup.groupA:
        return 'Group A — Residential, Dwellings';
      case DemolitionOccupancyGroup.groupB:
        return 'Group B — Residential Hotel, Apartment';
      case DemolitionOccupancyGroup.groupC:
        return 'Group C — Educational, Recreational';
      case DemolitionOccupancyGroup.groupD:
        return 'Group D — Institutional';
      case DemolitionOccupancyGroup.groupE:
        return 'Group E — Business and Mercantile';
      case DemolitionOccupancyGroup.groupF:
        return 'Group F — Industrial';
      case DemolitionOccupancyGroup.groupG:
        return 'Group G — Industrial Storage and Hazardous';
      case DemolitionOccupancyGroup.groupH:
        return 'Group H — Recreational, occupant load below 1,000';
      case DemolitionOccupancyGroup.groupI:
        return 'Group I — Recreational, occupant load 1,000 or more';
      case DemolitionOccupancyGroup.groupJ:
        return 'Group J — Agricultural, Accessory';
      case DemolitionOccupancyGroup.others:
        return 'Others';
    }
  }
}

/// Step 1 — Applicant Information. Permit Type is fixed to "Demolition"
/// (not editable) since this wizard is only reached through the
/// Applications → Building Permit → Demolition card. Unlike the other
/// three workflows, Demolition's Step 1 has no New/Renewal/Amendatory
/// Application Type field (not part of the official form's Box 1) but
/// does collect the structure's occupancy classification here.
class DemolitionApplicantInfo {
  final PermitType permitType = PermitType.demolition;

  String firstName = '';
  String middleName = '';
  String lastName = '';
  String tin = '';

  /// Deliberately validated with `required` only (not a strict PH-mobile
  /// regex) since a landline is allowed.
  String contactNumber = '';

  bool isOwnedByEnterprise = false;
  String enterpriseName = '';
  String? formOfOwnership;

  DemolitionOccupancyGroup? occupancyGroup;
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
    if (occupancyGroup == DemolitionOccupancyGroup.others &&
        Validators.required(occupancyOtherDescription) != null) {
      return false;
    }
    if (!isOwnedByEnterprise) return true;
    return Validators.required(enterpriseName) == null &&
        formOfOwnership != null;
  }
}

/// Step 2 (part 1) — Applicant Address.
class DemolitionApplicantAddress {
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

/// Step 2 (part 2) — Demolition Location.
class DemolitionLocation {
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

/// Step 2 (part 3) — references to prior office-issued permits. Both
/// optional free text — these are numbers the applicant already has on
/// hand from a previous permit, not something the office assigns during
/// this application (an Application/Reference Number for *this*
/// application is generated by the system at submission, never asked of
/// the applicant).
class DemolitionExistingPermitReferences {
  String existingBuildingPermitNumber = '';
  String previousDemolitionPermitNumber = '';

  bool get isValid => true;
}

/// Step 3 — extent of the proposed demolition work.
enum DemolitionExtent {
  completeDemolition,
  partialDemolition,
  interiorDemolition,
  structuralComponentRemoval,
  accessoryStructureDemolition,
  emergencyOrUnsafeStructureDemolition,
  others,
}

extension DemolitionExtentX on DemolitionExtent {
  String get label {
    switch (this) {
      case DemolitionExtent.completeDemolition:
        return 'Complete Demolition';
      case DemolitionExtent.partialDemolition:
        return 'Partial Demolition';
      case DemolitionExtent.interiorDemolition:
        return 'Interior Demolition';
      case DemolitionExtent.structuralComponentRemoval:
        return 'Structural Component Removal';
      case DemolitionExtent.accessoryStructureDemolition:
        return 'Accessory Structure Demolition';
      case DemolitionExtent.emergencyOrUnsafeStructureDemolition:
        return 'Emergency or Unsafe Structure Demolition';
      case DemolitionExtent.others:
        return 'Others';
    }
  }
}

/// Primary construction material of the existing structure.
enum ConstructionMaterial {
  reinforcedConcrete,
  concreteHollowBlock,
  steel,
  timberOrWood,
  masonry,
  lightMaterials,
  mixedConstruction,
  others,
}

extension ConstructionMaterialX on ConstructionMaterial {
  String get label {
    switch (this) {
      case ConstructionMaterial.reinforcedConcrete:
        return 'Reinforced Concrete';
      case ConstructionMaterial.concreteHollowBlock:
        return 'Concrete Hollow Block';
      case ConstructionMaterial.steel:
        return 'Steel';
      case ConstructionMaterial.timberOrWood:
        return 'Timber or Wood';
      case ConstructionMaterial.masonry:
        return 'Masonry';
      case ConstructionMaterial.lightMaterials:
        return 'Light Materials';
      case ConstructionMaterial.mixedConstruction:
        return 'Mixed Construction';
      case ConstructionMaterial.others:
        return 'Others';
    }
  }
}

String? _nonNegativeDecimal(String? value, String fieldLabel) {
  if (value == null || value.trim().isEmpty) {
    return '$fieldLabel is required.';
  }
  final parsed = double.tryParse(value.trim());
  if (parsed == null) return 'Enter a valid number.';
  if (parsed < 0) return '$fieldLabel cannot be negative.';
  return null;
}

/// Step 3 — Structure & Demolition Details. Scope of Work is fixed to
/// "Demolition" (preselected and locked), displayed as a read-only card,
/// not a model field.
class DemolitionStructureDetails {
  DemolitionExtent? demolitionExtent;
  String otherExtentDescription = '';

  String structureName = '';
  String descriptionOfExistingStructure = '';
  String existingUseOrOccupancy = '';
  String numberOfStoreys = '';
  String numberOfUnits = '';
  String approximateFloorArea = '';
  String approximateBuildingHeight = '';
  ConstructionMaterial? primaryConstructionMaterial;
  String otherMaterialDescription = '';
  String estimatedAgeOfStructure = '';
  String portionToBeDemolished = '';
  String reasonForDemolition = '';
  String proposedDemolitionMethod = '';
  String estimatedDemolitionCost = '';
  DateTime? proposedStartDate;
  DateTime? expectedCompletionDate;

  bool get isValid {
    if (demolitionExtent == null) return false;
    if (demolitionExtent == DemolitionExtent.others &&
        Validators.required(otherExtentDescription) != null) {
      return false;
    }
    if (demolitionExtent == DemolitionExtent.partialDemolition &&
        Validators.required(portionToBeDemolished) != null) {
      return false;
    }
    if (Validators.required(structureName) != null) return false;
    if (Validators.required(descriptionOfExistingStructure) != null) {
      return false;
    }
    if (Validators.required(existingUseOrOccupancy) != null) return false;
    if (Validators.positiveWholeNumber(
          numberOfStoreys,
          fieldLabel: 'Number of storeys',
        ) !=
        null) {
      return false;
    }
    if (_nonNegativeDecimal(numberOfUnits, 'Number of units') != null) {
      return false;
    }
    if (_nonNegativeDecimal(approximateFloorArea, 'Approximate floor area') !=
        null) {
      return false;
    }
    if (_nonNegativeDecimal(
          approximateBuildingHeight,
          'Approximate building height',
        ) !=
        null) {
      return false;
    }
    if (primaryConstructionMaterial == null) return false;
    if (primaryConstructionMaterial == ConstructionMaterial.others &&
        Validators.required(otherMaterialDescription) != null) {
      return false;
    }
    if (Validators.required(estimatedAgeOfStructure) != null) return false;
    if (Validators.required(reasonForDemolition) != null) return false;
    if (Validators.required(proposedDemolitionMethod) != null) return false;
    if (_nonNegativeDecimal(
          estimatedDemolitionCost,
          'Estimated demolition cost',
        ) !=
        null) {
      return false;
    }

    final proposed = proposedStartDate;
    final expected = expectedCompletionDate;
    if (proposed == null || expected == null) return false;
    if (expected.isBefore(proposed)) return false;

    return true;
  }

  /// Drives Step 5/7's conditionally required Structural Assessment (and
  /// Step 7's Shoring Plan) — "Partial Demolition" and "Structural
  /// Component Removal" are the extents that involve structural work.
  bool get requiresStructuralAssessment =>
      demolitionExtent == DemolitionExtent.partialDemolition ||
      demolitionExtent == DemolitionExtent.structuralComponentRemoval;

  bool get requiresShoringPlan =>
      demolitionExtent == DemolitionExtent.structuralComponentRemoval;

  bool get isEmergencyOrUnsafe =>
      demolitionExtent == DemolitionExtent.emergencyOrUnsafeStructureDemolition;
}

/// Utilities tracked for disconnection before demolition begins.
enum UtilityType {
  electricity,
  water,
  gas,
  telephoneOrCommunication,
  sewerOrDrainage,
  other,
}

extension UtilityTypeX on UtilityType {
  String get label {
    switch (this) {
      case UtilityType.electricity:
        return 'Electricity';
      case UtilityType.water:
        return 'Water';
      case UtilityType.gas:
        return 'Gas';
      case UtilityType.telephoneOrCommunication:
        return 'Telephone or Communication Lines';
      case UtilityType.sewerOrDrainage:
        return 'Sewer or Drainage Connections';
      case UtilityType.other:
        return 'Other Utilities';
    }
  }
}

enum UtilityDisconnectionStatus {
  notApplicable,
  scheduledForDisconnection,
  disconnected,
  awaitingProviderConfirmation,
}

extension UtilityDisconnectionStatusX on UtilityDisconnectionStatus {
  String get label {
    switch (this) {
      case UtilityDisconnectionStatus.notApplicable:
        return 'Not Applicable';
      case UtilityDisconnectionStatus.scheduledForDisconnection:
        return 'Scheduled for Disconnection';
      case UtilityDisconnectionStatus.disconnected:
        return 'Disconnected';
      case UtilityDisconnectionStatus.awaitingProviderConfirmation:
        return 'Awaiting Utility Provider Confirmation';
    }
  }
}

/// Per-utility disconnection tracking. When [status] is anything other
/// than "Not Applicable", the provider/date/reference/upload become
/// required — [isSatisfied] captures exactly that rule.
class UtilityDisconnectionInfo {
  UtilityDisconnectionStatus status = UtilityDisconnectionStatus.notApplicable;
  String provider = '';
  DateTime? disconnectionDate;
  String referenceNumber = '';
  DocumentModel? supportingDocument;

  bool get isApplicable => status != UtilityDisconnectionStatus.notApplicable;

  bool get isSatisfied {
    if (!isApplicable) return true;
    return Validators.required(provider) == null &&
        disconnectionDate != null &&
        Validators.required(referenceNumber) == null &&
        supportingDocument != null;
  }
}

/// The ten site-safety confirmations the applicant must all check before
/// Step 4 is considered complete — matching the official form's demolition
/// conditions (vacancy, protection of the public, hazard control, PPE).
enum SafetyConfirmationItem {
  areaSecured,
  entrancesAndExitsProtected,
  publicWaysProtected,
  glazingRemovedOrSecured,
  hazardsControlled,
  chargedCablesCleared,
  utilityProvidersNotified,
  debrisContainedAndRemoved,
  dustAndNoiseControlled,
  ppeUsed,
}

extension SafetyConfirmationItemX on SafetyConfirmationItem {
  String get label {
    switch (this) {
      case SafetyConfirmationItem.areaSecured:
        return 'Demolition area will be secured against unauthorized access.';
      case SafetyConfirmationItem.entrancesAndExitsProtected:
        return 'Entrances and exits will be properly protected.';
      case SafetyConfirmationItem.publicWaysProtected:
        return 'Public roads, sidewalks, and adjacent properties will be protected.';
      case SafetyConfirmationItem.glazingRemovedOrSecured:
        return 'Glazed doors and windows will be removed or secured before demolition.';
      case SafetyConfirmationItem.hazardsControlled:
        return 'Fire, explosion, gas-leak, and flooding hazards will be controlled.';
      case SafetyConfirmationItem.chargedCablesCleared:
        return 'Charged electrical cables will not remain in the demolition area.';
      case SafetyConfirmationItem.utilityProvidersNotified:
        return 'Required utility providers will be notified.';
      case SafetyConfirmationItem.debrisContainedAndRemoved:
        return 'Debris will be contained and removed safely.';
      case SafetyConfirmationItem.dustAndNoiseControlled:
        return 'Dust and noise control measures will be applied.';
      case SafetyConfirmationItem.ppeUsed:
        return 'Workers will use appropriate personal protective equipment.';
    }
  }
}

/// Step 4 — Demolition Safety & Site Preparation.
class DemolitionSafetyAndSitePrep {
  bool? isBuildingOccupied;
  DateTime? plannedVacationDate;
  String occupantRelocationPlan = '';
  String personResponsibleForClearing = '';

  final Map<UtilityType, UtilityDisconnectionInfo> utilities = {
    for (final type in UtilityType.values) type: UtilityDisconnectionInfo(),
  };

  final Set<SafetyConfirmationItem> confirmedSafetyItems = {};

  String distanceToNearestStructure = '';
  bool? isPublicSidewalkAffected;
  String sidewalkMitigation = '';
  bool? isPublicRoadAffected;
  String roadMitigation = '';
  bool? areNeighboringPropertiesAtRisk;
  String neighboringPropertiesMitigation = '';
  String debrisDisposalLocation = '';
  String siteSecurityMethod = '';
  String dustControlMethod = '';
  String noiseControlMethod = '';

  /// Takes the proposed start date from Step 3 so a demolition start
  /// can't be scheduled before the planned vacation date, without this
  /// class needing to know about [DemolitionStructureDetails]'s shape.
  bool isValid(DateTime? proposedStartDate) {
    if (isBuildingOccupied == null) return false;
    if (isBuildingOccupied == true) {
      if (plannedVacationDate == null) return false;
      if (Validators.required(occupantRelocationPlan) != null) return false;
      if (Validators.required(personResponsibleForClearing) != null) {
        return false;
      }
      if (proposedStartDate != null &&
          proposedStartDate.isBefore(plannedVacationDate!)) {
        return false;
      }
    }

    for (final info in utilities.values) {
      if (!info.isSatisfied) return false;
    }

    if (confirmedSafetyItems.length != SafetyConfirmationItem.values.length) {
      return false;
    }

    if (_nonNegativeDecimal(
          distanceToNearestStructure,
          'Distance to nearest adjacent structure',
        ) !=
        null) {
      return false;
    }
    if (isPublicSidewalkAffected == null) return false;
    if (isPublicSidewalkAffected == true &&
        Validators.required(sidewalkMitigation) != null) {
      return false;
    }
    if (isPublicRoadAffected == null) return false;
    if (isPublicRoadAffected == true &&
        Validators.required(roadMitigation) != null) {
      return false;
    }
    if (areNeighboringPropertiesAtRisk == null) return false;
    if (areNeighboringPropertiesAtRisk == true &&
        Validators.required(neighboringPropertiesMitigation) != null) {
      return false;
    }
    if (Validators.required(debrisDisposalLocation) != null) return false;
    if (Validators.required(siteSecurityMethod) != null) return false;
    if (Validators.required(dustControlMethod) != null) return false;
    if (Validators.required(noiseControlMethod) != null) return false;

    return true;
  }
}

/// Licensed professional type required to supervise the demolition work.
enum DemolitionProfessionType { architect, civilEngineer }

extension DemolitionProfessionTypeX on DemolitionProfessionType {
  String get label =>
      this == DemolitionProfessionType.architect ? 'Architect' : 'Civil Engineer';
}

/// Step 5 — Demolition Supervisor. The Structural Assessment upload is
/// only required when Step 3 indicates structural involvement — [isValid]
/// takes that as a parameter so this class doesn't need to know about
/// [DemolitionStructureDetails]'s shape.
class DemolitionProfessionalInCharge {
  String fullName = '';
  DemolitionProfessionType? profession;
  String professionalAddress = '';
  String contactNumber = '';
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
  DocumentModel? demolitionPlanUpload;
  DocumentModel? demolitionMethodologyUpload;
  DocumentModel? safetyProgramUpload;

  /// "Structural Assessment, when applicable" — reused (not duplicated)
  /// by Step 7's Technical Documents checklist.
  DocumentModel? structuralAssessmentUpload;

  bool isValid({required bool requiresStructuralAssessment}) {
    final baseValid =
        Validators.required(fullName) == null &&
        profession != null &&
        Validators.required(professionalAddress) == null &&
        Validators.required(
              contactNumber,
              fieldLabel: 'Telephone or mobile number',
            ) ==
            null &&
        Validators.required(prcNumber) == null &&
        prcValidityDate != null &&
        Validators.required(ptrNumber) == null &&
        ptrDateIssued != null &&
        Validators.required(ptrPlaceIssued) == null &&
        prcIdUpload != null &&
        ptrDocumentUpload != null &&
        signedSealedFormUpload != null &&
        demolitionPlanUpload != null &&
        demolitionMethodologyUpload != null &&
        safetyProgramUpload != null;
    if (!baseValid) return false;
    if (requiresStructuralAssessment && structuralAssessmentUpload == null) {
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
/// the registered lot owner, the owner's/representative's details, CTC
/// info, and five supporting uploads are required; when the applicant IS
/// the owner, none of that applies.
class DemolitionConsentAuthorization {
  bool? isRegisteredOwner;

  String registeredOwnerFullName = '';
  String representativeFullName = '';
  String representativeAddress = '';
  String ctcNumber = '';
  DateTime? ctcDateIssued;
  String ctcPlaceIssued = '';

  DocumentModel? lotOwnerConsentUpload;
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
        lotOwnerConsentUpload != null &&
        authorizationLetterUpload != null &&
        ownerValidIdUpload != null &&
        representativeValidIdUpload != null &&
        proofOfOwnershipUpload != null;
  }
}

/// One upload slot that can also be explicitly marked "not available" —
/// used for the "Property and Existing Building Documents" category in
/// Step 7, where the applicant may genuinely not possess an old
/// permit/CO/plan set.
class DemolitionDocumentSlot {
  DocumentModel? upload;
  bool markedNotAvailable = false;
  String notAvailableExplanation = '';

  bool get isSatisfied =>
      upload != null ||
      (markedNotAvailable && Validators.required(notAvailableExplanation) == null);
}

/// Step 7 — Required Demolition Documents: the full document-checklist
/// annex, grouped the same way the spec groups it. Professional documents
/// and the technical documents already collected in Step 5 (demolition
/// plan/methodology/safety program/structural assessment) are
/// intentionally NOT duplicated here — Step 7's UI reads/writes
/// [DemolitionProfessionalInCharge]'s fields directly, and utility
/// confirmations read/write [DemolitionSafetyAndSitePrep]'s fields
/// directly, so the same file is never uploaded twice.
class DemolitionRequiredDocuments {
  // Property and Existing Building Documents
  DocumentModel? landTitleUpload;
  DocumentModel? taxDeclarationUpload;
  DocumentModel? realPropertyTaxReceiptUpload;
  final DemolitionDocumentSlot existingBuildingPermit = DemolitionDocumentSlot();
  final DemolitionDocumentSlot existingCertificateOfOccupancy =
      DemolitionDocumentSlot();

  /// Optional — "when available", never blocks Continue.
  DocumentModel? approvedOrAsBuiltPlansUpload;
  final DemolitionDocumentSlot recentPhotographs = DemolitionDocumentSlot();
  DocumentModel? proofOfOwnershipOrAuthorityUpload;

  // Demolition Technical Documents — always required (Demolition Plan,
  // Methodology, Safety Program, Structural Assessment are reused from
  // Step 5, not duplicated here).
  DocumentModel? debrisManagementPlanUpload;
  DocumentModel? dustNoiseControlPlanUpload;
  DocumentModel? projectScheduleUpload;
  DocumentModel? costEstimateUpload;

  // Conditionally required based on Step 3/4 selections.
  DocumentModel? shoringPlanUpload;
  DocumentModel? adjacentPropertyProtectionPlanUpload;
  DocumentModel? trafficOrPedestrianManagementPlanUpload;

  // Government and Local Clearances
  DocumentModel? barangayClearanceUpload;
  DocumentModel? oboRequirementsUpload;

  /// Optional/conditional catch-alls.
  DocumentModel? environmentalClearanceUpload;
  DocumentModel? roadSidewalkUseClearanceUpload;
  DocumentModel? fireClearanceUpload;
  DocumentModel? otherLguClearanceUpload;

  bool isValid({
    required bool requiresShoringPlan,
    required bool requiresAdjacentPropertyProtectionPlan,
    required bool requiresTrafficOrPedestrianManagementPlan,
  }) {
    final propertyDocsValid =
        landTitleUpload != null &&
        taxDeclarationUpload != null &&
        realPropertyTaxReceiptUpload != null &&
        existingBuildingPermit.isSatisfied &&
        existingCertificateOfOccupancy.isSatisfied &&
        recentPhotographs.isSatisfied &&
        proofOfOwnershipOrAuthorityUpload != null;
    if (!propertyDocsValid) return false;

    final baseTechnicalValid =
        debrisManagementPlanUpload != null &&
        dustNoiseControlPlanUpload != null &&
        projectScheduleUpload != null &&
        costEstimateUpload != null;
    if (!baseTechnicalValid) return false;

    if (requiresShoringPlan && shoringPlanUpload == null) return false;
    if (requiresAdjacentPropertyProtectionPlan &&
        adjacentPropertyProtectionPlanUpload == null) {
      return false;
    }
    if (requiresTrafficOrPedestrianManagementPlan &&
        trafficOrPedestrianManagementPlanUpload == null) {
      return false;
    }

    return barangayClearanceUpload != null && oboRequirementsUpload != null;
  }
}

/// Step 8 — Review, Safety Declaration & Submission: eight certifications
/// specific to a demolition of an existing structure. Per the spec, the
/// five-day advance notice to the Office of the Building Official is
/// acknowledged as a future obligation here — NOT marked as already
/// satisfied — so this only certifies the applicant *understands* the
/// requirement, never that notice has been given.
class DemolitionReviewDeclaration {
  bool certifiesTrueAndCorrect = false;
  bool confirmsStructureWillBeVacated = false;
  bool confirmsUtilitiesWillBeDisconnectedOrControlled = false;
  bool understandsSupervisionRequired = false;
  bool agreesToSafetyMeasures = false;
  bool understandsAdvanceNoticeRequired = false;
  bool understandsPermitMustBeIssuedFirst = false;
  bool agreesToTerms = false;

  bool get isValid =>
      certifiesTrueAndCorrect &&
      confirmsStructureWillBeVacated &&
      confirmsUtilitiesWillBeDisconnectedOrControlled &&
      understandsSupervisionRequired &&
      agreesToSafetyMeasures &&
      understandsAdvanceNoticeRequired &&
      understandsPermitMustBeIssuedFirst &&
      agreesToTerms;
}

/// How the applicant intends to pay once assessment is complete.
enum DemolitionPaymentMethod { payOnsite, bankTransfer }

extension DemolitionPaymentMethodX on DemolitionPaymentMethod {
  String get label =>
      this == DemolitionPaymentMethod.payOnsite ? 'Pay Onsite' : 'Bank Transfer';
}

/// Frontend-only permit status values the applicant can observe but never
/// set — mirrors the "possible frontend statuses" the spec enumerates.
enum DemolitionPermitStatus {
  submitted,
  underEvaluation,
  additionalDocumentsRequired,
  assessedForPayment,
  forApproval,
  approved,
  rejected,
  expired,
  completed,
}

extension DemolitionPermitStatusX on DemolitionPermitStatus {
  String get label {
    switch (this) {
      case DemolitionPermitStatus.submitted:
        return 'Submitted';
      case DemolitionPermitStatus.underEvaluation:
        return 'Under Evaluation';
      case DemolitionPermitStatus.additionalDocumentsRequired:
        return 'Additional Documents Required';
      case DemolitionPermitStatus.assessedForPayment:
        return 'Assessed for Payment';
      case DemolitionPermitStatus.forApproval:
        return 'For Approval';
      case DemolitionPermitStatus.approved:
        return 'Approved';
      case DemolitionPermitStatus.rejected:
        return 'Rejected';
      case DemolitionPermitStatus.expired:
        return 'Expired';
      case DemolitionPermitStatus.completed:
        return 'Completed';
    }
  }
}

/// Step 9 — Evaluation, Payment & Permit Status. Every field here is
/// office-controlled (Box 5/Box 6 of the official form) — there is no
/// applicant-editable state in this class at all, only fixed "pending"
/// defaults and a read-only [selectedPaymentMethod] preference that has
/// no effect while payment stays disabled. This step therefore has no
/// blocking validity condition; Continue always submits for evaluation.
class DemolitionEvaluationPermitStatus {
  /// The applicant's preferred payment method for later, once a mock
  /// assessment exists — recorded but never actionable in this prototype.
  DemolitionPaymentMethod? selectedPaymentMethod;

  static const List<String> evaluationStages = [
    'Initial Review',
    'Document Verification',
    'Technical Evaluation',
    'Safety Review',
    'Payment Assessment',
    'Building Official Decision',
  ];

  static const String feeDue = 'Pending Assessment';
  static const String officialReceiptNumber = 'Pending Assessment';
  static const String datePaid = 'Pending Assessment';
  static const String dateIssued = 'Pending Assessment';

  static const DemolitionPermitStatus permitStatus =
      DemolitionPermitStatus.submitted;

  static const List<String> permitConditions = [
    'The structure must be vacated before demolition.',
    'Utilities must be disconnected or safely controlled.',
    'Demolition must be supervised by a licensed Architect or Civil Engineer.',
    'Safety protection must be provided for workers, the public, and nearby properties.',
    'The Office of the Building Official must receive advance notice before work begins.',
    'Work must be completed within the period approved by the Building Official.',
  ];

  bool get isValid => true;
}

enum DemolitionPermitDraftStatus { draft, submitted }

/// The full mutable draft for one Demolition Permit application session.
class DemolitionPermitDraft {
  final DemolitionApplicantInfo applicant = DemolitionApplicantInfo();
  final DemolitionApplicantAddress applicantAddress =
      DemolitionApplicantAddress();
  final DemolitionLocation demolitionLocation = DemolitionLocation();
  final DemolitionExistingPermitReferences existingPermitReferences =
      DemolitionExistingPermitReferences();
  final DemolitionStructureDetails structureDetails =
      DemolitionStructureDetails();
  final DemolitionSafetyAndSitePrep safetyAndSitePrep =
      DemolitionSafetyAndSitePrep();
  final DemolitionProfessionalInCharge professional =
      DemolitionProfessionalInCharge();
  final DemolitionConsentAuthorization consentAuthorization =
      DemolitionConsentAuthorization();
  final DemolitionRequiredDocuments requiredDocuments =
      DemolitionRequiredDocuments();
  final DemolitionReviewDeclaration reviewDeclaration =
      DemolitionReviewDeclaration();
  final DemolitionEvaluationPermitStatus evaluationPermitStatus =
      DemolitionEvaluationPermitStatus();

  /// Whether the "Demolition location is the same as my address" toggle
  /// is on. Toggling it on copies the current applicant address into the
  /// demolition location fields once; the copied fields stay editable
  /// afterward and are not kept in sync on further edits.
  bool useApplicantAddressForDemolitionLocation = false;

  DemolitionPermitDraftStatus status = DemolitionPermitDraftStatus.draft;
  DateTime? lastSavedAt;

  bool get isStep1Valid => applicant.isValid;
  bool get isStep2Valid =>
      applicantAddress.isValid &&
      demolitionLocation.isValid &&
      existingPermitReferences.isValid;
  bool get isStep3Valid => structureDetails.isValid;
  bool get isStep4Valid =>
      safetyAndSitePrep.isValid(structureDetails.proposedStartDate);
  bool get isStep5Valid => professional.isValid(
    requiresStructuralAssessment: structureDetails.requiresStructuralAssessment,
  );
  bool get isStep6Valid => consentAuthorization.isValid;
  bool get isStep7Valid =>
      requiredDocuments.isValid(
        requiresShoringPlan: structureDetails.requiresShoringPlan,
        requiresAdjacentPropertyProtectionPlan:
            safetyAndSitePrep.areNeighboringPropertiesAtRisk == true,
        requiresTrafficOrPedestrianManagementPlan:
            safetyAndSitePrep.isPublicSidewalkAffected == true ||
            safetyAndSitePrep.isPublicRoadAffected == true,
      ) &&
      (!structureDetails.requiresStructuralAssessment ||
          professional.structuralAssessmentUpload != null) &&
      professional.prcIdUpload != null &&
      professional.ptrDocumentUpload != null &&
      professional.signedSealedFormUpload != null;
  bool get isStep8Valid => reviewDeclaration.isValid;
  bool get isStep9Valid => evaluationPermitStatus.isValid;

  /// Copies the applicant address into the demolition location's matching
  /// fields (street/barangay/city/province only — lot/block/title/tax
  /// declaration numbers have no applicant-address equivalent).
  void copyApplicantAddressToDemolitionLocation() {
    demolitionLocation
      ..street = applicantAddress.street
      ..barangay = applicantAddress.barangay
      ..city = applicantAddress.city
      ..province = applicantAddress.province;
  }
}
