# Menus

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Navigation

---

# Purpose

Menus provide contextual access to actions, commands, and secondary navigation without permanently occupying screen space.

Menus help keep interfaces clean by presenting only the actions that are relevant to the current context.

This specification applies to both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Menus should:

- Organize contextual actions.
- Reduce visual clutter.
- Present actions only when needed.
- Support accessibility.
- Consume approved Design Tokens.

---

# Usage

Use Menus for:

- Overflow actions
- Contextual item actions
- User account actions
- Table row actions
- Filtering and sorting options
- Quick settings

Recommended eBPCO examples:

- View Details
- Edit
- Download
- Print
- Archive
- Delete
- Export
- Logout

Menus should not replace primary navigation.

---

# Anatomy

A Menu consists of:

- Trigger
- Menu Container
- Menu Items
- Optional Icons
- Optional Dividers
- Optional Nested Menus

Example

⋮

------------------------
👁 View Details

✏ Edit

⬇ Download

------------------------

🗑 Delete

---

# Variants

## Overflow Menu

Triggered from an icon.

Recommended icon:

⋮ (Vertical Ellipsis)

Used for page-level actions.

---

## Context Menu

Appears for a selected object.

Examples:

Business

Permit

Payment

User

Recommended for desktop.

---

## Account Menu

Displayed from the user profile.

Typical items:

Profile

Settings

Help

Logout

---

## Dropdown Menu

Attached to buttons or inputs.

Examples:

Filter

Sort

Export

---

## Nested Menu

Displays grouped submenus.

Recommended only when necessary.

Avoid more than one nesting level.

---

# Behavior

Menus should:

- Open adjacent to the trigger.
- Close after an action is selected.
- Close when users click or tap outside.
- Reposition automatically if near screen edges.
- Animate subtly.

Menus should never obscure the trigger completely.

---

# Menu Items

Menu items should:

- Be concise.
- Use sentence case or title case consistently.
- Include icons only when they improve recognition.
- Group related actions together.

---

# Dividers

Use dividers to separate groups of actions.

Example

View

Edit

------------

Download

Export

------------

Delete

Avoid excessive separators.

---

# Destructive Actions

Destructive actions should:

- Be visually distinguished.
- Appear last.
- Require confirmation when appropriate.

Examples

Delete Business

Cancel Permit

Remove User

Confirmation Dialogs should be displayed before irreversible actions.

---

# Accessibility

Menus shall:

- Meet WCAG 2.1 AA.
- Support keyboard navigation.
- Provide visible focus indicators.
- Support screen readers.
- Maintain sufficient contrast.
- Close using the Escape key on desktop.

---

# Responsive Behavior

## Desktop

- Display beside the trigger.
- Support hover and keyboard navigation where appropriate.

## Tablet

- Increase touch targets.
- Preserve menu hierarchy.

## Mobile

- Display touch-friendly menu items.
- Use bottom sheets when many actions are available.
- Respect safe areas.

---

# Design Tokens

Menus consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Motion Tokens
- Elevation Tokens
- Radius Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular Menus should:

- Be reusable shared components.
- Integrate with Angular Material Menu or an approved equivalent.
- Consume centralized SCSS tokens.
- Support icons, dividers, and nested menus.

Recommended location:

shared/components/navigation/menu/

---

# Flutter Implementation

Flutter Menus should:

- Reuse shared PopupMenuButton or approved custom menu widgets.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.
- Use bottom sheets for large action lists.

Recommended location:

shared/widgets/navigation/menu/

---

# Related Components

- App Bar – hosts overflow and account menus.
- Drawer – secondary navigation.
- Sidebar – primary desktop navigation.
- Dialogs – confirm destructive actions.
- Tables – row-level action menus.

---

# Implementation Checklist

- [ ] Uses approved Design Tokens
- [ ] Supports WCAG 2.1 AA
- [ ] Responsive across supported breakpoints
- [ ] Reusable shared component
- [ ] Closes appropriately after actions
- [ ] Separates destructive actions
- [ ] Matches Brand Guidelines
- [ ] Matches Design System

---

# Do

✔ Keep menus concise.

✔ Group related actions.

✔ Use icons consistently.

✔ Confirm destructive actions.

✔ Reuse the shared Menu component.

---

# Don't

✘ Use Menus for primary navigation.

✘ Overcrowd menus with unrelated actions.

✘ Hide critical workflows inside menus.

✘ Place destructive actions first.

✘ Create undocumented Menu variants.

---

# eBPCO Examples

## Business Record

- View Details
- Edit
- Download Certificate
- Archive
- Delete

---

## Permit Application

- View
- Print
- Download
- Cancel Application

---

## Reports

- Export PDF
- Export Excel
- Print

---

## User Account

- My Profile
- Settings
- Help
- Logout

---

# AI Development Guidelines

AI-generated Menus must:

- Reuse documented components.
- Consume Design Tokens.
- Preserve accessibility.
- Group related actions logically.
- Require confirmation before destructive actions.
- Avoid undocumented layouts or menu structures.

---

# Governance

All Menu implementations within the eBPCO ecosystem shall comply with this specification.

Changes to Menu variants, grouping, or behaviors require UI/UX approval before implementation.

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
