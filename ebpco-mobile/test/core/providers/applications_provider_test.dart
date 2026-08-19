import 'package:flutter_test/flutter_test.dart';

import 'package:ebpco_user_app/core/models/application_model.dart';
import 'package:ebpco_user_app/core/models/payment_assessment_model.dart';
import 'package:ebpco_user_app/core/providers/applications_provider.dart';
import 'package:ebpco_user_app/core/providers/notifications_provider.dart';

void main() {
  group('ApplicationsProvider demo journey', () {
    test(
      'submit -> underReview -> pay -> paymentVerification -> approved -> released, posting a notification at each step',
      () async {
        final notifications = NotificationsProvider();
        final applications = ApplicationsProvider(notifications: notifications);
        // Let both providers' initial mock-repository loads settle before
        // taking a baseline, so seeded notifications aren't mistaken for
        // ones posted by the actions below.
        await Future.delayed(const Duration(milliseconds: 1200));
        final baselineNotificationCount = notifications.notifications.length;

        final submitted = await applications.submitApplication(
          businessId: 'biz-seed-1',
          businessName: "Juan's General Merchandise",
          type: ApplicationType.newPermit,
          documents: const [],
        );
        expect(submitted.status, ApplicationStatus.submitted);
        expect(
          notifications.notifications.length,
          baselineNotificationCount + 1,
        );
        expect(
          notifications.notifications.first.title,
          contains('submitted'),
        );

        final underReview = await applications.advanceStatus(submitted.id);
        expect(underReview.status, ApplicationStatus.underReview);

        final paid = await applications.attachPayment(
          submitted.id,
          method: PaymentMethod.bankTransfer,
        );
        expect(paid.status, ApplicationStatus.paymentVerification);
        expect(paid.payment, isNotNull);
        expect(paid.payment!.status, PaymentAssessmentStatus.pending);

        final approved = await applications.advanceStatus(submitted.id);
        expect(approved.status, ApplicationStatus.approved);
        expect(approved.payment!.status, PaymentAssessmentStatus.paid);

        final released = await applications.advanceStatus(submitted.id);
        expect(released.status, ApplicationStatus.released);
        expect(released.permitNumber, isNotNull);
        expect(released.issuedDate, isNotNull);

        // Sequence is exhausted: advancing again is a no-op.
        final unchanged = await applications.advanceStatus(submitted.id);
        expect(unchanged.status, ApplicationStatus.released);
      },
    );
  });
}
