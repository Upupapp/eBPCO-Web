import 'package:flutter/material.dart';

import '../../../../../core/models/document_model.dart';
import '../../../../../core/models/plumbing_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/layout/expandable_section.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/uploads/document_upload_tile.dart';
import '../../building_permit/widgets/mock_upload.dart';

/// Step 7 — Required Plumbing Documents. Professional documents already
/// collected in Step 5 are read/written directly against
/// [PlumbingProfessionals]'s fields rather than duplicated here, so the
/// same PRC ID/PTR/signed-and-sealed file is never uploaded twice.
class Step7RequiredDocuments extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final PlumbingPermitDraft draft;
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
  PlumbingRequiredDocuments get _documents => widget.draft.requiredDocuments;
  PlumbingInstallationDetails get _details => widget.draft.installationDetails;
  PlumbingProfessionals get _professionals => widget.draft.professionals;

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
    final hasWaterDistribution = _details.hasWaterDistribution;
    final hasSewage = _details.hasSewage;
    final hasSepticTank = _details.hasSepticTank;
    final hasStormDrainage = _details.hasStormDrainage;

    final fixtures = _details.fixtureInventory;
    final hasSwimmingPool = fixtures.hasFixture(
      PlumbingFixtureType.swimmingPool,
    );
    final hasGreaseTrap = fixtures.hasFixture(PlumbingFixtureType.greaseTrap);
    final hasWaterTank = fixtures.hasFixture(
      PlumbingFixtureType.waterTankReservoir,
    );
    final hasLaboratorySink = fixtures.hasFixture(
      PlumbingFixtureType.laboratorySink,
    );
    final hasDentalCuspidor = fixtures.hasFixture(
      PlumbingFixtureType.dentalCuspidor,
    );
    final hasOthersFixture = fixtures.hasFixture(PlumbingFixtureType.others);

    final supervisorHasOwnDocuments =
        !_professionals.isSupervisorSameAsDesignMasterPlumber;

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
              title: 'Core Plumbing Documents',
              subtitle:
                  'Plans, specifications, and calculations are already provided in Step 5.',
              initiallyExpanded: true,
              children: [
                _uploadTile(
                  label: 'Plumbing Plans',
                  getDocument: () => _documents.plumbingPlansUpload,
                  setDocument: (d) => _documents.plumbingPlansUpload = d,
                ),
                _uploadTile(
                  label: 'Plumbing Specifications',
                  getDocument: () => _documents.plumbingSpecificationsUpload,
                  setDocument: (d) =>
                      _documents.plumbingSpecificationsUpload = d,
                ),
                _uploadTile(
                  label: 'Water Distribution Layout',
                  getDocument: () => _documents.waterDistributionLayoutUpload,
                  setDocument: (d) =>
                      _documents.waterDistributionLayoutUpload = d,
                ),
                _uploadTile(
                  label: 'Sewage Layout',
                  getDocument: () => _documents.sewageLayoutCoreUpload,
                  setDocument: (d) => _documents.sewageLayoutCoreUpload = d,
                ),
                _uploadTile(
                  label: 'Storm Drainage Layout',
                  isRequired: false,
                  statusLabel: 'Optional — when applicable',
                  getDocument: () => _documents.stormDrainageLayoutUpload,
                  setDocument: (d) => _documents.stormDrainageLayoutUpload = d,
                ),
                _uploadTile(
                  label: 'Plumbing Riser Diagram',
                  getDocument: () => _documents.plumbingRiserDiagramUpload,
                  setDocument: (d) =>
                      _documents.plumbingRiserDiagramUpload = d,
                ),
                _uploadTile(
                  label: 'Isometric Diagram',
                  getDocument: () => _documents.isometricDiagramUpload,
                  setDocument: (d) => _documents.isometricDiagramUpload = d,
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
                _uploadTile(
                  label: 'Plumbing Calculations',
                  isRequired: false,
                  statusLabel: 'Optional — when applicable',
                  getDocument: () => _documents.plumbingCalculationsUpload,
                  setDocument: (d) => _documents.plumbingCalculationsUpload = d,
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
                  label: 'Pipe and Material Specifications',
                  getDocument: () =>
                      _documents.pipeAndMaterialSpecificationsUpload,
                  setDocument: (d) =>
                      _documents.pipeAndMaterialSpecificationsUpload = d,
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
              title: 'Water Distribution Documents',
              subtitle:
                  'Required when Water Distribution System is selected in Step 4.',
              children: [
                _uploadTile(
                  label: 'Water Distribution Plan',
                  isRequired: hasWaterDistribution,
                  statusLabel: hasWaterDistribution
                      ? 'Conditionally required — Water Distribution System selected'
                      : 'Not required — Water Distribution System not selected',
                  getDocument: () => _documents.waterDistributionPlanUpload,
                  setDocument: (d) =>
                      _documents.waterDistributionPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Water Demand Calculation',
                  isRequired: hasWaterDistribution,
                  statusLabel: hasWaterDistribution
                      ? 'Conditionally required — Water Distribution System selected'
                      : 'Not required — Water Distribution System not selected',
                  getDocument: () => _documents.waterDemandCalculationUpload,
                  setDocument: (d) =>
                      _documents.waterDemandCalculationUpload = d,
                ),
                _uploadTile(
                  label: 'Pipe-Sizing Calculation',
                  isRequired: hasWaterDistribution,
                  statusLabel: hasWaterDistribution
                      ? 'Conditionally required — Water Distribution System selected'
                      : 'Not required — Water Distribution System not selected',
                  getDocument: () => _documents.pipeSizingCalculationUpload,
                  setDocument: (d) =>
                      _documents.pipeSizingCalculationUpload = d,
                ),
                _uploadTile(
                  label: 'Water Meter Details',
                  isRequired: hasWaterDistribution,
                  statusLabel: hasWaterDistribution
                      ? 'Conditionally required — Water Distribution System selected'
                      : 'Not required — Water Distribution System not selected',
                  getDocument: () => _documents.waterMeterDetailsUpload,
                  setDocument: (d) => _documents.waterMeterDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Pump Details',
                  isRequired: false,
                  statusLabel: hasWaterDistribution
                      ? 'Optional — when applicable'
                      : 'Not required — Water Distribution System not selected',
                  getDocument: () => _documents.pumpDetailsUpload,
                  setDocument: (d) => _documents.pumpDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Water Storage Details',
                  isRequired: false,
                  statusLabel: hasWaterDistribution
                      ? 'Optional — when applicable'
                      : 'Not required — Water Distribution System not selected',
                  getDocument: () => _documents.waterStorageDetailsUpload,
                  setDocument: (d) => _documents.waterStorageDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Provider Coordination or Approval',
                  isRequired: false,
                  statusLabel: hasWaterDistribution
                      ? 'Optional — when available'
                      : 'Not required — Water Distribution System not selected',
                  getDocument: () => _documents.providerCoordinationUpload,
                  setDocument: (d) => _documents.providerCoordinationUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Sewage Documents',
              subtitle: 'Required when Sewage System is selected in Step 4.',
              children: [
                _uploadTile(
                  label: 'Sewage Layout',
                  isRequired: hasSewage,
                  statusLabel: hasSewage
                      ? 'Conditionally required — Sewage System selected'
                      : 'Not required — Sewage System not selected',
                  getDocument: () => _documents.sewageLayoutUpload,
                  setDocument: (d) => _documents.sewageLayoutUpload = d,
                ),
                _uploadTile(
                  label: 'Wastewater Flow Calculation',
                  isRequired: hasSewage,
                  statusLabel: hasSewage
                      ? 'Conditionally required — Sewage System selected'
                      : 'Not required — Sewage System not selected',
                  getDocument: () => _documents.wastewaterFlowCalculationUpload,
                  setDocument: (d) =>
                      _documents.wastewaterFlowCalculationUpload = d,
                ),
                _uploadTile(
                  label: 'Sewer Pipe-Sizing Calculation',
                  isRequired: hasSewage,
                  statusLabel: hasSewage
                      ? 'Conditionally required — Sewage System selected'
                      : 'Not required — Sewage System not selected',
                  getDocument: () =>
                      _documents.sewerPipeSizingCalculationUpload,
                  setDocument: (d) =>
                      _documents.sewerPipeSizingCalculationUpload = d,
                ),
                _uploadTile(
                  label: 'Sewer Connection Details',
                  isRequired: hasSewage,
                  statusLabel: hasSewage
                      ? 'Conditionally required — Sewage System selected'
                      : 'Not required — Sewage System not selected',
                  getDocument: () => _documents.sewerConnectionDetailsUpload,
                  setDocument: (d) =>
                      _documents.sewerConnectionDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Receiving-System Coordination',
                  isRequired: false,
                  statusLabel: hasSewage
                      ? 'Optional — when applicable'
                      : 'Not required — Sewage System not selected',
                  getDocument: () =>
                      _documents.receivingSystemCoordinationUpload,
                  setDocument: (d) =>
                      _documents.receivingSystemCoordinationUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Septic Tank Documents',
              subtitle: 'Required when Septic Tank is selected in Step 4.',
              children: [
                _uploadTile(
                  label: 'Septic Tank Plan',
                  isRequired: hasSepticTank,
                  statusLabel: hasSepticTank
                      ? 'Conditionally required — Septic Tank selected'
                      : 'Not required — Septic Tank not selected',
                  getDocument: () => _documents.septicTankPlanUpload,
                  setDocument: (d) => _documents.septicTankPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Septic Tank Details',
                  isRequired: false,
                  statusLabel: hasSepticTank
                      ? 'Optional — when applicable'
                      : 'Not required — Septic Tank not selected',
                  getDocument: () => _documents.septicTankDetailsUpload,
                  setDocument: (d) => _documents.septicTankDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Capacity Calculation',
                  isRequired: hasSepticTank,
                  statusLabel: hasSepticTank
                      ? 'Conditionally required — Septic Tank selected'
                      : 'Not required — Septic Tank not selected',
                  getDocument: () => _documents.septicCapacityCalculationUpload,
                  setDocument: (d) =>
                      _documents.septicCapacityCalculationUpload = d,
                ),
                _uploadTile(
                  label: 'Effluent Disposal Plan',
                  isRequired: false,
                  statusLabel: hasSepticTank
                      ? 'Optional — when applicable'
                      : 'Not required — Septic Tank not selected',
                  getDocument: () => _documents.septicEffluentDisposalPlanUpload,
                  setDocument: (d) =>
                      _documents.septicEffluentDisposalPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Maintenance and Access Details',
                  isRequired: false,
                  statusLabel: hasSepticTank
                      ? 'Optional — when applicable'
                      : 'Not required — Septic Tank not selected',
                  getDocument: () =>
                      _documents.septicMaintenanceAccessDetailsUpload,
                  setDocument: (d) =>
                      _documents.septicMaintenanceAccessDetailsUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Storm Drainage Documents',
              subtitle:
                  'Required when Storm Drainage System is selected in Step 4.',
              children: [
                _uploadTile(
                  label: 'Storm Drainage Plan',
                  isRequired: hasStormDrainage,
                  statusLabel: hasStormDrainage
                      ? 'Conditionally required — Storm Drainage System selected'
                      : 'Not required — Storm Drainage System not selected',
                  getDocument: () => _documents.stormDrainagePlanUpload,
                  setDocument: (d) => _documents.stormDrainagePlanUpload = d,
                ),
                _uploadTile(
                  label: 'Drainage Calculation',
                  isRequired: hasStormDrainage,
                  statusLabel: hasStormDrainage
                      ? 'Conditionally required — Storm Drainage System selected'
                      : 'Not required — Storm Drainage System not selected',
                  getDocument: () => _documents.drainageCalculationUpload,
                  setDocument: (d) => _documents.drainageCalculationUpload = d,
                ),
                _uploadTile(
                  label: 'Roof Drain and Downspout Layout',
                  isRequired: false,
                  statusLabel: hasStormDrainage
                      ? 'Optional — when applicable'
                      : 'Not required — Storm Drainage System not selected',
                  getDocument: () =>
                      _documents.roofDrainDownspoutLayoutUpload,
                  setDocument: (d) =>
                      _documents.roofDrainDownspoutLayoutUpload = d,
                ),
                _uploadTile(
                  label: 'Catch Basin Details',
                  isRequired: false,
                  statusLabel: hasStormDrainage
                      ? 'Optional — when applicable'
                      : 'Not required — Storm Drainage System not selected',
                  getDocument: () => _documents.catchBasinDetailsUpload,
                  setDocument: (d) => _documents.catchBasinDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Discharge Details',
                  isRequired: false,
                  statusLabel: hasStormDrainage
                      ? 'Optional — when applicable'
                      : 'Not required — Storm Drainage System not selected',
                  getDocument: () => _documents.stormDischargeDetailsUpload,
                  setDocument: (d) =>
                      _documents.stormDischargeDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Applicable Clearance or Coordination',
                  isRequired: false,
                  statusLabel: hasStormDrainage
                      ? 'Optional — when applicable'
                      : 'Not required — Storm Drainage System not selected',
                  getDocument: () =>
                      _documents.stormClearanceCoordinationUpload,
                  setDocument: (d) =>
                      _documents.stormClearanceCoordinationUpload = d,
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
                  label: 'Dental Plumbing Details',
                  isRequired: false,
                  statusLabel: hasDentalCuspidor
                      ? 'Conditionally required — Dental Cuspidor quantity greater than zero'
                      : 'Not required — no Dental Cuspidor quantity entered',
                  getDocument: () => _documents.dentalPlumbingDetailsUpload,
                  setDocument: (d) =>
                      _documents.dentalPlumbingDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Specialized Fixture Details',
                  isRequired: hasOthersFixture,
                  statusLabel: hasOthersFixture
                      ? 'Conditionally required — an "Others" fixture quantity greater than zero'
                      : 'Not required — no "Others" fixture quantity entered',
                  getDocument: () => _documents.specializedFixtureDetailsUpload,
                  setDocument: (d) =>
                      _documents.specializedFixtureDetailsUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Professional Documents',
              subtitle: 'Already provided in Step 5 — shown here for review.',
              children: [
                _uploadTile(
                  label: 'Design Master Plumber PRC ID',
                  extension: 'jpg',
                  getDocument: () => _professionals.designPrcIdUpload,
                  setDocument: (d) => _professionals.designPrcIdUpload = d,
                ),
                _uploadTile(
                  label: 'Design Master Plumber PTR',
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
                  label: 'Signed and Sealed Plumbing Plans',
                  getDocument: () => _professionals.signedSealedPlansUpload,
                  setDocument: (d) =>
                      _professionals.signedSealedPlansUpload = d,
                ),
                _uploadTile(
                  label: 'Signed and Sealed Plumbing Specifications',
                  getDocument: () =>
                      _professionals.signedSealedSpecificationsUpload,
                  setDocument: (d) =>
                      _professionals.signedSealedSpecificationsUpload = d,
                ),
                _uploadTile(
                  label: 'Signed Plumbing Calculations',
                  isRequired: false,
                  statusLabel: 'Optional — when applicable',
                  getDocument: () =>
                      _professionals.signedPlumbingCalculationsUpload,
                  setDocument: (d) =>
                      _professionals.signedPlumbingCalculationsUpload = d,
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
                  label: 'Existing Plumbing Permit',
                  isRequired: false,
                  statusLabel: 'Optional — when applicable',
                  getDocument: () => _documents.existingPlumbingPermitUpload,
                  setDocument: (d) =>
                      _documents.existingPlumbingPermitUpload = d,
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
                  label: 'Site or Utility Plan',
                  getDocument: () => _documents.siteOrUtilityPlanUpload,
                  setDocument: (d) => _documents.siteOrUtilityPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Other Plumbing Documents',
                  isRequired: false,
                  statusLabel: 'Optional',
                  getDocument: () => _documents.otherPlumbingDocumentsUpload,
                  setDocument: (d) =>
                      _documents.otherPlumbingDocumentsUpload = d,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
