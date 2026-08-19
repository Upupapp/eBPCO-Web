import 'package:flutter/material.dart';

import '../../../../../core/models/document_model.dart';
import '../../../../../core/models/electronics_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/layout/expandable_section.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/uploads/document_upload_tile.dart';
import '../../building_permit/widgets/mock_upload.dart';

/// Step 7 — Required Electronics Documents (Box 7): the official form's
/// four sets of documents — Electronics Plans and Specifications, Bill of
/// Materials, Cost Estimates, and Other supporting documents. Professional
/// documents already collected in Step 5 are read/written directly
/// against [ElectronicsProfessionals]'s fields rather than duplicated
/// here, so the same PRC ID/PTR/signed-and-sealed file is never uploaded
/// twice.
class Step7RequiredDocuments extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final ElectronicsPermitDraft draft;
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
  ElectronicsRequiredDocuments get _documents => widget.draft.requiredDocuments;
  ElectronicsProfessionals get _professionals => widget.draft.professionals;

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
              'formats: PDF, JPG, JPEG, PNG. Maximum file size: 10 MB per '
              'document.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.lg),

            ExpandableSection(
              title: 'Core Electronics Documents',
              subtitle:
                  'Plans and specifications are already provided in Step 5.',
              initiallyExpanded: true,
              children: [
                _uploadTile(
                  label: 'Electronics Plans',
                  getDocument: () => _professionals.signedSealedPlansUpload,
                  setDocument: (d) => _professionals.signedSealedPlansUpload = d,
                ),
                _uploadTile(
                  label: 'Electronics Specifications',
                  getDocument: () =>
                      _professionals.signedSealedSpecificationsUpload,
                  setDocument: (d) =>
                      _professionals.signedSealedSpecificationsUpload = d,
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
                  label: 'Cost Estimates',
                  getDocument: () => _documents.costEstimatesUpload,
                  setDocument: (d) => _documents.costEstimatesUpload = d,
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
                  label: 'Signed Design Calculations',
                  isRequired: false,
                  statusLabel: 'Optional — where required',
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
                  label: 'Other Supporting Documents',
                  isRequired: false,
                  statusLabel: 'Optional',
                  getDocument: () => _documents.otherSupportingDocumentsUpload,
                  setDocument: (d) =>
                      _documents.otherSupportingDocumentsUpload = d,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
