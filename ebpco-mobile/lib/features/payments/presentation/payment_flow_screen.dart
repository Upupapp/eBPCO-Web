import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/models/application_model.dart';
import '../../../core/models/document_model.dart';
import '../../../core/models/payment_assessment_model.dart';
import '../../../core/providers/applications_provider.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/alerts/app_alert.dart';
import '../../../shared/widgets/buttons/primary_button.dart';
import '../../../shared/widgets/cards/app_card.dart';
import '../../../shared/widgets/uploads/document_upload_tile.dart';

/// Choose a payment method for a specific application's assessment, then
/// simulate confirming it: Bank Transfer requires a proof-of-payment
/// attachment, Onsite Payment just needs to be marked as paid.
class PaymentFlowScreen extends StatefulWidget {
  final String applicationId;

  const PaymentFlowScreen({super.key, required this.applicationId});

  @override
  State<PaymentFlowScreen> createState() => _PaymentFlowScreenState();
}

class _PaymentFlowScreenState extends State<PaymentFlowScreen> {
  static final _currencyFormat = NumberFormat.currency(
    locale: 'en_PH',
    symbol: '₱',
  );

  PaymentMethod? _method;
  DocumentModel? _proof;
  bool _isSubmitting = false;

  void _handleUploadProof() {
    setState(() {
      _proof = DocumentModel(
        id: 'doc-${DateTime.now().microsecondsSinceEpoch}',
        label: 'Proof of Payment',
        fileName: 'proof_of_payment.jpg',
        uploadedAt: DateTime.now(),
      );
    });
  }

  Future<void> _handleConfirm() async {
    final method = _method;
    if (method == null) return;
    if (method == PaymentMethod.bankTransfer && _proof == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please upload your proof of payment to continue.'),
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    await context.read<ApplicationsProvider>().attachPayment(
      widget.applicationId,
      method: method,
      proof: _proof,
    );

    if (!mounted) return;
    setState(() => _isSubmitting = false);
    context.pop();
  }

  @override
  Widget build(BuildContext context) {
    final application = context.watch<ApplicationsProvider>().byId(
      widget.applicationId,
    );

    if (application == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Payment')),
        body: const Center(
          child: Text('This application could not be found.'),
        ),
      );
    }

    final amount = applicationTypeAssessmentAmounts[application.type] ?? 5250.0;

    return Scaffold(
      appBar: AppBar(title: const Text('Pay Assessment')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Total Assessment',
                    style: AppTypography.body.copyWith(
                      color: AppColors.textOnPrimaryMuted,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    _currencyFormat.format(amount),
                    style: AppTypography.statistic.copyWith(
                      color: AppColors.textOnPrimary,
                      fontSize: 30,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    application.applicationNumber,
                    style: AppTypography.caption.copyWith(
                      color: AppColors.textOnPrimaryMuted,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Text('Choose Payment Method', style: AppTypography.cardTitle),
            const SizedBox(height: 12),
            _MethodOption(
              icon: Icons.account_balance_outlined,
              label: 'Bank Transfer',
              selected: _method == PaymentMethod.bankTransfer,
              onTap: () => setState(() => _method = PaymentMethod.bankTransfer),
            ),
            const SizedBox(height: 10),
            _MethodOption(
              icon: Icons.storefront_outlined,
              label: 'Onsite Payment',
              selected: _method == PaymentMethod.onsite,
              onTap: () => setState(() => _method = PaymentMethod.onsite),
            ),
            if (_method == PaymentMethod.bankTransfer) ...[
              const SizedBox(height: 20),
              const AppAlert(
                variant: AppAlertVariant.info,
                title: 'Bank Transfer Details',
                message:
                    'Account Name: eBPCO Business Permits\n'
                    'Account Number: 1234-5678-90\n'
                    'Bank: BPI',
              ),
              const SizedBox(height: 16),
              DocumentUploadTile(
                label: 'Proof of Payment',
                document: _proof,
                onUpload: _handleUploadProof,
                onRemove: () => setState(() => _proof = null),
              ),
            ],
            if (_method == PaymentMethod.onsite) ...[
              const SizedBox(height: 20),
              const AppAlert(
                variant: AppAlertVariant.info,
                title: 'Onsite Payment Instructions',
                message:
                    'Pay directly at the Business Permit and Clearance Office '
                    'counter, then mark this payment as paid.',
              ),
            ],
            const SizedBox(height: 28),
            PrimaryButton(
              label: _method == PaymentMethod.onsite
                  ? 'Mark as Paid'
                  : 'Confirm Payment',
              isLoading: _isSubmitting,
              onPressed: _method == null ? null : _handleConfirm,
            ),
          ],
        ),
      ),
    );
  }
}

class _MethodOption extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _MethodOption({
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
      child: Row(
        children: [
          Icon(icon, color: AppColors.primary),
          const SizedBox(width: 12),
          Expanded(child: Text(label, style: AppTypography.bodyStrong)),
          Icon(
            selected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
            color: selected ? AppColors.primary : AppColors.textMuted,
          ),
        ],
      ),
    );
  }
}
