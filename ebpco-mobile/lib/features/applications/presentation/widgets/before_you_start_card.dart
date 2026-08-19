import 'package:flutter/material.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_typography.dart';

/// Soft informational panel shown at the bottom of the Applications tab,
/// listing what to prepare before starting a new filing. Styled as
/// guidance (info-blue tone) rather than a warning.
class BeforeYouStartCard extends StatelessWidget {
  static const _checklist = [
    'Prepare all required documents and information.',
    'Ensure all details are accurate and complete.',
    'You can save your progress as a draft.',
    'Forms must be signed by a licensed engineer before submission.',
  ];

  const BeforeYouStartCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.statusInfoBg,
        borderRadius: BorderRadius.circular(AppConstants.borderRadiusXl),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.info_outline_rounded,
                color: AppColors.statusInfo,
                size: 22,
              ),
              const SizedBox(width: AppSpacing.sm),
              Text(
                'Before you start',
                style: AppTypography.bodyStrong.copyWith(
                  color: AppColors.statusInfo,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          for (final item in _checklist) ...[
            _ChecklistRow(text: item),
            if (item != _checklist.last) const SizedBox(height: AppSpacing.sm),
          ],
        ],
      ),
    );
  }
}

class _ChecklistRow extends StatelessWidget {
  final String text;

  const _ChecklistRow({required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Icon(
          Icons.check_circle_rounded,
          size: 16,
          color: AppColors.statusInfo,
        ),
        const SizedBox(width: AppSpacing.sm),
        Expanded(
          child: Text(
            text,
            style: AppTypography.bodyMuted.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ),
      ],
    );
  }
}
