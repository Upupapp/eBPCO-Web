import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/building_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/alerts/app_alert.dart';
import '../../../../../shared/widgets/badges/status_badge.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';

/// Step 9 — Assessment & Payment. This represents the Processing and
/// Evaluation Division's side of the process: the applicant doesn't enter
/// any assessment values, and payment stays disabled until the office has
/// assessed the application (there is nothing to submit/validate on this
/// step — pressing Continue submits the application for assessment, not
/// for payment).
class Step9AssessmentPayment extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final BuildingPermitDraft draft;
  final VoidCallback onChanged;

  const Step9AssessmentPayment({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Form(
      key: formKey,
      child: FormScrollScaffold(
        centerVertically: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const AppAlert(
              variant: AppAlertVariant.info,
              message:
                  'Payment becomes available only after the Processing and '
                  'Evaluation Division has assessed your application. '
                  'Submit now to begin assessment.',
            ),
            const SizedBox(height: AppSpacing.xl),
            Text('Assessment', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  for (final item in AssessmentPayment.assessmentLineItems) ...[
                    _AssessmentRow(label: item),
                    const SizedBox(height: AppSpacing.sm),
                  ],
                  const Divider(height: AppSpacing.lg),
                  const _AssessmentRow(label: 'Total', emphasized: true),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
            Text('Payment Methods', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            const _PaymentMethodOption(
              icon: Icons.storefront_outlined,
              label: 'Pay Onsite',
            ),
            const SizedBox(height: AppSpacing.md),
            const _PaymentMethodOption(
              icon: Icons.account_balance_outlined,
              label: 'Bank Transfer',
            ),
          ],
        ),
      ),
    );
  }
}

class _AssessmentRow extends StatelessWidget {
  final String label;
  final bool emphasized;

  const _AssessmentRow({required this.label, this.emphasized = false});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            label,
            style: emphasized ? AppTypography.bodyStrong : AppTypography.body,
          ),
        ),
        const SizedBox(width: AppSpacing.sm),
        const StatusBadge(
          label: 'Pending Assessment',
          color: AppColors.statusPending,
          backgroundColor: AppColors.statusPendingBg,
        ),
      ],
    );
  }
}

class _PaymentMethodOption extends StatelessWidget {
  final IconData icon;
  final String label;

  const _PaymentMethodOption({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return AppCard(
      backgroundColor: AppColors.surfaceMuted,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: AppColors.textMuted, size: 22),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: AppTypography.bodyStrong.copyWith(
                    color: AppColors.textMuted,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Available after assessment',
                  style: AppTypography.caption,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
