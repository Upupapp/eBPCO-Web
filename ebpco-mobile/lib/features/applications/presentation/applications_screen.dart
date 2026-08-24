import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import 'widgets/application_option_card.dart';
import 'widgets/before_you_start_card.dart';

/// One catalog entry on the Applications page. Only entries with a
/// non-null [routePath] have a real destination — every other entry is a
/// placeholder for a workflow that hasn't been built yet.
class _PermitOption {
  final IconData icon;
  final String title;
  final String description;
  final String? routePath;

  const _PermitOption({
    required this.icon,
    required this.title,
    required this.description,
    this.routePath,
  });
}

/// Landing page for the "Applications" tab: a catalog of every permit type
/// the user can file, grouped into "Building Permit", "Ancillary Permits",
/// "Other Permits", and "Certificates". Every entry now has a completed
/// workflow; [_PermitOption.routePath] remains nullable so a future
/// catalog entry can still be added as a "coming soon" placeholder before
/// its own dedicated flow is built.
class ApplicationsScreen extends StatelessWidget {
  const ApplicationsScreen({super.key});

  static const _buildingPermitOptions = [
    _PermitOption(
      icon: Icons.add_home_work_outlined,
      title: 'New Construction',
      description:
          'For building a completely new structure or property from the ground up, such as houses, commercial buildings, or facilities.',
      routePath: '/applications/new/building-permit',
    ),
    _PermitOption(
      icon: Icons.handyman_outlined,
      title: 'Renovation / Alteration',
      description:
          'For improving, remodeling, or upgrading an existing structure without significantly increasing its size or floor area.',
      routePath: '/applications/new/renovation-permit',
    ),
    _PermitOption(
      icon: Icons.open_in_full_rounded,
      title: 'Addition / Extension',
      description:
          'For adding new spaces or expanding parts of an existing building, such as additional rooms, floors, or attached structures.',
      routePath: '/applications/new/addition-extension-permit',
    ),
    _PermitOption(
      icon: Icons.domain_disabled_outlined,
      title: 'Demolition',
      description:
          'For safely removing or tearing down an existing structure, building, or portion of a property.',
      routePath: '/applications/new/demolition-permit',
    ),
    _PermitOption(
      icon: Icons.map_outlined,
      title: 'Zoning / Locational Clearance',
      description:
          'For confirming that a proposed land use or structure complies with the zoning ordinance before filing a Building Permit.',
      routePath: '/applications/new/zoning-permit',
    ),
  ];

  static const _ancillaryPermitOptions = [
    _PermitOption(
      icon: Icons.architecture_outlined,
      title: 'Architectural',
      description: 'For the architectural design and layout of the structure.',
      routePath: '/applications/new/architectural-permit',
    ),
    _PermitOption(
      icon: Icons.engineering_outlined,
      title: 'Civil / Structural',
      description:
          'For the structural framework, foundation, and load-bearing design.',
      routePath: '/applications/new/civil-structural-permit',
    ),
    _PermitOption(
      icon: Icons.electrical_services_outlined,
      title: 'Electrical',
      description: 'For electrical wiring, distribution, and installation.',
      routePath: '/applications/new/electrical-permit',
    ),
    _PermitOption(
      icon: Icons.precision_manufacturing_outlined,
      title: 'Mechanical',
      description:
          'For mechanical systems such as HVAC and other equipment installations.',
      routePath: '/applications/new/mechanical-permit',
    ),
    _PermitOption(
      icon: Icons.plumbing_outlined,
      title: 'Sanitary',
      description:
          'For water supply, drainage, plumbing fixtures, and sanitary sewage disposal system installations.',
      routePath: '/applications/new/sanitary-plumbing-permit',
    ),
    _PermitOption(
      icon: Icons.water_damage_outlined,
      title: 'Plumbing',
      description:
          'For plumbing fixtures, water distribution, sewage, septic tank, and storm drainage installations.',
      routePath: '/applications/new/plumbing-permit',
    ),
    _PermitOption(
      icon: Icons.memory_outlined,
      title: 'Electronics',
      description:
          'For electronic systems such as fire alarms, CCTV, and communication wiring.',
      routePath: '/applications/new/electronics-permit',
    ),
    _PermitOption(
      icon: Icons.chair_outlined,
      title: 'Interior Design',
      description: 'For interior design and fit-out of enclosed spaces.',
      routePath: '/applications/new/interior-design-permit',
    ),
  ];

  static const _otherPermitOptions = [
    _PermitOption(
      icon: Icons.border_all_outlined,
      title: 'Fencing',
      description:
          'For construction of perimeter fences and walls around a property.',
      routePath: '/applications/new/fencing-permit',
    ),
    _PermitOption(
      icon: Icons.campaign_outlined,
      title: 'Sign Permit',
      description:
          'For installation of business signages, billboards, and similar structures.',
      routePath: '/applications/new/sign-permit',
    ),
    _PermitOption(
      icon: Icons.terrain_outlined,
      title: 'Excavation',
      description:
          'For ground excavation, earthworks, and site preparation activities.',
      routePath: '/applications/new/excavation-permit',
    ),
  ];

  static const _certificateOptions = [
    _PermitOption(
      icon: Icons.local_fire_department_outlined,
      title: 'FSEC for Building Permit (BFP)',
      description:
          'Fire Safety Evaluation Clearance — a Bureau of Fire Protection prerequisite for Building Permit approval.',
      routePath: '/applications/new/fsec-permit',
    ),
    _PermitOption(
      icon: Icons.verified_outlined,
      title: 'Certificate of Occupancy',
      description:
          'Apply for a certificate of occupancy after building completion.',
      routePath: '/applications/new/certificate-of-occupancy',
    ),
    _PermitOption(
      icon: Icons.verified_user_outlined,
      title: 'FSIC for Occupancy Permit (BFP)',
      description:
          'Fire Safety Inspection Certificate — a Bureau of Fire Protection prerequisite for a Certificate of Occupancy.',
      routePath: '/applications/new/fsic-permit',
    ),
  ];

  void _showComingSoon(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('This permit will be available in a future update.'),
      ),
    );
  }

  void _handleTap(BuildContext context, _PermitOption option) {
    final routePath = option.routePath;
    if (routePath != null) {
      context.push(routePath);
    } else {
      _showComingSoon(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Applications')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(
            AppConstants.screenPaddingHorizontal,
            AppSpacing.lg,
            AppConstants.screenPaddingHorizontal,
            AppSpacing.xxl,
          ),
          children: [
            Text(
              'Choose the application you want to file.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.xl),

            _PermitGridSection(
              title: 'Building Permit',
              options: _buildingPermitOptions,
              onTap: (option) => _handleTap(context, option),
            ),
            const SizedBox(height: AppSpacing.xl),

            _PermitListSection(
              title: 'Ancillary Permits',
              options: _ancillaryPermitOptions,
              onTap: (option) => _handleTap(context, option),
            ),
            const SizedBox(height: AppSpacing.xl),

            _PermitListSection(
              title: 'Other Permits',
              options: _otherPermitOptions,
              onTap: (option) => _handleTap(context, option),
            ),
            const SizedBox(height: AppSpacing.xl),

            _PermitListSection(
              title: 'Certificates',
              options: _certificateOptions,
              onTap: (option) => _handleTap(context, option),
            ),
            const SizedBox(height: AppSpacing.xl),

            const BeforeYouStartCard(),
          ],
        ),
      ),
    );
  }
}

/// A section title followed by its permits laid out as a 2-column grid —
/// used for "Building Permit", mirroring the visual prominence the
/// original "Select Form Project Type" grid gave to these four core types.
class _PermitGridSection extends StatelessWidget {
  final String title;
  final List<_PermitOption> options;
  final ValueChanged<_PermitOption> onTap;

  const _PermitGridSection({
    required this.title,
    required this.options,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: AppTypography.sectionTitle),
        const SizedBox(height: AppSpacing.md),
        GridView(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: AppSpacing.md,
            mainAxisSpacing: AppSpacing.md,
            mainAxisExtent: 214,
          ),
          children: [
            for (final option in options)
              ApplicationOptionCard(
                icon: option.icon,
                title: option.title,
                description: option.description,
                onTap: () => onTap(option),
              ),
          ],
        ),
      ],
    );
  }
}

/// A section title followed by its permits laid out as a full-width list —
/// used for every section with more entries than fit comfortably in a
/// 2-column grid.
class _PermitListSection extends StatelessWidget {
  final String title;
  final List<_PermitOption> options;
  final ValueChanged<_PermitOption> onTap;

  const _PermitListSection({
    required this.title,
    required this.options,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: AppTypography.sectionTitle),
        const SizedBox(height: AppSpacing.md),
        for (final option in options) ...[
          ApplicationOptionCard(
            layout: ApplicationOptionCardLayout.list,
            icon: option.icon,
            title: option.title,
            description: option.description,
            accentColor: AppColors.secondaryBlue,
            accentBackgroundColor: AppColors.lightBlue,
            onTap: () => onTap(option),
          ),
          if (option != options.last) const SizedBox(height: AppSpacing.md),
        ],
      ],
    );
  }
}
