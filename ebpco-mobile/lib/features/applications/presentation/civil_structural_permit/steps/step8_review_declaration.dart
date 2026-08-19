import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/civil_structural_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';

final DateFormat _dateFormat = DateFormat('MMM d, yyyy');

String _formatDate(DateTime? date) =>
    date != null ? _dateFormat.format(date) : 'Not set';

/// Step 8 — Review & Declaration: a read-only summary of every prior step
/// (with an Edit shortcut back into each), plus the eight certifications
/// required before the civil/structural application can be submitted.
class Step8ReviewDeclaration extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final CivilStructuralPermitDraft draft;
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
  CivilStructuralPermitDraft get _draft => widget.draft;
  CivilStructuralReviewDeclaration get _review => widget.draft.reviewDeclaration;

  void _toggle(void Function(bool) setter, bool value) {
    setState(() => setter(value));
    widget.onChanged();
  }

  @override
  Widget build(BuildContext context) {
    final applicant = _draft.applicant;
    final address = _draft.applicantAddress;
    final location = _draft.projectLocation;
    final relatedPermit = _draft.relatedBuildingPermit;
    final scope = _draft.scopeOfWork;
    final work = _draft.workDetails;
    final professionals = _draft.professionals;
    final consent = _draft.ownershipConsent;
    final documents = _draft.requiredDocuments;

    final fullName = [
      applicant.firstName,
      applicant.middleName,
      applicant.lastName,
    ].where((s) => s.trim().isNotEmpty).join(' ');

    final scopeSummary = scope.selectedScopes.map((s) => s.label).join(', ');
    final workSummary = work.selectedWorks.map((s) => s.label).join(', ');

    final designDocsUploaded = [
          professionals.designPrcIdUpload,
          professionals.designPtrDocumentUpload,
          professionals.signedSealedPlansUpload,
          professionals.signedSealedComputationsUpload,
          professionals.signedSealedSpecificationsUpload,
        ]
        .where((d) => d != null)
        .length;

    final baseDocsUploaded = [
          documents.structuralAnalysisUpload,
          documents.generalNotesUpload,
          documents.billOfMaterialsUpload,
          documents.costEstimateUpload,
          documents.materialSpecificationsUpload,
          documents.relatedBuildingPermitUpload,
          documents.siteSurveyUpload,
        ]
        .where((d) => d != null)
        .length;

    final isRepresentative = consent.isRepresentative;
    final needsSeparateLotOwner = consent.needsSeparateLotOwner;

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
                _SummaryRow(
                  'Use or Character of Occupancy',
                  applicant.occupancyGroup?.label ?? 'Not set',
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Applicant Address & Project Location',
              onEdit: () => widget.onEditStep(1),
              rows: [
                _SummaryRow(
                  'Applicant Address',
                  '${address.street}, ${address.barangay}, ${address.city}, ${address.province}',
                ),
                _SummaryRow(
                  'Project Location',
                  'Lot ${location.lotNumber}, ${location.street}, '
                      '${location.barangay}, ${location.city}, ${location.province}',
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Related Building Permit',
              onEdit: () => widget.onEditStep(1),
              rows: [
                _SummaryRow('Status', relatedPermit.status.label),
                _SummaryRow(
                  'Building Permit Number',
                  relatedPermit.buildingPermitNumber,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Scope of Work',
              onEdit: () => widget.onEditStep(2),
              rows: [
                _SummaryRow(
                  'Selected Scope',
                  scopeSummary.isEmpty ? 'Not set' : scopeSummary,
                ),
                _SummaryRow('Work Title', scope.workTitle),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Nature of Civil / Structural Works',
              onEdit: () => widget.onEditStep(3),
              rows: [
                _SummaryRow(
                  'Selected Works',
                  workSummary.isEmpty ? 'Not set' : workSummary,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Project Measurements',
              onEdit: () => widget.onEditStep(3),
              rows: [
                _SummaryRow('Number of Storeys', work.numberOfStoreys),
                _SummaryRow(
                  'Total Structural Floor Area',
                  '${work.totalStructuralFloorArea} sq m',
                ),
                _SummaryRow(
                  'Estimated Structural Cost',
                  '₱${work.estimatedStructuralCost}',
                ),
                _SummaryRow(
                  'Proposed Start Date',
                  _formatDate(work.proposedStartDate),
                ),
                _SummaryRow(
                  'Expected Completion Date',
                  _formatDate(work.expectedCompletionDate),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Design Engineer',
              onEdit: () => widget.onEditStep(4),
              rows: [
                _SummaryRow('Full Name', professionals.designEngineer.fullName),
                _SummaryRow(
                  'Profession',
                  professionals.designEngineer.profession?.label ?? 'Not set',
                ),
                _SummaryRow('PRC Number', professionals.designEngineer.prcNumber),
                _SummaryRow(
                  'PRC Validity',
                  _formatDate(professionals.designEngineer.prcValidityDate),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Supervisor / In-Charge',
              onEdit: () => widget.onEditStep(4),
              rows: [
                _SummaryRow(
                  'Same as Design Engineer',
                  professionals.isSupervisorSameAsDesignEngineer ? 'Yes' : 'No',
                ),
                if (!professionals.isSupervisorSameAsDesignEngineer)
                  _SummaryRow('Full Name', professionals.supervisor.fullName),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Building Owner',
              onEdit: () => widget.onEditStep(5),
              rows: [
                _SummaryRow(
                  'Applicant is Building Owner',
                  consent.isApplicantBuildingOwner == null
                      ? 'Not set'
                      : (consent.isApplicantBuildingOwner! ? 'Yes' : 'No'),
                ),
                if (isRepresentative)
                  _SummaryRow('Building Owner Name', consent.buildingOwner.fullName),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Lot Owner',
              onEdit: () => widget.onEditStep(5),
              rows: [
                _SummaryRow(
                  'Building Owner is Lot Owner',
                  consent.isBuildingOwnerAlsoLotOwner == null
                      ? 'Not set'
                      : (consent.isBuildingOwnerAlsoLotOwner! ? 'Yes' : 'No'),
                ),
                if (needsSeparateLotOwner)
                  _SummaryRow('Lot Owner Name', consent.lotOwner.fullName),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Uploaded Documents',
              onEdit: () => widget.onEditStep(6),
              rows: [
                _SummaryRow(
                  'Design Engineer Documents',
                  '$designDocsUploaded of 5 uploaded',
                ),
                _SummaryRow(
                  'Base Civil / Structural Documents',
                  '$baseDocsUploaded of 7 uploaded',
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
                    onChanged: (v) => _toggle(
                      (val) => _review.certifiesTrueAndCorrect = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review.confirmsPlansPreparedByLicensedEngineer,
                    label:
                        'I confirm that the civil and structural plans and computations were prepared by a licensed Civil or Structural Engineer.',
                    onChanged: (v) => _toggle(
                      (val) =>
                          _review.confirmsPlansPreparedByLicensedEngineer = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review.understandsSubjectToTechnicalEvaluation,
                    label:
                        'I understand that the proposed work is subject to technical evaluation.',
                    onChanged: (v) => _toggle(
                      (val) =>
                          _review.understandsSubjectToTechnicalEvaluation = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review.understandsMustFollowApprovedPlans,
                    label:
                        'I understand that construction must follow the approved civil and structural plans.',
                    onChanged: (v) => _toggle(
                      (val) => _review.understandsMustFollowApprovedPlans = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review.understandsNoticeOfConstructionMayBeRequired,
                    label:
                        'I understand that a Notice of Construction may be required before construction activity begins.',
                    onChanged: (v) => _toggle(
                      (val) => _review
                          .understandsNoticeOfConstructionMayBeRequired = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review.understandsCompletionDocumentsMayBeRequired,
                    label:
                        'I understand that completion documents, logbook entries, as-built plans, and a Certificate of Completion may be required.',
                    onChanged: (v) => _toggle(
                      (val) => _review
                          .understandsCompletionDocumentsMayBeRequired = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review.understandsRequiresValidBuildingPermit,
                    label:
                        'I understand that this Civil / Structural Permit must be accompanied by a valid Building Permit.',
                    onChanged: (v) => _toggle(
                      (val) =>
                          _review.understandsRequiresValidBuildingPermit = val,
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
