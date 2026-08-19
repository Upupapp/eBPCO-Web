# Radio Buttons

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Inputs

---

# Purpose

Radio Buttons allow users to select exactly one option from a predefined group of mutually exclusive choices.

Once an option is selected, all other options within the same group become unselected.

Radio Buttons provide a clear, accessible, and predictable method for making single selections throughout the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Radio Buttons should:

- Enforce single-option selection.
- Clearly communicate available choices.
- Improve form usability.
- Reduce input ambiguity.
- Support accessibility.
- Consume approved Design Tokens.

---

# Usage

Use Radio Buttons when users must select only one option from a small set of visible choices.

Common eBPCO examples include:

- Payment Method
- Applicant Type
- Business Ownership Type
- Permit Processing Option
- Gender (where required)
- Renewal Type

Avoid Radio Buttons when:

- More than six options exist.
- Space is limited.
- Options should be hidden until requested.

In these cases, use a Dropdown instead.

---

# Anatomy

A standard Radio Button consists of:

- Radio Indicator
- Label
- Helper Text (optional)
- Validation Message (when applicable)
- Required Indicator (when applicable)

---

# Variants

## Standard Radio Button

Represents a single selectable option.

---

## Radio Group

A collection of mutually exclusive Radio Buttons.

Example:

```
Payment Method

◉ Onsite Payment

○ Bank Transfer
```

Only one option may be selected at any time.

---

## Read Only

Displays the selected option without allowing changes.

---

## Disabled

Displays the available options while preventing interaction.

---

# States

Radio Buttons shall support:

- Default
- Hover (Web)
- Focus
- Selected
- Unselected
- Disabled
- Read Only
- Error

State transitions shall follow the Motion guidelines.

---

# Selection Behavior

Radio Buttons should:

- Allow only one selected option.
- Automatically deselect the previously selected option.
- Preserve the selected value.
- Support keyboard interaction.

Selecting an already selected option should not deselect it.

---

# Labels

Every Radio Button must include a visible label.

Labels should:

- Clearly describe the option.
- Be concise.
- Use plain language.
- Avoid abbreviations where possible.

Example:

Preferred:

```
Bank Transfer
```

Avoid:

```
Transfer
```

---

# Validation

Validation should:

- Clearly indicate when a required selection has not been made.
- Identify the affected Radio Group.
- Suggest corrective action.

Example:

Incorrect:

```
Required
```

Preferred:

```
Please select a Payment Method.
```

---

# Group Layout

Radio Groups may be displayed:

## Vertical

Recommended for most forms.

```
○ Onsite Payment

○ Bank Transfer
```

---

## Horizontal

Recommended only when:

- Two or three short options exist.
- Adequate horizontal space is available.

Example:

```
○ Male     ○ Female
```

---

# Accessibility

Radio Buttons shall:

- Meet WCAG 2.1 AA.
- Support screen readers.
- Support keyboard navigation.
- Display visible focus indicators.
- Provide semantic labels.
- Maintain accessible touch target sizes.

Keyboard support should include:

- Tab
- Shift + Tab
- Arrow Keys
- Space

---

# Responsive Behavior

Desktop:

- Support hover interactions.
- Align labels consistently.

Tablet:

- Increase touch target sizes.

Mobile:

- Prefer vertical layouts.
- Increase spacing between options.
- Prevent accidental selection.

---

# Design Tokens

Radio Buttons consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Radius Tokens
- Motion Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular Radio Buttons should:

- Use Reactive Forms.
- Reuse shared Radio Group components.
- Consume centralized SCSS tokens.
- Display validation consistently.

Recommended location:

```
shared/components/radio-button/
```

---

# Flutter Implementation

Flutter Radio Buttons should:

- Reuse shared Radio widgets.
- Consume ThemeData.
- Respect AppColors and AppTypography.
- Support Material accessibility.
- Display validation consistently.

Recommended location:

```
shared/widgets/radio_buttons/
```

---

# Do

✔ Use Radio Buttons when exactly one option is allowed.

✔ Keep option labels concise.

✔ Display all available options.

✔ Group related options together.

✔ Reuse shared components.

---

# Don't

✘ Use Radio Buttons for multiple selections.

✘ Hide labels.

✘ Use Radio Buttons for long lists (use a Dropdown instead).

✘ Hardcode styling.

✘ Create undocumented Radio Button variants.

---

# eBPCO Examples

Payments

- Onsite Payment
- Bank Transfer

Business Registration

- Sole Proprietorship
- Partnership
- Corporation

Permit Processing

- New Application
- Renewal

Administration

- User Status
- Approval Decision

---

# AI Development Guidelines

AI-generated Radio Buttons must:

- Reuse documented components.
- Consume Design Tokens.
- Preserve accessibility.
- Support responsive layouts.
- Maintain single-selection behavior.
- Avoid undocumented variants.

---

# Governance

All Radio Button implementations within the eBPCO ecosystem shall comply with this specification.

New Radio Button variants require UI/UX approval and documentation before implementation.

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