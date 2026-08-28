# Segmented Controls

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Selection & Actions

---

# Purpose

Segmented Controls allow users to choose one option from a small set of closely related choices displayed within a single control.

Unlike Radio Buttons, Segmented Controls provide immediate visual switching between views, modes, or filters without occupying additional vertical space.

This specification applies to both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Segmented Controls should:

- Allow a single selection from a limited number of options.
- Provide immediate visual feedback.
- Enable quick switching between related views or modes.
- Support accessibility requirements.
- Consume approved Design Tokens.
- Be implemented as reusable shared components.

---

# Usage

Use Segmented Controls when users need to quickly switch between a small number of mutually exclusive options.

Recommended examples:

- List / Grid View
- Active / Inactive Records
- Monthly / Yearly Reports
- Pending / Approved / Rejected Applications
- Personal / Business Information
- Light / Dark Theme Preview

Segmented Controls should never replace navigation menus or tabs with many options.

---

# Anatomy

A Segmented Control consists of:

- Control Container
- Individual Segments
- Selected Indicator
- Labels or Icons
- Focus Indicator

Example

+------------------------------------------------+
| Pending | Approved | Rejected                  |
+------------------------------------------------+

---

# Variants

## Text Segmented Control

Uses text labels only.

Recommended for:

- Status Filters
- View Modes
- Categories

---

## Icon Segmented Control

Uses icons only.

Recommended for:

- List / Grid View
- Calendar View
- Display Modes

Icons should always remain recognizable without relying solely on color.

---

## Icon and Text Segmented Control

Uses both icons and labels.

Recommended when additional clarity is required.

---

# Behavior

Segmented Controls should:

- Allow only one selected segment.
- Immediately update the associated content.
- Display clear visual feedback.
- Preserve the selected state until changed.
- Support keyboard interaction.

Selecting a new segment automatically deselects the previously selected segment.

---

# States

Every Segmented Control supports:

## Default

No interaction is occurring.

---

## Selected

The active segment is highlighted.

Only one segment may be selected.

---

## Hover (Web)

Displayed when the pointer is over a segment.

Provides subtle visual feedback.

---

## Focus

Displayed during keyboard navigation.

Must remain clearly visible.

---

## Disabled

The entire control or an individual segment is unavailable.

Disabled Segments should:

- Remain readable.
- Clearly indicate unavailable interaction.
- Prevent selection.

---

# Labels

Segment labels should:

- Be concise.
- Clearly describe each option.
- Remain understandable without additional explanation.

Preferred

- Pending
- Approved
- Rejected
- List
- Grid

Avoid

- Option 1
- Tab A
- Mode X

---

# Selection Rules

Segmented Controls should:

- Contain between two and five options.
- Use equal-width segments whenever possible.
- Display one active selection at all times unless business rules allow no selection.

---

# Accessibility

Segmented Controls shall:

- Meet WCAG 2.1 AA.
- Support keyboard navigation.
- Support screen readers.
- Include visible focus indicators.
- Maintain sufficient color contrast.
- Associate labels programmatically.

Keyboard interaction

Tab

Move focus to the control.

Arrow Keys

Move between segments.

Space

Select focused segment.

Enter

Activate focused segment.

Selection should never rely solely on color.

---

# Responsive Behavior

Desktop

- Horizontal layout preferred.
- Hover states supported.
- Equal segment widths recommended.

Tablet

- Maintain spacing and readability.
- Preserve horizontal layout whenever possible.

Mobile

- Larger touch targets.
- Maintain equal segment widths.
- Respect safe areas.

Minimum touch targets

Angular Web

40 × 40 px

Flutter

48 × 48 logical pixels

---

# Design Tokens

Segmented Controls consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Motion Tokens
- Size Tokens
- Border Tokens
- State Tokens

Hardcoded visual values are prohibited.

---

# Angular Implementation

Angular Segmented Controls should:

- Reuse shared Segmented Control components.
- Consume centralized SCSS Design Tokens.
- Support keyboard navigation.
- Support disabled state.
- Integrate with Angular Signals or Reactive Forms when applicable.

Recommended location

src/app/shared/components/segmented-control/

Example

EbpcSegmentedControlComponent

---

# Flutter Implementation

Flutter Segmented Controls should:

- Reuse shared Segmented Control widgets.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.
- Support Material state behavior.

Recommended location

lib/shared/widgets/segmented_control/

Example

EbpcSegmentedControl

---

# Related Components

- Radio Buttons
- Tabs
- Buttons
- Button Groups
- Filters

---

# Implementation Checklist

- [ ] Uses approved Design Tokens
- [ ] Supports single selection
- [ ] Supports keyboard navigation
- [ ] Meets WCAG 2.1 AA
- [ ] Supports disabled state
- [ ] Responsive across breakpoints
- [ ] Reuses shared component
- [ ] Matches Brand Guidelines
- [ ] Matches Design System

---

# Do

✔ Use Segmented Controls for switching between closely related views.

✔ Keep labels concise.

✔ Use equal-width segments whenever possible.

✔ Display one clearly selected segment.

✔ Support keyboard navigation.

---

# Don't

✘ Use more than five segments.

✘ Replace primary navigation with Segmented Controls.

✘ Depend solely on color to communicate selection.

✘ Mix unrelated options.

✘ Create undocumented Segmented Control styles.

---

# eBPCO Examples

## Application Status

Pending | Approved | Rejected

---

## Record View

List | Grid

---

## Report Period

Monthly | Yearly

---

## Profile Section

Personal | Business

---

# AI Development Guidelines

AI-generated Segmented Control components must:

- Reuse approved shared Segmented Control components.
- Consume Design Tokens.
- Preserve accessibility.
- Support keyboard navigation.
- Avoid undocumented styling.
- Keep Angular and Flutter implementations behaviorally consistent.
- Ensure only one segment is selected at any time.

---

# Governance

All Segmented Control implementations within the eBPCO ecosystem shall comply with this specification.

Changes to Segmented Control variants, interaction behavior, accessibility requirements, or implementation patterns require UI/UX approval before implementation.

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