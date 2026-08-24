import 'package:flutter/material.dart';

import '../../../../../core/models/document_model.dart';
import '../../../../../core/models/fsic_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/uploads/document_upload_tile.dart';
import '../../building_permit/widgets/mock_upload.dart';

/// Step 4 — Required Documents, based on BFP Castilla Fire Station Form
/// BFP-QSF-FSED-002's "FSIC FOR CERTIFICATE OF OCCUPANCY" section
/// specifically (its separate "FSIC FOR BUSINESS PERMIT" section does
/// not apply to this permit type). The As-Built Plan and the Fire Safety
/// Compliance and Commissioning Report are only required "if necessary"
/// per the official form, so both stay optional uploads. The FSITF
/// (Fire Safety Inspection Task Force) report is generated internally by
/// BFP during inspection — it is not something the applicant submits, so
/// it is not listed here.
class Step4RequiredDocuments extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final FsicPermitDraft draft;
  final VoidCallback onChanged;

  const Step4RequiredDocuments({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step4RequiredDocuments> createState() =>
      _Step4RequiredDocumentsState();
}

class _Step4RequiredDocumentsState extends State<Step4RequiredDocuments> {
  FsicRequiredDocuments get _documents => widget.draft.requiredDocuments;

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
                  'Endorsement from the Office of the Building Official '
                  '(OBO)',
              getDocument: () => _documents.oboEndorsementUpload,
              setDocument: (d) => _documents.oboEndorsementUpload = d,
            ),
            const SizedBox(height: AppSpacing.md),
            _uploadTile(
              label: 'Certificate of Completion',
              getDocument: () => _documents.certificateOfCompletionUpload,
              setDocument: (d) => _documents.certificateOfCompletionUpload = d,
            ),
            const SizedBox(height: AppSpacing.md),
            _uploadTile(
              label:
                  'Certified True Copy of the Assessment Fee for '
                  'Securing the Certificate of Occupancy from OBO',
              getDocument: () => _documents.assessmentFeeCertifiedCopyUpload,
              setDocument: (d) =>
                  _documents.assessmentFeeCertifiedCopyUpload = d,
            ),
            const SizedBox(height: AppSpacing.md),
            _uploadTile(
              label: 'As-Built Plan',
              isRequired: false,
              statusLabel: 'Optional — if necessary',
              getDocument: () => _documents.asBuiltPlanUpload,
              setDocument: (d) => _documents.asBuiltPlanUpload = d,
            ),
            const SizedBox(height: AppSpacing.md),
            _uploadTile(
              label:
                  'Fire Safety Compliance and Commissioning Report '
                  '(FSCCR)',
              isRequired: false,
              statusLabel: 'Optional — one (1) set, if necessary',
              getDocument: () =>
                  _documents.fireSafetyComplianceAndCommissioningReportUpload,
              setDocument: (d) => _documents
                  .fireSafetyComplianceAndCommissioningReportUpload = d,
            ),
          ],
        ),
      ),
    );
  }
}
