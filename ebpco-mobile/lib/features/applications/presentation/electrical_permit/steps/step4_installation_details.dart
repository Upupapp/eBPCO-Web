import 'package:flutter/material.dart';

import '../../../../../core/models/electrical_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/alerts/app_alert.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_dropdown.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';

String? _nonNegativeWholeNumberError(String? value, String fieldLabel) {
  if (value == null || value.trim().isEmpty) return null;
  final parsed = int.tryParse(value.trim());
  if (parsed == null) return 'Enter a whole number.';
  if (parsed < 0) return '$fieldLabel cannot be negative.';
  return null;
}

String? _nonNegativeDecimalError(String? value, String fieldLabel) {
  if (value == null || value.trim().isEmpty) return null;
  final parsed = double.tryParse(value.trim());
  if (parsed == null) return 'Enter a valid number.';
  if (parsed < 0) return '$fieldLabel cannot be negative.';
  return null;
}

String? _requiredPositiveDecimalError(String? value, String fieldLabel) {
  if (value == null || value.trim().isEmpty) {
    return '$fieldLabel is required.';
  }
  final parsed = double.tryParse(value.trim());
  if (parsed == null) return 'Enter a valid number.';
  if (parsed <= 0) return '$fieldLabel must be greater than zero.';
  return null;
}

/// Step 4 — Occupancy, Outlets & Electrical Load. Every numeric field
/// uses safe `tryParse`-based validation, so a temporarily empty or
/// invalid entry never throws or renders `NaN`/`Infinity`. The 200A/230V
/// contractor threshold is computed live and cannot be bypassed by the
/// applicant.
class Step4InstallationDetails extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final ElectricalPermitDraft draft;
  final VoidCallback onChanged;

  const Step4InstallationDetails({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step4InstallationDetails> createState() =>
      _Step4InstallationDetailsState();
}

class _Step4InstallationDetailsState extends State<Step4InstallationDetails> {
  late final TextEditingController _occupancyOther;

  late final TextEditingController _lightingOutlets;
  late final TextEditingController _convenienceOutlets;
  late final TextEditingController _acOutlets;
  late final TextEditingController _cookingOutlets;
  late final TextEditingController _waterHeaterOutlets;
  late final TextEditingController _waterPumpOutlets;
  late final TextEditingController _toggleSwitches;
  late final TextEditingController _bellBuzzers;
  late final TextEditingController _pushButtons;
  late final TextEditingController _fireAlarmDetectors;
  late final TextEditingController _otherOutlets;
  late final TextEditingController _otherOutletDescription;

  late final TextEditingController _totalConnectedLoad;
  late final TextEditingController _transformerCapacity;
  late final TextEditingController _generatorCapacity;
  late final TextEditingController _upsCapacity;
  late final TextEditingController _mainServiceVoltage;
  late final TextEditingController _mainServiceCurrent;
  late final TextEditingController _numberOfPhases;
  late final TextEditingController _frequency;
  late final TextEditingController _powerFactor;

  ElectricalInstallationDetails get _details => widget.draft.installationDetails;

  @override
  void initState() {
    super.initState();
    _occupancyOther = TextEditingController(
      text: _details.occupancyOtherDescription,
    );
    _lightingOutlets = TextEditingController(text: _details.lightingOutlets);
    _convenienceOutlets = TextEditingController(
      text: _details.convenienceOutlets,
    );
    _acOutlets = TextEditingController(
      text: _details.specialPurposeAirConditioningOutlets,
    );
    _cookingOutlets = TextEditingController(
      text: _details.specialPurposeCookingUnitOutlets,
    );
    _waterHeaterOutlets = TextEditingController(
      text: _details.specialPurposeWaterHeaterOutlets,
    );
    _waterPumpOutlets = TextEditingController(
      text: _details.specialPurposeWaterPumpOutlets,
    );
    _toggleSwitches = TextEditingController(text: _details.toggleSwitches);
    _bellBuzzers = TextEditingController(text: _details.bellBuzzers);
    _pushButtons = TextEditingController(text: _details.pushButtons);
    _fireAlarmDetectors = TextEditingController(
      text: _details.fireAlarmDetectors,
    );
    _otherOutlets = TextEditingController(text: _details.otherOutlets);
    _otherOutletDescription = TextEditingController(
      text: _details.otherOutletDescription,
    );

    _totalConnectedLoad = TextEditingController(
      text: _details.totalConnectedLoadKva,
    );
    _transformerCapacity = TextEditingController(
      text: _details.totalTransformerCapacityKva,
    );
    _generatorCapacity = TextEditingController(
      text: _details.generatorCapacityKva,
    );
    _upsCapacity = TextEditingController(text: _details.upsCapacityKva);
    _mainServiceVoltage = TextEditingController(
      text: _details.mainServiceVoltage,
    );
    _mainServiceCurrent = TextEditingController(
      text: _details.mainServiceCurrentAmperes,
    );
    _numberOfPhases = TextEditingController(text: _details.numberOfPhases);
    _frequency = TextEditingController(text: _details.frequency);
    _powerFactor = TextEditingController(text: _details.powerFactor);
  }

  @override
  void dispose() {
    _occupancyOther.dispose();
    _lightingOutlets.dispose();
    _convenienceOutlets.dispose();
    _acOutlets.dispose();
    _cookingOutlets.dispose();
    _waterHeaterOutlets.dispose();
    _waterPumpOutlets.dispose();
    _toggleSwitches.dispose();
    _bellBuzzers.dispose();
    _pushButtons.dispose();
    _fireAlarmDetectors.dispose();
    _otherOutlets.dispose();
    _otherOutletDescription.dispose();
    _totalConnectedLoad.dispose();
    _transformerCapacity.dispose();
    _generatorCapacity.dispose();
    _upsCapacity.dispose();
    _mainServiceVoltage.dispose();
    _mainServiceCurrent.dispose();
    _numberOfPhases.dispose();
    _frequency.dispose();
    _powerFactor.dispose();
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
            Text('Type of Occupancy or Use', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppDropdown<ElectricalOccupancyGroup>(
                    value: _details.occupancyGroup,
                    label: 'Use or Character of Occupancy *',
                    items: ElectricalOccupancyGroup.values
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
                  if (_details.occupancyGroup ==
                      ElectricalOccupancyGroup.others) ...[
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
            Text('Number of Outlets', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Leave any outlet type blank if there are none.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _lightingOutlets,
                    label: 'Lighting Outlets',
                    keyboardType: TextInputType.number,
                    validator: (v) =>
                        _nonNegativeWholeNumberError(v, 'Lighting outlets'),
                    onChanged: (v) {
                      _details.lightingOutlets = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _convenienceOutlets,
                    label: 'Convenience / Receptacle Outlets',
                    keyboardType: TextInputType.number,
                    validator: (v) => _nonNegativeWholeNumberError(
                      v,
                      'Convenience outlets',
                    ),
                    onChanged: (v) {
                      _details.convenienceOutlets = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _acOutlets,
                    label: 'Special-Purpose Air-Conditioning Outlets',
                    keyboardType: TextInputType.number,
                    validator: (v) =>
                        _nonNegativeWholeNumberError(v, 'Air-conditioning outlets'),
                    onChanged: (v) {
                      _details.specialPurposeAirConditioningOutlets = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _cookingOutlets,
                    label: 'Special-Purpose Cooking Unit Outlets',
                    keyboardType: TextInputType.number,
                    validator: (v) =>
                        _nonNegativeWholeNumberError(v, 'Cooking unit outlets'),
                    onChanged: (v) {
                      _details.specialPurposeCookingUnitOutlets = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _waterHeaterOutlets,
                    label: 'Special-Purpose Water Heater Outlets',
                    keyboardType: TextInputType.number,
                    validator: (v) =>
                        _nonNegativeWholeNumberError(v, 'Water heater outlets'),
                    onChanged: (v) {
                      _details.specialPurposeWaterHeaterOutlets = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _waterPumpOutlets,
                    label: 'Special-Purpose Water Pump Outlets',
                    keyboardType: TextInputType.number,
                    validator: (v) =>
                        _nonNegativeWholeNumberError(v, 'Water pump outlets'),
                    onChanged: (v) {
                      _details.specialPurposeWaterPumpOutlets = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _toggleSwitches,
                    label: 'Toggle Switches',
                    keyboardType: TextInputType.number,
                    validator: (v) =>
                        _nonNegativeWholeNumberError(v, 'Toggle switches'),
                    onChanged: (v) {
                      _details.toggleSwitches = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _bellBuzzers,
                    label: 'Bell / Buzzers',
                    keyboardType: TextInputType.number,
                    validator: (v) => _nonNegativeWholeNumberError(v, 'Bell / buzzers'),
                    onChanged: (v) {
                      _details.bellBuzzers = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _pushButtons,
                    label: 'Push Buttons',
                    keyboardType: TextInputType.number,
                    validator: (v) => _nonNegativeWholeNumberError(v, 'Push buttons'),
                    onChanged: (v) {
                      _details.pushButtons = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _fireAlarmDetectors,
                    label: 'Fire Alarm Detectors',
                    keyboardType: TextInputType.number,
                    validator: (v) =>
                        _nonNegativeWholeNumberError(v, 'Fire alarm detectors'),
                    onChanged: (v) {
                      setState(() => _details.fireAlarmDetectors = v);
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _otherOutlets,
                    label: 'Other Outlets',
                    keyboardType: TextInputType.number,
                    validator: (v) => _nonNegativeWholeNumberError(v, 'Other outlets'),
                    onChanged: (v) {
                      setState(() => _details.otherOutlets = v);
                      widget.onChanged();
                    },
                  ),
                  if (_details.hasOtherOutlets) ...[
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _otherOutletDescription,
                      label: 'Other Outlet Description *',
                      validator: (v) => Validators.required(
                        v,
                        fieldLabel: 'Other outlet description',
                      ),
                      onChanged: (v) {
                        _details.otherOutletDescription = v;
                        widget.onChanged();
                      },
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text(
              'Electrical Load and Capacity Summary',
              style: AppTypography.cardTitle,
            ),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _totalConnectedLoad,
                    label: 'Total Connected Load (kVA) *',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    validator: (v) =>
                        _requiredPositiveDecimalError(v, 'Total Connected Load'),
                    onChanged: (v) {
                      _details.totalConnectedLoadKva = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _transformerCapacity,
                    label: 'Total Transformer Capacity (kVA)',
                    hint: 'Optional',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    validator: (v) => _nonNegativeDecimalError(
                      v,
                      'Total Transformer Capacity',
                    ),
                    onChanged: (v) {
                      _details.totalTransformerCapacityKva = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _generatorCapacity,
                    label: 'Generator Capacity (kVA)',
                    hint: 'Optional',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    validator: (v) =>
                        _nonNegativeDecimalError(v, 'Generator Capacity'),
                    onChanged: (v) {
                      setState(() => _details.generatorCapacityKva = v);
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _upsCapacity,
                    label: 'UPS Capacity (kVA)',
                    hint: 'Optional',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    validator: (v) => _nonNegativeDecimalError(v, 'UPS Capacity'),
                    onChanged: (v) {
                      setState(() => _details.upsCapacityKva = v);
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _mainServiceVoltage,
                    label: 'Main Service Voltage (V) *',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    validator: (v) =>
                        _requiredPositiveDecimalError(v, 'Main Service Voltage'),
                    onChanged: (v) {
                      setState(() => _details.mainServiceVoltage = v);
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _mainServiceCurrent,
                    label: 'Main Service Current (A) *',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    validator: (v) =>
                        _requiredPositiveDecimalError(v, 'Main Service Current'),
                    onChanged: (v) {
                      setState(() => _details.mainServiceCurrentAmperes = v);
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _numberOfPhases,
                    label: 'Number of Phases *',
                    keyboardType: TextInputType.number,
                    validator: (v) => Validators.positiveWholeNumber(
                      v,
                      fieldLabel: 'Number of phases',
                    ),
                    onChanged: (v) {
                      _details.numberOfPhases = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _frequency,
                    label: 'Frequency *',
                    hint: 'e.g. 60 Hz',
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'Frequency'),
                    onChanged: (v) {
                      _details.frequency = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _powerFactor,
                    label: 'Power Factor',
                    hint: 'Optional',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    validator: (v) => _nonNegativeDecimalError(v, 'Power Factor'),
                    onChanged: (v) {
                      _details.powerFactor = v;
                      widget.onChanged();
                    },
                  ),
                ],
              ),
            ),

            if (_details.requiresElectricalContractor) ...[
              const SizedBox(height: AppSpacing.xl),
              const AppAlert(
                variant: AppAlertVariant.warning,
                message:
                    'A PCAB-licensed specialty electrical contractor is '
                    'required for this installation.',
              ),
            ],
          ],
        ),
      ),
    );
  }
}
