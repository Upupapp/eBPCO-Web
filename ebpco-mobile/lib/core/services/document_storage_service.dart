import 'dart:io';

import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

/// Copies picked documents into the app's own local storage (never
/// anywhere outside it) and cleans them up on removal. Each saved file
/// gets a unique on-disk name so re-importing a same-named file never
/// overwrites an existing one.
class DocumentStorageService {
  static const _maxSizeBytes = 25 * 1024 * 1024; // 25 MB

  int get maxFileSizeBytes => _maxSizeBytes;

  Future<Directory> _documentsDir() async {
    final docsDir = await getApplicationDocumentsDirectory();
    final dir = Directory(p.join(docsDir.path, 'my_documents'));
    if (!await dir.exists()) {
      await dir.create(recursive: true);
    }
    return dir;
  }

  /// Copies [source] into local document storage under a unique file
  /// name, preserving its original extension. Returns the saved [File].
  Future<File> saveCopy(File source, {required String originalFileName}) async {
    final dir = await _documentsDir();
    final extension = p.extension(originalFileName);
    final uniqueName =
        'doc_${DateTime.now().microsecondsSinceEpoch}$extension';
    final destination = p.join(dir.path, uniqueName);
    return source.copy(destination);
  }

  Future<int> fileSize(File file) => file.length();

  Future<void> deleteFile(String path) async {
    final file = File(path);
    if (await file.exists()) {
      await file.delete();
    }
  }

  Future<bool> fileExists(String path) => File(path).exists();
}
