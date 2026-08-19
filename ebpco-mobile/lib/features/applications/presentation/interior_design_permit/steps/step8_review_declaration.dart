import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/interior_design_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';

/// Step 8 — Review & Declaration: a read-only summary of every prior step
/// (with an Edit shortcut back into each), plus the four certifications
/// required before the Interior Design Permit application can be
/// submitted.
class Step8ReviewDeclaration extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final InteriorPermitDraft draft;
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
  InteriorPermitDraft get _draft => widget.draft;
  InteriorReviewDeclaration get _review => widget.draft.reviewDeclaration;

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
    final nature = _draft.workNature;
    final professionals = _draft.professionals;
    final consent = _draft.ownershipConsent;

    final fullName = [
      applicant.firstName,
      applicant.middleInitial,
      applicant.lastName,
    ].where((s) => s.trim().isNotEmpty).join(' ');

    final scopeSummary = scope.selectedScopes.map((s) => s.label).join(', ');
    final natureSummary = nature.selectedNatures
        .map((n) => n.label)
        .join(', ');

    final professionalDocsUploaded = [
      professionals.designSignedDocumentUpload,
      professionals.supervisorSignedDocumentUpload,
    ].where((d) => d != null).length;

    final requiredDocuments = _draft.requiredDocuments;
    final requiredDocsUploaded =
        [
          requiredDocuments.interiorPlanAndLayoutUpload,
          requiredDocuments.wallPartitionsUpload,
          requiredDocuments.furnitureLayoutUpload,
          requiredDocuments.equipmentAndApplianceLayoutUpload,
          requiredDocuments.interiorWallElevationsUpload,
          requiredDocuments.crossWindowSectionsUpload,
          requiredDocuments.interiorPerspectiveFromMainEntrancesUpload,
          requiredDocuments.finishesUpload,
          requiredDocuments.switchesUpload,
          requiredDocuments.doorsUpload,
          requiredDocuments.convenienceOutletsUpload,
          requiredDocuments.decorationsUpload,
          requiredDocuments.reflectedCeilingPlanUpload,
          requiredDocuments.lightingFixtureSpecificationsUpload,
          requiredDocuments.airConditioningExhaustAndReturnGrillesUpload,
          requiredDocuments.fireResistivityRatingsUpload,
          requiredDocuments.toxicityRatingsUpload,
          requiredDocuments.listOfMaterialsUpload,
          requiredDocuments.detailedCostEstimatesUpload,
          requiredDocuments.relatedBuildingPermitUpload,
        ].where((d) => d != null).length;

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
              title: 'Nature of Interior Works',
              onEdit: () => widget.onEditStep(3),
              rows: [
                _SummaryRow(
                  'Selected Work Types',
                  natureSummary.isEmpty ? 'Not set' : natureSummary,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Licensed Design Professional',
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
                _SummaryRow(
                  'PRC Number',
                  professionals.designProfessional.prcNumber,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Full-Time Inspector / Supervisor',
              onEdit: () => widget.onEditStep(4),
              rows: [
                _SummaryRow('Full Name', professionals.supervisor.fullName),
                _SummaryRow(
                  'Profession',
                  professionals.supervisor.profession?.label ?? 'Not set',
                ),
                _SummaryRow(
                  'PRC Number',
                  professionals.supervisor.prcNumber,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Building Owner',
              onEdit: () => widget.onEditStep(5),
              rows: [
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
                  'Professional Documents',
                  '$professionalDocsUploaded of 2 uploaded',
                ),
                _SummaryRow(
                  'Required Documents',
                  '$requiredDocsUploaded of 20 uploaded',
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
                        'I understand that interior works must follow the '
                        'approved plans and applicable regulations.',
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
                        'I understand that this Interior Design Permit is '
                        'null and void unless accompanied by a valid '
                        'related Building Permit.',
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
