import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/zoning_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';

/// Step 4 — Review & Declaration: a read-only summary of every prior step
/// (with an Edit shortcut back into each), plus the certifications
/// required before the Zoning / Locational Clearance application can be
/// submitted.
class Step4ReviewDeclaration extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final ZoningPermitDraft draft;
  final VoidCallback onChanged;

  /// Jumps the wizard back to the given step index so the applicant can
  /// correct something before submitting.
  final ValueChanged<int> onEditStep;

  const Step4ReviewDeclaration({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
    required this.onEditStep,
  });

  @override
  State<Step4ReviewDeclaration> createState() =>
      _Step4ReviewDeclarationState();
}

class _Step4ReviewDeclarationState extends State<Step4ReviewDeclaration> {
  ZoningReviewDeclaration get _review => widget.draft.reviewDeclaration;

  void _toggle(void Function(bool) setter, bool value) {
    setState(() => setter(value));
    widget.onChanged();
  }

  @override
  Widget build(BuildContext context) {
    final applicant = widget.draft.applicant;
    final location = widget.draft.propertyLocation;
    final documents = widget.draft.requiredDocuments;

    final fullName = [
      applicant.firstName,
      applicant.middleName,
      applicant.lastName,
    ].where((s) => s.trim().isNotEmpty).join(' ');

    final documentsUploaded = [
      documents.notarizedLetterRequestUpload,
      documents.siteDevelopmentPlanUpload,
      documents.vicinityMapUpload,
      documents.proofOfOwnershipUpload,
      documents.taxDeclarationOrTitleUpload,
      documents.landTaxReceiptUpload,
      documents.sketchPlanOfHouseUpload,
      documents.barangayBuildingClearanceUpload,
      documents.billOfMaterialsUpload,
      documents.cedulaUpload,
    ].where((d) => d != null).length;

    return Form(
      key: widget.formKey,
      child: FormScrollScaffold(
        centerVertically: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _SummarySection(
              title: 'Applicant',
              onEdit: () => widget.onEditStep(0),
              rows: [
                _SummaryRow('Name', fullName.isEmpty ? 'Not set' : fullName),
                _SummaryRow(
                  'Telephone / Mobile Number',
                  applicant.contactNumber,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Property & Location',
              onEdit: () => widget.onEditStep(1),
              rows: [
                _SummaryRow(
                  'Location',
                  'Lot ${location.lotNumber}, ${location.street}, '
                      '${location.barangay}, ${location.city}, '
                      '${location.province}',
                ),
                _SummaryRow(
                  'Intended Use or Purpose',
                  location.intendedUseOrPurpose,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Required Documents',
              onEdit: () => widget.onEditStep(2),
              rows: [
                _SummaryRow(
                  'Required Documents Uploaded',
                  '$documentsUploaded of 10 uploaded',
                ),
                _SummaryRow(
                  'DPWH Clearance',
                  documents.dpwhClearanceUpload != null
                      ? 'Uploaded'
                      : 'Not applicable / not uploaded',
                ),
                _SummaryRow(
                  'Environmental Compliance Certificate (ECC)',
                  documents.environmentalComplianceCertificateUpload != null
                      ? 'Uploaded'
                      : 'Not applicable / not uploaded',
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.xl),
            Text('Declaration', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _DeclarationCheckbox(
                    value: _review.certifiesInformationIsAccurate,
                    label:
                        'I certify that the information provided is true '
                        'and correct.',
                    onChanged: (v) => _toggle(
                      (val) => _review.certifiesInformationIsAccurate = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review.certifiesDocumentsAreAuthentic,
                    label:
                        'I certify that all submitted documents are '
                        'authentic.',
                    onChanged: (v) => _toggle(
                      (val) => _review.certifiesDocumentsAreAuthentic = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value:
                        _review.understandsSubjectToInspectionAndZoningReview,
                    label:
                        'I understand that this application is subject to '
                        'site inspection and zoning review.',
                    onChanged: (v) => _toggle(
                      (val) => _review
                          .understandsSubjectToInspectionAndZoningReview = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review.agreesToTerms,
                    label: 'I agree to the Terms and Conditions.',
                    onChanged: (v) =>
                        _toggle((val) => _review.agreesToTerms = val, v),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SummarySection extends StatelessWidget {
  final String title;
  final VoidCallback onEdit;
  final List<_SummaryRow> rows;

  const _SummarySection({
    required this.title,
    required this.onEdit,
    required this.rows,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Expanded(child: Text(title, style: AppTypography.cardTitle)),
            TextButton(onPressed: onEdit, child: const Text('Edit')),
          ],
        ),
        AppCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              for (final row in rows) ...[
                row,
                if (row != rows.last) const SizedBox(height: AppSpacing.sm),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;

  const _SummaryRow(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTypography.caption),
        const SizedBox(height: 2),
        Text(
          value.trim().isEmpty ? 'Not set' : value,
          style: AppTypography.bodyStrong,
        ),
      ],
    );
  }
}

class _DeclarationCheckbox extends StatelessWidget {
  final bool value;
  final String label;
  final ValueChanged<bool> onChanged;

  const _DeclarationCheckbox({
    required this.value,
    required this.label,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => onChanged(!value),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Checkbox(
              value: value,
              activeColor: AppColors.primary,
              onChanged: (v) => onChanged(v ?? false),
            ),
            Expanded(child: Text(label, style: AppTypography.body)),
          ],
        ),
      ),
    );
  }
}
