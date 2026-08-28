# Error States

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Feedback

---

# Purpose

Error States communicate that requested content or functionality is temporarily unavailable due to an error while guiding users toward appropriate recovery actions.

Rather than displaying broken layouts, blank pages, or technical error messages, Error States explain the issue in a clear, user-friendly manner and provide actionable recovery options.

This specification applies to both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Error States should:

- Clearly communicate failures.
- Reduce user frustration.
- Offer recovery actions.
- Prevent confusion.
- Maintain accessibility.
- Consume approved Design Tokens.

---

# Usage

Use Error States when:

- Data cannot be retrieved.
- Network requests fail.
- Server responses fail.
- Required resources are unavailable.
- Pages cannot be displayed.
- Feature initialization fails.
- User sessions expire unexpectedly.

Examples in eBPCO:

- Unable to load businesses.
- Failed to retrieve permit applications.
- Payment history unavailable.
- Notifications failed to load.
- Dashboard statistics unavailable.

Error States should replace the affected content area rather than leaving incomplete layouts.

---

# Anatomy

An Error State consists of:

- Error Illustration or Icon
- Title
- Description
- Primary Recovery Action
- Optional Secondary Action

Example

+----------------------------------------------+
|                ⚠                             |
|                                              |
|      Unable to Load Applications             |
|                                              |
| We couldn't retrieve your permit             |
| applications at this time.                   |
|                                              |
| [Try Again]   [Go to Dashboard]              |
+----------------------------------------------+

---

# Variants

## Network Error

Displayed when connectivity prevents data retrieval.

Examples

- Internet unavailable.
- Connection timeout.
- Offline mode.

Recommended actions:

- Retry
- Check Connection

---

## Server Error

Displayed when the server cannot process a request.

Examples

- Internal server error.
- Service unavailable.
- Maintenance in progress.

Recommended actions:

- Retry
- Return Later

---

## Permission Error

Displayed when users lack authorization.

Examples

- Restricted feature.
- Administrator-only content.

Recommended actions:

- Go Back
- Contact Administrator

---

## Session Error

Displayed when authentication expires.

Examples

- Session expired.
- Login required.

Recommended actions:

- Login Again

---

## Not Found Error

Displayed when requested content no longer exists.

Examples

- Business record deleted.
- Permit not found.
- Notification unavailable.

Recommended actions:

- Return to List
- Dashboard

---

# Behavior

Error States should:

- Replace failed content.
- Explain the issue clearly.
- Preserve page layout.
- Offer recovery actions.
- Avoid exposing technical implementation details.

---

# Recovery Actions

Every Error State should include at least one recovery action.

Recommended actions:

- Try Again
- Refresh
- Go Back
- Return Home
- Login Again
- Contact Support

---

# Content Guidelines

Messages should:

- Use plain language.
- Explain what happened.
- Suggest what users should do next.
- Avoid technical terminology.

Preferred

"We couldn't load your payment history."

Avoid

"HTTP 500 Internal Server Error."

---

# Error Codes

If business requirements require displaying an error reference, use a friendly format.

Example

Reference Code: ERR-1024

Technical stack traces or exception messages must never be shown to end users.

---

# Accessibility

Error States shall:

- Meet WCAG 2.1 AA.
- Support screen readers.
- Maintain sufficient contrast.
- Avoid relying solely on color.
- Provide descriptive recovery actions.

---

# Responsive Behavior

Desktop

- Center within affected content area.
- Preserve surrounding layout.

Tablet

- Maintain proportional spacing.

Mobile

- Stack vertically.
- Ensure recovery buttons remain easy to tap.

---

# Design Tokens

Error States consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Illustration Tokens
- Motion Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular Error States should:

- Reuse shared Error State components.
- Consume centralized SCSS tokens.
- Support configurable messages, icons, and actions.

Recommended location:

shared/components/error-state/

---

# Flutter Implementation

Flutter Error States should:

- Reuse shared Error State widgets.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.
- Support configurable recovery actions.

Recommended location:

shared/widgets/error_state/

---

# Related Components

- Empty States – when no data exists.
- Loading States – while waiting for content.
- Alerts – for localized error messages.
- Dialogs – for blocking failures requiring user decisions.

---

# Implementation Checklist

- [ ] Uses approved Design Tokens
- [ ] Supports WCAG 2.1 AA
- [ ] Responsive across all breakpoints
- [ ] Reusable shared component
- [ ] Includes recovery actions
- [ ] Uses user-friendly messaging
- [ ] Matches Brand Guidelines
- [ ] Matches Design System

---

# Do

✔ Explain what happened.

✔ Offer meaningful recovery actions.

✔ Use friendly language.

✔ Maintain layout consistency.

✔ Reuse shared Error State components.

---

# Don't

✘ Display technical errors.

✘ Show blank pages.

✘ Expose stack traces.

✘ Leave users without recovery options.

✘ Create undocumented Error State variants.

---

# eBPCO Examples

Dashboard

- Unable to load dashboard statistics.

Business Registration

- Unable to retrieve registered businesses.

Permit Applications

- Failed to load applications.

Payments

- Payment history unavailable.

Notifications

- Notifications cannot be retrieved.

Authentication

- Session expired.

Documents

- Unable to retrieve uploaded files.

---

# AI Development Guidelines

AI-generated Error States must:

- Reuse documented components.
- Consume Design Tokens.
- Preserve accessibility.
- Include recovery actions.
- Avoid undocumented variants.

---

# Governance

All Error State implementations within the eBPCO ecosystem shall comply with this specification.

New Error State variants require UI/UX approval before implementation.

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