import 'package:flutter/material.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/avatars/app_avatar.dart';
import '../../../../shared/widgets/cards/app_card.dart';

/// Layout variants for [ApplicationOptionCard]: a tile for the project-type
/// grid, or a full-width row for the "Other Applications" list.
enum ApplicationOptionCardLayout { grid, list }

/// Selectable card describing one application/permit type a user can file.
/// Shared by the "Select Form Project Type" grid and the "Other
/// Applications" list so both sections use one tappable card shape, built
/// on the existing [AppCard] and [AppAvatar] primitives.
class ApplicationOptionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final VoidCallback onTap;
  final ApplicationOptionCardLayout layout;
  final Color accentColor;
  final Color accentBackgroundColor;

  const ApplicationOptionCard({
    super.key,
    required this.icon,
    required this.title,
    required this.description,
    required this.onTap,
    this.layout = ApplicationOptionCardLayout.grid,
    this.accentColor = AppColors.primary,
    this.accentBackgroundColor = AppColors.primaryLight,
  });

  @override
  Widget build(BuildContext context) {
    return layout == ApplicationOptionCardLayout.grid
        ? _buildGrid()
        : _buildList();
  }

  Widget _buildGrid() {
    return AppCard(
      onTap: onTap,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AppAvatar(
            size: 52,
            iconSize: 26,
            icon: icon,
            backgroundColor: accentBackgroundColor,
            foregroundColor: accentColor,
          ),
          const SizedBox(height: 14),
          Text(
            title,
            style: AppTypography.cardTitle,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          Expanded(
            child: Text(
              description,
              style: AppTypography.helper,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(height: 8),
          Align(
            alignment: Alignment.centerRight,
            child: _ArrowBadge(
              color: accentColor,
              background: accentBackgroundColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildList() {
    return AppCard(
      onTap: onTap,
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          AppAvatar(
            size: 52,
            iconSize: 26,
            icon: icon,
            backgroundColor: accentBackgroundColor,
            foregroundColor: accentColor,
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppTypography.cardTitle),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: AppTypography.helper,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
        ],
      ),
    );
  }
}

class _ArrowBadge extends StatelessWidget {
  final Color color;
  final Color background;

  const _ArrowBadge({required this.color, required this.background});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 28,
      height: 28,
      alignment: Alignment.center,
      decoration: BoxDecoration(color: background, shape: BoxShape.circle),
      child: Icon(Icons.arrow_forward_rounded, size: 15, color: color),
    );
  }
}
