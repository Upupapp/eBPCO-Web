import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../avatars/app_avatar.dart';
import '../buttons/primary_button.dart';

/// Reusable page/feature-level failure placeholder, the counterpart to
/// [EmptyState] for when something went wrong rather than when there's
/// simply nothing to show yet.
class ErrorState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String message;
  final String retryLabel;
  final VoidCallback? onRetry;

  const ErrorState({
    super.key,
    this.icon = Icons.error_outline,
    required this.title,
    required this.message,
    this.retryLabel = 'Try Again',
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AppAvatar(
              size: 72,
              icon: icon,
              iconSize: 34,
              backgroundColor: AppColors.statusRejectedBg,
              foregroundColor: AppColors.statusRejected,
            ),
            const SizedBox(height: 18),
            Text(
              title,
              textAlign: TextAlign.center,
              style: AppTypography.cardTitle,
            ),
            const SizedBox(height: 6),
            Text(
              message,
              textAlign: TextAlign.center,
              style: AppTypography.bodyMuted,
            ),
            if (onRetry != null) ...[
              const SizedBox(height: 18),
              PrimaryButton(label: retryLabel, onPressed: onRetry),
            ],
          ],
        ),
      ),
    );
  }
}
