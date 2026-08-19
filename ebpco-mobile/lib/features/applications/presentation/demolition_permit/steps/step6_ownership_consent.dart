import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/demolition_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';
import '../../../../../shared/widgets/uploads/document_upload_tile.dart';
import '../../building_permit/widgets/date_picker_field.dart';
import '../../building_permit/widgets/mock_upload.dart';

/// Step 6 — Ownership, Consent & Authorization: confirms whether the
/// applicant is the registered lot owner, and if not, collects the
/// representative's details, CTC information, and five supporting uploads
/// (including the Lot Owner Consent required specifically for demolition).
class Step6OwnershipConsent extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final DemolitionPermitDraft draft;
  final VoidCallback onChanged;

  const Step6OwnershipConsent({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step6OwnershipConsent> createState() => _Step6OwnershipConsentState();
}

class _Step6OwnershipConsentState extends State<Step6OwnershipConsent> {
  late final TextEditingController _registeredOwnerName;
  late final TextEditingController _representativeName;
  late final TextEditingController _representativeAddress;
  late final TextEditingController _ctcNumber;
  late final TextEditingController _ctcPlaceIssued;

  DemolitionConsentAuthorization get _consent =>
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

  void _uploadLotOwnerConsent() {
    setState(() {
      _consent.lotOwnerConsentUpload = createMockDocument(
        'Lot Owner Consent',
      );
    });
    widget.onChanged();
  }

  void _uploadAuthorizationLetter() {
    setState(() {
      _consent.authorizationLetterUpload = createMockDocument(
        'Authorization Letter / SPA',
      );
    });
    widget.onChanged();
  }

  void _uploadOwnerValidId() {
    setState(() {
      _consent.ownerValidIdUpload = createMockDocument(
        'Registered Owner Valid ID',
        extension: 'jpg',
      );
    });
    widget.onChanged();
  }

  void _uploadRepresentativeValidId() {
    setState(() {
      _consent.representativeValidIdUpload = createMockDocument(
        'Authorized Representative Valid ID',
        extension: 'jpg',
      );
    });
    widget.onChanged();
  }

  void _uploadProofOfOwnership() {
    setState(() {
      _consent.proofOfOwnershipUpload = createMockDocument(
        'Proof of Ownership',
      );
    });
    widget.onChanged();
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
            Text('Lot Ownership', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Are you the registered owner of the lot where the demolition '
              'will take place?',
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
                      label: 'Registered Lot Owner Full Name *',
                      textCapitalization: TextCapitalization.words,
                      validator: (v) => Validators.required(
                        v,
                        fieldLabel: 'Registered lot owner name',
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
                'Upload the lot owner\'s written consent, the notarized '
                'authorization letter, valid IDs, and proof of ownership.',
                style: AppTypography.bodyMuted,
              ),
              const SizedBox(height: AppSpacing.sm),
              DocumentUploadTile(
                label: 'Lot Owner Consent',
                document: _consent.lotOwnerConsentUpload,
                onUpload: _uploadLotOwnerConsent,
                allowReplace: true,
                onRemove: () {
                  setState(() => _consent.lotOwnerConsentUpload = null);
                  widget.onChanged();
                },
              ),
              const SizedBox(height: AppSpacing.md),
              DocumentUploadTile(
                label: 'Authorization Letter / SPA',
                document: _consent.authorizationLetterUpload,
                onUpload: _uploadAuthorizationLetter,
                allowReplace: true,
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
