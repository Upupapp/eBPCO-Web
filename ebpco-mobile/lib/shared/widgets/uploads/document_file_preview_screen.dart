import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_pdfview/flutter_pdfview.dart';
import 'package:path/path.dart' as p;

import '../../../core/constants/app_constants.dart';
import '../../../core/models/document_model.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../states/error_state.dart';

const _imageExtensions = {'.jpg', '.jpeg', '.png'};

/// Full-screen preview for a permit upload slot's attached [document] —
/// works for any real picked file (camera/gallery/files/My Documents),
/// unlike `DocumentPreviewScreen` which is specific to saved "My
/// Documents" library entries.
class DocumentFilePreviewScreen extends StatefulWidget {
  final DocumentModel document;

  const DocumentFilePreviewScreen({super.key, required this.document});

  @override
  State<DocumentFilePreviewScreen> createState() =>
      _DocumentFilePreviewScreenState();
}

class _DocumentFilePreviewScreenState extends State<DocumentFilePreviewScreen> {
  bool _fileMissing = false;
  bool _pdfFailedToRender = false;

  @override
  void initState() {
    super.initState();
    final path = widget.document.filePath;
    if (path == null || !File(path).existsSync()) {
      _fileMissing = true;
    }
  }

  Widget _buildPreview() {
    final path = widget.document.filePath;
    if (_fileMissing || path == null) {
      return const ErrorState(
        icon: Icons.error_outline,
        title: 'File Not Available',
        message:
            'This file has been deleted, moved, or is no longer readable.',
      );
    }

    final extension = p.extension(path).toLowerCase();
    if (_imageExtensions.contains(extension)) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(AppConstants.borderRadiusMedium),
        child: Image.file(
          File(path),
          fit: BoxFit.contain,
          errorBuilder: (context, error, stackTrace) => const ErrorState(
            icon: Icons.broken_image_outlined,
            title: 'File Not Available',
            message:
                'This file has been deleted, moved, or is no longer '
                'readable.',
          ),
        ),
      );
    }

    if (extension == '.pdf') {
      if (_pdfFailedToRender) {
        return const ErrorState(
          icon: Icons.error_outline,
          title: 'File Not Available',
          message: 'This PDF has been deleted, moved, or is no longer readable.',
        );
      }
      return ClipRRect(
        borderRadius: BorderRadius.circular(AppConstants.borderRadiusMedium),
        child: PDFView(
          filePath: path,
          fitPolicy: FitPolicy.WIDTH,
          onError: (error) => setState(() => _pdfFailedToRender = true),
          onPageError: (page, error) =>
              setState(() => _pdfFailedToRender = true),
        ),
      );
    }

    return const ErrorState(
      icon: Icons.insert_drive_file_outlined,
      title: 'Preview Unavailable',
      message: 'This file type can\'t be previewed here.',
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.document.fileName, overflow: TextOverflow.ellipsis),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppConstants.screenPaddingHorizontal),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(child: _buildPreview()),
              const SizedBox(height: AppSpacing.md),
              Text(widget.document.label, style: AppTypography.caption),
            ],
          ),
        ),
      ),
    );
  }
}
