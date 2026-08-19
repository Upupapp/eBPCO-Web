import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../../core/models/application_model.dart';
import '../../../core/models/business_model.dart';
import '../../../core/providers/applications_provider.dart';
import '../../../core/providers/business_provider.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/badges/status_badge.dart';
import '../../../shared/widgets/buttons/primary_button.dart';
import '../../../shared/widgets/cards/app_card.dart';
import '../../../shared/widgets/states/empty_state.dart';

class BusinessDetailsScreen extends StatelessWidget {
  final String businessId;

  const BusinessDetailsScreen({super.key, required this.businessId});

  @override
  Widget build(BuildContext context) {
    final business = context.watch<BusinessProvider>().byId(businessId);
    final applications = context
        .watch<ApplicationsProvider>()
        .applications
        .where((application) => application.businessId == businessId)
        .toList();

    if (business == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Business')),
        body: const Center(child: Text('This business could not be found.')),
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text(business.name)),
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
                          business.name,
                          style: AppTypography.sectionTitle,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Flexible(
                        child: StatusBadge(
                          label: business.status.label,
                          color: business.status.color,
                          backgroundColor: business.status.backgroundColor,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(business.category.label, style: AppTypography.bodyMuted),
                  const SizedBox(height: 16),
                  _InfoRow(
                    label: 'Registration No.',
                    value: business.registrationNumber,
                  ),
                  _InfoRow(label: 'Address', value: business.fullAddress),
                  _InfoRow(
                    label: 'Date Registered',
                    value: DateFormat(
                      'MMMM d, yyyy',
                    ).format(business.dateRegistered),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            PrimaryButton(
              label: 'Apply for Permit',
              icon: Icons.add_circle_outline,
              onPressed: () =>
                  context.push('/applications/new', extra: business.id),
            ),
            const SizedBox(height: 24),
            Text('Applications', style: AppTypography.cardTitle),
            const SizedBox(height: 12),
            if (applications.isEmpty)
              const EmptyState(
                icon: Icons.folder_open_outlined,
                title: 'No applications yet',
                message:
                    'Applications submitted for this business will appear here.',
              )
            else
              ...applications.map(
                (application) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: AppCard(
                    onTap: () =>
                        context.push('/applications/${application.id}'),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                application.applicationNumber,
                                style: AppTypography.bodyStrong,
                                overflow: TextOverflow.ellipsis,
                              ),
                              Text(
                                application.type.label,
                                style: AppTypography.caption,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
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
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppTypography.caption),
          const SizedBox(height: 2),
          Text(value, style: AppTypography.bodyStrong),
        ],
      ),
    );
  }
}
