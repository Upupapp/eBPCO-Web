import 'dart:math';

import '../../../../../core/models/document_model.dart';

final _random = Random();

/// Fabricates a plausible [DocumentModel] the same way the rest of the app
/// simulates uploads (no real file picker, no server) — used by every
/// upload slot in the Building Permit wizard so file names/sizes look
/// realistic.
DocumentModel createMockDocument(String label, {String extension = 'pdf'}) {
  final now = DateTime.now();
  final slug = label
      .toLowerCase()
      .replaceAll(RegExp(r'[^a-z0-9]+'), '_')
      .replaceAll(RegExp(r'^_+|_+$'), '');
  return DocumentModel(
    id: 'doc-${now.microsecondsSinceEpoch}',
    label: label,
    fileName: '$slug.$extension',
    uploadedAt: now,
    fileSizeBytes: 150000 + _random.nextInt(2500000),
  );
}
