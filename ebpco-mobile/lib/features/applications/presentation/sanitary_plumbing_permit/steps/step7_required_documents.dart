import 'package:flutter/material.dart';

import '../../../../../core/models/document_model.dart';
import '../../../../../core/models/sanitary_plumbing_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/layout/expandable_section.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/uploads/document_upload_tile.dart';
import '../../building_permit/widgets/mock_upload.dart';

/// Step 7 — Required Sanitary / Plumbing Documents. Professional documents
/// already collected in Step 5 are read/written directly against
/// [SanitaryProfessionals]'s fields rather than duplicated here, so the
/// same PRC ID/PTR/signed-and-sealed file is never uploaded twice.
class Step7RequiredDocuments extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final SanitaryPermitDraft draft;
  final VoidCallback onChanged;

  const Step7RequiredDocuments({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step7RequiredDocuments> createState() =>
      _Step7RequiredDocumentsState();
}

class _Step7RequiredDocumentsState extends State<Step7RequiredDocuments> {
  SanitaryRequiredDocuments get _documents => widget.draft.requiredDocuments;
  SanitaryInstallationDetails get _details => widget.draft.installationDetails;
  SanitaryProfessionals get _professionals => widget.draft.professionals;

  Widget _uploadTile({
    required String label,
    required DocumentModel? Function() getDocument,
    required void Function(DocumentModel?) setDocument,
    String? statusLabel,
    bool isRequired = true,
    String extension = 'pdf',
  }) {
    return DocumentUploadTile(
      label: label,
      isRequired: isRequired,
      statusLabel: statusLabel,
      document: getDocument(),
      allowReplace: true,
      onUpload: () {
        setState(
          () => setDocument(createMockDocument(label, extension: extension)),
        );
        widget.onChanged();
      },
      onRemove: () {
        setState(() => setDocument(null));
        widget.onChanged();
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final water = _details.waterSupply;
    final disposal = _details.disposalSystem;
    final fixtures = _details.fixtureInventory;

    final hasShallowWell = water.hasShallowWell;
    final hasDeepWell = water.hasDeepWell;
    final hasCityWater = water.hasCityWater;

    final hasWtp = disposal.hasWastewaterTreatmentPlant;
    final hasImhoff = disposal.hasImhoffTank;
    final hasSewerConnection = disposal.hasSanitarySewerConnection;
    final hasSandFilter = disposal.hasSubsurfaceSandFilter;
    final hasSurfaceDrainageGroup = disposal.hasSurfaceDrainageGroup;

    final hasSwimmingPool = fixtures.hasFixture(
      SanitaryFixtureType.swimmingPool,
    );
    final hasGreaseTrap = fixtures.hasFixture(SanitaryFixtureType.greaseTrap);
    final hasWaterTank = fixtures.hasFixture(
      SanitaryFixtureType.waterTankReservoir,
    );
    final hasLaboratorySink = fixtures.hasFixture(
      SanitaryFixtureType.laboratorySink,
    );
    final hasDentalCuspidor = fixtures.hasFixture(
      SanitaryFixtureType.dentalCuspidor,
    );
    final hasOthersFixture = fixtures.hasFixture(SanitaryFixtureType.others);

    final supervisorHasOwnDocuments =
        !_professionals.isSupervisorSameAsDesignProfessional;

    return Form(
      key: widget.formKey,
      child: FormScrollScaffold(
        centerVertically: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Upload clear copies of every document below. Accepted '
              'formats: PDF, JPG, JPEG, PNG.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.lg),

            ExpandableSection(
              title: 'Core Plans and Specifications',
              subtitle:
                  'Plans, specifications, and design calculations are already provided in Step 5.',
              initiallyExpanded: true,
              children: [
                _uploadTile(
                  label: 'Sanitary Plans',
                  getDocument: () => _documents.sanitaryPlansUpload,
                  setDocument: (d) => _documents.sanitaryPlansUpload = d,
                ),
                _uploadTile(
                  label: 'Plumbing Plans',
                  getDocument: () => _documents.plumbingPlansUpload,
                  setDocument: (d) => _documents.plumbingPlansUpload = d,
                ),
                _uploadTile(
                  label: 'Sanitary / Plumbing Specifications',
                  getDocument: () =>
                      _documents.sanitaryPlumbingSpecificationsUpload,
                  setDocument: (d) =>
                      _documents.sanitaryPlumbingSpecificationsUpload = d,
                ),
                _uploadTile(
                  label: 'Water-Supply Layout',
                  getDocument: () => _documents.waterSupplyLayoutUpload,
                  setDocument: (d) => _documents.waterSupplyLayoutUpload = d,
                ),
                _uploadTile(
                  label: 'Drainage Layout',
                  getDocument: () => _documents.drainageLayoutUpload,
                  setDocument: (d) => _documents.drainageLayoutUpload = d,
                ),
                _uploadTile(
                  label: 'Sewer Layout',
                  getDocument: () => _documents.sewerLayoutUpload,
                  setDocument: (d) => _documents.sewerLayoutUpload = d,
                ),
                _uploadTile(
                  label: 'Plumbing Riser Diagram',
                  getDocument: () => _documents.plumbingRiserDiagramUpload,
                  setDocument: (d) =>
                      _documents.plumbingRiserDiagramUpload = d,
                ),
                _uploadTile(
                  label: 'Fixture Schedule',
                  getDocument: () => _documents.fixtureScheduleUpload,
                  setDocument: (d) => _documents.fixtureScheduleUpload = d,
                ),
                _uploadTile(
                  label: 'General Notes',
                  getDocument: () => _documents.generalNotesUpload,
                  setDocument: (d) => _documents.generalNotesUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Cost and Material Documents',
              children: [
                _uploadTile(
                  label: 'Bill of Materials',
                  getDocument: () => _documents.billOfMaterialsUpload,
                  setDocument: (d) => _documents.billOfMaterialsUpload = d,
                ),
                _uploadTile(
                  label: 'Cost Estimate',
                  getDocument: () => _documents.costEstimateUpload,
                  setDocument: (d) => _documents.costEstimateUpload = d,
                ),
                _uploadTile(
                  label: 'Quantity Takeoff',
                  isRequired: false,
                  statusLabel: 'Optional — when applicable',
                  getDocument: () => _documents.quantityTakeoffUpload,
                  setDocument: (d) => _documents.quantityTakeoffUpload = d,
                ),
                _uploadTile(
                  label: 'Material Specifications',
                  getDocument: () => _documents.materialSpecificationsUpload,
                  setDocument: (d) =>
                      _documents.materialSpecificationsUpload = d,
                ),
                _uploadTile(
                  label: 'Fixture and Equipment Specifications',
                  getDocument: () =>
                      _documents.fixtureEquipmentSpecificationsUpload,
                  setDocument: (d) =>
                      _documents.fixtureEquipmentSpecificationsUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Water-Supply Documents',
              subtitle:
                  'Required based on the water-supply systems selected in Step 4.',
              children: [
                _uploadTile(
                  label: 'Well Plan (Shallow Well)',
                  isRequired: hasShallowWell,
                  statusLabel: hasShallowWell
                      ? 'Conditionally required — Shallow Well selected'
                      : 'Not required — Shallow Well not selected',
                  getDocument: () => _documents.shallowWellPlanUpload,
                  setDocument: (d) => _documents.shallowWellPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Pump Details (Shallow Well)',
                  isRequired: hasShallowWell,
                  statusLabel: hasShallowWell
                      ? 'Conditionally required — Shallow Well selected'
                      : 'Not required — Shallow Well not selected',
                  getDocument: () => _documents.shallowWellPumpDetailsUpload,
                  setDocument: (d) =>
                      _documents.shallowWellPumpDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Water-Quality or Treatment Information (Shallow Well)',
                  isRequired: false,
                  statusLabel: hasShallowWell
                      ? 'Optional — when applicable'
                      : 'Not required — Shallow Well not selected',
                  getDocument: () => _documents.shallowWellWaterQualityUpload,
                  setDocument: (d) =>
                      _documents.shallowWellWaterQualityUpload = d,
                ),
                _uploadTile(
                  label: 'Deep-Well Plan',
                  isRequired: hasDeepWell,
                  statusLabel: hasDeepWell
                      ? 'Conditionally required — Deep Well and Pump Set selected'
                      : 'Not required — Deep Well and Pump Set not selected',
                  getDocument: () => _documents.deepWellPlanUpload,
                  setDocument: (d) => _documents.deepWellPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Pump Specifications (Deep Well)',
                  isRequired: hasDeepWell,
                  statusLabel: hasDeepWell
                      ? 'Conditionally required — Deep Well and Pump Set selected'
                      : 'Not required — Deep Well and Pump Set not selected',
                  getDocument: () =>
                      _documents.deepWellPumpSpecificationsUpload,
                  setDocument: (d) =>
                      _documents.deepWellPumpSpecificationsUpload = d,
                ),
                _uploadTile(
                  label: 'Well Details (Deep Well)',
                  isRequired: false,
                  statusLabel: hasDeepWell
                      ? 'Optional — when applicable'
                      : 'Not required — Deep Well and Pump Set not selected',
                  getDocument: () => _documents.deepWellDetailsUpload,
                  setDocument: (d) => _documents.deepWellDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Water-Quality or Treatment Information (Deep Well)',
                  isRequired: false,
                  statusLabel: hasDeepWell
                      ? 'Optional — when applicable'
                      : 'Not required — Deep Well and Pump Set not selected',
                  getDocument: () => _documents.deepWellWaterQualityUpload,
                  setDocument: (d) =>
                      _documents.deepWellWaterQualityUpload = d,
                ),
                _uploadTile(
                  label: 'Water-Service Connection Plan',
                  isRequired: hasCityWater,
                  statusLabel: hasCityWater
                      ? 'Conditionally required — City / Municipal Water System selected'
                      : 'Not required — City / Municipal Water System not selected',
                  getDocument: () =>
                      _documents.cityWaterServiceConnectionPlanUpload,
                  setDocument: (d) =>
                      _documents.cityWaterServiceConnectionPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Provider Approval or Coordination',
                  isRequired: false,
                  statusLabel: hasCityWater
                      ? 'Optional — when available'
                      : 'Not required — City / Municipal Water System not selected',
                  getDocument: () => _documents.cityWaterProviderApprovalUpload,
                  setDocument: (d) =>
                      _documents.cityWaterProviderApprovalUpload = d,
                ),
                _uploadTile(
                  label: 'Meter Details',
                  isRequired: hasCityWater,
                  statusLabel: hasCityWater
                      ? 'Conditionally required — City / Municipal Water System selected'
                      : 'Not required — City / Municipal Water System not selected',
                  getDocument: () => _documents.cityWaterMeterDetailsUpload,
                  setDocument: (d) =>
                      _documents.cityWaterMeterDetailsUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Disposal-System Documents',
              subtitle:
                  'Required based on the disposal systems selected in Step 4.',
              children: [
                _uploadTile(
                  label: 'Treatment Plant Layout',
                  isRequired: hasWtp,
                  statusLabel: hasWtp
                      ? 'Conditionally required — Wastewater Treatment Plant selected'
                      : 'Not required — Wastewater Treatment Plant not selected',
                  getDocument: () => _documents.wtpLayoutUpload,
                  setDocument: (d) => _documents.wtpLayoutUpload = d,
                ),
                _uploadTile(
                  label: 'Process Description',
                  isRequired: false,
                  statusLabel: hasWtp
                      ? 'Optional — when applicable'
                      : 'Not required — Wastewater Treatment Plant not selected',
                  getDocument: () => _documents.wtpProcessDescriptionUpload,
                  setDocument: (d) =>
                      _documents.wtpProcessDescriptionUpload = d,
                ),
                _uploadTile(
                  label: 'Capacity Calculations (Treatment Plant)',
                  isRequired: hasWtp,
                  statusLabel: hasWtp
                      ? 'Conditionally required — Wastewater Treatment Plant selected'
                      : 'Not required — Wastewater Treatment Plant not selected',
                  getDocument: () => _documents.wtpCapacityCalculationsUpload,
                  setDocument: (d) =>
                      _documents.wtpCapacityCalculationsUpload = d,
                ),
                _uploadTile(
                  label: 'Discharge Plan (Treatment Plant)',
                  isRequired: false,
                  statusLabel: hasWtp
                      ? 'Optional — when applicable'
                      : 'Not required — Wastewater Treatment Plant not selected',
                  getDocument: () => _documents.wtpDischargePlanUpload,
                  setDocument: (d) => _documents.wtpDischargePlanUpload = d,
                ),
                _uploadTile(
                  label: 'Imhoff Tank Plan',
                  isRequired: hasImhoff,
                  statusLabel: hasImhoff
                      ? 'Conditionally required — Imhoff Tank selected'
                      : 'Not required — Imhoff Tank not selected',
                  getDocument: () => _documents.imhoffPlanUpload,
                  setDocument: (d) => _documents.imhoffPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Tank Details (Imhoff)',
                  isRequired: false,
                  statusLabel: hasImhoff
                      ? 'Optional — when applicable'
                      : 'Not required — Imhoff Tank not selected',
                  getDocument: () => _documents.imhoffTankDetailsUpload,
                  setDocument: (d) => _documents.imhoffTankDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Effluent Disposal Plan (Imhoff)',
                  isRequired: hasImhoff,
                  statusLabel: hasImhoff
                      ? 'Conditionally required — Imhoff Tank selected'
                      : 'Not required — Imhoff Tank not selected',
                  getDocument: () =>
                      _documents.imhoffEffluentDisposalPlanUpload,
                  setDocument: (d) =>
                      _documents.imhoffEffluentDisposalPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Sewer Connection Plan',
                  isRequired: hasSewerConnection,
                  statusLabel: hasSewerConnection
                      ? 'Conditionally required — Sanitary Sewer Connection selected'
                      : 'Not required — Sanitary Sewer Connection not selected',
                  getDocument: () => _documents.sewerConnectionPlanUpload,
                  setDocument: (d) =>
                      _documents.sewerConnectionPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Receiving-System Coordination',
                  isRequired: false,
                  statusLabel: hasSewerConnection
                      ? 'Optional — when applicable'
                      : 'Not required — Sanitary Sewer Connection not selected',
                  getDocument: () =>
                      _documents.sewerReceivingSystemCoordinationUpload,
                  setDocument: (d) =>
                      _documents.sewerReceivingSystemCoordinationUpload = d,
                ),
                _uploadTile(
                  label: 'Connection Details (Sewer)',
                  isRequired: false,
                  statusLabel: hasSewerConnection
                      ? 'Optional — when applicable'
                      : 'Not required — Sanitary Sewer Connection not selected',
                  getDocument: () => _documents.sewerConnectionDetailsUpload,
                  setDocument: (d) =>
                      _documents.sewerConnectionDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Sand Filter Plan',
                  isRequired: hasSandFilter,
                  statusLabel: hasSandFilter
                      ? 'Conditionally required — Subsurface Sand Filter selected'
                      : 'Not required — Subsurface Sand Filter not selected',
                  getDocument: () => _documents.sandFilterPlanUpload,
                  setDocument: (d) => _documents.sandFilterPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Filter Details (Sand Filter)',
                  isRequired: false,
                  statusLabel: hasSandFilter
                      ? 'Optional — when applicable'
                      : 'Not required — Subsurface Sand Filter not selected',
                  getDocument: () => _documents.sandFilterDetailsUpload,
                  setDocument: (d) => _documents.sandFilterDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Effluent Disposal Plan (Sand Filter)',
                  isRequired: false,
                  statusLabel: hasSandFilter
                      ? 'Optional — when applicable'
                      : 'Not required — Subsurface Sand Filter not selected',
                  getDocument: () =>
                      _documents.sandFilterEffluentDisposalPlanUpload,
                  setDocument: (d) =>
                      _documents.sandFilterEffluentDisposalPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Drainage Plan (Surface Drainage, Street Canal or Water Course)',
                  isRequired: hasSurfaceDrainageGroup,
                  statusLabel: hasSurfaceDrainageGroup
                      ? 'Conditionally required — Surface Drainage, Street Canal, or Water Course selected'
                      : 'Not required — none of Surface Drainage, Street Canal, or Water Course selected',
                  getDocument: () => _documents.drainagePlanUpload,
                  setDocument: (d) => _documents.drainagePlanUpload = d,
                ),
                _uploadTile(
                  label: 'Discharge Details (Surface Drainage)',
                  isRequired: false,
                  statusLabel: hasSurfaceDrainageGroup
                      ? 'Optional — when applicable'
                      : 'Not required — none of Surface Drainage, Street Canal, or Water Course selected',
                  getDocument: () =>
                      _documents.drainageDischargeDetailsUpload,
                  setDocument: (d) =>
                      _documents.drainageDischargeDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Applicable Clearance or Coordination (Surface Drainage)',
                  isRequired: false,
                  statusLabel: hasSurfaceDrainageGroup
                      ? 'Optional — when applicable'
                      : 'Not required — none of Surface Drainage, Street Canal, or Water Course selected',
                  getDocument: () =>
                      _documents.drainageClearanceCoordinationUpload,
                  setDocument: (d) =>
                      _documents.drainageClearanceCoordinationUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Fixture-Specific Documents',
              subtitle:
                  'Required based on the fixture quantities entered in Step 4.',
              children: [
                _uploadTile(
                  label: 'Swimming Pool Plumbing Plan',
                  isRequired: hasSwimmingPool,
                  statusLabel: hasSwimmingPool
                      ? 'Conditionally required — Swimming Pool quantity greater than zero'
                      : 'Not required — no Swimming Pool quantity entered',
                  getDocument: () => _documents.swimmingPoolPlumbingPlanUpload,
                  setDocument: (d) =>
                      _documents.swimmingPoolPlumbingPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Grease Trap Details',
                  isRequired: hasGreaseTrap,
                  statusLabel: hasGreaseTrap
                      ? 'Conditionally required — Grease Trap quantity greater than zero'
                      : 'Not required — no Grease Trap quantity entered',
                  getDocument: () => _documents.greaseTrapDetailsUpload,
                  setDocument: (d) => _documents.greaseTrapDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Water Tank / Reservoir Details',
                  isRequired: hasWaterTank,
                  statusLabel: hasWaterTank
                      ? 'Conditionally required — Water Tank / Reservoir quantity greater than zero'
                      : 'Not required — no Water Tank / Reservoir quantity entered',
                  getDocument: () =>
                      _documents.waterTankReservoirDetailsUpload,
                  setDocument: (d) =>
                      _documents.waterTankReservoirDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Laboratory Plumbing Details',
                  isRequired: false,
                  statusLabel: hasLaboratorySink
                      ? 'Conditionally required — Laboratory Sink quantity greater than zero'
                      : 'Not required — no Laboratory Sink quantity entered',
                  getDocument: () => _documents.laboratoryPlumbingDetailsUpload,
                  setDocument: (d) =>
                      _documents.laboratoryPlumbingDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Dental Facility Plumbing Details',
                  isRequired: false,
                  statusLabel: hasDentalCuspidor
                      ? 'Conditionally required — Dental Cuspidor quantity greater than zero'
                      : 'Not required — no Dental Cuspidor quantity entered',
                  getDocument: () =>
                      _documents.dentalFacilityPlumbingDetailsUpload,
                  setDocument: (d) =>
                      _documents.dentalFacilityPlumbingDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Other Specialized Fixture Details',
                  isRequired: hasOthersFixture,
                  statusLabel: hasOthersFixture
                      ? 'Conditionally required — an "Others" fixture quantity greater than zero'
                      : 'Not required — no "Others" fixture quantity entered',
                  getDocument: () =>
                      _documents.otherSpecializedFixtureDetailsUpload,
                  setDocument: (d) =>
                      _documents.otherSpecializedFixtureDetailsUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Professional Documents',
              subtitle: 'Already provided in Step 5 — shown here for review.',
              children: [
                _uploadTile(
                  label: 'Design Professional PRC ID',
                  extension: 'jpg',
                  getDocument: () => _professionals.designPrcIdUpload,
                  setDocument: (d) => _professionals.designPrcIdUpload = d,
                ),
                _uploadTile(
                  label: 'Design Professional PTR',
                  getDocument: () => _professionals.designPtrDocumentUpload,
                  setDocument: (d) =>
                      _professionals.designPtrDocumentUpload = d,
                ),
                if (supervisorHasOwnDocuments) ...[
                  _uploadTile(
                    label: 'Supervisor PRC ID',
                    extension: 'jpg',
                    getDocument: () => _professionals.supervisorPrcIdUpload,
                    setDocument: (d) =>
                        _professionals.supervisorPrcIdUpload = d,
                  ),
                  _uploadTile(
                    label: 'Supervisor PTR',
                    getDocument: () => _professionals.supervisorPtrUpload,
                    setDocument: (d) => _professionals.supervisorPtrUpload = d,
                  ),
                ],
                _uploadTile(
                  label: 'Signed and Sealed Plans',
                  getDocument: () => _professionals.signedSealedPlansUpload,
                  setDocument: (d) =>
                      _professionals.signedSealedPlansUpload = d,
                ),
                _uploadTile(
                  label: 'Signed and Sealed Specifications',
                  getDocument: () =>
                      _professionals.signedSealedSpecificationsUpload,
                  setDocument: (d) =>
                      _professionals.signedSealedSpecificationsUpload = d,
                ),
                _uploadTile(
                  label: 'Signed Design Calculations',
                  isRequired: false,
                  statusLabel: 'Optional — when applicable',
                  getDocument: () =>
                      _professionals.signedDesignCalculationsUpload,
                  setDocument: (d) =>
                      _professionals.signedDesignCalculationsUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Supporting Documents',
              children: [
                _uploadTile(
                  label: 'Related Building Permit',
                  getDocument: () => _documents.relatedBuildingPermitUpload,
                  setDocument: (d) =>
                      _documents.relatedBuildingPermitUpload = d,
                ),
                _uploadTile(
                  label: 'Water Provider Coordination',
                  getDocument: () => _documents.waterProviderCoordinationUpload,
                  setDocument: (d) =>
                      _documents.waterProviderCoordinationUpload = d,
                ),
                _uploadTile(
                  label: 'Sewer Provider Coordination',
                  getDocument: () => _documents.sewerProviderCoordinationUpload,
                  setDocument: (d) =>
                      _documents.sewerProviderCoordinationUpload = d,
                ),
                _uploadTile(
                  label: 'Environmental or Discharge Clearance',
                  isRequired: false,
                  statusLabel: 'Optional — when applicable',
                  getDocument: () =>
                      _documents.environmentalDischargeClearanceUpload,
                  setDocument: (d) =>
                      _documents.environmentalDischargeClearanceUpload = d,
                ),
                _uploadTile(
                  label: 'Other Sanitary / Plumbing Documents',
                  isRequired: false,
                  statusLabel: 'Optional',
                  getDocument: () =>
                      _documents.otherSanitaryPlumbingDocumentsUpload,
                  setDocument: (d) =>
                      _documents.otherSanitaryPlumbingDocumentsUpload = d,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
