import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/avatars/app_avatar.dart';
import '../../../shared/widgets/buttons/primary_button.dart';
import '../../../shared/widgets/layout/form_scroll_scaffold.dart';

class RegistrationSuccessScreen extends StatelessWidget {
  const RegistrationSuccessScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: FormScrollScaffold(
          padding: const EdgeInsets.symmetric(
            horizontal: AppConstants.screenPaddingHorizontal,
            vertical: 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const AppAvatar(
                size: 96,
                icon: Icons.check_circle,
                iconSize: 56,
                backgroundColor: AppColors.statusApprovedBg,
                foregroundColor: AppColors.statusApproved,
              ),
              const SizedBox(height: 24),
              Text(
                'Account created!',
                style: AppTypography.pageTitle,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                'Your E-BPCO account has been created successfully. You can now log in '
                'using your registered email address and password to start applying for '
                'business permits and clearances.',
                textAlign: TextAlign.center,
                style: AppTypography.bodyMuted.copyWith(height: 1.5),
              ),
              const SizedBox(height: 32),
              PrimaryButton(
                label: 'Continue to Login',
                onPressed: () => context.go('/login'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
