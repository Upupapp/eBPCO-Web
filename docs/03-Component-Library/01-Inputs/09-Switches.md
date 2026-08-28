# Switches

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Inputs

---

# Purpose

Switches allow users to immediately toggle a setting or feature between enabled and disabled states.

Unlike Checkboxes, Switches represent an immediate system state rather than a value that is submitted as part of a form.

Switches shall provide a clear, accessible, and responsive experience throughout the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Switches should:

- Represent binary (On/Off) states.
- Provide immediate feedback.
- Improve usability for application settings.
- Support accessibility.
- Consume approved Design Tokens.

---

# Usage

Use Switches when changing a setting should immediately take effect.

Common eBPCO examples include:

- Enable Email Notifications
- Enable SMS Notifications
- Receive Application Updates
- Enable Biometric Login (Mobile)
- Activate User Account
- Enable Dark Mode (Future)
- Enable Two-Factor Authentication

Do not use Switches for selecting values within forms.

---

# Anatomy

A standard Switch consists of:

- Label
- Toggle Track
- Toggle Thumb
- Helper Text (optional)
- Validation Message (rarely required)

The label should clearly describe the setting being controlled.

---

# Variants

## Standard Switch

Represents a simple On/Off setting.

---

## Switch with Description

Provides additional explanatory text beneath the label.

Example:

```
Receive Email Notifications

Get notified whenever your permit status changes.
```

---

## Read Only

Displays the current state without allowing interaction.

---

## Disabled

Displays the current state while preventing changes.

---

# States

Switches shall support:

- Off
- On
- Hover (Web)
- Focus
- Pressed
- Disabled
- Read Only

State transitions shall follow the Motion guidelines.

---

# Behavior

Switches should:

- Toggle immediately.
- Save the new state immediately or provide instant feedback.
- Display loading only when server confirmation is required.
- Preserve the current state if an update fails.
- Clearly communicate failures.

Example:

```
Unable to update notification preferences.

Please try again.
```

---

# Labels

Every Switch must include a visible label.

Labels should:

- Begin with a verb where appropriate.
- Clearly describe the controlled setting.
- Be concise.

Preferred:

```
Enable Email Notifications
```

Avoid:

```
Notifications
```

---

# Confirmation

Most Switch interactions should not require confirmation.

Confirmation dialogs should only be used when the action:

- Is destructive.
- Has significant consequences.
- Cannot easily be reversed.

---

# Validation

Validation is uncommon for Switches.

If required, messages should:

- Explain the issue.
- Suggest corrective action.

Example:

```
This setting cannot be changed while an application is under review.
```

---

# Accessibility

Switches shall:

- Meet WCAG 2.1 AA.
- Support screen readers.
- Support keyboard navigation.
- Display visible focus indicators.
- Provide semantic labels.
- Maintain accessible touch target sizes.

Keyboard support should include:

- Tab
- Shift + Tab
- Space
- Enter

---

# Responsive Behavior

Desktop:

- Support hover interactions.
- Align labels consistently.

Tablet:

- Increase touch target sizes.

Mobile:

- Support one-handed interaction.
- Maintain generous spacing.
- Prevent accidental toggles.

---

# Design Tokens

Switches consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Radius Tokens
- Motion Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular Switches should:

- Use Reactive Forms where appropriate.
- Reuse shared Switch components.
- Consume centralized SCSS tokens.
- Display loading indicators when updating remote settings.

Recommended location:

```
shared/components/switch/
```

---

# Flutter Implementation

Flutter Switches should:

- Reuse shared Switch widgets.
- Consume ThemeData.
- Respect AppColors and AppTypography.
- Support Material accessibility.
- Display loading feedback when appropriate.

Recommended location:

```
shared/widgets/switches/
```

---

# Do

✔ Use Switches for application settings.

✔ Apply changes immediately after toggling.

✔ Use clear action-oriented labels.

✔ Preserve state when updates fail.

✔ Reuse shared components.

---

# Don't

✘ Use Switches for multiple-choice selections.

✘ Require users to submit a form after toggling.

✘ Hide labels.

✘ Hardcode styling.

✘ Create undocumented Switch variants.

---

# eBPCO Examples

User Settings

- Enable Email Notifications
- Enable SMS Notifications

Security

- Enable Biometric Login
- Enable Two-Factor Authentication

Administration

- Activate User Account
- Enable Staff Access

Future Features

- Enable Dark Mode
- Enable Experimental Features

---

# AI Development Guidelines

AI-generated Switches must:

- Reuse documented components.
- Consume Design Tokens.
- Preserve accessibility.
- Support responsive layouts.
- Apply changes immediately unless business rules require confirmation.
- Avoid undocumented variants.

---

# Governance

All Switch implementations within the eBPCO ecosystem shall comply with this specification.

New Switch variants require UI/UX approval and documentation before implementation.

---

# Approval

Project

Electronic Building Permit and Certificate of Occupancy (eBPCO)

Platforms

- Angular Web Administration Portal
- Flutter Mobile Application

Status

Approved

Version

1.0.0