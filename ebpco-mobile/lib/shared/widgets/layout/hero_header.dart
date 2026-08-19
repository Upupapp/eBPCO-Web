import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_typography.dart';

/// Premium coral header for the top of a major screen: large title or
/// greeting, rounded bottom corners, optional trailing actions, an optional
/// embedded floating search bar, and a couple of small static decorative
/// circles. Purely a visual/layout treatment — no animation.
///
/// Renders full-bleed (edge-to-edge, coral behind the status bar), so the
/// screen using it should NOT also wrap it in a top-padding [SafeArea] —
/// this widget applies its own internal safe-area inset to its content.
class HeroHeader extends StatelessWidget {
  final String title;
  final String? subtitle;
  final List<Widget> actions;
  final Widget? searchBar;
  final bool showDecoration;

  const HeroHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.actions = const [],
    this.searchBar,
    this.showDecoration = true,
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: const BorderRadius.only(
        bottomLeft: Radius.circular(AppConstants.borderRadiusXl),
        bottomRight: Radius.circular(AppConstants.borderRadiusXl),
      ),
      child: Container(
        width: double.infinity,
        color: AppColors.primary,
        child: SafeArea(
          bottom: false,
          child: Padding(
            padding: EdgeInsets.fromLTRB(
              AppConstants.screenPaddingHorizontal,
              12,
              AppConstants.screenPaddingHorizontal,
              searchBar != null ? 28 : 20,
            ),
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                if (showDecoration) ..._decorativeShapes(),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (subtitle != null) ...[
                                Text(
                                  subtitle!,
                                  style: AppTypography.label.copyWith(
                                    color: AppColors.textOnPrimaryMuted,
                                  ),
                                ),
                                const SizedBox(height: 2),
                              ],
                              Text(
                                title,
                                style: AppTypography.pageTitle.copyWith(
                                  color: AppColors.textOnPrimary,
                                  fontSize: 24,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                        ...actions,
                      ],
                    ),
                    if (searchBar != null) ...[
                      const SizedBox(height: 18),
                      searchBar!,
                    ],
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  List<Widget> _decorativeShapes() {
    return const [
      Positioned(
        top: -30,
        right: -20,
        child: IgnorePointer(
          child: _DecorativeCircle(size: 110, opacity: 0.10),
        ),
      ),
      Positioned(
        bottom: -40,
        left: -30,
        child: IgnorePointer(child: _DecorativeCircle(size: 90, opacity: 0.08)),
      ),
    ];
  }
}

class _DecorativeCircle extends StatelessWidget {
  final double size;
  final double opacity;

  const _DecorativeCircle({required this.size, required this.opacity});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: AppColors.textOnPrimary.withValues(alpha: opacity),
      ),
    );
  }
}
