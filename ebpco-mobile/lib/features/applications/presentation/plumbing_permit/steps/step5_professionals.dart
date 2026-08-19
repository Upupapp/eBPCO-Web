import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/plumbing_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/alerts/app_alert.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';
import '../../../../../shared/widgets/uploads/document_upload_tile.dart';
import '../../building_permit/widgets/date_picker_field.dart';
import '../../building_permit/widgets/mock_upload.dart';

/// Step 5 — Plumbing Professionals: the Design Master Plumber (always a
/// Master Plumber) and the Supervisor / Master Plumber in Charge. Unlike
/// the Sanitary / Plumbing Permit, this permit recognizes only one
/// profession, so it is shown as a locked info row (matching the
/// Architectural, Civil / Structural, Electrical, and Mechanical
/// Permits' single-profession pattern), not a dropdown.
class Step5Professionals extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final PlumbingPermitDraft draft;
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

  PlumbingProfessionals get _professionals => widget.draft.professionals;

  @override
  void initState() {
    super.initState();
    final design = _professionals.designMasterPlumber;
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

  @override
  Widget build(BuildContext context) {
    final design = _professionals.designMasterPlumber;
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
                  'The Plumbing Permit requires a licensed Master Plumber '
                  'to sign and seal the plans, and a licensed Master '
                  'Plumber to supervise the work.',
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Design Master Plumber', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Row(
                children: [
                  const Icon(
                    Icons.check_circle,
                    color: AppColors.statusApproved,
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Text(
                      'Profession: Master Plumber',
                      style: AppTypography.bodyStrong,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.md),
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
              label: 'PRC ID',
              document: _professionals.designPrcIdUpload,
              onUpload: () {
                setState(() {
                  _professionals.designPrcIdUpload = createMockDocument(
                    'Design Master Plumber PRC ID',
                    extension: 'jpg',
                  );
                });
                widget.onChanged();
              },
              allowReplace: true,
              onRemove: () {
                setState(() => _professionals.designPrcIdUpload = null);
                widget.onChanged();
              },
            ),
            const SizedBox(height: AppSpacing.md),
            DocumentUploadTile(
              label: 'PTR Document',
              document: _professionals.designPtrDocumentUpload,
              onUpload: () {
                setState(() {
                  _professionals.designPtrDocumentUpload = createMockDocument(
                    'Design Master Plumber PTR',
                  );
                });
                widget.onChanged();
              },
              allowReplace: true,
              onRemove: () {
                setState(() => _professionals.designPtrDocumentUpload = null);
                widget.onChanged();
              },
            ),
            const SizedBox(height: AppSpacing.md),
            DocumentUploadTile(
              label: 'Signed and Sealed Plumbing Plans',
              document: _professionals.signedSealedPlansUpload,
              onUpload: () {
                setState(() {
                  _professionals.signedSealedPlansUpload = createMockDocument(
                    'Signed and Sealed Plumbing Plans',
                  );
                });
                widget.onChanged();
              },
              allowReplace: true,
              onRemove: () {
                setState(() => _professionals.signedSealedPlansUpload = null);
                widget.onChanged();
              },
            ),
            const SizedBox(height: AppSpacing.md),
            DocumentUploadTile(
              label: 'Signed and Sealed Plumbing Specifications',
              document: _professionals.signedSealedSpecificationsUpload,
              onUpload: () {
                setState(() {
                  _professionals.signedSealedSpecificationsUpload =
                      createMockDocument(
                        'Signed and Sealed Plumbing Specifications',
                      );
                });
                widget.onChanged();
              },
              allowReplace: true,
              onRemove: () {
                setState(
                  () => _professionals.signedSealedSpecificationsUpload = null,
                );
                widget.onChanged();
              },
            ),
            const SizedBox(height: AppSpacing.md),
            DocumentUploadTile(
              label: 'Signed Plumbing Calculations',
              isRequired: false,
              statusLabel: 'Optional — when applicable',
              document: _professionals.signedPlumbingCalculationsUpload,
              onUpload: () {
                setState(() {
                  _professionals.signedPlumbingCalculationsUpload =
                      createMockDocument('Signed Plumbing Calculations');
                });
                widget.onChanged();
              },
              allowReplace: true,
              onRemove: () {
                setState(
                  () => _professionals.signedPlumbingCalculationsUpload = null,
                );
                widget.onChanged();
              },
            ),

            const SizedBox(height: AppSpacing.xl),
            Text(
              'Supervisor / Master Plumber In Charge',
              style: AppTypography.cardTitle,
            ),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: SwitchListTile.adaptive(
                contentPadding: EdgeInsets.zero,
                title: const Text(
                  'Is the Design Master Plumber also the Supervisor / In-Charge?',
                ),
                value: _professionals.isSupervisorSameAsDesignMasterPlumber,
                onChanged: (v) {
                  setState(
                    () => _professionals
                        .isSupervisorSameAsDesignMasterPlumber = v,
                  );
                  widget.onChanged();
                },
              ),
            ),
            if (_professionals.isSupervisorSameAsDesignMasterPlumber) ...[
              const SizedBox(height: AppSpacing.md),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'Same as Design Master Plumber',
                      style: AppTypography.bodyStrong,
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    _SummaryRow('Full Name', design.fullName),
                    const SizedBox(height: AppSpacing.sm),
                    _SummaryRow('PRC Number', design.prcNumber),
                    const SizedBox(height: AppSpacing.sm),
                    _SummaryRow('PTR Number', design.ptrNumber),
                  ],
                ),
              ),
            ] else ...[
              const SizedBox(height: AppSpacing.md),
              AppCard(
                child: Row(
                  children: [
                    const Icon(
                      Icons.check_circle,
                      color: AppColors.statusApproved,
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: Text(
                        'Profession: Master Plumber',
                        style: AppTypography.bodyStrong,
                      ),
                    ),
                  ],
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
                label: 'Supervisor PRC ID',
                document: _professionals.supervisorPrcIdUpload,
                onUpload: () {
                  setState(() {
                    _professionals.supervisorPrcIdUpload = createMockDocument(
                      'Supervisor PRC ID',
                      extension: 'jpg',
                    );
                  });
                  widget.onChanged();
                },
                allowReplace: true,
                onRemove: () {
                  setState(() => _professionals.supervisorPrcIdUpload = null);
                  widget.onChanged();
                },
              ),
              const SizedBox(height: AppSpacing.md),
              DocumentUploadTile(
                label: 'Supervisor PTR',
                document: _professionals.supervisorPtrUpload,
                onUpload: () {
                  setState(() {
                    _professionals.supervisorPtrUpload = createMockDocument(
                      'Supervisor PTR',
                    );
                  });
                  widget.onChanged();
                },
                allowReplace: true,
                onRemove: () {
                  setState(() => _professionals.supervisorPtrUpload = null);
                  widget.onChanged();
                },
              ),
              const SizedBox(height: AppSpacing.md),
              DocumentUploadTile(
                label: 'Signed Supervisor Confirmation',
                document: _professionals.signedSupervisorConfirmationUpload,
                onUpload: () {
                  setState(() {
                    _professionals.signedSupervisorConfirmationUpload =
                        createMockDocument('Signed Supervisor Confirmation');
                  });
                  widget.onChanged();
                },
                allowReplace: true,
                onRemove: () {
                  setState(
                    () =>
                        _professionals.signedSupervisorConfirmationUpload =
                            null,
                  );
                  widget.onChanged();
                },
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;

  const _SummaryRow(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTypography.caption),
        const SizedBox(height: 2),
        Text(
          value.trim().isEmpty ? 'Not set' : value,
          style: AppTypography.bodyStrong,
        ),
      ],
    );
  }
}
