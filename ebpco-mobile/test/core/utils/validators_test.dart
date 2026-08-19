import 'package:flutter_test/flutter_test.dart';

import 'package:ebpco_user_app/core/utils/validators.dart';

void main() {
  group('Validators.email', () {
    test('rejects empty input', () {
      expect(Validators.email(''), isNotNull);
    });

    test('rejects malformed email', () {
      expect(Validators.email('not-an-email'), isNotNull);
    });

    test('accepts a valid email', () {
      expect(Validators.email('user@ebpco.com'), isNull);
    });
  });

  group('Validators.password', () {
    test('rejects passwords shorter than 8 characters', () {
      expect(Validators.password('abc1'), isNotNull);
    });

    test('rejects passwords without a number', () {
      expect(Validators.password('abcdefgh'), isNotNull);
    });

    test('rejects passwords without a letter', () {
      expect(Validators.password('12345678'), isNotNull);
    });

    test('accepts a password with letters, a number, and 8+ characters', () {
      expect(Validators.password('password123'), isNull);
    });
  });

  group('Validators.confirmPassword', () {
    test('rejects mismatched passwords', () {
      expect(
        Validators.confirmPassword('password123', 'password456'),
        isNotNull,
      );
    });

    test('accepts matching passwords', () {
      expect(Validators.confirmPassword('password123', 'password123'), isNull);
    });
  });

  group('Validators.philippineMobile', () {
    test('accepts 09XXXXXXXXX format', () {
      expect(Validators.philippineMobile('09171234567'), isNull);
    });

    test('accepts +639XXXXXXXXX format', () {
      expect(Validators.philippineMobile('+639171234567'), isNull);
    });

    test('rejects numbers that are too short', () {
      expect(Validators.philippineMobile('0917123'), isNotNull);
    });

    test('rejects numbers with an invalid prefix', () {
      expect(Validators.philippineMobile('12345678901'), isNotNull);
    });
  });

  group('Validators.postalCode', () {
    test('accepts a valid 4-digit postal code', () {
      expect(Validators.postalCode('1000'), isNull);
    });

    test('rejects a postal code with letters', () {
      expect(Validators.postalCode('10A0'), isNotNull);
    });
  });
}
