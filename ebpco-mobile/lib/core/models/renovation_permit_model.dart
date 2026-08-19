import '../utils/validators.dart';
import 'document_model.dart';

/// Mock, frontend-only data model for the Renovation Permit application
/// wizard. Deliberately kept fully separate from [building_permit_model]
/// (New Construction) — no shared mutable state — even though the two
/// permits both derive from the same official Unified Application Form,
/// so that editing one can never leak into or corrupt the other.

/// "Form of Ownership" choices shown when the property is owned by an
/// enterprise. Duplicated (not imported) from the New Construction model
/// on purpose, to keep the two models fully decoupled.
const List<String> renovationFormsOfOwnership = [
  'Sole Proprietorship',
  'Partnership',
  'Corporation',
  'Cooperative',
  'Government',
  'Others',
];

/// Whether this is a brand-new filing, a renewal of an expired permit, or
/// an amendment to an already-filed application.
enum RenovationApplicationType { newApplication, renewal, amendatory }

extension RenovationApplicationTypeX on RenovationApplicationType {
  String get label {
    switch (this) {
      case RenovationApplicationType.newApplication:
        return 'New';
      case RenovationApplicationType.renewal:
        return 'Renewal';
      case RenovationApplicationType.amendatory:
        return 'Amendatory';
    }
  }
}

/// Step 1 — Applicant Information. Project Type is fixed to "Renovation"
/// for this flow, so — like Application Type in the New Construction
/// flow — it isn't a field the user can change and has no model field.
class RenovationApplicantInfo {
  RenovationApplicationType applicationType =
      RenovationApplicationType.newApplication;
  String firstName = '';
  String middleName = '';
  String lastName = '';
  String tin = '';

  /// "Telephone / Mobile Number" — deliberately validated with `required`
  /// only (not the strict PH-mobile regex used elsewhere) since a landline
  /// number is explicitly allowed here.
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
class RenovationApplicantAddress {
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

/// Step 2 (part 2) — user-facing "Renovation Location", mapped internally
/// to the official form's "Location of Construction" fields.
class RenovationLocation {
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

/// Areas or rooms the renovation work affects. Drives which technical
/// plans become conditionally required in Step 7.
enum RenovationAffectedArea {
  interiorSpaces,
  exteriorFacade,
  roofing,
  wallsPartitions,
  doorsAndWindows,
  flooring,
  kitchen,
  bathroom,
  electricalSystem,
  plumbingSystem,
  mechanicalSystem,
  structuralComponents,
  accessibilityImprovements,
  others,
}

extension RenovationAffectedAreaX on RenovationAffectedArea {
  String get label {
    switch (this) {
      case RenovationAffectedArea.interiorSpaces:
        return 'Interior Spaces';
      case RenovationAffectedArea.exteriorFacade:
        return 'Exterior / Façade';
      case RenovationAffectedArea.roofing:
        return 'Roofing';
      case RenovationAffectedArea.wallsPartitions:
        return 'Walls / Partitions';
      case RenovationAffectedArea.doorsAndWindows:
        return 'Doors and Windows';
      case RenovationAffectedArea.flooring:
        return 'Flooring';
      case RenovationAffectedArea.kitchen:
        return 'Kitchen';
      case RenovationAffectedArea.bathroom:
        return 'Bathroom';
      case RenovationAffectedArea.electricalSystem:
        return 'Electrical System';
      case RenovationAffectedArea.plumbingSystem:
        return 'Plumbing System';
      case RenovationAffectedArea.mechanicalSystem:
        return 'Mechanical System';
      case RenovationAffectedArea.structuralComponents:
        return 'Structural Components';
      case RenovationAffectedArea.accessibilityImprovements:
        return 'Accessibility Improvements';
      case RenovationAffectedArea.others:
        return 'Others';
    }
  }
}

/// Step 3 — Renovation Project Information. Scope of Work is fixed to
/// "Renovation" (preselected and locked), so — same as Application/Project
/// Type — it has no model field, just fixed display text in the UI.
class RenovationProjectInformation {
  String projectTitle = '';
  String generalDescription = '';
  Set<RenovationAffectedArea> affectedAreas = {};
  String otherAffectedAreaDescription = '';

  /// Optional supplementary free text ("Other Renovation Details").
  String otherRenovationDetails = '';

  bool get isValid {
    if (Validators.required(projectTitle) != null) return false;
    if (Validators.required(generalDescription) != null) return false;
    if (affectedAreas.isEmpty) return false;
    if (affectedAreas.contains(RenovationAffectedArea.others) &&
        Validators.required(otherAffectedAreaDescription) != null) {
      return false;
    }
    return true;
  }
}

/// Official "Use or Character of Occupancy" classification groups.
/// Duplicated (not imported) from the New Construction model to keep the
/// two models fully decoupled.
enum RenovationOccupancyGroup {
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

extension RenovationOccupancyGroupX on RenovationOccupancyGroup {
  String get label {
    switch (this) {
      case RenovationOccupancyGroup.groupA:
        return 'Group A — Residential, Dwellings';
      case RenovationOccupancyGroup.groupB:
        return 'Group B — Residential Hotel, Apartment';
      case RenovationOccupancyGroup.groupC:
        return 'Group C — Educational, Recreational';
      case RenovationOccupancyGroup.groupD:
        return 'Group D — Institutional';
      case RenovationOccupancyGroup.groupE:
        return 'Group E — Business and Mercantile';
      case RenovationOccupancyGroup.groupF:
        return 'Group F — Industrial';
      case RenovationOccupancyGroup.groupG:
        return 'Group G — Industrial Storage and Hazardous';
      case RenovationOccupancyGroup.groupH:
        return 'Group H — Recreational, occupant load below 1,000';
      case RenovationOccupancyGroup.groupI:
        return 'Group I — Recreational, occupant load 1,000 or more';
      case RenovationOccupancyGroup.groupJ:
        return 'Group J — Agricultural, Accessory';
      case RenovationOccupancyGroup.others:
        return 'Others';
    }
  }
}

/// Step 4 — Building & Renovation Details.
class RenovationBuildingDetails {
  RenovationOccupancyGroup? occupancyGroup;
  String occupancyOtherDescription = '';
  String occupancyClassification = '';
  String numberOfUnits = '';
  String totalExistingFloorArea = '';
  String areaAffectedByRenovation = '';
  String lotArea = '';
  String estimatedRenovationCost = '';
  DateTime? proposedStartDate;
  DateTime? expectedCompletionDate;

  bool get isValid {
    if (occupancyGroup == null) return false;
    if (occupancyGroup == RenovationOccupancyGroup.others &&
        Validators.required(occupancyOtherDescription) != null) {
      return false;
    }
    if (Validators.required(occupancyClassification) != null) return false;
    if (Validators.positiveWholeNumber(numberOfUnits) != null) return false;
    if (Validators.positiveDecimal(totalExistingFloorArea) != null) {
      return false;
    }
    if (Validators.positiveDecimal(areaAffectedByRenovation) != null) {
      return false;
    }
    if (Validators.positiveDecimal(lotArea) != null) return false;
    if (Validators.positiveDecimal(estimatedRenovationCost) != null) {
      return false;
    }

    final totalArea = double.tryParse(totalExistingFloorArea.trim());
    final affectedArea = double.tryParse(areaAffectedByRenovation.trim());
    if (totalArea != null && affectedArea != null && affectedArea > totalArea) {
      return false;
    }

    final proposed = proposedStartDate;
    final expected = expectedCompletionDate;
    if (proposed == null || expected == null) return false;
    if (expected.isBefore(proposed)) return false;

    return true;
  }
}

/// Licensed professional type required to supervise the renovation work.
enum RenovationProfessionType { architect, civilEngineer }

extension RenovationProfessionTypeX on RenovationProfessionType {
  String get label => this == RenovationProfessionType.architect
      ? 'Architect'
      : 'Civil Engineer';
}

/// Step 5 — Professional in Charge. `tin`/`dateSigned` are kept optional,
/// matching the prototype's existing convention of only requiring fields
/// explicitly marked required in the spec.
class RenovationProfessionalInCharge {
  String fullName = '';
  RenovationProfessionType? profession;
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

  bool get isValid =>
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
class RenovationConsentAuthorization {
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
class RenovationDocumentSlot {
  DocumentModel? upload;
  bool markedNotAvailable = false;

  bool get isSatisfied => upload != null || markedNotAvailable;
}

/// Step 7 — Required Renovation Documents: the full document-checklist
/// annex, grouped the same way the official form groups it. Professional
/// documents (PRC ID, PTR, signed & sealed form/plans) are intentionally
/// NOT duplicated here — Step 7's UI reads/writes
/// [RenovationProfessionalInCharge]'s upload fields directly so the same
/// file never needs to be uploaded twice.
class RenovationRequiredDocuments {
  // Property Documents
  DocumentModel? landTitleUpload;
  DocumentModel? taxDeclarationUpload;
  DocumentModel? realPropertyTaxReceiptUpload;
  DocumentModel? proofOfOwnershipOrAuthorityUpload;

  // Existing Building Documents — upload OR marked not-available.
  final RenovationDocumentSlot existingBuildingPermit = RenovationDocumentSlot();
  final RenovationDocumentSlot existingCertificateOfOccupancy =
      RenovationDocumentSlot();
  final RenovationDocumentSlot existingApprovedBuildingPlans =
      RenovationDocumentSlot();
  final RenovationDocumentSlot recentPhotographs = RenovationDocumentSlot();

  // Renovation Technical Documents — always required.
  DocumentModel? renovationPlansUpload;
  DocumentModel? architecturalPlansUpload;
  DocumentModel? technicalSpecificationsUpload;
  DocumentModel? billOfMaterialsUpload;

  // Renovation Technical Documents — conditionally required based on the
  // affected areas selected in Step 3.
  DocumentModel? civilStructuralPlansUpload;
  DocumentModel? electricalPlansUpload;
  DocumentModel? mechanicalPlansUpload;
  DocumentModel? plumbingPlansUpload;

  // Always-optional technical plans (no affected area maps to these).
  DocumentModel? sanitaryPlansUpload;
  DocumentModel? electronicsPlansUpload;

  // Government Clearances
  DocumentModel? barangayClearanceUpload;
  DocumentModel? zoningClearanceUpload;
  DocumentModel? fireSafetyEvaluationUpload;

  /// Optional catch-all for any other LGU-required clearance.
  DocumentModel? otherLguClearanceUpload;

  bool isValid(Set<RenovationAffectedArea> affectedAreas) {
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
        renovationPlansUpload != null &&
        architecturalPlansUpload != null &&
        technicalSpecificationsUpload != null &&
        billOfMaterialsUpload != null;
    if (!baseTechnicalValid) return false;

    if (affectedAreas.contains(RenovationAffectedArea.structuralComponents) &&
        civilStructuralPlansUpload == null) {
      return false;
    }
    if (affectedAreas.contains(RenovationAffectedArea.electricalSystem) &&
        electricalPlansUpload == null) {
      return false;
    }
    if (affectedAreas.contains(RenovationAffectedArea.mechanicalSystem) &&
        mechanicalPlansUpload == null) {
      return false;
    }
    if (affectedAreas.contains(RenovationAffectedArea.plumbingSystem) &&
        plumbingPlansUpload == null) {
      return false;
    }

    return barangayClearanceUpload != null &&
        zoningClearanceUpload != null &&
        fireSafetyEvaluationUpload != null;
  }
}

/// Step 8 — Review & Declaration: five certifications specific to a
/// renovation of an existing structure.
class RenovationReviewDeclaration {
  bool certifiesTrueAndCorrect = false;
  bool confirmsRenovationOfExistingStructure = false;
  bool understandsAdditionalPermitsMayBeRequired = false;
  bool understandsPlansMustBeSignedAndSealed = false;
  bool agreesToTerms = false;

  bool get isValid =>
      certifiesTrueAndCorrect &&
      confirmsRenovationOfExistingStructure &&
      understandsAdditionalPermitsMayBeRequired &&
      understandsPlansMustBeSignedAndSealed &&
      agreesToTerms;
}

/// How the applicant intends to pay once assessment is complete.
enum RenovationPaymentMethod { payOnsite, bankTransfer }

extension RenovationPaymentMethodX on RenovationPaymentMethod {
  String get label =>
      this == RenovationPaymentMethod.payOnsite ? 'Pay Onsite' : 'Bank Transfer';
}

/// Step 9 — Assessment & Payment. The applicant does not enter assessed
/// fees — every line item is "Pending Assessment" until the Office of the
/// Building Official evaluates the application, so this step has no
/// blocking validity condition.
class RenovationAssessmentPayment {
  RenovationPaymentMethod? selectedPaymentMethod;

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

enum RenovationPermitDraftStatus { draft, submitted }

/// The full mutable draft for one Renovation Permit application session.
class RenovationPermitDraft {
  final RenovationApplicantInfo applicant = RenovationApplicantInfo();
  final RenovationApplicantAddress applicantAddress =
      RenovationApplicantAddress();
  final RenovationLocation renovationLocation = RenovationLocation();
  final RenovationProjectInformation projectInformation =
      RenovationProjectInformation();
  final RenovationBuildingDetails buildingDetails = RenovationBuildingDetails();
  final RenovationProfessionalInCharge professional =
      RenovationProfessionalInCharge();
  final RenovationConsentAuthorization consentAuthorization =
      RenovationConsentAuthorization();
  final RenovationRequiredDocuments requiredDocuments =
      RenovationRequiredDocuments();
  final RenovationReviewDeclaration reviewDeclaration =
      RenovationReviewDeclaration();
  final RenovationAssessmentPayment assessmentPayment =
      RenovationAssessmentPayment();

  /// Whether the "Renovation location is the same as my address" toggle is
  /// on. Toggling it on copies the current applicant address into the
  /// renovation location fields once; the copied fields stay editable
  /// afterward and are not kept in sync on further edits.
  bool useApplicantAddressForRenovationLocation = false;

  RenovationPermitDraftStatus status = RenovationPermitDraftStatus.draft;
  DateTime? lastSavedAt;

  bool get isStep1Valid => applicant.isValid;
  bool get isStep2Valid =>
      applicantAddress.isValid && renovationLocation.isValid;
  bool get isStep3Valid => projectInformation.isValid;
  bool get isStep4Valid => buildingDetails.isValid;
  bool get isStep5Valid => professional.isValid;
  bool get isStep6Valid => consentAuthorization.isValid;
  bool get isStep7Valid =>
      requiredDocuments.isValid(projectInformation.affectedAreas) &&
      professional.prcIdUpload != null &&
      professional.ptrDocumentUpload != null &&
      professional.signedSealedFormUpload != null &&
      professional.signedSealedPlansUpload != null;
  bool get isStep8Valid => reviewDeclaration.isValid;
  bool get isStep9Valid => assessmentPayment.isValid;

  /// Copies the applicant address into the renovation location's matching
  /// fields (street/barangay/city/province only — lot/block/title/tax
  /// declaration numbers have no applicant-address equivalent).
  void copyApplicantAddressToRenovationLocation() {
    renovationLocation
      ..street = applicantAddress.street
      ..barangay = applicantAddress.barangay
      ..city = applicantAddress.city
      ..province = applicantAddress.province;
  }
}
