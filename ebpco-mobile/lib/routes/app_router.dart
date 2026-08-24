import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/constants/app_colors.dart';
import '../core/providers/auth_provider.dart';
import '../shared/widgets/states/error_state.dart';
import '../features/applications/presentation/addition_extension_permit/addition_extension_application_submitted_screen.dart';
import '../features/applications/presentation/addition_extension_permit/addition_extension_permit_wizard_screen.dart';
import '../features/applications/presentation/application_details_screen.dart';
import '../features/applications/presentation/architectural_permit/architectural_application_submitted_screen.dart';
import '../features/applications/presentation/architectural_permit/architectural_permit_wizard_screen.dart';
import '../features/applications/presentation/certificate_of_occupancy/certificate_of_occupancy_submitted_screen.dart';
import '../features/applications/presentation/certificate_of_occupancy/certificate_of_occupancy_wizard_screen.dart';
import '../features/applications/presentation/civil_structural_permit/civil_structural_application_submitted_screen.dart';
import '../features/applications/presentation/civil_structural_permit/civil_structural_permit_wizard_screen.dart';
import '../features/applications/presentation/electrical_permit/electrical_application_submitted_screen.dart';
import '../features/applications/presentation/electrical_permit/electrical_permit_wizard_screen.dart';
import '../features/applications/presentation/electronics_permit/electronics_application_submitted_screen.dart';
import '../features/applications/presentation/electronics_permit/electronics_permit_wizard_screen.dart';
import '../features/applications/presentation/excavation_permit/excavation_application_submitted_screen.dart';
import '../features/applications/presentation/excavation_permit/excavation_permit_wizard_screen.dart';
import '../features/applications/presentation/fencing_permit/fencing_application_submitted_screen.dart';
import '../features/applications/presentation/fencing_permit/fencing_permit_wizard_screen.dart';
import '../features/applications/presentation/fsec_permit/fsec_application_submitted_screen.dart';
import '../features/applications/presentation/fsec_permit/fsec_permit_wizard_screen.dart';
import '../features/applications/presentation/fsic_permit/fsic_application_submitted_screen.dart';
import '../features/applications/presentation/fsic_permit/fsic_permit_wizard_screen.dart';
import '../features/applications/presentation/interior_design_permit/interior_design_application_submitted_screen.dart';
import '../features/applications/presentation/interior_design_permit/interior_design_permit_wizard_screen.dart';
import '../features/applications/presentation/mechanical_permit/mechanical_application_submitted_screen.dart';
import '../features/applications/presentation/mechanical_permit/mechanical_permit_wizard_screen.dart';
import '../features/applications/presentation/plumbing_permit/plumbing_application_submitted_screen.dart';
import '../features/applications/presentation/plumbing_permit/plumbing_permit_wizard_screen.dart';
import '../features/applications/presentation/sanitary_plumbing_permit/sanitary_plumbing_application_submitted_screen.dart';
import '../features/applications/presentation/sanitary_plumbing_permit/sanitary_plumbing_permit_wizard_screen.dart';
import '../features/applications/presentation/sign_permit/sign_application_submitted_screen.dart';
import '../features/applications/presentation/sign_permit/sign_permit_wizard_screen.dart';
import '../features/applications/presentation/applications_screen.dart';
import '../features/applications/presentation/building_permit/application_submitted_screen.dart';
import '../features/applications/presentation/building_permit/building_permit_wizard_screen.dart';
import '../features/applications/presentation/demolition_permit/demolition_application_submitted_screen.dart';
import '../features/applications/presentation/demolition_permit/demolition_permit_wizard_screen.dart';
import '../features/applications/presentation/new_application_screen.dart';
import '../features/applications/presentation/renovation_permit/renovation_application_submitted_screen.dart';
import '../features/applications/presentation/renovation_permit/renovation_permit_wizard_screen.dart';
import '../features/applications/presentation/zoning_permit/zoning_application_submitted_screen.dart';
import '../features/applications/presentation/zoning_permit/zoning_permit_wizard_screen.dart';
import '../features/authentication/presentation/forgot_password_screen.dart';
import '../features/authentication/presentation/login_screen.dart';
import '../features/authentication/presentation/register_screen.dart';
import '../features/authentication/presentation/registration_success_screen.dart';
import '../features/business/presentation/business_details_screen.dart';
import '../features/business/presentation/business_list_screen.dart';
import '../features/business/presentation/register_business_screen.dart';
import '../features/dashboard/presentation/dashboard_screen.dart';
import '../features/notifications/presentation/notifications_screen.dart';
import '../features/onboarding/presentation/onboarding_screen.dart';
import '../features/payments/presentation/payment_flow_screen.dart';
import '../features/payments/presentation/payments_screen.dart';
import '../features/documents/presentation/my_documents_screen.dart';
import '../features/profile/presentation/change_password_screen.dart';
import '../features/profile/presentation/edit_profile_screen.dart';
import '../features/profile/presentation/help_support_screen.dart';
import '../features/profile/presentation/language_screen.dart';
import '../features/profile/presentation/notification_preferences_screen.dart';
import '../features/profile/presentation/privacy_policy_screen.dart';
import '../features/profile/presentation/profile_screen.dart';
import '../features/profile/presentation/terms_conditions_screen.dart';
import '../features/shell/presentation/main_shell.dart';
import '../features/splash/presentation/splash_screen.dart';

/// Builds the application's [GoRouter] configuration. A single router
/// instance is created for the app's lifetime and driven by [authProvider]
/// via [GoRouter.refreshListenable], so session/onboarding changes trigger
/// redirect re-evaluation without rebuilding the router itself.
class AppRouter {
  AppRouter._();

  static const _authRoutes = {
    '/login',
    '/register',
    '/forgot-password',
    '/registration-success',
  };

  static GoRouter build(AuthProvider authProvider) {
    return GoRouter(
      initialLocation: '/splash',
      refreshListenable: authProvider,
      redirect: (context, state) => _redirect(authProvider, state),
      routes: [
        GoRoute(
          path: '/splash',
          builder: (context, state) => const SplashScreen(),
        ),
        GoRoute(
          path: '/onboarding',
          builder: (context, state) => const OnboardingScreen(),
        ),
        GoRoute(
          path: '/login',
          builder: (context, state) => const LoginScreen(),
        ),
        GoRoute(
          path: '/register',
          builder: (context, state) => const RegisterScreen(),
        ),
        GoRoute(
          path: '/forgot-password',
          builder: (context, state) => const ForgotPasswordScreen(),
        ),
        GoRoute(
          path: '/registration-success',
          builder: (context, state) => const RegistrationSuccessScreen(),
        ),
        GoRoute(
          path: '/business',
          builder: (context, state) => const BusinessListScreen(),
        ),
        GoRoute(
          path: '/business/register',
          builder: (context, state) => const RegisterBusinessScreen(),
        ),
        GoRoute(
          path: '/business/:businessId',
          builder: (context, state) => BusinessDetailsScreen(
            businessId: state.pathParameters['businessId']!,
          ),
        ),
        GoRoute(
          path: '/applications/new',
          builder: (context, state) =>
              NewApplicationScreen(initialBusinessId: state.extra as String?),
        ),
        GoRoute(
          path: '/applications/new/building-permit',
          builder: (context, state) => const BuildingPermitWizardScreen(),
        ),
        GoRoute(
          path: '/applications/new/building-permit/submitted',
          builder: (context, state) => ApplicationSubmittedScreen(
            trackingId: state.extra as String? ?? 'BP-UNKNOWN',
          ),
        ),
        GoRoute(
          path: '/applications/new/renovation-permit',
          builder: (context, state) => const RenovationPermitWizardScreen(),
        ),
        GoRoute(
          path: '/applications/new/renovation-permit/submitted',
          builder: (context, state) {
            final extra = state.extra as Map<String, Object?>?;
            return RenovationApplicationSubmittedScreen(
              referenceNumber:
                  extra?['referenceNumber'] as String? ?? 'REN-UNKNOWN',
              submissionDate:
                  extra?['submissionDate'] as DateTime? ?? DateTime.now(),
            );
          },
        ),
        GoRoute(
          path: '/applications/new/addition-extension-permit',
          builder: (context, state) =>
              const AdditionExtensionPermitWizardScreen(),
        ),
        GoRoute(
          path: '/applications/new/addition-extension-permit/submitted',
          builder: (context, state) {
            final extra = state.extra as Map<String, Object?>?;
            return AdditionExtensionApplicationSubmittedScreen(
              referenceNumber:
                  extra?['referenceNumber'] as String? ?? 'ADX-UNKNOWN',
              submissionDate:
                  extra?['submissionDate'] as DateTime? ?? DateTime.now(),
            );
          },
        ),
        GoRoute(
          path: '/applications/new/demolition-permit',
          builder: (context, state) => const DemolitionPermitWizardScreen(),
        ),
        GoRoute(
          path: '/applications/new/demolition-permit/submitted',
          builder: (context, state) {
            final extra = state.extra as Map<String, Object?>?;
            return DemolitionApplicationSubmittedScreen(
              referenceNumber:
                  extra?['referenceNumber'] as String? ?? 'DEM-UNKNOWN',
              submissionDate:
                  extra?['submissionDate'] as DateTime? ?? DateTime.now(),
            );
          },
        ),
        GoRoute(
          path: '/applications/new/zoning-permit',
          builder: (context, state) => const ZoningPermitWizardScreen(),
        ),
        GoRoute(
          path: '/applications/new/zoning-permit/submitted',
          builder: (context, state) {
            final extra = state.extra as Map<String, Object?>?;
            return ZoningApplicationSubmittedScreen(
              referenceNumber:
                  extra?['referenceNumber'] as String? ?? 'ZLC-UNKNOWN',
              submissionDate:
                  extra?['submissionDate'] as DateTime? ?? DateTime.now(),
            );
          },
        ),
        GoRoute(
          path: '/applications/new/architectural-permit',
          builder: (context, state) => const ArchitecturalPermitWizardScreen(),
        ),
        GoRoute(
          path: '/applications/new/architectural-permit/submitted',
          builder: (context, state) {
            final extra = state.extra as Map<String, Object?>?;
            return ArchitecturalApplicationSubmittedScreen(
              referenceNumber:
                  extra?['referenceNumber'] as String? ?? 'ARC-UNKNOWN',
              submissionDate:
                  extra?['submissionDate'] as DateTime? ?? DateTime.now(),
              relatedBuildingPermitNumber:
                  extra?['relatedBuildingPermitNumber'] as String? ?? '',
              relatedBuildingPermitStatus:
                  extra?['relatedBuildingPermitStatus'] as String? ??
                      'Pending Issuance',
            );
          },
        ),
        GoRoute(
          path: '/applications/new/civil-structural-permit',
          builder: (context, state) =>
              const CivilStructuralPermitWizardScreen(),
        ),
        GoRoute(
          path: '/applications/new/civil-structural-permit/submitted',
          builder: (context, state) {
            final extra = state.extra as Map<String, Object?>?;
            return CivilStructuralApplicationSubmittedScreen(
              referenceNumber:
                  extra?['referenceNumber'] as String? ?? 'CVL-UNKNOWN',
              submissionDate:
                  extra?['submissionDate'] as DateTime? ?? DateTime.now(),
              relatedBuildingPermitNumber:
                  extra?['relatedBuildingPermitNumber'] as String? ?? '',
              relatedBuildingPermitStatus:
                  extra?['relatedBuildingPermitStatus'] as String? ??
                      'Pending',
            );
          },
        ),
        GoRoute(
          path: '/applications/new/electrical-permit',
          builder: (context, state) => const ElectricalPermitWizardScreen(),
        ),
        GoRoute(
          path: '/applications/new/electrical-permit/submitted',
          builder: (context, state) {
            final extra = state.extra as Map<String, Object?>?;
            return ElectricalApplicationSubmittedScreen(
              referenceNumber:
                  extra?['referenceNumber'] as String? ?? 'ELE-UNKNOWN',
              submissionDate:
                  extra?['submissionDate'] as DateTime? ?? DateTime.now(),
              relatedBuildingPermitNumber:
                  extra?['relatedBuildingPermitNumber'] as String? ?? '',
              relatedBuildingPermitStatus:
                  extra?['relatedBuildingPermitStatus'] as String? ??
                      'Pending',
              electricalContractorRequired:
                  extra?['electricalContractorRequired'] as bool? ?? false,
            );
          },
        ),
        GoRoute(
          path: '/applications/new/mechanical-permit',
          builder: (context, state) => const MechanicalPermitWizardScreen(),
        ),
        GoRoute(
          path: '/applications/new/mechanical-permit/submitted',
          builder: (context, state) {
            final extra = state.extra as Map<String, Object?>?;
            return MechanicalApplicationSubmittedScreen(
              referenceNumber:
                  extra?['referenceNumber'] as String? ?? 'MEC-UNKNOWN',
              submissionDate:
                  extra?['submissionDate'] as DateTime? ?? DateTime.now(),
              relatedBuildingPermitNumber:
                  extra?['relatedBuildingPermitNumber'] as String? ?? '',
              relatedBuildingPermitStatus:
                  extra?['relatedBuildingPermitStatus'] as String? ??
                      'Pending',
            );
          },
        ),
        GoRoute(
          path: '/applications/new/electronics-permit',
          builder: (context, state) => const ElectronicsPermitWizardScreen(),
        ),
        GoRoute(
          path: '/applications/new/electronics-permit/submitted',
          builder: (context, state) {
            final extra = state.extra as Map<String, Object?>?;
            return ElectronicsApplicationSubmittedScreen(
              referenceNumber:
                  extra?['referenceNumber'] as String? ?? 'ELX-UNKNOWN',
              submissionDate:
                  extra?['submissionDate'] as DateTime? ?? DateTime.now(),
              relatedBuildingPermitNumber:
                  extra?['relatedBuildingPermitNumber'] as String? ?? '',
              relatedBuildingPermitStatus:
                  extra?['relatedBuildingPermitStatus'] as String? ??
                      'Pending',
            );
          },
        ),
        GoRoute(
          path: '/applications/new/interior-design-permit',
          builder: (context, state) =>
              const InteriorDesignPermitWizardScreen(),
        ),
        GoRoute(
          path: '/applications/new/interior-design-permit/submitted',
          builder: (context, state) {
            final extra = state.extra as Map<String, Object?>?;
            return InteriorDesignApplicationSubmittedScreen(
              referenceNumber:
                  extra?['referenceNumber'] as String? ?? 'IDP-UNKNOWN',
              submissionDate:
                  extra?['submissionDate'] as DateTime? ?? DateTime.now(),
              relatedBuildingPermitNumber:
                  extra?['relatedBuildingPermitNumber'] as String? ?? '',
              relatedBuildingPermitStatus:
                  extra?['relatedBuildingPermitStatus'] as String? ??
                      'Pending',
            );
          },
        ),
        GoRoute(
          path: '/applications/new/fencing-permit',
          builder: (context, state) => const FencingPermitWizardScreen(),
        ),
        GoRoute(
          path: '/applications/new/fencing-permit/submitted',
          builder: (context, state) {
            final extra = state.extra as Map<String, Object?>?;
            return FencingApplicationSubmittedScreen(
              referenceNumber:
                  extra?['referenceNumber'] as String? ?? 'FNC-UNKNOWN',
              submissionDate:
                  extra?['submissionDate'] as DateTime? ?? DateTime.now(),
              relatedBuildingPermitNumber:
                  extra?['relatedBuildingPermitNumber'] as String? ?? '',
              relatedBuildingPermitStatus:
                  extra?['relatedBuildingPermitStatus'] as String? ??
                      'Pending',
            );
          },
        ),
        GoRoute(
          path: '/applications/new/sign-permit',
          builder: (context, state) => const SignPermitWizardScreen(),
        ),
        GoRoute(
          path: '/applications/new/sign-permit/submitted',
          builder: (context, state) {
            final extra = state.extra as Map<String, Object?>?;
            return SignApplicationSubmittedScreen(
              referenceNumber:
                  extra?['referenceNumber'] as String? ?? 'SGN-UNKNOWN',
              submissionDate:
                  extra?['submissionDate'] as DateTime? ?? DateTime.now(),
              relatedBuildingPermitNumber:
                  extra?['relatedBuildingPermitNumber'] as String? ?? '',
              relatedBuildingPermitStatus:
                  extra?['relatedBuildingPermitStatus'] as String? ??
                      'Pending',
            );
          },
        ),
        GoRoute(
          path: '/applications/new/excavation-permit',
          builder: (context, state) => const ExcavationPermitWizardScreen(),
        ),
        GoRoute(
          path: '/applications/new/excavation-permit/submitted',
          builder: (context, state) {
            final extra = state.extra as Map<String, Object?>?;
            return ExcavationApplicationSubmittedScreen(
              referenceNumber:
                  extra?['referenceNumber'] as String? ?? 'EGP-UNKNOWN',
              submissionDate:
                  extra?['submissionDate'] as DateTime? ?? DateTime.now(),
              relatedBuildingPermitNumber:
                  extra?['relatedBuildingPermitNumber'] as String? ?? '',
              relatedBuildingPermitStatus:
                  extra?['relatedBuildingPermitStatus'] as String? ??
                      'Pending',
            );
          },
        ),
        GoRoute(
          path: '/applications/new/fsec-permit',
          builder: (context, state) => const FsecPermitWizardScreen(),
        ),
        GoRoute(
          path: '/applications/new/fsec-permit/submitted',
          builder: (context, state) {
            final extra = state.extra as Map<String, Object?>?;
            return FsecApplicationSubmittedScreen(
              referenceNumber:
                  extra?['referenceNumber'] as String? ?? 'FSEC-UNKNOWN',
              submissionDate:
                  extra?['submissionDate'] as DateTime? ?? DateTime.now(),
              relatedBuildingPermitApplicationNumber:
                  extra?['relatedBuildingPermitApplicationNumber']
                      as String? ??
                  '',
            );
          },
        ),
        GoRoute(
          path: '/applications/new/certificate-of-occupancy',
          builder: (context, state) =>
              const CertificateOfOccupancyWizardScreen(),
        ),
        GoRoute(
          path: '/applications/new/certificate-of-occupancy/submitted',
          builder: (context, state) {
            final extra = state.extra as Map<String, Object?>?;
            return CertificateOfOccupancySubmittedScreen(
              referenceNumber:
                  extra?['referenceNumber'] as String? ?? 'COO-UNKNOWN',
              submissionDate:
                  extra?['submissionDate'] as DateTime? ?? DateTime.now(),
              buildingPermitNumber:
                  extra?['buildingPermitNumber'] as String? ?? '',
              certificateType:
                  extra?['certificateType'] as String? ?? 'Full',
            );
          },
        ),
        GoRoute(
          path: '/applications/new/fsic-permit',
          builder: (context, state) => const FsicPermitWizardScreen(),
        ),
        GoRoute(
          path: '/applications/new/fsic-permit/submitted',
          builder: (context, state) {
            final extra = state.extra as Map<String, Object?>?;
            return FsicApplicationSubmittedScreen(
              referenceNumber:
                  extra?['referenceNumber'] as String? ?? 'FSIC-UNKNOWN',
              submissionDate:
                  extra?['submissionDate'] as DateTime? ?? DateTime.now(),
              relatedOccupancyPermitNumber:
                  extra?['relatedOccupancyPermitNumber'] as String? ?? '',
              relatedOccupancyPermitStatus:
                  extra?['relatedOccupancyPermitStatus'] as String? ??
                      'Pending',
            );
          },
        ),
        GoRoute(
          path: '/applications/new/plumbing-permit',
          builder: (context, state) => const PlumbingPermitWizardScreen(),
        ),
        GoRoute(
          path: '/applications/new/plumbing-permit/submitted',
          builder: (context, state) {
            final extra = state.extra as Map<String, Object?>?;
            return PlumbingApplicationSubmittedScreen(
              referenceNumber:
                  extra?['referenceNumber'] as String? ?? 'PLB-UNKNOWN',
              submissionDate:
                  extra?['submissionDate'] as DateTime? ?? DateTime.now(),
              relatedBuildingPermitNumber:
                  extra?['relatedBuildingPermitNumber'] as String? ?? '',
              relatedBuildingPermitStatus:
                  extra?['relatedBuildingPermitStatus'] as String? ??
                      'Pending',
            );
          },
        ),
        GoRoute(
          path: '/applications/new/sanitary-plumbing-permit',
          builder: (context, state) =>
              const SanitaryPlumbingPermitWizardScreen(),
        ),
        GoRoute(
          path: '/applications/new/sanitary-plumbing-permit/submitted',
          builder: (context, state) {
            final extra = state.extra as Map<String, Object?>?;
            return SanitaryPlumbingApplicationSubmittedScreen(
              referenceNumber:
                  extra?['referenceNumber'] as String? ?? 'SAN-UNKNOWN',
              submissionDate:
                  extra?['submissionDate'] as DateTime? ?? DateTime.now(),
              relatedBuildingPermitNumber:
                  extra?['relatedBuildingPermitNumber'] as String? ?? '',
              relatedBuildingPermitStatus:
                  extra?['relatedBuildingPermitStatus'] as String? ??
                      'Pending',
            );
          },
        ),
        GoRoute(
          path: '/applications/:applicationId',
          builder: (context, state) => ApplicationDetailsScreen(
            applicationId: state.pathParameters['applicationId']!,
          ),
        ),
        GoRoute(
          path: '/applications/:applicationId/pay',
          builder: (context, state) => PaymentFlowScreen(
            applicationId: state.pathParameters['applicationId']!,
          ),
        ),
        GoRoute(
          path: '/profile/edit',
          builder: (context, state) => const EditProfileScreen(),
        ),
        GoRoute(
          path: '/profile/change-password',
          builder: (context, state) => const ChangePasswordScreen(),
        ),
        GoRoute(
          path: '/profile/documents',
          builder: (context, state) => const MyDocumentsScreen(),
        ),
        GoRoute(
          path: '/profile/language',
          builder: (context, state) => const LanguageScreen(),
        ),
        GoRoute(
          path: '/profile/notifications',
          builder: (context, state) => const NotificationPreferencesScreen(),
        ),
        GoRoute(
          path: '/profile/help',
          builder: (context, state) => const HelpSupportScreen(),
        ),
        GoRoute(
          path: '/profile/terms',
          builder: (context, state) => const TermsConditionsScreen(),
        ),
        GoRoute(
          path: '/profile/privacy',
          builder: (context, state) => const PrivacyPolicyScreen(),
        ),
        StatefulShellRoute.indexedStack(
          builder: (context, state, navigationShell) =>
              MainShell(navigationShell: navigationShell),
          branches: [
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: '/app/home',
                  builder: (context, state) => const DashboardScreen(),
                ),
              ],
            ),
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: '/app/applications',
                  builder: (context, state) => const ApplicationsScreen(),
                ),
              ],
            ),
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: '/app/payments',
                  builder: (context, state) => const PaymentsScreen(),
                ),
              ],
            ),
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: '/app/profile',
                  builder: (context, state) => ProfileScreen(),
                ),
              ],
            ),
          ],
        ),
        // Not a bottom-nav destination — Notifications is reachable from
        // the Home page's notification bell/section instead, so it's a
        // regular pushed route (with its own back button) rather than a
        // StatefulShellBranch.
        GoRoute(
          path: '/app/notifications',
          builder: (context, state) => const NotificationsScreen(),
        ),
      ],
      errorBuilder: (context, state) => const _NotFoundScreen(),
    );
  }

  static String? _redirect(AuthProvider authProvider, GoRouterState state) {
    final location = state.matchedLocation;
    final isSplash = location == '/splash';
    final isOnboarding = location == '/onboarding';
    final isAuthRoute = _authRoutes.contains(location);

    if (authProvider.status == AuthStatus.unknown) {
      return isSplash ? null : '/splash';
    }

    if (!authProvider.onboardingCompleted) {
      return isOnboarding ? null : '/onboarding';
    }

    if (!authProvider.isLoggedIn) {
      if (isAuthRoute) return null;
      return '/login';
    }

    if (isSplash || isOnboarding || isAuthRoute || location == '/app') {
      return '/app/home';
    }

    return null;
  }
}

class _NotFoundScreen extends StatelessWidget {
  const _NotFoundScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: ErrorState(
          icon: Icons.search_off_outlined,
          title: 'Page not found',
          message: "The page you're looking for doesn't exist.",
          retryLabel: 'Back to Home',
          onRetry: () => context.go('/app/home'),
        ),
      ),
    );
  }
}
