import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/models/notification_preferences_model.dart';
import '../../../core/providers/settings_provider.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/alerts/app_alert.dart';
import '../../../shared/widgets/layout/section_header.dart';

/// Mock notification toggle settings — every switch just flips in-memory
/// state on [SettingsProvider]; nothing here actually enables or disables
/// real notifications.
class NotificationPreferencesScreen extends StatelessWidget {
  const NotificationPreferencesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final settings = context.watch<SettingsProvider>();
    final prefs = settings.notificationPreferences;

    void update(
      NotificationPreferences Function(NotificationPreferences) apply,
    ) {
      context.read<SettingsProvider>().updateNotificationPreferences(
        apply(prefs),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Notification Preferences')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(AppConstants.screenPaddingHorizontal),
          children: [
            const AppAlert(
              variant: AppAlertVariant.info,
              message:
                  'This feature is currently available as a prototype for '
                  'demonstration purposes.',
            ),
            const SizedBox(height: AppSpacing.lg),
            const SectionHeader(title: 'What You Get Notified About'),
            const SizedBox(height: AppSpacing.xs),
            _ToggleTile(
              title: 'Application Updates',
              subtitle: 'Status changes on your permit applications.',
              value: prefs.applicationUpdates,
              onChanged: (v) =>
                  update((p) => p.copyWith(applicationUpdates: v)),
            ),
            _ToggleTile(
              title: 'Payment Notifications',
              subtitle: 'Payment confirmations and reminders.',
              value: prefs.paymentNotifications,
              onChanged: (v) =>
                  update((p) => p.copyWith(paymentNotifications: v)),
            ),
            _ToggleTile(
              title: 'Permit Status Updates',
              subtitle: 'Approval, release, and renewal reminders.',
              value: prefs.permitStatusUpdates,
              onChanged: (v) =>
                  update((p) => p.copyWith(permitStatusUpdates: v)),
            ),
            _ToggleTile(
              title: 'Document Reminders',
              subtitle: 'Missing or expiring requirement reminders.',
              value: prefs.documentReminders,
              onChanged: (v) => update((p) => p.copyWith(documentReminders: v)),
            ),
            _ToggleTile(
              title: 'System Announcements',
              subtitle: 'Office advisories and maintenance notices.',
              value: prefs.systemAnnouncements,
              onChanged: (v) =>
                  update((p) => p.copyWith(systemAnnouncements: v)),
            ),
            const SizedBox(height: AppSpacing.lg),
            const SectionHeader(title: 'How You Get Notified'),
            const SizedBox(height: AppSpacing.xs),
            _ToggleTile(
              title: 'Email Notifications',
              value: prefs.emailNotifications,
              onChanged: (v) =>
                  update((p) => p.copyWith(emailNotifications: v)),
            ),
            _ToggleTile(
              title: 'SMS Notifications',
              value: prefs.smsNotifications,
              onChanged: (v) => update((p) => p.copyWith(smsNotifications: v)),
            ),
            _ToggleTile(
              title: 'Push Notifications',
              value: prefs.pushNotifications,
              onChanged: (v) => update((p) => p.copyWith(pushNotifications: v)),
            ),
          ],
        ),
      ),
    );
  }
}

class _ToggleTile extends StatelessWidget {
  final String title;
  final String? subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _ToggleTile({
    required this.title,
    this.subtitle,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return SwitchListTile.adaptive(
      contentPadding: EdgeInsets.zero,
      title: Text(title, style: AppTypography.bodyStrong),
      subtitle: subtitle != null
          ? Text(subtitle!, style: AppTypography.helper)
          : null,
      value: value,
      onChanged: onChanged,
    );
  }
}
