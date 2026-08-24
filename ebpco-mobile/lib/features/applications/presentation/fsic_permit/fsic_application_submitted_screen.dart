import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/avatars/app_avatar.dart';
import '../../../../shared/widgets/buttons/primary_button.dart';
import '../../../../shared/widgets/buttons/secondary_button.dart';
import '../../../../shared/widgets/cards/app_card.dart';
import '../../../../shared/widgets/layout/form_scroll_scaffold.dart';

/// Terminal confirmation screen shown after Step 5's Continue is pressed —
/// sits outside the numbered 5-step flow, matching how every other permit
/// wizard closes out its flow. Surfaces the related Occupancy Permit's
/// status, since this permit genuinely depends on that permit being
/// approved (unlike FSEC's purely informational reference).
class FsicApplicationSubmittedScreen extends StatelessWidget {
  final String referenceNumber;
  final DateTime submissionDate;
  final String relatedOccupancyPermitNumber;
  final String relatedOccupancyPermitStatus;

  const FsicApplicationSubmittedScreen({
    super.key,
    required this.referenceNumber,
    required this.submissionDate,
    required this.relatedOccupancyPermitNumber,
    required this.relatedOccupancyPermitStatus,
  });

  @override
  Widget build(BuildContext context) {
    final isPending = relatedOccupancyPermitStatus != 'Approved';

    return PopScope(
      canPop: false,
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: SafeArea(
          child: FormScrollScaffold(
            padding: const EdgeInsets.symmetric(
              horizontal: AppConstants.screenPaddingHorizontal,
              vertical: 24,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const AppAvatar(
                  size: 96,
                  icon: Icons.check_circle,
                  iconSize: 56,
                  backgroundColor: AppColors.statusApprovedBg,
                  foregroundColor: AppColors.statusApproved,
                ),
                const SizedBox(height: AppSpacing.xl),
                Text(
                  'FSIC Application Submitted!',
                  style: AppTypography.pageTitle,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.md),
                Text(
                  'Your FSIC for Occupancy Permit (BFP) application has '
                  'been submitted for initial review. You will be '
                  'notified once the Bureau of Fire Protection completes '
                  'the fire safety inspection and assessment of your '
                  'application.',
                  textAlign: TextAlign.center,
                  style: AppTypography.bodyMuted.copyWith(height: 1.5),
                ),
                if (isPending) ...[
                  const SizedBox(height: AppSpacing.lg),
                  AppCard(
                    backgroundColor: AppColors.statusPendingBg,
                    showBorder: false,
                    child: Row(
                      children: [
                        const Icon(
                          Icons.info_outline,
                          color: AppColors.statusPending,
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: Text(
                            'This permit cannot be valid or issued until '
                            'your related Occupancy Permit is approved.',
                            style: AppTypography.body,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
                const SizedBox(height: AppSpacing.xl),
                AppCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      _InfoRow(
                        label: 'Application Reference Number',
                        value: referenceNumber,
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      const _InfoRow(
                        label: 'Application Type',
                        value: 'FSIC for Occupancy Permit (BFP)',
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      _InfoRow(
                        label: 'Related Occupancy Permit',
                        value: relatedOccupancyPermitNumber.trim().isEmpty
                            ? 'Not yet assigned'
                            : relatedOccupancyPermitNumber,
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      _InfoRow(
                        label: 'Related Occupancy Permit Status',
                        value: relatedOccupancyPermitStatus,
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      const _InfoRow(
                        label: 'Status',
                        value: 'Submitted for Initial Review',
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      _InfoRow(
                        label: 'Submission Date',
                        value: DateFormat(
                          'MMM d, yyyy',
                        ).format(submissionDate),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.xxl),
                SecondaryButton(
                  label: 'View Application',
                  onPressed: () => context.go('/app/applications'),
                ),
                const SizedBox(height: AppSpacing.md),
                PrimaryButton(
                  label: 'Return to Applications',
                  onPressed: () => context.go('/app/applications'),
                ),
              ],
            ),
          ),
        ),
      ),
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
