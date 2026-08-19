import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/addition_extension_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/chips/app_chip.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';

/// Step 3 — Addition / Extension Project Information. Scope of Work is
/// fixed to "Addition" (preselected and locked) — there is no other
/// option in this workflow.
class Step3ProjectInformation extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final AdditionExtensionPermitDraft draft;
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
  late final TextEditingController _projectTitle;
  late final TextEditingController _generalDescription;
  late final TextEditingController _existingBuildingDescription;
  late final TextEditingController _purposeOfProposedAddition;
  late final TextEditingController _connectionToExistingBuilding;
  late final TextEditingController _otherProjectDetails;
  late final TextEditingController _otherAdditionType;
  late final TextEditingController _otherAffectedArea;

  AdditionExtensionProjectInformation get _project =>
      widget.draft.projectInformation;

  @override
  void initState() {
    super.initState();
    _projectTitle = TextEditingController(text: _project.projectTitle);
    _generalDescription = TextEditingController(
      text: _project.generalDescription,
    );
    _existingBuildingDescription = TextEditingController(
      text: _project.existingBuildingDescription,
    );
    _purposeOfProposedAddition = TextEditingController(
      text: _project.purposeOfProposedAddition,
    );
    _connectionToExistingBuilding = TextEditingController(
      text: _project.connectionToExistingBuilding,
    );
    _otherProjectDetails = TextEditingController(
      text: _project.otherProjectDetails,
    );
    _otherAdditionType = TextEditingController(
      text: _project.otherAdditionTypeDescription,
    );
    _otherAffectedArea = TextEditingController(
      text: _project.otherAffectedAreaDescription,
    );
  }

  @override
  void dispose() {
    _projectTitle.dispose();
    _generalDescription.dispose();
    _existingBuildingDescription.dispose();
    _purposeOfProposedAddition.dispose();
    _connectionToExistingBuilding.dispose();
    _otherProjectDetails.dispose();
    _otherAdditionType.dispose();
    _otherAffectedArea.dispose();
    super.dispose();
  }

  void _selectAdditionType(AdditionType type) {
    setState(() => _project.additionType = type);
    widget.onChanged();
  }

  void _toggleArea(AffectedBuildingArea area, bool selected) {
    setState(() {
      if (area == AffectedBuildingArea.none) {
        // "None" is mutually exclusive with every other selection.
        _project.affectedAreas.clear();
        if (selected) {
          _project.affectedAreas.add(AffectedBuildingArea.none);
        }
      } else {
        _project.affectedAreas.remove(AffectedBuildingArea.none);
        if (selected) {
          _project.affectedAreas.add(area);
        } else {
          _project.affectedAreas.remove(area);
        }
      }
    });
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
            Text('Official Scope of Work', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Row(
                children: [
                  const Icon(
                    Icons.check_circle,
                    color: AppColors.statusApproved,
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Text(
                      widget.draft.scopeOfWork.displayLabel,
                      style: AppTypography.bodyStrong,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Project Details', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _projectTitle,
                    label: 'Project Title *',
                    textCapitalization: TextCapitalization.sentences,
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'Project title'),
                    onChanged: (v) {
                      _project.projectTitle = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _generalDescription,
                    label: 'General Description of the Addition / Extension *',
                    maxLines: 3,
                    textCapitalization: TextCapitalization.sentences,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'General description',
                    ),
                    onChanged: (v) {
                      _project.generalDescription = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _existingBuildingDescription,
                    label: 'Existing Building Description *',
                    hint: 'What does the existing building currently look like?',
                    maxLines: 3,
                    textCapitalization: TextCapitalization.sentences,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Existing building description',
                    ),
                    onChanged: (v) {
                      _project.existingBuildingDescription = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _purposeOfProposedAddition,
                    label: 'Purpose of the Proposed Addition *',
                    maxLines: 3,
                    textCapitalization: TextCapitalization.sentences,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Purpose of the proposed addition',
                    ),
                    onChanged: (v) {
                      _project.purposeOfProposedAddition = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _connectionToExistingBuilding,
                    label: 'Connection to Existing Building *',
                    hint: 'How will the addition physically connect?',
                    maxLines: 3,
                    textCapitalization: TextCapitalization.sentences,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Connection to existing building',
                    ),
                    onChanged: (v) {
                      _project.connectionToExistingBuilding = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _otherProjectDetails,
                    label: 'Other Project Details',
                    hint: 'Optional',
                    maxLines: 3,
                    onChanged: (v) {
                      _project.otherProjectDetails = v;
                      widget.onChanged();
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Addition Type', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Select the option that best describes the addition.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
              child: RadioGroup<AdditionType>(
                groupValue: _project.additionType,
                onChanged: (value) {
                  if (value != null) _selectAdditionType(value);
                },
                child: Column(
                  children: [
                    for (final type in AdditionType.values)
                      RadioListTile<AdditionType>(
                        value: type,
                        activeColor: AppColors.primary,
                        contentPadding: EdgeInsets.zero,
                        title: Text(type.label, style: AppTypography.body),
                      ),
                  ],
                ),
              ),
            ),
            if (_project.additionType == AdditionType.others) ...[
              const SizedBox(height: AppSpacing.md),
              AppTextField(
                controller: _otherAdditionType,
                label: 'Specify Addition Type *',
                validator: (v) =>
                    Validators.required(v, fieldLabel: 'Addition type'),
                onChanged: (v) {
                  _project.otherAdditionTypeDescription = v;
                  widget.onChanged();
                },
              ),
            ],

            const SizedBox(height: AppSpacing.xl),
            Text(
              'Areas Affected in the Existing Building',
              style: AppTypography.cardTitle,
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Select every part of the existing building this project '
              'affects, or "None" if it doesn\'t affect any of them.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: [
                for (final area in AffectedBuildingArea.values)
                  AppChip(
                    label: area.label,
                    selected: _project.affectedAreas.contains(area),
                    onSelected: (selected) => _toggleArea(area, selected),
                  ),
              ],
            ),
            if (_project.affectedAreas.contains(
              AffectedBuildingArea.others,
            )) ...[
              const SizedBox(height: AppSpacing.md),
              AppTextField(
                controller: _otherAffectedArea,
                label: 'Specify Other Affected Area *',
                validator: (v) =>
                    Validators.required(v, fieldLabel: 'Affected area'),
                onChanged: (v) {
                  _project.otherAffectedAreaDescription = v;
                  widget.onChanged();
                },
              ),
            ],
          ],
        ),
      ),
    );
  }
}
