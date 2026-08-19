import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';

/// Severity of an [AppAlert], matching the Alerts component spec
/// (Information / Success / Warning / Error).
enum AppAlertVariant { info, success, warning, error }

/// Inline banner that communicates important information without blocking
/// the user's workflow. Severity is always conveyed by icon + color + text
/// together, never color alone.
class AppAlert extends StatelessWidget {
  final AppAlertVariant variant;
  final String message;
  final String? title;
  final Widget? action;
  final VoidCallback? onDismiss;

  const AppAlert({
    super.key,
    required this.variant,
    required this.message,
    this.title,
    this.action,
    this.onDismiss,
  });

  @override
  Widget build(BuildContext context) {
    final (Color color, Color background, IconData icon) = switch (variant) {
      AppAlertVariant.info => (
        AppColors.statusInfo,
        AppColors.statusInfoBg,
        Icons.info_outline,
      ),
      AppAlertVariant.success => (
        AppColors.statusApproved,
        AppColors.statusApprovedBg,
        Icons.check_circle_outline,
      ),
      AppAlertVariant.warning => (
        AppColors.statusPending,
        AppColors.statusPendingBg,
        Icons.warning_amber_outlined,
      ),
      AppAlertVariant.error => (
        AppColors.statusRejected,
        AppColors.statusRejectedBg,
        Icons.error_outline,
      ),
    };

    return Semantics(
      liveRegion: true,
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: background,
          borderRadius: BorderRadius.circular(AppConstants.borderRadiusMedium),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(width: AppSpacing.sm + AppSpacing.xs),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (title != null) ...[
                    Text(
                      title!,
                      style: AppTypography.bodyStrong.copyWith(color: color),
                    ),
                    const SizedBox(height: AppSpacing.xs),
                  ],
                  Text(
                    message,
                    style: AppTypography.bodyMuted.copyWith(
                      color: AppColors.textSecondary,
                      height: 1.4,
                    ),
                  ),
                  if (action != null) ...[
                    const SizedBox(height: AppSpacing.sm),
                    action!,
                  ],
                ],
              ),
            ),
            if (onDismiss != null)
              IconButton(
                onPressed: onDismiss,
                icon: const Icon(Icons.close, size: 18),
                color: AppColors.textMuted,
                constraints: const BoxConstraints(),
                padding: EdgeInsets.zero,
                tooltip: 'Dismiss',
              ),
          ],
        ),
      ),
    );
  }
}
