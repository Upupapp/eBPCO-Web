import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/fencing_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';
import '../../../../../shared/widgets/uploads/document_upload_tile.dart';
import '../../building_permit/widgets/date_picker_field.dart';
import '../../building_permit/widgets/mock_upload.dart';

/// Step 7 — Applicant & Lot Owner Consent (Boxes 4–5). The paper form's
/// Notarial Acknowledgment section is intentionally never exposed here —
/// see [FencingNotarialAcknowledgment] in the model. Hidden fields never
/// block navigation, and switching an answer back and forth preserves
/// whatever was already entered.
class Step7Consent extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final FencingPermitDraft draft;
  final VoidCallback onChanged;

  const Step7Consent({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step7Consent> createState() => _Step7ConsentState();
}

class _Step7ConsentState extends State<Step7Consent> {
  late final TextEditingController _applicantPrintedName;
  late final TextEditingController _applicantAddress;
  late final TextEditingController _applicantCtcNumber;
  late final TextEditingController _applicantCtcPlaceIssued;

  late final TextEditingController _lotOwnerPrintedName;
  late final TextEditingController _lotOwnerAddress;
  late final TextEditingController _lotOwnerCtcNumber;
  late final TextEditingController _lotOwnerCtcPlaceIssued;

  FencingApplicantLotOwnerConsent get _consent => widget.draft.consent;

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
    _applicantPrintedName.dispose();
    _applicantAddress.dispose();
    _applicantCtcNumber.dispose();
    _applicantCtcPlaceIssued.dispose();
    _lotOwnerPrintedName.dispose();
    _lotOwnerAddress.dispose();
    _lotOwnerCtcNumber.dispose();
    _lotOwnerCtcPlaceIssued.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final applicant = _consent.applicant;
    final lotOwner = _consent.lotOwner;

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
            Text('Lot Ownership', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Is the Applicant also the Lot Owner?',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            Row(
              children: [
                Expanded(
                  child: _YesNoOption(
                    label: 'Yes',
                    selected: _consent.isApplicantAlsoLotOwner == true,
                    onTap: () {
                      setState(
                        () => _consent.isApplicantAlsoLotOwner = true,
                      );
                      widget.onChanged();
                    },
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: _YesNoOption(
                    label: 'No',
                    selected: _consent.needsSeparateLotOwner,
                    onTap: () {
                      setState(
                        () => _consent.isApplicantAlsoLotOwner = false,
                      );
                      widget.onChanged();
                    },
                  ),
                ),
              ],
            ),
            if (_consent.needsSeparateLotOwner) ...[
              const SizedBox(height: AppSpacing.xl),
              Text('Lot Owner Consent', style: AppTypography.cardTitle),
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
                  setState(() => _consent.lotOwnerSignedDocumentUpload = null);
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
