import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/plumbing_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';

/// Step 8 — Review & Declaration: a read-only summary of every prior step
/// (with an Edit shortcut back into each), plus the eight certifications
/// required before the plumbing application can be submitted.
class Step8ReviewDeclaration extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final PlumbingPermitDraft draft;
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
  PlumbingPermitDraft get _draft => widget.draft;
  PlumbingReviewDeclaration get _review => widget.draft.reviewDeclaration;

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
    final details = _draft.installationDetails;
    final professionals = _draft.professionals;
    final consent = _draft.ownershipConsent;
    final documents = _draft.requiredDocuments;

    final fullName = [
      applicant.firstName,
      applicant.middleName,
      applicant.lastName,
    ].where((s) => s.trim().isNotEmpty).join(' ');

    final scopeSummary = scope.selectedScopes.map((s) => s.label).join(', ');
    final fixtureSummary = details.fixtureInventory.fixtures
        .where((f) => f.hasQuantity)
        .map((f) => '${f.type.label} (${f.totalQty})')
        .join(', ');
    final systemsSummary = details.selectedSystems
        .map((s) => s.label)
        .join(', ');

    final designDocsUploaded = [
      professionals.designPrcIdUpload,
      professionals.designPtrDocumentUpload,
      professionals.signedSealedPlansUpload,
      professionals.signedSealedSpecificationsUpload,
      professionals.signedPlumbingCalculationsUpload,
    ].where((d) => d != null).length;

    final coreDocsUploaded = [
      documents.plumbingPlansUpload,
      documents.plumbingSpecificationsUpload,
      documents.waterDistributionLayoutUpload,
      documents.sewageLayoutCoreUpload,
      documents.plumbingRiserDiagramUpload,
      documents.isometricDiagramUpload,
      documents.fixtureScheduleUpload,
      documents.generalNotesUpload,
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
              title: 'Applicant Address',
              onEdit: () => widget.onEditStep(1),
              rows: [
                _SummaryRow(
                  'Address',
                  '${address.street}, ${address.barangay}, ${address.city}, ${address.province}',
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Project Location',
              onEdit: () => widget.onEditStep(1),
              rows: [
                _SummaryRow(
                  'Location',
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
              title: 'Fixture Inventory',
              onEdit: () => widget.onEditStep(3),
              rows: [
                _SummaryRow(
                  'Selected Fixtures',
                  fixtureSummary.isEmpty ? 'Not set' : fixtureSummary,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Water Distribution System',
              onEdit: () => widget.onEditStep(3),
              rows: [
                _SummaryRow(
                  'Selected Systems',
                  systemsSummary.isEmpty ? 'Not set' : systemsSummary,
                ),
                if (details.hasWaterDistribution)
                  _SummaryRow(
                    'Water Source',
                    details.waterDistribution.waterSource?.label ?? 'Not set',
                  ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Sewage System',
              onEdit: () => widget.onEditStep(3),
              rows: [
                _SummaryRow(
                  'Disposal Method',
                  details.hasSewage
                      ? (details.sewageSystem.disposalMethod?.label ??
                          'Not set')
                      : 'Not applicable',
                ),
              ],
            ),
            if (details.hasSepticTank) ...[
              const SizedBox(height: AppSpacing.md),
              _SummarySection(
                title: 'Septic Tank',
                onEdit: () => widget.onEditStep(3),
                rows: [
                  _SummaryRow('Tank Type', details.septicTank.tankType),
                  _SummaryRow(
                    'Tank Capacity',
                    details.septicTank.tankCapacity,
                  ),
                ],
              ),
            ],
            if (details.hasStormDrainage) ...[
              const SizedBox(height: AppSpacing.md),
              _SummarySection(
                title: 'Storm Drainage System',
                onEdit: () => widget.onEditStep(3),
                rows: [
                  _SummaryRow(
                    'Drainage Type',
                    details.stormDrainage.drainageType?.label ?? 'Not set',
                  ),
                ],
              ),
            ],
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Design Master Plumber',
              onEdit: () => widget.onEditStep(4),
              rows: [
                _SummaryRow(
                  'Full Name',
                  professionals.designMasterPlumber.fullName,
                ),
                _SummaryRow(
                  'PRC Number',
                  professionals.designMasterPlumber.prcNumber,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Supervisor / In-Charge',
              onEdit: () => widget.onEditStep(4),
              rows: [
                _SummaryRow(
                  'Same as Design Master Plumber',
                  professionals.isSupervisorSameAsDesignMasterPlumber
                      ? 'Yes'
                      : 'No',
                ),
                if (!professionals.isSupervisorSameAsDesignMasterPlumber)
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
                  'Design Master Plumber Documents',
                  '$designDocsUploaded of 5 uploaded',
                ),
                _SummaryRow(
                  'Core Plumbing Documents',
                  '$coreDocsUploaded of 9 uploaded',
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
                    value: _review.confirmsPlansPreparedByLicensedMasterPlumber,
                    label:
                        'I confirm that the plumbing plans and specifications were prepared by a licensed Master Plumber.',
                    onChanged: (v) => _toggle(
                      (val) => _review
                          .confirmsPlansPreparedByLicensedMasterPlumber = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review.understandsMustFollowApprovedPlansAndCodes,
                    label:
                        'I understand that plumbing work must follow the approved plans and applicable plumbing and building codes.',
                    onChanged: (v) => _toggle(
                      (val) => _review
                          .understandsMustFollowApprovedPlansAndCodes = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value:
                        _review.understandsRequiresLicensedMasterPlumberSupervisor,
                    label:
                        'I understand that a licensed Master Plumber must supervise or take charge of the work.',
                    onChanged: (v) => _toggle(
                      (val) => _review
                              .understandsRequiresLicensedMasterPlumberSupervisor =
                          val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review.understandsNoticeOfConstructionMayBeRequired,
                    label:
                        'I understand that a Notice of Construction may be required before plumbing work begins.',
                    onChanged: (v) => _toggle(
                      (val) => _review
                          .understandsNoticeOfConstructionMayBeRequired = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review.understandsCompletionDocumentsMayBeRequired,
                    label:
                        'I understand that logbook entries, as-built plans, and a Certificate of Completion may be required after completion.',
                    onChanged: (v) => _toggle(
                      (val) => _review
                          .understandsCompletionDocumentsMayBeRequired = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review.understandsRequiresValidBuildingPermit,
                    label:
                        'I understand that this Plumbing Permit must be accompanied by a valid Building Permit.',
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
