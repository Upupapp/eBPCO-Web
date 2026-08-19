import 'package:flutter/material.dart';

import '../../../../../core/models/document_model.dart';
import '../../../../../core/models/electrical_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/layout/expandable_section.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/uploads/document_upload_tile.dart';
import '../../building_permit/widgets/mock_upload.dart';

/// Step 7 — Required Electrical Documents. Professional documents already
/// collected in Step 5 are read/written directly against
/// [ElectricalProfessionals]'s fields rather than duplicated here, and
/// Contractor documents likewise reuse [ElectricalContractor]'s — so the
/// same file is never uploaded twice.
class Step7RequiredDocuments extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final ElectricalPermitDraft draft;
  final VoidCallback onChanged;

  const Step7RequiredDocuments({
    super.key,
    required this.formKey,
    required this.draft,
    required this.onChanged,
  });

  @override
  State<Step7RequiredDocuments> createState() =>
      _Step7RequiredDocumentsState();
}

class _Step7RequiredDocumentsState extends State<Step7RequiredDocuments> {
  ElectricalRequiredDocuments get _documents => widget.draft.requiredDocuments;
  ElectricalInstallationDetails get _details => widget.draft.installationDetails;
  ElectricalScopeOfWork get _scope => widget.draft.scopeOfWork;
  ElectricalProfessionals get _professionals => widget.draft.professionals;

  Widget _uploadTile({
    required String label,
    required DocumentModel? Function() getDocument,
    required void Function(DocumentModel?) setDocument,
    String? statusLabel,
    bool isRequired = true,
    String extension = 'pdf',
  }) {
    return DocumentUploadTile(
      label: label,
      isRequired: isRequired,
      statusLabel: statusLabel,
      document: getDocument(),
      allowReplace: true,
      onUpload: () {
        setState(
          () => setDocument(createMockDocument(label, extension: extension)),
        );
        widget.onChanged();
      },
      onRemove: () {
        setState(() => setDocument(null));
        widget.onChanged();
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final hasFireAlarmDetectors = _details.hasFireAlarmDetectors;
    final hasGeneratorCapacity = _details.hasGeneratorCapacity;
    final hasUpsCapacity = _details.hasUpsCapacity;
    final contractorRequired = _details.requiresElectricalContractor;
    final supervisorHasOwnDocuments =
        !_professionals.isSupervisorSameAsDesignProfessional;

    return Form(
      key: widget.formKey,
      child: FormScrollScaffold(
        centerVertically: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Upload clear copies of every document below. Accepted '
              'formats: PDF, JPG, JPEG, PNG.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.lg),

            ExpandableSection(
              title: 'Electrical Plans and Specifications',
              subtitle:
                  'Plans and specifications are already provided in Step 5.',
              initiallyExpanded: true,
              children: [
                _uploadTile(
                  label: 'Electrical Plans',
                  getDocument: () => _professionals.signedSealedPlansUpload,
                  setDocument: (d) => _professionals.signedSealedPlansUpload = d,
                ),
                _uploadTile(
                  label: 'Electrical Specifications',
                  getDocument: () =>
                      _professionals.signedSealedSpecificationsUpload,
                  setDocument: (d) =>
                      _professionals.signedSealedSpecificationsUpload = d,
                ),
                _uploadTile(
                  label: 'Single-Line Diagram',
                  getDocument: () => _documents.singleLineDiagramUpload,
                  setDocument: (d) => _documents.singleLineDiagramUpload = d,
                ),
                _uploadTile(
                  label: 'Load Schedule',
                  getDocument: () => _documents.loadScheduleUpload,
                  setDocument: (d) => _documents.loadScheduleUpload = d,
                ),
                _uploadTile(
                  label: 'Panelboard Schedule',
                  getDocument: () => _documents.panelboardScheduleUpload,
                  setDocument: (d) => _documents.panelboardScheduleUpload = d,
                ),
                _uploadTile(
                  label: 'Service-Entrance Details',
                  getDocument: () => _documents.serviceEntranceDetailsUpload,
                  setDocument: (d) => _documents.serviceEntranceDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Grounding Details',
                  getDocument: () => _documents.groundingDetailsUpload,
                  setDocument: (d) => _documents.groundingDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Electrical Layout Plans',
                  getDocument: () => _documents.electricalLayoutPlansUpload,
                  setDocument: (d) => _documents.electricalLayoutPlansUpload = d,
                ),
                _uploadTile(
                  label: 'Lighting Layout',
                  getDocument: () => _documents.lightingLayoutUpload,
                  setDocument: (d) => _documents.lightingLayoutUpload = d,
                ),
                _uploadTile(
                  label: 'Power Layout',
                  getDocument: () => _documents.powerLayoutUpload,
                  setDocument: (d) => _documents.powerLayoutUpload = d,
                ),
                _uploadTile(
                  label: 'Fire Alarm Layout',
                  isRequired: hasFireAlarmDetectors,
                  statusLabel: hasFireAlarmDetectors
                      ? 'Conditionally required — Fire Alarm Detectors specified'
                      : 'Not required — no Fire Alarm Detectors specified',
                  getDocument: () => _documents.fireAlarmLayoutUpload,
                  setDocument: (d) => _documents.fireAlarmLayoutUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Load and Capacity Documents',
              children: [
                _uploadTile(
                  label: 'Signed Load Calculations',
                  getDocument: () => _professionals.signedLoadCalculationsUpload,
                  setDocument: (d) =>
                      _professionals.signedLoadCalculationsUpload = d,
                ),
                _uploadTile(
                  label: 'Transformer Capacity Details',
                  isRequired: false,
                  statusLabel: 'Optional — when applicable',
                  getDocument: () => _documents.transformerCapacityDetailsUpload,
                  setDocument: (d) =>
                      _documents.transformerCapacityDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Generator Capacity Details',
                  isRequired: hasGeneratorCapacity,
                  statusLabel: hasGeneratorCapacity
                      ? 'Conditionally required — Generator Capacity entered'
                      : 'Not required — no Generator Capacity entered',
                  getDocument: () => _documents.generatorDetailsUpload,
                  setDocument: (d) => _documents.generatorDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'UPS Capacity Details',
                  isRequired: hasUpsCapacity,
                  statusLabel: hasUpsCapacity
                      ? 'Conditionally required — UPS Capacity entered'
                      : 'Not required — no UPS Capacity entered',
                  getDocument: () => _documents.upsDetailsUpload,
                  setDocument: (d) => _documents.upsDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Short-Circuit Calculation',
                  isRequired: false,
                  statusLabel: 'Optional — when applicable',
                  getDocument: () => _documents.shortCircuitCalculationUpload,
                  setDocument: (d) => _documents.shortCircuitCalculationUpload = d,
                ),
                _uploadTile(
                  label: 'Voltage-Drop Calculation',
                  isRequired: false,
                  statusLabel: 'Optional — when applicable',
                  getDocument: () => _documents.voltageDropCalculationUpload,
                  setDocument: (d) => _documents.voltageDropCalculationUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Special Fixtures and Equipment',
              subtitle: 'Required based on the outlet and capacity information in Step 4.',
              children: [
                _uploadTile(
                  label: 'Special Fixtures Schedule',
                  getDocument: () => _documents.specialFixturesScheduleUpload,
                  setDocument: (d) => _documents.specialFixturesScheduleUpload = d,
                ),
                _uploadTile(
                  label: 'Equipment Specifications',
                  getDocument: () => _documents.equipmentSpecificationsUpload,
                  setDocument: (d) => _documents.equipmentSpecificationsUpload = d,
                ),
                _uploadTile(
                  label: 'Air-Conditioning Equipment Schedule',
                  isRequired: false,
                  statusLabel: 'Optional — when applicable',
                  getDocument: () =>
                      _documents.airConditioningEquipmentScheduleUpload,
                  setDocument: (d) =>
                      _documents.airConditioningEquipmentScheduleUpload = d,
                ),
                _uploadTile(
                  label: 'Cooking Equipment Schedule',
                  isRequired: false,
                  statusLabel: 'Optional — when applicable',
                  getDocument: () => _documents.cookingEquipmentScheduleUpload,
                  setDocument: (d) => _documents.cookingEquipmentScheduleUpload = d,
                ),
                _uploadTile(
                  label: 'Water Heater Schedule',
                  isRequired: false,
                  statusLabel: 'Optional — when applicable',
                  getDocument: () => _documents.waterHeaterScheduleUpload,
                  setDocument: (d) => _documents.waterHeaterScheduleUpload = d,
                ),
                _uploadTile(
                  label: 'Water Pump Schedule',
                  isRequired: false,
                  statusLabel: 'Optional — when applicable',
                  getDocument: () => _documents.waterPumpScheduleUpload,
                  setDocument: (d) => _documents.waterPumpScheduleUpload = d,
                ),
                _uploadTile(
                  label: 'Fire Alarm Detector Schedule',
                  isRequired: hasFireAlarmDetectors,
                  statusLabel: hasFireAlarmDetectors
                      ? 'Conditionally required — Fire Alarm Detectors specified'
                      : 'Not required — no Fire Alarm Detectors specified',
                  getDocument: () => _documents.fireAlarmDetectorScheduleUpload,
                  setDocument: (d) =>
                      _documents.fireAlarmDetectorScheduleUpload = d,
                ),
                _uploadTile(
                  label: 'Other Equipment Documents',
                  isRequired: false,
                  statusLabel: 'Optional',
                  getDocument: () => _documents.otherEquipmentDocumentsUpload,
                  setDocument: (d) => _documents.otherEquipmentDocumentsUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Scope-Specific Documents',
              subtitle: 'Required based on the scope selected in Step 3.',
              children: [
                _uploadTile(
                  label: 'Existing Service Record',
                  isRequired: _scope.hasReconnection,
                  statusLabel: _scope.hasReconnection
                      ? 'Conditionally required — Reconnection selected'
                      : 'Not required — Reconnection not selected',
                  getDocument: () => _documents.existingServiceRecordUpload,
                  setDocument: (d) => _documents.existingServiceRecordUpload = d,
                ),
                _uploadTile(
                  label: 'Utility Provider Coordination',
                  isRequired: _scope.hasReconnection,
                  statusLabel: _scope.hasReconnection
                      ? 'Conditionally required — Reconnection selected'
                      : 'Not required — Reconnection not selected',
                  getDocument: () => _documents.utilityCoordinationUpload,
                  setDocument: (d) => _documents.utilityCoordinationUpload = d,
                ),
                _uploadTile(
                  label: 'Separate Service Diagram',
                  isRequired: _scope.hasSeparation,
                  statusLabel: _scope.hasSeparation
                      ? 'Conditionally required — Separation selected'
                      : 'Not required — Separation not selected',
                  getDocument: () => _documents.separateServiceDiagramUpload,
                  setDocument: (d) => _documents.separateServiceDiagramUpload = d,
                ),
                _uploadTile(
                  label: 'Existing Load Calculation',
                  isRequired: _scope.hasUpgrading,
                  statusLabel: _scope.hasUpgrading
                      ? 'Conditionally required — Upgrading selected'
                      : 'Not required — Upgrading not selected',
                  getDocument: () => _documents.existingLoadCalculationUpload,
                  setDocument: (d) => _documents.existingLoadCalculationUpload = d,
                ),
                _uploadTile(
                  label: 'Proposed Load Calculation',
                  isRequired: _scope.hasUpgrading,
                  statusLabel: _scope.hasUpgrading
                      ? 'Conditionally required — Upgrading selected'
                      : 'Not required — Upgrading not selected',
                  getDocument: () => _documents.proposedLoadCalculationUpload,
                  setDocument: (d) => _documents.proposedLoadCalculationUpload = d,
                ),
                _uploadTile(
                  label: 'Existing Service-Entrance Plan',
                  isRequired: _scope.hasRelocation,
                  statusLabel: _scope.hasRelocation
                      ? 'Conditionally required — Relocation selected'
                      : 'Not required — Relocation not selected',
                  getDocument: () => _documents.existingServiceEntrancePlanUpload,
                  setDocument: (d) =>
                      _documents.existingServiceEntrancePlanUpload = d,
                ),
                _uploadTile(
                  label: 'Proposed Service-Entrance Plan',
                  isRequired: _scope.hasRelocation,
                  statusLabel: _scope.hasRelocation
                      ? 'Conditionally required — Relocation selected'
                      : 'Not required — Relocation not selected',
                  getDocument: () => _documents.proposedServiceEntrancePlanUpload,
                  setDocument: (d) =>
                      _documents.proposedServiceEntrancePlanUpload = d,
                ),
                _uploadTile(
                  label: 'Temporary Electrical Layout',
                  isRequired: _scope.hasTemporaryInstallation,
                  statusLabel: _scope.hasTemporaryInstallation
                      ? 'Conditionally required — Temporary Installation selected'
                      : 'Not required — Temporary Installation not selected',
                  getDocument: () => _documents.temporaryElectricalLayoutUpload,
                  setDocument: (d) =>
                      _documents.temporaryElectricalLayoutUpload = d,
                ),
                _uploadTile(
                  label: 'Removal Schedule',
                  isRequired: _scope.hasTemporaryInstallation,
                  statusLabel: _scope.hasTemporaryInstallation
                      ? 'Conditionally required — Temporary Installation selected'
                      : 'Not required — Temporary Installation not selected',
                  getDocument: () => _documents.removalScheduleUpload,
                  setDocument: (d) => _documents.removalScheduleUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Professional Documents',
              subtitle: 'Already provided in Step 5 — shown here for review.',
              children: [
                _uploadTile(
                  label: 'Design Professional PRC ID',
                  extension: 'jpg',
                  getDocument: () => _professionals.designPrcIdUpload,
                  setDocument: (d) => _professionals.designPrcIdUpload = d,
                ),
                _uploadTile(
                  label: 'Design Professional PTR',
                  getDocument: () => _professionals.designPtrDocumentUpload,
                  setDocument: (d) =>
                      _professionals.designPtrDocumentUpload = d,
                ),
                if (supervisorHasOwnDocuments) ...[
                  _uploadTile(
                    label: 'Supervisor PRC ID',
                    extension: 'jpg',
                    getDocument: () => _professionals.supervisorPrcIdUpload,
                    setDocument: (d) =>
                        _professionals.supervisorPrcIdUpload = d,
                  ),
                  _uploadTile(
                    label: 'Supervisor PTR',
                    getDocument: () => _professionals.supervisorPtrUpload,
                    setDocument: (d) => _professionals.supervisorPtrUpload = d,
                  ),
                ],
                _uploadTile(
                  label: 'Signed and Sealed Plans',
                  getDocument: () => _professionals.signedSealedPlansUpload,
                  setDocument: (d) =>
                      _professionals.signedSealedPlansUpload = d,
                ),
                _uploadTile(
                  label: 'Signed and Sealed Specifications',
                  getDocument: () =>
                      _professionals.signedSealedSpecificationsUpload,
                  setDocument: (d) =>
                      _professionals.signedSealedSpecificationsUpload = d,
                ),
                _uploadTile(
                  label: 'Signed Load Calculations',
                  getDocument: () => _professionals.signedLoadCalculationsUpload,
                  setDocument: (d) =>
                      _professionals.signedLoadCalculationsUpload = d,
                ),
              ],
            ),

            if (contractorRequired) ...[
              const SizedBox(height: AppSpacing.md),
              ExpandableSection(
                title: 'Contractor Documents',
                subtitle:
                    'Required — this installation reaches the 200A / 230V '
                    'threshold. Already provided in Step 5 — shown here for '
                    'review.',
                children: [
                  _uploadTile(
                    label: 'PCAB License',
                    getDocument: () =>
                        _professionals.contractor.pcabLicenseUpload,
                    setDocument: (d) =>
                        _professionals.contractor.pcabLicenseUpload = d,
                  ),
                  _uploadTile(
                    label: 'Contractor Accreditation Document',
                    getDocument: () =>
                        _professionals.contractor.contractorAccreditationUpload,
                    setDocument: (d) => _professionals
                        .contractor.contractorAccreditationUpload = d,
                  ),
                  _uploadTile(
                    label: 'Contractor Authorization or Contract',
                    getDocument: () =>
                        _professionals.contractor.contractorAuthorizationUpload,
                    setDocument: (d) => _professionals
                        .contractor.contractorAuthorizationUpload = d,
                  ),
                ],
              ),
            ],

            const SizedBox(height: AppSpacing.md),
            ExpandableSection(
              title: 'Project Schedule',
              children: [
                _uploadTile(
                  label: 'Work Schedule',
                  isRequired: false,
                  statusLabel: 'Optional — when available',
                  getDocument: () => _documents.workScheduleUpload,
                  setDocument: (d) => _documents.workScheduleUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Supporting Documents',
              children: [
                _uploadTile(
                  label: 'Related Building Permit',
                  getDocument: () => _documents.relatedBuildingPermitUpload,
                  setDocument: (d) => _documents.relatedBuildingPermitUpload = d,
                ),
                _uploadTile(
                  label: 'Previous Electrical Permit',
                  isRequired: false,
                  statusLabel: 'Optional — when applicable',
                  getDocument: () => _documents.previousElectricalPermitUpload,
                  setDocument: (d) =>
                      _documents.previousElectricalPermitUpload = d,
                ),
                _uploadTile(
                  label: 'Existing Service Records',
                  isRequired: false,
                  statusLabel: 'Optional — when applicable',
                  getDocument: () => _documents.existingServiceRecordsUpload,
                  setDocument: (d) => _documents.existingServiceRecordsUpload = d,
                ),
                _uploadTile(
                  label: 'Utility Provider Coordination or Approval',
                  isRequired: false,
                  statusLabel: 'Optional — when applicable',
                  getDocument: () => _documents.utilityProviderApprovalUpload,
                  setDocument: (d) => _documents.utilityProviderApprovalUpload = d,
                ),
                _uploadTile(
                  label: 'Other Electrical Documents',
                  isRequired: false,
                  statusLabel: 'Optional',
                  getDocument: () => _documents.otherElectricalDocumentsUpload,
                  setDocument: (d) =>
                      _documents.otherElectricalDocumentsUpload = d,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
