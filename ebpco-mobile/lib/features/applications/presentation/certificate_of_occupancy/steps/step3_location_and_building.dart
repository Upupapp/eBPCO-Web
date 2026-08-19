import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../../../core/models/certificate_of_occupancy_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_dropdown.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';
import '../../building_permit/widgets/date_picker_field.dart';

/// Step 3 — Project Location and Building Details.
class Step3LocationAndBuilding extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final CertificateOfOccupancyDraft draft;
  final VoidCallback onChanged;

  const Step3LocationAndBuilding({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step3LocationAndBuilding> createState() =>
      _Step3LocationAndBuildingState();
}

class _Step3LocationAndBuildingState extends State<Step3LocationAndBuilding> {
  late final TextEditingController _lotNumber;
  late final TextEditingController _blockNumber;
  late final TextEditingController _street;
  late final TextEditingController _barangay;
  late final TextEditingController _city;
  late final TextEditingController _occupancyOther;
  late final TextEditingController _numberOfStoreys;
  late final TextEditingController _numberOfUnits;
  late final TextEditingController _totalFloorArea;

  OccupancyProjectDetails get _details => widget.draft.projectDetails;

  @override
  void initState() {
    super.initState();
    _lotNumber = TextEditingController(text: _details.lotNumber);
    _blockNumber = TextEditingController(text: _details.blockNumber);
    _street = TextEditingController(text: _details.street);
    _barangay = TextEditingController(text: _details.barangay);
    _city = TextEditingController(text: _details.city);
    _occupancyOther = TextEditingController(
      text: _details.occupancyOtherDescription,
    );
    _numberOfStoreys = TextEditingController(text: _details.numberOfStoreys);
    _numberOfUnits = TextEditingController(text: _details.numberOfUnits);
    _totalFloorArea = TextEditingController(
      text: _details.totalFloorAreaSquareMeters,
    );
  }

  @override
  void dispose() {
    _lotNumber.dispose();
    _blockNumber.dispose();
    _street.dispose();
    _barangay.dispose();
    _city.dispose();
    _occupancyOther.dispose();
    _numberOfStoreys.dispose();
    _numberOfUnits.dispose();
    _totalFloorArea.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final decimalFormatters = [
      FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*')),
    ];

    return Form(
      key: widget.formKey,
      child: FormScrollScaffold(
        centerVertically: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Project Location', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _lotNumber,
                    label: 'Lot Number *',
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'Lot number'),
                    onChanged: (v) {
                      _details.lotNumber = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _blockNumber,
                    label: 'Block Number',
                    hint: 'Optional',
                    onChanged: (v) {
                      _details.blockNumber = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _street,
                    label: 'Street *',
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'Street'),
                    onChanged: (v) {
                      _details.street = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _barangay,
                    label: 'Barangay *',
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'Barangay'),
                    onChanged: (v) {
                      _details.barangay = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _city,
                    label: 'City / Municipality *',
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'City or municipality',
                    ),
                    onChanged: (v) {
                      _details.city = v;
                      widget.onChanged();
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Occupancy', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppDropdown<OccupancyGroup>(
                    value: _details.occupancyGroup,
                    label: 'Use or Character of Occupancy *',
                    items: OccupancyGroup.values
                        .map(
                          (g) => DropdownMenuItem(
                            value: g,
                            child: Text(g.label),
                          ),
                        )
                        .toList(),
                    validator: (v) =>
                        v == null ? 'Please select an occupancy.' : null,
                    onChanged: (v) {
                      setState(() => _details.occupancyGroup = v);
                      widget.onChanged();
                    },
                  ),
                  if (_details.occupancyGroup == OccupancyGroup.others) ...[
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _occupancyOther,
                      label: 'Specify Occupancy *',
                      validator: (v) =>
                          Validators.required(v, fieldLabel: 'Occupancy'),
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
            Text('Building Details', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _numberOfStoreys,
                    label: 'Number of Storeys *',
                    keyboardType: TextInputType.number,
                    validator: (v) => Validators.positiveWholeNumber(
                      v,
                      fieldLabel: 'Number of storeys',
                    ),
                    onChanged: (v) {
                      _details.numberOfStoreys = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _numberOfUnits,
                    label: 'Number of Units *',
                    keyboardType: TextInputType.number,
                    validator: (v) => Validators.positiveWholeNumber(
                      v,
                      fieldLabel: 'Number of units',
                    ),
                    onChanged: (v) {
                      _details.numberOfUnits = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _totalFloorArea,
                    label: 'Total Floor Area (sq m) *',
                    hint: 'e.g. 450.5',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    inputFormatters: decimalFormatters,
                    validator: (v) => Validators.positiveDecimal(
                      v,
                      fieldLabel: 'Total floor area',
                    ),
                    onChanged: (v) {
                      _details.totalFloorAreaSquareMeters = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'Date of Completion *',
                    value: _details.dateOfCompletion,
                    lastDate: DateTime.now(),
                    validator: (_) {
                      if (_details.dateOfCompletion == null) {
                        return 'Please select the date of completion.';
                      }
                      if (_details.dateOfCompletion!.isAfter(DateTime.now())) {
                        return 'Date of completion cannot be in the future.';
                      }
                      return null;
                    },
                    onChanged: (date) {
                      setState(() => _details.dateOfCompletion = date);
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
