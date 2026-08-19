# Cards

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Data Display

---

# Purpose

Cards are reusable containers used to group related information and actions into a visually distinct unit.

Cards improve readability by organizing content into manageable sections while maintaining consistent spacing, hierarchy, and interaction patterns throughout the eBPCO ecosystem.

This specification applies to both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Cards should:

- Organize related information.
- Improve content hierarchy.
- Support reusable layouts.
- Accommodate actions when necessary.
- Adapt responsively across devices.
- Consume approved Design Tokens.

---

# Usage

Use Cards to display grouped information that users can quickly scan or interact with.

Common eBPCO examples include:

- Dashboard statistics
- Business profiles
- Permit application summaries
- Payment summaries
- Inspection records
- User profiles
- Notifications
- Report summaries

Avoid using Cards for long-form documents or highly tabular data.

---

# Anatomy

A standard Card may include:

- Header (optional)
- Title
- Subtitle (optional)
- Status Indicator (optional)
- Supporting Content
- Metadata (optional)
- Actions (optional)
- Footer (optional)

Example:

+----------------------------------------------------+
| Business Permit                                    |
| ABC Trading                                        |
| Retail Business                                    |
|                                                    |
| Status: Approved                                   |
| Last Updated: July 16, 2026                        |
|                                                    |
| [View Details]   [Download Permit]                 |
+----------------------------------------------------+

---

# Variants

## Standard Card

Displays related information within a bordered or elevated container.

Recommended for most use cases.

---

## Summary Card

Highlights a single metric or key value.

Example:

Active Permits

1,245

↑ 8% this month

Used on dashboards.

---

## Information Card

Displays descriptive content with minimal actions.

Example:

Business Information

Business Name

Owner

Address

Business Type

---

## Action Card

Contains one or more primary actions.

Example:

Pending Application

[Review]

[Approve]

---

## Interactive Card

Entire card is clickable.

Used for:

- Navigation
- Record selection
- Mobile list navigation

Interactive Cards shall provide visible hover and focus states.

---

## Expandable Card

Supports expanding and collapsing additional content.

Recommended for:

- Inspection Details
- Payment Breakdown
- Supporting Documents

---

# States

Cards shall support:

- Default
- Hover (Web)
- Focus
- Selected
- Expanded
- Collapsed
- Loading
- Disabled

State transitions shall follow Motion guidelines.

---

# Content Hierarchy

Cards should organize content in the following order:

1. Primary Title
2. Secondary Information
3. Status
4. Metadata
5. Actions

Users should immediately identify the primary purpose of the Card.

---

# Layout Guidelines

Cards should:

- Maintain consistent internal spacing.
- Avoid overcrowding.
- Align content predictably.
- Separate actions from content.
- Preserve visual hierarchy.

Actions should generally appear:

- Bottom Right (Desktop)
- Bottom (Mobile)

---

# Images and Icons

Cards may include:

- Icons
- Avatars
- Illustrations
- Business Logos

Images should support the content rather than dominate it.

---

# Status Indicators

Cards may display status using:

- Badges
- Chips
- Labels

Examples:

Approved

Pending

Rejected

Expired

Status colors shall use approved semantic Color Tokens.

---

# Loading State

When content is loading:

- Display Skeleton placeholders.
- Preserve layout stability.
- Avoid abrupt layout shifts.

Avoid showing empty Cards while loading.

---

# Empty State

If no information is available:

Display an informative placeholder.

Example:

No inspection records available.

---

# Accessibility

Cards shall:

- Meet WCAG 2.1 AA.
- Maintain sufficient color contrast.
- Support keyboard navigation when interactive.
- Display visible focus indicators.
- Provide semantic headings.

Interactive Cards should expose button or link semantics.

---

# Responsive Behavior

Desktop

- Display Cards within responsive grids.
- Support hover interactions.

Tablet

- Reduce grid columns.
- Preserve spacing.

Mobile

- Display full-width Cards.
- Stack internal content vertically.
- Increase touch target spacing.

---

# Design Tokens

Cards consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Radius Tokens
- Shadow Tokens
- Motion Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular Cards should:

- Reuse shared Card components.
- Consume centralized SCSS tokens.
- Accept projected content for flexibility.
- Separate presentation from business logic.

Recommended location:

shared/components/card/

---

# Flutter Implementation

Flutter Cards should:

- Reuse shared Card widgets.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.
- Compose content through reusable child widgets.

Recommended location:

shared/widgets/cards/

---

# Do

✔ Group related information.

✔ Keep layouts uncluttered.

✔ Maintain consistent spacing.

✔ Use semantic status indicators.

✔ Reuse shared Card components.

---

# Don't

✘ Nest Cards unnecessarily.

✘ Overload Cards with excessive actions.

✘ Hardcode spacing or colors.

✘ Display unrelated information together.

✘ Create undocumented Card variants.

---

# eBPCO Examples

Dashboard

- Total Businesses
- Active Permits
- Pending Applications

Business Registry

- Business Summary Card

Permit Application

- Application Overview

Payments

- Payment Summary

Inspections

- Inspection Result Summary

Reports

- Monthly Statistics

Notifications

- Notification Summary

---

# AI Development Guidelines

AI-generated Cards must:

- Follow documented layouts.
- Consume Design Tokens.
- Preserve accessibility.
- Support responsive layouts.
- Reuse shared components.
- Avoid undocumented variants.

---

# Governance

All Card implementations within the eBPCO ecosystem shall comply with this specification.

New Card variants require UI/UX approval and documentation before implementation.

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