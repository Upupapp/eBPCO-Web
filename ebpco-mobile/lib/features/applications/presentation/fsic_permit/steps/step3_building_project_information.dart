import 'package:flutter/material.dart';

import '../../../../../core/models/fsic_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_dropdown.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';
import '../../building_permit/widgets/date_picker_field.dart';

/// Step 3 — Building & Project Information.
class Step3BuildingProjectInformation extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final FsicPermitDraft draft;
  final VoidCallback onChanged;

  const Step3BuildingProjectInformation({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step3BuildingProjectInformation> createState() =>
      _Step3BuildingProjectInformationState();
}

class _Step3BuildingProjectInformationState
    extends State<Step3BuildingProjectInformation> {
  late final TextEditingController _projectName;
  late final TextEditingController _street;
  late final TextEditingController _barangay;
  late final TextEditingController _city;
  late final TextEditingController _province;
  late final TextEditingController _occupancyOther;
  late final TextEditingController _numberOfStoreys;
  late final TextEditingController _totalFloorArea;

  FsicBuildingProjectInformation get _project =>
      widget.draft.buildingProjectInformation;

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
            Text('Building Details', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppDropdown<FsicOccupancyGroup>(
                    value: _project.occupancyGroup,
                    label: 'Use or Character of Occupancy *',
                    items: FsicOccupancyGroup.values
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
                      FsicOccupancyGroup.others) ...[
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
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'Date of Completion *',
                    value: _project.dateOfCompletion,
                    lastDate: DateTime.now(),
                    validator: (_) {
                      if (_project.dateOfCompletion == null) {
                        return 'Please select the date of completion.';
                      }
                      if (_project.dateOfCompletion!.isAfter(
                        DateTime.now(),
                      )) {
                        return 'Date of completion cannot be in the future.';
                      }
                      return null;
                    },
                    onChanged: (date) {
                      setState(() => _project.dateOfCompletion = date);
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
