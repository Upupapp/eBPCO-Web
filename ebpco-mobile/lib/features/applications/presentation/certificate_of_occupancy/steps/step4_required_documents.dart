import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/certificate_of_occupancy_model.dart';
import '../../../../../core/models/document_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';
import '../../../../../shared/widgets/uploads/document_upload_tile.dart';
import '../../../../documents/presentation/widgets/attach_document_sheet.dart';

/// Step 4 — Requirements and Supporting Documents, based on the official
/// form's submitted-requirements checklist. The paper form asks for
/// three physical copies of the as-built plans; this is represented as a
/// single digital upload here.
///
/// Unlike every other permit's upload slots (which fabricate a mock
/// [DocumentModel] on tap), this step's uploads open the real
/// Take Photo / Choose from Gallery / Choose from Files / Choose from My
/// Documents chooser — the one place in this app demonstrating "My
/// Documents" reuse inside a permit application, per the Profile module
/// update's requirements. No other permit's upload slots were changed.
class Step4RequiredDocuments extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final CertificateOfOccupancyDraft draft;
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
  OccupancyRequiredDocuments get _documents => widget.draft.requiredDocuments;

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
      onUpload: () async {
        final picked = await showAttachDocumentOptions(context, label: label);
        if (picked == null || !mounted) return;
        setState(() => setDocument(picked));
        widget.onChanged();
      },
      onRemove: () {
        setState(() => setDocument(null));
        widget.onChanged();
      },
    );
  }

  void _addOtherDocument() {
    setState(() => _documents.otherDocuments.add(OccupancyOtherDocument()));
    widget.onChanged();
  }

  void _removeOtherDocument(int index) {
    setState(() => _documents.otherDocuments.removeAt(index));
    widget.onChanged();
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
              label: 'As-Built Plans and Specifications',
              getDocument: () => _documents.asBuiltPlansUpload,
              setDocument: (d) => _documents.asBuiltPlansUpload = d,
            ),
            const SizedBox(height: AppSpacing.md),
            _uploadTile(
              label: 'Construction Logbook (Signed and Sealed)',
              getDocument: () => _documents.constructionLogbookUpload,
              setDocument: (d) => _documents.constructionLogbookUpload = d,
            ),
            const SizedBox(height: AppSpacing.md),
            _uploadTile(
              label: 'Certificate of Completion — Civil Works',
              getDocument: () => _documents.civilWorksCertificateUpload,
              setDocument: (d) => _documents.civilWorksCertificateUpload = d,
            ),
            const SizedBox(height: AppSpacing.md),
            _uploadTile(
              label: 'Electrical Certificate of Completion',
              getDocument: () => _documents.electricalCertificateUpload,
              setDocument: (d) => _documents.electricalCertificateUpload = d,
            ),
            const SizedBox(height: AppSpacing.md),
            _uploadTile(
              label: 'Other Discipline-Specific Completion Certificates',
              isRequired: false,
              statusLabel: 'Optional — when applicable',
              getDocument: () => _documents.otherDisciplineCertificatesUpload,
              setDocument: (d) =>
                  _documents.otherDisciplineCertificatesUpload = d,
            ),
            const SizedBox(height: AppSpacing.md),
            _uploadTile(
              label: 'Notarized Documents',
              isRequired: false,
              statusLabel: 'Optional — when required',
              getDocument: () => _documents.notarizedDocumentsUpload,
              setDocument: (d) => _documents.notarizedDocumentsUpload = d,
            ),
            const SizedBox(height: AppSpacing.md),
            _uploadTile(
              label: 'Other Supporting Requirements',
              isRequired: false,
              statusLabel: 'Optional',
              getDocument: () => _documents.otherSupportingRequirementsUpload,
              setDocument: (d) =>
                  _documents.otherSupportingRequirementsUpload = d,
            ),

            const SizedBox(height: AppSpacing.xl),
            Row(
              children: [
                Expanded(
                  child: Text(
                    'Additional Documents',
                    style: AppTypography.cardTitle,
                  ),
                ),
                TextButton.icon(
                  onPressed: _addOtherDocument,
                  icon: const Icon(Icons.add),
                  label: const Text('Add Document'),
                ),
              ],
            ),
            for (var i = 0; i < _documents.otherDocuments.length; i++) ...[
              const SizedBox(height: AppSpacing.sm),
              _OtherDocumentCard(
                document: _documents.otherDocuments[i],
                onChanged: widget.onChanged,
                onRemove: () => _removeOtherDocument(i),
                onRebuild: () => setState(() {}),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _OtherDocumentCard extends StatefulWidget {
  final OccupancyOtherDocument document;
  final VoidCallback onChanged;
  final VoidCallback onRemove;
  final VoidCallback onRebuild;

  const _OtherDocumentCard({
    required this.document,
    required this.onChanged,
    required this.onRemove,
    required this.onRebuild,
  });

  @override
  State<_OtherDocumentCard> createState() => _OtherDocumentCardState();
}

class _OtherDocumentCardState extends State<_OtherDocumentCard> {
  late final TextEditingController _name;
  late final TextEditingController _description;

  @override
  void initState() {
    super.initState();
    _name = TextEditingController(text: widget.document.name);
    _description = TextEditingController(text: widget.document.description);
  }

  @override
  void dispose() {
    _name.dispose();
    _description.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: Text('Other Document', style: AppTypography.bodyStrong),
              ),
              IconButton(
                icon: const Icon(Icons.delete_outline, color: AppColors.error),
                tooltip: 'Remove document',
                onPressed: widget.onRemove,
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          AppTextField(
            controller: _name,
            label: 'Document Name *',
            validator: (v) =>
                Validators.required(v, fieldLabel: 'Document name'),
            onChanged: (v) {
              widget.document.name = v;
              widget.onChanged();
            },
          ),
          const SizedBox(height: AppSpacing.md),
          AppTextField(
            controller: _description,
            label: 'Description',
            hint: 'Optional',
            maxLines: 2,
            onChanged: (v) {
              widget.document.description = v;
              widget.onChanged();
            },
          ),
          const SizedBox(height: AppSpacing.md),
          DocumentUploadTile(
            label: 'Selected File',
            document: widget.document.file,
            allowReplace: true,
            onUpload: () async {
              final picked = await showAttachDocumentOptions(
                context,
                label: widget.document.name.isEmpty
                    ? 'Other Document'
                    : widget.document.name,
              );
              if (picked == null || !mounted) return;
              widget.document.file = picked;
              widget.onRebuild();
              widget.onChanged();
            },
            onRemove: () {
              widget.document.file = null;
              widget.onRebuild();
              widget.onChanged();
            },
          ),
        ],
      ),
    );
  }
}
