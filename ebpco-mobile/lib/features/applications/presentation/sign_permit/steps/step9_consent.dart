import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/sign_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';
import '../../../../../shared/widgets/uploads/document_upload_tile.dart';
import '../../building_permit/widgets/date_picker_field.dart';
import '../../building_permit/widgets/mock_upload.dart';

/// Step 9 — Applicant & Owner Consent (Boxes 5–6). Hidden fields never
/// block navigation, and switching an answer back and forth preserves
/// whatever was already entered.
class Step9Consent extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final SignPermitDraft draft;
  final VoidCallback onChanged;

  const Step9Consent({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step9Consent> createState() => _Step9ConsentState();
}

class _Step9ConsentState extends State<Step9Consent> {
  late final TextEditingController _applicantPrintedName;
  late final TextEditingController _applicantAddress;
  late final TextEditingController _applicantCtcNumber;
  late final TextEditingController _applicantCtcPlaceIssued;
  late final TextEditingController _applicantTin;

  late final TextEditingController _ownerPrintedName;
  late final TextEditingController _ownerAddress;
  late final TextEditingController _ownerCtcNumber;
  late final TextEditingController _ownerCtcPlaceIssued;

  SignApplicantOwnerConsent get _consent => widget.draft.consent;

  @override
  void initState() {
    super.initState();
    final applicant = _consent.applicant;
    _applicantPrintedName = TextEditingController(text: applicant.printedName);
    _applicantAddress = TextEditingController(text: applicant.address);
    _applicantCtcNumber = TextEditingController(text: applicant.ctcNumber);
    _applicantCtcPlaceIssued = TextEditingController(
      text: applicant.ctcPlaceIssued,
    );
    _applicantTin = TextEditingController(text: applicant.tin);

    final owner = _consent.buildingOwner;
    _ownerPrintedName = TextEditingController(text: owner.printedName);
    _ownerAddress = TextEditingController(text: owner.address);
    _ownerCtcNumber = TextEditingController(text: owner.ctcNumber);
    _ownerCtcPlaceIssued = TextEditingController(text: owner.ctcPlaceIssued);
  }

  @override
  void dispose() {
    _applicantPrintedName.dispose();
    _applicantAddress.dispose();
    _applicantCtcNumber.dispose();
    _applicantCtcPlaceIssued.dispose();
    _applicantTin.dispose();
    _ownerPrintedName.dispose();
    _ownerAddress.dispose();
    _ownerCtcNumber.dispose();
    _ownerCtcPlaceIssued.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final applicant = _consent.applicant;
    final owner = _consent.buildingOwner;

    return Form(
      key: widget.formKey,
      child: FormScrollScaffold(
        centerVertically: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Applicant Consent', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _applicantPrintedName,
                    label: 'Printed Name *',
                    textCapitalization: TextCapitalization.words,
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'Printed name'),
                    onChanged: (v) {
                      applicant.printedName = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _applicantAddress,
                    label: 'Address *',
                    textCapitalization: TextCapitalization.words,
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'Address'),
                    onChanged: (v) {
                      applicant.address = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _applicantCtcNumber,
                    label: 'Community Tax Certificate Number *',
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'CTC number'),
                    onChanged: (v) {
                      applicant.ctcNumber = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'Date Issued *',
                    value: applicant.ctcDateIssued,
                    validator: (_) => applicant.ctcDateIssued == null
                        ? 'Please select the date issued.'
                        : null,
                    onChanged: (date) {
                      setState(() => applicant.ctcDateIssued = date);
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _applicantCtcPlaceIssued,
                    label: 'Place Issued *',
                    textCapitalization: TextCapitalization.words,
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'Place issued'),
                    onChanged: (v) {
                      applicant.ctcPlaceIssued = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _applicantTin,
                    label: 'TIN',
                    hint: 'Optional',
                    keyboardType: TextInputType.number,
                    onChanged: (v) {
                      applicant.tin = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'Date Signed',
                    hint: 'Optional',
                    value: applicant.dateSigned,
                    onChanged: (date) {
                      setState(() => applicant.dateSigned = date);
                      widget.onChanged();
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            DocumentUploadTile(
              label: 'Applicant Signature / Signed Document',
              document: _consent.applicantSignedDocumentUpload,
              onUpload: () {
                setState(() {
                  _consent.applicantSignedDocumentUpload = createMockDocument(
                    'Applicant Signed Document',
                  );
                });
                widget.onChanged();
              },
              allowReplace: true,
              onRemove: () {
                setState(() => _consent.applicantSignedDocumentUpload = null);
                widget.onChanged();
              },
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Building Ownership', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Is the applicant also the building owner?',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            Row(
              children: [
                Expanded(
                  child: _YesNoOption(
                    label: 'Yes',
                    selected: _consent.isApplicantAlsoBuildingOwner == true,
                    onTap: () {
                      setState(
                        () => _consent.isApplicantAlsoBuildingOwner = true,
                      );
                      widget.onChanged();
                    },
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: _YesNoOption(
                    label: 'No',
                    selected: _consent.needsSeparateBuildingOwner,
                    onTap: () {
                      setState(
                        () => _consent.isApplicantAlsoBuildingOwner = false,
                      );
                      widget.onChanged();
                    },
                  ),
                ),
              ],
            ),
            if (_consent.needsSeparateBuildingOwner) ...[
              const SizedBox(height: AppSpacing.xl),
              Text('Building Owner Consent', style: AppTypography.cardTitle),
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
                label: 'Building Owner Signature / Signed Document',
                document: _consent.buildingOwnerSignedDocumentUpload,
                onUpload: () {
                  setState(() {
                    _consent.buildingOwnerSignedDocumentUpload =
                        createMockDocument('Building Owner Signed Document');
                  });
                  widget.onChanged();
                },
                allowReplace: true,
                onRemove: () {
                  setState(
                    () => _consent.buildingOwnerSignedDocumentUpload = null,
                  );
                  widget.onChanged();
                },
              ),
            ],
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
