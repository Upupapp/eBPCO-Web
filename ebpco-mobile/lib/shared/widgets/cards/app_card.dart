import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_shadows.dart';

/// Standard surface container used for grouped content across the app:
/// 24px corner radius, soft resting shadow, comfortable padding. Pass
/// [onTap] to get the interactive variant (ink splash on tap) instead of a
/// static card.
class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final Color backgroundColor;
  final VoidCallback? onTap;
  final BorderRadius? borderRadius;
  final List<BoxShadow>? boxShadow;
  final double? minHeight;
  final bool showBorder;

  const AppCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.backgroundColor = AppColors.surface,
    this.onTap,
    this.borderRadius,
    this.boxShadow = AppShadows.card,
    this.minHeight,
    this.showBorder = false,
  });

  @override
  Widget build(BuildContext context) {
    final radius =
        borderRadius ?? BorderRadius.circular(AppConstants.borderRadiusXl);

    Widget card = Material(
      color: backgroundColor,
      borderRadius: radius,
      child: InkWell(
        onTap: onTap,
        borderRadius: radius,
        child: Container(
          constraints: minHeight != null
              ? BoxConstraints(minHeight: minHeight!)
              : null,
          padding: padding,
          decoration: BoxDecoration(
            borderRadius: radius,
            border: showBorder ? Border.all(color: AppColors.border) : null,
          ),
          child: child,
        ),
      ),
    );

    if (boxShadow != null && boxShadow!.isNotEmpty) {
      card = Container(
        decoration: BoxDecoration(borderRadius: radius, boxShadow: boxShadow),
        child: card,
      );
    }

    return card;
  }
}
