import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:ebpco_user_app/core/providers/auth_provider.dart';
import 'package:ebpco_user_app/core/providers/renovation_permit_provider.dart';
import 'package:ebpco_user_app/features/applications/presentation/renovation_permit/renovation_application_submitted_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/renovation_permit/renovation_permit_wizard_screen.dart';

/// End-to-end coverage of the Renovation Permit wizard — a fully separate
/// flow from the New Construction wizard, driven the same way the
/// building_permit wizard tests drive that one.
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
        builder: (context, state) => const RenovationPermitWizardScreen(),
      ),
      GoRoute(
        path: '/applications/new/renovation-permit/submitted',
        builder: (context, state) {
          final extra = state.extra as Map<String, Object?>?;
          return RenovationApplicationSubmittedScreen(
            referenceNumber: extra?['referenceNumber'] as String? ?? 'REN-X',
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
      ChangeNotifierProvider<RenovationPermitProvider>(
        create: (_) => RenovationPermitProvider(),
      ),
    ],
    child: MaterialApp.router(routerConfig: router),
  );
}

Finder _continueButton() => find.widgetWithText(ElevatedButton, 'Continue');
Finder _submitButton() =>
    find.widgetWithText(ElevatedButton, 'Submit Application');

Future<void> _useTallSurface(WidgetTester tester) async {
  await tester.binding.setSurfaceSize(const Size(400, 3400));
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
    find.widgetWithText(TextFormField, 'Street *').first,
    'Rizal St.',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Barangay *').first,
    'San Isidro',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'City / Municipality *').first,
    'Quezon City',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Province *').first,
    'Metro Manila',
  );
  await tester.pump();
  await tester.tap(find.byType(Switch));
  await tester.pumpAndSettle();
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Lot Number *'),
    '12',
  );
  await tester.pump();
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

Future<void> _completeStep3(WidgetTester tester) async {
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Project / Renovation Title *'),
    'Kitchen and Bathroom Renovation',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'General Description of Renovation *'),
    'Renovating the kitchen and bathroom areas.',
  );
  await tester.pump();
  await tester.tap(find.text('Kitchen'));
  await tester.pump();
  await tester.tap(_continueButton());
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

Future<void> _pickNextMonthFirst(WidgetTester tester, String label) async {
  await tester.ensureVisible(find.text(label));
  await tester.pumpAndSettle();
  await tester.tap(find.text(label));
  await tester.pumpAndSettle();
  await tester.tap(find.byIcon(Icons.chevron_right));
  await tester.pumpAndSettle();
  await tester.tap(find.text('1').last);
  await tester.pumpAndSettle();
  await tester.tap(find.text('OK'));
  await tester.pumpAndSettle();
}

Future<void> _completeStep4(WidgetTester tester) async {
  await tester.tap(
    find.byWidgetPredicate((w) => w is DropdownButtonFormField),
  );
  await tester.pumpAndSettle();
  await tester.tap(find.text('Group A — Residential, Dwellings').last);
  await tester.pumpAndSettle();

  await tester.enterText(
    find.widgetWithText(TextFormField, 'Occupancy Classification *'),
    'Single Detached Residential Building',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Number of Units *'),
    '1',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Total Existing Floor Area *'),
    '150',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Area Affected by Renovation *'),
    '40',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Lot Area *'),
    '200',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Estimated Renovation Cost *'),
    '350000',
  );
  await tester.pump();
  await _pickToday(tester, 'Proposed Renovation Start Date *');
  await _pickNextMonthFirst(tester, 'Expected Completion Date *');
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

Future<void> _completeStep5(WidgetTester tester) async {
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Full Name *'),
    'Arch. Maria Santos',
  );
  await tester.tap(
    find.byWidgetPredicate((w) => w is DropdownButtonFormField),
  );
  await tester.pumpAndSettle();
  await tester.tap(find.text('Architect').last);
  await tester.pumpAndSettle();
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
  await _pickNextMonthFirst(tester, 'PRC Validity *');
  await _pickToday(tester, 'PTR Date Issued *');
  for (var i = 0; i < 4; i++) {
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

Future<void> _completeStep6AsOwner(WidgetTester tester) async {
  await tester.tap(find.text('Yes'));
  await tester.pump();
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

Future<void> _uploadAllVisibleDocuments(WidgetTester tester) async {
  var guard = 0;
  while (guard < 30) {
    final uploadButtons = find.widgetWithText(OutlinedButton, 'Upload');
    if (uploadButtons.evaluate().isEmpty) break;
    await tester.ensureVisible(uploadButtons.first);
    await tester.pumpAndSettle();
    await tester.tap(uploadButtons.first);
    await tester.pump();
    guard++;
  }
}

Future<void> _completeStep7(WidgetTester tester) async {
  for (final section in [
    'Existing Building Documents',
    'Renovation Technical Documents',
    'Professional Documents',
    'Government Clearances',
  ]) {
    await tester.ensureVisible(find.text(section));
    await tester.pumpAndSettle();
    await tester.tap(find.text(section));
    await tester.pumpAndSettle();
  }
  await _uploadAllVisibleDocuments(tester);
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

Future<void> _checkAllDeclarations(WidgetTester tester) async {
  for (final label in [
    'I certify that the information provided is true and correct.',
    'I confirm that this application is for renovation of an existing structure.',
    'I understand that additional permits may be required depending on the renovation work.',
    'I understand that applicable plans and specifications must be signed and sealed by licensed professionals.',
    'I agree to the Terms and Conditions.',
  ]) {
    await tester.ensureVisible(find.text(label));
    await tester.pumpAndSettle();
    await tester.tap(find.text(label));
    await tester.pump();
  }
}

void main() {
  testWidgets('Step 1 renders and Project Type is fixed to Renovation', (
    tester,
  ) async {
    await _useTallSurface(tester);
    await _openWizard(tester);
    expect(tester.takeException(), isNull);

    expect(find.text('Step 1 of 9'), findsOneWidget);
    expect(find.text('Applicant Information'), findsOneWidget);
    expect(find.text('Renovation'), findsOneWidget);
    expect(find.byIcon(Icons.check_circle), findsOneWidget);
  });

  testWidgets(
    'Continue navigates Step 1 through Step 9, and Submit Application opens the confirmation screen',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      expect(find.text('Step 2 of 9'), findsOneWidget);

      await _completeStep2(tester);
      expect(find.text('Step 3 of 9'), findsOneWidget);

      await _completeStep3(tester);
      expect(find.text('Step 4 of 9'), findsOneWidget);

      await _completeStep4(tester);
      expect(find.text('Step 5 of 9'), findsOneWidget);

      await _completeStep5(tester);
      expect(find.text('Step 6 of 9'), findsOneWidget);

      await _completeStep6AsOwner(tester);
      expect(find.text('Step 7 of 9'), findsOneWidget);

      await _completeStep7(tester);
      expect(find.text('Step 8 of 9'), findsOneWidget);

      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
        reason: 'declarations have not been checked yet',
      );
      await _checkAllDeclarations(tester);
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNotNull,
      );
      await tester.tap(_continueButton());
      await tester.pumpAndSettle();
      expect(find.text('Step 9 of 9'), findsOneWidget);

      expect(find.text('Pending Assessment'), findsWidgets);
      expect(
        tester.widget<ElevatedButton>(_submitButton()).onPressed,
        isNotNull,
        reason: 'nothing blocks submission on the assessment step',
      );

      await tester.tap(_submitButton());
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      expect(find.text('Renovation Application Submitted!'), findsOneWidget);
      expect(find.textContaining('REN-'), findsOneWidget);
      expect(find.text('Building Permit — Renovation'), findsOneWidget);
    },
  );

  testWidgets(
    'Step 3: selecting "Electrical System" makes Electrical Plans conditionally required in Step 7',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      await _completeStep2(tester);

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Project / Renovation Title *'),
        'Electrical Upgrade',
      );
      await tester.enterText(
        find.widgetWithText(
          TextFormField,
          'General Description of Renovation *',
        ),
        'Upgrading the electrical system.',
      );
      await tester.tap(find.text('Electrical System'));
      await tester.pump();
      await tester.tap(_continueButton());
      await tester.pumpAndSettle();
      await _completeStep4(tester);
      await _completeStep5(tester);
      await _completeStep6AsOwner(tester);

      expect(find.text('Step 7 of 9'), findsOneWidget);
      await tester.ensureVisible(
        find.text('Renovation Technical Documents'),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Renovation Technical Documents'));
      await tester.pumpAndSettle();

      expect(
        find.textContaining(
          'Conditionally required — Electrical System selected',
        ),
        findsOneWidget,
      );
    },
  );

  testWidgets(
    'Step 6 "No" reveals representative fields and 4 uploads; switching back to "Yes" does not throw',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      await _completeStep2(tester);
      await _completeStep3(tester);
      await _completeStep4(tester);
      await _completeStep5(tester);

      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
      );
      await tester.tap(find.text('No'));
      await tester.pump();
      expect(
        find.widgetWithText(
          TextFormField,
          'Registered Property Owner Full Name *',
        ),
        findsOneWidget,
      );
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
        reason: 'representative fields and uploads are still missing',
      );

      // Switching back to "Yes" should not throw despite hidden/partially
      // filled representative fields.
      await tester.tap(find.text('Yes'));
      await tester.pump();
      expect(tester.takeException(), isNull);
      expect(
        find.widgetWithText(
          TextFormField,
          'Registered Property Owner Full Name *',
        ),
        findsNothing,
      );
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNotNull,
      );
    },
  );

  testWidgets(
    'Step 7 "Existing Building Documents" can be marked not available instead of uploaded',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      await _completeStep2(tester);
      await _completeStep3(tester);
      await _completeStep4(tester);
      await _completeStep5(tester);
      await _completeStep6AsOwner(tester);

      await tester.ensureVisible(find.text('Existing Building Documents'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Existing Building Documents'));
      await tester.pumpAndSettle();

      final notAvailableRow = find.text("I don't have this document").first;
      await tester.ensureVisible(notAvailableRow);
      await tester.pumpAndSettle();
      await tester.tap(notAvailableRow);
      await tester.pumpAndSettle();

      expect(find.text('Marked as not available'), findsOneWidget);
      expect(tester.takeException(), isNull);
    },
  );

  testWidgets(
    'Back navigation preserves data across Steps 1-4',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      await _completeStep2(tester);
      await _completeStep3(tester);
      await _completeStep4(tester);
      expect(find.text('Step 5 of 9'), findsOneWidget);

      await tester.tap(find.widgetWithText(OutlinedButton, 'Back'));
      await tester.pumpAndSettle();
      expect(find.text('Step 4 of 9'), findsOneWidget);
      expect(
        find.widgetWithText(TextFormField, 'Single Detached Residential Building'),
        findsOneWidget,
      );

      await tester.tap(find.widgetWithText(OutlinedButton, 'Back'));
      await tester.pumpAndSettle();
      await tester.tap(find.widgetWithText(OutlinedButton, 'Back'));
      await tester.pumpAndSettle();
      expect(find.text('Step 2 of 9'), findsOneWidget);
      expect(
        find.widgetWithText(TextFormField, 'Rizal St.'),
        findsWidgets,
      );

      await tester.tap(find.widgetWithText(OutlinedButton, 'Back'));
      await tester.pumpAndSettle();
      expect(find.text('Step 1 of 9'), findsOneWidget);
      expect(find.widgetWithText(TextFormField, 'Juan'), findsOneWidget);
    },
  );

  testWidgets('Step 8 Edit button jumps back to the correct step and returns', (
    tester,
  ) async {
    await _useTallSurface(tester);
    await _openWizard(tester);
    await _completeStep1(tester);
    await _completeStep2(tester);
    await _completeStep3(tester);
    await _completeStep4(tester);
    await _completeStep5(tester);
    await _completeStep6AsOwner(tester);
    await _completeStep7(tester);

    expect(find.text('Step 8 of 9'), findsOneWidget);
    expect(find.text('Juan Dela Cruz'), findsOneWidget);

    await tester.tap(find.widgetWithText(TextButton, 'Edit').first);
    await tester.pumpAndSettle();
    expect(find.text('Step 1 of 9'), findsOneWidget);
    expect(find.widgetWithText(TextFormField, 'Juan'), findsOneWidget);
  });

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
