# 09 Responsive System

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Layout

---

# Purpose

The Responsive System defines how the eBPCO interface adapts across different screen sizes and device types.

It ensures a consistent user experience while allowing layouts, navigation, and components to adjust appropriately for desktop, tablet, and mobile environments.

This document applies to both the Angular Web Administration Portal and the Flutter Mobile Application.

---

# Objectives

The Responsive System exists to:

- Maintain usability across all devices.
- Improve accessibility.
- Standardize responsive behavior.
- Reduce layout inconsistencies.
- Support scalable frontend development.
- Improve AI-assisted frontend implementation.

---

# Source of Truth

The official responsive behavior shall be based on the approved Angular Web Administration Portal.

Flutter shall follow the same design principles while remaining mobile-first.

---

# Responsive Principles

Every screen must:

- Adapt without horizontal scrolling.
- Preserve readability.
- Maintain visual hierarchy.
- Keep interactive elements accessible.
- Avoid overlapping content.
- Reflow content gracefully.

---

# Supported Devices

The eBPCO ecosystem supports:

- Desktop
- Laptop
- Tablet
- Mobile Phone

Layouts should remain functional across common screen resolutions.

---

# Breakpoint Strategy

The Design System defines four responsive categories:

## Mobile

Small-screen devices using a single-column layout.

Characteristics:

- Stacked components
- Simplified navigation
- Touch-first interactions
- Compact spacing

---

## Tablet

Medium-sized devices with flexible layouts.

Characteristics:

- Two-column layouts where appropriate
- Condensed navigation
- Adaptive spacing
- Responsive forms

---

## Desktop

Large-screen devices with expanded layouts.

Characteristics:

- Multi-column layouts
- Sidebar navigation
- Larger data tables
- Dashboard widgets

---

## Large Desktop

Wide displays with additional whitespace.

Characteristics:

- Maximum content width
- Improved readability
- Optional secondary panels
- Larger dashboards

---

# Navigation Behaviour

Navigation should adapt based on screen size.

Desktop

- Persistent sidebar
- Top app bar
- Breadcrumbs

Tablet

- Collapsible sidebar
- Top navigation

Mobile

- Drawer navigation
- Bottom navigation (where applicable)
- Simplified menus

Flutter should prioritize mobile-native navigation patterns.

---

# Dashboard Behaviour

Desktop

- Multiple widgets per row
- Charts beside tables
- Summary cards in a horizontal layout

Tablet

- Reduced columns
- Flexible widget sizing

Mobile

- Single-column widgets
- Stacked cards
- Vertical scrolling

---

# Form Behaviour

Desktop

- Multi-column forms
- Side-by-side inputs

Tablet

- Mixed column layout

Mobile

- Single-column forms
- Full-width inputs
- Larger touch targets

---

# Table Behaviour

Desktop

- Full-featured data tables
- Multiple visible columns

Tablet

- Reduced visible columns
- Horizontal scrolling if necessary

Mobile

- Card-based presentation when appropriate
- Simplified table interactions

---

# Card Behaviour

Cards should resize automatically while preserving:

- Padding
- Alignment
- Typography
- Visual hierarchy

Cards should never appear cramped.

---

# Dialog Behaviour

Desktop

- Centered modal windows

Tablet

- Medium-width dialogs

Mobile

- Full-screen dialogs or bottom sheets where appropriate

---

# Typography Behaviour

Typography should scale appropriately.

Responsive typography should:

- Preserve readability.
- Maintain hierarchy.
- Prevent text overflow.

---

# Spacing Behaviour

Spacing Tokens should adapt by device category.

Examples:

Desktop

- Larger page spacing

Tablet

- Moderate spacing

Mobile

- Compact spacing

Token names remain consistent while implementations may vary.

---

# Image Behaviour

Images should:

- Scale proportionally.
- Never stretch.
- Maintain aspect ratio.
- Support responsive resizing.

---

# Accessibility

Responsive layouts must:

- Support zoom up to 200%.
- Maintain keyboard navigation.
- Preserve touch accessibility.
- Keep controls reachable.
- Avoid hidden functionality.

---

# Platform Implementation

## Angular

Responsive layouts should be implemented using:

- CSS Grid
- Flexbox
- Media Queries
- Layout utilities

Components should avoid hardcoded widths.

---

## Flutter

Responsive layouts should use:

- LayoutBuilder
- MediaQuery
- Expanded
- Flexible
- Wrap
- GridView
- Sliver widgets where appropriate

Widgets should adapt dynamically to available space.

---

# Hardcoded Responsive Behaviour

Hardcoded screen-specific layouts are prohibited unless documented and approved by the UI/UX Team.

---

# AI Development Guidelines

AI-generated code must:

- Follow the approved responsive strategy.
- Reuse responsive layout utilities.
- Preserve usability across supported devices.
- Avoid arbitrary breakpoint logic.
- Respect accessibility requirements.

---

# Governance

Every screen within the eBPCO ecosystem must comply with the approved Responsive System.

Responsive behavior shall be validated during UI review before implementation approval.

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