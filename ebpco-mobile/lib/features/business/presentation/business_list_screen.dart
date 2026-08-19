import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/models/business_model.dart';
import '../../../core/providers/business_provider.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/badges/status_badge.dart';
import '../../../shared/widgets/buttons/primary_button.dart';
import '../../../shared/widgets/cards/app_card.dart';
import '../../../shared/widgets/search/app_search_field.dart';
import '../../../shared/widgets/states/empty_state.dart';
import '../../../shared/widgets/states/loading_view.dart';

class BusinessListScreen extends StatefulWidget {
  const BusinessListScreen({super.key});

  @override
  State<BusinessListScreen> createState() => _BusinessListScreenState();
}

class _BusinessListScreenState extends State<BusinessListScreen> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final businessProvider = context.watch<BusinessProvider>();
    final query = _query.trim().toLowerCase();
    final businesses = businessProvider.businesses
        .where((b) => query.isEmpty || b.name.toLowerCase().contains(query))
        .toList();
    final hasAnyBusiness = businessProvider.businesses.isNotEmpty;

    return Scaffold(
      appBar: AppBar(title: const Text('My Businesses')),
      body: SafeArea(
        child: businessProvider.isLoading
            ? const LoadingView()
            : Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(
                      AppConstants.screenPaddingHorizontal,
                      12,
                      AppConstants.screenPaddingHorizontal,
                      0,
                    ),
                    child: AppSearchField(
                      hint: 'Search businesses',
                      onChanged: (value) => setState(() => _query = value),
                    ),
                  ),
                  Expanded(
                    child: businesses.isEmpty
                        ? EmptyState(
                            icon: Icons.storefront_outlined,
                            title: hasAnyBusiness
                                ? 'No matching businesses'
                                : 'No registered businesses yet',
                            message: hasAnyBusiness
                                ? 'Try a different search term.'
                                : 'Register your first business to start applying for permits.',
                            action: hasAnyBusiness
                                ? null
                                : PrimaryButton(
                                    label: 'Register Business',
                                    onPressed: () =>
                                        context.push('/business/register'),
                                  ),
                          )
                        : ListView.separated(
                            padding: const EdgeInsets.all(
                              AppConstants.screenPaddingHorizontal,
                            ),
                            itemCount: businesses.length,
                            separatorBuilder: (context, index) =>
                                const SizedBox(height: 12),
                            itemBuilder: (context, index) {
                              final business = businesses[index];
                              return AppCard(
                                onTap: () =>
                                    context.push('/business/${business.id}'),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            business.name,
                                            style: AppTypography.cardTitle,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          const SizedBox(height: 2),
                                          Text(
                                            business.category.label,
                                            style: AppTypography.caption,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Flexible(
                                      child: StatusBadge(
                                        label: business.status.label,
                                        color: business.status.color,
                                        backgroundColor:
                                            business.status.backgroundColor,
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                  ),
                ],
              ),
      ),
      floatingActionButton: !hasAnyBusiness
          ? null
          : FloatingActionButton.extended(
              onPressed: () => context.push('/business/register'),
              icon: const Icon(Icons.add),
              label: const Text('Register Business'),
            ),
    );
  }
}
