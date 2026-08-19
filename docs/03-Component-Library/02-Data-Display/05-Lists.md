# Lists

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Data Display

---

# Purpose

Lists present collections of related items in a clear, organized, and easily scannable format.

Unlike Tables, Lists prioritize readability over dense data presentation and are well-suited for navigation, activity feeds, notifications, recent records, and mobile interfaces.

This specification applies to both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Lists should:

- Present related items clearly.
- Support quick scanning.
- Encourage consistent navigation.
- Adapt gracefully across screen sizes.
- Consume approved Design Tokens.
- Support accessibility.

---

# Usage

Use Lists when displaying collections of items that do not require multiple data columns.

Common eBPCO examples include:

- Notifications
- Recent Applications
- Recent Payments
- Activity Timeline
- User Menus
- Business Activities
- Uploaded Documents
- Inspection Notes

Avoid using Lists when users need to compare multiple attributes simultaneously. Use Tables instead.

---

# Anatomy

A standard List Item may contain:

- Leading Icon or Avatar (optional)
- Primary Text
- Secondary Text (optional)
- Metadata (optional)
- Status Indicator (optional)
- Trailing Action (optional)
- Divider (optional)

Example:

---------------------------------------------------

📄 Business Permit

ABC Trading

Approved • July 16, 2026

>

---------------------------------------------------

---

# Variants

## Standard List

Displays simple collections of information.

---

## Navigation List

Each item navigates to another screen.

Examples:

- Dashboard
- Businesses
- Applications
- Payments
- Reports

---

## Information List

Displays read-only information.

Example:

Business Activities

• Retail

• Wholesale

• Distribution

---

## Action List

Each item performs an action.

Examples:

Download Permit

View Receipt

Upload Document

---

## Selection List

Allows one or multiple selected items.

Recommended for:

- Business Categories
- Permit Types
- Notification Preferences

---

## Expandable List

Allows additional information to be expanded beneath an item.

Recommended for:

- Inspection Notes
- Payment Breakdown
- Application Timeline

---

# States

Lists shall support:

- Default
- Hover (Web)
- Focus
- Selected
- Expanded
- Disabled
- Loading

State transitions shall follow Motion guidelines.

---

# Content Hierarchy

Each List Item should present information in the following order:

1. Primary Information
2. Supporting Information
3. Metadata
4. Status
5. Actions

Users should understand the item's purpose immediately.

---

# Dividers

Dividers should:

- Separate items visually.
- Maintain consistent spacing.
- Not appear after the final item unless required by the design.

---

# Leading Elements

List Items may include:

- Icons
- Avatars
- Business Logos
- Document Icons
- Status Indicators

Leading elements should support recognition rather than decoration.

---

# Trailing Elements

Trailing elements may include:

- Chevron
- Action Button
- Badge
- Timestamp
- Menu Button

Avoid placing excessive actions within a single List Item.

---

# Loading State

When loading:

- Display Skeleton List Items.
- Preserve layout stability.
- Avoid sudden content shifts.

---

# Empty State

When no items exist:

Display an informative placeholder.

Example:

No recent notifications.

---

# Accessibility

Lists shall:

- Meet WCAG 2.1 AA.
- Support screen readers.
- Display visible focus indicators.
- Maintain semantic structure.
- Preserve sufficient touch target sizes.

Interactive List Items should expose button or link semantics.

---

# Responsive Behavior

Desktop

- Support hover interactions.
- Display optional secondary actions.

Tablet

- Increase spacing for touch interaction.

Mobile

- Display full-width List Items.
- Stack metadata where appropriate.
- Maintain generous touch targets.

---

# Design Tokens

Lists consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Radius Tokens
- Motion Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular Lists should:

- Reuse shared List components.
- Consume centralized SCSS tokens.
- Separate presentation from business logic.

Recommended location:

shared/components/list/

---

# Flutter Implementation

Flutter Lists should:

- Reuse shared List widgets.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.
- Utilize ListView or SliverList where appropriate.

Recommended location:

shared/widgets/lists/

---

# Do

✔ Keep List Items concise.

✔ Maintain consistent spacing.

✔ Support loading and empty states.

✔ Use meaningful icons.

✔ Reuse shared List components.

---

# Don't

✘ Display excessive information in one item.

✘ Overload items with actions.

✘ Hardcode spacing or colors.

✘ Use Lists where Tables provide better comparison.

✘ Create undocumented List variants.

---

# eBPCO Examples

Dashboard

- Recent Permit Applications
- Latest Payments

Notifications

- System Alerts
- Permit Updates

Business Profile

- Business Activities
- Uploaded Documents

Administration

- User Menu
- Activity History

Reports

- Recent Reports

---

# AI Development Guidelines

AI-generated Lists must:

- Reuse documented components.
- Consume Design Tokens.
- Preserve accessibility.
- Support responsive layouts.
- Implement consistent spacing and hierarchy.
- Avoid undocumented variants.

---

# Governance

All List implementations within the eBPCO ecosystem shall comply with this specification.

New List variants require UI/UX approval and documentation before implementation.

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