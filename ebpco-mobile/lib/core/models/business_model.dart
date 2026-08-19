import 'package:flutter/material.dart';

import '../constants/app_colors.dart';

/// Classification shown on a business record.
enum BusinessCategory {
  retail,
  foodService,
  services,
  manufacturing,
  wholesale,
  other,
}

extension BusinessCategoryX on BusinessCategory {
  String get label {
    switch (this) {
      case BusinessCategory.retail:
        return 'Retail';
      case BusinessCategory.foodService:
        return 'Food Service';
      case BusinessCategory.services:
        return 'Services';
      case BusinessCategory.manufacturing:
        return 'Manufacturing';
      case BusinessCategory.wholesale:
        return 'Wholesale';
      case BusinessCategory.other:
        return 'Other';
    }
  }
}

enum BusinessStatus { active, inactive }

extension BusinessStatusX on BusinessStatus {
  String get label => this == BusinessStatus.active ? 'Active' : 'Inactive';

  Color get color => this == BusinessStatus.active
      ? AppColors.statusApproved
      : AppColors.textMuted;

  Color get backgroundColor => this == BusinessStatus.active
      ? AppColors.statusApprovedBg
      : AppColors.surfaceMuted;
}

/// Mock model describing a business registered by the user.
class BusinessModel {
  final String id;
  final String name;
  final BusinessCategory category;
  final String street;
  final String barangay;
  final String city;
  final String province;
  final String registrationNumber;
  final DateTime dateRegistered;
  final BusinessStatus status;

  const BusinessModel({
    required this.id,
    required this.name,
    required this.category,
    required this.street,
    required this.barangay,
    required this.city,
    required this.province,
    required this.registrationNumber,
    required this.dateRegistered,
    this.status = BusinessStatus.active,
  });

  String get fullAddress => '$street, $barangay, $city, $province';
}
