# App Bar

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Navigation

---

# Purpose

The App Bar provides a persistent navigation element at the top of the application that communicates the current page, reinforces branding, and offers quick access to frequently used actions.

The App Bar serves as the primary navigation header across the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

The App Bar should:

- Display the current page or module.
- Reinforce the eBPCO brand.
- Provide quick access to global actions.
- Maintain navigation consistency.
- Support accessibility.
- Consume approved Design Tokens.

---

# Usage

Use the App Bar on:

- Dashboard
- Business Registration
- Permit Applications
- Payments
- Notifications
- Reports
- User Management
- Settings
- Profile

The App Bar should remain visible throughout primary application workflows unless a full-screen experience requires otherwise.

---

# Anatomy

An App Bar consists of:

- Navigation Control (optional)
- Application Logo
- Page Title
- Optional Search
- Action Icons
- User Profile Menu

Example

+--------------------------------------------------------------+
| ☰  eBPCO        Business Registration        🔍 🔔 👤         |
+--------------------------------------------------------------+

---

# Variants

## Standard App Bar

Displays branding, title, and common actions.

Recommended for:

- Dashboard
- Forms
- Reports

---

## Search App Bar

Includes an integrated search field.

Recommended for:

- Business Records
- Applications
- Payments
- User Management

---

## Contextual App Bar

Displays page-specific actions.

Examples

- Export
- Print
- Filter
- Sort

---

## Mobile App Bar

Optimized for smaller screens.

Includes:

- Back button or menu icon
- Page title
- Limited action icons

---

# Behavior

The App Bar should:

- Remain fixed while scrolling where appropriate.
- Clearly display the active page.
- Adapt to screen size.
- Collapse or simplify on smaller screens.
- Preserve branding across modules.

---

# Actions

Common App Bar actions include:

- Search
- Notifications
- User Profile
- Help
- Settings
- Logout

Actions should appear in order of importance and frequency.

---

# Navigation Controls

Desktop

- Sidebar toggle (optional)
- Home navigation via logo

Mobile

- Back button
- Drawer menu button
- Context-specific navigation

Only one primary navigation control should appear at a time.

---

# Branding

The App Bar should include:

- eBPCO logo
- Official application name (when space permits)

Branding must follow the Brand Guidelines.

---

# Accessibility

The App Bar shall:

- Meet WCAG 2.1 AA.
- Support keyboard navigation.
- Provide visible focus indicators.
- Include descriptive labels for icons.
- Maintain sufficient contrast.

Interactive elements must have accessible names for assistive technologies.

---

# Responsive Behavior

Desktop

- Full branding
- Search field (optional)
- Multiple action icons
- User profile menu

Tablet

- Compact spacing
- Collapsible search
- Reduced actions

Mobile

- Back button or menu icon
- Page title
- Maximum of two action icons

Avoid overcrowding the App Bar on smaller screens.

---

# Design Tokens

The App Bar consumes:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Elevation Tokens
- Motion Tokens
- Size Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular App Bars should:

- Be reusable shared components.
- Integrate with Angular Router.
- Consume centralized SCSS tokens.
- Support configurable titles and actions.

Recommended location:

shared/components/navigation/app-bar/

---

# Flutter Implementation

Flutter App Bars should:

- Reuse shared AppBar widgets.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.
- Support configurable actions and titles.

Recommended location:

shared/widgets/navigation/app_bar/

---

# Related Components

- Sidebar – primary desktop navigation.
- Bottom Navigation – primary mobile navigation.
- Drawers – expandable navigation on mobile.
- Menus – secondary actions accessible from the App Bar.

---

# Implementation Checklist

- [ ] Uses approved Design Tokens
- [ ] Supports WCAG 2.1 AA
- [ ] Responsive across all breakpoints
- [ ] Reusable shared component
- [ ] Displays current page title
- [ ] Supports configurable actions
- [ ] Matches Brand Guidelines
- [ ] Matches Design System

---

# Do

✔ Keep page titles concise.

✔ Show only essential actions.

✔ Maintain consistent branding.

✔ Use descriptive icon labels.

✔ Reuse the shared App Bar component.

---

# Don't

✘ Overload the App Bar with actions.

✘ Display more than two action icons on mobile.

✘ Change branding between modules.

✘ Hide the current page title.

✘ Create undocumented App Bar variants.

---

# eBPCO Examples

Dashboard

- Dashboard title
- Notifications
- Profile

Business Registration

- Business Registration title
- Search
- Profile

Permit Applications

- Permit Applications title
- Filter
- Notifications

Reports

- Reports title
- Export
- Profile

Settings

- Settings title
- Help
- Profile

---

# AI Development Guidelines

AI-generated App Bars must:

- Reuse documented components.
- Consume Design Tokens.
- Preserve accessibility.
- Maintain consistent branding.
- Avoid undocumented layouts or variants.

---

# Governance

All App Bar implementations within the eBPCO ecosystem shall comply with this specification.

New App Bar variants require UI/UX approval before implementation.

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