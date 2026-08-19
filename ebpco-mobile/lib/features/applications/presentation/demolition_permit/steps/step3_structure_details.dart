import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/demolition_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_dropdown.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';
import '../../building_permit/widgets/date_picker_field.dart';

/// Step 3 — Structure & Demolition Details.
class Step3StructureDetails extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final DemolitionPermitDraft draft;
  final VoidCallback onChanged;

  const Step3StructureDetails({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step3StructureDetails> createState() => _Step3StructureDetailsState();
}

class _Step3StructureDetailsState extends State<Step3StructureDetails> {
  late final TextEditingController _otherExtent;
  late final TextEditingController _structureName;
  late final TextEditingController _descriptionOfExistingStructure;
  late final TextEditingController _existingUseOrOccupancy;
  late final TextEditingController _numberOfStoreys;
  late final TextEditingController _numberOfUnits;
  late final TextEditingController _approximateFloorArea;
  late final TextEditingController _approximateBuildingHeight;
  late final TextEditingController _otherMaterial;
  late final TextEditingController _estimatedAgeOfStructure;
  late final TextEditingController _portionToBeDemolished;
  late final TextEditingController _reasonForDemolition;
  late final TextEditingController _proposedDemolitionMethod;
  late final TextEditingController _estimatedDemolitionCost;

  DemolitionStructureDetails get _structure => widget.draft.structureDetails;

  @override
  void initState() {
    super.initState();
    _otherExtent = TextEditingController(text: _structure.otherExtentDescription);
    _structureName = TextEditingController(text: _structure.structureName);
    _descriptionOfExistingStructure = TextEditingController(
      text: _structure.descriptionOfExistingStructure,
    );
    _existingUseOrOccupancy = TextEditingController(
      text: _structure.existingUseOrOccupancy,
    );
    _numberOfStoreys = TextEditingController(text: _structure.numberOfStoreys);
    _numberOfUnits = TextEditingController(text: _structure.numberOfUnits);
    _approximateFloorArea = TextEditingController(
      text: _structure.approximateFloorArea,
    );
    _approximateBuildingHeight = TextEditingController(
      text: _structure.approximateBuildingHeight,
    );
    _otherMaterial = TextEditingController(
      text: _structure.otherMaterialDescription,
    );
    _estimatedAgeOfStructure = TextEditingController(
      text: _structure.estimatedAgeOfStructure,
    );
    _portionToBeDemolished = TextEditingController(
      text: _structure.portionToBeDemolished,
    );
    _reasonForDemolition = TextEditingController(
      text: _structure.reasonForDemolition,
    );
    _proposedDemolitionMethod = TextEditingController(
      text: _structure.proposedDemolitionMethod,
    );
    _estimatedDemolitionCost = TextEditingController(
      text: _structure.estimatedDemolitionCost,
    );
  }

  @override
  void dispose() {
    _otherExtent.dispose();
    _structureName.dispose();
    _descriptionOfExistingStructure.dispose();
    _existingUseOrOccupancy.dispose();
    _numberOfStoreys.dispose();
    _numberOfUnits.dispose();
    _approximateFloorArea.dispose();
    _approximateBuildingHeight.dispose();
    _otherMaterial.dispose();
    _estimatedAgeOfStructure.dispose();
    _portionToBeDemolished.dispose();
    _reasonForDemolition.dispose();
    _proposedDemolitionMethod.dispose();
    _estimatedDemolitionCost.dispose();
    super.dispose();
  }

  void _selectExtent(DemolitionExtent extent) {
    setState(() => _structure.demolitionExtent = extent);
    widget.onChanged();
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
            Text('Demolition Extent', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Select the option that best describes the scope of the '
              'demolition work.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
              child: RadioGroup<DemolitionExtent>(
                groupValue: _structure.demolitionExtent,
                onChanged: (value) {
                  if (value != null) _selectExtent(value);
                },
                child: Column(
                  children: [
                    for (final extent in DemolitionExtent.values)
                      RadioListTile<DemolitionExtent>(
                        value: extent,
                        activeColor: AppColors.primary,
                        contentPadding: EdgeInsets.zero,
                        title: Text(extent.label, style: AppTypography.body),
                      ),
                  ],
                ),
              ),
            ),
            if (_structure.demolitionExtent == DemolitionExtent.others) ...[
              const SizedBox(height: AppSpacing.md),
              AppTextField(
                controller: _otherExtent,
                label: 'Specify Demolition Extent *',
                validator: (v) =>
                    Validators.required(v, fieldLabel: 'Demolition extent'),
                onChanged: (v) {
                  _structure.otherExtentDescription = v;
                  widget.onChanged();
                },
              ),
            ],
            if (_structure.demolitionExtent ==
                DemolitionExtent.partialDemolition) ...[
              const SizedBox(height: AppSpacing.md),
              AppTextField(
                controller: _portionToBeDemolished,
                label: 'Portion to be Demolished *',
                maxLines: 2,
                validator: (v) => Validators.required(
                  v,
                  fieldLabel: 'Portion to be demolished',
                ),
                onChanged: (v) {
                  _structure.portionToBeDemolished = v;
                  widget.onChanged();
                },
              ),
            ],

            const SizedBox(height: AppSpacing.xl),
            Text('Existing Structure', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _structureName,
                    label: 'Structure Name *',
                    hint: 'e.g. Main Residential Building',
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'Structure name'),
                    onChanged: (v) {
                      _structure.structureName = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _descriptionOfExistingStructure,
                    label: 'Description of Existing Structure *',
                    maxLines: 3,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Description of existing structure',
                    ),
                    onChanged: (v) {
                      _structure.descriptionOfExistingStructure = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _existingUseOrOccupancy,
                    label: 'Existing Use or Occupancy *',
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Existing use or occupancy',
                    ),
                    onChanged: (v) {
                      _structure.existingUseOrOccupancy = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _numberOfStoreys,
                    label: 'Number of Storeys *',
                    keyboardType: TextInputType.number,
                    validator: (v) => Validators.positiveWholeNumber(
                      v,
                      fieldLabel: 'Number of storeys',
                    ),
                    onChanged: (v) {
                      _structure.numberOfStoreys = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _numberOfUnits,
                    label: 'Number of Units *',
                    keyboardType: TextInputType.number,
                    validator: (v) => v == null || v.trim().isEmpty
                        ? 'Number of units is required.'
                        : (double.tryParse(v.trim()) == null
                              ? 'Enter a valid number.'
                              : (double.parse(v.trim()) < 0
                                    ? 'Number of units cannot be negative.'
                                    : null)),
                    onChanged: (v) {
                      _structure.numberOfUnits = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _approximateFloorArea,
                    label: 'Approximate Floor Area (sq. m.) *',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    validator: (v) => v == null || v.trim().isEmpty
                        ? 'Approximate floor area is required.'
                        : (double.tryParse(v.trim()) == null
                              ? 'Enter a valid number.'
                              : (double.parse(v.trim()) < 0
                                    ? 'Approximate floor area cannot be negative.'
                                    : null)),
                    onChanged: (v) {
                      _structure.approximateFloorArea = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _approximateBuildingHeight,
                    label: 'Approximate Building Height (m) *',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    validator: (v) => v == null || v.trim().isEmpty
                        ? 'Approximate building height is required.'
                        : (double.tryParse(v.trim()) == null
                              ? 'Enter a valid number.'
                              : (double.parse(v.trim()) < 0
                                    ? 'Approximate building height cannot be negative.'
                                    : null)),
                    onChanged: (v) {
                      _structure.approximateBuildingHeight = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppDropdown<ConstructionMaterial>(
                    value: _structure.primaryConstructionMaterial,
                    label: 'Primary Construction Material *',
                    items: ConstructionMaterial.values
                        .map(
                          (m) => DropdownMenuItem(
                            value: m,
                            child: Text(m.label),
                          ),
                        )
                        .toList(),
                    validator: (v) =>
                        v == null ? 'Please select a construction material.' : null,
                    onChanged: (v) {
                      setState(() => _structure.primaryConstructionMaterial = v);
                      widget.onChanged();
                    },
                  ),
                  if (_structure.primaryConstructionMaterial ==
                      ConstructionMaterial.others) ...[
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _otherMaterial,
                      label: 'Specify Construction Material *',
                      validator: (v) => Validators.required(
                        v,
                        fieldLabel: 'Construction material',
                      ),
                      onChanged: (v) {
                        _structure.otherMaterialDescription = v;
                        widget.onChanged();
                      },
                    ),
                  ],
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _estimatedAgeOfStructure,
                    label: 'Estimated Age of Structure *',
                    hint: 'e.g. 25 years',
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Estimated age of structure',
                    ),
                    onChanged: (v) {
                      _structure.estimatedAgeOfStructure = v;
                      widget.onChanged();
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Demolition Plan', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _reasonForDemolition,
                    label: 'Reason for Demolition *',
                    maxLines: 3,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Reason for demolition',
                    ),
                    onChanged: (v) {
                      _structure.reasonForDemolition = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _proposedDemolitionMethod,
                    label: 'Proposed Demolition Method *',
                    hint: 'e.g. Manual dismantling, mechanical, wrecking ball',
                    maxLines: 3,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Proposed demolition method',
                    ),
                    onChanged: (v) {
                      _structure.proposedDemolitionMethod = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _estimatedDemolitionCost,
                    label: 'Estimated Demolition Cost (₱) *',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    validator: (v) => v == null || v.trim().isEmpty
                        ? 'Estimated demolition cost is required.'
                        : (double.tryParse(v.trim()) == null
                              ? 'Enter a valid number.'
                              : (double.parse(v.trim()) < 0
                                    ? 'Estimated demolition cost cannot be negative.'
                                    : null)),
                    onChanged: (v) {
                      _structure.estimatedDemolitionCost = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'Proposed Start Date *',
                    value: _structure.proposedStartDate,
                    validator: (v) =>
                        v == null ? 'Please select a start date.' : null,
                    onChanged: (v) {
                      setState(() => _structure.proposedStartDate = v);
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'Expected Completion Date *',
                    value: _structure.expectedCompletionDate,
                    validator: (v) {
                      if (v == null) return 'Please select a completion date.';
                      final start = _structure.proposedStartDate;
                      if (start != null && v.isBefore(start)) {
                        return 'Completion date cannot be before the start date.';
                      }
                      return null;
                    },
                    onChanged: (v) {
                      setState(() => _structure.expectedCompletionDate = v);
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
