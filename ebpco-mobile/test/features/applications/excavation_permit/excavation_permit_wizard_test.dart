import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:ebpco_user_app/core/providers/auth_provider.dart';
import 'package:ebpco_user_app/core/providers/excavation_permit_provider.dart';
import 'package:ebpco_user_app/features/applications/presentation/excavation_permit/excavation_application_submitted_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/excavation_permit/excavation_permit_wizard_screen.dart';

/// End-to-end coverage of the Excavation & Ground Preparation Permit
/// wizard — fully separate from every other permit wizard in this app,
/// driven the same way those wizards' tests drive them. Step 9 uniquely
/// combines Owner Consent input with the full application review and the
/// Submit action on a single page.
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
        builder: (context, state) => const ExcavationPermitWizardScreen(),
      ),
      GoRoute(
        path: '/applications/new/excavation-permit/submitted',
        builder: (context, state) {
          final extra = state.extra as Map<String, Object?>?;
          return ExcavationApplicationSubmittedScreen(
            referenceNumber: extra?['referenceNumber'] as String? ?? 'EGP-X',
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
      ChangeNotifierProvider<ExcavationPermitProvider>(
        create: (_) => ExcavationPermitProvider(),
      ),
    ],
    child: MaterialApp.router(routerConfig: router),
  );
}

Finder _continueButton() => find.widgetWithText(ElevatedButton, 'Continue');
Finder _submitButton() =>
    find.widgetWithText(ElevatedButton, 'Submit Application');

Future<void> _useTallSurface(WidgetTester tester) async {
  await tester.binding.setSurfaceSize(const Size(400, 9000));
  addTearDown(() => tester.binding.setSurfaceSize(null));
}

Future<void> _openWizard(WidgetTester tester) async {
  await tester.pumpWidget(_wrap());
  await tester.pumpAndSettle();
  await tester.tap(find.text('Back Screen'));
  await tester.pumpAndSettle();
}

Future<void> _pickToday(
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

/// Leaves the Related Building Permit at its default "Pending" status,
/// which is already a valid state (no Building Permit Number required),
/// so Step 1 needs no input at all before continuing.
Future<void> _completeStep1(WidgetTester tester) async {
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

Future<void> _completeStep2(WidgetTester tester) async {
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Last Name *'),
    'Dela Cruz',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'First Name *'),
    'Juan',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Telephone / Mobile Number *'),
    '09171234567',
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
  await tester.pump();
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

Future<void> _completeStep3(WidgetTester tester) async {
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
  await tester.pump();
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

Future<void> _completeStep4(WidgetTester tester) async {
  await tester.tap(find.text('New Construction'));
  await tester.pump();
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

Future<void> _completeStep5(WidgetTester tester) async {
  await _selectDropdown(tester, 0, 'Group A – Residential Dwellings');
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

Future<void> _completeStep6(WidgetTester tester) async {
  await tester.tap(find.text('Excavation and Fills'));
  await tester.pump();
  await tester.enterText(
    find.widgetWithText(
      TextFormField,
      'Estimated Excavation Depth (meters) *',
    ),
    '1.5',
  );
  await tester.enterText(
    find.widgetWithText(
      TextFormField,
      'Estimated Excavation Volume (cubic meters) *',
    ),
    '20',
  );
  await tester.pump();
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

Future<void> _fillProfessionalFields(
  WidgetTester tester, {
  required String fullName,
  required String profession,
  required String address,
  required String prcNumber,
  required String ptrNumber,
  required String ptrPlaceIssued,
}) async {
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Full Name *'),
    fullName,
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Professional Address *'),
    address,
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'PRC Number *'),
    prcNumber,
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'PTR Number *'),
    ptrNumber,
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'PTR Place Issued *'),
    ptrPlaceIssued,
  );
  await tester.pump();
  await _selectDropdown(tester, 0, profession);
  await _pickToday(tester, 'PRC Validity *');
  await _pickToday(tester, 'PTR Date Issued *');
}

Future<void> _completeStep7(WidgetTester tester) async {
  await _fillProfessionalFields(
    tester,
    fullName: 'Arch. Maria Santos',
    profession: 'Architect',
    address: '123 Kalayaan Ave., Quezon City',
    prcNumber: 'PRC-0001',
    ptrNumber: 'PTR-0001',
    ptrPlaceIssued: 'Quezon City',
  );
  await tester.ensureVisible(
    find.widgetWithText(OutlinedButton, 'Upload').first,
  );
  await tester.pumpAndSettle();
  await tester.tap(find.widgetWithText(OutlinedButton, 'Upload').first);
  await tester.pump();
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

Future<void> _completeStep8(WidgetTester tester) async {
  await _fillProfessionalFields(
    tester,
    fullName: 'Engr. Pedro Reyes',
    profession: 'Civil Engineer',
    address: '456 Kalayaan Ave., Quezon City',
    prcNumber: 'PRC-0002',
    ptrNumber: 'PTR-0002',
    ptrPlaceIssued: 'Quezon City',
  );
  await tester.ensureVisible(
    find.widgetWithText(OutlinedButton, 'Upload').first,
  );
  await tester.pumpAndSettle();
  await tester.tap(find.widgetWithText(OutlinedButton, 'Upload').first);
  await tester.pump();
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

Future<void> _checkAllDeclarations(WidgetTester tester) async {
  for (final label in [
    'I certify that the submitted information is complete and accurate.',
    'I understand that excavation and ground preparation work must '
        'follow the approved plans and applicable regulations.',
    'I understand that this permit supports construction activities but '
        'does not replace, and does not guarantee the granting of, the '
        'Building Permit.',
    'I understand that all required signed and sealed professional '
        'documents must be authentic.',
  ]) {
    await tester.ensureVisible(find.text(label));
    await tester.pumpAndSettle();
    await tester.tap(find.text(label));
    await tester.pump();
  }
}

/// Fills the Owner Information fields and leaves Lot Ownership at "Yes"
/// (the Owner is also the Lot Owner), which is a valid state that skips
/// the separate Lot Owner section.
Future<void> _fillOwnerAndCheckDeclarations(WidgetTester tester) async {
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Printed Name *'),
    'Juan Dela Cruz',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Address *'),
    '789 Kalayaan Ave., Quezon City',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Community Tax Certificate Number *'),
    'CTC-0001',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Place Issued *'),
    'Quezon City',
  );
  await tester.pump();
  await _pickToday(tester, 'Date Issued *');

  await tester.ensureVisible(
    find.widgetWithText(OutlinedButton, 'Upload').first,
  );
  await tester.pumpAndSettle();
  await tester.tap(find.widgetWithText(OutlinedButton, 'Upload').first);
  await tester.pump();

  final yesButton = find.text('Yes');
  await tester.ensureVisible(yesButton);
  await tester.pumpAndSettle();
  await tester.tap(yesButton);
  await tester.pump();

  await _checkAllDeclarations(tester);
}

void main() {
  testWidgets(
    'Step 1 renders with Permit Information heading',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      expect(tester.takeException(), isNull);

      expect(find.text('Step 1 of 9'), findsOneWidget);
      expect(find.text('Permit Information'), findsWidgets);
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

      await _completeStep8(tester);
      expect(find.text('Step 9 of 9'), findsOneWidget);

      expect(
        tester.widget<ElevatedButton>(_submitButton()).onPressed,
        isNull,
        reason: 'owner consent and declarations have not been completed yet',
      );
      await _fillOwnerAndCheckDeclarations(tester);
      expect(
        tester.widget<ElevatedButton>(_submitButton()).onPressed,
        isNotNull,
      );

      await tester.tap(_submitButton());
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      expect(
        find.text('Excavation Permit Submitted!'),
        findsOneWidget,
      );
      expect(find.textContaining('EGP-'), findsOneWidget);
    },
  );

  testWidgets(
    'Selecting "Approved" status requires a Building Permit Number in Step 1',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);

      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNotNull,
        reason: 'Pending does not require a Building Permit number',
      );

      await _selectDropdown(tester, 0, 'Approved');

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
      await _completeStep3(tester);

      await tester.tap(find.text('Others').first);
      await tester.pump();
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
        reason: 'Others requires a specification',
      );

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Specify Other Scope *'),
        'Temporary site clearing.',
      );
      await tester.pump();
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNotNull,
      );
    },
  );

  testWidgets(
    'Selecting "Others" occupancy requires a specification before continuing',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      await _completeStep2(tester);
      await _completeStep3(tester);
      await _completeStep4(tester);

      await _selectDropdown(tester, 0, 'Others');
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
        reason: 'Others requires a specification',
      );

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Specify Occupancy *'),
        'Mixed-use development.',
      );
      await tester.pump();
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNotNull,
      );
    },
  );

  testWidgets(
    'Excavation depth exceeding 2 meters shows the cash bond notice',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      await _completeStep2(tester);
      await _completeStep3(tester);
      await _completeStep4(tester);
      await _completeStep5(tester);

      await tester.tap(find.text('Excavation and Fills'));
      await tester.pump();
      await tester.enterText(
        find.widgetWithText(
          TextFormField,
          'Estimated Excavation Depth (meters) *',
        ),
        '3',
      );
      await tester.enterText(
        find.widgetWithText(
          TextFormField,
          'Estimated Excavation Volume (cubic meters) *',
        ),
        '10',
      );
      await tester.pump();

      expect(
        find.textContaining('exceeds the 2-meter depth threshold'),
        findsOneWidget,
      );
    },
  );

  testWidgets(
    '"Use the same information as the Design Professional" copies Step 7 values into Step 8',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      await _completeStep2(tester);
      await _completeStep3(tester);
      await _completeStep4(tester);
      await _completeStep5(tester);
      await _completeStep6(tester);
      await _completeStep7(tester);

      final checkbox = find.text(
        'Use the same information as the Design Professional',
      );
      await tester.ensureVisible(checkbox);
      await tester.pumpAndSettle();
      await tester.tap(checkbox);
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);

      expect(
        find.widgetWithText(TextFormField, 'Arch. Maria Santos'),
        findsOneWidget,
        reason: 'Full Name was copied from the Design Professional',
      );
      expect(
        find.widgetWithText(TextFormField, 'PRC-0001'),
        findsOneWidget,
        reason: 'PRC Number was copied from the Design Professional',
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
      await _completeStep6(tester);
      await _completeStep7(tester);
      await _completeStep8(tester);

      expect(
        tester.widget<ElevatedButton>(_submitButton()).onPressed,
        isNull,
      );

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Printed Name *'),
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
        find.widgetWithText(TextFormField, 'Printed Name *'),
        findsNWidgets(2),
        reason: 'the Lot Owner now has its own Printed Name field',
      );
      expect(find.text('Lot Owner Information'), findsWidgets);
    },
  );

  testWidgets('Save as Draft works and preserves values', (tester) async {
    await _useTallSurface(tester);
    await _openWizard(tester);

    await tester.tap(_continueButton());
    await tester.pumpAndSettle();
    await tester.enterText(
      find.widgetWithText(TextFormField, 'Last Name *'),
      'Dela Cruz',
    );
    await tester.pump();

    await tester.tap(find.text('Save Draft'));
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
    expect(find.text('Draft saved successfully.'), findsOneWidget);
    expect(find.widgetWithText(TextFormField, 'Dela Cruz'), findsOneWidget);
  });
}
