import '../utils/validators.dart';
import 'document_model.dart';

/// Mock, frontend-only data model for the Civil / Structural Permit
/// application wizard. Based on the official Civil / Structural Permit
/// form (Boxes 1-9), and — like the Architectural Permit — an ancillary
/// permit that references a related Building Permit but never reads or
/// mutates [BuildingPermitProvider]'s state, so this model is fully
/// decoupled from all other permit models.

enum PermitType { civilStructural }

extension PermitTypeX on PermitType {
  String get label => 'Civil / Structural Permit';
}

/// Duplicated (not imported) from the other permit models to keep all
/// permit models fully decoupled.
const List<String> civilStructuralFormsOfOwnership = [
  'Sole Proprietorship',
  'Partnership',
  'Corporation',
  'Cooperative',
  'Government',
  'Others',
];

/// Duplicated (not imported) from the Demolition/Architectural models to
/// keep all permit models fully decoupled.
enum CivilStructuralOccupancyGroup {
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

extension CivilStructuralOccupancyGroupX on CivilStructuralOccupancyGroup {
  String get label {
    switch (this) {
      case CivilStructuralOccupancyGroup.groupA:
        return 'Group A — Residential, Dwellings';
      case CivilStructuralOccupancyGroup.groupB:
        return 'Group B — Residential Hotel, Apartment';
      case CivilStructuralOccupancyGroup.groupC:
        return 'Group C — Educational, Recreational';
      case CivilStructuralOccupancyGroup.groupD:
        return 'Group D — Institutional';
      case CivilStructuralOccupancyGroup.groupE:
        return 'Group E — Business and Mercantile';
      case CivilStructuralOccupancyGroup.groupF:
        return 'Group F — Industrial';
      case CivilStructuralOccupancyGroup.groupG:
        return 'Group G — Industrial Storage and Hazardous';
      case CivilStructuralOccupancyGroup.groupH:
        return 'Group H — Recreational, occupant load below 1,000';
      case CivilStructuralOccupancyGroup.groupI:
        return 'Group I — Recreational, occupant load 1,000 or more';
      case CivilStructuralOccupancyGroup.groupJ:
        return 'Group J — Agricultural, Accessory';
      case CivilStructuralOccupancyGroup.others:
        return 'Others';
    }
  }
}

/// Step 1 — Applicant Information. Permit Type is fixed to "Civil /
/// Structural Permit" and not editable.
class CivilStructuralApplicantInfo {
  final PermitType permitType = PermitType.civilStructural;

  String firstName = '';
  String middleName = '';
  String lastName = '';
  String tin = '';
  String contactNumber = '';

  bool isOwnedByEnterprise = false;
  String enterpriseName = '';
  String? formOfOwnership;

  CivilStructuralOccupancyGroup? occupancyGroup;
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
    if (occupancyGroup == CivilStructuralOccupancyGroup.others &&
        Validators.required(occupancyOtherDescription) != null) {
      return false;
    }
    if (!isOwnedByEnterprise) return true;
    return Validators.required(enterpriseName) == null &&
        formOfOwnership != null;
  }
}

/// Step 2 (part 1) — Applicant Address.
class CivilStructuralApplicantAddress {
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

/// Step 2 (part 2) — Project Location.
class CivilStructuralProjectLocation {
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
/// Duplicated (not imported) from the Architectural model to keep the two
/// ancillary permits fully decoupled.
const List<String> civilStructuralMockBuildingPermitNumbers = [
  'BP-2026-100234',
  'BP-2026-100567',
  'BP-2026-100812',
];

/// Step 2 (part 3) — Related Building Permit. The Civil / Structural
/// Permit is invalid without one. Only "Approved" counts as an issued,
/// bona fide Building Permit — every other status is a legitimate pending
/// state the applicant may file under while waiting (see
/// [CivilStructuralPermitDraft.derivedPermitStatus]).
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

class CivilStructuralRelatedBuildingPermit {
  String buildingPermitNumber = '';
  RelatedBuildingPermitStatus status = RelatedBuildingPermitStatus.pending;

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

/// Official scope-of-work options (Box 1).
enum CivilStructuralScopeType {
  newConstruction,
  erection,
  addition,
  alteration,
  renovation,
  conversion,
  repair,
  moving,
  raising,
  demolition,
  accessoryBuildingOrStructure,
  others,
}

extension CivilStructuralScopeTypeX on CivilStructuralScopeType {
  String get label {
    switch (this) {
      case CivilStructuralScopeType.newConstruction:
        return 'New Construction';
      case CivilStructuralScopeType.erection:
        return 'Erection';
      case CivilStructuralScopeType.addition:
        return 'Addition';
      case CivilStructuralScopeType.alteration:
        return 'Alteration';
      case CivilStructuralScopeType.renovation:
        return 'Renovation';
      case CivilStructuralScopeType.conversion:
        return 'Conversion';
      case CivilStructuralScopeType.repair:
        return 'Repair';
      case CivilStructuralScopeType.moving:
        return 'Moving';
      case CivilStructuralScopeType.raising:
        return 'Raising';
      case CivilStructuralScopeType.demolition:
        return 'Demolition';
      case CivilStructuralScopeType.accessoryBuildingOrStructure:
        return 'Accessory Building / Structure';
      case CivilStructuralScopeType.others:
        return 'Others';
    }
  }
}

/// Step 3 — Scope of Work.
class CivilStructuralScopeOfWork {
  final Set<CivilStructuralScopeType> selectedScopes = {};
  String otherScopeDescription = '';

  String workTitle = '';
  String generalDescription = '';
  String existingStructuralCondition = '';
  String proposedStructuralChanges = '';
  String areasAffected = '';

  bool get isValid {
    if (selectedScopes.isEmpty) return false;
    if (selectedScopes.contains(CivilStructuralScopeType.others) &&
        Validators.required(otherScopeDescription) != null) {
      return false;
    }
    return Validators.required(workTitle) == null &&
        Validators.required(generalDescription) == null &&
        Validators.required(existingStructuralCondition) == null &&
        Validators.required(proposedStructuralChanges) == null &&
        Validators.required(areasAffected) == null;
  }
}

/// Official Nature of Civil / Structural Works options (Box... this is the
/// permit-specific technical-scope box).
enum NatureOfWork {
  staking,
  excavation,
  soilStabilization,
  pilingWorks,
  foundation,
  erectionLifting,
  concreteFraming,
  structuralSteelFraming,
  slabs,
  walls,
  prestressWorks,
  materialTesting,
  steelTowers,
  tanks,
  others,
}

extension NatureOfWorkX on NatureOfWork {
  String get label {
    switch (this) {
      case NatureOfWork.staking:
        return 'Staking';
      case NatureOfWork.excavation:
        return 'Excavation';
      case NatureOfWork.soilStabilization:
        return 'Soil Stabilization';
      case NatureOfWork.pilingWorks:
        return 'Piling Works';
      case NatureOfWork.foundation:
        return 'Foundation';
      case NatureOfWork.erectionLifting:
        return 'Erection / Lifting';
      case NatureOfWork.concreteFraming:
        return 'Concrete Framing';
      case NatureOfWork.structuralSteelFraming:
        return 'Structural Steel Framing';
      case NatureOfWork.slabs:
        return 'Slabs';
      case NatureOfWork.walls:
        return 'Walls';
      case NatureOfWork.prestressWorks:
        return 'Prestress Works';
      case NatureOfWork.materialTesting:
        return 'Material Testing';
      case NatureOfWork.steelTowers:
        return 'Steel Towers';
      case NatureOfWork.tanks:
        return 'Tanks';
      case NatureOfWork.others:
        return 'Others';
    }
  }
}

String? _positiveDecimal(String? value, String fieldLabel) {
  if (value == null || value.trim().isEmpty) {
    return '$fieldLabel is required.';
  }
  final parsed = double.tryParse(value.trim());
  if (parsed == null) return 'Enter a valid number.';
  if (parsed <= 0) return '$fieldLabel must be greater than zero.';
  return null;
}

/// Step 4 — Nature of Civil / Structural Works: the selected work types,
/// base project measurements, and the technical fields conditionally
/// required by each selected work type. Numeric parsing is always via
/// `double.tryParse`/`int.tryParse` — never a bare `parse` — so a
/// temporarily empty or invalid field never throws or renders `NaN`.
class CivilStructuralWorkDetails {
  final Set<NatureOfWork> selectedWorks = {};
  String otherWorkDescription = '';

  // Base project measurements — always required once at least one work
  // type is selected.
  String numberOfStoreys = '';
  String totalStructuralFloorArea = '';
  String buildingOrStructureHeight = '';
  String estimatedStructuralCost = '';
  DateTime? proposedStartDate;
  DateTime? expectedCompletionDate;

  // Excavation
  String excavationDepth = '';

  // Piling Works
  String numberOfPiles = '';
  String pileType = '';
  String averagePileDepth = '';
  String pileCapacity = '';

  // Foundation
  String foundationType = '';
  String foundationDepth = '';
  String foundationDescription = '';

  // Concrete Framing
  String concreteStrength = '';
  String concreteFramingSystemDescription = '';

  // Structural Steel Framing
  String steelGrade = '';
  String steelFramingSystemDescription = '';

  // Slabs
  String slabType = '';
  String typicalSlabThickness = '';

  // Walls
  String structuralWallType = '';
  String wallMaterial = '';
  String typicalWallThickness = '';

  // Prestress Works
  String prestressingSystemDescription = '';

  // Material Testing
  String testingLaboratory = '';
  String plannedTests = '';
  String testSchedule = '';

  // Steel Towers
  String towerType = '';
  String towerHeight = '';
  String intendedUse = '';

  // Tanks
  String tankType = '';
  String tankCapacity = '';
  String tankMaterial = '';

  bool get hasStaking => selectedWorks.contains(NatureOfWork.staking);
  bool get hasExcavation => selectedWorks.contains(NatureOfWork.excavation);
  bool get hasSoilStabilization =>
      selectedWorks.contains(NatureOfWork.soilStabilization);
  bool get hasPilingWorks => selectedWorks.contains(NatureOfWork.pilingWorks);
  bool get hasFoundation => selectedWorks.contains(NatureOfWork.foundation);
  bool get hasErectionLifting =>
      selectedWorks.contains(NatureOfWork.erectionLifting);
  bool get hasConcreteFraming =>
      selectedWorks.contains(NatureOfWork.concreteFraming);
  bool get hasStructuralSteelFraming =>
      selectedWorks.contains(NatureOfWork.structuralSteelFraming);
  bool get hasSlabs => selectedWorks.contains(NatureOfWork.slabs);
  bool get hasWalls => selectedWorks.contains(NatureOfWork.walls);
  bool get hasPrestressWorks =>
      selectedWorks.contains(NatureOfWork.prestressWorks);
  bool get hasMaterialTesting =>
      selectedWorks.contains(NatureOfWork.materialTesting);
  bool get hasSteelTowers => selectedWorks.contains(NatureOfWork.steelTowers);
  bool get hasTanks => selectedWorks.contains(NatureOfWork.tanks);

  bool get isValid {
    if (selectedWorks.isEmpty) return false;
    if (selectedWorks.contains(NatureOfWork.others) &&
        Validators.required(otherWorkDescription) != null) {
      return false;
    }

    if (Validators.positiveWholeNumber(
          numberOfStoreys,
          fieldLabel: 'Number of storeys',
        ) !=
        null) {
      return false;
    }
    if (_positiveDecimal(totalStructuralFloorArea, 'Total Structural Floor Area') !=
        null) {
      return false;
    }
    if (_positiveDecimal(
          buildingOrStructureHeight,
          'Building or Structure Height',
        ) !=
        null) {
      return false;
    }
    if (_positiveDecimal(estimatedStructuralCost, 'Estimated Structural Cost') !=
        null) {
      return false;
    }
    final start = proposedStartDate;
    final end = expectedCompletionDate;
    if (start == null || end == null) return false;
    if (end.isBefore(start)) return false;

    if (hasExcavation && _positiveDecimal(excavationDepth, 'Excavation Depth') != null) {
      return false;
    }

    if (hasPilingWorks) {
      if (Validators.positiveWholeNumber(
            numberOfPiles,
            fieldLabel: 'Number of piles',
          ) !=
          null) {
        return false;
      }
      if (Validators.required(pileType) != null) return false;
      if (_positiveDecimal(averagePileDepth, 'Average Pile Depth') != null) {
        return false;
      }
      if (_positiveDecimal(pileCapacity, 'Pile Capacity') != null) return false;
    }

    if (hasFoundation) {
      if (Validators.required(foundationType) != null) return false;
      if (_positiveDecimal(foundationDepth, 'Foundation Depth') != null) {
        return false;
      }
      if (Validators.required(foundationDescription) != null) return false;
    }

    if (hasConcreteFraming) {
      if (Validators.required(concreteStrength) != null) return false;
      if (Validators.required(concreteFramingSystemDescription) != null) {
        return false;
      }
    }

    if (hasStructuralSteelFraming) {
      if (Validators.required(steelGrade) != null) return false;
      if (Validators.required(steelFramingSystemDescription) != null) {
        return false;
      }
    }

    if (hasSlabs) {
      if (Validators.required(slabType) != null) return false;
      if (_positiveDecimal(typicalSlabThickness, 'Typical Slab Thickness') !=
          null) {
        return false;
      }
    }

    if (hasWalls) {
      if (Validators.required(structuralWallType) != null) return false;
      if (Validators.required(wallMaterial) != null) return false;
      if (_positiveDecimal(typicalWallThickness, 'Typical Wall Thickness') !=
          null) {
        return false;
      }
    }

    if (hasPrestressWorks &&
        Validators.required(prestressingSystemDescription) != null) {
      return false;
    }

    if (hasMaterialTesting) {
      if (Validators.required(testingLaboratory) != null) return false;
      if (Validators.required(plannedTests) != null) return false;
      if (Validators.required(testSchedule) != null) return false;
    }

    if (hasSteelTowers) {
      if (Validators.required(towerType) != null) return false;
      if (_positiveDecimal(towerHeight, 'Tower Height') != null) return false;
      if (Validators.required(intendedUse) != null) return false;
    }

    if (hasTanks) {
      if (Validators.required(tankType) != null) return false;
      if (_positiveDecimal(tankCapacity, 'Tank Capacity') != null) return false;
      if (Validators.required(tankMaterial) != null) return false;
    }

    return true;
  }
}

/// Licensed professional type for both the Design Engineer and the
/// Supervisor / Engineer in Charge.
enum CivilStructuralProfessionType { civilEngineer, structuralEngineer }

extension CivilStructuralProfessionTypeX on CivilStructuralProfessionType {
  String get label => this == CivilStructuralProfessionType.civilEngineer
      ? 'Civil Engineer'
      : 'Structural Engineer';
}

/// Shared license/contact shape for both the Design Engineer and the
/// Supervisor — kept internal to this model only, so it introduces no
/// coupling with any other permit.
class CivilStructuralProfessionalInfo {
  String fullName = '';
  CivilStructuralProfessionType? profession;
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

/// Step 5 — Civil / Structural Professionals. When the Supervisor is the
/// same person as the Design Engineer, the supervisor's own
/// fields/uploads are never populated — Step 7's document checklist reads
/// the Design Engineer's uploads for both roles in that case.
class CivilStructuralProfessionals {
  final CivilStructuralProfessionalInfo designEngineer =
      CivilStructuralProfessionalInfo();
  DocumentModel? designPrcIdUpload;
  DocumentModel? designPtrDocumentUpload;
  DocumentModel? signedSealedPlansUpload;
  DocumentModel? signedSealedComputationsUpload;
  DocumentModel? signedSealedSpecificationsUpload;

  bool isSupervisorSameAsDesignEngineer = true;
  final CivilStructuralProfessionalInfo supervisor =
      CivilStructuralProfessionalInfo();
  DocumentModel? supervisorPrcIdUpload;
  DocumentModel? supervisorPtrUpload;
  DocumentModel? signedSupervisorConfirmationUpload;

  bool get isValid {
    final designValid = designEngineer.isValid &&
        designPrcIdUpload != null &&
        designPtrDocumentUpload != null &&
        signedSealedPlansUpload != null &&
        signedSealedComputationsUpload != null &&
        signedSealedSpecificationsUpload != null;
    if (!designValid) return false;
    if (isSupervisorSameAsDesignEngineer) return true;
    return supervisor.isValid &&
        supervisorPrcIdUpload != null &&
        supervisorPtrUpload != null &&
        signedSupervisorConfirmationUpload != null;
  }
}

/// Shared owner-identity shape for both the Building Owner and the Lot
/// Owner in Step 6 — internal to this model only.
class CivilStructuralOwnerInfo {
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

/// Step 6 — Ownership & Consent.
class CivilStructuralOwnershipConsent {
  bool? isApplicantBuildingOwner;
  final CivilStructuralOwnerInfo buildingOwner = CivilStructuralOwnerInfo();

  bool? isBuildingOwnerAlsoLotOwner;
  final CivilStructuralOwnerInfo lotOwner = CivilStructuralOwnerInfo();

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

/// Step 7 — Required Civil / Structural Documents. Professional documents
/// already collected in Step 5 (PRC IDs, PTRs, signed and sealed plans/
/// computations/specifications) are intentionally NOT duplicated here —
/// the UI reads/writes [CivilStructuralProfessionals]'s fields directly.
class CivilStructuralRequiredDocuments {
  // Civil / Structural Design Documents (base, always required).
  DocumentModel? structuralAnalysisUpload;
  DocumentModel? generalNotesUpload;

  // Cost and Material Documents.
  DocumentModel? billOfMaterialsUpload;
  DocumentModel? costEstimateUpload;
  DocumentModel? quantityTakeoffUpload; // optional, "when applicable"
  DocumentModel? materialSpecificationsUpload;

  // Work-Specific Documents — conditionally required based on Step 4.
  DocumentModel? stakingPlanUpload;
  DocumentModel? surveyReferenceUpload;

  DocumentModel? excavationPlanUpload;
  DocumentModel? excavationSafetyPlanUpload;

  DocumentModel? soilStabilizationPlanUpload;
  DocumentModel? geotechnicalRecommendationUpload;

  DocumentModel? pilingLayoutUpload;
  DocumentModel? pileDesignCalculationsUpload;
  DocumentModel? pileTestingProgramUpload;

  DocumentModel? foundationPlanUpload;
  DocumentModel? foundationDesignCalculationsUpload;

  DocumentModel? erectionPlanUpload;
  DocumentModel? liftingPlanUpload;
  DocumentModel? temporarySupportPlanUpload;

  DocumentModel? concreteFramingPlansUpload;
  DocumentModel? concreteDesignCalculationsUpload;
  DocumentModel? concreteMaterialSpecificationsUpload;

  DocumentModel? structuralSteelPlansUpload;
  DocumentModel? connectionDetailsUpload;
  DocumentModel? steelDesignCalculationsUpload;

  DocumentModel? slabPlansUpload;
  DocumentModel? slabReinforcementDetailsUpload;

  DocumentModel? structuralWallPlansUpload;
  DocumentModel? wallReinforcementDetailsUpload;

  DocumentModel? prestressingDesignUpload;
  DocumentModel? prestressingProcedureUpload;
  DocumentModel? tendonLayoutUpload;

  DocumentModel? materialTestingProgramUpload;
  DocumentModel? testingLaboratoryCredentialsUpload;
  DocumentModel? testReportsUpload; // optional, "when available"

  DocumentModel? towerPlansUpload;
  DocumentModel? towerDesignCalculationsUpload;
  DocumentModel? towerFoundationDetailsUpload;

  DocumentModel? tankStructuralPlansUpload;
  DocumentModel? tankDesignCalculationsUpload;
  DocumentModel? tankFoundationDetailsUpload;

  // Supporting Documents.
  DocumentModel? relatedBuildingPermitUpload;
  DocumentModel? geotechnicalOrSoilInvestigationUpload; // optional, "when applicable"
  DocumentModel? siteSurveyUpload;
  DocumentModel? materialTestResultsUpload; // optional, "when available"
  DocumentModel? otherCivilStructuralDocumentsUpload; // optional

  bool isValid({
    required bool hasStaking,
    required bool hasExcavation,
    required bool hasSoilStabilization,
    required bool hasPilingWorks,
    required bool hasFoundation,
    required bool hasErectionLifting,
    required bool hasConcreteFraming,
    required bool hasStructuralSteelFraming,
    required bool hasSlabs,
    required bool hasWalls,
    required bool hasPrestressWorks,
    required bool hasMaterialTesting,
    required bool hasSteelTowers,
    required bool hasTanks,
  }) {
    final baseValid = structuralAnalysisUpload != null &&
        generalNotesUpload != null &&
        billOfMaterialsUpload != null &&
        costEstimateUpload != null &&
        materialSpecificationsUpload != null &&
        relatedBuildingPermitUpload != null &&
        siteSurveyUpload != null;
    if (!baseValid) return false;

    if (hasStaking &&
        (stakingPlanUpload == null || surveyReferenceUpload == null)) {
      return false;
    }
    if (hasExcavation &&
        (excavationPlanUpload == null || excavationSafetyPlanUpload == null)) {
      return false;
    }
    if (hasSoilStabilization &&
        (soilStabilizationPlanUpload == null ||
            geotechnicalRecommendationUpload == null)) {
      return false;
    }
    if (hasPilingWorks &&
        (pilingLayoutUpload == null ||
            pileDesignCalculationsUpload == null ||
            pileTestingProgramUpload == null)) {
      return false;
    }
    if (hasFoundation &&
        (foundationPlanUpload == null ||
            foundationDesignCalculationsUpload == null)) {
      return false;
    }
    if (hasErectionLifting &&
        (erectionPlanUpload == null ||
            liftingPlanUpload == null ||
            temporarySupportPlanUpload == null)) {
      return false;
    }
    if (hasConcreteFraming &&
        (concreteFramingPlansUpload == null ||
            concreteDesignCalculationsUpload == null ||
            concreteMaterialSpecificationsUpload == null)) {
      return false;
    }
    if (hasStructuralSteelFraming &&
        (structuralSteelPlansUpload == null ||
            connectionDetailsUpload == null ||
            steelDesignCalculationsUpload == null)) {
      return false;
    }
    if (hasSlabs &&
        (slabPlansUpload == null || slabReinforcementDetailsUpload == null)) {
      return false;
    }
    if (hasWalls &&
        (structuralWallPlansUpload == null ||
            wallReinforcementDetailsUpload == null)) {
      return false;
    }
    if (hasPrestressWorks &&
        (prestressingDesignUpload == null ||
            prestressingProcedureUpload == null ||
            tendonLayoutUpload == null)) {
      return false;
    }
    if (hasMaterialTesting &&
        (materialTestingProgramUpload == null ||
            testingLaboratoryCredentialsUpload == null)) {
      return false;
    }
    if (hasSteelTowers &&
        (towerPlansUpload == null ||
            towerDesignCalculationsUpload == null ||
            towerFoundationDetailsUpload == null)) {
      return false;
    }
    if (hasTanks &&
        (tankStructuralPlansUpload == null ||
            tankDesignCalculationsUpload == null ||
            tankFoundationDetailsUpload == null)) {
      return false;
    }

    return true;
  }
}

/// Step 8 — Review & Declaration: the eight certifications required
/// before the civil/structural application can be submitted.
class CivilStructuralReviewDeclaration {
  bool certifiesTrueAndCorrect = false;
  bool confirmsPlansPreparedByLicensedEngineer = false;
  bool understandsSubjectToTechnicalEvaluation = false;
  bool understandsMustFollowApprovedPlans = false;
  bool understandsNoticeOfConstructionMayBeRequired = false;
  bool understandsCompletionDocumentsMayBeRequired = false;
  bool understandsRequiresValidBuildingPermit = false;
  bool agreesToTerms = false;

  bool get isValid =>
      certifiesTrueAndCorrect &&
      confirmsPlansPreparedByLicensedEngineer &&
      understandsSubjectToTechnicalEvaluation &&
      understandsMustFollowApprovedPlans &&
      understandsNoticeOfConstructionMayBeRequired &&
      understandsCompletionDocumentsMayBeRequired &&
      understandsRequiresValidBuildingPermit &&
      agreesToTerms;
}

/// Per-document-group evaluation status shown in Step 9's read-only
/// "Document Evaluation" summary.
enum CivilStructuralDocumentEvaluationStatus {
  pendingReview,
  accepted,
  revisionRequired,
  missing,
  notApplicable,
}

extension CivilStructuralDocumentEvaluationStatusX
    on CivilStructuralDocumentEvaluationStatus {
  String get label {
    switch (this) {
      case CivilStructuralDocumentEvaluationStatus.pendingReview:
        return 'Pending Review';
      case CivilStructuralDocumentEvaluationStatus.accepted:
        return 'Accepted';
      case CivilStructuralDocumentEvaluationStatus.revisionRequired:
        return 'Revision Required';
      case CivilStructuralDocumentEvaluationStatus.missing:
        return 'Missing';
      case CivilStructuralDocumentEvaluationStatus.notApplicable:
        return 'Not Applicable';
    }
  }
}

/// Frontend-only permit status values the applicant can observe but never
/// set. [invalidWithoutBuildingPermit] is never chosen directly — it is
/// always derived (see [CivilStructuralPermitDraft.derivedPermitStatus]).
enum CivilStructuralPermitStatus {
  submitted,
  underEvaluation,
  revisionRequired,
  additionalDocumentsRequired,
  forApproval,
  approved,
  rejected,
  invalidWithoutBuildingPermit,
}

extension CivilStructuralPermitStatusX on CivilStructuralPermitStatus {
  String get label {
    switch (this) {
      case CivilStructuralPermitStatus.submitted:
        return 'Submitted';
      case CivilStructuralPermitStatus.underEvaluation:
        return 'Under Evaluation';
      case CivilStructuralPermitStatus.revisionRequired:
        return 'Revision Required';
      case CivilStructuralPermitStatus.additionalDocumentsRequired:
        return 'Additional Documents Required';
      case CivilStructuralPermitStatus.forApproval:
        return 'For Approval';
      case CivilStructuralPermitStatus.approved:
        return 'Approved';
      case CivilStructuralPermitStatus.rejected:
        return 'Rejected';
      case CivilStructuralPermitStatus.invalidWithoutBuildingPermit:
        return 'Invalid Without Building Permit';
    }
  }
}

/// Step 9 — Evaluation, Progress & Permit Status. Every field here is
/// office-controlled — there is no applicant-editable state in this class
/// at all, only fixed "pending" defaults. This step therefore has no
/// blocking validity condition; Continue always submits for evaluation.
class CivilStructuralEvaluationPermitStatus {
  static const Map<String, CivilStructuralDocumentEvaluationStatus>
  documentEvaluation = {
    'Civil / Structural Design Computations':
        CivilStructuralDocumentEvaluationStatus.pendingReview,
    'Plans': CivilStructuralDocumentEvaluationStatus.pendingReview,
    'Specifications': CivilStructuralDocumentEvaluationStatus.pendingReview,
    'Bill of Materials': CivilStructuralDocumentEvaluationStatus.pendingReview,
    'Cost Estimate': CivilStructuralDocumentEvaluationStatus.pendingReview,
    'Other Submitted Documents':
        CivilStructuralDocumentEvaluationStatus.pendingReview,
  };

  static const List<String> progressStages = [
    'Civil / Structural Documents Received',
    'Design Computation Review',
    'Plan Review',
    'Specification Review',
    'Technical Evaluation',
    'Recommending Approval',
    'Building Official Decision',
  ];

  static const String actionTaken = 'Pending Assessment';
  static const String recommendingApproval = 'Pending Assessment';
  static const String permitIssuedBy = 'Pending Assessment';

  static const List<String> permitConditions = [
    'The Engineer responsible for the plans and specifications remains professionally accountable.',
    'Civil and structural work must follow the approved plans and specifications.',
    'Work must comply with the applicable structural and building-code requirements.',
    'A Notice of Construction must be submitted when required before work begins.',
    'Upon completion, required logbook entries, as-built plans, and the Certificate of Completion must be submitted.',
    'The Civil / Structural Permit is invalid without the related Building Permit.',
  ];

  bool get isValid => true;
}

enum CivilStructuralPermitDraftStatus { draft, submitted }

/// The full mutable draft for one Civil / Structural Permit application
/// session.
class CivilStructuralPermitDraft {
  final CivilStructuralApplicantInfo applicant = CivilStructuralApplicantInfo();
  final CivilStructuralApplicantAddress applicantAddress =
      CivilStructuralApplicantAddress();
  final CivilStructuralProjectLocation projectLocation =
      CivilStructuralProjectLocation();
  final CivilStructuralRelatedBuildingPermit relatedBuildingPermit =
      CivilStructuralRelatedBuildingPermit();
  final CivilStructuralScopeOfWork scopeOfWork = CivilStructuralScopeOfWork();
  final CivilStructuralWorkDetails workDetails = CivilStructuralWorkDetails();
  final CivilStructuralProfessionals professionals = CivilStructuralProfessionals();
  final CivilStructuralOwnershipConsent ownershipConsent =
      CivilStructuralOwnershipConsent();
  final CivilStructuralRequiredDocuments requiredDocuments =
      CivilStructuralRequiredDocuments();
  final CivilStructuralReviewDeclaration reviewDeclaration =
      CivilStructuralReviewDeclaration();
  final CivilStructuralEvaluationPermitStatus evaluationPermitStatus =
      CivilStructuralEvaluationPermitStatus();

  bool useApplicantAddressForProjectLocation = false;
  CivilStructuralPermitDraftStatus status = CivilStructuralPermitDraftStatus.draft;
  DateTime? lastSavedAt;

  bool get isStep1Valid => applicant.isValid;
  bool get isStep2Valid =>
      applicantAddress.isValid && projectLocation.isValid && relatedBuildingPermit.isValid;
  bool get isStep3Valid => scopeOfWork.isValid;
  bool get isStep4Valid => workDetails.isValid;
  bool get isStep5Valid => professionals.isValid;
  bool get isStep6Valid => ownershipConsent.isValid;
  bool get isStep7Valid => requiredDocuments.isValid(
        hasStaking: workDetails.hasStaking,
        hasExcavation: workDetails.hasExcavation,
        hasSoilStabilization: workDetails.hasSoilStabilization,
        hasPilingWorks: workDetails.hasPilingWorks,
        hasFoundation: workDetails.hasFoundation,
        hasErectionLifting: workDetails.hasErectionLifting,
        hasConcreteFraming: workDetails.hasConcreteFraming,
        hasStructuralSteelFraming: workDetails.hasStructuralSteelFraming,
        hasSlabs: workDetails.hasSlabs,
        hasWalls: workDetails.hasWalls,
        hasPrestressWorks: workDetails.hasPrestressWorks,
        hasMaterialTesting: workDetails.hasMaterialTesting,
        hasSteelTowers: workDetails.hasSteelTowers,
        hasTanks: workDetails.hasTanks,
      ) &&
      professionals.designPrcIdUpload != null &&
      professionals.designPtrDocumentUpload != null &&
      (professionals.isSupervisorSameAsDesignEngineer ||
          (professionals.supervisorPrcIdUpload != null &&
              professionals.supervisorPtrUpload != null));
  bool get isStep8Valid => reviewDeclaration.isValid;
  bool get isStep9Valid => evaluationPermitStatus.isValid;

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
  CivilStructuralPermitStatus get derivedPermitStatus {
    if (relatedBuildingPermit.status != RelatedBuildingPermitStatus.approved) {
      return CivilStructuralPermitStatus.invalidWithoutBuildingPermit;
    }
    return CivilStructuralPermitStatus.submitted;
  }
}
