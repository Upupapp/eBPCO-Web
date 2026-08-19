# 06 – Authentication Stitch

## Overview

The Authentication Stitch defines the standardized authentication workflow for the Electronic Business Permit and Clearance Office (eBPCO) mobile application.

Its purpose is to provide a secure, simple, and consistent authentication experience while ensuring the application is ready for future backend integration.

This stitch serves as the single reference for login, registration, password recovery, session management, validation, and authentication-related UI components.

---

# Objectives

The authentication module shall:

- Secure user accounts.
- Provide a simple login experience.
- Allow new user registration.
- Support password recovery.
- Maintain authenticated user sessions.
- Validate user credentials before granting access.
- Follow the eBPCO Brand Guidelines.
- Prepare the application for backend authentication APIs.

---

# Supported Authentication Methods

## Current Version

- Email Address
- Password

## Future Enhancements

- Google Sign-In
- eGov Account Login
- National ID Authentication
- Two-Factor Authentication (2FA)
- Biometric Authentication
  - Fingerprint
  - Face ID

---

# User Flow

## First-Time User

```text
Launch Application
        │
        ▼
Welcome Screens
        │
        ▼
Login Screen
        │
        ▼
Create Account
        │
        ▼
Complete Registration Form
        │
        ▼
Account Created
        │
        ▼
Login
        │
        ▼
Dashboard
```

---

## Existing User

```text
Launch Application
        │
        ▼
Login Screen
        │
        ▼
Enter Email
        │
        ▼
Enter Password
        │
        ▼
Authenticate
        │
        ▼
Dashboard
```

---

# Login Screen

## Layout

The login screen consists of:

- Official DILG Logo
- eBPCO Title
- Welcome Message
- Email Field
- Password Field
- Forgot Password
- Login Button
- Create Account Button

The interface must follow the eBPCO Brand Guidelines.

---

# Login Form

## Email

Requirements

- Required
- Valid email format
- Lowercase accepted
- Trim leading and trailing spaces

Example

```
juan@email.com
```

---

## Password

Requirements

- Required
- Minimum of 8 characters
- Hidden by default
- Show/Hide Password toggle

---

# Registration

The registration screen collects the user's personal information.

## Required Fields

- First Name
- Middle Name (Optional)
- Last Name
- Email Address
- Mobile Number
- Password
- Confirm Password

---

## Future Fields

- Business Name
- Business Address
- Government ID
- TIN Number
- DTI / SEC Registration

---

# Forgot Password Flow

```text
Forgot Password
        │
        ▼
Enter Email
        │
        ▼
Verify Email
        │
        ▼
Receive Reset Link / OTP
        │
        ▼
Create New Password
        │
        ▼
Login
```

---

# Session Management

After successful authentication:

- Generate authenticated session.
- Store authentication token securely.
- Load user profile.
- Load dashboard data.
- Redirect to Dashboard.

The session remains active until:

- User logs out.
- Token expires.
- Session becomes invalid.

---

# Logout Flow

```text
Settings
        │
        ▼
Logout
        │
        ▼
Confirmation Dialog
        │
        ▼
Clear Session
        │
        ▼
Login Screen
```

---

# Validation Rules

## Email Validation

- Cannot be empty.
- Must follow email format.

Example

```
sample@email.com
```

---

## Password Validation

Requirements

- Minimum 8 characters.
- At least one uppercase letter.
- At least one lowercase letter.
- At least one number.

Future versions may require special characters.

---

# Error States

## Invalid Credentials

```
Invalid email or password.
```

---

## Empty Fields

```
Please complete all required fields.
```

---

## Network Error

```
Unable to connect to the server.
Please try again later.
```

---

## Locked Account

```
Too many failed login attempts.

Please try again later.
```

---

# Success States

## Login Success

- Redirect to Dashboard.
- Load profile information.
- Load notifications.
- Initialize application session.

---

## Registration Success

Display confirmation.

Redirect to Login Screen.

---

## Password Reset Success

Display confirmation.

Redirect to Login Screen.

---

# Security Requirements

Authentication must:

- Never store passwords in plain text.
- Encrypt sensitive authentication data.
- Store tokens securely.
- Prevent brute-force login attempts.
- Validate all user inputs.
- Automatically expire inactive sessions.

---

# UI Components

Reusable components used by this stitch:

- EBPCOLogoHeader
- EBPCOTextField
- EBPCOPasswordField
- EBPCOPrimaryButton
- EBPCOSecondaryButton
- EBPCOErrorMessage
- EBPCOLoadingIndicator
- EBPCOConfirmationDialog

---

# Dependencies

This stitch interacts with:

- User Profile Stitch
- Dashboard Stitch
- Notification Stitch
- Settings Stitch
- Backend Authentication Service

---

# Acceptance Criteria

- Login screen follows Brand Guidelines.
- Registration flow is complete.
- Forgot Password flow is documented.
- Validation rules are defined.
- Error handling is standardized.
- Session management is documented.
- Logout flow is documented.
- Security requirements are identified.
- Reusable components are defined.
- Ready for backend implementation.

---

# Future Improvements

- Biometric authentication.
- Social login providers.
- Email verification.
- Multi-factor authentication.
- Automatic session refresh.
- Device management.
- Login history.
- Suspicious login detection.