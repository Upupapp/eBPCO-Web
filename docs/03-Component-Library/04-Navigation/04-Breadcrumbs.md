# Breadcrumbs

Version: 1.0.0  
Status: Approved  
Document Owner: UI/UX Team

Category: Navigation

---

# Purpose

Breadcrumbs communicate the user's current location within the application's information hierarchy and provide a direct way to navigate back to parent pages.

They are primarily intended for the Angular Web Administration Portal, where users may navigate through multiple levels of records, modules, and detail pages.

---

# Objectives

Breadcrumbs should:

- Show the user's current location.
- Clarify page hierarchy.
- Provide quick access to parent pages.
- Reduce reliance on the browser back button.
- Maintain accessibility.
- Consume approved Design Tokens.

---

# Usage

Use Breadcrumbs when a page is two or more levels deep within the application hierarchy.

Examples:

- Dashboard / Businesses / Business Details
- Dashboard / Permit Applications / Application Details
- Reports / Payment Reports / Report Details
- User Management / Users / User Profile

Do not use Breadcrumbs on top-level pages such as Dashboard, Notifications, or Settings.

---

# Anatomy

A Breadcrumb consists of:

- Root Item
- Parent Items
- Separator
- Current Page

Example:

Dashboard / Permit Applications / Application Details

The current page should appear as plain text and should not be interactive.

---

# Variants

## Standard Breadcrumb

Displays the full hierarchy.

Example:

Dashboard / Businesses / Business Details

Recommended for desktop layouts.

---

## Collapsed Breadcrumb

Collapses intermediate items when the hierarchy is long.

Example:

Dashboard / … / Permit Details

The collapsed item may open a menu containing hidden parent pages.

---

## Back Breadcrumb

Displays only the immediate parent page.

Example:

← Back to Applications

Recommended for narrow tablet layouts or simplified detail pages.

---

# Behavior

Breadcrumbs should:

- Reflect the current route.
- Update automatically during navigation.
- Preserve the correct hierarchy.
- Allow navigation to parent pages.
- Never replace primary navigation.

Breadcrumbs should not be used to represent user history. They represent the application's structural hierarchy.

---

# Hierarchy Guidelines

Breadcrumb hierarchy should:

- Begin from a stable top-level destination.
- Follow the application's information architecture.
- Use the same terminology as the Sidebar and page titles.
- Avoid unnecessary levels.
- Limit visible items where possible.

Recommended maximum:

- Five visible levels on desktop
- Three visible levels on tablet

When the hierarchy exceeds the limit, collapse intermediate items.

---

# Labels

Breadcrumb labels should:

- Be concise.
- Match page titles.
- Use title case consistently.
- Avoid technical route names.
- Avoid identifiers unless needed for context.

Preferred:

Dashboard / Applications / Application Details

Avoid:

home / permit-applications / application-id-1001

When a record name is useful, use a readable label.

Example:

Businesses / Santos Trading / Permit Applications

---

# Separators

Use a consistent separator across the application.

Recommended:

- Slash `/`
- Chevron `›`

Separators should not be interactive and should be hidden from assistive technologies where appropriate.

---

# Current Page

The current page should:

- Appear last.
- Use readable text.
- Be visually distinct.
- Not be clickable.
- Match the page heading.

---

# Accessibility

Breadcrumbs shall:

- Meet WCAG 2.1 AA.
- Use a navigation landmark.
- Include an accessible label such as `Breadcrumb`.
- Support keyboard navigation.
- Provide visible focus indicators.
- Identify the current page using appropriate semantic attributes.

The current item should expose `aria-current="page"` in Angular implementations.

---

# Responsive Behavior

## Desktop

- Display the full hierarchy where space permits.
- Collapse intermediate items when necessary.

## Tablet

- Display fewer hierarchy levels.
- Use collapsed or back variants when space is limited.

## Mobile

Breadcrumbs are generally not recommended.

Use:

- App Bar back navigation
- Page title
- Stepper for guided workflows

Breadcrumbs may be used on large-screen Flutter layouts only when the application hierarchy requires them.

---

# Design Tokens

Breadcrumbs consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Icon Tokens
- Motion Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular Breadcrumbs should:

- Be implemented as a reusable shared component.
- Integrate with Angular Router.
- Generate items from approved route metadata.
- Consume centralized SCSS tokens.
- Support collapsed items.
- Mark the active item semantically.

Recommended location:

shared/components/navigation/breadcrumbs/

Recommended route metadata:

```typescript
{
  path: 'applications',
  data: {
    breadcrumb: 'Permit Applications'
  }
}
```

Breadcrumb labels should not be generated directly from raw URL segments.

---

# Flutter Implementation

Breadcrumbs are not required for standard mobile layouts.

For large-screen Flutter layouts, Breadcrumbs should:

- Reuse a shared widget.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.
- Support configurable items and separators.

Recommended location:

shared/widgets/navigation/breadcrumbs/

---

# Related Components

- Sidebar – primary desktop navigation.
- App Bar – page title and back navigation.
- Stepper – progress through guided workflows.
- Tabs – navigation between related views.
- Menus – access to collapsed breadcrumb items.

---

# Implementation Checklist

- [ ] Uses approved Design Tokens
- [ ] Supports WCAG 2.1 AA
- [ ] Reflects the current route
- [ ] Uses readable labels
- [ ] Supports keyboard navigation
- [ ] Marks the current page correctly
- [ ] Collapses gracefully when space is limited
- [ ] Matches Brand Guidelines
- [ ] Matches Design System

---

# Do

✔ Use Breadcrumbs on deeply nested pages.

✔ Match labels with page titles and Sidebar terminology.

✔ Keep the current page non-interactive.

✔ Collapse intermediate items when necessary.

✔ Generate Breadcrumbs from approved route metadata.

---

# Don't

✘ Use Breadcrumbs on top-level pages.

✘ Treat Breadcrumbs as browsing history.

✘ Generate labels from raw route names.

✘ Make the current page clickable.

✘ Use Breadcrumbs as a replacement for the Sidebar or App Bar.

---

# eBPCO Examples

## Business Registration

Dashboard / Business Registration / Business Details

## Permit Applications

Dashboard / Permit Applications / Application Details

## Payments

Dashboard / Payments / Payment Details

## Reports

Reports / Permit Reports / Report Details

## User Management

User Management / Users / User Profile

---

# AI Development Guidelines

AI-generated Breadcrumbs must:

- Reuse the documented shared component.
- Consume Design Tokens.
- Preserve semantic accessibility.
- Use approved application terminology.
- Derive hierarchy from route metadata.
- Avoid undocumented variants.

AI must not create Breadcrumb labels from internal path names or database identifiers without formatting them for users.

---

# Governance

All Breadcrumb implementations within the eBPCO ecosystem shall comply with this specification.

Changes to hierarchy rules, labels, separators, or variants require UI/UX approval before implementation.

---

# Approval

Project

Electronic Business Permit and Clearance Office (eBPCO)

Platforms

- Angular Web Administration Portal
- Flutter Mobile Application for large-screen layouts only

Status

Approved

Version

1.0.0