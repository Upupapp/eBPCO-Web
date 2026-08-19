import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../../../core/models/fencing_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/chips/app_chip.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';

/// Step 8 — Fence Specifications (Box 6): measurements plus at least one
/// fencing material type.
class Step8FenceSpecifications extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final FencingPermitDraft draft;
  final VoidCallback onChanged;

  const Step8FenceSpecifications({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step8FenceSpecifications> createState() =>
      _Step8FenceSpecificationsState();
}

class _Step8FenceSpecificationsState extends State<Step8FenceSpecifications> {
  late final TextEditingController _fenceLength;
  late final TextEditingController _fenceHeight;
  late final TextEditingController _otherType;

  FencingSpecifications get _specs => widget.draft.specifications;

  @override
  void initState() {
    super.initState();
    _fenceLength = TextEditingController(text: _specs.fenceLengthMeters);
    _fenceHeight = TextEditingController(text: _specs.fenceHeightMeters);
    _otherType = TextEditingController(text: _specs.otherTypeDescription);
  }

  @override
  void dispose() {
    _fenceLength.dispose();
    _fenceHeight.dispose();
    _otherType.dispose();
    super.dispose();
  }

  void _toggleType(FencingType type, bool selected) {
    setState(() {
      if (selected) {
        _specs.selectedTypes.add(type);
      } else {
        _specs.selectedTypes.remove(type);
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
            Text('Fence Measurements', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _fenceLength,
                    label: 'Fence Length (meters) *',
                    hint: 'e.g. 45.5',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    inputFormatters: decimalFormatters,
                    validator: (v) => Validators.positiveDecimal(
                      v,
                      fieldLabel: 'Fence length',
                    ),
                    onChanged: (v) {
                      _specs.fenceLengthMeters = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _fenceHeight,
                    label: 'Fence Height (meters) *',
                    hint: 'e.g. 2.0',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    inputFormatters: decimalFormatters,
                    validator: (v) => Validators.positiveDecimal(
                      v,
                      fieldLabel: 'Fence height',
                    ),
                    onChanged: (v) {
                      _specs.fenceHeightMeters = v;
                      widget.onChanged();
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Type of Fencing', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Select every material type that applies to this project.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: [
                for (final type in FencingType.values)
                  AppChip(
                    label: type.label,
                    selected: _specs.selectedTypes.contains(type),
                    onSelected: (selected) => _toggleType(type, selected),
                  ),
              ],
            ),
            if (_specs.selectedTypes.contains(FencingType.others)) ...[
              const SizedBox(height: AppSpacing.md),
              AppTextField(
                controller: _otherType,
                label: 'Specify Other Fencing Type *',
                validator: (v) =>
                    Validators.required(v, fieldLabel: 'Fencing type'),
                onChanged: (v) {
                  _specs.otherTypeDescription = v;
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
