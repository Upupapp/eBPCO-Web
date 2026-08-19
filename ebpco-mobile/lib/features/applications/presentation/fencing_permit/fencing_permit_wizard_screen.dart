import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/models/fencing_permit_model.dart';
import '../../../../core/providers/auth_provider.dart';
import '../../../../core/providers/fencing_permit_provider.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/buttons/primary_button.dart';
import '../../../../shared/widgets/buttons/secondary_button.dart';
import '../../../../shared/widgets/dialogs/confirmation_dialog.dart';
import 'steps/step1_permit_information.dart';
import 'steps/step2_owner_applicant_info.dart';
import 'steps/step3_construction_location.dart';
import 'steps/step4_scope_of_work.dart';
import 'steps/step5_design_professional.dart';
import 'steps/step6_supervisor.dart';
import 'steps/step7_consent.dart';
import 'steps/step8_fence_specifications.dart';
import 'steps/step9_review_submission.dart';

class _StepMeta {
  final String title;
  final String subtitle;
  const _StepMeta({required this.title, required this.subtitle});
}

/// Fencing Permit application wizard — a full 9-step flow based on the
/// official Fencing Permit form (Boxes 1–8), completely separate from
/// every other permit in this app: its own model ([FencingPermitDraft]),
/// its own provider ([FencingPermitProvider]), and its own step widgets.
/// Structurally mirrors every other wizard (progress header, PageView,
/// bottom action bar) so all permits feel identical to use, though its
/// step content differs from the canonical shape in two ways — see
/// `fencing_permit_model.dart`'s top doc-comment for the mapping.
class FencingPermitWizardScreen extends StatefulWidget {
  const FencingPermitWizardScreen({super.key});

  @override
  State<FencingPermitWizardScreen> createState() =>
      _FencingPermitWizardScreenState();
}

class _FencingPermitWizardScreenState
    extends State<FencingPermitWizardScreen> {
  static const totalSteps = 9;
  static const implementedStepCount = 9;

  static const List<_StepMeta> _stepMeta = [
    _StepMeta(
      title: 'Permit Information',
      subtitle:
          'Provide the related Building Permit reference for this fencing project.',
    ),
    _StepMeta(
      title: 'Owner / Applicant Information',
      subtitle: 'Provide the applicant details for the Fencing Permit.',
    ),
    _StepMeta(
      title: 'Construction Location',
      subtitle: 'Provide the location where the fence will be built.',
    ),
    _StepMeta(
      title: 'Scope of Work',
      subtitle: 'Select the project scope covered by the Fencing Permit.',
    ),
    _StepMeta(
      title: 'Design Professional',
      subtitle:
          'Provide the licensed professional responsible for the fencing plans.',
    ),
    _StepMeta(
      title: 'Full-Time Inspector / Supervisor',
      subtitle: 'Provide the professional supervising the fencing work.',
    ),
    _StepMeta(
      title: 'Applicant & Lot Owner Consent',
      subtitle: 'Confirm the applicant and lot owner information.',
    ),
    _StepMeta(
      title: 'Fence Specifications',
      subtitle: 'Provide the fence measurements and type of fencing.',
    ),
    _StepMeta(
      title: 'Review & Submission',
      subtitle: 'Review the Fencing Permit application before submission.',
    ),
  ];

  late final PageController _pageController;
  final List<GlobalKey<FormState>> _formKeys = List.generate(
    implementedStepCount,
    (_) => GlobalKey<FormState>(),
  );

  late FencingPermitDraft _draft;
  late int _currentStep;

  @override
  void initState() {
    super.initState();
    final provider = context.read<FencingPermitProvider>();
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
  /// only lookup, never written back to [AuthProvider]. Only the fields
  /// this permit's applicant section actually has (no contact number or
  /// province, per the official form's field list) are prefilled.
  void _prefillFromProfile() {
    final user = context.read<AuthProvider>().currentUser;
    if (user == null) return;
    _draft.applicant
      ..firstName = user.firstName
      ..lastName = user.lastName
      ..street = user.address
      ..barangay = user.barangay
      ..city = user.city
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
    context.read<FencingPermitProvider>().goToStep(step);
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
      case 5:
        return _draft.isStep6Valid;
      case 6:
        return _draft.isStep7Valid;
      case 7:
        return _draft.isStep8Valid;
      case 8:
        return _draft.isStep9Valid;
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
    final provider = context.read<FencingPermitProvider>();
    provider.submitApplication();
    final now = DateTime.now();
    final referenceNumber =
        'FNC-${now.year}-${(now.millisecondsSinceEpoch % 900000 + 100000)}';
    context.pushReplacement(
      '/applications/new/fencing-permit/submitted',
      extra: {
        'referenceNumber': referenceNumber,
        'submissionDate': now,
        'relatedBuildingPermitNumber':
            _draft.relatedBuildingPermit.buildingPermitNumber,
        'relatedBuildingPermitStatus':
            _draft.relatedBuildingPermit.status.label,
      },
    );
  }

  void _handleSaveDraft() {
    context.read<FencingPermitProvider>().saveAsDraft();
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
    context.read<FencingPermitProvider>().saveAsDraft();
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
          title: const Text('Fencing Permit'),
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
                    Step1PermitInformation(
                      formKey: _formKeys[0],
                      draft: _draft,
                      onChanged: _onDraftChanged,
                    ),
                    Step2OwnerApplicantInfo(
                      formKey: _formKeys[1],
                      draft: _draft,
                      onChanged: _onDraftChanged,
                    ),
                    Step3ConstructionLocation(
                      formKey: _formKeys[2],
                      draft: _draft,
                      onChanged: _onDraftChanged,
                    ),
                    Step4ScopeOfWork(
                      formKey: _formKeys[3],
                      draft: _draft,
                      onChanged: _onDraftChanged,
                    ),
                    Step5DesignProfessional(
                      formKey: _formKeys[4],
                      draft: _draft,
                      onChanged: _onDraftChanged,
                    ),
                    Step6Supervisor(
                      formKey: _formKeys[5],
                      draft: _draft,
                      onChanged: _onDraftChanged,
                    ),
                    Step7Consent(
                      formKey: _formKeys[6],
                      draft: _draft,
                      onChanged: _onDraftChanged,
                    ),
                    Step8FenceSpecifications(
                      formKey: _formKeys[7],
                      draft: _draft,
                      onChanged: _onDraftChanged,
                    ),
                    Step9ReviewSubmission(
                      formKey: _formKeys[8],
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
            'Complete your Fencing Permit application step by step.',
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
