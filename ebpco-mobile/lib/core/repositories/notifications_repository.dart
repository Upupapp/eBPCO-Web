import '../../mock/mock_notifications_data.dart';
import '../constants/app_constants.dart';
import '../models/notification_model.dart';

/// Source of a user's notifications. Swap [MockNotificationsRepository] for
/// a real HTTP-backed implementation once a backend exists.
abstract class NotificationsRepository {
  Future<List<NotificationModel>> fetchAll();
}

class MockNotificationsRepository implements NotificationsRepository {
  @override
  Future<List<NotificationModel>> fetchAll() async {
    await Future.delayed(AppConstants.mockNetworkDelay);
    return buildMockNotifications();
  }
}
