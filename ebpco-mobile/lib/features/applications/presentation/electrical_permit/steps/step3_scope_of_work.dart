import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/electrical_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/chips/app_chip.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';
import '../../building_permit/widgets/date_picker_field.dart';

/// Step 3 — Scope of Electrical Work. Multiple scopes may be selected;
/// one selected scope must be marked as the primary scope.
class Step3ScopeOfWork extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final ElectricalPermitDraft draft;
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
  late final TextEditingController _previousServiceDetails;
  late final TextEditingController _reasonForChange;
  late final TextEditingController _separationServicesDescription;
  late final TextEditingController _existingServiceCapacity;
  late final TextEditingController _proposedServiceCapacity;
  late final TextEditingController _existingServiceEntranceLocation;
  late final TextEditingController _proposedServiceEntranceLocation;
  late final TextEditingController _previousInspectionReference;

  ElectricalScopeOfWork get _scope => widget.draft.scopeOfWork;

  @override
  void initState() {
    super.initState();
    _otherScope = TextEditingController(text: _scope.otherScopeDescription);
    _workTitle = TextEditingController(text: _scope.workTitle);
    _generalDescription = TextEditingController(text: _scope.generalDescription);
    _existingCondition = TextEditingController(
      text: _scope.existingElectricalCondition,
    );
    _proposedChanges = TextEditingController(
      text: _scope.proposedElectricalChanges,
    );
    _previousServiceDetails = TextEditingController(
      text: _scope.previousServiceDetails,
    );
    _reasonForChange = TextEditingController(text: _scope.reasonForChange);
    _separationServicesDescription = TextEditingController(
      text: _scope.separationServicesDescription,
    );
    _existingServiceCapacity = TextEditingController(
      text: _scope.existingServiceCapacity,
    );
    _proposedServiceCapacity = TextEditingController(
      text: _scope.proposedServiceCapacity,
    );
    _existingServiceEntranceLocation = TextEditingController(
      text: _scope.existingServiceEntranceLocation,
    );
    _proposedServiceEntranceLocation = TextEditingController(
      text: _scope.proposedServiceEntranceLocation,
    );
    _previousInspectionReference = TextEditingController(
      text: _scope.previousInspectionReference,
    );
  }

  @override
  void dispose() {
    _otherScope.dispose();
    _workTitle.dispose();
    _generalDescription.dispose();
    _existingCondition.dispose();
    _proposedChanges.dispose();
    _previousServiceDetails.dispose();
    _reasonForChange.dispose();
    _separationServicesDescription.dispose();
    _existingServiceCapacity.dispose();
    _proposedServiceCapacity.dispose();
    _existingServiceEntranceLocation.dispose();
    _proposedServiceEntranceLocation.dispose();
    _previousInspectionReference.dispose();
    super.dispose();
  }

  void _toggleScope(ElectricalScopeType type, bool selected) {
    setState(() {
      if (selected) {
        _scope.selectedScopes.add(type);
        _scope.primaryScope ??= type;
      } else {
        _scope.selectedScopes.remove(type);
        if (_scope.primaryScope == type) {
          _scope.primaryScope = _scope.selectedScopes.isEmpty
              ? null
              : _scope.selectedScopes.first;
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
                for (final type in ElectricalScopeType.values)
                  AppChip(
                    label: type.label,
                    selected: _scope.selectedScopes.contains(type),
                    onSelected: (selected) => _toggleScope(type, selected),
                  ),
              ],
            ),
            if (_scope.selectedScopes.contains(ElectricalScopeType.others)) ...[
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

            if (_scope.selectedScopes.length > 1) ...[
              const SizedBox(height: AppSpacing.xl),
              Text('Primary Scope', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.xs),
              Text(
                'Select which of the scopes above is the primary scope of '
                'this application.',
                style: AppTypography.bodyMuted,
              ),
              const SizedBox(height: AppSpacing.sm),
              AppCard(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
                child: RadioGroup<ElectricalScopeType>(
                  groupValue: _scope.primaryScope,
                  onChanged: (value) {
                    if (value == null) return;
                    setState(() => _scope.primaryScope = value);
                    widget.onChanged();
                  },
                  child: Column(
                    children: [
                      for (final type in _scope.selectedScopes)
                        RadioListTile<ElectricalScopeType>(
                          value: type,
                          activeColor: AppColors.primary,
                          contentPadding: EdgeInsets.zero,
                          title: Text(type.label, style: AppTypography.body),
                        ),
                    ],
                  ),
                ),
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
                    label: 'Electrical Work Title *',
                    textCapitalization: TextCapitalization.sentences,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Electrical work title',
                    ),
                    onChanged: (v) {
                      _scope.workTitle = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _generalDescription,
                    label: 'General Description of Electrical Work *',
                    maxLines: 3,
                    textCapitalization: TextCapitalization.sentences,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'General description of electrical work',
                    ),
                    onChanged: (v) {
                      _scope.generalDescription = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _existingCondition,
                    label: 'Existing Electrical Condition *',
                    maxLines: 3,
                    textCapitalization: TextCapitalization.sentences,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Existing electrical condition',
                    ),
                    onChanged: (v) {
                      _scope.existingElectricalCondition = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _proposedChanges,
                    label: 'Proposed Electrical Changes *',
                    maxLines: 3,
                    textCapitalization: TextCapitalization.sentences,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Proposed electrical changes',
                    ),
                    onChanged: (v) {
                      _scope.proposedElectricalChanges = v;
                      widget.onChanged();
                    },
                  ),
                ],
              ),
            ),

            if (_scope.hasReconnection) ...[
              const SizedBox(height: AppSpacing.xl),
              Text('Reconnection Details', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.sm),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    AppTextField(
                      controller: _previousServiceDetails,
                      label: 'Previous Service Details *',
                      maxLines: 2,
                      validator: (v) => Validators.required(
                        v,
                        fieldLabel: 'Previous service details',
                      ),
                      onChanged: (v) {
                        _scope.previousServiceDetails = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _reasonForChange,
                      label: 'Reason for Reconnection *',
                      maxLines: 2,
                      validator: (v) => Validators.required(
                        v,
                        fieldLabel: 'Reason for reconnection',
                      ),
                      onChanged: (v) {
                        _scope.reasonForChange = v;
                        widget.onChanged();
                      },
                    ),
                  ],
                ),
              ),
            ],

            if (_scope.hasSeparation) ...[
              const SizedBox(height: AppSpacing.xl),
              Text('Separation Details', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.sm),
              AppCard(
                child: AppTextField(
                  controller: _separationServicesDescription,
                  label: 'Description of Services Being Separated *',
                  maxLines: 3,
                  validator: (v) => Validators.required(
                    v,
                    fieldLabel: 'Description of services being separated',
                  ),
                  onChanged: (v) {
                    _scope.separationServicesDescription = v;
                    widget.onChanged();
                  },
                ),
              ),
            ],

            if (_scope.hasUpgrading) ...[
              const SizedBox(height: AppSpacing.xl),
              Text('Upgrading Details', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.sm),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    AppTextField(
                      controller: _existingServiceCapacity,
                      label: 'Existing Service Capacity *',
                      validator: (v) => Validators.required(
                        v,
                        fieldLabel: 'Existing service capacity',
                      ),
                      onChanged: (v) {
                        _scope.existingServiceCapacity = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _proposedServiceCapacity,
                      label: 'Proposed Service Capacity *',
                      validator: (v) => Validators.required(
                        v,
                        fieldLabel: 'Proposed service capacity',
                      ),
                      onChanged: (v) {
                        _scope.proposedServiceCapacity = v;
                        widget.onChanged();
                      },
                    ),
                  ],
                ),
              ),
            ],

            if (_scope.hasRelocation) ...[
              const SizedBox(height: AppSpacing.xl),
              Text('Relocation Details', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.sm),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    AppTextField(
                      controller: _existingServiceEntranceLocation,
                      label: 'Existing Service-Entrance Location *',
                      validator: (v) => Validators.required(
                        v,
                        fieldLabel: 'Existing service-entrance location',
                      ),
                      onChanged: (v) {
                        _scope.existingServiceEntranceLocation = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _proposedServiceEntranceLocation,
                      label: 'Proposed Service-Entrance Location *',
                      validator: (v) => Validators.required(
                        v,
                        fieldLabel: 'Proposed service-entrance location',
                      ),
                      onChanged: (v) {
                        _scope.proposedServiceEntranceLocation = v;
                        widget.onChanged();
                      },
                    ),
                  ],
                ),
              ),
            ],

            if (_scope.hasTemporaryInstallation) ...[
              const SizedBox(height: AppSpacing.xl),
              Text(
                'Temporary Installation Details',
                style: AppTypography.cardTitle,
              ),
              const SizedBox(height: AppSpacing.sm),
              AppCard(
                child: DatePickerField(
                  label: 'Expected Removal Date *',
                  value: _scope.expectedRemovalDate,
                  validator: (v) =>
                      v == null ? 'Please select an expected removal date.' : null,
                  onChanged: (v) {
                    setState(() => _scope.expectedRemovalDate = v);
                    widget.onChanged();
                  },
                ),
              ),
            ],

            if (_scope.hasAnnualInspection) ...[
              const SizedBox(height: AppSpacing.xl),
              Text('Annual Inspection Details', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.sm),
              AppCard(
                child: AppTextField(
                  controller: _previousInspectionReference,
                  label: 'Previous Inspection or Permit Reference',
                  hint: 'Optional — when available',
                  onChanged: (v) {
                    _scope.previousInspectionReference = v;
                    widget.onChanged();
                  },
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
