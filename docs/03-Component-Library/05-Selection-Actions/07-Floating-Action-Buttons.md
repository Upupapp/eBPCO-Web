# Floating Action Buttons

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Selection & Actions

---

# Purpose

Floating Action Buttons (FABs) represent the primary action available on a screen. They are visually prominent and remain accessible while users interact with page content.

FABs should be used sparingly and only when there is a single, high-priority action users are expected to perform frequently.

This specification applies to both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Floating Action Buttons should:

- Emphasize the primary screen action.
- Remain easily accessible during interaction.
- Provide immediate visual feedback.
- Support accessibility requirements.
- Consume approved Design Tokens.
- Be implemented as reusable shared components.

---

# Usage

Use Floating Action Buttons only when a screen has one dominant action.

Recommended examples:

- New Business Permit Application
- Create Announcement
- Add Employee
- Upload Document
- Add Inspection Record
- Create User

Avoid using FABs for secondary or destructive actions.

---

# Anatomy

A Floating Action Button consists of:

- Circular Container
- Icon
- Optional Label (Extended FAB)
- Elevation
- Focus Indicator

Example

+------------------+
|        (+)       |
+------------------+

---

# Variants

## Standard FAB

Contains a single icon representing the primary action.

Recommended for:

- Create
- Add
- Upload

---

## Extended FAB

Contains an icon and descriptive label.

Example

+ New Application

Recommended when additional context improves usability.

---

## Mini FAB

A smaller version of the standard FAB.

Use only where screen space is limited.

---

# Behavior

Floating Action Buttons should:

- Trigger one primary action.
- Remain visible while users navigate the page.
- Display immediate visual feedback.
- Support keyboard interaction.
- Animate smoothly when appearing or disappearing.

Only one primary FAB should appear on a screen.

---

# States

Every Floating Action Button supports:

## Default

Ready for interaction.

---

## Hover (Web)

Displayed when the cursor is over the FAB.

Provides subtle elevation or color feedback.

---

## Pressed

Displayed while the FAB is being activated.

---

## Focus

Displayed during keyboard navigation.

Must remain clearly visible.

---

## Disabled

Displayed when the action is unavailable.

Disabled FABs should:

- Prevent interaction.
- Clearly communicate unavailable state.

---

# Icons

FAB icons should:

- Clearly represent the action.
- Use approved iconography.
- Remain recognizable without text.

Preferred

- +
- Upload
- Edit
- Camera

Avoid

- Decorative icons
- Ambiguous symbols

---

# Placement

Desktop

- Bottom-right corner.
- Consistent margin from screen edges.

Mobile

- Bottom-right above navigation elements.
- Respect safe areas.
- Avoid covering important content.

Only one FAB should exist per screen.

---

# Accessibility

Floating Action Buttons shall:

- Meet WCAG 2.1 AA.
- Support keyboard navigation.
- Support screen readers.
- Include visible focus indicators.
- Maintain sufficient color contrast.
- Provide descriptive accessibility labels.

Keyboard interaction

Tab

Move focus

Enter

Activate FAB

Space

Activate FAB

---

# Responsive Behavior

Desktop

- Fixed position.
- Hover supported.

Tablet

- Maintain spacing from screen edges.

Mobile

- Respect safe areas.
- Avoid overlapping navigation bars.

Minimum touch targets

Angular Web

48 × 48 px

Flutter

56 × 56 logical pixels

---

# Design Tokens

Floating Action Buttons consume:

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

Angular Floating Action Buttons should:

- Reuse shared FAB components.
- Consume centralized SCSS Design Tokens.
- Support icons and extended labels.
- Support disabled state.

Recommended location

src/app/shared/components/floating-action-button/

Example

EbpcFloatingActionButtonComponent

---

# Flutter Implementation

Flutter Floating Action Buttons should:

- Reuse shared FAB widgets.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.
- Support Material motion and elevation.

Recommended location

lib/shared/widgets/floating_action_button/

Example

EbpcFloatingActionButton

---

# Related Components

- Buttons
- Icon Buttons
- Speed Dials
- Dialogs

---

# Implementation Checklist

- [ ] Uses approved Design Tokens
- [ ] Supports keyboard navigation
- [ ] Meets WCAG 2.1 AA
- [ ] Supports disabled state
- [ ] Responsive across breakpoints
- [ ] Reuses shared component
- [ ] Matches Brand Guidelines
- [ ] Matches Design System

---

# Do

✔ Use FABs for one primary action.

✔ Keep icons recognizable.

✔ Maintain consistent placement.

✔ Support keyboard interaction.

✔ Use Extended FABs when labels improve clarity.

---

# Don't

✘ Display multiple primary FABs.

✘ Use FABs for destructive actions.

✘ Cover important content.

✘ Depend solely on color.

✘ Create undocumented FAB styles.

---

# eBPCO Examples

## New Business Permit

(+)

---

## Upload Supporting Documents

Upload

---

## Add Inspection Record

(+)

---

## Create User

(+)

---

# AI Development Guidelines

AI-generated Floating Action Button components must:

- Reuse approved shared FAB components.
- Consume Design Tokens.
- Preserve accessibility.
- Support approved animations.
- Avoid undocumented styling.
- Keep Angular and Flutter implementations behaviorally consistent.
- Ensure only one primary FAB exists per screen.

---

# Governance

All Floating Action Button implementations within the eBPCO ecosystem shall comply with this specification.

Changes to Floating Action Button variants, placement, accessibility requirements, or implementation patterns require UI/UX approval before implementation.

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