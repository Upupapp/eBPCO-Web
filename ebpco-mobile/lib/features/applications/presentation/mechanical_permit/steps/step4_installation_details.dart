import 'package:flutter/material.dart';

import '../../../../../core/models/mechanical_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/chips/app_chip.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_dropdown.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';
import '../../building_permit/widgets/date_picker_field.dart';

String? _positiveDecimalError(String? value, String fieldLabel) {
  if (value == null || value.trim().isEmpty) {
    return '$fieldLabel is required.';
  }
  final parsed = double.tryParse(value.trim());
  if (parsed == null) return 'Enter a valid number.';
  if (parsed <= 0) return '$fieldLabel must be greater than zero.';
  return null;
}

String? _nonNegativeDecimalError(String? value, String fieldLabel) {
  if (value == null || value.trim().isEmpty) {
    return '$fieldLabel is required.';
  }
  final parsed = double.tryParse(value.trim());
  if (parsed == null) return 'Enter a valid number.';
  if (parsed < 0) return '$fieldLabel cannot be negative.';
  return null;
}

/// Step 4 — Mechanical Installation Details: the selected equipment
/// types, general project fields, and the technical fields conditionally
/// required by each selected equipment group. Every numeric field uses
/// safe `tryParse`-based validation, so a temporarily empty or invalid
/// entry never throws or renders `NaN`/`Infinity`. Equipment types that
/// share a single official field group (e.g. the three air-conditioning
/// types, or the seven vertical-transport types) are grouped into one
/// conditional detail card, matching the official form's own grouping.
class Step4InstallationDetails extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final MechanicalPermitDraft draft;
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
  final List<TextEditingController> _controllers = [];

  TextEditingController _bind(String initial) {
    final controller = TextEditingController(text: initial);
    _controllers.add(controller);
    return controller;
  }

  MechanicalInstallationDetails get _details => widget.draft.installationDetails;

  late final TextEditingController _otherEquipment;
  late final TextEditingController _totalCost;
  late final TextEditingController _existingSystemDescription;
  late final TextEditingController _proposedSystemDescription;
  late final TextEditingController _intendedUse;
  late final TextEditingController _equipmentLocation;
  late final TextEditingController _numberOfEquipmentUnits;

  late final TextEditingController _fsNumberOfSprinklerHeads;
  late final TextEditingController _fsDesignCoverageArea;
  late final TextEditingController _fsWaterSource;
  late final TextEditingController _fsPumpCapacity;
  late final TextEditingController _fsSystemType;

  late final TextEditingController _boilerType;
  late final TextEditingController _boilerRatedCapacity;
  late final TextEditingController _boilerOperatingPressure;
  late final TextEditingController _boilerFuelType;
  late final TextEditingController _boilerNumberOfUnits;

  late final TextEditingController _pvVesselType;
  late final TextEditingController _pvVolumeOrCapacity;
  late final TextEditingController _pvMaxAllowableWorkingPressure;
  late final TextEditingController _pvOperatingTemperature;
  late final TextEditingController _pvNumberOfUnits;

  late final TextEditingController _iceEngineType;
  late final TextEditingController _iceRatedPower;
  late final TextEditingController _iceFuelType;
  late final TextEditingController _iceNumberOfUnits;
  late final TextEditingController _iceIntendedUse;

  late final TextEditingController _refrigSystemType;
  late final TextEditingController _refrigRefrigerantType;
  late final TextEditingController _refrigCoolingCapacity;
  late final TextEditingController _refrigStorageVolume;
  late final TextEditingController _refrigNumberOfUnits;

  late final TextEditingController _acType;
  late final TextEditingController _acNumberOfUnits;
  late final TextEditingController _acCoolingCapacityPerUnit;
  late final TextEditingController _acTotalCoolingCapacity;
  late final TextEditingController _acRefrigerantType;
  late final TextEditingController _acServedArea;

  late final TextEditingController _ventType;
  late final TextEditingController _ventAirflowCapacity;
  late final TextEditingController _ventNumberOfFans;
  late final TextEditingController _ventServedArea;
  late final TextEditingController _ventExhaustLocation;

  late final TextEditingController _pipingPipeMaterial;
  late final TextEditingController _pipingDesignPressure;
  late final TextEditingController _pipingPipeDiameter;
  late final TextEditingController _pipingApproximateLength;

  late final TextEditingController _elevEquipmentType;
  late final TextEditingController _elevRatedCapacity;
  late final TextEditingController _elevRatedSpeed;
  late final TextEditingController _elevNumberOfStops;
  late final TextEditingController _elevTravelDistance;
  late final TextEditingController _elevNumberOfUnits;
  late final TextEditingController _elevManufacturer;

  late final TextEditingController _pumpsType;
  late final TextEditingController _pumpsCapacity;
  late final TextEditingController _pumpsTotalHead;
  late final TextEditingController _pumpsMotorRating;
  late final TextEditingController _pumpsNumberOfUnits;

  late final TextEditingController _pwhHeaterType;
  late final TextEditingController _pwhTankCapacity;
  late final TextEditingController _pwhPressureRating;
  late final TextEditingController _pwhHeatingCapacity;
  late final TextEditingController _pwhNumberOfUnits;

  late final TextEditingController _cavSystemType;
  late final TextEditingController _cavOperatingPressure;
  late final TextEditingController _cavCapacity;
  late final TextEditingController _cavNumberOfEquipmentUnits;
  late final TextEditingController _cavServedArea;

  late final TextEditingController _gasType;
  late final TextEditingController _gasStorageCapacity;
  late final TextEditingController _gasOperatingPressure;
  late final TextEditingController _gasServedArea;
  late final TextEditingController _gasSafetyControlDescription;

  late final TextEditingController _convSystemType;
  late final TextEditingController _convRatedCapacity;
  late final TextEditingController _convTravelLength;
  late final TextEditingController _convSpeed;
  late final TextEditingController _convNumberOfStations;

  @override
  void initState() {
    super.initState();
    _otherEquipment = _bind(_details.otherEquipmentDescription);
    _totalCost = _bind(_details.totalEstimatedProjectCost);
    _existingSystemDescription = _bind(_details.existingSystemDescription);
    _proposedSystemDescription = _bind(_details.proposedSystemDescription);
    _intendedUse = _bind(_details.intendedUse);
    _equipmentLocation = _bind(_details.equipmentLocation);
    _numberOfEquipmentUnits = _bind(_details.numberOfEquipmentUnits);

    _fsNumberOfSprinklerHeads = _bind(_details.fsNumberOfSprinklerHeads);
    _fsDesignCoverageArea = _bind(_details.fsDesignCoverageArea);
    _fsWaterSource = _bind(_details.fsWaterSource);
    _fsPumpCapacity = _bind(_details.fsPumpCapacity);
    _fsSystemType = _bind(_details.fsSystemType);

    _boilerType = _bind(_details.boilerType);
    _boilerRatedCapacity = _bind(_details.boilerRatedCapacity);
    _boilerOperatingPressure = _bind(_details.boilerOperatingPressure);
    _boilerFuelType = _bind(_details.boilerFuelType);
    _boilerNumberOfUnits = _bind(_details.boilerNumberOfUnits);

    _pvVesselType = _bind(_details.pvVesselType);
    _pvVolumeOrCapacity = _bind(_details.pvVolumeOrCapacity);
    _pvMaxAllowableWorkingPressure = _bind(_details.pvMaxAllowableWorkingPressure);
    _pvOperatingTemperature = _bind(_details.pvOperatingTemperature);
    _pvNumberOfUnits = _bind(_details.pvNumberOfUnits);

    _iceEngineType = _bind(_details.iceEngineType);
    _iceRatedPower = _bind(_details.iceRatedPower);
    _iceFuelType = _bind(_details.iceFuelType);
    _iceNumberOfUnits = _bind(_details.iceNumberOfUnits);
    _iceIntendedUse = _bind(_details.iceIntendedUse);

    _refrigSystemType = _bind(_details.refrigSystemType);
    _refrigRefrigerantType = _bind(_details.refrigRefrigerantType);
    _refrigCoolingCapacity = _bind(_details.refrigCoolingCapacity);
    _refrigStorageVolume = _bind(_details.refrigStorageVolume);
    _refrigNumberOfUnits = _bind(_details.refrigNumberOfUnits);

    _acType = _bind(_details.acType);
    _acNumberOfUnits = _bind(_details.acNumberOfUnits);
    _acCoolingCapacityPerUnit = _bind(_details.acCoolingCapacityPerUnit);
    _acTotalCoolingCapacity = _bind(_details.acTotalCoolingCapacity);
    _acRefrigerantType = _bind(_details.acRefrigerantType);
    _acServedArea = _bind(_details.acServedArea);

    _ventType = _bind(_details.ventType);
    _ventAirflowCapacity = _bind(_details.ventAirflowCapacity);
    _ventNumberOfFans = _bind(_details.ventNumberOfFans);
    _ventServedArea = _bind(_details.ventServedArea);
    _ventExhaustLocation = _bind(_details.ventExhaustLocation);

    _pipingPipeMaterial = _bind(_details.pipingPipeMaterial);
    _pipingDesignPressure = _bind(_details.pipingDesignPressure);
    _pipingPipeDiameter = _bind(_details.pipingPipeDiameter);
    _pipingApproximateLength = _bind(_details.pipingApproximateLength);

    _elevEquipmentType = _bind(_details.elevEquipmentType);
    _elevRatedCapacity = _bind(_details.elevRatedCapacity);
    _elevRatedSpeed = _bind(_details.elevRatedSpeed);
    _elevNumberOfStops = _bind(_details.elevNumberOfStops);
    _elevTravelDistance = _bind(_details.elevTravelDistance);
    _elevNumberOfUnits = _bind(_details.elevNumberOfUnits);
    _elevManufacturer = _bind(_details.elevManufacturer);

    _pumpsType = _bind(_details.pumpsType);
    _pumpsCapacity = _bind(_details.pumpsCapacity);
    _pumpsTotalHead = _bind(_details.pumpsTotalHead);
    _pumpsMotorRating = _bind(_details.pumpsMotorRating);
    _pumpsNumberOfUnits = _bind(_details.pumpsNumberOfUnits);

    _pwhHeaterType = _bind(_details.pwhHeaterType);
    _pwhTankCapacity = _bind(_details.pwhTankCapacity);
    _pwhPressureRating = _bind(_details.pwhPressureRating);
    _pwhHeatingCapacity = _bind(_details.pwhHeatingCapacity);
    _pwhNumberOfUnits = _bind(_details.pwhNumberOfUnits);

    _cavSystemType = _bind(_details.cavSystemType);
    _cavOperatingPressure = _bind(_details.cavOperatingPressure);
    _cavCapacity = _bind(_details.cavCapacity);
    _cavNumberOfEquipmentUnits = _bind(_details.cavNumberOfEquipmentUnits);
    _cavServedArea = _bind(_details.cavServedArea);

    _gasType = _bind(_details.gasType);
    _gasStorageCapacity = _bind(_details.gasStorageCapacity);
    _gasOperatingPressure = _bind(_details.gasOperatingPressure);
    _gasServedArea = _bind(_details.gasServedArea);
    _gasSafetyControlDescription = _bind(_details.gasSafetyControlDescription);

    _convSystemType = _bind(_details.convSystemType);
    _convRatedCapacity = _bind(_details.convRatedCapacity);
    _convTravelLength = _bind(_details.convTravelLength);
    _convSpeed = _bind(_details.convSpeed);
    _convNumberOfStations = _bind(_details.convNumberOfStations);
  }

  @override
  void dispose() {
    for (final controller in _controllers) {
      controller.dispose();
    }
    super.dispose();
  }

  void _toggleEquipment(MechanicalEquipmentType type, bool selected) {
    setState(() {
      if (selected) {
        _details.selectedEquipment.add(type);
      } else {
        _details.selectedEquipment.remove(type);
      }
    });
    widget.onChanged();
  }

  Widget _text(
    TextEditingController controller,
    String label, {
    String? hint,
    int maxLines = 1,
    TextInputType keyboardType = TextInputType.text,
    String? Function(String?)? validator,
    required void Function(String) onSave,
  }) {
    return AppTextField(
      controller: controller,
      label: label,
      hint: hint,
      maxLines: maxLines,
      keyboardType: keyboardType,
      validator: validator,
      onChanged: (v) {
        onSave(v);
        widget.onChanged();
      },
    );
  }

  Widget _group(List<Widget> fields) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          for (var i = 0; i < fields.length; i++) ...[
            fields[i],
            if (i != fields.length - 1) const SizedBox(height: AppSpacing.md),
          ],
        ],
      ),
    );
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
            Text('Mechanical Installation Types', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Select every mechanical system or equipment type included '
              'in this project.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: [
                for (final type in MechanicalEquipmentType.values)
                  AppChip(
                    label: type.label,
                    selected: _details.selectedEquipment.contains(type),
                    onSelected: (selected) => _toggleEquipment(type, selected),
                  ),
              ],
            ),
            if (_details.selectedEquipment.contains(MechanicalEquipmentType.others)) ...[
              const SizedBox(height: AppSpacing.md),
              _text(
                _otherEquipment,
                'Specify Other Installation Type *',
                validator: (v) =>
                    Validators.required(v, fieldLabel: 'Installation type'),
                onSave: (v) => _details.otherEquipmentDescription = v,
              ),
            ],

            const SizedBox(height: AppSpacing.xl),
            Text('General Project Details', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _text(
                    _totalCost,
                    'Total Estimated Project Cost (₱) *',
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    validator: (v) =>
                        _nonNegativeDecimalError(v, 'Total Estimated Project Cost'),
                    onSave: (v) => _details.totalEstimatedProjectCost = v,
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'Proposed Starting Date *',
                    value: _details.proposedStartDate,
                    validator: (v) =>
                        v == null ? 'Please select a starting date.' : null,
                    onChanged: (v) {
                      setState(() => _details.proposedStartDate = v);
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'Expected Completion Date *',
                    value: _details.expectedCompletionDate,
                    validator: (v) {
                      if (v == null) return 'Please select a completion date.';
                      final start = _details.proposedStartDate;
                      if (start != null && v.isBefore(start)) {
                        return 'Completion date cannot be before the start date.';
                      }
                      return null;
                    },
                    onChanged: (v) {
                      setState(() => _details.expectedCompletionDate = v);
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  _text(
                    _existingSystemDescription,
                    'Existing System Description *',
                    maxLines: 3,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Existing system description',
                    ),
                    onSave: (v) => _details.existingSystemDescription = v,
                  ),
                  const SizedBox(height: AppSpacing.md),
                  _text(
                    _proposedSystemDescription,
                    'Proposed System Description *',
                    maxLines: 3,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Proposed system description',
                    ),
                    onSave: (v) => _details.proposedSystemDescription = v,
                  ),
                  const SizedBox(height: AppSpacing.md),
                  _text(
                    _intendedUse,
                    'Intended Use *',
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'Intended use'),
                    onSave: (v) => _details.intendedUse = v,
                  ),
                  const SizedBox(height: AppSpacing.md),
                  _text(
                    _equipmentLocation,
                    'Equipment Location *',
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'Equipment location'),
                    onSave: (v) => _details.equipmentLocation = v,
                  ),
                  const SizedBox(height: AppSpacing.md),
                  _text(
                    _numberOfEquipmentUnits,
                    'Number of Equipment Units *',
                    keyboardType: TextInputType.number,
                    validator: (v) => Validators.positiveWholeNumber(
                      v,
                      fieldLabel: 'Number of equipment units',
                    ),
                    onSave: (v) => _details.numberOfEquipmentUnits = v,
                  ),
                ],
              ),
            ),

            if (_details.hasFireSprinkler) ...[
              const SizedBox(height: AppSpacing.xl),
              Text('Automatic Fire Sprinkler System Details', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.sm),
              _group([
                _text(
                  _fsNumberOfSprinklerHeads,
                  'Number of Sprinkler Heads *',
                  keyboardType: TextInputType.number,
                  validator: (v) => Validators.positiveWholeNumber(
                    v,
                    fieldLabel: 'Number of sprinkler heads',
                  ),
                  onSave: (v) => _details.fsNumberOfSprinklerHeads = v,
                ),
                _text(
                  _fsDesignCoverageArea,
                  'Design Coverage Area (sq. m.) *',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) => _positiveDecimalError(v, 'Design Coverage Area'),
                  onSave: (v) => _details.fsDesignCoverageArea = v,
                ),
                _text(
                  _fsWaterSource,
                  'Water Source *',
                  validator: (v) => Validators.required(v, fieldLabel: 'Water source'),
                  onSave: (v) => _details.fsWaterSource = v,
                ),
                _text(
                  _fsPumpCapacity,
                  'Pump Capacity (GPM) *',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) => _positiveDecimalError(v, 'Pump Capacity'),
                  onSave: (v) => _details.fsPumpCapacity = v,
                ),
                _text(
                  _fsSystemType,
                  'System Type *',
                  validator: (v) => Validators.required(v, fieldLabel: 'System type'),
                  onSave: (v) => _details.fsSystemType = v,
                ),
              ]),
            ],

            if (_details.hasBoiler) ...[
              const SizedBox(height: AppSpacing.xl),
              Text('Boiler Details', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.sm),
              _group([
                _text(
                  _boilerType,
                  'Boiler Type *',
                  validator: (v) => Validators.required(v, fieldLabel: 'Boiler type'),
                  onSave: (v) => _details.boilerType = v,
                ),
                _text(
                  _boilerRatedCapacity,
                  'Rated Capacity (BHP) *',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) => _positiveDecimalError(v, 'Rated Capacity'),
                  onSave: (v) => _details.boilerRatedCapacity = v,
                ),
                _text(
                  _boilerOperatingPressure,
                  'Operating Pressure (psi) *',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) => _positiveDecimalError(v, 'Operating Pressure'),
                  onSave: (v) => _details.boilerOperatingPressure = v,
                ),
                _text(
                  _boilerFuelType,
                  'Fuel Type *',
                  validator: (v) => Validators.required(v, fieldLabel: 'Fuel type'),
                  onSave: (v) => _details.boilerFuelType = v,
                ),
                _text(
                  _boilerNumberOfUnits,
                  'Number of Units *',
                  keyboardType: TextInputType.number,
                  validator: (v) =>
                      Validators.positiveWholeNumber(v, fieldLabel: 'Number of units'),
                  onSave: (v) => _details.boilerNumberOfUnits = v,
                ),
              ]),
            ],

            if (_details.hasPressureVessel) ...[
              const SizedBox(height: AppSpacing.xl),
              Text('Pressure Vessel Details', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.sm),
              _group([
                _text(
                  _pvVesselType,
                  'Vessel Type *',
                  validator: (v) => Validators.required(v, fieldLabel: 'Vessel type'),
                  onSave: (v) => _details.pvVesselType = v,
                ),
                _text(
                  _pvVolumeOrCapacity,
                  'Volume or Capacity *',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) => _positiveDecimalError(v, 'Volume or Capacity'),
                  onSave: (v) => _details.pvVolumeOrCapacity = v,
                ),
                _text(
                  _pvMaxAllowableWorkingPressure,
                  'Maximum Allowable Working Pressure (psi) *',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) => _positiveDecimalError(
                    v,
                    'Maximum Allowable Working Pressure',
                  ),
                  onSave: (v) => _details.pvMaxAllowableWorkingPressure = v,
                ),
                _text(
                  _pvOperatingTemperature,
                  'Operating Temperature (°C) *',
                  keyboardType: const TextInputType.numberWithOptions(
                    decimal: true,
                    signed: true,
                  ),
                  validator: (v) => _nonNegativeDecimalError(v, 'Operating Temperature'),
                  onSave: (v) => _details.pvOperatingTemperature = v,
                ),
                _text(
                  _pvNumberOfUnits,
                  'Number of Units *',
                  keyboardType: TextInputType.number,
                  validator: (v) =>
                      Validators.positiveWholeNumber(v, fieldLabel: 'Number of units'),
                  onSave: (v) => _details.pvNumberOfUnits = v,
                ),
              ]),
            ],

            if (_details.hasInternalCombustionEngine) ...[
              const SizedBox(height: AppSpacing.xl),
              Text('Internal Combustion Engine Details', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.sm),
              _group([
                _text(
                  _iceEngineType,
                  'Engine Type *',
                  validator: (v) => Validators.required(v, fieldLabel: 'Engine type'),
                  onSave: (v) => _details.iceEngineType = v,
                ),
                _text(
                  _iceRatedPower,
                  'Rated Power (HP) *',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) => _positiveDecimalError(v, 'Rated Power'),
                  onSave: (v) => _details.iceRatedPower = v,
                ),
                _text(
                  _iceFuelType,
                  'Fuel Type *',
                  validator: (v) => Validators.required(v, fieldLabel: 'Fuel type'),
                  onSave: (v) => _details.iceFuelType = v,
                ),
                _text(
                  _iceNumberOfUnits,
                  'Number of Units *',
                  keyboardType: TextInputType.number,
                  validator: (v) =>
                      Validators.positiveWholeNumber(v, fieldLabel: 'Number of units'),
                  onSave: (v) => _details.iceNumberOfUnits = v,
                ),
                _text(
                  _iceIntendedUse,
                  'Intended Use *',
                  validator: (v) => Validators.required(v, fieldLabel: 'Intended use'),
                  onSave: (v) => _details.iceIntendedUse = v,
                ),
              ]),
            ],

            if (_details.hasRefrigerationGroup) ...[
              const SizedBox(height: AppSpacing.xl),
              Text(
                'Refrigeration / Cold Storage / Ice Plant Details',
                style: AppTypography.cardTitle,
              ),
              const SizedBox(height: AppSpacing.sm),
              _group([
                _text(
                  _refrigSystemType,
                  'System Type *',
                  validator: (v) => Validators.required(v, fieldLabel: 'System type'),
                  onSave: (v) => _details.refrigSystemType = v,
                ),
                _text(
                  _refrigRefrigerantType,
                  'Refrigerant Type *',
                  validator: (v) =>
                      Validators.required(v, fieldLabel: 'Refrigerant type'),
                  onSave: (v) => _details.refrigRefrigerantType = v,
                ),
                _text(
                  _refrigCoolingCapacity,
                  'Cooling Capacity (TR) *',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) => _positiveDecimalError(v, 'Cooling Capacity'),
                  onSave: (v) => _details.refrigCoolingCapacity = v,
                ),
                _text(
                  _refrigStorageVolume,
                  'Storage Volume (cu. m.) *',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) => _positiveDecimalError(v, 'Storage Volume'),
                  onSave: (v) => _details.refrigStorageVolume = v,
                ),
                _text(
                  _refrigNumberOfUnits,
                  'Number of Units *',
                  keyboardType: TextInputType.number,
                  validator: (v) =>
                      Validators.positiveWholeNumber(v, fieldLabel: 'Number of units'),
                  onSave: (v) => _details.refrigNumberOfUnits = v,
                ),
              ]),
            ],

            if (_details.hasAirConditioningGroup) ...[
              const SizedBox(height: AppSpacing.xl),
              Text('Air-Conditioning Details', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.sm),
              _group([
                _text(
                  _acType,
                  'Air-Conditioning Type *',
                  validator: (v) =>
                      Validators.required(v, fieldLabel: 'Air-conditioning type'),
                  onSave: (v) => _details.acType = v,
                ),
                _text(
                  _acNumberOfUnits,
                  'Number of Units *',
                  keyboardType: TextInputType.number,
                  validator: (v) =>
                      Validators.positiveWholeNumber(v, fieldLabel: 'Number of units'),
                  onSave: (v) => _details.acNumberOfUnits = v,
                ),
                _text(
                  _acCoolingCapacityPerUnit,
                  'Cooling Capacity per Unit (TR) *',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) =>
                      _positiveDecimalError(v, 'Cooling Capacity per Unit'),
                  onSave: (v) => _details.acCoolingCapacityPerUnit = v,
                ),
                _text(
                  _acTotalCoolingCapacity,
                  'Total Cooling Capacity (TR) *',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) => _positiveDecimalError(v, 'Total Cooling Capacity'),
                  onSave: (v) => _details.acTotalCoolingCapacity = v,
                ),
                _text(
                  _acRefrigerantType,
                  'Refrigerant Type *',
                  validator: (v) =>
                      Validators.required(v, fieldLabel: 'Refrigerant type'),
                  onSave: (v) => _details.acRefrigerantType = v,
                ),
                _text(
                  _acServedArea,
                  'Served Area *',
                  validator: (v) => Validators.required(v, fieldLabel: 'Served area'),
                  onSave: (v) => _details.acServedArea = v,
                ),
              ]),
            ],

            if (_details.hasMechanicalVentilation) ...[
              const SizedBox(height: AppSpacing.xl),
              Text('Mechanical Ventilation Details', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.sm),
              _group([
                _text(
                  _ventType,
                  'Ventilation Type *',
                  validator: (v) =>
                      Validators.required(v, fieldLabel: 'Ventilation type'),
                  onSave: (v) => _details.ventType = v,
                ),
                _text(
                  _ventAirflowCapacity,
                  'Airflow Capacity (CFM) *',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) => _positiveDecimalError(v, 'Airflow Capacity'),
                  onSave: (v) => _details.ventAirflowCapacity = v,
                ),
                _text(
                  _ventNumberOfFans,
                  'Number of Fans *',
                  keyboardType: TextInputType.number,
                  validator: (v) =>
                      Validators.positiveWholeNumber(v, fieldLabel: 'Number of fans'),
                  onSave: (v) => _details.ventNumberOfFans = v,
                ),
                _text(
                  _ventServedArea,
                  'Served Area *',
                  validator: (v) => Validators.required(v, fieldLabel: 'Served area'),
                  onSave: (v) => _details.ventServedArea = v,
                ),
                _text(
                  _ventExhaustLocation,
                  'Exhaust Location *',
                  validator: (v) =>
                      Validators.required(v, fieldLabel: 'Exhaust location'),
                  onSave: (v) => _details.ventExhaustLocation = v,
                ),
              ]),
            ],

            if (_details.hasPowerPiping) ...[
              const SizedBox(height: AppSpacing.xl),
              Text('Power Piping Details', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.sm),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    AppDropdown<PowerPipingServiceType>(
                      value: _details.pipingServiceType,
                      label: 'Service Type *',
                      items: PowerPipingServiceType.values
                          .map((s) => DropdownMenuItem(value: s, child: Text(s.label)))
                          .toList(),
                      validator: (v) =>
                          v == null ? 'Please select a service type.' : null,
                      onChanged: (v) {
                        setState(() => _details.pipingServiceType = v);
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    _text(
                      _pipingPipeMaterial,
                      'Pipe Material *',
                      validator: (v) =>
                          Validators.required(v, fieldLabel: 'Pipe material'),
                      onSave: (v) => _details.pipingPipeMaterial = v,
                    ),
                    const SizedBox(height: AppSpacing.md),
                    _text(
                      _pipingDesignPressure,
                      'Design Pressure (psi) *',
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      validator: (v) => _positiveDecimalError(v, 'Design Pressure'),
                      onSave: (v) => _details.pipingDesignPressure = v,
                    ),
                    const SizedBox(height: AppSpacing.md),
                    _text(
                      _pipingPipeDiameter,
                      'Pipe Diameter (mm) *',
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      validator: (v) => _positiveDecimalError(v, 'Pipe Diameter'),
                      onSave: (v) => _details.pipingPipeDiameter = v,
                    ),
                    const SizedBox(height: AppSpacing.md),
                    _text(
                      _pipingApproximateLength,
                      'Approximate Pipe Length (m) *',
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      validator: (v) =>
                          _positiveDecimalError(v, 'Approximate Pipe Length'),
                      onSave: (v) => _details.pipingApproximateLength = v,
                    ),
                  ],
                ),
              ),
            ],

            if (_details.hasElevatorGroup) ...[
              const SizedBox(height: AppSpacing.xl),
              Text(
                'Elevator, Dumbwaiter, Escalator, Walkalator, Cable Car or Funicular Details',
                style: AppTypography.cardTitle,
              ),
              const SizedBox(height: AppSpacing.sm),
              _group([
                _text(
                  _elevEquipmentType,
                  'Equipment Type *',
                  validator: (v) =>
                      Validators.required(v, fieldLabel: 'Equipment type'),
                  onSave: (v) => _details.elevEquipmentType = v,
                ),
                _text(
                  _elevRatedCapacity,
                  'Rated Capacity (kg) *',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) => _positiveDecimalError(v, 'Rated Capacity'),
                  onSave: (v) => _details.elevRatedCapacity = v,
                ),
                _text(
                  _elevRatedSpeed,
                  'Rated Speed (m/s) *',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) => _positiveDecimalError(v, 'Rated Speed'),
                  onSave: (v) => _details.elevRatedSpeed = v,
                ),
                _text(
                  _elevNumberOfStops,
                  'Number of Stops *',
                  keyboardType: TextInputType.number,
                  validator: (v) =>
                      Validators.positiveWholeNumber(v, fieldLabel: 'Number of stops'),
                  onSave: (v) => _details.elevNumberOfStops = v,
                ),
                _text(
                  _elevTravelDistance,
                  'Travel Distance (m) *',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) => _positiveDecimalError(v, 'Travel Distance'),
                  onSave: (v) => _details.elevTravelDistance = v,
                ),
                _text(
                  _elevNumberOfUnits,
                  'Number of Units *',
                  keyboardType: TextInputType.number,
                  validator: (v) =>
                      Validators.positiveWholeNumber(v, fieldLabel: 'Number of units'),
                  onSave: (v) => _details.elevNumberOfUnits = v,
                ),
                _text(
                  _elevManufacturer,
                  'Manufacturer',
                  hint: 'Optional — when available',
                  onSave: (v) => _details.elevManufacturer = v,
                ),
              ]),
            ],

            if (_details.hasPumps) ...[
              const SizedBox(height: AppSpacing.xl),
              Text('Pump Details', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.sm),
              _group([
                _text(
                  _pumpsType,
                  'Pump Type *',
                  validator: (v) => Validators.required(v, fieldLabel: 'Pump type'),
                  onSave: (v) => _details.pumpsType = v,
                ),
                _text(
                  _pumpsCapacity,
                  'Pump Capacity (GPM) *',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) => _positiveDecimalError(v, 'Pump Capacity'),
                  onSave: (v) => _details.pumpsCapacity = v,
                ),
                _text(
                  _pumpsTotalHead,
                  'Total Head (m) *',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) => _positiveDecimalError(v, 'Total Head'),
                  onSave: (v) => _details.pumpsTotalHead = v,
                ),
                _text(
                  _pumpsMotorRating,
                  'Motor Rating (HP) *',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) => _positiveDecimalError(v, 'Motor Rating'),
                  onSave: (v) => _details.pumpsMotorRating = v,
                ),
                _text(
                  _pumpsNumberOfUnits,
                  'Number of Units *',
                  keyboardType: TextInputType.number,
                  validator: (v) =>
                      Validators.positiveWholeNumber(v, fieldLabel: 'Number of units'),
                  onSave: (v) => _details.pumpsNumberOfUnits = v,
                ),
              ]),
            ],

            if (_details.hasPressurizedWaterHeater) ...[
              const SizedBox(height: AppSpacing.xl),
              Text('Pressurized Water Heater Details', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.sm),
              _group([
                _text(
                  _pwhHeaterType,
                  'Heater Type *',
                  validator: (v) => Validators.required(v, fieldLabel: 'Heater type'),
                  onSave: (v) => _details.pwhHeaterType = v,
                ),
                _text(
                  _pwhTankCapacity,
                  'Tank Capacity (L) *',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) => _positiveDecimalError(v, 'Tank Capacity'),
                  onSave: (v) => _details.pwhTankCapacity = v,
                ),
                _text(
                  _pwhPressureRating,
                  'Pressure Rating (psi) *',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) => _positiveDecimalError(v, 'Pressure Rating'),
                  onSave: (v) => _details.pwhPressureRating = v,
                ),
                _text(
                  _pwhHeatingCapacity,
                  'Heating Capacity (kW) *',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) => _positiveDecimalError(v, 'Heating Capacity'),
                  onSave: (v) => _details.pwhHeatingCapacity = v,
                ),
                _text(
                  _pwhNumberOfUnits,
                  'Number of Units *',
                  keyboardType: TextInputType.number,
                  validator: (v) =>
                      Validators.positiveWholeNumber(v, fieldLabel: 'Number of units'),
                  onSave: (v) => _details.pwhNumberOfUnits = v,
                ),
              ]),
            ],

            if (_details.hasCompressedAirOrVacuumGroup) ...[
              const SizedBox(height: AppSpacing.xl),
              Text('Compressed Air or Vacuum System Details', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.sm),
              _group([
                _text(
                  _cavSystemType,
                  'System Type *',
                  validator: (v) => Validators.required(v, fieldLabel: 'System type'),
                  onSave: (v) => _details.cavSystemType = v,
                ),
                _text(
                  _cavOperatingPressure,
                  'Operating Pressure (psi) *',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) => _positiveDecimalError(v, 'Operating Pressure'),
                  onSave: (v) => _details.cavOperatingPressure = v,
                ),
                _text(
                  _cavCapacity,
                  'Capacity (CFM) *',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) => _positiveDecimalError(v, 'Capacity'),
                  onSave: (v) => _details.cavCapacity = v,
                ),
                _text(
                  _cavNumberOfEquipmentUnits,
                  'Number of Equipment Units *',
                  keyboardType: TextInputType.number,
                  validator: (v) => Validators.positiveWholeNumber(
                    v,
                    fieldLabel: 'Number of equipment units',
                  ),
                  onSave: (v) => _details.cavNumberOfEquipmentUnits = v,
                ),
                _text(
                  _cavServedArea,
                  'Served Area *',
                  validator: (v) => Validators.required(v, fieldLabel: 'Served area'),
                  onSave: (v) => _details.cavServedArea = v,
                ),
              ]),
            ],

            if (_details.hasGasGroup) ...[
              const SizedBox(height: AppSpacing.xl),
              Text('Institutional / Industrial Gas Details', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.sm),
              _group([
                _text(
                  _gasType,
                  'Gas Type *',
                  validator: (v) => Validators.required(v, fieldLabel: 'Gas type'),
                  onSave: (v) => _details.gasType = v,
                ),
                _text(
                  _gasStorageCapacity,
                  'Storage Capacity *',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) => _positiveDecimalError(v, 'Storage Capacity'),
                  onSave: (v) => _details.gasStorageCapacity = v,
                ),
                _text(
                  _gasOperatingPressure,
                  'Operating Pressure (psi) *',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) => _positiveDecimalError(v, 'Operating Pressure'),
                  onSave: (v) => _details.gasOperatingPressure = v,
                ),
                _text(
                  _gasServedArea,
                  'Served Area *',
                  validator: (v) => Validators.required(v, fieldLabel: 'Served area'),
                  onSave: (v) => _details.gasServedArea = v,
                ),
                _text(
                  _gasSafetyControlDescription,
                  'Safety-Control Description *',
                  maxLines: 2,
                  validator: (v) => Validators.required(
                    v,
                    fieldLabel: 'Safety-control description',
                  ),
                  onSave: (v) => _details.gasSafetyControlDescription = v,
                ),
              ]),
            ],

            if (_details.hasConveyorGroup) ...[
              const SizedBox(height: AppSpacing.xl),
              Text(
                'Pneumatic Tubes, Conveyors or Monorails Details',
                style: AppTypography.cardTitle,
              ),
              const SizedBox(height: AppSpacing.sm),
              _group([
                _text(
                  _convSystemType,
                  'System Type *',
                  validator: (v) => Validators.required(v, fieldLabel: 'System type'),
                  onSave: (v) => _details.convSystemType = v,
                ),
                _text(
                  _convRatedCapacity,
                  'Rated Capacity *',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) => _positiveDecimalError(v, 'Rated Capacity'),
                  onSave: (v) => _details.convRatedCapacity = v,
                ),
                _text(
                  _convTravelLength,
                  'Travel Length (m) *',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) => _positiveDecimalError(v, 'Travel Length'),
                  onSave: (v) => _details.convTravelLength = v,
                ),
                _text(
                  _convSpeed,
                  'Speed *',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) => _positiveDecimalError(v, 'Speed'),
                  onSave: (v) => _details.convSpeed = v,
                ),
                _text(
                  _convNumberOfStations,
                  'Number of Stations *',
                  keyboardType: TextInputType.number,
                  validator: (v) => Validators.positiveWholeNumber(
                    v,
                    fieldLabel: 'Number of stations',
                  ),
                  onSave: (v) => _details.convNumberOfStations = v,
                ),
              ]),
            ],
          ],
        ),
      ),
    );
  }
}
