import 'package:flutter/foundation.dart';
import 'package:path/path.dart' as p;

import '../models/saved_document_model.dart';
import '../repositories/document_repository.dart';
import '../services/document_picker_service.dart';
import '../services/document_storage_service.dart';

enum DocumentImportOutcome {
  success,

  /// A document with the same original file name and size already exists
  /// — the caller should confirm with the user before calling
  /// [DocumentsProvider.confirmPendingImport].
  duplicateFound,
  cancelled,
  invalidFile,
  tooLarge,
  error,
}

class DocumentImportResult {
  final DocumentImportOutcome outcome;
  final SavedDocumentModel? document;

  const DocumentImportResult(this.outcome, {this.document});
}

enum DocumentSortOrder {
  newestFirst,
  oldestFirst,
  nameAToZ,
  nameZToA,
  largestFirst,
  smallestFirst,
}

enum DocumentTypeFilter { all, images, pdf }

enum DocumentRecencyFilter { none, recentlyImported, recentlyUsed }

/// Owns the "My Documents" library: loading/persisting metadata via
/// [DocumentRepository], copying picked files into local storage via
/// [DocumentStorageService]/[DocumentPickerService], and exposing the
/// search/filter/sort state the My Documents screen renders from. Uses
/// `ChangeNotifier`/`provider`, matching every other provider in this
/// app — no second state-management approach is introduced.
class DocumentsProvider extends ChangeNotifier {
  DocumentsProvider({
    DocumentRepository? repository,
    DocumentPickerService? pickerService,
    DocumentStorageService? storageService,
  }) : _repository = repository ?? DocumentRepository(),
       _pickerService = pickerService ?? DocumentPickerService(),
       _storageService = storageService ?? DocumentStorageService() {
    _load();
  }

  final DocumentRepository _repository;
  final DocumentPickerService _pickerService;
  final DocumentStorageService _storageService;

  bool _isLoading = true;
  List<SavedDocumentModel> _documents = const [];
  PickedDocumentFile? _pendingImport;

  String _searchQuery = '';
  DocumentTypeFilter _typeFilter = DocumentTypeFilter.all;
  DocumentRecencyFilter _recencyFilter = DocumentRecencyFilter.none;
  SavedDocumentCategory? _categoryFilter;
  DocumentSortOrder _sortOrder = DocumentSortOrder.newestFirst;

  bool get isLoading => _isLoading;
  List<SavedDocumentModel> get allDocuments => _documents;
  String get searchQuery => _searchQuery;
  DocumentTypeFilter get typeFilter => _typeFilter;
  DocumentRecencyFilter get recencyFilter => _recencyFilter;
  SavedDocumentCategory? get categoryFilter => _categoryFilter;
  DocumentSortOrder get sortOrder => _sortOrder;

  bool get hasActiveFilters =>
      _typeFilter != DocumentTypeFilter.all ||
      _recencyFilter != DocumentRecencyFilter.none ||
      _categoryFilter != null;

  Future<void> _load() async {
    _documents = await _repository.loadAll();
    _isLoading = false;
    notifyListeners();
  }

  Future<void> refresh() => _load();

  /// The filtered, searched, and sorted list the screen actually renders.
  List<SavedDocumentModel> get visibleDocuments {
    var results = _documents.where((doc) {
      if (_searchQuery.trim().isNotEmpty) {
        final query = _searchQuery.trim().toLowerCase();
        final matchesName = doc.name.toLowerCase().contains(query);
        final matchesCategory = doc.category.label.toLowerCase().contains(
          query,
        );
        if (!matchesName && !matchesCategory) return false;
      }
      switch (_typeFilter) {
        case DocumentTypeFilter.all:
          break;
        case DocumentTypeFilter.images:
          if (!doc.fileType.isImage) return false;
        case DocumentTypeFilter.pdf:
          if (doc.fileType != SavedDocumentFileType.pdf) return false;
      }
      if (_categoryFilter != null && doc.category != _categoryFilter) {
        return false;
      }
      switch (_recencyFilter) {
        case DocumentRecencyFilter.none:
          break;
        case DocumentRecencyFilter.recentlyImported:
          final cutoff = DateTime.now().subtract(const Duration(days: 7));
          if (doc.dateImported.isBefore(cutoff)) return false;
        case DocumentRecencyFilter.recentlyUsed:
          if (doc.lastUsedDate == null) return false;
          final cutoff = DateTime.now().subtract(const Duration(days: 7));
          if (doc.lastUsedDate!.isBefore(cutoff)) return false;
      }
      return true;
    }).toList();

    results.sort((a, b) {
      switch (_sortOrder) {
        case DocumentSortOrder.newestFirst:
          return b.dateImported.compareTo(a.dateImported);
        case DocumentSortOrder.oldestFirst:
          return a.dateImported.compareTo(b.dateImported);
        case DocumentSortOrder.nameAToZ:
          return a.name.toLowerCase().compareTo(b.name.toLowerCase());
        case DocumentSortOrder.nameZToA:
          return b.name.toLowerCase().compareTo(a.name.toLowerCase());
        case DocumentSortOrder.largestFirst:
          return b.fileSizeBytes.compareTo(a.fileSizeBytes);
        case DocumentSortOrder.smallestFirst:
          return a.fileSizeBytes.compareTo(b.fileSizeBytes);
      }
    });
    return results;
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  void setTypeFilter(DocumentTypeFilter filter) {
    _typeFilter = filter;
    notifyListeners();
  }

  void setRecencyFilter(DocumentRecencyFilter filter) {
    _recencyFilter = filter;
    notifyListeners();
  }

  void setCategoryFilter(SavedDocumentCategory? category) {
    _categoryFilter = category;
    notifyListeners();
  }

  void setSortOrder(DocumentSortOrder order) {
    _sortOrder = order;
    notifyListeners();
  }

  void clearFilters() {
    _typeFilter = DocumentTypeFilter.all;
    _recencyFilter = DocumentRecencyFilter.none;
    _categoryFilter = null;
    notifyListeners();
  }

  SavedDocumentModel? _findDuplicate(PickedDocumentFile picked) {
    final size = picked.file.lengthSync();
    for (final doc in _documents) {
      if (doc.originalFileName == picked.originalFileName &&
          doc.fileSizeBytes == size) {
        return doc;
      }
    }
    return null;
  }

  Future<DocumentImportResult> _handlePicked(DocumentPickResult result) async {
    switch (result.outcome) {
      case DocumentPickOutcome.cancelled:
        return const DocumentImportResult(DocumentImportOutcome.cancelled);
      case DocumentPickOutcome.invalidFile:
        return const DocumentImportResult(DocumentImportOutcome.invalidFile);
      case DocumentPickOutcome.error:
        return const DocumentImportResult(DocumentImportOutcome.error);
      case DocumentPickOutcome.success:
        break;
    }

    final picked = result.picked!;
    final size = await _storageService.fileSize(picked.file);
    if (size > _storageService.maxFileSizeBytes) {
      return const DocumentImportResult(DocumentImportOutcome.tooLarge);
    }

    final duplicate = _findDuplicate(picked);
    if (duplicate != null) {
      _pendingImport = picked;
      return DocumentImportResult(
        DocumentImportOutcome.duplicateFound,
        document: duplicate,
      );
    }

    return _finalizeImport(picked);
  }

  Future<DocumentImportResult> _finalizeImport(
    PickedDocumentFile picked, {
    String? displayName,
  }) async {
    try {
      final saved = await _storageService.saveCopy(
        picked.file,
        originalFileName: picked.originalFileName,
      );
      final size = await saved.length();
      final document = SavedDocumentModel(
        id: 'doc-${DateTime.now().microsecondsSinceEpoch}',
        originalFileName: picked.originalFileName,
        displayName: displayName,
        localPath: saved.path,
        fileType: picked.fileType,
        fileSizeBytes: size,
        dateImported: DateTime.now(),
      );
      _documents = [..._documents, document];
      await _repository.saveAll(_documents);
      notifyListeners();
      return DocumentImportResult(
        DocumentImportOutcome.success,
        document: document,
      );
    } catch (_) {
      return const DocumentImportResult(DocumentImportOutcome.error);
    }
  }

  /// Builds a disambiguated name like "Document (2).pdf" for a confirmed
  /// duplicate import, so two imports of the same file are still
  /// distinguishable in the list instead of showing two identical rows.
  String _duplicateDisplayName(String originalFileName) {
    final extension = p.extension(originalFileName);
    final base = p.basenameWithoutExtension(originalFileName);
    final existingNames = _documents.map((d) => d.name).toSet();
    var copyNumber = 2;
    var candidate = '$base ($copyNumber)$extension';
    while (existingNames.contains(candidate)) {
      copyNumber++;
      candidate = '$base ($copyNumber)$extension';
    }
    return candidate;
  }

  Future<DocumentImportResult> importFromCamera() async =>
      _handlePicked(await _pickerService.pickFromCamera());

  Future<DocumentImportResult> importFromGallery() async =>
      _handlePicked(await _pickerService.pickFromGallery());

  Future<DocumentImportResult> importFromFiles() async =>
      _handlePicked(await _pickerService.pickFromFiles());

  /// Proceeds with importing a copy anyway, after the applicant confirmed
  /// they want a duplicate of [DocumentImportOutcome.duplicateFound].
  Future<DocumentImportResult> confirmPendingImport() async {
    final pending = _pendingImport;
    _pendingImport = null;
    if (pending == null) {
      return const DocumentImportResult(DocumentImportOutcome.error);
    }
    return _finalizeImport(
      pending,
      displayName: _duplicateDisplayName(pending.originalFileName),
    );
  }

  void discardPendingImport() {
    _pendingImport = null;
  }

  Future<void> rename(String id, String newDisplayName) async {
    _documents = [
      for (final doc in _documents)
        if (doc.id == id) doc.copyWith(displayName: newDisplayName) else doc,
    ];
    await _repository.saveAll(_documents);
    notifyListeners();
  }

  Future<void> changeCategory(String id, SavedDocumentCategory category) async {
    _documents = [
      for (final doc in _documents)
        if (doc.id == id) doc.copyWith(category: category) else doc,
    ];
    await _repository.saveAll(_documents);
    notifyListeners();
  }

  /// Marks a document as used just now — called when it's attached to a
  /// permit application via "Choose from My Documents". The document
  /// itself is never removed or duplicated by this.
  Future<void> markUsed(String id) async {
    _documents = [
      for (final doc in _documents)
        if (doc.id == id) doc.copyWith(lastUsedDate: DateTime.now()) else doc,
    ];
    await _repository.saveAll(_documents);
    notifyListeners();
  }

  /// Removes a document from My Documents and deletes its local file.
  /// Never fails just because the underlying file is already missing.
  Future<void> remove(String id) async {
    final target = _documents.where((d) => d.id == id).toList();
    if (target.isEmpty) return;
    await _storageService.deleteFile(target.first.localPath);
    _documents = _documents.where((d) => d.id != id).toList();
    await _repository.saveAll(_documents);
    notifyListeners();
  }

  /// Whether the file backing [document] can still be found on disk —
  /// used to show a friendly "file missing" state instead of crashing.
  Future<bool> fileStillExists(SavedDocumentModel document) =>
      _storageService.fileExists(document.localPath);
}
