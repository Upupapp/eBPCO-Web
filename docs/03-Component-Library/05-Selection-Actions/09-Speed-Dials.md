# Speed Dials

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Selection & Actions

---

# Purpose

Speed Dials provide quick access to a group of related high-priority actions from a single Floating Action Button (FAB). When activated, the primary FAB expands to reveal multiple secondary actions.

Speed Dials should be used only when multiple related actions are frequently performed and displaying several Floating Action Buttons would create unnecessary visual clutter.

This specification applies to both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Speed Dials should:

- Organize multiple related actions under one control.
- Reduce interface clutter.
- Provide immediate access to frequently used actions.
- Support accessibility requirements.
- Consume approved Design Tokens.
- Be implemented as reusable shared components.

---

# Usage

Use Speed Dials when users need quick access to several related actions.

Recommended examples:

- Add Business
- Upload Document
- Scan QR Code
- Create Inspection
- Generate Report
- Create Announcement

Speed Dials should not replace primary navigation or contextual menus.

---

# Anatomy

A Speed Dial consists of:

- Primary Floating Action Button
- Expand / Collapse Animation
- Secondary Action Buttons
- Icons
- Optional Labels
- Focus Indicator

Example

```
          Upload
             ↑

Edit   ←   (+)   →   Add

          Delete
             ↓
```

---

# Variants

## Vertical Speed Dial

Secondary actions expand vertically.

Recommended for:

- Mobile applications
- Floating interfaces

---

## Horizontal Speed Dial

Secondary actions expand horizontally.

Recommended for:

- Desktop dashboards
- Wide layouts

---

## Radial Speed Dial

Secondary actions expand around the primary FAB.

Use only when supported by platform guidelines and when sufficient screen space is available.

---

# Behavior

Speed Dials should:

- Expand when the primary FAB is activated.
- Collapse after an action is selected.
- Allow only one Speed Dial to remain open at a time.
- Display smooth animations.
- Support keyboard interaction.

Clicking outside the Speed Dial should collapse the menu.

---

# States

Every Speed Dial supports:

## Collapsed

Only the primary FAB is visible.

---

## Expanded

Secondary actions are displayed.

---

## Hover (Web)

Displayed when the pointer is over the FAB or an action.

Provides subtle visual feedback.

---

## Focus

Displayed during keyboard navigation.

Must remain clearly visible.

---

## Disabled

Displayed when actions are unavailable.

Disabled actions should:

- Remain readable.
- Clearly communicate unavailable interaction.
- Prevent selection.

---

# Labels

Secondary action labels should:

- Clearly describe the action.
- Begin with an action verb.
- Be concise.

Preferred

- Add Business
- Upload
- Edit
- Generate Report
- Scan QR Code

Avoid

- Action 1
- Option A
- Execute

---

# Icons

Every secondary action should use an approved icon.

Icons should:

- Reinforce the action.
- Be recognizable.
- Remain consistent across platforms.

Examples

- Add
- Upload
- Edit
- Delete
- Print
- QR Scan

---

# Accessibility

Speed Dials shall:

- Meet WCAG 2.1 AA.
- Support keyboard navigation.
- Support screen readers.
- Include visible focus indicators.
- Maintain sufficient color contrast.
- Provide descriptive accessibility labels.

Keyboard interaction

Tab

Move focus.

Enter

Expand or collapse the Speed Dial.

Arrow Keys

Navigate between secondary actions.

Esc

Collapse the Speed Dial.

Selection state should never rely solely on color.

---

# Responsive Behavior

Desktop

- Vertical or horizontal layouts supported.
- Hover states supported.
- Maintain spacing between actions.

Tablet

- Preserve spacing.
- Maintain accessibility.

Mobile

- Vertical expansion preferred.
- Respect safe areas.
- Avoid covering important content.

Minimum touch targets

Angular Web

48 × 48 px

Flutter

56 × 56 logical pixels

---

# Design Tokens

Speed Dials consume:

- Color Tokens
- Typography Tokens
- Motion Tokens
- Elevation Tokens
- Shape Tokens
- Size Tokens
- State Tokens

Hardcoded visual values are prohibited.

---

# Angular Implementation

Angular Speed Dials should:

- Reuse shared Speed Dial components.
- Consume centralized SCSS Design Tokens.
- Support expand and collapse animations.
- Support keyboard navigation.
- Support disabled actions.

Recommended location

src/app/shared/components/speed-dial/

Example

EbpcSpeedDialComponent

EbpcSpeedDialActionComponent

---

# Flutter Implementation

Flutter Speed Dials should:

- Reuse shared Speed Dial widgets.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.
- Support Material motion and animations.

Recommended location

lib/shared/widgets/speed_dial/

Example

EbpcSpeedDial

EbpcSpeedDialAction

---

# Related Components

- Floating Action Buttons
- Buttons
- Icon Buttons
- Contextual Actions
- Menus

---

# Implementation Checklist

- [ ] Uses approved Design Tokens
- [ ] Supports expand and collapse behavior
- [ ] Supports keyboard navigation
- [ ] Meets WCAG 2.1 AA
- [ ] Supports disabled actions
- [ ] Responsive across breakpoints
- [ ] Reuses shared component
- [ ] Matches Brand Guidelines
- [ ] Matches Design System

---

# Do

✔ Use Speed Dials for multiple related primary actions.

✔ Keep action labels concise.

✔ Use approved icons.

✔ Display smooth animations.

✔ Support keyboard navigation.

---

# Don't

✘ Replace primary navigation with Speed Dials.

✘ Display unrelated actions together.

✘ Use multiple Speed Dials on the same screen.

✘ Depend solely on icons to communicate actions.

✘ Create undocumented Speed Dial styles.

---

# eBPCO Examples

## Permit Management

- Add Permit
- Upload Documents
- Generate Permit

---

## Inspection Management

- New Inspection
- Upload Photos
- Generate Report

---

## User Management

- Add User
- Reset Password
- Export Users

---

## Dashboard

- Create Announcement
- Upload File
- Generate Report

---

# AI Development Guidelines

AI-generated Speed Dial components must:

- Reuse approved shared Speed Dial components.
- Consume Design Tokens.
- Preserve accessibility.
- Support keyboard navigation.
- Support smooth expand and collapse animations.
- Avoid undocumented styling.
- Keep Angular and Flutter implementations behaviorally consistent.
- Ensure secondary actions are contextually related and limited to essential tasks.

---

# Governance

All Speed Dial implementations within the eBPCO ecosystem shall comply with this specification.

Changes to Speed Dial behavior, animation, accessibility requirements, placement, or implementation patterns require UI/UX approval before implementation.

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