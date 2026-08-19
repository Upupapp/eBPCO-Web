import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/models/document_model.dart';
import '../../../core/theme/app_typography.dart';
import '../avatars/app_avatar.dart';
import '../cards/app_card.dart';

/// A single requirement/attachment row used by the New Application wizard's
/// document checklist and the payment flow's proof-of-payment step. No real
/// file picker is used — [onUpload] fabricates a mock [DocumentModel].
class DocumentUploadTile extends StatelessWidget {
  final String label;
  final bool isRequired;
  final DocumentModel? document;
  final VoidCallback onUpload;
  final VoidCallback? onRemove;

  /// Optional caption shown under the filename instead of "Not yet
  /// uploaded" (e.g. a requirement level like "Required when applicable").
  final String? statusLabel;

  /// When provided and a document is attached, shows a "Preview" text
  /// action. Opt-in so existing call sites are unaffected.
  final VoidCallback? onPreview;

  /// When true and a document is attached, shows a "Replace" icon button
  /// next to Remove (calls [onUpload] again). Defaults to false so
  /// existing call sites render exactly as before.
  final bool allowReplace;

  const DocumentUploadTile({
    super.key,
    required this.label,
    this.isRequired = true,
    this.document,
    required this.onUpload,
    this.onRemove,
    this.statusLabel,
    this.onPreview,
    this.allowReplace = false,
  });

  static String _formatFileSize(int bytes) {
    if (bytes < 1024 * 1024) {
      return '${(bytes / 1024).toStringAsFixed(0)} KB';
    }
    return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
  }

  @override
  Widget build(BuildContext context) {
    final uploaded = document != null;
    return AppCard(
      padding: const EdgeInsets.all(14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AppAvatar(
            size: 40,
            icon: uploaded ? Icons.check_circle : Icons.description_outlined,
            iconSize: 20,
            backgroundColor: uploaded
                ? AppColors.statusApprovedBg
                : AppColors.surfaceMuted,
            foregroundColor: uploaded
                ? AppColors.statusApproved
                : AppColors.textMuted,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isRequired ? label : '$label (optional)',
                  style: AppTypography.bodyStrong,
                ),
                const SizedBox(height: 2),
                Text(
                  uploaded
                      ? document!.fileName
                      : (statusLabel ?? 'Not yet uploaded'),
                  style: AppTypography.caption,
                ),
                if (uploaded && document!.fileSizeBytes != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    _formatFileSize(document!.fileSizeBytes!),
                    style: AppTypography.caption,
                  ),
                ],
                if (uploaded && onPreview != null) ...[
                  const SizedBox(height: 4),
                  InkWell(
                    onTap: onPreview,
                    child: Text(
                      'Preview',
                      style: AppTypography.label.copyWith(
                        color: AppColors.secondaryBlue,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(width: 8),
          if (uploaded)
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  onPressed: onRemove,
                  icon: const Icon(Icons.close, size: 18),
                  color: AppColors.textMuted,
                  tooltip: 'Remove attachment',
                ),
                if (allowReplace)
                  IconButton(
                    onPressed: onUpload,
                    icon: const Icon(Icons.refresh, size: 18),
                    color: AppColors.secondaryBlue,
                    tooltip: 'Replace attachment',
                  ),
              ],
            )
          else
            OutlinedButton(
              onPressed: onUpload,
              // The app-wide OutlinedButtonTheme sets minimumSize to
              // Size.fromHeight(...), i.e. an INFINITE width, for buttons
              // meant to stretch full-width elsewhere. As a plain (non-
              // Expanded/Flexible) Row child here, that forces this button
              // to be laid out with an infinite width, which never
              // produces a valid size — the render box is left with
              // hasSize == false, which is what the mouse tracker's hit
              // test crashes on. Override it locally to size the button to
              // its content, like every other Row-embedded button.
              style: OutlinedButton.styleFrom(minimumSize: const Size(0, 40)),
              child: const Text('Upload'),
            ),
        ],
      ),
    );
  }
}
