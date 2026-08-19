import 'package:flutter/material.dart';

import '../../../../../core/models/interior_design_permit_model.dart';
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

/// Step 5 — Interior Design Professionals: the Licensed Design
/// Professional (Box 3) and the Full-Time Inspector / Supervisor (Box 4),
/// combined into one step matching every other permit's Professionals
/// step. Unlike every other permit, the two roles are never assumed to be
/// the same person by default — there is no same-person toggle. Instead
/// the Supervisor section offers an explicit "Use the same professional
/// information" action that copies the Design Professional's details
/// once; both sections always remain independently editable and
/// required.
class Step5Professionals extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final InteriorPermitDraft draft;
  final VoidCallback onChanged;

  const Step5Professionals({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step5Professionals> createState() => _Step5ProfessionalsState();
}

class _Step5ProfessionalsState extends State<Step5Professionals> {
  late final TextEditingController _designFullName;
  late final TextEditingController _designAddress;
  late final TextEditingController _designPrcNumber;
  late final TextEditingController _designPtrNumber;
  late final TextEditingController _designPtrPlaceIssued;
  late final TextEditingController _designTin;

  late final TextEditingController _supervisorFullName;
  late final TextEditingController _supervisorAddress;
  late final TextEditingController _supervisorPrcNumber;
  late final TextEditingController _supervisorPtrNumber;
  late final TextEditingController _supervisorPtrPlaceIssued;
  late final TextEditingController _supervisorTin;

  InteriorProfessionals get _professionals => widget.draft.professionals;

  @override
  void initState() {
    super.initState();
    final design = _professionals.designProfessional;
    _designFullName = TextEditingController(text: design.fullName);
    _designAddress = TextEditingController(text: design.address);
    _designPrcNumber = TextEditingController(text: design.prcNumber);
    _designPtrNumber = TextEditingController(text: design.ptrNumber);
    _designPtrPlaceIssued = TextEditingController(text: design.ptrPlaceIssued);
    _designTin = TextEditingController(text: design.tin);

    final supervisor = _professionals.supervisor;
    _supervisorFullName = TextEditingController(text: supervisor.fullName);
    _supervisorAddress = TextEditingController(text: supervisor.address);
    _supervisorPrcNumber = TextEditingController(text: supervisor.prcNumber);
    _supervisorPtrNumber = TextEditingController(text: supervisor.ptrNumber);
    _supervisorPtrPlaceIssued = TextEditingController(
      text: supervisor.ptrPlaceIssued,
    );
    _supervisorTin = TextEditingController(text: supervisor.tin);
  }

  @override
  void dispose() {
    _designFullName.dispose();
    _designAddress.dispose();
    _designPrcNumber.dispose();
    _designPtrNumber.dispose();
    _designPtrPlaceIssued.dispose();
    _designTin.dispose();
    _supervisorFullName.dispose();
    _supervisorAddress.dispose();
    _supervisorPrcNumber.dispose();
    _supervisorPtrNumber.dispose();
    _supervisorPtrPlaceIssued.dispose();
    _supervisorTin.dispose();
    super.dispose();
  }

  void _copyFromDesignProfessional() {
    setState(() {
      _professionals.copyDesignProfessionalToSupervisor();
      final supervisor = _professionals.supervisor;
      _supervisorFullName.text = supervisor.fullName;
      _supervisorAddress.text = supervisor.address;
      _supervisorPrcNumber.text = supervisor.prcNumber;
      _supervisorPtrNumber.text = supervisor.ptrNumber;
      _supervisorPtrPlaceIssued.text = supervisor.ptrPlaceIssued;
      _supervisorTin.text = supervisor.tin;
    });
    widget.onChanged();
  }

  @override
  Widget build(BuildContext context) {
    final design = _professionals.designProfessional;
    final supervisor = _professionals.supervisor;

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
                  'This section must be completed by the Licensed Design '
                  'Professional responsible for the interior design plans, '
                  'and by the professional supervising the work. These are '
                  'not assumed to be the same person.',
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Licensed Design Professional', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _designFullName,
                    label: 'Full Name *',
                    textCapitalization: TextCapitalization.words,
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'Full name'),
                    onChanged: (v) {
                      design.fullName = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppDropdown<InteriorProfessionType>(
                    value: design.profession,
                    label: 'Profession *',
                    items: interiorDesignProfessionalOptions
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
                      setState(() => design.profession = v);
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _designAddress,
                    label: 'Professional Address *',
                    textCapitalization: TextCapitalization.words,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Professional address',
                    ),
                    onChanged: (v) {
                      design.address = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _designPrcNumber,
                    label: 'PRC Number *',
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'PRC number'),
                    onChanged: (v) {
                      design.prcNumber = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'PRC Validity *',
                    value: design.prcValidityDate,
                    validator: (_) => design.prcValidityDate == null
                        ? 'Please select the PRC validity date.'
                        : null,
                    onChanged: (date) {
                      setState(() => design.prcValidityDate = date);
                      widget.onChanged();
                    },
                  ),
                  if (design.prcAppearsExpired) ...[
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
                    controller: _designPtrNumber,
                    label: 'PTR Number *',
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'PTR number'),
                    onChanged: (v) {
                      design.ptrNumber = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'PTR Date Issued *',
                    value: design.ptrDateIssued,
                    validator: (_) => design.ptrDateIssued == null
                        ? 'Please select the PTR date issued.'
                        : null,
                    onChanged: (date) {
                      setState(() => design.ptrDateIssued = date);
                      widget.onChanged();
                    },
                  ),
                  if (design.ptrDateIssuedInFuture) ...[
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
                    controller: _designPtrPlaceIssued,
                    label: 'PTR Place Issued *',
                    textCapitalization: TextCapitalization.words,
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'PTR place issued'),
                    onChanged: (v) {
                      design.ptrPlaceIssued = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _designTin,
                    label: 'TIN',
                    hint: 'Optional',
                    keyboardType: TextInputType.number,
                    onChanged: (v) {
                      design.tin = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'Date Signed',
                    hint: 'Optional',
                    value: design.dateSigned,
                    onChanged: (date) {
                      setState(() => design.dateSigned = date);
                      widget.onChanged();
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            DocumentUploadTile(
              label: 'Signed and Sealed Interior Design Documents',
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

            const SizedBox(height: AppSpacing.xl),
            Text(
              'Full-Time Inspector / Supervisor',
              style: AppTypography.cardTitle,
            ),
            const SizedBox(height: AppSpacing.sm),
            OutlinedButton.icon(
              onPressed: _copyFromDesignProfessional,
              icon: const Icon(Icons.copy_outlined),
              label: const Text(
                'Use the same professional information as the Licensed '
                'Design Professional',
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _supervisorFullName,
                    label: 'Full Name *',
                    textCapitalization: TextCapitalization.words,
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'Full name'),
                    onChanged: (v) {
                      supervisor.fullName = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppDropdown<InteriorProfessionType>(
                    value: supervisor.profession,
                    label: 'Profession *',
                    items: interiorSupervisorOptions
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
                      setState(() => supervisor.profession = v);
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _supervisorAddress,
                    label: 'Professional Address *',
                    textCapitalization: TextCapitalization.words,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Professional address',
                    ),
                    onChanged: (v) {
                      supervisor.address = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _supervisorPrcNumber,
                    label: 'PRC Number *',
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'PRC number'),
                    onChanged: (v) {
                      supervisor.prcNumber = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'PRC Validity *',
                    value: supervisor.prcValidityDate,
                    validator: (_) => supervisor.prcValidityDate == null
                        ? 'Please select the PRC validity date.'
                        : null,
                    onChanged: (date) {
                      setState(() => supervisor.prcValidityDate = date);
                      widget.onChanged();
                    },
                  ),
                  if (supervisor.prcAppearsExpired) ...[
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
                    controller: _supervisorPtrNumber,
                    label: 'PTR Number *',
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'PTR number'),
                    onChanged: (v) {
                      supervisor.ptrNumber = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'PTR Date Issued *',
                    value: supervisor.ptrDateIssued,
                    validator: (_) => supervisor.ptrDateIssued == null
                        ? 'Please select the PTR date issued.'
                        : null,
                    onChanged: (date) {
                      setState(() => supervisor.ptrDateIssued = date);
                      widget.onChanged();
                    },
                  ),
                  if (supervisor.ptrDateIssuedInFuture) ...[
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
                    controller: _supervisorPtrPlaceIssued,
                    label: 'PTR Place Issued *',
                    textCapitalization: TextCapitalization.words,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'PTR place issued',
                    ),
                    onChanged: (v) {
                      supervisor.ptrPlaceIssued = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _supervisorTin,
                    label: 'TIN',
                    hint: 'Optional',
                    keyboardType: TextInputType.number,
                    onChanged: (v) {
                      supervisor.tin = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'Date Signed',
                    hint: 'Optional',
                    value: supervisor.dateSigned,
                    onChanged: (date) {
                      setState(() => supervisor.dateSigned = date);
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
