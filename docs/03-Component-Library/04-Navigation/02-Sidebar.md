# Sidebar

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Navigation

---

# Purpose

The Sidebar provides persistent, hierarchical navigation for desktop and tablet interfaces. It serves as the primary method for accessing major modules within the Angular Web Administration Portal.

The Sidebar enables administrators to move efficiently between features while maintaining awareness of their current location.

---

# Objectives

The Sidebar should:

- Provide access to primary application modules.
- Clearly indicate the active page.
- Support nested navigation where appropriate.
- Scale as new modules are introduced.
- Maintain accessibility.
- Consume approved Design Tokens.

---

# Usage

Use the Sidebar for high-level navigation between major functional areas.

Typical eBPCO modules include:

- Dashboard
- Business Registration
- Permit Applications
- Payments
- Reports
- Notifications
- User Management
- Audit Logs
- Settings

The Sidebar should remain visible on desktop and be collapsible on tablet devices.

---

# Anatomy

A Sidebar consists of:

- Application Logo
- Application Name
- Navigation Groups
- Navigation Items
- Optional Nested Items
- Collapse / Expand Control
- Optional Footer Actions

Example

+------------------------------------+
| eBPCO                              |
|------------------------------------|
| 🏠 Dashboard                       |
| 🏢 Business Registration           |
| 📄 Permit Applications             |
| 💳 Payments                        |
| 📊 Reports                         |
| 👥 User Management                 |
| ⚙ Settings                        |
|------------------------------------|
| Collapse ◀                        |
+------------------------------------+

---

# Variants

## Expanded Sidebar

Displays:

- Icons
- Labels
- Navigation groups
- Nested items

Recommended for desktop.

---

## Collapsed Sidebar

Displays:

- Icons only
- Tooltips on hover
- Expand control

Recommended when screen space is limited.

---

## Grouped Sidebar

Organizes navigation into logical sections.

Example

Operations

- Business Registration
- Permit Applications
- Payments

Administration

- Users
- Audit Logs
- Settings

---

# Behavior

The Sidebar should:

- Highlight the active module.
- Preserve expanded or collapsed state when appropriate.
- Support nested navigation.
- Scroll independently if content exceeds viewport height.
- Avoid horizontal scrolling.

---

# Navigation Hierarchy

Organize items from highest to lowest priority.

Recommended order:

1. Dashboard
2. Business Registration
3. Permit Applications
4. Payments
5. Reports
6. Notifications
7. User Management
8. Audit Logs
9. Settings

Avoid placing rarely used features above core business workflows.

---

# Icons

Each navigation item should include a meaningful icon.

Icons should:

- Be consistent across the application.
- Follow the documented Icon specification.
- Never replace text labels in expanded mode.

---

# Active State

The active navigation item should be clearly distinguished using:

- Highlighted background
- Accent indicator
- Bold typography
- Accessible contrast

Only one primary navigation item should appear active at a time.

---

# Accessibility

The Sidebar shall:

- Meet WCAG 2.1 AA.
- Support keyboard navigation.
- Include visible focus indicators.
- Announce navigation landmarks to screen readers.
- Clearly indicate the active page.

Collapsed items must provide accessible labels.

---

# Responsive Behavior

Desktop

- Expanded by default.
- Persistent.

Tablet

- Collapsible.
- Expand on demand.

Mobile

The Sidebar should not be used as the primary navigation.

Use:

- Drawer
- Bottom Navigation

instead.

---

# Design Tokens

The Sidebar consumes:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Motion Tokens
- Elevation Tokens
- Size Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular Sidebars should:

- Be reusable shared components.
- Integrate with Angular Router.
- Consume centralized SCSS tokens.
- Support configurable navigation items and nested routes.

Recommended location:

shared/components/navigation/sidebar/

---

# Flutter Implementation

Flutter should not use a persistent Sidebar.

Equivalent functionality should be implemented using:

- Drawer
- Bottom Navigation

A Sidebar may be used only on large-screen layouts such as tablets or desktop Flutter deployments.

---

# Related Components

- App Bar – global header.
- Drawer – collapsible navigation for mobile.
- Bottom Navigation – primary mobile navigation.
- Menus – contextual navigation.

---

# Implementation Checklist

- [ ] Uses approved Design Tokens
- [ ] Supports WCAG 2.1 AA
- [ ] Responsive across supported breakpoints
- [ ] Reusable shared component
- [ ] Clearly indicates the active page
- [ ] Supports nested navigation
- [ ] Matches Brand Guidelines
- [ ] Matches Design System

---

# Do

✔ Group related navigation items.

✔ Keep labels concise.

✔ Display meaningful icons.

✔ Highlight the active page.

✔ Preserve navigation consistency across modules.

---

# Don't

✘ Overcrowd the Sidebar.

✘ Use ambiguous labels.

✘ Hide essential modules.

✘ Create inconsistent navigation hierarchies.

✘ Introduce undocumented Sidebar variants.

---

# eBPCO Examples

Operations

- Dashboard
- Business Registration
- Permit Applications
- Payments

Management

- Reports
- User Management
- Audit Logs

System

- Notifications
- Settings

---

# AI Development Guidelines

AI-generated Sidebars must:

- Reuse documented components.
- Consume Design Tokens.
- Preserve accessibility.
- Maintain the approved navigation hierarchy.
- Avoid undocumented layouts or navigation items.

---

# Governance

All Sidebar implementations within the eBPCO ecosystem shall comply with this specification.

Changes to the navigation hierarchy or Sidebar variants require UI/UX approval before implementation.

---

# Approval

Project

Electronic Business Permit and Clearance Office (eBPCO)

Platforms

- Angular Web Administration Portal
- Flutter Mobile Application (Large Screen Layouts Only)

Status

Approved

Version

1.0.0