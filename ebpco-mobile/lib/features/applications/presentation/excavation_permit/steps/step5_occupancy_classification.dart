import 'package:flutter/material.dart';

import '../../../../../core/models/excavation_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_dropdown.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';

/// Step 5 — Occupancy Classification. Populates the same
/// `applicant.occupancyGroup` field referenced by Box 1's "Use or
/// Character of Occupancy" — see `excavation_permit_model.dart`'s top
/// doc-comment for why this is entered only here, not duplicated in
/// Step 2.
class Step5OccupancyClassification extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final ExcavationPermitDraft draft;
  final VoidCallback onChanged;

  const Step5OccupancyClassification({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step5OccupancyClassification> createState() =>
      _Step5OccupancyClassificationState();
}

class _Step5OccupancyClassificationState
    extends State<Step5OccupancyClassification> {
  late final TextEditingController _occupancyOther;

  ExcavationApplicantInfo get _applicant => widget.draft.applicant;

  @override
  void initState() {
    super.initState();
    _occupancyOther = TextEditingController(
      text: _applicant.occupancyOtherDescription,
    );
  }

  @override
  void dispose() {
    _occupancyOther.dispose();
    super.dispose();
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
            Text('Occupancy Classification', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Select the use or character of occupancy of the project.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppDropdown<ExcavationOccupancyGroup>(
                    value: _applicant.occupancyGroup,
                    label: 'Occupancy Classification *',
                    items: ExcavationOccupancyGroup.values
                        .map(
                          (g) => DropdownMenuItem(
                            value: g,
                            child: Text(g.label),
                          ),
                        )
                        .toList(),
                    validator: (v) =>
                        v == null ? 'Please select an occupancy.' : null,
                    onChanged: (v) {
                      setState(() => _applicant.occupancyGroup = v);
                      widget.onChanged();
                    },
                  ),
                  if (_applicant.occupancyGroup ==
                      ExcavationOccupancyGroup.others) ...[
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _occupancyOther,
                      label: 'Specify Occupancy *',
                      validator: (v) =>
                          Validators.required(v, fieldLabel: 'Occupancy'),
                      onChanged: (v) {
                        _applicant.occupancyOtherDescription = v;
                        widget.onChanged();
                      },
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
