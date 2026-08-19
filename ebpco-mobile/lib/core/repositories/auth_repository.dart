import '../constants/app_constants.dart';
import '../constants/app_strings.dart';
import '../models/user_model.dart';
import '../services/local_storage_service.dart';

/// Mock credential/account source for the prototype's authentication flow.
/// Swap [MockAuthRepository] for a real HTTP-backed implementation once a
/// backend exists — [AuthProvider] only depends on this interface.
abstract class AuthRepository {
  Future<UserModel?> authenticate({
    required String email,
    required String password,
  });

  Future<bool> registerAccount({
    required String firstName,
    required String lastName,
    required String email,
    required String mobileNumber,
    required String password,
  });

  Future<UserModel?> hydrateUser(String email);
}

class MockAuthRepository implements AuthRepository {
  MockAuthRepository({LocalStorageService? storageService})
    : _storage = storageService ?? LocalStorageService();

  final LocalStorageService _storage;

  static final _mockUser = UserModel(
    firstName: 'Juan',
    middleName: 'Santos',
    lastName: 'Dela Cruz',
    email: AppStrings.mockEmail,
    mobileNumber: '09171234567',
    address: '123 Rizal Street',
    barangay: 'San Isidro',
    city: 'Quezon City',
    province: 'Metro Manila',
    zipCode: '1100',
    accountType: 'Individual Applicant',
    accountStatus: AccountStatus.verified,
    registeredSince: DateTime(2024, 3, 12),
  );

  @override
  Future<UserModel?> authenticate({
    required String email,
    required String password,
  }) async {
    await Future.delayed(AppConstants.mockNetworkDelay);
    final normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail == AppStrings.mockEmail &&
        password == AppStrings.mockPassword) {
      return _mockUser;
    }

    final registeredEmail = await _storage.getRegisteredEmail();
    final registeredPassword = await _storage.getRegisteredPassword();
    if (registeredEmail != null &&
        normalizedEmail == registeredEmail &&
        password == registeredPassword) {
      return _hydrateRegisteredUser(registeredEmail);
    }

    return null;
  }

  @override
  Future<bool> registerAccount({
    required String firstName,
    required String lastName,
    required String email,
    required String mobileNumber,
    required String password,
  }) async {
    await Future.delayed(AppConstants.mockNetworkDelay);
    final normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail == AppStrings.mockEmail) {
      return false;
    }

    await _storage.saveRegisteredUser(
      email: normalizedEmail,
      password: password,
      firstName: firstName,
      lastName: lastName,
      mobileNumber: mobileNumber,
    );
    return true;
  }

  @override
  Future<UserModel?> hydrateUser(String email) async {
    if (email == AppStrings.mockEmail) return _mockUser;

    final registeredEmail = await _storage.getRegisteredEmail();
    if (email == registeredEmail) {
      return _hydrateRegisteredUser(registeredEmail!);
    }
    return null;
  }

  Future<UserModel> _hydrateRegisteredUser(String registeredEmail) async {
    return UserModel(
      firstName: await _storage.getRegisteredFirstName() ?? 'User',
      lastName: await _storage.getRegisteredLastName() ?? '',
      email: registeredEmail,
      mobileNumber: await _storage.getRegisteredMobile() ?? '',
    );
  }
}
