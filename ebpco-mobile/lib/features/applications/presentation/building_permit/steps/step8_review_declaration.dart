import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/building_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';

final DateFormat _dateFormat = DateFormat('MMM d, yyyy');

String _formatDate(DateTime? date) =>
    date != null ? _dateFormat.format(date) : 'Not set';

/// Step 8 — Review & Declaration: a read-only summary of every prior step
/// (with an Edit shortcut back into each), plus the three certifications
/// required before the application can be submitted.
class Step8ReviewDeclaration extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final BuildingPermitDraft draft;
  final VoidCallback onChanged;

  /// Jumps the wizard back to the given step index so the applicant can
  /// correct something before submitting.
  final ValueChanged<int> onEditStep;

  const Step8ReviewDeclaration({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
    required this.onEditStep,
  });

  @override
  State<Step8ReviewDeclaration> createState() =>
      _Step8ReviewDeclarationState();
}

class _Step8ReviewDeclarationState extends State<Step8ReviewDeclaration> {
  BuildingPermitDraft get _draft => widget.draft;
  ReviewDeclaration get _review => widget.draft.reviewDeclaration;

  void _toggle(void Function(bool) setter, bool value) {
    setState(() => setter(value));
    widget.onChanged();
  }

  @override
  Widget build(BuildContext context) {
    final applicant = _draft.applicant;
    final address = _draft.applicantAddress;
    final location = _draft.constructionLocation;
    final project = _draft.projectInformation;
    final building = _draft.buildingDetails;
    final professional = _draft.professional;
    final consent = _draft.consentAuthorization;
    final documents = _draft.requiredDocuments;

    final fullName = [
      applicant.firstName,
      applicant.middleName,
      applicant.lastName,
    ].where((s) => s.trim().isNotEmpty).join(' ');

    final scopeOfWorkSummary = project.scopeOfWork
        .map((s) => s.label)
        .join(', ');

    final requiredDocsUploaded = [
          documents.landTitleUpload,
          documents.taxDeclarationUpload,
          documents.realPropertyTaxReceiptUpload,
          documents.plansUpload,
          documents.specificationsUpload,
          documents.billOfMaterialsUpload,
          documents.prcIdChecklistUpload,
          documents.ptrChecklistUpload,
          documents.signedFormsUpload,
          documents.barangayClearanceUpload,
          documents.zoningClearanceUpload,
          documents.fireRelatedRequirementsUpload,
        ]
        .where((d) => d != null)
        .length;

    final professionalDocsUploaded = [
          professional.prcIdUpload,
          professional.ptrUpload,
          professional.signedSealedUpload,
        ]
        .where((d) => d != null)
        .length;

    final isRepresentative = consent.isRegisteredOwner == false;
    final consentDocsUploaded = isRepresentative
        ? [
                consent.authorizationLetterUpload,
                consent.ownerValidIdUpload,
              ]
              .where((d) => d != null)
              .length
        : 0;

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
                _SummaryRow('Mobile Number', applicant.mobileNumber),
                _SummaryRow('Email Address', applicant.email),
                if (applicant.isOwnedByEnterprise) ...[
                  _SummaryRow('Enterprise Name', applicant.enterpriseName),
                  _SummaryRow(
                    'Form of Ownership',
                    applicant.formOfOwnership ?? 'Not set',
                  ),
                ],
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Property',
              onEdit: () => widget.onEditStep(1),
              rows: [
                _SummaryRow(
                  'Applicant Address',
                  '${address.street}, ${address.barangay}, ${address.city}, ${address.province}',
                ),
                _SummaryRow(
                  'Construction Location',
                  'Lot ${location.lotNumber}, ${location.street}, '
                      '${location.barangay}, ${location.city}, ${location.province}',
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Project',
              onEdit: () => widget.onEditStep(2),
              rows: [
                _SummaryRow(
                  'Scope of Work',
                  scopeOfWorkSummary.isEmpty ? 'Not set' : scopeOfWorkSummary,
                ),
                _SummaryRow(
                  'Building Use',
                  project.occupancyGroup?.label ?? 'Not set',
                ),
                _SummaryRow(
                  'Occupancy Classification',
                  building.occupancyClassification,
                ),
                _SummaryRow('Number of Units', building.numberOfUnits),
                _SummaryRow(
                  'Total Floor Area',
                  '${building.totalFloorArea} sq m',
                ),
                _SummaryRow('Lot Area', '${building.lotArea} sq m'),
                _SummaryRow(
                  'Estimated Construction Cost',
                  '₱${building.estimatedConstructionCost}',
                ),
                _SummaryRow(
                  'Proposed Construction Date',
                  _formatDate(building.proposedConstructionDate),
                ),
                _SummaryRow(
                  'Expected Completion Date',
                  _formatDate(building.expectedCompletionDate),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Professional',
              onEdit: () => widget.onEditStep(4),
              rows: [
                _SummaryRow('Full Name', professional.fullName),
                _SummaryRow(
                  'Profession',
                  professional.profession?.label ?? 'Not set',
                ),
                _SummaryRow('Address', professional.address),
                _SummaryRow('PRC Number', professional.prcNumber),
                _SummaryRow(
                  'PRC Validity Date',
                  _formatDate(professional.prcValidityDate),
                ),
                _SummaryRow('PTR Number', professional.ptrNumber),
                _SummaryRow(
                  'PTR Date Issued',
                  _formatDate(professional.ptrDateIssued),
                ),
                _SummaryRow('PTR Place Issued', professional.ptrPlaceIssued),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Uploaded Documents',
              onEdit: () => widget.onEditStep(6),
              rows: [
                _SummaryRow(
                  'Professional Documents',
                  '$professionalDocsUploaded of 3 uploaded',
                ),
                if (isRepresentative)
                  _SummaryRow(
                    'Authorization Documents',
                    '$consentDocsUploaded of 2 uploaded',
                  ),
                _SummaryRow(
                  'Document Checklist',
                  '$requiredDocsUploaded of 12 uploaded',
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
                    value: _review.certifiesTrueAndCorrect,
                    label:
                        'I certify that the information provided is true and correct.',
                    onChanged: (v) =>
                        _toggle((val) => _review.certifiesTrueAndCorrect = val, v),
                  ),
                  _DeclarationCheckbox(
                    value: _review.understandsRequirements,
                    label: 'I understand the application requirements.',
                    onChanged: (v) => _toggle(
                      (val) => _review.understandsRequirements = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review.agreesToTerms,
                    label: 'I agree to the Terms & Conditions.',
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
            Expanded(
              child: Text(title, style: AppTypography.cardTitle),
            ),
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
