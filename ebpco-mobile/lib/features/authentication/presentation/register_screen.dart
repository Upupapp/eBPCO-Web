import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/constants/app_strings.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/validators.dart';
import '../../../shared/widgets/buttons/primary_button.dart';
import '../../../shared/widgets/buttons/secondary_button.dart';
import '../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../shared/widgets/text_fields/app_dropdown.dart';
import '../../../shared/widgets/text_fields/app_password_field.dart';
import '../../../shared/widgets/text_fields/app_text_field.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  static const int totalSteps = 3;

  final PageController _pageController = PageController();
  int _currentStep = 0;

  final _step1FormKey = GlobalKey<FormState>();
  final _step2FormKey = GlobalKey<FormState>();
  final _step3FormKey = GlobalKey<FormState>();

  // Step 1: Personal information.
  final _firstNameController = TextEditingController();
  final _middleNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _nationalityController = TextEditingController(text: 'Filipino');
  DateTime? _dateOfBirth;
  String? _sex;
  String? _civilStatus;

  // Step 2: Contact information.
  final _emailController = TextEditingController();
  final _mobileController = TextEditingController();
  final _streetController = TextEditingController();
  final _barangayController = TextEditingController();
  final _cityController = TextEditingController();
  final _provinceController = TextEditingController();
  final _postalCodeController = TextEditingController();

  // Step 3: Account security.
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _acceptedTerms = false;
  bool _acceptedPrivacy = false;
  bool _showAgreementError = false;

  @override
  void dispose() {
    _pageController.dispose();
    _firstNameController.dispose();
    _middleNameController.dispose();
    _lastNameController.dispose();
    _nationalityController.dispose();
    _emailController.dispose();
    _mobileController.dispose();
    _streetController.dispose();
    _barangayController.dispose();
    _cityController.dispose();
    _provinceController.dispose();
    _postalCodeController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
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

  void _handleNext() {
    FocusScope.of(context).unfocus();
    if (_currentStep == 0) {
      final isFormValid = _step1FormKey.currentState!.validate();
      if (!isFormValid ||
          _sex == null ||
          _civilStatus == null ||
          _dateOfBirth == null) {
        setState(() {});
        return;
      }
      _goToStep(1);
    } else if (_currentStep == 1) {
      if (!_step2FormKey.currentState!.validate()) return;
      _goToStep(2);
    }
  }

  void _handleBack() {
    FocusScope.of(context).unfocus();
    if (_currentStep == 0) {
      context.pop();
    } else {
      _goToStep(_currentStep - 1);
    }
  }

  static const _backLabel = AppStrings.back;

  Future<void> _handleCreateAccount() async {
    FocusScope.of(context).unfocus();
    final isFormValid = _step3FormKey.currentState!.validate();
    final agreementsAccepted = _acceptedTerms && _acceptedPrivacy;
    setState(() => _showAgreementError = !agreementsAccepted);
    if (!isFormValid || !agreementsAccepted) return;

    final authProvider = context.read<AuthProvider>();
    final success = await authProvider.register(
      firstName: _firstNameController.text.trim(),
      lastName: _lastNameController.text.trim(),
      email: _emailController.text.trim(),
      mobileNumber: _mobileController.text.trim(),
      password: _passwordController.text,
    );

    if (!mounted) return;
    if (success) {
      context.go('/registration-success');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authProvider.errorMessage ?? 'Registration failed.'),
        ),
      );
    }
  }

  Future<void> _pickDateOfBirth() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _dateOfBirth ?? DateTime(now.year - 25, now.month, now.day),
      firstDate: DateTime(now.year - 100),
      lastDate: DateTime(now.year - 18, now.month, now.day),
      helpText: 'Select date of birth',
    );
    if (picked != null) {
      setState(() => _dateOfBirth = picked);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Account'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: _handleBack,
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            _StepProgressHeader(
              currentStep: _currentStep,
              totalSteps: totalSteps,
            ),
            Expanded(
              child: PageView(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  _buildStep1(),
                  _buildStep2(),
                  _buildStep3(authProvider),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStep1() {
    return FormScrollScaffold(
      child: Form(
        key: _step1FormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const _StepHeader(
              title: 'Personal Information',
              subtitle: 'Tell us who you are.',
            ),
            const SizedBox(height: 20),
            AppTextField(
              controller: _firstNameController,
              label: 'First name',
              validator: (v) =>
                  Validators.required(v, fieldLabel: 'First name'),
            ),
            const SizedBox(height: 16),
            AppTextField(
              controller: _middleNameController,
              label: 'Middle name (optional)',
            ),
            const SizedBox(height: 16),
            AppTextField(
              controller: _lastNameController,
              label: 'Last name',
              validator: (v) => Validators.required(v, fieldLabel: 'Last name'),
            ),
            const SizedBox(height: 16),
            FormField<DateTime>(
              initialValue: _dateOfBirth,
              validator: (value) => _dateOfBirth == null
                  ? 'Please select your date of birth.'
                  : null,
              builder: (state) {
                return InkWell(
                  borderRadius: BorderRadius.circular(
                    AppConstants.borderRadiusMedium,
                  ),
                  onTap: () async {
                    await _pickDateOfBirth();
                    state.didChange(_dateOfBirth);
                  },
                  child: InputDecorator(
                    decoration: InputDecoration(
                      labelText: 'Date of birth',
                      suffixIcon: const Icon(Icons.calendar_today_outlined),
                      errorText: state.errorText,
                    ),
                    child: Text(
                      _dateOfBirth == null
                          ? 'Select date'
                          : DateFormat('MMMM d, yyyy').format(_dateOfBirth!),
                      style: TextStyle(
                        color: _dateOfBirth == null
                            ? AppColors.textMuted
                            : AppColors.textPrimary,
                      ),
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 16),
            AppDropdown<String>(
              value: _sex,
              label: 'Sex',
              items: const [
                DropdownMenuItem(value: 'Male', child: Text('Male')),
                DropdownMenuItem(value: 'Female', child: Text('Female')),
              ],
              onChanged: (value) => setState(() => _sex = value),
              validator: (value) =>
                  value == null ? 'Please select your sex.' : null,
            ),
            const SizedBox(height: 16),
            AppDropdown<String>(
              value: _civilStatus,
              label: 'Civil status',
              items: const [
                DropdownMenuItem(value: 'Single', child: Text('Single')),
                DropdownMenuItem(value: 'Married', child: Text('Married')),
                DropdownMenuItem(value: 'Widowed', child: Text('Widowed')),
                DropdownMenuItem(value: 'Separated', child: Text('Separated')),
                DropdownMenuItem(value: 'Divorced', child: Text('Divorced')),
              ],
              onChanged: (value) => setState(() => _civilStatus = value),
              validator: (value) =>
                  value == null ? 'Please select your civil status.' : null,
            ),
            const SizedBox(height: 16),
            AppTextField(
              controller: _nationalityController,
              label: 'Nationality',
              validator: (v) =>
                  Validators.required(v, fieldLabel: 'Nationality'),
            ),
            const SizedBox(height: 28),
            PrimaryButton(label: 'Next', onPressed: _handleNext),
          ],
        ),
      ),
    );
  }

  Widget _buildStep2() {
    return FormScrollScaffold(
      child: Form(
        key: _step2FormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const _StepHeader(
              title: 'Contact Information',
              subtitle: 'How can we reach you?',
            ),
            const SizedBox(height: 20),
            AppTextField(
              controller: _emailController,
              label: 'Email address',
              keyboardType: TextInputType.emailAddress,
              validator: Validators.email,
            ),
            const SizedBox(height: 16),
            AppTextField(
              controller: _mobileController,
              label: 'Mobile number',
              hint: '09XXXXXXXXX',
              keyboardType: TextInputType.phone,
              validator: Validators.philippineMobile,
            ),
            const SizedBox(height: 16),
            AppTextField(
              controller: _streetController,
              label: 'House number / Street',
              validator: (v) =>
                  Validators.required(v, fieldLabel: 'House number / Street'),
            ),
            const SizedBox(height: 16),
            AppTextField(
              controller: _barangayController,
              label: 'Barangay',
              validator: (v) => Validators.required(v, fieldLabel: 'Barangay'),
            ),
            const SizedBox(height: 16),
            AppTextField(
              controller: _cityController,
              label: 'City / Municipality',
              validator: (v) =>
                  Validators.required(v, fieldLabel: 'City / Municipality'),
            ),
            const SizedBox(height: 16),
            AppTextField(
              controller: _provinceController,
              label: 'Province',
              validator: (v) => Validators.required(v, fieldLabel: 'Province'),
            ),
            const SizedBox(height: 16),
            AppTextField(
              controller: _postalCodeController,
              label: 'Postal code',
              keyboardType: TextInputType.number,
              validator: Validators.postalCode,
            ),
            const SizedBox(height: 28),
            Row(
              children: [
                Expanded(
                  child: SecondaryButton(
                    label: _backLabel,
                    onPressed: _handleBack,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: PrimaryButton(label: 'Next', onPressed: _handleNext),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStep3(AuthProvider authProvider) {
    final password = _passwordController.text;
    final hasMinLength = password.length >= 8;
    final hasLetter = RegExp(r'[A-Za-z]').hasMatch(password);
    final hasNumber = RegExp(r'\d').hasMatch(password);

    return FormScrollScaffold(
      child: Form(
        key: _step3FormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const _StepHeader(
              title: 'Account Security',
              subtitle: 'Create a password to protect your account.',
            ),
            const SizedBox(height: 20),
            AppPasswordField(
              controller: _passwordController,
              label: 'Password',
              onChanged: (_) => setState(() {}),
              validator: Validators.password,
            ),
            const SizedBox(height: 10),
            _PasswordRequirementRow(
              label: 'At least 8 characters',
              met: hasMinLength,
            ),
            _PasswordRequirementRow(
              label: 'At least one letter',
              met: hasLetter,
            ),
            _PasswordRequirementRow(
              label: 'At least one number',
              met: hasNumber,
            ),
            const SizedBox(height: 16),
            AppPasswordField(
              controller: _confirmPasswordController,
              label: 'Confirm password',
              validator: (value) =>
                  Validators.confirmPassword(value, _passwordController.text),
            ),
            const SizedBox(height: 20),
            _AgreementCheckbox(
              value: _acceptedTerms,
              label: 'I agree to the Terms and Conditions.',
              onChanged: (value) => setState(() => _acceptedTerms = value),
            ),
            _AgreementCheckbox(
              value: _acceptedPrivacy,
              label: 'I agree to the Privacy Policy.',
              onChanged: (value) => setState(() => _acceptedPrivacy = value),
            ),
            if (_showAgreementError)
              Padding(
                padding: const EdgeInsets.only(top: 4, left: 4),
                child: Text(
                  'Please accept the Terms and Conditions and Privacy Policy to continue.',
                  style: AppTypography.caption.copyWith(color: AppColors.error),
                ),
              ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: SecondaryButton(
                    label: _backLabel,
                    onPressed: _handleBack,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: PrimaryButton(
                    label: 'Create Account',
                    isLoading: authProvider.isLoading,
                    onPressed: _handleCreateAccount,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// Title + subtitle pair shown at the top of each registration wizard step.
class _StepHeader extends StatelessWidget {
  final String title;
  final String subtitle;

  const _StepHeader({required this.title, required this.subtitle});

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

class _StepProgressHeader extends StatelessWidget {
  final int currentStep;
  final int totalSteps;

  const _StepProgressHeader({
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
          Text(
            'Step ${currentStep + 1} of $totalSteps',
            style: AppTypography.label,
          ),
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

class _PasswordRequirementRow extends StatelessWidget {
  final String label;
  final bool met;

  const _PasswordRequirementRow({required this.label, required this.met});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Icon(
            met ? Icons.check_circle : Icons.radio_button_unchecked,
            size: 16,
            color: met ? AppColors.statusApproved : AppColors.textMuted,
          ),
          const SizedBox(width: 8),
          Text(
            label,
            style: AppTypography.caption.copyWith(
              color: met ? AppColors.statusApproved : AppColors.textMuted,
            ),
          ),
        ],
      ),
    );
  }
}

class _AgreementCheckbox extends StatelessWidget {
  final bool value;
  final String label;
  final ValueChanged<bool> onChanged;

  const _AgreementCheckbox({
    required this.value,
    required this.label,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => onChanged(!value),
      borderRadius: BorderRadius.circular(AppConstants.borderRadiusSmall),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          children: [
            Checkbox(value: value, onChanged: (v) => onChanged(v ?? false)),
            Expanded(
              child: Text(label, style: AppTypography.body),
            ),
          ],
        ),
      ),
    );
  }
}
