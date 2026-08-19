import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path/path.dart' as p;

import '../models/saved_document_model.dart';

enum DocumentPickOutcome { success, cancelled, invalidFile, error }

/// A file the user just picked, before it's been copied into local
/// document storage.
class PickedDocumentFile {
  final File file;
  final String originalFileName;
  final SavedDocumentFileType fileType;

  const PickedDocumentFile({
    required this.file,
    required this.originalFileName,
    required this.fileType,
  });
}

class DocumentPickResult {
  final DocumentPickOutcome outcome;
  final PickedDocumentFile? picked;

  const DocumentPickResult(this.outcome, {this.picked});
}

/// Picks a document from the camera, the gallery, or the system file
/// picker. Only PDF, JPG, JPEG, and PNG are ever accepted — anything else
/// is reported as [DocumentPickOutcome.invalidFile] instead of being
/// silently allowed through.
class DocumentPickerService {
  final ImagePicker _imagePicker;

  DocumentPickerService({ImagePicker? imagePicker})
    : _imagePicker = imagePicker ?? ImagePicker();

  DocumentPickResult _fromImagePickerFile(XFile? picked) {
    if (picked == null) {
      return const DocumentPickResult(DocumentPickOutcome.cancelled);
    }
    final extension = p.extension(picked.path);
    final fileType = SavedDocumentFileTypeX.fromExtension(extension);
    if (fileType == null || !fileType.isImage) {
      return const DocumentPickResult(DocumentPickOutcome.invalidFile);
    }
    return DocumentPickResult(
      DocumentPickOutcome.success,
      picked: PickedDocumentFile(
        file: File(picked.path),
        originalFileName: p.basename(picked.path),
        fileType: fileType,
      ),
    );
  }

  Future<DocumentPickResult> pickFromCamera() async {
    try {
      final picked = await _imagePicker.pickImage(
        source: ImageSource.camera,
        maxWidth: 2000,
        maxHeight: 2000,
        imageQuality: 90,
      );
      return _fromImagePickerFile(picked);
    } catch (_) {
      return const DocumentPickResult(DocumentPickOutcome.error);
    }
  }

  Future<DocumentPickResult> pickFromGallery() async {
    try {
      final picked = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 2000,
        maxHeight: 2000,
        imageQuality: 90,
      );
      return _fromImagePickerFile(picked);
    } catch (_) {
      return const DocumentPickResult(DocumentPickOutcome.error);
    }
  }

  Future<DocumentPickResult> pickFromFiles() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: const ['pdf', 'jpg', 'jpeg', 'png'],
        withData: false,
      );
      if (result == null || result.files.isEmpty) {
        return const DocumentPickResult(DocumentPickOutcome.cancelled);
      }
      final pickedFile = result.files.single;
      final path = pickedFile.path;
      if (path == null) {
        return const DocumentPickResult(DocumentPickOutcome.invalidFile);
      }
      final fileType = SavedDocumentFileTypeX.fromExtension(
        p.extension(path),
      );
      if (fileType == null) {
        return const DocumentPickResult(DocumentPickOutcome.invalidFile);
      }
      final file = File(path);
      if (!await file.exists()) {
        return const DocumentPickResult(DocumentPickOutcome.invalidFile);
      }
      return DocumentPickResult(
        DocumentPickOutcome.success,
        picked: PickedDocumentFile(
          file: file,
          originalFileName: pickedFile.name,
          fileType: fileType,
        ),
      );
    } catch (_) {
      return const DocumentPickResult(DocumentPickOutcome.error);
    }
  }
}
