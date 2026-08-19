/// Shared layout and behavior constants for the E-BPCO User App.
class AppConstants {
  AppConstants._();

  static const double screenPaddingHorizontal = 20;
  static const double screenPaddingVertical = 16;
  static const double maxFormWidth = 480;

  // Fintech-premium radius scale: soft on small controls, large on cards.
  static const double borderRadiusXs = 4;
  static const double borderRadiusSmall = 12;
  static const double borderRadiusMedium = 14;
  static const double borderRadiusLarge = 16;
  static const double borderRadiusXl = 24;
  static const double borderRadiusPill = 999;

  static const double minTouchTarget = 48;

  static const Duration mockNetworkDelay = Duration(milliseconds: 900);
  static const Duration splashMinimumDuration = Duration(milliseconds: 1400);

  // SharedPreferences keys.
  static const String prefOnboardingCompleted = 'onboardingCompleted';
  static const String prefIsLoggedIn = 'isLoggedIn';
  static const String prefRememberMe = 'rememberMe';
  static const String prefRegisteredEmail = 'registeredEmail';
  static const String prefRegisteredPassword = 'registeredPassword';
  static const String prefRegisteredFirstName = 'registeredFirstName';
  static const String prefRegisteredLastName = 'registeredLastName';
  static const String prefRegisteredMobile = 'registeredMobile';
  static const String prefCurrentUserEmail = 'currentUserEmail';
  static const String prefRememberedEmail = 'rememberedEmail';
  static const String prefProfilePhotoPath = 'profilePhotoPath';
  static const String prefFileAccessPrimerShown = 'fileAccessPrimerShown';
}
