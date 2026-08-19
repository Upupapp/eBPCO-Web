/// Represents one attached file — used both for permit requirement
/// uploads and proof-of-payment uploads. Most call sites still fabricate
/// a mock filename when the user taps upload (no real file picking), but
/// [filePath] is optionally set when a real file was picked (camera,
/// gallery, device files, or an existing "My Documents" item), so a
/// preview action can open the real file when one exists.
class DocumentModel {
  final String id;
  final String label;
  final String fileName;
  final DateTime uploadedAt;
  final int? fileSizeBytes;

  /// Absolute path to the real file backing this attachment, if any. Null
  /// for the mock/fabricated documents used everywhere else in the app.
  final String? filePath;

  const DocumentModel({
    required this.id,
    required this.label,
    required this.fileName,
    required this.uploadedAt,
    this.fileSizeBytes,
    this.filePath,
  });
}
