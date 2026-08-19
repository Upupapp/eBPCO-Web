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
import '../../../shared/widgets/badges/status_badge.dart';
import '../../../shared/widgets/cards/app_card.dart';
import '../../../shared/widgets/states/empty_state.dart';
import '../../../shared/widgets/states/loading_view.dart';

/// Lists applications that either already have a payment assessment or are
/// currently awaiting one (status == underReview with no payment yet).
class PaymentsScreen extends StatelessWidget {
  const PaymentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final applicationsProvider = context.watch<ApplicationsProvider>();
    final relevant =
        applicationsProvider.applications
            .where(
              (application) =>
                  application.payment != null ||
                  application.status == ApplicationStatus.underReview,
            )
            .toList()
          ..sort((a, b) => b.submittedDate.compareTo(a.submittedDate));

    return Scaffold(
      appBar: AppBar(title: const Text('Payments')),
      body: SafeArea(
        child: applicationsProvider.isLoading
            ? const LoadingView()
            : relevant.isEmpty
            ? const EmptyState(
                icon: Icons.payments_outlined,
                title: 'No payments yet',
                message:
                    'Payment assessments will appear here once your applications reach that stage.',
              )
            : ListView.separated(
                padding: const EdgeInsets.all(
                  AppConstants.screenPaddingHorizontal,
                ),
                itemCount: relevant.length,
                separatorBuilder: (context, index) =>
                    const SizedBox(height: 12),
                itemBuilder: (context, index) =>
                    _PaymentTile(application: relevant[index]),
              ),
      ),
    );
  }
}

class _PaymentTile extends StatelessWidget {
  final ApplicationModel application;

  const _PaymentTile({required this.application});

  static final _currencyFormat = NumberFormat.currency(
    locale: 'en_PH',
    symbol: '₱',
  );

  @override
  Widget build(BuildContext context) {
    final payment = application.payment;
    final needsPayment = payment == null;

    return AppCard(
      onTap: () => context.push(
        needsPayment
            ? '/applications/${application.id}/pay'
            : '/applications/${application.id}',
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  application.businessName,
                  style: AppTypography.bodyStrong,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  application.applicationNumber,
                  style: AppTypography.caption,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),
                Text(
                  needsPayment
                      ? 'Assessment not yet available'
                      : _currencyFormat.format(payment.amount),
                  style: AppTypography.cardTitle,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Flexible(
            child: StatusBadge(
              label: needsPayment ? 'Awaiting Payment' : payment.status.label,
              color: needsPayment ? AppColors.statusPending : payment.status.color,
              backgroundColor: needsPayment
                  ? AppColors.statusPendingBg
                  : payment.status.backgroundColor,
            ),
          ),
        ],
      ),
    );
  }
}
