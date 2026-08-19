import 'package:flutter/material.dart';

import '../../../../../core/models/demolition_permit_model.dart';
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

/// Step 5 — Demolition Supervisor: the licensed Architect or Civil Engineer
/// supervising the demolition, their license details, and six-to-seven
/// supporting documents (Structural Assessment only when Step 3 indicates
/// structural involvement).
class Step5DemolitionSupervisor extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final DemolitionPermitDraft draft;
  final VoidCallback onChanged;

  const Step5DemolitionSupervisor({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step5DemolitionSupervisor> createState() =>
      _Step5DemolitionSupervisorState();
}

class _Step5DemolitionSupervisorState
    extends State<Step5DemolitionSupervisor> {
  late final TextEditingController _fullName;
  late final TextEditingController _professionalAddress;
  late final TextEditingController _contactNumber;
  late final TextEditingController _prcNumber;
  late final TextEditingController _ptrNumber;
  late final TextEditingController _ptrPlaceIssued;
  late final TextEditingController _tin;

  DemolitionProfessionalInCharge get _professional => widget.draft.professional;

  @override
  void initState() {
    super.initState();
    _fullName = TextEditingController(text: _professional.fullName);
    _professionalAddress = TextEditingController(
      text: _professional.professionalAddress,
    );
    _contactNumber = TextEditingController(text: _professional.contactNumber);
    _prcNumber = TextEditingController(text: _professional.prcNumber);
    _ptrNumber = TextEditingController(text: _professional.ptrNumber);
    _ptrPlaceIssued = TextEditingController(
      text: _professional.ptrPlaceIssued,
    );
    _tin = TextEditingController(text: _professional.tin);
  }

  @override
  void dispose() {
    _fullName.dispose();
    _professionalAddress.dispose();
    _contactNumber.dispose();
    _prcNumber.dispose();
    _ptrNumber.dispose();
    _ptrPlaceIssued.dispose();
    _tin.dispose();
    super.dispose();
  }

  void _uploadPrcId() {
    setState(() {
      _professional.prcIdUpload = createMockDocument('PRC ID', extension: 'jpg');
    });
    widget.onChanged();
  }

  void _uploadPtr() {
    setState(() {
      _professional.ptrDocumentUpload = createMockDocument('PTR Document');
    });
    widget.onChanged();
  }

  void _uploadSignedSealedForm() {
    setState(() {
      _professional.signedSealedFormUpload = createMockDocument(
        'Signed and Sealed Professional Form',
      );
    });
    widget.onChanged();
  }

  void _uploadDemolitionPlan() {
    setState(() {
      _professional.demolitionPlanUpload = createMockDocument(
        'Demolition Plan',
      );
    });
    widget.onChanged();
  }

  void _uploadDemolitionMethodology() {
    setState(() {
      _professional.demolitionMethodologyUpload = createMockDocument(
        'Demolition Methodology',
      );
    });
    widget.onChanged();
  }

  void _uploadSafetyProgram() {
    setState(() {
      _professional.safetyProgramUpload = createMockDocument(
        'Safety Program',
      );
    });
    widget.onChanged();
  }

  void _uploadStructuralAssessment() {
    setState(() {
      _professional.structuralAssessmentUpload = createMockDocument(
        'Structural Assessment',
      );
    });
    widget.onChanged();
  }

  @override
  Widget build(BuildContext context) {
    final requiresStructuralAssessment =
        widget.draft.structureDetails.requiresStructuralAssessment;

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
                  'The demolition permit requires a licensed Architect or '
                  'Civil Engineer to supervise the demolition work.',
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Professional Details', style: AppTypography.cardTitle),
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
                      _professional.fullName = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppDropdown<DemolitionProfessionType>(
                    value: _professional.profession,
                    label: 'Profession *',
                    items: DemolitionProfessionType.values
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
                      setState(() => _professional.profession = v);
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _professionalAddress,
                    label: 'Professional Address *',
                    textCapitalization: TextCapitalization.words,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Professional address',
                    ),
                    onChanged: (v) {
                      _professional.professionalAddress = v;
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
                      _professional.contactNumber = v;
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
                      _professional.tin = v;
                      widget.onChanged();
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('License Details', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _prcNumber,
                    label: 'PRC Number *',
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'PRC number'),
                    onChanged: (v) {
                      _professional.prcNumber = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'PRC Validity *',
                    value: _professional.prcValidityDate,
                    validator: (_) => _professional.prcValidityDate == null
                        ? 'Please select the PRC validity date.'
                        : null,
                    onChanged: (date) {
                      setState(() => _professional.prcValidityDate = date);
                      widget.onChanged();
                    },
                  ),
                  if (_professional.prcAppearsExpired) ...[
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
                      _professional.ptrNumber = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'PTR Date Issued *',
                    value: _professional.ptrDateIssued,
                    validator: (_) => _professional.ptrDateIssued == null
                        ? 'Please select the PTR date issued.'
                        : null,
                    onChanged: (date) {
                      setState(() => _professional.ptrDateIssued = date);
                      widget.onChanged();
                    },
                  ),
                  if (_professional.ptrDateIssuedInFuture) ...[
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
                      _professional.ptrPlaceIssued = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    label: 'Date Signed',
                    hint: 'Optional',
                    value: _professional.dateSigned,
                    onChanged: (date) {
                      setState(() => _professional.dateSigned = date);
                      widget.onChanged();
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Professional Documents', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Upload clear copies of the professional\'s current PRC ID, '
              'PTR, and the signed and sealed documents.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            DocumentUploadTile(
              label: 'PRC ID',
              document: _professional.prcIdUpload,
              onUpload: _uploadPrcId,
              allowReplace: true,
              onRemove: () {
                setState(() => _professional.prcIdUpload = null);
                widget.onChanged();
              },
            ),
            const SizedBox(height: AppSpacing.md),
            DocumentUploadTile(
              label: 'PTR Document',
              document: _professional.ptrDocumentUpload,
              onUpload: _uploadPtr,
              allowReplace: true,
              onRemove: () {
                setState(() => _professional.ptrDocumentUpload = null);
                widget.onChanged();
              },
            ),
            const SizedBox(height: AppSpacing.md),
            DocumentUploadTile(
              label: 'Signed and Sealed Professional Form',
              document: _professional.signedSealedFormUpload,
              onUpload: _uploadSignedSealedForm,
              allowReplace: true,
              onRemove: () {
                setState(() => _professional.signedSealedFormUpload = null);
                widget.onChanged();
              },
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Demolition Technical Documents', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'These uploads are reused in the Required Documents step — '
              'you will not need to upload them again.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            DocumentUploadTile(
              label: 'Demolition Plan',
              document: _professional.demolitionPlanUpload,
              onUpload: _uploadDemolitionPlan,
              allowReplace: true,
              onRemove: () {
                setState(() => _professional.demolitionPlanUpload = null);
                widget.onChanged();
              },
            ),
            const SizedBox(height: AppSpacing.md),
            DocumentUploadTile(
              label: 'Demolition Methodology',
              document: _professional.demolitionMethodologyUpload,
              onUpload: _uploadDemolitionMethodology,
              allowReplace: true,
              onRemove: () {
                setState(
                  () => _professional.demolitionMethodologyUpload = null,
                );
                widget.onChanged();
              },
            ),
            const SizedBox(height: AppSpacing.md),
            DocumentUploadTile(
              label: 'Safety Program',
              document: _professional.safetyProgramUpload,
              onUpload: _uploadSafetyProgram,
              allowReplace: true,
              onRemove: () {
                setState(() => _professional.safetyProgramUpload = null);
                widget.onChanged();
              },
            ),
            if (requiresStructuralAssessment) ...[
              const SizedBox(height: AppSpacing.md),
              DocumentUploadTile(
                label: 'Structural Assessment',
                statusLabel: 'Required for this demolition extent',
                document: _professional.structuralAssessmentUpload,
                onUpload: _uploadStructuralAssessment,
                allowReplace: true,
                onRemove: () {
                  setState(
                    () => _professional.structuralAssessmentUpload = null,
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
