# 01 Design Tokens

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Foundation

---

# Purpose

Design Tokens are the smallest reusable visual values used throughout the eBPCO ecosystem.

They represent design decisions as named variables instead of hardcoded values.

Every visual property used in the Angular Web Administration Portal and Flutter Mobile Application must reference a design token whenever possible.

Design Tokens provide consistency, maintainability, scalability, and easier AI-assisted development.

---

# What Are Design Tokens?

A Design Token is a reusable variable representing a design decision.

Examples include:

- Brand colors
- Typography
- Font sizes
- Font weights
- Spacing
- Border radius
- Elevation
- Shadows
- Opacity
- Motion
- Animation duration
- Breakpoints

Instead of using literal values repeatedly, developers reference tokens.

Example:

Incorrect

```
color: #006C4E;
padding: 16px;
border-radius: 8px;
```

Correct

```
color: var(--color-primary);
padding: var(--space-md);
border-radius: var(--radius-md);
```

---

# Objectives

The Design Token system exists to:

- Eliminate duplicated values
- Improve maintainability
- Support consistent branding
- Simplify theme management
- Enable platform consistency
- Improve AI-generated code quality
- Support future design changes with minimal effort

---

# Token Categories

The eBPCO Design System defines the following token categories:

## Color Tokens

Defines:

- Brand colors
- Semantic colors
- Backgrounds
- Text colors
- Borders
- Status colors

---

## Typography Tokens

Defines:

- Font family
- Font size
- Font weight
- Line height
- Letter spacing

---

## Spacing Tokens

Defines:

- Margins
- Padding
- Gaps
- Layout spacing
- Component spacing

---

## Radius Tokens

Defines:

- Button radius
- Card radius
- Dialog radius
- Input radius

---

## Shadow Tokens

Defines:

- Card elevation
- Dialog shadows
- Hover shadows
- Floating action elevation

---

## Motion Tokens

Defines:

- Animation duration
- Animation easing
- Transition speed

---

## Breakpoint Tokens

Defines responsive layouts for:

- Mobile
- Tablet
- Desktop
- Large desktop

---

# Naming Convention

All tokens must use descriptive names.

Examples:

```
color-primary
color-secondary
color-background
color-surface

space-xs
space-sm
space-md
space-lg
space-xl

radius-sm
radius-md
radius-lg

shadow-sm
shadow-md
shadow-lg

font-family-primary

font-size-body

font-weight-medium
```

Avoid ambiguous names such as:

```
blue1
green2
largePadding
shadowA
```

---

# Token Hierarchy

Tokens are organized into two levels.

## Primitive Tokens

Raw visual values.

Examples:

- Green 700
- Gray 100
- White
- Black
- 8px
- 16px
- 24px

Primitive tokens rarely change.

---

## Semantic Tokens

Semantic tokens describe purpose.

Examples:

Primary Button Background

```
color-button-primary
```

Error Text

```
color-text-error
```

Success Badge

```
color-status-approved
```

Card Background

```
color-card-background
```

Semantic tokens reference primitive tokens.

---

# Platform Implementation

## Angular

Angular should expose tokens through:

- SCSS variables
- CSS custom properties
- Theme files

Components must consume tokens rather than literal values.

---

## Flutter

Flutter should expose tokens through centralized constants and ThemeData.

Examples:

- AppColors
- AppTypography
- AppSpacing
- AppRadius
- AppShadows

Widgets must use these centralized values.

---

# Hardcoded Values

Hardcoding visual values is prohibited except for:

- Temporary prototypes
- Third-party package limitations
- Documented exceptions approved by the UI/UX Team

---

# Versioning

When a token changes:

- Preserve the token name whenever possible.
- Update its underlying value.
- Document significant visual changes in release notes.

Avoid introducing duplicate tokens for the same purpose.

---

# AI Development Guidelines

AI-generated code must:

- Use existing tokens.
- Never invent new token names without approval.
- Reuse semantic tokens before creating additional ones.
- Keep token usage consistent across Angular and Flutter.

---

# Governance

Every visual property within the eBPCO ecosystem must originate from the Design Token system.

No new visual value should be introduced without determining whether an appropriate token already exists.

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