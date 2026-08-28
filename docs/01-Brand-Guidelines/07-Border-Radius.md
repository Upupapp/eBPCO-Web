# 07 Border Radius

Version: 1.0.0  
Status: Approved  
Document Owner: UI/UX Team

---

# Purpose

Border radius contributes to the visual personality of the eBPCO platform.

The objective is to create a modern, approachable, and professional government interface without excessive rounding or overly sharp corners.

Every reusable component must use only the approved radius tokens defined in this document.

---

# Design Principles

The border radius system follows these principles:

- Consistent
- Professional
- Minimal
- Predictable
- Reusable

Border radius must never become decorative.

---

# Border Radius Scale

| Token | Value | Usage |
|--------|------:|-------|
| Radius-0 | 0px | Tables, dividers, flat elements |
| Radius-1 | 4px | Badges, chips |
| Radius-2 | 8px | Inputs, buttons, dropdowns |
| Radius-3 | 12px | Cards |
| Radius-4 | 16px | Dialogs |
| Radius-Full | 9999px | Pills, avatars |

Only these values are permitted.

---

# Component Standards

## Buttons

Radius Token

Radius-2

Usage

Primary

Secondary

Outline

Danger

Icon Buttons

---

## Inputs

Radius Token

Radius-2

Applies to:

- Text Fields
- Password Fields
- Search Bars
- Dropdowns
- Date Pickers

---

## Cards

Radius Token

Radius-3

Applies to:

- Dashboard Cards
- Statistic Cards
- Information Cards
- Form Containers

---

## Dialogs

Radius Token

Radius-4

Applies to:

- Confirmation Dialogs
- Alert Dialogs
- Forms
- Success Messages

---

## Tables

Outer Container

Radius-3

Rows

No individual rounding

---

## Chips & Badges

Radius Token

Radius-Full

Applies to:

- Status Badges
- Filter Chips
- Tags

---

## Navigation

Sidebar

No rounding

Top Navigation

No rounding

Floating Navigation Elements

Radius-3

---

# Usage Rules

Use the smallest radius that provides visual clarity.

Avoid mixing multiple radius values within the same component.

Do not create custom radius values.

---

# Accessibility

Border radius must never reduce usability.

Touch targets must remain large enough regardless of corner radius.

---

# Responsive Behaviour

Border radius remains consistent across:

- Desktop
- Tablet
- Mobile

Only component sizing changes.

---

# Angular Implementation Notes

Use centralized SCSS design tokens.

Example:

```
$radius-sm
$radius-md
$radius-lg
```

Components must not define custom radius values.

---

# Flutter Implementation Notes

Use centralized BorderRadius constants.

Example:

```
AppRadius.small
AppRadius.medium
AppRadius.large
```

Avoid inline BorderRadius.circular() values.

---

# AI Generation Notes

When generating UI:

- Use only documented radius tokens.
- Never invent new radius values.
- Match the component's approved radius.

---

# Governance

Border radius changes require:

1. Design review
2. Documentation update
3. Approval
4. Component update
5. Implementation

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