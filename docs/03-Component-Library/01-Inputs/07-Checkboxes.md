# Checkboxes

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Inputs

---

# Purpose

Checkboxes allow users to independently select one or more options from a list.

Unlike Radio Buttons, Checkboxes do not enforce mutual exclusivity. Each option is treated independently, allowing users to select any combination that applies.

Checkboxes shall provide a consistent, accessible, and responsive experience throughout the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Checkboxes should:

- Support multiple independent selections.
- Clearly communicate selection state.
- Improve form usability.
- Support accessibility.
- Consume approved Design Tokens.

---

# Usage

Use Checkboxes when users may select:

- Zero options
- One option
- Multiple options

Common eBPCO examples include:

- Required Document Checklist
- Business Activities
- Notification Preferences
- Terms and Conditions
- Consent Confirmation
- Report Filters
- User Permissions

Do not use Checkboxes when only one option may be selected.

---

# Anatomy

A standard Checkbox consists of:

- Checkbox Indicator
- Label
- Helper Text (optional)
- Validation Message (when applicable)
- Required Indicator (when applicable)

---

# Variants

## Standard Checkbox

Represents an individual selectable option.

---

## Checkbox Group

A collection of related checkboxes.

Example:

```
Required Documents

☐ DTI Registration

☐ Barangay Clearance

☐ BIR Registration

☐ Fire Safety Certificate
```

---

## Parent Checkbox

Controls a group of child checkboxes.

Example:

```
☐ Select All
```

When only some child items are selected, the parent should display an indeterminate state.

---

## Read Only

Displays the selection without allowing changes.

---

## Disabled

Displays the current value while preventing interaction.

---

# States

Checkboxes shall support:

- Default
- Hover (Web)
- Focus
- Checked
- Unchecked
- Indeterminate
- Disabled
- Read Only
- Error

State transitions shall follow the Motion guidelines.

---

# Selection Behavior

Checkboxes should:

- Toggle with a single interaction.
- Preserve selections.
- Allow independent selection.
- Support keyboard interaction.

Checkbox Groups should not automatically deselect other items.

---

# Labels

Every Checkbox must include a visible label.

Labels should:

- Clearly describe the option.
- Be concise.
- Avoid abbreviations where possible.

Example:

Preferred:

```
Receive Email Notifications
```

Avoid:

```
Email
```

---

# Validation

Validation should:

- Clearly explain missing required selections.
- Identify affected groups.
- Suggest corrective action.

Example:

Incorrect:

```
Required
```

Preferred:

```
Please accept the Terms and Conditions.
```

---

# Parent and Child Behavior

Parent Checkboxes should:

- Select all children when checked.
- Deselect all children when unchecked.
- Display an indeterminate state when only some child options are selected.

Child Checkboxes should update the parent state automatically.

---

# Accessibility

Checkboxes shall:

- Meet WCAG 2.1 AA.
- Support screen readers.
- Support keyboard navigation.
- Display visible focus indicators.
- Provide semantic labels.
- Maintain accessible touch targets.

Keyboard support:

- Tab
- Shift + Tab
- Space

---

# Responsive Behavior

Desktop:

- Support hover interactions.
- Align labels consistently.

Tablet:

- Increase touch targets.

Mobile:

- Support one-handed interaction.
- Increase spacing between options.
- Prevent accidental selection.

---

# Design Tokens

Checkboxes consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Radius Tokens
- Motion Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular Checkboxes should:

- Use Reactive Forms.
- Reuse shared Checkbox components.
- Consume centralized SCSS tokens.
- Support validation consistently.

Recommended location:

```
shared/components/checkbox/
```

---

# Flutter Implementation

Flutter Checkboxes should:

- Reuse shared Checkbox widgets.
- Consume ThemeData.
- Respect AppColors and AppTypography.
- Support Material accessibility.
- Display validation consistently.

Recommended location:

```
shared/widgets/checkboxes/
```

---

# Do

✔ Use Checkboxes for independent selections.

✔ Support multiple selections.

✔ Display indeterminate states when applicable.

✔ Use descriptive labels.

✔ Reuse shared components.

---

# Don't

✘ Use Checkboxes when only one option is allowed.

✘ Hide labels.

✘ Hardcode styling.

✘ Create undocumented Checkbox variants.

✘ Use Checkboxes for immediate on/off settings (use a Switch instead).

---

# eBPCO Examples

Business Registration

- Required Documents

Permit Application

- Additional Requirements

Notifications

- Email Notifications
- SMS Notifications

Administration

- User Permissions
- Report Filters

Consent

- Terms and Conditions
- Privacy Policy Acknowledgement

---

# AI Development Guidelines

AI-generated Checkboxes must:

- Reuse documented components.
- Consume Design Tokens.
- Preserve accessibility.
- Support responsive layouts.
- Maintain correct parent-child behavior.
- Avoid undocumented variants.

---

# Governance

All Checkbox implementations within the eBPCO ecosystem shall comply with this specification.

New Checkbox variants require UI/UX approval and documentation before implementation.

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