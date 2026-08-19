import 'dart:async';

import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_shadows.dart';

/// Debounced search field. Calls [onChanged] 300ms (by default) after the
/// user stops typing, per the Search component spec.
///
/// Pass [floating] to render the pill-shaped, shadowed "floating search bar"
/// look used on top of a [HeroHeader]-style coral banner; leave it false for
/// the plain themed field used inline on list screens.
class AppSearchField extends StatefulWidget {
  final String hint;
  final ValueChanged<String> onChanged;
  final Duration debounce;
  final bool floating;

  /// When set, the field becomes read-only and tapping it fires this
  /// callback instead of opening the keyboard — used for a dashboard-style
  /// search shortcut that hands off to a screen with real search state.
  final VoidCallback? onTap;

  const AppSearchField({
    super.key,
    this.hint = 'Search',
    required this.onChanged,
    this.debounce = const Duration(milliseconds: 300),
    this.floating = false,
    this.onTap,
  });

  @override
  State<AppSearchField> createState() => _AppSearchFieldState();
}

class _AppSearchFieldState extends State<AppSearchField> {
  final _controller = TextEditingController();
  Timer? _debounceTimer;

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  void _handleChanged(String value) {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(widget.debounce, () => widget.onChanged(value));
    setState(() {});
  }

  void _clear() {
    _controller.clear();
    _debounceTimer?.cancel();
    widget.onChanged('');
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final field = Semantics(
      textField: true,
      label: widget.hint,
      child: TextField(
        controller: _controller,
        onChanged: _handleChanged,
        readOnly: widget.onTap != null,
        onTap: widget.onTap,
        textInputAction: TextInputAction.search,
        decoration: InputDecoration(
          hintText: widget.hint,
          prefixIcon: const Icon(Icons.search, color: AppColors.textMuted),
          suffixIcon: _controller.text.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: _clear,
                  tooltip: 'Clear search',
                )
              : null,
          filled: widget.floating ? true : null,
          fillColor: widget.floating ? AppColors.surface : null,
          border: widget.floating
              ? OutlineInputBorder(
                  borderRadius: BorderRadius.circular(
                    AppConstants.borderRadiusPill,
                  ),
                  borderSide: BorderSide.none,
                )
              : null,
          enabledBorder: widget.floating
              ? OutlineInputBorder(
                  borderRadius: BorderRadius.circular(
                    AppConstants.borderRadiusPill,
                  ),
                  borderSide: BorderSide.none,
                )
              : null,
          focusedBorder: widget.floating
              ? OutlineInputBorder(
                  borderRadius: BorderRadius.circular(
                    AppConstants.borderRadiusPill,
                  ),
                  borderSide: BorderSide.none,
                )
              : null,
        ),
      ),
    );

    if (!widget.floating) return field;

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppConstants.borderRadiusPill),
        boxShadow: AppShadows.cardElevated,
      ),
      child: field,
    );
  }
}
