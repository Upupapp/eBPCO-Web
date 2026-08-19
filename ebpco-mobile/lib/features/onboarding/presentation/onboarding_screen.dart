import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/constants/app_strings.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../shared/widgets/buttons/primary_button.dart';
import '../models/onboarding_item.dart';
import 'widgets/onboarding_page.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  static const _items = [
    OnboardingItem(
      imagePath: 'assets/images/1.png',
      title: 'Apply for permits from your phone',
      description:
          'Submit new, renewal, and amendment permit applications through a simple mobile process.',
    ),
    OnboardingItem(
      imagePath: 'assets/images/2.png',
      title: 'Submit and manage requirements',
      description:
          'Review required documents and prepare your permit application in one place.',
    ),
    OnboardingItem(
      imagePath: 'assets/images/3.png',
      title: 'Track your application',
      description:
          'Monitor evaluations, payments, approval, and permit release status.',
    ),
  ];

  bool get _isLastPage => _currentPage == _items.length - 1;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _finishOnboarding() async {
    await context.read<AuthProvider>().completeOnboarding();
    if (mounted) context.go('/login');
  }

  void _goToNextPage() {
    _pageController.nextPage(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            Align(
              alignment: Alignment.topRight,
              child: Padding(
                padding: const EdgeInsets.only(right: 8, top: 4),
                child: Visibility(
                  visible: !_isLastPage,
                  maintainSize: true,
                  maintainAnimation: true,
                  maintainState: true,
                  child: TextButton(
                    onPressed: _finishOnboarding,
                    child: Text(AppStrings.skip),
                  ),
                ),
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                itemCount: _items.length,
                onPageChanged: (index) => setState(() => _currentPage = index),
                itemBuilder: (context, index) =>
                    OnboardingPage(item: _items[index]),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(_items.length, (index) {
                  final isActive = index == _currentPage;
                  return AnimatedContainer(
                    duration: const Duration(milliseconds: 250),
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    width: isActive ? 22 : 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: isActive ? AppColors.primary : AppColors.border,
                      borderRadius: BorderRadius.circular(
                        AppConstants.borderRadiusXs,
                      ),
                    ),
                  );
                }),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
              child: PrimaryButton(
                label: _isLastPage ? AppStrings.getStarted : AppStrings.next,
                onPressed: _isLastPage ? _finishOnboarding : _goToNextPage,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
