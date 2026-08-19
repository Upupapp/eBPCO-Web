import '../utils/validators.dart';
import 'document_model.dart';

/// Mock, frontend-only data model for the Sanitary / Plumbing Permit
/// application wizard. Based on the official Sanitary / Plumbing Permit
/// form, and — like the Architectural, Civil / Structural, Electrical, and
/// Mechanical Permits — an ancillary permit that references a related
/// Building Permit but never reads or mutates any other permit provider's
/// state, so this model is fully decoupled from every other permit model.

enum PermitType { sanitaryPlumbing }

extension PermitTypeX on PermitType {
  String get label => 'Sanitary / Plumbing Permit';
}

/// Duplicated (not imported) from the other permit models to keep all
/// permit models fully decoupled.
const List<String> sanitaryFormsOfOwnership = [
  'Sole Proprietorship',
  'Partnership',
  'Corporation',
  'Cooperative',
  'Government',
  'Others',
];

/// Step 1 — Applicant Information. Permit Type is fixed to "Sanitary /
/// Plumbing Permit" and not editable. Unlike Mechanical's Step 1, this
/// step does not collect occupancy — that lives once, in Step 3's "Use or
/// Type of Occupancy" section, per this permit's own spec.
class SanitaryApplicantInfo {
  final PermitType permitType = PermitType.sanitaryPlumbing;

  String firstName = '';
  String middleName = '';
  String lastName = '';
  String tin = '';
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
class SanitaryApplicantAddress {
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
class SanitaryProjectLocation {
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
const List<String> sanitaryMockBuildingPermitNumbers = [
  'BP-2026-100234',
  'BP-2026-100567',
  'BP-2026-100812',
];

/// Step 2 (part 3) — Related Building Permit. The Sanitary / Plumbing
/// Permit is invalid without one.
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

class SanitaryRelatedBuildingPermit {
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
/// ancillary permits' scope lists.
enum SanitaryScopeType {
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

extension SanitaryScopeTypeX on SanitaryScopeType {
  String get label {
    switch (this) {
      case SanitaryScopeType.newInstallation:
        return 'New Installation';
      case SanitaryScopeType.erection:
        return 'Erection';
      case SanitaryScopeType.addition:
        return 'Addition';
      case SanitaryScopeType.alteration:
        return 'Alteration';
      case SanitaryScopeType.renovation:
        return 'Renovation';
      case SanitaryScopeType.conversion:
        return 'Conversion';
      case SanitaryScopeType.repair:
        return 'Repair';
      case SanitaryScopeType.moving:
        return 'Moving';
      case SanitaryScopeType.raising:
        return 'Raising';
      case SanitaryScopeType.demolition:
        return 'Demolition';
      case SanitaryScopeType.accessoryBuildingOrStructure:
        return 'Accessory Building / Structure';
      case SanitaryScopeType.others:
        return 'Others';
    }
  }
}

/// Official use/type-of-occupancy options.
enum SanitaryOccupancyType {
  residential,
  commercial,
  industrial,
  institutional,
  agricultural,
  parksPlazasAndMonuments,
  recreational,
  others,
}

extension SanitaryOccupancyTypeX on SanitaryOccupancyType {
  String get label {
    switch (this) {
      case SanitaryOccupancyType.residential:
        return 'Residential';
      case SanitaryOccupancyType.commercial:
        return 'Commercial';
      case SanitaryOccupancyType.industrial:
        return 'Industrial';
      case SanitaryOccupancyType.institutional:
        return 'Institutional';
      case SanitaryOccupancyType.agricultural:
        return 'Agricultural';
      case SanitaryOccupancyType.parksPlazasAndMonuments:
        return 'Parks, Plazas and Monuments';
      case SanitaryOccupancyType.recreational:
        return 'Recreational';
      case SanitaryOccupancyType.others:
        return 'Others';
    }
  }
}

/// Step 3 — Scope of Work & Use/Type of Occupancy. Both selections use the
/// same selectable-chip-card format already established by every other
/// permit's Scope of Work section (see [SanitaryScopeType]/
/// [SanitaryOccupancyType] chip Wraps in the step widget).
class SanitaryScopeOccupancy {
  final Set<SanitaryScopeType> selectedScopes = {};
  String otherScopeDescription = '';

  String workTitle = '';
  String generalDescription = '';
  String existingSystemCondition = '';
  String proposedChanges = '';
  String areasAffected = '';

  SanitaryOccupancyType? occupancyType;
  String occupancyOtherDescription = '';

  bool get isValid {
    if (selectedScopes.isEmpty) return false;
    if (selectedScopes.contains(SanitaryScopeType.others) &&
        Validators.required(otherScopeDescription) != null) {
      return false;
    }
    if (Validators.required(workTitle) != null) return false;
    if (Validators.required(generalDescription) != null) return false;
    if (Validators.required(existingSystemCondition) != null) return false;
    if (Validators.required(proposedChanges) != null) return false;
    if (Validators.required(areasAffected) != null) return false;
    if (occupancyType == null) return false;
    if (occupancyType == SanitaryOccupancyType.others &&
        Validators.required(occupancyOtherDescription) != null) {
      return false;
    }
    return true;
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

String? _nonNegativeDecimal(String? value, String fieldLabel) {
  if (value == null || value.trim().isEmpty) {
    return '$fieldLabel is required.';
  }
  final parsed = double.tryParse(value.trim());
  if (parsed == null) return 'Enter a valid number.';
  if (parsed < 0) return '$fieldLabel cannot be negative.';
  return null;
}

/// Official plumbing/sanitary fixture types.
enum SanitaryFixtureType {
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

extension SanitaryFixtureTypeX on SanitaryFixtureType {
  String get label {
    switch (this) {
      case SanitaryFixtureType.waterCloset:
        return 'Water Closet';
      case SanitaryFixtureType.floorDrain:
        return 'Floor Drain';
      case SanitaryFixtureType.lavatory:
        return 'Lavatory';
      case SanitaryFixtureType.kitchenSink:
        return 'Kitchen Sink';
      case SanitaryFixtureType.faucet:
        return 'Faucet';
      case SanitaryFixtureType.showerHead:
        return 'Shower Head';
      case SanitaryFixtureType.waterMeter:
        return 'Water Meter';
      case SanitaryFixtureType.greaseTrap:
        return 'Grease Trap';
      case SanitaryFixtureType.bathTub:
        return 'Bath Tub';
      case SanitaryFixtureType.slopSink:
        return 'Slop Sink';
      case SanitaryFixtureType.urinal:
        return 'Urinal';
      case SanitaryFixtureType.airConditioningUnitDrain:
        return 'Air-Conditioning Unit Drain';
      case SanitaryFixtureType.waterTankReservoir:
        return 'Water Tank / Reservoir';
      case SanitaryFixtureType.bidet:
        return 'Bidet';
      case SanitaryFixtureType.laundryTray:
        return 'Laundry Tray';
      case SanitaryFixtureType.dentalCuspidor:
        return 'Dental Cuspidor';
      case SanitaryFixtureType.drinkingFountain:
        return 'Drinking Fountain';
      case SanitaryFixtureType.barSink:
        return 'Bar Sink';
      case SanitaryFixtureType.sodaFountainSink:
        return 'Soda Fountain Sink';
      case SanitaryFixtureType.laboratorySink:
        return 'Laboratory Sink';
      case SanitaryFixtureType.sterilizer:
        return 'Sterilizer';
      case SanitaryFixtureType.swimmingPool:
        return 'Swimming Pool';
      case SanitaryFixtureType.others:
        return 'Others';
    }
  }
}

/// One row of the fixture inventory. Total Quantity is always derived —
/// New + Existing — never a separately editable field, matching the
/// spec's preferred calculation behavior. A structured list of these (see
/// [SanitaryFixtureInventory]) is used instead of one controller per
/// fixture per quantity kind, so updating one fixture's quantity never
/// rebuilds or erases any other fixture's entry.
class SanitaryFixtureEntry {
  final SanitaryFixtureType type;
  String customName = ''; // only used when type == others
  String newQuantity = '';
  String existingQuantity = '';
  String notes = '';

  SanitaryFixtureEntry(this.type);

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
    if (type == SanitaryFixtureType.others &&
        hasQuantity &&
        Validators.required(customName) != null) {
      return false;
    }
    return true;
  }
}

/// Step 4 (part 1) — Fixture Inventory. One [SanitaryFixtureEntry] per
/// official fixture type, pre-populated once and never added to/removed
/// from — quantities simply default to empty (treated as zero).
class SanitaryFixtureInventory {
  final List<SanitaryFixtureEntry> fixtures = [
    for (final type in SanitaryFixtureType.values) SanitaryFixtureEntry(type),
  ];

  SanitaryFixtureEntry _entryFor(SanitaryFixtureType type) =>
      fixtures.firstWhere((f) => f.type == type);

  int quantityFor(SanitaryFixtureType type) => _entryFor(type).totalQty;
  bool hasFixture(SanitaryFixtureType type) => quantityFor(type) > 0;

  bool get hasAtLeastOneFixture => fixtures.any((f) => f.hasQuantity);

  bool get isValid =>
      hasAtLeastOneFixture && fixtures.every((f) => f.isValid);
}

/// Official water-supply system options.
enum WaterSupplyType {
  shallowWell,
  deepWellAndPumpSet,
  cityMunicipalWaterSystem,
  others,
}

extension WaterSupplyTypeX on WaterSupplyType {
  String get label {
    switch (this) {
      case WaterSupplyType.shallowWell:
        return 'Shallow Well';
      case WaterSupplyType.deepWellAndPumpSet:
        return 'Deep Well and Pump Set';
      case WaterSupplyType.cityMunicipalWaterSystem:
        return 'City / Municipal Water System';
      case WaterSupplyType.others:
        return 'Others';
    }
  }
}

/// Step 4 (part 2) — Water Supply. One or more systems may be selected;
/// each selected system reveals its own conditional field group.
class SanitaryWaterSupply {
  final Set<WaterSupplyType> selectedTypes = {};

  // Shallow Well.
  String shallowWellDepth = '';
  String shallowWellEstimatedYield = '';
  String shallowWellPumpType = '';
  String shallowWellTreatmentMethod = ''; // optional, "when applicable"

  // Deep Well and Pump Set.
  String deepWellDepth = '';
  String deepWellPumpCapacity = '';
  String deepWellPumpRating = '';
  String deepWellEstimatedYield = '';
  String deepWellTreatmentMethod = '';

  // City / Municipal Water System.
  String cityWaterServiceProvider = '';
  String cityWaterServiceConnectionNumber = ''; // optional, "when available"
  String cityWaterMeterSize = '';

  // Others.
  String otherWaterSupplyDescription = '';

  bool get hasShallowWell =>
      selectedTypes.contains(WaterSupplyType.shallowWell);
  bool get hasDeepWell =>
      selectedTypes.contains(WaterSupplyType.deepWellAndPumpSet);
  bool get hasCityWater =>
      selectedTypes.contains(WaterSupplyType.cityMunicipalWaterSystem);
  bool get hasOthers => selectedTypes.contains(WaterSupplyType.others);

  bool get isValid {
    if (selectedTypes.isEmpty) return false;

    if (hasShallowWell) {
      if (_positiveDecimal(shallowWellDepth, 'Well Depth') != null) {
        return false;
      }
      if (_positiveDecimal(shallowWellEstimatedYield, 'Estimated Yield') !=
          null) {
        return false;
      }
      if (Validators.required(shallowWellPumpType) != null) return false;
    }

    if (hasDeepWell) {
      if (_positiveDecimal(deepWellDepth, 'Well Depth') != null) {
        return false;
      }
      if (_positiveDecimal(deepWellPumpCapacity, 'Pump Capacity') != null) {
        return false;
      }
      if (Validators.required(deepWellPumpRating) != null) return false;
      if (_positiveDecimal(deepWellEstimatedYield, 'Estimated Yield') !=
          null) {
        return false;
      }
      if (Validators.required(deepWellTreatmentMethod) != null) {
        return false;
      }
    }

    if (hasCityWater) {
      if (Validators.required(cityWaterServiceProvider) != null) {
        return false;
      }
      if (Validators.required(cityWaterMeterSize) != null) return false;
    }

    if (hasOthers &&
        Validators.required(otherWaterSupplyDescription) != null) {
      return false;
    }

    return true;
  }
}

/// Official wastewater/disposal system options. Surface Drainage, Street
/// Canal, and Water Course share one official field group (see
/// [SanitaryWastewaterDisposal.hasSurfaceDrainageGroup]).
enum DisposalSystemType {
  wastewaterTreatmentPlant,
  imhoffTank,
  sanitarySewerConnection,
  subsurfaceSandFilter,
  surfaceDrainage,
  streetCanal,
  waterCourse,
  others,
}

extension DisposalSystemTypeX on DisposalSystemType {
  String get label {
    switch (this) {
      case DisposalSystemType.wastewaterTreatmentPlant:
        return 'Wastewater Treatment Plant';
      case DisposalSystemType.imhoffTank:
        return 'Imhoff Tank';
      case DisposalSystemType.sanitarySewerConnection:
        return 'Sanitary Sewer Connection';
      case DisposalSystemType.subsurfaceSandFilter:
        return 'Subsurface Sand Filter';
      case DisposalSystemType.surfaceDrainage:
        return 'Surface Drainage';
      case DisposalSystemType.streetCanal:
        return 'Street Canal';
      case DisposalSystemType.waterCourse:
        return 'Water Course';
      case DisposalSystemType.others:
        return 'Others';
    }
  }
}

/// Step 4 (part 3) — Wastewater and Disposal System.
class SanitaryWastewaterDisposal {
  final Set<DisposalSystemType> selectedTypes = {};

  // Wastewater Treatment Plant.
  String wtpTreatmentType = '';
  String wtpTreatmentCapacity = '';
  String wtpDischargePoint = '';
  String wtpOperatorOrResponsibleParty = '';

  // Imhoff Tank.
  String imhoffTankCapacity = '';
  String imhoffTankDimensions = '';
  String imhoffEffluentDestination = '';

  // Sanitary Sewer Connection.
  String sewerProviderOrReceivingSystem = '';
  String sewerConnectionReference = ''; // optional, "when available"
  String sewerConnectionPoint = '';

  // Subsurface Sand Filter.
  String sandFilterArea = '';
  String sandFilterDescription = '';
  String sandFilterEffluentDestination = '';

  // Surface Drainage / Street Canal / Water Course (one shared group).
  String drainageDischargeLocation = '';
  String drainageDescription = '';
  String drainageRequiredClearanceStatus = '';

  // Others.
  String otherDisposalSystemDescription = '';

  bool get hasWastewaterTreatmentPlant =>
      selectedTypes.contains(DisposalSystemType.wastewaterTreatmentPlant);
  bool get hasImhoffTank =>
      selectedTypes.contains(DisposalSystemType.imhoffTank);
  bool get hasSanitarySewerConnection =>
      selectedTypes.contains(DisposalSystemType.sanitarySewerConnection);
  bool get hasSubsurfaceSandFilter =>
      selectedTypes.contains(DisposalSystemType.subsurfaceSandFilter);
  bool get hasSurfaceDrainageGroup =>
      selectedTypes.contains(DisposalSystemType.surfaceDrainage) ||
      selectedTypes.contains(DisposalSystemType.streetCanal) ||
      selectedTypes.contains(DisposalSystemType.waterCourse);
  bool get hasOthers => selectedTypes.contains(DisposalSystemType.others);

  bool get isValid {
    if (selectedTypes.isEmpty) return false;

    if (hasWastewaterTreatmentPlant) {
      if (Validators.required(wtpTreatmentType) != null) return false;
      if (_positiveDecimal(wtpTreatmentCapacity, 'Treatment Capacity') !=
          null) {
        return false;
      }
      if (Validators.required(wtpDischargePoint) != null) return false;
      if (Validators.required(wtpOperatorOrResponsibleParty) != null) {
        return false;
      }
    }

    if (hasImhoffTank) {
      if (_positiveDecimal(imhoffTankCapacity, 'Tank Capacity') != null) {
        return false;
      }
      if (Validators.required(imhoffTankDimensions) != null) return false;
      if (Validators.required(imhoffEffluentDestination) != null) {
        return false;
      }
    }

    if (hasSanitarySewerConnection) {
      if (Validators.required(sewerProviderOrReceivingSystem) != null) {
        return false;
      }
      if (Validators.required(sewerConnectionPoint) != null) return false;
    }

    if (hasSubsurfaceSandFilter) {
      if (_positiveDecimal(sandFilterArea, 'Filter Area') != null) {
        return false;
      }
      if (Validators.required(sandFilterDescription) != null) return false;
      if (Validators.required(sandFilterEffluentDestination) != null) {
        return false;
      }
    }

    if (hasSurfaceDrainageGroup) {
      if (Validators.required(drainageDischargeLocation) != null) {
        return false;
      }
      if (Validators.required(drainageDescription) != null) return false;
      if (Validators.required(drainageRequiredClearanceStatus) != null) {
        return false;
      }
    }

    if (hasOthers &&
        Validators.required(otherDisposalSystemDescription) != null) {
      return false;
    }

    return true;
  }
}

/// Step 4 (part 4) — Building and Project Details. `Prepared By` is never
/// stored here — it is always read live from the Design Professional
/// entered in Step 5 (see the step widget), so the same professional name
/// is never requested twice.
class SanitaryBuildingProjectDetails {
  String numberOfStoreys = '';
  String totalBuildingArea = '';
  DateTime? proposedStartDate;
  DateTime? expectedCompletionDate;
  String totalCostOfInstallation = '';

  bool get isValid {
    if (Validators.positiveWholeNumber(
          numberOfStoreys,
          fieldLabel: 'Number of storeys',
        ) !=
        null) {
      return false;
    }
    if (_nonNegativeDecimal(totalBuildingArea, 'Total building area') !=
        null) {
      return false;
    }
    final start = proposedStartDate;
    final end = expectedCompletionDate;
    if (start == null || end == null) return false;
    if (end.isBefore(start)) return false;
    if (_nonNegativeDecimal(
          totalCostOfInstallation,
          'Total cost of installation',
        ) !=
        null) {
      return false;
    }
    return true;
  }
}

/// Step 4 — Sanitary / Plumbing Installation Details: bundles the fixture
/// inventory, water-supply system, disposal system, and building/project
/// fields into one step, matching the official form's own layout.
class SanitaryInstallationDetails {
  final SanitaryFixtureInventory fixtureInventory = SanitaryFixtureInventory();
  final SanitaryWaterSupply waterSupply = SanitaryWaterSupply();
  final SanitaryWastewaterDisposal disposalSystem =
      SanitaryWastewaterDisposal();
  final SanitaryBuildingProjectDetails buildingProjectDetails =
      SanitaryBuildingProjectDetails();

  bool get isValid =>
      fixtureInventory.isValid &&
      waterSupply.isValid &&
      disposalSystem.isValid &&
      buildingProjectDetails.isValid;
}

/// Licensed profession choices — both the Design Professional and the
/// Supervisor may be either, unlike the single-profession lock used by the
/// Architectural, Civil / Structural, Electrical, and Mechanical Permits.
enum SanitaryProfessionType { sanitaryEngineer, masterPlumber }

extension SanitaryProfessionTypeX on SanitaryProfessionType {
  String get label => this == SanitaryProfessionType.sanitaryEngineer
      ? 'Sanitary Engineer'
      : 'Master Plumber';
}

/// Shared license/contact shape for both the Design Professional and the
/// Supervisor — kept internal to this model only, so it introduces no
/// coupling with any other permit.
class SanitaryProfessionalInfo {
  String fullName = '';
  SanitaryProfessionType? profession;
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

/// Step 5 — Sanitary / Plumbing Professionals. When the Supervisor is the
/// same person as the Design Professional, the supervisor's own fields/
/// uploads are never populated — Step 7's document checklist reads the
/// Design Professional's uploads for both roles in that case. The Signed
/// Design Calculations upload is optional ("when applicable"), unlike
/// Mechanical's required equivalent.
class SanitaryProfessionals {
  final SanitaryProfessionalInfo designProfessional =
      SanitaryProfessionalInfo();
  DocumentModel? designPrcIdUpload;
  DocumentModel? designPtrDocumentUpload;
  DocumentModel? signedSealedPlansUpload;
  DocumentModel? signedSealedSpecificationsUpload;
  DocumentModel? signedDesignCalculationsUpload; // optional, "when applicable"

  bool isSupervisorSameAsDesignProfessional = true;
  final SanitaryProfessionalInfo supervisor = SanitaryProfessionalInfo();
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
class SanitaryOwnerInfo {
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
class SanitaryOwnershipConsent {
  bool? isApplicantBuildingOwner;
  final SanitaryOwnerInfo buildingOwner = SanitaryOwnerInfo();

  bool? isBuildingOwnerAlsoLotOwner;
  final SanitaryOwnerInfo lotOwner = SanitaryOwnerInfo();

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

/// Step 7 — Required Sanitary / Plumbing Documents. Professional documents
/// already collected in Step 5 (PRC IDs, PTRs, signed and sealed plans/
/// specifications/design calculations) are intentionally NOT duplicated
/// here — the UI reads/writes [SanitaryProfessionals]'s fields directly.
class SanitaryRequiredDocuments {
  // Core Plans and Specifications.
  DocumentModel? sanitaryPlansUpload;
  DocumentModel? plumbingPlansUpload;
  DocumentModel? sanitaryPlumbingSpecificationsUpload;
  DocumentModel? waterSupplyLayoutUpload;
  DocumentModel? drainageLayoutUpload;
  DocumentModel? sewerLayoutUpload;
  DocumentModel? plumbingRiserDiagramUpload;
  DocumentModel? fixtureScheduleUpload;
  DocumentModel? generalNotesUpload;

  // Cost and Material Documents.
  DocumentModel? billOfMaterialsUpload;
  DocumentModel? costEstimateUpload;
  DocumentModel? quantityTakeoffUpload; // optional, "when applicable"
  DocumentModel? materialSpecificationsUpload;
  DocumentModel? fixtureEquipmentSpecificationsUpload;

  // Water-Supply Documents — conditionally required based on Step 4.
  DocumentModel? shallowWellPlanUpload;
  DocumentModel? shallowWellPumpDetailsUpload;
  DocumentModel? shallowWellWaterQualityUpload;

  DocumentModel? deepWellPlanUpload;
  DocumentModel? deepWellPumpSpecificationsUpload;
  DocumentModel? deepWellDetailsUpload;
  DocumentModel? deepWellWaterQualityUpload;

  DocumentModel? cityWaterServiceConnectionPlanUpload;
  DocumentModel? cityWaterProviderApprovalUpload; // optional, "when available"
  DocumentModel? cityWaterMeterDetailsUpload;

  // Disposal-System Documents — conditionally required based on Step 4.
  DocumentModel? wtpLayoutUpload;
  DocumentModel? wtpProcessDescriptionUpload;
  DocumentModel? wtpCapacityCalculationsUpload;
  DocumentModel? wtpDischargePlanUpload;

  DocumentModel? imhoffPlanUpload;
  DocumentModel? imhoffTankDetailsUpload;
  DocumentModel? imhoffEffluentDisposalPlanUpload;

  DocumentModel? sewerConnectionPlanUpload;
  DocumentModel? sewerReceivingSystemCoordinationUpload;
  DocumentModel? sewerConnectionDetailsUpload;

  DocumentModel? sandFilterPlanUpload;
  DocumentModel? sandFilterDetailsUpload;
  DocumentModel? sandFilterEffluentDisposalPlanUpload;

  DocumentModel? drainagePlanUpload;
  DocumentModel? drainageDischargeDetailsUpload;
  DocumentModel? drainageClearanceCoordinationUpload;

  // Fixture-Specific Documents — conditionally required based on Step 4's
  // fixture quantities.
  DocumentModel? swimmingPoolPlumbingPlanUpload;
  DocumentModel? greaseTrapDetailsUpload;
  DocumentModel? waterTankReservoirDetailsUpload;
  DocumentModel? laboratoryPlumbingDetailsUpload;
  DocumentModel? dentalFacilityPlumbingDetailsUpload;
  DocumentModel? otherSpecializedFixtureDetailsUpload;

  // Supporting Documents.
  DocumentModel? relatedBuildingPermitUpload;
  DocumentModel? waterProviderCoordinationUpload;
  DocumentModel? sewerProviderCoordinationUpload;
  DocumentModel? environmentalDischargeClearanceUpload; // optional, "when applicable"
  DocumentModel? otherSanitaryPlumbingDocumentsUpload; // optional

  bool isValid({
    required bool hasShallowWell,
    required bool hasDeepWell,
    required bool hasCityWater,
    required bool hasWastewaterTreatmentPlant,
    required bool hasImhoffTank,
    required bool hasSanitarySewerConnection,
    required bool hasSubsurfaceSandFilter,
    required bool hasSurfaceDrainageGroup,
    required bool hasSwimmingPool,
    required bool hasGreaseTrap,
    required bool hasWaterTank,
    required bool hasLaboratorySink,
    required bool hasDentalCuspidor,
    required bool hasOthersFixture,
  }) {
    final baseValid =
        sanitaryPlansUpload != null &&
        plumbingPlansUpload != null &&
        sanitaryPlumbingSpecificationsUpload != null &&
        waterSupplyLayoutUpload != null &&
        drainageLayoutUpload != null &&
        sewerLayoutUpload != null &&
        plumbingRiserDiagramUpload != null &&
        fixtureScheduleUpload != null &&
        generalNotesUpload != null &&
        billOfMaterialsUpload != null &&
        costEstimateUpload != null &&
        materialSpecificationsUpload != null &&
        fixtureEquipmentSpecificationsUpload != null &&
        relatedBuildingPermitUpload != null;
    if (!baseValid) return false;

    if (hasShallowWell &&
        (shallowWellPlanUpload == null ||
            shallowWellPumpDetailsUpload == null)) {
      return false;
    }
    if (hasDeepWell &&
        (deepWellPlanUpload == null ||
            deepWellPumpSpecificationsUpload == null)) {
      return false;
    }
    if (hasCityWater && cityWaterServiceConnectionPlanUpload == null) {
      return false;
    }

    if (hasWastewaterTreatmentPlant &&
        (wtpLayoutUpload == null || wtpCapacityCalculationsUpload == null)) {
      return false;
    }
    if (hasImhoffTank &&
        (imhoffPlanUpload == null || imhoffEffluentDisposalPlanUpload == null)) {
      return false;
    }
    if (hasSanitarySewerConnection && sewerConnectionPlanUpload == null) {
      return false;
    }
    if (hasSubsurfaceSandFilter && sandFilterPlanUpload == null) {
      return false;
    }
    if (hasSurfaceDrainageGroup && drainagePlanUpload == null) {
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
    if (hasDentalCuspidor && dentalFacilityPlumbingDetailsUpload == null) {
      return false;
    }
    if (hasOthersFixture && otherSpecializedFixtureDetailsUpload == null) {
      return false;
    }

    return true;
  }
}

/// Step 8 — Review & Declaration: the eight certifications required
/// before the sanitary/plumbing application can be submitted.
class SanitaryReviewDeclaration {
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

/// Per-document-group evaluation status shown in Step 9's read-only
/// "Document Evaluation" summary.
enum SanitaryDocumentEvaluationStatus {
  pendingReview,
  accepted,
  revisionRequired,
  missing,
  notApplicable,
}

extension SanitaryDocumentEvaluationStatusX on SanitaryDocumentEvaluationStatus {
  String get label {
    switch (this) {
      case SanitaryDocumentEvaluationStatus.pendingReview:
        return 'Pending Review';
      case SanitaryDocumentEvaluationStatus.accepted:
        return 'Accepted';
      case SanitaryDocumentEvaluationStatus.revisionRequired:
        return 'Revision Required';
      case SanitaryDocumentEvaluationStatus.missing:
        return 'Missing';
      case SanitaryDocumentEvaluationStatus.notApplicable:
        return 'Not Applicable';
    }
  }
}

/// Frontend-only permit status values the applicant can observe but never
/// set. [invalidWithoutBuildingPermit] is never chosen directly — it is
/// always derived (see [SanitaryPermitDraft.derivedPermitStatus]).
enum SanitaryPermitStatus {
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

extension SanitaryPermitStatusX on SanitaryPermitStatus {
  String get label {
    switch (this) {
      case SanitaryPermitStatus.submitted:
        return 'Submitted';
      case SanitaryPermitStatus.underEvaluation:
        return 'Under Evaluation';
      case SanitaryPermitStatus.revisionRequired:
        return 'Revision Required';
      case SanitaryPermitStatus.additionalDocumentsRequired:
        return 'Additional Documents Required';
      case SanitaryPermitStatus.forApproval:
        return 'For Approval';
      case SanitaryPermitStatus.approved:
        return 'Approved';
      case SanitaryPermitStatus.rejected:
        return 'Rejected';
      case SanitaryPermitStatus.invalidWithoutBuildingPermit:
        return 'Invalid Without Building Permit';
      case SanitaryPermitStatus.completed:
        return 'Completed';
    }
  }
}

/// Step 9 — Evaluation & Permit Status. Every field here is
/// office-controlled — there is no applicant-editable state in this class
/// at all, only fixed "pending" defaults. This step therefore has no
/// blocking validity condition; Continue always submits for evaluation.
class SanitaryEvaluationPermitStatus {
  static const Map<String, SanitaryDocumentEvaluationStatus>
  documentEvaluation = {
    'Sanitary / Plumbing Plans and Specifications':
        SanitaryDocumentEvaluationStatus.pendingReview,
    'Bill of Materials': SanitaryDocumentEvaluationStatus.pendingReview,
    'Cost Estimate': SanitaryDocumentEvaluationStatus.pendingReview,
    'Water-Supply Documents': SanitaryDocumentEvaluationStatus.pendingReview,
    'Disposal-System Documents': SanitaryDocumentEvaluationStatus.pendingReview,
    'Specialized Fixture Documents':
        SanitaryDocumentEvaluationStatus.pendingReview,
    'Other Submitted Documents': SanitaryDocumentEvaluationStatus.pendingReview,
  };

  static const List<String> progressStages = [
    'Sanitary / Plumbing Documents Received',
    'Plan Review',
    'Fixture Review',
    'Water-Supply Review',
    'Disposal-System Review',
    'Technical Evaluation',
    'Recommending Approval',
    'Building Official Decision',
  ];

  static const String actionTaken = 'Pending Assessment';
  static const String recommendingApproval = 'Pending Assessment';
  static const String permitIssuedBy = 'Pending Assessment';

  static const List<String> permitConditions = [
    'Sanitary and plumbing work must follow the approved plans and applicable codes.',
    'A Notice of Construction must be submitted when required before work begins.',
    'A licensed supervisor or professional must oversee the work.',
    'Required logbook entries, as-built plans, and completion documents must be submitted.',
    'The Sanitary / Plumbing Permit is invalid without the related Building Permit.',
  ];

  bool get isValid => true;
}

enum SanitaryPermitDraftStatus { draft, submitted }

/// The full mutable draft for one Sanitary / Plumbing Permit application
/// session.
class SanitaryPermitDraft {
  final SanitaryApplicantInfo applicant = SanitaryApplicantInfo();
  final SanitaryApplicantAddress applicantAddress = SanitaryApplicantAddress();
  final SanitaryProjectLocation projectLocation = SanitaryProjectLocation();
  final SanitaryRelatedBuildingPermit relatedBuildingPermit =
      SanitaryRelatedBuildingPermit();
  final SanitaryScopeOccupancy scopeOccupancy = SanitaryScopeOccupancy();
  final SanitaryInstallationDetails installationDetails =
      SanitaryInstallationDetails();
  final SanitaryProfessionals professionals = SanitaryProfessionals();
  final SanitaryOwnershipConsent ownershipConsent = SanitaryOwnershipConsent();
  final SanitaryRequiredDocuments requiredDocuments =
      SanitaryRequiredDocuments();
  final SanitaryReviewDeclaration reviewDeclaration =
      SanitaryReviewDeclaration();
  final SanitaryEvaluationPermitStatus evaluationPermitStatus =
      SanitaryEvaluationPermitStatus();

  bool useApplicantAddressForProjectLocation = false;
  SanitaryPermitDraftStatus status = SanitaryPermitDraftStatus.draft;
  DateTime? lastSavedAt;

  bool get isStep1Valid => applicant.isValid;
  bool get isStep2Valid =>
      applicantAddress.isValid &&
      projectLocation.isValid &&
      relatedBuildingPermit.isValid;
  bool get isStep3Valid => scopeOccupancy.isValid;
  bool get isStep4Valid => installationDetails.isValid;
  bool get isStep5Valid => professionals.isValid;
  bool get isStep6Valid => ownershipConsent.isValid;
  bool get isStep7Valid =>
      requiredDocuments.isValid(
        hasShallowWell: installationDetails.waterSupply.hasShallowWell,
        hasDeepWell: installationDetails.waterSupply.hasDeepWell,
        hasCityWater: installationDetails.waterSupply.hasCityWater,
        hasWastewaterTreatmentPlant:
            installationDetails.disposalSystem.hasWastewaterTreatmentPlant,
        hasImhoffTank: installationDetails.disposalSystem.hasImhoffTank,
        hasSanitarySewerConnection:
            installationDetails.disposalSystem.hasSanitarySewerConnection,
        hasSubsurfaceSandFilter:
            installationDetails.disposalSystem.hasSubsurfaceSandFilter,
        hasSurfaceDrainageGroup:
            installationDetails.disposalSystem.hasSurfaceDrainageGroup,
        hasSwimmingPool: installationDetails.fixtureInventory.hasFixture(
          SanitaryFixtureType.swimmingPool,
        ),
        hasGreaseTrap: installationDetails.fixtureInventory.hasFixture(
          SanitaryFixtureType.greaseTrap,
        ),
        hasWaterTank: installationDetails.fixtureInventory.hasFixture(
          SanitaryFixtureType.waterTankReservoir,
        ),
        hasLaboratorySink: installationDetails.fixtureInventory.hasFixture(
          SanitaryFixtureType.laboratorySink,
        ),
        hasDentalCuspidor: installationDetails.fixtureInventory.hasFixture(
          SanitaryFixtureType.dentalCuspidor,
        ),
        hasOthersFixture: installationDetails.fixtureInventory.hasFixture(
          SanitaryFixtureType.others,
        ),
      ) &&
      professionals.designPrcIdUpload != null &&
      professionals.designPtrDocumentUpload != null &&
      (professionals.isSupervisorSameAsDesignProfessional ||
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
  SanitaryPermitStatus get derivedPermitStatus {
    if (!relatedBuildingPermit.hasValidBuildingPermitReference) {
      return SanitaryPermitStatus.invalidWithoutBuildingPermit;
    }
    return SanitaryPermitStatus.submitted;
  }
}
