import 'package:flutter/material.dart';

import '../../../../../core/models/interior_design_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/chips/app_chip.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';

/// Step 4 — Nature of Interior Works (Box 2). At least one option must be
/// selected; the project description/remarks field is optional.
class Step4NatureOfWork extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final InteriorPermitDraft draft;
  final VoidCallback onChanged;

  const Step4NatureOfWork({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step4NatureOfWork> createState() => _Step4NatureOfWorkState();
}

class _Step4NatureOfWorkState extends State<Step4NatureOfWork> {
  late final TextEditingController _projectDescription;

  InteriorWorkNature get _nature => widget.draft.workNature;

  @override
  void initState() {
    super.initState();
    _projectDescription = TextEditingController(
      text: _nature.projectDescription,
    );
  }

  @override
  void dispose() {
    _projectDescription.dispose();
    super.dispose();
  }

  void _toggleNature(InteriorWorkNatureType type, bool selected) {
    setState(() {
      if (selected) {
        _nature.selectedNatures.add(type);
      } else {
        _nature.selectedNatures.remove(type);
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
            Text('Nature of Interior Works', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Select every type of interior work involved in this '
              'project.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: [
                for (final type in InteriorWorkNatureType.values)
                  AppChip(
                    label: type.label,
                    selected: _nature.selectedNatures.contains(type),
                    onSelected: (selected) => _toggleNature(type, selected),
                  ),
              ],
            ),
            const SizedBox(height: AppSpacing.xl),
            Text('Project Description', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Briefly describe the interior design project. Optional.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            AppTextField(
              controller: _projectDescription,
              label: 'Project Description / Remarks',
              hint: 'Optional',
              maxLines: 4,
              onChanged: (v) {
                _nature.projectDescription = v;
                widget.onChanged();
              },
            ),
          ],
        ),
      ),
    );
  }
}
