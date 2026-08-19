import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:ebpco_user_app/core/providers/auth_provider.dart';
import 'package:ebpco_user_app/core/providers/demolition_permit_provider.dart';
import 'package:ebpco_user_app/features/applications/presentation/demolition_permit/demolition_application_submitted_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/demolition_permit/demolition_permit_wizard_screen.dart';

/// End-to-end coverage of the Demolition Permit wizard — fully separate
/// from the New Construction, Renovation, and Addition/Extension wizards,
/// driven the same way those wizards' tests drive them.
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
        builder: (context, state) => const DemolitionPermitWizardScreen(),
      ),
      GoRoute(
        path: '/applications/new/demolition-permit/submitted',
        builder: (context, state) {
          final extra = state.extra as Map<String, Object?>?;
          return DemolitionApplicationSubmittedScreen(
            referenceNumber: extra?['referenceNumber'] as String? ?? 'DEM-X',
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
      ChangeNotifierProvider<DemolitionPermitProvider>(
        create: (_) => DemolitionPermitProvider(),
      ),
    ],
    child: MaterialApp.router(routerConfig: router),
  );
}

Finder _continueButton() => find.widgetWithText(ElevatedButton, 'Continue');
Finder _submitButton() =>
    find.widgetWithText(ElevatedButton, 'Submit Application');

Future<void> _useTallSurface(WidgetTester tester) async {
  await tester.binding.setSurfaceSize(const Size(400, 4400));
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
  await tester.tap(find.byWidgetPredicate((w) => w is DropdownButtonFormField));
  await tester.pumpAndSettle();
  await tester.tap(find.text('Group A — Residential, Dwellings').last);
  await tester.pumpAndSettle();
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

/// Selects "Complete Demolition" so no conditional fields (portion to be
/// demolished, structural assessment, shoring plan) are triggered, keeping
/// the main happy-path flow simple.
Future<void> _completeStep3(WidgetTester tester) async {
  await tester.tap(find.text('Complete Demolition'));
  await tester.pump();
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Structure Name *'),
    'Main Residential Building',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Description of Existing Structure *'),
    'A single-storey residential house.',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Existing Use or Occupancy *'),
    'Residential',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Number of Storeys *'),
    '1',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Number of Units *'),
    '1',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Approximate Floor Area (sq. m.) *'),
    '100',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Approximate Building Height (m) *'),
    '6',
  );
  await tester.pump();
  await tester.tap(find.byWidgetPredicate((w) => w is DropdownButtonFormField));
  await tester.pumpAndSettle();
  await tester.tap(find.text('Reinforced Concrete').last);
  await tester.pumpAndSettle();
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Estimated Age of Structure *'),
    '25 years',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Reason for Demolition *'),
    'Structure is beyond repair.',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Proposed Demolition Method *'),
    'Manual dismantling.',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Estimated Demolition Cost (₱) *'),
    '150000',
  );
  await tester.pump();
  await _pickToday(tester, 'Proposed Start Date *');
  await _pickNextMonthFirst(tester, 'Expected Completion Date *');
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

/// Answers "No" to occupancy and every site-risk question, leaving all six
/// utilities at their default "Not Applicable" status, so none of the
/// conditional fields/uploads are triggered.
Future<void> _completeStep4(WidgetTester tester) async {
  final noOptions = find.text('No');
  await tester.ensureVisible(noOptions.at(0));
  await tester.tap(noOptions.at(0));
  await tester.pump();

  for (final label in [
    'Demolition area will be secured against unauthorized access.',
    'Entrances and exits will be properly protected.',
    'Public roads, sidewalks, and adjacent properties will be protected.',
    'Glazed doors and windows will be removed or secured before demolition.',
    'Fire, explosion, gas-leak, and flooding hazards will be controlled.',
    'Charged electrical cables will not remain in the demolition area.',
    'Required utility providers will be notified.',
    'Debris will be contained and removed safely.',
    'Dust and noise control measures will be applied.',
    'Workers will use appropriate personal protective equipment.',
  ]) {
    await tester.ensureVisible(find.text(label));
    await tester.pumpAndSettle();
    await tester.tap(find.text(label));
    await tester.pump();
  }

  await tester.enterText(
    find.widgetWithText(
      TextFormField,
      'Distance to Nearest Adjacent Structure (m) *',
    ),
    '5',
  );
  await tester.pump();

  final noOptionsAfterSafety = find.text('No');
  await tester.ensureVisible(noOptionsAfterSafety.at(1));
  await tester.tap(noOptionsAfterSafety.at(1));
  await tester.pump();
  await tester.ensureVisible(noOptionsAfterSafety.at(2));
  await tester.tap(noOptionsAfterSafety.at(2));
  await tester.pump();
  await tester.ensureVisible(noOptionsAfterSafety.at(3));
  await tester.tap(noOptionsAfterSafety.at(3));
  await tester.pump();

  await tester.enterText(
    find.widgetWithText(TextFormField, 'Debris Disposal Location *'),
    'Approved landfill site.',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Site Security Method *'),
    'Perimeter fencing with security guard.',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Dust Control Method *'),
    'Water spraying.',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Noise Control Method *'),
    'Work limited to daytime hours.',
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
  await tester.tap(find.byWidgetPredicate((w) => w is DropdownButtonFormField));
  await tester.pumpAndSettle();
  await tester.tap(find.text('Civil Engineer').last);
  await tester.pumpAndSettle();
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Professional Address *'),
    '123 Kalayaan Ave., Quezon City',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Telephone / Mobile Number *'),
    '09179876543',
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
  // Complete Demolition doesn't require Structural Assessment, so only 6
  // uploads are needed here.
  for (var i = 0; i < 6; i++) {
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
  while (guard < 40) {
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
  // "Property and Existing Building Documents" starts expanded already, so
  // it's deliberately excluded here — tapping it again would collapse it.
  for (final section in [
    'Demolition Technical Documents',
    'Professional Documents',
    'Government and Local Clearances',
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
    'I confirm that the structure will be fully vacated before demolition begins.',
    'I confirm that all utilities will be disconnected or safely controlled before demolition begins.',
    'I understand that the demolition work must be supervised by the licensed professional named in this application.',
    'I agree to implement all safety measures declared in this application.',
    'I understand that the required advance notice to neighbors and affected parties must be given before demolition begins.',
    'I understand that demolition work may not begin until the Demolition Permit has been issued.',
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
    'Step 1 renders with Permit Type fixed to Demolition',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      expect(tester.takeException(), isNull);

      expect(find.text('Step 1 of 9'), findsOneWidget);
      expect(find.text('Applicant Information'), findsOneWidget);
      expect(find.text('Demolition'), findsOneWidget);
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
        reason: 'nothing blocks submission on the evaluation status step',
      );

      await tester.tap(_submitButton());
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      expect(
        find.text('Demolition Application Submitted!'),
        findsOneWidget,
      );
      expect(find.textContaining('DEM-'), findsOneWidget);
      expect(find.text('Demolition Permit'), findsWidgets);
    },
  );

  testWidgets(
    'Selecting "Structural Component Removal" requires Structural Assessment in Step 5 and Shoring Plan in Step 7',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      await _completeStep2(tester);

      await tester.tap(find.text('Structural Component Removal'));
      await tester.pump();
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Structure Name *'),
        'Main Residential Building',
      );
      await tester.enterText(
        find.widgetWithText(
          TextFormField,
          'Description of Existing Structure *',
        ),
        'A single-storey residential house.',
      );
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Existing Use or Occupancy *'),
        'Residential',
      );
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Number of Storeys *'),
        '1',
      );
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Number of Units *'),
        '1',
      );
      await tester.enterText(
        find.widgetWithText(
          TextFormField,
          'Approximate Floor Area (sq. m.) *',
        ),
        '100',
      );
      await tester.enterText(
        find.widgetWithText(
          TextFormField,
          'Approximate Building Height (m) *',
        ),
        '6',
      );
      await tester.pump();
      await tester.tap(
        find.byWidgetPredicate((w) => w is DropdownButtonFormField),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Reinforced Concrete').last);
      await tester.pumpAndSettle();
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Estimated Age of Structure *'),
        '25 years',
      );
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Reason for Demolition *'),
        'Structure is beyond repair.',
      );
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Proposed Demolition Method *'),
        'Partial teardown of the rear wing.',
      );
      await tester.enterText(
        find.widgetWithText(
          TextFormField,
          'Estimated Demolition Cost (₱) *',
        ),
        '150000',
      );
      await tester.pump();
      await _pickToday(tester, 'Proposed Start Date *');
      await _pickNextMonthFirst(tester, 'Expected Completion Date *');
      await tester.tap(_continueButton());
      await tester.pumpAndSettle();

      expect(find.text('Step 4 of 9'), findsOneWidget);
      await _completeStep4(tester);

      expect(find.text('Step 5 of 9'), findsOneWidget);
      expect(
        find.text('Structural Assessment'),
        findsOneWidget,
        reason: 'structural component removal requires this upload',
      );
    },
  );

  testWidgets(
    'Marking "Existing Building Permit" not available requires an explanation',
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
      // "Property and Existing Building Documents" starts expanded already.
      final notAvailableTarget = find.text("I don't have this document").first;
      final notAvailableScrollable = find
          .ancestor(of: notAvailableTarget, matching: find.byType(Scrollable))
          .first;
      await tester.dragUntilVisible(
        notAvailableTarget,
        notAvailableScrollable,
        const Offset(0, -300),
      );
      await tester.pumpAndSettle();
      await tester.tap(notAvailableTarget);
      await tester.pumpAndSettle();

      expect(
        find.text('Explain why this document is not available *'),
        findsOneWidget,
      );
    },
  );

  testWidgets(
    'Step 6 "No" reveals representative fields and Lot Owner Consent upload; switching back to "Yes" does not throw',
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
        find.widgetWithText(TextFormField, 'Registered Lot Owner Full Name *'),
        findsOneWidget,
      );
      expect(find.text('Lot Owner Consent'), findsOneWidget);
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
        reason: 'representative fields and uploads are still missing',
      );

      await tester.tap(find.text('Yes'));
      await tester.pump();
      expect(tester.takeException(), isNull);
      expect(
        find.widgetWithText(TextFormField, 'Registered Lot Owner Full Name *'),
        findsNothing,
      );
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNotNull,
      );
    },
  );

  testWidgets(
    'Answering "Yes" to Building Occupied reveals the vacation-date fields',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      await _completeStep2(tester);
      await _completeStep3(tester);

      await tester.tap(find.text('Yes').first);
      await tester.pump();
      expect(tester.takeException(), isNull);
      expect(find.text('Planned Vacation Date *'), findsOneWidget);
      expect(
        find.widgetWithText(TextFormField, 'Occupant Relocation Plan *'),
        findsOneWidget,
      );
      expect(
        find.widgetWithText(
          TextFormField,
          'Person Responsible for Clearing the Building *',
        ),
        findsOneWidget,
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
      find.widgetWithText(TextFormField, 'Main Residential Building'),
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
