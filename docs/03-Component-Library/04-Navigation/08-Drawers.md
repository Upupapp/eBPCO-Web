# Drawers

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Navigation

---

# Purpose

A Drawer is a slide-out navigation panel that provides access to secondary navigation destinations, user information, and application utilities.

It complements Bottom Navigation by exposing less frequently used features without increasing visual complexity.

This specification applies primarily to the Flutter Mobile Application and may be used for responsive tablet layouts.

---

# Objectives

Drawers should:

- Provide access to secondary destinations.
- Reduce clutter in primary navigation.
- Present user and account information.
- Support accessibility.
- Consume approved Design Tokens.

---

# Usage

Use Drawers for destinations that users access occasionally.

Recommended eBPCO destinations:

- Help & Support
- Frequently Asked Questions
- Contact Us
- Settings
- Privacy Policy
- Terms & Conditions
- About eBPCO
- Logout

Avoid placing high-frequency tasks such as Home or Applications exclusively inside the Drawer.

---

# Anatomy

A Drawer consists of:

- Header
- User Information
- Navigation Groups
- Navigation Items
- Optional Divider
- Footer Actions

Example

+----------------------------------+
| 👤 Juan Dela Cruz                |
| juan@email.com                   |
|----------------------------------|
| ⚙ Settings                      |
| ❓ Help & Support                |
| 📄 Privacy Policy               |
| ℹ About eBPCO                   |
|----------------------------------|
| 🚪 Logout                       |
+----------------------------------+

---

# Variants

## Standard Drawer

Displays navigation items with icons and labels.

Recommended for:

- Mobile
- Tablet

---

## Account Drawer

Highlights user information.

Includes:

- Profile picture
- Name
- Email
- Account type

Recommended after user authentication.

---

## Grouped Drawer

Groups related navigation items.

Example

Support

- Help
- Contact Us
- FAQ

Application

- Settings
- Privacy Policy
- About

---

# Behavior

Drawers should:

- Slide in smoothly.
- Close automatically after selecting a destination.
- Preserve the selected destination.
- Overlay content without permanently shifting layouts.
- Be dismissible by tapping outside the Drawer or using the system back gesture.

---

# Navigation Hierarchy

Recommended order:

Account

Support

Application Information

System Actions

Place Logout at the bottom to reduce accidental activation.

---

# User Information

The Drawer header may display:

- Profile picture
- Full name
- Registered email
- Business name (optional)
- Account role (optional)

Personal information should be concise and avoid truncating critical details where possible.

---

# Accessibility

Drawers shall:

- Meet WCAG 2.1 AA.
- Support keyboard navigation where applicable.
- Provide visible focus indicators.
- Announce opening and closing to assistive technologies.
- Maintain sufficient touch target sizes.

---

# Responsive Behavior

## Mobile

- Full-height overlay.
- Slide from the left.
- Respect safe areas.

## Tablet

- Wider Drawer with grouped navigation.
- Maintain consistent spacing.

## Desktop

Persistent navigation should use a Sidebar instead of a Drawer.

---

# Design Tokens

Drawers consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Elevation Tokens
- Motion Tokens
- Size Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular applications should not use Drawers as the primary navigation pattern.

Responsive Drawers may be used on tablet layouts where a Sidebar collapses into a temporary navigation panel.

Recommended location:

shared/components/navigation/drawer/

---

# Flutter Implementation

Flutter Drawers should:

- Reuse a shared Drawer widget.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.
- Support configurable sections and destinations.

Recommended location:

shared/widgets/navigation/drawer/

---

# Related Components

- Bottom Navigation – primary mobile navigation.
- Sidebar – primary desktop navigation.
- App Bar – contains the Drawer toggle.
- Menus – contextual actions.

---

# Implementation Checklist

- [ ] Uses approved Design Tokens
- [ ] Supports WCAG 2.1 AA
- [ ] Responsive across supported breakpoints
- [ ] Reusable shared component
- [ ] Displays user information consistently
- [ ] Groups navigation logically
- [ ] Matches Brand Guidelines
- [ ] Matches Design System

---

# Do

✔ Keep frequently used destinations in Bottom Navigation.

✔ Group related destinations.

✔ Display user information consistently.

✔ Place Logout at the bottom.

✔ Reuse the shared Drawer component.

---

# Don't

✘ Duplicate every Bottom Navigation item.

✘ Place critical workflows only inside the Drawer.

✘ Overcrowd the Drawer with rarely used links.

✘ Use inconsistent icons or labels.

✘ Create undocumented Drawer variants.

---

# eBPCO Examples

## Account

- Profile
- Account Settings

---

## Support

- Help & Support
- Frequently Asked Questions
- Contact Us

---

## Application

- Privacy Policy
- Terms & Conditions
- About eBPCO

---

## System

- Logout

---

# AI Development Guidelines

AI-generated Drawers must:

- Reuse documented components.
- Consume Design Tokens.
- Preserve accessibility.
- Maintain approved navigation grouping.
- Avoid undocumented layouts or destinations.

---

# Governance

All Drawer implementations within the eBPCO ecosystem shall comply with this specification.

Changes to Drawer structure, grouping, or variants require UI/UX approval before implementation.

---

# Approval

Project

Electronic Business Permit and Clearance Office (eBPCO)

Platforms

- Flutter Mobile Application
- Angular Web Administration Portal (Responsive Tablet Layouts Only)

Status

Approved

Version

1.0.0