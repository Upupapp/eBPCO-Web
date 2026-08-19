import 'package:flutter/material.dart';

import '../../../../../core/models/document_model.dart';
import '../../../../../core/models/mechanical_permit_model.dart';
import '../../../../../core/theme/app_spacing.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../shared/widgets/layout/expandable_section.dart';
import '../../../../../shared/widgets/layout/form_scroll_scaffold.dart';
import '../../../../../shared/widgets/uploads/document_upload_tile.dart';
import '../../building_permit/widgets/mock_upload.dart';

/// Step 7 — Required Mechanical Documents. Professional documents already
/// collected in Step 5 are read/written directly against
/// [MechanicalProfessionals]'s fields rather than duplicated here, so the
/// same PRC ID/PTR/signed-and-sealed file is never uploaded twice.
class Step7RequiredDocuments extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final MechanicalPermitDraft draft;
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
  MechanicalRequiredDocuments get _documents => widget.draft.requiredDocuments;
  MechanicalInstallationDetails get _details => widget.draft.installationDetails;
  MechanicalProfessionals get _professionals => widget.draft.professionals;

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
    final hasFireSprinkler = _details.hasFireSprinkler;
    final hasBoiler = _details.hasBoiler;
    final hasPressureVessel = _details.hasPressureVessel;
    final hasRefrigerationGroup = _details.hasRefrigerationGroup;
    final hasAirConditioningGroup = _details.hasAirConditioningGroup;
    final hasMechanicalVentilation = _details.hasMechanicalVentilation;
    final hasPowerPiping = _details.hasPowerPiping;
    final hasElevatorGroup = _details.hasElevatorGroup;
    final hasPumps = _details.hasPumps;
    final hasCompressedAirOrVacuumOrGas =
        _details.hasCompressedAirOrVacuumGroup || _details.hasGasGroup;
    final hasConveyorGroup = _details.hasConveyorGroup;
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
              title: 'Core Mechanical Documents',
              subtitle:
                  'Plans, specifications, and design calculations are already provided in Step 5.',
              initiallyExpanded: true,
              children: [
                _uploadTile(
                  label: 'Mechanical Plans',
                  getDocument: () => _professionals.signedSealedPlansUpload,
                  setDocument: (d) => _professionals.signedSealedPlansUpload = d,
                ),
                _uploadTile(
                  label: 'Mechanical Specifications',
                  getDocument: () =>
                      _professionals.signedSealedSpecificationsUpload,
                  setDocument: (d) =>
                      _professionals.signedSealedSpecificationsUpload = d,
                ),
                _uploadTile(
                  label: 'Mechanical Design Calculations',
                  getDocument: () => _professionals.signedDesignCalculationsUpload,
                  setDocument: (d) =>
                      _professionals.signedDesignCalculationsUpload = d,
                ),
                _uploadTile(
                  label: 'Equipment Layout',
                  getDocument: () => _documents.equipmentLayoutUpload,
                  setDocument: (d) => _documents.equipmentLayoutUpload = d,
                ),
                _uploadTile(
                  label: 'Schematic Diagrams',
                  getDocument: () => _documents.schematicDiagramsUpload,
                  setDocument: (d) => _documents.schematicDiagramsUpload = d,
                ),
                _uploadTile(
                  label: 'Equipment Schedules',
                  getDocument: () => _documents.equipmentSchedulesUpload,
                  setDocument: (d) => _documents.equipmentSchedulesUpload = d,
                ),
                _uploadTile(
                  label: 'Control Diagrams',
                  getDocument: () => _documents.controlDiagramsUpload,
                  setDocument: (d) => _documents.controlDiagramsUpload = d,
                ),
                _uploadTile(
                  label: 'General Notes',
                  getDocument: () => _documents.generalNotesUpload,
                  setDocument: (d) => _documents.generalNotesUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Cost and Material Documents',
              children: [
                _uploadTile(
                  label: 'Bill of Materials',
                  getDocument: () => _documents.billOfMaterialsUpload,
                  setDocument: (d) => _documents.billOfMaterialsUpload = d,
                ),
                _uploadTile(
                  label: 'Cost Estimate',
                  getDocument: () => _documents.costEstimateUpload,
                  setDocument: (d) => _documents.costEstimateUpload = d,
                ),
                _uploadTile(
                  label: 'Quantity Takeoff',
                  isRequired: false,
                  statusLabel: 'Optional — when applicable',
                  getDocument: () => _documents.quantityTakeoffUpload,
                  setDocument: (d) => _documents.quantityTakeoffUpload = d,
                ),
                _uploadTile(
                  label: 'Equipment Specifications',
                  getDocument: () => _documents.equipmentSpecificationsUpload,
                  setDocument: (d) => _documents.equipmentSpecificationsUpload = d,
                ),
                _uploadTile(
                  label: 'Manufacturer Data Sheets',
                  getDocument: () => _documents.manufacturerDataSheetsUpload,
                  setDocument: (d) => _documents.manufacturerDataSheetsUpload = d,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            ExpandableSection(
              title: 'Equipment-Specific Documents',
              subtitle: 'Required based on the equipment selected in Step 4.',
              children: [
                _uploadTile(
                  label: 'Sprinkler Layout',
                  isRequired: hasFireSprinkler,
                  statusLabel: hasFireSprinkler
                      ? 'Conditionally required — Fire Sprinkler selected'
                      : 'Not required — Fire Sprinkler not selected',
                  getDocument: () => _documents.sprinklerLayoutUpload,
                  setDocument: (d) => _documents.sprinklerLayoutUpload = d,
                ),
                _uploadTile(
                  label: 'Hydraulic Calculations',
                  isRequired: hasFireSprinkler,
                  statusLabel: hasFireSprinkler
                      ? 'Conditionally required — Fire Sprinkler selected'
                      : 'Not required — Fire Sprinkler not selected',
                  getDocument: () => _documents.hydraulicCalculationsUpload,
                  setDocument: (d) => _documents.hydraulicCalculationsUpload = d,
                ),
                _uploadTile(
                  label: 'Pump Details',
                  isRequired: hasFireSprinkler,
                  statusLabel: hasFireSprinkler
                      ? 'Conditionally required — Fire Sprinkler selected'
                      : 'Not required — Fire Sprinkler not selected',
                  getDocument: () => _documents.pumpDetailsUpload,
                  setDocument: (d) => _documents.pumpDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Water-Supply Details',
                  isRequired: hasFireSprinkler,
                  statusLabel: hasFireSprinkler
                      ? 'Conditionally required — Fire Sprinkler selected'
                      : 'Not required — Fire Sprinkler not selected',
                  getDocument: () => _documents.waterSupplyDetailsUpload,
                  setDocument: (d) => _documents.waterSupplyDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Boiler Layout',
                  isRequired: hasBoiler,
                  statusLabel: hasBoiler
                      ? 'Conditionally required — Boiler selected'
                      : 'Not required — Boiler not selected',
                  getDocument: () => _documents.boilerLayoutUpload,
                  setDocument: (d) => _documents.boilerLayoutUpload = d,
                ),
                _uploadTile(
                  label: 'Boiler Specifications',
                  isRequired: hasBoiler,
                  statusLabel: hasBoiler
                      ? 'Conditionally required — Boiler selected'
                      : 'Not required — Boiler not selected',
                  getDocument: () => _documents.boilerSpecificationsUpload,
                  setDocument: (d) => _documents.boilerSpecificationsUpload = d,
                ),
                _uploadTile(
                  label: 'Pressure and Capacity Calculations',
                  isRequired: hasBoiler,
                  statusLabel: hasBoiler
                      ? 'Conditionally required — Boiler selected'
                      : 'Not required — Boiler not selected',
                  getDocument: () => _documents.pressureCapacityCalculationsUpload,
                  setDocument: (d) =>
                      _documents.pressureCapacityCalculationsUpload = d,
                ),
                _uploadTile(
                  label: 'Safety-Control Details',
                  isRequired: hasBoiler,
                  statusLabel: hasBoiler
                      ? 'Conditionally required — Boiler selected'
                      : 'Not required — Boiler not selected',
                  getDocument: () => _documents.safetyControlDetailsUpload,
                  setDocument: (d) => _documents.safetyControlDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Vessel Drawings',
                  isRequired: hasPressureVessel,
                  statusLabel: hasPressureVessel
                      ? 'Conditionally required — Pressure Vessel selected'
                      : 'Not required — Pressure Vessel not selected',
                  getDocument: () => _documents.vesselDrawingsUpload,
                  setDocument: (d) => _documents.vesselDrawingsUpload = d,
                ),
                _uploadTile(
                  label: 'Pressure Calculations',
                  isRequired: hasPressureVessel,
                  statusLabel: hasPressureVessel
                      ? 'Conditionally required — Pressure Vessel selected'
                      : 'Not required — Pressure Vessel not selected',
                  getDocument: () => _documents.pressureCalculationsUpload,
                  setDocument: (d) => _documents.pressureCalculationsUpload = d,
                ),
                _uploadTile(
                  label: 'Safety-Valve Details',
                  isRequired: hasPressureVessel,
                  statusLabel: hasPressureVessel
                      ? 'Conditionally required — Pressure Vessel selected'
                      : 'Not required — Pressure Vessel not selected',
                  getDocument: () => _documents.safetyValveDetailsUpload,
                  setDocument: (d) => _documents.safetyValveDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Manufacturer Certification',
                  isRequired: hasPressureVessel,
                  statusLabel: hasPressureVessel
                      ? 'Conditionally required — Pressure Vessel selected'
                      : 'Not required — Pressure Vessel not selected',
                  getDocument: () => _documents.manufacturerCertificationUpload,
                  setDocument: (d) => _documents.manufacturerCertificationUpload = d,
                ),
                _uploadTile(
                  label: 'Refrigeration Layout',
                  isRequired: hasRefrigerationGroup,
                  statusLabel: hasRefrigerationGroup
                      ? 'Conditionally required — Refrigeration / Cold Storage / Ice Plant selected'
                      : 'Not required — none of Refrigeration / Cold Storage / Ice Plant selected',
                  getDocument: () => _documents.refrigerationLayoutUpload,
                  setDocument: (d) => _documents.refrigerationLayoutUpload = d,
                ),
                _uploadTile(
                  label: 'Refrigerant Piping Diagram',
                  isRequired: hasRefrigerationGroup,
                  statusLabel: hasRefrigerationGroup
                      ? 'Conditionally required — Refrigeration / Cold Storage / Ice Plant selected'
                      : 'Not required — none of Refrigeration / Cold Storage / Ice Plant selected',
                  getDocument: () => _documents.refrigerantPipingDiagramUpload,
                  setDocument: (d) => _documents.refrigerantPipingDiagramUpload = d,
                ),
                _uploadTile(
                  label: 'Cooling-Load Calculations',
                  isRequired: hasRefrigerationGroup,
                  statusLabel: hasRefrigerationGroup
                      ? 'Conditionally required — Refrigeration / Cold Storage / Ice Plant selected'
                      : 'Not required — none of Refrigeration / Cold Storage / Ice Plant selected',
                  getDocument: () => _documents.coolingLoadCalculationsUpload,
                  setDocument: (d) => _documents.coolingLoadCalculationsUpload = d,
                ),
                _uploadTile(
                  label: 'Refrigeration Equipment Specifications',
                  isRequired: hasRefrigerationGroup,
                  statusLabel: hasRefrigerationGroup
                      ? 'Conditionally required — Refrigeration / Cold Storage / Ice Plant selected'
                      : 'Not required — none of Refrigeration / Cold Storage / Ice Plant selected',
                  getDocument: () =>
                      _documents.refrigerationEquipmentSpecificationsUpload,
                  setDocument: (d) =>
                      _documents.refrigerationEquipmentSpecificationsUpload = d,
                ),
                _uploadTile(
                  label: 'Air-Conditioning Layout',
                  isRequired: hasAirConditioningGroup,
                  statusLabel: hasAirConditioningGroup
                      ? 'Conditionally required — an Air-Conditioning type selected'
                      : 'Not required — no Air-Conditioning type selected',
                  getDocument: () => _documents.airConditioningLayoutUpload,
                  setDocument: (d) => _documents.airConditioningLayoutUpload = d,
                ),
                _uploadTile(
                  label: 'Cooling-Load Calculations (Air-Conditioning)',
                  isRequired: hasAirConditioningGroup,
                  statusLabel: hasAirConditioningGroup
                      ? 'Conditionally required — an Air-Conditioning type selected'
                      : 'Not required — no Air-Conditioning type selected',
                  getDocument: () => _documents.acCoolingLoadCalculationsUpload,
                  setDocument: (d) => _documents.acCoolingLoadCalculationsUpload = d,
                ),
                _uploadTile(
                  label: 'Duct Layout',
                  isRequired: false,
                  statusLabel: 'Optional — when applicable',
                  getDocument: () => _documents.ductLayoutUpload,
                  setDocument: (d) => _documents.ductLayoutUpload = d,
                ),
                _uploadTile(
                  label: 'Refrigerant Piping Layout (Air-Conditioning)',
                  isRequired: hasAirConditioningGroup,
                  statusLabel: hasAirConditioningGroup
                      ? 'Conditionally required — an Air-Conditioning type selected'
                      : 'Not required — no Air-Conditioning type selected',
                  getDocument: () => _documents.acRefrigerantPipingLayoutUpload,
                  setDocument: (d) => _documents.acRefrigerantPipingLayoutUpload = d,
                ),
                _uploadTile(
                  label: 'Equipment Schedule (Air-Conditioning)',
                  isRequired: hasAirConditioningGroup,
                  statusLabel: hasAirConditioningGroup
                      ? 'Conditionally required — an Air-Conditioning type selected'
                      : 'Not required — no Air-Conditioning type selected',
                  getDocument: () => _documents.acEquipmentScheduleUpload,
                  setDocument: (d) => _documents.acEquipmentScheduleUpload = d,
                ),
                _uploadTile(
                  label: 'Ventilation Layout',
                  isRequired: hasMechanicalVentilation,
                  statusLabel: hasMechanicalVentilation
                      ? 'Conditionally required — Mechanical Ventilation selected'
                      : 'Not required — Mechanical Ventilation not selected',
                  getDocument: () => _documents.ventilationLayoutUpload,
                  setDocument: (d) => _documents.ventilationLayoutUpload = d,
                ),
                _uploadTile(
                  label: 'Airflow Calculations',
                  isRequired: hasMechanicalVentilation,
                  statusLabel: hasMechanicalVentilation
                      ? 'Conditionally required — Mechanical Ventilation selected'
                      : 'Not required — Mechanical Ventilation not selected',
                  getDocument: () => _documents.airflowCalculationsUpload,
                  setDocument: (d) => _documents.airflowCalculationsUpload = d,
                ),
                _uploadTile(
                  label: 'Fan Schedule',
                  isRequired: hasMechanicalVentilation,
                  statusLabel: hasMechanicalVentilation
                      ? 'Conditionally required — Mechanical Ventilation selected'
                      : 'Not required — Mechanical Ventilation not selected',
                  getDocument: () => _documents.fanScheduleUpload,
                  setDocument: (d) => _documents.fanScheduleUpload = d,
                ),
                _uploadTile(
                  label: 'Exhaust Details',
                  isRequired: hasMechanicalVentilation,
                  statusLabel: hasMechanicalVentilation
                      ? 'Conditionally required — Mechanical Ventilation selected'
                      : 'Not required — Mechanical Ventilation not selected',
                  getDocument: () => _documents.exhaustDetailsUpload,
                  setDocument: (d) => _documents.exhaustDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Piping Layout',
                  isRequired: hasPowerPiping,
                  statusLabel: hasPowerPiping
                      ? 'Conditionally required — Power Piping selected'
                      : 'Not required — Power Piping not selected',
                  getDocument: () => _documents.pipingLayoutUpload,
                  setDocument: (d) => _documents.pipingLayoutUpload = d,
                ),
                _uploadTile(
                  label: 'Isometric Diagram',
                  isRequired: hasPowerPiping,
                  statusLabel: hasPowerPiping
                      ? 'Conditionally required — Power Piping selected'
                      : 'Not required — Power Piping not selected',
                  getDocument: () => _documents.isometricDiagramUpload,
                  setDocument: (d) => _documents.isometricDiagramUpload = d,
                ),
                _uploadTile(
                  label: 'Pressure Calculations (Piping)',
                  isRequired: hasPowerPiping,
                  statusLabel: hasPowerPiping
                      ? 'Conditionally required — Power Piping selected'
                      : 'Not required — Power Piping not selected',
                  getDocument: () => _documents.pipingPressureCalculationsUpload,
                  setDocument: (d) =>
                      _documents.pipingPressureCalculationsUpload = d,
                ),
                _uploadTile(
                  label: 'Pipe Specifications',
                  isRequired: hasPowerPiping,
                  statusLabel: hasPowerPiping
                      ? 'Conditionally required — Power Piping selected'
                      : 'Not required — Power Piping not selected',
                  getDocument: () => _documents.pipeSpecificationsUpload,
                  setDocument: (d) => _documents.pipeSpecificationsUpload = d,
                ),
                _uploadTile(
                  label: 'Safety-Control Details (Piping)',
                  isRequired: hasPowerPiping,
                  statusLabel: hasPowerPiping
                      ? 'Conditionally required — Power Piping selected'
                      : 'Not required — Power Piping not selected',
                  getDocument: () => _documents.pipingSafetyControlDetailsUpload,
                  setDocument: (d) =>
                      _documents.pipingSafetyControlDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Equipment Layout (Vertical Transport)',
                  isRequired: hasElevatorGroup,
                  statusLabel: hasElevatorGroup
                      ? 'Conditionally required — an elevator/escalator-type system selected'
                      : 'Not required — no elevator/escalator-type system selected',
                  getDocument: () => _documents.verticalTransportEquipmentLayoutUpload,
                  setDocument: (d) =>
                      _documents.verticalTransportEquipmentLayoutUpload = d,
                ),
                _uploadTile(
                  label: 'Shaft or Travel Details',
                  isRequired: hasElevatorGroup,
                  statusLabel: hasElevatorGroup
                      ? 'Conditionally required — an elevator/escalator-type system selected'
                      : 'Not required — no elevator/escalator-type system selected',
                  getDocument: () => _documents.shaftOrTravelDetailsUpload,
                  setDocument: (d) => _documents.shaftOrTravelDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Manufacturer Specifications',
                  isRequired: hasElevatorGroup,
                  statusLabel: hasElevatorGroup
                      ? 'Conditionally required — an elevator/escalator-type system selected'
                      : 'Not required — no elevator/escalator-type system selected',
                  getDocument: () => _documents.manufacturerSpecificationsUpload,
                  setDocument: (d) => _documents.manufacturerSpecificationsUpload = d,
                ),
                _uploadTile(
                  label: 'Structural Interface Details',
                  isRequired: hasElevatorGroup,
                  statusLabel: hasElevatorGroup
                      ? 'Conditionally required — an elevator/escalator-type system selected'
                      : 'Not required — no elevator/escalator-type system selected',
                  getDocument: () => _documents.structuralInterfaceDetailsUpload,
                  setDocument: (d) =>
                      _documents.structuralInterfaceDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Safety-System Details (Vertical Transport)',
                  isRequired: hasElevatorGroup,
                  statusLabel: hasElevatorGroup
                      ? 'Conditionally required — an elevator/escalator-type system selected'
                      : 'Not required — no elevator/escalator-type system selected',
                  getDocument: () =>
                      _documents.verticalTransportSafetyDetailsUpload,
                  setDocument: (d) =>
                      _documents.verticalTransportSafetyDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Pump Layout',
                  isRequired: hasPumps,
                  statusLabel: hasPumps
                      ? 'Conditionally required — Pumps selected'
                      : 'Not required — Pumps not selected',
                  getDocument: () => _documents.pumpLayoutUpload,
                  setDocument: (d) => _documents.pumpLayoutUpload = d,
                ),
                _uploadTile(
                  label: 'Pump Schedule',
                  isRequired: hasPumps,
                  statusLabel: hasPumps
                      ? 'Conditionally required — Pumps selected'
                      : 'Not required — Pumps not selected',
                  getDocument: () => _documents.pumpScheduleUpload,
                  setDocument: (d) => _documents.pumpScheduleUpload = d,
                ),
                _uploadTile(
                  label: 'Capacity and Head Calculations',
                  isRequired: hasPumps,
                  statusLabel: hasPumps
                      ? 'Conditionally required — Pumps selected'
                      : 'Not required — Pumps not selected',
                  getDocument: () => _documents.capacityHeadCalculationsUpload,
                  setDocument: (d) => _documents.capacityHeadCalculationsUpload = d,
                ),
                _uploadTile(
                  label: 'Motor Specifications',
                  isRequired: hasPumps,
                  statusLabel: hasPumps
                      ? 'Conditionally required — Pumps selected'
                      : 'Not required — Pumps not selected',
                  getDocument: () => _documents.motorSpecificationsUpload,
                  setDocument: (d) => _documents.motorSpecificationsUpload = d,
                ),
                _uploadTile(
                  label: 'System Layout (Compressed Air, Vacuum or Gas)',
                  isRequired: hasCompressedAirOrVacuumOrGas,
                  statusLabel: hasCompressedAirOrVacuumOrGas
                      ? 'Conditionally required — a compressed air, vacuum, or gas system selected'
                      : 'Not required — no compressed air, vacuum, or gas system selected',
                  getDocument: () => _documents.cavSystemLayoutUpload,
                  setDocument: (d) => _documents.cavSystemLayoutUpload = d,
                ),
                _uploadTile(
                  label: 'Piping Diagram (Compressed Air, Vacuum or Gas)',
                  isRequired: hasCompressedAirOrVacuumOrGas,
                  statusLabel: hasCompressedAirOrVacuumOrGas
                      ? 'Conditionally required — a compressed air, vacuum, or gas system selected'
                      : 'Not required — no compressed air, vacuum, or gas system selected',
                  getDocument: () => _documents.cavPipingDiagramUpload,
                  setDocument: (d) => _documents.cavPipingDiagramUpload = d,
                ),
                _uploadTile(
                  label: 'Pressure Calculations (Compressed Air, Vacuum or Gas)',
                  isRequired: hasCompressedAirOrVacuumOrGas,
                  statusLabel: hasCompressedAirOrVacuumOrGas
                      ? 'Conditionally required — a compressed air, vacuum, or gas system selected'
                      : 'Not required — no compressed air, vacuum, or gas system selected',
                  getDocument: () => _documents.cavPressureCalculationsUpload,
                  setDocument: (d) => _documents.cavPressureCalculationsUpload = d,
                ),
                _uploadTile(
                  label: 'Storage or Equipment Details (Compressed Air, Vacuum or Gas)',
                  isRequired: hasCompressedAirOrVacuumOrGas,
                  statusLabel: hasCompressedAirOrVacuumOrGas
                      ? 'Conditionally required — a compressed air, vacuum, or gas system selected'
                      : 'Not required — no compressed air, vacuum, or gas system selected',
                  getDocument: () => _documents.cavStorageEquipmentDetailsUpload,
                  setDocument: (d) =>
                      _documents.cavStorageEquipmentDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'Safety-Control Details (Compressed Air, Vacuum or Gas)',
                  isRequired: hasCompressedAirOrVacuumOrGas,
                  statusLabel: hasCompressedAirOrVacuumOrGas
                      ? 'Conditionally required — a compressed air, vacuum, or gas system selected'
                      : 'Not required — no compressed air, vacuum, or gas system selected',
                  getDocument: () => _documents.cavSafetyControlDetailsUpload,
                  setDocument: (d) => _documents.cavSafetyControlDetailsUpload = d,
                ),
                _uploadTile(
                  label: 'System Layout (Conveyors, Pneumatic Tubes or Monorails)',
                  isRequired: hasConveyorGroup,
                  statusLabel: hasConveyorGroup
                      ? 'Conditionally required — a conveyor-type system selected'
                      : 'Not required — no conveyor-type system selected',
                  getDocument: () => _documents.conveyorSystemLayoutUpload,
                  setDocument: (d) => _documents.conveyorSystemLayoutUpload = d,
                ),
                _uploadTile(
                  label: 'Equipment Specifications (Conveyors)',
                  isRequired: hasConveyorGroup,
                  statusLabel: hasConveyorGroup
                      ? 'Conditionally required — a conveyor-type system selected'
                      : 'Not required — no conveyor-type system selected',
                  getDocument: () => _documents.conveyorEquipmentSpecificationsUpload,
                  setDocument: (d) =>
                      _documents.conveyorEquipmentSpecificationsUpload = d,
                ),
                _uploadTile(
                  label: 'Capacity Calculations (Conveyors)',
                  isRequired: hasConveyorGroup,
                  statusLabel: hasConveyorGroup
                      ? 'Conditionally required — a conveyor-type system selected'
                      : 'Not required — no conveyor-type system selected',
                  getDocument: () => _documents.conveyorCapacityCalculationsUpload,
                  setDocument: (d) =>
                      _documents.conveyorCapacityCalculationsUpload = d,
                ),
                _uploadTile(
                  label: 'Control and Safety Details (Conveyors)',
                  isRequired: hasConveyorGroup,
                  statusLabel: hasConveyorGroup
                      ? 'Conditionally required — a conveyor-type system selected'
                      : 'Not required — no conveyor-type system selected',
                  getDocument: () => _documents.conveyorControlSafetyDetailsUpload,
                  setDocument: (d) =>
                      _documents.conveyorControlSafetyDetailsUpload = d,
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
                  label: 'Signed Mechanical Calculations',
                  getDocument: () => _professionals.signedDesignCalculationsUpload,
                  setDocument: (d) =>
                      _professionals.signedDesignCalculationsUpload = d,
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
                  label: 'Equipment Certifications',
                  isRequired: false,
                  statusLabel: 'Optional — when applicable',
                  getDocument: () => _documents.equipmentCertificationsUpload,
                  setDocument: (d) => _documents.equipmentCertificationsUpload = d,
                ),
                _uploadTile(
                  label: 'Manufacturer Certifications',
                  isRequired: false,
                  statusLabel: 'Optional — when applicable',
                  getDocument: () => _documents.manufacturerCertificationsUpload,
                  setDocument: (d) =>
                      _documents.manufacturerCertificationsUpload = d,
                ),
                _uploadTile(
                  label: 'Testing and Commissioning Plan',
                  getDocument: () => _documents.testingCommissioningPlanUpload,
                  setDocument: (d) => _documents.testingCommissioningPlanUpload = d,
                ),
                _uploadTile(
                  label: 'Installation Schedule',
                  isRequired: false,
                  statusLabel: 'Optional — when available',
                  getDocument: () => _documents.installationScheduleUpload,
                  setDocument: (d) => _documents.installationScheduleUpload = d,
                ),
                _uploadTile(
                  label: 'Other Mechanical Documents',
                  isRequired: false,
                  statusLabel: 'Optional',
                  getDocument: () => _documents.otherMechanicalDocumentsUpload,
                  setDocument: (d) => _documents.otherMechanicalDocumentsUpload = d,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
