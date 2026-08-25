import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:ebpco_user_app/core/providers/addition_extension_permit_provider.dart';
import 'package:ebpco_user_app/core/providers/architectural_permit_provider.dart';
import 'package:ebpco_user_app/core/providers/auth_provider.dart';
import 'package:ebpco_user_app/core/providers/building_permit_provider.dart';
import 'package:ebpco_user_app/core/providers/certificate_of_occupancy_provider.dart';
import 'package:ebpco_user_app/core/providers/civil_structural_permit_provider.dart';
import 'package:ebpco_user_app/core/providers/demolition_permit_provider.dart';
import 'package:ebpco_user_app/core/providers/electrical_permit_provider.dart';
import 'package:ebpco_user_app/core/providers/electronics_permit_provider.dart';
import 'package:ebpco_user_app/core/providers/excavation_permit_provider.dart';
import 'package:ebpco_user_app/core/providers/fencing_permit_provider.dart';
import 'package:ebpco_user_app/core/providers/fsec_permit_provider.dart';
import 'package:ebpco_user_app/core/providers/fsic_permit_provider.dart';
import 'package:ebpco_user_app/core/providers/interior_design_permit_provider.dart';
import 'package:ebpco_user_app/core/providers/mechanical_permit_provider.dart';
import 'package:ebpco_user_app/core/providers/plumbing_permit_provider.dart';
import 'package:ebpco_user_app/core/providers/renovation_permit_provider.dart';
import 'package:ebpco_user_app/core/providers/sanitary_plumbing_permit_provider.dart';
import 'package:ebpco_user_app/core/providers/sign_permit_provider.dart';
import 'package:ebpco_user_app/core/providers/zoning_permit_provider.dart';
import 'package:ebpco_user_app/features/applications/presentation/addition_extension_permit/addition_extension_permit_wizard_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/applications_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/architectural_permit/architectural_permit_wizard_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/building_permit/building_permit_wizard_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/certificate_of_occupancy/certificate_of_occupancy_wizard_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/civil_structural_permit/civil_structural_permit_wizard_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/demolition_permit/demolition_permit_wizard_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/electrical_permit/electrical_permit_wizard_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/electronics_permit/electronics_permit_wizard_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/excavation_permit/excavation_permit_wizard_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/fencing_permit/fencing_permit_wizard_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/fsec_permit/fsec_permit_wizard_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/fsic_permit/fsic_permit_wizard_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/interior_design_permit/interior_design_permit_wizard_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/mechanical_permit/mechanical_permit_wizard_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/plumbing_permit/plumbing_permit_wizard_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/renovation_permit/renovation_permit_wizard_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/sanitary_plumbing_permit/sanitary_plumbing_permit_wizard_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/sign_permit/sign_permit_wizard_screen.dart';
import 'package:ebpco_user_app/features/applications/presentation/zoning_permit/zoning_permit_wizard_screen.dart';

Widget _wrapWithRouter() {
  final router = GoRouter(
    initialLocation: '/app/applications',
    routes: [
      GoRoute(
        path: '/app/applications',
        builder: (context, state) => const ApplicationsScreen(),
      ),
      GoRoute(
        path: '/applications/new',
        builder: (context, state) =>
            const Scaffold(body: Text('New Application Screen')),
      ),
      GoRoute(
        path: '/applications/new/building-permit',
        builder: (context, state) => const BuildingPermitWizardScreen(),
      ),
      GoRoute(
        path: '/applications/new/renovation-permit',
        builder: (context, state) => const RenovationPermitWizardScreen(),
      ),
      GoRoute(
        path: '/applications/new/addition-extension-permit',
        builder: (context, state) =>
            const AdditionExtensionPermitWizardScreen(),
      ),
      GoRoute(
        path: '/applications/new/demolition-permit',
        builder: (context, state) => const DemolitionPermitWizardScreen(),
      ),
      GoRoute(
        path: '/applications/new/zoning-permit',
        builder: (context, state) => const ZoningPermitWizardScreen(),
      ),
      GoRoute(
        path: '/applications/new/architectural-permit',
        builder: (context, state) => const ArchitecturalPermitWizardScreen(),
      ),
      GoRoute(
        path: '/applications/new/civil-structural-permit',
        builder: (context, state) =>
            const CivilStructuralPermitWizardScreen(),
      ),
      GoRoute(
        path: '/applications/new/electrical-permit',
        builder: (context, state) => const ElectricalPermitWizardScreen(),
      ),
      GoRoute(
        path: '/applications/new/mechanical-permit',
        builder: (context, state) => const MechanicalPermitWizardScreen(),
      ),
      GoRoute(
        path: '/applications/new/sanitary-plumbing-permit',
        builder: (context, state) =>
            const SanitaryPlumbingPermitWizardScreen(),
      ),
      GoRoute(
        path: '/applications/new/plumbing-permit',
        builder: (context, state) => const PlumbingPermitWizardScreen(),
      ),
      GoRoute(
        path: '/applications/new/electronics-permit',
        builder: (context, state) => const ElectronicsPermitWizardScreen(),
      ),
      GoRoute(
        path: '/applications/new/interior-design-permit',
        builder: (context, state) =>
            const InteriorDesignPermitWizardScreen(),
      ),
      GoRoute(
        path: '/applications/new/fencing-permit',
        builder: (context, state) => const FencingPermitWizardScreen(),
      ),
      GoRoute(
        path: '/applications/new/sign-permit',
        builder: (context, state) => const SignPermitWizardScreen(),
      ),
      GoRoute(
        path: '/applications/new/excavation-permit',
        builder: (context, state) => const ExcavationPermitWizardScreen(),
      ),
      GoRoute(
        path: '/applications/new/fsec-permit',
        builder: (context, state) => const FsecPermitWizardScreen(),
      ),
      GoRoute(
        path: '/applications/new/certificate-of-occupancy',
        builder: (context, state) =>
            const CertificateOfOccupancyWizardScreen(),
      ),
      GoRoute(
        path: '/applications/new/fsic-permit',
        builder: (context, state) => const FsicPermitWizardScreen(),
      ),
    ],
  );
  return MultiProvider(
    providers: [
      ChangeNotifierProvider<AuthProvider>(create: (_) => AuthProvider()),
      ChangeNotifierProvider<BuildingPermitProvider>(
        create: (_) => BuildingPermitProvider(),
      ),
      ChangeNotifierProvider<RenovationPermitProvider>(
        create: (_) => RenovationPermitProvider(),
      ),
      ChangeNotifierProvider<AdditionExtensionPermitProvider>(
        create: (_) => AdditionExtensionPermitProvider(),
      ),
      ChangeNotifierProvider<DemolitionPermitProvider>(
        create: (_) => DemolitionPermitProvider(),
      ),
      ChangeNotifierProvider<ArchitecturalPermitProvider>(
        create: (_) => ArchitecturalPermitProvider(),
      ),
      ChangeNotifierProvider<CivilStructuralPermitProvider>(
        create: (_) => CivilStructuralPermitProvider(),
      ),
      ChangeNotifierProvider<ElectricalPermitProvider>(
        create: (_) => ElectricalPermitProvider(),
      ),
      ChangeNotifierProvider<MechanicalPermitProvider>(
        create: (_) => MechanicalPermitProvider(),
      ),
      ChangeNotifierProvider<SanitaryPlumbingPermitProvider>(
        create: (_) => SanitaryPlumbingPermitProvider(),
      ),
      ChangeNotifierProvider<PlumbingPermitProvider>(
        create: (_) => PlumbingPermitProvider(),
      ),
      ChangeNotifierProvider<ElectronicsPermitProvider>(
        create: (_) => ElectronicsPermitProvider(),
      ),
      ChangeNotifierProvider<InteriorDesignPermitProvider>(
        create: (_) => InteriorDesignPermitProvider(),
      ),
      ChangeNotifierProvider<FencingPermitProvider>(
        create: (_) => FencingPermitProvider(),
      ),
      ChangeNotifierProvider<SignPermitProvider>(
        create: (_) => SignPermitProvider(),
      ),
      ChangeNotifierProvider<ExcavationPermitProvider>(
        create: (_) => ExcavationPermitProvider(),
      ),
      ChangeNotifierProvider<CertificateOfOccupancyProvider>(
        create: (_) => CertificateOfOccupancyProvider(),
      ),
      ChangeNotifierProvider<ZoningPermitProvider>(
        create: (_) => ZoningPermitProvider(),
      ),
      ChangeNotifierProvider<FsecPermitProvider>(
        create: (_) => FsecPermitProvider(),
      ),
      ChangeNotifierProvider<FsicPermitProvider>(
        create: (_) => FsicPermitProvider(),
      ),
    ],
    child: MaterialApp.router(routerConfig: router),
  );
}

void main() {
  // The Applications page's content is much taller than the default
  // 800x600 test canvas now that it lists every permit catalog entry.
  Future<void> useTallSurface(WidgetTester tester) async {
    await tester.binding.setSurfaceSize(const Size(400, 4000));
    addTearDown(() => tester.binding.setSurfaceSize(null));
  }

  testWidgets(
    'Applications page renders all four catalog sections and their entries',
    (tester) async {
      await useTallSurface(tester);
      await tester.pumpWidget(_wrapWithRouter());
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);

      expect(find.text('Applications'), findsOneWidget);

      // Section titles.
      expect(find.text('Building Permit'), findsOneWidget);
      expect(find.text('Ancillary Permits'), findsOneWidget);
      expect(find.text('Other Permits'), findsOneWidget);
      expect(find.text('Certificates'), findsOneWidget);

      // A sample entry from each section.
      expect(find.text('New Construction'), findsOneWidget);
      expect(find.text('Architectural'), findsOneWidget);
      expect(find.text('Fencing'), findsOneWidget);
      expect(find.text('Certificate of Occupancy'), findsOneWidget);
    },
  );

  testWidgets('New Construction opens the Building Permit wizard at Step 1', (
    tester,
  ) async {
    await useTallSurface(tester);
    await tester.pumpWidget(_wrapWithRouter());
    await tester.pumpAndSettle();

    await tester.tap(find.text('New Construction'));
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);

    expect(find.widgetWithText(AppBar, 'Building Permit'), findsOneWidget);
    expect(find.text('Step 1 of 9'), findsOneWidget);
    expect(find.text('Applicant Information'), findsOneWidget);
    expect(find.text('New Application'), findsOneWidget);
  });

  testWidgets('Renovation opens the Renovation Permit wizard at Step 1', (
    tester,
  ) async {
    await useTallSurface(tester);
    await tester.pumpWidget(_wrapWithRouter());
    await tester.pumpAndSettle();

    await tester.tap(find.text('Renovation / Alteration'));
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);

    expect(find.widgetWithText(AppBar, 'Renovation Permit'), findsOneWidget);
    expect(find.text('Step 1 of 9'), findsOneWidget);
    expect(find.text('Applicant Information'), findsOneWidget);
    expect(find.text('Renovation'), findsWidgets);
  });

  testWidgets(
    'Addition / Extension opens the Addition / Extension Permit wizard at Step 1',
    (tester) async {
      await useTallSurface(tester);
      await tester.pumpWidget(_wrapWithRouter());
      await tester.pumpAndSettle();

      await tester.tap(find.text('Addition / Extension'));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);

      expect(
        find.widgetWithText(AppBar, 'Addition / Extension Permit'),
        findsOneWidget,
      );
      expect(find.text('Step 1 of 9'), findsOneWidget);
      expect(find.text('Applicant Information'), findsOneWidget);
      expect(find.text('Addition / Extension'), findsWidgets);
    },
  );

  testWidgets('Demolition opens the Demolition Permit wizard at Step 1', (
    tester,
  ) async {
    await useTallSurface(tester);
    await tester.pumpWidget(_wrapWithRouter());
    await tester.pumpAndSettle();

    await tester.tap(find.text('Demolition'));
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);

    expect(find.widgetWithText(AppBar, 'Demolition Permit'), findsOneWidget);
    expect(find.text('Step 1 of 9'), findsOneWidget);
    expect(find.text('Applicant Information'), findsOneWidget);
    expect(find.text('Demolition'), findsWidgets);
  });

  testWidgets(
    'Zoning / Locational Clearance opens the Zoning wizard at Step 1',
    (tester) async {
      await useTallSurface(tester);
      await tester.pumpWidget(_wrapWithRouter());
      await tester.pumpAndSettle();

      await tester.ensureVisible(
        find.text('Zoning / Locational Clearance'),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Zoning / Locational Clearance'));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);

      expect(
        find.widgetWithText(AppBar, 'Zoning / Locational Clearance'),
        findsOneWidget,
      );
      expect(find.text('Step 1 of 4'), findsOneWidget);
      expect(find.text('Applicant Information'), findsWidgets);
    },
  );

  testWidgets(
    'Architectural opens the Architectural Permit wizard at Step 1',
    (tester) async {
      await useTallSurface(tester);
      await tester.pumpWidget(_wrapWithRouter());
      await tester.pumpAndSettle();

      await tester.ensureVisible(find.text('Architectural'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Architectural'));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);

      expect(
        find.widgetWithText(AppBar, 'Architectural Permit'),
        findsOneWidget,
      );
      expect(find.text('Step 1 of 9'), findsOneWidget);
      expect(find.text('Applicant Information'), findsOneWidget);
      expect(find.text('Architectural Permit'), findsWidgets);
    },
  );

  testWidgets(
    'Civil / Structural opens the Civil / Structural Permit wizard at Step 1',
    (tester) async {
      await useTallSurface(tester);
      await tester.pumpWidget(_wrapWithRouter());
      await tester.pumpAndSettle();

      await tester.ensureVisible(find.text('Civil / Structural'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Civil / Structural'));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);

      expect(
        find.widgetWithText(AppBar, 'Civil / Structural Permit'),
        findsOneWidget,
      );
      expect(find.text('Step 1 of 9'), findsOneWidget);
      expect(find.text('Applicant Information'), findsOneWidget);
      expect(find.text('Civil / Structural Permit'), findsWidgets);
    },
  );

  testWidgets(
    'Electrical opens the Electrical Permit wizard at Step 1',
    (tester) async {
      await useTallSurface(tester);
      await tester.pumpWidget(_wrapWithRouter());
      await tester.pumpAndSettle();

      await tester.ensureVisible(find.text('Electrical'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Electrical'));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);

      expect(
        find.widgetWithText(AppBar, 'Electrical Permit'),
        findsOneWidget,
      );
      expect(find.text('Step 1 of 9'), findsOneWidget);
      expect(find.text('Applicant Information'), findsOneWidget);
      expect(find.text('Electrical Permit'), findsWidgets);
    },
  );

  testWidgets(
    'Mechanical opens the Mechanical Permit wizard at Step 1',
    (tester) async {
      await useTallSurface(tester);
      await tester.pumpWidget(_wrapWithRouter());
      await tester.pumpAndSettle();

      await tester.ensureVisible(find.text('Mechanical'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Mechanical'));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);

      expect(
        find.widgetWithText(AppBar, 'Mechanical Permit'),
        findsOneWidget,
      );
      expect(find.text('Step 1 of 9'), findsOneWidget);
      expect(find.text('Applicant Information'), findsOneWidget);
      expect(find.text('Mechanical Permit'), findsWidgets);
    },
  );

  testWidgets(
    'Sanitary opens the Sanitary Permit wizard at Step 1',
    (tester) async {
      await useTallSurface(tester);
      await tester.pumpWidget(_wrapWithRouter());
      await tester.pumpAndSettle();

      await tester.ensureVisible(find.text('Sanitary'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Sanitary'));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);

      expect(
        find.widgetWithText(AppBar, 'Sanitary Permit'),
        findsOneWidget,
      );
      expect(find.text('Step 1 of 9'), findsOneWidget);
      expect(find.text('Applicant Information'), findsOneWidget);
      expect(find.text('Sanitary Permit'), findsWidgets);
    },
  );

  testWidgets(
    'Plumbing opens the Plumbing Permit wizard at Step 1, not the Sanitary wizard',
    (tester) async {
      await useTallSurface(tester);
      await tester.pumpWidget(_wrapWithRouter());
      await tester.pumpAndSettle();

      await tester.ensureVisible(find.text('Plumbing'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Plumbing'));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);

      expect(
        find.widgetWithText(AppBar, 'Plumbing Permit'),
        findsOneWidget,
      );
      expect(
        find.widgetWithText(AppBar, 'Sanitary Permit'),
        findsNothing,
      );
      expect(find.text('Step 1 of 9'), findsOneWidget);
      expect(find.text('Applicant Information'), findsOneWidget);
      expect(find.text('Plumbing Permit'), findsWidgets);
    },
  );

  testWidgets(
    'Electronics opens the Electronics Permit wizard at Step 1',
    (tester) async {
      await useTallSurface(tester);
      await tester.pumpWidget(_wrapWithRouter());
      await tester.pumpAndSettle();

      await tester.ensureVisible(find.text('Electronics'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Electronics'));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);

      expect(
        find.widgetWithText(AppBar, 'Electronics Permit'),
        findsOneWidget,
      );
      expect(find.text('Step 1 of 9'), findsOneWidget);
      expect(find.text('Applicant Information'), findsOneWidget);
      expect(find.text('Electronics Permit'), findsWidgets);
    },
  );

  testWidgets(
    'Interior Design opens the Interior Design Permit wizard at Step 1',
    (tester) async {
      await useTallSurface(tester);
      await tester.pumpWidget(_wrapWithRouter());
      await tester.pumpAndSettle();

      await tester.ensureVisible(find.text('Interior Design'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Interior Design'));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);

      expect(
        find.widgetWithText(AppBar, 'Interior Design Permit'),
        findsOneWidget,
      );
      expect(find.text('Step 1 of 9'), findsOneWidget);
      expect(find.text('Applicant Information'), findsOneWidget);
      expect(find.text('Interior Design Permit'), findsWidgets);
    },
  );

  testWidgets(
    'Fencing opens the Fencing Permit wizard at Step 1',
    (tester) async {
      await useTallSurface(tester);
      await tester.pumpWidget(_wrapWithRouter());
      await tester.pumpAndSettle();

      await tester.ensureVisible(find.text('Fencing'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Fencing'));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);

      expect(
        find.widgetWithText(AppBar, 'Fencing Permit'),
        findsOneWidget,
      );
      expect(find.text('Step 1 of 9'), findsOneWidget);
      expect(find.text('Permit Information'), findsWidgets);
    },
  );

  testWidgets(
    'Sign Permit opens the Sign Permit wizard at Step 1',
    (tester) async {
      await useTallSurface(tester);
      await tester.pumpWidget(_wrapWithRouter());
      await tester.pumpAndSettle();

      await tester.ensureVisible(find.text('Sign Permit'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Sign Permit'));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);

      expect(
        find.widgetWithText(AppBar, 'Sign Permit'),
        findsOneWidget,
      );
      expect(find.text('Step 1 of 10'), findsOneWidget);
      expect(find.text('Permit Information'), findsWidgets);
    },
  );

  testWidgets(
    'Excavation opens the Excavation Permit wizard at Step 1',
    (tester) async {
      await useTallSurface(tester);
      await tester.pumpWidget(_wrapWithRouter());
      await tester.pumpAndSettle();

      await tester.ensureVisible(find.text('Excavation'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Excavation'));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);

      expect(
        find.widgetWithText(AppBar, 'Excavation Permit'),
        findsOneWidget,
      );
      expect(find.text('Step 1 of 9'), findsOneWidget);
      expect(find.text('Permit Information'), findsWidgets);
    },
  );

  testWidgets(
    'FSEC for Building Permit (BFP) opens the FSEC wizard at Step 1',
    (tester) async {
      await useTallSurface(tester);
      await tester.pumpWidget(_wrapWithRouter());
      await tester.pumpAndSettle();

      await tester.ensureVisible(
        find.text('FSEC for Building Permit (BFP)'),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('FSEC for Building Permit (BFP)'));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);

      expect(
        find.widgetWithText(AppBar, 'FSEC for Building Permit (BFP)'),
        findsOneWidget,
      );
      expect(find.text('Step 1 of 6'), findsOneWidget);
      expect(find.text('Related Building Permit'), findsWidgets);
    },
  );

  testWidgets(
    'Certificate of Occupancy opens the Certificate of Occupancy wizard at Step 1',
    (tester) async {
      await useTallSurface(tester);
      await tester.pumpWidget(_wrapWithRouter());
      await tester.pumpAndSettle();

      await tester.ensureVisible(find.text('Certificate of Occupancy'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Certificate of Occupancy'));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);

      expect(
        find.widgetWithText(AppBar, 'Certificate of Occupancy'),
        findsOneWidget,
      );
      expect(find.text('Step 1 of 5'), findsOneWidget);
      expect(find.text('Related Building Permit'), findsOneWidget);
    },
  );

  testWidgets(
    'FSIC for Occupancy Permit (BFP) opens the FSIC wizard at Step 1',
    (tester) async {
      await useTallSurface(tester);
      await tester.pumpWidget(_wrapWithRouter());
      await tester.pumpAndSettle();

      await tester.ensureVisible(
        find.text('FSIC for Occupancy Permit (BFP)'),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('FSIC for Occupancy Permit (BFP)'));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);

      expect(
        find.widgetWithText(AppBar, 'FSIC for Occupancy Permit (BFP)'),
        findsOneWidget,
      );
      expect(find.text('Step 1 of 5'), findsOneWidget);
      expect(find.text('Related Occupancy Permit'), findsWidgets);
    },
  );
}
