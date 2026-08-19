import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/validators.dart';
import '../../../shared/widgets/buttons/primary_button.dart';
import '../../../shared/widgets/dialogs/success_dialog.dart';
import '../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../shared/widgets/text_fields/app_password_field.dart';

/// Simulated password change — there's no backend, so this just validates
/// the form and shows a mock success dialog.
class ChangePasswordScreen extends StatefulWidget {
  const ChangePasswordScreen({super.key});

  @override
  State<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _isSubmitting = false;
  String _newPassword = '';

  @override
  void dispose() {
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  bool get _hasMinLength => _newPassword.length >= 8;
  bool get _hasLetter => RegExp(r'[A-Za-z]').hasMatch(_newPassword);
  bool get _hasNumber => RegExp(r'\d').hasMatch(_newPassword);

  int get _strengthScore {
    if (_newPassword.isEmpty) return 0;
    var score = 0;
    if (_newPassword.length >= 8) score++;
    if (_newPassword.length >= 12) score++;
    if (RegExp(r'[a-z]').hasMatch(_newPassword)) score++;
    if (RegExp(r'[A-Z]').hasMatch(_newPassword)) score++;
    if (RegExp(r'\d').hasMatch(_newPassword)) score++;
    if (RegExp(r'[^A-Za-z0-9]').hasMatch(_newPassword)) score++;
    return score;
  }

  (String, Color) get _strengthLabelAndColor {
    final score = _strengthScore;
    if (score == 0) return ('', AppColors.border);
    if (score <= 2) return ('Weak', AppColors.statusRejected);
    if (score <= 4) return ('Fair', AppColors.statusPending);
    return ('Strong', AppColors.statusApproved);
  }

  Future<void> _handleSubmit() async {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);
    await Future.delayed(AppConstants.mockNetworkDelay);
    if (!mounted) return;
    setState(() => _isSubmitting = false);

    await SuccessDialog.show(
      context,
      message: 'Password changed successfully.',
    );
    if (mounted) context.pop();
  }

  @override
  Widget build(BuildContext context) {
    final (strengthLabel, strengthColor) = _strengthLabelAndColor;

    return Scaffold(
      appBar: AppBar(title: const Text('Change Password')),
      body: SafeArea(
        child: FormScrollScaffold(
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                AppPasswordField(
                  controller: _currentPasswordController,
                  label: 'Current Password',
                  validator: (v) =>
                      Validators.required(v, fieldLabel: 'Current password'),
                ),
                const SizedBox(height: AppSpacing.md),
                AppPasswordField(
                  controller: _newPasswordController,
                  label: 'New Password',
                  validator: Validators.password,
                  onChanged: (value) => setState(() => _newPassword = value),
                ),
                const SizedBox(height: AppSpacing.sm),
                ClipRRect(
                  borderRadius: BorderRadius.circular(
                    AppConstants.borderRadiusXs,
                  ),
                  child: LinearProgressIndicator(
                    value: _newPassword.isEmpty ? 0 : _strengthScore / 6,
                    minHeight: 6,
                    backgroundColor: AppColors.surfaceMuted,
                    valueColor: AlwaysStoppedAnimation(strengthColor),
                  ),
                ),
                if (strengthLabel.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    'Password strength: $strengthLabel',
                    style: AppTypography.caption.copyWith(color: strengthColor),
                  ),
                ],
                const SizedBox(height: AppSpacing.sm),
                _RequirementRow(
                  label: 'At least 8 characters',
                  met: _hasMinLength,
                ),
                _RequirementRow(label: 'Contains a letter', met: _hasLetter),
                _RequirementRow(label: 'Contains a number', met: _hasNumber),
                const SizedBox(height: AppSpacing.md),
                AppPasswordField(
                  controller: _confirmPasswordController,
                  label: 'Confirm Password',
                  validator: (value) => Validators.confirmPassword(
                    value,
                    _newPasswordController.text,
                  ),
                ),
                const SizedBox(height: AppSpacing.xl),
                PrimaryButton(
                  label: 'Change Password',
                  isLoading: _isSubmitting,
                  onPressed: _handleSubmit,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _RequirementRow extends StatelessWidget {
  final String label;
  final bool met;

  const _RequirementRow({required this.label, required this.met});

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
          const SizedBox(width: AppSpacing.sm),
          Text(
            label,
            style: AppTypography.helper.copyWith(
              color: met ? AppColors.textSecondary : AppColors.textMuted,
            ),
          ),
        ],
      ),
    );
  }
}
