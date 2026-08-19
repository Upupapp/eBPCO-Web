import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:ebpco_user_app/core/providers/building_permit_provider.dart';
import 'package:ebpco_user_app/features/applications/presentation/building_permit/application_submitted_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/building_permit/building_permit_wizard_screen.dart';

/// Covers Steps 6-9 (Consent & Authorization, Required Documents, Review &
/// Declaration, Assessment & Payment) plus final submission, mirroring the
/// driving pattern established in the earlier Steps 1-5 test files.
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
        builder: (context, state) => const BuildingPermitWizardScreen(),
      ),
      GoRoute(
        path: '/applications/new/building-permit/submitted',
        builder: (context, state) => ApplicationSubmittedScreen(
          trackingId: state.extra as String? ?? 'BP-UNKNOWN',
        ),
      ),
    ],
  );
  return ChangeNotifierProvider<BuildingPermitProvider>(
    create: (_) => BuildingPermitProvider(),
    child: MaterialApp.router(routerConfig: router),
  );
}

Finder _continueButton() => find.widgetWithText(ElevatedButton, 'Continue');
Finder _submitButton() =>
    find.widgetWithText(ElevatedButton, 'Submit Application');

Future<void> _useTallSurface(WidgetTester tester) async {
  await tester.binding.setSurfaceSize(const Size(400, 3000));
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
    find.widgetWithText(TextFormField, 'Mobile Number *'),
    '09171234567',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Email Address *'),
    'juan@example.com',
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
  await tester.tap(find.text('Group A — Residential, Dwellings'));
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
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Occupancy Classification *'),
    'Single Detached Residential Building',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Number of Units *'),
    '1',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Total Floor Area *'),
    '120.5',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Lot Area *'),
    '200',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Total Estimated Construction Cost *'),
    '1500000',
  );
  await tester.pump();
  await _pickToday(tester, 'Proposed Date of Construction *');
  await _pickNextMonthFirst(tester, 'Expected Date of Completion *');
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

Future<void> _completeStep5(WidgetTester tester) async {
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Full Name *'),
    'Arch. Maria Santos',
  );
  await tester.tap(
    find.byWidgetPredicate((widget) => widget is DropdownButtonFormField),
  );
  await tester.pumpAndSettle();
  await tester.tap(find.text('Architect').last);
  await tester.pumpAndSettle();
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Address *'),
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
  await _pickNextMonthFirst(tester, 'PRC Validity Date *');
  await _pickToday(tester, 'PTR Date Issued *');
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

/// Answers "Yes" on Step 6 (registered owner) — the quickest path through
/// to Step 7 for tests that don't specifically exercise the representative
/// branch.
Future<void> _completeStep6AsOwner(WidgetTester tester) async {
  await tester.tap(find.text('Yes'));
  await tester.pump();
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

Future<void> _uploadAllRequiredDocuments(WidgetTester tester) async {
  const sections = [
    'Property Documents',
    'Technical Documents',
    'Professional Documents',
    'Government Clearances',
  ];
  for (final section in sections) {
    if (section != 'Property Documents') {
      await tester.ensureVisible(find.text(section));
      await tester.pumpAndSettle();
      await tester.tap(find.text(section));
      await tester.pumpAndSettle();
    }
    Finder uploadButtons() => find.widgetWithText(OutlinedButton, 'Upload');
    var guard = 0;
    final before = uploadButtons().evaluate().length;
    while (guard < 10) {
      final current = uploadButtons();
      if (current.evaluate().isEmpty) break;
      await tester.ensureVisible(current.first);
      await tester.pumpAndSettle();
      await tester.tap(current.first);
      await tester.pump();
      guard++;
      if (guard >= before + 2) break;
    }
  }
}

Future<void> _completeStep7(WidgetTester tester) async {
  await _uploadAllRequiredDocuments(tester);
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

Future<void> _checkAllDeclarations(WidgetTester tester) async {
  for (final label in [
    'I certify that the information provided is true and correct.',
    'I understand the application requirements.',
    'I agree to the Terms & Conditions.',
  ]) {
    await tester.ensureVisible(find.text(label));
    await tester.pumpAndSettle();
    await tester.tap(find.text(label));
    await tester.pump();
  }
}

void main() {
  testWidgets(
    'Step 6 requires an ownership answer, and "No" reveals required representative fields and uploads',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      await _completeStep2(tester);
      await _completeStep3(tester);
      await _completeStep4(tester);
      await _completeStep5(tester);

      expect(find.text('Step 6 of 9'), findsOneWidget);
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
      );

      // "Yes" requires nothing further.
      await tester.tap(find.text('Yes'));
      await tester.pump();
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNotNull,
      );

      // Switching to "No" reveals the representative fields and resets
      // validity until they're filled in.
      await tester.tap(find.text('No'));
      await tester.pump();
      expect(
        find.widgetWithText(TextFormField, 'Representative Name *'),
        findsOneWidget,
      );
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
      );

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Representative Name *'),
        'Pedro Reyes',
      );
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Representative Address *'),
        '456 Mabini St., Quezon City',
      );
      await tester.enterText(
        find.widgetWithText(TextFormField, 'CTC Number *'),
        'CTC-0001',
      );
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Place Issued *'),
        'Quezon City',
      );
      await tester.pump();
      await _pickToday(tester, 'Date Issued *');
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
        reason: 'the two authorization documents are still missing',
      );

      final uploadButtons = find.widgetWithText(OutlinedButton, 'Upload');
      await tester.ensureVisible(uploadButtons.first);
      await tester.pumpAndSettle();
      await tester.tap(uploadButtons.first);
      await tester.pump();
      await tester.tap(find.widgetWithText(OutlinedButton, 'Upload').first);
      await tester.pump();
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNotNull,
      );

      await tester.tap(_continueButton());
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      expect(find.text('Step 7 of 9'), findsOneWidget);
    },
  );

  testWidgets(
    'Step 7 requires every document category to be uploaded, and sections expand/collapse',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      await _completeStep2(tester);
      await _completeStep3(tester);
      await _completeStep4(tester);
      await _completeStep5(tester);
      await _completeStep6AsOwner(tester);

      expect(find.text('Step 7 of 9'), findsOneWidget);
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
      );

      // Property Documents starts expanded; its uploads are immediately
      // usable without needing to tap anything first.
      expect(find.text('Land Title'), findsOneWidget);
      expect(
        find.widgetWithText(OutlinedButton, 'Upload'),
        findsWidgets,
      );

      // Toggling a collapsed section open and shut again shouldn't throw
      // (AnimatedCrossFade keeps both children mounted — fading/clipping
      // the hidden one rather than removing it — so this only asserts
      // on exceptions, not on tree presence).
      await tester.ensureVisible(find.text('Technical Documents'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Technical Documents'));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      await tester.tap(find.text('Technical Documents'));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);

      await _uploadAllRequiredDocuments(tester);
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNotNull,
      );

      await tester.tap(_continueButton());
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      expect(find.text('Step 8 of 9'), findsOneWidget);
    },
  );

  testWidgets(
    'Step 8 summarizes prior steps, Edit jumps back to the right step, and Continue needs all three declarations',
    (tester) async {
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
      expect(find.text('Arch. Maria Santos'), findsOneWidget);
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
      );

      // Edit on "Applicant" jumps back to Step 1 without losing data.
      await tester.tap(find.widgetWithText(TextButton, 'Edit').first);
      await tester.pumpAndSettle();
      expect(find.text('Step 1 of 9'), findsOneWidget);
      expect(find.widgetWithText(TextFormField, 'Juan'), findsOneWidget);

      // Walk back to Step 8.
      for (var i = 0; i < 7; i++) {
        await tester.tap(_continueButton());
        await tester.pumpAndSettle();
      }
      expect(find.text('Step 8 of 9'), findsOneWidget);

      await _checkAllDeclarations(tester);
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNotNull,
      );

      await tester.tap(_continueButton());
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      expect(find.text('Step 9 of 9'), findsOneWidget);
    },
  );

  testWidgets(
    'Step 9 shows every assessment line item as Pending Assessment and Submit Application always enabled, leading to the confirmation screen',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      await _completeStep2(tester);
      await _completeStep3(tester);
      await _completeStep4(tester);
      await _completeStep5(tester);
      await _completeStep6AsOwner(tester);
      await _completeStep7(tester);
      await _checkAllDeclarations(tester);
      await tester.tap(_continueButton());
      await tester.pumpAndSettle();

      expect(find.text('Step 9 of 9'), findsOneWidget);
      expect(find.text('Pay Onsite'), findsOneWidget);
      expect(find.text('Bank Transfer'), findsOneWidget);
      expect(find.text('Pending Assessment'), findsWidgets);
      expect(find.text('Filing Fee'), findsOneWidget);
      expect(find.text('Total'), findsOneWidget);

      expect(_submitButton(), findsOneWidget);
      expect(
        tester.widget<ElevatedButton>(_submitButton()).onPressed,
        isNotNull,
        reason: 'nothing blocks submission on the assessment step',
      );

      await tester.tap(_submitButton());
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      expect(find.text('Application Submitted!'), findsOneWidget);
      expect(find.textContaining('BP-'), findsOneWidget);
    },
  );

  testWidgets('Back navigation from Step 9 down to Step 6 preserves data', (
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
    await _checkAllDeclarations(tester);
    await tester.tap(_continueButton());
    await tester.pumpAndSettle();
    expect(find.text('Step 9 of 9'), findsOneWidget);

    await tester.tap(find.widgetWithText(OutlinedButton, 'Back'));
    await tester.pumpAndSettle();
    expect(find.text('Step 8 of 9'), findsOneWidget);

    await tester.tap(find.widgetWithText(OutlinedButton, 'Back'));
    await tester.pumpAndSettle();
    expect(find.text('Step 7 of 9'), findsOneWidget);
    expect(find.text('Land Title'), findsOneWidget);

    await tester.tap(find.widgetWithText(OutlinedButton, 'Back'));
    await tester.pumpAndSettle();
    expect(find.text('Step 6 of 9'), findsOneWidget);
    expect(
      tester.widget<ElevatedButton>(_continueButton()).onPressed,
      isNotNull,
      reason: '"Yes" should still be selected from earlier',
    );
  });
}
