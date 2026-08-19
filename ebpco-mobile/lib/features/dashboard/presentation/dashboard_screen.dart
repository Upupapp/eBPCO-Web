import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/applications_provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/notifications_provider.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../shared/widgets/buttons/primary_button.dart';
import '../../../shared/widgets/layout/responsive_card_grid.dart';
import '../../../shared/widgets/layout/section_header.dart';
import '../../../shared/widgets/search/app_search_field.dart';
import '../../../shared/widgets/states/empty_state.dart';
import 'widgets/active_application_card.dart';
import 'widgets/dashboard_header.dart';
import 'widgets/dashboard_stat_card.dart';
import 'widgets/quick_action_card.dart';
import 'widgets/recent_notification_tile.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final applicationsProvider = context.watch<ApplicationsProvider>();
    final notificationsProvider = context.watch<NotificationsProvider>();
    final user = authProvider.currentUser;
    final activeApplication = applicationsProvider.activeApplication;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        onRefresh: applicationsProvider.refresh,
        color: AppColors.primary,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              DashboardHeader(
                firstName: user?.firstName ?? 'there',
                initials: user?.initials ?? 'U',
                unreadCount: notificationsProvider.unreadCount,
                onNotificationsTap: () => context.push('/app/notifications'),
                onProfileTap: () => context.go('/app/profile'),
                searchBar: AppSearchField(
                  floating: true,
                  hint: 'Search applications, businesses...',
                  onChanged: (_) {},
                  onTap: () => context.go('/app/applications'),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppConstants.screenPaddingHorizontal,
                  vertical: 16,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    PrimaryButton(
                      label: 'Apply for Permit',
                      icon: Icons.add_circle_outline,
                      onPressed: () => context.push('/applications/new'),
                    ),
                    const SizedBox(height: 20),
                    if (activeApplication == null)
                      const EmptyState(
                        icon: Icons.folder_open_outlined,
                        title: 'No applications yet',
                        message:
                            'Register a business and apply for your first permit to see it here.',
                      )
                    else
                      ActiveApplicationCard(
                        application: activeApplication,
                        onViewDetails: () => context.push(
                          '/applications/${activeApplication.id}',
                        ),
                      ),
                    const SizedBox(height: 24),
                    const SectionHeader(title: 'Application Summary'),
                    const SizedBox(height: 12),
                    ResponsiveCardGrid(
                      mainAxisSpacing: AppSpacing.md,
                      crossAxisSpacing: AppSpacing.md,
                      children: [
                        DashboardStatCard(
                          label: 'Draft',
                          count:
                              applicationsProvider.summaryCounts['Draft'] ?? 0,
                          icon: Icons.edit_note_outlined,
                          color: AppColors.textMuted,
                        ),
                        DashboardStatCard(
                          label: 'Submitted',
                          count:
                              applicationsProvider.summaryCounts['Submitted'] ??
                              0,
                          icon: Icons.send_outlined,
                          color: AppColors.statusInfo,
                        ),
                        DashboardStatCard(
                          label: 'Approved',
                          count:
                              applicationsProvider.summaryCounts['Approved'] ??
                              0,
                          icon: Icons.check_circle_outline,
                          color: AppColors.statusApproved,
                        ),
                        DashboardStatCard(
                          label: 'Released',
                          count:
                              applicationsProvider.summaryCounts['Released'] ??
                              0,
                          icon: Icons.local_shipping_outlined,
                          color: AppColors.statusApproved,
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    const SectionHeader(title: 'Quick Actions'),
                    const SizedBox(height: 12),
                    ResponsiveCardGrid(
                      mainAxisSpacing: AppSpacing.md,
                      crossAxisSpacing: AppSpacing.md,
                      children: [
                        QuickActionCard(
                          label: 'Apply for Permit',
                          icon: Icons.add_circle_outline,
                          onTap: () => context.push('/applications/new'),
                        ),
                        QuickActionCard(
                          label: 'View Applications',
                          icon: Icons.folder_outlined,
                          onTap: () => context.go('/app/applications'),
                        ),
                        QuickActionCard(
                          label: 'Check Payments',
                          icon: Icons.payments_outlined,
                          onTap: () => context.go('/app/payments'),
                        ),
                        QuickActionCard(
                          label: 'My Businesses',
                          icon: Icons.storefront_outlined,
                          onTap: () => context.push('/business'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    SectionHeader(
                      title: 'Recent Notifications',
                      actionLabel: 'See All',
                      onActionTap: () => context.push('/app/notifications'),
                    ),
                    const SizedBox(height: 8),
                    ...notificationsProvider.recent.map(
                      (notification) => Padding(
                        padding: const EdgeInsets.only(bottom: 4),
                        child: RecentNotificationTile(
                          notification: notification,
                          onTap: () => context.push('/app/notifications'),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
