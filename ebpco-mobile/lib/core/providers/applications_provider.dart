import 'package:flutter/material.dart';

import '../models/application_model.dart';
import '../models/document_model.dart';
import '../models/payment_assessment_model.dart';
import '../repositories/applications_repository.dart';
import 'notifications_provider.dart';

/// Holds the user's permit applications, sourced from
/// [ApplicationsRepository]. Submitting, paying, and advancing an
/// application's status each post a matching notification via
/// [NotificationsProvider].
class ApplicationsProvider extends ChangeNotifier {
  ApplicationsProvider({
    required this._notifications,
    ApplicationsRepository? repository,
  }) : _repository = repository ?? MockApplicationsRepository() {
    _load();
  }

  final ApplicationsRepository _repository;
  final NotificationsProvider _notifications;

  bool _isLoading = true;
  List<ApplicationModel> _applications = const [];

  bool get isLoading => _isLoading;
  List<ApplicationModel> get applications => _applications;

  /// Most relevant application for the dashboard's summary card: the most
  /// recently submitted one that hasn't reached the end of the happy path.
  ApplicationModel? get activeApplication {
    if (_applications.isEmpty) return null;
    final inProgress = _applications.where(
      (a) =>
          a.status != ApplicationStatus.released &&
          a.status != ApplicationStatus.rejected,
    );
    final pool = inProgress.isNotEmpty ? inProgress : _applications;
    return pool.reduce(
      (a, b) => a.submittedDate.isAfter(b.submittedDate) ? a : b,
    );
  }

  Map<String, int> get summaryCounts {
    final counts = <String, int>{
      'Draft': 0,
      'Submitted': 0,
      'Approved': 0,
      'Released': 0,
    };
    for (final application in _applications) {
      switch (application.status) {
        case ApplicationStatus.draft:
          counts['Draft'] = counts['Draft']! + 1;
        case ApplicationStatus.submitted:
        case ApplicationStatus.underReview:
        case ApplicationStatus.paymentVerification:
          counts['Submitted'] = counts['Submitted']! + 1;
        case ApplicationStatus.approved:
          counts['Approved'] = counts['Approved']! + 1;
        case ApplicationStatus.released:
          counts['Released'] = counts['Released']! + 1;
        case ApplicationStatus.rejected:
          break;
      }
    }
    return counts;
  }

  ApplicationModel? byId(String id) {
    for (final application in _applications) {
      if (application.id == id) return application;
    }
    return null;
  }

  Future<void> _load() async {
    _applications = await _repository.fetchAll();
    _isLoading = false;
    notifyListeners();
  }

  Future<void> refresh() => _load();

  Future<ApplicationModel> submitApplication({
    required String businessId,
    required String businessName,
    required ApplicationType type,
    required List<DocumentModel> documents,
  }) async {
    final application = await _repository.submitApplication(
      businessId: businessId,
      businessName: businessName,
      type: type,
      documents: documents,
    );
    _applications = [..._applications, application];
    notifyListeners();
    _notifications.addNotification(
      title: 'Application submitted successfully',
      message:
          'Your ${type.label} application ${application.applicationNumber} has been received.',
      icon: Icons.check_circle_outline,
    );
    return application;
  }

  Future<ApplicationModel> attachPayment(
    String applicationId, {
    required PaymentMethod method,
    DocumentModel? proof,
  }) async {
    final updated = await _repository.attachPayment(
      applicationId,
      method: method,
      proof: proof,
    );
    _replace(updated);
    _notifications.addNotification(
      title: 'Payment submitted for verification',
      message:
          'Your ${method.label} payment for ${updated.applicationNumber} is now being verified.',
      icon: Icons.payments_outlined,
    );
    return updated;
  }

  Future<ApplicationModel> advanceStatus(String applicationId) async {
    final updated = await _repository.advanceStatus(applicationId);
    _replace(updated);
    _notifications.addNotification(
      title: _statusNotificationTitle(updated.status),
      message: _statusNotificationMessage(updated),
      icon: _statusNotificationIcon(updated.status),
    );
    return updated;
  }

  void _replace(ApplicationModel updated) {
    _applications = [
      for (final application in _applications)
        if (application.id == updated.id) updated else application,
    ];
    notifyListeners();
  }

  String _statusNotificationTitle(ApplicationStatus status) {
    switch (status) {
      case ApplicationStatus.underReview:
        return 'Your documents are under initial review';
      case ApplicationStatus.paymentVerification:
        return 'Awaiting payment verification';
      case ApplicationStatus.approved:
        return 'Application approved';
      case ApplicationStatus.released:
        return 'Permit ready for release';
      default:
        return 'Application update';
    }
  }

  String _statusNotificationMessage(ApplicationModel application) {
    switch (application.status) {
      case ApplicationStatus.underReview:
        return 'An evaluator is checking the requirements for ${application.applicationNumber}.';
      case ApplicationStatus.paymentVerification:
        return 'Your payment for ${application.applicationNumber} is being verified by the office.';
      case ApplicationStatus.approved:
        return 'Your ${application.type.label} application has been approved.';
      case ApplicationStatus.released:
        return 'Permit ${application.permitNumber} is ready for release.';
      default:
        return '${application.applicationNumber} has a new status: ${application.status.label}.';
    }
  }

  IconData _statusNotificationIcon(ApplicationStatus status) {
    switch (status) {
      case ApplicationStatus.underReview:
        return Icons.fact_check_outlined;
      case ApplicationStatus.paymentVerification:
        return Icons.payments_outlined;
      case ApplicationStatus.approved:
        return Icons.verified_outlined;
      case ApplicationStatus.released:
        return Icons.local_shipping_outlined;
      default:
        return Icons.notifications_active_outlined;
    }
  }
}
