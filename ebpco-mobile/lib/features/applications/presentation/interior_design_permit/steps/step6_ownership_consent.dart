import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/interior_design_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';
import '../../../../../shared/widgets/uploads/document_upload_tile.dart';
import '../../building_permit/widgets/date_picker_field.dart';
import '../../building_permit/widgets/mock_upload.dart';

/// Step 6 — Building Owner & Lot Owner Consent (Boxes 5–6). The official
/// form goes straight to Building Owner details (there is no separate
/// "is the applicant the owner" question for this permit, unlike some
/// other ancillary permits). Hidden fields never block navigation, and
/// switching an answer back and forth preserves whatever was already
/// entered.
class Step6OwnershipConsent extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final InteriorPermitDraft draft;
  final VoidCallback onChanged;

  const Step6OwnershipConsent({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step6OwnershipConsent> createState() => _Step6OwnershipConsentState();
}

class _Step6OwnershipConsentState extends State<Step6OwnershipConsent> {
  late final TextEditingController _buildingOwnerFullName;
  late final TextEditingController _buildingOwnerAddress;
  late final TextEditingController _buildingOwnerCtcNumber;
  late final TextEditingController _buildingOwnerCtcPlaceIssued;

  late final TextEditingController _lotOwnerFullName;
  late final TextEditingController _lotOwnerAddress;
  late final TextEditingController _lotOwnerCtcNumber;
  late final TextEditingController _lotOwnerCtcPlaceIssued;

  InteriorOwnershipConsent get _consent => widget.draft.ownershipConsent;

  @override
  void initState() {
    super.initState();
    final buildingOwner = _consent.buildingOwner;
    _buildingOwnerFullName = TextEditingController(
      text: buildingOwner.fullName,
    );
    _buildingOwnerAddress = TextEditingController(text: buildingOwner.address);
    _buildingOwnerCtcNumber = TextEditingController(
      text: buildingOwner.ctcNumber,
    );
    _buildingOwnerCtcPlaceIssued = TextEditingController(
      text: buildingOwner.ctcPlaceIssued,
    );

    final lotOwner = _consent.lotOwner;
    _lotOwnerFullName = TextEditingController(text: lotOwner.fullName);
    _lotOwnerAddress = TextEditingController(text: lotOwner.address);
    _lotOwnerCtcNumber = TextEditingController(text: lotOwner.ctcNumber);
    _lotOwnerCtcPlaceIssued = TextEditingController(
      text: lotOwner.ctcPlaceIssued,
    );
  }

  @override
  void dispose() {
    _buildingOwnerFullName.dispose();
    _buildingOwnerAddress.dispose();
    _buildingOwnerCtcNumber.dispose();
    _buildingOwnerCtcPlaceIssued.dispose();
    _lotOwnerFullName.dispose();
    _lotOwnerAddress.dispose();
    _lotOwnerCtcNumber.dispose();
    _lotOwnerCtcPlaceIssued.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final buildingOwner = _consent.buildingOwner;
    final lotOwner = _consent.lotOwner;

    return Form(
      key: widget.formKey,
      child: FormScrollScaffold(
        centerVertically: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Building Owner Information', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _buildingOwnerFullName,
                    label: 'Building Owner Full Name *',
                    textCapitalization: TextCapitalization.words,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Building owner full name',
                    ),
                    onChanged: (v) {
                      buildingOwner.fullName = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _buildingOwnerAddress,
                    label: 'Building Owner Address *',
                    textCapitalization: TextCapitalization.words,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Building owner address',
                    ),
                    onChanged: (v) {
                      buildingOwner.address = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _buildingOwnerCtcNumber,
                    label: 'CTC Number *',
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'CTC number'),
                    onChanged: (v) {
                      buildingOwner.ctcNumber = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'Date Issued *',
                    value: buildingOwner.ctcDateIssued,
                    validator: (_) => buildingOwner.ctcDateIssued == null
                        ? 'Please select the date issued.'
                        : null,
                    onChanged: (date) {
                      setState(() => buildingOwner.ctcDateIssued = date);
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _buildingOwnerCtcPlaceIssued,
                    label: 'Place Issued *',
                    textCapitalization: TextCapitalization.words,
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'Place issued'),
                    onChanged: (v) {
                      buildingOwner.ctcPlaceIssued = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'Date Signed',
                    hint: 'Optional',
                    value: buildingOwner.dateSigned,
                    onChanged: (date) {
                      setState(() => buildingOwner.dateSigned = date);
                      widget.onChanged();
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            DocumentUploadTile(
              label: 'Signed Building Owner Consent',
              document: _consent.buildingOwnerSignedDocumentUpload,
              onUpload: () {
                setState(() {
                  _consent.buildingOwnerSignedDocumentUpload =
                      createMockDocument('Signed Building Owner Consent');
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

            const SizedBox(height: AppSpacing.xl),
            Text('Lot Ownership', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Is the Building Owner also the registered Lot Owner?',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            Row(
              children: [
                Expanded(
                  child: _YesNoOption(
                    label: 'Yes',
                    selected: _consent.isBuildingOwnerAlsoLotOwner == true,
                    onTap: () {
                      setState(
                        () => _consent.isBuildingOwnerAlsoLotOwner = true,
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
                        () => _consent.isBuildingOwnerAlsoLotOwner = false,
                      );
                      widget.onChanged();
                    },
                  ),
                ),
              ],
            ),
            if (_consent.needsSeparateLotOwner) ...[
              const SizedBox(height: AppSpacing.xl),
              Text('Lot Owner Information', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.sm),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    AppTextField(
                      controller: _lotOwnerFullName,
                      label: 'Lot Owner Full Name *',
                      textCapitalization: TextCapitalization.words,
                      validator: (v) => Validators.required(
                        v,
                        fieldLabel: 'Lot owner full name',
                      ),
                      onChanged: (v) {
                        lotOwner.fullName = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _lotOwnerAddress,
                      label: 'Lot Owner Address *',
                      textCapitalization: TextCapitalization.words,
                      validator: (v) => Validators.required(
                        v,
                        fieldLabel: 'Lot owner address',
                      ),
                      onChanged: (v) {
                        lotOwner.address = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _lotOwnerCtcNumber,
                      label: 'CTC Number *',
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
                label: 'Lot Owner Consent',
                document: _consent.lotOwnerConsentUpload,
                onUpload: () {
                  setState(() {
                    _consent.lotOwnerConsentUpload = createMockDocument(
                      'Lot Owner Consent',
                    );
                  });
                  widget.onChanged();
                },
                allowReplace: true,
                onRemove: () {
                  setState(() => _consent.lotOwnerConsentUpload = null);
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
