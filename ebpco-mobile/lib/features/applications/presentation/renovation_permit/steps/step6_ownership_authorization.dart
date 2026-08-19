import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/document_model.dart';
import '../../../../../core/models/renovation_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';
import '../../../../../shared/widgets/uploads/document_file_preview_screen.dart';
import '../../../../../shared/widgets/uploads/document_upload_tile.dart';
import '../../../../documents/presentation/widgets/attach_document_sheet.dart';
import '../../building_permit/widgets/date_picker_field.dart';

/// Step 6 — Ownership, Consent & Authorization: confirms whether the
/// applicant is the registered owner of the property being renovated,
/// and if not, collects the representative's details, CTC information,
/// and four supporting uploads.
class Step6OwnershipAuthorization extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final RenovationPermitDraft draft;
  final VoidCallback onChanged;

  const Step6OwnershipAuthorization({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step6OwnershipAuthorization> createState() =>
      _Step6OwnershipAuthorizationState();
}

class _Step6OwnershipAuthorizationState
    extends State<Step6OwnershipAuthorization> {
  late final TextEditingController _registeredOwnerName;
  late final TextEditingController _representativeName;
  late final TextEditingController _representativeAddress;
  late final TextEditingController _ctcNumber;
  late final TextEditingController _ctcPlaceIssued;

  RenovationConsentAuthorization get _consent =>
      widget.draft.consentAuthorization;

  @override
  void initState() {
    super.initState();
    _registeredOwnerName = TextEditingController(
      text: _consent.registeredOwnerFullName,
    );
    _representativeName = TextEditingController(
      text: _consent.representativeFullName,
    );
    _representativeAddress = TextEditingController(
      text: _consent.representativeAddress,
    );
    _ctcNumber = TextEditingController(text: _consent.ctcNumber);
    _ctcPlaceIssued = TextEditingController(text: _consent.ctcPlaceIssued);
  }

  @override
  void dispose() {
    _registeredOwnerName.dispose();
    _representativeName.dispose();
    _representativeAddress.dispose();
    _ctcNumber.dispose();
    _ctcPlaceIssued.dispose();
    super.dispose();
  }

  void _selectIsOwner(bool value) {
    setState(() => _consent.isRegisteredOwner = value);
    widget.onChanged();
  }

  Future<void> _uploadAuthorizationLetter() async {
    final result = await showAttachDocumentOptions(
      context,
      label: 'Authorization Letter / SPA',
    );
    if (result == null) return;
    setState(() => _consent.authorizationLetterUpload = result);
    widget.onChanged();
  }

  Future<void> _uploadOwnerValidId() async {
    final result = await showAttachDocumentOptions(
      context,
      label: 'Registered Owner Valid ID',
    );
    if (result == null) return;
    setState(() => _consent.ownerValidIdUpload = result);
    widget.onChanged();
  }

  Future<void> _uploadRepresentativeValidId() async {
    final result = await showAttachDocumentOptions(
      context,
      label: 'Authorized Representative Valid ID',
    );
    if (result == null) return;
    setState(() => _consent.representativeValidIdUpload = result);
    widget.onChanged();
  }

  Future<void> _uploadProofOfOwnership() async {
    final result = await showAttachDocumentOptions(
      context,
      label: 'Proof of Ownership',
    );
    if (result == null) return;
    setState(() => _consent.proofOfOwnershipUpload = result);
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
    final isRepresentative = _consent.isRegisteredOwner == false;

    return Form(
      key: widget.formKey,
      child: FormScrollScaffold(
        centerVertically: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Property Ownership', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Are you the registered owner of the property being renovated?',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.sm),
            Row(
              children: [
                Expanded(
                  child: _OwnershipOption(
                    label: 'Yes',
                    selected: _consent.isRegisteredOwner == true,
                    onTap: () => _selectIsOwner(true),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: _OwnershipOption(
                    label: 'No',
                    selected: isRepresentative,
                    onTap: () => _selectIsOwner(false),
                  ),
                ),
              ],
            ),
            if (isRepresentative) ...[
              const SizedBox(height: AppSpacing.xl),
              Text(
                'Representative Information',
                style: AppTypography.cardTitle,
              ),
              const SizedBox(height: AppSpacing.sm),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    AppTextField(
                      controller: _registeredOwnerName,
                      label: 'Registered Property Owner Full Name *',
                      textCapitalization: TextCapitalization.words,
                      validator: (v) => Validators.required(
                        v,
                        fieldLabel: 'Registered property owner name',
                      ),
                      onChanged: (v) {
                        _consent.registeredOwnerFullName = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _representativeName,
                      label: 'Authorized Representative Full Name *',
                      textCapitalization: TextCapitalization.words,
                      validator: (v) => Validators.required(
                        v,
                        fieldLabel: 'Authorized representative name',
                      ),
                      onChanged: (v) {
                        _consent.representativeFullName = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _representativeAddress,
                      label: 'Representative Address *',
                      textCapitalization: TextCapitalization.words,
                      validator: (v) => Validators.required(
                        v,
                        fieldLabel: 'Representative address',
                      ),
                      onChanged: (v) {
                        _consent.representativeAddress = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _ctcNumber,
                      label: 'CTC Number *',
                      validator: (v) =>
                          Validators.required(v, fieldLabel: 'CTC number'),
                      onChanged: (v) {
                        _consent.ctcNumber = v;
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    DatePickerField(
                      label: 'Date Issued *',
                      value: _consent.ctcDateIssued,
                      validator: (_) => _consent.ctcDateIssued == null
                          ? 'Please select the date issued.'
                          : null,
                      onChanged: (date) {
                        setState(() => _consent.ctcDateIssued = date);
                        widget.onChanged();
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _ctcPlaceIssued,
                      label: 'Place Issued *',
                      textCapitalization: TextCapitalization.words,
                      validator: (v) =>
                          Validators.required(v, fieldLabel: 'Place issued'),
                      onChanged: (v) {
                        _consent.ctcPlaceIssued = v;
                        widget.onChanged();
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.xl),
              Text('Authorization Documents', style: AppTypography.cardTitle),
              const SizedBox(height: AppSpacing.xs),
              Text(
                'Upload the notarized authorization letter, valid IDs, and '
                'proof of ownership.',
                style: AppTypography.bodyMuted,
              ),
              const SizedBox(height: AppSpacing.sm),
              DocumentUploadTile(
                label: 'Authorization Letter / SPA',
                document: _consent.authorizationLetterUpload,
                onUpload: _uploadAuthorizationLetter,
                allowReplace: true,
                onPreview: _consent.authorizationLetterUpload == null
                    ? null
                    : () =>
                        _previewDocument(_consent.authorizationLetterUpload!),
                onRemove: () {
                  setState(() => _consent.authorizationLetterUpload = null);
                  widget.onChanged();
                },
              ),
              const SizedBox(height: AppSpacing.md),
              DocumentUploadTile(
                label: 'Registered Owner Valid ID',
                document: _consent.ownerValidIdUpload,
                onUpload: _uploadOwnerValidId,
                allowReplace: true,
                onPreview: _consent.ownerValidIdUpload == null
                    ? null
                    : () => _previewDocument(_consent.ownerValidIdUpload!),
                onRemove: () {
                  setState(() => _consent.ownerValidIdUpload = null);
                  widget.onChanged();
                },
              ),
              const SizedBox(height: AppSpacing.md),
              DocumentUploadTile(
                label: 'Authorized Representative Valid ID',
                document: _consent.representativeValidIdUpload,
                onUpload: _uploadRepresentativeValidId,
                allowReplace: true,
                onPreview: _consent.representativeValidIdUpload == null
                    ? null
                    : () => _previewDocument(
                        _consent.representativeValidIdUpload!,
                      ),
                onRemove: () {
                  setState(() => _consent.representativeValidIdUpload = null);
                  widget.onChanged();
                },
              ),
              const SizedBox(height: AppSpacing.md),
              DocumentUploadTile(
                label: 'Proof of Ownership',
                document: _consent.proofOfOwnershipUpload,
                onUpload: _uploadProofOfOwnership,
                allowReplace: true,
                onPreview: _consent.proofOfOwnershipUpload == null
                    ? null
                    : () => _previewDocument(_consent.proofOfOwnershipUpload!),
                onRemove: () {
                  setState(() => _consent.proofOfOwnershipUpload = null);
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

class _OwnershipOption extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _OwnershipOption({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: onTap,
      backgroundColor: selected ? AppColors.lightBlue : AppColors.surface,
      showBorder: !selected,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            selected ? Icons.check_circle : Icons.radio_button_unchecked,
            color: selected ? AppColors.secondaryBlue : AppColors.textMuted,
            size: 20,
          ),
          const SizedBox(width: AppSpacing.sm),
          Text(
            label,
            style: selected
                ? AppTypography.bodyStrong.copyWith(
                    color: AppColors.secondaryBlueDark,
                  )
                : AppTypography.body,
          ),
        ],
      ),
    );
  }
}
