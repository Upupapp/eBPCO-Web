import 'package:flutter/material.dart';

import '../../../../../core/models/document_model.dart';
import '../../../../../core/models/interior_design_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/layout/expandable_section.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/uploads/document_upload_tile.dart';
import '../../building_permit/widgets/mock_upload.dart';

/// Step 7 — Required Documents (Box 7): the official form's ~20
/// individual line items, grouped into clear upload categories rather
/// than one long unstructured list. Professional documents already
/// collected in Step 5 are read/written directly against
/// [InteriorProfessionals]'s fields rather than duplicated here, so the
/// same signed document is never uploaded twice.
class Step7RequiredDocuments extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final InteriorPermitDraft draft;
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
  InteriorRequiredDocuments get _documents => widget.draft.requiredDocuments;
  InteriorProfessionals get _professionals => widget.draft.professionals;

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
    return Form(
      key: widget.formKey,
      child: FormScrollScaffold(
        centerVertically: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Upload clear copies of every document below. Accepted '
              'formats: PDF, JPG, JPEG, PNG. Maximum file size: 10 MB per '
              'document.',
              style: AppTypography.bodyMuted,
            ),
            const SizedBox(height: AppSpacing.lg),

            ExpandableSection(
              title: 'Interior Layout Documents',
              initiallyExpanded: true,
              children: [
                _uploadTile(
                  label: 'Interior Plan and Layout',
                  getDocument: () => _documents.interiorPlanAndLayoutUpload,
                  setDocument: (d) =>
                      _documents.interiorPlanAndLayoutUpload = d,
                ),
                _uploadTile(
                  label: 'Wall Partitions',
                  getDocument: () => _documents.wallPartitionsUpload,
                  setDocument: (d) => _documents.wallPartitionsUpload = d,
                ),
                _uploadTile(
                  label: 'Furniture Layout',
                  getDocument: () => _documents.furnitureLayoutUpload,
                  setDocument: (d) => _documents.furnitureLayoutUpload = d,
                ),
                _uploadTile(
                  label: 'Equipment and Appliance Layout',
                  getDocument: () =>
                      _documents.equipmentAndApplianceLayoutUpload,
                  setDocument: (d) =>
                      _documents.equipmentAndApplianceLayoutUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Elevations and Perspectives',
              children: [
                _uploadTile(
                  label: 'Interior Wall Elevations',
                  getDocument: () => _documents.interiorWallElevationsUpload,
                  setDocument: (d) =>
                      _documents.interiorWallElevationsUpload = d,
                ),
                _uploadTile(
                  label: 'Cross / Window Sections',
                  getDocument: () => _documents.crossWindowSectionsUpload,
                  setDocument: (d) => _documents.crossWindowSectionsUpload = d,
                ),
                _uploadTile(
                  label: 'Interior Perspective From Main Entrances',
                  getDocument: () =>
                      _documents.interiorPerspectiveFromMainEntrancesUpload,
                  setDocument: (d) => _documents
                      .interiorPerspectiveFromMainEntrancesUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Finishes and Fixtures',
              children: [
                _uploadTile(
                  label: 'Finishes',
                  getDocument: () => _documents.finishesUpload,
                  setDocument: (d) => _documents.finishesUpload = d,
                ),
                _uploadTile(
                  label: 'Switches',
                  getDocument: () => _documents.switchesUpload,
                  setDocument: (d) => _documents.switchesUpload = d,
                ),
                _uploadTile(
                  label: 'Doors',
                  getDocument: () => _documents.doorsUpload,
                  setDocument: (d) => _documents.doorsUpload = d,
                ),
                _uploadTile(
                  label: 'Convenience Outlets',
                  getDocument: () => _documents.convenienceOutletsUpload,
                  setDocument: (d) => _documents.convenienceOutletsUpload = d,
                ),
                _uploadTile(
                  label: 'Decorations',
                  getDocument: () => _documents.decorationsUpload,
                  setDocument: (d) => _documents.decorationsUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Ceiling and Lighting',
              children: [
                _uploadTile(
                  label: 'Reflected Ceiling Plan',
                  getDocument: () => _documents.reflectedCeilingPlanUpload,
                  setDocument: (d) =>
                      _documents.reflectedCeilingPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Lighting Fixture Specifications',
                  getDocument: () =>
                      _documents.lightingFixtureSpecificationsUpload,
                  setDocument: (d) =>
                      _documents.lightingFixtureSpecificationsUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Life Safety and Mechanical',
              children: [
                _uploadTile(
                  label: 'Air Conditioning, Exhaust, and Return Grilles',
                  getDocument: () =>
                      _documents.airConditioningExhaustAndReturnGrillesUpload,
                  setDocument: (d) => _documents
                      .airConditioningExhaustAndReturnGrillesUpload = d,
                ),
                _uploadTile(
                  label: 'Sprinkler / Nozzle Locations',
                  isRequired: false,
                  statusLabel: 'Optional — when applicable',
                  getDocument: () =>
                      _documents.sprinklerNozzleLocationsUpload,
                  setDocument: (d) =>
                      _documents.sprinklerNozzleLocationsUpload = d,
                ),
                _uploadTile(
                  label: 'Fire Resistivity Ratings',
                  getDocument: () => _documents.fireResistivityRatingsUpload,
                  setDocument: (d) =>
                      _documents.fireResistivityRatingsUpload = d,
                ),
                _uploadTile(
                  label: 'Toxicity Ratings',
                  getDocument: () => _documents.toxicityRatingsUpload,
                  setDocument: (d) => _documents.toxicityRatingsUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Cost and Material Documents',
              children: [
                _uploadTile(
                  label: 'List of Materials',
                  getDocument: () => _documents.listOfMaterialsUpload,
                  setDocument: (d) => _documents.listOfMaterialsUpload = d,
                ),
                _uploadTile(
                  label: 'Detailed Cost Estimates',
                  getDocument: () => _documents.detailedCostEstimatesUpload,
                  setDocument: (d) =>
                      _documents.detailedCostEstimatesUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Professional Documents',
              subtitle: 'Already provided in Step 5 — shown here for review.',
              children: [
                _uploadTile(
                  label: 'Design Professional Signed Documents',
                  getDocument: () =>
                      _professionals.designSignedDocumentUpload,
                  setDocument: (d) =>
                      _professionals.designSignedDocumentUpload = d,
                ),
                _uploadTile(
                  label: 'Signed Supervisor Confirmation',
                  getDocument: () =>
                      _professionals.supervisorSignedDocumentUpload,
                  setDocument: (d) =>
                      _professionals.supervisorSignedDocumentUpload = d,
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
                  setDocument: (d) =>
                      _documents.relatedBuildingPermitUpload = d,
                ),
                _uploadTile(
                  label: 'Other Supporting Documents',
                  isRequired: false,
                  statusLabel: 'Optional',
                  getDocument: () =>
                      _documents.otherSupportingDocumentsUpload,
                  setDocument: (d) =>
                      _documents.otherSupportingDocumentsUpload = d,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
