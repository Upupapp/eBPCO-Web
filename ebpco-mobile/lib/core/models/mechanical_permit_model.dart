import '../utils/validators.dart';
import 'document_model.dart';

/// Mock, frontend-only data model for the Mechanical Permit application
/// wizard. Based on the official Mechanical Permit form, and — like the
/// Architectural, Civil / Structural, and Electrical Permits — an
/// ancillary permit that references a related Building Permit but never
/// reads or mutates [BuildingPermitProvider]'s state, so this model is
/// fully decoupled from all other permit models.

enum PermitType { mechanical }

extension PermitTypeX on PermitType {
  String get label => 'Mechanical Permit';
}

/// Duplicated (not imported) from the other permit models to keep all
/// permit models fully decoupled.
const List<String> mechanicalFormsOfOwnership = [
  'Sole Proprietorship',
  'Partnership',
  'Corporation',
  'Cooperative',
  'Government',
  'Others',
];

/// Duplicated (not imported) from the other permit models.
enum MechanicalOccupancyGroup {
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

extension MechanicalOccupancyGroupX on MechanicalOccupancyGroup {
  String get label {
    switch (this) {
      case MechanicalOccupancyGroup.groupA:
        return 'Group A — Residential Dwelling';
      case MechanicalOccupancyGroup.groupB:
        return 'Group B — Residential Hotel or Apartment';
      case MechanicalOccupancyGroup.groupC:
        return 'Group C — Education and Recreation';
      case MechanicalOccupancyGroup.groupD:
        return 'Group D — Institutional';
      case MechanicalOccupancyGroup.groupE:
        return 'Group E — Business and Mercantile';
      case MechanicalOccupancyGroup.groupF:
        return 'Group F — Industrial';
      case MechanicalOccupancyGroup.groupG:
        return 'Group G — Storage and Hazardous';
      case MechanicalOccupancyGroup.groupH:
        return 'Group H — Assembly';
      case MechanicalOccupancyGroup.groupI:
        return 'Group I — Assembly with Higher Occupant Load';
      case MechanicalOccupancyGroup.groupJ:
        return 'Group J — Accessory';
      case MechanicalOccupancyGroup.others:
        return 'Others';
    }
  }
}

/// Step 1 — Applicant Information. Permit Type is fixed to "Mechanical
/// Permit" and not editable.
class MechanicalApplicantInfo {
  final PermitType permitType = PermitType.mechanical;

  String firstName = '';
  String middleName = '';
  String lastName = '';
  String tin = '';
  String contactNumber = '';

  bool isOwnedByEnterprise = false;
  String enterpriseName = '';
  String? formOfOwnership;

  MechanicalOccupancyGroup? occupancyGroup;
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
    if (occupancyGroup == MechanicalOccupancyGroup.others &&
        Validators.required(occupancyOtherDescription) != null) {
      return false;
    }
    if (!isOwnedByEnterprise) return true;
    return Validators.required(enterpriseName) == null &&
        formOfOwnership != null;
  }
}

/// Step 2 (part 1) — Applicant Address.
class MechanicalApplicantAddress {
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
class MechanicalProjectLocation {
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
const List<String> mechanicalMockBuildingPermitNumbers = [
  'BP-2026-100234',
  'BP-2026-100567',
  'BP-2026-100812',
];

/// Step 2 (part 3) — Related Building Permit. The Mechanical Permit is
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

class MechanicalRelatedBuildingPermit {
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

/// Official scope-of-work options.
enum MechanicalScopeType {
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

extension MechanicalScopeTypeX on MechanicalScopeType {
  String get label {
    switch (this) {
      case MechanicalScopeType.newInstallation:
        return 'New Installation';
      case MechanicalScopeType.erection:
        return 'Erection';
      case MechanicalScopeType.addition:
        return 'Addition';
      case MechanicalScopeType.alteration:
        return 'Alteration';
      case MechanicalScopeType.renovation:
        return 'Renovation';
      case MechanicalScopeType.conversion:
        return 'Conversion';
      case MechanicalScopeType.repair:
        return 'Repair';
      case MechanicalScopeType.moving:
        return 'Moving';
      case MechanicalScopeType.raising:
        return 'Raising';
      case MechanicalScopeType.demolition:
        return 'Demolition';
      case MechanicalScopeType.accessoryBuildingOrStructure:
        return 'Accessory Building / Structure';
      case MechanicalScopeType.others:
        return 'Others';
    }
  }
}

/// Step 3 — Scope of Work.
class MechanicalScopeOfWork {
  final Set<MechanicalScopeType> selectedScopes = {};
  String otherScopeDescription = '';

  String workTitle = '';
  String generalDescription = '';
  String existingMechanicalCondition = '';
  String proposedMechanicalChanges = '';
  String areasAffected = '';

  bool get isValid {
    if (selectedScopes.isEmpty) return false;
    if (selectedScopes.contains(MechanicalScopeType.others) &&
        Validators.required(otherScopeDescription) != null) {
      return false;
    }
    return Validators.required(workTitle) == null &&
        Validators.required(generalDescription) == null &&
        Validators.required(existingMechanicalCondition) == null &&
        Validators.required(proposedMechanicalChanges) == null &&
        Validators.required(areasAffected) == null;
  }
}

/// Official mechanical installation/equipment types.
enum MechanicalEquipmentType {
  automaticFireSprinklerSystem,
  boiler,
  pressureVessel,
  internalCombustionEngine,
  refrigeration,
  coldStorage,
  icePlant,
  windowTypeAirConditioning,
  packagedSplitTypeAirConditioning,
  powerPipingGasOrSteam,
  centralAirConditioning,
  mechanicalVentilation,
  escalator,
  movingWalk,
  freightElevator,
  passengerElevator,
  cableCar,
  pressurizedWaterHeater,
  dumbwaiter,
  pumps,
  compressedAirSystem,
  vacuumSystem,
  institutionalGasSystem,
  industrialGasSystem,
  pneumaticTubes,
  conveyors,
  monorails,
  funicular,
  others,
}

extension MechanicalEquipmentTypeX on MechanicalEquipmentType {
  String get label {
    switch (this) {
      case MechanicalEquipmentType.automaticFireSprinklerSystem:
        return 'Automatic Fire Sprinkler System';
      case MechanicalEquipmentType.boiler:
        return 'Boiler';
      case MechanicalEquipmentType.pressureVessel:
        return 'Pressure Vessel';
      case MechanicalEquipmentType.internalCombustionEngine:
        return 'Internal Combustion Engine';
      case MechanicalEquipmentType.refrigeration:
        return 'Refrigeration';
      case MechanicalEquipmentType.coldStorage:
        return 'Cold Storage';
      case MechanicalEquipmentType.icePlant:
        return 'Ice Plant';
      case MechanicalEquipmentType.windowTypeAirConditioning:
        return 'Window-Type Air-Conditioning';
      case MechanicalEquipmentType.packagedSplitTypeAirConditioning:
        return 'Packaged / Split-Type Air-Conditioning';
      case MechanicalEquipmentType.powerPipingGasOrSteam:
        return 'Power Piping for Gas or Steam';
      case MechanicalEquipmentType.centralAirConditioning:
        return 'Central Air-Conditioning';
      case MechanicalEquipmentType.mechanicalVentilation:
        return 'Mechanical Ventilation';
      case MechanicalEquipmentType.escalator:
        return 'Escalator';
      case MechanicalEquipmentType.movingWalk:
        return 'Moving Walk / Walkalator';
      case MechanicalEquipmentType.freightElevator:
        return 'Freight Elevator';
      case MechanicalEquipmentType.passengerElevator:
        return 'Passenger Elevator';
      case MechanicalEquipmentType.cableCar:
        return 'Cable Car';
      case MechanicalEquipmentType.pressurizedWaterHeater:
        return 'Pressurized Water Heater';
      case MechanicalEquipmentType.dumbwaiter:
        return 'Dumbwaiter';
      case MechanicalEquipmentType.pumps:
        return 'Pumps';
      case MechanicalEquipmentType.compressedAirSystem:
        return 'Compressed Air System';
      case MechanicalEquipmentType.vacuumSystem:
        return 'Vacuum System';
      case MechanicalEquipmentType.institutionalGasSystem:
        return 'Institutional Gas System';
      case MechanicalEquipmentType.industrialGasSystem:
        return 'Industrial Gas System';
      case MechanicalEquipmentType.pneumaticTubes:
        return 'Pneumatic Tubes';
      case MechanicalEquipmentType.conveyors:
        return 'Conveyors';
      case MechanicalEquipmentType.monorails:
        return 'Monorails';
      case MechanicalEquipmentType.funicular:
        return 'Funicular';
      case MechanicalEquipmentType.others:
        return 'Others';
    }
  }
}

/// Power piping service type.
enum PowerPipingServiceType { gas, steam, other }

extension PowerPipingServiceTypeX on PowerPipingServiceType {
  String get label {
    switch (this) {
      case PowerPipingServiceType.gas:
        return 'Gas';
      case PowerPipingServiceType.steam:
        return 'Steam';
      case PowerPipingServiceType.other:
        return 'Other';
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

String? _nonNegativeDecimal(String? value, String fieldLabel) {
  if (value == null || value.trim().isEmpty) {
    return '$fieldLabel is required.';
  }
  final parsed = double.tryParse(value.trim());
  if (parsed == null) return 'Enter a valid number.';
  if (parsed < 0) return '$fieldLabel cannot be negative.';
  return null;
}

/// Step 4 — Mechanical Installation Details: the selected equipment
/// types, general project fields, and the technical fields conditionally
/// required by each selected equipment group. Numeric parsing is always
/// via `double.tryParse`/`int.tryParse` — never a bare `parse` — so a
/// temporarily empty or invalid field never throws or renders `NaN`.
/// Equipment types that share a single official field group (e.g. the
/// three air-conditioning types, or the seven vertical-transport types)
/// are validated together via one shared set of fields, matching the
/// official form's own grouping.
class MechanicalInstallationDetails {
  final Set<MechanicalEquipmentType> selectedEquipment = {};
  String otherEquipmentDescription = '';

  // General project fields.
  String totalEstimatedProjectCost = '';
  DateTime? proposedStartDate;
  DateTime? expectedCompletionDate;
  String existingSystemDescription = '';
  String proposedSystemDescription = '';
  String intendedUse = '';
  String equipmentLocation = '';
  String numberOfEquipmentUnits = '';

  // Automatic Fire Sprinkler System.
  String fsNumberOfSprinklerHeads = '';
  String fsDesignCoverageArea = '';
  String fsWaterSource = '';
  String fsPumpCapacity = '';
  String fsSystemType = '';

  // Boiler.
  String boilerType = '';
  String boilerRatedCapacity = '';
  String boilerOperatingPressure = '';
  String boilerFuelType = '';
  String boilerNumberOfUnits = '';

  // Pressure Vessel.
  String pvVesselType = '';
  String pvVolumeOrCapacity = '';
  String pvMaxAllowableWorkingPressure = '';
  String pvOperatingTemperature = '';
  String pvNumberOfUnits = '';

  // Internal Combustion Engine.
  String iceEngineType = '';
  String iceRatedPower = '';
  String iceFuelType = '';
  String iceNumberOfUnits = '';
  String iceIntendedUse = '';

  // Refrigeration / Cold Storage / Ice Plant.
  String refrigSystemType = '';
  String refrigRefrigerantType = '';
  String refrigCoolingCapacity = '';
  String refrigStorageVolume = '';
  String refrigNumberOfUnits = '';

  // Air-Conditioning (window, split/packaged, central).
  String acType = '';
  String acNumberOfUnits = '';
  String acCoolingCapacityPerUnit = '';
  String acTotalCoolingCapacity = '';
  String acRefrigerantType = '';
  String acServedArea = '';

  // Mechanical Ventilation.
  String ventType = '';
  String ventAirflowCapacity = '';
  String ventNumberOfFans = '';
  String ventServedArea = '';
  String ventExhaustLocation = '';

  // Power Piping.
  PowerPipingServiceType? pipingServiceType;
  String pipingPipeMaterial = '';
  String pipingDesignPressure = '';
  String pipingPipeDiameter = '';
  String pipingApproximateLength = '';

  // Elevator / Dumbwaiter / Escalator / Walkalator / Cable Car / Funicular.
  String elevEquipmentType = '';
  String elevRatedCapacity = '';
  String elevRatedSpeed = '';
  String elevNumberOfStops = '';
  String elevTravelDistance = '';
  String elevNumberOfUnits = '';
  String elevManufacturer = '';

  // Pumps.
  String pumpsType = '';
  String pumpsCapacity = '';
  String pumpsTotalHead = '';
  String pumpsMotorRating = '';
  String pumpsNumberOfUnits = '';

  // Pressurized Water Heater.
  String pwhHeaterType = '';
  String pwhTankCapacity = '';
  String pwhPressureRating = '';
  String pwhHeatingCapacity = '';
  String pwhNumberOfUnits = '';

  // Compressed Air / Vacuum System.
  String cavSystemType = '';
  String cavOperatingPressure = '';
  String cavCapacity = '';
  String cavNumberOfEquipmentUnits = '';
  String cavServedArea = '';

  // Institutional / Industrial Gas.
  String gasType = '';
  String gasStorageCapacity = '';
  String gasOperatingPressure = '';
  String gasServedArea = '';
  String gasSafetyControlDescription = '';

  // Pneumatic Tubes / Conveyors / Monorails.
  String convSystemType = '';
  String convRatedCapacity = '';
  String convTravelLength = '';
  String convSpeed = '';
  String convNumberOfStations = '';

  bool get hasFireSprinkler =>
      selectedEquipment.contains(MechanicalEquipmentType.automaticFireSprinklerSystem);
  bool get hasBoiler => selectedEquipment.contains(MechanicalEquipmentType.boiler);
  bool get hasPressureVessel =>
      selectedEquipment.contains(MechanicalEquipmentType.pressureVessel);
  bool get hasInternalCombustionEngine => selectedEquipment.contains(
    MechanicalEquipmentType.internalCombustionEngine,
  );
  bool get hasRefrigerationGroup =>
      selectedEquipment.contains(MechanicalEquipmentType.refrigeration) ||
      selectedEquipment.contains(MechanicalEquipmentType.coldStorage) ||
      selectedEquipment.contains(MechanicalEquipmentType.icePlant);
  bool get hasAirConditioningGroup =>
      selectedEquipment.contains(MechanicalEquipmentType.windowTypeAirConditioning) ||
      selectedEquipment.contains(
        MechanicalEquipmentType.packagedSplitTypeAirConditioning,
      ) ||
      selectedEquipment.contains(MechanicalEquipmentType.centralAirConditioning);
  bool get hasMechanicalVentilation =>
      selectedEquipment.contains(MechanicalEquipmentType.mechanicalVentilation);
  bool get hasPowerPiping =>
      selectedEquipment.contains(MechanicalEquipmentType.powerPipingGasOrSteam);
  bool get hasElevatorGroup =>
      selectedEquipment.contains(MechanicalEquipmentType.escalator) ||
      selectedEquipment.contains(MechanicalEquipmentType.movingWalk) ||
      selectedEquipment.contains(MechanicalEquipmentType.freightElevator) ||
      selectedEquipment.contains(MechanicalEquipmentType.passengerElevator) ||
      selectedEquipment.contains(MechanicalEquipmentType.cableCar) ||
      selectedEquipment.contains(MechanicalEquipmentType.dumbwaiter) ||
      selectedEquipment.contains(MechanicalEquipmentType.funicular);
  bool get hasPumps => selectedEquipment.contains(MechanicalEquipmentType.pumps);
  bool get hasPressurizedWaterHeater =>
      selectedEquipment.contains(MechanicalEquipmentType.pressurizedWaterHeater);
  bool get hasCompressedAirOrVacuumGroup =>
      selectedEquipment.contains(MechanicalEquipmentType.compressedAirSystem) ||
      selectedEquipment.contains(MechanicalEquipmentType.vacuumSystem);
  bool get hasGasGroup =>
      selectedEquipment.contains(MechanicalEquipmentType.institutionalGasSystem) ||
      selectedEquipment.contains(MechanicalEquipmentType.industrialGasSystem);
  bool get hasConveyorGroup =>
      selectedEquipment.contains(MechanicalEquipmentType.pneumaticTubes) ||
      selectedEquipment.contains(MechanicalEquipmentType.conveyors) ||
      selectedEquipment.contains(MechanicalEquipmentType.monorails);

  bool get isValid {
    if (selectedEquipment.isEmpty) return false;
    if (selectedEquipment.contains(MechanicalEquipmentType.others) &&
        Validators.required(otherEquipmentDescription) != null) {
      return false;
    }

    if (_nonNegativeDecimal(totalEstimatedProjectCost, 'Total Estimated Project Cost') !=
        null) {
      return false;
    }
    final start = proposedStartDate;
    final end = expectedCompletionDate;
    if (start == null || end == null) return false;
    if (end.isBefore(start)) return false;
    if (Validators.required(existingSystemDescription) != null) return false;
    if (Validators.required(proposedSystemDescription) != null) return false;
    if (Validators.required(intendedUse) != null) return false;
    if (Validators.required(equipmentLocation) != null) return false;
    if (Validators.positiveWholeNumber(
          numberOfEquipmentUnits,
          fieldLabel: 'Number of equipment units',
        ) !=
        null) {
      return false;
    }

    if (hasFireSprinkler) {
      if (Validators.positiveWholeNumber(
            fsNumberOfSprinklerHeads,
            fieldLabel: 'Number of sprinkler heads',
          ) !=
          null) {
        return false;
      }
      if (_positiveDecimal(fsDesignCoverageArea, 'Design Coverage Area') != null) {
        return false;
      }
      if (Validators.required(fsWaterSource) != null) return false;
      if (_positiveDecimal(fsPumpCapacity, 'Pump Capacity') != null) return false;
      if (Validators.required(fsSystemType) != null) return false;
    }

    if (hasBoiler) {
      if (Validators.required(boilerType) != null) return false;
      if (_positiveDecimal(boilerRatedCapacity, 'Rated Capacity') != null) {
        return false;
      }
      if (_positiveDecimal(boilerOperatingPressure, 'Operating Pressure') != null) {
        return false;
      }
      if (Validators.required(boilerFuelType) != null) return false;
      if (Validators.positiveWholeNumber(
            boilerNumberOfUnits,
            fieldLabel: 'Number of units',
          ) !=
          null) {
        return false;
      }
    }

    if (hasPressureVessel) {
      if (Validators.required(pvVesselType) != null) return false;
      if (_positiveDecimal(pvVolumeOrCapacity, 'Volume or Capacity') != null) {
        return false;
      }
      if (_positiveDecimal(
            pvMaxAllowableWorkingPressure,
            'Maximum Allowable Working Pressure',
          ) !=
          null) {
        return false;
      }
      if (_nonNegativeDecimal(pvOperatingTemperature, 'Operating Temperature') !=
          null) {
        return false;
      }
      if (Validators.positiveWholeNumber(
            pvNumberOfUnits,
            fieldLabel: 'Number of units',
          ) !=
          null) {
        return false;
      }
    }

    if (hasInternalCombustionEngine) {
      if (Validators.required(iceEngineType) != null) return false;
      if (_positiveDecimal(iceRatedPower, 'Rated Power') != null) return false;
      if (Validators.required(iceFuelType) != null) return false;
      if (Validators.positiveWholeNumber(
            iceNumberOfUnits,
            fieldLabel: 'Number of units',
          ) !=
          null) {
        return false;
      }
      if (Validators.required(iceIntendedUse) != null) return false;
    }

    if (hasRefrigerationGroup) {
      if (Validators.required(refrigSystemType) != null) return false;
      if (Validators.required(refrigRefrigerantType) != null) return false;
      if (_positiveDecimal(refrigCoolingCapacity, 'Cooling Capacity') != null) {
        return false;
      }
      if (_positiveDecimal(refrigStorageVolume, 'Storage Volume') != null) {
        return false;
      }
      if (Validators.positiveWholeNumber(
            refrigNumberOfUnits,
            fieldLabel: 'Number of units',
          ) !=
          null) {
        return false;
      }
    }

    if (hasAirConditioningGroup) {
      if (Validators.required(acType) != null) return false;
      if (Validators.positiveWholeNumber(
            acNumberOfUnits,
            fieldLabel: 'Number of units',
          ) !=
          null) {
        return false;
      }
      if (_positiveDecimal(acCoolingCapacityPerUnit, 'Cooling Capacity per Unit') !=
          null) {
        return false;
      }
      if (_positiveDecimal(acTotalCoolingCapacity, 'Total Cooling Capacity') !=
          null) {
        return false;
      }
      if (Validators.required(acRefrigerantType) != null) return false;
      if (Validators.required(acServedArea) != null) return false;
    }

    if (hasMechanicalVentilation) {
      if (Validators.required(ventType) != null) return false;
      if (_positiveDecimal(ventAirflowCapacity, 'Airflow Capacity') != null) {
        return false;
      }
      if (Validators.positiveWholeNumber(
            ventNumberOfFans,
            fieldLabel: 'Number of fans',
          ) !=
          null) {
        return false;
      }
      if (Validators.required(ventServedArea) != null) return false;
      if (Validators.required(ventExhaustLocation) != null) return false;
    }

    if (hasPowerPiping) {
      if (pipingServiceType == null) return false;
      if (Validators.required(pipingPipeMaterial) != null) return false;
      if (_positiveDecimal(pipingDesignPressure, 'Design Pressure') != null) {
        return false;
      }
      if (_positiveDecimal(pipingPipeDiameter, 'Pipe Diameter') != null) {
        return false;
      }
      if (_positiveDecimal(pipingApproximateLength, 'Approximate Pipe Length') !=
          null) {
        return false;
      }
    }

    if (hasElevatorGroup) {
      if (Validators.required(elevEquipmentType) != null) return false;
      if (_positiveDecimal(elevRatedCapacity, 'Rated Capacity') != null) {
        return false;
      }
      if (_positiveDecimal(elevRatedSpeed, 'Rated Speed') != null) return false;
      if (Validators.positiveWholeNumber(
            elevNumberOfStops,
            fieldLabel: 'Number of stops',
          ) !=
          null) {
        return false;
      }
      if (_positiveDecimal(elevTravelDistance, 'Travel Distance') != null) {
        return false;
      }
      if (Validators.positiveWholeNumber(
            elevNumberOfUnits,
            fieldLabel: 'Number of units',
          ) !=
          null) {
        return false;
      }
    }

    if (hasPumps) {
      if (Validators.required(pumpsType) != null) return false;
      if (_positiveDecimal(pumpsCapacity, 'Pump Capacity') != null) return false;
      if (_positiveDecimal(pumpsTotalHead, 'Total Head') != null) return false;
      if (_positiveDecimal(pumpsMotorRating, 'Motor Rating') != null) return false;
      if (Validators.positiveWholeNumber(
            pumpsNumberOfUnits,
            fieldLabel: 'Number of units',
          ) !=
          null) {
        return false;
      }
    }

    if (hasPressurizedWaterHeater) {
      if (Validators.required(pwhHeaterType) != null) return false;
      if (_positiveDecimal(pwhTankCapacity, 'Tank Capacity') != null) return false;
      if (_positiveDecimal(pwhPressureRating, 'Pressure Rating') != null) {
        return false;
      }
      if (_positiveDecimal(pwhHeatingCapacity, 'Heating Capacity') != null) {
        return false;
      }
      if (Validators.positiveWholeNumber(
            pwhNumberOfUnits,
            fieldLabel: 'Number of units',
          ) !=
          null) {
        return false;
      }
    }

    if (hasCompressedAirOrVacuumGroup) {
      if (Validators.required(cavSystemType) != null) return false;
      if (_positiveDecimal(cavOperatingPressure, 'Operating Pressure') != null) {
        return false;
      }
      if (_positiveDecimal(cavCapacity, 'Capacity') != null) return false;
      if (Validators.positiveWholeNumber(
            cavNumberOfEquipmentUnits,
            fieldLabel: 'Number of equipment units',
          ) !=
          null) {
        return false;
      }
      if (Validators.required(cavServedArea) != null) return false;
    }

    if (hasGasGroup) {
      if (Validators.required(gasType) != null) return false;
      if (_positiveDecimal(gasStorageCapacity, 'Storage Capacity') != null) {
        return false;
      }
      if (_positiveDecimal(gasOperatingPressure, 'Operating Pressure') != null) {
        return false;
      }
      if (Validators.required(gasServedArea) != null) return false;
      if (Validators.required(gasSafetyControlDescription) != null) return false;
    }

    if (hasConveyorGroup) {
      if (Validators.required(convSystemType) != null) return false;
      if (_positiveDecimal(convRatedCapacity, 'Rated Capacity') != null) {
        return false;
      }
      if (_positiveDecimal(convTravelLength, 'Travel Length') != null) return false;
      if (_positiveDecimal(convSpeed, 'Speed') != null) return false;
      if (Validators.positiveWholeNumber(
            convNumberOfStations,
            fieldLabel: 'Number of stations',
          ) !=
          null) {
        return false;
      }
    }

    return true;
  }
}

/// Licensed professional type for the Supervisor / Mechanical Engineer in
/// Charge. The Design Professional's profession is always fixed to
/// [professionalMechanicalEngineer] (see [MechanicalProfessionals]) — not
/// user-selectable.
enum MechanicalProfessionType { professionalMechanicalEngineer, mechanicalEngineer }

extension MechanicalProfessionTypeX on MechanicalProfessionType {
  String get label => this == MechanicalProfessionType.professionalMechanicalEngineer
      ? 'Professional Mechanical Engineer'
      : 'Mechanical Engineer';
}

/// Shared license/contact shape for both the Design Professional and the
/// Supervisor — kept internal to this model only, so it introduces no
/// coupling with any other permit.
class MechanicalProfessionalInfo {
  String fullName = '';
  MechanicalProfessionType? profession;
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

/// Step 5 — Mechanical Professionals. When the Supervisor is the same
/// person as the Design Professional, the supervisor's own fields/uploads
/// are never populated — Step 7's document checklist reads the Design
/// Professional's uploads for both roles in that case.
class MechanicalProfessionals {
  final MechanicalProfessionalInfo designProfessional = MechanicalProfessionalInfo()
    ..profession = MechanicalProfessionType.professionalMechanicalEngineer;
  DocumentModel? designPrcIdUpload;
  DocumentModel? designPtrDocumentUpload;
  DocumentModel? signedSealedPlansUpload;
  DocumentModel? signedSealedSpecificationsUpload;
  DocumentModel? signedDesignCalculationsUpload;

  bool isSupervisorSameAsDesignProfessional = true;
  final MechanicalProfessionalInfo supervisor = MechanicalProfessionalInfo();
  DocumentModel? supervisorPrcIdUpload;
  DocumentModel? supervisorPtrUpload;
  DocumentModel? signedSupervisorConfirmationUpload;

  bool get isValid {
    final designValid = designProfessional.isValid &&
        designPrcIdUpload != null &&
        designPtrDocumentUpload != null &&
        signedSealedPlansUpload != null &&
        signedSealedSpecificationsUpload != null &&
        signedDesignCalculationsUpload != null;
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
class MechanicalOwnerInfo {
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
class MechanicalOwnershipConsent {
  bool? isApplicantBuildingOwner;
  final MechanicalOwnerInfo buildingOwner = MechanicalOwnerInfo();

  bool? isBuildingOwnerAlsoLotOwner;
  final MechanicalOwnerInfo lotOwner = MechanicalOwnerInfo();

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

/// Step 7 — Required Mechanical Documents. Professional documents already
/// collected in Step 5 (PRC IDs, PTRs, signed and sealed plans/
/// specifications/design calculations) are intentionally NOT duplicated
/// here — the UI reads/writes [MechanicalProfessionals]'s fields directly.
class MechanicalRequiredDocuments {
  // Core Mechanical Documents.
  DocumentModel? equipmentLayoutUpload;
  DocumentModel? schematicDiagramsUpload;
  DocumentModel? equipmentSchedulesUpload;
  DocumentModel? controlDiagramsUpload;
  DocumentModel? generalNotesUpload;

  // Cost and Material Documents.
  DocumentModel? billOfMaterialsUpload;
  DocumentModel? costEstimateUpload;
  DocumentModel? quantityTakeoffUpload; // optional, "when applicable"
  DocumentModel? equipmentSpecificationsUpload;
  DocumentModel? manufacturerDataSheetsUpload;

  // Equipment-specific documents — conditionally required based on Step 4.
  DocumentModel? sprinklerLayoutUpload;
  DocumentModel? hydraulicCalculationsUpload;
  DocumentModel? pumpDetailsUpload;
  DocumentModel? waterSupplyDetailsUpload;

  DocumentModel? boilerLayoutUpload;
  DocumentModel? boilerSpecificationsUpload;
  DocumentModel? pressureCapacityCalculationsUpload;
  DocumentModel? safetyControlDetailsUpload;

  DocumentModel? vesselDrawingsUpload;
  DocumentModel? pressureCalculationsUpload;
  DocumentModel? safetyValveDetailsUpload;
  DocumentModel? manufacturerCertificationUpload;

  DocumentModel? refrigerationLayoutUpload;
  DocumentModel? refrigerantPipingDiagramUpload;
  DocumentModel? coolingLoadCalculationsUpload;
  DocumentModel? refrigerationEquipmentSpecificationsUpload;

  DocumentModel? airConditioningLayoutUpload;
  DocumentModel? acCoolingLoadCalculationsUpload;
  DocumentModel? ductLayoutUpload; // optional, "when applicable"
  DocumentModel? acRefrigerantPipingLayoutUpload;
  DocumentModel? acEquipmentScheduleUpload;

  DocumentModel? ventilationLayoutUpload;
  DocumentModel? airflowCalculationsUpload;
  DocumentModel? fanScheduleUpload;
  DocumentModel? exhaustDetailsUpload;

  DocumentModel? pipingLayoutUpload;
  DocumentModel? isometricDiagramUpload;
  DocumentModel? pipingPressureCalculationsUpload;
  DocumentModel? pipeSpecificationsUpload;
  DocumentModel? pipingSafetyControlDetailsUpload;

  DocumentModel? verticalTransportEquipmentLayoutUpload;
  DocumentModel? shaftOrTravelDetailsUpload;
  DocumentModel? manufacturerSpecificationsUpload;
  DocumentModel? structuralInterfaceDetailsUpload;
  DocumentModel? verticalTransportSafetyDetailsUpload;

  DocumentModel? pumpLayoutUpload;
  DocumentModel? pumpScheduleUpload;
  DocumentModel? capacityHeadCalculationsUpload;
  DocumentModel? motorSpecificationsUpload;

  // "Compressed Air, Vacuum or Gas Systems" is one shared document group
  // on the official form — these five uploads cover all three equipment
  // groups (compressed air, vacuum, and institutional/industrial gas).
  DocumentModel? cavSystemLayoutUpload;
  DocumentModel? cavPipingDiagramUpload;
  DocumentModel? cavPressureCalculationsUpload;
  DocumentModel? cavStorageEquipmentDetailsUpload;
  DocumentModel? cavSafetyControlDetailsUpload;

  DocumentModel? conveyorSystemLayoutUpload;
  DocumentModel? conveyorEquipmentSpecificationsUpload;
  DocumentModel? conveyorCapacityCalculationsUpload;
  DocumentModel? conveyorControlSafetyDetailsUpload;

  // Supporting Documents.
  DocumentModel? relatedBuildingPermitUpload;
  DocumentModel? equipmentCertificationsUpload; // optional, "when applicable"
  DocumentModel? manufacturerCertificationsUpload; // optional, "when applicable"
  DocumentModel? testingCommissioningPlanUpload;
  DocumentModel? installationScheduleUpload; // optional, "when available"
  DocumentModel? otherMechanicalDocumentsUpload; // optional

  bool isValid({
    required bool hasFireSprinkler,
    required bool hasBoiler,
    required bool hasPressureVessel,
    required bool hasRefrigerationGroup,
    required bool hasAirConditioningGroup,
    required bool hasMechanicalVentilation,
    required bool hasPowerPiping,
    required bool hasElevatorGroup,
    required bool hasPumps,
    required bool hasCompressedAirOrVacuumGroup,
    required bool hasGasGroup,
    required bool hasConveyorGroup,
  }) {
    final baseValid = equipmentLayoutUpload != null &&
        schematicDiagramsUpload != null &&
        equipmentSchedulesUpload != null &&
        controlDiagramsUpload != null &&
        generalNotesUpload != null &&
        billOfMaterialsUpload != null &&
        costEstimateUpload != null &&
        equipmentSpecificationsUpload != null &&
        manufacturerDataSheetsUpload != null &&
        relatedBuildingPermitUpload != null &&
        testingCommissioningPlanUpload != null;
    if (!baseValid) return false;

    if (hasFireSprinkler &&
        (sprinklerLayoutUpload == null || hydraulicCalculationsUpload == null)) {
      return false;
    }
    if (hasBoiler &&
        (boilerLayoutUpload == null || safetyControlDetailsUpload == null)) {
      return false;
    }
    if (hasPressureVessel &&
        (pressureCalculationsUpload == null ||
            manufacturerCertificationUpload == null)) {
      return false;
    }
    if (hasRefrigerationGroup &&
        (refrigerationLayoutUpload == null ||
            coolingLoadCalculationsUpload == null)) {
      return false;
    }
    if (hasAirConditioningGroup &&
        (acCoolingLoadCalculationsUpload == null ||
            airConditioningLayoutUpload == null)) {
      return false;
    }
    if (hasMechanicalVentilation &&
        (ventilationLayoutUpload == null || airflowCalculationsUpload == null)) {
      return false;
    }
    if (hasPowerPiping &&
        (pipingLayoutUpload == null || pipingPressureCalculationsUpload == null)) {
      return false;
    }
    if (hasElevatorGroup &&
        (verticalTransportEquipmentLayoutUpload == null ||
            manufacturerSpecificationsUpload == null)) {
      return false;
    }
    if (hasPumps && (pumpScheduleUpload == null || capacityHeadCalculationsUpload == null)) {
      return false;
    }
    // "Compressed Air, Vacuum or Gas Systems" is one shared document
    // group on the official form — required whenever either equipment
    // group is selected.
    if ((hasCompressedAirOrVacuumGroup || hasGasGroup) &&
        (cavPipingDiagramUpload == null || cavSafetyControlDetailsUpload == null)) {
      return false;
    }
    if (hasConveyorGroup &&
        (conveyorSystemLayoutUpload == null ||
            conveyorControlSafetyDetailsUpload == null)) {
      return false;
    }

    return true;
  }
}

/// Step 8 — Review & Declaration: the nine certifications required before
/// the mechanical application can be submitted.
class MechanicalReviewDeclaration {
  bool certifiesTrueAndCorrect = false;
  bool confirmsPlansPreparedByLicensedProfessional = false;
  bool understandsMustFollowApprovedPlansAndCodes = false;
  bool understandsRequiresLicensedSupervisor = false;
  bool understandsNoticeOfConstructionMayBeRequired = false;
  bool understandsCompletionDocumentsMayBeRequired = false;
  bool understandsRequiresValidBuildingPermit = false;
  bool understandsCertificateOfOperationRequired = false;
  bool agreesToTerms = false;

  bool get isValid =>
      certifiesTrueAndCorrect &&
      confirmsPlansPreparedByLicensedProfessional &&
      understandsMustFollowApprovedPlansAndCodes &&
      understandsRequiresLicensedSupervisor &&
      understandsNoticeOfConstructionMayBeRequired &&
      understandsCompletionDocumentsMayBeRequired &&
      understandsRequiresValidBuildingPermit &&
      understandsCertificateOfOperationRequired &&
      agreesToTerms;
}

/// Per-document-group evaluation status shown in Step 9's read-only
/// "Document Evaluation" summary.
enum MechanicalDocumentEvaluationStatus {
  pendingReview,
  accepted,
  revisionRequired,
  missing,
  notApplicable,
}

extension MechanicalDocumentEvaluationStatusX on MechanicalDocumentEvaluationStatus {
  String get label {
    switch (this) {
      case MechanicalDocumentEvaluationStatus.pendingReview:
        return 'Pending Review';
      case MechanicalDocumentEvaluationStatus.accepted:
        return 'Accepted';
      case MechanicalDocumentEvaluationStatus.revisionRequired:
        return 'Revision Required';
      case MechanicalDocumentEvaluationStatus.missing:
        return 'Missing';
      case MechanicalDocumentEvaluationStatus.notApplicable:
        return 'Not Applicable';
    }
  }
}

/// Frontend-only permit status values the applicant can observe but never
/// set. [invalidWithoutBuildingPermit] is never chosen directly — it is
/// always derived (see [MechanicalPermitDraft.derivedPermitStatus]).
enum MechanicalPermitStatus {
  submitted,
  underEvaluation,
  revisionRequired,
  additionalDocumentsRequired,
  forApproval,
  approved,
  rejected,
  invalidWithoutBuildingPermit,
  awaitingCertificateOfOperation,
  operational,
  expired,
}

extension MechanicalPermitStatusX on MechanicalPermitStatus {
  String get label {
    switch (this) {
      case MechanicalPermitStatus.submitted:
        return 'Submitted';
      case MechanicalPermitStatus.underEvaluation:
        return 'Under Evaluation';
      case MechanicalPermitStatus.revisionRequired:
        return 'Revision Required';
      case MechanicalPermitStatus.additionalDocumentsRequired:
        return 'Additional Documents Required';
      case MechanicalPermitStatus.forApproval:
        return 'For Approval';
      case MechanicalPermitStatus.approved:
        return 'Approved';
      case MechanicalPermitStatus.rejected:
        return 'Rejected';
      case MechanicalPermitStatus.invalidWithoutBuildingPermit:
        return 'Invalid Without Building Permit';
      case MechanicalPermitStatus.awaitingCertificateOfOperation:
        return 'Awaiting Certificate of Operation';
      case MechanicalPermitStatus.operational:
        return 'Operational';
      case MechanicalPermitStatus.expired:
        return 'Expired';
    }
  }
}

/// Step 9 — Evaluation & Permit Status. Every field here is
/// office-controlled — there is no applicant-editable state in this class
/// at all, only fixed "pending" defaults. This step therefore has no
/// blocking validity condition; Continue always submits for evaluation.
/// The Certificate of Operation is a genuinely separate, later process —
/// never marked complete just because the application was submitted.
class MechanicalEvaluationPermitStatus {
  static const Map<String, MechanicalDocumentEvaluationStatus> documentEvaluation = {
    'Mechanical Plans and Specifications':
        MechanicalDocumentEvaluationStatus.pendingReview,
    'Bill of Materials': MechanicalDocumentEvaluationStatus.pendingReview,
    'Cost Estimate': MechanicalDocumentEvaluationStatus.pendingReview,
    'Equipment-Specific Documents': MechanicalDocumentEvaluationStatus.pendingReview,
    'Other Submitted Documents': MechanicalDocumentEvaluationStatus.pendingReview,
  };

  static const List<String> progressStages = [
    'Mechanical Documents Received',
    'Plan Review',
    'Equipment Review',
    'Technical Evaluation',
    'Cost Review',
    'Recommending Approval',
    'Building Official Decision',
  ];

  static const String actionTaken = 'Pending Assessment';
  static const String recommendingApproval = 'Pending Assessment';
  static const String permitIssuedBy = 'Pending Assessment';
  static const String certificateOfOperationStatus = 'Not Yet Applicable';

  static const List<String> permitConditions = [
    'Mechanical work must follow the approved mechanical plans and applicable codes.',
    'A Notice of Construction must be submitted when required before work begins.',
    'A licensed supervisor or Mechanical Engineer must oversee the work.',
    'Required logbook entries, as-built plans, and completion documents must be submitted.',
    'The Mechanical Permit is invalid without the related Building Permit.',
    'A Certificate of Operation is required for continuous use of applicable mechanical installations.',
  ];

  bool get isValid => true;
}

enum MechanicalPermitDraftStatus { draft, submitted }

/// The full mutable draft for one Mechanical Permit application session.
class MechanicalPermitDraft {
  final MechanicalApplicantInfo applicant = MechanicalApplicantInfo();
  final MechanicalApplicantAddress applicantAddress = MechanicalApplicantAddress();
  final MechanicalProjectLocation projectLocation = MechanicalProjectLocation();
  final MechanicalRelatedBuildingPermit relatedBuildingPermit =
      MechanicalRelatedBuildingPermit();
  final MechanicalScopeOfWork scopeOfWork = MechanicalScopeOfWork();
  final MechanicalInstallationDetails installationDetails =
      MechanicalInstallationDetails();
  final MechanicalProfessionals professionals = MechanicalProfessionals();
  final MechanicalOwnershipConsent ownershipConsent = MechanicalOwnershipConsent();
  final MechanicalRequiredDocuments requiredDocuments = MechanicalRequiredDocuments();
  final MechanicalReviewDeclaration reviewDeclaration = MechanicalReviewDeclaration();
  final MechanicalEvaluationPermitStatus evaluationPermitStatus =
      MechanicalEvaluationPermitStatus();

  bool useApplicantAddressForProjectLocation = false;
  MechanicalPermitDraftStatus status = MechanicalPermitDraftStatus.draft;
  DateTime? lastSavedAt;

  bool get isStep1Valid => applicant.isValid;
  bool get isStep2Valid =>
      applicantAddress.isValid && projectLocation.isValid && relatedBuildingPermit.isValid;
  bool get isStep3Valid => scopeOfWork.isValid;
  bool get isStep4Valid => installationDetails.isValid;
  bool get isStep5Valid => professionals.isValid;
  bool get isStep6Valid => ownershipConsent.isValid;
  bool get isStep7Valid => requiredDocuments.isValid(
        hasFireSprinkler: installationDetails.hasFireSprinkler,
        hasBoiler: installationDetails.hasBoiler,
        hasPressureVessel: installationDetails.hasPressureVessel,
        hasRefrigerationGroup: installationDetails.hasRefrigerationGroup,
        hasAirConditioningGroup: installationDetails.hasAirConditioningGroup,
        hasMechanicalVentilation: installationDetails.hasMechanicalVentilation,
        hasPowerPiping: installationDetails.hasPowerPiping,
        hasElevatorGroup: installationDetails.hasElevatorGroup,
        hasPumps: installationDetails.hasPumps,
        hasCompressedAirOrVacuumGroup:
            installationDetails.hasCompressedAirOrVacuumGroup,
        hasGasGroup: installationDetails.hasGasGroup,
        hasConveyorGroup: installationDetails.hasConveyorGroup,
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
  MechanicalPermitStatus get derivedPermitStatus {
    if (!relatedBuildingPermit.hasValidBuildingPermitReference) {
      return MechanicalPermitStatus.invalidWithoutBuildingPermit;
    }
    return MechanicalPermitStatus.submitted;
  }
}
