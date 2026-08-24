import 'package:flutter/material.dart';

import '../../../../../core/models/zoning_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';

/// Step 1 — Applicant Information.
class Step1ApplicantInfo extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final ZoningPermitDraft draft;
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

  ZoningApplicantInfo get _applicant => widget.draft.applicant;

  @override
  void initState() {
    super.initState();
    _firstName = TextEditingController(text: _applicant.firstName);
    _middleName = TextEditingController(text: _applicant.middleName);
    _lastName = TextEditingController(text: _applicant.lastName);
    _tin = TextEditingController(text: _applicant.tin);
    _contactNumber = TextEditingController(text: _applicant.contactNumber);
  }

  @override
  void dispose() {
    _firstName.dispose();
    _middleName.dispose();
    _lastName.dispose();
    _tin.dispose();
    _contactNumber.dispose();
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
            Text('Applicant Information', style: AppTypography.cardTitle),
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
          ],
        ),
      ),
    );
  }
}
