import 'package:flutter/material.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_typography.dart';

/// Mock action sheet for the profile photo edit button. No real camera or
/// gallery integration — each option just simulates picking/removing a
/// photo via the callbacks passed in.
Future<void> showProfilePhotoOptions(
  BuildContext context, {
  required bool hasPhoto,
  required VoidCallback onTakePhoto,
  required VoidCallback onChooseFromGallery,
  required VoidCallback onRemovePhoto,
}) {
  return showModalBottomSheet<void>(
    context: context,
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
              Text(
                'Update Profile Photo',
                textAlign: TextAlign.center,
                style: AppTypography.cardTitle,
              ),
              const SizedBox(height: AppSpacing.sm),
              _PhotoOptionTile(
                icon: Icons.camera_alt_outlined,
                label: 'Take Photo',
                onTap: () {
                  Navigator.of(sheetContext).pop();
                  onTakePhoto();
                },
              ),
              _PhotoOptionTile(
                icon: Icons.photo_library_outlined,
                label: 'Choose from Gallery',
                onTap: () {
                  Navigator.of(sheetContext).pop();
                  onChooseFromGallery();
                },
              ),
              if (hasPhoto)
                _PhotoOptionTile(
                  icon: Icons.delete_outline,
                  label: 'Remove Photo',
                  isDestructive: true,
                  onTap: () {
                    Navigator.of(sheetContext).pop();
                    onRemovePhoto();
                  },
                ),
              const SizedBox(height: AppSpacing.xs),
              _PhotoOptionTile(
                icon: Icons.close,
                label: 'Cancel',
                onTap: () => Navigator.of(sheetContext).pop(),
              ),
            ],
          ),
        ),
      );
    },
  );
}

class _PhotoOptionTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool isDestructive;

  const _PhotoOptionTile({
    required this.icon,
    required this.label,
    required this.onTap,
    this.isDestructive = false,
  });

  @override
  Widget build(BuildContext context) {
    final color = isDestructive ? AppColors.error : AppColors.textPrimary;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppConstants.borderRadiusMedium),
        child: Container(
          constraints: const BoxConstraints(
            minHeight: AppConstants.minTouchTarget,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
          child: Row(
            children: [
              Icon(
                icon,
                size: 22,
                color: isDestructive
                    ? AppColors.error
                    : AppColors.textSecondary,
              ),
              const SizedBox(width: AppSpacing.md),
              Text(label, style: AppTypography.body.copyWith(color: color)),
            ],
          ),
        ),
      ),
    );
  }
}
