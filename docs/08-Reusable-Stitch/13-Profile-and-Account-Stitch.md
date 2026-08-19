# 13 – Profile and Account Stitch

## Overview

The Profile and Account Stitch defines the standardized management of user profile information within the Electronic Business Permit and Clearance Office (eBPCO) mobile application.

This module allows users to manage their personal information, business details, account preferences, and security settings while ensuring consistency throughout the application.

---

# Objectives

The Profile module shall:

- Display user profile information.
- Allow users to update personal details.
- Manage business information.
- Support account security settings.
- Display account activity.
- Prepare profile information for backend synchronization.

---

# Profile Flow

```text
Dashboard
      │
      ▼
Profile
      │
      ▼
View Personal Information
      │
      ▼
Edit Profile
      │
      ▼
Save Changes
      │
      ▼
Profile Updated
```

---

# Profile Screen Layout

The Profile screen consists of:

- Profile Photo
- Full Name
- Email Address
- Mobile Number
- Business Information
- Account Settings
- Security Settings
- Logout Button

---

# Personal Information

Display

- Profile Photo
- First Name
- Middle Name
- Last Name
- Email Address
- Mobile Number
- Address

Future Version

- Date of Birth
- Gender
- Government ID Number

---

# Business Information

Display

- Business Name
- Business Type
- Nature of Business
- Business Address
- DTI / SEC Registration Number
- Business Contact Number

Future enhancement

- Multiple Businesses
- Business Logo
- Tax Information

---

# Edit Profile

Users may update:

- Name
- Mobile Number
- Address
- Business Information

Users cannot directly change:

- Registered Email (Future verification required)

---

# Change Password

Flow

```text
Profile
      │
      ▼
Security
      │
      ▼
Current Password
      │
      ▼
New Password
      │
      ▼
Confirm Password
      │
      ▼
Password Updated
```

Password requirements follow the Authentication Stitch.

---

# Profile Picture

Current Version

- Upload Profile Picture
- Replace Profile Picture
- Remove Profile Picture

Supported Formats

- JPG
- JPEG
- PNG

Future enhancement

- Camera Capture
- Image Cropping

---

# Account Information

Display

- Account Status
- Member Since
- Last Login
- Registered Device (Future)

---

# Validation Rules

Name

- Required

Mobile Number

- Philippine mobile number format

Email

- Read-only

Business Name

- Required if business exists

---

# Error States

Profile Update Failed

```
Unable to update profile.

Please try again later.
```

---

Invalid Mobile Number

```
Please enter a valid mobile number.
```

---

Password Mismatch

```
Passwords do not match.
```

---

# Success States

Profile Updated

```
Profile updated successfully.
```

Password Changed

```
Password changed successfully.
```

---

# Security Requirements

The profile module shall:

- Require authentication before editing.
- Encrypt sensitive information.
- Validate all updates.
- Secure profile synchronization.

---

# UI Components

Reusable components

- EBPCOProfileHeader
- EBPCOAvatar
- EBPCOInfoCard
- EBPCOTextField
- EBPCOPrimaryButton
- EBPCOSecondaryButton
- EBPCOConfirmationDialog
- EBPCOEmptyState

---

# Dependencies

This stitch interacts with:

- Authentication Stitch
- Dashboard Stitch
- Notification Stitch
- Settings Stitch
- Backend User Profile Service

---

# Acceptance Criteria

- User profile displays correctly.
- Personal information is editable.
- Business information is manageable.
- Password change workflow is documented.
- Validation rules are complete.
- Error and success states are standardized.
- Reusable components are identified.
- Ready for backend integration.

---

# Future Improvements

- Multiple business profiles.
- Profile verification badge.
- Digital ID integration.
- Avatar customization.
- Account activity history.
- Linked government accounts.
- Device management.
- Biometric profile verification.