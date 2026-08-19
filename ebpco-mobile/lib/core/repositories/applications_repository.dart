import '../../mock/mock_applications_data.dart';
import '../constants/app_constants.dart';
import '../models/application_model.dart';
import '../models/document_model.dart';
import '../models/payment_assessment_model.dart';

/// Source of a user's permit applications. Swap [MockApplicationsRepository]
/// for a real HTTP-backed implementation once a backend exists — callers
/// only depend on this interface.
abstract class ApplicationsRepository {
  Future<List<ApplicationModel>> fetchAll();

  Future<ApplicationModel> submitApplication({
    required String businessId,
    required String businessName,
    required ApplicationType type,
    required List<DocumentModel> documents,
  });

  Future<ApplicationModel> attachPayment(
    String applicationId, {
    required PaymentMethod method,
    DocumentModel? proof,
  });

  /// Moves the application to the next status in [applicationStatusSequence].
  /// No-op (returns the application unchanged) if it's already at the end.
  Future<ApplicationModel> advanceStatus(String applicationId);
}

class MockApplicationsRepository implements ApplicationsRepository {
  final List<ApplicationModel> _applications = [buildSeedApplication()];

  @override
  Future<List<ApplicationModel>> fetchAll() async {
    await Future.delayed(AppConstants.mockNetworkDelay);
    return List.unmodifiable(_applications);
  }

  @override
  Future<ApplicationModel> submitApplication({
    required String businessId,
    required String businessName,
    required ApplicationType type,
    required List<DocumentModel> documents,
  }) async {
    await Future.delayed(AppConstants.mockNetworkDelay);
    final now = DateTime.now();
    final sequence = (_applications.length + 1).toString().padLeft(6, '0');
    final application = ApplicationModel(
      id: 'app-${now.microsecondsSinceEpoch}',
      applicationNumber: 'E-BPCO-${now.year}-$sequence',
      businessId: businessId,
      businessName: businessName,
      type: type,
      status: ApplicationStatus.submitted,
      submittedDate: now,
      documents: documents,
      statusHistory: [
        StatusHistoryEntry(status: ApplicationStatus.submitted, timestamp: now),
      ],
    );
    _applications.add(application);
    return application;
  }

  @override
  Future<ApplicationModel> attachPayment(
    String applicationId, {
    required PaymentMethod method,
    DocumentModel? proof,
  }) async {
    await Future.delayed(AppConstants.mockNetworkDelay);
    final index = _applications.indexWhere((a) => a.id == applicationId);
    if (index == -1) {
      throw StateError('Application $applicationId not found.');
    }
    final application = _applications[index];
    final amount = applicationTypeAssessmentAmounts[application.type] ?? 5250.0;
    final updated = application.copyWith(
      status: ApplicationStatus.paymentVerification,
      payment: PaymentAssessmentModel(
        amount: amount,
        status: PaymentAssessmentStatus.pending,
        referenceNumber: 'OR-${DateTime.now().microsecondsSinceEpoch}',
        method: method,
        proof: proof,
      ),
      statusHistory: [
        ...application.statusHistory,
        StatusHistoryEntry(
          status: ApplicationStatus.paymentVerification,
          timestamp: DateTime.now(),
        ),
      ],
    );
    _applications[index] = updated;
    return updated;
  }

  @override
  Future<ApplicationModel> advanceStatus(String applicationId) async {
    await Future.delayed(AppConstants.mockNetworkDelay);
    final index = _applications.indexWhere((a) => a.id == applicationId);
    if (index == -1) {
      throw StateError('Application $applicationId not found.');
    }
    final application = _applications[index];
    final currentIndex = applicationStatusSequence.indexOf(application.status);
    if (currentIndex == -1 ||
        currentIndex == applicationStatusSequence.length - 1) {
      return application;
    }

    final nextStatus = applicationStatusSequence[currentIndex + 1];
    final now = DateTime.now();
    final isReleased = nextStatus == ApplicationStatus.released;
    final updated = application.copyWith(
      status: nextStatus,
      payment:
          nextStatus == ApplicationStatus.approved &&
              application.payment != null
          ? application.payment!.copyWith(status: PaymentAssessmentStatus.paid)
          : application.payment,
      permitNumber: isReleased
          ? 'PERMIT-${now.year}-${(index + 1).toString().padLeft(6, '0')}'
          : application.permitNumber,
      issuedDate: isReleased ? now : application.issuedDate,
      statusHistory: [
        ...application.statusHistory,
        StatusHistoryEntry(status: nextStatus, timestamp: now),
      ],
    );
    _applications[index] = updated;
    return updated;
  }
}
