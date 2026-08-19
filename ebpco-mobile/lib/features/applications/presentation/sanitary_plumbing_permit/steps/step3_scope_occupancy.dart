import 'package:flutter/material.dart';

import '../../../../../core/models/sanitary_plumbing_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/chips/app_chip.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';

/// Step 3 — Scope of Work & Use/Type of Occupancy. At least one scope and
/// exactly one occupancy must be selected. Both selections use the same
/// selectable-chip-card format already established by every other
/// permit's Scope of Work section.
class Step3ScopeOccupancy extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final SanitaryPermitDraft draft;
  final VoidCallback onChanged;

  const Step3ScopeOccupancy({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step3ScopeOccupancy> createState() => _Step3ScopeOccupancyState();
}

class _Step3ScopeOccupancyState extends State<Step3ScopeOccupancy> {
  late final TextEditingController _otherScope;
  late final TextEditingController _workTitle;
  late final TextEditingController _generalDescription;
  late final TextEditingController _existingCondition;
  late final TextEditingController _proposedChanges;
  late final TextEditingController _areasAffected;
  late final TextEditingController _occupancyOther;

  SanitaryScopeOccupancy get _scope => widget.draft.scopeOccupancy;

  @override
  void initState() {
    super.initState();
    _otherScope = TextEditingController(text: _scope.otherScopeDescription);
    _workTitle = TextEditingController(text: _scope.workTitle);
    _generalDescription = TextEditingController(
      text: _scope.generalDescription,
    );
    _existingCondition = TextEditingController(
      text: _scope.existingSystemCondition,
    );
    _proposedChanges = TextEditingController(text: _scope.proposedChanges);
    _areasAffected = TextEditingController(text: _scope.areasAffected);
    _occupancyOther = TextEditingController(
      text: _scope.occupancyOtherDescription,
    );
  }

  @override
  void dispose() {
    _otherScope.dispose();
    _workTitle.dispose();
    _generalDescription.dispose();
    _existingCondition.dispose();
    _proposedChanges.dispose();
    _areasAffected.dispose();
    _occupancyOther.dispose();
    super.dispose();
  }

  void _toggleScope(SanitaryScopeType type, bool selected) {
    setState(() {
      if (selected) {
        _scope.selectedScopes.add(type);
      } else {
        _scope.selectedScopes.remove(type);
      }
    });
    widget.onChanged();
  }

  void _selectOccupancy(SanitaryOccupancyType type) {
    setState(() => _scope.occupancyType = type);
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
                for (final type in SanitaryScopeType.values)
                  AppChip(
                    label: type.label,
                    selected: _scope.selectedScopes.contains(type),
                    onSelected: (selected) => _toggleScope(type, selected),
                  ),
              ],
            ),
            if (_scope.selectedScopes.contains(SanitaryScopeType.others)) ...[
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
                    label: 'Sanitary / Plumbing Work Title *',
                    textCapitalization: TextCapitalization.sentences,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Sanitary / plumbing work title',
                    ),
                    onChanged: (v) {
                      _scope.workTitle = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _generalDescription,
                    label: 'General Description of Work *',
                    maxLines: 3,
                    textCapitalization: TextCapitalization.sentences,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'General description of work',
                    ),
                    onChanged: (v) {
                      _scope.generalDescription = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _existingCondition,
                    label: 'Existing System Condition *',
                    maxLines: 3,
                    textCapitalization: TextCapitalization.sentences,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Existing system condition',
                    ),
                    onChanged: (v) {
                      _scope.existingSystemCondition = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _proposedChanges,
                    label: 'Proposed Changes *',
                    maxLines: 3,
                    textCapitalization: TextCapitalization.sentences,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Proposed changes',
                    ),
                    onChanged: (v) {
                      _scope.proposedChanges = v;
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

            const SizedBox(height: AppSpacing.xl),
            Text('Use or Type of Occupancy', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Select the use or character of occupancy of the project.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: [
                for (final type in SanitaryOccupancyType.values)
                  AppChip(
                    label: type.label,
                    selected: _scope.occupancyType == type,
                    onSelected: (_) => _selectOccupancy(type),
                  ),
              ],
            ),
            if (_scope.occupancyType == SanitaryOccupancyType.others) ...[
              const SizedBox(height: AppSpacing.md),
              AppTextField(
                controller: _occupancyOther,
                label: 'Specify Occupancy *',
                validator: (v) =>
                    Validators.required(v, fieldLabel: 'Occupancy'),
                onChanged: (v) {
                  _scope.occupancyOtherDescription = v;
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
