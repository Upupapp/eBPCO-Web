import 'package:flutter/material.dart';

import '../../../../../core/models/electronics_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/chips/app_chip.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';

/// Step 4 — Nature of Electronics Installation (Box 2). Multi-select
/// chips, matching the mobile-friendly multi-select pattern already used
/// by every other permit's scope/system selection — not the paper form's
/// desktop-style table. At least one system must be selected; the final
/// "Any Other" option requires a specification when selected.
class Step4InstallationNature extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final ElectronicsPermitDraft draft;
  final VoidCallback onChanged;

  const Step4InstallationNature({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step4InstallationNature> createState() =>
      _Step4InstallationNatureState();
}

class _Step4InstallationNatureState extends State<Step4InstallationNature> {
  late final TextEditingController _otherSpecification;

  ElectronicsInstallationNature get _nature => widget.draft.installationNature;

  @override
  void initState() {
    super.initState();
    _otherSpecification = TextEditingController(
      text: _nature.otherSystemSpecification,
    );
  }

  @override
  void dispose() {
    _otherSpecification.dispose();
    super.dispose();
  }

  void _toggleSystem(ElectronicsSystemType type, bool selected) {
    setState(() {
      if (selected) {
        _nature.selectedSystems.add(type);
      } else {
        _nature.selectedSystems.remove(type);
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
            Text(
              'Nature of Electronics Installation',
              style: AppTypography.cardTitle,
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Select every electronics and IT system covered by this '
              'application.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: [
                for (final type in ElectronicsSystemType.values)
                  AppChip(
                    label: type.label,
                    selected: _nature.selectedSystems.contains(type),
                    onSelected: (selected) => _toggleSystem(type, selected),
                  ),
              ],
            ),
            if (_nature.selectedSystems.contains(
              ElectronicsSystemType.anyOtherElectronicsAndItSystem,
            )) ...[
              const SizedBox(height: AppSpacing.md),
              AppTextField(
                controller: _otherSpecification,
                label: 'Specify Other System *',
                maxLines: 3,
                validator: (v) => Validators.required(
                  v,
                  fieldLabel: 'Other system specification',
                ),
                onChanged: (v) {
                  _nature.otherSystemSpecification = v;
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
