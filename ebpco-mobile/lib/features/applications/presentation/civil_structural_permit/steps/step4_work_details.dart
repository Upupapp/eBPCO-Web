import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/civil_structural_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/chips/app_chip.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
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

/// Step 4 — Nature of Civil / Structural Works: the selected work types,
/// base project measurements, and the technical fields conditionally
/// required by each selected work type. The "Prepared by the Design
/// Civil / Structural Engineer" summary is read-only here — it is
/// populated from Step 5's data, never entered twice.
class Step4WorkDetails extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final CivilStructuralPermitDraft draft;
  final VoidCallback onChanged;

  const Step4WorkDetails({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step4WorkDetails> createState() => _Step4WorkDetailsState();
}

class _Step4WorkDetailsState extends State<Step4WorkDetails> {
  late final TextEditingController _otherWork;
  late final TextEditingController _numberOfStoreys;
  late final TextEditingController _totalStructuralFloorArea;
  late final TextEditingController _buildingOrStructureHeight;
  late final TextEditingController _estimatedStructuralCost;
  late final TextEditingController _excavationDepth;

  late final TextEditingController _numberOfPiles;
  late final TextEditingController _pileType;
  late final TextEditingController _averagePileDepth;
  late final TextEditingController _pileCapacity;

  late final TextEditingController _foundationType;
  late final TextEditingController _foundationDepth;
  late final TextEditingController _foundationDescription;

  late final TextEditingController _concreteStrength;
  late final TextEditingController _concreteFramingSystemDescription;

  late final TextEditingController _steelGrade;
  late final TextEditingController _steelFramingSystemDescription;

  late final TextEditingController _slabType;
  late final TextEditingController _typicalSlabThickness;

  late final TextEditingController _structuralWallType;
  late final TextEditingController _wallMaterial;
  late final TextEditingController _typicalWallThickness;

  late final TextEditingController _prestressingSystemDescription;

  late final TextEditingController _testingLaboratory;
  late final TextEditingController _plannedTests;
  late final TextEditingController _testSchedule;

  late final TextEditingController _towerType;
  late final TextEditingController _towerHeight;
  late final TextEditingController _intendedUse;

  late final TextEditingController _tankType;
  late final TextEditingController _tankCapacity;
  late final TextEditingController _tankMaterial;

  CivilStructuralWorkDetails get _work => widget.draft.workDetails;

  @override
  void initState() {
    super.initState();
    _otherWork = TextEditingController(text: _work.otherWorkDescription);
    _numberOfStoreys = TextEditingController(text: _work.numberOfStoreys);
    _totalStructuralFloorArea = TextEditingController(
      text: _work.totalStructuralFloorArea,
    );
    _buildingOrStructureHeight = TextEditingController(
      text: _work.buildingOrStructureHeight,
    );
    _estimatedStructuralCost = TextEditingController(
      text: _work.estimatedStructuralCost,
    );
    _excavationDepth = TextEditingController(text: _work.excavationDepth);

    _numberOfPiles = TextEditingController(text: _work.numberOfPiles);
    _pileType = TextEditingController(text: _work.pileType);
    _averagePileDepth = TextEditingController(text: _work.averagePileDepth);
    _pileCapacity = TextEditingController(text: _work.pileCapacity);

    _foundationType = TextEditingController(text: _work.foundationType);
    _foundationDepth = TextEditingController(text: _work.foundationDepth);
    _foundationDescription = TextEditingController(
      text: _work.foundationDescription,
    );

    _concreteStrength = TextEditingController(text: _work.concreteStrength);
    _concreteFramingSystemDescription = TextEditingController(
      text: _work.concreteFramingSystemDescription,
    );

    _steelGrade = TextEditingController(text: _work.steelGrade);
    _steelFramingSystemDescription = TextEditingController(
      text: _work.steelFramingSystemDescription,
    );

    _slabType = TextEditingController(text: _work.slabType);
    _typicalSlabThickness = TextEditingController(
      text: _work.typicalSlabThickness,
    );

    _structuralWallType = TextEditingController(text: _work.structuralWallType);
    _wallMaterial = TextEditingController(text: _work.wallMaterial);
    _typicalWallThickness = TextEditingController(
      text: _work.typicalWallThickness,
    );

    _prestressingSystemDescription = TextEditingController(
      text: _work.prestressingSystemDescription,
    );

    _testingLaboratory = TextEditingController(text: _work.testingLaboratory);
    _plannedTests = TextEditingController(text: _work.plannedTests);
    _testSchedule = TextEditingController(text: _work.testSchedule);

    _towerType = TextEditingController(text: _work.towerType);
    _towerHeight = TextEditingController(text: _work.towerHeight);
    _intendedUse = TextEditingController(text: _work.intendedUse);

    _tankType = TextEditingController(text: _work.tankType);
    _tankCapacity = TextEditingController(text: _work.tankCapacity);
    _tankMaterial = TextEditingController(text: _work.tankMaterial);
  }

  @override
  void dispose() {
    _otherWork.dispose();
    _numberOfStoreys.dispose();
    _totalStructuralFloorArea.dispose();
    _buildingOrStructureHeight.dispose();
    _estimatedStructuralCost.dispose();
    _excavationDepth.dispose();
    _numberOfPiles.dispose();
    _pileType.dispose();
    _averagePileDepth.dispose();
    _pileCapacity.dispose();
    _foundationType.dispose();
    _foundationDepth.dispose();
    _foundationDescription.dispose();
    _concreteStrength.dispose();
    _concreteFramingSystemDescription.dispose();
    _steelGrade.dispose();
    _steelFramingSystemDescription.dispose();
    _slabType.dispose();
    _typicalSlabThickness.dispose();
    _structuralWallType.dispose();
    _wallMaterial.dispose();
    _typicalWallThickness.dispose();
    _prestressingSystemDescription.dispose();
    _testingLaboratory.dispose();
    _plannedTests.dispose();
    _testSchedule.dispose();
    _towerType.dispose();
    _towerHeight.dispose();
    _intendedUse.dispose();
    _tankType.dispose();
    _tankCapacity.dispose();
    _tankMaterial.dispose();
    super.dispose();
  }

  void _toggleWork(NatureOfWork type, bool selected) {
    setState(() {
      if (selected) {
        _work.selectedWorks.add(type);
      } else {
        _work.selectedWorks.remove(type);
      }
    });
    widget.onChanged();
  }

  @override
  Widget build(BuildContext context) {
    final designEngineerName = widget.draft.professionals.designEngineer.fullName;

    return Form(
      key: widget.formKey,
      child: FormScrollScaffold(
        centerVertically: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Nature of Civil / Structural Works',
              style: AppTypography.cardTitle,
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Select every type of civil or structural work included in '
              'this project.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: [
                for (final type in NatureOfWork.values)
                  AppChip(
                    label: type.label,
                    selected: _work.selectedWorks.contains(type),
                    onSelected: (selected) => _toggleWork(type, selected),
                  ),
              ],
            ),
            if (_work.selectedWorks.contains(NatureOfWork.others)) ...[
              const SizedBox(height: AppSpacing.md),
              AppTextField(
                controller: _otherWork,
                label: 'Specify Other Work *',
                validator: (v) =>
                    Validators.required(v, fieldLabel: 'Nature of work'),
                onChanged: (v) {
                  _work.otherWorkDescription = v;
                  widget.onChanged();
                },
              ),
            ],

            const SizedBox(height: AppSpacing.xl),
            Text('Prepared By', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Row(
                children: [
                  const Icon(Icons.badge_outlined, color: AppColors.textMuted),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Prepared by the Design Civil / Structural Engineer',
                          style: AppTypography.caption,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          designEngineerName.trim().isEmpty
                              ? 'Not yet provided (see Step 5)'
                              : designEngineerName,
                          style: AppTypography.bodyStrong,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Project Measurements', style: AppTypography.cardTitle),
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
                      _work.numberOfStoreys = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _totalStructuralFloorArea,
                    label: 'Total Structural Floor Area (sq. m.) *',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    validator: (v) => _positiveDecimalError(
                      v,
                      'Total Structural Floor Area',
                    ),
                    onChanged: (v) {
                      _work.totalStructuralFloorArea = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _buildingOrStructureHeight,
                    label: 'Building or Structure Height (m) *',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    validator: (v) => _positiveDecimalError(
                      v,
                      'Building or Structure Height',
                    ),
                    onChanged: (v) {
                      _work.buildingOrStructureHeight = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _estimatedStructuralCost,
                    label: 'Estimated Structural Cost (₱) *',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    validator: (v) =>
                        _positiveDecimalError(v, 'Estimated Structural Cost'),
                    onChanged: (v) {
                      _work.estimatedStructuralCost = v;
                      widget.onChanged();
                    },
                  ),
                  if (_work.hasExcavation) ...[
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _excavationDepth,
                      label: 'Excavation Depth (m) *',
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      validator: (v) =>
                          _positiveDecimalError(v, 'Excavation Depth'),
                      onChanged: (v) {
                        _work.excavationDepth = v;
                        widget.onChanged();
                      },
                    ),
                  ],
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'Proposed Start Date *',
                    value: _work.proposedStartDate,
                    validator: (v) =>
                        v == null ? 'Please select a start date.' : null,
                    onChanged: (v) {
                      setState(() => _work.proposedStartDate = v);
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'Expected Completion Date *',
                    value: _work.expectedCompletionDate,
                    validator: (v) {
                      if (v == null) return 'Please select a completion date.';
                      final start = _work.proposedStartDate;
                      if (start != null && v.isBefore(start)) {
                        return 'Completion date cannot be before the start date.';
                      }
                      return null;
                    },
                    onChanged: (v) {
                      setState(() => _work.expectedCompletionDate = v);
                      widget.onChanged();
                    },
                  ),
                ],
              ),
            ),

            if (_work.hasPilingWorks) ...[
              const SizedBox(height: AppSpacing.xl),
              Text('Piling Works Details', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.sm),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    AppTextField(
                      controller: _numberOfPiles,
                      label: 'Number of Piles *',
                      keyboardType: TextInputType.number,
                      validator: (v) => Validators.positiveWholeNumber(
                        v,
                        fieldLabel: 'Number of piles',
                      ),
                      onChanged: (v) {
                        _work.numberOfPiles = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _pileType,
                      label: 'Pile Type *',
                      validator: (v) =>
                          Validators.required(v, fieldLabel: 'Pile type'),
                      onChanged: (v) {
                        _work.pileType = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _averagePileDepth,
                      label: 'Average Pile Depth (m) *',
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      validator: (v) =>
                          _positiveDecimalError(v, 'Average Pile Depth'),
                      onChanged: (v) {
                        _work.averagePileDepth = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _pileCapacity,
                      label: 'Pile Capacity (kN) *',
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      validator: (v) => _positiveDecimalError(v, 'Pile Capacity'),
                      onChanged: (v) {
                        _work.pileCapacity = v;
                        widget.onChanged();
                      },
                    ),
                  ],
                ),
              ),
            ],

            if (_work.hasFoundation) ...[
              const SizedBox(height: AppSpacing.xl),
              Text('Foundation Details', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.sm),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    AppTextField(
                      controller: _foundationType,
                      label: 'Foundation Type *',
                      validator: (v) => Validators.required(
                        v,
                        fieldLabel: 'Foundation type',
                      ),
                      onChanged: (v) {
                        _work.foundationType = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _foundationDepth,
                      label: 'Foundation Depth (m) *',
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      validator: (v) =>
                          _positiveDecimalError(v, 'Foundation Depth'),
                      onChanged: (v) {
                        _work.foundationDepth = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _foundationDescription,
                      label: 'Foundation Description *',
                      maxLines: 2,
                      validator: (v) => Validators.required(
                        v,
                        fieldLabel: 'Foundation description',
                      ),
                      onChanged: (v) {
                        _work.foundationDescription = v;
                        widget.onChanged();
                      },
                    ),
                  ],
                ),
              ),
            ],

            if (_work.hasConcreteFraming) ...[
              const SizedBox(height: AppSpacing.xl),
              Text('Concrete Framing Details', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.sm),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    AppTextField(
                      controller: _concreteStrength,
                      label: 'Concrete Strength *',
                      hint: 'e.g. 3000 psi / 20.7 MPa',
                      validator: (v) => Validators.required(
                        v,
                        fieldLabel: 'Concrete strength',
                      ),
                      onChanged: (v) {
                        _work.concreteStrength = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _concreteFramingSystemDescription,
                      label: 'Framing System Description *',
                      maxLines: 2,
                      validator: (v) => Validators.required(
                        v,
                        fieldLabel: 'Framing system description',
                      ),
                      onChanged: (v) {
                        _work.concreteFramingSystemDescription = v;
                        widget.onChanged();
                      },
                    ),
                  ],
                ),
              ),
            ],

            if (_work.hasStructuralSteelFraming) ...[
              const SizedBox(height: AppSpacing.xl),
              Text(
                'Structural Steel Framing Details',
                style: AppTypography.cardTitle,
              ),
              const SizedBox(height: AppSpacing.sm),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    AppTextField(
                      controller: _steelGrade,
                      label: 'Steel Grade *',
                      validator: (v) =>
                          Validators.required(v, fieldLabel: 'Steel grade'),
                      onChanged: (v) {
                        _work.steelGrade = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _steelFramingSystemDescription,
                      label: 'Framing System Description *',
                      maxLines: 2,
                      validator: (v) => Validators.required(
                        v,
                        fieldLabel: 'Framing system description',
                      ),
                      onChanged: (v) {
                        _work.steelFramingSystemDescription = v;
                        widget.onChanged();
                      },
                    ),
                  ],
                ),
              ),
            ],

            if (_work.hasSlabs) ...[
              const SizedBox(height: AppSpacing.xl),
              Text('Slab Details', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.sm),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    AppTextField(
                      controller: _slabType,
                      label: 'Slab Type *',
                      validator: (v) =>
                          Validators.required(v, fieldLabel: 'Slab type'),
                      onChanged: (v) {
                        _work.slabType = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _typicalSlabThickness,
                      label: 'Typical Slab Thickness (mm) *',
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      validator: (v) => _positiveDecimalError(
                        v,
                        'Typical Slab Thickness',
                      ),
                      onChanged: (v) {
                        _work.typicalSlabThickness = v;
                        widget.onChanged();
                      },
                    ),
                  ],
                ),
              ),
            ],

            if (_work.hasWalls) ...[
              const SizedBox(height: AppSpacing.xl),
              Text('Wall Details', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.sm),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    AppTextField(
                      controller: _structuralWallType,
                      label: 'Structural Wall Type *',
                      validator: (v) => Validators.required(
                        v,
                        fieldLabel: 'Structural wall type',
                      ),
                      onChanged: (v) {
                        _work.structuralWallType = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _wallMaterial,
                      label: 'Wall Material *',
                      validator: (v) =>
                          Validators.required(v, fieldLabel: 'Wall material'),
                      onChanged: (v) {
                        _work.wallMaterial = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _typicalWallThickness,
                      label: 'Typical Wall Thickness (mm) *',
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      validator: (v) => _positiveDecimalError(
                        v,
                        'Typical Wall Thickness',
                      ),
                      onChanged: (v) {
                        _work.typicalWallThickness = v;
                        widget.onChanged();
                      },
                    ),
                  ],
                ),
              ),
            ],

            if (_work.hasPrestressWorks) ...[
              const SizedBox(height: AppSpacing.xl),
              Text('Prestress Work Details', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.sm),
              AppCard(
                child: AppTextField(
                  controller: _prestressingSystemDescription,
                  label: 'Prestressing System Description *',
                  maxLines: 3,
                  validator: (v) => Validators.required(
                    v,
                    fieldLabel: 'Prestressing system description',
                  ),
                  onChanged: (v) {
                    _work.prestressingSystemDescription = v;
                    widget.onChanged();
                  },
                ),
              ),
            ],

            if (_work.hasMaterialTesting) ...[
              const SizedBox(height: AppSpacing.xl),
              Text('Material Testing Details', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.sm),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    AppTextField(
                      controller: _testingLaboratory,
                      label: 'Testing Laboratory *',
                      validator: (v) => Validators.required(
                        v,
                        fieldLabel: 'Testing laboratory',
                      ),
                      onChanged: (v) {
                        _work.testingLaboratory = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _plannedTests,
                      label: 'Planned Tests *',
                      maxLines: 2,
                      validator: (v) =>
                          Validators.required(v, fieldLabel: 'Planned tests'),
                      onChanged: (v) {
                        _work.plannedTests = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _testSchedule,
                      label: 'Test Schedule *',
                      hint: 'e.g. Week 3 of construction',
                      validator: (v) =>
                          Validators.required(v, fieldLabel: 'Test schedule'),
                      onChanged: (v) {
                        _work.testSchedule = v;
                        widget.onChanged();
                      },
                    ),
                  ],
                ),
              ),
            ],

            if (_work.hasSteelTowers) ...[
              const SizedBox(height: AppSpacing.xl),
              Text('Steel Tower Details', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.sm),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    AppTextField(
                      controller: _towerType,
                      label: 'Tower Type *',
                      validator: (v) =>
                          Validators.required(v, fieldLabel: 'Tower type'),
                      onChanged: (v) {
                        _work.towerType = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _towerHeight,
                      label: 'Tower Height (m) *',
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      validator: (v) => _positiveDecimalError(v, 'Tower Height'),
                      onChanged: (v) {
                        _work.towerHeight = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _intendedUse,
                      label: 'Intended Use *',
                      validator: (v) =>
                          Validators.required(v, fieldLabel: 'Intended use'),
                      onChanged: (v) {
                        _work.intendedUse = v;
                        widget.onChanged();
                      },
                    ),
                  ],
                ),
              ),
            ],

            if (_work.hasTanks) ...[
              const SizedBox(height: AppSpacing.xl),
              Text('Tank Details', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.sm),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    AppTextField(
                      controller: _tankType,
                      label: 'Tank Type *',
                      validator: (v) =>
                          Validators.required(v, fieldLabel: 'Tank type'),
                      onChanged: (v) {
                        _work.tankType = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _tankCapacity,
                      label: 'Tank Capacity (L) *',
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      validator: (v) => _positiveDecimalError(v, 'Tank Capacity'),
                      onChanged: (v) {
                        _work.tankCapacity = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _tankMaterial,
                      label: 'Tank Material *',
                      validator: (v) =>
                          Validators.required(v, fieldLabel: 'Tank material'),
                      onChanged: (v) {
                        _work.tankMaterial = v;
                        widget.onChanged();
                      },
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
