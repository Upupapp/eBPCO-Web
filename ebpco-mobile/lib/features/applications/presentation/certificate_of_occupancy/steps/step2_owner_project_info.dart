import 'package:flutter/material.dart';

import '../../../../../core/models/certificate_of_occupancy_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';

/// Step 2 — Owner and Project Information. The owner's address is a
/// single free-text field, matching this form's own flat field list.
class Step2OwnerProjectInfo extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final CertificateOfOccupancyDraft draft;
  final VoidCallback onChanged;

  const Step2OwnerProjectInfo({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step2OwnerProjectInfo> createState() => _Step2OwnerProjectInfoState();
}

class _Step2OwnerProjectInfoState extends State<Step2OwnerProjectInfo> {
  late final TextEditingController _lastName;
  late final TextEditingController _firstName;
  late final TextEditingController _middleInitial;
  late final TextEditingController _address;
  late final TextEditingController _zipCode;
  late final TextEditingController _contactNumber;
  late final TextEditingController _projectName;

  OccupancyOwnerInfo get _owner => widget.draft.owner;

  @override
  void initState() {
    super.initState();
    _lastName = TextEditingController(text: _owner.lastName);
    _firstName = TextEditingController(text: _owner.firstName);
    _middleInitial = TextEditingController(text: _owner.middleInitial);
    _address = TextEditingController(text: _owner.address);
    _zipCode = TextEditingController(text: _owner.zipCode);
    _contactNumber = TextEditingController(text: _owner.contactNumber);
    _projectName = TextEditingController(text: _owner.projectName);
  }

  @override
  void dispose() {
    _lastName.dispose();
    _firstName.dispose();
    _middleInitial.dispose();
    _address.dispose();
    _zipCode.dispose();
    _contactNumber.dispose();
    _projectName.dispose();
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
            Text('Owner / Applicant', style: AppTypography.cardTitle),
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
                      _owner.lastName = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _firstName,
                    label: 'Given Name *',
                    textCapitalization: TextCapitalization.words,
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'Given name'),
                    onChanged: (v) {
                      _owner.firstName = v;
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
                      _owner.middleInitial = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _address,
                    label: 'Address *',
                    textCapitalization: TextCapitalization.words,
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'Address'),
                    onChanged: (v) {
                      _owner.address = v;
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
                      _owner.zipCode = v;
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
                      _owner.contactNumber = v;
                      widget.onChanged();
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Project Information', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: AppTextField(
                controller: _projectName,
                label: 'Project Name *',
                validator: (v) =>
                    Validators.required(v, fieldLabel: 'Project name'),
                onChanged: (v) {
                  _owner.projectName = v;
                  widget.onChanged();
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
