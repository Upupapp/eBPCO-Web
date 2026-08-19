# Tabs

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Navigation

---

# Purpose

Tabs organize related content into separate views within the same page, allowing users to switch between sections without navigating away from the current context.

Tabs improve discoverability while reducing page complexity and unnecessary navigation.

This specification applies to both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Tabs should:

- Organize related information.
- Reduce unnecessary page navigation.
- Clearly indicate the active view.
- Maintain accessibility.
- Consume approved Design Tokens.

---

# Usage

Use Tabs when content belongs to the same object or workflow but is easier to understand when divided into logical sections.

Recommended eBPCO examples:

- Business Information
- Business Owner
- Uploaded Documents
- Payment History
- Permit Status
- Inspection Results
- User Profile
- Activity Logs

Do not use Tabs to navigate between unrelated modules such as Dashboard, Payments, and Reports.

---

# Anatomy

A Tab component consists of:

- Tab Container
- Tab Items
- Active Indicator
- Associated Content Panel

Example

+------------------------------------------------------+
| Business Info | Documents | Payments | Activity      |
+------------------------------------------------------+

Content changes below the Tabs without leaving the page.

---

# Variants

## Standard Tabs

Displays text labels only.

Recommended for:

- Forms
- Profile pages
- Detail pages

---

## Icon Tabs

Displays an icon with each label.

Recommended for:

- Mobile layouts
- Frequently used sections

Example

📄 Documents

💳 Payments

📈 Activity

---

## Scrollable Tabs

Allows horizontal scrolling when many tabs are required.

Recommended for:

- Mobile devices
- Complex administrative pages

Avoid more than six visible tabs.

---

## Fixed Tabs

Each tab occupies equal width.

Recommended for:

- Three to five tabs
- Short labels

---

# Behavior

Tabs should:

- Switch content without reloading the page.
- Preserve user-entered data when appropriate.
- Clearly highlight the active tab.
- Maintain scroll position where applicable.
- Animate transitions subtly.

Switching tabs should not unexpectedly reset user progress.

---

# Labels

Tab labels should:

- Be concise.
- Use Title Case.
- Match terminology used elsewhere in the application.
- Avoid abbreviations.

Preferred:

- Business Information
- Documents
- Payments
- Activity

Avoid:

- Docs
- Biz Info
- Hist.

---

# Active State

The active tab should be clearly distinguished using:

- Accent indicator
- Bold typography
- Active background (optional)
- Accessible contrast

Only one tab may be active at a time.

---

# Accessibility

Tabs shall:

- Meet WCAG 2.1 AA.
- Support keyboard navigation.
- Provide visible focus indicators.
- Associate each tab with its corresponding content panel.
- Clearly identify the active tab for assistive technologies.

---

# Responsive Behavior

## Desktop

- Display all tabs where space permits.
- Prefer Standard Tabs.

## Tablet

- Use scrollable tabs if necessary.
- Maintain touch-friendly spacing.

## Mobile

- Prefer scrollable tabs.
- Keep labels readable.
- Avoid wrapping labels onto multiple lines.

---

# Design Tokens

Tabs consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Motion Tokens
- Size Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular Tabs should:

- Be implemented as reusable shared components.
- Integrate with Angular Router where appropriate.
- Consume centralized SCSS tokens.
- Support lazy loading of tab content when beneficial.

Recommended location:

shared/components/navigation/tabs/

---

# Flutter Implementation

Flutter Tabs should:

- Reuse shared TabBar widgets.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.
- Support swipe gestures where appropriate.

Recommended location:

shared/widgets/navigation/tabs/

---

# Related Components

- Breadcrumbs – page hierarchy.
- Stepper – guided multi-step workflows.
- Menus – contextual navigation.
- App Bar – page title and global actions.

---

# Implementation Checklist

- [ ] Uses approved Design Tokens
- [ ] Supports WCAG 2.1 AA
- [ ] Responsive across all breakpoints
- [ ] Reusable shared component
- [ ] Clearly indicates active tab
- [ ] Preserves user state where appropriate
- [ ] Matches Brand Guidelines
- [ ] Matches Design System

---

# Do

✔ Use Tabs for closely related content.

✔ Keep labels short and descriptive.

✔ Preserve entered form data when switching tabs.

✔ Limit the number of visible tabs.

✔ Reuse the shared Tabs component.

---

# Don't

✘ Use Tabs for unrelated modules.

✘ Hide essential information behind excessive tabs.

✘ Use vague labels.

✘ Reset user progress when changing tabs.

✘ Create undocumented Tab variants.

---

# eBPCO Examples

## Business Registration

- Business Information
- Owner Details
- Documents
- Payment

## Permit Application

- Application Details
- Requirements
- Payment
- Status

## User Management

- Profile
- Roles
- Activity Logs

## Reports

- Daily
- Monthly
- Annual

---

# AI Development Guidelines

AI-generated Tabs must:

- Reuse documented components.
- Consume Design Tokens.
- Preserve accessibility.
- Maintain consistent terminology.
- Avoid undocumented layouts or behaviors.

---

# Governance

All Tab implementations within the eBPCO ecosystem shall comply with this specification.

Changes to Tab variants, labels, or behavior require UI/UX approval before implementation.

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