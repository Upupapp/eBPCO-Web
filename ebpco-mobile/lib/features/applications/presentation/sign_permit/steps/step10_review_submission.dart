import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/sign_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';

/// Step 10 — Review & Submission: a read-only summary of every prior step
/// (with an Edit shortcut back into each), plus the certifications
/// required before the sign application can be submitted. Unlike most
/// other permits' wizard, this final step both reviews the application
/// AND triggers submission — there is no separate Evaluation & Permit
/// Status step, as in the Fencing Permit's equivalent step.
class Step10ReviewSubmission extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final SignPermitDraft draft;
  final VoidCallback onChanged;

  /// Jumps the wizard back to the given step index so the applicant can
  /// correct something before submitting.
  final ValueChanged<int> onEditStep;

  const Step10ReviewSubmission({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
    required this.onEditStep,
  });

  @override
  State<Step10ReviewSubmission> createState() =>
      _Step10ReviewSubmissionState();
}

class _Step10ReviewSubmissionState extends State<Step10ReviewSubmission> {
  SignPermitDraft get _draft => widget.draft;
  SignReviewDeclaration get _review => widget.draft.reviewDeclaration;

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
    final sign = _draft.signInformation;
    final documents = _draft.requiredDocuments;
    final professionals = _draft.professionals;
    final consent = _draft.consent;

    final fullName = [
      applicant.firstName,
      applicant.middleInitial,
      applicant.lastName,
    ].where((s) => s.trim().isNotEmpty).join(' ');

    final scopeSummary = scope.selectedScopes.map((s) => s.label).join(', ');
    final area = sign.displayAreaSquareMeters;

    final needsSeparateOwner = consent.needsSeparateBuildingOwner;

    final requiredDocsTotal = documents.needsContractOfLease ? 10 : 9;
    final requiredDocsUploaded =
        [
          documents.tctOrOctCopyUpload,
          documents.taxDeclarationUpload,
          documents.realtyTaxReceiptUpload,
          if (documents.needsContractOfLease) documents.contractOfLeaseUpload,
          documents.lotPlanUpload,
          documents.siteDevelopmentPlanUpload,
          documents.signStructurePlansUpload,
          documents.structuralDesignAndComputationsUpload,
          documents.specificationsUpload,
          documents.costEstimatesUpload,
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
                _SummaryRow(
                  'Related Building Permit Status',
                  relatedPermit.status.label,
                ),
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
                  'Telephone / Mobile Number',
                  applicant.contactNumber,
                ),
                _SummaryRow(
                  'Use or Character of Occupancy',
                  applicant.occupancyGroup?.label ?? 'Not set',
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
              title: 'Sign Details',
              onEdit: () => widget.onEditStep(4),
              rows: [
                _SummaryRow(
                  'Type of Display',
                  sign.displayFaceType?.label ?? 'Not set',
                ),
                _SummaryRow(
                  'Display Type',
                  sign.displayType?.label ?? 'Not set',
                ),
                _SummaryRow(
                  'Type of Installation',
                  sign.installationType?.label ?? 'Not set',
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Display Dimensions',
              onEdit: () => widget.onEditStep(4),
              rows: [
                _SummaryRow(
                  'Length',
                  sign.lengthMeters.trim().isEmpty
                      ? 'Not set'
                      : '${sign.lengthMeters} m',
                ),
                _SummaryRow(
                  'Width',
                  sign.widthMeters.trim().isEmpty
                      ? 'Not set'
                      : '${sign.widthMeters} m',
                ),
                _SummaryRow(
                  'Total Display Area',
                  area != null ? '${area.toStringAsFixed(2)} sq m' : 'Not set',
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Supporting Documents',
              onEdit: () => widget.onEditStep(5),
              rows: [
                _SummaryRow(
                  'Uploaded Documents',
                  '$requiredDocsUploaded of $requiredDocsTotal uploaded',
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Design Professional',
              onEdit: () => widget.onEditStep(6),
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
              onEdit: () => widget.onEditStep(7),
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
              title: 'Owner Consent',
              onEdit: () => widget.onEditStep(8),
              rows: [
                _SummaryRow('Applicant Printed Name', consent.applicant.printedName),
                _SummaryRow(
                  'Applicant is Building Owner',
                  consent.isApplicantAlsoBuildingOwner == null
                      ? 'Not set'
                      : (consent.isApplicantAlsoBuildingOwner! ? 'Yes' : 'No'),
                ),
                if (needsSeparateOwner)
                  _SummaryRow(
                    'Building Owner Name',
                    consent.buildingOwner.printedName,
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
                        'application is complete and accurate.',
                    onChanged: (v) => _toggle(
                      (val) => _review.certifiesInformationIsAccurate = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review
                        .understandsMustFollowApprovedPlansAndRegulations,
                    label:
                        'I understand that the sign installation must '
                        'follow the approved plans and applicable '
                        'regulations.',
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
                        'I understand that this Sign Permit is null and '
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
