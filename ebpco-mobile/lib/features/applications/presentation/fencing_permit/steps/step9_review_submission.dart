import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/fencing_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';

/// Step 9 — Review & Submission: a read-only summary of every prior step
/// (with an Edit shortcut back into each), plus the certifications
/// required before the fencing application can be submitted. Unlike
/// every other permit's wizard, this final step both reviews the
/// application AND triggers submission — there is no separate Evaluation
/// & Permit Status step, per the Fencing Permit spec's explicit 9-step
/// order.
class Step9ReviewSubmission extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final FencingPermitDraft draft;
  final VoidCallback onChanged;

  /// Jumps the wizard back to the given step index so the applicant can
  /// correct something before submitting.
  final ValueChanged<int> onEditStep;

  const Step9ReviewSubmission({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
    required this.onEditStep,
  });

  @override
  State<Step9ReviewSubmission> createState() => _Step9ReviewSubmissionState();
}

class _Step9ReviewSubmissionState extends State<Step9ReviewSubmission> {
  FencingPermitDraft get _draft => widget.draft;
  FencingReviewDeclaration get _review => widget.draft.reviewDeclaration;

  void _toggle(void Function(bool) setter, bool value) {
    setState(() => setter(value));
    widget.onChanged();
  }

  @override
  Widget build(BuildContext context) {
    final relatedPermit = _draft.relatedBuildingPermit;
    final applicant = _draft.applicant;
    final location = _draft.constructionLocation;
    final scope = _draft.scopeOfWork;
    final professionals = _draft.professionals;
    final specs = _draft.specifications;
    final consent = _draft.consent;

    final fullName = [
      applicant.firstName,
      applicant.middleInitial,
      applicant.lastName,
    ].where((s) => s.trim().isNotEmpty).join(' ');

    final scopeSummary = scope.selectedScopes.map((s) => s.label).join(', ');
    final fenceTypeSummary = specs.selectedTypes
        .map((t) => t.label)
        .join(', ');

    final needsSeparateLotOwner = consent.needsSeparateLotOwner;
    final totalApplicableDocs = needsSeparateLotOwner ? 4 : 3;
    final documentsUploaded =
        [
          professionals.designSignedDocumentUpload,
          professionals.supervisorSignedDocumentUpload,
          consent.applicantSignedDocumentUpload,
          if (needsSeparateLotOwner) consent.lotOwnerSignedDocumentUpload,
        ].where((d) => d != null).length;

    return Form(
      key: widget.formKey,
      child: FormScrollScaffold(
        centerVertically: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _SummarySection(
              title: 'Permit Information',
              onEdit: () => widget.onEditStep(0),
              rows: [
                _SummaryRow('Related Building Permit Status', relatedPermit.status.label),
                _SummaryRow(
                  'Building Permit Number',
                  relatedPermit.buildingPermitNumber,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Applicant Information',
              onEdit: () => widget.onEditStep(1),
              rows: [
                _SummaryRow('Name', fullName.isEmpty ? 'Not set' : fullName),
                _SummaryRow(
                  'Applicant Address',
                  '${applicant.street}, ${applicant.barangay}, ${applicant.city}',
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Construction Location',
              onEdit: () => widget.onEditStep(2),
              rows: [
                _SummaryRow(
                  'Location',
                  'Lot ${location.lotNumber}, ${location.street}, '
                      '${location.barangay}, ${location.city}',
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Scope of Work',
              onEdit: () => widget.onEditStep(3),
              rows: [
                _SummaryRow(
                  'Selected Scope',
                  scopeSummary.isEmpty ? 'Not set' : scopeSummary,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Design Professional',
              onEdit: () => widget.onEditStep(4),
              rows: [
                _SummaryRow(
                  'Full Name',
                  professionals.designProfessional.fullName,
                ),
                _SummaryRow(
                  'Profession',
                  professionals.designProfessional.profession?.label ??
                      'Not set',
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Full-Time Inspector / Supervisor',
              onEdit: () => widget.onEditStep(5),
              rows: [
                _SummaryRow('Full Name', professionals.supervisor.fullName),
                _SummaryRow(
                  'Profession',
                  professionals.supervisor.profession?.label ?? 'Not set',
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Applicant Consent',
              onEdit: () => widget.onEditStep(6),
              rows: [
                _SummaryRow('Printed Name', consent.applicant.printedName),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Lot Owner Consent',
              onEdit: () => widget.onEditStep(6),
              rows: [
                _SummaryRow(
                  'Applicant is Lot Owner',
                  consent.isApplicantAlsoLotOwner == null
                      ? 'Not set'
                      : (consent.isApplicantAlsoLotOwner! ? 'Yes' : 'No'),
                ),
                if (needsSeparateLotOwner)
                  _SummaryRow('Lot Owner Name', consent.lotOwner.printedName),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Fence Specifications',
              onEdit: () => widget.onEditStep(7),
              rows: [
                _SummaryRow(
                  'Fence Length',
                  specs.fenceLengthMeters.trim().isEmpty
                      ? 'Not set'
                      : '${specs.fenceLengthMeters} m',
                ),
                _SummaryRow(
                  'Fence Height',
                  specs.fenceHeightMeters.trim().isEmpty
                      ? 'Not set'
                      : '${specs.fenceHeightMeters} m',
                ),
                _SummaryRow(
                  'Fence Type',
                  fenceTypeSummary.isEmpty ? 'Not set' : fenceTypeSummary,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Uploaded Documents',
              onEdit: () => widget.onEditStep(4),
              rows: [
                _SummaryRow(
                  'Signed Documents',
                  '$documentsUploaded of $totalApplicableDocs uploaded',
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
                        'I certify that the information provided in this '
                        'application is true and accurate.',
                    onChanged: (v) => _toggle(
                      (val) => _review.certifiesInformationIsAccurate = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review
                        .understandsMustFollowApprovedPlansAndRegulations,
                    label:
                        'I understand that fence construction must follow '
                        'the approved plans and applicable regulations.',
                    onChanged: (v) => _toggle(
                      (val) => _review
                          .understandsMustFollowApprovedPlansAndRegulations =
                              val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review.understandsDependsOnRelatedBuildingPermit,
                    label:
                        'I understand that this Fencing Permit is null and '
                        'void unless accompanied by a valid related '
                        'Building Permit, when applicable.',
                    onChanged: (v) => _toggle(
                      (val) => _review
                          .understandsDependsOnRelatedBuildingPermit = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review
                        .understandsProfessionalDocumentsMustBeAuthentic,
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
