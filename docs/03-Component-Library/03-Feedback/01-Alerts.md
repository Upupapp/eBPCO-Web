# Alerts

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Feedback

---

# Purpose

Alerts communicate important information, warnings, errors, or confirmations that require user awareness but do not necessarily require an immediate response.

Alerts should be noticeable without unnecessarily interrupting the user's workflow.

This specification applies to both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Alerts should:

- Clearly communicate important information.
- Match the severity of the message.
- Help users recover from problems.
- Encourage informed decisions.
- Support accessibility.
- Consume approved Design Tokens.

---

# Usage

Use Alerts when users should be informed of:

- Successful operations
- Important announcements
- Validation issues
- Warning conditions
- System errors
- Maintenance notices

Common eBPCO examples include:

- Permit successfully approved
- Payment verification pending
- Scheduled maintenance announcement
- Missing required documents
- Network connectivity issues

Avoid using Alerts for temporary confirmations. Use Snackbars or Toasts instead.

---

# Anatomy

A standard Alert consists of:

- Severity Icon
- Title (optional)
- Message
- Optional Actions
- Optional Close Button

Example:

+-----------------------------------------------------------+
| ⚠ Missing Required Documents                              |
|                                                           |
| Please upload your Barangay Clearance before submitting. |
|                                                           |
| [Upload Document]              [Dismiss]                  |
+-----------------------------------------------------------+

---

# Variants

## Information Alert

Communicates general information.

Examples:

- Office Holiday Notice
- New Feature Announcement
- Scheduled Maintenance

---

## Success Alert

Confirms successful completion.

Examples:

- Permit Approved
- Profile Updated
- Payment Recorded

---

## Warning Alert

Highlights situations requiring attention.

Examples:

- Permit Expiring Soon
- Missing Documents
- Incomplete Application

---

## Error Alert

Communicates failures that require user action.

Examples:

- Payment Failed
- Network Error
- Unable to Submit Application

---

# Severity Guidelines

Severity shall match message importance.

| Severity | Purpose | Example |
|----------|---------|---------|
| Information | General information | "System maintenance begins at 6 PM." |
| Success | Completed action | "Application submitted successfully." |
| Warning | Attention required | "Your permit expires in 7 days." |
| Error | Action required | "Unable to process your payment." |

---

# States

Alerts shall support:

- Default
- Dismissed
- Expanded (optional)
- Collapsed (optional)
- Disabled (rare)

State transitions shall follow Motion guidelines.

---

# Behavior

Alerts should:

- Appear immediately when relevant.
- Remain visible until dismissed if important.
- Preserve layout stability.
- Avoid stacking excessive alerts.
- Never block essential workflows unless absolutely necessary.

---

# Actions

Alerts may include contextual actions.

Examples:

- Retry
- Upload Document
- View Details
- Update Information
- Contact Support

Actions should be directly related to resolving the alert.

---

# Dismissibility

Alerts may be:

## Dismissible

Recommended for:

- Informational messages
- Success confirmations
- Announcements

---

## Persistent

Recommended for:

- Critical errors
- Required actions
- Compliance notices

Persistent alerts should disappear only when the issue is resolved or no longer relevant.

---

# Content Guidelines

Alert messages should:

- Use clear language.
- Explain the issue.
- Suggest the next step.
- Avoid technical jargon.

Preferred:

```
Your application cannot be submitted because the Fire Safety Certificate is missing.
```

Avoid:

```
Validation Error #402
```

---

# Accessibility

Alerts shall:

- Meet WCAG 2.1 AA.
- Use semantic alert roles.
- Support screen readers.
- Maintain sufficient color contrast.
- Avoid relying solely on color.
- Include meaningful icons.

Critical alerts should be announced automatically by assistive technologies.

---

# Responsive Behavior

Desktop

- Display inline within page content.
- Avoid covering important UI.

Tablet

- Maintain readable width.

Mobile

- Display full-width within safe margins.
- Wrap long messages naturally.
- Keep actions easily tappable.

---

# Design Tokens

Alerts consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Radius Tokens
- Shadow Tokens
- Motion Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular Alerts should:

- Reuse shared Alert components.
- Consume centralized SCSS tokens.
- Support configurable severity variants.
- Support optional actions and dismissal.

Recommended location:

shared/components/alert/

---

# Flutter Implementation

Flutter Alerts should:

- Reuse shared Alert widgets.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.
- Support configurable severity variants.

Recommended location:

shared/widgets/alerts/

---

# Related Components

- Dialogs – when user confirmation or a decision is required.
- Snackbars – for temporary confirmations with optional actions.
- Toasts – for lightweight, non-critical notifications.
- Error States – for page-level or feature-level failures.

---

# Implementation Checklist

- [ ] Uses approved Design Tokens
- [ ] Supports WCAG 2.1 AA
- [ ] Responsive across all breakpoints
- [ ] Reusable shared component
- [ ] Supports semantic severity variants
- [ ] Supports optional actions
- [ ] Supports dismissal where appropriate
- [ ] Matches Brand Guidelines
- [ ] Matches Design System

---

# Do

✔ Match alert severity to the message.

✔ Keep messages concise and actionable.

✔ Include recovery actions when possible.

✔ Use semantic colors and icons.

✔ Reuse shared Alert components.

---

# Don't

✘ Use alerts for every notification.

✘ Display multiple competing alerts.

✘ Use technical error codes as user-facing messages.

✘ Hardcode colors or spacing.

✘ Create undocumented Alert variants.

---

# eBPCO Examples

Business Registration

- Missing Business Name
- Duplicate Business Detected

Permit Applications

- Required Documents Missing
- Application Approved

Payments

- Payment Verification Pending
- Payment Failed

Administration

- User Account Disabled
- Role Updated Successfully

System

- Scheduled Maintenance
- Network Connection Lost

---

# AI Development Guidelines

AI-generated Alerts must:

- Reuse documented components.
- Consume Design Tokens.
- Preserve accessibility.
- Match the appropriate severity.
- Provide actionable messaging.
- Avoid undocumented variants.

---

# Governance

All Alert implementations within the eBPCO ecosystem shall comply with this specification.

New Alert variants require UI/UX approval and documentation before implementation.

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