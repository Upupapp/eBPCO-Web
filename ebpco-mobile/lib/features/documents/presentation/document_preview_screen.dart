import 'package:flutter/material.dart';
import 'package:flutter_pdfview/flutter_pdfview.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/models/saved_document_model.dart';
import '../../../core/providers/documents_provider.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/buttons/primary_button.dart';
import '../../../shared/widgets/cards/app_card.dart';
import '../../../shared/widgets/dialogs/confirmation_dialog.dart';
import '../../../shared/widgets/states/error_state.dart';
import '../../../shared/widgets/states/loading_view.dart';
import '../../../shared/widgets/text_fields/app_text_field.dart';
import 'widgets/category_picker_sheet.dart';
import 'widgets/document_card.dart';

/// Shows one saved document full-screen: its preview (image or PDF),
/// metadata, and management actions. When [selectionMode] is true, "Use
/// Document" returns the document to the caller (a permit's document
/// upload step) instead of just being informational.
class DocumentPreviewScreen extends StatefulWidget {
  final String documentId;
  final bool selectionMode;

  const DocumentPreviewScreen({
    super.key,
    required this.documentId,
    this.selectionMode = false,
  });

  @override
  State<DocumentPreviewScreen> createState() => _DocumentPreviewScreenState();
}

class _DocumentPreviewScreenState extends State<DocumentPreviewScreen> {
  bool _checkingFile = true;
  bool _fileMissing = false;
  bool _pdfFailedToRender = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _checkFileExists());
  }

  Future<void> _checkFileExists() async {
    final provider = context.read<DocumentsProvider>();
    final document = _findDocument(provider);
    if (document == null) {
      setState(() {
        _checkingFile = false;
        _fileMissing = true;
      });
      return;
    }
    final exists = await provider.fileStillExists(document);
    if (!mounted) return;
    setState(() {
      _checkingFile = false;
      _fileMissing = !exists;
    });
  }

  SavedDocumentModel? _findDocument(DocumentsProvider provider) {
    for (final doc in provider.allDocuments) {
      if (doc.id == widget.documentId) return doc;
    }
    return null;
  }

  void _showMessage(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _handleUseDocument(
    DocumentsProvider provider,
    SavedDocumentModel document,
  ) async {
    if (widget.selectionMode) {
      await provider.markUsed(document.id);
      if (!mounted) return;
      final updated = _findDocument(provider) ?? document;
      Navigator.of(context).pop(updated);
      return;
    }
    _showMessage(
      'Open a permit application\'s document upload, then choose '
      '"Choose from My Documents" to use this file.',
    );
  }

  Future<void> _handleRename(
    DocumentsProvider provider,
    SavedDocumentModel document,
  ) async {
    final controller = TextEditingController(text: document.name);
    final newName = await showDialog<String>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Rename Document'),
        content: AppTextField(controller: controller, label: 'Document Name'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () =>
                Navigator.of(dialogContext).pop(controller.text.trim()),
            child: const Text('Save'),
          ),
        ],
      ),
    );
    // Not disposed here: the dialog's exit transition can still be
    // animating out (with this controller's TextFormField still attached)
    // for a frame or two after `showDialog` resolves, so disposing
    // immediately races with that animation and throws "used after being
    // disposed". This controller is small and short-lived (one dialog),
    // so it's left for garbage collection instead.
    if (newName == null || newName.isEmpty) return;
    await provider.rename(document.id, newName);
  }

  Future<void> _handleChangeCategory(
    DocumentsProvider provider,
    SavedDocumentModel document,
  ) async {
    final category = await showCategoryPickerSheet(
      context,
      current: document.category,
    );
    if (category == null) return;
    await provider.changeCategory(document.id, category);
  }

  Future<void> _handleRemove(
    DocumentsProvider provider,
    SavedDocumentModel document,
  ) async {
    final confirmed = await ConfirmationDialog.show(
      context,
      title: 'Remove Document?',
      message:
          'This document will be removed from My Documents. Existing '
          'submitted applications that already use this document will '
          'not be affected.',
      confirmLabel: 'Remove',
      isDestructive: true,
    );
    if (!confirmed) return;
    await provider.remove(document.id);
    if (mounted) {
      _showMessage('Document removed successfully.');
      Navigator.of(context).pop();
    }
  }

  Future<void> _handleAction(
    DocumentsProvider provider,
    SavedDocumentModel document,
    DocumentCardAction action,
  ) async {
    switch (action) {
      case DocumentCardAction.preview:
        break;
      case DocumentCardAction.rename:
        await _handleRename(provider, document);
      case DocumentCardAction.changeCategory:
        await _handleChangeCategory(provider, document);
      case DocumentCardAction.useForApplication:
        await _handleUseDocument(provider, document);
      case DocumentCardAction.viewInfo:
        _showFileInfo(document);
      case DocumentCardAction.remove:
        await _handleRemove(provider, document);
    }
  }

  void _showFileInfo(SavedDocumentModel document) {
    showDialog<void>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('File Information'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _InfoLine('Name', document.name),
            _InfoLine('Original File Name', document.originalFileName),
            _InfoLine('Type', document.fileType.label),
            _InfoLine('Size', formatFileSize(document.fileSizeBytes)),
            _InfoLine('Category', document.category.label),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Widget _buildPreview(SavedDocumentModel document) {
    if (_fileMissing) {
      return const ErrorState(
        icon: Icons.error_outline,
        title: 'File Not Available',
        message:
            'This file has been deleted, moved, or is no longer readable.',
      );
    }
    if (document.fileType.isImage) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(AppConstants.borderRadiusMedium),
        child: Image.file(
          document.file,
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

    if (_pdfFailedToRender) {
      return const ErrorState(
        icon: Icons.error_outline,
        title: 'File Not Available',
        message:
            'This PDF has been deleted, moved, or is no longer readable.',
      );
    }
    return ClipRRect(
      borderRadius: BorderRadius.circular(AppConstants.borderRadiusMedium),
      child: PDFView(
        filePath: document.localPath,
        fitPolicy: FitPolicy.WIDTH,
        onError: (error) => setState(() => _pdfFailedToRender = true),
        onPageError: (page, error) =>
            setState(() => _pdfFailedToRender = true),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<DocumentsProvider>(
      builder: (context, provider, _) {
        final document = _findDocument(provider);

        if (document == null) {
          return Scaffold(
            appBar: AppBar(title: const Text('Document')),
            body: const ErrorState(
              title: 'File Not Available',
              message:
                  'This document has been deleted, moved, or is no longer '
                  'readable.',
            ),
          );
        }

        return Scaffold(
          appBar: AppBar(
            title: Text(document.name, overflow: TextOverflow.ellipsis),
            actions: [
              PopupMenuButton<DocumentCardAction>(
                onSelected: (action) =>
                    _handleAction(provider, document, action),
                itemBuilder: (context) => [
                  const PopupMenuItem(
                    value: DocumentCardAction.rename,
                    child: Text('Rename'),
                  ),
                  const PopupMenuItem(
                    value: DocumentCardAction.changeCategory,
                    child: Text('Change Category'),
                  ),
                  const PopupMenuItem(
                    value: DocumentCardAction.viewInfo,
                    child: Text('View File Information'),
                  ),
                  const PopupMenuItem(
                    value: DocumentCardAction.remove,
                    child: Text(
                      'Remove from My Documents',
                      style: TextStyle(color: AppColors.error),
                    ),
                  ),
                ],
              ),
            ],
          ),
          body: SafeArea(
            child: _checkingFile
                ? const LoadingView()
                : Padding(
                    padding: const EdgeInsets.all(
                      AppConstants.screenPaddingHorizontal,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Expanded(child: _buildPreview(document)),
                        const SizedBox(height: AppSpacing.md),
                        AppCard(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(document.name, style: AppTypography.bodyStrong),
                              const SizedBox(height: AppSpacing.xs),
                              Wrap(
                                spacing: AppSpacing.md,
                                runSpacing: AppSpacing.xs,
                                children: [
                                  Text(
                                    document.category.label,
                                    style: AppTypography.caption,
                                  ),
                                  Text(
                                    formatFileSize(document.fileSizeBytes),
                                    style: AppTypography.caption,
                                  ),
                                  Text(
                                    'Imported '
                                    '${document.dateImported.toLocal().toString().split(' ').first}',
                                    style: AppTypography.caption,
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: AppSpacing.md),
                        PrimaryButton(
                          label: 'Use Document',
                          onPressed: _fileMissing
                              ? null
                              : () => _handleUseDocument(provider, document),
                        ),
                      ],
                    ),
                  ),
          ),
        );
      },
    );
  }
}

class _InfoLine extends StatelessWidget {
  final String label;
  final String value;

  const _InfoLine(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppTypography.caption),
          Text(value, style: AppTypography.bodyStrong),
        ],
      ),
    );
  }
}
