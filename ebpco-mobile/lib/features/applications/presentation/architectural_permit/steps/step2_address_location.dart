import 'package:flutter/material.dart';

import '../../../../../core/models/architectural_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_dropdown.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';

/// Step 2 — Applicant Address, Project Location & Related Building
/// Permit. The Application Number and Architectural Permit Number are
/// never asked of the applicant — both are system-generated at
/// submission, matching every other permit workflow in this app.
class Step2AddressLocation extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final ArchitecturalPermitDraft draft;
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

  // Project location controllers.
  late final TextEditingController _lotNumber;
  late final TextEditingController _blockNumber;
  late final TextEditingController _tctNumber;
  late final TextEditingController _taxDeclarationNumber;
  late final TextEditingController _locStreet;
  late final TextEditingController _locBarangay;
  late final TextEditingController _locCity;
  late final TextEditingController _locProvince;

  // Related Building Permit controller.
  late final TextEditingController _buildingPermitNumber;

  ArchitecturalApplicantAddress get _address => widget.draft.applicantAddress;
  ArchitecturalProjectLocation get _location => widget.draft.projectLocation;
  ArchitecturalRelatedBuildingPermit get _relatedPermit =>
      widget.draft.relatedBuildingPermit;

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

    _buildingPermitNumber = TextEditingController(
      text: _relatedPermit.buildingPermitNumber,
    );
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
    _buildingPermitNumber.dispose();
    super.dispose();
  }

  void _handleUseSameAddressToggled(bool value) {
    setState(() {
      widget.draft.useApplicantAddressForProjectLocation = value;
      if (value) {
        widget.draft.copyApplicantAddressToProjectLocation();
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
            Text('Project Location', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  SwitchListTile.adaptive(
                    contentPadding: EdgeInsets.zero,
                    title: const Text(
                      'Project location is the same as my address.',
                    ),
                    value: widget.draft.useApplicantAddressForProjectLocation,
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

            const SizedBox(height: AppSpacing.xl),
            Text('Related Building Permit', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'This Architectural Permit is invalid without a related '
              'Building Permit. If it has not been issued yet, leave the '
              'status as "Pending Issuance."',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppDropdown<RelatedBuildingPermitStatus>(
                    value: _relatedPermit.status,
                    label: 'Related Building Permit Status *',
                    items: RelatedBuildingPermitStatus.values
                        .map(
                          (s) => DropdownMenuItem(
                            value: s,
                            child: Text(s.label),
                          ),
                        )
                        .toList(),
                    onChanged: (v) {
                      if (v == null) return;
                      setState(() => _relatedPermit.status = v);
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _buildingPermitNumber,
                    label: _relatedPermit.status ==
                            RelatedBuildingPermitStatus.issued
                        ? 'Building Permit Number *'
                        : 'Building Permit Number',
                    hint: _relatedPermit.status ==
                            RelatedBuildingPermitStatus.issued
                        ? 'Enter the issued Building Permit number.'
                        : 'Optional while pending issuance.',
                    validator: (v) =>
                        _relatedPermit.status ==
                            RelatedBuildingPermitStatus.issued
                        ? Validators.required(
                            v,
                            fieldLabel: 'Building Permit Number',
                          )
                        : null,
                    onChanged: (v) {
                      _relatedPermit.buildingPermitNumber = v;
                      widget.onChanged();
                    },
                  ),
                  if (mockExistingBuildingPermitNumbers.isNotEmpty) ...[
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      'Or select a recent Building Permit application:',
                      style: AppTypography.caption,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Wrap(
                      spacing: AppSpacing.sm,
                      runSpacing: AppSpacing.sm,
                      children: [
                        for (final number in mockExistingBuildingPermitNumbers)
                          ActionChip(
                            label: Text(number),
                            onPressed: () {
                              setState(() {
                                _buildingPermitNumber.text = number;
                                _relatedPermit.buildingPermitNumber = number;
                              });
                              widget.onChanged();
                            },
                          ),
                      ],
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
