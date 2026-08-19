import 'package:flutter/material.dart';

import '../../../../../core/models/fencing_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_dropdown.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';

/// Step 2 — Owner / Applicant Information (Box 1). Per the official
/// form's field list for this permit, there is no contact number or
/// province field, and the applicant's address is collected in this same
/// step rather than a separate one.
class Step2OwnerApplicantInfo extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final FencingPermitDraft draft;
  final VoidCallback onChanged;

  const Step2OwnerApplicantInfo({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step2OwnerApplicantInfo> createState() =>
      _Step2OwnerApplicantInfoState();
}

class _Step2OwnerApplicantInfoState extends State<Step2OwnerApplicantInfo> {
  late final TextEditingController _lastName;
  late final TextEditingController _firstName;
  late final TextEditingController _middleInitial;
  late final TextEditingController _tin;
  late final TextEditingController _enterpriseName;
  late final TextEditingController _addressNumber;
  late final TextEditingController _street;
  late final TextEditingController _barangay;
  late final TextEditingController _city;
  late final TextEditingController _zipCode;

  FencingApplicantInfo get _applicant => widget.draft.applicant;

  @override
  void initState() {
    super.initState();
    _lastName = TextEditingController(text: _applicant.lastName);
    _firstName = TextEditingController(text: _applicant.firstName);
    _middleInitial = TextEditingController(text: _applicant.middleInitial);
    _tin = TextEditingController(text: _applicant.tin);
    _enterpriseName = TextEditingController(text: _applicant.enterpriseName);
    _addressNumber = TextEditingController(text: _applicant.addressNumber);
    _street = TextEditingController(text: _applicant.street);
    _barangay = TextEditingController(text: _applicant.barangay);
    _city = TextEditingController(text: _applicant.city);
    _zipCode = TextEditingController(text: _applicant.zipCode);
  }

  @override
  void dispose() {
    _lastName.dispose();
    _firstName.dispose();
    _middleInitial.dispose();
    _tin.dispose();
    _enterpriseName.dispose();
    _addressNumber.dispose();
    _street.dispose();
    _barangay.dispose();
    _city.dispose();
    _zipCode.dispose();
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
            Text('Personal Information', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
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
                    controller: _middleInitial,
                    label: 'Middle Initial',
                    hint: 'Optional',
                    textCapitalization: TextCapitalization.characters,
                    onChanged: (v) {
                      _applicant.middleInitial = v;
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
                      'Is the construction owned by an enterprise?',
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
                      label: 'Enterprise / Business Name *',
                      validator: (v) => _applicant.isOwnedByEnterprise
                          ? Validators.required(
                              v,
                              fieldLabel: 'Enterprise or business name',
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
                      items: fencingFormsOfOwnership
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

            const SizedBox(height: AppSpacing.xl),
            Text('Applicant Address', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _addressNumber,
                    label: 'Address Number',
                    hint: 'Optional',
                    onChanged: (v) {
                      _applicant.addressNumber = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _street,
                    label: 'Street *',
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'Street'),
                    onChanged: (v) {
                      _applicant.street = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _barangay,
                    label: 'Barangay *',
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'Barangay'),
                    onChanged: (v) {
                      _applicant.barangay = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _city,
                    label: 'City / Municipality *',
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'City or municipality',
                    ),
                    onChanged: (v) {
                      _applicant.city = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _zipCode,
                    label: 'ZIP Code',
                    hint: 'Optional',
                    keyboardType: TextInputType.number,
                    onChanged: (v) {
                      _applicant.zipCode = v;
                      widget.onChanged();
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
