import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/demolition_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';

final DateFormat _dateFormat = DateFormat('MMM d, yyyy');

String _formatDate(DateTime? date) =>
    date != null ? _dateFormat.format(date) : 'Not set';

/// Step 8 — Review & Declaration: a read-only summary of every prior step
/// (with an Edit shortcut back into each), plus the eight certifications
/// required before the demolition application can be submitted. The
/// advance-notice and permit-issuance declarations are phrased as
/// forward-looking commitments, never as claims that those steps have
/// already happened.
class Step8ReviewDeclaration extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final DemolitionPermitDraft draft;
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
  DemolitionPermitDraft get _draft => widget.draft;
  DemolitionReviewDeclaration get _review => widget.draft.reviewDeclaration;

  void _toggle(void Function(bool) setter, bool value) {
    setState(() => setter(value));
    widget.onChanged();
  }

  @override
  Widget build(BuildContext context) {
    final applicant = _draft.applicant;
    final address = _draft.applicantAddress;
    final location = _draft.demolitionLocation;
    final structure = _draft.structureDetails;
    final safety = _draft.safetyAndSitePrep;
    final professional = _draft.professional;
    final consent = _draft.consentAuthorization;
    final documents = _draft.requiredDocuments;

    final fullName = [
      applicant.firstName,
      applicant.middleName,
      applicant.lastName,
    ].where((s) => s.trim().isNotEmpty).join(' ');

    final utilitiesTracked = safety.utilities.values
        .where((info) => info.isApplicable)
        .length;

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
      documents.recentPhotographs,
    ].where((d) => d.isSatisfied).length;

    final professionalDocsUploaded = [
          professional.prcIdUpload,
          professional.ptrDocumentUpload,
          professional.signedSealedFormUpload,
          professional.demolitionPlanUpload,
          professional.demolitionMethodologyUpload,
          professional.safetyProgramUpload,
        ]
        .where((d) => d != null)
        .length;

    final isRepresentative = consent.isRegisteredOwner == false;
    final consentDocsUploaded = isRepresentative
        ? [
                consent.lotOwnerConsentUpload,
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
                  'Telephone / Mobile Number',
                  applicant.contactNumber,
                ),
                _SummaryRow(
                  'Use or Character of Occupancy',
                  applicant.occupancyGroup?.label ?? 'Not set',
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
              title: 'Address & Demolition Location',
              onEdit: () => widget.onEditStep(1),
              rows: [
                _SummaryRow(
                  'Applicant Address',
                  '${address.street}, ${address.barangay}, ${address.city}, ${address.province}',
                ),
                _SummaryRow(
                  'Demolition Location',
                  'Lot ${location.lotNumber}, ${location.street}, '
                      '${location.barangay}, ${location.city}, ${location.province}',
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Structure & Demolition Details',
              onEdit: () => widget.onEditStep(2),
              rows: [
                _SummaryRow(
                  'Demolition Extent',
                  structure.demolitionExtent?.label ?? 'Not set',
                ),
                _SummaryRow('Structure Name', structure.structureName),
                _SummaryRow(
                  'Primary Construction Material',
                  structure.primaryConstructionMaterial?.label ?? 'Not set',
                ),
                _SummaryRow(
                  'Proposed Start Date',
                  _formatDate(structure.proposedStartDate),
                ),
                _SummaryRow(
                  'Expected Completion Date',
                  _formatDate(structure.expectedCompletionDate),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Safety & Site Preparation',
              onEdit: () => widget.onEditStep(3),
              rows: [
                _SummaryRow(
                  'Building Occupied',
                  safety.isBuildingOccupied == null
                      ? 'Not set'
                      : (safety.isBuildingOccupied! ? 'Yes' : 'No'),
                ),
                _SummaryRow(
                  'Utilities Tracked for Disconnection',
                  '$utilitiesTracked of ${safety.utilities.length}',
                ),
                _SummaryRow(
                  'Safety Confirmations',
                  '${safety.confirmedSafetyItems.length} of ${SafetyConfirmationItem.values.length} confirmed',
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Demolition Supervisor',
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
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Ownership & Consent',
              onEdit: () => widget.onEditStep(5),
              rows: [
                _SummaryRow(
                  'Registered Lot Owner',
                  consent.isRegisteredOwner == null
                      ? 'Not set'
                      : (consent.isRegisteredOwner!
                            ? 'Yes — applicant is the registered owner'
                            : 'No — filed by an authorized representative'),
                ),
                if (isRepresentative) ...[
                  _SummaryRow(
                    'Registered Lot Owner Name',
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
                  'Professional & Technical Documents',
                  '$professionalDocsUploaded of 6 uploaded',
                ),
                _SummaryRow(
                  'Property Documents',
                  '$propertyDocsUploaded of 4 uploaded',
                ),
                _SummaryRow(
                  'Existing Building Documents',
                  '$existingDocsSatisfied of 3 accounted for',
                ),
                if (isRepresentative)
                  _SummaryRow(
                    'Authorization Documents',
                    '$consentDocsUploaded of 5 uploaded',
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
                    value: _review.confirmsStructureWillBeVacated,
                    label:
                        'I confirm that the structure will be fully vacated before demolition begins.',
                    onChanged: (v) => _toggle(
                      (val) => _review.confirmsStructureWillBeVacated = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review.confirmsUtilitiesWillBeDisconnectedOrControlled,
                    label:
                        'I confirm that all utilities will be disconnected or safely controlled before demolition begins.',
                    onChanged: (v) => _toggle(
                      (val) => _review
                          .confirmsUtilitiesWillBeDisconnectedOrControlled = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review.understandsSupervisionRequired,
                    label:
                        'I understand that the demolition work must be supervised by the licensed professional named in this application.',
                    onChanged: (v) => _toggle(
                      (val) => _review.understandsSupervisionRequired = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review.agreesToSafetyMeasures,
                    label:
                        'I agree to implement all safety measures declared in this application.',
                    onChanged: (v) => _toggle(
                      (val) => _review.agreesToSafetyMeasures = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review.understandsAdvanceNoticeRequired,
                    label:
                        'I understand that the required advance notice to neighbors and affected parties must be given before demolition begins.',
                    onChanged: (v) => _toggle(
                      (val) => _review.understandsAdvanceNoticeRequired = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review.understandsPermitMustBeIssuedFirst,
                    label:
                        'I understand that demolition work may not begin until the Demolition Permit has been issued.',
                    onChanged: (v) => _toggle(
                      (val) => _review.understandsPermitMustBeIssuedFirst = val,
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
