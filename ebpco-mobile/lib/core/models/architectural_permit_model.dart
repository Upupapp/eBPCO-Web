import '../utils/validators.dart';
import 'document_model.dart';

/// Mock, frontend-only data model for the Architectural Permit application
/// wizard. Based on the official Architectural Permit form (Boxes 1-9).
/// The Architectural Permit is an ancillary permit — it references a
/// related Building Permit but never reads or mutates
/// [BuildingPermitProvider]'s state, so this model is fully decoupled from
/// all other permit models.

enum PermitType { architectural }

extension PermitTypeX on PermitType {
  String get label => 'Architectural Permit';
}

/// Duplicated (not imported) from the other permit models to keep all
/// permit models fully decoupled.
const List<String> architecturalFormsOfOwnership = [
  'Sole Proprietorship',
  'Partnership',
  'Corporation',
  'Cooperative',
  'Government',
  'Others',
];

/// Duplicated (not imported) from the Demolition model to keep all permit
/// models fully decoupled.
enum ArchitecturalOccupancyGroup {
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

extension ArchitecturalOccupancyGroupX on ArchitecturalOccupancyGroup {
  String get label {
    switch (this) {
      case ArchitecturalOccupancyGroup.groupA:
        return 'Group A — Residential, Dwellings';
      case ArchitecturalOccupancyGroup.groupB:
        return 'Group B — Residential Hotel, Apartment';
      case ArchitecturalOccupancyGroup.groupC:
        return 'Group C — Educational, Recreational';
      case ArchitecturalOccupancyGroup.groupD:
        return 'Group D — Institutional';
      case ArchitecturalOccupancyGroup.groupE:
        return 'Group E — Business and Mercantile';
      case ArchitecturalOccupancyGroup.groupF:
        return 'Group F — Industrial';
      case ArchitecturalOccupancyGroup.groupG:
        return 'Group G — Industrial Storage and Hazardous';
      case ArchitecturalOccupancyGroup.groupH:
        return 'Group H — Recreational, occupant load below 1,000';
      case ArchitecturalOccupancyGroup.groupI:
        return 'Group I — Recreational, occupant load 1,000 or more';
      case ArchitecturalOccupancyGroup.groupJ:
        return 'Group J — Agricultural, Accessory';
      case ArchitecturalOccupancyGroup.others:
        return 'Others';
    }
  }
}

/// Step 1 — Applicant Information (Box 1). Permit Type is fixed to
/// "Architectural Permit" and not editable.
class ArchitecturalApplicantInfo {
  final PermitType permitType = PermitType.architectural;

  String firstName = '';
  String middleName = '';
  String lastName = '';
  String tin = '';
  String contactNumber = '';

  bool isOwnedByEnterprise = false;
  String enterpriseName = '';
  String? formOfOwnership;

  ArchitecturalOccupancyGroup? occupancyGroup;
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
    if (occupancyGroup == ArchitecturalOccupancyGroup.others &&
        Validators.required(occupancyOtherDescription) != null) {
      return false;
    }
    if (!isOwnedByEnterprise) return true;
    return Validators.required(enterpriseName) == null &&
        formOfOwnership != null;
  }
}

/// Step 2 (part 1) — Applicant Address.
class ArchitecturalApplicantAddress {
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
class ArchitecturalProjectLocation {
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
const List<String> mockExistingBuildingPermitNumbers = [
  'BP-2026-100234',
  'BP-2026-100567',
  'BP-2026-100812',
];

/// Step 2 (part 3) — Related Building Permit (the Architectural Permit is
/// invalid without one). "Pending Issuance" is a legitimate, allowed state
/// — the applicant may file for the Architectural Permit while the
/// Building Permit is still being processed — but the permit can never be
/// displayed as valid/issued while it stays in that state (see
/// [ArchitecturalPermitDraft.derivedPermitStatus]).
enum RelatedBuildingPermitStatus { pendingIssuance, issued }

extension RelatedBuildingPermitStatusX on RelatedBuildingPermitStatus {
  String get label => this == RelatedBuildingPermitStatus.issued
      ? 'Issued'
      : 'Pending Issuance';
}

class ArchitecturalRelatedBuildingPermit {
  String buildingPermitNumber = '';
  RelatedBuildingPermitStatus status = RelatedBuildingPermitStatus.pendingIssuance;

  bool get isValid {
    if (status == RelatedBuildingPermitStatus.issued) {
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
enum ArchitecturalScopeType {
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

extension ArchitecturalScopeTypeX on ArchitecturalScopeType {
  String get label {
    switch (this) {
      case ArchitecturalScopeType.newInstallation:
        return 'New Installation';
      case ArchitecturalScopeType.erection:
        return 'Erection';
      case ArchitecturalScopeType.addition:
        return 'Addition';
      case ArchitecturalScopeType.alteration:
        return 'Alteration';
      case ArchitecturalScopeType.renovation:
        return 'Renovation';
      case ArchitecturalScopeType.conversion:
        return 'Conversion';
      case ArchitecturalScopeType.repair:
        return 'Repair';
      case ArchitecturalScopeType.moving:
        return 'Moving';
      case ArchitecturalScopeType.raising:
        return 'Raising';
      case ArchitecturalScopeType.demolition:
        return 'Demolition';
      case ArchitecturalScopeType.accessoryBuildingOrStructure:
        return 'Accessory Building / Structure';
      case ArchitecturalScopeType.others:
        return 'Others';
    }
  }
}

/// Step 3 — Scope of Architectural Work.
class ArchitecturalScopeOfWork {
  final Set<ArchitecturalScopeType> selectedScopes = {};
  String otherScopeDescription = '';

  String workTitle = '';
  String descriptionOfWork = '';
  String buildingAreasAffected = '';
  String existingCondition = '';
  String proposedArchitecturalChanges = '';

  /// Interior-work-related conditional document requirements (Step 7) are
  /// derived from these three scope types, since renovation, alteration,
  /// and conversion work commonly touches interior finishes/partitions —
  /// there's no separate "interior work" checkbox in the official form.
  bool get impliesInteriorWork =>
      selectedScopes.contains(ArchitecturalScopeType.alteration) ||
      selectedScopes.contains(ArchitecturalScopeType.renovation) ||
      selectedScopes.contains(ArchitecturalScopeType.conversion);

  bool get isValid {
    if (selectedScopes.isEmpty) return false;
    if (selectedScopes.contains(ArchitecturalScopeType.others) &&
        Validators.required(otherScopeDescription) != null) {
      return false;
    }
    return Validators.required(workTitle) == null &&
        Validators.required(descriptionOfWork) == null &&
        Validators.required(buildingAreasAffected) == null &&
        Validators.required(existingCondition) == null &&
        Validators.required(proposedArchitecturalChanges) == null;
  }
}

/// Accessibility facilities tracked in Box 2.
enum AccessibilityFacility {
  stairs,
  walkways,
  corridors,
  doorsEntrancesThresholds,
  washroomsAndToilets,
  liftsElevators,
  ramps,
  parkingAreas,
  switchesControlsBuzzers,
  handrails,
  thresholds,
  floorFinishes,
  drinkingFountains,
  publicTelephones,
  seatingAccommodations,
  others,
}

extension AccessibilityFacilityX on AccessibilityFacility {
  String get label {
    switch (this) {
      case AccessibilityFacility.stairs:
        return 'Stairs';
      case AccessibilityFacility.walkways:
        return 'Walkways';
      case AccessibilityFacility.corridors:
        return 'Corridors';
      case AccessibilityFacility.doorsEntrancesThresholds:
        return 'Doors, Entrances and Thresholds';
      case AccessibilityFacility.washroomsAndToilets:
        return 'Washrooms and Toilets';
      case AccessibilityFacility.liftsElevators:
        return 'Lifts / Elevators';
      case AccessibilityFacility.ramps:
        return 'Ramps';
      case AccessibilityFacility.parkingAreas:
        return 'Parking Areas';
      case AccessibilityFacility.switchesControlsBuzzers:
        return 'Switches, Controls and Buzzers';
      case AccessibilityFacility.handrails:
        return 'Handrails';
      case AccessibilityFacility.thresholds:
        return 'Thresholds';
      case AccessibilityFacility.floorFinishes:
        return 'Floor Finishes';
      case AccessibilityFacility.drinkingFountains:
        return 'Drinking Fountains';
      case AccessibilityFacility.publicTelephones:
        return 'Public Telephones';
      case AccessibilityFacility.seatingAccommodations:
        return 'Seating Accommodations';
      case AccessibilityFacility.others:
        return 'Others';
    }
  }
}

enum AccessibilityFacilityStatus {
  existingAndCompliant,
  proposed,
  notApplicable,
  requiresReview,
}

extension AccessibilityFacilityStatusX on AccessibilityFacilityStatus {
  String get label {
    switch (this) {
      case AccessibilityFacilityStatus.existingAndCompliant:
        return 'Existing and Compliant';
      case AccessibilityFacilityStatus.proposed:
        return 'Proposed';
      case AccessibilityFacilityStatus.notApplicable:
        return 'Not Applicable';
      case AccessibilityFacilityStatus.requiresReview:
        return 'Requires Review';
    }
  }
}

/// Fire Code features tracked in Box 2.
enum FireCodeFeature {
  exitDoors,
  corridorWidth,
  distanceToFireExits,
  accessToPublicStreet,
  fireWalls,
  firefightingAndSafetyFacilities,
  smokeDetectors,
  emergencyLights,
  others,
}

extension FireCodeFeatureX on FireCodeFeature {
  String get label {
    switch (this) {
      case FireCodeFeature.exitDoors:
        return 'Number and Width of Exit Doors';
      case FireCodeFeature.corridorWidth:
        return 'Width of Corridors';
      case FireCodeFeature.distanceToFireExits:
        return 'Distance to Fire Exits';
      case FireCodeFeature.accessToPublicStreet:
        return 'Access to Public Street';
      case FireCodeFeature.fireWalls:
        return 'Fire Walls';
      case FireCodeFeature.firefightingAndSafetyFacilities:
        return 'Firefighting and Safety Facilities';
      case FireCodeFeature.smokeDetectors:
        return 'Smoke Detectors';
      case FireCodeFeature.emergencyLights:
        return 'Emergency Lights';
      case FireCodeFeature.others:
        return 'Others';
    }
  }
}

enum FireCodeFeatureStatus {
  applicantDeclaredCompliant,
  proposed,
  notApplicable,
  requiresTechnicalReview,
}

extension FireCodeFeatureStatusX on FireCodeFeatureStatus {
  String get label {
    switch (this) {
      case FireCodeFeatureStatus.applicantDeclaredCompliant:
        return 'Applicant-Declared Compliant';
      case FireCodeFeatureStatus.proposed:
        return 'Proposed';
      case FireCodeFeatureStatus.notApplicable:
        return 'Not Applicable';
      case FireCodeFeatureStatus.requiresTechnicalReview:
        return 'Requires Technical Review';
    }
  }
}

String? _percentage(String? value, String fieldLabel) {
  if (value == null || value.trim().isEmpty) {
    return '$fieldLabel is required.';
  }
  final parsed = double.tryParse(value.trim());
  if (parsed == null) return 'Enter a valid number.';
  if (parsed < 0 || parsed > 100) {
    return '$fieldLabel must be between 0 and 100.';
  }
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

/// Step 4 — Architectural Compliance Details (Box 2): accessibility,
/// site-development percentages, and Fire Code features. This step never
/// presents itself as a final legal approval — every status here is
/// either applicant-declared or explicitly flagged for office review.
class ArchitecturalComplianceDetails {
  final Map<AccessibilityFacility, AccessibilityFacilityStatus> accessibility = {
    for (final facility in AccessibilityFacility.values)
      facility: AccessibilityFacilityStatus.notApplicable,
  };
  String otherAccessibilityDescription = '';

  String buildingFootprintPercentage = '';
  String imperviousSurfaceAreaPercentage = '';
  String unpavedSurfaceAreaPercentage = '';
  String otherSitePercentage = '';
  String otherSiteDescription = '';

  final Map<FireCodeFeature, FireCodeFeatureStatus> fireCode = {
    for (final feature in FireCodeFeature.values)
      feature: FireCodeFeatureStatus.notApplicable,
  };
  String otherFireFeatureDescription = '';

  String numberOfExitDoors = '';
  String totalExitWidth = '';
  String minimumCorridorWidth = '';
  String maximumDistanceToFireExit = '';
  String publicStreetAccessDescription = '';
  String fireWallDescription = '';
  String fireSafetyFacilityDescription = '';

  /// Non-blocking warning only — never disables Continue. Uses the three
  /// primary site percentages; "Other" is a separate catch-all category
  /// and intentionally excluded from the 100% ceiling check.
  bool get siteCoverageExceedsTotal {
    final footprint = double.tryParse(buildingFootprintPercentage.trim());
    final impervious = double.tryParse(imperviousSurfaceAreaPercentage.trim());
    final unpaved = double.tryParse(unpavedSurfaceAreaPercentage.trim());
    if (footprint == null || impervious == null || unpaved == null) {
      return false;
    }
    return (footprint + impervious + unpaved) > 100;
  }

  bool get requiresRampDetails =>
      accessibility[AccessibilityFacility.ramps] !=
      AccessibilityFacilityStatus.notApplicable;
  bool get requiresAccessibleParkingDetails =>
      accessibility[AccessibilityFacility.parkingAreas] !=
      AccessibilityFacilityStatus.notApplicable;
  bool get requiresStairDetails =>
      accessibility[AccessibilityFacility.stairs] !=
      AccessibilityFacilityStatus.notApplicable;
  bool get requiresDoorWindowSchedule =>
      accessibility[AccessibilityFacility.doorsEntrancesThresholds] !=
      AccessibilityFacilityStatus.notApplicable;

  /// The official form has no literal "Fire Escape" checkbox — treated as
  /// implied whenever Firefighting and Safety Facilities work is underway.
  bool get requiresFireEscapeDetails =>
      fireCode[FireCodeFeature.firefightingAndSafetyFacilities] !=
      FireCodeFeatureStatus.notApplicable;

  bool get isValid {
    if (accessibility[AccessibilityFacility.others] !=
            AccessibilityFacilityStatus.notApplicable &&
        Validators.required(otherAccessibilityDescription) != null) {
      return false;
    }
    if (_percentage(buildingFootprintPercentage, 'Building Footprint Percentage') !=
        null) {
      return false;
    }
    if (_percentage(
          imperviousSurfaceAreaPercentage,
          'Impervious Surface Area Percentage',
        ) !=
        null) {
      return false;
    }
    if (_percentage(unpavedSurfaceAreaPercentage, 'Unpaved Surface Area Percentage') !=
        null) {
      return false;
    }
    if (otherSitePercentage.trim().isNotEmpty) {
      if (_percentage(otherSitePercentage, 'Other Site Percentage') != null) {
        return false;
      }
      if (Validators.required(otherSiteDescription) != null) return false;
    }
    if (fireCode[FireCodeFeature.others] != FireCodeFeatureStatus.notApplicable &&
        Validators.required(otherFireFeatureDescription) != null) {
      return false;
    }
    if (Validators.positiveWholeNumber(
          numberOfExitDoors,
          fieldLabel: 'Number of Exit Doors',
        ) !=
        null) {
      return false;
    }
    if (_nonNegativeDecimal(totalExitWidth, 'Total Exit Width') != null) {
      return false;
    }
    if (_nonNegativeDecimal(minimumCorridorWidth, 'Minimum Corridor Width') != null) {
      return false;
    }
    if (_nonNegativeDecimal(
          maximumDistanceToFireExit,
          'Maximum Distance to Fire Exit',
        ) !=
        null) {
      return false;
    }
    if (Validators.required(publicStreetAccessDescription) != null) return false;
    if (Validators.required(fireWallDescription) != null) return false;
    if (Validators.required(fireSafetyFacilityDescription) != null) return false;
    return true;
  }
}

/// Shared license/contact shape for both the Design Architect and the
/// Supervisor / Architect in Charge — kept internal to this model only, so
/// it introduces no coupling with any other permit.
class ArchitecturalProfessionalInfo {
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

/// Step 5 — Architectural Professionals (Box 3 + Box 4). When the
/// Supervisor is the same person as the Design Architect, the supervisor's
/// own fields/uploads are never populated — Step 7's document checklist
/// reads the Design Architect's uploads for both roles in that case.
class ArchitecturalProfessionals {
  final ArchitecturalProfessionalInfo designArchitect = ArchitecturalProfessionalInfo();
  DocumentModel? designPrcIdUpload;
  DocumentModel? designPtrDocumentUpload;
  DocumentModel? signedSealedPlansUpload;
  DocumentModel? signedSealedSpecificationsUpload;

  bool isSupervisorSameAsDesignArchitect = true;
  final ArchitecturalProfessionalInfo supervisor = ArchitecturalProfessionalInfo();
  DocumentModel? supervisorPrcIdUpload;
  DocumentModel? supervisorPtrUpload;
  DocumentModel? signedSupervisorConfirmationUpload;

  bool get isValid {
    final designValid = designArchitect.isValid &&
        designPrcIdUpload != null &&
        designPtrDocumentUpload != null &&
        signedSealedPlansUpload != null &&
        signedSealedSpecificationsUpload != null;
    if (!designValid) return false;
    if (isSupervisorSameAsDesignArchitect) return true;
    return supervisor.isValid &&
        supervisorPrcIdUpload != null &&
        supervisorPtrUpload != null &&
        signedSupervisorConfirmationUpload != null;
  }
}

/// Shared owner-identity shape for both the Building Owner and the Lot
/// Owner in Step 6 — internal to this model only.
class ArchitecturalOwnerInfo {
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

/// Step 6 — Ownership & Consent (Box 5 + Box 6).
class ArchitecturalOwnershipConsent {
  bool? isApplicantBuildingOwner;
  final ArchitecturalOwnerInfo buildingOwner = ArchitecturalOwnerInfo();

  bool? isBuildingOwnerAlsoLotOwner;
  final ArchitecturalOwnerInfo lotOwner = ArchitecturalOwnerInfo();

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

/// Step 7 — Required Architectural Documents (Box 7). Professional
/// documents already collected in Step 5 (PRC IDs, PTRs, signed and
/// sealed plans/specifications) are intentionally NOT duplicated here —
/// the UI reads/writes [ArchitecturalProfessionals]'s fields directly.
class ArchitecturalRequiredDocuments {
  // Location and Site Documents
  DocumentModel? vicinityMapUpload;
  DocumentModel? siteDevelopmentPlanUpload;

  // Architectural Presentation
  DocumentModel? perspectiveUpload;
  DocumentModel? floorPlansUpload;
  DocumentModel? elevationsUpload;
  DocumentModel? sectionsUpload;
  DocumentModel? ceilingPlansUpload;

  // Accessibility and Detail Drawings — all conditionally required.
  DocumentModel? rampDetailsUpload;
  DocumentModel? accessibleParkingDetailsUpload;
  DocumentModel? stairDetailsUpload;
  DocumentModel? fireEscapeDetailsUpload;
  DocumentModel? cabinetPartitionDetailsUpload;

  // Schedules and Finishes — conditionally required.
  DocumentModel? doorWindowScheduleUpload;
  DocumentModel? floorFinishScheduleUpload;
  DocumentModel? ceilingFinishScheduleUpload;
  DocumentModel? wallFinishScheduleUpload;

  // Interior and Technical Documents
  DocumentModel? architecturalInteriorUpload; // conditional
  DocumentModel? costEstimateUpload;
  DocumentModel? otherArchitecturalDocumentsUpload; // optional

  bool isValid({
    required bool requiresRampDetails,
    required bool requiresAccessibleParkingDetails,
    required bool requiresStairDetails,
    required bool requiresFireEscapeDetails,
    required bool requiresDoorWindowSchedule,
    required bool requiresInteriorWork,
  }) {
    final baseValid = vicinityMapUpload != null &&
        siteDevelopmentPlanUpload != null &&
        perspectiveUpload != null &&
        floorPlansUpload != null &&
        elevationsUpload != null &&
        sectionsUpload != null &&
        ceilingPlansUpload != null &&
        costEstimateUpload != null;
    if (!baseValid) return false;

    if (requiresRampDetails && rampDetailsUpload == null) return false;
    if (requiresAccessibleParkingDetails &&
        accessibleParkingDetailsUpload == null) {
      return false;
    }
    if (requiresStairDetails && stairDetailsUpload == null) return false;
    if (requiresFireEscapeDetails && fireEscapeDetailsUpload == null) {
      return false;
    }
    if (requiresDoorWindowSchedule && doorWindowScheduleUpload == null) {
      return false;
    }
    if (requiresInteriorWork) {
      if (architecturalInteriorUpload == null) return false;
      if (floorFinishScheduleUpload == null) return false;
      if (ceilingFinishScheduleUpload == null) return false;
      if (wallFinishScheduleUpload == null) return false;
    }
    return true;
  }
}

/// Step 8 — Review & Declaration: the seven certifications required
/// before the architectural application can be submitted.
class ArchitecturalReviewDeclaration {
  bool certifiesTrueAndCorrect = false;
  bool confirmsPlansPreparedByLicensedArchitect = false;
  bool understandsAccessibilitySubjectToEvaluation = false;
  bool understandsFireSafetySubjectToEvaluation = false;
  bool understandsRequiresValidBuildingPermit = false;
  bool understandsMustFollowApprovedPlans = false;
  bool agreesToTerms = false;

  bool get isValid =>
      certifiesTrueAndCorrect &&
      confirmsPlansPreparedByLicensedArchitect &&
      understandsAccessibilitySubjectToEvaluation &&
      understandsFireSafetySubjectToEvaluation &&
      understandsRequiresValidBuildingPermit &&
      understandsMustFollowApprovedPlans &&
      agreesToTerms;
}

/// Per-document-group evaluation status shown in Step 9's read-only
/// "Document Evaluation" summary.
enum ArchitecturalDocumentEvaluationStatus {
  pendingReview,
  accepted,
  revisionRequired,
  missing,
  notApplicable,
}

extension ArchitecturalDocumentEvaluationStatusX
    on ArchitecturalDocumentEvaluationStatus {
  String get label {
    switch (this) {
      case ArchitecturalDocumentEvaluationStatus.pendingReview:
        return 'Pending Review';
      case ArchitecturalDocumentEvaluationStatus.accepted:
        return 'Accepted';
      case ArchitecturalDocumentEvaluationStatus.revisionRequired:
        return 'Revision Required';
      case ArchitecturalDocumentEvaluationStatus.missing:
        return 'Missing';
      case ArchitecturalDocumentEvaluationStatus.notApplicable:
        return 'Not Applicable';
    }
  }
}

/// Frontend-only permit status values the applicant can observe but never
/// set. [invalidWithoutBuildingPermit] is never chosen directly — it is
/// always derived (see [ArchitecturalPermitDraft.derivedPermitStatus]).
enum ArchitecturalPermitStatus {
  submitted,
  underEvaluation,
  revisionRequired,
  additionalDocumentsRequired,
  forApproval,
  approved,
  rejected,
  invalidWithoutBuildingPermit,
}

extension ArchitecturalPermitStatusX on ArchitecturalPermitStatus {
  String get label {
    switch (this) {
      case ArchitecturalPermitStatus.submitted:
        return 'Submitted';
      case ArchitecturalPermitStatus.underEvaluation:
        return 'Under Evaluation';
      case ArchitecturalPermitStatus.revisionRequired:
        return 'Revision Required';
      case ArchitecturalPermitStatus.additionalDocumentsRequired:
        return 'Additional Documents Required';
      case ArchitecturalPermitStatus.forApproval:
        return 'For Approval';
      case ArchitecturalPermitStatus.approved:
        return 'Approved';
      case ArchitecturalPermitStatus.rejected:
        return 'Rejected';
      case ArchitecturalPermitStatus.invalidWithoutBuildingPermit:
        return 'Invalid Without Building Permit';
    }
  }
}

/// Step 9 — Evaluation, Progress & Permit Status. Every field here is
/// office-controlled — there is no applicant-editable state in this class
/// at all, only fixed "pending" defaults. This step therefore has no
/// blocking validity condition; Continue always submits for evaluation.
class ArchitecturalEvaluationPermitStatus {
  static const Map<String, ArchitecturalDocumentEvaluationStatus>
  documentEvaluation = {
    'Architectural Drawings': ArchitecturalDocumentEvaluationStatus.pendingReview,
    'Specifications': ArchitecturalDocumentEvaluationStatus.pendingReview,
    'Other Documents': ArchitecturalDocumentEvaluationStatus.pendingReview,
  };

  static const List<String> progressStages = [
    'Architectural Drawings',
    'Specifications',
    'Other Documents',
    'Technical Evaluation',
    'Recommending Approval',
    'Building Official Decision',
  ];

  static const String actionTaken = 'Pending Assessment';
  static const String recommendingApproval = 'Pending Assessment';
  static const String permitIssuedBy = 'Pending Assessment';

  static const List<String> permitConditions = [
    'The Architect remains professionally responsible for the plans and specifications.',
    'Work must follow the approved architectural plans.',
    'A Notice of Construction must be submitted before construction begins.',
    'Upon completion, required logbook entries, as-built plans, and the Certificate of Completion must be submitted.',
    'The Architectural Permit is invalid without the related Building Permit.',
  ];

  bool get isValid => true;
}

enum ArchitecturalPermitDraftStatus { draft, submitted }

/// The full mutable draft for one Architectural Permit application
/// session.
class ArchitecturalPermitDraft {
  final ArchitecturalApplicantInfo applicant = ArchitecturalApplicantInfo();
  final ArchitecturalApplicantAddress applicantAddress =
      ArchitecturalApplicantAddress();
  final ArchitecturalProjectLocation projectLocation = ArchitecturalProjectLocation();
  final ArchitecturalRelatedBuildingPermit relatedBuildingPermit =
      ArchitecturalRelatedBuildingPermit();
  final ArchitecturalScopeOfWork scopeOfWork = ArchitecturalScopeOfWork();
  final ArchitecturalComplianceDetails complianceDetails =
      ArchitecturalComplianceDetails();
  final ArchitecturalProfessionals professionals = ArchitecturalProfessionals();
  final ArchitecturalOwnershipConsent ownershipConsent =
      ArchitecturalOwnershipConsent();
  final ArchitecturalRequiredDocuments requiredDocuments =
      ArchitecturalRequiredDocuments();
  final ArchitecturalReviewDeclaration reviewDeclaration =
      ArchitecturalReviewDeclaration();
  final ArchitecturalEvaluationPermitStatus evaluationPermitStatus =
      ArchitecturalEvaluationPermitStatus();

  bool useApplicantAddressForProjectLocation = false;
  ArchitecturalPermitDraftStatus status = ArchitecturalPermitDraftStatus.draft;
  DateTime? lastSavedAt;

  bool get isStep1Valid => applicant.isValid;
  bool get isStep2Valid =>
      applicantAddress.isValid && projectLocation.isValid && relatedBuildingPermit.isValid;
  bool get isStep3Valid => scopeOfWork.isValid;
  bool get isStep4Valid => complianceDetails.isValid;
  bool get isStep5Valid => professionals.isValid;
  bool get isStep6Valid => ownershipConsent.isValid;
  bool get isStep7Valid => requiredDocuments.isValid(
        requiresRampDetails: complianceDetails.requiresRampDetails,
        requiresAccessibleParkingDetails:
            complianceDetails.requiresAccessibleParkingDetails,
        requiresStairDetails: complianceDetails.requiresStairDetails,
        requiresFireEscapeDetails: complianceDetails.requiresFireEscapeDetails,
        requiresDoorWindowSchedule: complianceDetails.requiresDoorWindowSchedule,
        requiresInteriorWork: scopeOfWork.impliesInteriorWork,
      ) &&
      professionals.designPrcIdUpload != null &&
      professionals.designPtrDocumentUpload != null &&
      (professionals.isSupervisorSameAsDesignArchitect ||
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
  /// Building Permit is still pending — this is the single source of
  /// truth Step 9's read-only status card renders from.
  ArchitecturalPermitStatus get derivedPermitStatus {
    if (relatedBuildingPermit.status != RelatedBuildingPermitStatus.issued) {
      return ArchitecturalPermitStatus.invalidWithoutBuildingPermit;
    }
    return ArchitecturalPermitStatus.submitted;
  }
}
