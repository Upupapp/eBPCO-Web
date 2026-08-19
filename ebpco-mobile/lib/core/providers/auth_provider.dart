import 'package:flutter/material.dart';

import '../models/user_model.dart';
import '../repositories/auth_repository.dart';
import '../services/local_storage_service.dart';

enum AuthStatus { unknown, authenticated, unauthenticated }

/// Handles mock authentication state: session restore, login, registration,
/// and logout. Credential/account logic lives in [AuthRepository];
/// [LocalStorageService] only persists session/device state, so swapping in
/// a real backend later means providing a different [AuthRepository].
class AuthProvider extends ChangeNotifier {
  AuthProvider({
    AuthRepository? authRepository,
    LocalStorageService? storageService,
  }) : _storage = storageService ?? LocalStorageService(),
       _repository =
           authRepository ??
           MockAuthRepository(
             storageService: storageService ?? LocalStorageService(),
           );

  final LocalStorageService _storage;
  final AuthRepository _repository;

  AuthStatus _status = AuthStatus.unknown;
  bool _isLoading = false;
  String? _errorMessage;
  UserModel? _currentUser;
  bool _onboardingCompleted = false;
  String? _rememberedEmail;

  AuthStatus get status => _status;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  UserModel? get currentUser => _currentUser;
  bool get isLoggedIn => _status == AuthStatus.authenticated;
  bool get onboardingCompleted => _onboardingCompleted;

  /// Email remembered from a previous "Remember me" login, if any, so
  /// [LoginScreen] can prefill it.
  String? get rememberedEmail => _rememberedEmail;

  Future<void> loadSession() async {
    _onboardingCompleted = await _storage.isOnboardingCompleted();
    _rememberedEmail = await _storage.getRememberedEmail();
    final loggedIn = await _storage.isLoggedIn();
    if (loggedIn) {
      final email = await _storage.getCurrentUserEmail();
      _currentUser = email != null
          ? await _repository.hydrateUser(email)
          : null;
      await _applySavedPhoto();
      _status = AuthStatus.authenticated;
    } else {
      _status = AuthStatus.unauthenticated;
    }
    notifyListeners();
  }

  /// Re-applies the persisted profile photo path (if any) to
  /// [_currentUser] — [_repository.hydrateUser]/[_repository.authenticate]
  /// don't know about the photo, since it's saved separately by
  /// [ProfilePhotoService], not part of the mock account record itself.
  Future<void> _applySavedPhoto() async {
    final user = _currentUser;
    if (user == null) return;
    final savedPath = await _storage.getProfilePhotoPath();
    if (savedPath == null) return;
    _currentUser = user.copyWith(photoPath: savedPath);
  }

  Future<void> completeOnboarding() async {
    await _storage.setOnboardingCompleted(true);
    _onboardingCompleted = true;
    notifyListeners();
  }

  Future<bool> login({
    required String email,
    required String password,
    required bool rememberMe,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final user = await _repository.authenticate(
      email: email,
      password: password,
    );

    if (user != null) {
      await _storage.setLoggedIn(true);
      await _storage.setRememberMe(rememberMe);
      await _storage.setCurrentUserEmail(user.email);
      await _storage.setRememberedEmail(rememberMe ? user.email : null);
      _rememberedEmail = rememberMe ? user.email : null;
      _currentUser = user;
      await _applySavedPhoto();
      _status = AuthStatus.authenticated;
      _isLoading = false;
      notifyListeners();
      return true;
    }

    _errorMessage = 'Incorrect email or password. Please try again.';
    _status = AuthStatus.unauthenticated;
    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> register({
    required String firstName,
    required String lastName,
    required String email,
    required String mobileNumber,
    required String password,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final success = await _repository.registerAccount(
      firstName: firstName,
      lastName: lastName,
      email: email,
      mobileNumber: mobileNumber,
      password: password,
    );

    if (!success) {
      _errorMessage = 'This email address is already in use.';
    }
    _isLoading = false;
    notifyListeners();
    return success;
  }

  Future<bool> updateProfile({
    required String firstName,
    String middleName = '',
    required String lastName,
    required String mobileNumber,
    String address = '',
    String province = '',
    String city = '',
    String barangay = '',
    String zipCode = '',
  }) async {
    final user = _currentUser;
    if (user == null) return false;

    _currentUser = user.copyWith(
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      mobileNumber: mobileNumber,
      address: address,
      province: province,
      city: city,
      barangay: barangay,
      zipCode: zipCode,
    );
    // Only first/last/mobile are persisted on-device, matching the
    // prototype's original persistence scope; the newer profile fields
    // (middle name, address) are session-only mock state that resets on
    // app restart.
    await _storage.updateRegisteredProfile(
      firstName: firstName,
      lastName: lastName,
      mobileNumber: mobileNumber,
    );
    notifyListeners();
    return true;
  }

  /// Sets or clears the profile photo. [photoPath] is a real local file
  /// path (saved by [ProfilePhotoService]) or null to remove the photo —
  /// persisted so it survives app restarts, matching how the other
  /// registered-profile fields are handled.
  Future<bool> updateProfilePhoto(String? photoPath) async {
    final user = _currentUser;
    if (user == null) return false;

    await _storage.setProfilePhotoPath(photoPath);
    _currentUser = user.copyWith(photoPath: photoPath);
    notifyListeners();
    return true;
  }

  Future<void> logout() async {
    await _storage.clearSession();
    _currentUser = null;
    _status = AuthStatus.unauthenticated;
    notifyListeners();
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
