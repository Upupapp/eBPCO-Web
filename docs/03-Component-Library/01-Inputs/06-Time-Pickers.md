# Time Pickers

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Inputs

---

# Purpose

Time Pickers allow users to select valid times using a structured interface instead of manually entering time values.

They reduce formatting errors, improve scheduling accuracy, and provide a consistent user experience throughout the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Time Pickers should:

- Standardize time selection.
- Minimize user errors.
- Improve scheduling workflows.
- Support accessibility.
- Prevent invalid time selections.
- Consume approved Design Tokens.

---

# Usage

Use Time Pickers whenever users must select a time.

Common eBPCO examples include:

- Inspection Time
- Appointment Time
- Office Hours
- Payment Schedule
- Business Operating Hours
- Meeting Time

Avoid using standard Text Fields for time entry unless explicitly required.

---

# Anatomy

A standard Time Picker consists of:

- Label
- Input Container
- Selected Time
- Clock Icon
- Time Selection Dialog
- Hour Selector
- Minute Selector
- AM/PM Selector (when applicable)
- Helper Text (optional)
- Validation Message
- Required Indicator (when applicable)

---

# Variants

## Standard Time Picker

Allows users to select a single time.

Recommended for most workflows.

---

## Time Range Picker

Allows users to select:

- Start Time
- End Time

Recommended for:

- Office Hours
- Business Operating Hours
- Reservation Windows
- Report Filters

---

## Read Only

Displays the selected time without allowing edits.

---

## Disabled

Displays the selected time while preventing interaction.

---

# Time Format

The application shall use a consistent display format.

Preferred format:

24-hour

Examples:

```
08:30
13:45
17:00
```

If business requirements demand a 12-hour format, it should be applied consistently.

Example:

```
8:30 AM
1:45 PM
```

The chosen format should remain consistent across the application.

---

# Time Restrictions

Time Pickers should support:

- Minimum Time
- Maximum Time
- Disabled Time Ranges
- Business Hours Only
- Custom Validation Rules

Examples:

Office Hours

```
08:00–17:00
```

Appointment Booking

```
09:00–16:00
```

---

# States

Time Pickers shall support:

- Default
- Hover (Web)
- Focus
- Selected
- Disabled
- Read Only
- Error
- Success
- Warning

State transitions shall follow the Motion guidelines.

---

# Validation

Validation should:

- Detect invalid times.
- Detect restricted times.
- Explain the issue.
- Suggest corrective action.

Example:

Incorrect:

```
Invalid Time
```

Preferred:

```
Inspection Time must be within office hours.
```

---

# Behavior

Time Pickers should:

- Open with a single interaction.
- Preserve the selected value.
- Prevent invalid selections.
- Close after selection.
- Allow clearing values where appropriate.
- Support keyboard interaction.

---

# Accessibility

Time Pickers shall:

- Meet WCAG 2.1 AA.
- Support keyboard navigation.
- Support screen readers.
- Display visible focus indicators.
- Provide semantic labels.

Keyboard support should include:

- Tab
- Shift + Tab
- Arrow Keys
- Enter
- Escape

---

# Responsive Behavior

Desktop:

- Display compact popovers.
- Support keyboard-first interaction.

Tablet:

- Increase touch target sizes.

Mobile:

- Display full-screen or modal time selectors.
- Support touch interaction.
- Maintain readable spacing.

---

# Localization

Time Pickers shall:

- Respect regional time conventions.
- Display localized AM/PM notation when applicable.
- Store time values in a standardized internal format.

---

# Design Tokens

Time Pickers consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Radius Tokens
- Shadow Tokens
- Motion Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular Time Pickers should:

- Use Reactive Forms.
- Reuse shared Time Picker components.
- Consume centralized SCSS tokens.
- Support configurable validation rules.
- Display validation consistently.

Recommended location:

```
shared/components/time-picker/
```

---

# Flutter Implementation

Flutter Time Pickers should:

- Reuse shared widgets.
- Consume ThemeData.
- Respect AppColors and AppTypography.
- Support localized time formats.
- Display validation consistently.

Recommended location:

```
shared/widgets/time_pickers/
```

---

# Do

✔ Use Time Pickers for time selection.

✔ Restrict unavailable times.

✔ Maintain a consistent time format.

✔ Validate business-hour constraints.

✔ Reuse shared components.

✔ Support keyboard accessibility.

---

# Don't

✘ Use Text Fields for standard time entry.

✘ Allow impossible or restricted times.

✘ Mix 12-hour and 24-hour formats without a defined standard.

✘ Hardcode styling.

✘ Create undocumented Time Picker variants.

---

# eBPCO Examples

Appointments

- Appointment Time

Business Registration

- Business Operating Hours

Inspections

- Inspection Schedule

Administration

- Office Hours
- Meeting Schedule

Payments

- Payment Window

---

# AI Development Guidelines

AI-generated Time Pickers must:

- Reuse documented components.
- Consume Design Tokens.
- Preserve accessibility.
- Support responsive layouts.
- Respect localization.
- Avoid undocumented variants.

---

# Governance

All Time Picker implementations within the eBPCO ecosystem shall comply with this specification.

New Time Picker variants require UI/UX approval and documentation before implementation.

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