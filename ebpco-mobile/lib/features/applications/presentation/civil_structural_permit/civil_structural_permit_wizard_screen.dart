import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/models/civil_structural_permit_model.dart';
import '../../../../core/providers/auth_provider.dart';
import '../../../../core/providers/civil_structural_permit_provider.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/buttons/primary_button.dart';
import '../../../../shared/widgets/buttons/secondary_button.dart';
import '../../../../shared/widgets/dialogs/confirmation_dialog.dart';
import 'steps/step1_applicant_info.dart';
import 'steps/step2_address_location.dart';
import 'steps/step3_scope_of_work.dart';
import 'steps/step4_work_details.dart';
import 'steps/step5_professionals.dart';
import 'steps/step6_ownership_consent.dart';
import 'steps/step7_required_documents.dart';
import 'steps/step8_review_declaration.dart';
import 'steps/step9_evaluation_status.dart';

class _StepMeta {
  final String title;
  final String subtitle;
  const _StepMeta({required this.title, required this.subtitle});
}

/// Civil / Structural Permit application wizard — a full 9-step flow
/// based on the official Civil / Structural Permit form, completely
/// separate from New Construction, Renovation, Addition/Extension,
/// Demolition, and Architectural: its own model
/// ([CivilStructuralPermitDraft]), its own provider
/// ([CivilStructuralPermitProvider]), and its own step widgets.
/// Structurally mirrors the other five wizards (progress header,
/// PageView, bottom action bar) so all six feel identical to use.
class CivilStructuralPermitWizardScreen extends StatefulWidget {
  const CivilStructuralPermitWizardScreen({super.key});

  @override
  State<CivilStructuralPermitWizardScreen> createState() =>
      _CivilStructuralPermitWizardScreenState();
}

class _CivilStructuralPermitWizardScreenState
    extends State<CivilStructuralPermitWizardScreen> {
  static const totalSteps = 9;
  static const implementedStepCount = 9;

  static const List<_StepMeta> _stepMeta = [
    _StepMeta(
      title: 'Applicant Information',
      subtitle: 'Provide the details of the person applying for the Civil / Structural Permit.',
    ),
    _StepMeta(
      title: 'Address & Project Location',
      subtitle: 'Provide the applicant address and location of the civil or structural work.',
    ),
    _StepMeta(
      title: 'Scope of Work',
      subtitle: 'Select the project scope covered by the Civil / Structural Permit.',
    ),
    _StepMeta(
      title: 'Civil / Structural Work Details',
      subtitle: 'Select and describe the civil or structural work included in the project.',
    ),
    _StepMeta(
      title: 'Civil / Structural Professionals',
      subtitle: 'Provide the engineers responsible for design and supervision.',
    ),
    _StepMeta(
      title: 'Ownership & Consent',
      subtitle: 'Confirm the Building Owner and Lot Owner information.',
    ),
    _StepMeta(
      title: 'Required Documents',
      subtitle: 'Upload the civil and structural documents required for evaluation.',
    ),
    _StepMeta(
      title: 'Review & Declaration',
      subtitle: 'Review the Civil / Structural Permit application before submission.',
    ),
    _StepMeta(
      title: 'Evaluation & Permit Status',
      subtitle: 'Track document review and permit action.',
    ),
  ];

  late final PageController _pageController;
  final List<GlobalKey<FormState>> _formKeys = List.generate(
    implementedStepCount,
    (_) => GlobalKey<FormState>(),
  );

  late CivilStructuralPermitDraft _draft;
  late int _currentStep;

  @override
  void initState() {
    super.initState();
    final provider = context.read<CivilStructuralPermitProvider>();
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
  /// draft, per the "prefill available user profile information"
  /// requirement — read-only lookup, never written back to [AuthProvider].
  void _prefillFromProfile() {
    final user = context.read<AuthProvider>().currentUser;
    if (user == null) return;
    _draft.applicant
      ..firstName = user.firstName
      ..middleName = user.middleName
      ..lastName = user.lastName
      ..contactNumber = user.mobileNumber;
    _draft.applicantAddress
      ..street = user.address
      ..barangay = user.barangay
      ..city = user.city
      ..province = user.province
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
    context.read<CivilStructuralPermitProvider>().goToStep(step);
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
    final provider = context.read<CivilStructuralPermitProvider>();
    provider.submitApplication();
    final now = DateTime.now();
    final referenceNumber =
        'CVL-${now.year}-${(now.millisecondsSinceEpoch % 900000 + 100000)}';
    context.pushReplacement(
      '/applications/new/civil-structural-permit/submitted',
      extra: {
        'referenceNumber': referenceNumber,
        'submissionDate': now,
        'relatedBuildingPermitNumber':
            _draft.relatedBuildingPermit.buildingPermitNumber,
        'relatedBuildingPermitStatus': _draft.relatedBuildingPermit.status.label,
      },
    );
  }

  void _handleSaveDraft() {
    context.read<CivilStructuralPermitProvider>().saveAsDraft();
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
    context.read<CivilStructuralPermitProvider>().saveAsDraft();
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
          title: const Text('Civil / Structural Permit'),
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
                    Step1ApplicantInfo(
                      formKey: _formKeys[0],
                      draft: _draft,
                      onChanged: _onDraftChanged,
                    ),
                    Step2AddressLocation(
                      formKey: _formKeys[1],
                      draft: _draft,
                      onChanged: _onDraftChanged,
                    ),
                    Step3ScopeOfWork(
                      formKey: _formKeys[2],
                      draft: _draft,
                      onChanged: _onDraftChanged,
                    ),
                    Step4WorkDetails(
                      formKey: _formKeys[3],
                      draft: _draft,
                      onChanged: _onDraftChanged,
                    ),
                    Step5Professionals(
                      formKey: _formKeys[4],
                      draft: _draft,
                      onChanged: _onDraftChanged,
                    ),
                    Step6OwnershipConsent(
                      formKey: _formKeys[5],
                      draft: _draft,
                      onChanged: _onDraftChanged,
                    ),
                    Step7RequiredDocuments(
                      formKey: _formKeys[6],
                      draft: _draft,
                      onChanged: _onDraftChanged,
                    ),
                    Step8ReviewDeclaration(
                      formKey: _formKeys[7],
                      draft: _draft,
                      onChanged: _onDraftChanged,
                      onEditStep: _goToStep,
                    ),
                    Step9EvaluationStatus(
                      formKey: _formKeys[8],
                      draft: _draft,
                      onChanged: _onDraftChanged,
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
            'Complete your Civil / Structural Permit application step by step.',
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
