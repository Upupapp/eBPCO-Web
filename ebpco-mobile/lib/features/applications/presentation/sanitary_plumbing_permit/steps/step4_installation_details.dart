import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/sanitary_plumbing_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/cards/fixture_inventory_row.dart';
import '../../../../../shared/widgets/chips/app_chip.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';
import '../../building_permit/widgets/date_picker_field.dart';

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

/// Step 4 — Sanitary / Plumbing Installation Details: the fixture
/// inventory, water-supply system, wastewater/disposal system, and
/// building/project fields. Every numeric field uses safe
/// `tryParse`-based validation, so a temporarily empty or invalid entry
/// never throws or renders `NaN`. Fixture rows are rendered by the
/// shared [FixtureInventoryRow] (also used by the Plumbing Permit), which
/// owns its own controllers — updating one fixture's quantity never
/// rebuilds or erases any other fixture's entry.
class Step4InstallationDetails extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final SanitaryPermitDraft draft;
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

  SanitaryInstallationDetails get _details => widget.draft.installationDetails;
  SanitaryWaterSupply get _water => _details.waterSupply;
  SanitaryWastewaterDisposal get _disposal => _details.disposalSystem;
  SanitaryBuildingProjectDetails get _building =>
      _details.buildingProjectDetails;

  // Water supply.
  late final TextEditingController _shallowWellDepth;
  late final TextEditingController _shallowWellEstimatedYield;
  late final TextEditingController _shallowWellPumpType;
  late final TextEditingController _shallowWellTreatmentMethod;

  late final TextEditingController _deepWellDepth;
  late final TextEditingController _deepWellPumpCapacity;
  late final TextEditingController _deepWellPumpRating;
  late final TextEditingController _deepWellEstimatedYield;
  late final TextEditingController _deepWellTreatmentMethod;

  late final TextEditingController _cityWaterServiceProvider;
  late final TextEditingController _cityWaterServiceConnectionNumber;
  late final TextEditingController _cityWaterMeterSize;

  late final TextEditingController _otherWaterSupplyDescription;

  // Disposal system.
  late final TextEditingController _wtpTreatmentType;
  late final TextEditingController _wtpTreatmentCapacity;
  late final TextEditingController _wtpDischargePoint;
  late final TextEditingController _wtpOperator;

  late final TextEditingController _imhoffTankCapacity;
  late final TextEditingController _imhoffTankDimensions;
  late final TextEditingController _imhoffEffluentDestination;

  late final TextEditingController _sewerProviderOrReceivingSystem;
  late final TextEditingController _sewerConnectionReference;
  late final TextEditingController _sewerConnectionPoint;

  late final TextEditingController _sandFilterArea;
  late final TextEditingController _sandFilterDescription;
  late final TextEditingController _sandFilterEffluentDestination;

  late final TextEditingController _drainageDischargeLocation;
  late final TextEditingController _drainageDescription;
  late final TextEditingController _drainageRequiredClearanceStatus;

  late final TextEditingController _otherDisposalSystemDescription;

  // Building & project details.
  late final TextEditingController _numberOfStoreys;
  late final TextEditingController _totalBuildingArea;
  late final TextEditingController _totalCostOfInstallation;

  @override
  void initState() {
    super.initState();

    _shallowWellDepth = _bind(_water.shallowWellDepth);
    _shallowWellEstimatedYield = _bind(_water.shallowWellEstimatedYield);
    _shallowWellPumpType = _bind(_water.shallowWellPumpType);
    _shallowWellTreatmentMethod = _bind(_water.shallowWellTreatmentMethod);

    _deepWellDepth = _bind(_water.deepWellDepth);
    _deepWellPumpCapacity = _bind(_water.deepWellPumpCapacity);
    _deepWellPumpRating = _bind(_water.deepWellPumpRating);
    _deepWellEstimatedYield = _bind(_water.deepWellEstimatedYield);
    _deepWellTreatmentMethod = _bind(_water.deepWellTreatmentMethod);

    _cityWaterServiceProvider = _bind(_water.cityWaterServiceProvider);
    _cityWaterServiceConnectionNumber = _bind(
      _water.cityWaterServiceConnectionNumber,
    );
    _cityWaterMeterSize = _bind(_water.cityWaterMeterSize);

    _otherWaterSupplyDescription = _bind(_water.otherWaterSupplyDescription);

    _wtpTreatmentType = _bind(_disposal.wtpTreatmentType);
    _wtpTreatmentCapacity = _bind(_disposal.wtpTreatmentCapacity);
    _wtpDischargePoint = _bind(_disposal.wtpDischargePoint);
    _wtpOperator = _bind(_disposal.wtpOperatorOrResponsibleParty);

    _imhoffTankCapacity = _bind(_disposal.imhoffTankCapacity);
    _imhoffTankDimensions = _bind(_disposal.imhoffTankDimensions);
    _imhoffEffluentDestination = _bind(_disposal.imhoffEffluentDestination);

    _sewerProviderOrReceivingSystem = _bind(
      _disposal.sewerProviderOrReceivingSystem,
    );
    _sewerConnectionReference = _bind(_disposal.sewerConnectionReference);
    _sewerConnectionPoint = _bind(_disposal.sewerConnectionPoint);

    _sandFilterArea = _bind(_disposal.sandFilterArea);
    _sandFilterDescription = _bind(_disposal.sandFilterDescription);
    _sandFilterEffluentDestination = _bind(
      _disposal.sandFilterEffluentDestination,
    );

    _drainageDischargeLocation = _bind(_disposal.drainageDischargeLocation);
    _drainageDescription = _bind(_disposal.drainageDescription);
    _drainageRequiredClearanceStatus = _bind(
      _disposal.drainageRequiredClearanceStatus,
    );

    _otherDisposalSystemDescription = _bind(
      _disposal.otherDisposalSystemDescription,
    );

    _numberOfStoreys = _bind(_building.numberOfStoreys);
    _totalBuildingArea = _bind(_building.totalBuildingArea);
    _totalCostOfInstallation = _bind(_building.totalCostOfInstallation);
  }

  @override
  void dispose() {
    for (final controller in _controllers) {
      controller.dispose();
    }
    super.dispose();
  }

  void _toggleWaterSupply(WaterSupplyType type, bool selected) {
    setState(() {
      if (selected) {
        _water.selectedTypes.add(type);
      } else {
        _water.selectedTypes.remove(type);
      }
    });
    widget.onChanged();
  }

  void _toggleDisposal(DisposalSystemType type, bool selected) {
    setState(() {
      if (selected) {
        _disposal.selectedTypes.add(type);
      } else {
        _disposal.selectedTypes.remove(type);
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
    final designProfessionalName =
        widget.draft.professionals.designProfessional.fullName;

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
                showCustomNameField: entry.type == SanitaryFixtureType.others,
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
            Text('Water Supply', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Select every water-supply system that applies.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: [
                for (final type in WaterSupplyType.values)
                  AppChip(
                    label: type.label,
                    selected: _water.selectedTypes.contains(type),
                    onSelected: (selected) =>
                        _toggleWaterSupply(type, selected),
                  ),
              ],
            ),
            if (_water.hasShallowWell)
              _group('Shallow Well', [
                _text(
                  _shallowWellDepth,
                  'Well Depth *',
                  keyboardType: TextInputType.number,
                  validator: (v) => _positiveDecimalError(v, 'Well depth'),
                  onChanged: (v) => _water.shallowWellDepth = v,
                ),
                _text(
                  _shallowWellEstimatedYield,
                  'Estimated Yield *',
                  keyboardType: TextInputType.number,
                  validator: (v) =>
                      _positiveDecimalError(v, 'Estimated yield'),
                  onChanged: (v) => _water.shallowWellEstimatedYield = v,
                ),
                _text(
                  _shallowWellPumpType,
                  'Pump Type *',
                  validator: (v) =>
                      Validators.required(v, fieldLabel: 'Pump type'),
                  onChanged: (v) => _water.shallowWellPumpType = v,
                ),
                _text(
                  _shallowWellTreatmentMethod,
                  'Water-Treatment Method',
                  onChanged: (v) => _water.shallowWellTreatmentMethod = v,
                ),
              ]),
            if (_water.hasDeepWell)
              _group('Deep Well and Pump Set', [
                _text(
                  _deepWellDepth,
                  'Well Depth *',
                  keyboardType: TextInputType.number,
                  validator: (v) => _positiveDecimalError(v, 'Well depth'),
                  onChanged: (v) => _water.deepWellDepth = v,
                ),
                _text(
                  _deepWellPumpCapacity,
                  'Pump Capacity *',
                  keyboardType: TextInputType.number,
                  validator: (v) => _positiveDecimalError(v, 'Pump capacity'),
                  onChanged: (v) => _water.deepWellPumpCapacity = v,
                ),
                _text(
                  _deepWellPumpRating,
                  'Pump Rating *',
                  validator: (v) =>
                      Validators.required(v, fieldLabel: 'Pump rating'),
                  onChanged: (v) => _water.deepWellPumpRating = v,
                ),
                _text(
                  _deepWellEstimatedYield,
                  'Estimated Yield *',
                  keyboardType: TextInputType.number,
                  validator: (v) =>
                      _positiveDecimalError(v, 'Estimated yield'),
                  onChanged: (v) => _water.deepWellEstimatedYield = v,
                ),
                _text(
                  _deepWellTreatmentMethod,
                  'Water-Treatment Method *',
                  validator: (v) => Validators.required(
                    v,
                    fieldLabel: 'Water-treatment method',
                  ),
                  onChanged: (v) => _water.deepWellTreatmentMethod = v,
                ),
              ]),
            if (_water.hasCityWater)
              _group('City / Municipal Water System', [
                _text(
                  _cityWaterServiceProvider,
                  'Water Service Provider *',
                  validator: (v) => Validators.required(
                    v,
                    fieldLabel: 'Water service provider',
                  ),
                  onChanged: (v) => _water.cityWaterServiceProvider = v,
                ),
                _text(
                  _cityWaterServiceConnectionNumber,
                  'Service-Connection Number',
                  hint: 'Optional — when available',
                  onChanged: (v) =>
                      _water.cityWaterServiceConnectionNumber = v,
                ),
                _text(
                  _cityWaterMeterSize,
                  'Water Meter Size *',
                  validator: (v) => Validators.required(
                    v,
                    fieldLabel: 'Water meter size',
                  ),
                  onChanged: (v) => _water.cityWaterMeterSize = v,
                ),
              ]),
            if (_water.hasOthers)
              _group('Other Water Supply', [
                _text(
                  _otherWaterSupplyDescription,
                  'Water-Supply Description *',
                  maxLines: 2,
                  validator: (v) => Validators.required(
                    v,
                    fieldLabel: 'Water-supply description',
                  ),
                  onChanged: (v) => _water.otherWaterSupplyDescription = v,
                ),
              ]),

            const SizedBox(height: AppSpacing.xl),
            Text(
              'Wastewater and Disposal System',
              style: AppTypography.cardTitle,
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Select every disposal system that applies.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: [
                for (final type in DisposalSystemType.values)
                  AppChip(
                    label: type.label,
                    selected: _disposal.selectedTypes.contains(type),
                    onSelected: (selected) => _toggleDisposal(type, selected),
                  ),
              ],
            ),
            if (_disposal.hasWastewaterTreatmentPlant)
              _group('Wastewater Treatment Plant', [
                _text(
                  _wtpTreatmentType,
                  'Treatment Type *',
                  validator: (v) =>
                      Validators.required(v, fieldLabel: 'Treatment type'),
                  onChanged: (v) => _disposal.wtpTreatmentType = v,
                ),
                _text(
                  _wtpTreatmentCapacity,
                  'Treatment Capacity *',
                  keyboardType: TextInputType.number,
                  validator: (v) =>
                      _positiveDecimalError(v, 'Treatment capacity'),
                  onChanged: (v) => _disposal.wtpTreatmentCapacity = v,
                ),
                _text(
                  _wtpDischargePoint,
                  'Discharge Point *',
                  validator: (v) =>
                      Validators.required(v, fieldLabel: 'Discharge point'),
                  onChanged: (v) => _disposal.wtpDischargePoint = v,
                ),
                _text(
                  _wtpOperator,
                  'Operator or Responsible Party *',
                  validator: (v) => Validators.required(
                    v,
                    fieldLabel: 'Operator or responsible party',
                  ),
                  onChanged: (v) =>
                      _disposal.wtpOperatorOrResponsibleParty = v,
                ),
              ]),
            if (_disposal.hasImhoffTank)
              _group('Imhoff Tank', [
                _text(
                  _imhoffTankCapacity,
                  'Tank Capacity *',
                  keyboardType: TextInputType.number,
                  validator: (v) => _positiveDecimalError(v, 'Tank capacity'),
                  onChanged: (v) => _disposal.imhoffTankCapacity = v,
                ),
                _text(
                  _imhoffTankDimensions,
                  'Tank Dimensions *',
                  validator: (v) =>
                      Validators.required(v, fieldLabel: 'Tank dimensions'),
                  onChanged: (v) => _disposal.imhoffTankDimensions = v,
                ),
                _text(
                  _imhoffEffluentDestination,
                  'Effluent Destination *',
                  validator: (v) => Validators.required(
                    v,
                    fieldLabel: 'Effluent destination',
                  ),
                  onChanged: (v) => _disposal.imhoffEffluentDestination = v,
                ),
              ]),
            if (_disposal.hasSanitarySewerConnection)
              _group('Sanitary Sewer Connection', [
                _text(
                  _sewerProviderOrReceivingSystem,
                  'Sewer Provider or Receiving System *',
                  validator: (v) => Validators.required(
                    v,
                    fieldLabel: 'Sewer provider or receiving system',
                  ),
                  onChanged: (v) =>
                      _disposal.sewerProviderOrReceivingSystem = v,
                ),
                _text(
                  _sewerConnectionReference,
                  'Connection Reference',
                  onChanged: (v) => _disposal.sewerConnectionReference = v,
                ),
                _text(
                  _sewerConnectionPoint,
                  'Connection Point *',
                  validator: (v) => Validators.required(
                    v,
                    fieldLabel: 'Connection point',
                  ),
                  onChanged: (v) => _disposal.sewerConnectionPoint = v,
                ),
              ]),
            if (_disposal.hasSubsurfaceSandFilter)
              _group('Subsurface Sand Filter', [
                _text(
                  _sandFilterArea,
                  'Filter Area *',
                  keyboardType: TextInputType.number,
                  validator: (v) => _positiveDecimalError(v, 'Filter area'),
                  onChanged: (v) => _disposal.sandFilterArea = v,
                ),
                _text(
                  _sandFilterDescription,
                  'Filter Description *',
                  maxLines: 2,
                  validator: (v) => Validators.required(
                    v,
                    fieldLabel: 'Filter description',
                  ),
                  onChanged: (v) => _disposal.sandFilterDescription = v,
                ),
                _text(
                  _sandFilterEffluentDestination,
                  'Effluent Destination *',
                  validator: (v) => Validators.required(
                    v,
                    fieldLabel: 'Effluent destination',
                  ),
                  onChanged: (v) =>
                      _disposal.sandFilterEffluentDestination = v,
                ),
              ]),
            if (_disposal.hasSurfaceDrainageGroup)
              _group('Surface Drainage, Street Canal or Water Course', [
                _text(
                  _drainageDischargeLocation,
                  'Discharge Location *',
                  validator: (v) => Validators.required(
                    v,
                    fieldLabel: 'Discharge location',
                  ),
                  onChanged: (v) => _disposal.drainageDischargeLocation = v,
                ),
                _text(
                  _drainageDescription,
                  'Drainage Description *',
                  maxLines: 2,
                  validator: (v) => Validators.required(
                    v,
                    fieldLabel: 'Drainage description',
                  ),
                  onChanged: (v) => _disposal.drainageDescription = v,
                ),
                _text(
                  _drainageRequiredClearanceStatus,
                  'Required Clearance Status *',
                  validator: (v) => Validators.required(
                    v,
                    fieldLabel: 'Required clearance status',
                  ),
                  onChanged: (v) =>
                      _disposal.drainageRequiredClearanceStatus = v,
                ),
              ]),
            if (_disposal.hasOthers)
              _group('Other Disposal System', [
                _text(
                  _otherDisposalSystemDescription,
                  'Disposal-System Description *',
                  maxLines: 2,
                  validator: (v) => Validators.required(
                    v,
                    fieldLabel: 'Disposal-system description',
                  ),
                  onChanged: (v) =>
                      _disposal.otherDisposalSystemDescription = v,
                ),
              ]),

            const SizedBox(height: AppSpacing.xl),
            Text(
              'Building and Project Details',
              style: AppTypography.cardTitle,
            ),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _text(
                    _numberOfStoreys,
                    'Number of Storeys *',
                    keyboardType: TextInputType.number,
                    validator: (v) => Validators.positiveWholeNumber(
                      v,
                      fieldLabel: 'Number of storeys',
                    ),
                    onChanged: (v) => _building.numberOfStoreys = v,
                  ),
                  const SizedBox(height: AppSpacing.md),
                  _text(
                    _totalBuildingArea,
                    'Total Building or Subdivision Area (sq. m.) *',
                    keyboardType: TextInputType.number,
                    validator: (v) => _nonNegativeWholeNumberError(
                          v,
                          'Total building area',
                        ) ??
                        (Validators.required(
                          v,
                          fieldLabel: 'Total building area',
                        )),
                    onChanged: (v) => _building.totalBuildingArea = v,
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'Proposed Start Date of Installation *',
                    value: _building.proposedStartDate,
                    validator: (_) => _building.proposedStartDate == null
                        ? 'Please select the proposed start date.'
                        : null,
                    onChanged: (date) {
                      setState(() => _building.proposedStartDate = date);
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'Expected Completion Date *',
                    value: _building.expectedCompletionDate,
                    validator: (_) {
                      final start = _building.proposedStartDate;
                      final end = _building.expectedCompletionDate;
                      if (end == null) {
                        return 'Please select the expected completion date.';
                      }
                      if (start != null && end.isBefore(start)) {
                        return 'Completion date cannot be before the start date.';
                      }
                      return null;
                    },
                    onChanged: (date) {
                      setState(() => _building.expectedCompletionDate = date);
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  _text(
                    _totalCostOfInstallation,
                    'Total Cost of Installation (₱) *',
                    keyboardType: TextInputType.number,
                    validator: (v) => _nonNegativeWholeNumberError(
                          v,
                          'Total cost of installation',
                        ) ??
                        (Validators.required(
                          v,
                          fieldLabel: 'Total cost of installation',
                        )),
                    onChanged: (v) => _building.totalCostOfInstallation = v,
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppCard(
                    backgroundColor: AppColors.surfaceMuted,
                    showBorder: false,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Prepared By', style: AppTypography.caption),
                        const SizedBox(height: 2),
                        Text(
                          designProfessionalName.trim().isEmpty
                              ? 'Will be populated from the Design Professional'
                              : designProfessionalName,
                          style: AppTypography.bodyStrong,
                        ),
                      ],
                    ),
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

