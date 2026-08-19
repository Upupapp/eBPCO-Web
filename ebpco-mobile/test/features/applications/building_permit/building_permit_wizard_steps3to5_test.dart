import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:ebpco_user_app/core/providers/building_permit_provider.dart';
import 'package:ebpco_user_app/features/applications/presentation/building_permit/building_permit_wizard_screen.dart';

/// Covers Steps 3-5 (Project Information, Building Details, Professional in
/// Charge) plus the Step 6 placeholder, mirroring the driving pattern
/// established in building_permit_wizard_test.dart for Steps 1-2.
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
    ],
  );
  return ChangeNotifierProvider<BuildingPermitProvider>(
    create: (_) => BuildingPermitProvider(),
    child: MaterialApp.router(routerConfig: router),
  );
}

Future<void> _openWizard(WidgetTester tester) async {
  await tester.pumpWidget(_wrap());
  await tester.pumpAndSettle();
  await tester.tap(find.text('Back Screen'));
  await tester.pumpAndSettle();
}

Finder _continueButton() => find.widgetWithText(ElevatedButton, 'Continue');

Future<void> _useTallSurface(WidgetTester tester) async {
  await tester.binding.setSurfaceSize(const Size(400, 2200));
  addTearDown(() => tester.binding.setSurfaceSize(null));
}

/// Finds the "Others" [RadioListTile] regardless of its generic type
/// argument — `find.widgetWithText(RadioListTile<OccupancyGroup>, ...)`
/// would require callers to know the exact generic type, so match on the
/// raw type instead.
Finder _radioTileWithText(String text) {
  return find.byWidgetPredicate((widget) {
    if (widget is! RadioListTile) return false;
    final title = widget.title;
    return title is Text && title.data == text;
  });
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
  // Copies street/barangay/city/province/zip into the construction location.
  await tester.tap(find.byType(Switch));
  await tester.pumpAndSettle();
  // Lot Number has no applicant-address equivalent, so it must still be
  // filled in manually even after the copy toggle.
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Lot Number *'),
    '12',
  );
  await tester.pump();
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

/// Selects "today" in the Material date picker dialog opened by tapping the
/// [DatePickerField] with the given [label] text (tapping the label — which
/// sits inside the field's InkWell — triggers the same onTap as tapping
/// anywhere else in the field).
Future<void> _pickToday(WidgetTester tester, String label) async {
  await tester.ensureVisible(find.text(label));
  await tester.pumpAndSettle();
  await tester.tap(find.text(label));
  await tester.pumpAndSettle();
  await tester.tap(find.text('OK'));
  await tester.pumpAndSettle();
}

/// Opens the Material date picker for the [DatePickerField] labeled [label],
/// advances to the next month, and confirms the 1st of that month —
/// guaranteed to be later than whatever "today" resolves to.
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

/// Opens the Material date picker for the [DatePickerField] labeled [label],
/// goes back to the previous month, and confirms the 1st of that month —
/// guaranteed to be earlier than "today".
Future<void> _pickPreviousMonthFirst(WidgetTester tester, String label) async {
  await tester.ensureVisible(find.text(label));
  await tester.pumpAndSettle();
  await tester.tap(find.text(label));
  await tester.pumpAndSettle();
  await tester.tap(find.byIcon(Icons.chevron_left));
  await tester.pumpAndSettle();
  await tester.tap(find.text('1').last);
  await tester.pumpAndSettle();
  await tester.tap(find.text('OK'));
  await tester.pumpAndSettle();
}

Future<void> _completeStep3(WidgetTester tester) async {
  // Scope of Work already has "New Construction" preselected; Building Use
  // still needs a selection.
  await tester.tap(find.text('Group A — Residential, Dwellings'));
  await tester.pump();
  await tester.tap(_continueButton());
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

void main() {
  testWidgets(
    'Step 3 renders and Continue is disabled until Building Use is selected',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      await _completeStep2(tester);

      expect(tester.takeException(), isNull);
      expect(find.text('Step 3 of 9'), findsOneWidget);
      expect(find.text('Project Information'), findsOneWidget);
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
        reason: 'Building Use has not been selected yet',
      );

      await tester.tap(find.text('Group A — Residential, Dwellings'));
      await tester.pump();
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNotNull,
      );
    },
  );

  testWidgets(
    'Step 3 "Others" reveals required Specify fields for both Scope of Work and Building Use',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      await _completeStep2(tester);

      await tester.tap(find.text('Group A — Residential, Dwellings'));
      await tester.pump();
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNotNull,
      );

      // Selecting "Others" for scope of work reveals a required field and
      // disables Continue until it's filled.
      await tester.tap(find.widgetWithText(CheckboxListTile, 'Others'));
      await tester.pump();
      expect(
        find.widgetWithText(TextFormField, 'Specify Scope of Work *'),
        findsOneWidget,
      );
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
      );

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Specify Scope of Work *'),
        'Fence construction',
      );
      await tester.pump();
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNotNull,
      );

      // Switching Building Use to "Others" reveals its own required field.
      // The Building Use section sits below the fold once the Scope of
      // Work "Specify" field is showing, so scroll it into view first.
      await tester.ensureVisible(_radioTileWithText('Others'));
      await tester.pumpAndSettle();
      await tester.tap(_radioTileWithText('Others'));
      await tester.pump();
      expect(
        find.widgetWithText(TextFormField, 'Specify Building Use *'),
        findsOneWidget,
      );
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
      );

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Specify Building Use *'),
        'Mixed-use structure',
      );
      await tester.pump();
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNotNull,
      );
    },
  );

  testWidgets(
    'Step 4 requires positive numeric fields and rejects a completion date that is not after the proposed date',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      await _completeStep2(tester);
      await _completeStep3(tester);

      expect(find.text('Step 4 of 9'), findsOneWidget);
      expect(find.text('Building Details'), findsOneWidget);
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
      );

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Occupancy Classification *'),
        'Single Detached Residential Building',
      );
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Number of Units *'),
        '0',
      );
      await tester.pump();
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
        reason: 'number of units must be greater than zero',
      );

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Number of Units *'),
        '2',
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
        find.widgetWithText(
          TextFormField,
          'Total Estimated Construction Cost *',
        ),
        '1500000',
      );
      await tester.pump();
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
        reason: 'dates have not been selected yet',
      );

      // Pick the same day for both dates: proposed == expected, which
      // should NOT satisfy "expected must be later than proposed".
      await _pickToday(tester, 'Proposed Date of Construction *');
      await _pickToday(tester, 'Expected Date of Completion *');
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
        reason: 'completion date must be strictly after the proposed date',
      );

      // Move the completion date to next month — now valid.
      await _pickNextMonthFirst(tester, 'Expected Date of Completion *');
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNotNull,
      );

      await tester.tap(_continueButton());
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      expect(find.text('Step 5 of 9'), findsOneWidget);
    },
  );

  testWidgets(
    'Step 5 requires professional details, license dates, and all three uploads before Continue enables',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      await _completeStep2(tester);
      await _completeStep3(tester);
      await _completeStep4(tester);

      expect(find.text('Step 5 of 9'), findsOneWidget);
      expect(find.text('Architect or Civil Engineer'), findsOneWidget);
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
      );

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Full Name *'),
        'Arch. Maria Santos',
      );
      // find.byType(DropdownButtonFormField) compares runtimeType exactly,
      // which fails against the reified DropdownButtonFormField<ProfessionType>
      // instance, so match with a raw (unparameterized) `is` check instead —
      // it's the only dropdown on this step.
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
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
        reason: 'license dates and documents are still missing',
      );

      await _pickNextMonthFirst(tester, 'PRC Validity Date *');
      await _pickToday(tester, 'PTR Date Issued *');
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
        reason: 'the three required documents are still missing',
      );

      expect(
        find.widgetWithText(OutlinedButton, 'Upload'),
        findsNWidgets(3),
      );
      await tester.ensureVisible(
        find.widgetWithText(OutlinedButton, 'Upload').first,
      );
      await tester.pumpAndSettle();
      await tester.tap(find.widgetWithText(OutlinedButton, 'Upload').at(0));
      await tester.pump();
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
      );
      await tester.tap(find.widgetWithText(OutlinedButton, 'Upload').at(0));
      await tester.pump();
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
      );
      await tester.tap(find.widgetWithText(OutlinedButton, 'Upload'));
      await tester.pump();
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNotNull,
      );

      await tester.tap(_continueButton());
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      expect(find.text('Step 6 of 9'), findsOneWidget);
      expect(find.text('Consent and Authorization'), findsOneWidget);
      expect(
        find.text('Are you the registered property owner?'),
        findsOneWidget,
      );
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
        reason: 'the ownership question has not been answered yet',
      );
    },
  );

  testWidgets(
    'Step 5 shows non-blocking warnings for an expired PRC validity date and a future PTR date issued',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      await _completeStep2(tester);
      await _completeStep3(tester);
      await _completeStep4(tester);

      await _pickPreviousMonthFirst(tester, 'PRC Validity Date *');
      expect(find.textContaining('already passed'), findsOneWidget);

      await _pickNextMonthFirst(tester, 'PTR Date Issued *');
      expect(find.textContaining('in the future'), findsOneWidget);
    },
  );

  testWidgets(
    'Save as Draft works from Step 3 and preserves earlier steps\' data',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      await _completeStep2(tester);

      await tester.tap(find.text('Group A — Residential, Dwellings'));
      await tester.pump();

      await tester.tap(find.text('Save Draft'));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      expect(find.text('Draft saved successfully.'), findsOneWidget);

      // Let the SnackBar's auto-dismiss timer elapse so it isn't still
      // covering the bottom action bar when we tap Back.
      await tester.pump(const Duration(seconds: 5));
      await tester.pumpAndSettle();

      await tester.tap(find.widgetWithText(OutlinedButton, 'Back'));
      await tester.pumpAndSettle();
      await tester.tap(find.widgetWithText(OutlinedButton, 'Back'));
      await tester.pumpAndSettle();
      expect(
        find.widgetWithText(TextFormField, 'Juan'),
        findsOneWidget,
        reason: 'Step 1 data should still be preserved after saving a draft',
      );
    },
  );
}
