import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:ebpco_user_app/core/models/user_model.dart';
import 'package:ebpco_user_app/core/providers/auth_provider.dart';
import 'package:ebpco_user_app/core/providers/settings_provider.dart';
import 'package:ebpco_user_app/core/repositories/auth_repository.dart';
import 'package:ebpco_user_app/features/profile/presentation/change_password_screen.dart';
import 'package:ebpco_user_app/features/profile/presentation/edit_profile_screen.dart';
import 'package:ebpco_user_app/features/profile/presentation/help_support_screen.dart';
import 'package:ebpco_user_app/features/profile/presentation/language_screen.dart';
import 'package:ebpco_user_app/features/profile/presentation/notification_preferences_screen.dart';
import 'package:ebpco_user_app/features/profile/presentation/privacy_policy_screen.dart';
import 'package:ebpco_user_app/features/profile/presentation/profile_screen.dart';
import 'package:ebpco_user_app/features/profile/presentation/terms_conditions_screen.dart';

class _FakeAuthRepository implements AuthRepository {
  static const _user = UserModel(
    firstName: 'Juan',
    middleName: 'Santos',
    lastName: 'Dela Cruz',
    email: 'user@ebpco.com',
    mobileNumber: '09171234567',
    address: '123 Rizal Street',
    barangay: 'San Isidro',
    city: 'Quezon City',
    province: 'Metro Manila',
    zipCode: '1100',
    accountStatus: AccountStatus.verified,
  );

  @override
  Future<UserModel?> authenticate({
    required String email,
    required String password,
  }) async => _user;

  @override
  Future<bool> registerAccount({
    required String firstName,
    required String lastName,
    required String email,
    required String mobileNumber,
    required String password,
  }) async => true;

  @override
  Future<UserModel?> hydrateUser(String email) async => _user;
}

Future<AuthProvider> _signedInAuthProvider() async {
  final auth = AuthProvider(authRepository: _FakeAuthRepository());
  final ok = await auth.login(
    email: 'user@ebpco.com',
    password: 'password123',
    rememberMe: false,
  );
  expect(ok, isTrue);
  return auth;
}

Widget _wrapWithRouter(AuthProvider authProvider) {
  final router = GoRouter(
    initialLocation: '/profile',
    routes: [
      GoRoute(
        path: '/profile',
        builder: (context, state) => ProfileScreen(),
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
        path: '/profile/notifications',
        builder: (context, state) => const NotificationPreferencesScreen(),
      ),
      GoRoute(
        path: '/profile/language',
        builder: (context, state) => const LanguageScreen(),
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
      GoRoute(
        path: '/login',
        builder: (context, state) => const Scaffold(body: Text('Login Screen')),
      ),
    ],
  );

  return MultiProvider(
    providers: [
      ChangeNotifierProvider<AuthProvider>.value(value: authProvider),
      ChangeNotifierProvider<SettingsProvider>(
        create: (_) => SettingsProvider(),
      ),
    ],
    child: MaterialApp.router(routerConfig: router),
  );
}

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  // The profile screen's scrollable content is taller than the default
  // 800x600 test canvas, which causes raw tap() coordinates to miss lower
  // menu items — use a tall canvas so everything is on-screen. Must be
  // called from inside the test body (not setUp/tearDown).
  Future<void> useTallSurface(WidgetTester tester) async {
    await tester.binding.setSurfaceSize(const Size(400, 2400));
    addTearDown(() => tester.binding.setSurfaceSize(null));
  }

  testWidgets('shows the richer profile info cards with mock data', (
    tester,
  ) async {
    final auth = await _signedInAuthProvider();
    await useTallSurface(tester);
    await tester.pumpWidget(_wrapWithRouter(auth));
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);

    expect(find.text('Juan Santos Dela Cruz'), findsWidgets);
    expect(
      find.text(
        '123 Rizal Street, San Isidro, Quezon City, Metro Manila, 1100',
      ),
      findsOneWidget,
    );
    expect(find.text('Individual Applicant'), findsOneWidget);
    expect(find.text('Verified'), findsOneWidget);
  });

  testWidgets('every menu item opens its corresponding screen', (tester) async {
    final auth = await _signedInAuthProvider();
    await useTallSurface(tester);
    await tester.pumpWidget(_wrapWithRouter(auth));
    await tester.pumpAndSettle();

    Future<void> tapAndVerify(String label, Finder targetScreenFinder) async {
      await tester.tap(find.text(label));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull, reason: 'opening "$label"');
      expect(
        targetScreenFinder,
        findsOneWidget,
        reason: '"$label" should open its screen',
      );
      await tester.pageBack();
      await tester.pumpAndSettle();
    }

    await tapAndVerify(
      'Edit Profile',
      find.widgetWithText(AppBar, 'Edit Profile'),
    );
    await tapAndVerify(
      'Change Password',
      find.widgetWithText(AppBar, 'Change Password'),
    );
    await tapAndVerify(
      'Notification Preferences',
      find.widgetWithText(AppBar, 'Notification Preferences'),
    );
    await tapAndVerify('Language', find.widgetWithText(AppBar, 'Language'));
    await tapAndVerify(
      'Help and Support',
      find.widgetWithText(AppBar, 'Help and Support'),
    );
    await tapAndVerify(
      'Terms and Conditions',
      find.widgetWithText(AppBar, 'Terms and Conditions'),
    );
    await tapAndVerify(
      'Privacy Policy',
      find.widgetWithText(AppBar, 'Privacy Policy'),
    );
  });

  testWidgets(
    'profile photo edit opens a bottom sheet with Take Photo/Choose from '
    'Gallery, and no Remove Photo option while no photo is set',
    (tester) async {
      final auth = await _signedInAuthProvider();
      await useTallSurface(tester);
      await tester.pumpWidget(_wrapWithRouter(auth));
      await tester.pumpAndSettle();

      await tester.tap(find.byIcon(Icons.camera_alt));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);

      expect(find.text('Take Photo'), findsOneWidget);
      expect(find.text('Choose from Gallery'), findsOneWidget);
      expect(find.text('Cancel'), findsOneWidget);
      // No photo set yet, so Remove Photo should not be offered.
      expect(find.text('Remove Photo'), findsNothing);

      // Tapping "Take Photo"/"Choose from Gallery" triggers the real
      // camera/gallery permission flow (image_picker/permission_handler),
      // which needs a real device/emulator and is covered by this
      // feature's manual test plan instead of a widget test — closing via
      // Cancel here only exercises the bottom sheet's own presentation.
      await tester.tap(find.text('Cancel'));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      expect(find.text('Take Photo'), findsNothing);
    },
  );

  testWidgets('logout shows confirmation dialog and returns to login', (
    tester,
  ) async {
    final auth = await _signedInAuthProvider();
    await useTallSurface(tester);
    await tester.pumpWidget(_wrapWithRouter(auth));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Log Out'));
    await tester.pumpAndSettle();
    expect(
      find.text('Are you sure you want to log out of your eBPCO account?'),
      findsOneWidget,
    );

    await tester.tap(find.text('Log Out').last);
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
    expect(find.text('Login Screen'), findsOneWidget);
  });

  testWidgets('edit profile save shows success dialog and preserves data', (
    tester,
  ) async {
    final auth = await _signedInAuthProvider();
    await useTallSurface(tester);
    await tester.pumpWidget(_wrapWithRouter(auth));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Edit Profile'));
    await tester.pumpAndSettle();

    // Email field should be read-only.
    final emailField = tester.widget<TextFormField>(
      find.widgetWithText(TextFormField, 'user@ebpco.com'),
    );
    expect(emailField.enabled, isFalse);

    await tester.enterText(
      find.widgetWithText(TextFormField, 'Juan').first,
      'Juanito',
    );
    await tester.tap(find.text('Save Changes'));
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
    expect(find.text('Profile updated successfully.'), findsOneWidget);

    await tester.tap(find.text('OK'));
    await tester.pumpAndSettle();
    expect(find.text('Juanito Santos Dela Cruz'), findsWidgets);
  });

  testWidgets(
    'change password shows strength meter, checklist, and success dialog',
    (tester) async {
      final auth = await _signedInAuthProvider();
      await useTallSurface(tester);
      await tester.pumpWidget(_wrapWithRouter(auth));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Change Password'));
      await tester.pumpAndSettle();

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Current Password'),
        'oldpassword1',
      );
      await tester.enterText(
        find.widgetWithText(TextFormField, 'New Password'),
        'NewPass123',
      );
      await tester.pump();
      expect(find.textContaining('Password strength'), findsOneWidget);
      expect(find.text('At least 8 characters'), findsOneWidget);

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Confirm Password'),
        'NewPass123',
      );
      await tester.tap(find.widgetWithText(ElevatedButton, 'Change Password'));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      expect(find.text('Password changed successfully.'), findsOneWidget);
    },
  );

  testWidgets(
    'language screen search + selection updates only the radio state',
    (tester) async {
      final auth = await _signedInAuthProvider();
      await useTallSurface(tester);
      await tester.pumpWidget(_wrapWithRouter(auth));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Language'));
      await tester.pumpAndSettle();
      expect(
        find.textContaining('demonstration purposes only'),
        findsOneWidget,
      );

      await tester.enterText(find.byType(TextField), 'Cebuano');
      await tester.pump(const Duration(milliseconds: 400));
      await tester.pumpAndSettle();
      final cebuanoTile = find.widgetWithText(RadioListTile<String>, 'Cebuano');
      expect(cebuanoTile, findsOneWidget);
      expect(
        find.widgetWithText(RadioListTile<String>, 'English'),
        findsNothing,
      );

      await tester.tap(cebuanoTile);
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
    },
  );

  testWidgets('notification preferences toggles flip mock state', (
    tester,
  ) async {
    final auth = await _signedInAuthProvider();
    await useTallSurface(tester);
    await tester.pumpWidget(_wrapWithRouter(auth));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Notification Preferences'));
    await tester.pumpAndSettle();

    final tile = find.widgetWithText(SwitchListTile, 'SMS Notifications');
    expect(tester.widget<SwitchListTile>(tile).value, isFalse);
    await tester.tap(tile);
    await tester.pumpAndSettle();
    expect(tester.widget<SwitchListTile>(tile).value, isTrue);
    expect(tester.takeException(), isNull);
  });
}
