import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';

/// Compact interactive element for filters, categories, and selections.
/// Pass [onRemove] to get a removable input chip; pass [onSelected] to get
/// a toggling filter/choice chip.
class AppChip extends StatelessWidget {
  final String label;
  final bool selected;
  final ValueChanged<bool>? onSelected;
  final VoidCallback? onRemove;
  final IconData? icon;

  const AppChip({
    super.key,
    required this.label,
    this.selected = false,
    this.onSelected,
    this.onRemove,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: onSelected != null,
      selected: selected,
      label: label,
      child: FilterChip(
        label: Text(label),
        avatar: icon != null ? Icon(icon, size: 16) : null,
        selected: selected,
        onSelected: onSelected,
        onDeleted: onRemove,
        showCheckmark: false,
        labelStyle: AppTypography.label.copyWith(
          color: selected ? AppColors.textOnPrimary : AppColors.textSecondary,
          fontWeight: FontWeight.w600,
        ),
        backgroundColor: AppColors.surfaceMuted,
        selectedColor: AppColors.primary,
        side: BorderSide(
          color: selected ? AppColors.primary : AppColors.border,
        ),
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.sm,
          vertical: AppSpacing.xs,
        ),
        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      ),
    );
  }
}
