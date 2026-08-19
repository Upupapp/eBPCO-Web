import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/models/application_model.dart';
import '../../../core/models/document_model.dart';
import '../../../core/providers/applications_provider.dart';
import '../../../core/providers/business_provider.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/buttons/primary_button.dart';
import '../../../shared/widgets/buttons/secondary_button.dart';
import '../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../shared/widgets/text_fields/app_dropdown.dart';
import '../../../shared/widgets/uploads/document_upload_tile.dart';

/// Three-step wizard: pick a business + permit type, attach the required
/// documents (simulated), then review and submit.
class NewApplicationScreen extends StatefulWidget {
  final String? initialBusinessId;

  const NewApplicationScreen({super.key, this.initialBusinessId});

  @override
  State<NewApplicationScreen> createState() => _NewApplicationScreenState();
}

class _NewApplicationScreenState extends State<NewApplicationScreen> {
  static const totalSteps = 3;

  final PageController _pageController = PageController();
  int _currentStep = 0;
  bool _isSubmitting = false;

  String? _businessId;
  ApplicationType? _applicationType;
  bool _showSelectionError = false;

  final Map<String, DocumentModel?> _documents = {
    for (final label in requiredDocumentLabels) label: null,
  };

  @override
  void initState() {
    super.initState();
    _businessId = widget.initialBusinessId;
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _goToStep(int step) {
    setState(() => _currentStep = step);
    _pageController.animateToPage(
      step,
      duration: const Duration(milliseconds: 280),
      curve: Curves.easeOut,
    );
  }

  void _handleBack() {
    if (_currentStep == 0) {
      context.pop();
    } else {
      _goToStep(_currentStep - 1);
    }
  }

  void _handleNext() {
    if (_currentStep == 0) {
      final isValid = _businessId != null && _applicationType != null;
      setState(() => _showSelectionError = !isValid);
      if (!isValid) return;
      _goToStep(1);
    } else if (_currentStep == 1) {
      final allUploaded = _documents.values.every((doc) => doc != null);
      if (!allUploaded) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Please upload all required documents to continue.'),
          ),
        );
        return;
      }
      _goToStep(2);
    }
  }

  void _handleUpload(String label) {
    setState(() {
      _documents[label] = DocumentModel(
        id: 'doc-${DateTime.now().microsecondsSinceEpoch}',
        label: label,
        fileName: '${label.toLowerCase().replaceAll(' ', '_')}.pdf',
        uploadedAt: DateTime.now(),
      );
    });
  }

  void _handleRemove(String label) {
    setState(() => _documents[label] = null);
  }

  Future<void> _handleSubmit() async {
    final businessId = _businessId;
    final type = _applicationType;
    if (businessId == null || type == null) return;

    final business = context.read<BusinessProvider>().byId(businessId);
    if (business == null) return;

    setState(() => _isSubmitting = true);
    final application = await context
        .read<ApplicationsProvider>()
        .submitApplication(
          businessId: businessId,
          businessName: business.name,
          type: type,
          documents: _documents.values.whereType<DocumentModel>().toList(),
        );

    if (!mounted) return;
    setState(() => _isSubmitting = false);
    context.pushReplacement('/applications/${application.id}');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('New Application'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: _handleBack,
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            _WizardProgressHeader(
              currentStep: _currentStep,
              totalSteps: totalSteps,
            ),
            Expanded(
              child: PageView(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  _buildBusinessStep(),
                  _buildDocumentsStep(),
                  _buildReviewStep(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBusinessStep() {
    final businesses = context.watch<BusinessProvider>().businesses;

    return FormScrollScaffold(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _WizardStepHeader(
            title: 'Business & Permit Type',
            subtitle: 'Which business is this application for?',
          ),
          const SizedBox(height: 20),
          if (businesses.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'You need to register a business before applying for a permit.',
                    style: AppTypography.bodyMuted,
                  ),
                  const SizedBox(height: 16),
                  PrimaryButton(
                    label: 'Register Business',
                    onPressed: () => context.push('/business/register'),
                  ),
                ],
              ),
            )
          else ...[
            AppDropdown<String>(
              value: _businessId,
              label: 'Business',
              items: businesses
                  .map(
                    (business) => DropdownMenuItem(
                      value: business.id,
                      child: Text(business.name),
                    ),
                  )
                  .toList(),
              onChanged: (value) => setState(() => _businessId = value),
              validator: (value) =>
                  value == null ? 'Please select a business.' : null,
            ),
            const SizedBox(height: 16),
            AppDropdown<ApplicationType>(
              value: _applicationType,
              label: 'Application type',
              items: ApplicationType.values
                  .map(
                    (type) =>
                        DropdownMenuItem(value: type, child: Text(type.label)),
                  )
                  .toList(),
              onChanged: (value) => setState(() => _applicationType = value),
              validator: (value) =>
                  value == null ? 'Please select an application type.' : null,
            ),
            if (_showSelectionError) ...[
              const SizedBox(height: 8),
              Text(
                'Please select both a business and an application type.',
                style: AppTypography.caption.copyWith(color: AppColors.error),
              ),
            ],
            const SizedBox(height: 28),
            PrimaryButton(label: 'Next', onPressed: _handleNext),
          ],
        ],
      ),
    );
  }

  Widget _buildDocumentsStep() {
    return FormScrollScaffold(
      centerVertically: false,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _WizardStepHeader(
            title: 'Required Documents',
            subtitle: 'Attach the requirements for this application.',
          ),
          const SizedBox(height: 20),
          for (final label in requiredDocumentLabels) ...[
            DocumentUploadTile(
              label: label,
              document: _documents[label],
              onUpload: () => _handleUpload(label),
              onRemove: () => _handleRemove(label),
            ),
            const SizedBox(height: 12),
          ],
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: SecondaryButton(label: 'Back', onPressed: _handleBack),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: PrimaryButton(label: 'Next', onPressed: _handleNext),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildReviewStep() {
    final business = _businessId == null
        ? null
        : context.watch<BusinessProvider>().byId(_businessId!);

    return FormScrollScaffold(
      centerVertically: false,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _WizardStepHeader(
            title: 'Review & Submit',
            subtitle: 'Confirm the details before submitting.',
          ),
          const SizedBox(height: 20),
          _ReviewRow(label: 'Business', value: business?.name ?? '-'),
          _ReviewRow(
            label: 'Application type',
            value: _applicationType?.label ?? '-',
          ),
          _ReviewRow(
            label: 'Documents attached',
            value: '${_documents.values.whereType<DocumentModel>().length} of ${_documents.length}',
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: SecondaryButton(label: 'Back', onPressed: _handleBack),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: PrimaryButton(
                  label: 'Submit Application',
                  isLoading: _isSubmitting,
                  onPressed: _handleSubmit,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _WizardProgressHeader extends StatelessWidget {
  final int currentStep;
  final int totalSteps;

  const _WizardProgressHeader({
    required this.currentStep,
    required this.totalSteps,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppConstants.screenPaddingHorizontal,
        vertical: 12,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Step ${currentStep + 1} of $totalSteps', style: AppTypography.label),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(AppConstants.borderRadiusXs),
            child: LinearProgressIndicator(
              value: (currentStep + 1) / totalSteps,
              minHeight: 6,
              backgroundColor: AppColors.surfaceMuted,
              valueColor: const AlwaysStoppedAnimation(AppColors.primary),
            ),
          ),
        ],
      ),
    );
  }
}

class _WizardStepHeader extends StatelessWidget {
  final String title;
  final String subtitle;

  const _WizardStepHeader({required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: AppTypography.sectionTitle),
        const SizedBox(height: 4),
        Text(subtitle, style: AppTypography.bodyMuted),
      ],
    );
  }
}

class _ReviewRow extends StatelessWidget {
  final String label;
  final String value;

  const _ReviewRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
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
