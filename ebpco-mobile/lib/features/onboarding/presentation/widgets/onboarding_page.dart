import 'package:flutter/material.dart';

import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../models/onboarding_item.dart';

/// Renders a single onboarding page: title and description first, followed
/// by a large illustration that fills most of the remaining space. Uses
/// `centerVertically: false` on [FormScrollScaffold] so content starts
/// right below the Skip button instead of being vertically centered with a
/// large empty gap on top; a [LayoutBuilder] sizes the illustration off the
/// actual available height for this page so it stays the dominant visual
/// element while still degrading to a scroll (never an overflow) under
/// extreme text scaling or very short viewports.
class OnboardingPage extends StatelessWidget {
  final OnboardingItem item;

  const OnboardingPage({super.key, required this.item});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final availableHeight = constraints.maxHeight.isFinite
            ? constraints.maxHeight
            : MediaQuery.of(context).size.height;
        // ~35% larger than the previous 0.55 / 220-480 sizing so the
        // illustration reads as the page's hero element instead of a small
        // centered sticker, while still leaving room for the progress dots
        // and button that sit below (outside this widget).
        final imageHeight = (availableHeight * 0.75).clamp(290.0, 650.0);

        return FormScrollScaffold(
          centerVertically: false,
          padding: const EdgeInsets.fromLTRB(
            32,
            AppSpacing.lg,
            32,
            AppSpacing.sm,
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              Text(
                item.title,
                textAlign: TextAlign.center,
                style: AppTypography.display,
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                item.description,
                textAlign: TextAlign.center,
                style: AppTypography.bodyMuted.copyWith(height: 1.6),
              ),
              const SizedBox(height: AppSpacing.md),
              Center(
                child: SizedBox(
                  height: imageHeight,
                  width: double.infinity,
                  child: Image.asset(item.imagePath, fit: BoxFit.contain),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
