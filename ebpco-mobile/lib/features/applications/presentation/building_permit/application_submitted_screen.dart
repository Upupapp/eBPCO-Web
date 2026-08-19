import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/avatars/app_avatar.dart';
import '../../../../shared/widgets/buttons/primary_button.dart';
import '../../../../shared/widgets/cards/app_card.dart';
import '../../../../shared/widgets/layout/form_scroll_scaffold.dart';

/// Terminal confirmation screen shown after Step 9's Continue is pressed —
/// sits outside the numbered 9-step flow, matching how
/// RegistrationSuccessScreen closes out the registration flow.
class ApplicationSubmittedScreen extends StatelessWidget {
  final String trackingId;

  const ApplicationSubmittedScreen({super.key, required this.trackingId});

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
                  'Application Submitted!',
                  style: AppTypography.pageTitle,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.md),
                Text(
                  'Your Building Permit application has been submitted '
                  'for assessment. You will be notified once the '
                  'Processing and Evaluation Division completes your '
                  'assessment and payment becomes available.',
                  textAlign: TextAlign.center,
                  style: AppTypography.bodyMuted.copyWith(height: 1.5),
                ),
                const SizedBox(height: AppSpacing.xl),
                AppCard(
                  child: Column(
                    children: [
                      Text('Tracking Number', style: AppTypography.caption),
                      const SizedBox(height: 4),
                      Text(trackingId, style: AppTypography.sectionTitle),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.xxl),
                PrimaryButton(
                  label: 'Back to Applications',
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
