import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:ebpco_user_app/core/providers/auth_provider.dart';
import 'package:ebpco_user_app/core/providers/sanitary_plumbing_permit_provider.dart';
import 'package:ebpco_user_app/features/applications/presentation/sanitary_plumbing_permit/sanitary_plumbing_application_submitted_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/sanitary_plumbing_permit/sanitary_plumbing_permit_wizard_screen.dart';

/// End-to-end coverage of the Sanitary / Plumbing Permit wizard — fully
/// separate from the New Construction, Renovation, Addition/Extension,
/// Demolition, Architectural, Civil/Structural, Electrical, and
/// Mechanical wizards, driven the same way those wizards' tests drive
/// them.
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
            const SanitaryPlumbingPermitWizardScreen(),
      ),
      GoRoute(
        path: '/applications/new/sanitary-plumbing-permit/submitted',
        builder: (context, state) {
          final extra = state.extra as Map<String, Object?>?;
          return SanitaryPlumbingApplicationSubmittedScreen(
            referenceNumber: extra?['referenceNumber'] as String? ?? 'SAN-X',
            submissionDate:
                extra?['submissionDate'] as DateTime? ?? DateTime.now(),
            relatedBuildingPermitNumber:
                extra?['relatedBuildingPermitNumber'] as String? ?? '',
            relatedBuildingPermitStatus:
                extra?['relatedBuildingPermitStatus'] as String? ?? 'Pending',
          );
        },
      ),
    ],
  );
  return MultiProvider(
    providers: [
      ChangeNotifierProvider<AuthProvider>(create: (_) => AuthProvider()),
      ChangeNotifierProvider<SanitaryPlumbingPermitProvider>(
        create: (_) => SanitaryPlumbingPermitProvider(),
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

/// Leaves the Related Building Permit at its default "Pending" status,
/// which is a valid state (no Building Permit Number required).
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
  await tester.tap(find.text('New Installation'));
  await tester.pump();
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Sanitary / Plumbing Work Title *'),
    'New Plumbing Installation',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'General Description of Work *'),
    'Installation of new sanitary and plumbing fixtures.',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Existing System Condition *'),
    'No existing plumbing system.',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Proposed Changes *'),
    'New water closet and supply lines.',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Areas of the Building Affected *'),
    'Comfort room, ground floor.',
  );
  await tester.pump();
  await tester.tap(find.text('Residential'));
  await tester.pump();
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

/// Selects "Water Closet" (index 0 in the fixture list) with a New
/// quantity of 1, "City / Municipal Water System" for water supply, and
/// "Sanitary Sewer Connection" for disposal — the simplest conditional
/// group in each category, keeping the happy path manageable.
Future<void> _completeStep4(WidgetTester tester) async {
  await tester.enterText(
    find.widgetWithText(TextFormField, 'New').at(0),
    '1',
  );
  await tester.pump();

  await tester.tap(find.text('City / Municipal Water System'));
  await tester.pump();
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Water Service Provider *'),
    'Metro Waterworks',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Water Meter Size *'),
    '1/2 inch',
  );
  await tester.pump();

  await tester.tap(find.text('Sanitary Sewer Connection'));
  await tester.pump();
  await tester.enterText(
    find.widgetWithText(
      TextFormField,
      'Sewer Provider or Receiving System *',
    ),
    'City Sewerage System',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Connection Point *'),
    'Manhole near property line.',
  );
  await tester.pump();

  await tester.enterText(
    find.widgetWithText(TextFormField, 'Number of Storeys *'),
    '2',
  );
  await tester.enterText(
    find.widgetWithText(
      TextFormField,
      'Total Building or Subdivision Area (sq. m.) *',
    ),
    '100',
  );
  await _pickToday(tester, 'Proposed Start Date of Installation *');
  await _pickNextMonthFirst(tester, 'Expected Completion Date *');
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Total Cost of Installation (₱) *'),
    '500000',
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
  await tester.pump();
  await tester.tap(find.byWidgetPredicate((w) => w is DropdownButtonFormField));
  await tester.pumpAndSettle();
  await tester.tap(find.text('Sanitary Engineer').last);
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
  while (guard < 90) {
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
  // "Core Plans and Specifications" starts expanded already, so it's
  // deliberately excluded here — tapping it again would collapse it.
  for (final section in [
    'Cost and Material Documents',
    'Water-Supply Documents',
    'Disposal-System Documents',
    'Fixture-Specific Documents',
    'Professional Documents',
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
    'I confirm that the sanitary and plumbing plans and specifications were prepared by a properly licensed professional.',
    'I understand that sanitary and plumbing work must follow approved plans and applicable sanitation, plumbing, and building codes.',
    'I understand that a licensed professional must supervise or take charge of the work.',
    'I understand that a Notice of Construction may be required before sanitary or plumbing work begins.',
    'I understand that required logbook entries, as-built plans, and a Certificate of Completion may be required after completion.',
    'I understand that this Sanitary / Plumbing Permit must be accompanied by a valid Building Permit.',
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
    'Step 1 renders with Permit Type fixed to Sanitary / Plumbing Permit',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      expect(tester.takeException(), isNull);

      expect(find.text('Step 1 of 9'), findsOneWidget);
      expect(find.text('Applicant Information'), findsOneWidget);
      expect(find.text('Sanitary / Plumbing Permit'), findsWidgets);
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
        find.text('Sanitary / Plumbing Application Submitted!'),
        findsOneWidget,
      );
      expect(find.textContaining('SAN-'), findsOneWidget);
    },
  );

  testWidgets(
    'Selecting "Approved" status requires a Building Permit Number in Step 2',
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
      await tester.tap(find.byType(Switch));
      await tester.pumpAndSettle();
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Lot Number *'),
        '12',
      );
      await tester.pump();

      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNotNull,
        reason: 'Pending does not require a Building Permit number',
      );

      await tester.tap(
        find.byWidgetPredicate((w) => w is DropdownButtonFormField),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Approved').last);
      await tester.pumpAndSettle();

      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
        reason: 'Approved status requires a Building Permit number',
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
    'Deselecting a water-supply system removes its conditional fields without crashing',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      await _completeStep2(tester);
      await _completeStep3(tester);

      await tester.tap(find.text('City / Municipal Water System'));
      await tester.pump();
      expect(find.text('Water Service Provider *'), findsOneWidget);

      // Once the conditional group renders, the label appears twice (the
      // chip itself plus the group's own title) — .first always targets
      // the chip, which is what toggles the selection.
      await tester.tap(find.text('City / Municipal Water System').first);
      await tester.pump();
      expect(tester.takeException(), isNull);
      expect(find.text('Water Service Provider *'), findsNothing);
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
      await tester.tap(
        find.byWidgetPredicate((w) => w is DropdownButtonFormField),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Sanitary Engineer').last);
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

      final switchFinder = find.byType(Switch);
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
      find.widgetWithText(TextFormField, 'New Plumbing Installation'),
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
