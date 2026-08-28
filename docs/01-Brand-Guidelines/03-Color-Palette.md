# 03 Color Palette

Version: 1.0.0  
Status: Approved  
Document Owner: UI/UX Team

---

# Purpose

The eBPCO Color Palette defines the official color system used throughout the eBPCO ecosystem.

These colors establish a consistent visual identity across both the Angular Web Administration Portal and the Flutter Mobile Application.

Every interface, reusable component, and future enhancement must use these approved colors.

Developers should reference these colors through shared design tokens rather than hardcoding values.

---

# Design Principles

The eBPCO color system follows these principles:

- Professional
- Government Appropriate
- Accessible
- Consistent
- Calm
- High Readability
- Minimal Visual Noise

---

# Primary Brand Colors

| Token | Hex | Usage |
|--------|-----|-------|
| Primary 500 | #2563EB | Primary buttons, links, active navigation |
| Primary 600 | #1D4ED8 | Hover state |
| Primary 700 | #1E40AF | Pressed state |
| Primary 100 | #DBEAFE | Light backgrounds |
| Primary 50 | #EFF6FF | Page highlights |

---

# Secondary Colors

| Token | Hex | Usage |
|--------|-----|-------|
| Secondary 500 | #64748B | Secondary actions |
| Secondary 100 | #E2E8F0 | Secondary backgrounds |
| Secondary 50 | #F8FAFC | Panels |

---

# Success Colors

| Token | Hex | Usage |
|--------|-----|-------|
| Success 500 | #16A34A | Approved |
| Success 100 | #DCFCE7 | Success backgrounds |
| Success Text | #166534 | Success text |

---

# Warning Colors

| Token | Hex | Usage |
|--------|-----|-------|
| Warning 500 | #F59E0B | Pending |
| Warning 100 | #FEF3C7 | Warning backgrounds |
| Warning Text | #92400E | Warning text |

---

# Danger Colors

| Token | Hex | Usage |
|--------|-----|-------|
| Danger 500 | #DC2626 | Errors |
| Danger 100 | #FEE2E2 | Error backgrounds |
| Danger Text | #991B1B | Error text |

---

# Information Colors

| Token | Hex | Usage |
|--------|-----|-------|
| Info 500 | #0EA5E9 | Notifications |
| Info 100 | #E0F2FE | Information panels |
| Info Text | #0369A1 | Information text |

---

# Neutral Colors

| Token | Hex |
|--------|-----|
| Gray 900 | #111827 |
| Gray 800 | #1F2937 |
| Gray 700 | #374151 |
| Gray 600 | #4B5563 |
| Gray 500 | #6B7280 |
| Gray 400 | #9CA3AF |
| Gray 300 | #D1D5DB |
| Gray 200 | #E5E7EB |
| Gray 100 | #F3F4F6 |
| Gray 50 | #F9FAFB |

---

# Background Colors

| Token | Hex | Usage |
|--------|-----|-------|
| Background | #F8FAFC | Application background |
| Surface | #FFFFFF | Cards |
| Surface Secondary | #F1F5F9 | Panels |
| Sidebar | #FFFFFF | Navigation |
| Header | #FFFFFF | Top navigation |

---

# Text Colors

| Token | Hex |
|--------|-----|
| Heading | #111827 |
| Body | #374151 |
| Secondary | #6B7280 |
| Disabled | #9CA3AF |
| White | #FFFFFF |

---

# Border Colors

| Token | Hex |
|--------|-----|
| Border Light | #E5E7EB |
| Border Medium | #CBD5E1 |
| Border Strong | #94A3B8 |

---

# Status Colors

| Status | Color |
|----------|--------|
| Draft | Gray |
| Pending | Amber |
| Under Review | Blue |
| Approved | Green |
| Rejected | Red |
| Cancelled | Gray |
| Completed | Green |
| Expired | Orange |
| Archived | Slate |

---

# Dashboard Colors

Dashboard cards should use:

Primary Statistics

Blue

Financial

Green

Warnings

Amber

Errors

Red

Reports

Purple

System

Slate

---

# Charts

Recommended chart colors:

Blue

Green

Amber

Purple

Red

Cyan

Slate

No additional colors should be introduced unless documented.

---

# Accessibility

Color must never be the only indicator.

Always pair colors with:

- Icons
- Labels
- Badges
- Text

Example:

✔ Approved

instead of only a green circle.

---

# Dark Theme

Version 1.0 officially supports Light Theme only.

Future dark theme support shall define:

- Background
- Surface
- Borders
- Typography
- Status Colors

without changing semantic meanings.

---

# Developer Guidelines

Never hardcode color values.

Instead:

Angular

Use design tokens or CSS variables.

Flutter

Use ThemeData and centralized Color constants.

All components must reference shared tokens.

---

# Governance

Any new color requires:

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