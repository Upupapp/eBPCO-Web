# Radio Buttons

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Selection & Actions

---

# Purpose

Radio Buttons allow users to select exactly one option from a group of mutually exclusive choices.

Unlike Checkboxes, selecting one Radio Button automatically deselects any previously selected option within the same group.

This specification applies to both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Radio Buttons should:

- Allow only one selection within a group.
- Clearly communicate the currently selected option.
- Provide immediate visual feedback.
- Support accessibility requirements.
- Consume approved Design Tokens.
- Be implemented as reusable shared components.

---

# Usage

Use Radio Buttons when users must choose only one option from a predefined list.

Recommended examples:

- Payment Method
- Business Type
- Permit Delivery Option
- Gender Selection
- Inspection Schedule Preference
- Account Visibility

Radio Buttons should never be used when multiple selections are allowed.

---

# Anatomy

A Radio Button consists of:

- Radio Control
- Selection Indicator
- Label
- Optional Supporting Text
- Optional Validation Message
- Focus Indicator

Example

+-------------------------------------------+
| ◉ Online Payment                          |
+-------------------------------------------+

---

# Variants

## Standard Radio Button

Supports single-option selection within a group.

Recommended for:

- Payment Methods
- Business Types
- Delivery Options

---

## Radio Button Group

A collection of related Radio Buttons sharing a common heading.

Only one option may be selected at a time.

Example

Payment Method

◉ Bank Transfer

○ Onsite Payment

---

## Horizontal Radio Group

Used when there are two or three short options.

Recommended for:

- Yes / No
- Male / Female
- Light / Dark Mode

---

## Vertical Radio Group

Used when options contain longer labels or supporting descriptions.

Recommended for:

- Payment Methods
- Permit Categories
- Delivery Options

---

# Behavior

Radio Buttons should:

- Allow only one selected option per group.
- Automatically deselect the previously selected option.
- Display immediate visual feedback.
- Preserve selection during navigation.
- Support keyboard interaction.

Radio Buttons should never allow multiple selections within the same group.

---

# States

Every Radio Button supports:

## Unselected

The option is available but not selected.

---

## Selected

The option has been chosen.

---

## Hover (Web)

Displayed when the pointer is over the Radio Button.

Provides subtle visual feedback.

---

## Focus

Displayed during keyboard navigation.

Must remain clearly visible.

---

## Disabled

Unavailable for interaction.

Disabled Radio Buttons should:

- Preserve readable labels.
- Clearly indicate they are unavailable.
- Prevent user interaction.

---

## Error

Displayed when validation fails.

Example

Please select a payment method.

---

# Labels

Radio Button labels should:

- Clearly describe each option.
- Use concise language.
- Remain understandable without additional explanation.

Preferred

- Bank Transfer
- Onsite Payment
- Sole Proprietorship
- Corporation

Avoid

- Option 1
- Choice A
- Other

---

# Radio Button Groups

Groups should:

- Share a descriptive heading.
- Present mutually exclusive choices.
- Maintain consistent spacing.
- Display options vertically unless space permits horizontal layout.

Example

Payment Method

◉ Bank Transfer

○ Onsite Payment

---

# Validation

Validation may require:

- Selecting one option before continuing.
- Choosing a required preference.

Validation messages should appear immediately below the Radio Button Group.

---

# Accessibility

Radio Buttons shall:

- Meet WCAG 2.1 AA.
- Support keyboard navigation.
- Support screen readers.
- Include visible focus indicators.
- Maintain sufficient color contrast.
- Associate labels programmatically.

Keyboard interaction

Tab

Move focus to group

Arrow Keys

Move between options

Space

Select focused option

Selection state should never rely solely on color.

---

# Responsive Behavior

Desktop

- Vertical layout preferred.
- Horizontal layout acceptable for short options.
- Hover states supported.

Tablet

- Maintain spacing between options.
- Preserve logical grouping.

Mobile

- Larger touch targets.
- Vertical layout preferred.
- Respect safe areas.

Minimum touch targets

Angular Web

40 × 40 px

Flutter

48 × 48 logical pixels

---

# Design Tokens

Radio Buttons consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Motion Tokens
- Size Tokens
- State Tokens

Hardcoded visual values are prohibited.

---

# Angular Implementation

Angular Radio Buttons should:

- Reuse shared Radio Button components.
- Integrate with Angular Reactive Forms.
- Consume centralized SCSS Design Tokens.
- Support validation.
- Support disabled state.

Recommended location

src/app/shared/components/radio-button/

Example

EbpcRadioButtonComponent

EbpcRadioGroupComponent

---

# Flutter Implementation

Flutter Radio Buttons should:

- Reuse shared Radio widgets.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.
- Support Material state behavior.

Recommended location

lib/shared/widgets/radio_button/

Example

EbpcRadioButton

EbpcRadioGroup

---

# Related Components

- Checkboxes
- Switches
- Forms
- Validation Messages
- Buttons

---

# Implementation Checklist

- [ ] Uses approved Design Tokens
- [ ] Supports single selection
- [ ] Supports keyboard navigation
- [ ] Meets WCAG 2.1 AA
- [ ] Supports validation
- [ ] Responsive across breakpoints
- [ ] Reuses shared component
- [ ] Matches Brand Guidelines
- [ ] Matches Design System

---

# Do

✔ Use Radio Buttons when only one option may be selected.

✔ Group related options together.

✔ Keep labels concise.

✔ Display validation messages near the group.

✔ Support keyboard interaction.

---

# Don't

✘ Use Radio Buttons for multiple selections.

✘ Hide labels.

✘ Use a single Radio Button by itself.

✘ Depend solely on color to communicate selection.

✘ Create undocumented Radio Button styles.

---

# eBPCO Examples

## Payment Method

◉ Bank Transfer

○ Onsite Payment

---

## Business Type

◉ Sole Proprietorship

○ Partnership

○ Corporation

---

## Permit Delivery

◉ Digital Copy

○ Printed Copy

---

# AI Development Guidelines

AI-generated Radio Button components must:

- Reuse approved shared Radio Button components.
- Consume Design Tokens.
- Preserve accessibility.
- Support validation.
- Avoid undocumented styling.
- Keep Angular and Flutter implementations behaviorally consistent.
- Integrate with the project's form validation strategy.

---

# Governance

All Radio Button implementations within the eBPCO ecosystem shall comply with this specification.

Changes to Radio Button variants, interaction behavior, validation rules, or accessibility requirements require UI/UX approval before implementation.

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