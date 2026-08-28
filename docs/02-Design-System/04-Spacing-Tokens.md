# 04 Spacing Tokens

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Foundation

---

# Purpose

Spacing Tokens define the standardized spacing values used throughout the eBPCO ecosystem.

They establish a consistent system for margins, padding, gaps, and layout spacing across the Angular Web Administration Portal and Flutter Mobile Application.

All spacing decisions must reference approved spacing tokens instead of hardcoded values.

---

# Objectives

The Spacing Token system exists to:

- Maintain visual consistency.
- Improve readability.
- Simplify layout creation.
- Reduce duplicated spacing values.
- Improve maintainability.
- Support responsive interfaces.
- Enable AI-assisted frontend development.

---

# Source of Truth

The official spacing system is based on the approved eBPCO Design System and follows an **8-point grid**.

Exceptions may exist for fine adjustments where 4-point increments improve usability.

---

# Spacing Scale

The approved spacing scale is:

```
space-0
space-xxs
space-xs
space-sm
space-md
space-lg
space-xl
space-2xl
space-3xl
space-4xl
```

Each token represents an approved spacing value defined centrally within the design system implementation.

Applications must reference token names rather than literal pixel values.

---

# Token Categories

## Margin Tokens

Used for spacing outside components.

Examples:

```
margin-xs
margin-sm
margin-md
margin-lg
margin-xl
```

---

## Padding Tokens

Used for spacing inside components.

Examples:

```
padding-xs
padding-sm
padding-md
padding-lg
padding-xl
```

---

## Gap Tokens

Used between sibling elements.

Examples:

```
gap-xs
gap-sm
gap-md
gap-lg
gap-xl
```

---

## Section Spacing

Defines spacing between major page sections.

Examples:

```
section-spacing-sm
section-spacing-md
section-spacing-lg
```

---

## Layout Spacing

Defines spacing for page layouts.

Examples:

```
layout-padding
layout-margin
layout-content-gap
layout-sidebar-gap
```

---

# Component Usage

Spacing tokens should be applied consistently across:

- Buttons
- Forms
- Cards
- Tables
- Dialogs
- Navigation
- Lists
- Dashboards
- Empty states
- Notifications

No component should define its own spacing values.

---

# Responsive Behaviour

Spacing may adapt for different screen sizes while preserving token names.

Examples:

Desktop

```
layout-padding → Large
```

Tablet

```
layout-padding → Medium
```

Mobile

```
layout-padding → Small
```

Applications should implement responsive mappings internally while preserving the token API.

---

# Platform Implementation

## Angular

Spacing tokens should be implemented through:

- SCSS variables
- CSS custom properties
- Layout utilities

Components must reference centralized spacing variables.

---

## Flutter

Spacing tokens should be implemented using centralized constants.

Examples:

```
AppSpacing.xs
AppSpacing.sm
AppSpacing.md
AppSpacing.lg
AppSpacing.xl
```

Widgets must avoid literal spacing values.

---

# Hardcoded Spacing

Hardcoded spacing values are prohibited except for documented exceptions approved by the UI/UX Team.

---

# AI Development Guidelines

AI-generated code must:

- Use spacing tokens exclusively.
- Avoid arbitrary padding or margin values.
- Preserve spacing consistency across components.
- Reuse existing layout patterns.

---

# Governance

Every margin, padding, and gap within the eBPCO ecosystem must originate from the approved Spacing Token system.

Changes to spacing values shall be made centrally without modifying individual components.

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