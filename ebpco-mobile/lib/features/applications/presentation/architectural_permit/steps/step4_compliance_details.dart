import 'package:flutter/material.dart';

import '../../../../../core/models/architectural_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/utils/validators.dart';
import '../../../../../shared/widgets/alerts/app_alert.dart';
import '../../../../../shared/widgets/cards/app_card.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/text_fields/app_dropdown.dart';
import '../../../../../shared/widgets/text_fields/app_text_field.dart';

String? _percentageError(String? value, String fieldLabel) {
  if (value == null || value.trim().isEmpty) {
    return '$fieldLabel is required.';
  }
  final parsed = double.tryParse(value.trim());
  if (parsed == null) return 'Enter a valid number.';
  if (parsed < 0 || parsed > 100) {
    return '$fieldLabel must be between 0 and 100.';
  }
  return null;
}

String? _nonNegativeDecimalError(String? value, String fieldLabel) {
  if (value == null || value.trim().isEmpty) {
    return '$fieldLabel is required.';
  }
  final parsed = double.tryParse(value.trim());
  if (parsed == null) return 'Enter a valid number.';
  if (parsed < 0) return '$fieldLabel cannot be negative.';
  return null;
}

/// Step 4 — Architectural Compliance Details (Box 2): accessibility
/// facilities, site-development percentages, and Fire Code features.
/// Every status here is applicant-declared or explicitly flagged for
/// review — this screen never claims final legal approval.
class Step4ComplianceDetails extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final ArchitecturalPermitDraft draft;
  final VoidCallback onChanged;

  const Step4ComplianceDetails({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step4ComplianceDetails> createState() =>
      _Step4ComplianceDetailsState();
}

class _Step4ComplianceDetailsState extends State<Step4ComplianceDetails> {
  late final TextEditingController _otherAccessibility;
  late final TextEditingController _buildingFootprint;
  late final TextEditingController _imperviousSurface;
  late final TextEditingController _unpavedSurface;
  late final TextEditingController _otherSitePercentage;
  late final TextEditingController _otherSiteDescription;
  late final TextEditingController _otherFireFeature;
  late final TextEditingController _numberOfExitDoors;
  late final TextEditingController _totalExitWidth;
  late final TextEditingController _minimumCorridorWidth;
  late final TextEditingController _maximumDistanceToFireExit;
  late final TextEditingController _publicStreetAccess;
  late final TextEditingController _fireWallDescription;
  late final TextEditingController _fireSafetyFacilityDescription;

  ArchitecturalComplianceDetails get _compliance => widget.draft.complianceDetails;

  @override
  void initState() {
    super.initState();
    _otherAccessibility = TextEditingController(
      text: _compliance.otherAccessibilityDescription,
    );
    _buildingFootprint = TextEditingController(
      text: _compliance.buildingFootprintPercentage,
    );
    _imperviousSurface = TextEditingController(
      text: _compliance.imperviousSurfaceAreaPercentage,
    );
    _unpavedSurface = TextEditingController(
      text: _compliance.unpavedSurfaceAreaPercentage,
    );
    _otherSitePercentage = TextEditingController(
      text: _compliance.otherSitePercentage,
    );
    _otherSiteDescription = TextEditingController(
      text: _compliance.otherSiteDescription,
    );
    _otherFireFeature = TextEditingController(
      text: _compliance.otherFireFeatureDescription,
    );
    _numberOfExitDoors = TextEditingController(
      text: _compliance.numberOfExitDoors,
    );
    _totalExitWidth = TextEditingController(text: _compliance.totalExitWidth);
    _minimumCorridorWidth = TextEditingController(
      text: _compliance.minimumCorridorWidth,
    );
    _maximumDistanceToFireExit = TextEditingController(
      text: _compliance.maximumDistanceToFireExit,
    );
    _publicStreetAccess = TextEditingController(
      text: _compliance.publicStreetAccessDescription,
    );
    _fireWallDescription = TextEditingController(
      text: _compliance.fireWallDescription,
    );
    _fireSafetyFacilityDescription = TextEditingController(
      text: _compliance.fireSafetyFacilityDescription,
    );
  }

  @override
  void dispose() {
    _otherAccessibility.dispose();
    _buildingFootprint.dispose();
    _imperviousSurface.dispose();
    _unpavedSurface.dispose();
    _otherSitePercentage.dispose();
    _otherSiteDescription.dispose();
    _otherFireFeature.dispose();
    _numberOfExitDoors.dispose();
    _totalExitWidth.dispose();
    _minimumCorridorWidth.dispose();
    _maximumDistanceToFireExit.dispose();
    _publicStreetAccess.dispose();
    _fireWallDescription.dispose();
    _fireSafetyFacilityDescription.dispose();
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
                  'Accessibility and Fire Code statuses recorded here are '
                  'applicant-declared and remain subject to technical '
                  'review by the Office of the Building Official.',
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Accessibility Facilities', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  for (final facility in AccessibilityFacility.values) ...[
                    AppDropdown<AccessibilityFacilityStatus>(
                      value: _compliance.accessibility[facility],
                      label: facility.label,
                      items: AccessibilityFacilityStatus.values
                          .map(
                            (s) => DropdownMenuItem(
                              value: s,
                              child: Text(s.label),
                            ),
                          )
                          .toList(),
                      onChanged: (v) {
                        if (v == null) return;
                        setState(() => _compliance.accessibility[facility] = v);
                        widget.onChanged();
                      },
                    ),
                    if (facility != AccessibilityFacility.values.last)
                      const SizedBox(height: AppSpacing.md),
                  ],
                  if (_compliance.accessibility[AccessibilityFacility.others] !=
                      AccessibilityFacilityStatus.notApplicable) ...[
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _otherAccessibility,
                      label: 'Specify Other Accessibility Facility *',
                      validator: (v) =>
                          Validators.required(v, fieldLabel: 'Accessibility facility'),
                      onChanged: (v) {
                        _compliance.otherAccessibilityDescription = v;
                        widget.onChanged();
                      },
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Site Percentages', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _buildingFootprint,
                    label: 'Building Footprint Percentage (%) *',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    validator: (v) =>
                        _percentageError(v, 'Building Footprint Percentage'),
                    onChanged: (v) {
                      setState(() => _compliance.buildingFootprintPercentage = v);
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _imperviousSurface,
                    label: 'Impervious Surface Area Percentage (%) *',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    validator: (v) => _percentageError(
                      v,
                      'Impervious Surface Area Percentage',
                    ),
                    onChanged: (v) {
                      setState(
                        () => _compliance.imperviousSurfaceAreaPercentage = v,
                      );
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _unpavedSurface,
                    label: 'Unpaved Surface Area Percentage (%) *',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    validator: (v) =>
                        _percentageError(v, 'Unpaved Surface Area Percentage'),
                    onChanged: (v) {
                      setState(() => _compliance.unpavedSurfaceAreaPercentage = v);
                      widget.onChanged();
                    },
                  ),
                  if (_compliance.siteCoverageExceedsTotal) ...[
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      'These percentages add up to more than 100%. You may '
                      'continue, but please double-check your entries.',
                      style: AppTypography.helper.copyWith(
                        color: Colors.orange.shade800,
                      ),
                    ),
                  ],
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _otherSitePercentage,
                    label: 'Other Site Percentage (%)',
                    hint: 'Optional',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    validator: (v) => (v == null || v.trim().isEmpty)
                        ? null
                        : _percentageError(v, 'Other Site Percentage'),
                    onChanged: (v) {
                      setState(() => _compliance.otherSitePercentage = v);
                      widget.onChanged();
                    },
                  ),
                  if (_compliance.otherSitePercentage.trim().isNotEmpty) ...[
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _otherSiteDescription,
                      label: 'Other Site Description *',
                      validator: (v) =>
                          Validators.required(v, fieldLabel: 'Other site description'),
                      onChanged: (v) {
                        _compliance.otherSiteDescription = v;
                        widget.onChanged();
                      },
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Fire Code Features', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  for (final feature in FireCodeFeature.values) ...[
                    AppDropdown<FireCodeFeatureStatus>(
                      value: _compliance.fireCode[feature],
                      label: feature.label,
                      items: FireCodeFeatureStatus.values
                          .map(
                            (s) => DropdownMenuItem(
                              value: s,
                              child: Text(s.label),
                            ),
                          )
                          .toList(),
                      onChanged: (v) {
                        if (v == null) return;
                        setState(() => _compliance.fireCode[feature] = v);
                        widget.onChanged();
                      },
                    ),
                    if (feature != FireCodeFeature.values.last)
                      const SizedBox(height: AppSpacing.md),
                  ],
                  if (_compliance.fireCode[FireCodeFeature.others] !=
                      FireCodeFeatureStatus.notApplicable) ...[
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _otherFireFeature,
                      label: 'Specify Other Fire Code Feature *',
                      validator: (v) =>
                          Validators.required(v, fieldLabel: 'Fire code feature'),
                      onChanged: (v) {
                        _compliance.otherFireFeatureDescription = v;
                        widget.onChanged();
                      },
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),
            Text('Fire Code Details', style: AppTypography.cardTitle),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppTextField(
                    controller: _numberOfExitDoors,
                    label: 'Number of Exit Doors *',
                    keyboardType: TextInputType.number,
                    validator: (v) => Validators.positiveWholeNumber(
                      v,
                      fieldLabel: 'Number of exit doors',
                    ),
                    onChanged: (v) {
                      _compliance.numberOfExitDoors = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _totalExitWidth,
                    label: 'Total Exit Width (m) *',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    validator: (v) => _nonNegativeDecimalError(v, 'Total Exit Width'),
                    onChanged: (v) {
                      _compliance.totalExitWidth = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _minimumCorridorWidth,
                    label: 'Minimum Corridor Width (m) *',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    validator: (v) =>
                        _nonNegativeDecimalError(v, 'Minimum Corridor Width'),
                    onChanged: (v) {
                      _compliance.minimumCorridorWidth = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _maximumDistanceToFireExit,
                    label: 'Maximum Distance to Fire Exit (m) *',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    validator: (v) => _nonNegativeDecimalError(
                      v,
                      'Maximum Distance to Fire Exit',
                    ),
                    onChanged: (v) {
                      _compliance.maximumDistanceToFireExit = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _publicStreetAccess,
                    label: 'Public Street Access Description *',
                    maxLines: 2,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Public street access description',
                    ),
                    onChanged: (v) {
                      _compliance.publicStreetAccessDescription = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _fireWallDescription,
                    label: 'Fire Wall Description *',
                    maxLines: 2,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Fire wall description',
                    ),
                    onChanged: (v) {
                      _compliance.fireWallDescription = v;
                      widget.onChanged();
                    },
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _fireSafetyFacilityDescription,
                    label: 'Fire Safety Facility Description *',
                    maxLines: 2,
                    validator: (v) => Validators.required(
                      v,
                      fieldLabel: 'Fire safety facility description',
                    ),
                    onChanged: (v) {
                      _compliance.fireSafetyFacilityDescription = v;
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
