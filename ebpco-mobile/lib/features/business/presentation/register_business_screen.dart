import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/models/business_model.dart';
import '../../../core/providers/business_provider.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/validators.dart';
import '../../../shared/widgets/buttons/primary_button.dart';
import '../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../shared/widgets/text_fields/app_dropdown.dart';
import '../../../shared/widgets/text_fields/app_text_field.dart';

class RegisterBusinessScreen extends StatefulWidget {
  const RegisterBusinessScreen({super.key});

  @override
  State<RegisterBusinessScreen> createState() =>
      _RegisterBusinessScreenState();
}

class _RegisterBusinessScreenState extends State<RegisterBusinessScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _streetController = TextEditingController();
  final _barangayController = TextEditingController();
  final _cityController = TextEditingController();
  final _provinceController = TextEditingController();
  BusinessCategory? _category;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _nameController.dispose();
    _streetController.dispose();
    _barangayController.dispose();
    _cityController.dispose();
    _provinceController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    FocusScope.of(context).unfocus();
    final isFormValid = _formKey.currentState!.validate();
    if (!isFormValid || _category == null) {
      setState(() {});
      return;
    }

    setState(() => _isSubmitting = true);
    final business = await context.read<BusinessProvider>().registerBusiness(
      name: _nameController.text.trim(),
      category: _category!,
      street: _streetController.text.trim(),
      barangay: _barangayController.text.trim(),
      city: _cityController.text.trim(),
      province: _provinceController.text.trim(),
    );

    if (!mounted) return;
    setState(() => _isSubmitting = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('${business.name} has been registered.')),
    );
    context.pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Register Business')),
      body: SafeArea(
        child: FormScrollScaffold(
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text('Business Information', style: AppTypography.sectionTitle),
                const SizedBox(height: 4),
                Text(
                  'Tell us about the business you want to register.',
                  style: AppTypography.bodyMuted,
                ),
                const SizedBox(height: 20),
                AppTextField(
                  controller: _nameController,
                  label: 'Business name',
                  validator: (v) =>
                      Validators.required(v, fieldLabel: 'Business name'),
                ),
                const SizedBox(height: 16),
                AppDropdown<BusinessCategory>(
                  value: _category,
                  label: 'Business category',
                  items: BusinessCategory.values
                      .map(
                        (category) => DropdownMenuItem(
                          value: category,
                          child: Text(category.label),
                        ),
                      )
                      .toList(),
                  onChanged: (value) => setState(() => _category = value),
                  validator: (value) =>
                      value == null ? 'Please select a category.' : null,
                ),
                const SizedBox(height: 16),
                AppTextField(
                  controller: _streetController,
                  label: 'House number / Street',
                  validator: (v) => Validators.required(
                    v,
                    fieldLabel: 'House number / Street',
                  ),
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
                const SizedBox(height: 28),
                PrimaryButton(
                  label: 'Register Business',
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
