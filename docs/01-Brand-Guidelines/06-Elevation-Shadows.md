# 06 Elevation & Shadows

Version: 1.0.0  
Status: Approved  
Document Owner: UI/UX Team

---

# Purpose

Elevation provides visual hierarchy by distinguishing interactive elements from the page background.

The eBPCO Design System uses subtle shadows to maintain a clean, professional government appearance. Shadows should communicate depth without distracting from content.

All components must use only the approved elevation levels defined in this document.

---

# Design Principles

The elevation system follows these principles:

- Minimal and professional
- Consistent across all screens
- Supports usability
- Enhances readability
- Avoids excessive visual effects

Shadows should never become decorative.

---

# Elevation Levels

| Token | Usage |
|--------|-------|
| Elevation-0 | Flat surfaces |
| Elevation-1 | Cards |
| Elevation-2 | Hovered cards |
| Elevation-3 | Dropdown menus |
| Elevation-4 | Dialogs |
| Elevation-5 | Floating components |

---

# Elevation-0

Usage:

- Page background
- Navigation background
- Flat sections

Shadow:

None

---

# Elevation-1

Usage:

- Dashboard cards
- Information cards
- Statistics cards
- Form containers

Characteristics:

- Very subtle
- Soft blur
- Low opacity

---

# Elevation-2

Usage:

- Hovered cards
- Interactive panels
- Clickable containers

Behavior:

Increase shadow slightly during hover.

Transition:

200ms

---

# Elevation-3

Usage:

- Dropdown menus
- Context menus
- Floating action menus

Characteristics:

Visible separation without excessive blur.

---

# Elevation-4

Usage:

- Dialogs
- Confirmation modals
- Large overlays

Characteristics:

Clear separation from the background.

A semi-transparent backdrop must accompany all dialogs.

---

# Elevation-5

Usage:

- Floating action components
- Critical overlays
- Guided tours

Reserved for exceptional cases.

---

# Card Shadows

Dashboard cards should use Elevation-1 by default.

On hover:

Elevation-2

Cards should never appear completely flat unless intentionally disabled.

---

# Table Containers

Tables use:

Elevation-1

Hovering rows should not increase elevation.

Instead, use a background highlight.

---

# Forms

Form sections should use:

Elevation-1

Avoid stacking multiple shadows within the same container.

---

# Navigation

Sidebar

Flat

Top Navigation

Flat or Elevation-1 depending on layout

---

# Dialog Background

Dialogs must include:

- Semi-transparent overlay
- Background blur (optional in future versions)
- Center alignment

Users must clearly understand that the dialog is the active interaction.

---

# Hover Behavior

Hover transitions should be:

Duration

200ms

Timing

Ease-in-out

Never create dramatic elevation jumps.

---

# Mobile Rules

Mobile interfaces should reduce shadow intensity.

Elevation should remain visible but subtle.

Large floating shadows should be avoided on mobile.

---

# Accessibility

Elevation must never be the only indicator of interactivity.

Interactive components should also include:

- Hover state
- Focus state
- Cursor change (Web)
- Ripple or press feedback (Mobile)

---

# Developer Guidelines

## Angular

Use centralized shadow variables through SCSS design tokens.

Never define component-specific shadows.

---

## Flutter

Define shadow presets within ThemeData or reusable decoration classes.

Do not create custom BoxShadow values inside widgets.

---

# AI Implementation Notes

When generating UI components:

- Apply the correct elevation token.
- Never invent additional shadow levels.
- Use hover elevation only where documented.
- Keep shadow intensity subtle and professional.

---

# Governance

Any change to the elevation system requires:

1. Design review
2. Documentation update
3. Approval
4. Component update
5. Implementation

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