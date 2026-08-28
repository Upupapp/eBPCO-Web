# 06 Shadow Tokens

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Foundation

---

# Purpose

Shadow Tokens define the standardized shadow styles used throughout the eBPCO ecosystem.

They establish a consistent visual hierarchy by indicating elevation, focus, layering, and component separation across the Angular Web Administration Portal and Flutter Mobile Application.

Every shadow used within the applications must reference an approved Shadow Token.

---

# Objectives

The Shadow Token system exists to:

- Create visual depth.
- Establish component hierarchy.
- Improve interface readability.
- Standardize elevation effects.
- Reduce duplicated shadow definitions.
- Simplify maintenance.
- Improve AI-assisted frontend development.

---

# Source of Truth

The official shadow system shall be derived from the approved Angular Web Administration Portal.

Flutter must implement equivalent shadow behavior while following Material Design rendering principles.

---

# Shadow Token Structure

The design system defines reusable shadow tokens.

Examples:

```
shadow-none
shadow-xs
shadow-sm
shadow-md
shadow-lg
shadow-xl
shadow-overlay
```

Applications should reference token names rather than defining custom shadow values.

---

# Shadow Categories

## No Shadow

Used for flat components.

Typical examples:

- Dividers
- Basic text elements
- Static layouts

---

## Extra Small

Used for minimal separation.

Typical examples:

- Input fields
- Small buttons
- Badges

---

## Small

Used for default components.

Typical examples:

- Cards
- Panels
- Navigation items

---

## Medium

Used for elevated components.

Typical examples:

- Dropdown menus
- Floating cards
- Hover states

---

## Large

Used for high-priority overlays.

Typical examples:

- Dialogs
- Side panels
- Context menus

---

## Extra Large

Used sparingly.

Typical examples:

- Full-screen modals
- Large overlay windows
- Important notifications

---

## Overlay Shadow

Used for application overlays.

Examples:

- Modal backdrop
- Drawer overlay
- Loading overlay

Overlay shadows should enhance focus without distracting users.

---

# Component Usage

The following components should consume Shadow Tokens:

- Cards
- Buttons
- Dialogs
- Drawers
- Dropdown menus
- Tooltips
- Floating Action Buttons
- Navigation menus
- Dashboard widgets
- Context menus
- Popovers

Components must not define custom shadow values.

---

# Interaction States

Shadow Tokens may vary during interaction.

Supported states include:

- Default
- Hover
- Focus
- Active
- Dragging

Shadow transitions should remain subtle and consistent.

---

# Accessibility

Shadows must not be relied upon as the only visual indicator of:

- Focus
- Selection
- Interaction

Additional visual cues such as outlines, borders, or color changes must accompany important interaction states.

---

# Platform Implementation

## Angular

Shadow Tokens should be implemented using:

- SCSS variables
- CSS custom properties
- Shared theme files

Example:

```
box-shadow: var(--shadow-md);
```

---

## Flutter

Shadow Tokens should be implemented through centralized classes.

Example:

```
AppShadows.none
AppShadows.sm
AppShadows.md
AppShadows.lg
AppShadows.xl
```

Widgets must avoid inline BoxShadow definitions.

---

# Hardcoded Shadows

Hardcoded shadow definitions are prohibited except for documented exceptions approved by the UI/UX Team.

---

# AI Development Guidelines

AI-generated code must:

- Reuse approved Shadow Tokens.
- Never invent new shadow styles.
- Use centralized shadow definitions.
- Maintain consistency between Angular and Flutter.

---

# Governance

All shadows within the eBPCO ecosystem must originate from the approved Shadow Token system.

Changes to shadow definitions shall be made centrally and automatically reflected across all applications.

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