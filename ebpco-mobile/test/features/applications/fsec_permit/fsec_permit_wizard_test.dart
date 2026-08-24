import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:ebpco_user_app/core/providers/auth_provider.dart';
import 'package:ebpco_user_app/core/providers/fsec_permit_provider.dart';
import 'package:ebpco_user_app/features/applications/presentation/fsec_permit/fsec_application_submitted_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/fsec_permit/fsec_permit_wizard_screen.dart';

/// End-to-end coverage of the FSEC for Building Permit (BFP) wizard —
/// fully separate from every other permit wizard in this app, driven the
/// same way those wizards' tests drive them. Unlike the Sign/Fencing
/// Permits' gated related-Building-Permit step, Step 1 here is purely
/// informational, so it never blocks continuing.
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
        builder: (context, state) => const FsecPermitWizardScreen(),
      ),
      GoRoute(
        path: '/applications/new/fsec-permit/submitted',
        builder: (context, state) {
          final extra = state.extra as Map<String, Object?>?;
          return FsecApplicationSubmittedScreen(
            referenceNumber: extra?['referenceNumber'] as String? ?? 'FSEC-X',
            submissionDate:
                extra?['submissionDate'] as DateTime? ?? DateTime.now(),
            relatedBuildingPermitApplicationNumber:
                extra?['relatedBuildingPermitApplicationNumber'] as String? ??
                '',
          );
        },
      ),
    ],
  );
  return MultiProvider(
    providers: [
      ChangeNotifierProvider<AuthProvider>(create: (_) => AuthProvider()),
      ChangeNotifierProvider<FsecPermitProvider>(
        create: (_) => FsecPermitProvider(),
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

Future<void> _pickToday(WidgetTester tester, String label) async {
  await tester.ensureVisible(find.text(label));
  await tester.pumpAndSettle();
  await tester.tap(find.text(label));
  await tester.pumpAndSettle();
  await tester.tap(find.text('OK'));
  await tester.pumpAndSettle();
}

Future<void> _selectDropdown(
  WidgetTester tester,
  int dropdownIndex,
  String optionLabel,
) async {
  final dropdowns = find.byWidgetPredicate(
    (w) => w is DropdownButtonFormField,
  );
  await tester.ensureVisible(dropdowns.at(dropdownIndex));
  await tester.pumpAndSettle();
  await tester.tap(dropdowns.at(dropdownIndex));
  await tester.pumpAndSettle();
  await tester.tap(find.text(optionLabel).last);
  await tester.pumpAndSettle();
}

/// Step 1's related Building Permit reference is purely informational,
/// so no input is required before continuing.
Future<void> _completeStep1(WidgetTester tester) async {
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

Future<void> _completeStep2(WidgetTester tester) async {
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

Future<void> _completeStep3(WidgetTester tester) async {
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Project Name *'),
    'Sample Commercial Building',
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
  await tester.pump();
  await _selectDropdown(tester, 0, 'Group E — Business and Mercantile');
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Number of Storeys *'),
    '3',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Total Floor Area (sq. m.) *'),
    '500',
  );
  await tester.pump();
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

Future<void> _completeStep4(WidgetTester tester) async {
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Full Name *'),
    'Arch. Maria Santos',
  );
  await tester.pump();
  await _selectDropdown(tester, 0, 'Architect');
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Professional Address *'),
    '123 Kalayaan Ave., Quezon City',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'PRC Number *'),
    'PRC-0001',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'PTR Number *'),
    'PTR-0001',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'PTR Place Issued *'),
    'Quezon City',
  );
  await tester.pump();
  await _pickToday(tester, 'PRC Validity *');
  await _pickToday(tester, 'PTR Date Issued *');
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

Future<void> _completeStep5(WidgetTester tester) async {
  for (var i = 0; i < 2; i++) {
    await tester.ensureVisible(
      find.widgetWithText(OutlinedButton, 'Upload').first,
    );
    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(OutlinedButton, 'Upload').first);
    await tester.pump();
  }
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

Future<void> _checkAllDeclarations(WidgetTester tester) async {
  for (final label in [
    'I certify that the information provided is true and correct.',
    'I certify that the submitted plans comply with the Fire Code of '
        'the Philippines (RA 9514).',
    'I understand that all required signed and sealed professional '
        'documents must be authentic.',
    'I agree to the Terms and Conditions.',
  ]) {
    await tester.ensureVisible(find.text(label));
    await tester.pumpAndSettle();
    await tester.tap(find.text(label));
    await tester.pump();
  }
}

void main() {
  testWidgets(
    'Step 1 renders with Related Building Permit heading and does not block continuing',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      expect(tester.takeException(), isNull);

      expect(find.text('Step 1 of 6'), findsOneWidget);
      expect(find.text('Related Building Permit'), findsWidgets);
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNotNull,
        reason: 'the related Building Permit reference is informational',
      );
    },
  );

  testWidgets(
    'Continue navigates Step 1 through Step 6, and Submit Application opens the confirmation screen',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      expect(find.text('Step 2 of 6'), findsOneWidget);

      await _completeStep2(tester);
      expect(find.text('Step 3 of 6'), findsOneWidget);

      await _completeStep3(tester);
      expect(find.text('Step 4 of 6'), findsOneWidget);

      await _completeStep4(tester);
      expect(find.text('Step 5 of 6'), findsOneWidget);

      await _completeStep5(tester);
      expect(find.text('Step 6 of 6'), findsOneWidget);

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
      expect(find.text('FSEC Application Submitted!'), findsOneWidget);
      expect(find.textContaining('FSEC-'), findsOneWidget);
      expect(find.text('FSEC for Building Permit (BFP)'), findsWidgets);
    },
  );

  testWidgets('Save as Draft works and preserves values', (tester) async {
    await _useTallSurface(tester);
    await _openWizard(tester);
    await _completeStep1(tester);

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
