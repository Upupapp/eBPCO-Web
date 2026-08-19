import 'package:permission_handler/permission_handler.dart';

/// The device capabilities this app ever requests permission for. Kept as
/// an app-level enum (rather than exposing `package:permission_handler`
/// types everywhere) so call sites don't need to know which underlying
/// platform permission backs a given feature.
enum AppPermissionKind { camera, photos }

/// Outcome of a permission check or request.
enum AppPermissionStatus {
  granted,
  denied,

  /// The user denied permission and checked "Don't ask again" (Android) or
  /// has denied it enough times that the OS stops prompting (iOS) — the
  /// only way forward is the device Settings app.
  permanentlyDenied,

  /// The capability isn't available on this device at all (e.g. no
  /// camera hardware) or the OS restricts it (e.g. parental controls).
  unavailable,
}

/// Thin wrapper around `package:permission_handler` so the rest of the app
/// depends on [AppPermissionKind]/[AppPermissionStatus] instead of the
/// plugin's types directly, and so permission logic lives in one place
/// instead of being duplicated at every call site.
class PermissionService {
  Permission _permissionFor(AppPermissionKind kind) {
    switch (kind) {
      case AppPermissionKind.camera:
        return Permission.camera;
      case AppPermissionKind.photos:
        return Permission.photos;
    }
  }

  AppPermissionStatus _map(PermissionStatus status) {
    if (status.isGranted || status.isLimited) return AppPermissionStatus.granted;
    if (status.isPermanentlyDenied) return AppPermissionStatus.permanentlyDenied;
    if (status.isRestricted) return AppPermissionStatus.unavailable;
    return AppPermissionStatus.denied;
  }

  Future<AppPermissionStatus> status(AppPermissionKind kind) async {
    final status = await _permissionFor(kind).status;
    return _map(status);
  }

  /// Requests the underlying platform permission. Call only after the
  /// user has already seen and accepted this app's own privacy priming
  /// dialog — this triggers the official OS prompt.
  Future<AppPermissionStatus> request(AppPermissionKind kind) async {
    final status = await _permissionFor(kind).request();
    return _map(status);
  }

  /// Opens the device's app-specific Settings screen, for when permission
  /// has been permanently denied and only the user can re-enable it.
  Future<bool> openSettings() => openAppSettings();
}
