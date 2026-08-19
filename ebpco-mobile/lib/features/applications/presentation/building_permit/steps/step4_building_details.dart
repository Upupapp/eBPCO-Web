import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../../../core/models/building_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';
import '../widgets/date_picker_field.dart';

/// Step 4 — Building Details: occupancy, floor/lot area, estimated cost,
/// and proposed construction schedule.
class Step4BuildingDetails extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final BuildingPermitDraft draft;
  final VoidCallback onChanged;

  const Step4BuildingDetails({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step4BuildingDetails> createState() => _Step4BuildingDetailsState();
}

class _Step4BuildingDetailsState extends State<Step4BuildingDetails> {
  late final TextEditingController _occupancyClassification;
  late final TextEditingController _numberOfUnits;
  late final TextEditingController _totalFloorArea;
  late final TextEditingController _lotArea;
  late final TextEditingController _estimatedCost;

  BuildingDetails get _details => widget.draft.buildingDetails;

  @override
  void initState() {
    super.initState();
    _occupancyClassification = TextEditingController(
      text: _details.occupancyClassification,
    );
    _numberOfUnits = TextEditingController(text: _details.numberOfUnits);
    _totalFloorArea = TextEditingController(text: _details.totalFloorArea);
    _lotArea = TextEditingController(text: _details.lotArea);
    _estimatedCost = TextEditingController(
      text: _details.estimatedConstructionCost,
    );
  }

  @override
  void dispose() {
    _occupancyClassification.dispose();
    _numberOfUnits.dispose();
    _totalFloorArea.dispose();
    _lotArea.dispose();
    _estimatedCost.dispose();
    super.dispose();
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
            Text('Occupancy Details', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
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
                    hint: 'Enter the total number of units in the building',
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
                    controller: _totalFloorArea,
                    label: 'Total Floor Area *',
                    hint: 'e.g. 120.5',
                    suffixIcon: const _UnitSuffix('sq m'),
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    inputFormatters: [
                      FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*')),
                    ],
                    validator: (v) => Validators.positiveDecimal(
                      v,
                      fieldLabel: 'Total floor area',
                    ),
                    onChanged: (v) {
                      _details.totalFloorArea = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _lotArea,
                    label: 'Lot Area *',
                    hint: 'e.g. 200',
                    suffixIcon: const _UnitSuffix('sq m'),
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
                    label: 'Total Estimated Construction Cost *',
                    hint: 'e.g. 1500000',
                    prefixIcon: Padding(
                      padding: const EdgeInsets.only(left: 12, right: 4),
                      child: Center(
                        widthFactor: 1,
                        child: Text('₱', style: AppTypography.body),
                      ),
                    ),
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    inputFormatters: [
                      FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*')),
                    ],
                    validator: (v) => Validators.positiveDecimal(
                      v,
                      fieldLabel: 'Estimated construction cost',
                    ),
                    onChanged: (v) {
                      _details.estimatedConstructionCost = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    'This amount is an estimate and may be used as part of '
                    'the permit assessment.',
                    style: AppTypography.helper,
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'Proposed Date of Construction *',
                    value: _details.proposedConstructionDate,
                    validator: (_) => _details.proposedConstructionDate == null
                        ? 'Please select a proposed construction date.'
                        : null,
                    onChanged: (date) {
                      setState(() => _details.proposedConstructionDate = date);
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'Expected Date of Completion *',
                    value: _details.expectedCompletionDate,
                    validator: (_) {
                      final proposed = _details.proposedConstructionDate;
                      final expected = _details.expectedCompletionDate;
                      if (expected == null) {
                        return 'Please select an expected completion date.';
                      }
                      if (proposed != null && !expected.isAfter(proposed)) {
                        return 'Completion date must be after the proposed '
                            'construction date.';
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

class _UnitSuffix extends StatelessWidget {
  final String unit;

  const _UnitSuffix(this.unit);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 12),
      child: Center(
        widthFactor: 1,
        child: Text(unit, style: AppTypography.helper),
      ),
    );
  }
}
