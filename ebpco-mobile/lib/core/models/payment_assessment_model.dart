import 'package:flutter/material.dart';

import '../constants/app_colors.dart';
import 'document_model.dart';

/// Represents the status of a payment assessment in the mock dataset.
enum PaymentAssessmentStatus { notYetAvailable, pending, paid, overdue }

extension PaymentAssessmentStatusX on PaymentAssessmentStatus {
  String get label {
    switch (this) {
      case PaymentAssessmentStatus.notYetAvailable:
        return 'Not Yet Available';
      case PaymentAssessmentStatus.pending:
        return 'Pending Verification';
      case PaymentAssessmentStatus.paid:
        return 'Paid';
      case PaymentAssessmentStatus.overdue:
        return 'Overdue';
    }
  }

  Color get color {
    switch (this) {
      case PaymentAssessmentStatus.notYetAvailable:
        return AppColors.textMuted;
      case PaymentAssessmentStatus.pending:
        return AppColors.statusPending;
      case PaymentAssessmentStatus.paid:
        return AppColors.statusApproved;
      case PaymentAssessmentStatus.overdue:
        return AppColors.statusRejected;
    }
  }

  Color get backgroundColor {
    switch (this) {
      case PaymentAssessmentStatus.notYetAvailable:
        return AppColors.surfaceMuted;
      case PaymentAssessmentStatus.pending:
        return AppColors.statusPendingBg;
      case PaymentAssessmentStatus.paid:
        return AppColors.statusApprovedBg;
      case PaymentAssessmentStatus.overdue:
        return AppColors.statusRejectedBg;
    }
  }
}

/// How the user chose to settle a payment assessment.
enum PaymentMethod { bankTransfer, onsite }

extension PaymentMethodX on PaymentMethod {
  String get label =>
      this == PaymentMethod.bankTransfer ? 'Bank Transfer' : 'Onsite Payment';
}

/// Mock model describing a permit application's payment assessment.
class PaymentAssessmentModel {
  final double amount;
  final PaymentAssessmentStatus status;
  final String? referenceNumber;
  final PaymentMethod? method;
  final DocumentModel? proof;

  const PaymentAssessmentModel({
    required this.amount,
    required this.status,
    this.referenceNumber,
    this.method,
    this.proof,
  });

  PaymentAssessmentModel copyWith({
    PaymentAssessmentStatus? status,
    String? referenceNumber,
    PaymentMethod? method,
    DocumentModel? proof,
  }) {
    return PaymentAssessmentModel(
      amount: amount,
      status: status ?? this.status,
      referenceNumber: referenceNumber ?? this.referenceNumber,
      method: method ?? this.method,
      proof: proof ?? this.proof,
    );
  }
}
