# Dropdowns

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Inputs

---

# Purpose

Dropdowns allow users to select one or more predefined options from a controlled list.

They reduce input errors, standardize data collection, and improve form consistency throughout the eBPCO ecosystem.

Dropdowns shall provide a predictable, accessible, and responsive user experience across both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Dropdowns should:

- Standardize user selections.
- Prevent invalid input.
- Simplify complex forms.
- Improve data consistency.
- Support accessibility.
- Consume approved Design Tokens.

---

# Usage

Use Dropdowns when users must select from predefined values.

Common eBPCO examples include:

- Business Type
- Business Nature
- Barangay
- Municipality
- Province
- Application Status
- Payment Method
- Permit Type
- Occupancy Type
- Civil Status

Avoid Dropdowns when users need to enter free-form text.

---

# Anatomy

A standard Dropdown consists of:

- Label
- Input Container
- Selected Value
- Placeholder (optional)
- Dropdown Indicator
- Option List
- Helper Text (optional)
- Validation Message
- Required Indicator (when applicable)

---

# Variants

## Standard Dropdown

Displays a list of predefined options.

Recommended for short option lists.

---

## Searchable Dropdown

Allows users to filter options by typing.

Recommended when:

- More than 10 options exist.
- Users need to locate items quickly.

Examples:

- Barangays
- Business Categories
- Occupation Lists

---

## Multi-Select Dropdown

Allows users to select multiple values.

Selected items should appear as removable chips or tags.

Use only when multiple selections are required.

---

## Grouped Dropdown

Options are organized into categories.

Example:

```
Business Category

Manufacturing
• Food Manufacturing
• Textile Manufacturing

Retail
• Grocery
• Pharmacy
```

---

## Read Only

Displays the selected value without allowing changes.

---

## Disabled

Temporarily prevents interaction while remaining readable.

---

# States

Dropdowns shall support:

- Default
- Hover (Web)
- Focus
- Expanded
- Selected
- Disabled
- Read Only
- Error
- Success
- Warning
- Loading (optional)

State transitions shall follow the Motion guidelines.

---

# Placeholder

Placeholder text should guide users before selection.

Examples:

```
Select Barangay
```

```
Choose Payment Method
```

Placeholder text must never replace a visible label.

---

# Option Lists

Options should:

- Be concise.
- Be logically ordered.
- Avoid duplicates.
- Use consistent capitalization.
- Avoid abbreviations unless officially recognized.

Large lists should support search.

---

# Default Selection

Dropdowns should not automatically select a value unless:

- A logical default exists.
- The workflow explicitly requires it.

Users should intentionally confirm important selections.

---

# Search Behavior

Searchable Dropdowns should:

- Filter results as users type.
- Ignore capitalization differences.
- Display matching options only.
- Display a "No results found" message when applicable.

---

# Multi-Select Behavior

Multi-select Dropdowns should:

- Display selected values clearly.
- Allow deselection.
- Support keyboard navigation.
- Preserve selections when reopened.

---

# Validation

Validation should:

- Occur after interaction.
- Occur during form submission.
- Clearly explain the issue.
- Suggest corrective action.

Example:

Incorrect:

```
Invalid selection.
```

Preferred:

```
Please select a Payment Method.
```

---

# Behavior

Dropdowns should:

- Open with a single interaction.
- Close when an option is selected (single-select).
- Close when users click outside the component.
- Preserve the selected value.
- Prevent accidental selections.

---

# Accessibility

Dropdowns shall:

- Meet WCAG 2.1 AA.
- Support keyboard navigation.
- Support screen readers.
- Display visible focus indicators.
- Provide semantic labels.
- Maintain accessible touch targets.

Keyboard support should include:

- Tab
- Shift + Tab
- Enter
- Escape
- Arrow Keys

---

# Responsive Behavior

Desktop:

- Display floating option menus.
- Support hover interactions.
- Allow keyboard navigation.

Tablet:

- Increase touch target size.
- Preserve spacing.

Mobile:

- Prefer full-width layouts.
- Support native selection experiences where appropriate.
- Maintain readable option spacing.

---

# Loading State

When options are retrieved dynamically, the Dropdown should:

- Display a loading indicator.
- Prevent premature interaction.
- Preserve layout stability.

---

# Empty State

If no options are available, display an informative message.

Example:

```
No Barangays Available
```

Avoid empty dropdown menus.

---

# Design Tokens

Dropdowns consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Radius Tokens
- Shadow Tokens
- Motion Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular Dropdowns should:

- Use Reactive Forms.
- Reuse shared dropdown components.
- Consume centralized SCSS tokens.
- Support search where required.
- Display validation consistently.

Recommended location:

```
shared/components/dropdown/
```

---

# Flutter Implementation

Flutter Dropdowns should:

- Reuse shared dropdown widgets.
- Consume ThemeData.
- Respect AppColors and AppTypography.
- Support searchable variants where required.
- Display validation consistently.

Recommended location:

```
shared/widgets/dropdowns/
```

---

# Do

✔ Use Dropdowns only for predefined options.

✔ Enable search for long lists.

✔ Keep option labels clear.

✔ Group related options when helpful.

✔ Preserve selected values.

✔ Reuse shared components.

---

# Don't

✘ Use Dropdowns for very small binary choices (use Radio Buttons or Switches instead).

✘ Automatically select important values.

✘ Display duplicate options.

✘ Hide validation messages.

✘ Hardcode styling.

✘ Create undocumented Dropdown variants.

---

# eBPCO Examples

Business Registration

- Business Type
- Business Nature
- Barangay

Permit Application

- Permit Type
- Application Status
- Business Classification

Payments

- Payment Method

Administration

- User Role
- Office
- Department

---

# AI Development Guidelines

AI-generated Dropdowns must:

- Reuse documented components.
- Consume Design Tokens.
- Preserve accessibility.
- Support responsive layouts.
- Follow validation standards.
- Avoid undocumented variants.

---

# Governance

All Dropdown implementations within the eBPCO ecosystem shall comply with this specification.

New Dropdown variants require UI/UX approval and documentation before implementation.

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