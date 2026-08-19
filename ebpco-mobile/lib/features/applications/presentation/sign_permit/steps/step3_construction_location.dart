import 'package:flutter/material.dart';

import '../../../../../core/models/sign_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';

/// Step 3 — Construction Location. No province field, matching the
/// official form's field list for this permit.
class Step3ConstructionLocation extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final SignPermitDraft draft;
  final VoidCallback onChanged;

  const Step3ConstructionLocation({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step3ConstructionLocation> createState() =>
      _Step3ConstructionLocationState();
}

class _Step3ConstructionLocationState
    extends State<Step3ConstructionLocation> {
  late final TextEditingController _lotNumber;
  late final TextEditingController _blockNumber;
  late final TextEditingController _tctNumber;
  late final TextEditingController _taxDeclarationNumber;
  late final TextEditingController _street;
  late final TextEditingController _barangay;
  late final TextEditingController _city;

  SignConstructionLocation get _location => widget.draft.constructionLocation;

  @override
  void initState() {
    super.initState();
    _lotNumber = TextEditingController(text: _location.lotNumber);
    _blockNumber = TextEditingController(text: _location.blockNumber);
    _tctNumber = TextEditingController(text: _location.tctNumber);
    _taxDeclarationNumber = TextEditingController(
      text: _location.taxDeclarationNumber,
    );
    _street = TextEditingController(text: _location.street);
    _barangay = TextEditingController(text: _location.barangay);
    _city = TextEditingController(text: _location.city);
  }

  @override
  void dispose() {
    _lotNumber.dispose();
    _blockNumber.dispose();
    _tctNumber.dispose();
    _taxDeclarationNumber.dispose();
    _street.dispose();
    _barangay.dispose();
    _city.dispose();
    super.dispose();
  }

  void _handleUseSameAddressToggled(bool value) {
    setState(() {
      widget.draft.useApplicantAddressForConstructionLocation = value;
      if (value) {
        widget.draft.copyApplicantAddressToConstructionLocation();
        _street.text = _location.street;
        _barangay.text = _location.barangay;
        _city.text = _location.city;
      }
    });
    widget.onChanged();
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
            Text('Construction Location', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  SwitchListTile.adaptive(
                    contentPadding: EdgeInsets.zero,
                    title: const Text(
                      'Construction location is the same as my address.',
                    ),
                    value:
                        widget.draft.useApplicantAddressForConstructionLocation,
                    onChanged: _handleUseSameAddressToggled,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  AppTextField(
                    controller: _lotNumber,
                    label: 'Lot Number *',
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'Lot number'),
                    onChanged: (v) {
                      _location.lotNumber = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _blockNumber,
                    label: 'Block Number',
                    hint: 'Optional',
                    onChanged: (v) {
                      _location.blockNumber = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _tctNumber,
                    label: 'TCT Number',
                    hint: 'Transfer Certificate of Title.',
                    onChanged: (v) {
                      _location.tctNumber = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _taxDeclarationNumber,
                    label: 'Tax Declaration Number',
                    hint: 'Found on your property tax declaration.',
                    onChanged: (v) {
                      _location.taxDeclarationNumber = v;
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
                      _location.street = v;
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
                      _location.barangay = v;
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
                      _location.city = v;
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
