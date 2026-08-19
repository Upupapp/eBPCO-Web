import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/addition_extension_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_dropdown.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';
import '../../building_permit/widgets/date_picker_field.dart';

String? _nonNegativeWholeNumber(String? value, String fieldLabel) {
  if (value == null || value.trim().isEmpty) {
    return '$fieldLabel is required.';
  }
  final parsed = int.tryParse(value.trim());
  if (parsed == null) return 'Enter a whole number.';
  if (parsed < 0) return '$fieldLabel cannot be negative.';
  return null;
}

String? _nonNegativeDecimal(String? value, String fieldLabel) {
  if (value == null || value.trim().isEmpty) {
    return '$fieldLabel is required.';
  }
  final parsed = double.tryParse(value.trim());
  if (parsed == null) return 'Enter a valid number.';
  if (parsed < 0) return '$fieldLabel cannot be negative.';
  return null;
}

/// Step 4 — Existing Building & Proposed Addition Details. Resulting Total
/// Floor Area is shown as a read-only, live-recalculated value (never a
/// field the user edits directly), so it can never be entered
/// inconsistently with its two inputs.
class Step4BuildingAdditionDetails extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final AdditionExtensionPermitDraft draft;
  final VoidCallback onChanged;

  const Step4BuildingAdditionDetails({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step4BuildingAdditionDetails> createState() =>
      _Step4BuildingAdditionDetailsState();
}

class _Step4BuildingAdditionDetailsState
    extends State<Step4BuildingAdditionDetails> {
  late final TextEditingController _occupancyOther;
  late final TextEditingController _existingOccupancyClassification;
  late final TextEditingController _existingNumberOfUnits;
  late final TextEditingController _existingNumberOfStoreys;
  late final TextEditingController _existingFloorArea;
  late final TextEditingController _proposedAddedNumberOfUnits;
  late final TextEditingController _proposedAdditionalStoreys;
  late final TextEditingController _proposedAddedFloorArea;
  late final TextEditingController _lotArea;
  late final TextEditingController _estimatedCost;

  BuildingAdditionDetails get _details => widget.draft.buildingDetails;

  @override
  void initState() {
    super.initState();
    _occupancyOther = TextEditingController(
      text: _details.occupancyOtherDescription,
    );
    _existingOccupancyClassification = TextEditingController(
      text: _details.existingOccupancyClassification,
    );
    _existingNumberOfUnits = TextEditingController(
      text: _details.existingNumberOfUnits,
    );
    _existingNumberOfStoreys = TextEditingController(
      text: _details.existingNumberOfStoreys,
    );
    _existingFloorArea = TextEditingController(
      text: _details.existingFloorArea,
    );
    _proposedAddedNumberOfUnits = TextEditingController(
      text: _details.proposedAddedNumberOfUnits,
    );
    _proposedAdditionalStoreys = TextEditingController(
      text: _details.proposedAdditionalStoreys,
    );
    _proposedAddedFloorArea = TextEditingController(
      text: _details.proposedAddedFloorArea,
    );
    _lotArea = TextEditingController(text: _details.lotArea);
    _estimatedCost = TextEditingController(text: _details.estimatedCost);
  }

  @override
  void dispose() {
    _occupancyOther.dispose();
    _existingOccupancyClassification.dispose();
    _existingNumberOfUnits.dispose();
    _existingNumberOfStoreys.dispose();
    _existingFloorArea.dispose();
    _proposedAddedNumberOfUnits.dispose();
    _proposedAdditionalStoreys.dispose();
    _proposedAddedFloorArea.dispose();
    _lotArea.dispose();
    _estimatedCost.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final resultingTotal = _details.resultingTotalFloorArea;

    return Form(
      key: widget.formKey,
      child: FormScrollScaffold(
        centerVertically: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Occupancy', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppDropdown<AdditionExtensionOccupancyGroup>(
                    value: _details.occupancyGroup,
                    label: 'Building Use *',
                    items: AdditionExtensionOccupancyGroup.values
                        .map(
                          (g) => DropdownMenuItem(
                            value: g,
                            child: Text(g.label),
                          ),
                        )
                        .toList(),
                    validator: (v) =>
                        v == null ? 'Please select a building use.' : null,
                    onChanged: (v) {
                      setState(() => _details.occupancyGroup = v);
                      widget.onChanged();
                    },
                  ),
                  if (_details.occupancyGroup ==
                      AdditionExtensionOccupancyGroup.others) ...[
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _occupancyOther,
                      label: 'Specify Building Use *',
                      validator: (v) =>
                          Validators.required(v, fieldLabel: 'Building use'),
                      onChanged: (v) {
                        _details.occupancyOtherDescription = v;
                        widget.onChanged();
                      },
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Existing Building', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _existingOccupancyClassification,
                    label: 'Existing Occupancy Classification *',
                    hint: 'Example: Single Detached Residential Building',
                    textCapitalization: TextCapitalization.sentences,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Existing occupancy classification',
                    ),
                    onChanged: (v) {
                      _details.existingOccupancyClassification = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _existingNumberOfUnits,
                    label: 'Existing Number of Units *',
                    keyboardType: TextInputType.number,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    validator: (v) => _nonNegativeWholeNumber(
                      v,
                      'Existing number of units',
                    ),
                    onChanged: (v) {
                      _details.existingNumberOfUnits = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _existingNumberOfStoreys,
                    label: 'Existing Number of Storeys *',
                    keyboardType: TextInputType.number,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    validator: (v) => _nonNegativeWholeNumber(
                      v,
                      'Existing number of storeys',
                    ),
                    onChanged: (v) {
                      _details.existingNumberOfStoreys = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _existingFloorArea,
                    label: 'Existing Floor Area *',
                    hint: 'e.g. 120.5 sq m',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    inputFormatters: [
                      FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*')),
                    ],
                    validator: (v) => Validators.positiveDecimal(
                      v,
                      fieldLabel: 'Existing floor area',
                    ),
                    onChanged: (v) {
                      setState(() => _details.existingFloorArea = v);
                      widget.onChanged();
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Proposed Addition', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _proposedAddedNumberOfUnits,
                    label: 'Proposed Added Number of Units *',
                    keyboardType: TextInputType.number,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    validator: (v) => _nonNegativeWholeNumber(
                      v,
                      'Proposed added number of units',
                    ),
                    onChanged: (v) {
                      _details.proposedAddedNumberOfUnits = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _proposedAdditionalStoreys,
                    label: 'Proposed Additional Storeys *',
                    keyboardType: TextInputType.number,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    validator: (v) => _nonNegativeWholeNumber(
                      v,
                      'Proposed additional storeys',
                    ),
                    onChanged: (v) {
                      setState(() => _details.proposedAdditionalStoreys = v);
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _proposedAddedFloorArea,
                    label: 'Proposed Added Floor Area *',
                    hint: 'e.g. 40 sq m',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    inputFormatters: [
                      FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*')),
                    ],
                    validator: (v) => Validators.positiveDecimal(
                      v,
                      fieldLabel: 'Proposed added floor area',
                    ),
                    onChanged: (v) {
                      setState(() => _details.proposedAddedFloorArea = v);
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceMuted,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Resulting Total Floor Area',
                          style: AppTypography.caption,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          resultingTotal != null
                              ? '${resultingTotal.toStringAsFixed(2)} sq m'
                              : '— sq m',
                          style: AppTypography.bodyStrong,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Automatically calculated: Existing Floor Area + '
                          'Proposed Added Floor Area.',
                          style: AppTypography.caption,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _lotArea,
                    label: 'Lot Area *',
                    hint: 'e.g. 200 sq m',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    inputFormatters: [
                      FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*')),
                    ],
                    validator: (v) =>
                        Validators.positiveDecimal(v, fieldLabel: 'Lot area'),
                    onChanged: (v) {
                      _details.lotArea = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _estimatedCost,
                    label: 'Estimated Addition / Extension Cost *',
                    hint: 'e.g. 350000',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    inputFormatters: [
                      FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*')),
                    ],
                    validator: (v) =>
                        _nonNegativeDecimal(v, 'Estimated cost'),
                    onChanged: (v) {
                      _details.estimatedCost = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'Proposed Construction Start Date *',
                    value: _details.proposedStartDate,
                    validator: (_) => _details.proposedStartDate == null
                        ? 'Please select a proposed start date.'
                        : null,
                    onChanged: (date) {
                      setState(() => _details.proposedStartDate = date);
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'Expected Completion Date *',
                    value: _details.expectedCompletionDate,
                    validator: (_) {
                      final proposed = _details.proposedStartDate;
                      final expected = _details.expectedCompletionDate;
                      if (expected == null) {
                        return 'Please select an expected completion date.';
                      }
                      if (proposed != null && expected.isBefore(proposed)) {
                        return 'Cannot be earlier than the proposed start date.';
                      }
                      return null;
                    },
                    onChanged: (date) {
                      setState(() => _details.expectedCompletionDate = date);
                      widget.onChanged();
                    },
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
