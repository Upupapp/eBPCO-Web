import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:ebpco_user_app/core/providers/addition_extension_permit_provider.dart';
import 'package:ebpco_user_app/core/providers/auth_provider.dart';
import 'package:ebpco_user_app/features/applications/presentation/addition_extension_permit/addition_extension_application_submitted_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/addition_extension_permit/addition_extension_permit_wizard_screen.dart';

/// End-to-end coverage of the Addition / Extension Permit wizard — fully
/// separate from both the New Construction and Renovation wizards, driven
/// the same way those wizards' tests drive them.
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
        builder: (context, state) =>
            const AdditionExtensionPermitWizardScreen(),
      ),
      GoRoute(
        path: '/applications/new/addition-extension-permit/submitted',
        builder: (context, state) {
          final extra = state.extra as Map<String, Object?>?;
          return AdditionExtensionApplicationSubmittedScreen(
            referenceNumber: extra?['referenceNumber'] as String? ?? 'ADX-X',
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
      ChangeNotifierProvider<AdditionExtensionPermitProvider>(
        create: (_) => AdditionExtensionPermitProvider(),
      ),
    ],
    child: MaterialApp.router(routerConfig: router),
  );
}

Finder _continueButton() => find.widgetWithText(ElevatedButton, 'Continue');
Finder _submitButton() =>
    find.widgetWithText(ElevatedButton, 'Submit Application');

Future<void> _useTallSurface(WidgetTester tester) async {
  await tester.binding.setSurfaceSize(const Size(400, 3600));
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

/// Completes Step 3 selecting "New Room" (a non-structural addition type)
/// and "Doors and Windows" (an affected area that doesn't trigger any
/// conditional document requirement), so the main happy-path flow stays
/// simple.
Future<void> _completeStep3(WidgetTester tester) async {
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Project Title *'),
    'New Room Addition',
  );
  await tester.enterText(
    find.widgetWithText(
      TextFormField,
      'General Description of the Addition / Extension *',
    ),
    'Adding a new room to the existing house.',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Existing Building Description *'),
    'A single-storey residential house.',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Purpose of the Proposed Addition *'),
    'Additional living space.',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Connection to Existing Building *'),
    'Directly attached to the rear wall.',
  );
  await tester.pump();
  await tester.tap(find.text('New Room'));
  await tester.pump();
  await tester.tap(find.text('Doors and Windows'));
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
    find.widgetWithText(TextFormField, 'Existing Occupancy Classification *'),
    'Single Detached Residential Building',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Existing Number of Units *'),
    '1',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Existing Number of Storeys *'),
    '1',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Existing Floor Area *'),
    '100',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Proposed Added Number of Units *'),
    '0',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Proposed Additional Storeys *'),
    '0',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Proposed Added Floor Area *'),
    '25',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Lot Area *'),
    '200',
  );
  await tester.enterText(
    find.widgetWithText(
      TextFormField,
      'Estimated Addition / Extension Cost *',
    ),
    '200000',
  );
  await tester.pump();
  await _pickToday(tester, 'Proposed Construction Start Date *');
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
  // Only 4 uploads required here (New Room + Doors/Windows doesn't
  // trigger the conditional Structural Analysis upload).
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
    'Addition / Extension Technical Documents',
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
    'I confirm that this application is for an addition to or extension of an existing building.',
    'I understand that the proposed work may require applicable ancillary permits.',
    'I understand that plans and specifications must be signed and sealed by the appropriate licensed professionals.',
    'I confirm that the proposed addition is accurately represented in the submitted plans.',
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
    'Step 1 renders with Project Type fixed to Addition / Extension and Scope of Work fixed to Addition',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      expect(tester.takeException(), isNull);

      expect(find.text('Step 1 of 9'), findsOneWidget);
      expect(find.text('Applicant Information'), findsOneWidget);
      expect(find.text('Addition / Extension'), findsOneWidget);
      expect(find.textContaining('Official Scope of Work: Addition'), findsOneWidget);
    },
  );

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
      expect(
        find.text('Addition / Extension Application Submitted!'),
        findsOneWidget,
      );
      expect(find.textContaining('ADX-'), findsOneWidget);
      expect(
        find.text('Building Permit – Addition / Extension'),
        findsOneWidget,
      );
      expect(find.text('Addition'), findsOneWidget);
    },
  );

  testWidgets(
    'Resulting Total Floor Area calculates live and stays safe with empty inputs',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      await _completeStep2(tester);
      await _completeStep3(tester);

      expect(find.text('— sq m'), findsOneWidget);

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Existing Floor Area *'),
        '100',
      );
      await tester.pump();
      expect(find.text('— sq m'), findsOneWidget, reason: 'still missing the added area');

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Proposed Added Floor Area *'),
        '25',
      );
      await tester.pump();
      expect(tester.takeException(), isNull);
      expect(find.text('125.00 sq m'), findsOneWidget);

      // Clearing a field back to empty must not crash or show NaN.
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Existing Floor Area *'),
        '',
      );
      await tester.pump();
      expect(tester.takeException(), isNull);
      expect(find.textContaining('NaN'), findsNothing);
      expect(find.textContaining('Infinity'), findsNothing);
      expect(find.text('— sq m'), findsOneWidget);
    },
  );

  testWidgets(
    'Selecting "Electrical System" makes Electrical Plans conditionally required in Step 7',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      await _completeStep2(tester);

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Project Title *'),
        'Electrical Upgrade Addition',
      );
      await tester.enterText(
        find.widgetWithText(
          TextFormField,
          'General Description of the Addition / Extension *',
        ),
        'Adding a room with new electrical wiring.',
      );
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Existing Building Description *'),
        'A single-storey residential house.',
      );
      await tester.enterText(
        find.widgetWithText(
          TextFormField,
          'Purpose of the Proposed Addition *',
        ),
        'Additional living space.',
      );
      await tester.enterText(
        find.widgetWithText(
          TextFormField,
          'Connection to Existing Building *',
        ),
        'Directly attached to the rear wall.',
      );
      await tester.tap(find.text('New Room'));
      await tester.pump();
      await tester.tap(find.text('Electrical System'));
      await tester.pump();
      await tester.tap(_continueButton());
      await tester.pumpAndSettle();

      await _completeStep4(tester);
      await _completeStep5(tester);
      await _completeStep6AsOwner(tester);

      expect(find.text('Step 7 of 9'), findsOneWidget);
      await tester.ensureVisible(
        find.text('Addition / Extension Technical Documents'),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Addition / Extension Technical Documents'));
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
    'Selecting a structural affected area requires Structural Analysis in Step 5',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      await _completeStep2(tester);

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Project Title *'),
        'Wall Addition',
      );
      await tester.enterText(
        find.widgetWithText(
          TextFormField,
          'General Description of the Addition / Extension *',
        ),
        'Adding a room that ties into an existing wall.',
      );
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Existing Building Description *'),
        'A single-storey residential house.',
      );
      await tester.enterText(
        find.widgetWithText(
          TextFormField,
          'Purpose of the Proposed Addition *',
        ),
        'Additional living space.',
      );
      await tester.enterText(
        find.widgetWithText(
          TextFormField,
          'Connection to Existing Building *',
        ),
        'Ties into an existing load-bearing wall.',
      );
      await tester.tap(find.text('New Room'));
      await tester.pump();
      await tester.tap(find.text('Walls'));
      await tester.pump();
      await tester.tap(_continueButton());
      await tester.pumpAndSettle();
      await _completeStep4(tester);

      expect(find.text('Step 5 of 9'), findsOneWidget);
      expect(
        find.textContaining('Required — structural work is involved'),
        findsOneWidget,
      );
    },
  );

  testWidgets(
    '"None" is mutually exclusive with other affected-area selections',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      await _completeStep2(tester);

      await tester.tap(find.text('Doors and Windows'));
      await tester.pump();
      await tester.tap(find.text('None'));
      await tester.pump();
      expect(tester.takeException(), isNull);

      final noneChip = tester.widget<FilterChip>(
        find.ancestor(
          of: find.text('None'),
          matching: find.byType(FilterChip),
        ),
      );
      final doorsChip = tester.widget<FilterChip>(
        find.ancestor(
          of: find.text('Doors and Windows'),
          matching: find.byType(FilterChip),
        ),
      );
      expect(noneChip.selected, isTrue);
      expect(doorsChip.selected, isFalse);

      // Selecting a real area again should clear "None".
      await tester.tap(find.text('Doors and Windows'));
      await tester.pump();
      final noneChipAfter = tester.widget<FilterChip>(
        find.ancestor(
          of: find.text('None'),
          matching: find.byType(FilterChip),
        ),
      );
      expect(noneChipAfter.selected, isFalse);
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

  testWidgets('Step 8 Edit button jumps back to the correct step and preserves data', (
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

  testWidgets('Back navigation preserves data across Steps 1-4', (
    tester,
  ) async {
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
      find.widgetWithText(
        TextFormField,
        'Single Detached Residential Building',
      ),
      findsOneWidget,
    );

    await tester.tap(find.widgetWithText(OutlinedButton, 'Back'));
    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(OutlinedButton, 'Back'));
    await tester.pumpAndSettle();
    expect(find.text('Step 2 of 9'), findsOneWidget);
    expect(find.widgetWithText(TextFormField, 'Rizal St.'), findsWidgets);

    await tester.tap(find.widgetWithText(OutlinedButton, 'Back'));
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
