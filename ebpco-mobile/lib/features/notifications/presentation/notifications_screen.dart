import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/models/notification_model.dart';
import '../../../core/providers/notifications_provider.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../shared/widgets/chips/app_chip.dart';
import '../../../shared/widgets/search/app_search_field.dart';
import '../../../shared/widgets/states/empty_state.dart';
import '../../dashboard/presentation/widgets/recent_notification_tile.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  bool _unreadOnly = false;
  String _query = '';

  List<NotificationModel> _applyFilters(List<NotificationModel> source) {
    final query = _query.trim().toLowerCase();
    return source.where((notification) {
      if (_unreadOnly && notification.isRead) return false;
      if (query.isEmpty) return true;
      return notification.title.toLowerCase().contains(query) ||
          notification.message.toLowerCase().contains(query);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final notificationsProvider = context.watch<NotificationsProvider>();
    final notifications = _applyFilters(notificationsProvider.notifications);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          TextButton(
            onPressed: notificationsProvider.unreadCount > 0
                ? notificationsProvider.markAllAsRead
                : null,
            child: const Text('Mark all as read'),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppConstants.screenPaddingHorizontal,
                12,
                AppConstants.screenPaddingHorizontal,
                0,
              ),
              child: AppSearchField(
                hint: 'Search notifications',
                onChanged: (value) => setState(() => _query = value),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppConstants.screenPaddingHorizontal,
                12,
                AppConstants.screenPaddingHorizontal,
                0,
              ),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Wrap(
                  spacing: AppSpacing.sm,
                  children: [
                    AppChip(
                      label: 'All',
                      selected: !_unreadOnly,
                      onSelected: (_) => setState(() => _unreadOnly = false),
                    ),
                    AppChip(
                      label: 'Unread',
                      selected: _unreadOnly,
                      onSelected: (_) => setState(() => _unreadOnly = true),
                    ),
                  ],
                ),
              ),
            ),
            Expanded(
              child: notifications.isEmpty
                  ? EmptyState(
                      icon: Icons.notifications_none_outlined,
                      title: _query.isEmpty && !_unreadOnly
                          ? 'No notifications yet'
                          : 'No matching notifications',
                      message: _query.isEmpty && !_unreadOnly
                          ? 'Updates about your permit applications will appear here.'
                          : 'Try a different search term or filter.',
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppConstants.screenPaddingHorizontal,
                        vertical: 12,
                      ),
                      itemCount: notifications.length,
                      separatorBuilder: (context, index) =>
                          const SizedBox(height: 4),
                      itemBuilder: (context, index) {
                        final notification = notifications[index];
                        return RecentNotificationTile(
                          notification: notification,
                          onTap: () =>
                              notificationsProvider.markAsRead(notification.id),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
