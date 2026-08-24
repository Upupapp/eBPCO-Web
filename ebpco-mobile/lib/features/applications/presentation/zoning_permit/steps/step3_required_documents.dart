import 'package:flutter/material.dart';

import '../../../../../core/models/document_model.dart';
import '../../../../../core/models/zoning_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/uploads/document_upload_tile.dart';
import '../../building_permit/widgets/mock_upload.dart';

/// Step 3 — Required Documents, based on Castilla's own MPDO Form
/// FM-MPD-12 "Application for Locational Clearance / Certificate of
/// Zoning Compliance".
class Step3RequiredDocuments extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final ZoningPermitDraft draft;
  final VoidCallback onChanged;

  const Step3RequiredDocuments({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step3RequiredDocuments> createState() =>
      _Step3RequiredDocumentsState();
}

class _Step3RequiredDocumentsState extends State<Step3RequiredDocuments> {
  ZoningRequiredDocuments get _documents => widget.draft.requiredDocuments;

  Widget _uploadTile({
    required String label,
    required DocumentModel? Function() getDocument,
    required void Function(DocumentModel?) setDocument,
    String? statusLabel,
    bool isRequired = true,
  }) {
    return DocumentUploadTile(
      label: label,
      isRequired: isRequired,
      statusLabel: statusLabel,
      document: getDocument(),
      allowReplace: true,
      onUpload: () {
        setState(() => setDocument(createMockDocument(label)));
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

            _uploadTile(
              label:
                  'Notarized Letter Request Addressed to the Zoning '
                  'Administrator',
              getDocument: () => _documents.notarizedLetterRequestUpload,
              setDocument: (d) => _documents.notarizedLetterRequestUpload = d,
            ),
            const SizedBox(height: AppSpacing.md),
            _uploadTile(
              label: 'Site Development Plan',
              getDocument: () => _documents.siteDevelopmentPlanUpload,
              setDocument: (d) => _documents.siteDevelopmentPlanUpload = d,
            ),
            const SizedBox(height: AppSpacing.md),
            _uploadTile(
              label: 'Vicinity Map',
              getDocument: () => _documents.vicinityMapUpload,
              setDocument: (d) => _documents.vicinityMapUpload = d,
            ),
            const SizedBox(height: AppSpacing.md),
            _uploadTile(
              label: 'Proof of Ownership',
              getDocument: () => _documents.proofOfOwnershipUpload,
              setDocument: (d) => _documents.proofOfOwnershipUpload = d,
            ),
            const SizedBox(height: AppSpacing.md),
            _uploadTile(
              label:
                  'Tax Declaration / Certificate of Title (COT) / OCT',
              getDocument: () => _documents.taxDeclarationOrTitleUpload,
              setDocument: (d) => _documents.taxDeclarationOrTitleUpload = d,
            ),
            const SizedBox(height: AppSpacing.md),
            _uploadTile(
              label: 'Land Tax Receipt (Current Year)',
              getDocument: () => _documents.landTaxReceiptUpload,
              setDocument: (d) => _documents.landTaxReceiptUpload = d,
            ),
            const SizedBox(height: AppSpacing.md),
            _uploadTile(
              label: 'Sketch Plan of the House',
              getDocument: () => _documents.sketchPlanOfHouseUpload,
              setDocument: (d) => _documents.sketchPlanOfHouseUpload = d,
            ),
            const SizedBox(height: AppSpacing.md),
            _uploadTile(
              label: 'Barangay Building Clearance',
              getDocument: () => _documents.barangayBuildingClearanceUpload,
              setDocument: (d) =>
                  _documents.barangayBuildingClearanceUpload = d,
            ),
            const SizedBox(height: AppSpacing.md),
            _uploadTile(
              label: 'Bill of Materials',
              getDocument: () => _documents.billOfMaterialsUpload,
              setDocument: (d) => _documents.billOfMaterialsUpload = d,
            ),
            const SizedBox(height: AppSpacing.md),
            _uploadTile(
              label: 'Cedula (Photocopy)',
              getDocument: () => _documents.cedulaUpload,
              setDocument: (d) => _documents.cedulaUpload = d,
            ),
            const SizedBox(height: AppSpacing.md),
            _uploadTile(
              label: 'DPWH Clearance',
              isRequired: false,
              statusLabel: 'Optional — if applicable',
              getDocument: () => _documents.dpwhClearanceUpload,
              setDocument: (d) => _documents.dpwhClearanceUpload = d,
            ),
            const SizedBox(height: AppSpacing.md),
            _uploadTile(
              label: 'Environmental Compliance Certificate (ECC)',
              isRequired: false,
              statusLabel: 'Optional — if applicable',
              getDocument: () =>
                  _documents.environmentalComplianceCertificateUpload,
              setDocument: (d) =>
                  _documents.environmentalComplianceCertificateUpload = d,
            ),
          ],
        ),
      ),
    );
  }
}
