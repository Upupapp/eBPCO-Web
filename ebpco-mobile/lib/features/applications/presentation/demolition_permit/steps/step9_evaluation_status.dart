import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/demolition_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/alerts/app_alert.dart';
import '../../../../../shared/widgets/badges/status_badge.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';

/// Step 9 — Evaluation, Payment & Permit Status. Everything shown here is
/// office-controlled (fixed "pending" placeholders); the only thing the
/// applicant can do is record a preferred payment method for later, which
/// has no effect while payment stays disabled. There is no blocking
/// validity condition — Continue always submits for evaluation.
class Step9EvaluationStatus extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final DemolitionPermitDraft draft;
  final VoidCallback onChanged;

  const Step9EvaluationStatus({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step9EvaluationStatus> createState() => _Step9EvaluationStatusState();
}

class _Step9EvaluationStatusState extends State<Step9EvaluationStatus> {
  DemolitionEvaluationPermitStatus get _evaluation =>
      widget.draft.evaluationPermitStatus;

  void _selectPaymentMethod(DemolitionPaymentMethod method) {
    setState(() => _evaluation.selectedPaymentMethod = method);
    widget.onChanged();
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: widget.formKey,
      child: FormScrollScaffold(
        centerVertically: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const AppAlert(
              variant: AppAlertVariant.info,
              message:
                  'Your application will now go through evaluation by the '
                  'Office of the Building Official. Payment will become '
                  'available once assessment is complete.',
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Evaluation Stages', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  for (final stage
                      in DemolitionEvaluationPermitStatus.evaluationStages) ...[
                    _StageRow(label: stage),
                    if (stage !=
                        DemolitionEvaluationPermitStatus
                            .evaluationStages
                            .last)
                      const SizedBox(height: AppSpacing.sm),
                  ],
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Assessment', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _InfoRow(
                    label: 'Fee Due',
                    value: DemolitionEvaluationPermitStatus.feeDue,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _InfoRow(
                    label: 'Official Receipt Number',
                    value:
                        DemolitionEvaluationPermitStatus.officialReceiptNumber,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _InfoRow(
                    label: 'Date Paid',
                    value: DemolitionEvaluationPermitStatus.datePaid,
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Preferred Payment Method', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Optional — this only records your preference for when '
              'payment becomes available.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            Row(
              children: [
                Expanded(
                  child: _PaymentMethodOption(
                    icon: Icons.storefront_outlined,
                    label: 'Pay Onsite',
                    selected: _evaluation.selectedPaymentMethod ==
                        DemolitionPaymentMethod.payOnsite,
                    onTap: () =>
                        _selectPaymentMethod(DemolitionPaymentMethod.payOnsite),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: _PaymentMethodOption(
                    icon: Icons.account_balance_outlined,
                    label: 'Bank Transfer',
                    selected: _evaluation.selectedPaymentMethod ==
                        DemolitionPaymentMethod.bankTransfer,
                    onTap: () => _selectPaymentMethod(
                      DemolitionPaymentMethod.bankTransfer,
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Permit Status', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Row(
                children: [
                  Expanded(
                    child: _InfoRow(
                      label: 'Current Status',
                      value:
                          DemolitionEvaluationPermitStatus.permitStatus.label,
                    ),
                  ),
                  const StatusBadge(
                    label: 'Submitted',
                    color: AppColors.statusPending,
                    backgroundColor: AppColors.statusPendingBg,
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            _InfoRow(
              label: 'Date Issued',
              value: DemolitionEvaluationPermitStatus.dateIssued,
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Permit Conditions', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'These conditions will apply once the permit is issued.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  for (final condition
                      in DemolitionEvaluationPermitStatus.permitConditions) ...[
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(
                          Icons.circle,
                          size: 6,
                          color: AppColors.textMuted,
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: Text(condition, style: AppTypography.body),
                        ),
                      ],
                    ),
                    if (condition !=
                        DemolitionEvaluationPermitStatus.permitConditions.last)
                      const SizedBox(height: AppSpacing.sm),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StageRow extends StatelessWidget {
  final String label;

  const _StageRow({required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: Text(label, style: AppTypography.body)),
        const StatusBadge(
          label: 'Pending',
          color: AppColors.statusPending,
          backgroundColor: AppColors.statusPendingBg,
        ),
      ],
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTypography.caption),
        const SizedBox(height: 2),
        Text(value, style: AppTypography.bodyStrong),
      ],
    );
  }
}

class _PaymentMethodOption extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _PaymentMethodOption({
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: onTap,
      backgroundColor: selected ? AppColors.lightBlue : AppColors.surface,
      showBorder: !selected,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            icon,
            color: selected ? AppColors.secondaryBlue : AppColors.textMuted,
            size: 22,
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            label,
            style: selected
                ? AppTypography.bodyStrong.copyWith(
                    color: AppColors.secondaryBlueDark,
                  )
                : AppTypography.bodyStrong,
          ),
        ],
      ),
    );
  }
}
