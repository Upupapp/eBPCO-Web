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

/// Terminal confirmation screen shown after Step 9's Continue is pressed —
/// sits outside the numbered 9-step flow, matching how
/// [ApplicationSubmittedScreen] (New Construction) closes out its flow.
class RenovationApplicationSubmittedScreen extends StatelessWidget {
  final String referenceNumber;
  final DateTime submissionDate;

  const RenovationApplicationSubmittedScreen({
    super.key,
    required this.referenceNumber,
    required this.submissionDate,
  });

  @override
  Widget build(BuildContext context) {
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
                  'Renovation Application Submitted!',
                  style: AppTypography.pageTitle,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.md),
                Text(
                  'Your renovation permit application has been '
                  'submitted for initial review. You will be notified '
                  'once the Office of the Building Official completes '
                  'the assessment of your application.',
                  textAlign: TextAlign.center,
                  style: AppTypography.bodyMuted.copyWith(height: 1.5),
                ),
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
                        value: 'Building Permit – Renovation / Alteration',
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      const _InfoRow(
                        label: 'Status',
                        value: 'Submitted for Initial Review',
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      _InfoRow(
                        label: 'Submission Date',
                        value: DateFormat('MMM d, yyyy').format(submissionDate),
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
