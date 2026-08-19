import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/renovation_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/chips/app_chip.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';

/// Step 3 — Renovation Project Information. Scope of Work is fixed to
/// "Renovation" (preselected and locked) — there is no other option in
/// this workflow, unlike New Construction's editable Scope of Work.
class Step3RenovationProjectInformation extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final RenovationPermitDraft draft;
  final VoidCallback onChanged;

  const Step3RenovationProjectInformation({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step3RenovationProjectInformation> createState() =>
      _Step3RenovationProjectInformationState();
}

class _Step3RenovationProjectInformationState
    extends State<Step3RenovationProjectInformation> {
  late final TextEditingController _projectTitle;
  late final TextEditingController _generalDescription;
  late final TextEditingController _otherAffectedArea;
  late final TextEditingController _otherRenovationDetails;

  RenovationProjectInformation get _project => widget.draft.projectInformation;

  @override
  void initState() {
    super.initState();
    _projectTitle = TextEditingController(text: _project.projectTitle);
    _generalDescription = TextEditingController(
      text: _project.generalDescription,
    );
    _otherAffectedArea = TextEditingController(
      text: _project.otherAffectedAreaDescription,
    );
    _otherRenovationDetails = TextEditingController(
      text: _project.otherRenovationDetails,
    );
  }

  @override
  void dispose() {
    _projectTitle.dispose();
    _generalDescription.dispose();
    _otherAffectedArea.dispose();
    _otherRenovationDetails.dispose();
    super.dispose();
  }

  void _toggleArea(RenovationAffectedArea area, bool selected) {
    setState(() {
      if (selected) {
        _project.affectedAreas.add(area);
      } else {
        _project.affectedAreas.remove(area);
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
                    child: Text('Renovation', style: AppTypography.bodyStrong),
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
                    label: 'Project / Renovation Title *',
                    textCapitalization: TextCapitalization.sentences,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Project or renovation title',
                    ),
                    onChanged: (v) {
                      _project.projectTitle = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _generalDescription,
                    label: 'General Description of Renovation *',
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
                    controller: _otherRenovationDetails,
                    label: 'Other Renovation Details',
                    hint: 'Optional',
                    maxLines: 3,
                    onChanged: (v) {
                      _project.otherRenovationDetails = v;
                      widget.onChanged();
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Areas or Rooms Affected', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Select every area this renovation will affect.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: [
                for (final area in RenovationAffectedArea.values)
                  AppChip(
                    label: area.label,
                    selected: _project.affectedAreas.contains(area),
                    onSelected: (selected) => _toggleArea(area, selected),
                  ),
              ],
            ),
            if (_project.affectedAreas.contains(
              RenovationAffectedArea.others,
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
