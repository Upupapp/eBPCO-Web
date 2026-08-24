import 'package:flutter/material.dart';

import '../../../../../core/models/fsec_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/alerts/app_alert.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';

/// Step 1 — Related Building Permit. Unlike the Sign/Fencing Permits'
/// gated "related Building Permit" step, this reference is purely
/// informational — an FSEC is typically filed and evaluated BEFORE the
/// Building Permit it supports has been approved, since it is one of the
/// inputs required for that approval. Nothing here blocks continuing.
class Step1RelatedBuildingPermit extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final FsecPermitDraft draft;
  final VoidCallback onChanged;

  const Step1RelatedBuildingPermit({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step1RelatedBuildingPermit> createState() =>
      _Step1RelatedBuildingPermitState();
}

class _Step1RelatedBuildingPermitState
    extends State<Step1RelatedBuildingPermit> {
  late final TextEditingController _applicationNumber;

  FsecRelatedBuildingPermit get _relatedPermit =>
      widget.draft.relatedBuildingPermit;

  @override
  void initState() {
    super.initState();
    _applicationNumber = TextEditingController(
      text: _relatedPermit.buildingPermitApplicationNumber,
    );
  }

  @override
  void dispose() {
    _applicationNumber.dispose();
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
            Text('Related Building Permit', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            const AppAlert(
              variant: AppAlertVariant.info,
              message:
                  'The FSEC is a prerequisite for Building Permit '
                  'approval, so it is normal to file it before your '
                  'Building Permit application has been approved. This '
                  'reference is optional and for your records only.',
            ),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: AppTextField(
                controller: _applicationNumber,
                label: 'Building Permit Application Number',
                hint: 'Optional — enter if already filed',
                onChanged: (v) {
                  _relatedPermit.buildingPermitApplicationNumber = v;
                  widget.onChanged();
                },
              ),
            ),
            if (fsecMockBuildingPermitNumbers.isNotEmpty) ...[
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
                  for (final number in fsecMockBuildingPermitNumbers)
                    ActionChip(
                      label: Text(number),
                      onPressed: () {
                        setState(() {
                          _applicationNumber.text = number;
                          _relatedPermit.buildingPermitApplicationNumber =
                              number;
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
    );
  }
}
