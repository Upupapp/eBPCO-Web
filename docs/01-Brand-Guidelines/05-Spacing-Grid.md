# 05 Spacing Grid

Version: 1.0.0  
Status: Approved  
Document Owner: UI/UX Team

---

# Purpose

The spacing system defines the official measurements used throughout the eBPCO ecosystem.

It provides a consistent rhythm for layouts, components, forms, tables, navigation, and dashboards.

All spacing values shall follow this document.

Developers must never use arbitrary spacing values.

---

# Design Philosophy

The spacing system is based on an **8-point grid**, with support for a 4-point subdivision where finer control is required.

Benefits include:

- Consistent layouts
- Predictable alignment
- Easier responsive design
- Reusable components
- Better visual rhythm
- Faster frontend development

---

# Base Unit

The official spacing unit is:

```

8px

```

Half spacing is permitted where appropriate:

```

4px

```

No other custom spacing values should be introduced without approval.

---

# Official Spacing Scale

| Token | Value | Usage |
|--------|------:|------|
| Space-0 | 0px | Remove spacing |
| Space-1 | 4px | Fine adjustments |
| Space-2 | 8px | Standard internal spacing |
| Space-3 | 12px | Small component spacing |
| Space-4 | 16px | Default spacing |
| Space-5 | 24px | Section spacing |
| Space-6 | 32px | Card spacing |
| Space-7 | 40px | Large layout spacing |
| Space-8 | 48px | Dashboard spacing |
| Space-9 | 64px | Major page separation |

---

# Page Layout

Recommended desktop page padding:

32px

Tablet:

24px

Mobile:

16px

---

# Dashboard Layout

Spacing between dashboard cards:

24px

Spacing between sections:

32px

Spacing between charts:

24px

---

# Sidebar

Top padding:

24px

Menu spacing:

8px

Icon spacing:

12px

Section spacing:

24px

---

# Header

Horizontal padding:

24px

Vertical padding:

16px

Gap between actions:

16px

---

# Cards

Internal padding:

24px

Gap between title and content:

16px

Gap between content blocks:

24px

---

# Forms

Spacing between fields:

16px

Spacing between sections:

32px

Spacing between label and input:

8px

Spacing between helper text and field:

4px

Spacing between buttons:

16px

---

# Tables

Padding inside cells:

16px

Gap between filters:

16px

Spacing between toolbar and table:

24px

Spacing below pagination:

24px

---

# Buttons

Horizontal padding:

16px

Vertical padding:

12px

Gap between icon and text:

8px

Gap between grouped buttons:

12px

---

# Dialogs

Outer padding:

24px

Gap between title and content:

16px

Gap between content and actions:

24px

Gap between buttons:

12px

---

# Lists

Vertical spacing:

8px

Nested spacing:

16px

Group spacing:

24px

---

# Responsive Rules

Desktop

32px page padding

Tablet

24px page padding

Mobile

16px page padding

Spacing should decrease proportionally while preserving hierarchy.

---

# Alignment

All layouts should align to the same vertical rhythm.

Avoid manually adjusting component positions.

Use the spacing scale instead.

---

# Developer Guidelines

Angular

Use spacing design tokens or SCSS variables.

Flutter

Use centralized spacing constants.

Never hardcode spacing values.

---

# Governance

Spacing values may only be modified through:

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