# Button Groups

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Selection & Actions

---

# Purpose

Button Groups organize multiple related actions into a unified component, helping users understand that the actions belong to the same task or context.

They improve consistency, reduce visual clutter, and establish a clear action hierarchy.

This specification applies to both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Button Groups should:

- Group related actions logically.
- Clearly distinguish primary and secondary actions.
- Maintain consistent spacing and alignment.
- Support accessibility.
- Consume approved Design Tokens.
- Be implemented as reusable shared components.

---

# Usage

Use Button Groups when multiple actions relate to the same object, form, or workflow.

Recommended eBPCO examples:

- Save / Cancel
- Approve / Reject
- Continue / Back
- Download / Print
- Edit / Archive / Delete

Avoid using Button Groups for unrelated actions.

---

# Anatomy

A Button Group consists of:

- Group Container
- Primary Button
- Secondary Button(s)
- Optional Divider or Spacing
- Shared Alignment

Example

+-------------------------------------------+
| [Cancel]        [Save Changes]            |
+-------------------------------------------+

---

# Variants

## Horizontal Button Group

Buttons are displayed side by side.

Recommended for:

- Desktop
- Tablet
- Dialogs
- Forms

---

## Vertical Button Group

Buttons are stacked vertically.

Recommended for:

- Mobile
- Narrow layouts
- Full-width actions

---

## Mixed Priority Group

Contains one Primary Button and one or more Secondary or Tertiary Buttons.

Example

[Cancel]    [Save Draft]    [Submit]

Only one Primary Button should exist within a group.

---

## Equal Width Group

Each button occupies the same width.

Recommended for:

- Binary choices
- Segmented actions
- Mobile layouts

Example

[Approve] [Reject]

---

# Behavior

Button Groups should:

- Preserve the documented action hierarchy.
- Maintain consistent spacing.
- Align actions predictably.
- Prevent overlapping or wrapping where possible.
- Adapt responsively to available space.

Groups should not contain unrelated actions.

---

# Action Hierarchy

Recommended order

Desktop

[Secondary] [Primary]

Example

[Cancel] [Save Changes]

---

For destructive confirmations

[Keep Record] [Delete Record]

The destructive action should appear last.

---

Mobile

Recommended order

[Primary]

[Secondary]

[Cancel]

Actions should remain easy to reach using one-handed interaction.

---

# Alignment

Desktop

Right-aligned action groups are recommended for forms and dialogs.

Left alignment may be used for contextual actions.

---

Mobile

Prefer full-width stacked buttons.

Avoid crowded horizontal layouts.

---

# Spacing

Buttons within a group should maintain consistent spacing.

Recommended spacing should be defined using Spacing Tokens.

Hardcoded spacing values are prohibited.

---

# States

Each button within a group independently supports:

- Default
- Hover (Web)
- Focus
- Pressed
- Disabled
- Loading

The group itself should preserve layout when one button enters the loading state.

---

# Accessibility

Button Groups shall:

- Meet WCAG 2.1 AA.
- Preserve logical keyboard navigation.
- Support screen readers.
- Maintain visible focus indicators.
- Preserve action hierarchy.
- Provide sufficient touch targets.

The tab order should follow the visual order.

---

# Responsive Behavior

## Desktop

- Horizontal layout.
- Right-aligned for forms.
- Maintain spacing.

## Tablet

- Horizontal where space allows.
- Stack if necessary.

## Mobile

- Vertical layout.
- Full-width buttons.
- Respect safe areas.
- Avoid placing more than two buttons on one row.

---

# Design Tokens

Button Groups consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Radius Tokens
- Motion Tokens
- Size Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular Button Groups should:

- Reuse shared Button components.
- Support configurable layouts.
- Consume centralized SCSS Design Tokens.
- Preserve semantic button ordering.
- Support responsive layouts.

Recommended location:

src/app/shared/components/button-group/

---

# Flutter Implementation

Flutter Button Groups should:

- Reuse shared Button widgets.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.
- Support responsive vertical and horizontal layouts.

Recommended location:

lib/shared/widgets/button_group/

---

# Related Components

- Buttons
- Dialogs
- Stepper
- Forms
- Floating Action Buttons

---

# Implementation Checklist

- [ ] Uses approved Design Tokens
- [ ] Reuses shared Button components
- [ ] Supports responsive layouts
- [ ] Maintains action hierarchy
- [ ] Supports keyboard navigation
- [ ] Meets WCAG 2.1 AA
- [ ] Handles loading and disabled states
- [ ] Matches Brand Guidelines
- [ ] Matches Design System

---

# Do

✔ Use one Primary Button per group.

✔ Group only related actions.

✔ Preserve consistent spacing.

✔ Stack buttons vertically on mobile when needed.

✔ Keep destructive actions visually distinct.

---

# Don't

✘ Place multiple Primary Buttons in the same group.

✘ Mix unrelated actions.

✘ Hardcode spacing.

✘ Reverse the documented action hierarchy.

✘ Create undocumented layouts.

---

# eBPCO Examples

## Permit Application

[Back]    [Save Draft]    [Submit Application]

---

## Permit Review

[Request Revision]    [Approve Permit]

---

## Business Registration

[Cancel]    [Save Changes]

---

## User Management

[Reset Password]    [Delete User]

(Delete User should use the Destructive Button variant.)

---

# AI Development Guidelines

AI-generated Button Groups must:

- Reuse approved Button components.
- Consume Design Tokens.
- Preserve documented action hierarchy.
- Support responsive layouts.
- Maintain accessibility.
- Avoid undocumented group structures.
- Keep Angular and Flutter implementations behaviorally consistent.

---

# Governance

All Button Group implementations within the eBPCO ecosystem shall comply with this specification.

Changes to layout, hierarchy, spacing, or interaction behavior require UI/UX approval before implementation.

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