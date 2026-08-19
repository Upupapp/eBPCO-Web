import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_strings.dart';
import '../../../core/theme/app_shadows.dart';

/// Reusable E-BPCO logo mark (the official DILG seal) + app name, used
/// across splash, onboarding, and authentication screens.
class AppLogo extends StatelessWidget {
  final double iconSize;
  final double titleSize;
  final bool showSubtitle;
  final Color? iconBackgroundColor;

  /// Unused now that the mark is a fixed-color official seal image; kept
  /// only so existing call sites don't need to change.
  final Color? iconColor;
  final Color? titleColor;

  const AppLogo({
    super.key,
    this.iconSize = 64,
    this.titleSize = 28,
    this.showSubtitle = true,
    this.iconBackgroundColor,
    this.iconColor,
    this.titleColor,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: iconSize,
          height: iconSize,
          padding: EdgeInsets.all(iconSize * 0.06),
          decoration: BoxDecoration(
            color: iconBackgroundColor ?? AppColors.surface,
            shape: BoxShape.circle,
            boxShadow: AppShadows.card,
          ),
          child: ClipOval(
            child: Image.asset(
              'assets/images/DILG logo.png',
              fit: BoxFit.contain,
            ),
          ),
        ),
        const SizedBox(height: 14),
        Text(
          AppStrings.appName,
          style: TextStyle(
            fontSize: titleSize,
            fontWeight: FontWeight.w800,
            color: titleColor ?? AppColors.primary,
            letterSpacing: 0.5,
          ),
        ),
        if (showSubtitle) ...[
          const SizedBox(height: 4),
          Text(
            AppStrings.appTagline,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13,
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ],
    );
  }
}
