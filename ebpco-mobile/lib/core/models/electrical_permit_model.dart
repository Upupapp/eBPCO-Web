import '../utils/validators.dart';
import 'document_model.dart';

/// Mock, frontend-only data model for the Electrical Permit application
/// wizard. Based on the official Electrical Permit form, and — like the
/// Architectural and Civil / Structural Permits — an ancillary permit that
/// references a related Building Permit but never reads or mutates
/// [BuildingPermitProvider]'s state, so this model is fully decoupled
/// from all other permit models.

enum PermitType { electrical }

extension PermitTypeX on PermitType {
  String get label => 'Electrical Permit';
}

/// Duplicated (not imported) from the other permit models to keep all
/// permit models fully decoupled.
const List<String> electricalFormsOfOwnership = [
  'Sole Proprietorship',
  'Partnership',
  'Corporation',
  'Cooperative',
  'Government',
  'Others',
];

/// Duplicated (not imported) from the other permit models. Distinct group
/// wording from Demolition/Architectural/Civil-Structural's occupancy
/// enums per this permit's own official form.
enum ElectricalOccupancyGroup {
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

extension ElectricalOccupancyGroupX on ElectricalOccupancyGroup {
  String get label {
    switch (this) {
      case ElectricalOccupancyGroup.groupA:
        return 'Group A — Residential Dwelling';
      case ElectricalOccupancyGroup.groupB:
        return 'Group B — Residential Hotel or Apartment';
      case ElectricalOccupancyGroup.groupC:
        return 'Group C — Education and Recreation';
      case ElectricalOccupancyGroup.groupD:
        return 'Group D — Institutional';
      case ElectricalOccupancyGroup.groupE:
        return 'Group E — Business and Mercantile';
      case ElectricalOccupancyGroup.groupF:
        return 'Group F — Industrial';
      case ElectricalOccupancyGroup.groupG:
        return 'Group G — Storage and Hazardous';
      case ElectricalOccupancyGroup.groupH:
        return 'Group H — Assembly';
      case ElectricalOccupancyGroup.groupI:
        return 'Group I — Assembly with Higher Occupant Load';
      case ElectricalOccupancyGroup.groupJ:
        return 'Group J — Accessory';
      case ElectricalOccupancyGroup.others:
        return 'Others';
    }
  }
}

/// Step 1 — Applicant Information. Permit Type is fixed to "Electrical
/// Permit" and not editable.
class ElectricalApplicantInfo {
  final PermitType permitType = PermitType.electrical;

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
class ElectricalApplicantAddress {
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
class ElectricalProjectLocation {
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
const List<String> electricalMockBuildingPermitNumbers = [
  'BP-2026-100234',
  'BP-2026-100567',
  'BP-2026-100812',
];

/// Step 2 (part 3) — Related Building Permit. The Electrical Permit is
/// invalid without one, EXCEPT for a purely electrical project on an
/// existing building, where the existing (already-issued) Building
/// Permit number alone is an accepted reference (see
/// [hasValidBuildingPermitReference]).
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

class ElectricalRelatedBuildingPermit {
  String buildingPermitNumber = '';
  RelatedBuildingPermitStatus status = RelatedBuildingPermitStatus.pending;

  /// "Is this a purely electrical project on an existing building?" — Yes
  /// lets the applicant reference an existing, already-issued Building
  /// Permit by number alone, without needing the mock [status] field to
  /// read "Approved".
  bool isPurelyElectricalOnExistingBuilding = false;

  bool get hasValidBuildingPermitReference {
    if (isPurelyElectricalOnExistingBuilding) {
      return Validators.required(buildingPermitNumber) == null;
    }
    return status == RelatedBuildingPermitStatus.approved &&
        Validators.required(buildingPermitNumber) == null;
  }

  bool get isValid {
    if (isPurelyElectricalOnExistingBuilding) {
      return Validators.required(
            buildingPermitNumber,
            fieldLabel: 'Building Permit Number',
          ) ==
          null;
    }
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
enum ElectricalScopeType {
  newInstallation,
  annualInspection,
  temporaryInstallation,
  reconnectionOfServiceEntrance,
  separationOfServiceEntrance,
  upgradingOfServiceEntrance,
  relocationOfServiceEntrance,
  others,
}

extension ElectricalScopeTypeX on ElectricalScopeType {
  String get label {
    switch (this) {
      case ElectricalScopeType.newInstallation:
        return 'New Installation';
      case ElectricalScopeType.annualInspection:
        return 'Annual Inspection';
      case ElectricalScopeType.temporaryInstallation:
        return 'Temporary Installation';
      case ElectricalScopeType.reconnectionOfServiceEntrance:
        return 'Reconnection of Service Entrance';
      case ElectricalScopeType.separationOfServiceEntrance:
        return 'Separation of Service Entrance';
      case ElectricalScopeType.upgradingOfServiceEntrance:
        return 'Upgrading of Service Entrance';
      case ElectricalScopeType.relocationOfServiceEntrance:
        return 'Relocation of Service Entrance';
      case ElectricalScopeType.others:
        return 'Others';
    }
  }
}

/// Step 3 — Scope of Electrical Work. Multiple scopes may be selected;
/// [primaryScope] records which one is the primary scope (must be one of
/// [selectedScopes]).
class ElectricalScopeOfWork {
  final Set<ElectricalScopeType> selectedScopes = {};
  ElectricalScopeType? primaryScope;
  String otherScopeDescription = '';

  String workTitle = '';
  String generalDescription = '';
  String existingElectricalCondition = '';
  String proposedElectricalChanges = '';

  // Reconnection of Service Entrance
  String previousServiceDetails = '';
  String reasonForChange = '';

  // Separation of Service Entrance
  String separationServicesDescription = '';

  // Upgrading of Service Entrance
  String existingServiceCapacity = '';
  String proposedServiceCapacity = '';

  // Relocation of Service Entrance
  String existingServiceEntranceLocation = '';
  String proposedServiceEntranceLocation = '';

  // Temporary Installation
  DateTime? expectedRemovalDate;

  // Annual Inspection — optional, "when available"
  String previousInspectionReference = '';

  bool get hasNewInstallation =>
      selectedScopes.contains(ElectricalScopeType.newInstallation);
  bool get hasAnnualInspection =>
      selectedScopes.contains(ElectricalScopeType.annualInspection);
  bool get hasTemporaryInstallation =>
      selectedScopes.contains(ElectricalScopeType.temporaryInstallation);
  bool get hasReconnection => selectedScopes.contains(
    ElectricalScopeType.reconnectionOfServiceEntrance,
  );
  bool get hasSeparation =>
      selectedScopes.contains(ElectricalScopeType.separationOfServiceEntrance);
  bool get hasUpgrading =>
      selectedScopes.contains(ElectricalScopeType.upgradingOfServiceEntrance);
  bool get hasRelocation =>
      selectedScopes.contains(ElectricalScopeType.relocationOfServiceEntrance);

  bool get isValid {
    if (selectedScopes.isEmpty) return false;
    if (primaryScope == null || !selectedScopes.contains(primaryScope)) {
      return false;
    }
    if (selectedScopes.contains(ElectricalScopeType.others) &&
        Validators.required(otherScopeDescription) != null) {
      return false;
    }
    if (Validators.required(workTitle) != null) return false;
    if (Validators.required(generalDescription) != null) return false;
    if (Validators.required(existingElectricalCondition) != null) return false;
    if (Validators.required(proposedElectricalChanges) != null) return false;

    if (hasReconnection) {
      if (Validators.required(previousServiceDetails) != null) return false;
      if (Validators.required(reasonForChange) != null) return false;
    }
    if (hasSeparation &&
        Validators.required(separationServicesDescription) != null) {
      return false;
    }
    if (hasUpgrading) {
      if (Validators.required(existingServiceCapacity) != null) return false;
      if (Validators.required(proposedServiceCapacity) != null) return false;
    }
    if (hasRelocation) {
      if (Validators.required(existingServiceEntranceLocation) != null) {
        return false;
      }
      if (Validators.required(proposedServiceEntranceLocation) != null) {
        return false;
      }
    }
    if (hasTemporaryInstallation && expectedRemovalDate == null) return false;

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

String? _nonNegativeDecimal(String? value, String fieldLabel) {
  if (value == null || value.trim().isEmpty) return null;
  final parsed = double.tryParse(value.trim());
  if (parsed == null) return 'Enter a valid number.';
  if (parsed < 0) return '$fieldLabel cannot be negative.';
  return null;
}

String? _requiredPositiveDecimal(String? value, String fieldLabel) {
  if (value == null || value.trim().isEmpty) {
    return '$fieldLabel is required.';
  }
  final parsed = double.tryParse(value.trim());
  if (parsed == null) return 'Enter a valid number.';
  if (parsed <= 0) return '$fieldLabel must be greater than zero.';
  return null;
}

/// Step 4 — Occupancy, Outlets & Electrical Load. Every numeric field is
/// parsed via `tryParse` only — a temporarily empty or invalid field never
/// throws or renders `NaN`. Outlet counts are optional and default to
/// zero in summaries; the load/capacity/service fields are required.
class ElectricalInstallationDetails {
  ElectricalOccupancyGroup? occupancyGroup;
  String occupancyOtherDescription = '';

  // Number of Outlets — all optional, default to 0 when empty.
  String lightingOutlets = '';
  String convenienceOutlets = '';
  String specialPurposeAirConditioningOutlets = '';
  String specialPurposeCookingUnitOutlets = '';
  String specialPurposeWaterHeaterOutlets = '';
  String specialPurposeWaterPumpOutlets = '';
  String toggleSwitches = '';
  String bellBuzzers = '';
  String pushButtons = '';
  String fireAlarmDetectors = '';
  String otherOutlets = '';
  String otherOutletDescription = '';

  // Electrical Load and Capacity Summary.
  String totalConnectedLoadKva = '';
  String totalTransformerCapacityKva = '';
  String generatorCapacityKva = '';
  String upsCapacityKva = '';
  String mainServiceVoltage = '';
  String mainServiceCurrentAmperes = '';
  String numberOfPhases = '';
  String frequency = '';
  String powerFactor = '';

  static int _asInt(String value) => int.tryParse(value.trim()) ?? 0;
  static double _asDouble(String value) => double.tryParse(value.trim()) ?? 0;

  int get totalOutletsCount =>
      _asInt(lightingOutlets) +
      _asInt(convenienceOutlets) +
      _asInt(specialPurposeAirConditioningOutlets) +
      _asInt(specialPurposeCookingUnitOutlets) +
      _asInt(specialPurposeWaterHeaterOutlets) +
      _asInt(specialPurposeWaterPumpOutlets) +
      _asInt(toggleSwitches) +
      _asInt(bellBuzzers) +
      _asInt(pushButtons) +
      _asInt(fireAlarmDetectors) +
      _asInt(otherOutlets);

  bool get hasGeneratorCapacity => _asDouble(generatorCapacityKva) > 0;
  bool get hasUpsCapacity => _asDouble(upsCapacityKva) > 0;
  bool get hasFireAlarmDetectors => _asInt(fireAlarmDetectors) > 0;
  bool get hasOtherOutlets => _asInt(otherOutlets) > 0;

  /// "Electrical installations with a capacity of 200 amperes and above
  /// at 230 volts nominal and above require a specialty electrical
  /// contractor" — computed only, never user-overridable.
  bool get requiresElectricalContractor =>
      _asDouble(mainServiceCurrentAmperes) >= 200 &&
      _asDouble(mainServiceVoltage) >= 230;

  bool get isValid {
    if (occupancyGroup == null) return false;
    if (occupancyGroup == ElectricalOccupancyGroup.others &&
        Validators.required(occupancyOtherDescription) != null) {
      return false;
    }

    for (final entry in {
      'Lighting Outlets': lightingOutlets,
      'Convenience Outlets': convenienceOutlets,
      'Special-Purpose Air-Conditioning Outlets':
          specialPurposeAirConditioningOutlets,
      'Special-Purpose Cooking Unit Outlets': specialPurposeCookingUnitOutlets,
      'Special-Purpose Water Heater Outlets': specialPurposeWaterHeaterOutlets,
      'Special-Purpose Water Pump Outlets': specialPurposeWaterPumpOutlets,
      'Toggle Switches': toggleSwitches,
      'Bell / Buzzers': bellBuzzers,
      'Push Buttons': pushButtons,
      'Fire Alarm Detectors': fireAlarmDetectors,
      'Other Outlets': otherOutlets,
    }.entries) {
      if (_nonNegativeWholeNumber(entry.value, entry.key) != null) {
        return false;
      }
    }
    if (hasOtherOutlets && Validators.required(otherOutletDescription) != null) {
      return false;
    }

    if (_requiredPositiveDecimal(totalConnectedLoadKva, 'Total Connected Load') !=
        null) {
      return false;
    }
    if (_requiredPositiveDecimal(mainServiceVoltage, 'Main Service Voltage') !=
        null) {
      return false;
    }
    if (_requiredPositiveDecimal(
          mainServiceCurrentAmperes,
          'Main Service Current',
        ) !=
        null) {
      return false;
    }
    if (Validators.positiveWholeNumber(
          numberOfPhases,
          fieldLabel: 'Number of phases',
        ) !=
        null) {
      return false;
    }
    if (Validators.required(frequency) != null) return false;

    if (_nonNegativeDecimal(
          totalTransformerCapacityKva,
          'Total Transformer Capacity',
        ) !=
        null) {
      return false;
    }
    if (_nonNegativeDecimal(generatorCapacityKva, 'Generator Capacity') !=
        null) {
      return false;
    }
    if (_nonNegativeDecimal(upsCapacityKva, 'UPS Capacity') != null) {
      return false;
    }
    if (_nonNegativeDecimal(powerFactor, 'Power Factor') != null) return false;

    return true;
  }
}

/// Licensed professional type for the Supervisor / Electrical
/// Practitioner in charge. The Design Professional's profession is always
/// fixed to [professionalElectricalEngineer] (see
/// [ElectricalProfessionals]) — not user-selectable.
enum ElectricalProfessionType {
  professionalElectricalEngineer,
  registeredElectricalEngineer,
  registeredMasterElectrician,
}

extension ElectricalProfessionTypeX on ElectricalProfessionType {
  String get label {
    switch (this) {
      case ElectricalProfessionType.professionalElectricalEngineer:
        return 'Professional Electrical Engineer';
      case ElectricalProfessionType.registeredElectricalEngineer:
        return 'Registered Electrical Engineer';
      case ElectricalProfessionType.registeredMasterElectrician:
        return 'Registered Master Electrician';
    }
  }
}

/// Shared license/contact shape for both the Design Professional and the
/// Supervisor — kept internal to this model only, so it introduces no
/// coupling with any other permit.
class ElectricalProfessionalInfo {
  String fullName = '';
  ElectricalProfessionType? profession;
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

/// Step 5 (part 3) — Electrical Contractor, required only when
/// [ElectricalInstallationDetails.requiresElectricalContractor] is true.
class ElectricalContractor {
  String contractorName = '';
  String contractorAddress = '';
  String pcabLicenseNumber = '';
  DateTime? pcabLicenseValidityDate;
  String electricalWorksClassification = '';
  String contactNumber = '';

  DocumentModel? pcabLicenseUpload;
  DocumentModel? contractorAccreditationUpload;
  DocumentModel? contractorAuthorizationUpload;

  bool get isValid =>
      Validators.required(contractorName) == null &&
      Validators.required(contractorAddress) == null &&
      Validators.required(pcabLicenseNumber) == null &&
      pcabLicenseValidityDate != null &&
      Validators.required(electricalWorksClassification) == null &&
      Validators.required(
            contactNumber,
            fieldLabel: 'Contact number',
          ) ==
          null &&
      pcabLicenseUpload != null &&
      contractorAccreditationUpload != null &&
      contractorAuthorizationUpload != null;
}

/// Step 5 — Electrical Professionals & Contractor. When the Supervisor is
/// the same person as the Design Professional, the supervisor's own
/// fields/uploads are never populated — Step 7's document checklist reads
/// the Design Professional's uploads for both roles in that case.
class ElectricalProfessionals {
  final ElectricalProfessionalInfo designProfessional = ElectricalProfessionalInfo()
    ..profession = ElectricalProfessionType.professionalElectricalEngineer;
  DocumentModel? designPrcIdUpload;
  DocumentModel? designPtrDocumentUpload;
  DocumentModel? signedSealedPlansUpload;
  DocumentModel? signedSealedSpecificationsUpload;
  DocumentModel? signedLoadCalculationsUpload;

  bool isSupervisorSameAsDesignProfessional = true;
  final ElectricalProfessionalInfo supervisor = ElectricalProfessionalInfo();
  DocumentModel? supervisorPrcIdUpload;
  DocumentModel? supervisorPtrUpload;
  DocumentModel? signedSupervisorConfirmationUpload;

  /// Voluntary opt-in so the applicant may still document a contractor
  /// below the mandatory threshold; never lets them opt OUT above it (see
  /// [ElectricalInstallationDetails.requiresElectricalContractor]).
  bool contractorVoluntarilyIndicated = false;
  final ElectricalContractor contractor = ElectricalContractor();

  bool isValid({required bool contractorRequired}) {
    final designValid = designProfessional.isValid &&
        designPrcIdUpload != null &&
        designPtrDocumentUpload != null &&
        signedSealedPlansUpload != null &&
        signedSealedSpecificationsUpload != null &&
        signedLoadCalculationsUpload != null;
    if (!designValid) return false;

    if (!isSupervisorSameAsDesignProfessional) {
      final supervisorValid = supervisor.isValid &&
          supervisorPrcIdUpload != null &&
          supervisorPtrUpload != null &&
          signedSupervisorConfirmationUpload != null;
      if (!supervisorValid) return false;
    }

    if (contractorRequired && !contractor.isValid) return false;
    return true;
  }
}

/// Shared owner-identity shape for both the Building Owner and the Lot
/// Owner in Step 6 — internal to this model only.
class ElectricalOwnerInfo {
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
class ElectricalOwnershipConsent {
  bool? isApplicantBuildingOwner;
  final ElectricalOwnerInfo buildingOwner = ElectricalOwnerInfo();

  bool? isBuildingOwnerAlsoLotOwner;
  final ElectricalOwnerInfo lotOwner = ElectricalOwnerInfo();

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

/// Step 7 — Required Electrical Documents. Professional documents already
/// collected in Step 5 (PRC IDs, PTRs, signed and sealed plans/
/// specifications/load calculations) are intentionally NOT duplicated
/// here — the UI reads/writes [ElectricalProfessionals]'s fields directly,
/// and Contractor documents likewise reuse [ElectricalContractor]'s.
class ElectricalRequiredDocuments {
  // Electrical Plans and Specifications (base, mostly always required;
  // Single-Line Diagram and Load Schedule are the two explicitly called
  // out as required by "New Installation" in the conditional rules, but
  // are required unconditionally here since virtually every scope needs
  // them).
  DocumentModel? singleLineDiagramUpload;
  DocumentModel? loadScheduleUpload;
  DocumentModel? panelboardScheduleUpload;
  DocumentModel? serviceEntranceDetailsUpload;
  DocumentModel? groundingDetailsUpload;
  DocumentModel? electricalLayoutPlansUpload;
  DocumentModel? lightingLayoutUpload;
  DocumentModel? powerLayoutUpload;
  DocumentModel? fireAlarmLayoutUpload; // conditional — fire alarm detectors > 0

  // Load and Capacity Documents.
  DocumentModel? transformerCapacityDetailsUpload; // optional, "when applicable"
  DocumentModel? shortCircuitCalculationUpload; // optional, "when applicable"
  DocumentModel? voltageDropCalculationUpload; // optional, "when applicable"

  // Special Fixtures and Equipment.
  DocumentModel? specialFixturesScheduleUpload;
  DocumentModel? equipmentSpecificationsUpload;
  DocumentModel? airConditioningEquipmentScheduleUpload;
  DocumentModel? cookingEquipmentScheduleUpload;
  DocumentModel? waterHeaterScheduleUpload;
  DocumentModel? waterPumpScheduleUpload;
  DocumentModel? generatorDetailsUpload; // conditional — generator capacity > 0
  DocumentModel? upsDetailsUpload; // conditional — UPS capacity > 0
  DocumentModel? fireAlarmDetectorScheduleUpload; // conditional — fire alarm detectors > 0
  DocumentModel? otherEquipmentDocumentsUpload; // optional

  // Scope-conditional documents (Step 3).
  DocumentModel? existingServiceRecordUpload; // reconnection
  DocumentModel? utilityCoordinationUpload; // reconnection
  DocumentModel? separateServiceDiagramUpload; // separation
  DocumentModel? existingLoadCalculationUpload; // upgrading
  DocumentModel? proposedLoadCalculationUpload; // upgrading
  DocumentModel? existingServiceEntrancePlanUpload; // relocation
  DocumentModel? proposedServiceEntrancePlanUpload; // relocation
  DocumentModel? temporaryElectricalLayoutUpload; // temporary installation
  DocumentModel? removalScheduleUpload; // temporary installation

  // Project Schedule.
  DocumentModel? workScheduleUpload; // optional, "when available"

  // Supporting Documents.
  DocumentModel? relatedBuildingPermitUpload;
  DocumentModel? previousElectricalPermitUpload; // optional, "when applicable"
  DocumentModel? existingServiceRecordsUpload; // optional, "when applicable"
  DocumentModel? utilityProviderApprovalUpload; // optional, "when applicable"
  DocumentModel? otherElectricalDocumentsUpload; // optional

  bool isValid({
    required bool hasFireAlarmDetectors,
    required bool hasGeneratorCapacity,
    required bool hasUpsCapacity,
    required bool hasReconnection,
    required bool hasSeparation,
    required bool hasUpgrading,
    required bool hasRelocation,
    required bool hasTemporaryInstallation,
  }) {
    final baseValid = singleLineDiagramUpload != null &&
        loadScheduleUpload != null &&
        panelboardScheduleUpload != null &&
        serviceEntranceDetailsUpload != null &&
        groundingDetailsUpload != null &&
        electricalLayoutPlansUpload != null &&
        lightingLayoutUpload != null &&
        powerLayoutUpload != null &&
        specialFixturesScheduleUpload != null &&
        equipmentSpecificationsUpload != null &&
        relatedBuildingPermitUpload != null;
    if (!baseValid) return false;

    if (hasFireAlarmDetectors &&
        (fireAlarmLayoutUpload == null ||
            fireAlarmDetectorScheduleUpload == null)) {
      return false;
    }
    if (hasGeneratorCapacity && generatorDetailsUpload == null) return false;
    if (hasUpsCapacity && upsDetailsUpload == null) return false;

    if (hasReconnection &&
        (existingServiceRecordUpload == null ||
            utilityCoordinationUpload == null)) {
      return false;
    }
    if (hasSeparation && separateServiceDiagramUpload == null) return false;
    if (hasUpgrading &&
        (existingLoadCalculationUpload == null ||
            proposedLoadCalculationUpload == null)) {
      return false;
    }
    if (hasRelocation &&
        (existingServiceEntrancePlanUpload == null ||
            proposedServiceEntrancePlanUpload == null)) {
      return false;
    }
    if (hasTemporaryInstallation &&
        (temporaryElectricalLayoutUpload == null ||
            removalScheduleUpload == null)) {
      return false;
    }

    return true;
  }
}

/// Step 8 — Review & Declaration: the ten certifications required before
/// the electrical application can be submitted.
class ElectricalReviewDeclaration {
  bool certifiesTrueAndCorrect = false;
  bool confirmsPlansPreparedByLicensedProfessional = false;
  bool understandsMustFollowApprovedPlansAndCodes = false;
  bool understandsRequiresLicensedSupervisor = false;
  bool understandsContractorRequiredAtThreshold = false;
  bool understandsNoticeOfConstructionMayBeRequired = false;
  bool understandsCompletionDocumentsMayBeRequired = false;
  bool understandsFinalInspectionRequiredBeforeOccupancy = false;
  bool understandsRequiresValidBuildingPermit = false;
  bool agreesToTerms = false;

  bool get isValid =>
      certifiesTrueAndCorrect &&
      confirmsPlansPreparedByLicensedProfessional &&
      understandsMustFollowApprovedPlansAndCodes &&
      understandsRequiresLicensedSupervisor &&
      understandsContractorRequiredAtThreshold &&
      understandsNoticeOfConstructionMayBeRequired &&
      understandsCompletionDocumentsMayBeRequired &&
      understandsFinalInspectionRequiredBeforeOccupancy &&
      understandsRequiresValidBuildingPermit &&
      agreesToTerms;
}

/// Per-document-group evaluation status shown in Step 9's read-only
/// "Document Evaluation" summary.
enum ElectricalDocumentEvaluationStatus {
  pendingReview,
  accepted,
  revisionRequired,
  missing,
  notApplicable,
}

extension ElectricalDocumentEvaluationStatusX
    on ElectricalDocumentEvaluationStatus {
  String get label {
    switch (this) {
      case ElectricalDocumentEvaluationStatus.pendingReview:
        return 'Pending Review';
      case ElectricalDocumentEvaluationStatus.accepted:
        return 'Accepted';
      case ElectricalDocumentEvaluationStatus.revisionRequired:
        return 'Revision Required';
      case ElectricalDocumentEvaluationStatus.missing:
        return 'Missing';
      case ElectricalDocumentEvaluationStatus.notApplicable:
        return 'Not Applicable';
    }
  }
}

/// How the applicant intends to pay once assessment is complete —
/// recorded but never actionable in this prototype (mirrors the same
/// non-actionable payment-preference pattern used by the Demolition
/// Permit's evaluation step).
enum ElectricalPaymentMethod { payOnsite, bankTransfer }

extension ElectricalPaymentMethodX on ElectricalPaymentMethod {
  String get label =>
      this == ElectricalPaymentMethod.payOnsite ? 'Pay Onsite' : 'Bank Transfer';
}

/// Frontend-only permit status values the applicant can observe but never
/// set. [invalidWithoutBuildingPermit] is never chosen directly — it is
/// always derived (see [ElectricalPermitDraft.derivedPermitStatus]).
enum ElectricalPermitStatus {
  submitted,
  underEvaluation,
  revisionRequired,
  additionalDocumentsRequired,
  assessedForPayment,
  forApproval,
  approved,
  rejected,
  invalidWithoutBuildingPermit,
  awaitingFinalElectricalInspection,
  completed,
}

extension ElectricalPermitStatusX on ElectricalPermitStatus {
  String get label {
    switch (this) {
      case ElectricalPermitStatus.submitted:
        return 'Submitted';
      case ElectricalPermitStatus.underEvaluation:
        return 'Under Evaluation';
      case ElectricalPermitStatus.revisionRequired:
        return 'Revision Required';
      case ElectricalPermitStatus.additionalDocumentsRequired:
        return 'Additional Documents Required';
      case ElectricalPermitStatus.assessedForPayment:
        return 'Assessed for Payment';
      case ElectricalPermitStatus.forApproval:
        return 'For Approval';
      case ElectricalPermitStatus.approved:
        return 'Approved';
      case ElectricalPermitStatus.rejected:
        return 'Rejected';
      case ElectricalPermitStatus.invalidWithoutBuildingPermit:
        return 'Invalid Without Building Permit';
      case ElectricalPermitStatus.awaitingFinalElectricalInspection:
        return 'Awaiting Final Electrical Inspection';
      case ElectricalPermitStatus.completed:
        return 'Completed';
    }
  }
}

/// Step 9 — Evaluation, Assessment & Permit Status. Every field here is
/// office-controlled — there is no applicant-editable state in this class
/// except [selectedPaymentMethod], a non-actionable preference. This step
/// therefore has no blocking validity condition; Continue always submits
/// for evaluation.
class ElectricalEvaluationPermitStatus {
  /// The applicant's preferred payment method for later, once a mock
  /// assessment exists — recorded but never actionable in this prototype.
  ElectricalPaymentMethod? selectedPaymentMethod;

  static const Map<String, ElectricalDocumentEvaluationStatus>
  documentEvaluation = {
    'Electrical Plans and Specifications':
        ElectricalDocumentEvaluationStatus.pendingReview,
    'Special Fixtures and Equipment':
        ElectricalDocumentEvaluationStatus.pendingReview,
    'Starting Date': ElectricalDocumentEvaluationStatus.pendingReview,
    'Expected Completion Date': ElectricalDocumentEvaluationStatus.pendingReview,
    'Other Documents': ElectricalDocumentEvaluationStatus.pendingReview,
  };

  static const List<String> progressStages = [
    'Electrical Documents Received',
    'Plan Review',
    'Load Review',
    'Technical Evaluation',
    'Contractor Verification',
    'Assessment',
    'Recommending Approval',
    'Building Official Decision',
  ];

  static const String electricalFee = 'Pending Assessment';
  static const String otherFees = 'Pending Assessment';
  static const String total = 'Pending Assessment';
  static const String officialReceiptNumber = 'Pending Assessment';
  static const String datePaid = 'Pending Assessment';
  static const String processedBy = 'Pending Assessment';

  static const String actionTaken = 'Pending Assessment';
  static const String recommendingApproval = 'Pending Assessment';
  static const String permitIssuedBy = 'Pending Assessment';
  static const String finalElectricalInspectionStatus = 'Not Yet Scheduled';

  static const List<String> permitConditions = [
    'Electrical work must follow the approved plans and applicable electrical codes.',
    'A Notice of Construction must be submitted when required before installation.',
    'A PCAB-licensed specialty contractor is required for qualifying installations.',
    'A licensed electrical practitioner must supervise the work.',
    'Required logbook entries, as-built plans, and completion documents must be submitted.',
    'A Certificate of Final Electrical Inspection is required before actual occupancy.',
    'The permit must be posted at the work site.',
    'The Electrical Permit is invalid without the required Building Permit reference.',
  ];

  bool get isValid => true;
}

enum ElectricalPermitDraftStatus { draft, submitted }

/// The full mutable draft for one Electrical Permit application session.
class ElectricalPermitDraft {
  final ElectricalApplicantInfo applicant = ElectricalApplicantInfo();
  final ElectricalApplicantAddress applicantAddress = ElectricalApplicantAddress();
  final ElectricalProjectLocation projectLocation = ElectricalProjectLocation();
  final ElectricalRelatedBuildingPermit relatedBuildingPermit =
      ElectricalRelatedBuildingPermit();
  final ElectricalScopeOfWork scopeOfWork = ElectricalScopeOfWork();
  final ElectricalInstallationDetails installationDetails =
      ElectricalInstallationDetails();
  final ElectricalProfessionals professionals = ElectricalProfessionals();
  final ElectricalOwnershipConsent ownershipConsent = ElectricalOwnershipConsent();
  final ElectricalRequiredDocuments requiredDocuments =
      ElectricalRequiredDocuments();
  final ElectricalReviewDeclaration reviewDeclaration =
      ElectricalReviewDeclaration();
  final ElectricalEvaluationPermitStatus evaluationPermitStatus =
      ElectricalEvaluationPermitStatus();

  bool useApplicantAddressForProjectLocation = false;
  ElectricalPermitDraftStatus status = ElectricalPermitDraftStatus.draft;
  DateTime? lastSavedAt;

  bool get isStep1Valid => applicant.isValid;
  bool get isStep2Valid =>
      applicantAddress.isValid && projectLocation.isValid && relatedBuildingPermit.isValid;
  bool get isStep3Valid => scopeOfWork.isValid;
  bool get isStep4Valid => installationDetails.isValid;
  bool get isStep5Valid => professionals.isValid(
        contractorRequired: installationDetails.requiresElectricalContractor,
      );
  bool get isStep6Valid => ownershipConsent.isValid;
  bool get isStep7Valid => requiredDocuments.isValid(
        hasFireAlarmDetectors: installationDetails.hasFireAlarmDetectors,
        hasGeneratorCapacity: installationDetails.hasGeneratorCapacity,
        hasUpsCapacity: installationDetails.hasUpsCapacity,
        hasReconnection: scopeOfWork.hasReconnection,
        hasSeparation: scopeOfWork.hasSeparation,
        hasUpgrading: scopeOfWork.hasUpgrading,
        hasRelocation: scopeOfWork.hasRelocation,
        hasTemporaryInstallation: scopeOfWork.hasTemporaryInstallation,
      ) &&
      professionals.designPrcIdUpload != null &&
      professionals.designPtrDocumentUpload != null &&
      (professionals.isSupervisorSameAsDesignProfessional ||
          (professionals.supervisorPrcIdUpload != null &&
              professionals.supervisorPtrUpload != null)) &&
      (!installationDetails.requiresElectricalContractor ||
          (professionals.contractor.pcabLicenseUpload != null &&
              professionals.contractor.contractorAccreditationUpload != null &&
              professionals.contractor.contractorAuthorizationUpload != null));
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
  /// Building Permit reference isn't satisfied — this is the single
  /// source of truth Step 9's read-only status card renders from.
  ElectricalPermitStatus get derivedPermitStatus {
    if (!relatedBuildingPermit.hasValidBuildingPermitReference) {
      return ElectricalPermitStatus.invalidWithoutBuildingPermit;
    }
    return ElectricalPermitStatus.submitted;
  }
}
