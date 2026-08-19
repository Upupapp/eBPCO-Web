import 'package:flutter/material.dart';

import '../../../../../core/models/civil_structural_permit_model.dart';
import '../../../../../core/models/document_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/layout/expandable_section.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/uploads/document_upload_tile.dart';
import '../../building_permit/widgets/mock_upload.dart';

/// Step 7 — Required Civil / Structural Documents. Professional documents
/// already collected in Step 5 are read/written directly against
/// [CivilStructuralProfessionals]'s fields rather than duplicated here, so
/// the same PRC ID/PTR/signed-and-sealed file is never uploaded twice.
class Step7RequiredDocuments extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final CivilStructuralPermitDraft draft;
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
  CivilStructuralRequiredDocuments get _documents => widget.draft.requiredDocuments;
  CivilStructuralWorkDetails get _work => widget.draft.workDetails;
  CivilStructuralProfessionals get _professionals => widget.draft.professionals;

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
    final supervisorHasOwnDocuments = !_professionals.isSupervisorSameAsDesignEngineer;

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
              title: 'Civil / Structural Design Documents',
              subtitle: 'Plans, computations, and specifications are already provided in Step 5.',
              initiallyExpanded: true,
              children: [
                _uploadTile(
                  label: 'Civil / Structural Plans',
                  getDocument: () => _professionals.signedSealedPlansUpload,
                  setDocument: (d) => _professionals.signedSealedPlansUpload = d,
                ),
                _uploadTile(
                  label: 'Civil / Structural Design Computations',
                  getDocument: () => _professionals.signedSealedComputationsUpload,
                  setDocument: (d) =>
                      _professionals.signedSealedComputationsUpload = d,
                ),
                _uploadTile(
                  label: 'Civil / Structural Specifications',
                  getDocument: () =>
                      _professionals.signedSealedSpecificationsUpload,
                  setDocument: (d) =>
                      _professionals.signedSealedSpecificationsUpload = d,
                ),
                _uploadTile(
                  label: 'Structural Analysis',
                  getDocument: () => _documents.structuralAnalysisUpload,
                  setDocument: (d) => _documents.structuralAnalysisUpload = d,
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
                  setDocument: (d) => _documents.materialSpecificationsUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Work-Specific Documents',
              subtitle: 'Required based on the work types selected in Step 4.',
              children: [
                _uploadTile(
                  label: 'Staking Plan',
                  isRequired: _work.hasStaking,
                  statusLabel: _work.hasStaking
                      ? 'Conditionally required — Staking selected'
                      : 'Not required — Staking not selected',
                  getDocument: () => _documents.stakingPlanUpload,
                  setDocument: (d) => _documents.stakingPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Survey Reference',
                  isRequired: _work.hasStaking,
                  statusLabel: _work.hasStaking
                      ? 'Conditionally required — Staking selected'
                      : 'Not required — Staking not selected',
                  getDocument: () => _documents.surveyReferenceUpload,
                  setDocument: (d) => _documents.surveyReferenceUpload = d,
                ),
                _uploadTile(
                  label: 'Excavation Plan',
                  isRequired: _work.hasExcavation,
                  statusLabel: _work.hasExcavation
                      ? 'Conditionally required — Excavation selected'
                      : 'Not required — Excavation not selected',
                  getDocument: () => _documents.excavationPlanUpload,
                  setDocument: (d) => _documents.excavationPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Excavation Safety or Support Plan',
                  isRequired: _work.hasExcavation,
                  statusLabel: _work.hasExcavation
                      ? 'Conditionally required — Excavation selected'
                      : 'Not required — Excavation not selected',
                  getDocument: () => _documents.excavationSafetyPlanUpload,
                  setDocument: (d) => _documents.excavationSafetyPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Soil Stabilization Plan',
                  isRequired: _work.hasSoilStabilization,
                  statusLabel: _work.hasSoilStabilization
                      ? 'Conditionally required — Soil Stabilization selected'
                      : 'Not required — Soil Stabilization not selected',
                  getDocument: () => _documents.soilStabilizationPlanUpload,
                  setDocument: (d) => _documents.soilStabilizationPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Geotechnical Recommendation',
                  isRequired: _work.hasSoilStabilization,
                  statusLabel: _work.hasSoilStabilization
                      ? 'Conditionally required — Soil Stabilization selected'
                      : 'Not required — Soil Stabilization not selected',
                  getDocument: () => _documents.geotechnicalRecommendationUpload,
                  setDocument: (d) =>
                      _documents.geotechnicalRecommendationUpload = d,
                ),
                _uploadTile(
                  label: 'Piling Layout',
                  isRequired: _work.hasPilingWorks,
                  statusLabel: _work.hasPilingWorks
                      ? 'Conditionally required — Piling Works selected'
                      : 'Not required — Piling Works not selected',
                  getDocument: () => _documents.pilingLayoutUpload,
                  setDocument: (d) => _documents.pilingLayoutUpload = d,
                ),
                _uploadTile(
                  label: 'Pile Design Calculations',
                  isRequired: _work.hasPilingWorks,
                  statusLabel: _work.hasPilingWorks
                      ? 'Conditionally required — Piling Works selected'
                      : 'Not required — Piling Works not selected',
                  getDocument: () => _documents.pileDesignCalculationsUpload,
                  setDocument: (d) => _documents.pileDesignCalculationsUpload = d,
                ),
                _uploadTile(
                  label: 'Pile Testing Program',
                  isRequired: _work.hasPilingWorks,
                  statusLabel: _work.hasPilingWorks
                      ? 'Conditionally required — Piling Works selected'
                      : 'Not required — Piling Works not selected',
                  getDocument: () => _documents.pileTestingProgramUpload,
                  setDocument: (d) => _documents.pileTestingProgramUpload = d,
                ),
                _uploadTile(
                  label: 'Foundation Plan',
                  isRequired: _work.hasFoundation,
                  statusLabel: _work.hasFoundation
                      ? 'Conditionally required — Foundation selected'
                      : 'Not required — Foundation not selected',
                  getDocument: () => _documents.foundationPlanUpload,
                  setDocument: (d) => _documents.foundationPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Foundation Design Calculations',
                  isRequired: _work.hasFoundation,
                  statusLabel: _work.hasFoundation
                      ? 'Conditionally required — Foundation selected'
                      : 'Not required — Foundation not selected',
                  getDocument: () => _documents.foundationDesignCalculationsUpload,
                  setDocument: (d) =>
                      _documents.foundationDesignCalculationsUpload = d,
                ),
                _uploadTile(
                  label: 'Erection Plan',
                  isRequired: _work.hasErectionLifting,
                  statusLabel: _work.hasErectionLifting
                      ? 'Conditionally required — Erection / Lifting selected'
                      : 'Not required — Erection / Lifting not selected',
                  getDocument: () => _documents.erectionPlanUpload,
                  setDocument: (d) => _documents.erectionPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Lifting Plan',
                  isRequired: _work.hasErectionLifting,
                  statusLabel: _work.hasErectionLifting
                      ? 'Conditionally required — Erection / Lifting selected'
                      : 'Not required — Erection / Lifting not selected',
                  getDocument: () => _documents.liftingPlanUpload,
                  setDocument: (d) => _documents.liftingPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Temporary Support Plan',
                  isRequired: _work.hasErectionLifting,
                  statusLabel: _work.hasErectionLifting
                      ? 'Conditionally required — Erection / Lifting selected'
                      : 'Not required — Erection / Lifting not selected',
                  getDocument: () => _documents.temporarySupportPlanUpload,
                  setDocument: (d) => _documents.temporarySupportPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Concrete Framing Plans',
                  isRequired: _work.hasConcreteFraming,
                  statusLabel: _work.hasConcreteFraming
                      ? 'Conditionally required — Concrete Framing selected'
                      : 'Not required — Concrete Framing not selected',
                  getDocument: () => _documents.concreteFramingPlansUpload,
                  setDocument: (d) => _documents.concreteFramingPlansUpload = d,
                ),
                _uploadTile(
                  label: 'Concrete Design Calculations',
                  isRequired: _work.hasConcreteFraming,
                  statusLabel: _work.hasConcreteFraming
                      ? 'Conditionally required — Concrete Framing selected'
                      : 'Not required — Concrete Framing not selected',
                  getDocument: () => _documents.concreteDesignCalculationsUpload,
                  setDocument: (d) =>
                      _documents.concreteDesignCalculationsUpload = d,
                ),
                _uploadTile(
                  label: 'Concrete Material Specifications',
                  isRequired: _work.hasConcreteFraming,
                  statusLabel: _work.hasConcreteFraming
                      ? 'Conditionally required — Concrete Framing selected'
                      : 'Not required — Concrete Framing not selected',
                  getDocument: () => _documents.concreteMaterialSpecificationsUpload,
                  setDocument: (d) =>
                      _documents.concreteMaterialSpecificationsUpload = d,
                ),
                _uploadTile(
                  label: 'Structural Steel Plans',
                  isRequired: _work.hasStructuralSteelFraming,
                  statusLabel: _work.hasStructuralSteelFraming
                      ? 'Conditionally required — Structural Steel Framing selected'
                      : 'Not required — Structural Steel Framing not selected',
                  getDocument: () => _documents.structuralSteelPlansUpload,
                  setDocument: (d) => _documents.structuralSteelPlansUpload = d,
                ),
                _uploadTile(
                  label: 'Connection Details',
                  isRequired: _work.hasStructuralSteelFraming,
                  statusLabel: _work.hasStructuralSteelFraming
                      ? 'Conditionally required — Structural Steel Framing selected'
                      : 'Not required — Structural Steel Framing not selected',
                  getDocument: () => _documents.connectionDetailsUpload,
                  setDocument: (d) => _documents.connectionDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Steel Design Calculations',
                  isRequired: _work.hasStructuralSteelFraming,
                  statusLabel: _work.hasStructuralSteelFraming
                      ? 'Conditionally required — Structural Steel Framing selected'
                      : 'Not required — Structural Steel Framing not selected',
                  getDocument: () => _documents.steelDesignCalculationsUpload,
                  setDocument: (d) => _documents.steelDesignCalculationsUpload = d,
                ),
                _uploadTile(
                  label: 'Slab Plans',
                  isRequired: _work.hasSlabs,
                  statusLabel: _work.hasSlabs
                      ? 'Conditionally required — Slabs selected'
                      : 'Not required — Slabs not selected',
                  getDocument: () => _documents.slabPlansUpload,
                  setDocument: (d) => _documents.slabPlansUpload = d,
                ),
                _uploadTile(
                  label: 'Slab Reinforcement Details',
                  isRequired: _work.hasSlabs,
                  statusLabel: _work.hasSlabs
                      ? 'Conditionally required — Slabs selected'
                      : 'Not required — Slabs not selected',
                  getDocument: () => _documents.slabReinforcementDetailsUpload,
                  setDocument: (d) => _documents.slabReinforcementDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Structural Wall Plans',
                  isRequired: _work.hasWalls,
                  statusLabel: _work.hasWalls
                      ? 'Conditionally required — Walls selected'
                      : 'Not required — Walls not selected',
                  getDocument: () => _documents.structuralWallPlansUpload,
                  setDocument: (d) => _documents.structuralWallPlansUpload = d,
                ),
                _uploadTile(
                  label: 'Wall Reinforcement Details',
                  isRequired: _work.hasWalls,
                  statusLabel: _work.hasWalls
                      ? 'Conditionally required — Walls selected'
                      : 'Not required — Walls not selected',
                  getDocument: () => _documents.wallReinforcementDetailsUpload,
                  setDocument: (d) => _documents.wallReinforcementDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Prestressing Design',
                  isRequired: _work.hasPrestressWorks,
                  statusLabel: _work.hasPrestressWorks
                      ? 'Conditionally required — Prestress Works selected'
                      : 'Not required — Prestress Works not selected',
                  getDocument: () => _documents.prestressingDesignUpload,
                  setDocument: (d) => _documents.prestressingDesignUpload = d,
                ),
                _uploadTile(
                  label: 'Prestressing Procedure',
                  isRequired: _work.hasPrestressWorks,
                  statusLabel: _work.hasPrestressWorks
                      ? 'Conditionally required — Prestress Works selected'
                      : 'Not required — Prestress Works not selected',
                  getDocument: () => _documents.prestressingProcedureUpload,
                  setDocument: (d) => _documents.prestressingProcedureUpload = d,
                ),
                _uploadTile(
                  label: 'Tendon Layout',
                  isRequired: _work.hasPrestressWorks,
                  statusLabel: _work.hasPrestressWorks
                      ? 'Conditionally required — Prestress Works selected'
                      : 'Not required — Prestress Works not selected',
                  getDocument: () => _documents.tendonLayoutUpload,
                  setDocument: (d) => _documents.tendonLayoutUpload = d,
                ),
                _uploadTile(
                  label: 'Material Testing Program',
                  isRequired: _work.hasMaterialTesting,
                  statusLabel: _work.hasMaterialTesting
                      ? 'Conditionally required — Material Testing selected'
                      : 'Not required — Material Testing not selected',
                  getDocument: () => _documents.materialTestingProgramUpload,
                  setDocument: (d) => _documents.materialTestingProgramUpload = d,
                ),
                _uploadTile(
                  label: 'Testing Laboratory Credentials',
                  isRequired: _work.hasMaterialTesting,
                  statusLabel: _work.hasMaterialTesting
                      ? 'Conditionally required — Material Testing selected'
                      : 'Not required — Material Testing not selected',
                  getDocument: () => _documents.testingLaboratoryCredentialsUpload,
                  setDocument: (d) =>
                      _documents.testingLaboratoryCredentialsUpload = d,
                ),
                _uploadTile(
                  label: 'Test Reports',
                  isRequired: false,
                  statusLabel: 'Optional — when available',
                  getDocument: () => _documents.testReportsUpload,
                  setDocument: (d) => _documents.testReportsUpload = d,
                ),
                _uploadTile(
                  label: 'Tower Plans',
                  isRequired: _work.hasSteelTowers,
                  statusLabel: _work.hasSteelTowers
                      ? 'Conditionally required — Steel Towers selected'
                      : 'Not required — Steel Towers not selected',
                  getDocument: () => _documents.towerPlansUpload,
                  setDocument: (d) => _documents.towerPlansUpload = d,
                ),
                _uploadTile(
                  label: 'Tower Design Calculations',
                  isRequired: _work.hasSteelTowers,
                  statusLabel: _work.hasSteelTowers
                      ? 'Conditionally required — Steel Towers selected'
                      : 'Not required — Steel Towers not selected',
                  getDocument: () => _documents.towerDesignCalculationsUpload,
                  setDocument: (d) => _documents.towerDesignCalculationsUpload = d,
                ),
                _uploadTile(
                  label: 'Tower Foundation Details',
                  isRequired: _work.hasSteelTowers,
                  statusLabel: _work.hasSteelTowers
                      ? 'Conditionally required — Steel Towers selected'
                      : 'Not required — Steel Towers not selected',
                  getDocument: () => _documents.towerFoundationDetailsUpload,
                  setDocument: (d) => _documents.towerFoundationDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Tank Structural Plans',
                  isRequired: _work.hasTanks,
                  statusLabel: _work.hasTanks
                      ? 'Conditionally required — Tanks selected'
                      : 'Not required — Tanks not selected',
                  getDocument: () => _documents.tankStructuralPlansUpload,
                  setDocument: (d) => _documents.tankStructuralPlansUpload = d,
                ),
                _uploadTile(
                  label: 'Tank Design Calculations',
                  isRequired: _work.hasTanks,
                  statusLabel: _work.hasTanks
                      ? 'Conditionally required — Tanks selected'
                      : 'Not required — Tanks not selected',
                  getDocument: () => _documents.tankDesignCalculationsUpload,
                  setDocument: (d) => _documents.tankDesignCalculationsUpload = d,
                ),
                _uploadTile(
                  label: 'Tank Foundation Details',
                  isRequired: _work.hasTanks,
                  statusLabel: _work.hasTanks
                      ? 'Conditionally required — Tanks selected'
                      : 'Not required — Tanks not selected',
                  getDocument: () => _documents.tankFoundationDetailsUpload,
                  setDocument: (d) => _documents.tankFoundationDetailsUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Professional Documents',
              subtitle: 'Already provided in Step 5 — shown here for review.',
              children: [
                _uploadTile(
                  label: 'Design Engineer PRC ID',
                  extension: 'jpg',
                  getDocument: () => _professionals.designPrcIdUpload,
                  setDocument: (d) => _professionals.designPrcIdUpload = d,
                ),
                _uploadTile(
                  label: 'Design Engineer PTR',
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
                  label: 'Signed and Sealed Computations',
                  getDocument: () =>
                      _professionals.signedSealedComputationsUpload,
                  setDocument: (d) =>
                      _professionals.signedSealedComputationsUpload = d,
                ),
                _uploadTile(
                  label: 'Signed and Sealed Specifications',
                  getDocument: () =>
                      _professionals.signedSealedSpecificationsUpload,
                  setDocument: (d) =>
                      _professionals.signedSealedSpecificationsUpload = d,
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
                  setDocument: (d) => _documents.relatedBuildingPermitUpload = d,
                ),
                _uploadTile(
                  label: 'Geotechnical or Soil Investigation Report',
                  isRequired: false,
                  statusLabel: 'Optional — when applicable',
                  getDocument: () =>
                      _documents.geotechnicalOrSoilInvestigationUpload,
                  setDocument: (d) =>
                      _documents.geotechnicalOrSoilInvestigationUpload = d,
                ),
                _uploadTile(
                  label: 'Site Survey',
                  getDocument: () => _documents.siteSurveyUpload,
                  setDocument: (d) => _documents.siteSurveyUpload = d,
                ),
                _uploadTile(
                  label: 'Material Test Results',
                  isRequired: false,
                  statusLabel: 'Optional — when available',
                  getDocument: () => _documents.materialTestResultsUpload,
                  setDocument: (d) => _documents.materialTestResultsUpload = d,
                ),
                _uploadTile(
                  label: 'Other Civil / Structural Documents',
                  isRequired: false,
                  statusLabel: 'Optional',
                  getDocument: () =>
                      _documents.otherCivilStructuralDocumentsUpload,
                  setDocument: (d) =>
                      _documents.otherCivilStructuralDocumentsUpload = d,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
