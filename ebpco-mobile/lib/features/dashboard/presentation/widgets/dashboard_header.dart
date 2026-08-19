import 'package:flutter/material.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/avatars/app_avatar.dart';
import '../../../../shared/widgets/layout/hero_header.dart';

/// Dashboard's premium coral [HeroHeader]: greets the user and surfaces
/// notification/profile shortcuts.
class DashboardHeader extends StatelessWidget {
  final String firstName;
  final String initials;
  final int unreadCount;
  final VoidCallback onNotificationsTap;
  final VoidCallback onProfileTap;
  final Widget? searchBar;

  const DashboardHeader({
    super.key,
    required this.firstName,
    required this.initials,
    required this.unreadCount,
    required this.onNotificationsTap,
    required this.onProfileTap,
    this.searchBar,
  });

  String get _greeting {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  @override
  Widget build(BuildContext context) {
    return HeroHeader(
      subtitle: _greeting,
      title: firstName,
      searchBar: searchBar,
      actions: [
        Semantics(
          label: unreadCount > 0
              ? '$unreadCount unread notifications'
              : 'Notifications',
          button: true,
          child: IconButton(
            onPressed: onNotificationsTap,
            icon: Badge(
              isLabelVisible: unreadCount > 0,
              label: Text('$unreadCount'),
              child: const Icon(
                Icons.notifications_outlined,
                color: AppColors.textOnPrimary,
              ),
            ),
          ),
        ),
        const SizedBox(width: 4),
        Semantics(
          label: 'Profile',
          button: true,
          child: InkWell(
            onTap: onProfileTap,
            customBorder: const CircleBorder(),
            child: AppAvatar(
              size: 40,
              initials: initials,
              backgroundColor: AppColors.surface,
              foregroundColor: AppColors.primary,
            ),
          ),
        ),
      ],
    );
  }
}
