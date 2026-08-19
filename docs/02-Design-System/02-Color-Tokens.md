# 02 Color Tokens

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Foundation

---

# Purpose

Color Tokens define the standardized color variables used throughout the eBPCO ecosystem.

Every color used in the Angular Web Administration Portal and Flutter Mobile Application must reference an approved color token.

Color Tokens eliminate inconsistent color usage and allow the application's visual identity to evolve without modifying individual components.

---

# Source of Truth

The official color palette shall be extracted from the approved Angular Web Administration Portal.

The Angular Web Admin is the visual reference for:

- Brand colors
- Backgrounds
- Surfaces
- Typography colors
- Borders
- Status colors
- Interactive states

Flutter must consume the same token definitions to ensure visual consistency.

---

# Color Token Structure

Color Tokens are grouped into semantic categories.

```
color-primary
color-primary-hover
color-primary-pressed

color-secondary
color-secondary-hover
color-secondary-pressed

color-background
color-surface
color-surface-secondary

color-text-primary
color-text-secondary
color-text-disabled

color-border
color-divider

color-success
color-warning
color-danger
color-info

color-approved
color-pending
color-under-review
color-revision
color-rejected
color-released
color-archived

color-link
color-focus
color-disabled
```

---

# Brand Tokens

Brand Tokens represent the official eBPCO identity.

Examples:

- Primary Brand
- Secondary Brand
- Accent

These tokens shall always be extracted from the approved Web Admin theme.

---

# Surface Tokens

Surface tokens define application layers.

Examples:

- Application background
- Card background
- Dialog background
- Navigation background
- Elevated surface

Components must never define their own background colors.

---

# Text Tokens

Text tokens define readable hierarchy.

Examples:

- Primary text
- Secondary text
- Disabled text
- Inverse text
- Link text

Text colors must satisfy WCAG 2.1 AA contrast requirements.

---

# Border Tokens

Border tokens standardize outlines and separators.

Examples:

- Default border
- Focus border
- Error border
- Divider
- Card outline

---

# Status Tokens

Status colors communicate workflow state.

Examples:

- Draft
- Pending
- Under Review
- Requires Revision
- Approved
- Released
- Archived
- Rejected
- Cancelled

These colors must match the workflow standards defined in the Brand Guidelines.

---

# Interactive State Tokens

Interactive elements require dedicated color tokens for:

- Hover
- Pressed
- Focused
- Disabled
- Selected

Do not derive these ad hoc in individual components.

---

# Primitive vs Semantic Tokens

## Primitive Tokens

Primitive tokens represent raw color values.

Example:

```
Green 700
Gray 100
Gray 900
White
Black
```

Primitive values should rarely change.

---

## Semantic Tokens

Semantic tokens reference primitive tokens based on purpose.

Examples:

```
color-button-primary
→ Green 700

color-card-background
→ White

color-text-primary
→ Gray 900

color-status-approved
→ Green 700
```

Components should always consume semantic tokens rather than primitive values directly.

---

# Platform Implementation

## Angular

Color tokens should be implemented using:

- SCSS variables
- CSS custom properties
- Theme files

All components must reference these centralized tokens.

---

## Flutter

Color tokens should be implemented using centralized classes such as:

- AppColors
- ColorScheme
- ThemeData

Widgets must not hardcode color values.

---

# Hardcoded Colors

Hardcoded HEX or RGB values are prohibited inside application screens and components.

Exceptions require documented approval.

---

# AI Development Guidelines

AI-generated code must:

- Reuse existing color tokens.
- Avoid inventing new token names.
- Use semantic tokens instead of raw values.
- Preserve consistency between Angular and Flutter.

---

# Governance

All application colors must originate from the approved Color Token system.

Changes to token values shall be made centrally and propagated through the applications.

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