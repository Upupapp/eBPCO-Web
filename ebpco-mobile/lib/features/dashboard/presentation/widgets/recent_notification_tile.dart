import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/models/notification_model.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/avatars/app_avatar.dart';

/// Formats a notification's timestamp as a short, readable relative date.
String formatRelativeDate(DateTime dateTime) {
  final difference = DateTime.now().difference(dateTime);
  if (difference.inMinutes < 1) return 'Just now';
  if (difference.inMinutes < 60) return '${difference.inMinutes}m ago';
  if (difference.inHours < 24) return '${difference.inHours}h ago';
  if (difference.inDays < 7) return '${difference.inDays}d ago';
  return DateFormat('MMM d, yyyy').format(dateTime);
}

/// Notification row used both on the dashboard preview and the full
/// notifications list.
class RecentNotificationTile extends StatelessWidget {
  final NotificationModel notification;
  final VoidCallback? onTap;

  const RecentNotificationTile({
    super.key,
    required this.notification,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: notification.isRead
          ? AppColors.surface
          : AppColors.lightBlue.withValues(alpha: 0.5),
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AppAvatar(
                size: 40,
                icon: notification.icon,
                iconSize: 20,
                backgroundColor: AppColors.lightBlue,
                foregroundColor: AppColors.secondaryBlue,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      notification.title,
                      style: notification.isRead
                          ? AppTypography.body
                          : AppTypography.bodyStrong,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      notification.message,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: AppTypography.bodyMuted,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      formatRelativeDate(notification.createdAt),
                      style: AppTypography.caption,
                    ),
                  ],
                ),
              ),
              if (!notification.isRead)
                Container(
                  margin: const EdgeInsets.only(top: 4, left: 4),
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: AppColors.secondaryBlue,
                    shape: BoxShape.circle,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
