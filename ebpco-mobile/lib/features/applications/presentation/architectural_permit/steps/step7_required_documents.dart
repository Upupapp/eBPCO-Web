import 'package:flutter/material.dart';

import '../../../../../core/models/architectural_permit_model.dart';
import '../../../../../core/models/document_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/layout/expandable_section.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/uploads/document_upload_tile.dart';
import '../../building_permit/widgets/mock_upload.dart';

/// Step 7 — Required Architectural Documents (Box 7). Professional
/// documents already collected in Step 5 are read/written directly
/// against [ArchitecturalProfessionals]'s fields rather than duplicated
/// here, so the same PRC ID/PTR/signed-and-sealed file is never uploaded
/// twice.
class Step7RequiredDocuments extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final ArchitecturalPermitDraft draft;
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
  ArchitecturalRequiredDocuments get _documents => widget.draft.requiredDocuments;
  ArchitecturalComplianceDetails get _compliance => widget.draft.complianceDetails;
  ArchitecturalScopeOfWork get _scope => widget.draft.scopeOfWork;
  ArchitecturalProfessionals get _professionals => widget.draft.professionals;

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
    final requiresRampDetails = _compliance.requiresRampDetails;
    final requiresAccessibleParkingDetails =
        _compliance.requiresAccessibleParkingDetails;
    final requiresStairDetails = _compliance.requiresStairDetails;
    final requiresFireEscapeDetails = _compliance.requiresFireEscapeDetails;
    final requiresDoorWindowSchedule = _compliance.requiresDoorWindowSchedule;
    final requiresInteriorWork = _scope.impliesInteriorWork;
    final supervisorHasOwnDocuments =
        !_professionals.isSupervisorSameAsDesignArchitect;

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
              title: 'Location and Site Documents',
              initiallyExpanded: true,
              children: [
                _uploadTile(
                  label: 'Vicinity Map / Location Plan (2km Radius)',
                  getDocument: () => _documents.vicinityMapUpload,
                  setDocument: (d) => _documents.vicinityMapUpload = d,
                ),
                _uploadTile(
                  label: 'Site Development Plan',
                  getDocument: () => _documents.siteDevelopmentPlanUpload,
                  setDocument: (d) => _documents.siteDevelopmentPlanUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Architectural Presentation',
              children: [
                _uploadTile(
                  label: 'Perspective',
                  getDocument: () => _documents.perspectiveUpload,
                  setDocument: (d) => _documents.perspectiveUpload = d,
                ),
                _uploadTile(
                  label: 'Floor Plans',
                  getDocument: () => _documents.floorPlansUpload,
                  setDocument: (d) => _documents.floorPlansUpload = d,
                ),
                _uploadTile(
                  label: 'Elevations (at least four)',
                  getDocument: () => _documents.elevationsUpload,
                  setDocument: (d) => _documents.elevationsUpload = d,
                ),
                _uploadTile(
                  label: 'Sections (at least two)',
                  getDocument: () => _documents.sectionsUpload,
                  setDocument: (d) => _documents.sectionsUpload = d,
                ),
                _uploadTile(
                  label: 'Ceiling Plans (Lighting Fixtures and Diffusers)',
                  getDocument: () => _documents.ceilingPlansUpload,
                  setDocument: (d) => _documents.ceilingPlansUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Accessibility and Detail Drawings',
              subtitle: 'Required based on the accessibility facilities selected in Step 4.',
              children: [
                _uploadTile(
                  label: 'Ramp Details',
                  isRequired: requiresRampDetails,
                  statusLabel: requiresRampDetails
                      ? 'Conditionally required — Ramps selected'
                      : 'Not required — Ramps not selected',
                  getDocument: () => _documents.rampDetailsUpload,
                  setDocument: (d) => _documents.rampDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Accessible Parking Details',
                  isRequired: requiresAccessibleParkingDetails,
                  statusLabel: requiresAccessibleParkingDetails
                      ? 'Conditionally required — Parking Areas selected'
                      : 'Not required — Parking Areas not selected',
                  getDocument: () => _documents.accessibleParkingDetailsUpload,
                  setDocument: (d) =>
                      _documents.accessibleParkingDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Stair Details',
                  isRequired: requiresStairDetails,
                  statusLabel: requiresStairDetails
                      ? 'Conditionally required — Stairs selected'
                      : 'Not required — Stairs not selected',
                  getDocument: () => _documents.stairDetailsUpload,
                  setDocument: (d) => _documents.stairDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Fire Escape Details',
                  isRequired: requiresFireEscapeDetails,
                  statusLabel: requiresFireEscapeDetails
                      ? 'Conditionally required — Firefighting and Safety Facilities selected'
                      : 'Not required for the selected Fire Code features',
                  getDocument: () => _documents.fireEscapeDetailsUpload,
                  setDocument: (d) => _documents.fireEscapeDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Cabinet and Partition Details',
                  isRequired: false,
                  statusLabel: 'Optional',
                  getDocument: () => _documents.cabinetPartitionDetailsUpload,
                  setDocument: (d) =>
                      _documents.cabinetPartitionDetailsUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Schedules and Finishes',
              subtitle:
                  'Required when the scope of work involves interior finish changes.',
              children: [
                _uploadTile(
                  label: 'Schedule of Doors and Windows',
                  isRequired: requiresDoorWindowSchedule,
                  statusLabel: requiresDoorWindowSchedule
                      ? 'Conditionally required — Doors, Entrances and Thresholds selected'
                      : 'Not required for the selected accessibility facilities',
                  getDocument: () => _documents.doorWindowScheduleUpload,
                  setDocument: (d) => _documents.doorWindowScheduleUpload = d,
                ),
                _uploadTile(
                  label: 'Schedule of Floor Finishes',
                  isRequired: requiresInteriorWork,
                  statusLabel: requiresInteriorWork
                      ? 'Conditionally required — Alteration/Renovation/Conversion selected'
                      : 'Not required for the selected scope of work',
                  getDocument: () => _documents.floorFinishScheduleUpload,
                  setDocument: (d) => _documents.floorFinishScheduleUpload = d,
                ),
                _uploadTile(
                  label: 'Schedule of Ceiling Finishes',
                  isRequired: requiresInteriorWork,
                  statusLabel: requiresInteriorWork
                      ? 'Conditionally required — Alteration/Renovation/Conversion selected'
                      : 'Not required for the selected scope of work',
                  getDocument: () => _documents.ceilingFinishScheduleUpload,
                  setDocument: (d) =>
                      _documents.ceilingFinishScheduleUpload = d,
                ),
                _uploadTile(
                  label: 'Schedule of Wall Finishes',
                  isRequired: requiresInteriorWork,
                  statusLabel: requiresInteriorWork
                      ? 'Conditionally required — Alteration/Renovation/Conversion selected'
                      : 'Not required for the selected scope of work',
                  getDocument: () => _documents.wallFinishScheduleUpload,
                  setDocument: (d) => _documents.wallFinishScheduleUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Interior and Technical Documents',
              children: [
                _uploadTile(
                  label: 'Architectural Interior',
                  isRequired: requiresInteriorWork,
                  statusLabel: requiresInteriorWork
                      ? 'Conditionally required — Alteration/Renovation/Conversion selected'
                      : 'Not required for the selected scope of work',
                  getDocument: () => _documents.architecturalInteriorUpload,
                  setDocument: (d) =>
                      _documents.architecturalInteriorUpload = d,
                ),
                _uploadTile(
                  label: 'Specifications',
                  statusLabel: 'Already provided in Step 5 — shown here for review.',
                  getDocument: () => _professionals.signedSealedSpecificationsUpload,
                  setDocument: (d) =>
                      _professionals.signedSealedSpecificationsUpload = d,
                ),
                _uploadTile(
                  label: 'Cost Estimate',
                  getDocument: () => _documents.costEstimateUpload,
                  setDocument: (d) => _documents.costEstimateUpload = d,
                ),
                _uploadTile(
                  label: 'Other Architectural Documents',
                  isRequired: false,
                  statusLabel: 'Optional',
                  getDocument: () =>
                      _documents.otherArchitecturalDocumentsUpload,
                  setDocument: (d) =>
                      _documents.otherArchitecturalDocumentsUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Professional Documents',
              subtitle: 'Already provided in Step 5 — shown here for review.',
              children: [
                _uploadTile(
                  label: 'Design Architect PRC ID',
                  extension: 'jpg',
                  getDocument: () => _professionals.designPrcIdUpload,
                  setDocument: (d) => _professionals.designPrcIdUpload = d,
                ),
                _uploadTile(
                  label: 'Design Architect PTR',
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
              ],
            ),
          ],
        ),
      ),
    );
  }
}
