import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
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

/// Step 8 — Full-Time Inspector / Supervisor (Box 4). Kept as its own
/// step, separate from Step 7's Design Professional, as in the Fencing
/// Permit's equivalent steps. Offers a one-shot "use the same
/// information" checkbox — checking it copies the Design Professional's
/// values once; it is not kept in sync afterward.
class Step8Supervisor extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final SignPermitDraft draft;
  final VoidCallback onChanged;

  const Step8Supervisor({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step8Supervisor> createState() => _Step8SupervisorState();
}

class _Step8SupervisorState extends State<Step8Supervisor> {
  late final TextEditingController _fullName;
  late final TextEditingController _address;
  late final TextEditingController _prcNumber;
  late final TextEditingController _ptrNumber;
  late final TextEditingController _ptrPlaceIssued;
  late final TextEditingController _tin;

  bool _useSameAsDesignProfessional = false;

  SignProfessionals get _professionals => widget.draft.professionals;
  SignProfessionalInfo get _supervisor => _professionals.supervisor;

  @override
  void initState() {
    super.initState();
    _fullName = TextEditingController(text: _supervisor.fullName);
    _address = TextEditingController(text: _supervisor.address);
    _prcNumber = TextEditingController(text: _supervisor.prcNumber);
    _ptrNumber = TextEditingController(text: _supervisor.ptrNumber);
    _ptrPlaceIssued = TextEditingController(text: _supervisor.ptrPlaceIssued);
    _tin = TextEditingController(text: _supervisor.tin);
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

  void _handleUseSameToggled(bool value) {
    setState(() {
      _useSameAsDesignProfessional = value;
      if (value) {
        _professionals.copyDesignProfessionalToSupervisor();
        _fullName.text = _supervisor.fullName;
        _address.text = _supervisor.address;
        _prcNumber.text = _supervisor.prcNumber;
        _ptrNumber.text = _supervisor.ptrNumber;
        _ptrPlaceIssued.text = _supervisor.ptrPlaceIssued;
        _tin.text = _supervisor.tin;
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
            const AppAlert(
              variant: AppAlertVariant.info,
              message:
                  'This section must be completed by the licensed '
                  'Architect or Civil Engineer supervising or taking '
                  'charge of the sign installation.',
            ),

            const SizedBox(height: AppSpacing.xl),
            Text(
              'Full-Time Inspector / Supervisor',
              style: AppTypography.cardTitle,
            ),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: CheckboxListTile(
                contentPadding: EdgeInsets.zero,
                controlAffinity: ListTileControlAffinity.leading,
                activeColor: AppColors.primary,
                title: const Text(
                  'Use the same information as the Design Professional',
                ),
                value: _useSameAsDesignProfessional,
                onChanged: (v) => _handleUseSameToggled(v ?? false),
              ),
            ),
            const SizedBox(height: AppSpacing.md),
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
                      _supervisor.fullName = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppDropdown<SignProfessionType>(
                    value: _supervisor.profession,
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
                      setState(() => _supervisor.profession = v);
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
                      _supervisor.address = v;
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
                      _supervisor.prcNumber = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'PRC Validity *',
                    value: _supervisor.prcValidityDate,
                    validator: (_) => _supervisor.prcValidityDate == null
                        ? 'Please select the PRC validity date.'
                        : null,
                    onChanged: (date) {
                      setState(() => _supervisor.prcValidityDate = date);
                      widget.onChanged();
                    },
                  ),
                  if (_supervisor.prcAppearsExpired) ...[
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
                      _supervisor.ptrNumber = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'PTR Date Issued *',
                    value: _supervisor.ptrDateIssued,
                    validator: (_) => _supervisor.ptrDateIssued == null
                        ? 'Please select the PTR date issued.'
                        : null,
                    onChanged: (date) {
                      setState(() => _supervisor.ptrDateIssued = date);
                      widget.onChanged();
                    },
                  ),
                  if (_supervisor.ptrDateIssuedInFuture) ...[
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
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'PTR place issued',
                    ),
                    onChanged: (v) {
                      _supervisor.ptrPlaceIssued = v;
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
                      _supervisor.tin = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'Date Signed',
                    hint: 'Optional',
                    value: _supervisor.dateSigned,
                    onChanged: (date) {
                      setState(() => _supervisor.dateSigned = date);
                      widget.onChanged();
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            DocumentUploadTile(
              label: 'Signed Supervisor Confirmation',
              document: _professionals.supervisorSignedDocumentUpload,
              onUpload: () {
                setState(() {
                  _professionals.supervisorSignedDocumentUpload =
                      createMockDocument('Signed Supervisor Confirmation');
                });
                widget.onChanged();
              },
              allowReplace: true,
              onRemove: () {
                setState(
                  () => _professionals.supervisorSignedDocumentUpload = null,
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
