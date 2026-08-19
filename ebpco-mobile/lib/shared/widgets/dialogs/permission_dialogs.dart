import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/services/local_storage_service.dart';
import '../../../core/services/permission_service.dart';

/// eBPCO's own privacy-explanation dialog, shown BEFORE the official OS
/// permission prompt the first time (and every subsequent time, since
/// re-showing it costs nothing and keeps the explanation visible) a
/// feature needs camera/photo access. Returns true only if the user taps
/// "Continue".
Future<bool> showPermissionPrimerDialog(
  BuildContext context, {
  required String title,
  required String message,
}) async {
  final result = await showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      title: Text(title),
      content: Text(message),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(false),
          child: const Text('Not Now'),
        ),
        TextButton(
          onPressed: () => Navigator.of(context).pop(true),
          style: TextButton.styleFrom(foregroundColor: AppColors.primary),
          child: const Text('Continue'),
        ),
      ],
    ),
  );
  return result ?? false;
}

/// Shown when permission has already been denied, instead of re-opening
/// the OS prompt (which does nothing once permanently denied, and is
/// simply unhelpful when merely denied) — offers a way to the device
/// Settings screen instead. [message] defaults to generic copy covering
/// camera/photo/file access together; pass a more specific message (e.g.
/// [fileAccessPermissionDeniedMessage]) when the call site only ever
/// requests one of those.
Future<void> showPermissionDeniedDialog(
  BuildContext context, {
  required PermissionService permissionService,
  String message =
      'Camera, photo, or file access is required to use this feature. '
      'You can enable permission from your device settings.',
}) async {
  final openSettings = await showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text('Permission Required'),
      content: Text(message),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(false),
          child: const Text('Cancel'),
        ),
        TextButton(
          onPressed: () => Navigator.of(context).pop(true),
          style: TextButton.styleFrom(foregroundColor: AppColors.primary),
          child: const Text('Open Settings'),
        ),
      ],
    ),
  );
  if (openSettings ?? false) {
    await permissionService.openSettings();
  }
}

/// Orchestrates the full permission flow used everywhere this app needs
/// camera or photo/file access: show eBPCO's own privacy explanation
/// first, then (only if the user agrees) trigger the official OS prompt,
/// then (only if the OS reports permanent denial) offer a way to Settings
/// instead of silently failing or looping the prompt.
///
/// By default the privacy explanation is shown every time permission
/// isn't already granted, since re-showing it costs nothing. Pass
/// [showPrimerOnlyOnce] `true` for flows where it should only ever be
/// shown the first time a device is used (e.g. picking files for permit
/// attachments) — subsequent attempts skip straight to the OS prompt.
Future<AppPermissionStatus> requestPermissionWithPriming(
  BuildContext context, {
  required PermissionService permissionService,
  required AppPermissionKind kind,
  required String primerTitle,
  required String primerMessage,
  String? deniedMessage,
  bool showPrimerOnlyOnce = false,
}) async {
  final currentStatus = await permissionService.status(kind);
  if (currentStatus == AppPermissionStatus.granted) {
    return currentStatus;
  }

  if (currentStatus == AppPermissionStatus.permanentlyDenied) {
    if (!context.mounted) return currentStatus;
    await showPermissionDeniedDialog(
      context,
      permissionService: permissionService,
      message: deniedMessage ?? _defaultDeniedMessage,
    );
    return currentStatus;
  }

  var shouldShowPrimer = true;
  if (showPrimerOnlyOnce) {
    final localStorage = LocalStorageService();
    shouldShowPrimer = !(await localStorage.isFileAccessPrimerShown());
    if (shouldShowPrimer) {
      await localStorage.setFileAccessPrimerShown();
    }
  }

  if (!context.mounted) return currentStatus;
  final agreed = shouldShowPrimer
      ? await showPermissionPrimerDialog(
          context,
          title: primerTitle,
          message: primerMessage,
        )
      : true;
  if (!agreed) return AppPermissionStatus.denied;

  final requested = await permissionService.request(kind);
  if (requested == AppPermissionStatus.permanentlyDenied) {
    if (!context.mounted) return requested;
    await showPermissionDeniedDialog(
      context,
      permissionService: permissionService,
      message: deniedMessage ?? _defaultDeniedMessage,
    );
  }
  return requested;
}

const String _defaultDeniedMessage =
    'Camera, photo, or file access is required to use this feature. '
    'You can enable permission from your device settings.';

const String cameraPermissionPrimerTitle = 'Allow Camera Access';
const String cameraPermissionPrimerMessage =
    'eBPCO needs access to your camera so you can take and upload a '
    'profile photo. Your camera will only be used when you choose the '
    '"Take Photo" option.\n\n'
    'For your privacy, eBPCO will not access or use your camera without '
    'your permission.';

const String photosPermissionPrimerTitle = 'Allow Photos and Files Access';
const String photosPermissionPrimerMessage =
    'eBPCO needs permission to access the photos or documents you select '
    'from your device. The app will only access files that you '
    'personally choose to import.\n\n'
    'For your privacy, eBPCO will not browse, collect, or upload other '
    'files without your permission.';

/// Used specifically by the document-attachment flow (My Documents import
/// and permit-form "Choose from Gallery/Files") rather than
/// [photosPermissionPrimerTitle]/[photosPermissionPrimerMessage] (used by
/// unrelated photo pickers like the profile photo editor), since the two
/// contexts warrant slightly different copy.
const String fileAccessPermissionPrimerTitle = 'Allow File Access';
const String fileAccessPermissionPrimerMessage =
    'eBPCO needs access to the documents you choose from your device so '
    'you can attach them to permit applications.\n\n'
    'For your privacy, eBPCO will only access files that you personally '
    'select. The app will not browse, collect, or upload other files '
    'without your permission.';

const String fileAccessPermissionDeniedMessage =
    'File access is required to select documents for this feature. You '
    'can enable the required permission from your device settings.';
