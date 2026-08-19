import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/addition_extension_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';

final DateFormat _dateFormat = DateFormat('MMM d, yyyy');

String _formatDate(DateTime? date) =>
    date != null ? _dateFormat.format(date) : 'Not set';

/// Step 8 — Review & Declaration: a read-only summary of every prior step
/// (with an Edit shortcut back into each), plus the six certifications
/// required before the addition/extension application can be submitted.
class Step8ReviewDeclaration extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final AdditionExtensionPermitDraft draft;
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
  AdditionExtensionPermitDraft get _draft => widget.draft;
  AdditionExtensionReviewDeclaration get _review =>
      widget.draft.reviewDeclaration;

  void _toggle(void Function(bool) setter, bool value) {
    setState(() => setter(value));
    widget.onChanged();
  }

  @override
  Widget build(BuildContext context) {
    final applicant = _draft.applicant;
    final address = _draft.applicantAddress;
    final location = _draft.projectLocation;
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

    final resultingTotal = building.resultingTotalFloorArea;

    final propertyDocsUploaded = [
          documents.landTitleUpload,
          documents.taxDeclarationUpload,
          documents.realPropertyTaxReceiptUpload,
          documents.proofOfOwnershipOrAuthorityUpload,
        ]
        .where((d) => d != null)
        .length;

    final existingDocsSatisfied = [
      documents.existingBuildingPermit,
      documents.existingCertificateOfOccupancy,
      documents.existingApprovedBuildingPlans,
      documents.recentPhotographs,
    ].where((d) => d.isSatisfied).length;

    final professionalDocsUploaded = [
          professional.prcIdUpload,
          professional.ptrDocumentUpload,
          professional.signedSealedFormUpload,
          professional.signedSealedPlansUpload,
        ]
        .where((d) => d != null)
        .length;

    final isRepresentative = consent.isRegisteredOwner == false;
    final consentDocsUploaded = isRepresentative
        ? [
                consent.authorizationLetterUpload,
                consent.ownerValidIdUpload,
                consent.representativeValidIdUpload,
                consent.proofOfOwnershipUpload,
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
                _SummaryRow(
                  'Application Type',
                  applicant.applicationType.label,
                ),
                _SummaryRow(
                  'Telephone / Mobile Number',
                  applicant.contactNumber,
                ),
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
              title: 'Addition / Extension Details',
              onEdit: () => widget.onEditStep(2),
              rows: [
                _SummaryRow('Project Title', project.projectTitle),
                _SummaryRow(
                  'Addition Type',
                  project.additionType?.label ?? 'Not set',
                ),
                _SummaryRow(
                  'Areas Affected',
                  project.affectedAreas.isEmpty
                      ? 'Not set'
                      : project.affectedAreas.map((a) => a.label).join(', '),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Existing Building Details',
              onEdit: () => widget.onEditStep(3),
              rows: [
                _SummaryRow(
                  'Building Use',
                  building.occupancyGroup?.label ?? 'Not set',
                ),
                _SummaryRow(
                  'Existing Occupancy Classification',
                  building.existingOccupancyClassification,
                ),
                _SummaryRow(
                  'Existing Number of Units',
                  building.existingNumberOfUnits,
                ),
                _SummaryRow(
                  'Existing Number of Storeys',
                  building.existingNumberOfStoreys,
                ),
                _SummaryRow(
                  'Existing Floor Area',
                  '${building.existingFloorArea} sq m',
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Proposed Addition Measurements',
              onEdit: () => widget.onEditStep(3),
              rows: [
                _SummaryRow(
                  'Proposed Added Number of Units',
                  building.proposedAddedNumberOfUnits,
                ),
                _SummaryRow(
                  'Proposed Additional Storeys',
                  building.proposedAdditionalStoreys,
                ),
                _SummaryRow(
                  'Proposed Added Floor Area',
                  '${building.proposedAddedFloorArea} sq m',
                ),
                _SummaryRow(
                  'Resulting Total Floor Area',
                  resultingTotal != null
                      ? '${resultingTotal.toStringAsFixed(2)} sq m'
                      : 'Not set',
                ),
                _SummaryRow('Lot Area', '${building.lotArea} sq m'),
                _SummaryRow(
                  'Estimated Cost',
                  '₱${building.estimatedCost}',
                ),
                _SummaryRow(
                  'Proposed Start Date',
                  _formatDate(building.proposedStartDate),
                ),
                _SummaryRow(
                  'Expected Completion Date',
                  _formatDate(building.expectedCompletionDate),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Professional in Charge',
              onEdit: () => widget.onEditStep(4),
              rows: [
                _SummaryRow('Full Name', professional.fullName),
                _SummaryRow(
                  'Profession',
                  professional.profession?.label ?? 'Not set',
                ),
                _SummaryRow(
                  'Professional Address',
                  professional.professionalAddress,
                ),
                _SummaryRow('PRC Number', professional.prcNumber),
                _SummaryRow(
                  'PRC Validity',
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
              title: 'Ownership and Authorization',
              onEdit: () => widget.onEditStep(5),
              rows: [
                _SummaryRow(
                  'Registered Owner',
                  consent.isRegisteredOwner == null
                      ? 'Not set'
                      : (consent.isRegisteredOwner!
                            ? 'Yes — applicant is the registered owner'
                            : 'No — filed by an authorized representative'),
                ),
                if (isRepresentative) ...[
                  _SummaryRow(
                    'Registered Owner Name',
                    consent.registeredOwnerFullName,
                  ),
                  _SummaryRow(
                    'Authorized Representative',
                    consent.representativeFullName,
                  ),
                ],
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Uploaded Documents',
              onEdit: () => widget.onEditStep(6),
              rows: [
                _SummaryRow(
                  'Professional Documents',
                  '$professionalDocsUploaded of 4 uploaded',
                ),
                _SummaryRow(
                  'Property Documents',
                  '$propertyDocsUploaded of 4 uploaded',
                ),
                _SummaryRow(
                  'Existing Building Documents',
                  '$existingDocsSatisfied of 4 accounted for',
                ),
                if (isRepresentative)
                  _SummaryRow(
                    'Authorization Documents',
                    '$consentDocsUploaded of 4 uploaded',
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
                    value: _review.confirmsAdditionOrExtensionOfExistingBuilding,
                    label:
                        'I confirm that this application is for an addition to or extension of an existing building.',
                    onChanged: (v) => _toggle(
                      (val) => _review
                          .confirmsAdditionOrExtensionOfExistingBuilding = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review.understandsAncillaryPermitsMayBeRequired,
                    label:
                        'I understand that the proposed work may require applicable ancillary permits.',
                    onChanged: (v) => _toggle(
                      (val) =>
                          _review.understandsAncillaryPermitsMayBeRequired = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review.understandsPlansMustBeSignedAndSealed,
                    label:
                        'I understand that plans and specifications must be signed and sealed by the appropriate licensed professionals.',
                    onChanged: (v) => _toggle(
                      (val) =>
                          _review.understandsPlansMustBeSignedAndSealed = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review.confirmsAdditionAccuratelyRepresented,
                    label:
                        'I confirm that the proposed addition is accurately represented in the submitted plans.',
                    onChanged: (v) => _toggle(
                      (val) =>
                          _review.confirmsAdditionAccuratelyRepresented = val,
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
