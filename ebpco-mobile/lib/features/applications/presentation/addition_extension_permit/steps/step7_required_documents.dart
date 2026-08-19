import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/addition_extension_permit_model.dart';
import '../../../../../core/models/document_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/expandable_section.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/uploads/document_file_preview_screen.dart';
import '../../../../../shared/widgets/uploads/document_upload_tile.dart';
import '../../../../documents/presentation/widgets/attach_document_sheet.dart';

/// Step 7 — Required Documents: the full document-checklist annex,
/// grouped into the four official categories. Professional documents
/// (PRC ID, PTR, signed & sealed form/plans) and the Structural Analysis
/// upload are read/written directly against
/// [AdditionExtensionProfessionalInCharge]'s fields (set in Step 5)
/// rather than duplicated here, so the same file is never uploaded twice.
class Step7RequiredDocuments extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final AdditionExtensionPermitDraft draft;
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
  AdditionExtensionRequiredDocuments get _documents =>
      widget.draft.requiredDocuments;
  AdditionExtensionProfessionalInCharge get _professional =>
      widget.draft.professional;
  AdditionExtensionProjectInformation get _project =>
      widget.draft.projectInformation;

  void _previewDocument(DocumentModel document) {
    Navigator.of(context).push<void>(
      MaterialPageRoute(
        builder: (_) => DocumentFilePreviewScreen(document: document),
      ),
    );
  }

  Widget _uploadTile({
    required String label,
    required DocumentModel? Function() getDocument,
    required void Function(DocumentModel?) setDocument,
    String? statusLabel,
    bool isRequired = true,
  }) {
    final document = getDocument();
    return DocumentUploadTile(
      label: label,
      isRequired: isRequired,
      statusLabel: statusLabel,
      document: document,
      allowReplace: true,
      onUpload: () async {
        final result = await showAttachDocumentOptions(context, label: label);
        if (result == null) return;
        setState(() => setDocument(result));
        widget.onChanged();
      },
      onPreview: document == null ? null : () => _previewDocument(document),
      onRemove: () {
        setState(() => setDocument(null));
        widget.onChanged();
      },
    );
  }

  Widget _existingDocumentTile({
    required String label,
    required AdditionExtensionDocumentSlot slot,
  }) {
    if (slot.markedNotAvailable) {
      return AppCard(
        child: Row(
          children: [
            const Icon(Icons.info_outline, color: AppColors.textMuted),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: AppTypography.bodyStrong),
                  const SizedBox(height: 2),
                  Text('Marked as not available', style: AppTypography.caption),
                ],
              ),
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
          onUpload: () async {
            final result = await showAttachDocumentOptions(
              context,
              label: label,
            );
            if (result == null) return;
            setState(() => slot.upload = result);
            widget.onChanged();
          },
          onPreview: slot.upload == null
              ? null
              : () => _previewDocument(slot.upload!),
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
    final requiresStructural = widget.draft.requiresStructuralAnalysis;
    final requiresSiteDev = _project.requiresSiteDevelopmentPlan;
    final requiresElectrical = _project.affectedAreas.contains(
      AffectedBuildingArea.electricalSystem,
    );
    final requiresMechanical = _project.affectedAreas.contains(
      AffectedBuildingArea.mechanicalSystem,
    );
    final requiresPlumbing = _project.affectedAreas.contains(
      AffectedBuildingArea.plumbingSystem,
    );
    final requiresSanitary = _project.affectedAreas.contains(
      AffectedBuildingArea.sanitarySystem,
    );
    final requiresElectronics = _project.affectedAreas.contains(
      AffectedBuildingArea.electronicsSystem,
    );
    final requiresFireSafety = _project.affectedAreas.contains(
      AffectedBuildingArea.fireSafetySystem,
    );

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
              title: 'Property Documents',
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
                _uploadTile(
                  label: 'Proof of Ownership or Authority to Build',
                  getDocument: () =>
                      _documents.proofOfOwnershipOrAuthorityUpload,
                  setDocument: (d) =>
                      _documents.proofOfOwnershipOrAuthorityUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Existing Building Documents',
              subtitle: 'Mark documents you don\'t have as not available.',
              children: [
                _existingDocumentTile(
                  label: 'Existing Building Permit',
                  slot: _documents.existingBuildingPermit,
                ),
                _existingDocumentTile(
                  label: 'Existing Certificate of Occupancy',
                  slot: _documents.existingCertificateOfOccupancy,
                ),
                _existingDocumentTile(
                  label: 'Existing Approved Building Plans',
                  slot: _documents.existingApprovedBuildingPlans,
                ),
                _existingDocumentTile(
                  label: 'Recent Photographs of the Existing Building',
                  slot: _documents.recentPhotographs,
                ),
                _uploadTile(
                  label: 'As-Built Plans',
                  isRequired: false,
                  statusLabel: 'Optional — when available',
                  getDocument: () => _documents.asBuiltPlansUpload,
                  setDocument: (d) => _documents.asBuiltPlansUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Addition / Extension Technical Documents',
              children: [
                _uploadTile(
                  label: 'Site Development Plan',
                  isRequired: requiresSiteDev,
                  statusLabel: requiresSiteDev
                      ? 'Conditionally required — Horizontal Extension selected'
                      : 'Not required for the selected addition type',
                  getDocument: () => _documents.siteDevelopmentPlanUpload,
                  setDocument: (d) => _documents.siteDevelopmentPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Addition / Extension Plans',
                  getDocument: () => _documents.additionExtensionPlansUpload,
                  setDocument: (d) =>
                      _documents.additionExtensionPlansUpload = d,
                ),
                _uploadTile(
                  label: 'Architectural Plans',
                  getDocument: () => _documents.architecturalPlansUpload,
                  setDocument: (d) => _documents.architecturalPlansUpload = d,
                ),
                _uploadTile(
                  label: 'Civil / Structural Plans',
                  isRequired: requiresStructural,
                  statusLabel: requiresStructural
                      ? 'Conditionally required — structural work is involved'
                      : 'Not required for the selected affected areas',
                  getDocument: () => _documents.civilStructuralPlansUpload,
                  setDocument: (d) =>
                      _documents.civilStructuralPlansUpload = d,
                ),
                _uploadTile(
                  label: 'Structural Analysis and Design Calculations',
                  isRequired: requiresStructural,
                  statusLabel: requiresStructural
                      ? 'Conditionally required — same file as Step 5\'s '
                            'Structural Analysis upload'
                      : 'Not required for the selected affected areas',
                  getDocument: () => _professional.structuralAnalysisUpload,
                  setDocument: (d) => _professional.structuralAnalysisUpload = d,
                ),
                _uploadTile(
                  label: 'Electrical Plans',
                  isRequired: requiresElectrical,
                  statusLabel: requiresElectrical
                      ? 'Conditionally required — Electrical System selected'
                      : 'Not required for the selected affected areas',
                  getDocument: () => _documents.electricalPlansUpload,
                  setDocument: (d) => _documents.electricalPlansUpload = d,
                ),
                _uploadTile(
                  label: 'Mechanical Plans',
                  isRequired: requiresMechanical,
                  statusLabel: requiresMechanical
                      ? 'Conditionally required — Mechanical System selected'
                      : 'Not required for the selected affected areas',
                  getDocument: () => _documents.mechanicalPlansUpload,
                  setDocument: (d) => _documents.mechanicalPlansUpload = d,
                ),
                _uploadTile(
                  label: 'Plumbing Plans',
                  isRequired: requiresPlumbing,
                  statusLabel: requiresPlumbing
                      ? 'Conditionally required — Plumbing System selected'
                      : 'Not required for the selected affected areas',
                  getDocument: () => _documents.plumbingPlansUpload,
                  setDocument: (d) => _documents.plumbingPlansUpload = d,
                ),
                _uploadTile(
                  label: 'Sanitary Plans',
                  isRequired: requiresSanitary,
                  statusLabel: requiresSanitary
                      ? 'Conditionally required — Sanitary System selected'
                      : 'Not required for the selected affected areas',
                  getDocument: () => _documents.sanitaryPlansUpload,
                  setDocument: (d) => _documents.sanitaryPlansUpload = d,
                ),
                _uploadTile(
                  label: 'Electronics Plans',
                  isRequired: requiresElectronics,
                  statusLabel: requiresElectronics
                      ? 'Conditionally required — Electronics System selected'
                      : 'Not required for the selected affected areas',
                  getDocument: () => _documents.electronicsPlansUpload,
                  setDocument: (d) => _documents.electronicsPlansUpload = d,
                ),
                _uploadTile(
                  label: 'Fire Safety Plans or Requirements',
                  isRequired: requiresFireSafety,
                  statusLabel: requiresFireSafety
                      ? 'Conditionally required — Fire Safety System selected'
                      : 'Not required for the selected affected areas',
                  getDocument: () => _documents.fireSafetyPlansUpload,
                  setDocument: (d) => _documents.fireSafetyPlansUpload = d,
                ),
                _uploadTile(
                  label: 'Technical Specifications',
                  getDocument: () => _documents.technicalSpecificationsUpload,
                  setDocument: (d) =>
                      _documents.technicalSpecificationsUpload = d,
                ),
                _uploadTile(
                  label: 'Bill of Materials',
                  getDocument: () => _documents.billOfMaterialsUpload,
                  setDocument: (d) => _documents.billOfMaterialsUpload = d,
                ),
                _uploadTile(
                  label: 'Detailed Cost Estimate',
                  getDocument: () => _documents.detailedCostEstimateUpload,
                  setDocument: (d) =>
                      _documents.detailedCostEstimateUpload = d,
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
                  getDocument: () => _professional.prcIdUpload,
                  setDocument: (d) => _professional.prcIdUpload = d,
                ),
                _uploadTile(
                  label: 'PTR',
                  getDocument: () => _professional.ptrDocumentUpload,
                  setDocument: (d) => _professional.ptrDocumentUpload = d,
                ),
                _uploadTile(
                  label: 'Signed and Sealed Plans',
                  getDocument: () => _professional.signedSealedPlansUpload,
                  setDocument: (d) =>
                      _professional.signedSealedPlansUpload = d,
                ),
                _uploadTile(
                  label: 'Signed and Sealed Forms',
                  getDocument: () => _professional.signedSealedFormUpload,
                  setDocument: (d) => _professional.signedSealedFormUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Government Clearances',
              children: [
                _uploadTile(
                  label: 'Barangay Clearance',
                  getDocument: () => _documents.barangayClearanceUpload,
                  setDocument: (d) => _documents.barangayClearanceUpload = d,
                ),
                _uploadTile(
                  label: 'Zoning / Locational Clearance',
                  getDocument: () => _documents.zoningClearanceUpload,
                  setDocument: (d) => _documents.zoningClearanceUpload = d,
                ),
                _uploadTile(
                  label: 'Fire Safety Evaluation',
                  getDocument: () => _documents.fireSafetyEvaluationUpload,
                  setDocument: (d) =>
                      _documents.fireSafetyEvaluationUpload = d,
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
