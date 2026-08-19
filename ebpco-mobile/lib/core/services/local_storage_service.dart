import 'package:shared_preferences/shared_preferences.dart';

import '../constants/app_constants.dart';

/// Thin wrapper around [SharedPreferences] used to persist prototype-only
/// state on the device.
///
/// IMPORTANT: This service stores plain-text credentials locally purely to
/// simulate authentication for this frontend prototype. It must NEVER be
/// used to store real credentials in a production application - a real
/// backend with proper hashing and secure storage is required for that.
class LocalStorageService {
  Future<SharedPreferences> get _prefs async => SharedPreferences.getInstance();

  Future<bool> isOnboardingCompleted() async {
    final prefs = await _prefs;
    return prefs.getBool(AppConstants.prefOnboardingCompleted) ?? false;
  }

  Future<void> setOnboardingCompleted(bool value) async {
    final prefs = await _prefs;
    await prefs.setBool(AppConstants.prefOnboardingCompleted, value);
  }

  Future<bool> isLoggedIn() async {
    final prefs = await _prefs;
    return prefs.getBool(AppConstants.prefIsLoggedIn) ?? false;
  }

  Future<void> setLoggedIn(bool value) async {
    final prefs = await _prefs;
    await prefs.setBool(AppConstants.prefIsLoggedIn, value);
  }

  Future<bool> getRememberMe() async {
    final prefs = await _prefs;
    return prefs.getBool(AppConstants.prefRememberMe) ?? false;
  }

  Future<void> setRememberMe(bool value) async {
    final prefs = await _prefs;
    await prefs.setBool(AppConstants.prefRememberMe, value);
  }

  Future<String?> getRememberedEmail() async {
    final prefs = await _prefs;
    return prefs.getString(AppConstants.prefRememberedEmail);
  }

  Future<void> setRememberedEmail(String? email) async {
    final prefs = await _prefs;
    if (email == null) {
      await prefs.remove(AppConstants.prefRememberedEmail);
    } else {
      await prefs.setString(AppConstants.prefRememberedEmail, email);
    }
  }

  Future<void> saveRegisteredUser({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    required String mobileNumber,
  }) async {
    final prefs = await _prefs;
    await prefs.setString(
      AppConstants.prefRegisteredEmail,
      email.trim().toLowerCase(),
    );
    await prefs.setString(AppConstants.prefRegisteredPassword, password);
    await prefs.setString(AppConstants.prefRegisteredFirstName, firstName);
    await prefs.setString(AppConstants.prefRegisteredLastName, lastName);
    await prefs.setString(AppConstants.prefRegisteredMobile, mobileNumber);
  }

  Future<String?> getRegisteredEmail() async {
    final prefs = await _prefs;
    return prefs.getString(AppConstants.prefRegisteredEmail);
  }

  Future<String?> getRegisteredPassword() async {
    final prefs = await _prefs;
    return prefs.getString(AppConstants.prefRegisteredPassword);
  }

  Future<String?> getRegisteredFirstName() async {
    final prefs = await _prefs;
    return prefs.getString(AppConstants.prefRegisteredFirstName);
  }

  Future<String?> getRegisteredLastName() async {
    final prefs = await _prefs;
    return prefs.getString(AppConstants.prefRegisteredLastName);
  }

  Future<String?> getRegisteredMobile() async {
    final prefs = await _prefs;
    return prefs.getString(AppConstants.prefRegisteredMobile);
  }

  Future<void> updateRegisteredProfile({
    required String firstName,
    required String lastName,
    required String mobileNumber,
  }) async {
    final prefs = await _prefs;
    await prefs.setString(AppConstants.prefRegisteredFirstName, firstName);
    await prefs.setString(AppConstants.prefRegisteredLastName, lastName);
    await prefs.setString(AppConstants.prefRegisteredMobile, mobileNumber);
  }

  Future<void> setCurrentUserEmail(String email) async {
    final prefs = await _prefs;
    await prefs.setString(
      AppConstants.prefCurrentUserEmail,
      email.trim().toLowerCase(),
    );
  }

  Future<String?> getCurrentUserEmail() async {
    final prefs = await _prefs;
    return prefs.getString(AppConstants.prefCurrentUserEmail);
  }

  Future<void> clearSession() async {
    final prefs = await _prefs;
    await prefs.remove(AppConstants.prefIsLoggedIn);
    await prefs.remove(AppConstants.prefCurrentUserEmail);
  }

  /// The saved profile photo's local file path, if any. Kept across
  /// logout (like the other registered-profile fields above) since this
  /// prototype only ever has one mock account per device.
  Future<String?> getProfilePhotoPath() async {
    final prefs = await _prefs;
    return prefs.getString(AppConstants.prefProfilePhotoPath);
  }

  Future<void> setProfilePhotoPath(String? path) async {
    final prefs = await _prefs;
    if (path == null) {
      await prefs.remove(AppConstants.prefProfilePhotoPath);
    } else {
      await prefs.setString(AppConstants.prefProfilePhotoPath, path);
    }
  }

  /// Whether the "Allow File Access" privacy explanation has already been
  /// shown once — after that, file-access requests go straight to the OS
  /// permission flow instead of re-showing eBPCO's own explanation dialog
  /// every time.
  Future<bool> isFileAccessPrimerShown() async {
    final prefs = await _prefs;
    return prefs.getBool(AppConstants.prefFileAccessPrimerShown) ?? false;
  }

  Future<void> setFileAccessPrimerShown() async {
    final prefs = await _prefs;
    await prefs.setBool(AppConstants.prefFileAccessPrimerShown, true);
  }
}
