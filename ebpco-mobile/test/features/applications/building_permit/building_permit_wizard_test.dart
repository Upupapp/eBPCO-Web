import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:ebpco_user_app/core/providers/building_permit_provider.dart';
import 'package:ebpco_user_app/features/applications/presentation/building_permit/building_permit_wizard_screen.dart';

/// The wizard is always reached by *pushing* it on top of another screen
/// (e.g. Applications) in the real app, so its exit/back behavior only
/// makes sense with something beneath it on the Navigator stack. Start on
/// a launcher screen and push into the wizard, mirroring real usage.
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

void main() {
  testWidgets('Step 1 renders the fixed, non-editable Application Type', (
    tester,
  ) async {
    await _useTallSurface(tester);
    await _openWizard(tester);
    expect(tester.takeException(), isNull);

    expect(find.text('Step 1 of 9'), findsOneWidget);
    expect(find.text('Applicant Information'), findsOneWidget);
    expect(find.text('New Application'), findsOneWidget);
    expect(find.byIcon(Icons.check_circle), findsOneWidget);
  });

  testWidgets('Continue is disabled until Step 1 required fields are valid', (
    tester,
  ) async {
    await _useTallSurface(tester);
    await _openWizard(tester);

    expect(tester.widget<ElevatedButton>(_continueButton()).onPressed, isNull);

    await tester.enterText(
      find.widgetWithText(TextFormField, 'First Name *'),
      'Juan',
    );
    await tester.pump();
    expect(
      tester.widget<ElevatedButton>(_continueButton()).onPressed,
      isNull,
      reason: 'still missing last name/mobile/email',
    );

    await tester.enterText(
      find.widgetWithText(TextFormField, 'Last Name *'),
      'Dela Cruz',
    );
    await tester.enterText(
      find.widgetWithText(TextFormField, 'Mobile Number *'),
      '09171234567',
    );
    await tester.pump();
    expect(
      tester.widget<ElevatedButton>(_continueButton()).onPressed,
      isNull,
      reason: 'still missing a valid email',
    );

    await tester.enterText(
      find.widgetWithText(TextFormField, 'Email Address *'),
      'not-an-email',
    );
    await tester.pump();
    expect(
      tester.widget<ElevatedButton>(_continueButton()).onPressed,
      isNull,
      reason: 'email is not valid yet',
    );

    await tester.enterText(
      find.widgetWithText(TextFormField, 'Email Address *'),
      'juan@example.com',
    );
    await tester.pump();
    expect(
      tester.widget<ElevatedButton>(_continueButton()).onPressed,
      isNotNull,
      reason: 'all required fields are now valid',
    );
  });

  testWidgets(
    'enabling enterprise ownership requires enterprise name and form of ownership',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);

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
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNotNull,
      );

      await tester.tap(find.byType(Switch));
      await tester.pumpAndSettle();
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
        reason: 'enterprise name + form of ownership now required',
      );
      expect(
        find.widgetWithText(TextFormField, 'Enterprise Name *'),
        findsOneWidget,
      );

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Enterprise Name *'),
        'ACME Corp',
      );
      await tester.pump();
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
      );

      await tester.tap(
        find.widgetWithText(
          DropdownButtonFormField<String>,
          'Form of Ownership *',
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Corporation').last);
      await tester.pumpAndSettle();
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNotNull,
        reason: 'enterprise fields are now complete',
      );
    },
  );

  testWidgets(
    'Continue navigates to Step 2, Back returns to Step 1 without losing data',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);

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
      expect(tester.takeException(), isNull);
      expect(find.text('Step 2 of 9'), findsOneWidget);
      expect(
        find.text('Applicant Address & Construction Location'),
        findsOneWidget,
      );

      await tester.tap(find.widgetWithText(OutlinedButton, 'Back'));
      await tester.pumpAndSettle();
      expect(find.text('Step 1 of 9'), findsOneWidget);
      expect(
        find.widgetWithText(TextFormField, 'Juan'),
        findsOneWidget,
        reason: 'Step 1 data should be preserved after navigating back',
      );
    },
  );

  testWidgets(
    'the address-copy toggle copies applicant address into construction location',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);

      // Fill Step 1 minimally and continue to Step 2.
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

      // Construction location's Street should still be empty before toggling.
      expect(find.widgetWithText(TextFormField, 'Rizal St.'), findsOneWidget);

      await tester.tap(find.byType(Switch));
      await tester.pumpAndSettle();

      // After the toggle, both the applicant address and construction
      // location Street fields should show the copied value.
      expect(find.widgetWithText(TextFormField, 'Rizal St.'), findsNWidgets(2));
      expect(
        find.widgetWithText(TextFormField, 'San Isidro'),
        findsNWidgets(2),
      );
      expect(
        find.widgetWithText(TextFormField, 'Quezon City'),
        findsNWidgets(2),
      );
      expect(
        find.widgetWithText(TextFormField, 'Metro Manila'),
        findsNWidgets(2),
      );

      // The copied construction-location Street field remains editable.
      final locationStreetField = find
          .widgetWithText(TextFormField, 'Rizal St.')
          .last;
      await tester.enterText(locationStreetField, 'Mabini St.');
      await tester.pump();
      expect(find.widgetWithText(TextFormField, 'Mabini St.'), findsOneWidget);
      expect(
        find.widgetWithText(TextFormField, 'Rizal St.'),
        findsOneWidget,
        reason: 'applicant address Street should be untouched',
      );
    },
  );

  testWidgets('Save as Draft shows the success SnackBar and preserves values', (
    tester,
  ) async {
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

  testWidgets(
    'the exit (back arrow) shows a confirmation dialog before leaving',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);

      await tester.tap(find.byIcon(Icons.arrow_back));
      await tester.pumpAndSettle();
      expect(find.text('Leave application?'), findsOneWidget);

      await tester.tap(find.text('Keep Editing'));
      await tester.pumpAndSettle();
      expect(find.text('Step 1 of 9'), findsOneWidget);

      await tester.tap(find.byIcon(Icons.arrow_back));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Save & Exit'));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      expect(find.text('Back Screen'), findsOneWidget);
    },
  );
}
