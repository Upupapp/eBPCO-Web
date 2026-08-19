import 'package:flutter/material.dart';

import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../text_fields/app_text_field.dart';
import 'app_card.dart';

/// One fixture-inventory entry: New / Existing / Total. Shared by every
/// permit workflow with a plumbing-style fixture list (Plumbing, Sanitary
/// / Plumbing, and any future one) so the layout — and any future fix to
/// it — only ever needs to happen in one place. Deliberately decoupled
/// from any single permit's fixture-entry model: it only knows about
/// primitive strings/callbacks, so it carries no cross-permit state
/// coupling despite being visually shared.
///
/// New/Existing get equal-width fields with breathing room between them;
/// Total gets its own narrower, clearly-separated column sized with
/// enough room for four-digit-or-larger values and a little extra at
/// higher text-scale factors — previously all three sat right against
/// each other with almost no gap, which is the "too close together"
/// crowding this widget replaces.
class FixtureInventoryRow extends StatefulWidget {
  final String label;
  final bool showCustomNameField;
  final String customName;
  final ValueChanged<String> onCustomNameChanged;
  final String newQuantity;
  final ValueChanged<String> onNewQuantityChanged;
  final String existingQuantity;
  final ValueChanged<String> onExistingQuantityChanged;
  final int totalQuantity;
  final String? Function(String?)? quantityValidator;

  const FixtureInventoryRow({
    super.key,
    required this.label,
    this.showCustomNameField = false,
    this.customName = '',
    required this.onCustomNameChanged,
    required this.newQuantity,
    required this.onNewQuantityChanged,
    required this.existingQuantity,
    required this.onExistingQuantityChanged,
    required this.totalQuantity,
    this.quantityValidator,
  });

  @override
  State<FixtureInventoryRow> createState() => _FixtureInventoryRowState();
}

class _FixtureInventoryRowState extends State<FixtureInventoryRow> {
  late final TextEditingController _customName;
  late final TextEditingController _newQuantity;
  late final TextEditingController _existingQuantity;

  @override
  void initState() {
    super.initState();
    _customName = TextEditingController(text: widget.customName);
    _newQuantity = TextEditingController(text: widget.newQuantity);
    _existingQuantity = TextEditingController(text: widget.existingQuantity);
  }

  @override
  void dispose() {
    _customName.dispose();
    _newQuantity.dispose();
    _existingQuantity.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Grows a little at higher system text-scale factors so "Total"'s
    // value never gets tight against its own column edge, but stays
    // bounded rather than expanding without limit.
    final scale = MediaQuery.textScalerOf(context).scale(1.0);
    final totalWidth = (56.0 * scale).clamp(56.0, 84.0);

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(widget.label, style: AppTypography.bodyStrong),
          if (widget.showCustomNameField) ...[
            const SizedBox(height: AppSpacing.sm),
            AppTextField(
              controller: _customName,
              label: 'Fixture Name',
              onChanged: widget.onCustomNameChanged,
            ),
          ],
          const SizedBox(height: AppSpacing.md),
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                child: AppTextField(
                  controller: _newQuantity,
                  label: 'New',
                  keyboardType: TextInputType.number,
                  validator: widget.quantityValidator,
                  onChanged: widget.onNewQuantityChanged,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: AppTextField(
                  controller: _existingQuantity,
                  label: 'Existing',
                  keyboardType: TextInputType.number,
                  validator: widget.quantityValidator,
                  onChanged: widget.onExistingQuantityChanged,
                ),
              ),
              const SizedBox(width: 16),
              SizedBox(
                width: totalWidth,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('Total', style: AppTypography.caption),
                    const SizedBox(height: 2),
                    Text(
                      '${widget.totalQuantity}',
                      style: AppTypography.bodyStrong,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
