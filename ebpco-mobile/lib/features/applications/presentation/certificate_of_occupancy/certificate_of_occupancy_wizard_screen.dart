import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/models/certificate_of_occupancy_model.dart';
import '../../../../core/providers/auth_provider.dart';
import '../../../../core/providers/certificate_of_occupancy_provider.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/buttons/primary_button.dart';
import '../../../../shared/widgets/buttons/secondary_button.dart';
import '../../../../shared/widgets/dialogs/confirmation_dialog.dart';
import 'steps/step1_permit_and_type.dart';
import 'steps/step2_owner_project_info.dart';
import 'steps/step3_location_and_building.dart';
import 'steps/step4_required_documents.dart';
import 'steps/step5_certification_review_submission.dart';

class _StepMeta {
  final String title;
  final String subtitle;
  const _StepMeta({required this.title, required this.subtitle});
}

/// Certificate of Occupancy application wizard — a focused 5-step flow
/// based on the official single-page Application for Certificate of
/// Occupancy form. Deliberately shorter than the 9–10 step wizards used
/// by the longer ancillary permits, since the source form itself is a
/// single page — see `certificate_of_occupancy_model.dart`'s top
/// doc-comment for how its sections map onto these 5 steps. Its own
/// model ([CertificateOfOccupancyDraft]) and provider
/// ([CertificateOfOccupancyProvider]) keep it fully decoupled from every
/// other permit in this app.
class CertificateOfOccupancyWizardScreen extends StatefulWidget {
  const CertificateOfOccupancyWizardScreen({super.key});

  @override
  State<CertificateOfOccupancyWizardScreen> createState() =>
      _CertificateOfOccupancyWizardScreenState();
}

class _CertificateOfOccupancyWizardScreenState
    extends State<CertificateOfOccupancyWizardScreen> {
  static const totalSteps = 5;
  static const implementedStepCount = 5;

  static const List<_StepMeta> _stepMeta = [
    _StepMeta(
      title: 'Building Permit & Application Type',
      subtitle:
          'Provide the related Building Permit reference and certificate type.',
    ),
    _StepMeta(
      title: 'Owner and Project Information',
      subtitle: 'Provide the owner and project details.',
    ),
    _StepMeta(
      title: 'Project Location and Building Details',
      subtitle: 'Provide the project location and building information.',
    ),
    _StepMeta(
      title: 'Requirements and Supporting Documents',
      subtitle: 'Upload the documents required for evaluation.',
    ),
    _StepMeta(
      title: 'Certification, Review & Submission',
      subtitle:
          'Certify your application and review it before submission.',
    ),
  ];

  late final PageController _pageController;
  final List<GlobalKey<FormState>> _formKeys = List.generate(
    implementedStepCount,
    (_) => GlobalKey<FormState>(),
  );

  late CertificateOfOccupancyDraft _draft;
  late int _currentStep;

  @override
  void initState() {
    super.initState();
    final provider = context.read<CertificateOfOccupancyProvider>();
    final wasResuming = provider.hasResumableDraft;
    _draft = provider.resumeOrStart();
    _currentStep = provider.currentStep.clamp(0, implementedStepCount - 1);
    _pageController = PageController(initialPage: _currentStep);

    if (!wasResuming) {
      _prefillFromProfile();
    }

    if (wasResuming) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Resumed your saved draft.')),
        );
      });
    }
  }

  /// Prefills whatever profile information is available for a brand-new
  /// draft, per the "prefill from user profile when available" — read-
  /// only lookup, never written back to [AuthProvider].
  void _prefillFromProfile() {
    final user = context.read<AuthProvider>().currentUser;
    if (user == null) return;
    _draft.owner
      ..firstName = user.firstName
      ..lastName = user.lastName
      ..contactNumber = user.mobileNumber
      ..address = user.address
      ..zipCode = user.zipCode;
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _onDraftChanged() => setState(() {});

  void _goToStep(int step) {
    setState(() => _currentStep = step);
    context.read<CertificateOfOccupancyProvider>().goToStep(step);
    _pageController.animateToPage(
      step,
      duration: const Duration(milliseconds: 280),
      curve: Curves.easeOut,
    );
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  bool get _isCurrentStepValid {
    switch (_currentStep) {
      case 0:
        return _draft.isStep1Valid;
      case 1:
        return _draft.isStep2Valid;
      case 2:
        return _draft.isStep3Valid;
      case 3:
        return _draft.isStep4Valid;
      case 4:
        return _draft.isStep5Valid;
      default:
        return false;
    }
  }

  void _handleContinue() {
    if (!_isCurrentStepValid) return;
    if (_currentStep < implementedStepCount - 1) {
      _goToStep(_currentStep + 1);
    } else {
      _handleSubmit();
    }
  }

  void _handleSubmit() {
    final provider = context.read<CertificateOfOccupancyProvider>();
    provider.submitApplication();
    final now = DateTime.now();
    final referenceNumber =
        'COO-${now.year}-${(now.millisecondsSinceEpoch % 900000 + 100000)}';
    context.pushReplacement(
      '/applications/new/certificate-of-occupancy/submitted',
      extra: {
        'referenceNumber': referenceNumber,
        'submissionDate': now,
        'buildingPermitNumber': _draft.permitInfo.buildingPermitNumber,
        'certificateType': _draft.permitInfo.certificateType?.label ?? 'Full',
      },
    );
  }

  void _handleSaveDraft() {
    context.read<CertificateOfOccupancyProvider>().saveAsDraft();
    _showMessage('Draft saved successfully.');
  }

  Future<void> _handleExitAttempt() async {
    final confirmed = await ConfirmationDialog.show(
      context,
      title: 'Leave application?',
      message:
          'Save your progress as a draft before leaving so you can pick up where you left off.',
      confirmLabel: 'Save & Exit',
      cancelLabel: 'Keep Editing',
    );
    if (!confirmed || !mounted) return;
    context.read<CertificateOfOccupancyProvider>().saveAsDraft();
    if (mounted) context.pop();
  }

  @override
  Widget build(BuildContext context) {
    final meta = _stepMeta[_currentStep];
    final isFirstStep = _currentStep == 0;

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        _handleExitAttempt();
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Certificate of Occupancy'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            tooltip: 'Exit',
            onPressed: _handleExitAttempt,
          ),
          actions: [
            TextButton(
              onPressed: _handleSaveDraft,
              child: const Text('Save Draft'),
            ),
          ],
        ),
        body: SafeArea(
          child: Column(
            children: [
              _WizardProgressHeader(
                currentStep: _currentStep,
                totalSteps: totalSteps,
                title: meta.title,
                subtitle: meta.subtitle,
              ),
              Expanded(
                child: PageView(
                  controller: _pageController,
                  physics: const NeverScrollableScrollPhysics(),
                  children: [
                    Step1PermitAndType(
                      formKey: _formKeys[0],
                      draft: _draft,
                      onChanged: _onDraftChanged,
                    ),
                    Step2OwnerProjectInfo(
                      formKey: _formKeys[1],
                      draft: _draft,
                      onChanged: _onDraftChanged,
                    ),
                    Step3LocationAndBuilding(
                      formKey: _formKeys[2],
                      draft: _draft,
                      onChanged: _onDraftChanged,
                    ),
                    Step4RequiredDocuments(
                      formKey: _formKeys[3],
                      draft: _draft,
                      onChanged: _onDraftChanged,
                    ),
                    Step5CertificationReviewSubmission(
                      formKey: _formKeys[4],
                      draft: _draft,
                      onChanged: _onDraftChanged,
                      onEditStep: _goToStep,
                    ),
                  ],
                ),
              ),
              _BottomActionBar(
                isFirstStep: isFirstStep,
                isContinueEnabled: _isCurrentStepValid,
                continueLabel: _currentStep == implementedStepCount - 1
                    ? 'Submit Application'
                    : 'Continue',
                onBack: () => _goToStep(_currentStep - 1),
                onContinue: _handleContinue,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _WizardProgressHeader extends StatelessWidget {
  final int currentStep;
  final int totalSteps;
  final String title;
  final String subtitle;

  const _WizardProgressHeader({
    required this.currentStep,
    required this.totalSteps,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppConstants.screenPaddingHorizontal,
        AppSpacing.sm,
        AppConstants.screenPaddingHorizontal,
        AppSpacing.md,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Complete your Certificate of Occupancy application step by '
            'step.',
            style: AppTypography.bodyMuted,
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Step ${currentStep + 1} of $totalSteps',
            style: AppTypography.label,
          ),
          const SizedBox(height: AppSpacing.xs),
          ClipRRect(
            borderRadius: BorderRadius.circular(AppConstants.borderRadiusXs),
            child: LinearProgressIndicator(
              value: (currentStep + 1) / totalSteps,
              minHeight: 6,
              backgroundColor: AppColors.surfaceMuted,
              valueColor: const AlwaysStoppedAnimation(AppColors.primary),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Text(title, style: AppTypography.sectionTitle),
          const SizedBox(height: AppSpacing.xs),
          Text(subtitle, style: AppTypography.bodyMuted),
        ],
      ),
    );
  }
}

class _BottomActionBar extends StatelessWidget {
  final bool isFirstStep;
  final bool isContinueEnabled;
  final String continueLabel;
  final VoidCallback onBack;
  final VoidCallback onContinue;

  const _BottomActionBar({
    required this.isFirstStep,
    required this.isContinueEnabled,
    this.continueLabel = 'Continue',
    required this.onBack,
    required this.onContinue,
  });

  @override
  Widget build(BuildContext context) {
    final continueButton = PrimaryButton(
      label: continueLabel,
      onPressed: isContinueEnabled ? onContinue : null,
    );

    return Container(
      padding: const EdgeInsets.fromLTRB(
        AppConstants.screenPaddingHorizontal,
        AppSpacing.sm,
        AppConstants.screenPaddingHorizontal,
        AppSpacing.sm,
      ),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(top: BorderSide(color: AppColors.divider)),
      ),
      child: isFirstStep
          ? continueButton
          : Row(
              children: [
                Expanded(
                  child: SecondaryButton(label: 'Back', onPressed: onBack),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(flex: 2, child: continueButton),
              ],
            ),
    );
  }
}
