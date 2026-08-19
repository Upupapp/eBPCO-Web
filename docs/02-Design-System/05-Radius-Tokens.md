# 05 Radius Tokens

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Foundation

---

# Purpose

Radius Tokens define the standardized border radius values used throughout the eBPCO ecosystem.

They ensure that all components share a consistent visual language by centralizing corner radius values into reusable design tokens.

Every rounded corner in the Angular Web Administration Portal and Flutter Mobile Application must reference an approved Radius Token.

---

# Objectives

The Radius Token system exists to:

- Maintain visual consistency.
- Reinforce the eBPCO design language.
- Simplify component development.
- Improve maintainability.
- Support reusable UI components.
- Eliminate inconsistent border radius values.
- Improve AI-assisted frontend development.

---

# Source of Truth

The official radius system shall be derived from the approved Angular Web Administration Portal.

Flutter must implement the same radius hierarchy while respecting platform-specific rendering.

---

# Radius Token Structure

Radius tokens define standardized corner sizes.

Examples:

```
radius-none
radius-xs
radius-sm
radius-md
radius-lg
radius-xl
radius-pill
radius-circle
```

Applications should reference token names rather than literal values.

---

# Radius Categories

## None

Used where square corners are required.

Examples:

- Data tables
- Divider elements
- Edge-to-edge layouts

---

## Small

Used for subtle rounding.

Typical components:

- Input fields
- Badges
- Status indicators

---

## Medium

Default application radius.

Typical components:

- Buttons
- Cards
- Navigation items
- Dropdown menus

---

## Large

Used for emphasis.

Typical components:

- Dialogs
- Bottom sheets
- Large cards
- Modal windows

---

## Pill

Used for fully rounded horizontal components.

Typical components:

- Chips
- Tags
- Filter buttons
- Status pills

---

## Circle

Used for perfectly circular elements.

Typical components:

- Avatars
- Icon buttons
- Floating action buttons
- Notification badges

---

# Component Usage

The following components shall consume Radius Tokens:

- Buttons
- Text fields
- Cards
- Dialogs
- Navigation drawers
- Navigation rail
- Bottom navigation
- Menus
- Tooltips
- Chips
- Badges
- Tables
- Search bars
- Profile avatars
- Dashboard widgets

No component should define its own border radius.

---

# Platform Implementation

## Angular

Radius tokens should be implemented using:

- SCSS variables
- CSS custom properties
- Shared theme files

Example:

```
border-radius: var(--radius-md);
```

---

## Flutter

Radius tokens should be implemented through centralized constants.

Example:

```
AppRadius.none
AppRadius.xs
AppRadius.sm
AppRadius.md
AppRadius.lg
AppRadius.xl
AppRadius.pill
```

Widgets should reference AppRadius rather than creating BorderRadius values inline.

---

# Responsive Behaviour

Radius values generally remain consistent across screen sizes.

Exceptions may be documented for:

- Full-screen dialogs
- Bottom sheets
- Mobile-specific navigation
- Platform-native components

---

# Hardcoded Radius

Hardcoded border radius values are prohibited except for documented exceptions approved by the UI/UX Team.

---

# AI Development Guidelines

AI-generated code must:

- Reuse approved Radius Tokens.
- Never invent new radius values.
- Use centralized radius classes.
- Maintain consistency across Angular and Flutter.

---

# Governance

All rounded corners within the eBPCO ecosystem must originate from the approved Radius Token system.

Changes to radius values shall be made centrally and automatically propagate across all components.

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