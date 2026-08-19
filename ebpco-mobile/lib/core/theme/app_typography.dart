import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../constants/app_colors.dart';

/// Centralized typography for the E-BPCO User App, built on Poppins to
/// match the eBPCO Web Admin's brand typeface (Google Fonts, weights
/// 400/500/600/700/800 — see ebpco-web-admin/src/index.html).
class AppTypography {
  AppTypography._();

  static TextStyle _poppins({
    required double fontSize,
    required FontWeight fontWeight,
    Color color = AppColors.textPrimary,
    double? height,
    double? letterSpacing,
  }) {
    return GoogleFonts.poppins(
      fontSize: fontSize,
      fontWeight: fontWeight,
      color: color,
      height: height,
      letterSpacing: letterSpacing,
    );
  }

  /// Full-screen hero text (splash / onboarding headline).
  static TextStyle get display =>
      _poppins(fontSize: 32, fontWeight: FontWeight.w800, height: 1.2);

  /// Top-level screen / app bar title.
  static TextStyle get pageTitle =>
      _poppins(fontSize: 22, fontWeight: FontWeight.w800, height: 1.25);

  /// Section heading inside a screen (e.g. "Active Applications").
  static TextStyle get sectionTitle =>
      _poppins(fontSize: 17, fontWeight: FontWeight.w700);

  /// Heading inside an individual card.
  static TextStyle get cardTitle =>
      _poppins(fontSize: 15, fontWeight: FontWeight.w700);

  /// Ordinary body copy. Kept at/above 14px for on-device readability.
  static TextStyle get body =>
      _poppins(fontSize: 14, fontWeight: FontWeight.w500, height: 1.4);

  static TextStyle get bodyStrong =>
      _poppins(fontSize: 14, fontWeight: FontWeight.w600, height: 1.4);

  static TextStyle get bodyMuted => _poppins(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: AppColors.textSecondary,
    height: 1.4,
  );

  /// Form field / tag labels.
  static TextStyle get label => _poppins(
    fontSize: 13,
    fontWeight: FontWeight.w600,
    color: AppColors.textSecondary,
  );

  /// Supporting text below a field or control.
  static TextStyle get helper => _poppins(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: AppColors.textMuted,
    height: 1.3,
  );

  /// Smallest supporting text (timestamps, footnotes).
  static TextStyle get caption => _poppins(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: AppColors.textMuted,
  );

  /// Button label text.
  static TextStyle get button =>
      _poppins(fontSize: 16, fontWeight: FontWeight.w600);

  /// Large numeric emphasis (dashboard stat cards, amounts).
  static TextStyle get statistic =>
      _poppins(fontSize: 26, fontWeight: FontWeight.w800, height: 1.1);

  /// Base Material [TextTheme] so `Theme.of(context).textTheme.*` also
  /// resolves to Poppins with brand-consistent weights.
  static TextTheme get textTheme {
    return TextTheme(
      displayLarge: display,
      displaySmall: pageTitle,
      headlineSmall: pageTitle,
      titleLarge: sectionTitle,
      titleMedium: cardTitle,
      titleSmall: _poppins(fontSize: 14, fontWeight: FontWeight.w600),
      bodyLarge: body,
      bodyMedium: body,
      bodySmall: bodyMuted,
      labelLarge: button,
      labelMedium: label,
      labelSmall: caption,
    );
  }
}
