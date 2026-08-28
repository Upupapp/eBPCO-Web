# Bottom Navigation

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Navigation

---

# Purpose

Bottom Navigation provides persistent access to the application's primary destinations on mobile devices. It enables users to switch between key modules quickly without relying on hierarchical menus.

This specification applies primarily to the Flutter Mobile Application.

---

# Objectives

Bottom Navigation should:

- Provide fast access to primary modules.
- Clearly indicate the active destination.
- Minimize navigation effort.
- Maintain consistency across the application.
- Support accessibility.
- Consume approved Design Tokens.

---

# Usage

Use Bottom Navigation only for the application's most frequently accessed destinations.

Recommended eBPCO destinations:

- Home
- Applications
- Notifications
- Profile

Avoid placing infrequently used features such as Settings or Help directly in Bottom Navigation. These should be accessible through the Profile screen or a Drawer.

---

# Anatomy

A Bottom Navigation consists of:

- Navigation Container
- Navigation Items
- Icon
- Label
- Active Indicator

Example

+------------------------------------------------------+
|                                                      |
|               Page Content                           |
|                                                      |
+------------------------------------------------------+
| 🏠 Home | 📄 Applications | 🔔 Notifications | 👤 Profile |
+------------------------------------------------------+

---

# Variants

## Fixed Bottom Navigation

All destinations are displayed simultaneously.

Recommended for:

- Three to five navigation items.

---

## Icon and Label

Each navigation item includes:

- Icon
- Text Label

Labels should always remain visible.

---

## Active Indicator

The selected destination should be visually distinguished using:

- Accent color
- Active indicator
- Filled icon (optional)
- Bold label

Only one destination may be active at a time.

---

# Behavior

Bottom Navigation should:

- Remain visible while navigating primary modules.
- Preserve navigation state where appropriate.
- Clearly indicate the selected destination.
- Animate smoothly between destinations.
- Avoid unexpected layout shifts.

---

# Navigation Hierarchy

Bottom Navigation should contain a maximum of five destinations.

Recommended order:

1. Home
2. Applications
3. Notifications
4. Profile

If a fifth destination is required, prioritize:

- Businesses

Avoid exceeding five items, as it reduces usability on mobile devices.

---

# Icons

Every destination shall include:

- Meaningful icon
- Text label

Icons should follow the documented Icon specification.

Icons alone must never be used without labels.

---

# Labels

Labels should:

- Be concise.
- Use consistent terminology.
- Match the names used throughout the application.

Preferred

- Home
- Applications
- Notifications
- Profile

Avoid abbreviations.

---

# Accessibility

Bottom Navigation shall:

- Meet WCAG 2.1 AA.
- Support screen readers.
- Maintain sufficient touch target size (minimum 44 × 44 points).
- Provide visible focus indicators where applicable.
- Clearly announce the active destination.

---

# Responsive Behavior

Mobile

- Persistent at the bottom of the screen.
- Respect safe areas.
- Maintain comfortable spacing.

Tablet

Bottom Navigation may be replaced by a Navigation Rail or Drawer depending on available screen width.

Desktop

Bottom Navigation should not be used.

Use Sidebar navigation instead.

---

# Design Tokens

Bottom Navigation consumes:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Motion Tokens
- Elevation Tokens
- Size Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular applications should not use Bottom Navigation as the primary navigation pattern.

Equivalent navigation should be implemented using:

- Sidebar
- App Bar
- Breadcrumbs

---

# Flutter Implementation

Flutter Bottom Navigation should:

- Reuse a shared navigation widget.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.
- Support configurable destinations.

Recommended location:

shared/widgets/navigation/bottom_navigation/

---

# Related Components

- App Bar – global page header.
- Drawer – secondary navigation.
- Sidebar – desktop navigation.
- Menus – contextual actions.

---

# Implementation Checklist

- [ ] Uses approved Design Tokens
- [ ] Supports WCAG 2.1 AA
- [ ] Responsive across mobile devices
- [ ] Reusable shared component
- [ ] Displays active destination
- [ ] Uses icons with labels
- [ ] Matches Brand Guidelines
- [ ] Matches Design System

---

# Do

✔ Limit navigation to core destinations.

✔ Keep labels short and consistent.

✔ Maintain the active state clearly.

✔ Respect mobile safe areas.

✔ Reuse the shared Bottom Navigation component.

---

# Don't

✘ Display more than five destinations.

✘ Use Bottom Navigation on desktop.

✘ Hide labels.

✘ Change navigation order between screens.

✘ Create undocumented navigation variants.

---

# eBPCO Examples

Citizen Mobile Application

Home

Applications

Notifications

Profile

Example Navigation

🏠 Home

📄 Applications

🔔 Notifications

👤 Profile

---

# AI Development Guidelines

AI-generated Bottom Navigation components must:

- Reuse documented components.
- Consume Design Tokens.
- Preserve accessibility.
- Maintain the approved destination hierarchy.
- Avoid undocumented layouts or additional destinations.

---

# Governance

All Bottom Navigation implementations within the eBPCO ecosystem shall comply with this specification.

Changes to navigation destinations or variants require UI/UX approval before implementation.

---

# Approval

Project

Electronic Building Permit and Certificate of Occupancy (eBPCO)

Platforms

- Flutter Mobile Application

Status

Approved

Version

1.0.0