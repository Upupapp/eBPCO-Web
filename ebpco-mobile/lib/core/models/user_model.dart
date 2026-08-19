import 'package:flutter/material.dart';

import '../constants/app_colors.dart';

/// Verification state shown on the Profile screen's account status chip.
/// Mock/display-only — there is no real verification workflow.
enum AccountStatus { verified, pending, suspended }

extension AccountStatusX on AccountStatus {
  String get label {
    switch (this) {
      case AccountStatus.verified:
        return 'Verified';
      case AccountStatus.pending:
        return 'Pending Verification';
      case AccountStatus.suspended:
        return 'Suspended';
    }
  }

  Color get color {
    switch (this) {
      case AccountStatus.verified:
        return AppColors.statusApproved;
      case AccountStatus.pending:
        return AppColors.statusPending;
      case AccountStatus.suspended:
        return AppColors.statusRejected;
    }
  }

  Color get backgroundColor {
    switch (this) {
      case AccountStatus.verified:
        return AppColors.statusApprovedBg;
      case AccountStatus.pending:
        return AppColors.statusPendingBg;
      case AccountStatus.suspended:
        return AppColors.statusRejectedBg;
    }
  }
}

/// Sentinel used by [UserModel.copyWith] so `photoPath` can be explicitly
/// cleared to null (e.g. "Remove Photo") without it being indistinguishable
/// from "leave unchanged".
const _unset = Object();

/// Represents the mock authenticated user of the prototype.
class UserModel {
  final String firstName;
  final String middleName;
  final String lastName;
  final String email;
  final String mobileNumber;

  /// Non-null once the user has set a (mock) profile photo via the picker
  /// bottom sheet. No real image is ever stored — this only flags that a
  /// placeholder "photo set" avatar should render instead of initials.
  final String? photoPath;

  final String address;
  final String province;
  final String city;
  final String barangay;
  final String zipCode;

  /// Free-text account classification shown on the profile info card.
  final String accountType;
  final AccountStatus accountStatus;
  final DateTime? registeredSince;

  const UserModel({
    required this.firstName,
    this.middleName = '',
    required this.lastName,
    required this.email,
    this.mobileNumber = '',
    this.photoPath,
    this.address = '',
    this.province = '',
    this.city = '',
    this.barangay = '',
    this.zipCode = '',
    this.accountType = 'Individual Applicant',
    this.accountStatus = AccountStatus.verified,
    this.registeredSince,
  });

  String get fullName {
    final middle = middleName.trim().isNotEmpty ? ' $middleName' : '';
    return '$firstName$middle $lastName'.replaceAll(RegExp(r'\s+'), ' ').trim();
  }

  String get initials {
    final first = firstName.isNotEmpty ? firstName[0] : '';
    final last = lastName.isNotEmpty ? lastName[0] : '';
    final combined = '$first$last'.toUpperCase();
    return combined.isNotEmpty ? combined : 'U';
  }

  /// Combines the address parts into one display string, skipping any that
  /// are still blank.
  String get fullAddress {
    return [
      address,
      barangay,
      city,
      province,
      zipCode,
    ].where((part) => part.trim().isNotEmpty).join(', ');
  }

  UserModel copyWith({
    String? firstName,
    String? middleName,
    String? lastName,
    String? email,
    String? mobileNumber,
    Object? photoPath = _unset,
    String? address,
    String? province,
    String? city,
    String? barangay,
    String? zipCode,
    String? accountType,
    AccountStatus? accountStatus,
    DateTime? registeredSince,
  }) {
    return UserModel(
      firstName: firstName ?? this.firstName,
      middleName: middleName ?? this.middleName,
      lastName: lastName ?? this.lastName,
      email: email ?? this.email,
      mobileNumber: mobileNumber ?? this.mobileNumber,
      photoPath: identical(photoPath, _unset)
          ? this.photoPath
          : photoPath as String?,
      address: address ?? this.address,
      province: province ?? this.province,
      city: city ?? this.city,
      barangay: barangay ?? this.barangay,
      zipCode: zipCode ?? this.zipCode,
      accountType: accountType ?? this.accountType,
      accountStatus: accountStatus ?? this.accountStatus,
      registeredSince: registeredSince ?? this.registeredSince,
    );
  }
}
