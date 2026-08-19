# Date Pickers

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Inputs

---

# Purpose

Date Pickers allow users to select valid calendar dates through a structured interface instead of manually typing dates.

They improve accuracy, reduce formatting errors, and provide a consistent experience throughout the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Date Pickers should:

- Minimize date entry errors.
- Standardize date formats.
- Improve usability.
- Support accessibility.
- Prevent invalid selections.
- Consume approved Design Tokens.

---

# Usage

Use Date Pickers whenever users must select calendar dates.

Common eBPCO examples include:

- Business Registration Date
- Permit Issue Date
- Permit Expiration Date
- Renewal Date
- Inspection Date
- Payment Date
- Birth Date
- Appointment Date

Avoid using a standard Text Field for date input unless required by a specialized workflow.

---

# Anatomy

A standard Date Picker consists of:

- Label
- Input Container
- Selected Date
- Calendar Icon
- Calendar Dialog or Popup
- Month Navigation
- Year Navigation
- Date Grid
- Helper Text (optional)
- Validation Message
- Required Indicator (when applicable)

---

# Variants

## Standard Date Picker

Allows users to select a single date.

Recommended for most workflows.

---

## Date Range Picker

Allows users to select a start and end date.

Recommended for:

- Reports
- Audit Logs
- Business History
- Search Filters

---

## Read Only

Displays the selected date without allowing modifications.

---

## Disabled

Displays the selected date but prevents interaction.

---

# Supported Formats

The application shall use a single approved display format.

Recommended:

```
DD MMM YYYY

Example:

15 Jul 2026
```

Avoid ambiguous numeric formats such as:

```
07/08/26
```

---

# Calendar Behavior

The calendar should:

- Open from the selected month when a value exists.
- Open from the current month when empty.
- Highlight today's date.
- Highlight the selected date.
- Allow month navigation.
- Allow year navigation.

---

# Date Restrictions

Date Pickers should support:

- Minimum date
- Maximum date
- Disabled dates
- Future-only dates
- Past-only dates
- Business rule restrictions

Examples:

Birth Date

- Cannot be a future date.

Permit Expiration

- Must be after the Permit Issue Date.

---

# States

Date Pickers shall support:

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

- Detect invalid dates.
- Detect restricted dates.
- Explain the issue.
- Suggest corrective action.

Example:

Incorrect:

```
Invalid Date
```

Preferred:

```
Permit Expiration Date must be later than the Issue Date.
```

---

# Behavior

Date Pickers should:

- Prevent invalid selections.
- Preserve selected values.
- Close after selecting a date (single date).
- Support clearing values when permitted.
- Maintain keyboard accessibility.

---

# Accessibility

Date Pickers shall:

- Meet WCAG 2.1 AA.
- Support screen readers.
- Display visible focus indicators.
- Support keyboard navigation.
- Provide semantic labels.

Keyboard navigation should include:

- Tab
- Shift + Tab
- Arrow Keys
- Enter
- Escape
- Page Up / Page Down (month navigation)

---

# Responsive Behavior

Desktop:

- Display calendar popovers.
- Support keyboard navigation.
- Maintain readable spacing.

Tablet:

- Increase touch target sizes.

Mobile:

- Display a full-screen or modal calendar.
- Support touch gestures.
- Avoid requiring precise taps.

---

# Localization

Date Pickers shall:

- Respect the configured locale.
- Display month names consistently.
- Support localized first day of the week where required.

The stored value should use a standardized internal format regardless of the display format.

---

# Design Tokens

Date Pickers consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Radius Tokens
- Shadow Tokens
- Motion Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular Date Pickers should:

- Use Reactive Forms.
- Reuse shared Date Picker components.
- Consume centralized SCSS tokens.
- Support configurable minimum and maximum dates.
- Display validation consistently.

Recommended location:

```
shared/components/date-picker/
```

---

# Flutter Implementation

Flutter Date Pickers should:

- Reuse shared widgets.
- Consume ThemeData.
- Respect AppColors and AppTypography.
- Support localized calendars.
- Display validation consistently.

Recommended location:

```
shared/widgets/date_pickers/
```

---

# Do

✔ Use Date Pickers for calendar dates.

✔ Restrict invalid selections.

✔ Display readable date formats.

✔ Highlight today's date.

✔ Reuse shared components.

✔ Support keyboard navigation.

---

# Don't

✘ Use Text Fields for standard date entry.

✘ Allow impossible dates.

✘ Use ambiguous date formats.

✘ Hardcode styling.

✘ Create undocumented Date Picker variants.

---

# eBPCO Examples

Business Registration

- Registration Date

Permit Management

- Issue Date
- Expiration Date

Payments

- Payment Date

Administration

- Inspection Date
- Appointment Date

Reports

- Date Range Filter

---

# AI Development Guidelines

AI-generated Date Pickers must:

- Reuse documented components.
- Consume Design Tokens.
- Preserve accessibility.
- Support responsive layouts.
- Respect localization.
- Avoid undocumented variants.

---

# Governance

All Date Picker implementations within the eBPCO ecosystem shall comply with this specification.

New Date Picker variants require UI/UX approval and documentation before implementation.

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