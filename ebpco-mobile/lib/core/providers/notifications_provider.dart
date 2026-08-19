import 'package:flutter/material.dart';

import '../models/notification_model.dart';
import '../repositories/notifications_repository.dart';

/// Holds the notification list shared between the dashboard's "recent
/// notifications" preview and the full Notifications screen, sourced from
/// [NotificationsRepository].
class NotificationsProvider extends ChangeNotifier {
  NotificationsProvider({NotificationsRepository? repository})
    : _repository = repository ?? MockNotificationsRepository() {
    _load();
  }

  final NotificationsRepository _repository;
  bool _isLoading = true;
  final List<NotificationModel> _notifications = [];

  bool get isLoading => _isLoading;

  List<NotificationModel> get notifications =>
      List.unmodifiable(_notifications);

  List<NotificationModel> get recent => _notifications.take(3).toList();

  int get unreadCount => _notifications.where((n) => !n.isRead).length;

  Future<void> _load() async {
    final fetched = await _repository.fetchAll();
    _notifications
      ..clear()
      ..addAll(fetched);
    _isLoading = false;
    notifyListeners();
  }

  void markAsRead(String id) {
    final index = _notifications.indexWhere((n) => n.id == id);
    if (index == -1 || _notifications[index].isRead) return;
    _notifications[index].isRead = true;
    notifyListeners();
  }

  void markAllAsRead() {
    var changed = false;
    for (final notification in _notifications) {
      if (!notification.isRead) {
        notification.isRead = true;
        changed = true;
      }
    }
    if (changed) notifyListeners();
  }

  /// Posts a new notification, most-recent first. Used by other providers
  /// (e.g. [ApplicationsProvider], [BusinessProvider]) so real in-app
  /// actions produce a matching notification without every call site
  /// having to remember to do it.
  void addNotification({
    required String title,
    required String message,
    IconData icon = Icons.notifications_active_outlined,
  }) {
    _notifications.insert(
      0,
      NotificationModel(
        id: 'n-${DateTime.now().microsecondsSinceEpoch}',
        title: title,
        message: message,
        createdAt: DateTime.now(),
        icon: icon,
        isRead: false,
      ),
    );
    notifyListeners();
  }
}
