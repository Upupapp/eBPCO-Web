import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:ebpco_user_app/core/providers/auth_provider.dart';
import 'package:ebpco_user_app/core/providers/fsic_permit_provider.dart';
import 'package:ebpco_user_app/features/applications/presentation/fsic_permit/fsic_application_submitted_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/fsic_permit/fsic_permit_wizard_screen.dart';

/// End-to-end coverage of the FSIC for Occupancy Permit (BFP) wizard —
/// fully separate from every other permit wizard in this app, driven the
/// same way those wizards' tests drive them. Unlike FSEC's informational
/// reference, Step 1 here gates on the related Occupancy Permit's
/// status, mirroring the Sign Permit's own related-Building-Permit step.
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
        builder: (context, state) => const FsicPermitWizardScreen(),
      ),
      GoRoute(
        path: '/applications/new/fsic-permit/submitted',
        builder: (context, state) {
          final extra = state.extra as Map<String, Object?>?;
          return FsicApplicationSubmittedScreen(
            referenceNumber: extra?['referenceNumber'] as String? ?? 'FSIC-X',
            submissionDate:
                extra?['submissionDate'] as DateTime? ?? DateTime.now(),
            relatedOccupancyPermitNumber:
                extra?['relatedOccupancyPermitNumber'] as String? ?? '',
            relatedOccupancyPermitStatus:
                extra?['relatedOccupancyPermitStatus'] as String? ??
                'Pending',
          );
        },
      ),
    ],
  );
  return MultiProvider(
    providers: [
      ChangeNotifierProvider<AuthProvider>(create: (_) => AuthProvider()),
      ChangeNotifierProvider<FsicPermitProvider>(
        create: (_) => FsicPermitProvider(),
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

/// Leaves the Related Occupancy Permit at its default "Pending" status,
/// which is already a valid state (no Occupancy Permit Number required),
/// so Step 1 needs no input at all before continuing.
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
    'Sample Residential Building',
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
  await _selectDropdown(tester, 0, 'Group A — Residential Dwelling');
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Number of Storeys *'),
    '2',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Total Floor Area (sq. m.) *'),
    '150',
  );
  await tester.pump();
  await _pickToday(tester, 'Date of Completion *');
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

Future<void> _completeStep4(WidgetTester tester) async {
  for (var i = 0; i < 3; i++) {
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
    'I certify that all submitted documents are authentic.',
    'I understand that this application is subject to a Bureau of Fire '
        'Protection fire safety inspection.',
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
    'Step 1 renders with Related Occupancy Permit heading',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      expect(tester.takeException(), isNull);

      expect(find.text('Step 1 of 5'), findsOneWidget);
      expect(find.text('Related Occupancy Permit'), findsWidgets);
    },
  );

  testWidgets(
    'Continue navigates Step 1 through Step 5, and Submit Application opens the confirmation screen with the pending Occupancy Permit warning',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      expect(find.text('Step 2 of 5'), findsOneWidget);

      await _completeStep2(tester);
      expect(find.text('Step 3 of 5'), findsOneWidget);

      await _completeStep3(tester);
      expect(find.text('Step 4 of 5'), findsOneWidget);

      await _completeStep4(tester);
      expect(find.text('Step 5 of 5'), findsOneWidget);

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
      expect(find.text('FSIC Application Submitted!'), findsOneWidget);
      expect(find.textContaining('FSIC-'), findsOneWidget);
      expect(
        find.text(
          'This permit cannot be valid or issued until your related '
          'Occupancy Permit is approved.',
        ),
        findsOneWidget,
      );
    },
  );

  testWidgets(
    'Selecting "Approved" status requires an Occupancy Permit Number in Step 1',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);

      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNotNull,
        reason: 'Pending does not require an Occupancy Permit number',
      );

      await _selectDropdown(tester, 0, 'Approved');

      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
        reason: 'Approved status requires an Occupancy Permit number',
      );

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Occupancy Permit Number *'),
        'COO-2026-999999',
      );
      await tester.pump();
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNotNull,
      );
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
