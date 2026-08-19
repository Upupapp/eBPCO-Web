import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../../../core/models/excavation_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/alerts/app_alert.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/chips/app_chip.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';

/// Step 6 — Excavation Details (Box 6). Multiple excavation work types
/// may apply to one project, so this is a multi-select. Depth and volume
/// each independently trigger an informational (non-blocking) notice
/// when they exceed the permit's cash-bond thresholds — no fee is
/// calculated or collected here.
class Step6ExcavationDetails extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final ExcavationPermitDraft draft;
  final VoidCallback onChanged;

  const Step6ExcavationDetails({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step6ExcavationDetails> createState() =>
      _Step6ExcavationDetailsState();
}

class _Step6ExcavationDetailsState extends State<Step6ExcavationDetails> {
  late final TextEditingController _otherWorkType;
  late final TextEditingController _depth;
  late final TextEditingController _volume;

  ExcavationDetails get _details => widget.draft.excavationDetails;

  @override
  void initState() {
    super.initState();
    _otherWorkType = TextEditingController(
      text: _details.otherWorkTypeDescription,
    );
    _depth = TextEditingController(text: _details.excavationDepthMeters);
    _volume = TextEditingController(
      text: _details.excavationVolumeCubicMeters,
    );
  }

  @override
  void dispose() {
    _otherWorkType.dispose();
    _depth.dispose();
    _volume.dispose();
    super.dispose();
  }

  void _toggleWorkType(ExcavationWorkType type, bool selected) {
    setState(() {
      if (selected) {
        _details.selectedWorkTypes.add(type);
      } else {
        _details.selectedWorkTypes.remove(type);
      }
    });
    widget.onChanged();
  }

  @override
  Widget build(BuildContext context) {
    final decimalFormatters = [
      FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*')),
    ];

    return Form(
      key: widget.formKey,
      child: FormScrollScaffold(
        centerVertically: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Excavation Work', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Select every type of excavation work to be performed.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: [
                for (final type in ExcavationWorkType.values)
                  AppChip(
                    label: type.label,
                    selected: _details.selectedWorkTypes.contains(type),
                    onSelected: (selected) =>
                        _toggleWorkType(type, selected),
                  ),
              ],
            ),
            if (_details.selectedWorkTypes.contains(
              ExcavationWorkType.others,
            )) ...[
              const SizedBox(height: AppSpacing.md),
              AppTextField(
                controller: _otherWorkType,
                label: 'Specify Other Excavation Work *',
                validator: (v) => Validators.required(
                  v,
                  fieldLabel: 'Excavation work',
                ),
                onChanged: (v) {
                  _details.otherWorkTypeDescription = v;
                  widget.onChanged();
                },
              ),
            ],

            const SizedBox(height: AppSpacing.xl),
            Text('Excavation Measurements', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _depth,
                    label: 'Estimated Excavation Depth (meters) *',
                    hint: 'e.g. 1.5',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    inputFormatters: decimalFormatters,
                    validator: (v) => Validators.positiveDecimal(
                      v,
                      fieldLabel: 'Excavation depth',
                    ),
                    onChanged: (v) {
                      setState(() => _details.excavationDepthMeters = v);
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _volume,
                    label: 'Estimated Excavation Volume (cubic meters) *',
                    hint: 'e.g. 20',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    inputFormatters: decimalFormatters,
                    validator: (v) => Validators.positiveDecimal(
                      v,
                      fieldLabel: 'Excavation volume',
                    ),
                    onChanged: (v) {
                      setState(
                        () => _details.excavationVolumeCubicMeters = v,
                      );
                      widget.onChanged();
                    },
                  ),
                ],
              ),
            ),
            if (_details.exceedsDepthThreshold ||
                _details.exceedsVolumeThreshold) ...[
              const SizedBox(height: AppSpacing.md),
              AppAlert(
                variant: AppAlertVariant.warning,
                message: _details.exceedsDepthThreshold &&
                        _details.exceedsVolumeThreshold
                    ? 'This excavation exceeds both the 2-meter depth and '
                        '50-cubic-meter volume thresholds. Larger '
                        'excavations may require a cash bond per the '
                        'permit conditions.'
                    : _details.exceedsDepthThreshold
                        ? 'This excavation exceeds the 2-meter depth '
                            'threshold. Larger excavations may require a '
                            'cash bond per the permit conditions.'
                        : 'This excavation exceeds the 50-cubic-meter '
                            'volume threshold. Larger excavations may '
                            'require a cash bond per the permit '
                            'conditions.',
              ),
            ],
          ],
        ),
      ),
    );
  }
}
