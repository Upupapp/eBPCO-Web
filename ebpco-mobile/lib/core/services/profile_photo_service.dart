import 'dart:io';

import 'package:image_picker/image_picker.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

/// Result of a profile photo capture/pick attempt.
enum ProfilePhotoPickOutcome { success, cancelled, invalidFile, error }

class ProfilePhotoPickResult {
  final ProfilePhotoPickOutcome outcome;
  final File? file;

  const ProfilePhotoPickResult(this.outcome, {this.file});
}

/// Captures/picks a profile photo and persists it under the app's own
/// documents directory (never anywhere outside app-local storage), so it
/// survives app restarts. Only one profile photo is ever kept on disk —
/// each new photo overwrites the previous file.
class ProfilePhotoService {
  static const _fileName = 'profile_photo.jpg';
  static const _allowedExtensions = {'.jpg', '.jpeg', '.png'};

  final ImagePicker _picker;

  ProfilePhotoService({ImagePicker? picker}) : _picker = picker ?? ImagePicker();

  Future<Directory> _profileDir() async {
    final docsDir = await getApplicationDocumentsDirectory();
    final dir = Directory(p.join(docsDir.path, 'profile_photo'));
    if (!await dir.exists()) {
      await dir.create(recursive: true);
    }
    return dir;
  }

  Future<String> _destinationPath() async {
    final dir = await _profileDir();
    return p.join(dir.path, _fileName);
  }

  Future<ProfilePhotoPickResult> _pick(ImageSource source) async {
    try {
      final picked = await _picker.pickImage(
        source: source,
        // Caps resolution/quality at pick time — the simplest reliable way
        // to keep very large camera/gallery images from being saved
        // at their full, unnecessarily large size.
        maxWidth: 1600,
        maxHeight: 1600,
        imageQuality: 85,
      );
      if (picked == null) {
        return const ProfilePhotoPickResult(ProfilePhotoPickOutcome.cancelled);
      }

      final extension = p.extension(picked.path).toLowerCase();
      if (!_allowedExtensions.contains(extension)) {
        return const ProfilePhotoPickResult(
          ProfilePhotoPickOutcome.invalidFile,
        );
      }

      final sourceFile = File(picked.path);
      if (!await sourceFile.exists()) {
        return const ProfilePhotoPickResult(
          ProfilePhotoPickOutcome.invalidFile,
        );
      }

      final destinationPath = await _destinationPath();
      // Overwrite any previous profile photo — only one is ever kept.
      final saved = await sourceFile.copy(destinationPath);
      return ProfilePhotoPickResult(
        ProfilePhotoPickOutcome.success,
        file: saved,
      );
    } catch (_) {
      return const ProfilePhotoPickResult(ProfilePhotoPickOutcome.error);
    }
  }

  Future<ProfilePhotoPickResult> takePhoto() => _pick(ImageSource.camera);

  Future<ProfilePhotoPickResult> chooseFromGallery() =>
      _pick(ImageSource.gallery);

  /// Deletes the saved profile photo file, if any. Safe to call even when
  /// no photo was ever saved.
  Future<void> removeSavedPhoto() async {
    final path = await _destinationPath();
    final file = File(path);
    if (await file.exists()) {
      await file.delete();
    }
  }
}
