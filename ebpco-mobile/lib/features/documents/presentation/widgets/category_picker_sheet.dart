import 'package:flutter/material.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/models/saved_document_model.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_typography.dart';

/// Lets the applicant choose (or confirm) a document's category — never
/// inferred automatically, per the "categories are user-selected" rule.
/// Returns the chosen category, or null if dismissed without a choice.
Future<SavedDocumentCategory?> showCategoryPickerSheet(
  BuildContext context, {
  required SavedDocumentCategory current,
}) {
  return showModalBottomSheet<SavedDocumentCategory>(
    context: context,
    isScrollControlled: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
    ),
    builder: (sheetContext) {
      return SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.lg,
            AppSpacing.sm,
            AppSpacing.lg,
            AppSpacing.lg,
          ),
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
              Text('Document Category', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.sm),
              ConstrainedBox(
                constraints: BoxConstraints(
                  maxHeight: MediaQuery.of(context).size.height * 0.5,
                ),
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      for (final category in SavedDocumentCategory.values)
                        ListTile(
                          contentPadding: EdgeInsets.zero,
                          title: Text(category.label),
                          leading: Icon(
                            category == current
                                ? Icons.radio_button_checked
                                : Icons.radio_button_unchecked,
                            color: category == current
                                ? AppColors.primary
                                : AppColors.textMuted,
                          ),
                          onTap: () => Navigator.of(sheetContext).pop(category),
                        ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    },
  );
}
