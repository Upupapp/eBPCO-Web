import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../../../core/models/renovation_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_dropdown.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';
import '../../building_permit/widgets/date_picker_field.dart';

/// Step 4 — Building & Renovation Details. Deliberately keeps "Total
/// Existing Floor Area" and "Area Affected by Renovation" as two distinct
/// fields (with the latter validated to never exceed the former) since
/// conflating them was explicitly called out as a mistake to avoid.
class Step4BuildingRenovationDetails extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final RenovationPermitDraft draft;
  final VoidCallback onChanged;

  const Step4BuildingRenovationDetails({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step4BuildingRenovationDetails> createState() =>
      _Step4BuildingRenovationDetailsState();
}

class _Step4BuildingRenovationDetailsState
    extends State<Step4BuildingRenovationDetails> {
  late final TextEditingController _occupancyOther;
  late final TextEditingController _occupancyClassification;
  late final TextEditingController _numberOfUnits;
  late final TextEditingController _totalExistingFloorArea;
  late final TextEditingController _areaAffected;
  late final TextEditingController _lotArea;
  late final TextEditingController _estimatedCost;

  RenovationBuildingDetails get _details => widget.draft.buildingDetails;

  @override
  void initState() {
    super.initState();
    _occupancyOther = TextEditingController(
      text: _details.occupancyOtherDescription,
    );
    _occupancyClassification = TextEditingController(
      text: _details.occupancyClassification,
    );
    _numberOfUnits = TextEditingController(text: _details.numberOfUnits);
    _totalExistingFloorArea = TextEditingController(
      text: _details.totalExistingFloorArea,
    );
    _areaAffected = TextEditingController(
      text: _details.areaAffectedByRenovation,
    );
    _lotArea = TextEditingController(text: _details.lotArea);
    _estimatedCost = TextEditingController(
      text: _details.estimatedRenovationCost,
    );
  }

  @override
  void dispose() {
    _occupancyOther.dispose();
    _occupancyClassification.dispose();
    _numberOfUnits.dispose();
    _totalExistingFloorArea.dispose();
    _areaAffected.dispose();
    _lotArea.dispose();
    _estimatedCost.dispose();
    super.dispose();
  }

  String? _validateAreaAffected(String? value) {
    final decimalError = Validators.positiveDecimal(
      value,
      fieldLabel: 'Area affected by renovation',
    );
    if (decimalError != null) return decimalError;
    final total = double.tryParse(_details.totalExistingFloorArea.trim());
    final affected = double.tryParse((value ?? '').trim());
    if (total != null && affected != null && affected > total) {
      return 'Cannot exceed the total existing floor area.';
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
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
                  AppDropdown<RenovationOccupancyGroup>(
                    value: _details.occupancyGroup,
                    label: 'Building Use *',
                    items: RenovationOccupancyGroup.values
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
                      RenovationOccupancyGroup.others) ...[
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
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _occupancyClassification,
                    label: 'Occupancy Classification *',
                    hint: 'Example: Single Detached Residential Building',
                    textCapitalization: TextCapitalization.sentences,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Occupancy classification',
                    ),
                    onChanged: (v) {
                      _details.occupancyClassification = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _numberOfUnits,
                    label: 'Number of Units *',
                    keyboardType: TextInputType.number,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    validator: (v) => Validators.positiveWholeNumber(
                      v,
                      fieldLabel: 'Number of units',
                    ),
                    onChanged: (v) {
                      _details.numberOfUnits = v;
                      widget.onChanged();
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Area Details', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _totalExistingFloorArea,
                    label: 'Total Existing Floor Area *',
                    hint: 'e.g. 120.5 sq m',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    inputFormatters: [
                      FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*')),
                    ],
                    validator: (v) => Validators.positiveDecimal(
                      v,
                      fieldLabel: 'Total existing floor area',
                    ),
                    onChanged: (v) {
                      _details.totalExistingFloorArea = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _areaAffected,
                    label: 'Area Affected by Renovation *',
                    hint: 'Must not exceed the total existing floor area',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    inputFormatters: [
                      FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*')),
                    ],
                    validator: _validateAreaAffected,
                    onChanged: (v) {
                      _details.areaAffectedByRenovation = v;
                      widget.onChanged();
                    },
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
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Cost and Schedule', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _estimatedCost,
                    label: 'Estimated Renovation Cost *',
                    hint: 'e.g. 350000',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    inputFormatters: [
                      FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*')),
                    ],
                    validator: (v) => Validators.positiveDecimal(
                      v,
                      fieldLabel: 'Estimated renovation cost',
                    ),
                    onChanged: (v) {
                      _details.estimatedRenovationCost = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'Proposed Renovation Start Date *',
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
