# 07 Elevation

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Foundation

---

# Purpose

Elevation defines the visual depth hierarchy used throughout the eBPCO ecosystem.

It establishes how components are layered relative to one another, creating a predictable and consistent user interface across the Angular Web Administration Portal and Flutter Mobile Application.

Elevation works together with Shadow Tokens to communicate component importance, interaction, and spatial relationships.

---

# Objectives

The Elevation system exists to:

- Establish a clear visual hierarchy.
- Improve readability.
- Reinforce interaction states.
- Standardize component layering.
- Prevent inconsistent use of shadows.
- Improve maintainability.
- Support AI-assisted frontend development.

---

# Source of Truth

The official elevation hierarchy shall be derived from the approved Angular Web Administration Portal.

Flutter shall implement equivalent elevation behavior using Material Design principles while maintaining visual consistency.

---

# Elevation Levels

The eBPCO Design System defines seven elevation levels.

```
Elevation 0

Elevation 1

Elevation 2

Elevation 3

Elevation 4

Elevation 5

Elevation 6
```

Each level maps to an approved Shadow Token.

---

# Elevation Hierarchy

## Elevation 0

Flat interface elements.

Typical components:

- Page background
- Containers
- Layout sections
- Dividers

No shadow.

---

## Elevation 1

Low emphasis components.

Typical components:

- Input fields
- Basic cards
- Navigation items
- Dashboard widgets

Uses:

```
shadow-sm
```

---

## Elevation 2

Interactive components.

Typical components:

- Buttons
- Elevated cards
- Search panels
- Filter panels

Uses:

```
shadow-md
```

---

## Elevation 3

Temporary surfaces.

Typical components:

- Dropdown menus
- Context menus
- Floating panels
- Popovers

Uses:

```
shadow-lg
```

---

## Elevation 4

High-priority overlays.

Typical components:

- Dialogs
- Side drawers
- Bottom sheets

Uses:

```
shadow-xl
```

---

## Elevation 5

Critical interface elements.

Typical components:

- Floating Action Button
- Floating notification panels
- System alerts

Uses:

Largest approved shadow.

---

## Elevation 6

Application overlays.

Typical components:

- Loading overlays
- Global modals
- Blocking dialogs
- Emergency alerts

Uses:

Overlay shadow with backdrop.

---

# Component Mapping

Every reusable component must have a documented elevation level.

Examples:

| Component | Elevation |
|------------|-----------|
| Button | 2 |
| Card | 1 |
| Dialog | 4 |
| Navigation Drawer | 4 |
| Dropdown | 3 |
| Tooltip | 3 |
| Floating Action Button | 5 |
| Overlay | 6 |

---

# Interaction Behaviour

Elevation may change during interaction.

Examples:

Default

```
Elevation 1
```

Hover

```
Elevation 2
```

Pressed

```
Elevation 1
```

Dragging

```
Elevation 3
```

Animation between elevations should remain subtle and consistent.

---

# Accessibility

Elevation must never be the only indicator of:

- Focus
- Selection
- Validation
- Interaction

Additional visual cues such as:

- Borders
- Color
- Focus rings
- Icons

must accompany important interactions.

---

# Platform Implementation

## Angular

Elevation should be implemented through:

- Shadow Tokens
- SCSS variables
- CSS custom properties

Components should never define custom elevation values.

---

## Flutter

Elevation should be implemented using:

- Material elevation
- BoxShadow through AppShadows
- ThemeData

Widgets must use the centralized elevation definitions.

---

# Hardcoded Elevation

Hardcoded shadow values or arbitrary z-index layering are prohibited unless approved by the UI/UX Team.

---

# Z-Index Guidelines

The visual stacking order shall remain consistent.

Typical order:

```
Background

Content

Cards

Navigation

Dropdowns

Dialogs

Loading Overlay

System Overlay
```

Components should follow the documented hierarchy to avoid overlapping inconsistencies.

---

# AI Development Guidelines

AI-generated code must:

- Follow the approved elevation hierarchy.
- Reuse Shadow Tokens.
- Avoid creating custom shadow levels.
- Preserve consistent layering across Angular and Flutter.

---

# Governance

Every component within the eBPCO ecosystem shall be assigned an approved elevation level.

Changes to the elevation hierarchy require approval from the UI/UX Team.

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