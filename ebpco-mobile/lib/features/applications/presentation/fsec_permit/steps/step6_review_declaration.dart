import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/fsec_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';

/// Step 6 — Review & Declaration: a read-only summary of every prior step
/// (with an Edit shortcut back into each), plus the certifications
/// required before the FSEC application can be submitted.
class Step6ReviewDeclaration extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final FsecPermitDraft draft;
  final VoidCallback onChanged;

  /// Jumps the wizard back to the given step index so the applicant can
  /// correct something before submitting.
  final ValueChanged<int> onEditStep;

  const Step6ReviewDeclaration({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
    required this.onEditStep,
  });

  @override
  State<Step6ReviewDeclaration> createState() =>
      _Step6ReviewDeclarationState();
}

class _Step6ReviewDeclarationState extends State<Step6ReviewDeclaration> {
  FsecReviewDeclaration get _review => widget.draft.reviewDeclaration;

  void _toggle(void Function(bool) setter, bool value) {
    setState(() => setter(value));
    widget.onChanged();
  }

  @override
  Widget build(BuildContext context) {
    final relatedPermit = widget.draft.relatedBuildingPermit;
    final applicant = widget.draft.applicant;
    final project = widget.draft.projectInformation;
    final professional = widget.draft.designProfessional;
    final documents = widget.draft.requiredDocuments;

    final fullName = [
      applicant.firstName,
      applicant.middleName,
      applicant.lastName,
    ].where((s) => s.trim().isNotEmpty).join(' ');

    final documentsUploaded = [
      documents.proposedPlansUpload,
      documents.costEstimateUpload,
      documents.fireSafetyComplianceReportUpload,
      documents.hotWorkClearanceUpload,
    ].where((d) => d != null).length;

    return Form(
      key: widget.formKey,
      child: FormScrollScaffold(
        centerVertically: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _SummarySection(
              title: 'Related Building Permit',
              onEdit: () => widget.onEditStep(0),
              rows: [
                _SummaryRow(
                  'Building Permit Application Number',
                  relatedPermit.buildingPermitApplicationNumber,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Applicant',
              onEdit: () => widget.onEditStep(1),
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
              title: 'Project Information',
              onEdit: () => widget.onEditStep(2),
              rows: [
                _SummaryRow('Project Name', project.projectName),
                _SummaryRow(
                  'Location',
                  '${project.street}, ${project.barangay}, '
                      '${project.city}, ${project.province}',
                ),
                _SummaryRow(
                  'Use or Character of Occupancy',
                  project.occupancyGroup?.label ?? 'Not set',
                ),
                _SummaryRow(
                  'Fire Detection / Sprinkler System',
                  project.hasFireDetectionOrSprinklerSystem ? 'Yes' : 'No',
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Design Professional',
              onEdit: () => widget.onEditStep(3),
              rows: [
                _SummaryRow('Full Name', professional.fullName),
                _SummaryRow(
                  'Profession',
                  professional.profession?.label ?? 'Not set',
                ),
                _SummaryRow('PRC Number', professional.prcNumber),
                _SummaryRow('PTR Number', professional.ptrNumber),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Required Documents',
              onEdit: () => widget.onEditStep(4),
              rows: [
                _SummaryRow(
                  'Documents Uploaded',
                  '$documentsUploaded of 4 uploaded',
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
                    value: _review.certifiesPlansComplyWithFireCode,
                    label:
                        'I certify that the submitted plans comply with '
                        'the Fire Code of the Philippines (RA 9514).',
                    onChanged: (v) => _toggle(
                      (val) => _review.certifiesPlansComplyWithFireCode = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value:
                        _review.understandsProfessionalDocumentsMustBeAuthentic,
                    label:
                        'I understand that all required signed and sealed '
                        'professional documents must be authentic.',
                    onChanged: (v) => _toggle(
                      (val) => _review
                          .understandsProfessionalDocumentsMustBeAuthentic =
                          val,
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
