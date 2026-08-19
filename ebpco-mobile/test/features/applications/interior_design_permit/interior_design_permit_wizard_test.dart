import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:ebpco_user_app/core/providers/auth_provider.dart';
import 'package:ebpco_user_app/core/providers/interior_design_permit_provider.dart';
import 'package:ebpco_user_app/features/applications/presentation/interior_design_permit/interior_design_application_submitted_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/interior_design_permit/interior_design_permit_wizard_screen.dart';

/// End-to-end coverage of the Interior Design Permit wizard — fully
/// separate from every other permit wizard in this app, driven the same
/// way those wizards' tests drive them. Unlike most other permits, the
/// Professionals step (Step 5) shows the Design Professional and
/// Supervisor sections simultaneously (no same-person toggle), so every
/// field label in that step is duplicated and must be located by index.
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
        builder: (context, state) => const InteriorDesignPermitWizardScreen(),
      ),
      GoRoute(
        path: '/applications/new/interior-design-permit/submitted',
        builder: (context, state) {
          final extra = state.extra as Map<String, Object?>?;
          return InteriorDesignApplicationSubmittedScreen(
            referenceNumber: extra?['referenceNumber'] as String? ?? 'IDP-X',
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
      ChangeNotifierProvider<InteriorDesignPermitProvider>(
        create: (_) => InteriorDesignPermitProvider(),
      ),
    ],
    child: MaterialApp.router(routerConfig: router),
  );
}

Finder _continueButton() => find.widgetWithText(ElevatedButton, 'Continue');
Finder _submitButton() =>
    find.widgetWithText(ElevatedButton, 'Submit Application');

Future<void> _useTallSurface(WidgetTester tester) async {
  await tester.binding.setSurfaceSize(const Size(400, 8000));
  addTearDown(() => tester.binding.setSurfaceSize(null));
}

Future<void> _openWizard(WidgetTester tester) async {
  await tester.pumpWidget(_wrap());
  await tester.pumpAndSettle();
  await tester.tap(find.text('Back Screen'));
  await tester.pumpAndSettle();
}

Future<void> _pickTodayAt(
  WidgetTester tester,
  String label, [
  int index = 0,
]) async {
  final target = find.text(label).at(index);
  await tester.ensureVisible(target);
  await tester.pumpAndSettle();
  await tester.tap(target);
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
  await tester.tap(find.byWidgetPredicate((w) => w is DropdownButtonFormField));
  await tester.pumpAndSettle();
  await tester.tap(find.text('Group A — Residential Dwelling').last);
  await tester.pumpAndSettle();
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
  await tester.tap(find.text('New Construction'));
  await tester.pump();
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

Future<void> _completeStep4(WidgetTester tester) async {
  await tester.tap(find.text('Renovation of Rooms or Areas'));
  await tester.pump();
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

/// Fills both the Design Professional and Supervisor sections
/// independently — both are always shown and always required, since this
/// permit never auto-assumes the two roles are the same person.
Future<void> _completeStep5(WidgetTester tester) async {
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Full Name *').at(0),
    'Arch. Maria Santos',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Professional Address *').at(0),
    '123 Kalayaan Ave., Quezon City',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'PRC Number *').at(0),
    'PRC-0001',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'PTR Number *').at(0),
    'PTR-0001',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'PTR Place Issued *').at(0),
    'Quezon City',
  );
  await tester.pump();

  final professionDropdowns = find.byWidgetPredicate(
    (w) => w is DropdownButtonFormField,
  );
  await tester.ensureVisible(professionDropdowns.at(0));
  await tester.pumpAndSettle();
  await tester.tap(professionDropdowns.at(0));
  await tester.pumpAndSettle();
  await tester.tap(find.text('Architect').last);
  await tester.pumpAndSettle();

  await _pickTodayAt(tester, 'PRC Validity *', 0);
  await _pickTodayAt(tester, 'PTR Date Issued *', 0);

  await tester.enterText(
    find.widgetWithText(TextFormField, 'Full Name *').at(1),
    'Engr. Pedro Reyes',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Professional Address *').at(1),
    '456 Kalayaan Ave., Quezon City',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'PRC Number *').at(1),
    'PRC-0002',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'PTR Number *').at(1),
    'PTR-0002',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'PTR Place Issued *').at(1),
    'Quezon City',
  );
  await tester.pump();

  await tester.ensureVisible(professionDropdowns.at(1));
  await tester.pumpAndSettle();
  await tester.tap(professionDropdowns.at(1));
  await tester.pumpAndSettle();
  await tester.tap(find.text('Civil Engineer').last);
  await tester.pumpAndSettle();

  await _pickTodayAt(tester, 'PRC Validity *', 1);
  await _pickTodayAt(tester, 'PTR Date Issued *', 1);

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

/// Leaves Lot Ownership at "Yes" (Building Owner is also the Lot Owner),
/// which is a valid state that skips the separate Lot Owner section.
Future<void> _completeStep6(WidgetTester tester) async {
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Building Owner Full Name *'),
    'Juan Dela Cruz',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Building Owner Address *'),
    '789 Kalayaan Ave., Quezon City',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'CTC Number *').first,
    'CTC-0001',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Place Issued *').first,
    'Quezon City',
  );
  await tester.pump();
  await _pickTodayAt(tester, 'Date Issued *', 0);

  await tester.ensureVisible(
    find.widgetWithText(OutlinedButton, 'Upload').first,
  );
  await tester.pumpAndSettle();
  await tester.tap(find.widgetWithText(OutlinedButton, 'Upload').first);
  await tester.pump();

  final yesButtons = find.text('Yes');
  await tester.ensureVisible(yesButtons.first);
  await tester.pumpAndSettle();
  await tester.tap(yesButtons.first);
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
  // "Interior Layout Documents" starts expanded already, so it's
  // deliberately excluded here — tapping it again would collapse it.
  for (final section in [
    'Elevations and Perspectives',
    'Finishes and Fixtures',
    'Ceiling and Lighting',
    'Life Safety and Mechanical',
    'Cost and Material Documents',
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
    'I certify that the information provided in this application is '
        'true and accurate.',
    'I understand that interior works must follow the approved plans '
        'and applicable regulations.',
    'I understand that this Interior Design Permit is null and void '
        'unless accompanied by a valid related Building Permit.',
    'I understand that all required signed and sealed professional '
        'documents must be authentic.',
  ]) {
    await tester.ensureVisible(find.text(label));
    await tester.pumpAndSettle();
    await tester.tap(find.text(label));
    await tester.pump();
  }
}

void main() {
  testWidgets(
    'Step 1 renders with Permit Type fixed to Interior Design Permit',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      expect(tester.takeException(), isNull);

      expect(find.text('Step 1 of 9'), findsOneWidget);
      expect(find.text('Applicant Information'), findsOneWidget);
      expect(find.text('Interior Design Permit'), findsWidgets);
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
      expect(find.text('Not yet available'), findsWidgets);
      expect(
        tester.widget<ElevatedButton>(_submitButton()).onPressed,
        isNotNull,
        reason: 'nothing blocks submission on the evaluation status step',
      );

      await tester.tap(_submitButton());
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      expect(
        find.text('Interior Design Application Submitted!'),
        findsOneWidget,
      );
      expect(find.textContaining('IDP-'), findsOneWidget);
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
    'Selecting "Others" scope requires a specification before continuing',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      await _completeStep2(tester);

      await tester.tap(find.text('Others').first);
      await tester.pump();
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
        reason: 'Others requires a specification',
      );

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Specify Other Scope *'),
        'Temporary partition work.',
      );
      await tester.pump();
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNotNull,
      );
    },
  );

  testWidgets(
    '"Use the same professional information" copies the Design Professional into the Supervisor section',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      await _completeStep2(tester);
      await _completeStep3(tester);
      await _completeStep4(tester);

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Full Name *').at(0),
        'Arch. Maria Santos',
      );
      await tester.enterText(
        find.widgetWithText(TextFormField, 'PRC Number *').at(0),
        'PRC-0001',
      );
      await tester.pump();

      final copyButton = find.widgetWithText(
        OutlinedButton,
        'Use the same professional information as the Licensed Design '
            'Professional',
      );
      await tester.ensureVisible(copyButton);
      await tester.pumpAndSettle();
      await tester.tap(copyButton);
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);

      expect(
        find.widgetWithText(TextFormField, 'Arch. Maria Santos'),
        findsNWidgets(2),
        reason: 'Full Name was copied into the Supervisor field',
      );
      expect(
        find.widgetWithText(TextFormField, 'PRC-0001'),
        findsNWidgets(2),
        reason: 'PRC Number was copied into the Supervisor field',
      );
    },
  );

  testWidgets(
    'Lot Ownership "No" reveals a separate Lot Owner section',
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

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Building Owner Full Name *'),
        'Juan Dela Cruz',
      );
      await tester.pump();

      final noButton = find.text('No');
      await tester.ensureVisible(noButton);
      await tester.pumpAndSettle();
      await tester.tap(noButton);
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      expect(
        find.widgetWithText(TextFormField, 'Lot Owner Full Name *'),
        findsOneWidget,
      );
      expect(find.text('Lot Owner Consent'), findsOneWidget);
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
