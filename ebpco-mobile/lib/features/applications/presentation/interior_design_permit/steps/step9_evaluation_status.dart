import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/interior_design_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/alerts/app_alert.dart';
import '../../../../../shared/widgets/badges/status_badge.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';

final DateFormat _dateFormat = DateFormat('MMM d, yyyy');

String _formatDate(DateTime? date) =>
    date != null ? _dateFormat.format(date) : 'Not yet available';

String _formatText(String? value) =>
    (value == null || value.trim().isEmpty) ? 'Not yet available' : value;

/// Step 9 — Evaluation & Permit Status: the official form's "internal
/// processing" sections (Boxes 8–10's progress-flow, review, fee,
/// payment, and issuance information). Every field here is office-
/// controlled and starts out unset in this frontend-only prototype, so
/// the applicant sees "Not yet available" until a future staff-side
/// surface populates real data — there is no applicant-editable state in
/// this class at all, and no blocking validity condition; Continue
/// always submits for evaluation.
class Step9EvaluationStatus extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final InteriorPermitDraft draft;
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
        derivedStatus == InteriorPermitStatus.invalidWithoutBuildingPermit;
    final processing = draft.processingInfo;

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
                    'This Interior Design Permit cannot be valid or issued '
                    'until the related Building Permit is approved.',
              )
            else
              const AppAlert(
                variant: AppAlertVariant.info,
                message:
                    'Your application will now go through evaluation by the '
                    'Office of the Building Official.',
              ),

            const SizedBox(height: AppSpacing.xl),
            Text('Processing', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _InfoRow(
                    label: 'Review Stage',
                    value: _formatText(processing.reviewStage),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _InfoRow(
                    label: 'Current Office / Division',
                    value: _formatText(processing.currentOffice),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _InfoRow(
                    label: 'Reviewed By',
                    value: _formatText(processing.reviewedBy),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _InfoRow(
                    label: 'Remarks',
                    value: _formatText(processing.remarks),
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Assessed Fees', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _InfoRow(
                    label: 'Total Assessed Fees',
                    value: processing.totalAssessedFees == null
                        ? 'Not yet available'
                        : '₱${processing.totalAssessedFees!.toStringAsFixed(2)}',
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _InfoRow(
                    label: 'Payment Status',
                    value: processing.paymentStatus,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _InfoRow(
                    label: 'Official Receipt Number',
                    value: _formatText(processing.officialReceiptNumber),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _InfoRow(
                    label: 'Date Paid',
                    value: _formatDate(processing.datePaid),
                  ),
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
                  for (final stage in InteriorProcessingInfo.progressStages)
                    ...[
                      _StatusRow(label: stage, status: 'Pending'),
                      if (stage != InteriorProcessingInfo.progressStages.last)
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
                    label: 'Recommendation for Issuance',
                    value: _formatText(processing.recommendationForIssuance),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _InfoRow(
                    label: 'Permit Issuance Status',
                    value: _formatText(processing.permitIssuanceStatus),
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
                      label: 'Interior Design Permit Status',
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
                      in InteriorProcessingInfo.permitConditions) ...[
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
                    if (condition != InteriorProcessingInfo.permitConditions.last)
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
