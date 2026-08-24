import 'package:flutter/material.dart';

import '../../../../../core/models/zoning_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';

/// Step 2 — Property & Location Information. A Locational Clearance is
/// filed before any Building Permit exists, so this step (rather than a
/// related-permit reference) is where the property itself is described.
class Step2PropertyLocation extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final ZoningPermitDraft draft;
  final VoidCallback onChanged;

  const Step2PropertyLocation({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step2PropertyLocation> createState() => _Step2PropertyLocationState();
}

class _Step2PropertyLocationState extends State<Step2PropertyLocation> {
  late final TextEditingController _lotNumber;
  late final TextEditingController _blockNumber;
  late final TextEditingController _tctOrTaxDeclarationNumber;
  late final TextEditingController _street;
  late final TextEditingController _barangay;
  late final TextEditingController _city;
  late final TextEditingController _province;
  late final TextEditingController _existingLandUse;
  late final TextEditingController _intendedUseOrPurpose;

  ZoningPropertyLocation get _location => widget.draft.propertyLocation;

  @override
  void initState() {
    super.initState();
    _lotNumber = TextEditingController(text: _location.lotNumber);
    _blockNumber = TextEditingController(text: _location.blockNumber);
    _tctOrTaxDeclarationNumber = TextEditingController(
      text: _location.tctOrTaxDeclarationNumber,
    );
    _street = TextEditingController(text: _location.street);
    _barangay = TextEditingController(text: _location.barangay);
    _city = TextEditingController(text: _location.city);
    _province = TextEditingController(text: _location.province);
    _existingLandUse = TextEditingController(text: _location.existingLandUse);
    _intendedUseOrPurpose = TextEditingController(
      text: _location.intendedUseOrPurpose,
    );
  }

  @override
  void dispose() {
    _lotNumber.dispose();
    _blockNumber.dispose();
    _tctOrTaxDeclarationNumber.dispose();
    _street.dispose();
    _barangay.dispose();
    _city.dispose();
    _province.dispose();
    _existingLandUse.dispose();
    _intendedUseOrPurpose.dispose();
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
            Text('Property Location', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
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
                    controller: _tctOrTaxDeclarationNumber,
                    label: 'TCT or Tax Declaration Number',
                    hint: 'Optional',
                    onChanged: (v) {
                      _location.tctOrTaxDeclarationNumber = v;
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
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _province,
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
            Text('Land Use', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _existingLandUse,
                    label: 'Existing Land Use',
                    hint: 'e.g. Vacant lot, Residential',
                    onChanged: (v) {
                      _location.existingLandUse = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _intendedUseOrPurpose,
                    label: 'Intended Use or Purpose *',
                    hint: 'e.g. Construction of a residential building',
                    maxLines: 2,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Intended use or purpose',
                    ),
                    onChanged: (v) {
                      _location.intendedUseOrPurpose = v;
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
