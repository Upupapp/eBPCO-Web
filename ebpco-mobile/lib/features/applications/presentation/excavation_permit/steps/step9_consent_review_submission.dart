import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/excavation_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';
import '../../../../../shared/widgets/uploads/document_upload_tile.dart';
import '../../building_permit/widgets/date_picker_field.dart';
import '../../building_permit/widgets/mock_upload.dart';

/// Step 9 — Owner Consent, Review & Submission (Boxes 4–5, plus the
/// application review). Unlike every other permit in this app, consent
/// input and the full read-only review live on the same page, exactly as
/// specified — there is no separate Evaluation & Permit Status step.
class Step9ConsentReviewSubmission extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final ExcavationPermitDraft draft;
  final VoidCallback onChanged;

  /// Jumps the wizard back to the given step index so the applicant can
  /// correct something before submitting.
  final ValueChanged<int> onEditStep;

  const Step9ConsentReviewSubmission({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
    required this.onEditStep,
  });

  @override
  State<Step9ConsentReviewSubmission> createState() =>
      _Step9ConsentReviewSubmissionState();
}

class _Step9ConsentReviewSubmissionState
    extends State<Step9ConsentReviewSubmission> {
  late final TextEditingController _ownerPrintedName;
  late final TextEditingController _ownerAddress;
  late final TextEditingController _ownerCtcNumber;
  late final TextEditingController _ownerCtcPlaceIssued;

  late final TextEditingController _lotOwnerPrintedName;
  late final TextEditingController _lotOwnerAddress;
  late final TextEditingController _lotOwnerCtcNumber;
  late final TextEditingController _lotOwnerCtcPlaceIssued;

  ExcavationOwnerConsent get _consent => widget.draft.ownerConsent;
  ExcavationReviewDeclaration get _review => widget.draft.reviewDeclaration;

  @override
  void initState() {
    super.initState();
    final owner = _consent.owner;
    _ownerPrintedName = TextEditingController(text: owner.printedName);
    _ownerAddress = TextEditingController(text: owner.address);
    _ownerCtcNumber = TextEditingController(text: owner.ctcNumber);
    _ownerCtcPlaceIssued = TextEditingController(text: owner.ctcPlaceIssued);

    final lotOwner = _consent.lotOwner;
    _lotOwnerPrintedName = TextEditingController(text: lotOwner.printedName);
    _lotOwnerAddress = TextEditingController(text: lotOwner.address);
    _lotOwnerCtcNumber = TextEditingController(text: lotOwner.ctcNumber);
    _lotOwnerCtcPlaceIssued = TextEditingController(
      text: lotOwner.ctcPlaceIssued,
    );
  }

  @override
  void dispose() {
    _ownerPrintedName.dispose();
    _ownerAddress.dispose();
    _ownerCtcNumber.dispose();
    _ownerCtcPlaceIssued.dispose();
    _lotOwnerPrintedName.dispose();
    _lotOwnerAddress.dispose();
    _lotOwnerCtcNumber.dispose();
    _lotOwnerCtcPlaceIssued.dispose();
    super.dispose();
  }

  void _toggleDeclaration(void Function(bool) setter, bool value) {
    setState(() => setter(value));
    widget.onChanged();
  }

  @override
  Widget build(BuildContext context) {
    final owner = _consent.owner;
    final lotOwner = _consent.lotOwner;
    final draft = widget.draft;

    final relatedPermit = draft.relatedBuildingPermit;
    final applicant = draft.applicant;
    final location = draft.constructionLocation;
    final scope = draft.scopeOfWork;
    final excavation = draft.excavationDetails;
    final professionals = draft.professionals;

    final fullName = [
      applicant.firstName,
      applicant.middleInitial,
      applicant.lastName,
    ].where((s) => s.trim().isNotEmpty).join(' ');
    final scopeSummary = scope.selectedScopes.map((s) => s.label).join(', ');
    final workTypeSummary = excavation.selectedWorkTypes
        .map((t) => t.label)
        .join(', ');
    final needsSeparateLotOwner = _consent.needsSeparateLotOwner;

    return Form(
      key: widget.formKey,
      child: FormScrollScaffold(
        centerVertically: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Owner Information', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _ownerPrintedName,
                    label: 'Printed Name *',
                    textCapitalization: TextCapitalization.words,
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'Printed name'),
                    onChanged: (v) {
                      owner.printedName = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _ownerAddress,
                    label: 'Address *',
                    textCapitalization: TextCapitalization.words,
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'Address'),
                    onChanged: (v) {
                      owner.address = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _ownerCtcNumber,
                    label: 'Community Tax Certificate Number *',
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'CTC number'),
                    onChanged: (v) {
                      owner.ctcNumber = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'Date Issued *',
                    value: owner.ctcDateIssued,
                    validator: (_) => owner.ctcDateIssued == null
                        ? 'Please select the date issued.'
                        : null,
                    onChanged: (date) {
                      setState(() => owner.ctcDateIssued = date);
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _ownerCtcPlaceIssued,
                    label: 'Place Issued *',
                    textCapitalization: TextCapitalization.words,
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'Place issued'),
                    onChanged: (v) {
                      owner.ctcPlaceIssued = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'Date Signed',
                    hint: 'Optional',
                    value: owner.dateSigned,
                    onChanged: (date) {
                      setState(() => owner.dateSigned = date);
                      widget.onChanged();
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            DocumentUploadTile(
              label: 'Owner Signature / Signed Document',
              document: _consent.ownerSignedDocumentUpload,
              onUpload: () {
                setState(() {
                  _consent.ownerSignedDocumentUpload = createMockDocument(
                    'Owner Signed Document',
                  );
                });
                widget.onChanged();
              },
              allowReplace: true,
              onRemove: () {
                setState(() => _consent.ownerSignedDocumentUpload = null);
                widget.onChanged();
              },
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Lot Ownership', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Is the owner also the lot owner?',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            Row(
              children: [
                Expanded(
                  child: _YesNoOption(
                    label: 'Yes',
                    selected: _consent.isOwnerAlsoLotOwner == true,
                    onTap: () {
                      setState(() => _consent.isOwnerAlsoLotOwner = true);
                      widget.onChanged();
                    },
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: _YesNoOption(
                    label: 'No',
                    selected: needsSeparateLotOwner,
                    onTap: () {
                      setState(() => _consent.isOwnerAlsoLotOwner = false);
                      widget.onChanged();
                    },
                  ),
                ),
              ],
            ),
            if (needsSeparateLotOwner) ...[
              const SizedBox(height: AppSpacing.xl),
              Text('Lot Owner Information', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.sm),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    AppTextField(
                      controller: _lotOwnerPrintedName,
                      label: 'Printed Name *',
                      textCapitalization: TextCapitalization.words,
                      validator: (v) =>
                          Validators.required(v, fieldLabel: 'Printed name'),
                      onChanged: (v) {
                        lotOwner.printedName = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _lotOwnerAddress,
                      label: 'Address *',
                      textCapitalization: TextCapitalization.words,
                      validator: (v) =>
                          Validators.required(v, fieldLabel: 'Address'),
                      onChanged: (v) {
                        lotOwner.address = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _lotOwnerCtcNumber,
                      label: 'Community Tax Certificate Number *',
                      validator: (v) =>
                          Validators.required(v, fieldLabel: 'CTC number'),
                      onChanged: (v) {
                        lotOwner.ctcNumber = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    DatePickerField(
                      label: 'Date Issued *',
                      value: lotOwner.ctcDateIssued,
                      validator: (_) => lotOwner.ctcDateIssued == null
                          ? 'Please select the date issued.'
                          : null,
                      onChanged: (date) {
                        setState(() => lotOwner.ctcDateIssued = date);
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _lotOwnerCtcPlaceIssued,
                      label: 'Place Issued *',
                      textCapitalization: TextCapitalization.words,
                      validator: (v) =>
                          Validators.required(v, fieldLabel: 'Place issued'),
                      onChanged: (v) {
                        lotOwner.ctcPlaceIssued = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    DatePickerField(
                      label: 'Date Signed',
                      hint: 'Optional',
                      value: lotOwner.dateSigned,
                      onChanged: (date) {
                        setState(() => lotOwner.dateSigned = date);
                        widget.onChanged();
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              DocumentUploadTile(
                label: 'Lot Owner Signature / Signed Document',
                document: _consent.lotOwnerSignedDocumentUpload,
                onUpload: () {
                  setState(() {
                    _consent.lotOwnerSignedDocumentUpload = createMockDocument(
                      'Lot Owner Signed Document',
                    );
                  });
                  widget.onChanged();
                },
                allowReplace: true,
                onRemove: () {
                  setState(
                    () => _consent.lotOwnerSignedDocumentUpload = null,
                  );
                  widget.onChanged();
                },
              ),
            ],

            const SizedBox(height: AppSpacing.xxl),
            Text('Application Summary', style: AppTypography.pageTitle),
            const SizedBox(height: AppSpacing.md),

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
              title: 'Occupancy Classification',
              onEdit: () => widget.onEditStep(4),
              rows: [
                _SummaryRow(
                  'Occupancy',
                  applicant.occupancyGroup?.label ?? 'Not set',
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Excavation Details',
              onEdit: () => widget.onEditStep(5),
              rows: [
                _SummaryRow(
                  'Excavation Work',
                  workTypeSummary.isEmpty ? 'Not set' : workTypeSummary,
                ),
                _SummaryRow(
                  'Depth',
                  excavation.excavationDepthMeters.trim().isEmpty
                      ? 'Not set'
                      : '${excavation.excavationDepthMeters} m',
                ),
                _SummaryRow(
                  'Volume',
                  excavation.excavationVolumeCubicMeters.trim().isEmpty
                      ? 'Not set'
                      : '${excavation.excavationVolumeCubicMeters} cu m',
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
              title: 'Owner Information',
              rows: [_SummaryRow('Printed Name', owner.printedName)],
            ),
            const SizedBox(height: AppSpacing.md),
            _SummarySection(
              title: 'Lot Owner Information',
              rows: [
                _SummaryRow(
                  'Owner is Lot Owner',
                  _consent.isOwnerAlsoLotOwner == null
                      ? 'Not set'
                      : (_consent.isOwnerAlsoLotOwner! ? 'Yes' : 'No'),
                ),
                if (needsSeparateLotOwner)
                  _SummaryRow('Lot Owner Name', lotOwner.printedName),
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
                        'I certify that the submitted information is '
                        'complete and accurate.',
                    onChanged: (v) => _toggleDeclaration(
                      (val) => _review.certifiesInformationIsAccurate = val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review
                        .understandsMustFollowApprovedPlansAndRegulations,
                    label:
                        'I understand that excavation and ground '
                        'preparation work must follow the approved plans '
                        'and applicable regulations.',
                    onChanged: (v) => _toggleDeclaration(
                      (val) => _review
                          .understandsMustFollowApprovedPlansAndRegulations =
                              val,
                      v,
                    ),
                  ),
                  _DeclarationCheckbox(
                    value: _review.understandsDependsOnRelatedBuildingPermit,
                    label:
                        'I understand that this permit supports '
                        'construction activities but does not replace, '
                        'and does not guarantee the granting of, the '
                        'Building Permit.',
                    onChanged: (v) => _toggleDeclaration(
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
                    onChanged: (v) => _toggleDeclaration(
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

class _YesNoOption extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _YesNoOption({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: onTap,
      backgroundColor: selected ? AppColors.lightBlue : AppColors.surface,
      showBorder: !selected,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            selected ? Icons.check_circle : Icons.radio_button_unchecked,
            color: selected ? AppColors.secondaryBlue : AppColors.textMuted,
            size: 20,
          ),
          const SizedBox(width: AppSpacing.sm),
          Text(
            label,
            style: selected
                ? AppTypography.bodyStrong.copyWith(
                    color: AppColors.secondaryBlueDark,
                  )
                : AppTypography.body,
          ),
        ],
      ),
    );
  }
}

class _SummarySection extends StatelessWidget {
  final String title;
  final VoidCallback? onEdit;
  final List<_SummaryRow> rows;

  const _SummarySection({required this.title, this.onEdit, required this.rows});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Expanded(child: Text(title, style: AppTypography.cardTitle)),
            if (onEdit != null)
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
