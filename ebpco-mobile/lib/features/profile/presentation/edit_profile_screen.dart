import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/providers/auth_provider.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/validators.dart';
import '../../../shared/widgets/buttons/primary_button.dart';
import '../../../shared/widgets/buttons/secondary_button.dart';
import '../../../shared/widgets/dialogs/success_dialog.dart';
import '../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../shared/widgets/text_fields/app_text_field.dart';
import 'widgets/profile_photo_avatar.dart';
import 'widgets/profile_photo_bottom_sheet.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _firstNameController;
  late final TextEditingController _middleNameController;
  late final TextEditingController _lastNameController;
  late final TextEditingController _emailController;
  late final TextEditingController _mobileController;
  late final TextEditingController _addressController;
  late final TextEditingController _provinceController;
  late final TextEditingController _cityController;
  late final TextEditingController _barangayController;
  late final TextEditingController _zipCodeController;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    final user = context.read<AuthProvider>().currentUser;
    _firstNameController = TextEditingController(text: user?.firstName ?? '');
    _middleNameController = TextEditingController(text: user?.middleName ?? '');
    _lastNameController = TextEditingController(text: user?.lastName ?? '');
    _emailController = TextEditingController(text: user?.email ?? '');
    _mobileController = TextEditingController(text: user?.mobileNumber ?? '');
    _addressController = TextEditingController(text: user?.address ?? '');
    _provinceController = TextEditingController(text: user?.province ?? '');
    _cityController = TextEditingController(text: user?.city ?? '');
    _barangayController = TextEditingController(text: user?.barangay ?? '');
    _zipCodeController = TextEditingController(text: user?.zipCode ?? '');
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _middleNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _mobileController.dispose();
    _addressController.dispose();
    _provinceController.dispose();
    _cityController.dispose();
    _barangayController.dispose();
    _zipCodeController.dispose();
    super.dispose();
  }

  Future<void> _handleEditPhoto() async {
    final authProvider = context.read<AuthProvider>();
    final hasPhoto = authProvider.currentUser?.photoPath != null;

    await showProfilePhotoOptions(
      context,
      hasPhoto: hasPhoto,
      onTakePhoto: () => authProvider.updateProfilePhoto('mock_photo'),
      onChooseFromGallery: () => authProvider.updateProfilePhoto('mock_photo'),
      onRemovePhoto: () => authProvider.updateProfilePhoto(null),
    );
  }

  Future<void> _handleSave() async {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);
    await context.read<AuthProvider>().updateProfile(
      firstName: _firstNameController.text.trim(),
      middleName: _middleNameController.text.trim(),
      lastName: _lastNameController.text.trim(),
      mobileNumber: _mobileController.text.trim(),
      address: _addressController.text.trim(),
      province: _provinceController.text.trim(),
      city: _cityController.text.trim(),
      barangay: _barangayController.text.trim(),
      zipCode: _zipCodeController.text.trim(),
    );

    if (!mounted) return;
    setState(() => _isSubmitting = false);
    await SuccessDialog.show(context, message: 'Profile updated successfully.');
    if (mounted) context.pop();
  }

  @override
  Widget build(BuildContext context) {
    final photoPath = context.watch<AuthProvider>().currentUser?.photoPath;

    return Scaffold(
      appBar: AppBar(title: const Text('Edit Profile')),
      body: SafeArea(
        child: FormScrollScaffold(
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: ProfilePhotoAvatar(
                    photoPath: photoPath,
                    initials:
                        context.read<AuthProvider>().currentUser?.initials ??
                        'U',
                    onEditTap: _handleEditPhoto,
                  ),
                ),
                const SizedBox(height: AppSpacing.xl),
                AppTextField(
                  controller: _firstNameController,
                  label: 'First Name',
                  textCapitalization: TextCapitalization.words,
                  validator: (v) =>
                      Validators.required(v, fieldLabel: 'First name'),
                ),
                const SizedBox(height: AppSpacing.md),
                AppTextField(
                  controller: _middleNameController,
                  label: 'Middle Name',
                  hint: 'Optional',
                  textCapitalization: TextCapitalization.words,
                ),
                const SizedBox(height: AppSpacing.md),
                AppTextField(
                  controller: _lastNameController,
                  label: 'Last Name',
                  textCapitalization: TextCapitalization.words,
                  validator: (v) =>
                      Validators.required(v, fieldLabel: 'Last name'),
                ),
                const SizedBox(height: AppSpacing.md),
                AppTextField(
                  controller: _emailController,
                  label: 'Email Address',
                  enabled: false,
                  keyboardType: TextInputType.emailAddress,
                ),
                const SizedBox(height: AppSpacing.md),
                AppTextField(
                  controller: _mobileController,
                  label: 'Mobile Number',
                  hint: '09XXXXXXXXX',
                  keyboardType: TextInputType.phone,
                  validator: Validators.philippineMobile,
                ),
                const SizedBox(height: AppSpacing.md),
                AppTextField(
                  controller: _addressController,
                  label: 'Address',
                  hint: 'House or building number, street',
                  validator: (v) =>
                      Validators.required(v, fieldLabel: 'Address'),
                ),
                const SizedBox(height: AppSpacing.md),
                AppTextField(
                  controller: _provinceController,
                  label: 'Province',
                  validator: (v) =>
                      Validators.required(v, fieldLabel: 'Province'),
                ),
                const SizedBox(height: AppSpacing.md),
                AppTextField(
                  controller: _cityController,
                  label: 'City/Municipality',
                  validator: (v) => Validators.required(
                    v,
                    fieldLabel: 'City or municipality',
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                AppTextField(
                  controller: _barangayController,
                  label: 'Barangay',
                  validator: (v) =>
                      Validators.required(v, fieldLabel: 'Barangay'),
                ),
                const SizedBox(height: AppSpacing.md),
                AppTextField(
                  controller: _zipCodeController,
                  label: 'ZIP Code',
                  keyboardType: TextInputType.number,
                  validator: Validators.postalCode,
                ),
                const SizedBox(height: AppSpacing.xl),
                Row(
                  children: [
                    Expanded(
                      child: SecondaryButton(
                        label: 'Cancel',
                        onPressed: () => context.pop(),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      flex: 2,
                      child: PrimaryButton(
                        label: 'Save Changes',
                        isLoading: _isSubmitting,
                        onPressed: _handleSave,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
