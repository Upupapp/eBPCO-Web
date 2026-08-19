import 'package:flutter/material.dart';

/// Thin, standardized wrapper over [DropdownButtonFormField] so every
/// dropdown in the app shares the same decoration and validation contract.
class AppDropdown<T> extends StatelessWidget {
  final T? value;
  final String label;
  final List<DropdownMenuItem<T>> items;
  final ValueChanged<T?> onChanged;
  final String? Function(T?)? validator;

  const AppDropdown({
    super.key,
    required this.value,
    required this.label,
    required this.items,
    required this.onChanged,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<T>(
      initialValue: value,
      decoration: InputDecoration(labelText: label),
      items: items,
      onChanged: onChanged,
      validator: validator,
      // Without this, the button sizes itself to its selected item's
      // intrinsic width, which can overflow the decorated field on narrow
      // screens once the arrow icon is added back in. Expanding lets the
      // selected item's Text shrink/ellipsize within the available width
      // instead.
      isExpanded: true,
    );
  }
}
