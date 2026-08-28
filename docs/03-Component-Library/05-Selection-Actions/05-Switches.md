# Switches

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Selection & Actions

---

# Purpose

Switches allow users to toggle a setting or feature between two mutually exclusive states, typically **On** and **Off**.

Unlike Checkboxes, Switches represent an immediate change in system state rather than selecting options for later submission.

This specification applies to both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Switches should:

- Represent binary states.
- Provide immediate visual feedback.
- Clearly indicate whether a feature is enabled or disabled.
- Support accessibility requirements.
- Consume approved Design Tokens.
- Be implemented as reusable shared components.

---

# Usage

Use Switches for settings that take effect immediately after interaction.

Recommended examples:

- Enable Email Notifications
- Enable SMS Notifications
- Dark Mode
- Two-Factor Authentication
- Account Visibility
- Auto Save

Switches should never be used for selecting multiple options or submitting form choices.

---

# Anatomy

A Switch consists of:

- Track
- Thumb
- Label
- Optional Supporting Text
- Optional Validation Message
- Focus Indicator

Example

+-------------------------------------------+
| Enable Email Notifications        ON      |
| ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━         |
+-------------------------------------------+

---

# Variants

## Standard Switch

Represents a binary On/Off state.

Recommended for:

- Settings
- Preferences
- Feature Toggles

---

## Switch with Description

Includes supporting text explaining the feature.

Recommended for:

- Security Settings
- Privacy Options
- System Preferences

---

## Disabled Switch

Displayed when the user cannot modify the setting.

Disabled Switches should clearly communicate that interaction is unavailable.

---

# Behavior

Switches should:

- Toggle immediately after interaction.
- Apply changes instantly.
- Display immediate visual feedback.
- Support keyboard interaction.
- Preserve state until changed.

If a setting requires confirmation before taking effect, a confirmation dialog should be displayed.

---

# States

Every Switch supports:

## Off

The feature is disabled.

---

## On

The feature is enabled.

---

## Hover (Web)

Displayed when the pointer is over the Switch.

Provides subtle visual feedback.

---

## Focus

Displayed during keyboard navigation.

Must remain clearly visible.

---

## Disabled

Unavailable for interaction.

Disabled Switches should:

- Preserve readable labels.
- Clearly indicate they are unavailable.
- Prevent interaction.

---

## Loading

Displayed while the system processes the state change.

Interaction should be temporarily disabled until processing completes.

---

# Labels

Switch labels should:

- Clearly describe the feature being controlled.
- Use concise language.
- Remain understandable without additional explanation.

Preferred

- Enable Notifications
- Dark Mode
- Two-Factor Authentication
- Auto Save

Avoid

- Toggle
- Option
- Switch 1

---

# Immediate Actions

Switches should perform their associated action immediately after being toggled.

Examples include:

- Enabling notifications.
- Disabling dark mode.
- Activating two-factor authentication.

Switches should not require a Save button unless specified by business requirements.

---

# Validation

Switches typically do not require validation.

If business rules require confirmation before changing a setting, the system should display a confirmation dialog before applying the change.

---

# Accessibility

Switches shall:

- Meet WCAG 2.1 AA.
- Support keyboard navigation.
- Support screen readers.
- Include visible focus indicators.
- Maintain sufficient color contrast.
- Associate labels programmatically.

Keyboard interaction

Tab

Move focus

Space

Toggle Switch

Enter

Toggle Switch (if supported)

State should never rely solely on color.

---

# Responsive Behavior

Desktop

- Labels displayed beside the Switch.
- Hover states supported.

Tablet

- Maintain spacing between controls.
- Preserve readability.

Mobile

- Larger touch targets.
- Respect safe areas.
- Maintain consistent spacing.

Minimum touch targets

Angular Web

40 × 40 px

Flutter

48 × 48 logical pixels

---

# Design Tokens

Switches consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Motion Tokens
- Size Tokens
- State Tokens

Hardcoded visual values are prohibited.

---

# Angular Implementation

Angular Switches should:

- Reuse shared Switch components.
- Integrate with Angular Reactive Forms when required.
- Consume centralized SCSS Design Tokens.
- Support disabled and loading states.

Recommended location

src/app/shared/components/switch/

Example

EbpcSwitchComponent

---

# Flutter Implementation

Flutter Switches should:

- Reuse shared Switch widgets.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.
- Support Material state behavior.

Recommended location

lib/shared/widgets/switch/

Example

EbpcSwitch

---

# Related Components

- Checkboxes
- Radio Buttons
- Forms
- Buttons
- Dialogs

---

# Implementation Checklist

- [ ] Uses approved Design Tokens
- [ ] Supports On and Off states
- [ ] Supports keyboard navigation
- [ ] Meets WCAG 2.1 AA
- [ ] Supports disabled and loading states
- [ ] Responsive across breakpoints
- [ ] Reuses shared component
- [ ] Matches Brand Guidelines
- [ ] Matches Design System

---

# Do

✔ Use Switches for immediate setting changes.

✔ Keep labels concise.

✔ Display immediate visual feedback.

✔ Support keyboard interaction.

✔ Clearly indicate enabled and disabled states.

---

# Don't

✘ Use Switches for selecting multiple options.

✘ Require unnecessary Save buttons.

✘ Depend solely on color to indicate state.

✘ Hide labels.

✘ Create undocumented Switch styles.

---

# eBPCO Examples

## Notification Settings

Enable Email Notifications

ON

---

Enable SMS Notifications

OFF

---

## Security Settings

Two-Factor Authentication

ON

---

## Appearance

Dark Mode

OFF

---

## Auto Save

Auto Save Drafts

ON

---

# AI Development Guidelines

AI-generated Switch components must:

- Reuse approved shared Switch components.
- Consume Design Tokens.
- Preserve accessibility.
- Support disabled and loading states.
- Avoid undocumented styling.
- Keep Angular and Flutter implementations behaviorally consistent.
- Apply state changes immediately unless business rules require confirmation.

---

# Governance

All Switch implementations within the eBPCO ecosystem shall comply with this specification.

Changes to Switch variants, interaction behavior, accessibility requirements, or implementation patterns require UI/UX approval before implementation.

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