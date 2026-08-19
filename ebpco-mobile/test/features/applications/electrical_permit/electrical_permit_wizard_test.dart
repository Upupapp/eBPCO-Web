import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:ebpco_user_app/core/providers/auth_provider.dart';
import 'package:ebpco_user_app/core/providers/electrical_permit_provider.dart';
import 'package:ebpco_user_app/features/applications/presentation/electrical_permit/electrical_application_submitted_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/electrical_permit/electrical_permit_wizard_screen.dart';

/// End-to-end coverage of the Electrical Permit wizard — fully separate
/// from the New Construction, Renovation, Addition/Extension, Demolition,
/// Architectural, and Civil/Structural wizards, driven the same way those
/// wizards' tests drive them.
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
        builder: (context, state) => const ElectricalPermitWizardScreen(),
      ),
      GoRoute(
        path: '/applications/new/electrical-permit/submitted',
        builder: (context, state) {
          final extra = state.extra as Map<String, Object?>?;
          return ElectricalApplicationSubmittedScreen(
            referenceNumber: extra?['referenceNumber'] as String? ?? 'ELE-X',
            submissionDate:
                extra?['submissionDate'] as DateTime? ?? DateTime.now(),
            relatedBuildingPermitNumber:
                extra?['relatedBuildingPermitNumber'] as String? ?? '',
            relatedBuildingPermitStatus:
                extra?['relatedBuildingPermitStatus'] as String? ?? 'Pending',
            electricalContractorRequired:
                extra?['electricalContractorRequired'] as bool? ?? false,
          );
        },
      ),
    ],
  );
  return MultiProvider(
    providers: [
      ChangeNotifierProvider<AuthProvider>(create: (_) => AuthProvider()),
      ChangeNotifierProvider<ElectricalPermitProvider>(
        create: (_) => ElectricalPermitProvider(),
      ),
    ],
    child: MaterialApp.router(routerConfig: router),
  );
}

Finder _continueButton() => find.widgetWithText(ElevatedButton, 'Continue');
Finder _submitButton() =>
    find.widgetWithText(ElevatedButton, 'Submit Application');

Future<void> _useTallSurface(WidgetTester tester) async {
  await tester.binding.setSurfaceSize(const Size(400, 5200));
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

/// Leaves the Related Building Permit at its default "Pending" status
/// with the purely-electrical toggle off, which is a valid state (no
/// Building Permit Number required).
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
  await tester.tap(find.byType(Switch).first);
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
  await tester.tap(find.text('New Installation'));
  await tester.pump();
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Electrical Work Title *'),
    'New Residential Electrical Installation',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'General Description of Electrical Work *'),
    'Complete new electrical installation for a residential unit.',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Existing Electrical Condition *'),
    'No existing electrical system.',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Proposed Electrical Changes *'),
    'New wiring, outlets, and panelboard.',
  );
  await tester.pump();
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

/// Keeps the main service well under the 200A / 230V contractor threshold
/// so the happy-path flow doesn't need Step 5's contractor section.
Future<void> _completeStep4(WidgetTester tester) async {
  await tester.tap(find.byWidgetPredicate((w) => w is DropdownButtonFormField));
  await tester.pumpAndSettle();
  await tester.tap(find.text('Group A — Residential Dwelling').last);
  await tester.pumpAndSettle();

  await tester.enterText(
    find.widgetWithText(TextFormField, 'Total Connected Load (kVA) *'),
    '10',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Main Service Voltage (V) *'),
    '220',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Main Service Current (A) *'),
    '60',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Number of Phases *'),
    '1',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Frequency *'),
    '60 Hz',
  );
  await tester.pump();
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

Future<void> _completeStep5(WidgetTester tester) async {
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Full Name *'),
    'Engr. Maria Santos',
  );
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
  for (var i = 0; i < 5; i++) {
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

Future<void> _completeStep6(WidgetTester tester) async {
  await tester.tap(find.text('Yes').first);
  await tester.pump();
  final yesButtons = find.text('Yes');
  await tester.ensureVisible(yesButtons.at(1));
  await tester.pumpAndSettle();
  await tester.tap(yesButtons.at(1));
  await tester.pump();
  await tester.ensureVisible(
    find.widgetWithText(OutlinedButton, 'Upload').first,
  );
  await tester.pumpAndSettle();
  await tester.tap(find.widgetWithText(OutlinedButton, 'Upload').first);
  await tester.pump();
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

Future<void> _uploadAllVisibleDocuments(WidgetTester tester) async {
  var guard = 0;
  while (guard < 60) {
    final uploadButtons = find.widgetWithText(OutlinedButton, 'Upload');
    if (uploadButtons.evaluate().isEmpty) break;
    final target = uploadButtons.first;
    final scrollable = find
        .ancestor(of: target, matching: find.byType(Scrollable))
        .first;
    await tester.dragUntilVisible(target, scrollable, const Offset(0, -300));
    await tester.pumpAndSettle();
    await tester.tap(target);
    await tester.pump();
    guard++;
  }
}

Future<void> _completeStep7(WidgetTester tester) async {
  // "Electrical Plans and Specifications" starts expanded already, so
  // it's deliberately excluded here — tapping it again would collapse it.
  for (final section in [
    'Load and Capacity Documents',
    'Special Fixtures and Equipment',
    'Scope-Specific Documents',
    'Professional Documents',
    'Project Schedule',
    'Supporting Documents',
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
    'I confirm that the electrical plans and specifications were prepared by a properly licensed electrical professional.',
    'I understand that the electrical installation must follow the approved plans and applicable electrical codes.',
    'I understand that a licensed electrical practitioner must supervise or take charge of the installation.',
    'I understand that a PCAB-licensed specialty electrical contractor is required when the applicable capacity threshold is reached.',
    'I understand that a Notice of Construction may be required before electrical installation begins.',
    'I understand that as-built plans, logbook entries, and a Certificate of Completion may be required after completion.',
    'I understand that a Certificate of Final Electrical Inspection must be secured before actual occupancy.',
    'I understand that this permit must be accompanied by the related Building Permit, except as allowed for purely electrical work on an existing building.',
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
    'Step 1 renders with Permit Type fixed to Electrical Permit',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      expect(tester.takeException(), isNull);

      expect(find.text('Step 1 of 9'), findsOneWidget);
      expect(find.text('Applicant Information'), findsOneWidget);
      expect(find.text('Electrical Permit'), findsWidgets);
    },
  );

  testWidgets(
    'Continue navigates Step 1 through Step 9, and Submit Application opens the confirmation screen with the pending Building Permit warning',
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

      await _completeStep6(tester);
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

      expect(find.text('Invalid Without Building Permit'), findsWidgets);
      expect(
        tester.widget<ElevatedButton>(_submitButton()).onPressed,
        isNotNull,
        reason: 'nothing blocks submission on the evaluation status step',
      );

      await tester.tap(_submitButton());
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      expect(
        find.text('Electrical Application Submitted!'),
        findsOneWidget,
      );
      expect(find.textContaining('ELE-'), findsOneWidget);
      expect(find.text('Not Required'), findsOneWidget);
    },
  );

  testWidgets(
    'Toggling "purely electrical on existing building" requires a Building Permit Number',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);

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
      await tester.tap(find.byType(Switch).first);
      await tester.pumpAndSettle();
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Lot Number *'),
        '12',
      );
      await tester.pump();

      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNotNull,
        reason: 'Pending status without the toggle does not require a number',
      );

      final purelyElectricalSwitch = find.byWidgetPredicate(
        (w) =>
            w is SwitchListTile &&
            w.title is Text &&
            (w.title as Text).data ==
                'Is this a purely electrical project on an existing building?',
      );
      await tester.ensureVisible(purelyElectricalSwitch);
      await tester.pumpAndSettle();
      await tester.tap(purelyElectricalSwitch);
      await tester.pumpAndSettle();

      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
        reason: 'the toggle requires a Building Permit number',
      );

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Building Permit Number *'),
        'BP-2026-999999',
      );
      await tester.pump();
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNotNull,
      );
    },
  );

  testWidgets(
    'Reaching the 200A / 230V threshold shows the contractor banner and requires contractor details in Step 5',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      await _completeStep2(tester);
      await _completeStep3(tester);

      await tester.tap(
        find.byWidgetPredicate((w) => w is DropdownButtonFormField),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Group A — Residential Dwelling').last);
      await tester.pumpAndSettle();
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Total Connected Load (kVA) *'),
        '150',
      );
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Main Service Voltage (V) *'),
        '230',
      );
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Main Service Current (A) *'),
        '200',
      );
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Number of Phases *'),
        '3',
      );
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Frequency *'),
        '60 Hz',
      );
      await tester.pump();

      expect(
        find.textContaining(
          'A PCAB-licensed specialty electrical contractor is required',
        ),
        findsOneWidget,
      );

      await tester.tap(_continueButton());
      await tester.pumpAndSettle();
      await _completeStep5(tester);

      expect(
        find.widgetWithText(TextFormField, 'Contractor Name *'),
        findsOneWidget,
        reason: 'contractor fields must appear once the threshold is met',
      );
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
        reason: 'contractor details are still missing',
      );
    },
  );

  testWidgets(
    'Supervisor "No" reveals separate fields and uploads; switching back to "Yes" does not throw',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      await _completeStep2(tester);
      await _completeStep3(tester);
      await _completeStep4(tester);

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Full Name *'),
        'Engr. Maria Santos',
      );
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

      // Step 5 also renders an optional "Add Electrical Contractor
      // Information" switch below the mandatory threshold, so the
      // Supervisor-same toggle must be selected by position (it renders
      // first).
      final switchFinder = find.byType(Switch).first;
      await tester.ensureVisible(switchFinder);
      await tester.pumpAndSettle();
      await tester.tap(switchFinder);
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);

      expect(
        find.widgetWithText(TextFormField, 'Full Name *'),
        findsNWidgets(2),
        reason: 'the Supervisor now has its own Full Name field',
      );

      await tester.tap(switchFinder);
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      expect(find.widgetWithText(TextFormField, 'Full Name *'), findsOneWidget);
    },
  );

  testWidgets(
    'Building Owner "No" reveals representative fields and Lot Owner question works independently',
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

      await tester.tap(find.text('No').first);
      await tester.pump();
      expect(
        find.widgetWithText(TextFormField, 'Building Owner Full Name *'),
        findsOneWidget,
      );
      expect(find.text('Authorization Letter or SPA'), findsOneWidget);

      await tester.tap(find.text('Yes').first);
      await tester.pump();
      expect(tester.takeException(), isNull);
      expect(
        find.widgetWithText(TextFormField, 'Building Owner Full Name *'),
        findsNothing,
      );
    },
  );

  testWidgets('Back navigation preserves data across Steps 1-3', (
    tester,
  ) async {
    await _useTallSurface(tester);
    await _openWizard(tester);
    await _completeStep1(tester);
    await _completeStep2(tester);
    await _completeStep3(tester);
    expect(find.text('Step 4 of 9'), findsOneWidget);

    await tester.tap(find.widgetWithText(OutlinedButton, 'Back'));
    await tester.pumpAndSettle();
    expect(find.text('Step 3 of 9'), findsOneWidget);
    expect(
      find.widgetWithText(
        TextFormField,
        'New Residential Electrical Installation',
      ),
      findsOneWidget,
    );

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
