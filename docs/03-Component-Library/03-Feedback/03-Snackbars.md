# Snackbars

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Feedback

---

# Purpose

Snackbars provide brief, non-intrusive feedback after a user performs an action. They appear temporarily and automatically disappear after a short duration, allowing users to continue their workflow without interruption.

Snackbars are ideal for confirming completed actions or providing lightweight notifications with an optional action.

This specification applies to both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Snackbars should:

- Confirm completed actions.
- Provide immediate feedback.
- Avoid interrupting user workflows.
- Support optional recovery actions.
- Maintain accessibility.
- Consume approved Design Tokens.

---

# Usage

Use Snackbars for:

- Successful submissions
- Saved changes
- Deleted items with Undo
- Network reconnection
- Draft saved
- Copy to clipboard confirmation

Examples in eBPCO:

- Business information saved.
- Permit application submitted.
- Payment proof uploaded.
- Profile updated.
- Draft automatically saved.

Do not use Snackbars for critical errors or confirmation requests.

---

# Anatomy

A Snackbar consists of:

- Optional Leading Icon
- Message
- Optional Action Button
- Auto-dismiss Timer

Example

+-----------------------------------------------------------+
| ✓ Business information saved.          [Undo]             |
+-----------------------------------------------------------+

---

# Variants

## Success Snackbar

Confirms successful completion.

Examples:

- Application submitted.
- Payment uploaded.
- Profile updated.

---

## Information Snackbar

Provides temporary information.

Examples:

- Draft saved.
- Connection restored.

---

## Warning Snackbar

Communicates a non-blocking warning.

Examples:

- Offline mode enabled.
- Upload paused.

---

## Error Snackbar

Displays recoverable errors.

Examples:

- Upload failed.
- Unable to refresh data.

Blocking errors should use Alerts or Dialogs instead.

---

# Behavior

Snackbars should:

- Appear immediately after an action.
- Auto-dismiss after a few seconds.
- Not interrupt user interaction.
- Support one optional action.
- Display only one Snackbar at a time.

---

# Duration

Recommended display duration:

- Success: 3–4 seconds
- Information: 3–5 seconds
- Warning: 4–5 seconds
- Error: 5–6 seconds

Users should have enough time to read the message before it disappears.

---

# Actions

Snackbars may include one contextual action.

Examples:

- Undo
- Retry
- View
- Open

Actions should directly relate to the message.

---

# Positioning

Desktop

- Bottom-left or bottom-center.

Tablet

- Bottom-center.

Mobile

- Bottom of the screen above navigation bars.
- Must not block critical controls.

---

# Accessibility

Snackbars shall:

- Meet WCAG 2.1 AA.
- Support screen readers.
- Announce messages politely.
- Maintain sufficient contrast.
- Not rely solely on color.

Users should have enough time to perceive the message before dismissal.

---

# Responsive Behavior

Desktop

- Compact width.
- Positioned above page content.

Tablet

- Moderate width.

Mobile

- Nearly full-width with safe margins.
- Maintain comfortable touch targets.

---

# Design Tokens

Snackbars consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Radius Tokens
- Shadow Tokens
- Motion Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular Snackbars should:

- Reuse a shared Snackbar service.
- Consume centralized SCSS tokens.
- Support configurable variants.
- Support optional actions.

Recommended location:

shared/components/snackbar/

---

# Flutter Implementation

Flutter Snackbars should:

- Reuse shared Snackbar widgets.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.
- Support configurable actions.

Recommended location:

shared/widgets/snackbar/

---

# Related Components

- Alerts – for persistent page-level messages.
- Dialogs – when confirmation is required.
- Toasts – for lightweight notifications without actions.
- Loading States – for ongoing operations.

---

# Implementation Checklist

- [ ] Uses approved Design Tokens
- [ ] Supports WCAG 2.1 AA
- [ ] Responsive across all breakpoints
- [ ] Reusable shared component
- [ ] Auto-dismisses appropriately
- [ ] Supports one optional action
- [ ] Matches Brand Guidelines
- [ ] Matches Design System

---

# Do

✔ Confirm completed actions.

✔ Keep messages short.

✔ Provide Undo when applicable.

✔ Display one Snackbar at a time.

✔ Reuse shared Snackbar components.

---

# Don't

✘ Require user decisions.

✘ Display long messages.

✘ Stack multiple Snackbars.

✘ Replace Dialogs with Snackbars.

✘ Create undocumented variants.

---

# eBPCO Examples

Business Registration

- Business registered successfully.

Permit Applications

- Application submitted.
- Draft saved.

Payments

- Payment receipt uploaded.
- Retry upload.

Profile

- Profile updated.
- Password changed.

Notifications

- Notification marked as read.

---

# AI Development Guidelines

AI-generated Snackbars must:

- Reuse documented components.
- Consume Design Tokens.
- Preserve accessibility.
- Keep messages concise.
- Avoid undocumented variants.

---

# Governance

All Snackbar implementations within the eBPCO ecosystem shall comply with this specification.

New Snackbar variants require UI/UX approval before implementation.

---

# Approval

Project

Electronic Business Permit and Clearance Office (eBPCO)

Platforms

- Angular Web Administration Portal
- Flutter Mobile Application

Status

Approved

Version

1.0.0