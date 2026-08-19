import 'package:flutter/material.dart';

import '../../../../../core/models/excavation_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/alerts/app_alert.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_dropdown.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';

/// Step 1 — Permit Information. The Application Number, EGPP Number, and
/// Excavation & Ground Preparation Permit Number are never asked of the
/// applicant — all are system-generated at submission, matching every
/// other permit workflow in this app. This step also collects the
/// Related Building Permit reference up front, as in the Fencing and
/// Sign Permits' own Step 1.
class Step1PermitInformation extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final ExcavationPermitDraft draft;
  final VoidCallback onChanged;

  const Step1PermitInformation({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step1PermitInformation> createState() =>
      _Step1PermitInformationState();
}

class _Step1PermitInformationState extends State<Step1PermitInformation> {
  late final TextEditingController _buildingPermitNumber;

  ExcavationRelatedBuildingPermit get _relatedPermit =>
      widget.draft.relatedBuildingPermit;

  @override
  void initState() {
    super.initState();
    _buildingPermitNumber = TextEditingController(
      text: _relatedPermit.buildingPermitNumber,
    );
  }

  @override
  void dispose() {
    _buildingPermitNumber.dispose();
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
            Text('Permit Information', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _ReadOnlyRow(
                    label: 'Application Number',
                    value: 'Will be assigned upon submission',
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _ReadOnlyRow(
                    label: 'EGPP Number',
                    value: 'Will be assigned upon submission',
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _ReadOnlyRow(
                    label: 'Excavation & Ground Preparation Permit Number',
                    value: 'Will be assigned upon submission',
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            const AppAlert(
              variant: AppAlertVariant.info,
              message:
                  'This permit supports construction activities and does '
                  'not replace the Building Permit. It also does not '
                  'guarantee the granting of the Building Permit.',
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Related Building Permit', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppDropdown<RelatedBuildingPermitStatus>(
                    value: _relatedPermit.status,
                    label: 'Related Building Permit Status *',
                    items: RelatedBuildingPermitStatus.values
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
                    controller: _buildingPermitNumber,
                    label:
                        _relatedPermit.status ==
                            RelatedBuildingPermitStatus.approved
                        ? 'Building Permit Number *'
                        : 'Building Permit Number',
                    hint:
                        _relatedPermit.status ==
                            RelatedBuildingPermitStatus.approved
                        ? 'Enter the approved Building Permit number.'
                        : 'Optional while pending approval.',
                    validator: (v) =>
                        _relatedPermit.status ==
                            RelatedBuildingPermitStatus.approved
                        ? Validators.required(
                            v,
                            fieldLabel: 'Building Permit Number',
                          )
                        : null,
                    onChanged: (v) {
                      _relatedPermit.buildingPermitNumber = v;
                      widget.onChanged();
                    },
                  ),
                  if (excavationMockBuildingPermitNumbers.isNotEmpty) ...[
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      'Or select a recent Building Permit application:',
                      style: AppTypography.caption,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Wrap(
                      spacing: AppSpacing.sm,
                      runSpacing: AppSpacing.sm,
                      children: [
                        for (final number
                            in excavationMockBuildingPermitNumbers)
                          ActionChip(
                            label: Text(number),
                            onPressed: () {
                              setState(() {
                                _buildingPermitNumber.text = number;
                                _relatedPermit.buildingPermitNumber = number;
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

class _ReadOnlyRow extends StatelessWidget {
  final String label;
  final String value;

  const _ReadOnlyRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTypography.caption),
        const SizedBox(height: 2),
        Text(value, style: AppTypography.bodyMuted),
      ],
    );
  }
}
