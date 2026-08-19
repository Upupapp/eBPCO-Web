import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_typography.dart';
import '../badges/status_badge.dart';
import 'app_card.dart';

/// Premium application-tracking card: permit name, date/subtitle, tracking
/// ID, status badge, an animated progress bar, and an optional quick
/// action/footer line. Shared by the dashboard's active-application card
/// and the Applications list so the "tracking" visual exists in one place.
class TrackingCard extends StatelessWidget {
  final String trackingId;
  final String title;
  final String subtitle;
  final String statusLabel;
  final Color statusColor;
  final Color statusBackgroundColor;
  final double progress;
  final String? footerText;
  final String? actionLabel;
  final VoidCallback? onAction;
  final VoidCallback? onTap;

  const TrackingCard({
    super.key,
    required this.trackingId,
    required this.title,
    required this.subtitle,
    required this.statusLabel,
    required this.statusColor,
    required this.statusBackgroundColor,
    required this.progress,
    this.footerText,
    this.actionLabel,
    this.onAction,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(trackingId, style: AppTypography.caption),
                    const SizedBox(height: 2),
                    Text(
                      title,
                      style: AppTypography.cardTitle,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(subtitle, style: AppTypography.bodyMuted),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Flexible(
                child: StatusBadge(
                  label: statusLabel,
                  color: statusColor,
                  backgroundColor: statusBackgroundColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ClipRRect(
            borderRadius: BorderRadius.circular(AppConstants.borderRadiusXs),
            child: TweenAnimationBuilder<double>(
              tween: Tween(begin: 0, end: progress.clamp(0, 1)),
              duration: const Duration(milliseconds: 500),
              curve: Curves.easeOutCubic,
              builder: (context, value, _) => LinearProgressIndicator(
                value: value,
                minHeight: 8,
                backgroundColor: AppColors.surfaceMuted,
                valueColor: AlwaysStoppedAnimation(statusColor),
              ),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            '${(progress * 100).round()}% complete',
            style: AppTypography.caption,
          ),
          if (footerText != null) ...[
            const SizedBox(height: 10),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
                  Icons.arrow_forward_rounded,
                  size: 16,
                  color: AppColors.textSecondary,
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(footerText!, style: AppTypography.bodyMuted),
                ),
              ],
            ),
          ],
          if (actionLabel != null && onAction != null) ...[
            const SizedBox(height: 14),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(onPressed: onAction, child: Text(actionLabel!)),
            ),
          ],
        ],
      ),
    );
  }
}
