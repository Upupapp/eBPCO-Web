import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:path/path.dart' as p;
import 'package:shared_preferences/shared_preferences.dart';

import 'package:ebpco_user_app/core/models/saved_document_model.dart';
import 'package:ebpco_user_app/core/providers/documents_provider.dart';
import 'package:ebpco_user_app/core/repositories/document_repository.dart';
import 'package:ebpco_user_app/core/services/document_picker_service.dart';
import 'package:ebpco_user_app/core/services/document_storage_service.dart';

/// Returns canned [DocumentPickResult]s instead of touching the real
/// camera/gallery/file-picker plugins, which have no platform channel
/// available under `flutter test`.
class _FakeDocumentPickerService extends DocumentPickerService {
  DocumentPickResult filesResult = const DocumentPickResult(
    DocumentPickOutcome.cancelled,
  );

  @override
  Future<DocumentPickResult> pickFromCamera() async => filesResult;

  @override
  Future<DocumentPickResult> pickFromGallery() async => filesResult;

  @override
  Future<DocumentPickResult> pickFromFiles() async => filesResult;
}

/// Copies into a real temp directory instead of the app documents
/// directory `path_provider` would normally resolve — real file I/O
/// (available under `flutter test`), just redirected away from a plugin.
class _FakeDocumentStorageService extends DocumentStorageService {
  final Directory tempDir;

  _FakeDocumentStorageService(this.tempDir);

  @override
  Future<File> saveCopy(
    File source, {
    required String originalFileName,
  }) async {
    final uniqueName =
        'doc_${DateTime.now().microsecondsSinceEpoch}_$originalFileName';
    final destination = p.join(tempDir.path, uniqueName);
    return source.copy(destination);
  }
}

PickedDocumentFile _pickedFile(File file, String name, SavedDocumentFileType type) {
  return PickedDocumentFile(file: file, originalFileName: name, fileType: type);
}

void main() {
  late Directory sourceDir;
  late Directory storageDir;
  late _FakeDocumentPickerService pickerService;
  late DocumentsProvider provider;

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    sourceDir = await Directory.systemTemp.createTemp('docs_source_');
    storageDir = await Directory.systemTemp.createTemp('docs_storage_');
    pickerService = _FakeDocumentPickerService();
    provider = DocumentsProvider(
      repository: DocumentRepository(),
      pickerService: pickerService,
      storageService: _FakeDocumentStorageService(storageDir),
    );
    // Let the constructor's initial `_load()` finish before each test runs.
    await Future<void>.delayed(Duration.zero);
  });

  tearDown(() async {
    if (await sourceDir.exists()) await sourceDir.delete(recursive: true);
    if (await storageDir.exists()) await storageDir.delete(recursive: true);
  });

  Future<File> writeSourceFile(String name, List<int> bytes) async {
    final file = File(p.join(sourceDir.path, name));
    await file.writeAsBytes(bytes);
    return file;
  }

  group('importFromFiles', () {
    test('starts with an empty library', () {
      expect(provider.allDocuments, isEmpty);
      expect(provider.isLoading, isFalse);
    });

    test('imports a new file successfully', () async {
      final file = await writeSourceFile('id.jpg', [1, 2, 3, 4]);
      pickerService.filesResult = DocumentPickResult(
        DocumentPickOutcome.success,
        picked: _pickedFile(file, 'id.jpg', SavedDocumentFileType.jpg),
      );

      final result = await provider.importFromFiles();

      expect(result.outcome, DocumentImportOutcome.success);
      expect(provider.allDocuments, hasLength(1));
      expect(provider.allDocuments.single.originalFileName, 'id.jpg');
      expect(provider.allDocuments.single.fileSizeBytes, 4);
      expect(
        await File(provider.allDocuments.single.localPath).exists(),
        isTrue,
        reason: 'the picked file should be copied into local storage',
      );
    });

    test('reports cancelled without adding anything', () async {
      pickerService.filesResult = const DocumentPickResult(
        DocumentPickOutcome.cancelled,
      );

      final result = await provider.importFromFiles();

      expect(result.outcome, DocumentImportOutcome.cancelled);
      expect(provider.allDocuments, isEmpty);
    });

    test('reports invalidFile for an unsupported extension', () async {
      pickerService.filesResult = const DocumentPickResult(
        DocumentPickOutcome.invalidFile,
      );

      final result = await provider.importFromFiles();

      expect(result.outcome, DocumentImportOutcome.invalidFile);
      expect(provider.allDocuments, isEmpty);
    });

    test(
      'detects a duplicate by name+size and only imports after confirmation',
      () async {
        final first = await writeSourceFile('receipt.pdf', [9, 9, 9]);
        pickerService.filesResult = DocumentPickResult(
          DocumentPickOutcome.success,
          picked: _pickedFile(first, 'receipt.pdf', SavedDocumentFileType.pdf),
        );
        await provider.importFromFiles();
        expect(provider.allDocuments, hasLength(1));

        final second = await writeSourceFile(
          'receipt_copy.pdf',
          [9, 9, 9], // same size, same original name below
        );
        pickerService.filesResult = DocumentPickResult(
          DocumentPickOutcome.success,
          picked: _pickedFile(
            second,
            'receipt.pdf', // same original name as the first import
            SavedDocumentFileType.pdf,
          ),
        );

        final duplicateResult = await provider.importFromFiles();
        expect(duplicateResult.outcome, DocumentImportOutcome.duplicateFound);
        expect(
          provider.allDocuments,
          hasLength(1),
          reason: 'nothing should be added until the duplicate is confirmed',
        );

        final confirmed = await provider.confirmPendingImport();
        expect(confirmed.outcome, DocumentImportOutcome.success);
        expect(provider.allDocuments, hasLength(2));
      },
    );

    test('discardPendingImport leaves the library untouched', () async {
      final first = await writeSourceFile('logbook.pdf', [1, 2]);
      pickerService.filesResult = DocumentPickResult(
        DocumentPickOutcome.success,
        picked: _pickedFile(first, 'logbook.pdf', SavedDocumentFileType.pdf),
      );
      await provider.importFromFiles();

      final second = await writeSourceFile('logbook2.pdf', [1, 2]);
      pickerService.filesResult = DocumentPickResult(
        DocumentPickOutcome.success,
        picked: _pickedFile(second, 'logbook.pdf', SavedDocumentFileType.pdf),
      );
      final duplicateResult = await provider.importFromFiles();
      expect(duplicateResult.outcome, DocumentImportOutcome.duplicateFound);

      provider.discardPendingImport();
      final confirmedAfterDiscard = await provider.confirmPendingImport();
      expect(confirmedAfterDiscard.outcome, DocumentImportOutcome.error);
      expect(provider.allDocuments, hasLength(1));
    });
  });

  group('rename, changeCategory, markUsed, remove', () {
    Future<SavedDocumentModel> importOne(String name) async {
      final file = await writeSourceFile(name, [1, 2, 3]);
      pickerService.filesResult = DocumentPickResult(
        DocumentPickOutcome.success,
        picked: _pickedFile(file, name, SavedDocumentFileType.pdf),
      );
      final result = await provider.importFromFiles();
      return result.document!;
    }

    test('rename updates the display name and is reflected in name', () async {
      final doc = await importOne('barangay_clearance.pdf');
      await provider.rename(doc.id, 'Barangay Clearance 2026');
      final updated = provider.allDocuments.single;
      expect(updated.name, 'Barangay Clearance 2026');
      expect(updated.originalFileName, 'barangay_clearance.pdf');
    });

    test('changeCategory updates the stored category', () async {
      final doc = await importOne('tax.pdf');
      await provider.changeCategory(doc.id, SavedDocumentCategory.taxDocument);
      expect(
        provider.allDocuments.single.category,
        SavedDocumentCategory.taxDocument,
      );
    });

    test('markUsed sets lastUsedDate without changing anything else', () async {
      final doc = await importOne('authorization.pdf');
      expect(provider.allDocuments.single.lastUsedDate, isNull);
      await provider.markUsed(doc.id);
      expect(provider.allDocuments.single.lastUsedDate, isNotNull);
    });

    test('remove deletes both the metadata entry and the local file', () async {
      final doc = await importOne('property.pdf');
      final localPath = provider.allDocuments.single.localPath;
      expect(await File(localPath).exists(), isTrue);

      await provider.remove(doc.id);

      expect(provider.allDocuments, isEmpty);
      expect(await File(localPath).exists(), isFalse);
    });

    test('remove is a no-op for an unknown id (never throws)', () async {
      await importOne('supporting.pdf');
      await provider.remove('does-not-exist');
      expect(provider.allDocuments, hasLength(1));
    });
  });

  group('search, filter, and sort', () {
    Future<void> importNamed(
      String name,
      SavedDocumentFileType type,
      List<int> bytes,
    ) async {
      final file = await writeSourceFile(name, bytes);
      pickerService.filesResult = DocumentPickResult(
        DocumentPickOutcome.success,
        picked: _pickedFile(file, name, type),
      );
      await provider.importFromFiles();
    }

    setUp(() async {
      await importNamed('alpha_id.jpg', SavedDocumentFileType.jpg, [1, 2, 3]);
      await importNamed(
        'beta_clearance.pdf',
        SavedDocumentFileType.pdf,
        [1, 2, 3, 4, 5],
      );
      await importNamed(
        'gamma_receipt.png',
        SavedDocumentFileType.png,
        [1],
      );
    });

    test('search matches by file name (case-insensitive)', () {
      provider.setSearchQuery('BETA');
      expect(provider.visibleDocuments, hasLength(1));
      expect(provider.visibleDocuments.single.originalFileName, 'beta_clearance.pdf');
    });

    test('type filter narrows to images or PDFs only', () {
      provider.setTypeFilter(DocumentTypeFilter.pdf);
      expect(provider.visibleDocuments, hasLength(1));
      expect(provider.visibleDocuments.single.fileType, SavedDocumentFileType.pdf);

      provider.setTypeFilter(DocumentTypeFilter.images);
      expect(provider.visibleDocuments, hasLength(2));
      expect(provider.visibleDocuments.every((d) => d.fileType.isImage), isTrue);
    });

    test('sortOrder nameAToZ / nameZToA order results by name', () {
      provider.setSortOrder(DocumentSortOrder.nameAToZ);
      expect(
        provider.visibleDocuments.map((d) => d.originalFileName).toList(),
        ['alpha_id.jpg', 'beta_clearance.pdf', 'gamma_receipt.png'],
      );

      provider.setSortOrder(DocumentSortOrder.nameZToA);
      expect(
        provider.visibleDocuments.map((d) => d.originalFileName).toList(),
        ['gamma_receipt.png', 'beta_clearance.pdf', 'alpha_id.jpg'],
      );
    });

    test('sortOrder largestFirst / smallestFirst order results by size', () {
      provider.setSortOrder(DocumentSortOrder.largestFirst);
      expect(
        provider.visibleDocuments.first.originalFileName,
        'beta_clearance.pdf',
      );

      provider.setSortOrder(DocumentSortOrder.smallestFirst);
      expect(
        provider.visibleDocuments.first.originalFileName,
        'gamma_receipt.png',
      );
    });

    test('clearFilters resets type/recency/category filters', () {
      provider.setTypeFilter(DocumentTypeFilter.pdf);
      provider.setCategoryFilter(SavedDocumentCategory.taxDocument);
      expect(provider.hasActiveFilters, isTrue);

      provider.clearFilters();
      expect(provider.hasActiveFilters, isFalse);
      expect(provider.visibleDocuments, hasLength(3));
    });
  });

  test('persists across a fresh provider instance backed by the same repository', () async {
    final file = await writeSourceFile('persisted.pdf', [1, 2, 3]);
    pickerService.filesResult = DocumentPickResult(
      DocumentPickOutcome.success,
      picked: _pickedFile(file, 'persisted.pdf', SavedDocumentFileType.pdf),
    );
    await provider.importFromFiles();

    final reloaded = DocumentsProvider(
      repository: DocumentRepository(),
      pickerService: _FakeDocumentPickerService(),
      storageService: _FakeDocumentStorageService(storageDir),
    );
    await Future<void>.delayed(Duration.zero);

    expect(reloaded.allDocuments, hasLength(1));
    expect(reloaded.allDocuments.single.originalFileName, 'persisted.pdf');
  });
}
