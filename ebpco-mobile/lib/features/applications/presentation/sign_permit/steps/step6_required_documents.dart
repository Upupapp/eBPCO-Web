import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/document_model.dart';
import '../../../../../core/models/sign_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/expandable_section.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/uploads/document_upload_tile.dart';
import '../../building_permit/widgets/mock_upload.dart';

/// Step 6 — Required Supporting Documents (Box 2). Whether the applicant
/// owns the property is asked directly here, since it determines whether
/// the Contract of Lease upload is required — the official form does not
/// ask this anywhere else.
class Step6RequiredDocuments extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final SignPermitDraft draft;
  final VoidCallback onChanged;

  const Step6RequiredDocuments({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step6RequiredDocuments> createState() =>
      _Step6RequiredDocumentsState();
}

class _Step6RequiredDocumentsState extends State<Step6RequiredDocuments> {
  SignRequiredDocuments get _documents => widget.draft.requiredDocuments;

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
            Text('Property Ownership', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Is the applicant the owner of the property?',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            Row(
              children: [
                Expanded(
                  child: _YesNoOption(
                    label: 'Yes',
                    selected: _documents.isApplicantPropertyOwner == true,
                    onTap: () {
                      setState(
                        () => _documents.isApplicantPropertyOwner = true,
                      );
                      widget.onChanged();
                    },
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: _YesNoOption(
                    label: 'No',
                    selected: _documents.needsContractOfLease,
                    onTap: () {
                      setState(
                        () => _documents.isApplicantPropertyOwner = false,
                      );
                      widget.onChanged();
                    },
                  ),
                ),
              ],
            ),

            const SizedBox(height: AppSpacing.xl),
            Text(
              'Upload clear copies of every document below. Accepted '
              'formats: PDF, JPG, JPEG, PNG. Maximum file size: 10 MB per '
              'document.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.lg),

            ExpandableSection(
              title: 'Property Documents',
              initiallyExpanded: true,
              children: [
                _uploadTile(
                  label: 'Certified True Copy of TCT/OCT',
                  getDocument: () => _documents.tctOrOctCopyUpload,
                  setDocument: (d) => _documents.tctOrOctCopyUpload = d,
                ),
                _uploadTile(
                  label: 'Tax Declaration',
                  getDocument: () => _documents.taxDeclarationUpload,
                  setDocument: (d) => _documents.taxDeclarationUpload = d,
                ),
                _uploadTile(
                  label: 'Latest Realty Tax Receipt',
                  getDocument: () => _documents.realtyTaxReceiptUpload,
                  setDocument: (d) => _documents.realtyTaxReceiptUpload = d,
                ),
                if (_documents.needsContractOfLease)
                  _uploadTile(
                    label: 'Contract of Lease',
                    getDocument: () => _documents.contractOfLeaseUpload,
                    setDocument: (d) => _documents.contractOfLeaseUpload = d,
                  ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Plans',
              children: [
                _uploadTile(
                  label: 'Lot Plan',
                  getDocument: () => _documents.lotPlanUpload,
                  setDocument: (d) => _documents.lotPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Site Development Plan',
                  getDocument: () => _documents.siteDevelopmentPlanUpload,
                  setDocument: (d) => _documents.siteDevelopmentPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Sign Structure Plans',
                  getDocument: () => _documents.signStructurePlansUpload,
                  setDocument: (d) => _documents.signStructurePlansUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Structural & Cost Documents',
              children: [
                _uploadTile(
                  label: 'Structural Design and Computations',
                  getDocument: () =>
                      _documents.structuralDesignAndComputationsUpload,
                  setDocument: (d) => _documents
                      .structuralDesignAndComputationsUpload = d,
                ),
                _uploadTile(
                  label: 'Specifications',
                  getDocument: () => _documents.specificationsUpload,
                  setDocument: (d) => _documents.specificationsUpload = d,
                ),
                _uploadTile(
                  label: 'Cost Estimates',
                  getDocument: () => _documents.costEstimatesUpload,
                  setDocument: (d) => _documents.costEstimatesUpload = d,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _YesNoOption extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _YesNoOption({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: onTap,
      backgroundColor: selected ? AppColors.lightBlue : AppColors.surface,
      showBorder: !selected,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            selected ? Icons.check_circle : Icons.radio_button_unchecked,
            color: selected ? AppColors.secondaryBlue : AppColors.textMuted,
            size: 20,
          ),
          const SizedBox(width: AppSpacing.sm),
          Text(
            label,
            style: selected
                ? AppTypography.bodyStrong.copyWith(
                    color: AppColors.secondaryBlueDark,
                  )
                : AppTypography.body,
          ),
        ],
      ),
    );
  }
}
