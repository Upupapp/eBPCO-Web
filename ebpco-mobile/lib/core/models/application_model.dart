import 'package:flutter/material.dart';

import '../constants/app_colors.dart';
import 'document_model.dart';
import 'payment_assessment_model.dart';

/// The kind of permit action an application represents.
enum ApplicationType { newPermit, renewal, amendment }

extension ApplicationTypeX on ApplicationType {
  String get label {
    switch (this) {
      case ApplicationType.newPermit:
        return 'New Business Permit';
      case ApplicationType.renewal:
        return 'Permit Renewal';
      case ApplicationType.amendment:
        return 'Permit Amendment';
    }
  }
}

/// Represents the status of a permit application in the mock dataset.
/// The happy-path demo sequence is: submitted -> underReview ->
/// paymentVerification -> approved -> released. `draft` precedes
/// submission; `rejected` is a terminal branch outside the guided
/// "Simulate Next Update" sequence.
enum ApplicationStatus {
  draft,
  submitted,
  underReview,
  paymentVerification,
  approved,
  released,
  rejected,
}

/// The order status advances through when the user or the "Simulate Next
/// Update" action moves an application forward.
const applicationStatusSequence = [
  ApplicationStatus.submitted,
  ApplicationStatus.underReview,
  ApplicationStatus.paymentVerification,
  ApplicationStatus.approved,
  ApplicationStatus.released,
];

/// The fixed checklist of requirement labels shown in the New Application
/// wizard's document-upload step.
const requiredDocumentLabels = [
  'Valid Government ID',
  'Barangay Clearance',
  'Proof of Business Address',
];

/// Mock assessment fee per application type, shared by the repository
/// (which stamps it onto the payment record) and the payment screen (which
/// needs to display it before the assessment record exists).
const applicationTypeAssessmentAmounts = {
  ApplicationType.newPermit: 5250.0,
  ApplicationType.renewal: 3200.0,
  ApplicationType.amendment: 1500.0,
};

extension ApplicationStatusX on ApplicationStatus {
  String get label {
    switch (this) {
      case ApplicationStatus.draft:
        return 'Draft';
      case ApplicationStatus.submitted:
        return 'Submitted';
      case ApplicationStatus.underReview:
        return 'Under Review';
      case ApplicationStatus.paymentVerification:
        return 'Payment Verification';
      case ApplicationStatus.approved:
        return 'Approved';
      case ApplicationStatus.released:
        return 'Ready for Release';
      case ApplicationStatus.rejected:
        return 'Rejected';
    }
  }

  Color get color {
    switch (this) {
      case ApplicationStatus.draft:
        return AppColors.textMuted;
      case ApplicationStatus.submitted:
        return AppColors.statusInfo;
      case ApplicationStatus.underReview:
      case ApplicationStatus.paymentVerification:
        return AppColors.statusPending;
      case ApplicationStatus.approved:
      case ApplicationStatus.released:
        return AppColors.statusApproved;
      case ApplicationStatus.rejected:
        return AppColors.statusRejected;
    }
  }

  Color get backgroundColor {
    switch (this) {
      case ApplicationStatus.draft:
        return AppColors.surfaceMuted;
      case ApplicationStatus.submitted:
        return AppColors.statusInfoBg;
      case ApplicationStatus.underReview:
      case ApplicationStatus.paymentVerification:
        return AppColors.statusPendingBg;
      case ApplicationStatus.approved:
      case ApplicationStatus.released:
        return AppColors.statusApprovedBg;
      case ApplicationStatus.rejected:
        return AppColors.statusRejectedBg;
    }
  }
}

/// One entry in an application's status timeline.
class StatusHistoryEntry {
  final ApplicationStatus status;
  final DateTime timestamp;

  const StatusHistoryEntry({required this.status, required this.timestamp});
}

/// Mock model describing a permit application.
class ApplicationModel {
  final String id;
  final String applicationNumber;
  final String businessId;
  final String businessName;
  final ApplicationType type;
  final ApplicationStatus status;
  final DateTime submittedDate;
  final List<DocumentModel> documents;
  final PaymentAssessmentModel? payment;
  final String? permitNumber;
  final DateTime? issuedDate;
  final List<StatusHistoryEntry> statusHistory;

  const ApplicationModel({
    required this.id,
    required this.applicationNumber,
    required this.businessId,
    required this.businessName,
    required this.type,
    required this.status,
    required this.submittedDate,
    this.documents = const [],
    this.payment,
    this.permitNumber,
    this.issuedDate,
    this.statusHistory = const [],
  });

  /// Fraction of the happy-path sequence completed, for progress bars.
  double get progress {
    final index = applicationStatusSequence.indexOf(status);
    if (index == -1) return 0;
    return (index + 1) / applicationStatusSequence.length;
  }

  String get nextStep {
    switch (status) {
      case ApplicationStatus.draft:
        return 'Complete and submit your application.';
      case ApplicationStatus.submitted:
        return 'Wait for the initial document evaluation.';
      case ApplicationStatus.underReview:
        return 'An evaluator is reviewing your submitted requirements.';
      case ApplicationStatus.paymentVerification:
        return payment == null
            ? 'Proceed to payment to continue processing.'
            : 'Your payment is being verified by the office.';
      case ApplicationStatus.approved:
        return 'Your permit is being prepared for release.';
      case ApplicationStatus.released:
        return 'Your permit is ready for release.';
      case ApplicationStatus.rejected:
        return 'Review the rejection details before resubmitting.';
    }
  }

  ApplicationModel copyWith({
    ApplicationStatus? status,
    List<DocumentModel>? documents,
    PaymentAssessmentModel? payment,
    String? permitNumber,
    DateTime? issuedDate,
    List<StatusHistoryEntry>? statusHistory,
  }) {
    return ApplicationModel(
      id: id,
      applicationNumber: applicationNumber,
      businessId: businessId,
      businessName: businessName,
      type: type,
      status: status ?? this.status,
      submittedDate: submittedDate,
      documents: documents ?? this.documents,
      payment: payment ?? this.payment,
      permitNumber: permitNumber ?? this.permitNumber,
      issuedDate: issuedDate ?? this.issuedDate,
      statusHistory: statusHistory ?? this.statusHistory,
    );
  }
}
