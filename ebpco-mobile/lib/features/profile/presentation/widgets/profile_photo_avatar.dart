import 'dart:io';

import 'package:flutter/material.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/avatars/app_avatar.dart';

/// Circular profile picture with a camera/edit icon overlay at the
/// bottom-right, matching the standard "avatar + edit badge" pattern.
/// Shows the initials placeholder when [photoPath] is null, or the real
/// saved photo file otherwise. Falls back to the placeholder (rather than
/// crashing or showing a broken-image icon) if the file can no longer be
/// read — e.g. it was deleted outside the app.
class ProfilePhotoAvatar extends StatelessWidget {
  final String? photoPath;
  final String initials;
  final double size;
  final VoidCallback onEditTap;

  const ProfilePhotoAvatar({
    super.key,
    required this.photoPath,
    required this.initials,
    required this.onEditTap,
    this.size = 96,
  });

  @override
  Widget build(BuildContext context) {
    final path = photoPath;
    final hasPhoto = path != null && path.isNotEmpty;

    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          hasPhoto
              ? ClipOval(
                  child: Image.file(
                    File(path),
                    width: size,
                    height: size,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => AppAvatar(
                      size: size,
                      initials: initials,
                      backgroundColor: AppColors.primary,
                      foregroundColor: AppColors.textOnPrimary,
                    ),
                  ),
                )
              : AppAvatar(
                  size: size,
                  initials: initials,
                  backgroundColor: AppColors.primary,
                  foregroundColor: AppColors.textOnPrimary,
                ),
          Positioned(
            right: -2,
            bottom: -2,
            child: Semantics(
              button: true,
              label: 'Change profile photo',
              child: Material(
                color: AppColors.secondaryBlue,
                shape: const CircleBorder(),
                child: InkWell(
                  customBorder: const CircleBorder(),
                  onTap: onEditTap,
                  child: Container(
                    width: 32,
                    height: 32,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.surface, width: 2),
                    ),
                    child: const Icon(
                      Icons.camera_alt,
                      size: 16,
                      color: AppColors.textOnPrimary,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
