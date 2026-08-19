import 'package:flutter/material.dart';

import '../../../../../core/models/mechanical_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/chips/app_chip.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';

/// Step 3 — Scope of Work. At least one scope must be selected; multiple
/// scopes may apply to a single mechanical project.
class Step3ScopeOfWork extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final MechanicalPermitDraft draft;
  final VoidCallback onChanged;

  const Step3ScopeOfWork({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step3ScopeOfWork> createState() => _Step3ScopeOfWorkState();
}

class _Step3ScopeOfWorkState extends State<Step3ScopeOfWork> {
  late final TextEditingController _otherScope;
  late final TextEditingController _workTitle;
  late final TextEditingController _generalDescription;
  late final TextEditingController _existingCondition;
  late final TextEditingController _proposedChanges;
  late final TextEditingController _areasAffected;

  MechanicalScopeOfWork get _scope => widget.draft.scopeOfWork;

  @override
  void initState() {
    super.initState();
    _otherScope = TextEditingController(text: _scope.otherScopeDescription);
    _workTitle = TextEditingController(text: _scope.workTitle);
    _generalDescription = TextEditingController(text: _scope.generalDescription);
    _existingCondition = TextEditingController(
      text: _scope.existingMechanicalCondition,
    );
    _proposedChanges = TextEditingController(
      text: _scope.proposedMechanicalChanges,
    );
    _areasAffected = TextEditingController(text: _scope.areasAffected);
  }

  @override
  void dispose() {
    _otherScope.dispose();
    _workTitle.dispose();
    _generalDescription.dispose();
    _existingCondition.dispose();
    _proposedChanges.dispose();
    _areasAffected.dispose();
    super.dispose();
  }

  void _toggleScope(MechanicalScopeType type, bool selected) {
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
                for (final type in MechanicalScopeType.values)
                  AppChip(
                    label: type.label,
                    selected: _scope.selectedScopes.contains(type),
                    onSelected: (selected) => _toggleScope(type, selected),
                  ),
              ],
            ),
            if (_scope.selectedScopes.contains(MechanicalScopeType.others)) ...[
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

            const SizedBox(height: AppSpacing.xl),
            Text('Project Details', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _workTitle,
                    label: 'Mechanical Work Title *',
                    textCapitalization: TextCapitalization.sentences,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Mechanical work title',
                    ),
                    onChanged: (v) {
                      _scope.workTitle = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _generalDescription,
                    label: 'General Description of Mechanical Work *',
                    maxLines: 3,
                    textCapitalization: TextCapitalization.sentences,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'General description of mechanical work',
                    ),
                    onChanged: (v) {
                      _scope.generalDescription = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _existingCondition,
                    label: 'Existing Mechanical Condition *',
                    maxLines: 3,
                    textCapitalization: TextCapitalization.sentences,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Existing mechanical condition',
                    ),
                    onChanged: (v) {
                      _scope.existingMechanicalCondition = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _proposedChanges,
                    label: 'Proposed Mechanical Changes *',
                    maxLines: 3,
                    textCapitalization: TextCapitalization.sentences,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Proposed mechanical changes',
                    ),
                    onChanged: (v) {
                      _scope.proposedMechanicalChanges = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _areasAffected,
                    label: 'Areas of the Building Affected *',
                    maxLines: 2,
                    textCapitalization: TextCapitalization.sentences,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Areas of the building affected',
                    ),
                    onChanged: (v) {
                      _scope.areasAffected = v;
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
