import 'package:flutter/material.dart';

import '../../../../../core/models/building_permit_model.dart';
import '../../../../../core/models/document_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/alerts/app_alert.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_dropdown.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';
import '../../../../../shared/widgets/uploads/document_file_preview_screen.dart';
import '../../../../../shared/widgets/uploads/document_upload_tile.dart';
import '../../../../documents/presentation/widgets/attach_document_sheet.dart';
import '../widgets/date_picker_field.dart';

/// Step 5 — Architect or Civil Engineer in charge of the construction work:
/// professional details, license details, and the supporting documents.
class Step5ProfessionalInCharge extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final BuildingPermitDraft draft;
  final VoidCallback onChanged;

  const Step5ProfessionalInCharge({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step5ProfessionalInCharge> createState() =>
      _Step5ProfessionalInChargeState();
}

class _Step5ProfessionalInChargeState
    extends State<Step5ProfessionalInCharge> {
  late final TextEditingController _fullName;
  late final TextEditingController _address;
  late final TextEditingController _contactNumber;
  late final TextEditingController _tin;
  late final TextEditingController _prcNumber;
  late final TextEditingController _ptrNumber;
  late final TextEditingController _ptrPlaceIssued;

  ProfessionalInCharge get _professional => widget.draft.professional;

  @override
  void initState() {
    super.initState();
    _fullName = TextEditingController(text: _professional.fullName);
    _address = TextEditingController(text: _professional.address);
    _contactNumber = TextEditingController(text: _professional.contactNumber);
    _tin = TextEditingController(text: _professional.tin);
    _prcNumber = TextEditingController(text: _professional.prcNumber);
    _ptrNumber = TextEditingController(text: _professional.ptrNumber);
    _ptrPlaceIssued = TextEditingController(
      text: _professional.ptrPlaceIssued,
    );
  }

  @override
  void dispose() {
    _fullName.dispose();
    _address.dispose();
    _contactNumber.dispose();
    _tin.dispose();
    _prcNumber.dispose();
    _ptrNumber.dispose();
    _ptrPlaceIssued.dispose();
    super.dispose();
  }

  Future<void> _uploadPrcId() async {
    final result = await showAttachDocumentOptions(context, label: 'PRC ID');
    if (result == null) return;
    setState(() => _professional.prcIdUpload = result);
    widget.onChanged();
  }

  Future<void> _uploadPtr() async {
    final result = await showAttachDocumentOptions(
      context,
      label: 'Current PTR',
    );
    if (result == null) return;
    setState(() => _professional.ptrUpload = result);
    widget.onChanged();
  }

  Future<void> _uploadSignedSealed() async {
    final result = await showAttachDocumentOptions(
      context,
      label: 'Signed and Sealed Professional Certification',
    );
    if (result == null) return;
    setState(() => _professional.signedSealedUpload = result);
    widget.onChanged();
  }

  void _previewDocument(DocumentModel document) {
    Navigator.of(context).push<void>(
      MaterialPageRoute(
        builder: (_) => DocumentFilePreviewScreen(document: document),
      ),
    );
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
                  'The official Building Permit form requires a licensed '
                  'Architect or Civil Engineer as the full-time inspector '
                  'and supervisor of construction works.',
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
                  AppDropdown<ProfessionType>(
                    value: _professional.profession,
                    label: 'Profession *',
                    items: ProfessionType.values
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
                    controller: _address,
                    label: 'Address *',
                    textCapitalization: TextCapitalization.words,
                    validator: (v) =>
                        Validators.required(v, fieldLabel: 'Address'),
                    onChanged: (v) {
                      _professional.address = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _contactNumber,
                    label: 'Contact Number',
                    hint: 'Optional',
                    keyboardType: TextInputType.phone,
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
                    label: 'PRC Validity Date *',
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
              'PTR, and the signed and sealed document.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            DocumentUploadTile(
              label: 'PRC ID',
              isRequired: true,
              document: _professional.prcIdUpload,
              onUpload: _uploadPrcId,
              allowReplace: true,
              onPreview: _professional.prcIdUpload == null
                  ? null
                  : () => _previewDocument(_professional.prcIdUpload!),
              onRemove: () {
                setState(() => _professional.prcIdUpload = null);
                widget.onChanged();
              },
            ),
            const SizedBox(height: AppSpacing.md),
            DocumentUploadTile(
              label: 'Current PTR',
              isRequired: true,
              document: _professional.ptrUpload,
              onUpload: _uploadPtr,
              allowReplace: true,
              onPreview: _professional.ptrUpload == null
                  ? null
                  : () => _previewDocument(_professional.ptrUpload!),
              onRemove: () {
                setState(() => _professional.ptrUpload = null);
                widget.onChanged();
              },
            ),
            const SizedBox(height: AppSpacing.md),
            DocumentUploadTile(
              label: 'Signed and Sealed Professional Certification or Form',
              isRequired: true,
              document: _professional.signedSealedUpload,
              onUpload: _uploadSignedSealed,
              allowReplace: true,
              onPreview: _professional.signedSealedUpload == null
                  ? null
                  : () => _previewDocument(_professional.signedSealedUpload!),
              onRemove: () {
                setState(() => _professional.signedSealedUpload = null);
                widget.onChanged();
              },
            ),
          ],
        ),
      ),
    );
  }
}
