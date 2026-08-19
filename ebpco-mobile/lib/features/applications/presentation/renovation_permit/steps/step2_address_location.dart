import 'package:flutter/material.dart';

import '../../../../../core/models/renovation_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';

/// Step 2 — Applicant Address & Renovation Location. The "Renovation
/// location is the same as my address" toggle copies the applicant
/// address into the renovation location fields once at the moment it's
/// switched on; the copied values then stay independently editable. The
/// user-friendly "Renovation Location" label maps internally to the
/// official form's "Location of Construction" fields.
class Step2AddressLocation extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final RenovationPermitDraft draft;
  final VoidCallback onChanged;

  const Step2AddressLocation({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step2AddressLocation> createState() => _Step2AddressLocationState();
}

class _Step2AddressLocationState extends State<Step2AddressLocation> {
  // Applicant address controllers.
  late final TextEditingController _houseNumber;
  late final TextEditingController _street;
  late final TextEditingController _barangay;
  late final TextEditingController _city;
  late final TextEditingController _province;
  late final TextEditingController _zipCode;

  // Renovation location controllers.
  late final TextEditingController _lotNumber;
  late final TextEditingController _blockNumber;
  late final TextEditingController _tctNumber;
  late final TextEditingController _taxDeclarationNumber;
  late final TextEditingController _locStreet;
  late final TextEditingController _locBarangay;
  late final TextEditingController _locCity;
  late final TextEditingController _locProvince;

  RenovationApplicantAddress get _address => widget.draft.applicantAddress;
  RenovationLocation get _location => widget.draft.renovationLocation;

  @override
  void initState() {
    super.initState();
    _houseNumber = TextEditingController(text: _address.houseNumber);
    _street = TextEditingController(text: _address.street);
    _barangay = TextEditingController(text: _address.barangay);
    _city = TextEditingController(text: _address.city);
    _province = TextEditingController(text: _address.province);
    _zipCode = TextEditingController(text: _address.zipCode);

    _lotNumber = TextEditingController(text: _location.lotNumber);
    _blockNumber = TextEditingController(text: _location.blockNumber);
    _tctNumber = TextEditingController(text: _location.tctNumber);
    _taxDeclarationNumber = TextEditingController(
      text: _location.taxDeclarationNumber,
    );
    _locStreet = TextEditingController(text: _location.street);
    _locBarangay = TextEditingController(text: _location.barangay);
    _locCity = TextEditingController(text: _location.city);
    _locProvince = TextEditingController(text: _location.province);
  }

  @override
  void dispose() {
    _houseNumber.dispose();
    _street.dispose();
    _barangay.dispose();
    _city.dispose();
    _province.dispose();
    _zipCode.dispose();
    _lotNumber.dispose();
    _blockNumber.dispose();
    _tctNumber.dispose();
    _taxDeclarationNumber.dispose();
    _locStreet.dispose();
    _locBarangay.dispose();
    _locCity.dispose();
    _locProvince.dispose();
    super.dispose();
  }

  void _handleUseSameAddressToggled(bool value) {
    setState(() {
      widget.draft.useApplicantAddressForRenovationLocation = value;
      if (value) {
        widget.draft.copyApplicantAddressToRenovationLocation();
        _locStreet.text = _location.street;
        _locBarangay.text = _location.barangay;
        _locCity.text = _location.city;
        _locProvince.text = _location.province;
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
            Text('Applicant Address', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _houseNumber,
                    label: 'House / Building Number',
                    hint: 'Optional',
                    onChanged: (v) {
                      _address.houseNumber = v;
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
                      _address.street = v;
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
                      _address.barangay = v;
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
                      _address.city = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _province,
                    label: 'Province *',
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'Province'),
                    onChanged: (v) {
                      _address.province = v;
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
                      _address.zipCode = v;
                      widget.onChanged();
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Renovation Location', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  SwitchListTile.adaptive(
                    contentPadding: EdgeInsets.zero,
                    title: const Text(
                      'Renovation location is the same as my address.',
                    ),
                    value:
                        widget.draft.useApplicantAddressForRenovationLocation,
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
                    controller: _locStreet,
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
                    controller: _locBarangay,
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
                    controller: _locCity,
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
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _locProvince,
                    label: 'Province *',
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'Province'),
                    onChanged: (v) {
                      _location.province = v;
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
