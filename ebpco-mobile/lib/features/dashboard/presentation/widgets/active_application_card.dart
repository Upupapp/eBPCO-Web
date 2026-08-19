import 'package:flutter/material.dart';

import '../../../../core/models/application_model.dart';
import '../../../../shared/widgets/cards/tracking_card.dart';

/// Card showing the user's active permit application with progress and
/// a "View Details" action.
class ActiveApplicationCard extends StatelessWidget {
  final ApplicationModel application;
  final VoidCallback onViewDetails;

  const ActiveApplicationCard({
    super.key,
    required this.application,
    required this.onViewDetails,
  });

  @override
  Widget build(BuildContext context) {
    return TrackingCard(
      trackingId: application.applicationNumber,
      title: application.businessName,
      subtitle: application.type.label,
      statusLabel: application.status.label,
      statusColor: application.status.color,
      statusBackgroundColor: application.status.backgroundColor,
      progress: application.progress,
      footerText: application.nextStep,
      actionLabel: 'View Details',
      onAction: onViewDetails,
    );
  }
}
