import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';

/// Simple confirmation dialog for mock "this succeeded" moments (profile
/// updated, password changed, etc.) — a single OK action, no branching.
/// Sits alongside [ConfirmationDialog] for the "just acknowledge" case.
class SuccessDialog extends StatelessWidget {
  final String title;
  final String message;
  final String actionLabel;

  const SuccessDialog({
    super.key,
    this.title = 'Success',
    required this.message,
    this.actionLabel = 'OK',
  });

  static Future<void> show(
    BuildContext context, {
    String title = 'Success',
    required String message,
    String actionLabel = 'OK',
  }) {
    return showDialog<void>(
      context: context,
      builder: (context) => SuccessDialog(
        title: title,
        message: message,
        actionLabel: actionLabel,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      icon: const Icon(
        Icons.check_circle,
        color: AppColors.statusApproved,
        size: 32,
      ),
      title: Text(title, textAlign: TextAlign.center),
      content: Text(message, textAlign: TextAlign.center),
      actions: [
        Center(
          child: TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text(actionLabel),
          ),
        ),
      ],
    );
  }
}
