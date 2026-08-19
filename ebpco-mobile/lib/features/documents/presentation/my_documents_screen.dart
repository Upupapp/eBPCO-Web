import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/models/saved_document_model.dart';
import '../../../core/providers/documents_provider.dart';
import '../../../core/services/permission_service.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/buttons/primary_button.dart';
import '../../../shared/widgets/dialogs/confirmation_dialog.dart';
import '../../../shared/widgets/dialogs/permission_dialogs.dart';
import '../../../shared/widgets/states/empty_state.dart';
import '../../../shared/widgets/states/loading_view.dart';
import '../../../shared/widgets/text_fields/app_text_field.dart';
import 'document_preview_screen.dart';
import 'widgets/category_picker_sheet.dart';
import 'widgets/document_card.dart';
import 'widgets/document_filter_sheet.dart';

/// "My Documents" — the applicant's personal library of imported files,
/// reusable across permit applications instead of re-importing the same
/// file from the device file manager every time.
///
/// When [selectionMode] is true, the screen is being used as a picker
/// (opened from a permit's "Choose from My Documents" attach option):
/// tapping a document selects and returns it via `Navigator.pop` instead
/// of opening the preview screen.
class MyDocumentsScreen extends StatefulWidget {
  final bool selectionMode;

  const MyDocumentsScreen({super.key, this.selectionMode = false});

  @override
  State<MyDocumentsScreen> createState() => _MyDocumentsScreenState();
}

class _MyDocumentsScreenState extends State<MyDocumentsScreen> {
  final TextEditingController _searchController = TextEditingController();
  final PermissionService _permissionService = PermissionService();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _showMessage(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _handleImportDocument() async {
    final status = await requestPermissionWithPriming(
      context,
      permissionService: _permissionService,
      kind: AppPermissionKind.photos,
      primerTitle: fileAccessPermissionPrimerTitle,
      primerMessage: fileAccessPermissionPrimerMessage,
      deniedMessage: fileAccessPermissionDeniedMessage,
      showPrimerOnlyOnce: true,
    );
    if (status != AppPermissionStatus.granted) {
      if (status == AppPermissionStatus.denied && mounted) {
        _showMessage('File access is required.');
      }
      return;
    }
    if (!mounted) return;

    final provider = context.read<DocumentsProvider>();
    final result = await provider.importFromFiles();
    if (!mounted) return;
    await _handleImportResult(provider, result);
  }

  Future<void> _handleImportResult(
    DocumentsProvider provider,
    DocumentImportResult result,
  ) async {
    switch (result.outcome) {
      case DocumentImportOutcome.success:
        _showMessage('Document imported successfully.');
      case DocumentImportOutcome.duplicateFound:
        final confirmed = await ConfirmationDialog.show(
          context,
          title: 'Document Already Exists',
          message: 'This document has already been imported into My Documents.',
          confirmLabel: 'Import Another Copy',
        );
        if (!confirmed) {
          provider.discardPendingImport();
          return;
        }
        if (!mounted) return;
        final confirmedResult = await provider.confirmPendingImport();
        if (!mounted) return;
        if (confirmedResult.outcome == DocumentImportOutcome.success) {
          _showMessage('Document imported successfully.');
        } else {
          _showMessage('The selected file could not be opened.');
        }
      case DocumentImportOutcome.cancelled:
        _showMessage('No document was selected.');
      case DocumentImportOutcome.invalidFile:
        _showMessage('Unsupported file format.');
      case DocumentImportOutcome.tooLarge:
        _showMessage('File is too large.');
      case DocumentImportOutcome.error:
        _showMessage('The selected file could not be opened.');
    }
  }

  Future<void> _handleOpenFilters(DocumentsProvider provider) async {
    final selection = await showDocumentFilterSheet(
      context,
      typeFilter: provider.typeFilter,
      recencyFilter: provider.recencyFilter,
      categoryFilter: provider.categoryFilter,
      sortOrder: provider.sortOrder,
    );
    if (selection == null) return;
    provider.setTypeFilter(selection.typeFilter);
    provider.setRecencyFilter(selection.recencyFilter);
    provider.setCategoryFilter(selection.categoryFilter);
    provider.setSortOrder(selection.sortOrder);
  }

  Future<void> _handleCardTap(
    DocumentsProvider provider,
    SavedDocumentModel document,
  ) async {
    if (widget.selectionMode) {
      await provider.markUsed(document.id);
      if (mounted) Navigator.of(context).pop(_updated(provider, document));
      return;
    }
    await Navigator.of(context).push<void>(
      MaterialPageRoute(
        builder: (_) => DocumentPreviewScreen(documentId: document.id),
      ),
    );
  }

  /// Returns [document] as it now exists in [provider] — used right after
  /// an update (e.g. `markUsed`) so callers get the fresh copy (with e.g.
  /// `lastUsedDate` set) instead of the stale instance captured when the
  /// card was built.
  SavedDocumentModel _updated(
    DocumentsProvider provider,
    SavedDocumentModel document,
  ) {
    for (final doc in provider.allDocuments) {
      if (doc.id == document.id) return doc;
    }
    return document;
  }

  Future<void> _handleCardAction(
    DocumentsProvider provider,
    SavedDocumentModel document,
    DocumentCardAction action,
  ) async {
    switch (action) {
      case DocumentCardAction.preview:
        await Navigator.of(context).push<void>(
          MaterialPageRoute(
            builder: (_) => DocumentPreviewScreen(documentId: document.id),
          ),
        );
      case DocumentCardAction.rename:
        await _handleRename(provider, document);
      case DocumentCardAction.changeCategory:
        await _handleChangeCategory(provider, document);
      case DocumentCardAction.useForApplication:
        if (widget.selectionMode) {
          await provider.markUsed(document.id);
          if (mounted) Navigator.of(context).pop(_updated(provider, document));
        } else {
          _showMessage(
            'Open a permit application\'s document upload, then choose '
            '"Choose from My Documents" to use this file.',
          );
        }
      case DocumentCardAction.viewInfo:
        _showFileInfo(document);
      case DocumentCardAction.remove:
        await _handleRemove(provider, document);
    }
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
            _InfoLine(
              'Imported',
              document.dateImported.toLocal().toString().split('.').first,
            ),
            _InfoLine(
              'Last Used',
              document.lastUsedDate != null
                  ? document.lastUsedDate!.toLocal().toString().split('.').first
                  : 'Never',
            ),
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
    if (mounted) _showMessage('Document removed successfully.');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.selectionMode ? 'Choose a Document' : 'My Documents'),
        actions: [
          Consumer<DocumentsProvider>(
            builder: (context, provider, _) => IconButton(
              icon: Icon(
                Icons.filter_list,
                color: provider.hasActiveFilters
                    ? AppColors.primary
                    : AppColors.textSecondary,
              ),
              tooltip: 'Filter & Sort',
              onPressed: () => _handleOpenFilters(provider),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Consumer<DocumentsProvider>(
          builder: (context, provider, _) {
            if (provider.isLoading) {
              return const LoadingView(message: 'Loading your documents...');
            }

            final visible = provider.visibleDocuments;
            final hasAnyDocuments = provider.allDocuments.isNotEmpty;

            return Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(
                    AppConstants.screenPaddingHorizontal,
                    AppSpacing.md,
                    AppConstants.screenPaddingHorizontal,
                    AppSpacing.sm,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      AppTextField(
                        controller: _searchController,
                        label: 'Search documents',
                        hint: 'Search by name or category',
                        prefixIcon: const Icon(Icons.search),
                        onChanged: provider.setSearchQuery,
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      PrimaryButton(
                        label: 'Import Document',
                        icon: Icons.upload_file_outlined,
                        onPressed: _handleImportDocument,
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: !hasAnyDocuments
                      ? const EmptyState(
                          icon: Icons.folder_open_outlined,
                          title: 'No Documents Yet',
                          message:
                              'Documents you import into eBPCO will appear '
                              'here, making them easier to reuse for future '
                              'permit applications.',
                          // No action button here — the always-visible
                          // "Import Document" button above (in the header
                          // section) is already the one way to import,
                          // regardless of whether the list is empty or
                          // not. A second button here would just be the
                          // duplicated-button problem this screen used to
                          // have.
                        )
                      : visible.isEmpty
                      ? const EmptyState(
                          icon: Icons.search_off_outlined,
                          title: 'No Matching Documents',
                          message:
                              'Try a different search term or clear your '
                              'filters.',
                        )
                      : ListView.separated(
                          padding: const EdgeInsets.fromLTRB(
                            AppConstants.screenPaddingHorizontal,
                            AppSpacing.sm,
                            AppConstants.screenPaddingHorizontal,
                            AppSpacing.xl,
                          ),
                          itemCount: visible.length,
                          separatorBuilder: (_, _) =>
                              const SizedBox(height: AppSpacing.sm),
                          itemBuilder: (context, index) {
                            final document = visible[index];
                            return DocumentCard(
                              document: document,
                              onTap: () => _handleCardTap(provider, document),
                              onAction: (action) =>
                                  _handleCardAction(provider, document, action),
                            );
                          },
                        ),
                ),
              ],
            );
          },
        ),
      ),
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
