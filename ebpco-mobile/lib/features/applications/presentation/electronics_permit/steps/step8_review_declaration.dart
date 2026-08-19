import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/electronics_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';

/// Step 8 — Review & Declaration: a read-only summary of every prior step
/// (with an Edit shortcut back into each), plus the certifications
/// required before the electronics application can be submitted.
class Step8ReviewDeclaration extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final ElectronicsPermitDraft draft;
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
  ElectronicsPermitDraft get _draft => widget.draft;
  ElectronicsReviewDeclaration get _review => widget.draft.reviewDeclaration;

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
    final nature = _draft.installationNature;
    final professionals = _draft.professionals;
    final consent = _draft.ownershipConsent;
    final documents = _draft.requiredDocuments;

    final fullName = [
      applicant.firstName,
      applicant.middleInitial,
      applicant.lastName,
    ].where((s) => s.trim().isNotEmpty).join(' ');

    final scopeSummary = scope.selectedScopes.map((s) => s.label).join(', ');
    final systemsSummary = nature.selectedSystems
        .map((s) => s.label)
        .join(', ');

    final designDocsUploaded = [
      professionals.designPrcIdUpload,
      professionals.designPtrDocumentUpload,
      professionals.signedSealedPlansUpload,
      professionals.signedSealedSpecificationsUpload,
      professionals.signedDesignCalculationsUpload,
    ].where((d) => d != null).length;

    final coreDocsUploaded = [
      documents.billOfMaterialsUpload,
      documents.costEstimatesUpload,
      documents.relatedBuildingPermitUpload,
    ].where((d) => d != null).length;

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
              title: 'Applicant Address & Location of Construction',
              onEdit: () => widget.onEditStep(1),
              rows: [
                _SummaryRow(
                  'Applicant Address',
                  '${address.street}, ${address.barangay}, ${address.city}, ${address.province}',
                ),
                _SummaryRow(
                  'Location of Construction',
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
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Selected Electronics Systems',
              onEdit: () => widget.onEditStep(3),
              rows: [
                _SummaryRow(
                  'Nature of Installation',
                  systemsSummary.isEmpty ? 'Not set' : systemsSummary,
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
                  'PRC Number',
                  professionals.designProfessional.prcNumber,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Supervisor / Person in Charge',
              onEdit: () => widget.onEditStep(4),
              rows: [
                _SummaryRow(
                  'Same as Design Professional',
                  professionals.isSupervisorSameAsDesignProfessional
                      ? 'Yes'
                      : 'No',
                ),
                if (!professionals.isSupervisorSameAsDesignProfessional)
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
                  _SummaryRow(
                    'Building Owner Name',
                    consent.buildingOwner.fullName,
                  ),
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
                  'Design Professional Documents',
                  '$designDocsUploaded of 5 uploaded',
                ),
                _SummaryRow(
                  'Cost & Supporting Documents',
                  '$coreDocsUploaded of 3 uploaded',
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
                    value: _review.confirmsPlansPreparedByLicensedProfessional,
                    label:
                        'I confirm that the electronics plans and specifications were prepared by a licensed Professional Electronics Engineer.',
                    onChanged: (v) => _toggle(
                      (val) => _review
                          .confirmsPlansPreparedByLicensedProfessional = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review.understandsMustFollowApprovedPlansAndCodes,
                    label:
                        'I understand that electronics work must comply with the approved plans and applicable electronics and building regulations.',
                    onChanged: (v) => _toggle(
                      (val) => _review
                          .understandsMustFollowApprovedPlansAndCodes = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review.understandsRequiresLicensedSupervisor,
                    label:
                        'I understand that a licensed Professional Electronics Engineer must supervise or take charge of the work.',
                    onChanged: (v) => _toggle(
                      (val) =>
                          _review.understandsRequiresLicensedSupervisor = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review.understandsNoticeOfConstructionMayBeRequired,
                    label:
                        'I understand that a Notice of Construction may be required before electronics work begins.',
                    onChanged: (v) => _toggle(
                      (val) => _review
                          .understandsNoticeOfConstructionMayBeRequired = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review.understandsCompletionDocumentsMayBeRequired,
                    label:
                        'I understand that logbook entries, as-built plans, and completion documents may be required after completion.',
                    onChanged: (v) => _toggle(
                      (val) => _review
                          .understandsCompletionDocumentsMayBeRequired = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review.understandsRequiresValidBuildingPermit,
                    label:
                        'I understand that this Electronics Permit is null and void unless accompanied by a valid related Building Permit.',
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
