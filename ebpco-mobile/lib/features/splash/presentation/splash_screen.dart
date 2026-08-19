import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/constants/app_strings.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/branding/app_logo.dart';

/// First screen shown on app launch. Restores the mock session and lets
/// the router redirect logic decide where to go next.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _bootstrap());
  }

  Future<void> _bootstrap() async {
    final authProvider = context.read<AuthProvider>();
    final minimumDelay = Future.delayed(AppConstants.splashMinimumDuration);
    await Future.wait([authProvider.loadSession(), minimumDelay]);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primary,
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                AppLogo(
                  iconSize: 88,
                  titleSize: 34,
                  showSubtitle: false,
                  iconBackgroundColor: AppColors.textOnPrimary,
                  iconColor: AppColors.primary,
                  titleColor: AppColors.textOnPrimary,
                ),
                const SizedBox(height: 8),
                Text(
                  AppStrings.splashSubtitle,
                  textAlign: TextAlign.center,
                  style: AppTypography.body.copyWith(
                    color: AppColors.textOnPrimaryMuted,
                  ),
                ),
                const SizedBox(height: 48),
                const SizedBox(
                  width: 28,
                  height: 28,
                  child: CircularProgressIndicator(
                    color: AppColors.textOnPrimary,
                    strokeWidth: 2.6,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
