# 03 Typography Tokens

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Foundation

---

# Purpose

Typography Tokens define the standardized text styles used throughout the eBPCO ecosystem.

They ensure consistent typography across the Angular Web Administration Portal and Flutter Mobile Application by centralizing font-related values into reusable tokens.

Typography Tokens improve readability, accessibility, scalability, and maintainability.

---

# Source of Truth

The official typography system shall be extracted from the approved Angular Web Administration Portal.

The following shall remain consistent across all platforms:

- Font Family
- Font Weights
- Font Sizes
- Line Heights
- Letter Spacing
- Text Hierarchy

Flutter must implement the same typography hierarchy while adapting layouts appropriately for mobile devices.

---

# Typography Token Structure

Typography tokens consist of:

- Font Family
- Font Size
- Font Weight
- Line Height
- Letter Spacing

Example:

```
font-family-primary

font-size-display
font-size-h1
font-size-h2
font-size-h3
font-size-body
font-size-caption

font-weight-regular
font-weight-medium
font-weight-semibold
font-weight-bold

line-height-body

letter-spacing-normal
```

---

# Font Family Tokens

Typography must reference centralized font-family tokens.

Examples:

```
font-family-primary

font-family-monospace
```

Only approved fonts may be used.

Decorative fonts are prohibited.

---

# Font Size Tokens

Standard text hierarchy shall include:

```
font-size-display

font-size-h1

font-size-h2

font-size-h3

font-size-title

font-size-subtitle

font-size-body

font-size-small

font-size-caption

font-size-button

font-size-label
```

Components must consume these tokens instead of defining custom sizes.

---

# Font Weight Tokens

Weight tokens standardize emphasis.

Examples:

```
font-weight-light

font-weight-regular

font-weight-medium

font-weight-semibold

font-weight-bold
```

Avoid unnecessary use of bold text.

---

# Line Height Tokens

Line-height tokens improve readability.

Examples:

```
line-height-tight

line-height-normal

line-height-relaxed
```

Body text should prioritize readability over density.

---

# Letter Spacing Tokens

Letter spacing should remain subtle and consistent.

Examples:

```
letter-spacing-tight

letter-spacing-normal

letter-spacing-wide
```

Do not apply arbitrary spacing values.

---

# Typography Hierarchy

The application shall follow a consistent hierarchy.

Typical usage includes:

- Display
- Page Title
- Section Heading
- Card Title
- Body
- Body Small
- Label
- Caption
- Button Text
- Helper Text

Each hierarchy level must map to an approved token.

---

# Accessibility

Typography must:

- Meet WCAG 2.1 AA readability standards.
- Maintain sufficient contrast.
- Avoid excessively small text.
- Preserve readability when users increase system font size.
- Maintain logical heading hierarchy.

---

# Platform Implementation

## Angular

Typography tokens should be exposed through:

- SCSS variables
- CSS custom properties
- Theme files

Components must consume centralized typography tokens.

---

## Flutter

Typography shall be implemented using:

- TextTheme
- ThemeData
- Centralized typography classes (e.g., AppTypography)

Widgets must not hardcode font sizes or weights.

---

# Hardcoded Typography

Hardcoded font sizes, weights, or spacing are prohibited except for documented exceptions.

All typography must reference approved tokens.

---

# AI Development Guidelines

AI-generated code must:

- Use typography tokens.
- Reuse TextTheme where possible.
- Preserve hierarchy.
- Avoid arbitrary font sizes.
- Respect accessibility requirements.

---

# Governance

All textual content within the eBPCO ecosystem must use approved Typography Tokens.

Changes to typography shall be made centrally and reflected across all applications.

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