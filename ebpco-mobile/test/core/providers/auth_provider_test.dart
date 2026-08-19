import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:ebpco_user_app/core/providers/auth_provider.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  group('AuthProvider mock login', () {
    test('logs in successfully with the mock prototype account', () async {
      final authProvider = AuthProvider();

      final success = await authProvider.login(
        email: 'user@ebpco.com',
        password: 'password123',
        rememberMe: false,
      );

      expect(success, isTrue);
      expect(authProvider.status, AuthStatus.authenticated);
      expect(authProvider.currentUser?.email, 'user@ebpco.com');
      expect(authProvider.errorMessage, isNull);
    });

    test('fails with a friendly error for invalid credentials', () async {
      final authProvider = AuthProvider();

      final success = await authProvider.login(
        email: 'unknown@example.com',
        password: 'wrongpassword',
        rememberMe: false,
      );

      expect(success, isFalse);
      expect(authProvider.status, AuthStatus.unauthenticated);
      expect(authProvider.errorMessage, isNotNull);
    });

    test(
      'allows a newly registered user to log in with their saved credentials',
      () async {
        final authProvider = AuthProvider();

        final registered = await authProvider.register(
          firstName: 'Maria',
          lastName: 'Santos',
          email: 'maria.santos@example.com',
          mobileNumber: '09171234567',
          password: 'mypassword1',
        );
        expect(registered, isTrue);

        final loginSuccess = await authProvider.login(
          email: 'maria.santos@example.com',
          password: 'mypassword1',
          rememberMe: false,
        );

        expect(loginSuccess, isTrue);
        expect(authProvider.currentUser?.firstName, 'Maria');
      },
    );
  });
}
