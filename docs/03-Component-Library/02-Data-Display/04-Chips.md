# Chips

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Data Display

---

# Purpose

Chips are compact interactive elements that represent an input, attribute, filter, category, or selection.

Unlike Badges, Chips are often interactive and allow users to select, filter, or remove values.

This specification applies to both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Chips should:

- Represent selected values.
- Improve filtering experiences.
- Display applied categories.
- Support quick interactions.
- Consume approved Design Tokens.
- Support accessibility.

---

# Usage

Use Chips when users need to:

- View applied filters.
- Remove selected filters.
- Select categories.
- Display tags.
- Represent selected values.

Common eBPCO examples include:

- Barangay Filters
- Business Categories
- Payment Status Filters
- Permit Type Filters
- Search Tags
- Selected Business Activities

Avoid using Chips for permanent status indicators. Use Badges instead.

---

# Anatomy

A Chip consists of:

- Container
- Label
- Optional Leading Icon
- Optional Trailing Icon
- Optional Remove Button

Example:

[ Retail ✕ ]

[ Barangay: Poblacion ✕ ]

[ Pending ]

---

# Variants

## Assist Chip

Provides contextual suggestions or quick actions.

Example:

[ Search Businesses ]

---

## Filter Chip

Represents an applied or selectable filter.

Example:

[ Active ]

[ Pending ]

[ Paid ]

Filter Chips may toggle between selected and unselected states.

---

## Input Chip

Represents user-entered information.

Example:

[ Retail ]

[ Wholesale ]

[ Food ]

---

## Choice Chip

Allows selection of a single option from a set.

Example:

[ Monthly ]

[ Quarterly ]

[ Annual ]

Only one Choice Chip may be selected at a time.

---

## Action Chip

Executes a predefined action.

Example:

[ Export ]

[ Download ]

---

# States

Chips shall support:

- Default
- Hover (Web)
- Focus
- Selected
- Unselected
- Disabled
- Pressed

State transitions shall follow Motion guidelines.

---

# Selection Behavior

Choice Chips

- Single selection.
- Automatically deselect previous selection.

Filter Chips

- Multiple selections allowed.
- Toggle independently.

Input Chips

- Display entered values.
- Support removal.

Action Chips

- Trigger immediate actions.
- Should not remain selected.

---

# Labels

Chip labels should:

- Be concise.
- Use plain language.
- Avoid abbreviations where possible.

Preferred:

Retail

Avoid:

Ret.

---

# Removal

Removable Chips should provide a visible remove control.

Example:

[ Retail ✕

Selecting the remove control should remove only the associated Chip.

---

# Filtering

Filter Chips should:

- Clearly indicate selected state.
- Support multiple active filters.
- Update results consistently.
- Preserve filter selections until cleared.

Example:

Active Filters

[ Approved ✕ ]

[ Barangay: San Isidro ✕ ]

[ Retail ✕ ]

---

# Accessibility

Chips shall:

- Meet WCAG 2.1 AA.
- Support screen readers.
- Provide semantic labels.
- Display visible focus indicators.
- Maintain accessible touch target sizes.

Removable Chips should expose accessible remove actions.

---

# Responsive Behavior

Desktop

- Display Chips inline.
- Support hover interactions.

Tablet

- Wrap Chips across multiple lines.

Mobile

- Wrap Chips naturally.
- Maintain generous spacing.
- Preserve touch targets.

---

# Design Tokens

Chips consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Radius Tokens
- Motion Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular Chips should:

- Reuse shared Chip components.
- Consume centralized SCSS tokens.
- Support selectable and removable variants.

Recommended location:

shared/components/chip/

---

# Flutter Implementation

Flutter Chips should:

- Reuse shared Chip widgets.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.
- Utilize Material Chip widgets where appropriate.

Recommended location:

shared/widgets/chips/

---

# Do

✔ Use Chips for filters and selections.

✔ Support removable Chips when appropriate.

✔ Clearly indicate selected states.

✔ Wrap Chips gracefully on smaller screens.

✔ Reuse shared Chip components.

---

# Don't

✘ Use Chips as permanent status indicators.

✘ Display long text inside Chips.

✘ Hardcode colors or spacing.

✘ Hide remove actions for removable Chips.

✘ Create undocumented Chip variants.

---

# eBPCO Examples

Business Registry

Applied Filters

[ Retail ✕ ]

[ Active ✕ ]

[ Barangay: Poblacion ✕ ]

Applications

Selected Permit Types

[ New ✕ ]

[ Renewal ✕ ]

Reports

Time Period

[ Monthly ]

[ Quarterly ]

[ Annual ]

Payments

Status Filters

[ Paid ]

[ Pending ]

[ Overdue ]

---

# AI Development Guidelines

AI-generated Chips must:

- Reuse documented components.
- Consume Design Tokens.
- Preserve accessibility.
- Support responsive layouts.
- Implement removable and selectable behavior consistently.
- Avoid undocumented variants.

---

# Governance

All Chip implementations within the eBPCO ecosystem shall comply with this specification.

New Chip variants require UI/UX approval and documentation before implementation.

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