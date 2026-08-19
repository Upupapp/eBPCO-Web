import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/certificate_of_occupancy_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';
import '../../../../../shared/widgets/uploads/document_upload_tile.dart';
import '../../building_permit/widgets/date_picker_field.dart';
import '../../building_permit/widgets/mock_upload.dart';

final DateFormat _dateFormat = DateFormat('MMM d, yyyy');
String _formatDate(DateTime? date) => date != null ? _dateFormat.format(date) : 'Not set';

/// Step 5 — Applicant Certification, Review & Submission. The applicant
/// certification fields and the full read-only application review live
/// on the same page, since the paper form's remaining sections are each
/// short enough to fit one focused final step without crowding.
class Step5CertificationReviewSubmission extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final CertificateOfOccupancyDraft draft;
  final VoidCallback onChanged;

  /// Jumps the wizard back to the given step index so the applicant can
  /// correct something before submitting.
  final ValueChanged<int> onEditStep;

  const Step5CertificationReviewSubmission({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
    required this.onEditStep,
  });

  @override
  State<Step5CertificationReviewSubmission> createState() =>
      _Step5CertificationReviewSubmissionState();
}

class _Step5CertificationReviewSubmissionState
    extends State<Step5CertificationReviewSubmission> {
  late final TextEditingController _submittedByName;
  late final TextEditingController _ctcNumber;
  late final TextEditingController _ctcPlaceIssued;

  OccupancyCertification get _certification => widget.draft.certification;
  OccupancyDeclaration get _declaration => widget.draft.declaration;

  @override
  void initState() {
    super.initState();
    _submittedByName = TextEditingController(
      text: _certification.submittedByName,
    );
    _ctcNumber = TextEditingController(text: _certification.ctcNumber);
    _ctcPlaceIssued = TextEditingController(
      text: _certification.ctcPlaceIssued,
    );
  }

  @override
  void dispose() {
    _submittedByName.dispose();
    _ctcNumber.dispose();
    _ctcPlaceIssued.dispose();
    super.dispose();
  }

  void _toggleDeclaration(void Function(bool) setter, bool value) {
    setState(() => setter(value));
    widget.onChanged();
  }

  @override
  Widget build(BuildContext context) {
    final draft = widget.draft;
    final permit = draft.permitInfo;
    final owner = draft.owner;
    final location = draft.projectDetails;
    final documents = draft.requiredDocuments;

    final fullName = [
      owner.firstName,
      owner.middleInitial,
      owner.lastName,
    ].where((s) => s.trim().isNotEmpty).join(' ');

    final requiredDocsUploaded =
        [
          documents.asBuiltPlansUpload,
          documents.constructionLogbookUpload,
          documents.civilWorksCertificateUpload,
          documents.electricalCertificateUpload,
        ].where((d) => d != null).length;
    final optionalDocsUploaded =
        [
          documents.otherDisciplineCertificatesUpload,
          documents.notarizedDocumentsUpload,
          documents.otherSupportingRequirementsUpload,
        ].where((d) => d != null).length;

    return Form(
      key: widget.formKey,
      child: FormScrollScaffold(
        centerVertically: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Applicant Certification', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _submittedByName,
                    label: 'Submitted-By Name *',
                    textCapitalization: TextCapitalization.words,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Submitted-by name',
                    ),
                    onChanged: (v) {
                      _certification.submittedByName = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _ctcNumber,
                    label: 'Community Tax Certificate Number *',
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'CTC number'),
                    onChanged: (v) {
                      _certification.ctcNumber = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'CTC Date Issued *',
                    value: _certification.ctcDateIssued,
                    lastDate: DateTime.now(),
                    validator: (_) => _certification.ctcDateIssued == null
                        ? 'Please select the date issued.'
                        : null,
                    onChanged: (date) {
                      setState(() => _certification.ctcDateIssued = date);
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _ctcPlaceIssued,
                    label: 'CTC Place Issued *',
                    textCapitalization: TextCapitalization.words,
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'CTC place issued'),
                    onChanged: (v) {
                      _certification.ctcPlaceIssued = v;
                      widget.onChanged();
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            DocumentUploadTile(
              label: 'Signature / Signed Document',
              document: _certification.signedDocumentUpload,
              onUpload: () {
                setState(() {
                  _certification.signedDocumentUpload = createMockDocument(
                    'Applicant Signed Document',
                  );
                });
                widget.onChanged();
              },
              allowReplace: true,
              onRemove: () {
                setState(() => _certification.signedDocumentUpload = null);
                widget.onChanged();
              },
            ),

            const SizedBox(height: AppSpacing.xxl),
            Text('Application Review', style: AppTypography.pageTitle),
            const SizedBox(height: AppSpacing.md),

            _SummarySection(
              title: 'Building Permit',
              onEdit: () => widget.onEditStep(0),
              rows: [
                _SummaryRow(
                  'Building Permit Number',
                  permit.buildingPermitNumber,
                ),
                _SummaryRow(
                  'Date Issued',
                  _formatDate(permit.buildingPermitDateIssued),
                ),
                _SummaryRow(
                  'Certificate Type',
                  permit.certificateType?.label ?? 'Not set',
                ),
                if (permit.certificateType == CertificateType.partial)
                  _SummaryRow('Portion Covered', permit.partialDescription),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Owner / Applicant & Project',
              onEdit: () => widget.onEditStep(1),
              rows: [
                _SummaryRow('Name', fullName.isEmpty ? 'Not set' : fullName),
                _SummaryRow(
                  'Telephone / Mobile Number',
                  owner.contactNumber,
                ),
                _SummaryRow('Project Name', owner.projectName),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Project Location & Building Details',
              onEdit: () => widget.onEditStep(2),
              rows: [
                _SummaryRow(
                  'Location',
                  'Lot ${location.lotNumber}, ${location.street}, '
                      '${location.barangay}, ${location.city}',
                ),
                _SummaryRow(
                  'Occupancy',
                  location.occupancyGroup?.label ?? 'Not set',
                ),
                _SummaryRow(
                  'Storeys / Units / Floor Area',
                  '${location.numberOfStoreys.isEmpty ? '—' : location.numberOfStoreys} storeys, '
                      '${location.numberOfUnits.isEmpty ? '—' : location.numberOfUnits} units, '
                      '${location.totalFloorAreaSquareMeters.isEmpty ? '—' : location.totalFloorAreaSquareMeters} sq m',
                ),
                _SummaryRow(
                  'Date of Completion',
                  _formatDate(location.dateOfCompletion),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Uploaded Requirements',
              onEdit: () => widget.onEditStep(3),
              rows: [
                _SummaryRow(
                  'Required Documents',
                  '$requiredDocsUploaded of 4 uploaded',
                ),
                _SummaryRow(
                  'Optional Documents',
                  '$optionalDocsUploaded of 3 uploaded',
                ),
                _SummaryRow(
                  'Additional Documents',
                  '${documents.otherDocuments.length} added',
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
                    value: _declaration.certifiesInformationIsAccurate,
                    label:
                        'I certify that the information provided in this '
                        'application is complete and accurate.',
                    onChanged: (v) => _toggleDeclaration(
                      (val) => _declaration.certifiesInformationIsAccurate =
                          val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _declaration
                        .certifiesConstructionMatchesApprovedPlans,
                    label:
                        'I certify that construction has been completed '
                        'according to the approved plans.',
                    onChanged: (v) => _toggleDeclaration(
                      (val) => _declaration
                          .certifiesConstructionMatchesApprovedPlans = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _declaration.certifiesDocumentsAreAuthentic,
                    label:
                        'I certify that the uploaded documents are '
                        'authentic.',
                    onChanged: (v) => _toggleDeclaration(
                      (val) =>
                          _declaration.certifiesDocumentsAreAuthentic = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _declaration
                        .understandsSubjectToInspectionAndEvaluation,
                    label:
                        'I understand that this application is subject to '
                        'inspection and official evaluation.',
                    onChanged: (v) => _toggleDeclaration(
                      (val) => _declaration
                          .understandsSubjectToInspectionAndEvaluation = val,
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
