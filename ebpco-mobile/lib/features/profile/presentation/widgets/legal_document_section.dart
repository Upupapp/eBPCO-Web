import 'package:flutter/material.dart';

import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_typography.dart';

/// One heading + body section of a long-form legal document (Terms and
/// Conditions, Privacy Policy). Kept as a single reusable widget since both
/// screens render a dozen-plus sections in the same shape.
class LegalSection extends StatelessWidget {
  final String title;
  final String body;

  const LegalSection({super.key, required this.title, required this.body});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: AppTypography.cardTitle),
          const SizedBox(height: AppSpacing.xs),
          Text(body, style: AppTypography.bodyMuted.copyWith(height: 1.55)),
        ],
      ),
    );
  }
}
