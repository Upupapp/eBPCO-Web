import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';

/// A sized circular avatar showing either an icon or initials. Used for
/// user avatars, decorative icon roundels, and empty-state art so every
/// screen renders the same "circle + content" shape instead of each
/// widget building its own `Container(shape: BoxShape.circle)`.
class AppAvatar extends StatelessWidget {
  final double size;
  final Color backgroundColor;
  final Color foregroundColor;
  final IconData? icon;
  final String? initials;
  final double? iconSize;

  const AppAvatar({
    super.key,
    this.size = 40,
    this.backgroundColor = AppColors.lightBlue,
    this.foregroundColor = AppColors.primary,
    this.icon,
    this.initials,
    this.iconSize,
  }) : assert(
         icon != null || initials != null,
         'AppAvatar requires an icon or initials.',
       );

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(color: backgroundColor, shape: BoxShape.circle),
      child: icon != null
          ? Icon(icon, size: iconSize ?? size * 0.5, color: foregroundColor)
          : Text(
              initials!,
              style: AppTypography.bodyStrong.copyWith(
                color: foregroundColor,
                fontSize: size * 0.32,
              ),
            ),
    );
  }
}
