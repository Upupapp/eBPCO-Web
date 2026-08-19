# 12 Theme Architecture

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Architecture

---

# Purpose

The Theme Architecture defines how design tokens are organized, managed, and consumed throughout the eBPCO ecosystem.

It provides a centralized structure for implementing colors, typography, spacing, shadows, elevation, radius, and motion across the Angular Web Administration Portal and Flutter Mobile Application.

All visual styling must originate from the approved theme architecture.

---

# Objectives

The Theme Architecture exists to:

- Centralize visual styling.
- Ensure platform consistency.
- Improve maintainability.
- Support scalable frontend development.
- Simplify theme updates.
- Improve AI-assisted frontend development.

---

# Design Principles

The Theme Architecture should be:

- Centralized
- Reusable
- Scalable
- Consistent
- Easy to maintain
- Platform-independent

Developers should modify theme definitions rather than individual components whenever possible.

---

# Theme Hierarchy

The eBPCO theme is organized into multiple layers.

```
Brand Guidelines
        │
        ▼
Design Tokens
        │
        ▼
Semantic Tokens
        │
        ▼
Theme
        │
        ▼
Reusable Components
        │
        ▼
Application Screens
```

Each layer builds upon the previous one.

---

# Theme Categories

The centralized theme includes:

- Color Theme
- Typography Theme
- Spacing Theme
- Radius Theme
- Shadow Theme
- Elevation Theme
- Motion Theme
- Component Theme

Each category should be maintained independently while remaining part of the same theme system.

---

# Color Theme

Responsible for:

- Brand colors
- Background colors
- Surface colors
- Text colors
- Border colors
- Status colors
- Interactive states

All colors must originate from the Color Tokens.

---

# Typography Theme

Responsible for:

- Font family
- Font sizes
- Font weights
- Line heights
- Letter spacing
- Text styles

Typography must reference Typography Tokens.

---

# Spacing Theme

Responsible for:

- Margins
- Padding
- Gaps
- Layout spacing
- Section spacing

Spacing values must reference Spacing Tokens.

---

# Radius Theme

Responsible for:

- Buttons
- Cards
- Inputs
- Dialogs
- Chips
- Avatars

Radius values must reference Radius Tokens.

---

# Shadow Theme

Responsible for:

- Card shadows
- Dialog shadows
- Overlay shadows
- Hover shadows
- Focus shadows

Shadow definitions must reference Shadow Tokens.

---

# Elevation Theme

Responsible for assigning elevation levels to reusable components.

Examples:

- Cards
- Menus
- Dialogs
- Drawers
- Floating buttons

Elevation must reference the approved Elevation hierarchy.

---

# Motion Theme

Responsible for:

- Animation durations
- Easing curves
- Transition behaviors
- Loading animations
- Navigation transitions

Motion values must reference Motion Tokens.

---

# Component Theme

Reusable components should inherit styling exclusively from the centralized theme.

Examples:

- Buttons
- Inputs
- Cards
- Tables
- Chips
- Navigation
- Dialogs
- Snackbars

Components must not define independent visual styles.

---

# Theme Inheritance

Every screen should inherit styles using the following flow.

```
Theme

↓

Reusable Component

↓

Feature Module

↓

Screen

↓

Individual Widget
```

Screens must not override the centralized theme unless explicitly approved.

---

# Theme Customization

Approved customization should occur at the theme level.

Examples:

- Updating brand colors
- Adjusting typography scale
- Modifying spacing
- Changing component radius

Avoid per-component overrides whenever possible.

---

# Platform Implementation

## Angular

The Angular application should organize themes using:

- SCSS variables
- CSS custom properties
- Shared theme files

Suggested structure:

```
styles/
    _colors.scss
    _typography.scss
    _spacing.scss
    _radius.scss
    _shadow.scss
    _motion.scss
    theme.scss
```

Components should consume theme variables instead of literal values.

---

## Flutter

Flutter should organize themes using centralized classes.

Suggested structure:

```
lib/theme/
    app_theme.dart
    app_colors.dart
    app_typography.dart
    app_spacing.dart
    app_radius.dart
    app_shadows.dart
    app_motion.dart
```

Widgets should consume the centralized theme through ThemeData and supporting classes.

---

# Theme Versioning

All theme changes shall:

- Be documented.
- Be reviewed.
- Preserve backward compatibility where practical.
- Be tested across both platforms.

Major visual updates should increment the Design System version.

---

# AI Development Guidelines

AI-generated code must:

- Consume the centralized theme.
- Never hardcode visual values.
- Reuse existing theme classes.
- Preserve theme inheritance.
- Avoid creating duplicate theme definitions.

---

# Governance

Every visual element within the eBPCO ecosystem must inherit styling from the approved Theme Architecture.

Changes to the theme require review and approval by the UI/UX Team before implementation.

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
