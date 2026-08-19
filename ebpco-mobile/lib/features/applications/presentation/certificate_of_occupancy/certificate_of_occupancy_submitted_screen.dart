import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/models/certificate_of_occupancy_model.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/avatars/app_avatar.dart';
import '../../../../shared/widgets/badges/status_badge.dart';
import '../../../../shared/widgets/buttons/primary_button.dart';
import '../../../../shared/widgets/buttons/secondary_button.dart';
import '../../../../shared/widgets/cards/app_card.dart';
import '../../../../shared/widgets/layout/form_scroll_scaffold.dart';

/// Terminal confirmation screen shown after Step 5's Submit Application
/// is pressed — sits outside the numbered 5-step flow, matching how
/// every other permit wizard closes out its flow. Also renders the
/// mocked, applicant-visible status sequence (Submitted through
/// Certificate Issued) so the applicant can see what happens next. Uses
/// [FormScrollScaffold] (rather than an unwrapped `Center`/`Column`) so
/// this content scrolls instead of overflowing on shorter Android
/// viewports.
class CertificateOfOccupancySubmittedScreen extends StatelessWidget {
  final String referenceNumber;
  final DateTime submissionDate;
  final String buildingPermitNumber;
  final String certificateType;

  const CertificateOfOccupancySubmittedScreen({
    super.key,
    required this.referenceNumber,
    required this.submissionDate,
    required this.buildingPermitNumber,
    required this.certificateType,
  });

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: SafeArea(
          child: FormScrollScaffold(
            padding: const EdgeInsets.symmetric(
              horizontal: AppConstants.screenPaddingHorizontal,
              vertical: 24,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const AppAvatar(
                  size: 96,
                  icon: Icons.check_circle,
                  iconSize: 56,
                  backgroundColor: AppColors.statusApprovedBg,
                  foregroundColor: AppColors.statusApproved,
                ),
                const SizedBox(height: AppSpacing.xl),
                Text(
                  'Certificate of Occupancy Application Submitted!',
                  style: AppTypography.pageTitle,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.md),
                Text(
                  'Your Certificate of Occupancy application has been '
                  'submitted for initial review. You will be notified as '
                  'it moves through document verification, inspection, '
                  'and evaluation.',
                  textAlign: TextAlign.center,
                  style: AppTypography.bodyMuted.copyWith(height: 1.5),
                ),
                const SizedBox(height: AppSpacing.xl),
                AppCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      _InfoRow(
                        label: 'Application Reference Number',
                        value: referenceNumber,
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      const _InfoRow(
                        label: 'Application Type',
                        value: 'Certificate of Occupancy',
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      _InfoRow(
                        label: 'Related Building Permit',
                        value: buildingPermitNumber.trim().isEmpty
                            ? 'Not set'
                            : buildingPermitNumber,
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      _InfoRow(
                        label: 'Certificate Type',
                        value: certificateType,
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      const _InfoRow(
                        label: 'Status',
                        value: 'Submitted for Initial Review',
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      _InfoRow(
                        label: 'Submission Date',
                        value: DateFormat(
                          'MMM d, yyyy',
                        ).format(submissionDate),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: AppSpacing.xl),
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text('Application Status', style: AppTypography.cardTitle),
                ),
                const SizedBox(height: AppSpacing.sm),
                AppCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      for (final stage in certificateStatusSequence) ...[
                        _StatusRow(
                          label: stage.label,
                          isCurrent:
                              stage == CertificateApplicationStatus.submitted,
                        ),
                        if (stage != certificateStatusSequence.last)
                          const SizedBox(height: AppSpacing.sm),
                      ],
                    ],
                  ),
                ),

                const SizedBox(height: AppSpacing.xxl),
                SecondaryButton(
                  label: 'View Application',
                  onPressed: () => context.go('/app/applications'),
                ),
                const SizedBox(height: AppSpacing.md),
                PrimaryButton(
                  label: 'Return Home',
                  onPressed: () => context.go('/app/home'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _StatusRow extends StatelessWidget {
  final String label;
  final bool isCurrent;

  const _StatusRow({required this.label, required this.isCurrent});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            label,
            style: isCurrent ? AppTypography.bodyStrong : AppTypography.body,
          ),
        ),
        const SizedBox(width: AppSpacing.sm),
        Flexible(
          child: StatusBadge(
            label: isCurrent ? 'Current' : 'Pending',
            color: isCurrent ? AppColors.statusApproved : AppColors.textMuted,
            backgroundColor: isCurrent
                ? AppColors.statusApprovedBg
                : AppColors.surfaceMuted,
          ),
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
