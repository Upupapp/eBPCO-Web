import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:ebpco_user_app/core/providers/applications_provider.dart';
import 'package:ebpco_user_app/core/providers/business_provider.dart';
import 'package:ebpco_user_app/core/providers/notifications_provider.dart';
import 'package:ebpco_user_app/features/applications/presentation/new_application_screen.dart';

Widget _wrapWithProviders(Widget child) {
  return MultiProvider(
    providers: [
      ChangeNotifierProvider<NotificationsProvider>(
        create: (_) => NotificationsProvider(),
      ),
      ChangeNotifierProvider<BusinessProvider>(
        create: (context) =>
            BusinessProvider(notifications: context.read<NotificationsProvider>()),
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
    'lets the user pick a business/type and reach the document checklist',
    (tester) async {
      await tester.pumpWidget(_wrapWithProviders(const NewApplicationScreen()));
      await tester.pump(const Duration(seconds: 2));
      expect(tester.takeException(), isNull);

      await tester.tap(find.text('Business').first);
      await tester.pumpAndSettle();
      await tester.tap(find.text("Juan's General Merchandise").last);
      await tester.pumpAndSettle();

      await tester.tap(find.text('Application type').first);
      await tester.pumpAndSettle();
      await tester.tap(find.text('New Business Permit').last);
      await tester.pumpAndSettle();

      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle(const Duration(milliseconds: 350));

      expect(tester.takeException(), isNull);
      expect(find.text('Valid Government ID'), findsOneWidget);
      expect(find.text('Barangay Clearance'), findsOneWidget);
      expect(find.text('Proof of Business Address'), findsOneWidget);
    },
  );
}
