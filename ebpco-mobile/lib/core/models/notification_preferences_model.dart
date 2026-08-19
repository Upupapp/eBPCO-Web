/// Mock, in-memory notification toggle state shown on the Notification
/// Preferences screen. Nothing here affects whether notifications are
/// actually sent — it's UI state only.
class NotificationPreferences {
  final bool applicationUpdates;
  final bool paymentNotifications;
  final bool permitStatusUpdates;
  final bool documentReminders;
  final bool systemAnnouncements;
  final bool emailNotifications;
  final bool smsNotifications;
  final bool pushNotifications;

  const NotificationPreferences({
    this.applicationUpdates = true,
    this.paymentNotifications = true,
    this.permitStatusUpdates = true,
    this.documentReminders = true,
    this.systemAnnouncements = true,
    this.emailNotifications = true,
    this.smsNotifications = false,
    this.pushNotifications = true,
  });

  NotificationPreferences copyWith({
    bool? applicationUpdates,
    bool? paymentNotifications,
    bool? permitStatusUpdates,
    bool? documentReminders,
    bool? systemAnnouncements,
    bool? emailNotifications,
    bool? smsNotifications,
    bool? pushNotifications,
  }) {
    return NotificationPreferences(
      applicationUpdates: applicationUpdates ?? this.applicationUpdates,
      paymentNotifications: paymentNotifications ?? this.paymentNotifications,
      permitStatusUpdates: permitStatusUpdates ?? this.permitStatusUpdates,
      documentReminders: documentReminders ?? this.documentReminders,
      systemAnnouncements: systemAnnouncements ?? this.systemAnnouncements,
      emailNotifications: emailNotifications ?? this.emailNotifications,
      smsNotifications: smsNotifications ?? this.smsNotifications,
      pushNotifications: pushNotifications ?? this.pushNotifications,
    );
  }
}
