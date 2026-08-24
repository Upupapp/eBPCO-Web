import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'core/constants/app_strings.dart';
import 'core/providers/addition_extension_permit_provider.dart';
import 'core/providers/applications_provider.dart';
import 'core/providers/architectural_permit_provider.dart';
import 'core/providers/auth_provider.dart';
import 'core/providers/building_permit_provider.dart';
import 'core/providers/business_provider.dart';
import 'core/providers/certificate_of_occupancy_provider.dart';
import 'core/providers/civil_structural_permit_provider.dart';
import 'core/providers/demolition_permit_provider.dart';
import 'core/providers/documents_provider.dart';
import 'core/providers/electrical_permit_provider.dart';
import 'core/providers/electronics_permit_provider.dart';
import 'core/providers/excavation_permit_provider.dart';
import 'core/providers/fencing_permit_provider.dart';
import 'core/providers/fsec_permit_provider.dart';
import 'core/providers/fsic_permit_provider.dart';
import 'core/providers/interior_design_permit_provider.dart';
import 'core/providers/mechanical_permit_provider.dart';
import 'core/providers/navigation_provider.dart';
import 'core/providers/notifications_provider.dart';
import 'core/providers/plumbing_permit_provider.dart';
import 'core/providers/renovation_permit_provider.dart';
import 'core/providers/sanitary_plumbing_permit_provider.dart';
import 'core/providers/settings_provider.dart';
import 'core/providers/sign_permit_provider.dart';
import 'core/providers/zoning_permit_provider.dart';
import 'core/theme/app_theme.dart';
import 'routes/app_router.dart';

/// Root widget for the E-BPCO User App. Wires up global providers, the
/// Material 3 theme, and the go_router configuration.
class EbpcoApp extends StatefulWidget {
  const EbpcoApp({super.key});

  @override
  State<EbpcoApp> createState() => _EbpcoAppState();
}

class _EbpcoAppState extends State<EbpcoApp> {
  final AuthProvider _authProvider = AuthProvider();
  late final GoRouter _router = AppRouter.build(_authProvider);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<AuthProvider>.value(value: _authProvider),
        ChangeNotifierProvider<NavigationProvider>(
          create: (_) => NavigationProvider(),
        ),
        // Declared before ApplicationsProvider/BusinessProvider so their
        // `create` callbacks can read it via `context.read` to post
        // notifications for submit/pay/advance/register actions.
        ChangeNotifierProvider<NotificationsProvider>(
          create: (_) => NotificationsProvider(),
        ),
        ChangeNotifierProvider<BusinessProvider>(
          create: (context) => BusinessProvider(
            notifications: context.read<NotificationsProvider>(),
          ),
        ),
        ChangeNotifierProvider<ApplicationsProvider>(
          create: (context) => ApplicationsProvider(
            notifications: context.read<NotificationsProvider>(),
          ),
        ),
        ChangeNotifierProvider<DocumentsProvider>(
          create: (_) => DocumentsProvider(),
        ),
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
        ChangeNotifierProvider<ElectronicsPermitProvider>(
          create: (_) => ElectronicsPermitProvider(),
        ),
        ChangeNotifierProvider<InteriorDesignPermitProvider>(
          create: (_) => InteriorDesignPermitProvider(),
        ),
        ChangeNotifierProvider<FencingPermitProvider>(
          create: (_) => FencingPermitProvider(),
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
        ChangeNotifierProvider<SettingsProvider>(
          create: (_) => SettingsProvider(),
        ),
      ],
      child: MaterialApp.router(
        title: AppStrings.appName,
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        routerConfig: _router,
        // Real Android devices commonly run with the system font-size
        // (Settings → Display → Font size) set above 100% — unlike the
        // desktop/Chrome preview used during development, which always
        // renders at exactly 1.0x. Layouts here (the 5-item bottom nav
        // bar, status badge pills, fixed-height cards) were built and
        // tested against that 1.0x baseline, so an unclamped device
        // scale factor of e.g. 1.3–1.5x is what actually produces the
        // "fine on browser, broken on Android" overflow/clipping this
        // audit was tracking down. Clamping — rather than disabling
        // scaling outright — keeps text legibly larger for users who
        // increase it, without letting it exceed what any screen here
        // was designed to hold.
        builder: (context, child) {
          final clampedScaler = MediaQuery.textScalerOf(
            context,
          ).clamp(minScaleFactor: 0.9, maxScaleFactor: 1.3);
          return MediaQuery(
            data: MediaQuery.of(context).copyWith(textScaler: clampedScaler),
            child: child!,
          );
        },
      ),
    );
  }
}
