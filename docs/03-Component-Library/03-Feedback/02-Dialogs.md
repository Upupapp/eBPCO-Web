# Dialogs

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Feedback

---

# Purpose

Dialogs are modal components that interrupt the current workflow to request user attention, confirmation, or additional input before continuing.

Dialogs should only be used when a user decision is required or when important information must not be overlooked.

This specification applies to both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Dialogs should:

- Request user confirmation.
- Prevent accidental actions.
- Present critical information.
- Collect focused input.
- Support accessibility.
- Consume approved Design Tokens.

---

# Usage

Use Dialogs when users must:

- Confirm destructive actions.
- Confirm submissions.
- Approve or reject requests.
- Review important information.
- Complete short forms.
- Acknowledge critical notices.

Examples in eBPCO:

- Submit Business Permit Application
- Delete Uploaded Document
- Cancel Application
- Approve Payment
- Logout Confirmation
- Exit Without Saving

Avoid using Dialogs for non-critical notifications. Use Snackbars or Toasts instead.

---

# Anatomy

A Dialog consists of:

- Header
- Optional Icon
- Title
- Body Content
- Primary Action
- Secondary Action
- Close Button (optional)

Example

+--------------------------------------+
| ⚠ Confirm Submission                 |
|--------------------------------------|
| Are you sure you want to submit your |
| Business Permit Application?         |
|                                      |
| [Cancel]          [Submit]           |
+--------------------------------------+

---

# Variants

## Confirmation Dialog

Requests confirmation before continuing.

Examples:

- Submit Application
- Delete Business
- Logout

---

## Information Dialog

Displays important information.

Examples:

- Terms and Conditions
- Privacy Notice
- Payment Instructions

---

## Form Dialog

Collects a small amount of information.

Examples:

- Rename Business
- Add Note
- Enter OTP

Long or complex forms should use dedicated pages instead of dialogs.

---

## Success Dialog

Confirms successful completion.

Examples:

- Application Submitted
- Payment Verified
- Permit Approved

---

## Error Dialog

Communicates blocking errors.

Examples:

- Unable to Submit
- Payment Failed
- Session Expired

---

# Behavior

Dialogs should:

- Appear centered.
- Dim the background.
- Trap keyboard focus.
- Prevent interaction with the underlying page.
- Close only through intended actions.

---

# Actions

Dialogs should contain no more than two primary actions.

Recommended:

Primary Action

Secondary Action

Examples:

Cancel | Submit

No | Yes

Close | Retry

Button labels should clearly describe the action.

Avoid generic labels such as "OK" when a more descriptive label is possible.

---

# Dismissal

Dialogs may be dismissed by:

- Primary action
- Secondary action
- Close button (if available)
- Escape key (Desktop, when appropriate)
- Tapping outside only for non-critical dialogs

Critical dialogs should require an explicit user decision.

---

# Content Guidelines

Dialog content should:

- Clearly explain the purpose.
- Be concise.
- Focus on a single decision.
- Avoid technical language.
- State the consequences of the action.

Preferred:

"Deleting this business record cannot be undone."

Avoid:

"Delete?"

---

# Accessibility

Dialogs shall:

- Meet WCAG 2.1 AA.
- Use semantic dialog roles.
- Trap keyboard focus.
- Restore focus when closed.
- Support screen readers.
- Maintain sufficient color contrast.

---

# Responsive Behavior

Desktop

- Centered modal.
- Fixed maximum width.

Tablet

- Moderate width with comfortable spacing.

Mobile

- Full-width or bottom-sheet style where appropriate.
- Buttons should remain easily tappable.

---

# Design Tokens

Dialogs consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Radius Tokens
- Shadow Tokens
- Motion Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular Dialogs should:

- Reuse shared Dialog components.
- Consume centralized SCSS tokens.
- Support configurable variants.
- Support dynamic content.

Recommended location:

shared/components/dialog/

---

# Flutter Implementation

Flutter Dialogs should:

- Reuse shared Dialog widgets.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.
- Support configurable actions.

Recommended location:

shared/widgets/dialogs/

---

# Related Components

- Alerts – for persistent page-level messages.
- Snackbars – for temporary confirmations.
- Toasts – for lightweight notifications.
- Error States – for page-level failures.

---

# Implementation Checklist

- [ ] Uses approved Design Tokens
- [ ] Supports WCAG 2.1 AA
- [ ] Responsive across all breakpoints
- [ ] Reusable shared component
- [ ] Traps keyboard focus
- [ ] Supports semantic dialog roles
- [ ] Supports configurable actions
- [ ] Matches Brand Guidelines
- [ ] Matches Design System

---

# Do

✔ Require confirmation for destructive actions.

✔ Keep dialog content concise.

✔ Use descriptive action labels.

✔ Focus on one decision at a time.

✔ Reuse shared Dialog components.

---

# Don't

✘ Stack multiple dialogs.

✘ Use dialogs for simple notifications.

✘ Display lengthy forms inside dialogs.

✘ Allow accidental dismissal of critical dialogs.

✘ Create undocumented dialog variants.

---

# eBPCO Examples

Business Registration

- Confirm Business Registration Submission

Permit Applications

- Submit Permit Application
- Cancel Application

Payments

- Confirm Payment Upload
- Retry Failed Payment

Administration

- Delete User
- Disable Account

Authentication

- Logout Confirmation
- Session Expired

---

# AI Development Guidelines

AI-generated Dialogs must:

- Reuse documented components.
- Consume Design Tokens.
- Preserve accessibility.
- Keep decisions clear and focused.
- Avoid undocumented variants.

---

# Governance

All Dialog implementations within the eBPCO ecosystem shall comply with this specification.

New Dialog variants require UI/UX approval before implementation.

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