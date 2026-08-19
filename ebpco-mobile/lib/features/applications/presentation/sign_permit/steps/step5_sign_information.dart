import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../../../core/models/sign_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_dropdown.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';

/// Step 5 — Sign Information ("Use or Character of Occupancy" section of
/// the official form). Type of Display, Display Type, and Type of
/// Installation are each a single selection, presented as dropdowns to
/// keep the longer option labels (e.g. "Business Sign – Projecting
/// Type") from wrapping or overflowing on narrow screens. Total Display
/// Area is always derived from Length × Width — never directly editable.
class Step5SignInformation extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final SignPermitDraft draft;
  final VoidCallback onChanged;

  const Step5SignInformation({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step5SignInformation> createState() => _Step5SignInformationState();
}

class _Step5SignInformationState extends State<Step5SignInformation> {
  late final TextEditingController _otherDisplayType;
  late final TextEditingController _otherInstallation;
  late final TextEditingController _length;
  late final TextEditingController _width;

  SignInformation get _sign => widget.draft.signInformation;

  @override
  void initState() {
    super.initState();
    _otherDisplayType = TextEditingController(
      text: _sign.otherDisplayTypeDescription,
    );
    _otherInstallation = TextEditingController(
      text: _sign.otherInstallationDescription,
    );
    _length = TextEditingController(text: _sign.lengthMeters);
    _width = TextEditingController(text: _sign.widthMeters);
  }

  @override
  void dispose() {
    _otherDisplayType.dispose();
    _otherInstallation.dispose();
    _length.dispose();
    _width.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final decimalFormatters = [
      FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*')),
    ];
    final area = _sign.displayAreaSquareMeters;

    return Form(
      key: widget.formKey,
      child: FormScrollScaffold(
        centerVertically: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Type of Display', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: AppDropdown<SignDisplayFaceType>(
                value: _sign.displayFaceType,
                label: 'Type of Display *',
                items: SignDisplayFaceType.values
                    .map(
                      (t) => DropdownMenuItem(value: t, child: Text(t.label)),
                    )
                    .toList(),
                validator: (v) =>
                    v == null ? 'Please select a type of display.' : null,
                onChanged: (v) {
                  setState(() => _sign.displayFaceType = v);
                  widget.onChanged();
                },
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Display Type', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppDropdown<SignDisplayType>(
                    value: _sign.displayType,
                    label: 'Display Type *',
                    items: SignDisplayType.values
                        .map(
                          (t) =>
                              DropdownMenuItem(value: t, child: Text(t.label)),
                        )
                        .toList(),
                    validator: (v) =>
                        v == null ? 'Please select a display type.' : null,
                    onChanged: (v) {
                      setState(() => _sign.displayType = v);
                      widget.onChanged();
                    },
                  ),
                  if (_sign.displayType == SignDisplayType.other) ...[
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _otherDisplayType,
                      label: 'Specify Display Type *',
                      validator: (v) =>
                          Validators.required(v, fieldLabel: 'Display type'),
                      onChanged: (v) {
                        _sign.otherDisplayTypeDescription = v;
                        widget.onChanged();
                      },
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Type of Installation', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppDropdown<SignInstallationType>(
                    value: _sign.installationType,
                    label: 'Type of Installation *',
                    items: SignInstallationType.values
                        .map(
                          (t) =>
                              DropdownMenuItem(value: t, child: Text(t.label)),
                        )
                        .toList(),
                    validator: (v) => v == null
                        ? 'Please select a type of installation.'
                        : null,
                    onChanged: (v) {
                      setState(() => _sign.installationType = v);
                      widget.onChanged();
                    },
                  ),
                  if (_sign.installationType ==
                      SignInstallationType.advertisingOther) ...[
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _otherInstallation,
                      label: 'Specify Installation Type *',
                      validator: (v) => Validators.required(
                        v,
                        fieldLabel: 'Installation type',
                      ),
                      onChanged: (v) {
                        _sign.otherInstallationDescription = v;
                        widget.onChanged();
                      },
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Display Size', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _length,
                    label: 'Length (meters) *',
                    hint: 'e.g. 3.5',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    inputFormatters: decimalFormatters,
                    validator: (v) =>
                        Validators.positiveDecimal(v, fieldLabel: 'Length'),
                    onChanged: (v) {
                      setState(() => _sign.lengthMeters = v);
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _width,
                    label: 'Width (meters) *',
                    hint: 'e.g. 1.2',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    inputFormatters: decimalFormatters,
                    validator: (v) =>
                        Validators.positiveDecimal(v, fieldLabel: 'Width'),
                    onChanged: (v) {
                      setState(() => _sign.widthMeters = v);
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Total Display Area',
                        style: AppTypography.caption,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        area != null
                            ? '${area.toStringAsFixed(2)} sq m'
                            : 'Enter length and width to calculate',
                        style: AppTypography.bodyStrong,
                      ),
                    ],
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
