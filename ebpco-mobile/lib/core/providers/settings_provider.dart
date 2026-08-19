import 'package:flutter/foundation.dart';

import '../models/notification_preferences_model.dart';

/// Holds mock, in-memory-only UI preferences (display language, notification
/// toggles) for the current app session. Nothing here is persisted or
/// affects real app behavior — it exists purely so the Language and
/// Notification Preferences screens have somewhere to keep their selected
/// state while the user navigates around.
class SettingsProvider extends ChangeNotifier {
  String _selectedLanguage = 'English';
  NotificationPreferences _notificationPreferences =
      const NotificationPreferences();

  String get selectedLanguage => _selectedLanguage;
  NotificationPreferences get notificationPreferences =>
      _notificationPreferences;

  void setLanguage(String language) {
    if (_selectedLanguage == language) return;
    _selectedLanguage = language;
    notifyListeners();
  }

  void updateNotificationPreferences(NotificationPreferences preferences) {
    _notificationPreferences = preferences;
    notifyListeners();
  }
}
