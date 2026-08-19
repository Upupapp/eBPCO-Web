import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/addition_extension_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_dropdown.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';

/// Step 1 — Applicant Information. Project Type is fixed to "Addition /
/// Extension" and the official Scope of Work is fixed to "Addition" (not
/// editable) since this wizard is only reached through the Applications
/// → Building Permit → Addition / Extension card.
class Step1ApplicantInfo extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final AdditionExtensionPermitDraft draft;
  final VoidCallback onChanged;

  const Step1ApplicantInfo({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step1ApplicantInfo> createState() => _Step1ApplicantInfoState();
}

class _Step1ApplicantInfoState extends State<Step1ApplicantInfo> {
  late final TextEditingController _firstName;
  late final TextEditingController _middleName;
  late final TextEditingController _lastName;
  late final TextEditingController _tin;
  late final TextEditingController _contactNumber;
  late final TextEditingController _enterpriseName;

  AdditionExtensionApplicantInfo get _applicant => widget.draft.applicant;

  @override
  void initState() {
    super.initState();
    _firstName = TextEditingController(text: _applicant.firstName);
    _middleName = TextEditingController(text: _applicant.middleName);
    _lastName = TextEditingController(text: _applicant.lastName);
    _tin = TextEditingController(text: _applicant.tin);
    _contactNumber = TextEditingController(text: _applicant.contactNumber);
    _enterpriseName = TextEditingController(text: _applicant.enterpriseName);
  }

  @override
  void dispose() {
    _firstName.dispose();
    _middleName.dispose();
    _lastName.dispose();
    _tin.dispose();
    _contactNumber.dispose();
    _enterpriseName.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: widget.formKey,
      child: FormScrollScaffold(
        centerVertically: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Application Type', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppDropdown<AdditionExtensionApplicationType>(
              value: _applicant.applicationType,
              label: 'Application Type *',
              items: AdditionExtensionApplicationType.values
                  .map(
                    (t) => DropdownMenuItem(value: t, child: Text(t.label)),
                  )
                  .toList(),
              onChanged: (v) {
                if (v == null) return;
                setState(() => _applicant.applicationType = v);
                widget.onChanged();
              },
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Project Type', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(
                        Icons.check_circle,
                        color: AppColors.statusApproved,
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: Text(
                          'Addition / Extension',
                          style: AppTypography.bodyStrong,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    'Official Scope of Work: '
                    '${widget.draft.scopeOfWork.displayLabel}',
                    style: AppTypography.caption,
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Personal Information', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _firstName,
                    label: 'First Name *',
                    textCapitalization: TextCapitalization.words,
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'First name'),
                    onChanged: (v) {
                      _applicant.firstName = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _middleName,
                    label: 'Middle Name',
                    hint: 'Optional',
                    textCapitalization: TextCapitalization.words,
                    onChanged: (v) {
                      _applicant.middleName = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _lastName,
                    label: 'Last Name *',
                    textCapitalization: TextCapitalization.words,
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'Last name'),
                    onChanged: (v) {
                      _applicant.lastName = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _tin,
                    label: 'TIN',
                    hint: 'Optional',
                    keyboardType: TextInputType.number,
                    onChanged: (v) {
                      _applicant.tin = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _contactNumber,
                    label: 'Telephone / Mobile Number *',
                    keyboardType: TextInputType.phone,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Telephone or mobile number',
                    ),
                    onChanged: (v) {
                      _applicant.contactNumber = v;
                      widget.onChanged();
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Enterprise Ownership', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  SwitchListTile.adaptive(
                    contentPadding: EdgeInsets.zero,
                    title: const Text(
                      'Is the property owned by an enterprise?',
                    ),
                    value: _applicant.isOwnedByEnterprise,
                    onChanged: (v) {
                      setState(() => _applicant.isOwnedByEnterprise = v);
                      widget.onChanged();
                    },
                  ),
                  if (_applicant.isOwnedByEnterprise) ...[
                    const SizedBox(height: AppSpacing.sm),
                    AppTextField(
                      controller: _enterpriseName,
                      label: 'Enterprise Name *',
                      validator: (v) => _applicant.isOwnedByEnterprise
                          ? Validators.required(
                              v,
                              fieldLabel: 'Enterprise name',
                            )
                          : null,
                      onChanged: (v) {
                        _applicant.enterpriseName = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppDropdown<String>(
                      value: _applicant.formOfOwnership,
                      label: 'Form of Ownership *',
                      items: additionExtensionFormsOfOwnership
                          .map(
                            (v) => DropdownMenuItem(value: v, child: Text(v)),
                          )
                          .toList(),
                      validator: (v) =>
                          _applicant.isOwnedByEnterprise && v == null
                          ? 'Please select a form of ownership.'
                          : null,
                      onChanged: (v) {
                        setState(() => _applicant.formOfOwnership = v);
                        widget.onChanged();
                      },
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
