import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/models/application_model.dart';
import '../../../core/models/payment_assessment_model.dart';
import '../../../core/providers/applications_provider.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/alerts/app_alert.dart';
import '../../../shared/widgets/badges/status_badge.dart';
import '../../../shared/widgets/buttons/primary_button.dart';
import '../../../shared/widgets/cards/app_card.dart';
import '../../../shared/widgets/states/empty_state.dart';

class ApplicationDetailsScreen extends StatelessWidget {
  final String applicationId;

  const ApplicationDetailsScreen({super.key, required this.applicationId});

  static final _currencyFormat = NumberFormat.currency(
    locale: 'en_PH',
    symbol: '₱',
  );

  @override
  Widget build(BuildContext context) {
    final application = context.watch<ApplicationsProvider>().byId(
      applicationId,
    );

    if (application == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Application')),
        body: const Center(
          child: Text('This application could not be found.'),
        ),
      );
    }

    final showPayButton =
        application.status == ApplicationStatus.underReview &&
        application.payment == null;
    final showSimulateButton =
        application.status == ApplicationStatus.submitted ||
        application.status == ApplicationStatus.paymentVerification ||
        application.status == ApplicationStatus.approved;

    return Scaffold(
      appBar: AppBar(title: Text(application.applicationNumber)),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          application.businessName,
                          style: AppTypography.sectionTitle,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Flexible(
                        child: StatusBadge(
                          label: application.status.label,
                          color: application.status.color,
                          backgroundColor: application.status.backgroundColor,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    application.type.label,
                    style: AppTypography.bodyMuted,
                  ),
                  const SizedBox(height: 16),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(
                      AppConstants.borderRadiusXs,
                    ),
                    child: LinearProgressIndicator(
                      value: application.progress,
                      minHeight: 8,
                      backgroundColor: AppColors.surfaceMuted,
                      valueColor: const AlwaysStoppedAnimation(
                        AppColors.secondaryBlue,
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '${(application.progress * 100).round()}% complete',
                    style: AppTypography.caption,
                  ),
                  const SizedBox(height: 10),
                  Text(application.nextStep, style: AppTypography.bodyMuted),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Text('Status Timeline', style: AppTypography.cardTitle),
            const SizedBox(height: 12),
            AppCard(child: _StatusTimeline(application: application)),
            const SizedBox(height: 24),
            Text('Documents', style: AppTypography.cardTitle),
            const SizedBox(height: 12),
            if (application.documents.isEmpty)
              const EmptyState(
                icon: Icons.description_outlined,
                title: 'No documents',
                message: 'No documents were attached to this application.',
              )
            else
              ...application.documents.map(
                (document) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: AppCard(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.description_outlined,
                          color: AppColors.primary,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                document.label,
                                style: AppTypography.bodyStrong,
                              ),
                              Text(
                                document.fileName,
                                style: AppTypography.caption,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            if (application.payment != null) ...[
              const SizedBox(height: 24),
              Text('Payment', style: AppTypography.cardTitle),
              const SizedBox(height: 12),
              AppCard(
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _currencyFormat.format(
                              application.payment!.amount,
                            ),
                            style: AppTypography.statistic.copyWith(
                              fontSize: 22,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${application.payment!.method?.label ?? 'Payment'} · Ref ${application.payment!.referenceNumber ?? '-'}',
                            style: AppTypography.caption,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Flexible(
                      child: StatusBadge(
                        label: application.payment!.status.label,
                        color: application.payment!.status.color,
                        backgroundColor:
                            application.payment!.status.backgroundColor,
                      ),
                    ),
                  ],
                ),
              ),
            ],
            if (application.permitNumber != null) ...[
              const SizedBox(height: 24),
              AppAlert(
                variant: AppAlertVariant.success,
                title: 'Permit Ready',
                message:
                    'Permit ${application.permitNumber} was issued on '
                    '${DateFormat('MMMM d, yyyy').format(application.issuedDate!)}.',
              ),
            ],
            const SizedBox(height: 28),
            if (showPayButton)
              PrimaryButton(
                label: 'Proceed to Payment',
                icon: Icons.payments_outlined,
                onPressed: () =>
                    context.push('/applications/${application.id}/pay'),
              ),
            if (showSimulateButton)
              PrimaryButton(
                label: 'Simulate Next Update',
                icon: Icons.fast_forward_outlined,
                onPressed: () => context
                    .read<ApplicationsProvider>()
                    .advanceStatus(application.id),
              ),
          ],
        ),
      ),
    );
  }
}

class _StatusTimeline extends StatelessWidget {
  final ApplicationModel application;

  const _StatusTimeline({required this.application});

  DateTime? _timestampFor(ApplicationStatus status) {
    for (final entry in application.statusHistory) {
      if (entry.status == status) return entry.timestamp;
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final currentIndex = applicationStatusSequence.indexOf(application.status);
    return Column(
      children: [
        for (var i = 0; i < applicationStatusSequence.length; i++)
          _TimelineRow(
            status: applicationStatusSequence[i],
            isDone: currentIndex != -1 && i <= currentIndex,
            isCurrent: i == currentIndex,
            isLast: i == applicationStatusSequence.length - 1,
            timestamp: _timestampFor(applicationStatusSequence[i]),
          ),
      ],
    );
  }
}

class _TimelineRow extends StatelessWidget {
  final ApplicationStatus status;
  final bool isDone;
  final bool isCurrent;
  final bool isLast;
  final DateTime? timestamp;

  const _TimelineRow({
    required this.status,
    required this.isDone,
    required this.isCurrent,
    required this.isLast,
    required this.timestamp,
  });

  @override
  Widget build(BuildContext context) {
    final color = isDone ? AppColors.statusApproved : AppColors.border;
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Icon(
                isDone ? Icons.check_circle : Icons.radio_button_unchecked,
                size: 20,
                color: color,
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    color: color,
                    margin: const EdgeInsets.symmetric(vertical: 2),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(bottom: isLast ? 0 : 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    status.label,
                    style: (isCurrent ? AppTypography.bodyStrong : AppTypography.body)
                        .copyWith(
                          color: isDone
                              ? AppColors.textPrimary
                              : AppColors.textMuted,
                        ),
                  ),
                  if (timestamp != null)
                    Text(
                      DateFormat('MMM d, yyyy · h:mm a').format(timestamp!),
                      style: AppTypography.caption,
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
