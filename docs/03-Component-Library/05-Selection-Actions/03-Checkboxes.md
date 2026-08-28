# Checkboxes

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Selection & Actions

---

# Purpose

Checkboxes allow users to select zero, one, or multiple independent options from a list.

Unlike Radio Buttons, Checkboxes do not restrict users to a single selection. Each Checkbox functions independently, making them suitable for scenarios where multiple selections are valid.

This specification applies to both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Checkboxes should:

- Support multiple independent selections.
- Clearly communicate selected and unselected states.
- Provide immediate visual feedback.
- Support accessibility requirements.
- Consume approved Design Tokens.
- Be implemented as reusable shared components.

---

# Usage

Use Checkboxes when users may select multiple options simultaneously.

Recommended examples:

- Business Activities
- Required Documents
- User Permissions
- Notification Preferences
- Terms and Conditions
- Bulk Record Selection
- Inspection Requirements

Checkboxes should never be used when only one option may be selected.

---

# Anatomy

A Checkbox consists of:

- Checkbox Container
- Selection Indicator
- Label
- Optional Supporting Text
- Optional Validation Message
- Focus Indicator

Example

+-------------------------------------------+
| ☑ Barangay Clearance                      |
+-------------------------------------------+

---

# Variants

## Standard Checkbox

Supports individual multiple selections.

Recommended for:

- Business Activities
- Document Requirements
- Notification Preferences

---

## Checkbox Group

A collection of related Checkboxes sharing a common heading.

Recommended for:

- Permissions
- Required Documents
- Business Categories

---

## Parent Checkbox

Controls all child Checkboxes.

Example

☐ Select All

☑ Barangay Clearance

☑ Fire Safety Certificate

☐ Occupancy Permit

Selecting the parent Checkbox selects or deselects all child Checkboxes.

---

## Indeterminate Checkbox

Represents a partially selected Checkbox Group.

Example

◩ Select All

The indeterminate state should only be controlled programmatically.

---

# Behavior

Checkboxes should:

- Toggle independently.
- Preserve user selections during navigation.
- Display immediate visual feedback.
- Support keyboard interaction.
- Retain state until changed or reset.

Checkboxes should never automatically deselect other Checkboxes.

---

# States

Every Checkbox supports:

## Unchecked

The option is not selected.

---

## Checked

The option has been selected.

---

## Indeterminate

Represents a partially selected Checkbox Group.

Only applicable to Parent Checkboxes.

---

## Hover (Web)

Displayed when the cursor is over the Checkbox.

Provides subtle visual feedback.

---

## Focus

Displayed during keyboard navigation.

Must remain clearly visible.

---

## Disabled

Unavailable for interaction.

Disabled Checkboxes should:

- Preserve readable labels.
- Clearly indicate they are unavailable.
- Avoid relying solely on reduced opacity.

---

## Error

Displayed when validation fails.

Example

Select at least one required document.

---

# Labels

Checkbox labels should:

- Clearly describe the option.
- Use concise language.
- Remain understandable without additional context.

Preferred

- Barangay Clearance
- Fire Safety Certificate
- Notify by Email
- Retail Business

Avoid

- Option A
- Choice 1
- Miscellaneous

---

# Checkbox Groups

Related Checkboxes should:

- Share a common heading.
- Maintain consistent spacing.
- Present logically related options together.
- Avoid unnecessary scrolling.

Example

Business Activities

☐ Retail

☐ Wholesale

☐ Food Service

☐ Manufacturing

---

# Validation

Validation may require:

- At least one selection.
- A minimum number of selections.
- Acceptance of Terms and Conditions.

Validation messages should appear immediately below the Checkbox Group.

---

# Accessibility

Checkboxes shall:

- Meet WCAG 2.1 AA.
- Support keyboard navigation.
- Support screen readers.
- Include visible focus indicators.
- Maintain sufficient color contrast.
- Associate labels programmatically.

Keyboard interaction

Tab

Move focus

Space

Toggle Checkbox

Shift + Tab

Move to previous focus

Selection state should never rely solely on color.

---

# Responsive Behavior

Desktop

- Labels displayed beside Checkboxes.
- Vertical grouping preferred.
- Hover states supported.

Tablet

- Increase spacing where necessary.
- Preserve logical grouping.

Mobile

- Larger touch targets.
- Increased spacing between options.
- Respect safe areas.

Minimum touch targets

Angular Web

40 × 40 px

Flutter

48 × 48 logical pixels

---

# Design Tokens

Checkboxes consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Motion Tokens
- Size Tokens
- State Tokens

Hardcoded visual values are prohibited.

---

# Angular Implementation

Angular Checkboxes should:

- Reuse shared Checkbox components.
- Integrate with Angular Reactive Forms.
- Consume centralized SCSS Design Tokens.
- Support validation.
- Support indeterminate state.
- Support disabled state.

Recommended location

src/app/shared/components/checkbox/

Example

EbpcCheckboxComponent

EbpcCheckboxGroupComponent

---

# Flutter Implementation

Flutter Checkboxes should:

- Reuse shared Checkbox widgets.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.
- Support Material state behavior.
- Support tristate functionality where applicable.

Recommended location

lib/shared/widgets/checkbox/

Example

EbpcCheckbox

EbpcCheckboxGroup

---

# Related Components

- Buttons
- Button Groups
- Radio Buttons
- Switches
- Forms
- Validation Messages

---

# Implementation Checklist

- [ ] Uses approved Design Tokens
- [ ] Supports checked, unchecked, and indeterminate states
- [ ] Supports keyboard navigation
- [ ] Meets WCAG 2.1 AA
- [ ] Supports validation
- [ ] Responsive across breakpoints
- [ ] Reuses shared component
- [ ] Matches Brand Guidelines
- [ ] Matches Design System

---

# Do

✔ Use Checkboxes for multiple selections.

✔ Group related options.

✔ Use Parent Checkboxes for bulk selection.

✔ Display validation messages near the group.

✔ Keep labels concise and descriptive.

✔ Support keyboard interaction.

---

# Don't

✘ Use Checkboxes when only one option is allowed.

✘ Hide labels.

✘ Depend solely on color to communicate selection.

✘ Create undocumented Checkbox styles.

✘ Mix unrelated options in the same group.

---

# eBPCO Examples

## Business Activities

☐ Retail

☐ Wholesale

☐ Food Service

☐ Manufacturing

---

## Required Documents

☐ Barangay Clearance

☐ Fire Safety Certificate

☐ Occupancy Permit

☐ DTI Registration

---

## User Permissions

☐ View Records

☐ Edit Records

☐ Approve Applications

☐ Manage Users

---

## Terms and Conditions

☐ I have read and agree to the Terms and Conditions.

---

# AI Development Guidelines

AI-generated Checkbox components must:

- Reuse approved shared Checkbox components.
- Consume Design Tokens.
- Preserve accessibility.
- Support validation.
- Support indeterminate state where required.
- Avoid undocumented styling.
- Keep Angular and Flutter implementations behaviorally consistent.
- Integrate with the project's form validation strategy.

---

# Governance

All Checkbox implementations within the eBPCO ecosystem shall comply with this specification.

Changes to Checkbox variants, interaction behavior, validation rules, or accessibility requirements require UI/UX approval before implementation.

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