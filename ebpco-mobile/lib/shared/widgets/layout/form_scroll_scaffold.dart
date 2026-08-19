import 'package:flutter/material.dart';

import '../../../core/constants/app_constants.dart';

/// Keyboard-safe, width-capped, optionally vertically-centered scroll
/// wrapper used by every form screen (login, register, forgot password,
/// onboarding) so the "LayoutBuilder + ScrollView + centered max-width
/// column" pattern only exists in one place.
class FormScrollScaffold extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final bool centerVertically;

  const FormScrollScaffold({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.symmetric(
      horizontal: AppConstants.screenPaddingHorizontal,
      vertical: 20,
    ),
    this.centerVertically = true,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        Widget content = ConstrainedBox(
          constraints: const BoxConstraints(
            maxWidth: AppConstants.maxFormWidth,
          ),
          child: child,
        );

        content = centerVertically
            ? ConstrainedBox(
                constraints: BoxConstraints(minHeight: constraints.maxHeight),
                child: Center(child: content),
              )
            : Center(child: content);

        return SingleChildScrollView(padding: padding, child: content);
      },
    );
  }
}
