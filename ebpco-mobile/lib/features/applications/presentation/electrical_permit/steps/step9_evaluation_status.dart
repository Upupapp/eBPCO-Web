import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/electrical_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/alerts/app_alert.dart';
import '../../../../../shared/widgets/badges/status_badge.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';

/// Step 9 — Evaluation, Assessment & Permit Status. Everything shown here
/// is office-controlled (fixed "pending" placeholders); the permit status
/// itself is derived from the Related Building Permit's reference
/// ([ElectricalPermitDraft.derivedPermitStatus]), so this permit can never
/// render as valid/issued without one. There is no blocking validity
/// condition — Continue always submits for evaluation.
class Step9EvaluationStatus extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final ElectricalPermitDraft draft;
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
  ElectricalEvaluationPermitStatus get _evaluation =>
      widget.draft.evaluationPermitStatus;

  void _selectPaymentMethod(ElectricalPaymentMethod method) {
    setState(() => _evaluation.selectedPaymentMethod = method);
    widget.onChanged();
  }

  @override
  Widget build(BuildContext context) {
    final derivedStatus = widget.draft.derivedPermitStatus;
    final isInvalidWithoutBuildingPermit =
        derivedStatus == ElectricalPermitStatus.invalidWithoutBuildingPermit;

    return Form(
      key: widget.formKey,
      child: FormScrollScaffold(
        centerVertically: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (isInvalidWithoutBuildingPermit)
              const AppAlert(
                variant: AppAlertVariant.warning,
                message:
                    'This Electrical Permit cannot be valid or issued until '
                    'the required Building Permit reference is satisfied.',
              )
            else
              const AppAlert(
                variant: AppAlertVariant.info,
                message:
                    'Your application will now go through evaluation by the '
                    'Office of the Building Official. Payment will become '
                    'available once assessment is complete.',
              ),

            const SizedBox(height: AppSpacing.xl),
            Text('Document Evaluation', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  for (final entry
                      in ElectricalEvaluationPermitStatus
                          .documentEvaluation
                          .entries) ...[
                    _StatusRow(label: entry.key, status: entry.value.label),
                    if (entry.key !=
                        ElectricalEvaluationPermitStatus
                            .documentEvaluation
                            .keys
                            .last)
                      const SizedBox(height: AppSpacing.sm),
                  ],
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Progress Flow', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  for (final stage
                      in ElectricalEvaluationPermitStatus.progressStages) ...[
                    _StatusRow(label: stage, status: 'Pending'),
                    if (stage !=
                        ElectricalEvaluationPermitStatus.progressStages.last)
                      const SizedBox(height: AppSpacing.sm),
                  ],
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Assessed Fees', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _InfoRow(
                    label: 'Electrical Fee',
                    value: ElectricalEvaluationPermitStatus.electricalFee,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _InfoRow(
                    label: 'Other Fees',
                    value: ElectricalEvaluationPermitStatus.otherFees,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _InfoRow(
                    label: 'Total',
                    value: ElectricalEvaluationPermitStatus.total,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _InfoRow(
                    label: 'Official Receipt Number',
                    value: ElectricalEvaluationPermitStatus.officialReceiptNumber,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _InfoRow(
                    label: 'Date Paid',
                    value: ElectricalEvaluationPermitStatus.datePaid,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _InfoRow(
                    label: 'Processed By',
                    value: ElectricalEvaluationPermitStatus.processedBy,
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
                        ElectricalPaymentMethod.payOnsite,
                    onTap: () =>
                        _selectPaymentMethod(ElectricalPaymentMethod.payOnsite),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: _PaymentMethodOption(
                    icon: Icons.account_balance_outlined,
                    label: 'Bank Transfer',
                    selected: _evaluation.selectedPaymentMethod ==
                        ElectricalPaymentMethod.bankTransfer,
                    onTap: () => _selectPaymentMethod(
                      ElectricalPaymentMethod.bankTransfer,
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Permit Status', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _InfoRow(
                    label: 'Action Taken',
                    value: ElectricalEvaluationPermitStatus.actionTaken,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _InfoRow(
                    label: 'Recommending Approval',
                    value: ElectricalEvaluationPermitStatus.recommendingApproval,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _InfoRow(
                    label: 'Permit Issued By',
                    value: ElectricalEvaluationPermitStatus.permitIssuedBy,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _InfoRow(
                    label: 'Related Building Permit Status',
                    value: widget.draft.relatedBuildingPermit.status.label,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _InfoRow(
                    label: 'Certificate of Final Electrical Inspection',
                    value: ElectricalEvaluationPermitStatus
                        .finalElectricalInspectionStatus,
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: _InfoRow(
                      label: 'Electrical Permit Status',
                      value: derivedStatus.label,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  // Long status labels (e.g. "Invalid Without Building
                  // Permit") must wrap instead of forcing the badge to its
                  // full intrinsic width, which would overflow this Row on
                  // narrow screens — Flexible lets Text wrap within it.
                  Flexible(
                    child: StatusBadge(
                      label: derivedStatus.label,
                      color: isInvalidWithoutBuildingPermit
                          ? AppColors.error
                          : AppColors.statusPending,
                      backgroundColor: isInvalidWithoutBuildingPermit
                          ? AppColors.error.withValues(alpha: 0.1)
                          : AppColors.statusPendingBg,
                    ),
                  ),
                ],
              ),
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
                      in ElectricalEvaluationPermitStatus.permitConditions) ...[
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
                        ElectricalEvaluationPermitStatus.permitConditions.last)
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

class _StatusRow extends StatelessWidget {
  final String label;
  final String status;

  const _StatusRow({required this.label, required this.status});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: Text(label, style: AppTypography.body)),
        StatusBadge(
          label: status,
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
