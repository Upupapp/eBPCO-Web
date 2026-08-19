import 'package:flutter/material.dart';

/// Centralized color palette for the E-BPCO User App.
///
/// Brand primary is the original eBPCO institutional red; surfaces/status
/// colors use the fintech-premium neutral palette. All widgets should
/// reference these constants instead of hardcoding colors.
class AppColors {
  AppColors._();

  // Brand colors.
  static const Color primary = Color(0xFFC81E2C);
  static const Color primaryDark = Color(0xFFA01823);
  static const Color primaryLight = Color(0xFFF8E4E6);
  static const Color secondaryBlue = Color(0xFF2563EB);
  static const Color secondaryBlueDark = Color(0xFF1D4ED8);
  static const Color lightBlue = Color(0xFFE8F1FF);

  // Backgrounds and surfaces.
  static const Color background = Color(0xFFFAFAFA);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceMuted = Color(0xFFF5F7FA);
  static const Color border = Color(0xFFE6E6EC);
  static const Color borderLight = Color(0xFFEEEEF2);

  // Text colors.
  static const Color textPrimary = Color(0xFF1F2937);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color textOnPrimary = Color(0xFFFFFFFF);
  static const Color textOnPrimaryMuted = Color(0xB3FFFFFF);
  static const Color textMuted = Color(0xFF9CA3AF);

  // Status colors.
  static const Color statusApproved = Color(0xFF22C55E);
  static const Color statusApprovedBg = Color(0xFFDCFCE7);
  static const Color statusPending = Color(0xFFF59E0B);
  static const Color statusPendingBg = Color(0xFFFEF3C7);
  static const Color statusRejected = Color(0xFFDC2626);
  static const Color statusRejectedBg = Color(0xFFFEE2E2);
  static const Color statusInfo = Color(0xFF2563EB);
  static const Color statusInfoBg = Color(0xFFDBEAFE);

  // Utility.
  static const Color divider = Color(0xFFEEEEF2);
  static const Color shadow = Color(0x14141428);
  static const Color focusRingBrand = Color(0x40C81E2C);
  static const Color focusRingBlue = Color(0x332563EB);
  static const Color success = statusApproved;
  static const Color error = statusRejected;
  static const Color warning = statusPending;
}
