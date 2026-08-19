import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/electronics_permit_model.dart';
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
/// processing" sections (Boxes 7–9's processing, progress-flow,
/// assessed-fee, approval, and permit-issuance information). Every field
/// here is office-controlled and starts out unset in this frontend-only
/// prototype, so the applicant sees "Not yet available" until a future
/// staff-side surface populates real data — there is no applicant-
/// editable state in this class at all, and no blocking validity
/// condition; Continue always submits for evaluation.
class Step9EvaluationStatus extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final ElectronicsPermitDraft draft;
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
        derivedStatus == ElectronicsPermitStatus.invalidWithoutBuildingPermit;
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
                    'This Electronics Permit cannot be valid or issued '
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
                    label: 'Received Date',
                    value: _formatDate(processing.receivedDate),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _InfoRow(
                    label: 'Received By',
                    value: _formatText(processing.receivedBy),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _InfoRow(
                    label: 'Processing Progress',
                    value: _formatText(processing.processingProgress),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _InfoRow(
                    label: 'Processed By',
                    value: _formatText(processing.processedBy),
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
                    label: 'Assessed Fees',
                    value: processing.assessedFees == null
                        ? 'Not yet available'
                        : '₱${processing.assessedFees!.toStringAsFixed(2)}',
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
                  for (final stage in ElectronicsProcessingInfo.progressStages)
                    ...[
                      _StatusRow(label: stage, status: 'Pending'),
                      if (stage != ElectronicsProcessingInfo.progressStages.last)
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
                    label: 'Recommended Approval',
                    value: _formatText(processing.recommendedApproval),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _InfoRow(
                    label: 'Permit Issuance Status',
                    value: _formatText(processing.permitIssuanceStatus),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _InfoRow(
                    label: 'Permit Issuer',
                    value: _formatText(processing.permitIssuer),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _InfoRow(
                    label: 'Related Building Permit Status',
                    value: draft.relatedBuildingPermit.status.label,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _InfoRow(
                    label: 'Internal Remarks',
                    value: _formatText(processing.internalRemarks),
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
                      label: 'Electronics Permit Status',
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
                      in ElectronicsProcessingInfo.permitConditions) ...[
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
                    if (condition != ElectronicsProcessingInfo.permitConditions.last)
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
