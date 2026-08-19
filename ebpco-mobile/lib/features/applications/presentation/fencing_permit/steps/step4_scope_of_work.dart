import 'package:flutter/material.dart';

import '../../../../../core/models/fencing_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/chips/app_chip.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';

/// Step 4 — Scope of Work (Box 1). At least one option must be selected.
class Step4ScopeOfWork extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final FencingPermitDraft draft;
  final VoidCallback onChanged;

  const Step4ScopeOfWork({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step4ScopeOfWork> createState() => _Step4ScopeOfWorkState();
}

class _Step4ScopeOfWorkState extends State<Step4ScopeOfWork> {
  late final TextEditingController _otherScope;

  FencingScopeOfWork get _scope => widget.draft.scopeOfWork;

  @override
  void initState() {
    super.initState();
    _otherScope = TextEditingController(text: _scope.otherScopeDescription);
  }

  @override
  void dispose() {
    _otherScope.dispose();
    super.dispose();
  }

  void _toggleScope(FencingScopeType type, bool selected) {
    setState(() {
      if (selected) {
        _scope.selectedScopes.add(type);
      } else {
        _scope.selectedScopes.remove(type);
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
            Text('Scope of Work', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Select every option that applies to this project.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: [
                for (final type in FencingScopeType.values)
                  AppChip(
                    label: type.label,
                    selected: _scope.selectedScopes.contains(type),
                    onSelected: (selected) => _toggleScope(type, selected),
                  ),
              ],
            ),
            if (_scope.selectedScopes.contains(FencingScopeType.others)) ...[
              const SizedBox(height: AppSpacing.md),
              AppTextField(
                controller: _otherScope,
                label: 'Specify Other Scope *',
                validator: (v) =>
                    Validators.required(v, fieldLabel: 'Scope of work'),
                onChanged: (v) {
                  _scope.otherScopeDescription = v;
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
