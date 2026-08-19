import 'package:flutter/material.dart';

import '../../../../../core/models/architectural_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/chips/app_chip.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';

/// Step 3 — Scope of Architectural Work. At least one scope must be
/// selected; multiple scopes may apply to a single architectural project.
class Step3ScopeOfWork extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final ArchitecturalPermitDraft draft;
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
  late final TextEditingController _descriptionOfWork;
  late final TextEditingController _buildingAreasAffected;
  late final TextEditingController _existingCondition;
  late final TextEditingController _proposedChanges;

  ArchitecturalScopeOfWork get _scope => widget.draft.scopeOfWork;

  @override
  void initState() {
    super.initState();
    _otherScope = TextEditingController(text: _scope.otherScopeDescription);
    _workTitle = TextEditingController(text: _scope.workTitle);
    _descriptionOfWork = TextEditingController(text: _scope.descriptionOfWork);
    _buildingAreasAffected = TextEditingController(
      text: _scope.buildingAreasAffected,
    );
    _existingCondition = TextEditingController(text: _scope.existingCondition);
    _proposedChanges = TextEditingController(
      text: _scope.proposedArchitecturalChanges,
    );
  }

  @override
  void dispose() {
    _otherScope.dispose();
    _workTitle.dispose();
    _descriptionOfWork.dispose();
    _buildingAreasAffected.dispose();
    _existingCondition.dispose();
    _proposedChanges.dispose();
    super.dispose();
  }

  void _toggleScope(ArchitecturalScopeType type, bool selected) {
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
            Text('Scope of Architectural Work', style: AppTypography.cardTitle),
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
                for (final type in ArchitecturalScopeType.values)
                  AppChip(
                    label: type.label,
                    selected: _scope.selectedScopes.contains(type),
                    onSelected: (selected) => _toggleScope(type, selected),
                  ),
              ],
            ),
            if (_scope.selectedScopes.contains(ArchitecturalScopeType.others)) ...[
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
                    label: 'Architectural Work Title *',
                    textCapitalization: TextCapitalization.sentences,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Architectural work title',
                    ),
                    onChanged: (v) {
                      _scope.workTitle = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _descriptionOfWork,
                    label: 'Description of Architectural Work *',
                    maxLines: 3,
                    textCapitalization: TextCapitalization.sentences,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Description of architectural work',
                    ),
                    onChanged: (v) {
                      _scope.descriptionOfWork = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _buildingAreasAffected,
                    label: 'Building Areas Affected *',
                    maxLines: 2,
                    textCapitalization: TextCapitalization.sentences,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Building areas affected',
                    ),
                    onChanged: (v) {
                      _scope.buildingAreasAffected = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _existingCondition,
                    label: 'Existing Condition *',
                    maxLines: 3,
                    textCapitalization: TextCapitalization.sentences,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Existing condition',
                    ),
                    onChanged: (v) {
                      _scope.existingCondition = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _proposedChanges,
                    label: 'Proposed Architectural Changes *',
                    maxLines: 3,
                    textCapitalization: TextCapitalization.sentences,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Proposed architectural changes',
                    ),
                    onChanged: (v) {
                      _scope.proposedArchitecturalChanges = v;
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
