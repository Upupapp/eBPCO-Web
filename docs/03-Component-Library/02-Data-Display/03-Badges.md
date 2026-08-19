# Badges

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Data Display

---

# Purpose

Badges are compact visual indicators that communicate the status, category, count, or priority of an item.

They provide users with immediate contextual information without requiring them to read detailed content.

This specification applies to both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Badges should:

- Communicate information at a glance.
- Improve visual scanning.
- Reinforce information hierarchy.
- Support accessibility.
- Consume approved Design Tokens.

---

# Usage

Use Badges to display concise metadata associated with an item.

Common eBPCO examples include:

- Permit Status
- Application Status
- Payment Status
- User Role
- Inspection Result
- Notification Count
- Priority Level

Badges should supplement content—not replace descriptive text where clarity is required.

---

# Anatomy

A Badge consists of:

- Background
- Label or Value
- Optional Icon

Example:

[ Approved ]

[ Pending ]

[ 12 ]

---

# Variants

## Status Badge

Represents the current state of an entity.

Examples:

- Approved
- Pending
- Rejected
- Expired
- Under Review

---

## Count Badge

Displays a numeric value.

Examples:

Messages

[5]

Notifications

[18]

Count Badges should display:

99+

when values exceed two digits.

---

## Category Badge

Identifies a classification.

Examples:

Retail

Wholesale

Food

Manufacturing

---

## Priority Badge

Represents urgency.

Examples:

Low

Medium

High

Critical

---

## Icon Badge

Combines an icon with text.

Example:

✔ Verified

⚠ Attention

Icons should enhance understanding rather than replace labels.

---

# States

Badges shall support:

- Default
- Disabled
- Selected (when interactive)

Badges are generally non-interactive unless explicitly used as filters.

---

# Color Usage

Status Badges shall use semantic Color Tokens.

Recommended mappings:

Success

Approved

Completed

Active

Warning

Pending

Under Review

Information

Processing

Draft

Error

Rejected

Failed

Expired

Neutral

Archived

Inactive

Unknown

Hardcoded colors are prohibited.

---

# Content Guidelines

Badge labels should:

- Be concise.
- Use plain language.
- Avoid abbreviations where possible.

Preferred:

Approved

Avoid:

Appr.

---

# Counts

Numeric badges should:

- Display positive integers only.
- Use "99+" for values exceeding 99.
- Update dynamically.

Avoid displaying extremely large values.

---

# Placement

Badges should appear near the information they describe.

Examples:

Business Card

ABC Trading

[Approved]

---

Permit Table

Application No.

Status

[Pending]

---

# Accessibility

Badges shall:

- Meet WCAG 2.1 AA.
- Maintain sufficient color contrast.
- Provide semantic labels when conveying status.
- Avoid relying solely on color.

Example:

✔ Approved

instead of only using a green background.

---

# Responsive Behavior

Desktop

- Maintain consistent sizing.
- Align with associated content.

Tablet

- Preserve readability.

Mobile

- Maintain touch-friendly spacing.
- Avoid truncating labels.

---

# Design Tokens

Badges consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Radius Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular Badges should:

- Reuse shared Badge components.
- Consume centralized SCSS tokens.
- Support semantic variants.

Recommended location:

shared/components/badge/

---

# Flutter Implementation

Flutter Badges should:

- Reuse shared Badge widgets.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.

Recommended location:

shared/widgets/badges/

---

# Do

✔ Keep labels concise.

✔ Use semantic colors.

✔ Display counts consistently.

✔ Position badges near relevant content.

✔ Reuse shared Badge components.

---

# Don't

✘ Display long sentences inside badges.

✘ Depend solely on color.

✘ Hardcode colors.

✘ Create undocumented badge styles.

✘ Use badges for primary content.

---

# eBPCO Examples

Business Registry

Approved

Inactive

Permit Applications

Pending

Under Review

Approved

Rejected

Payments

Paid

Pending

Overdue

Administration

Administrator

Staff

Inspector

Notifications

[5]

Reports

Draft

Published

Archived

---

# AI Development Guidelines

AI-generated Badges must:

- Reuse documented components.
- Consume Design Tokens.
- Preserve accessibility.
- Use semantic variants.
- Avoid undocumented styles.

---

# Governance

All Badge implementations within the eBPCO ecosystem shall comply with this specification.

New Badge variants require UI/UX approval and documentation before implementation.

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