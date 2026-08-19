import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:ebpco_user_app/core/providers/applications_provider.dart';
import 'package:ebpco_user_app/core/providers/auth_provider.dart';
import 'package:ebpco_user_app/core/providers/notifications_provider.dart';
import 'package:ebpco_user_app/features/dashboard/presentation/dashboard_screen.dart';

Widget _wrapWithProviders(Widget child) {
  return MultiProvider(
    providers: [
      ChangeNotifierProvider<AuthProvider>(create: (_) => AuthProvider()),
      ChangeNotifierProvider<NotificationsProvider>(
        create: (_) => NotificationsProvider(),
      ),
      ChangeNotifierProvider<ApplicationsProvider>(
        create: (context) => ApplicationsProvider(
          notifications: context.read<NotificationsProvider>(),
        ),
      ),
    ],
    child: MaterialApp(home: child),
  );
}

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  testWidgets(
    'renders the active application, quick actions, and recent notifications',
    (tester) async {
      await tester.pumpWidget(_wrapWithProviders(const DashboardScreen()));
      // Providers now hydrate from mock repositories with a simulated
      // network delay; advance the fake clock past it before asserting.
      await tester.pump(const Duration(seconds: 3));

      expect(find.text('Apply for Permit'), findsWidgets);
      expect(find.text("Juan's General Merchandise"), findsOneWidget);
      expect(find.text('Under Review'), findsOneWidget);
      expect(find.text('Application Summary'), findsOneWidget);
      expect(find.text('Quick Actions'), findsOneWidget);
      expect(find.text('Recent Notifications'), findsOneWidget);
      expect(find.text('View Applications'), findsOneWidget);
      expect(find.text('Check Payments'), findsOneWidget);
    },
  );

  testWidgets('shows the dashboard summary counters', (tester) async {
    await tester.pumpWidget(_wrapWithProviders(const DashboardScreen()));
    await tester.pump(const Duration(seconds: 3));

    expect(find.text('Draft'), findsOneWidget);
    expect(find.text('Submitted'), findsOneWidget);
    expect(find.text('Approved'), findsOneWidget);
    expect(find.text('Released'), findsOneWidget);
  });
}
