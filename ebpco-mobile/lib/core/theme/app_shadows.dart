import 'package:flutter/material.dart';

import '../constants/app_colors.dart';

/// Centralized elevation styles extracted from the eBPCO Web Admin
/// (stat-card hover, modal, and focus-ring shadows).
class AppShadows {
  AppShadows._();

  /// Resting card shadow — subtle, for cards that don't need to pop off
  /// the page background.
  static const List<BoxShadow> card = [
    BoxShadow(color: AppColors.shadow, blurRadius: 10, offset: Offset(0, 4)),
  ];

  /// Web Admin stat-card hover shadow: `0 10px 22px rgba(20,20,40,0.08)`.
  static const List<BoxShadow> cardElevated = [
    BoxShadow(color: AppColors.shadow, blurRadius: 22, offset: Offset(0, 10)),
  ];

  /// Web Admin modal shadow: `0 20px 45px rgba(0,0,0,0.2)`.
  static const List<BoxShadow> dialog = [
    BoxShadow(color: Color(0x33000000), blurRadius: 45, offset: Offset(0, 20)),
  ];

  /// Brand-red focus ring: `0 0 0 2px rgba(200,30,44,0.25)`.
  static const List<BoxShadow> focusRingBrand = [
    BoxShadow(color: AppColors.focusRingBrand, blurRadius: 0, spreadRadius: 2),
  ];

  /// Blue focus ring: `0 0 0 2px rgba(37,99,235,0.2)`.
  static const List<BoxShadow> focusRingBlue = [
    BoxShadow(color: AppColors.focusRingBlue, blurRadius: 0, spreadRadius: 2),
  ];
}
