# Pagination

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Navigation

---

# Purpose

Pagination divides large collections of data into manageable pages, allowing users to browse records efficiently without overwhelming the interface or degrading application performance.

This specification applies primarily to the Angular Web Administration Portal and, where appropriate, large-screen Flutter layouts.

---

# Objectives

Pagination should:

- Improve performance when displaying large datasets.
- Help users locate information efficiently.
- Maintain consistent navigation across data tables.
- Support accessibility.
- Consume approved Design Tokens.

---

# Usage

Use Pagination whenever displaying large datasets that cannot reasonably fit on a single screen.

Recommended eBPCO examples:

- Registered Businesses
- Permit Applications
- Payment Records
- User Accounts
- Audit Logs
- Notifications Archive
- Reports

For short lists or mobile-first experiences, consider infinite scrolling or "Load More" only when appropriate.

---

# Anatomy

A Pagination component consists of:

- Previous Button
- Page Numbers
- Current Page Indicator
- Next Button
- Page Size Selector (optional)
- Total Record Count

Example

< Previous   1   2   3   4   Next >

Showing 21–40 of 156 records

---

# Variants

## Standard Pagination

Displays page numbers with Previous and Next controls.

Recommended for:

- Tables
- Reports
- Administrative lists

---

## Compact Pagination

Displays only Previous and Next controls with the current page.

Example

< Previous   Page 3 of 12   Next >

Recommended for:

- Tablet layouts
- Smaller data tables

---

## Page Size Pagination

Allows users to change the number of records displayed.

Common options:

- 10
- 25
- 50
- 100

The selected page size should persist during the user's session where practical.

---

# Behavior

Pagination should:

- Clearly indicate the active page.
- Preserve filters and sorting when changing pages.
- Remember page size during the current session.
- Disable unavailable navigation controls.
- Update data without unnecessary page reloads.

Changing pages should not reset user-selected filters or search queries.

---

# Navigation Controls

Provide:

- First Page (optional)
- Previous
- Page Numbers
- Next
- Last Page (optional)

Previous should be disabled on the first page.

Next should be disabled on the last page.

---

# Page Size

Recommended default page sizes:

- 10 records
- 25 records
- 50 records

Avoid displaying excessively large datasets on a single page.

---

# Record Count

Display the total number of available records whenever possible.

Example

Showing 26–50 of 314 Businesses

This helps users understand the size of the dataset.

---

# Accessibility

Pagination shall:

- Meet WCAG 2.1 AA.
- Support keyboard navigation.
- Clearly indicate the active page.
- Provide visible focus indicators.
- Include descriptive labels for navigation controls.

The active page should be identified using appropriate semantic attributes.

---

# Responsive Behavior

## Desktop

- Display full pagination controls.
- Include page numbers and page size selector.

## Tablet

- Use compact pagination where space is limited.
- Reduce visible page numbers if necessary.

## Mobile

Avoid traditional numbered pagination.

Preferred alternatives:

- Load More
- Infinite Scrolling (where appropriate)
- Compact Previous/Next navigation

The choice should depend on the user task and expected dataset size.

---

# Design Tokens

Pagination consumes:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Motion Tokens
- Size Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular Pagination should:

- Be implemented as a reusable shared component.
- Integrate with Angular Material Table or custom table components.
- Consume centralized SCSS tokens.
- Support configurable page sizes and record counts.

Recommended location:

shared/components/navigation/pagination/

---

# Flutter Implementation

Flutter should:

- Use compact pagination or "Load More" for administrative tablet layouts.
- Prefer infinite scrolling only where it improves usability.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.

Recommended location:

shared/widgets/navigation/pagination/

---

# Related Components

- Tables – primary consumers of Pagination.
- Lists – may use compact pagination.
- Search – works with Pagination to filter results.
- Filters – should preserve state across page changes.

---

# Implementation Checklist

- [ ] Uses approved Design Tokens
- [ ] Supports WCAG 2.1 AA
- [ ] Responsive across supported breakpoints
- [ ] Reusable shared component
- [ ] Preserves filters and sorting
- [ ] Displays total record count
- [ ] Supports configurable page sizes
- [ ] Matches Brand Guidelines
- [ ] Matches Design System

---

# Do

✔ Preserve filters when changing pages.

✔ Clearly indicate the active page.

✔ Display total record counts.

✔ Use reasonable default page sizes.

✔ Reuse the shared Pagination component.

---

# Don't

✘ Reset search or filters between pages.

✘ Display hundreds of records on one page.

✘ Hide the current page indicator.

✘ Use inconsistent pagination styles.

✘ Create undocumented Pagination variants.

---

# eBPCO Examples

## Business Registration

Showing 1–25 of 428 Businesses

---

## Permit Applications

Showing 51–75 of 912 Applications

---

## Payments

Showing 1–10 of 187 Payment Records

---

## User Management

Showing 26–50 of 134 Users

---

## Audit Logs

Showing 101–125 of 2,483 Log Entries

---

# AI Development Guidelines

AI-generated Pagination components must:

- Reuse documented components.
- Consume Design Tokens.
- Preserve accessibility.
- Maintain filters, sorting, and search state across page changes.
- Avoid undocumented layouts or behaviors.

---

# Governance

All Pagination implementations within the eBPCO ecosystem shall comply with this specification.

Changes to Pagination variants, page sizes, or behavior require UI/UX approval before implementation.

---

# Approval

Project

Electronic Business Permit and Clearance Office (eBPCO)

Platforms

- Angular Web Administration Portal
- Flutter Mobile Application (Large-Screen Administrative Layouts)

Status

Approved

Version

1.0.0