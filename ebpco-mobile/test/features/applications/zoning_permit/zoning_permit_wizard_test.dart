import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:ebpco_user_app/core/providers/auth_provider.dart';
import 'package:ebpco_user_app/core/providers/zoning_permit_provider.dart';
import 'package:ebpco_user_app/features/applications/presentation/zoning_permit/zoning_application_submitted_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/zoning_permit/zoning_permit_wizard_screen.dart';

/// End-to-end coverage of the Zoning / Locational Clearance wizard —
/// fully separate from every other permit wizard in this app, driven the
/// same way those wizards' tests drive them. Unlike every ancillary
/// permit, this wizard has no "related Building Permit" step, since a
/// Locational Clearance is typically filed before one exists.
Widget _wrap() {
  final router = GoRouter(
    initialLocation: '/back',
    routes: [
      GoRoute(
        path: '/back',
        builder: (context, state) => Scaffold(
          body: Center(
            child: TextButton(
              onPressed: () => context.push('/wizard'),
              child: const Text('Back Screen'),
            ),
          ),
        ),
      ),
      GoRoute(
        path: '/wizard',
        builder: (context, state) => const ZoningPermitWizardScreen(),
      ),
      GoRoute(
        path: '/applications/new/zoning-permit/submitted',
        builder: (context, state) {
          final extra = state.extra as Map<String, Object?>?;
          return ZoningApplicationSubmittedScreen(
            referenceNumber: extra?['referenceNumber'] as String? ?? 'ZLC-X',
            submissionDate:
                extra?['submissionDate'] as DateTime? ?? DateTime.now(),
          );
        },
      ),
    ],
  );
  return MultiProvider(
    providers: [
      ChangeNotifierProvider<AuthProvider>(create: (_) => AuthProvider()),
      ChangeNotifierProvider<ZoningPermitProvider>(
        create: (_) => ZoningPermitProvider(),
      ),
    ],
    child: MaterialApp.router(routerConfig: router),
  );
}

Finder _continueButton() => find.widgetWithText(ElevatedButton, 'Continue');
Finder _submitButton() =>
    find.widgetWithText(ElevatedButton, 'Submit Application');

Future<void> _useTallSurface(WidgetTester tester) async {
  await tester.binding.setSurfaceSize(const Size(400, 6000));
  addTearDown(() => tester.binding.setSurfaceSize(null));
}

Future<void> _openWizard(WidgetTester tester) async {
  await tester.pumpWidget(_wrap());
  await tester.pumpAndSettle();
  await tester.tap(find.text('Back Screen'));
  await tester.pumpAndSettle();
}

Future<void> _completeStep1(WidgetTester tester) async {
  await tester.enterText(
    find.widgetWithText(TextFormField, 'First Name *'),
    'Juan',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Last Name *'),
    'Dela Cruz',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Telephone / Mobile Number *'),
    '09171234567',
  );
  await tester.pump();
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

Future<void> _completeStep2(WidgetTester tester) async {
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Lot Number *'),
    '12',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Street *'),
    'Rizal St.',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Barangay *'),
    'San Isidro',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'City / Municipality *'),
    'Quezon City',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Province *'),
    'Metro Manila',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Intended Use or Purpose *'),
    'Construction of a residential building.',
  );
  await tester.pump();
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

Future<void> _uploadAllVisibleDocuments(WidgetTester tester) async {
  var guard = 0;
  while (guard < 30) {
    final uploadButtons = find.widgetWithText(OutlinedButton, 'Upload');
    if (uploadButtons.evaluate().isEmpty) break;
    final target = uploadButtons.first;
    await tester.ensureVisible(target);
    await tester.pumpAndSettle();
    await tester.tap(target);
    await tester.pump();
    guard++;
  }
}

Future<void> _completeStep3(WidgetTester tester) async {
  await _uploadAllVisibleDocuments(tester);
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

Future<void> _checkAllDeclarations(WidgetTester tester) async {
  for (final label in [
    'I certify that the information provided is true and correct.',
    'I certify that all submitted documents are authentic.',
    'I understand that this application is subject to site inspection '
        'and zoning review.',
    'I agree to the Terms and Conditions.',
  ]) {
    await tester.ensureVisible(find.text(label));
    await tester.pumpAndSettle();
    await tester.tap(find.text(label));
    await tester.pump();
  }
}

void main() {
  testWidgets('Step 1 renders with Applicant Information heading', (
    tester,
  ) async {
    await _useTallSurface(tester);
    await _openWizard(tester);
    expect(tester.takeException(), isNull);

    expect(find.text('Step 1 of 4'), findsOneWidget);
    expect(find.text('Applicant Information'), findsWidgets);
  });

  testWidgets(
    'Continue navigates Step 1 through Step 4, and Submit Application opens the confirmation screen',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      expect(find.text('Step 2 of 4'), findsOneWidget);

      await _completeStep2(tester);
      expect(find.text('Step 3 of 4'), findsOneWidget);

      await _completeStep3(tester);
      expect(find.text('Step 4 of 4'), findsOneWidget);

      expect(
        tester.widget<ElevatedButton>(_submitButton()).onPressed,
        isNull,
        reason: 'declarations have not been checked yet',
      );
      await _checkAllDeclarations(tester);
      expect(
        tester.widget<ElevatedButton>(_submitButton()).onPressed,
        isNotNull,
      );

      await tester.tap(_submitButton());
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      expect(
        find.text('Zoning / Locational Clearance Application Submitted!'),
        findsOneWidget,
      );
      expect(find.textContaining('ZLC-'), findsOneWidget);
      expect(find.text('Zoning / Locational Clearance'), findsWidgets);
    },
  );

  testWidgets('Save as Draft works and preserves values', (tester) async {
    await _useTallSurface(tester);
    await _openWizard(tester);

    await tester.enterText(
      find.widgetWithText(TextFormField, 'First Name *'),
      'Juan',
    );
    await tester.pump();

    await tester.tap(find.text('Save Draft'));
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
    expect(find.text('Draft saved successfully.'), findsOneWidget);
    expect(find.widgetWithText(TextFormField, 'Juan'), findsOneWidget);
  });
}
