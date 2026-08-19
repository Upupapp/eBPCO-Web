import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:ebpco_user_app/core/providers/auth_provider.dart';
import 'package:ebpco_user_app/core/providers/certificate_of_occupancy_provider.dart';
import 'package:ebpco_user_app/features/applications/presentation/certificate_of_occupancy/certificate_of_occupancy_submitted_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/certificate_of_occupancy/certificate_of_occupancy_wizard_screen.dart';
import 'package:ebpco_user_app/shared/widgets/uploads/document_upload_tile.dart';

/// End-to-end coverage of the Certificate of Occupancy wizard — a
/// deliberately short, 5-step flow (fully separate from every ancillary
/// permit wizard in this app), driven the same way those wizards' tests
/// drive them.
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
            const CertificateOfOccupancyWizardScreen(),
      ),
      GoRoute(
        path: '/applications/new/certificate-of-occupancy/submitted',
        builder: (context, state) {
          final extra = state.extra as Map<String, Object?>?;
          return CertificateOfOccupancySubmittedScreen(
            referenceNumber: extra?['referenceNumber'] as String? ?? 'COO-X',
            submissionDate:
                extra?['submissionDate'] as DateTime? ?? DateTime.now(),
            buildingPermitNumber:
                extra?['buildingPermitNumber'] as String? ?? '',
            certificateType: extra?['certificateType'] as String? ?? 'Full',
          );
        },
      ),
    ],
  );
  return MultiProvider(
    providers: [
      ChangeNotifierProvider<AuthProvider>(create: (_) => AuthProvider()),
      ChangeNotifierProvider<CertificateOfOccupancyProvider>(
        create: (_) => CertificateOfOccupancyProvider(),
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

Future<void> _completeStep1(WidgetTester tester) async {
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Building Permit Number *'),
    'BP-2026-555555',
  );
  await tester.pump();
  await _pickToday(tester, 'Building Permit Date Issued *');
  await tester.tap(find.text('Full'));
  await tester.pump();
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

Future<void> _completeStep2(WidgetTester tester) async {
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Last Name *'),
    'Dela Cruz',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Given Name *'),
    'Juan',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Address *'),
    '123 Rizal St., Quezon City',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Telephone / Mobile Number *'),
    '09171234567',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Project Name *'),
    'Sunrise Residences',
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
  await tester.tap(find.byWidgetPredicate((w) => w is DropdownButtonFormField));
  await tester.pumpAndSettle();
  await tester.tap(find.text('Group A — Residential Dwelling').last);
  await tester.pumpAndSettle();
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Number of Storeys *'),
    '3',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Number of Units *'),
    '12',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Total Floor Area (sq m) *'),
    '450.5',
  );
  await tester.pump();
  await _pickToday(tester, 'Date of Completion *');
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

Future<void> _completeStep4(WidgetTester tester) async {
  // Only the four required documents need to be uploaded — the optional
  // ones are deliberately left untouched to prove they don't block.
  for (final label in [
    'As-Built Plans and Specifications',
    'Construction Logbook (Signed and Sealed)',
    'Certificate of Completion — Civil Works',
    'Electrical Certificate of Completion',
  ]) {
    final tile = find.widgetWithText(DocumentUploadTile, label);
    await tester.ensureVisible(tile);
    await tester.pumpAndSettle();
    final upload = find.descendant(
      of: tile,
      matching: find.widgetWithText(OutlinedButton, 'Upload'),
    );
    await tester.tap(upload.first);
    await tester.pump();
  }
  await tester.tap(_continueButton());
  await tester.pumpAndSettle();
}

Future<void> _completeStep5(WidgetTester tester) async {
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Submitted-By Name *'),
    'Juan Dela Cruz',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'Community Tax Certificate Number *'),
    'CTC-0001',
  );
  await tester.enterText(
    find.widgetWithText(TextFormField, 'CTC Place Issued *'),
    'Quezon City',
  );
  await tester.pump();
  await _pickToday(tester, 'CTC Date Issued *');

  await tester.ensureVisible(
    find.widgetWithText(OutlinedButton, 'Upload').first,
  );
  await tester.pumpAndSettle();
  await tester.tap(find.widgetWithText(OutlinedButton, 'Upload').first);
  await tester.pump();

  for (final label in [
    'I certify that the information provided in this application is '
        'complete and accurate.',
    'I certify that construction has been completed according to the '
        'approved plans.',
    'I certify that the uploaded documents are authentic.',
    'I understand that this application is subject to inspection and '
        'official evaluation.',
  ]) {
    await tester.ensureVisible(find.text(label));
    await tester.pumpAndSettle();
    await tester.tap(find.text(label));
    await tester.pump();
  }
}

void main() {
  testWidgets(
    'Step 1 renders with Building Permit & Application Type heading',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      expect(tester.takeException(), isNull);

      expect(find.text('Step 1 of 5'), findsOneWidget);
      expect(find.text('Related Building Permit'), findsOneWidget);
    },
  );

  testWidgets(
    'Continue navigates Step 1 through Step 5, and Submit Application opens the confirmation screen with the status sequence',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      expect(find.text('Step 2 of 5'), findsOneWidget);

      await _completeStep2(tester);
      expect(find.text('Step 3 of 5'), findsOneWidget);

      await _completeStep3(tester);
      expect(find.text('Step 4 of 5'), findsOneWidget);

      await _completeStep4(tester);
      expect(find.text('Step 5 of 5'), findsOneWidget);

      await _completeStep5(tester);
      expect(
        tester.widget<ElevatedButton>(_submitButton()).onPressed,
        isNotNull,
      );

      await tester.tap(_submitButton());
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      expect(
        find.text('Certificate of Occupancy Application Submitted!'),
        findsOneWidget,
      );
      expect(find.textContaining('COO-'), findsOneWidget);
      expect(find.text('Certificate Issued'), findsOneWidget);
      expect(find.text('Document Verification'), findsOneWidget);
    },
  );

  testWidgets(
    'Selecting "Partial" requires a portion description before continuing',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Building Permit Number *'),
        'BP-2026-555555',
      );
      await tester.pump();
      await _pickToday(tester, 'Building Permit Date Issued *');
      await tester.tap(find.text('Partial'));
      await tester.pump();

      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
        reason: 'Partial requires a portion description',
      );

      await tester.enterText(
        find.widgetWithText(
          TextFormField,
          'Portion, Floor, Unit, or Area Covered *',
        ),
        '2nd Floor, Units 201-210',
      );
      await tester.pump();
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNotNull,
      );
    },
  );

  testWidgets(
    'Selecting an existing Building Permit auto-fills its number and date issued',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);

      await tester.tap(find.text('BP-2026-100234'));
      await tester.pumpAndSettle();

      expect(
        find.widgetWithText(TextFormField, 'BP-2026-100234'),
        findsOneWidget,
      );
      expect(find.text('Jan 12, 2026'), findsOneWidget);
    },
  );

  testWidgets(
    'Number of Storeys rejects a non-positive value',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      await _completeStep2(tester);

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
      await tester.tap(
        find.byWidgetPredicate((w) => w is DropdownButtonFormField),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Group A — Residential Dwelling').last);
      await tester.pumpAndSettle();
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Number of Storeys *'),
        '0',
      );
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Number of Units *'),
        '12',
      );
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Total Floor Area (sq m) *'),
        '450.5',
      );
      await tester.pump();
      await _pickToday(tester, 'Date of Completion *');

      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
        reason: 'Number of Storeys must be greater than zero',
      );

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Number of Storeys *'),
        '3',
      );
      await tester.pump();
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNotNull,
      );
    },
  );

  testWidgets(
    'Adding an Other Document requires a name and a file before continuing',
    (tester) async {
      await _useTallSurface(tester);
      await _openWizard(tester);
      await _completeStep1(tester);
      await _completeStep2(tester);
      await _completeStep3(tester);
      await _completeStep4(tester);

      // Step 4 was already validated as complete by _completeStep4 — go
      // back to it to add an incomplete "Other Document" and confirm it
      // now blocks Continue.
      await tester.tap(find.text('Back'));
      await tester.pumpAndSettle();

      await tester.tap(find.widgetWithText(TextButton, 'Add Document'));
      await tester.pumpAndSettle();
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
        reason: 'a newly-added Other Document has no name or file yet',
      );

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Document Name *'),
        'Fire Safety Certificate',
      );
      await tester.pump();
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNull,
        reason: 'still missing the file',
      );

      await tester.ensureVisible(
        find.widgetWithText(OutlinedButton, 'Upload').last,
      );
      await tester.pumpAndSettle();
      await tester.tap(find.widgetWithText(OutlinedButton, 'Upload').last);
      await tester.pump();
      expect(
        tester.widget<ElevatedButton>(_continueButton()).onPressed,
        isNotNull,
      );
    },
  );

  testWidgets('Save as Draft works and preserves values', (tester) async {
    await _useTallSurface(tester);
    await _openWizard(tester);

    await tester.enterText(
      find.widgetWithText(TextFormField, 'Building Permit Number *'),
      'BP-2026-555555',
    );
    await tester.pump();

    await tester.tap(find.text('Save Draft'));
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
    expect(find.text('Draft saved successfully.'), findsOneWidget);
    expect(
      find.widgetWithText(TextFormField, 'BP-2026-555555'),
      findsOneWidget,
    );
  });
}
