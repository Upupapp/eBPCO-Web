import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/plumbing_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/cards/fixture_inventory_row.dart';
import '../../../../../shared/widgets/chips/app_chip.dart';
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

String? _positiveDecimalError(String? value, String fieldLabel) {
  if (value == null || value.trim().isEmpty) {
    return '$fieldLabel is required.';
  }
  final parsed = double.tryParse(value.trim());
  if (parsed == null) return 'Enter a valid number.';
  if (parsed <= 0) return '$fieldLabel must be greater than zero.';
  return null;
}

/// Step 4 — Plumbing Installation Details: the fixture inventory and the
/// four conditional plumbing-system detail groups (Water Distribution,
/// Sewage, Septic Tank, Storm Drainage). Every numeric field uses safe
/// `tryParse`-based validation, so a temporarily empty or invalid entry
/// never throws or renders `NaN`. Fixture rows are rendered by the shared
/// [FixtureInventoryRow] (also used by the Sanitary / Plumbing Permit),
/// which owns its own controllers — updating one fixture's quantity
/// never rebuilds or erases any other fixture's entry.
class Step4InstallationDetails extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final PlumbingPermitDraft draft;
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

  PlumbingInstallationDetails get _details => widget.draft.installationDetails;
  PlumbingWaterDistribution get _water => _details.waterDistribution;
  PlumbingSewageSystem get _sewage => _details.sewageSystem;
  PlumbingSepticTank get _septic => _details.septicTank;
  PlumbingStormDrainage get _storm => _details.stormDrainage;

  // Water distribution.
  late final TextEditingController _otherWaterSource;
  late final TextEditingController _waterServiceProvider;
  late final TextEditingController _mainPipeMaterial;
  late final TextEditingController _mainPipeDiameter;
  late final TextEditingController _waterMeterSize;
  late final TextEditingController _storageTankCapacity;
  late final TextEditingController _pumpCapacity;
  late final TextEditingController _distributionSystemDescription;
  late final TextEditingController _estimatedDemandOrFlowRate;

  // Sewage.
  late final TextEditingController _otherDisposalMethod;
  late final TextEditingController _receivingSewerOrDisposalPoint;
  late final TextEditingController _mainSewerPipeMaterial;
  late final TextEditingController _mainSewerPipeDiameter;
  late final TextEditingController _connectionReference;
  late final TextEditingController _sewageSystemDescription;
  late final TextEditingController _estimatedWastewaterFlow;

  // Septic tank.
  late final TextEditingController _tankType;
  late final TextEditingController _tankCapacity;
  late final TextEditingController _numberOfChambers;
  late final TextEditingController _tankDimensions;
  late final TextEditingController _tankMaterial;
  late final TextEditingController _effluentDisposalMethod;
  late final TextEditingController _locationDescription;
  late final TextEditingController _accessAndMaintenanceDescription;

  // Storm drainage.
  late final TextEditingController _otherDrainageType;
  late final TextEditingController _dischargePoint;
  late final TextEditingController _mainDrainPipeMaterial;
  late final TextEditingController _mainDrainPipeDiameter;
  late final TextEditingController _catchBasinCount;
  late final TextEditingController _roofDrainCount;
  late final TextEditingController _drainageSystemDescription;
  late final TextEditingController _applicableClearanceStatus;

  @override
  void initState() {
    super.initState();

    _otherWaterSource = _bind(_water.otherWaterSourceDescription);
    _waterServiceProvider = _bind(_water.waterServiceProvider);
    _mainPipeMaterial = _bind(_water.mainPipeMaterial);
    _mainPipeDiameter = _bind(_water.mainPipeDiameter);
    _waterMeterSize = _bind(_water.waterMeterSize);
    _storageTankCapacity = _bind(_water.storageTankCapacity);
    _pumpCapacity = _bind(_water.pumpCapacity);
    _distributionSystemDescription = _bind(
      _water.distributionSystemDescription,
    );
    _estimatedDemandOrFlowRate = _bind(_water.estimatedDemandOrFlowRate);

    _otherDisposalMethod = _bind(_sewage.otherDisposalMethodDescription);
    _receivingSewerOrDisposalPoint = _bind(
      _sewage.receivingSewerOrDisposalPoint,
    );
    _mainSewerPipeMaterial = _bind(_sewage.mainSewerPipeMaterial);
    _mainSewerPipeDiameter = _bind(_sewage.mainSewerPipeDiameter);
    _connectionReference = _bind(_sewage.connectionReference);
    _sewageSystemDescription = _bind(_sewage.sewageSystemDescription);
    _estimatedWastewaterFlow = _bind(_sewage.estimatedWastewaterFlow);

    _tankType = _bind(_septic.tankType);
    _tankCapacity = _bind(_septic.tankCapacity);
    _numberOfChambers = _bind(_septic.numberOfChambers);
    _tankDimensions = _bind(_septic.tankDimensions);
    _tankMaterial = _bind(_septic.tankMaterial);
    _effluentDisposalMethod = _bind(_septic.effluentDisposalMethod);
    _locationDescription = _bind(_septic.locationDescription);
    _accessAndMaintenanceDescription = _bind(
      _septic.accessAndMaintenanceDescription,
    );

    _otherDrainageType = _bind(_storm.otherDrainageTypeDescription);
    _dischargePoint = _bind(_storm.dischargePoint);
    _mainDrainPipeMaterial = _bind(_storm.mainDrainPipeMaterial);
    _mainDrainPipeDiameter = _bind(_storm.mainDrainPipeDiameter);
    _catchBasinCount = _bind(_storm.catchBasinCount);
    _roofDrainCount = _bind(_storm.roofDrainCount);
    _drainageSystemDescription = _bind(_storm.drainageSystemDescription);
    _applicableClearanceStatus = _bind(_storm.applicableClearanceStatus);
  }

  @override
  void dispose() {
    for (final controller in _controllers) {
      controller.dispose();
    }
    super.dispose();
  }

  void _toggleSystem(PlumbingSystemType type, bool selected) {
    setState(() {
      if (selected) {
        _details.selectedSystems.add(type);
      } else {
        _details.selectedSystems.remove(type);
      }
    });
    widget.onChanged();
  }

  Widget _text(
    TextEditingController controller,
    String label, {
    String? Function(String?)? validator,
    void Function(String)? onChanged,
    int maxLines = 1,
    TextInputType keyboardType = TextInputType.text,
    String? hint,
  }) {
    return AppTextField(
      controller: controller,
      label: label,
      hint: hint,
      maxLines: maxLines,
      keyboardType: keyboardType,
      validator: validator,
      onChanged: (v) {
        onChanged?.call(v);
        widget.onChanged();
      },
    );
  }

  Widget _group(String title, List<Widget> children) {
    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.md),
      child: AppCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(title, style: AppTypography.bodyStrong),
            const SizedBox(height: AppSpacing.md),
            for (final child in children) ...[
              child,
              if (child != children.last)
                const SizedBox(height: AppSpacing.md),
            ],
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final designMasterPlumberName =
        widget.draft.professionals.designMasterPlumber.fullName;

    return Form(
      key: widget.formKey,
      child: FormScrollScaffold(
        centerVertically: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Fixture Inventory', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Enter the new and existing quantities for every fixture '
              'that applies. Total Quantity is calculated automatically.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            for (final entry in _details.fixtureInventory.fixtures) ...[
              FixtureInventoryRow(
                label: entry.type.label,
                showCustomNameField: entry.type == PlumbingFixtureType.others,
                customName: entry.customName,
                onCustomNameChanged: (v) {
                  setState(() => entry.customName = v);
                  widget.onChanged();
                },
                newQuantity: entry.newQuantity,
                onNewQuantityChanged: (v) {
                  setState(() => entry.newQuantity = v);
                  widget.onChanged();
                },
                existingQuantity: entry.existingQuantity,
                onExistingQuantityChanged: (v) {
                  setState(() => entry.existingQuantity = v);
                  widget.onChanged();
                },
                totalQuantity: entry.totalQty,
                quantityValidator: (v) =>
                    _nonNegativeWholeNumberError(v, 'Quantity'),
              ),
              if (entry != _details.fixtureInventory.fixtures.last)
                const SizedBox(height: AppSpacing.sm),
            ],

            const SizedBox(height: AppSpacing.xl),
            Text('Plumbing Systems', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Select every plumbing system that applies.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: [
                for (final type in PlumbingSystemType.values)
                  AppChip(
                    label: type.label,
                    selected: _details.selectedSystems.contains(type),
                    onSelected: (selected) => _toggleSystem(type, selected),
                  ),
              ],
            ),

            if (_details.hasWaterDistribution)
              _group('Water Distribution System', [
                AppDropdown<WaterSourceType>(
                  value: _water.waterSource,
                  label: 'Water Source *',
                  items: WaterSourceType.values
                      .map(
                        (s) => DropdownMenuItem(value: s, child: Text(s.label)),
                      )
                      .toList(),
                  validator: (v) =>
                      v == null ? 'Please select a water source.' : null,
                  onChanged: (v) {
                    setState(() => _water.waterSource = v);
                    widget.onChanged();
                  },
                ),
                if (_water.waterSource == WaterSourceType.other)
                  _text(
                    _otherWaterSource,
                    'Specify Water Source *',
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'Water source'),
                    onChanged: (v) => _water.otherWaterSourceDescription = v,
                  ),
                _text(
                  _waterServiceProvider,
                  'Water Service Provider',
                  hint: 'Optional — when applicable',
                  onChanged: (v) => _water.waterServiceProvider = v,
                ),
                _text(
                  _mainPipeMaterial,
                  'Main Pipe Material *',
                  validator: (v) =>
                      Validators.required(v, fieldLabel: 'Main pipe material'),
                  onChanged: (v) => _water.mainPipeMaterial = v,
                ),
                _text(
                  _mainPipeDiameter,
                  'Main Pipe Diameter *',
                  keyboardType: TextInputType.number,
                  validator: (v) =>
                      _positiveDecimalError(v, 'Main pipe diameter'),
                  onChanged: (v) => _water.mainPipeDiameter = v,
                ),
                _text(
                  _waterMeterSize,
                  'Water Meter Size *',
                  validator: (v) =>
                      Validators.required(v, fieldLabel: 'Water meter size'),
                  onChanged: (v) => _water.waterMeterSize = v,
                ),
                _text(
                  _storageTankCapacity,
                  'Storage Tank Capacity',
                  hint: 'Optional — when applicable',
                  keyboardType: TextInputType.number,
                  onChanged: (v) => _water.storageTankCapacity = v,
                ),
                _text(
                  _pumpCapacity,
                  'Pump Capacity',
                  hint: 'Optional — when applicable',
                  keyboardType: TextInputType.number,
                  onChanged: (v) => _water.pumpCapacity = v,
                ),
                _text(
                  _distributionSystemDescription,
                  'Distribution-System Description *',
                  maxLines: 2,
                  validator: (v) => Validators.required(
                    v,
                    fieldLabel: 'Distribution-system description',
                  ),
                  onChanged: (v) => _water.distributionSystemDescription = v,
                ),
                _text(
                  _estimatedDemandOrFlowRate,
                  'Estimated Demand or Flow Rate *',
                  keyboardType: TextInputType.number,
                  validator: (v) => _positiveDecimalError(
                    v,
                    'Estimated demand or flow rate',
                  ),
                  onChanged: (v) => _water.estimatedDemandOrFlowRate = v,
                ),
              ]),

            if (_details.hasSewage)
              _group('Sewage System', [
                AppDropdown<SewageDisposalMethod>(
                  value: _sewage.disposalMethod,
                  label: 'Sewage Disposal Method *',
                  items: SewageDisposalMethod.values
                      .map(
                        (m) => DropdownMenuItem(value: m, child: Text(m.label)),
                      )
                      .toList(),
                  validator: (v) =>
                      v == null ? 'Please select a disposal method.' : null,
                  onChanged: (v) {
                    setState(() => _sewage.disposalMethod = v);
                    widget.onChanged();
                  },
                ),
                if (_sewage.disposalMethod == SewageDisposalMethod.other)
                  _text(
                    _otherDisposalMethod,
                    'Specify Disposal Method *',
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Disposal method',
                    ),
                    onChanged: (v) =>
                        _sewage.otherDisposalMethodDescription = v,
                  ),
                _text(
                  _receivingSewerOrDisposalPoint,
                  'Receiving Sewer or Disposal Point *',
                  validator: (v) => Validators.required(
                    v,
                    fieldLabel: 'Receiving sewer or disposal point',
                  ),
                  onChanged: (v) =>
                      _sewage.receivingSewerOrDisposalPoint = v,
                ),
                _text(
                  _mainSewerPipeMaterial,
                  'Main Sewer Pipe Material *',
                  validator: (v) => Validators.required(
                    v,
                    fieldLabel: 'Main sewer pipe material',
                  ),
                  onChanged: (v) => _sewage.mainSewerPipeMaterial = v,
                ),
                _text(
                  _mainSewerPipeDiameter,
                  'Main Sewer Pipe Diameter *',
                  keyboardType: TextInputType.number,
                  validator: (v) =>
                      _positiveDecimalError(v, 'Main sewer pipe diameter'),
                  onChanged: (v) => _sewage.mainSewerPipeDiameter = v,
                ),
                _text(
                  _connectionReference,
                  'Connection Reference',
                  hint: 'Optional — when available',
                  onChanged: (v) => _sewage.connectionReference = v,
                ),
                _text(
                  _sewageSystemDescription,
                  'Sewage-System Description *',
                  maxLines: 2,
                  validator: (v) => Validators.required(
                    v,
                    fieldLabel: 'Sewage-system description',
                  ),
                  onChanged: (v) => _sewage.sewageSystemDescription = v,
                ),
                _text(
                  _estimatedWastewaterFlow,
                  'Estimated Wastewater Flow *',
                  keyboardType: TextInputType.number,
                  validator: (v) =>
                      _positiveDecimalError(v, 'Estimated wastewater flow'),
                  onChanged: (v) => _sewage.estimatedWastewaterFlow = v,
                ),
              ]),

            if (_details.hasSepticTank)
              _group('Septic Tank', [
                _text(
                  _tankType,
                  'Septic Tank Type *',
                  validator: (v) =>
                      Validators.required(v, fieldLabel: 'Septic tank type'),
                  onChanged: (v) => _septic.tankType = v,
                ),
                _text(
                  _tankCapacity,
                  'Septic Tank Capacity *',
                  keyboardType: TextInputType.number,
                  validator: (v) =>
                      _positiveDecimalError(v, 'Septic tank capacity'),
                  onChanged: (v) => _septic.tankCapacity = v,
                ),
                _text(
                  _numberOfChambers,
                  'Number of Chambers *',
                  keyboardType: TextInputType.number,
                  validator: (v) => Validators.positiveWholeNumber(
                    v,
                    fieldLabel: 'Number of chambers',
                  ),
                  onChanged: (v) => _septic.numberOfChambers = v,
                ),
                _text(
                  _tankDimensions,
                  'Tank Dimensions *',
                  validator: (v) =>
                      Validators.required(v, fieldLabel: 'Tank dimensions'),
                  onChanged: (v) => _septic.tankDimensions = v,
                ),
                _text(
                  _tankMaterial,
                  'Tank Material *',
                  validator: (v) =>
                      Validators.required(v, fieldLabel: 'Tank material'),
                  onChanged: (v) => _septic.tankMaterial = v,
                ),
                _text(
                  _effluentDisposalMethod,
                  'Effluent Disposal Method *',
                  validator: (v) => Validators.required(
                    v,
                    fieldLabel: 'Effluent disposal method',
                  ),
                  onChanged: (v) => _septic.effluentDisposalMethod = v,
                ),
                _text(
                  _locationDescription,
                  'Location Description *',
                  maxLines: 2,
                  validator: (v) => Validators.required(
                    v,
                    fieldLabel: 'Location description',
                  ),
                  onChanged: (v) => _septic.locationDescription = v,
                ),
                _text(
                  _accessAndMaintenanceDescription,
                  'Access and Maintenance Description *',
                  maxLines: 2,
                  validator: (v) => Validators.required(
                    v,
                    fieldLabel: 'Access and maintenance description',
                  ),
                  onChanged: (v) =>
                      _septic.accessAndMaintenanceDescription = v,
                ),
              ]),

            if (_details.hasStormDrainage)
              _group('Storm Drainage System', [
                AppDropdown<StormDrainageType>(
                  value: _storm.drainageType,
                  label: 'Drainage Type *',
                  items: StormDrainageType.values
                      .map(
                        (d) => DropdownMenuItem(value: d, child: Text(d.label)),
                      )
                      .toList(),
                  validator: (v) =>
                      v == null ? 'Please select a drainage type.' : null,
                  onChanged: (v) {
                    setState(() => _storm.drainageType = v);
                    widget.onChanged();
                  },
                ),
                if (_storm.drainageType == StormDrainageType.other)
                  _text(
                    _otherDrainageType,
                    'Specify Drainage Type *',
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Drainage type',
                    ),
                    onChanged: (v) =>
                        _storm.otherDrainageTypeDescription = v,
                  ),
                _text(
                  _dischargePoint,
                  'Discharge Point *',
                  validator: (v) =>
                      Validators.required(v, fieldLabel: 'Discharge point'),
                  onChanged: (v) => _storm.dischargePoint = v,
                ),
                _text(
                  _mainDrainPipeMaterial,
                  'Main Drain Pipe Material *',
                  validator: (v) => Validators.required(
                    v,
                    fieldLabel: 'Main drain pipe material',
                  ),
                  onChanged: (v) => _storm.mainDrainPipeMaterial = v,
                ),
                _text(
                  _mainDrainPipeDiameter,
                  'Main Drain Pipe Diameter *',
                  keyboardType: TextInputType.number,
                  validator: (v) =>
                      _positiveDecimalError(v, 'Main drain pipe diameter'),
                  onChanged: (v) => _storm.mainDrainPipeDiameter = v,
                ),
                _text(
                  _catchBasinCount,
                  'Catch Basin Count',
                  keyboardType: TextInputType.number,
                  validator: (v) =>
                      _nonNegativeWholeNumberError(v, 'Catch basin count'),
                  onChanged: (v) => _storm.catchBasinCount = v,
                ),
                _text(
                  _roofDrainCount,
                  'Roof Drain Count',
                  keyboardType: TextInputType.number,
                  validator: (v) =>
                      _nonNegativeWholeNumberError(v, 'Roof drain count'),
                  onChanged: (v) => _storm.roofDrainCount = v,
                ),
                _text(
                  _drainageSystemDescription,
                  'Drainage-System Description *',
                  maxLines: 2,
                  validator: (v) => Validators.required(
                    v,
                    fieldLabel: 'Drainage-system description',
                  ),
                  onChanged: (v) => _storm.drainageSystemDescription = v,
                ),
                _text(
                  _applicableClearanceStatus,
                  'Applicable Clearance Status *',
                  validator: (v) => Validators.required(
                    v,
                    fieldLabel: 'Applicable clearance status',
                  ),
                  onChanged: (v) => _storm.applicableClearanceStatus = v,
                ),
              ]),

            const SizedBox(height: AppSpacing.xl),
            Text('Prepared By', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              backgroundColor: AppColors.surfaceMuted,
              showBorder: false,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Prepared by the Design Master Plumber',
                    style: AppTypography.caption,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    designMasterPlumberName.trim().isEmpty
                        ? 'Will be populated from the Design Professional'
                        : designMasterPlumberName,
                    style: AppTypography.bodyStrong,
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

