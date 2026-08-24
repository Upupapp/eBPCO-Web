import 'package:flutter/material.dart';

import '../../../../../core/models/fsic_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/alerts/app_alert.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_dropdown.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';

/// Step 1 — Related Occupancy/Building Permit. Unlike FSEC's purely
/// informational reference, this permit genuinely depends on a completed
/// building, so the Occupancy Permit Number is required once the status
/// is marked Approved — the same gating pattern used by the Sign and
/// Fencing Permits' own related-Building-Permit step.
class Step1RelatedOccupancyPermit extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final FsicPermitDraft draft;
  final VoidCallback onChanged;

  const Step1RelatedOccupancyPermit({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step1RelatedOccupancyPermit> createState() =>
      _Step1RelatedOccupancyPermitState();
}

class _Step1RelatedOccupancyPermitState
    extends State<Step1RelatedOccupancyPermit> {
  late final TextEditingController _occupancyPermitNumber;

  FsicRelatedOccupancyPermit get _relatedPermit =>
      widget.draft.relatedOccupancyPermit;

  @override
  void initState() {
    super.initState();
    _occupancyPermitNumber = TextEditingController(
      text: _relatedPermit.occupancyPermitNumber,
    );
  }

  @override
  void dispose() {
    _occupancyPermitNumber.dispose();
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
            Text(
              'Related Occupancy / Building Permit',
              style: AppTypography.cardTitle,
            ),
            const SizedBox(height: AppSpacing.xs),
            const AppAlert(
              variant: AppAlertVariant.info,
              message:
                  'This FSIC is associated with an Occupancy or Building '
                  'Permit for a completed structure. This permit cannot '
                  'be valid or issued until that related permit is '
                  'approved.',
            ),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppDropdown<FsicRelatedOccupancyPermitStatus>(
                    value: _relatedPermit.status,
                    label: 'Related Occupancy Permit Status *',
                    items: FsicRelatedOccupancyPermitStatus.values
                        .map(
                          (s) => DropdownMenuItem(
                            value: s,
                            child: Text(s.label),
                          ),
                        )
                        .toList(),
                    onChanged: (v) {
                      if (v == null) return;
                      setState(() => _relatedPermit.status = v);
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _occupancyPermitNumber,
                    label:
                        _relatedPermit.status ==
                            FsicRelatedOccupancyPermitStatus.approved
                        ? 'Occupancy Permit Number *'
                        : 'Occupancy Permit Number',
                    hint:
                        _relatedPermit.status ==
                            FsicRelatedOccupancyPermitStatus.approved
                        ? 'Enter the approved Occupancy Permit number.'
                        : 'Optional while pending approval.',
                    validator: (v) =>
                        _relatedPermit.status ==
                            FsicRelatedOccupancyPermitStatus.approved
                        ? Validators.required(
                            v,
                            fieldLabel: 'Occupancy Permit Number',
                          )
                        : null,
                    onChanged: (v) {
                      _relatedPermit.occupancyPermitNumber = v;
                      widget.onChanged();
                    },
                  ),
                  if (fsicMockOccupancyPermitNumbers.isNotEmpty) ...[
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      'Or select a recent Occupancy Permit application:',
                      style: AppTypography.caption,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Wrap(
                      spacing: AppSpacing.sm,
                      runSpacing: AppSpacing.sm,
                      children: [
                        for (final number in fsicMockOccupancyPermitNumbers)
                          ActionChip(
                            label: Text(number),
                            onPressed: () {
                              setState(() {
                                _occupancyPermitNumber.text = number;
                                _relatedPermit.occupancyPermitNumber = number;
                              });
                              widget.onChanged();
                            },
                          ),
                      ],
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
