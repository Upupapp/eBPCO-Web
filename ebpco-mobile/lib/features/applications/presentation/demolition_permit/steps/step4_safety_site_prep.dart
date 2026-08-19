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
import '../../../../../shared/widgets/uploads/document_upload_tile.dart';
import '../../building_permit/widgets/date_picker_field.dart';
import '../../building_permit/widgets/mock_upload.dart';

/// Step 4 — Demolition Safety & Site Preparation: building-occupancy
/// clearance, per-utility disconnection tracking, ten required safety
/// confirmations, and site/surroundings risk mitigation.
class Step4SafetySitePrep extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final DemolitionPermitDraft draft;
  final VoidCallback onChanged;

  const Step4SafetySitePrep({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step4SafetySitePrep> createState() => _Step4SafetySitePrepState();
}

class _Step4SafetySitePrepState extends State<Step4SafetySitePrep> {
  late final TextEditingController _occupantRelocationPlan;
  late final TextEditingController _personResponsibleForClearing;
  late final TextEditingController _distanceToNearestStructure;
  late final TextEditingController _sidewalkMitigation;
  late final TextEditingController _roadMitigation;
  late final TextEditingController _neighboringPropertiesMitigation;
  late final TextEditingController _debrisDisposalLocation;
  late final TextEditingController _siteSecurityMethod;
  late final TextEditingController _dustControlMethod;
  late final TextEditingController _noiseControlMethod;

  final Map<UtilityType, TextEditingController> _utilityProviders = {};
  final Map<UtilityType, TextEditingController> _utilityReferenceNumbers = {};

  DemolitionSafetyAndSitePrep get _safety => widget.draft.safetyAndSitePrep;

  @override
  void initState() {
    super.initState();
    _occupantRelocationPlan = TextEditingController(
      text: _safety.occupantRelocationPlan,
    );
    _personResponsibleForClearing = TextEditingController(
      text: _safety.personResponsibleForClearing,
    );
    _distanceToNearestStructure = TextEditingController(
      text: _safety.distanceToNearestStructure,
    );
    _sidewalkMitigation = TextEditingController(
      text: _safety.sidewalkMitigation,
    );
    _roadMitigation = TextEditingController(text: _safety.roadMitigation);
    _neighboringPropertiesMitigation = TextEditingController(
      text: _safety.neighboringPropertiesMitigation,
    );
    _debrisDisposalLocation = TextEditingController(
      text: _safety.debrisDisposalLocation,
    );
    _siteSecurityMethod = TextEditingController(
      text: _safety.siteSecurityMethod,
    );
    _dustControlMethod = TextEditingController(
      text: _safety.dustControlMethod,
    );
    _noiseControlMethod = TextEditingController(
      text: _safety.noiseControlMethod,
    );
    for (final type in UtilityType.values) {
      _utilityProviders[type] = TextEditingController(
        text: _safety.utilities[type]!.provider,
      );
      _utilityReferenceNumbers[type] = TextEditingController(
        text: _safety.utilities[type]!.referenceNumber,
      );
    }
  }

  @override
  void dispose() {
    _occupantRelocationPlan.dispose();
    _personResponsibleForClearing.dispose();
    _distanceToNearestStructure.dispose();
    _sidewalkMitigation.dispose();
    _roadMitigation.dispose();
    _neighboringPropertiesMitigation.dispose();
    _debrisDisposalLocation.dispose();
    _siteSecurityMethod.dispose();
    _dustControlMethod.dispose();
    _noiseControlMethod.dispose();
    for (final controller in _utilityProviders.values) {
      controller.dispose();
    }
    for (final controller in _utilityReferenceNumbers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  void _toggleSafetyItem(SafetyConfirmationItem item, bool checked) {
    setState(() {
      if (checked) {
        _safety.confirmedSafetyItems.add(item);
      } else {
        _safety.confirmedSafetyItems.remove(item);
      }
    });
    widget.onChanged();
  }

  void _uploadUtilityDocument(UtilityType type) {
    setState(() {
      _safety.utilities[type]!.supportingDocument = createMockDocument(
        '${type.label} Disconnection Document',
      );
    });
    widget.onChanged();
  }

  @override
  Widget build(BuildContext context) {
    final isOccupied = _safety.isBuildingOccupied == true;

    return Form(
      key: widget.formKey,
      child: FormScrollScaffold(
        centerVertically: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Building Occupancy', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Is the building currently occupied?',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            Row(
              children: [
                Expanded(
                  child: _YesNoOption(
                    label: 'Yes',
                    selected: _safety.isBuildingOccupied == true,
                    onTap: () {
                      setState(() => _safety.isBuildingOccupied = true);
                      widget.onChanged();
                    },
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: _YesNoOption(
                    label: 'No',
                    selected: _safety.isBuildingOccupied == false,
                    onTap: () {
                      setState(() => _safety.isBuildingOccupied = false);
                      widget.onChanged();
                    },
                  ),
                ),
              ],
            ),
            if (isOccupied) ...[
              const SizedBox(height: AppSpacing.md),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    DatePickerField(
                      label: 'Planned Vacation Date *',
                      value: _safety.plannedVacationDate,
                      validator: (v) {
                        if (v == null) {
                          return 'Please select a planned vacation date.';
                        }
                        final start = widget.draft.structureDetails.proposedStartDate;
                        if (start != null && start.isBefore(v)) {
                          return 'The proposed start date cannot be before this date.';
                        }
                        return null;
                      },
                      onChanged: (v) {
                        setState(() => _safety.plannedVacationDate = v);
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _occupantRelocationPlan,
                      label: 'Occupant Relocation Plan *',
                      maxLines: 3,
                      validator: (v) => Validators.required(
                        v,
                        fieldLabel: 'Occupant relocation plan',
                      ),
                      onChanged: (v) {
                        _safety.occupantRelocationPlan = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _personResponsibleForClearing,
                      label: 'Person Responsible for Clearing the Building *',
                      validator: (v) => Validators.required(
                        v,
                        fieldLabel: 'Person responsible for clearing',
                      ),
                      onChanged: (v) {
                        _safety.personResponsibleForClearing = v;
                        widget.onChanged();
                      },
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: AppSpacing.xl),
            Text('Utility Disconnection', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'For every utility connected to the structure, indicate its '
              'disconnection status.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            for (final type in UtilityType.values) ...[
              _UtilityCard(
                type: type,
                info: _safety.utilities[type]!,
                providerController: _utilityProviders[type]!,
                referenceNumberController: _utilityReferenceNumbers[type]!,
                onStatusChanged: (status) {
                  setState(() => _safety.utilities[type]!.status = status);
                  widget.onChanged();
                },
                onProviderChanged: (v) {
                  _safety.utilities[type]!.provider = v;
                  widget.onChanged();
                },
                onDateChanged: (v) {
                  setState(() => _safety.utilities[type]!.disconnectionDate = v);
                  widget.onChanged();
                },
                onReferenceNumberChanged: (v) {
                  _safety.utilities[type]!.referenceNumber = v;
                  widget.onChanged();
                },
                onUpload: () => _uploadUtilityDocument(type),
                onRemoveUpload: () {
                  setState(
                    () => _safety.utilities[type]!.supportingDocument = null,
                  );
                  widget.onChanged();
                },
              ),
              const SizedBox(height: AppSpacing.md),
            ],

            const SizedBox(height: AppSpacing.lg),
            Text('Safety Confirmations', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Confirm every safety measure below before proceeding.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
              child: Column(
                children: [
                  for (final item in SafetyConfirmationItem.values)
                    CheckboxListTile(
                      value: _safety.confirmedSafetyItems.contains(item),
                      activeColor: AppColors.primary,
                      contentPadding: EdgeInsets.zero,
                      controlAffinity: ListTileControlAffinity.leading,
                      title: Text(item.label, style: AppTypography.body),
                      onChanged: (checked) =>
                          _toggleSafetyItem(item, checked ?? false),
                    ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Site & Surroundings', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _distanceToNearestStructure,
                    label: 'Distance to Nearest Adjacent Structure (m) *',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    validator: (v) => v == null || v.trim().isEmpty
                        ? 'This field is required.'
                        : (double.tryParse(v.trim()) == null
                              ? 'Enter a valid number.'
                              : (double.parse(v.trim()) < 0
                                    ? 'This value cannot be negative.'
                                    : null)),
                    onChanged: (v) {
                      _safety.distanceToNearestStructure = v;
                      widget.onChanged();
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              'Will a public sidewalk be affected?',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            Row(
              children: [
                Expanded(
                  child: _YesNoOption(
                    label: 'Yes',
                    selected: _safety.isPublicSidewalkAffected == true,
                    onTap: () {
                      setState(() => _safety.isPublicSidewalkAffected = true);
                      widget.onChanged();
                    },
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: _YesNoOption(
                    label: 'No',
                    selected: _safety.isPublicSidewalkAffected == false,
                    onTap: () {
                      setState(() => _safety.isPublicSidewalkAffected = false);
                      widget.onChanged();
                    },
                  ),
                ),
              ],
            ),
            if (_safety.isPublicSidewalkAffected == true) ...[
              const SizedBox(height: AppSpacing.md),
              AppTextField(
                controller: _sidewalkMitigation,
                label: 'Sidewalk Protection / Mitigation Measures *',
                maxLines: 2,
                validator: (v) => Validators.required(
                  v,
                  fieldLabel: 'Sidewalk mitigation measures',
                ),
                onChanged: (v) {
                  _safety.sidewalkMitigation = v;
                  widget.onChanged();
                },
              ),
            ],

            const SizedBox(height: AppSpacing.md),
            Text(
              'Will a public road be affected?',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            Row(
              children: [
                Expanded(
                  child: _YesNoOption(
                    label: 'Yes',
                    selected: _safety.isPublicRoadAffected == true,
                    onTap: () {
                      setState(() => _safety.isPublicRoadAffected = true);
                      widget.onChanged();
                    },
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: _YesNoOption(
                    label: 'No',
                    selected: _safety.isPublicRoadAffected == false,
                    onTap: () {
                      setState(() => _safety.isPublicRoadAffected = false);
                      widget.onChanged();
                    },
                  ),
                ),
              ],
            ),
            if (_safety.isPublicRoadAffected == true) ...[
              const SizedBox(height: AppSpacing.md),
              AppTextField(
                controller: _roadMitigation,
                label: 'Road Protection / Mitigation Measures *',
                maxLines: 2,
                validator: (v) => Validators.required(
                  v,
                  fieldLabel: 'Road mitigation measures',
                ),
                onChanged: (v) {
                  _safety.roadMitigation = v;
                  widget.onChanged();
                },
              ),
            ],

            const SizedBox(height: AppSpacing.md),
            Text(
              'Are neighboring properties at risk?',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            Row(
              children: [
                Expanded(
                  child: _YesNoOption(
                    label: 'Yes',
                    selected: _safety.areNeighboringPropertiesAtRisk == true,
                    onTap: () {
                      setState(
                        () => _safety.areNeighboringPropertiesAtRisk = true,
                      );
                      widget.onChanged();
                    },
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: _YesNoOption(
                    label: 'No',
                    selected: _safety.areNeighboringPropertiesAtRisk == false,
                    onTap: () {
                      setState(
                        () => _safety.areNeighboringPropertiesAtRisk = false,
                      );
                      widget.onChanged();
                    },
                  ),
                ),
              ],
            ),
            if (_safety.areNeighboringPropertiesAtRisk == true) ...[
              const SizedBox(height: AppSpacing.md),
              AppTextField(
                controller: _neighboringPropertiesMitigation,
                label: 'Neighboring Property Protection Measures *',
                maxLines: 2,
                validator: (v) => Validators.required(
                  v,
                  fieldLabel: 'Neighboring property protection measures',
                ),
                onChanged: (v) {
                  _safety.neighboringPropertiesMitigation = v;
                  widget.onChanged();
                },
              ),
            ],

            const SizedBox(height: AppSpacing.xl),
            Text('Site Management', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _debrisDisposalLocation,
                    label: 'Debris Disposal Location *',
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Debris disposal location',
                    ),
                    onChanged: (v) {
                      _safety.debrisDisposalLocation = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _siteSecurityMethod,
                    label: 'Site Security Method *',
                    maxLines: 2,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Site security method',
                    ),
                    onChanged: (v) {
                      _safety.siteSecurityMethod = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _dustControlMethod,
                    label: 'Dust Control Method *',
                    maxLines: 2,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Dust control method',
                    ),
                    onChanged: (v) {
                      _safety.dustControlMethod = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _noiseControlMethod,
                    label: 'Noise Control Method *',
                    maxLines: 2,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Noise control method',
                    ),
                    onChanged: (v) {
                      _safety.noiseControlMethod = v;
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

class _UtilityCard extends StatelessWidget {
  final UtilityType type;
  final UtilityDisconnectionInfo info;
  final TextEditingController providerController;
  final TextEditingController referenceNumberController;
  final ValueChanged<UtilityDisconnectionStatus> onStatusChanged;
  final ValueChanged<String> onProviderChanged;
  final ValueChanged<DateTime?> onDateChanged;
  final ValueChanged<String> onReferenceNumberChanged;
  final VoidCallback onUpload;
  final VoidCallback onRemoveUpload;

  const _UtilityCard({
    required this.type,
    required this.info,
    required this.providerController,
    required this.referenceNumberController,
    required this.onStatusChanged,
    required this.onProviderChanged,
    required this.onDateChanged,
    required this.onReferenceNumberChanged,
    required this.onUpload,
    required this.onRemoveUpload,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(type.label, style: AppTypography.bodyStrong),
          const SizedBox(height: AppSpacing.sm),
          AppDropdown<UtilityDisconnectionStatus>(
            value: info.status,
            label: 'Disconnection Status *',
            items: UtilityDisconnectionStatus.values
                .map((s) => DropdownMenuItem(value: s, child: Text(s.label)))
                .toList(),
            onChanged: (v) {
              if (v != null) onStatusChanged(v);
            },
          ),
          if (info.isApplicable) ...[
            const SizedBox(height: AppSpacing.md),
            AppTextField(
              controller: providerController,
              label: 'Utility Provider *',
              validator: (v) =>
                  Validators.required(v, fieldLabel: 'Utility provider'),
              onChanged: onProviderChanged,
            ),
            const SizedBox(height: AppSpacing.md),
            DatePickerField(
              label: 'Disconnection Date *',
              value: info.disconnectionDate,
              validator: (v) =>
                  v == null ? 'Please select a disconnection date.' : null,
              onChanged: onDateChanged,
            ),
            const SizedBox(height: AppSpacing.md),
            AppTextField(
              controller: referenceNumberController,
              label: 'Reference Number *',
              validator: (v) =>
                  Validators.required(v, fieldLabel: 'Reference number'),
              onChanged: onReferenceNumberChanged,
            ),
            const SizedBox(height: AppSpacing.md),
            DocumentUploadTile(
              label: '${type.label} Disconnection Document',
              document: info.supportingDocument,
              onUpload: onUpload,
              allowReplace: true,
              onRemove: onRemoveUpload,
            ),
          ],
        ],
      ),
    );
  }
}

class _YesNoOption extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _YesNoOption({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: onTap,
      backgroundColor: selected ? AppColors.lightBlue : AppColors.surface,
      showBorder: !selected,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            selected ? Icons.check_circle : Icons.radio_button_unchecked,
            color: selected ? AppColors.secondaryBlue : AppColors.textMuted,
            size: 20,
          ),
          const SizedBox(width: AppSpacing.sm),
          Text(
            label,
            style: selected
                ? AppTypography.bodyStrong.copyWith(
                    color: AppColors.secondaryBlueDark,
                  )
                : AppTypography.body,
          ),
        ],
      ),
    );
  }
}
