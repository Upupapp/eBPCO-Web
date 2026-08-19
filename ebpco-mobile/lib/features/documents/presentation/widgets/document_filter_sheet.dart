import 'package:flutter/material.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/models/saved_document_model.dart';
import '../../../../core/providers/documents_provider.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/buttons/primary_button.dart';

class DocumentFilterSelection {
  final DocumentTypeFilter typeFilter;
  final DocumentRecencyFilter recencyFilter;
  final SavedDocumentCategory? categoryFilter;
  final DocumentSortOrder sortOrder;

  const DocumentFilterSelection({
    required this.typeFilter,
    required this.recencyFilter,
    required this.categoryFilter,
    required this.sortOrder,
  });
}

/// Filter + sort bottom sheet for the My Documents screen. Returns the
/// chosen selection, or null if dismissed without applying.
Future<DocumentFilterSelection?> showDocumentFilterSheet(
  BuildContext context, {
  required DocumentTypeFilter typeFilter,
  required DocumentRecencyFilter recencyFilter,
  required SavedDocumentCategory? categoryFilter,
  required DocumentSortOrder sortOrder,
}) {
  return showModalBottomSheet<DocumentFilterSelection>(
    context: context,
    isScrollControlled: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
    ),
    builder: (context) => _DocumentFilterSheetContent(
      initialTypeFilter: typeFilter,
      initialRecencyFilter: recencyFilter,
      initialCategoryFilter: categoryFilter,
      initialSortOrder: sortOrder,
    ),
  );
}

class _DocumentFilterSheetContent extends StatefulWidget {
  final DocumentTypeFilter initialTypeFilter;
  final DocumentRecencyFilter initialRecencyFilter;
  final SavedDocumentCategory? initialCategoryFilter;
  final DocumentSortOrder initialSortOrder;

  const _DocumentFilterSheetContent({
    required this.initialTypeFilter,
    required this.initialRecencyFilter,
    required this.initialCategoryFilter,
    required this.initialSortOrder,
  });

  @override
  State<_DocumentFilterSheetContent> createState() =>
      _DocumentFilterSheetContentState();
}

class _DocumentFilterSheetContentState
    extends State<_DocumentFilterSheetContent> {
  late DocumentTypeFilter _typeFilter = widget.initialTypeFilter;
  late DocumentRecencyFilter _recencyFilter = widget.initialRecencyFilter;
  late SavedDocumentCategory? _categoryFilter = widget.initialCategoryFilter;
  late DocumentSortOrder _sortOrder = widget.initialSortOrder;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: EdgeInsets.fromLTRB(
          AppSpacing.lg,
          AppSpacing.sm,
          AppSpacing.lg,
          AppSpacing.lg + MediaQuery.of(context).viewInsets.bottom,
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: AppSpacing.md),
                  decoration: BoxDecoration(
                    color: AppColors.border,
                    borderRadius: BorderRadius.circular(
                      AppConstants.borderRadiusPill,
                    ),
                  ),
                ),
              ),
              Text('Filter & Sort', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.md),

              Text('Document Type', style: AppTypography.label),
              const SizedBox(height: AppSpacing.xs),
              Wrap(
                spacing: AppSpacing.sm,
                runSpacing: AppSpacing.sm,
                children: [
                  for (final filter in DocumentTypeFilter.values)
                    ChoiceChip(
                      label: Text(_typeFilterLabel(filter)),
                      selected: _typeFilter == filter,
                      onSelected: (_) => setState(() => _typeFilter = filter),
                    ),
                ],
              ),

              const SizedBox(height: AppSpacing.md),
              Text('Category', style: AppTypography.label),
              const SizedBox(height: AppSpacing.xs),
              Wrap(
                spacing: AppSpacing.sm,
                runSpacing: AppSpacing.sm,
                children: [
                  ChoiceChip(
                    label: const Text('All Categories'),
                    selected: _categoryFilter == null,
                    onSelected: (_) => setState(() => _categoryFilter = null),
                  ),
                  for (final category in SavedDocumentCategory.values)
                    ChoiceChip(
                      label: Text(category.label),
                      selected: _categoryFilter == category,
                      onSelected: (_) =>
                          setState(() => _categoryFilter = category),
                    ),
                ],
              ),

              const SizedBox(height: AppSpacing.md),
              Text('Recency', style: AppTypography.label),
              const SizedBox(height: AppSpacing.xs),
              Wrap(
                spacing: AppSpacing.sm,
                runSpacing: AppSpacing.sm,
                children: [
                  for (final filter in DocumentRecencyFilter.values)
                    ChoiceChip(
                      label: Text(_recencyFilterLabel(filter)),
                      selected: _recencyFilter == filter,
                      onSelected: (_) =>
                          setState(() => _recencyFilter = filter),
                    ),
                ],
              ),

              const SizedBox(height: AppSpacing.md),
              Text('Sort By', style: AppTypography.label),
              const SizedBox(height: AppSpacing.xs),
              Wrap(
                spacing: AppSpacing.sm,
                runSpacing: AppSpacing.sm,
                children: [
                  for (final order in DocumentSortOrder.values)
                    ChoiceChip(
                      label: Text(_sortOrderLabel(order)),
                      selected: _sortOrder == order,
                      onSelected: (_) => setState(() => _sortOrder = order),
                    ),
                ],
              ),

              const SizedBox(height: AppSpacing.lg),
              PrimaryButton(
                label: 'Apply',
                onPressed: () => Navigator.of(context).pop(
                  DocumentFilterSelection(
                    typeFilter: _typeFilter,
                    recencyFilter: _recencyFilter,
                    categoryFilter: _categoryFilter,
                    sortOrder: _sortOrder,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

String _typeFilterLabel(DocumentTypeFilter filter) {
  switch (filter) {
    case DocumentTypeFilter.all:
      return 'All Documents';
    case DocumentTypeFilter.images:
      return 'Images';
    case DocumentTypeFilter.pdf:
      return 'PDF Files';
  }
}

String _recencyFilterLabel(DocumentRecencyFilter filter) {
  switch (filter) {
    case DocumentRecencyFilter.none:
      return 'Any Time';
    case DocumentRecencyFilter.recentlyImported:
      return 'Recently Imported';
    case DocumentRecencyFilter.recentlyUsed:
      return 'Recently Used';
  }
}

String sortOrderLabel(DocumentSortOrder order) => _sortOrderLabel(order);

String _sortOrderLabel(DocumentSortOrder order) {
  switch (order) {
    case DocumentSortOrder.newestFirst:
      return 'Newest First';
    case DocumentSortOrder.oldestFirst:
      return 'Oldest First';
    case DocumentSortOrder.nameAToZ:
      return 'Name A–Z';
    case DocumentSortOrder.nameZToA:
      return 'Name Z–A';
    case DocumentSortOrder.largestFirst:
      return 'Largest File';
    case DocumentSortOrder.smallestFirst:
      return 'Smallest File';
  }
}
