import 'package:flutter/material.dart';

import '../../../../../core/models/document_model.dart';
import '../../../../../core/models/fsec_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/uploads/document_upload_tile.dart';
import '../../building_permit/widgets/mock_upload.dart';

/// Step 5 — Required Documents, based on BFP Castilla Fire Station Form
/// BFP-QSF-FSED-001 "Fire Safety Evaluation Clearance Application Form".
class Step5RequiredDocuments extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final FsecPermitDraft draft;
  final VoidCallback onChanged;

  const Step5RequiredDocuments({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step5RequiredDocuments> createState() =>
      _Step5RequiredDocumentsState();
}

class _Step5RequiredDocumentsState extends State<Step5RequiredDocuments> {
  FsecRequiredDocuments get _documents => widget.draft.requiredDocuments;

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
                  'Proposed Plans — Three (3) Complete Sets (Architectural, '
                  'Civil/Structural, Electrical, Mechanical, Plumbing, '
                  'Electronics, Sanitary, and Fire Protection)',
              getDocument: () => _documents.proposedPlansUpload,
              setDocument: (d) => _documents.proposedPlansUpload = d,
            ),
            const SizedBox(height: AppSpacing.md),
            _uploadTile(
              label: 'Cost Estimate of the Building',
              statusLabel:
                  'Including labor cost, signed and sealed by the '
                  'designer/contractor and duly notarized',
              getDocument: () => _documents.costEstimateUpload,
              setDocument: (d) => _documents.costEstimateUpload = d,
            ),
            const SizedBox(height: AppSpacing.md),
            _uploadTile(
              label: 'Fire Safety Compliance Report (FSCR)',
              isRequired: false,
              statusLabel: 'Optional — one (1) set, if necessary',
              getDocument: () => _documents.fireSafetyComplianceReportUpload,
              setDocument: (d) =>
                  _documents.fireSafetyComplianceReportUpload = d,
            ),
            const SizedBox(height: AppSpacing.md),
            _uploadTile(
              label:
                  'Fire Safety Clearance for Welding, Cutting, and Other '
                  'Hot Work Operations',
              isRequired: false,
              statusLabel: 'Optional — if required',
              getDocument: () => _documents.hotWorkClearanceUpload,
              setDocument: (d) => _documents.hotWorkClearanceUpload = d,
            ),
          ],
        ),
      ),
    );
  }
}
