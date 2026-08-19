import 'package:flutter/material.dart';

import '../../../../../core/models/sign_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/alerts/app_alert.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_dropdown.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';
import '../../../../../shared/widgets/uploads/document_upload_tile.dart';
import '../../building_permit/widgets/date_picker_field.dart';
import '../../building_permit/widgets/mock_upload.dart';

/// Step 7 — Design Professional (Box 3). Kept as its own step (rather
/// than combined with the Supervisor step), as in the Fencing Permit's
/// equivalent step.
class Step7DesignProfessional extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final SignPermitDraft draft;
  final VoidCallback onChanged;

  const Step7DesignProfessional({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step7DesignProfessional> createState() =>
      _Step7DesignProfessionalState();
}

class _Step7DesignProfessionalState extends State<Step7DesignProfessional> {
  late final TextEditingController _fullName;
  late final TextEditingController _address;
  late final TextEditingController _prcNumber;
  late final TextEditingController _ptrNumber;
  late final TextEditingController _ptrPlaceIssued;
  late final TextEditingController _tin;

  SignProfessionals get _professionals => widget.draft.professionals;
  SignProfessionalInfo get _design => _professionals.designProfessional;

  @override
  void initState() {
    super.initState();
    _fullName = TextEditingController(text: _design.fullName);
    _address = TextEditingController(text: _design.address);
    _prcNumber = TextEditingController(text: _design.prcNumber);
    _ptrNumber = TextEditingController(text: _design.ptrNumber);
    _ptrPlaceIssued = TextEditingController(text: _design.ptrPlaceIssued);
    _tin = TextEditingController(text: _design.tin);
  }

  @override
  void dispose() {
    _fullName.dispose();
    _address.dispose();
    _prcNumber.dispose();
    _ptrNumber.dispose();
    _ptrPlaceIssued.dispose();
    _tin.dispose();
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
            const AppAlert(
              variant: AppAlertVariant.info,
              message:
                  'This section must be completed by the licensed '
                  'Architect or Civil Engineer responsible for the sign '
                  'plans.',
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Design Professional', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _fullName,
                    label: 'Full Name *',
                    textCapitalization: TextCapitalization.words,
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'Full name'),
                    onChanged: (v) {
                      _design.fullName = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppDropdown<SignProfessionType>(
                    value: _design.profession,
                    label: 'Profession *',
                    items: SignProfessionType.values
                        .map(
                          (p) => DropdownMenuItem(
                            value: p,
                            child: Text(p.label),
                          ),
                        )
                        .toList(),
                    validator: (v) =>
                        v == null ? 'Please select a profession.' : null,
                    onChanged: (v) {
                      setState(() => _design.profession = v);
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _address,
                    label: 'Professional Address *',
                    textCapitalization: TextCapitalization.words,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Professional address',
                    ),
                    onChanged: (v) {
                      _design.address = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _prcNumber,
                    label: 'PRC Number *',
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'PRC number'),
                    onChanged: (v) {
                      _design.prcNumber = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'PRC Validity *',
                    value: _design.prcValidityDate,
                    validator: (_) => _design.prcValidityDate == null
                        ? 'Please select the PRC validity date.'
                        : null,
                    onChanged: (date) {
                      setState(() => _design.prcValidityDate = date);
                      widget.onChanged();
                    },
                  ),
                  if (_design.prcAppearsExpired) ...[
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      'This PRC validity date has already passed. You may '
                      'continue, but please double-check the date.',
                      style: AppTypography.helper.copyWith(
                        color: Colors.orange.shade800,
                      ),
                    ),
                  ],
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _ptrNumber,
                    label: 'PTR Number *',
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'PTR number'),
                    onChanged: (v) {
                      _design.ptrNumber = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'PTR Date Issued *',
                    value: _design.ptrDateIssued,
                    validator: (_) => _design.ptrDateIssued == null
                        ? 'Please select the PTR date issued.'
                        : null,
                    onChanged: (date) {
                      setState(() => _design.ptrDateIssued = date);
                      widget.onChanged();
                    },
                  ),
                  if (_design.ptrDateIssuedInFuture) ...[
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      'This PTR date issued is in the future. You may '
                      'continue, but please double-check the date.',
                      style: AppTypography.helper.copyWith(
                        color: Colors.orange.shade800,
                      ),
                    ),
                  ],
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _ptrPlaceIssued,
                    label: 'PTR Place Issued *',
                    textCapitalization: TextCapitalization.words,
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'PTR place issued'),
                    onChanged: (v) {
                      _design.ptrPlaceIssued = v;
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
                      _design.tin = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'Date Signed',
                    hint: 'Optional',
                    value: _design.dateSigned,
                    onChanged: (date) {
                      setState(() => _design.dateSigned = date);
                      widget.onChanged();
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            DocumentUploadTile(
              label: 'Signed and Sealed Sign Plans',
              document: _professionals.designSignedDocumentUpload,
              onUpload: () {
                setState(() {
                  _professionals.designSignedDocumentUpload =
                      createMockDocument(
                        'Design Professional Signed Documents',
                      );
                });
                widget.onChanged();
              },
              allowReplace: true,
              onRemove: () {
                setState(
                  () => _professionals.designSignedDocumentUpload = null,
                );
                widget.onChanged();
              },
            ),
          ],
        ),
      ),
    );
  }
}
