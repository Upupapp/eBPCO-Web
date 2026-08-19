import '../core/models/application_model.dart';
import '../core/models/document_model.dart';

/// Seed data for [MockApplicationsRepository] — one in-progress application
/// against the seed business so the dashboard isn't empty on first login.
ApplicationModel buildSeedApplication() {
  final submitted = DateTime.now().subtract(const Duration(days: 3));
  return ApplicationModel(
    id: 'app-seed-1',
    applicationNumber: 'E-BPCO-2026-000145',
    businessId: 'biz-seed-1',
    businessName: "Juan's General Merchandise",
    type: ApplicationType.newPermit,
    status: ApplicationStatus.underReview,
    submittedDate: submitted,
    documents: [
      DocumentModel(
        id: 'doc-seed-1',
        label: 'Valid Government ID',
        fileName: 'valid_id.jpg',
        uploadedAt: submitted,
      ),
      DocumentModel(
        id: 'doc-seed-2',
        label: 'Barangay Clearance',
        fileName: 'barangay_clearance.pdf',
        uploadedAt: submitted,
      ),
    ],
    statusHistory: [
      StatusHistoryEntry(status: ApplicationStatus.submitted, timestamp: submitted),
      StatusHistoryEntry(
        status: ApplicationStatus.underReview,
        timestamp: submitted.add(const Duration(hours: 5)),
      ),
    ],
  );
}
