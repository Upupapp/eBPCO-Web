import 'package:flutter_test/flutter_test.dart';

import 'package:ebpco_user_app/core/models/saved_document_model.dart';

void main() {
  group('SavedDocumentFileTypeX.fromExtension', () {
    test('recognizes every supported extension, case-insensitively', () {
      expect(
        SavedDocumentFileTypeX.fromExtension('.PDF'),
        SavedDocumentFileType.pdf,
      );
      expect(
        SavedDocumentFileTypeX.fromExtension('jpg'),
        SavedDocumentFileType.jpg,
      );
      expect(
        SavedDocumentFileTypeX.fromExtension('.jpeg'),
        SavedDocumentFileType.jpeg,
      );
      expect(
        SavedDocumentFileTypeX.fromExtension('.png'),
        SavedDocumentFileType.png,
      );
    });

    test('returns null for an unsupported extension', () {
      expect(SavedDocumentFileTypeX.fromExtension('.docx'), isNull);
      expect(SavedDocumentFileTypeX.fromExtension('.exe'), isNull);
    });

    test('only PDF is reported as non-image', () {
      expect(SavedDocumentFileType.pdf.isImage, isFalse);
      expect(SavedDocumentFileType.jpg.isImage, isTrue);
      expect(SavedDocumentFileType.jpeg.isImage, isTrue);
      expect(SavedDocumentFileType.png.isImage, isTrue);
    });
  });

  group('SavedDocumentModel', () {
    final baseDocument = SavedDocumentModel(
      id: 'doc-1',
      originalFileName: 'valid_id.jpg',
      localPath: '/app/documents/doc_1.jpg',
      fileType: SavedDocumentFileType.jpg,
      fileSizeBytes: 204800,
      dateImported: DateTime(2026, 1, 15),
    );

    test('name falls back to originalFileName when no displayName is set', () {
      expect(baseDocument.name, 'valid_id.jpg');
    });

    test('name prefers a non-empty displayName over originalFileName', () {
      final renamed = baseDocument.copyWith(displayName: 'My Valid ID');
      expect(renamed.name, 'My Valid ID');
    });

    test('defaults to Uncategorized when no category is given', () {
      expect(baseDocument.category, SavedDocumentCategory.uncategorized);
    });

    test('copyWith only changes the requested fields', () {
      final updated = baseDocument.copyWith(
        category: SavedDocumentCategory.validGovernmentId,
      );
      expect(updated.id, baseDocument.id);
      expect(updated.localPath, baseDocument.localPath);
      expect(updated.category, SavedDocumentCategory.validGovernmentId);
      expect(updated.displayName, isNull);
    });

    test('round-trips through JSON without losing data', () {
      final withEverything = baseDocument.copyWith(
        displayName: 'My Valid ID',
        category: SavedDocumentCategory.validGovernmentId,
        lastUsedDate: DateTime(2026, 2, 1),
      );

      final decoded = SavedDocumentModel.fromJson(withEverything.toJson());

      expect(decoded.id, withEverything.id);
      expect(decoded.originalFileName, withEverything.originalFileName);
      expect(decoded.displayName, withEverything.displayName);
      expect(decoded.localPath, withEverything.localPath);
      expect(decoded.fileType, withEverything.fileType);
      expect(decoded.fileSizeBytes, withEverything.fileSizeBytes);
      expect(decoded.dateImported, withEverything.dateImported);
      expect(decoded.lastUsedDate, withEverything.lastUsedDate);
      expect(decoded.category, withEverything.category);
    });

    test('round-trips a document with no optional fields set', () {
      final decoded = SavedDocumentModel.fromJson(baseDocument.toJson());
      expect(decoded.displayName, isNull);
      expect(decoded.lastUsedDate, isNull);
      expect(decoded.category, SavedDocumentCategory.uncategorized);
    });
  });
}
