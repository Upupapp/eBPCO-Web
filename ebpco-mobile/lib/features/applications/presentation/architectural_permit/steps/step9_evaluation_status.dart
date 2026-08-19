import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/architectural_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/alerts/app_alert.dart';
import '../../../../../shared/widgets/badges/status_badge.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';

/// Step 9 — Evaluation, Progress & Permit Status. Everything shown here
/// is office-controlled (fixed "pending" placeholders); the permit status
/// itself is derived from the Related Building Permit's status
/// ([ArchitecturalPermitDraft.derivedPermitStatus]), so this permit can
/// never render as valid/issued without one. There is no blocking
/// validity condition — Continue always submits for evaluation.
class Step9EvaluationStatus extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final ArchitecturalPermitDraft draft;
  final VoidCallback onChanged;

  const Step9EvaluationStatus({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final derivedStatus = draft.derivedPermitStatus;
    final isInvalidWithoutBuildingPermit =
        derivedStatus == ArchitecturalPermitStatus.invalidWithoutBuildingPermit;

    return Form(
      key: formKey,
      child: FormScrollScaffold(
        centerVertically: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (isInvalidWithoutBuildingPermit)
              const AppAlert(
                variant: AppAlertVariant.warning,
                message:
                    'This Architectural Permit cannot be valid or issued '
                    'until the related Building Permit is issued.',
              )
            else
              const AppAlert(
                variant: AppAlertVariant.info,
                message:
                    'Your application will now go through evaluation by the '
                    'Office of the Building Official.',
              ),

            const SizedBox(height: AppSpacing.xl),
            Text('Document Evaluation', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  for (final entry
                      in ArchitecturalEvaluationPermitStatus
                          .documentEvaluation
                          .entries) ...[
                    _StatusRow(label: entry.key, status: entry.value.label),
                    if (entry.key !=
                        ArchitecturalEvaluationPermitStatus
                            .documentEvaluation
                            .keys
                            .last)
                      const SizedBox(height: AppSpacing.sm),
                  ],
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Progress Flow', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  for (final stage
                      in ArchitecturalEvaluationPermitStatus.progressStages) ...[
                    _StatusRow(label: stage, status: 'Pending'),
                    if (stage !=
                        ArchitecturalEvaluationPermitStatus.progressStages.last)
                      const SizedBox(height: AppSpacing.sm),
                  ],
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Permit Status', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _InfoRow(
                    label: 'Action Taken',
                    value: ArchitecturalEvaluationPermitStatus.actionTaken,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _InfoRow(
                    label: 'Recommending Approval',
                    value:
                        ArchitecturalEvaluationPermitStatus.recommendingApproval,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _InfoRow(
                    label: 'Permit Issued By',
                    value: ArchitecturalEvaluationPermitStatus.permitIssuedBy,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _InfoRow(
                    label: 'Related Building Permit Status',
                    value: draft.relatedBuildingPermit.status.label,
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: _InfoRow(
                      label: 'Architectural Permit Status',
                      value: derivedStatus.label,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  // Long status labels (e.g. "Invalid Without Building
                  // Permit") must wrap instead of forcing the badge to its
                  // full intrinsic width, which would overflow this Row on
                  // narrow screens — Flexible lets Text wrap within it.
                  Flexible(
                    child: StatusBadge(
                      label: derivedStatus.label,
                      color: isInvalidWithoutBuildingPermit
                          ? AppColors.error
                          : AppColors.statusPending,
                      backgroundColor: isInvalidWithoutBuildingPermit
                          ? AppColors.error.withValues(alpha: 0.1)
                          : AppColors.statusPendingBg,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Permit Conditions', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'These conditions will apply once the permit is issued.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  for (final condition
                      in ArchitecturalEvaluationPermitStatus.permitConditions) ...[
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(
                          Icons.circle,
                          size: 6,
                          color: AppColors.textMuted,
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: Text(condition, style: AppTypography.body),
                        ),
                      ],
                    ),
                    if (condition !=
                        ArchitecturalEvaluationPermitStatus
                            .permitConditions
                            .last)
                      const SizedBox(height: AppSpacing.sm),
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

class _StatusRow extends StatelessWidget {
  final String label;
  final String status;

  const _StatusRow({required this.label, required this.status});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: Text(label, style: AppTypography.body)),
        StatusBadge(
          label: status,
          color: AppColors.statusPending,
          backgroundColor: AppColors.statusPendingBg,
        ),
      ],
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTypography.caption),
        const SizedBox(height: 2),
        Text(value, style: AppTypography.bodyStrong),
      ],
    );
  }
}
