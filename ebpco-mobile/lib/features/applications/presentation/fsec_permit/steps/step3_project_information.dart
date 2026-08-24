import 'package:flutter/material.dart';

import '../../../../../core/models/fsec_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_dropdown.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';

/// Step 3 — Project & Fire-Safety Information.
class Step3ProjectInformation extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final FsecPermitDraft draft;
  final VoidCallback onChanged;

  const Step3ProjectInformation({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step3ProjectInformation> createState() =>
      _Step3ProjectInformationState();
}

class _Step3ProjectInformationState extends State<Step3ProjectInformation> {
  late final TextEditingController _projectName;
  late final TextEditingController _street;
  late final TextEditingController _barangay;
  late final TextEditingController _city;
  late final TextEditingController _province;
  late final TextEditingController _occupancyOther;
  late final TextEditingController _numberOfStoreys;
  late final TextEditingController _totalFloorArea;
  late final TextEditingController _fireProtectionFeatures;

  FsecProjectInformation get _project => widget.draft.projectInformation;

  @override
  void initState() {
    super.initState();
    _projectName = TextEditingController(text: _project.projectName);
    _street = TextEditingController(text: _project.street);
    _barangay = TextEditingController(text: _project.barangay);
    _city = TextEditingController(text: _project.city);
    _province = TextEditingController(text: _project.province);
    _occupancyOther = TextEditingController(
      text: _project.occupancyOtherDescription,
    );
    _numberOfStoreys = TextEditingController(text: _project.numberOfStoreys);
    _totalFloorArea = TextEditingController(
      text: _project.totalFloorAreaSquareMeters,
    );
    _fireProtectionFeatures = TextEditingController(
      text: _project.fireProtectionFeaturesDescription,
    );
  }

  @override
  void dispose() {
    _projectName.dispose();
    _street.dispose();
    _barangay.dispose();
    _city.dispose();
    _province.dispose();
    _occupancyOther.dispose();
    _numberOfStoreys.dispose();
    _totalFloorArea.dispose();
    _fireProtectionFeatures.dispose();
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
            Text('Project Information', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _projectName,
                    label: 'Project Name *',
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'Project name'),
                    onChanged: (v) {
                      _project.projectName = v;
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
                      _project.street = v;
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
                      _project.barangay = v;
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
                      _project.city = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _province,
                    label: 'Province *',
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'Province'),
                    onChanged: (v) {
                      _project.province = v;
                      widget.onChanged();
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Occupancy & Fire Safety', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppDropdown<FsecOccupancyGroup>(
                    value: _project.occupancyGroup,
                    label: 'Use or Character of Occupancy *',
                    items: FsecOccupancyGroup.values
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
                      setState(() => _project.occupancyGroup = v);
                      widget.onChanged();
                    },
                  ),
                  if (_project.occupancyGroup ==
                      FsecOccupancyGroup.others) ...[
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _occupancyOther,
                      label: 'Specify Occupancy *',
                      validator: (v) =>
                          Validators.required(v, fieldLabel: 'Occupancy'),
                      onChanged: (v) {
                        _project.occupancyOtherDescription = v;
                        widget.onChanged();
                      },
                    ),
                  ],
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
                      _project.numberOfStoreys = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _totalFloorArea,
                    label: 'Total Floor Area (sq. m.) *',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    validator: (v) => Validators.positiveDecimal(
                      v,
                      fieldLabel: 'Total floor area',
                    ),
                    onChanged: (v) {
                      _project.totalFloorAreaSquareMeters = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  SwitchListTile.adaptive(
                    contentPadding: EdgeInsets.zero,
                    title: const Text(
                      'Does the project include a fire detection or '
                      'sprinkler system?',
                    ),
                    value: _project.hasFireDetectionOrSprinklerSystem,
                    onChanged: (v) {
                      setState(
                        () => _project.hasFireDetectionOrSprinklerSystem = v,
                      );
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  AppTextField(
                    controller: _fireProtectionFeatures,
                    label: 'Fire Protection Features',
                    hint:
                        'e.g. fire exits, alarm system, fire extinguishers',
                    maxLines: 3,
                    onChanged: (v) {
                      _project.fireProtectionFeaturesDescription = v;
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
