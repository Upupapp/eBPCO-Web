import 'package:flutter/material.dart';

import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/cards/app_card.dart';

/// Small summary counter card, e.g. "Draft: 1", used in a responsive grid.
class DashboardStatCard extends StatelessWidget {
  final String label;
  final int count;
  final IconData icon;
  final Color color;

  const DashboardStatCard({
    super.key,
    required this.label,
    required this.count,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 18, color: color),
          ),
          const SizedBox(height: 10),
          Text('$count', style: AppTypography.statistic.copyWith(fontSize: 22)),
          Text(
            label,
            style: AppTypography.caption,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
