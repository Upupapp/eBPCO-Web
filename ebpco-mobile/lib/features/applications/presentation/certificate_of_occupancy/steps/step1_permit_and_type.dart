import 'package:flutter/material.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/models/certificate_of_occupancy_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';
import '../../building_permit/widgets/date_picker_field.dart';

/// Step 1 — Building Permit reference and Full/Partial certificate type.
/// Selecting a recent mock Building Permit auto-fills its number and
/// issue date instead of requiring the applicant to retype values
/// already on file.
class Step1PermitAndType extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final CertificateOfOccupancyDraft draft;
  final VoidCallback onChanged;

  const Step1PermitAndType({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step1PermitAndType> createState() => _Step1PermitAndTypeState();
}

class _Step1PermitAndTypeState extends State<Step1PermitAndType> {
  late final TextEditingController _buildingPermitNumber;
  late final TextEditingController _partialDescription;

  OccupancyPermitInfo get _permit => widget.draft.permitInfo;

  @override
  void initState() {
    super.initState();
    _buildingPermitNumber = TextEditingController(
      text: _permit.buildingPermitNumber,
    );
    _partialDescription = TextEditingController(
      text: _permit.partialDescription,
    );
  }

  @override
  void dispose() {
    _buildingPermitNumber.dispose();
    _partialDescription.dispose();
    super.dispose();
  }

  void _applyMockRecord(MockBuildingPermitRecord record) {
    setState(() {
      _buildingPermitNumber.text = record.number;
      _permit.buildingPermitNumber = record.number;
      _permit.buildingPermitDateIssued = record.dateIssued;
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
            Text('Related Building Permit', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _buildingPermitNumber,
                    label: 'Building Permit Number *',
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Building Permit Number',
                    ),
                    onChanged: (v) {
                      _permit.buildingPermitNumber = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  DatePickerField(
                    // `DatePickerField` only reads `value` as a `FormField`
                    // `initialValue` — without a value-based key, selecting
                    // a mock record's date here wouldn't visually refresh
                    // an already-built field.
                    key: ValueKey(_permit.buildingPermitDateIssued),
                    label: 'Building Permit Date Issued *',
                    value: _permit.buildingPermitDateIssued,
                    validator: (_) => _permit.buildingPermitDateIssued == null
                        ? 'Please select the date issued.'
                        : null,
                    onChanged: (date) {
                      setState(() => _permit.buildingPermitDateIssued = date);
                      widget.onChanged();
                    },
                  ),
                  if (occupancyMockBuildingPermits.isNotEmpty) ...[
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      'Or select an existing Building Permit:',
                      style: AppTypography.caption,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Wrap(
                      spacing: AppSpacing.sm,
                      runSpacing: AppSpacing.sm,
                      children: [
                        for (final record in occupancyMockBuildingPermits)
                          ActionChip(
                            label: Text(record.number),
                            onPressed: () => _applyMockRecord(record),
                          ),
                      ],
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Certificate Type', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            Row(
              children: [
                Expanded(
                  child: _CertificateTypeOption(
                    label: 'Full',
                    selected: _permit.certificateType == CertificateType.full,
                    onTap: () {
                      setState(
                        () => _permit.certificateType = CertificateType.full,
                      );
                      widget.onChanged();
                    },
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: _CertificateTypeOption(
                    label: 'Partial',
                    selected:
                        _permit.certificateType == CertificateType.partial,
                    onTap: () {
                      setState(
                        () =>
                            _permit.certificateType = CertificateType.partial,
                      );
                      widget.onChanged();
                    },
                  ),
                ),
              ],
            ),
            if (_permit.certificateType == CertificateType.partial) ...[
              const SizedBox(height: AppSpacing.md),
              AppTextField(
                controller: _partialDescription,
                label: 'Portion, Floor, Unit, or Area Covered *',
                hint: 'e.g. 2nd Floor, Units 201–210',
                validator: (v) => Validators.required(
                  v,
                  fieldLabel: 'Portion covered',
                ),
                onChanged: (v) {
                  _permit.partialDescription = v;
                  widget.onChanged();
                },
              ),
            ],

            const SizedBox(height: AppSpacing.xl),
            Text('Application Date', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            DatePickerField(
              label: 'Application Date',
              value: _permit.applicationDate,
              onChanged: (date) {
                if (date == null) return;
                setState(() => _permit.applicationDate = date);
                widget.onChanged();
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _CertificateTypeOption extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _CertificateTypeOption({
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
