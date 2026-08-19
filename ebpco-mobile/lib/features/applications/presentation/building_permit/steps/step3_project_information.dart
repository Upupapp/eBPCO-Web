import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/building_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/alerts/app_alert.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';

/// Step 3 — Project Information: Scope of Work (multi-select, preselected
/// from the New Construction entry point but editable) and Building Use
/// (single-select radio, since only one primary occupancy applies).
class Step3ProjectInformation extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final BuildingPermitDraft draft;
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
  late final TextEditingController _scopeOtherController;
  late final TextEditingController _occupancyOtherController;

  ProjectInformation get _project => widget.draft.projectInformation;

  @override
  void initState() {
    super.initState();
    _scopeOtherController = TextEditingController(
      text: _project.scopeOfWorkOtherDescription,
    );
    _occupancyOtherController = TextEditingController(
      text: _project.occupancyOtherDescription,
    );
  }

  @override
  void dispose() {
    _scopeOtherController.dispose();
    _occupancyOtherController.dispose();
    super.dispose();
  }

  void _toggleScope(ScopeOfWorkOption option, bool? checked) {
    setState(() {
      if (checked ?? false) {
        _project.scopeOfWork.add(option);
      } else {
        _project.scopeOfWork.remove(option);
      }
    });
    widget.onChanged();
  }

  void _selectOccupancy(OccupancyGroup? group) {
    if (group == null) return;
    setState(() => _project.occupancyGroup = group);
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
            const AppAlert(
              variant: AppAlertVariant.info,
              message:
                  '"New Construction" has been preselected since you started '
                  'this application from the New Construction option. You may '
                  'adjust the scope below if needed.',
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Scope of Work', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Select all construction activities that apply.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.sm,
                vertical: AppSpacing.xs,
              ),
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final isWide = constraints.maxWidth >= 600;
                  final itemWidth = isWide
                      ? (constraints.maxWidth - AppSpacing.md) / 2
                      : constraints.maxWidth;
                  return Wrap(
                    children: [
                      for (final option in ScopeOfWorkOption.values)
                        SizedBox(
                          width: itemWidth,
                          child: CheckboxListTile(
                            dense: true,
                            controlAffinity: ListTileControlAffinity.leading,
                            contentPadding: EdgeInsets.zero,
                            activeColor: AppColors.primary,
                            title: Text(option.label, style: AppTypography.body),
                            value: _project.scopeOfWork.contains(option),
                            onChanged: (checked) =>
                                _toggleScope(option, checked),
                          ),
                        ),
                    ],
                  );
                },
              ),
            ),
            if (_project.scopeOfWork.contains(ScopeOfWorkOption.others)) ...[
              const SizedBox(height: AppSpacing.md),
              AppTextField(
                controller: _scopeOtherController,
                label: 'Specify Scope of Work *',
                validator: (v) =>
                    Validators.required(v, fieldLabel: 'Scope of work'),
                onChanged: (v) {
                  _project.scopeOfWorkOtherDescription = v;
                  widget.onChanged();
                },
              ),
            ],

            const SizedBox(height: AppSpacing.xl),
            Text('Building Use', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Select the main purpose of the proposed building.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
              child: RadioGroup<OccupancyGroup>(
                groupValue: _project.occupancyGroup,
                onChanged: _selectOccupancy,
                child: Column(
                  children: [
                    for (final group in OccupancyGroup.values)
                      RadioListTile<OccupancyGroup>(
                        value: group,
                        activeColor: AppColors.primary,
                        contentPadding: EdgeInsets.zero,
                        title: Text(group.label, style: AppTypography.body),
                        subtitle: Text(
                          group.description,
                          style: AppTypography.helper,
                        ),
                      ),
                  ],
                ),
              ),
            ),
            if (_project.occupancyGroup == OccupancyGroup.others) ...[
              const SizedBox(height: AppSpacing.md),
              AppTextField(
                controller: _occupancyOtherController,
                label: 'Specify Building Use *',
                validator: (v) =>
                    Validators.required(v, fieldLabel: 'Building use'),
                onChanged: (v) {
                  _project.occupancyOtherDescription = v;
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
