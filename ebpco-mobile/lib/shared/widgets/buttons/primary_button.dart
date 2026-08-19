import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_constants.dart';

/// Visual treatment for [PrimaryButton]. [primary] (coral fill, the theme
/// default) covers main calls-to-action; [danger]/[success] reuse the same
/// button shape for destructive/confirmation actions instead of adding
/// separate widgets.
enum ButtonVariant { primary, danger, success }

/// Primary call-to-action button with a built-in loading state.
class PrimaryButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;
  final IconData? icon;
  final ButtonVariant variant;

  const PrimaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.isLoading = false,
    this.icon,
    this.variant = ButtonVariant.primary,
  });

  Color? get _backgroundColor {
    switch (variant) {
      case ButtonVariant.primary:
        return null;
      case ButtonVariant.danger:
        return AppColors.error;
      case ButtonVariant.success:
        return AppColors.success;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDisabled = isLoading || onPressed == null;
    final backgroundColor = _backgroundColor;
    return SizedBox(
      height: AppConstants.minTouchTarget,
      child: ElevatedButton(
        onPressed: isDisabled ? null : onPressed,
        style: backgroundColor == null
            ? null
            : ElevatedButton.styleFrom(
                backgroundColor: backgroundColor,
                disabledBackgroundColor: backgroundColor.withValues(alpha: 0.4),
              ),
        child: isLoading
            ? const SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(
                  strokeWidth: 2.4,
                  color: Colors.white,
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (icon != null) ...[
                    Icon(icon, size: 20),
                    const SizedBox(width: 8),
                  ],
                  Flexible(child: Text(label, overflow: TextOverflow.ellipsis)),
                ],
              ),
      ),
    );
  }
}
