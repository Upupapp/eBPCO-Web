import '../utils/validators.dart';
import 'document_model.dart';

/// Mock, frontend-only data model for the Plumbing Permit application
/// wizard. Based on the official Plumbing Permit form, and — like the
/// Architectural, Civil / Structural, Electrical, Mechanical, and
/// Sanitary / Plumbing Permits — an ancillary permit that references a
/// related Building Permit but never reads or mutates any other permit
/// provider's state, so this model is fully decoupled from every other
/// permit model. This is a DISTINCT workflow from the combined Sanitary /
/// Plumbing Permit: it has its own identifier, model, provider, routes,
/// and step widgets, and never shares state or drafts with it.

enum PermitType { plumbing }

extension PermitTypeX on PermitType {
  String get label => 'Plumbing Permit';
}

/// Duplicated (not imported) from the other permit models to keep all
/// permit models fully decoupled.
const List<String> plumbingFormsOfOwnership = [
  'Sole Proprietorship',
  'Partnership',
  'Corporation',
  'Cooperative',
  'Government',
  'Others',
];

/// Duplicated (not imported) from the other permit models.
enum PlumbingOccupancyGroup {
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

extension PlumbingOccupancyGroupX on PlumbingOccupancyGroup {
  String get label {
    switch (this) {
      case PlumbingOccupancyGroup.groupA:
        return 'Group A — Residential Dwelling';
      case PlumbingOccupancyGroup.groupB:
        return 'Group B — Residential Hotel or Apartment';
      case PlumbingOccupancyGroup.groupC:
        return 'Group C — Education and Recreation';
      case PlumbingOccupancyGroup.groupD:
        return 'Group D — Institutional';
      case PlumbingOccupancyGroup.groupE:
        return 'Group E — Business and Mercantile';
      case PlumbingOccupancyGroup.groupF:
        return 'Group F — Industrial';
      case PlumbingOccupancyGroup.groupG:
        return 'Group G — Storage and Hazardous';
      case PlumbingOccupancyGroup.groupH:
        return 'Group H — Assembly';
      case PlumbingOccupancyGroup.groupI:
        return 'Group I — Assembly with Higher Occupant Load';
      case PlumbingOccupancyGroup.groupJ:
        return 'Group J — Accessory';
      case PlumbingOccupancyGroup.others:
        return 'Others';
    }
  }
}

/// Step 1 — Applicant Information. Permit Type is fixed to "Plumbing
/// Permit" and not editable. Occupancy is collected here (not in Step 3),
/// since this permit's spec lists it once, in Step 1's field list.
class PlumbingApplicantInfo {
  final PermitType permitType = PermitType.plumbing;

  String firstName = '';
  String middleName = '';
  String lastName = '';
  String tin = '';
  String contactNumber = '';

  bool isOwnedByEnterprise = false;
  String enterpriseName = '';
  String? formOfOwnership;

  PlumbingOccupancyGroup? occupancyGroup;
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
    if (occupancyGroup == PlumbingOccupancyGroup.others &&
        Validators.required(occupancyOtherDescription) != null) {
      return false;
    }
    if (!isOwnedByEnterprise) return true;
    return Validators.required(enterpriseName) == null &&
        formOfOwnership != null;
  }
}

/// Step 2 (part 1) — Applicant Address.
class PlumbingApplicantAddress {
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
class PlumbingProjectLocation {
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
const List<String> plumbingMockBuildingPermitNumbers = [
  'BP-2026-100234',
  'BP-2026-100567',
  'BP-2026-100812',
];

/// Step 2 (part 3) — Related Building Permit. The Plumbing Permit is
/// invalid without one.
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

class PlumbingRelatedBuildingPermit {
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

/// Official scope-of-work options — identical wording to the other
/// ancillary permits' scope lists. Duplicated (not imported) to keep this
/// model fully decoupled.
enum PlumbingScopeType {
  newInstallation,
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

extension PlumbingScopeTypeX on PlumbingScopeType {
  String get label {
    switch (this) {
      case PlumbingScopeType.newInstallation:
        return 'New Installation';
      case PlumbingScopeType.erection:
        return 'Erection';
      case PlumbingScopeType.addition:
        return 'Addition';
      case PlumbingScopeType.alteration:
        return 'Alteration';
      case PlumbingScopeType.renovation:
        return 'Renovation';
      case PlumbingScopeType.conversion:
        return 'Conversion';
      case PlumbingScopeType.repair:
        return 'Repair';
      case PlumbingScopeType.moving:
        return 'Moving';
      case PlumbingScopeType.raising:
        return 'Raising';
      case PlumbingScopeType.demolition:
        return 'Demolition';
      case PlumbingScopeType.accessoryBuildingOrStructure:
        return 'Accessory Building / Structure';
      case PlumbingScopeType.others:
        return 'Others';
    }
  }
}

/// Step 3 — Scope of Plumbing Work.
class PlumbingScopeOfWork {
  final Set<PlumbingScopeType> selectedScopes = {};
  String otherScopeDescription = '';

  String workTitle = '';
  String generalDescription = '';
  String existingPlumbingCondition = '';
  String proposedPlumbingChanges = '';
  String areasAffected = '';

  bool get isValid {
    if (selectedScopes.isEmpty) return false;
    if (selectedScopes.contains(PlumbingScopeType.others) &&
        Validators.required(otherScopeDescription) != null) {
      return false;
    }
    return Validators.required(workTitle) == null &&
        Validators.required(generalDescription) == null &&
        Validators.required(existingPlumbingCondition) == null &&
        Validators.required(proposedPlumbingChanges) == null &&
        Validators.required(areasAffected) == null;
  }
}

String? _nonNegativeWholeNumber(String? value, String fieldLabel) {
  if (value == null || value.trim().isEmpty) return null;
  final parsed = int.tryParse(value.trim());
  if (parsed == null) return 'Enter a whole number.';
  if (parsed < 0) return '$fieldLabel cannot be negative.';
  return null;
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

/// Official plumbing fixture types.
enum PlumbingFixtureType {
  waterCloset,
  floorDrain,
  lavatory,
  kitchenSink,
  faucet,
  showerHead,
  waterMeter,
  greaseTrap,
  bathTub,
  slopSink,
  urinal,
  airConditioningUnitDrain,
  waterTankReservoir,
  bidet,
  laundryTray,
  dentalCuspidor,
  drinkingFountain,
  barSink,
  sodaFountainSink,
  laboratorySink,
  sterilizer,
  swimmingPool,
  others,
}

extension PlumbingFixtureTypeX on PlumbingFixtureType {
  String get label {
    switch (this) {
      case PlumbingFixtureType.waterCloset:
        return 'Water Closet';
      case PlumbingFixtureType.floorDrain:
        return 'Floor Drain';
      case PlumbingFixtureType.lavatory:
        return 'Lavatory';
      case PlumbingFixtureType.kitchenSink:
        return 'Kitchen Sink';
      case PlumbingFixtureType.faucet:
        return 'Faucet';
      case PlumbingFixtureType.showerHead:
        return 'Shower Head';
      case PlumbingFixtureType.waterMeter:
        return 'Water Meter';
      case PlumbingFixtureType.greaseTrap:
        return 'Grease Trap';
      case PlumbingFixtureType.bathTub:
        return 'Bath Tub';
      case PlumbingFixtureType.slopSink:
        return 'Slop Sink';
      case PlumbingFixtureType.urinal:
        return 'Urinal';
      case PlumbingFixtureType.airConditioningUnitDrain:
        return 'Air-Conditioning Unit Drain';
      case PlumbingFixtureType.waterTankReservoir:
        return 'Water Tank / Reservoir';
      case PlumbingFixtureType.bidet:
        return 'Bidet';
      case PlumbingFixtureType.laundryTray:
        return 'Laundry Tray';
      case PlumbingFixtureType.dentalCuspidor:
        return 'Dental Cuspidor';
      case PlumbingFixtureType.drinkingFountain:
        return 'Drinking Fountain';
      case PlumbingFixtureType.barSink:
        return 'Bar Sink';
      case PlumbingFixtureType.sodaFountainSink:
        return 'Soda Fountain Sink';
      case PlumbingFixtureType.laboratorySink:
        return 'Laboratory Sink';
      case PlumbingFixtureType.sterilizer:
        return 'Sterilizer';
      case PlumbingFixtureType.swimmingPool:
        return 'Swimming Pool';
      case PlumbingFixtureType.others:
        return 'Others';
    }
  }
}

/// One row of the fixture inventory. Total Quantity is always derived —
/// New + Existing — never a separately editable field. A structured list
/// of these (see [PlumbingFixtureInventory]) is used instead of one
/// controller per fixture per quantity kind, so updating one fixture's
/// quantity never rebuilds or erases any other fixture's entry.
class PlumbingFixtureEntry {
  final PlumbingFixtureType type;
  String customName = ''; // only used when type == others
  String newQuantity = '';
  String existingQuantity = '';
  String notes = '';

  PlumbingFixtureEntry(this.type);

  int get newQty => int.tryParse(newQuantity.trim()) ?? 0;
  int get existingQty => int.tryParse(existingQuantity.trim()) ?? 0;
  int get totalQty {
    final total = newQty + existingQty;
    return total < 0 ? 0 : total;
  }

  bool get hasQuantity => totalQty > 0;

  bool get isValid {
    if (_nonNegativeWholeNumber(newQuantity, 'New quantity') != null) {
      return false;
    }
    if (_nonNegativeWholeNumber(existingQuantity, 'Existing quantity') !=
        null) {
      return false;
    }
    if (type == PlumbingFixtureType.others &&
        hasQuantity &&
        Validators.required(customName) != null) {
      return false;
    }
    return true;
  }
}

/// Step 4 (part 1) — Fixture Inventory. One [PlumbingFixtureEntry] per
/// official fixture type, pre-populated once and never added to/removed
/// from — quantities simply default to empty (treated as zero).
class PlumbingFixtureInventory {
  final List<PlumbingFixtureEntry> fixtures = [
    for (final type in PlumbingFixtureType.values) PlumbingFixtureEntry(type),
  ];

  PlumbingFixtureEntry _entryFor(PlumbingFixtureType type) =>
      fixtures.firstWhere((f) => f.type == type);

  int quantityFor(PlumbingFixtureType type) => _entryFor(type).totalQty;
  bool hasFixture(PlumbingFixtureType type) => quantityFor(type) > 0;

  bool get hasAtLeastOneFixture => fixtures.any((f) => f.hasQuantity);

  bool get isValid =>
      hasAtLeastOneFixture && fixtures.every((f) => f.isValid);
}

/// The four official plumbing systems — at least one must be selected.
enum PlumbingSystemType {
  waterDistribution,
  sewage,
  septicTank,
  stormDrainage,
}

extension PlumbingSystemTypeX on PlumbingSystemType {
  String get label {
    switch (this) {
      case PlumbingSystemType.waterDistribution:
        return 'Water Distribution System';
      case PlumbingSystemType.sewage:
        return 'Sewage System';
      case PlumbingSystemType.septicTank:
        return 'Septic Tank';
      case PlumbingSystemType.stormDrainage:
        return 'Storm Drainage System';
    }
  }
}

enum WaterSourceType {
  cityMunicipalWater,
  shallowWell,
  deepWell,
  privateWaterSystem,
  other,
}

extension WaterSourceTypeX on WaterSourceType {
  String get label {
    switch (this) {
      case WaterSourceType.cityMunicipalWater:
        return 'City / Municipal Water';
      case WaterSourceType.shallowWell:
        return 'Shallow Well';
      case WaterSourceType.deepWell:
        return 'Deep Well';
      case WaterSourceType.privateWaterSystem:
        return 'Private Water System';
      case WaterSourceType.other:
        return 'Other';
    }
  }
}

/// Step 4 (part 2) — Water Distribution System.
class PlumbingWaterDistribution {
  WaterSourceType? waterSource;
  String otherWaterSourceDescription = '';
  String waterServiceProvider = ''; // optional, "when applicable"
  String mainPipeMaterial = '';
  String mainPipeDiameter = '';
  String waterMeterSize = '';
  String storageTankCapacity = ''; // optional, "when applicable"
  String pumpCapacity = ''; // optional, "when applicable"
  String distributionSystemDescription = '';
  String estimatedDemandOrFlowRate = '';

  bool get isValid {
    if (waterSource == null) return false;
    if (waterSource == WaterSourceType.other &&
        Validators.required(otherWaterSourceDescription) != null) {
      return false;
    }
    if (Validators.required(mainPipeMaterial) != null) return false;
    if (_positiveDecimal(mainPipeDiameter, 'Main pipe diameter') != null) {
      return false;
    }
    if (Validators.required(waterMeterSize) != null) return false;
    if (Validators.required(distributionSystemDescription) != null) {
      return false;
    }
    if (_positiveDecimal(
          estimatedDemandOrFlowRate,
          'Estimated demand or flow rate',
        ) !=
        null) {
      return false;
    }
    return true;
  }
}

enum SewageDisposalMethod {
  publicSanitarySewer,
  privateSewerSystem,
  septicTank,
  treatmentFacility,
  other,
}

extension SewageDisposalMethodX on SewageDisposalMethod {
  String get label {
    switch (this) {
      case SewageDisposalMethod.publicSanitarySewer:
        return 'Public Sanitary Sewer';
      case SewageDisposalMethod.privateSewerSystem:
        return 'Private Sewer System';
      case SewageDisposalMethod.septicTank:
        return 'Septic Tank';
      case SewageDisposalMethod.treatmentFacility:
        return 'Treatment Facility';
      case SewageDisposalMethod.other:
        return 'Other';
    }
  }
}

/// Step 4 (part 3) — Sewage System.
class PlumbingSewageSystem {
  SewageDisposalMethod? disposalMethod;
  String otherDisposalMethodDescription = '';
  String receivingSewerOrDisposalPoint = '';
  String mainSewerPipeMaterial = '';
  String mainSewerPipeDiameter = '';
  String connectionReference = ''; // optional, "when available"
  String sewageSystemDescription = '';
  String estimatedWastewaterFlow = '';

  bool get isValid {
    if (disposalMethod == null) return false;
    if (disposalMethod == SewageDisposalMethod.other &&
        Validators.required(otherDisposalMethodDescription) != null) {
      return false;
    }
    if (Validators.required(receivingSewerOrDisposalPoint) != null) {
      return false;
    }
    if (Validators.required(mainSewerPipeMaterial) != null) return false;
    if (_positiveDecimal(mainSewerPipeDiameter, 'Main sewer pipe diameter') !=
        null) {
      return false;
    }
    if (Validators.required(sewageSystemDescription) != null) return false;
    if (_positiveDecimal(
          estimatedWastewaterFlow,
          'Estimated wastewater flow',
        ) !=
        null) {
      return false;
    }
    return true;
  }
}

/// Step 4 (part 4) — Septic Tank.
class PlumbingSepticTank {
  String tankType = '';
  String tankCapacity = '';
  String numberOfChambers = '';
  String tankDimensions = '';
  String tankMaterial = '';
  String effluentDisposalMethod = '';
  String locationDescription = '';
  String accessAndMaintenanceDescription = '';

  bool get isValid {
    if (Validators.required(tankType) != null) return false;
    if (_positiveDecimal(tankCapacity, 'Tank capacity') != null) return false;
    if (Validators.positiveWholeNumber(
          numberOfChambers,
          fieldLabel: 'Number of chambers',
        ) !=
        null) {
      return false;
    }
    if (Validators.required(tankDimensions) != null) return false;
    if (Validators.required(tankMaterial) != null) return false;
    if (Validators.required(effluentDisposalMethod) != null) return false;
    if (Validators.required(locationDescription) != null) return false;
    if (Validators.required(accessAndMaintenanceDescription) != null) {
      return false;
    }
    return true;
  }
}

enum StormDrainageType {
  publicStormDrain,
  streetCanal,
  waterCourse,
  onsiteDrainage,
  detentionOrRetentionSystem,
  other,
}

extension StormDrainageTypeX on StormDrainageType {
  String get label {
    switch (this) {
      case StormDrainageType.publicStormDrain:
        return 'Public Storm Drain';
      case StormDrainageType.streetCanal:
        return 'Street Canal';
      case StormDrainageType.waterCourse:
        return 'Water Course';
      case StormDrainageType.onsiteDrainage:
        return 'Onsite Drainage';
      case StormDrainageType.detentionOrRetentionSystem:
        return 'Detention or Retention System';
      case StormDrainageType.other:
        return 'Other';
    }
  }
}

/// Step 4 (part 5) — Storm Drainage System.
class PlumbingStormDrainage {
  StormDrainageType? drainageType;
  String otherDrainageTypeDescription = '';
  String dischargePoint = '';
  String mainDrainPipeMaterial = '';
  String mainDrainPipeDiameter = '';
  String catchBasinCount = '';
  String roofDrainCount = '';
  String drainageSystemDescription = '';
  String applicableClearanceStatus = '';

  bool get isValid {
    if (drainageType == null) return false;
    if (drainageType == StormDrainageType.other &&
        Validators.required(otherDrainageTypeDescription) != null) {
      return false;
    }
    if (Validators.required(dischargePoint) != null) return false;
    if (Validators.required(mainDrainPipeMaterial) != null) return false;
    if (_positiveDecimal(mainDrainPipeDiameter, 'Main drain pipe diameter') !=
        null) {
      return false;
    }
    if (_nonNegativeWholeNumber(catchBasinCount, 'Catch basin count') !=
        null) {
      return false;
    }
    if (_nonNegativeWholeNumber(roofDrainCount, 'Roof drain count') != null) {
      return false;
    }
    if (Validators.required(drainageSystemDescription) != null) return false;
    if (Validators.required(applicableClearanceStatus) != null) return false;
    return true;
  }
}

/// Step 4 — Plumbing Installation Details: bundles the fixture inventory
/// and the four conditional plumbing-system detail groups into one step,
/// matching the official form's own layout. At least one system must be
/// selected.
class PlumbingInstallationDetails {
  final Set<PlumbingSystemType> selectedSystems = {};

  final PlumbingFixtureInventory fixtureInventory = PlumbingFixtureInventory();
  final PlumbingWaterDistribution waterDistribution = PlumbingWaterDistribution();
  final PlumbingSewageSystem sewageSystem = PlumbingSewageSystem();
  final PlumbingSepticTank septicTank = PlumbingSepticTank();
  final PlumbingStormDrainage stormDrainage = PlumbingStormDrainage();

  bool get hasWaterDistribution =>
      selectedSystems.contains(PlumbingSystemType.waterDistribution);
  bool get hasSewage => selectedSystems.contains(PlumbingSystemType.sewage);
  bool get hasSepticTank =>
      selectedSystems.contains(PlumbingSystemType.septicTank);
  bool get hasStormDrainage =>
      selectedSystems.contains(PlumbingSystemType.stormDrainage);

  bool get isValid {
    if (!fixtureInventory.isValid) return false;
    if (selectedSystems.isEmpty) return false;
    if (hasWaterDistribution && !waterDistribution.isValid) return false;
    if (hasSewage && !sewageSystem.isValid) return false;
    if (hasSepticTank && !septicTank.isValid) return false;
    if (hasStormDrainage && !stormDrainage.isValid) return false;
    return true;
  }
}

/// Shared license/contact shape for both the Design Master Plumber and the
/// Supervisor — kept internal to this model only, so it introduces no
/// coupling with any other permit. Profession is always "Master Plumber"
/// for both roles — this permit recognizes only one profession, unlike
/// the Sanitary / Plumbing Permit's Sanitary-Engineer-or-Master-Plumber
/// choice.
class PlumbingProfessionalInfo {
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

/// Step 5 — Plumbing Professionals. When the Supervisor is the same
/// person as the Design Master Plumber, the supervisor's own fields/
/// uploads are never populated — Step 7's document checklist reads the
/// Design Master Plumber's uploads for both roles in that case. The
/// Signed Plumbing Calculations upload is optional ("when applicable").
class PlumbingProfessionals {
  final PlumbingProfessionalInfo designMasterPlumber = PlumbingProfessionalInfo();
  DocumentModel? designPrcIdUpload;
  DocumentModel? designPtrDocumentUpload;
  DocumentModel? signedSealedPlansUpload;
  DocumentModel? signedSealedSpecificationsUpload;
  DocumentModel? signedPlumbingCalculationsUpload; // optional, "when applicable"

  bool isSupervisorSameAsDesignMasterPlumber = true;
  final PlumbingProfessionalInfo supervisor = PlumbingProfessionalInfo();
  DocumentModel? supervisorPrcIdUpload;
  DocumentModel? supervisorPtrUpload;
  DocumentModel? signedSupervisorConfirmationUpload;

  bool get isValid {
    final designValid =
        designMasterPlumber.isValid &&
        designPrcIdUpload != null &&
        designPtrDocumentUpload != null &&
        signedSealedPlansUpload != null &&
        signedSealedSpecificationsUpload != null;
    if (!designValid) return false;
    if (isSupervisorSameAsDesignMasterPlumber) return true;
    return supervisor.isValid &&
        supervisorPrcIdUpload != null &&
        supervisorPtrUpload != null &&
        signedSupervisorConfirmationUpload != null;
  }
}

/// Shared owner-identity shape for both the Building Owner and the Lot
/// Owner in Step 6 — internal to this model only.
class PlumbingOwnerInfo {
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
class PlumbingOwnershipConsent {
  bool? isApplicantBuildingOwner;
  final PlumbingOwnerInfo buildingOwner = PlumbingOwnerInfo();

  bool? isBuildingOwnerAlsoLotOwner;
  final PlumbingOwnerInfo lotOwner = PlumbingOwnerInfo();

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

/// Step 7 — Required Plumbing Documents. Professional documents already
/// collected in Step 5 (PRC IDs, PTRs, signed and sealed plans/
/// specifications/calculations) are intentionally NOT duplicated here —
/// the UI reads/writes [PlumbingProfessionals]'s fields directly.
class PlumbingRequiredDocuments {
  // Core Plumbing Documents.
  DocumentModel? plumbingPlansUpload;
  DocumentModel? plumbingSpecificationsUpload;
  DocumentModel? waterDistributionLayoutUpload;
  DocumentModel? sewageLayoutCoreUpload;
  DocumentModel? stormDrainageLayoutUpload; // optional, "when applicable"
  DocumentModel? plumbingRiserDiagramUpload;
  DocumentModel? isometricDiagramUpload;
  DocumentModel? fixtureScheduleUpload;
  DocumentModel? generalNotesUpload;
  DocumentModel? plumbingCalculationsUpload; // optional, "when applicable"

  // Cost and Material Documents.
  DocumentModel? billOfMaterialsUpload;
  DocumentModel? costEstimateUpload;
  DocumentModel? quantityTakeoffUpload; // optional, "when applicable"
  DocumentModel? pipeAndMaterialSpecificationsUpload;
  DocumentModel? fixtureEquipmentSpecificationsUpload;

  // Water Distribution Documents — conditionally required.
  DocumentModel? waterDistributionPlanUpload;
  DocumentModel? waterDemandCalculationUpload;
  DocumentModel? pipeSizingCalculationUpload;
  DocumentModel? waterMeterDetailsUpload;
  DocumentModel? pumpDetailsUpload; // optional, "when applicable"
  DocumentModel? waterStorageDetailsUpload; // optional, "when applicable"
  DocumentModel? providerCoordinationUpload; // optional, "when available"

  // Sewage Documents — conditionally required.
  DocumentModel? sewageLayoutUpload;
  DocumentModel? wastewaterFlowCalculationUpload;
  DocumentModel? sewerPipeSizingCalculationUpload;
  DocumentModel? sewerConnectionDetailsUpload;
  DocumentModel? receivingSystemCoordinationUpload; // optional, "when applicable"

  // Septic Tank Documents — conditionally required.
  DocumentModel? septicTankPlanUpload;
  DocumentModel? septicTankDetailsUpload;
  DocumentModel? septicCapacityCalculationUpload;
  DocumentModel? septicEffluentDisposalPlanUpload;
  DocumentModel? septicMaintenanceAccessDetailsUpload;

  // Storm Drainage Documents — conditionally required.
  DocumentModel? stormDrainagePlanUpload;
  DocumentModel? drainageCalculationUpload;
  DocumentModel? roofDrainDownspoutLayoutUpload;
  DocumentModel? catchBasinDetailsUpload;
  DocumentModel? stormDischargeDetailsUpload;
  DocumentModel? stormClearanceCoordinationUpload;

  // Fixture-Specific Documents — conditionally required based on Step 4's
  // fixture quantities.
  DocumentModel? swimmingPoolPlumbingPlanUpload;
  DocumentModel? greaseTrapDetailsUpload;
  DocumentModel? waterTankReservoirDetailsUpload;
  DocumentModel? laboratoryPlumbingDetailsUpload;
  DocumentModel? dentalPlumbingDetailsUpload;
  DocumentModel? specializedFixtureDetailsUpload;

  // Supporting Documents.
  DocumentModel? relatedBuildingPermitUpload;
  DocumentModel? existingPlumbingPermitUpload; // optional, "when applicable"
  DocumentModel? waterProviderCoordinationUpload;
  DocumentModel? sewerProviderCoordinationUpload;
  DocumentModel? siteOrUtilityPlanUpload;
  DocumentModel? otherPlumbingDocumentsUpload; // optional

  bool isValid({
    required bool hasWaterDistribution,
    required bool hasSewage,
    required bool hasSepticTank,
    required bool hasStormDrainage,
    required bool hasSwimmingPool,
    required bool hasGreaseTrap,
    required bool hasWaterTank,
    required bool hasLaboratorySink,
    required bool hasDentalCuspidor,
    required bool hasOthersFixture,
  }) {
    final baseValid =
        plumbingPlansUpload != null &&
        plumbingSpecificationsUpload != null &&
        waterDistributionLayoutUpload != null &&
        sewageLayoutCoreUpload != null &&
        plumbingRiserDiagramUpload != null &&
        isometricDiagramUpload != null &&
        fixtureScheduleUpload != null &&
        generalNotesUpload != null &&
        billOfMaterialsUpload != null &&
        costEstimateUpload != null &&
        pipeAndMaterialSpecificationsUpload != null &&
        fixtureEquipmentSpecificationsUpload != null &&
        relatedBuildingPermitUpload != null;
    if (!baseValid) return false;

    if (hasWaterDistribution &&
        (waterDistributionPlanUpload == null ||
            waterDemandCalculationUpload == null ||
            pipeSizingCalculationUpload == null ||
            waterMeterDetailsUpload == null)) {
      return false;
    }
    if (hasSewage &&
        (sewageLayoutUpload == null ||
            wastewaterFlowCalculationUpload == null ||
            sewerPipeSizingCalculationUpload == null ||
            sewerConnectionDetailsUpload == null)) {
      return false;
    }
    if (hasSepticTank &&
        (septicTankPlanUpload == null ||
            septicCapacityCalculationUpload == null)) {
      return false;
    }
    if (hasStormDrainage &&
        (stormDrainagePlanUpload == null || drainageCalculationUpload == null)) {
      return false;
    }

    if (hasSwimmingPool && swimmingPoolPlumbingPlanUpload == null) {
      return false;
    }
    if (hasGreaseTrap && greaseTrapDetailsUpload == null) return false;
    if (hasWaterTank && waterTankReservoirDetailsUpload == null) return false;
    if (hasLaboratorySink && laboratoryPlumbingDetailsUpload == null) {
      return false;
    }
    if (hasDentalCuspidor && dentalPlumbingDetailsUpload == null) {
      return false;
    }
    if (hasOthersFixture && specializedFixtureDetailsUpload == null) {
      return false;
    }

    return true;
  }
}

/// Step 8 — Review & Declaration: the eight certifications required
/// before the plumbing application can be submitted.
class PlumbingReviewDeclaration {
  bool certifiesTrueAndCorrect = false;
  bool confirmsPlansPreparedByLicensedMasterPlumber = false;
  bool understandsMustFollowApprovedPlansAndCodes = false;
  bool understandsRequiresLicensedMasterPlumberSupervisor = false;
  bool understandsNoticeOfConstructionMayBeRequired = false;
  bool understandsCompletionDocumentsMayBeRequired = false;
  bool understandsRequiresValidBuildingPermit = false;
  bool agreesToTerms = false;

  bool get isValid =>
      certifiesTrueAndCorrect &&
      confirmsPlansPreparedByLicensedMasterPlumber &&
      understandsMustFollowApprovedPlansAndCodes &&
      understandsRequiresLicensedMasterPlumberSupervisor &&
      understandsNoticeOfConstructionMayBeRequired &&
      understandsCompletionDocumentsMayBeRequired &&
      understandsRequiresValidBuildingPermit &&
      agreesToTerms;
}

/// Per-document-group evaluation status shown in Step 9's read-only
/// "Document Evaluation" summary.
enum PlumbingDocumentEvaluationStatus {
  pendingReview,
  accepted,
  revisionRequired,
  missing,
  notApplicable,
}

extension PlumbingDocumentEvaluationStatusX on PlumbingDocumentEvaluationStatus {
  String get label {
    switch (this) {
      case PlumbingDocumentEvaluationStatus.pendingReview:
        return 'Pending Review';
      case PlumbingDocumentEvaluationStatus.accepted:
        return 'Accepted';
      case PlumbingDocumentEvaluationStatus.revisionRequired:
        return 'Revision Required';
      case PlumbingDocumentEvaluationStatus.missing:
        return 'Missing';
      case PlumbingDocumentEvaluationStatus.notApplicable:
        return 'Not Applicable';
    }
  }
}

/// Frontend-only permit status values the applicant can observe but never
/// set. [invalidWithoutBuildingPermit] is never chosen directly — it is
/// always derived (see [PlumbingPermitDraft.derivedPermitStatus]).
enum PlumbingPermitStatus {
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

extension PlumbingPermitStatusX on PlumbingPermitStatus {
  String get label {
    switch (this) {
      case PlumbingPermitStatus.submitted:
        return 'Submitted';
      case PlumbingPermitStatus.underEvaluation:
        return 'Under Evaluation';
      case PlumbingPermitStatus.revisionRequired:
        return 'Revision Required';
      case PlumbingPermitStatus.additionalDocumentsRequired:
        return 'Additional Documents Required';
      case PlumbingPermitStatus.forApproval:
        return 'For Approval';
      case PlumbingPermitStatus.approved:
        return 'Approved';
      case PlumbingPermitStatus.rejected:
        return 'Rejected';
      case PlumbingPermitStatus.invalidWithoutBuildingPermit:
        return 'Invalid Without Building Permit';
      case PlumbingPermitStatus.completed:
        return 'Completed';
    }
  }
}

/// Step 9 — Evaluation & Permit Status. Every field here is
/// office-controlled — there is no applicant-editable state in this class
/// at all, only fixed "pending" defaults. This step therefore has no
/// blocking validity condition; Continue always submits for evaluation.
class PlumbingEvaluationPermitStatus {
  static const Map<String, PlumbingDocumentEvaluationStatus>
  documentEvaluation = {
    'Plumbing Plans and Specifications':
        PlumbingDocumentEvaluationStatus.pendingReview,
    'Bill of Materials': PlumbingDocumentEvaluationStatus.pendingReview,
    'Cost Estimate': PlumbingDocumentEvaluationStatus.pendingReview,
    'Water Distribution Documents':
        PlumbingDocumentEvaluationStatus.pendingReview,
    'Sewage Documents': PlumbingDocumentEvaluationStatus.pendingReview,
    'Specialized Fixture Documents':
        PlumbingDocumentEvaluationStatus.pendingReview,
    'Other Submitted Documents': PlumbingDocumentEvaluationStatus.pendingReview,
  };

  static const List<String> progressStages = [
    'Receiving and Recording',
    'Plumbing Documents Received',
    'Plumbing Plan Review',
    'Fixture Review',
    'Water Distribution Review',
    'Sewage and Drainage Review',
    'Technical Evaluation',
    'Building Official Decision',
  ];

  static const String actionTaken = 'Pending Assessment';
  static const String permitIssuedBy = 'Pending Assessment';

  static const List<String> permitConditions = [
    'Plumbing work must follow approved plumbing plans and applicable codes.',
    'A Notice of Construction must be submitted when required before work begins.',
    'A licensed Master Plumber must supervise or take charge of the plumbing work.',
    'Required logbook entries, as-built plans, and completion documents must be submitted.',
    'The Plumbing Permit is invalid without the related Building Permit.',
  ];

  bool get isValid => true;
}

enum PlumbingPermitDraftStatus { draft, submitted }

/// The full mutable draft for one Plumbing Permit application session.
class PlumbingPermitDraft {
  final PlumbingApplicantInfo applicant = PlumbingApplicantInfo();
  final PlumbingApplicantAddress applicantAddress = PlumbingApplicantAddress();
  final PlumbingProjectLocation projectLocation = PlumbingProjectLocation();
  final PlumbingRelatedBuildingPermit relatedBuildingPermit =
      PlumbingRelatedBuildingPermit();
  final PlumbingScopeOfWork scopeOfWork = PlumbingScopeOfWork();
  final PlumbingInstallationDetails installationDetails =
      PlumbingInstallationDetails();
  final PlumbingProfessionals professionals = PlumbingProfessionals();
  final PlumbingOwnershipConsent ownershipConsent = PlumbingOwnershipConsent();
  final PlumbingRequiredDocuments requiredDocuments =
      PlumbingRequiredDocuments();
  final PlumbingReviewDeclaration reviewDeclaration =
      PlumbingReviewDeclaration();
  final PlumbingEvaluationPermitStatus evaluationPermitStatus =
      PlumbingEvaluationPermitStatus();

  bool useApplicantAddressForProjectLocation = false;
  PlumbingPermitDraftStatus status = PlumbingPermitDraftStatus.draft;
  DateTime? lastSavedAt;

  bool get isStep1Valid => applicant.isValid;
  bool get isStep2Valid =>
      applicantAddress.isValid &&
      projectLocation.isValid &&
      relatedBuildingPermit.isValid;
  bool get isStep3Valid => scopeOfWork.isValid;
  bool get isStep4Valid => installationDetails.isValid;
  bool get isStep5Valid => professionals.isValid;
  bool get isStep6Valid => ownershipConsent.isValid;
  bool get isStep7Valid =>
      requiredDocuments.isValid(
        hasWaterDistribution: installationDetails.hasWaterDistribution,
        hasSewage: installationDetails.hasSewage,
        hasSepticTank: installationDetails.hasSepticTank,
        hasStormDrainage: installationDetails.hasStormDrainage,
        hasSwimmingPool: installationDetails.fixtureInventory.hasFixture(
          PlumbingFixtureType.swimmingPool,
        ),
        hasGreaseTrap: installationDetails.fixtureInventory.hasFixture(
          PlumbingFixtureType.greaseTrap,
        ),
        hasWaterTank: installationDetails.fixtureInventory.hasFixture(
          PlumbingFixtureType.waterTankReservoir,
        ),
        hasLaboratorySink: installationDetails.fixtureInventory.hasFixture(
          PlumbingFixtureType.laboratorySink,
        ),
        hasDentalCuspidor: installationDetails.fixtureInventory.hasFixture(
          PlumbingFixtureType.dentalCuspidor,
        ),
        hasOthersFixture: installationDetails.fixtureInventory.hasFixture(
          PlumbingFixtureType.others,
        ),
      ) &&
      professionals.designPrcIdUpload != null &&
      professionals.designPtrDocumentUpload != null &&
      (professionals.isSupervisorSameAsDesignMasterPlumber ||
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
  PlumbingPermitStatus get derivedPermitStatus {
    if (!relatedBuildingPermit.hasValidBuildingPermitReference) {
      return PlumbingPermitStatus.invalidWithoutBuildingPermit;
    }
    return PlumbingPermitStatus.submitted;
  }
}
