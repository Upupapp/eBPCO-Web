import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/demolition_permit_model.dart';
import '../../../../../core/models/document_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/expandable_section.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';
import '../../../../../shared/widgets/uploads/document_upload_tile.dart';
import '../../building_permit/widgets/mock_upload.dart';

/// Step 7 — Required Demolition Documents: the full document-checklist
/// annex. Professional and demolition technical documents already
/// collected in Step 5, and utility disconnection proofs already collected
/// in Step 4, are read/written directly against their source models rather
/// than duplicated here.
class Step7RequiredDocuments extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final DemolitionPermitDraft draft;
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
  final Map<DemolitionDocumentSlot, TextEditingController> _explanationControllers = {};

  DemolitionRequiredDocuments get _documents => widget.draft.requiredDocuments;
  DemolitionProfessionalInCharge get _professional => widget.draft.professional;
  DemolitionSafetyAndSitePrep get _safety => widget.draft.safetyAndSitePrep;
  DemolitionStructureDetails get _structure => widget.draft.structureDetails;

  TextEditingController _explanationController(DemolitionDocumentSlot slot) {
    return _explanationControllers.putIfAbsent(
      slot,
      () => TextEditingController(text: slot.notAvailableExplanation),
    );
  }

  @override
  void dispose() {
    for (final controller in _explanationControllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

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

  Widget _existingDocumentTile({
    required String label,
    required DemolitionDocumentSlot slot,
    String extension = 'pdf',
  }) {
    if (slot.markedNotAvailable) {
      final controller = _explanationController(slot);
      return AppCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                const Icon(Icons.info_outline, color: AppColors.textMuted),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(label, style: AppTypography.bodyStrong),
                ),
                TextButton(
                  onPressed: () {
                    setState(() => slot.markedNotAvailable = false);
                    widget.onChanged();
                  },
                  child: const Text('Undo'),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            AppTextField(
              controller: controller,
              label: 'Explain why this document is not available *',
              maxLines: 2,
              validator: (v) => Validators.required(
                v,
                fieldLabel: 'An explanation',
              ),
              onChanged: (v) {
                slot.notAvailableExplanation = v;
                widget.onChanged();
              },
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        DocumentUploadTile(
          label: label,
          statusLabel: 'Not yet uploaded',
          document: slot.upload,
          allowReplace: true,
          onUpload: () {
            setState(
              () => slot.upload = createMockDocument(label, extension: extension),
            );
            widget.onChanged();
          },
          onRemove: () {
            setState(() => slot.upload = null);
            widget.onChanged();
          },
        ),
        const SizedBox(height: AppSpacing.xs),
        InkWell(
          onTap: () {
            setState(() => slot.markedNotAvailable = true);
            widget.onChanged();
          },
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
            child: Row(
              children: [
                const Icon(
                  Icons.check_box_outline_blank,
                  size: 16,
                  color: AppColors.textMuted,
                ),
                const SizedBox(width: AppSpacing.xs),
                Flexible(
                  child: Text(
                    "I don't have this document",
                    style: AppTypography.caption,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final requiresShoringPlan = _structure.requiresShoringPlan;
    final requiresAdjacentPropertyProtectionPlan =
        _safety.areNeighboringPropertiesAtRisk == true;
    final requiresTrafficOrPedestrianManagementPlan =
        _safety.isPublicSidewalkAffected == true ||
        _safety.isPublicRoadAffected == true;

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
              title: 'Property and Existing Building Documents',
              subtitle: 'Mark documents you don\'t have as not available.',
              initiallyExpanded: true,
              children: [
                _uploadTile(
                  label: 'Land Title',
                  getDocument: () => _documents.landTitleUpload,
                  setDocument: (d) => _documents.landTitleUpload = d,
                ),
                _uploadTile(
                  label: 'Tax Declaration',
                  getDocument: () => _documents.taxDeclarationUpload,
                  setDocument: (d) => _documents.taxDeclarationUpload = d,
                ),
                _uploadTile(
                  label: 'Latest Real Property Tax Receipt',
                  getDocument: () => _documents.realPropertyTaxReceiptUpload,
                  setDocument: (d) =>
                      _documents.realPropertyTaxReceiptUpload = d,
                ),
                _existingDocumentTile(
                  label: 'Existing Building Permit',
                  slot: _documents.existingBuildingPermit,
                ),
                _existingDocumentTile(
                  label: 'Existing Certificate of Occupancy',
                  slot: _documents.existingCertificateOfOccupancy,
                ),
                _uploadTile(
                  label: 'Approved or As-Built Plans',
                  isRequired: false,
                  statusLabel: 'Optional — when available',
                  getDocument: () => _documents.approvedOrAsBuiltPlansUpload,
                  setDocument: (d) =>
                      _documents.approvedOrAsBuiltPlansUpload = d,
                ),
                _existingDocumentTile(
                  label: 'Recent Photographs of the Structure',
                  slot: _documents.recentPhotographs,
                  extension: 'jpg',
                ),
                _uploadTile(
                  label: 'Proof of Ownership or Authority to Demolish',
                  getDocument: () =>
                      _documents.proofOfOwnershipOrAuthorityUpload,
                  setDocument: (d) =>
                      _documents.proofOfOwnershipOrAuthorityUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Demolition Technical Documents',
              subtitle: 'Already provided in Step 5 — shown here for review.',
              children: [
                _uploadTile(
                  label: 'Demolition Plan',
                  getDocument: () => _professional.demolitionPlanUpload,
                  setDocument: (d) => _professional.demolitionPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Demolition Methodology',
                  getDocument: () =>
                      _professional.demolitionMethodologyUpload,
                  setDocument: (d) =>
                      _professional.demolitionMethodologyUpload = d,
                ),
                _uploadTile(
                  label: 'Safety Program',
                  getDocument: () => _professional.safetyProgramUpload,
                  setDocument: (d) => _professional.safetyProgramUpload = d,
                ),
                if (_structure.requiresStructuralAssessment)
                  _uploadTile(
                    label: 'Structural Assessment',
                    getDocument: () =>
                        _professional.structuralAssessmentUpload,
                    setDocument: (d) =>
                        _professional.structuralAssessmentUpload = d,
                  ),
                _uploadTile(
                  label: 'Debris Management Plan',
                  getDocument: () => _documents.debrisManagementPlanUpload,
                  setDocument: (d) =>
                      _documents.debrisManagementPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Dust and Noise Control Plan',
                  getDocument: () => _documents.dustNoiseControlPlanUpload,
                  setDocument: (d) =>
                      _documents.dustNoiseControlPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Project Schedule',
                  getDocument: () => _documents.projectScheduleUpload,
                  setDocument: (d) => _documents.projectScheduleUpload = d,
                ),
                _uploadTile(
                  label: 'Cost Estimate',
                  getDocument: () => _documents.costEstimateUpload,
                  setDocument: (d) => _documents.costEstimateUpload = d,
                ),
                _uploadTile(
                  label: 'Shoring Plan',
                  isRequired: requiresShoringPlan,
                  statusLabel: requiresShoringPlan
                      ? 'Conditionally required — Structural Component Removal selected'
                      : 'Not required for the selected demolition extent',
                  getDocument: () => _documents.shoringPlanUpload,
                  setDocument: (d) => _documents.shoringPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Adjacent Property Protection Plan',
                  isRequired: requiresAdjacentPropertyProtectionPlan,
                  statusLabel: requiresAdjacentPropertyProtectionPlan
                      ? 'Conditionally required — neighboring properties at risk'
                      : 'Not required — no neighboring properties at risk',
                  getDocument: () =>
                      _documents.adjacentPropertyProtectionPlanUpload,
                  setDocument: (d) =>
                      _documents.adjacentPropertyProtectionPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Traffic or Pedestrian Management Plan',
                  isRequired: requiresTrafficOrPedestrianManagementPlan,
                  statusLabel: requiresTrafficOrPedestrianManagementPlan
                      ? 'Conditionally required — public sidewalk or road affected'
                      : 'Not required — no public sidewalk or road affected',
                  getDocument: () =>
                      _documents.trafficOrPedestrianManagementPlanUpload,
                  setDocument: (d) =>
                      _documents.trafficOrPedestrianManagementPlanUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Professional Documents',
              subtitle: 'Already provided in Step 5 — shown here for review.',
              children: [
                _uploadTile(
                  label: 'PRC ID',
                  extension: 'jpg',
                  getDocument: () => _professional.prcIdUpload,
                  setDocument: (d) => _professional.prcIdUpload = d,
                ),
                _uploadTile(
                  label: 'PTR Document',
                  getDocument: () => _professional.ptrDocumentUpload,
                  setDocument: (d) => _professional.ptrDocumentUpload = d,
                ),
                _uploadTile(
                  label: 'Signed and Sealed Professional Form',
                  getDocument: () => _professional.signedSealedFormUpload,
                  setDocument: (d) =>
                      _professional.signedSealedFormUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Government and Local Clearances',
              children: [
                _uploadTile(
                  label: 'Barangay Clearance',
                  getDocument: () => _documents.barangayClearanceUpload,
                  setDocument: (d) => _documents.barangayClearanceUpload = d,
                ),
                _uploadTile(
                  label: 'Office of the Building Official Requirements',
                  getDocument: () => _documents.oboRequirementsUpload,
                  setDocument: (d) => _documents.oboRequirementsUpload = d,
                ),
                _uploadTile(
                  label: 'Environmental Clearance',
                  isRequired: false,
                  statusLabel: 'Optional — when applicable',
                  getDocument: () => _documents.environmentalClearanceUpload,
                  setDocument: (d) =>
                      _documents.environmentalClearanceUpload = d,
                ),
                _uploadTile(
                  label: 'Road or Sidewalk Use Clearance',
                  isRequired: requiresTrafficOrPedestrianManagementPlan,
                  statusLabel: requiresTrafficOrPedestrianManagementPlan
                      ? 'Conditionally required — public sidewalk or road affected'
                      : 'Not required — no public sidewalk or road affected',
                  getDocument: () =>
                      _documents.roadSidewalkUseClearanceUpload,
                  setDocument: (d) =>
                      _documents.roadSidewalkUseClearanceUpload = d,
                ),
                _uploadTile(
                  label: 'Fire Clearance',
                  isRequired: false,
                  statusLabel: 'Optional',
                  getDocument: () => _documents.fireClearanceUpload,
                  setDocument: (d) => _documents.fireClearanceUpload = d,
                ),
                _uploadTile(
                  label: 'Other LGU-Required Clearances',
                  isRequired: false,
                  statusLabel: 'Optional',
                  getDocument: () => _documents.otherLguClearanceUpload,
                  setDocument: (d) => _documents.otherLguClearanceUpload = d,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
