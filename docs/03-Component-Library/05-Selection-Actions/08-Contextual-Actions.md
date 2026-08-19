# Contextual Actions

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Selection & Actions

---

# Purpose

Contextual Actions provide users with actions that are relevant only to a selected object, record, or current interface context.

Unlike primary navigation or global actions, Contextual Actions appear only when applicable, reducing visual clutter while improving workflow efficiency.

This specification applies to both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Contextual Actions should:

- Present only relevant actions.
- Reduce interface complexity.
- Improve workflow efficiency.
- Support accessibility requirements.
- Consume approved Design Tokens.
- Be implemented as reusable shared components.

---

# Usage

Use Contextual Actions when actions depend on a selected item or current context.

Recommended examples:

- Edit Permit
- Delete Record
- View Details
- Approve Application
- Reject Application
- Download Permit
- Print Certificate
- Archive Record

Avoid using Contextual Actions for global navigation or frequently accessed primary actions.

---

# Anatomy

A Contextual Action consists of:

- Trigger Element
- Action Menu or Action Buttons
- Icon (Optional)
- Label
- Focus Indicator

Example

+----------------------------------------------+
| Business Permit #2026-001              ⋮     |
+----------------------------------------------+

Selecting the action trigger displays a contextual menu.

---

# Variants

## Overflow Menu

Displays actions inside a menu triggered by an overflow icon.

Recommended for:

- Tables
- Lists
- Cards

---

## Inline Actions

Displays actions directly beside an item.

Recommended for:

- Data Tables
- Administrative Lists
- Management Dashboards

---

## Selection Toolbar

Appears after selecting one or more items.

Recommended for:

- Bulk Approval
- Bulk Deletion
- Export
- Archive

---

# Behavior

Contextual Actions should:

- Only appear when relevant.
- Display immediately after user interaction.
- Automatically close after action completion.
- Support keyboard navigation.
- Preserve focus after closing.

Unavailable actions should be disabled instead of hidden when appropriate.

---

# States

Every Contextual Action supports:

## Default

Ready for interaction.

---

## Hover (Web)

Displayed when the pointer is over the trigger or action.

Provides subtle visual feedback.

---

## Active

Displayed while the contextual menu is open.

---

## Focus

Displayed during keyboard navigation.

Must remain clearly visible.

---

## Disabled

Displayed when the action is unavailable.

Disabled actions should:

- Remain readable.
- Clearly communicate unavailable status.
- Prevent interaction.

---

# Labels

Action labels should:

- Clearly describe the action.
- Begin with an action verb.
- Remain concise.

Preferred

- Edit
- View
- Delete
- Approve
- Reject
- Download
- Print

Avoid

- Option
- Action
- Execute

---

# Icons

Icons may accompany action labels.

Icons should:

- Reinforce meaning.
- Use approved iconography.
- Never replace labels entirely unless universally recognized.

Examples

- Edit
- Delete
- Print
- Download
- Archive

---

# Accessibility

Contextual Actions shall:

- Meet WCAG 2.1 AA.
- Support keyboard navigation.
- Support screen readers.
- Include visible focus indicators.
- Maintain sufficient color contrast.
- Provide accessible labels for action triggers.

Keyboard interaction

Tab

Move focus.

Enter

Open contextual menu.

Arrow Keys

Navigate menu items.

Esc

Close menu.

---

# Responsive Behavior

Desktop

- Overflow menus preferred.
- Hover states supported.
- Inline actions may be displayed.

Tablet

- Increase spacing between actions.
- Preserve touch accessibility.

Mobile

- Larger touch targets.
- Overflow menus preferred.
- Respect safe areas.

Minimum touch targets

Angular Web

40 × 40 px

Flutter

48 × 48 logical pixels

---

# Design Tokens

Contextual Actions consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Motion Tokens
- Elevation Tokens
- State Tokens

Hardcoded visual values are prohibited.

---

# Angular Implementation

Angular Contextual Actions should:

- Reuse shared contextual menu components.
- Consume centralized SCSS Design Tokens.
- Support keyboard navigation.
- Support disabled actions.
- Integrate with Angular CDK Overlay where appropriate.

Recommended location

src/app/shared/components/contextual-actions/

Example

EbpcContextualActionsComponent

EbpcContextMenuComponent

---

# Flutter Implementation

Flutter Contextual Actions should:

- Reuse shared contextual menu widgets.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.
- Support Material menus.

Recommended location

lib/shared/widgets/contextual_actions/

Example

EbpcContextualActions

EbpcPopupMenu

---

# Related Components

- Buttons
- Icon Buttons
- Menus
- Data Tables
- Speed Dials

---

# Implementation Checklist

- [ ] Uses approved Design Tokens
- [ ] Supports keyboard navigation
- [ ] Meets WCAG 2.1 AA
- [ ] Supports disabled actions
- [ ] Responsive across breakpoints
- [ ] Reuses shared component
- [ ] Matches Brand Guidelines
- [ ] Matches Design System

---

# Do

✔ Show only relevant actions.

✔ Keep labels concise.

✔ Use approved icons.

✔ Preserve keyboard accessibility.

✔ Group related actions logically.

---

# Don't

✘ Display irrelevant actions.

✘ Hide destructive actions without confirmation.

✘ Depend solely on icons.

✘ Create undocumented contextual menus.

✘ Overload menus with excessive options.

---

# eBPCO Examples

## Permit Record

View

Edit

Download

Print

Delete

---

## Application Review

Approve

Reject

Request Revision

---

## User Management

View Profile

Reset Password

Disable Account

---

## Bulk Selection

Approve Selected

Archive Selected

Export Selected

---

# AI Development Guidelines

AI-generated Contextual Action components must:

- Reuse approved shared contextual menu components.
- Consume Design Tokens.
- Preserve accessibility.
- Support keyboard navigation.
- Avoid undocumented styling.
- Keep Angular and Flutter implementations behaviorally consistent.
- Display only contextually relevant actions.

---

# Governance

All Contextual Action implementations within the eBPCO ecosystem shall comply with this specification.

Changes to Contextual Action behavior, accessibility requirements, placement, or implementation patterns require UI/UX approval before implementation.

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