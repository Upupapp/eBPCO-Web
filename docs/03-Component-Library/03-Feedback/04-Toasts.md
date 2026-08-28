# Toasts

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Feedback

---

# Purpose

Toasts are lightweight, temporary notifications that inform users of completed actions or system events without interrupting their workflow.

Unlike Dialogs, Alerts, or Snackbars, Toasts require no user interaction and automatically disappear after a short period.

This specification applies to both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Toasts should:

- Provide immediate feedback.
- Confirm lightweight actions.
- Avoid interrupting workflows.
- Maintain accessibility.
- Consume approved Design Tokens.

---

# Usage

Use Toasts for:

- Successful login
- Logout confirmation
- Data synchronized
- Settings updated
- Connection restored
- Session refreshed

Examples in eBPCO:

- Login successful.
- Profile updated.
- Notification settings saved.
- Changes synchronized.
- Password changed successfully.

Do not use Toasts for confirmations, critical warnings, or blocking errors.

---

# Anatomy

A Toast consists of:

- Optional Icon
- Message

Example

+--------------------------------------+
| ✓ Profile updated successfully.      |
+--------------------------------------+

Toasts should never include buttons or links.

---

# Variants

## Success Toast

Confirms successful completion.

Examples:

- Login successful.
- Password updated.
- Profile saved.

---

## Information Toast

Communicates temporary information.

Examples:

- Data synchronized.
- Connection restored.

---

## Warning Toast

Communicates a non-critical warning.

Examples:

- Offline mode enabled.
- Some features are unavailable.

---

## Error Toast

Communicates a recoverable issue.

Examples:

- Unable to refresh data.
- Temporary network issue.

Critical failures should use Alerts or Dialogs instead.

---

# Behavior

Toasts should:

- Appear immediately after an event.
- Automatically dismiss.
- Never interrupt user interaction.
- Never require user action.
- Display only one Toast at a time.

---

# Duration

Recommended durations:

Success

3 seconds

Information

3–4 seconds

Warning

4 seconds

Error

5 seconds

---

# Positioning

Desktop

Top-right or bottom-right.

Tablet

Top-center or bottom-center.

Mobile

Top of the screen below the status bar.

Avoid covering important navigation controls.

---

# Accessibility

Toasts shall:

- Meet WCAG 2.1 AA.
- Support screen readers.
- Announce messages politely.
- Maintain sufficient color contrast.
- Never rely solely on color.

---

# Responsive Behavior

Desktop

Compact width.

Tablet

Maintain readable width.

Mobile

Nearly full-width with safe margins.

Avoid overlapping navigation components.

---

# Design Tokens

Toasts consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Radius Tokens
- Shadow Tokens
- Motion Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular Toasts should:

- Reuse a centralized Toast service.
- Consume centralized SCSS tokens.
- Support configurable variants.

Recommended location:

shared/components/toast/

---

# Flutter Implementation

Flutter Toasts should:

- Reuse shared Toast widgets.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.

Recommended location:

shared/widgets/toast/

---

# Related Components

- Snackbars – when an optional action is required.
- Alerts – for persistent page-level information.
- Dialogs – for confirmation or decisions.
- Loading States – while operations are in progress.

---

# Implementation Checklist

- [ ] Uses approved Design Tokens
- [ ] Supports WCAG 2.1 AA
- [ ] Responsive across all breakpoints
- [ ] Reusable shared component
- [ ] Auto-dismisses appropriately
- [ ] Displays only one Toast at a time
- [ ] Matches Brand Guidelines
- [ ] Matches Design System

---

# Do

✔ Confirm lightweight actions.

✔ Keep messages concise.

✔ Automatically dismiss.

✔ Display one Toast at a time.

✔ Reuse shared Toast components.

---

# Don't

✘ Include action buttons.

✘ Require user interaction.

✘ Display long messages.

✘ Replace Dialogs or Alerts.

✘ Create undocumented variants.

---

# eBPCO Examples

Authentication

- Login successful.
- Logout successful.

Business Registration

- Draft saved.

Permit Applications

- Information synchronized.

Payments

- Receipt downloaded.

Profile

- Settings updated.

Notifications

- Preferences saved.

---

# AI Development Guidelines

AI-generated Toasts must:

- Reuse documented components.
- Consume Design Tokens.
- Preserve accessibility.
- Keep messages brief.
- Avoid undocumented variants.

---

# Governance

All Toast implementations within the eBPCO ecosystem shall comply with this specification.

New Toast variants require UI/UX approval before implementation.

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