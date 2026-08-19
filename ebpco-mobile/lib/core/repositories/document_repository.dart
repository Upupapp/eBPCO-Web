import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../models/saved_document_model.dart';

/// Persists "My Documents" metadata as a JSON array in
/// [SharedPreferences] — the same lightweight, dependency-free approach
/// [LocalStorageService] already uses for this frontend prototype's other
/// local state, so this feature doesn't introduce a second persistence
/// mechanism (e.g. a local database) just for itself. The actual file
/// bytes are copied to disk separately by [DocumentStorageService]; this
/// class only stores the metadata that describes them.
class DocumentRepository {
  static const _prefsKey = 'myDocuments';

  Future<SharedPreferences> get _prefs async => SharedPreferences.getInstance();

  Future<List<SavedDocumentModel>> loadAll() async {
    final prefs = await _prefs;
    final raw = prefs.getString(_prefsKey);
    if (raw == null || raw.isEmpty) return [];
    try {
      final decoded = jsonDecode(raw) as List<dynamic>;
      return decoded
          .map((e) => SavedDocumentModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (_) {
      // Corrupted local state should never crash the app — treat it as an
      // empty library rather than propagating a parse error.
      return [];
    }
  }

  Future<void> saveAll(List<SavedDocumentModel> documents) async {
    final prefs = await _prefs;
    final encoded = jsonEncode(documents.map((d) => d.toJson()).toList());
    await prefs.setString(_prefsKey, encoded);
  }
}
