# Tables

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Data Display

---

# Purpose

Tables present structured datasets in rows and columns, enabling users to efficiently scan, compare, sort, filter, and manage information.

Tables are the primary component for displaying administrative records within the eBPCO ecosystem and shall provide a consistent, accessible, and responsive experience across the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Tables should:

- Present structured information clearly.
- Support efficient record management.
- Improve data discoverability.
- Scale to large datasets.
- Support accessibility.
- Consume approved Design Tokens.

---

# Usage

Use Tables when displaying structured records with multiple attributes.

Common eBPCO examples include:

- Business Registry
- Permit Applications
- Payment Records
- Inspection Reports
- User Accounts
- Audit Logs
- Notifications
- Activity History

Avoid Tables for simple summaries or small collections of information where Cards or Lists provide a better experience.

---

# Anatomy

A standard Table consists of:

- Table Header
- Column Headers
- Data Rows
- Cells
- Row Actions
- Pagination
- Empty State
- Loading State

Example:

+---------------------------------------------------------------+
| Business Name | Owner | Status | Date | Actions               |
+---------------------------------------------------------------+
| ABC Trading   | Cruz  | Active | Jul 1 | View Edit More       |
| XYZ Store     | Reyes | Pending| Jul 3 | View Edit More       |
+---------------------------------------------------------------+

---

# Variants

## Standard Table

Displays structured data with fixed columns.

Recommended for most administrative pages.

---

## Sortable Table

Allows users to sort records by supported columns.

Supported sort order:

- Ascending
- Descending

Only sortable columns should display sort indicators.

---

## Filterable Table

Allows users to narrow results using filters.

Examples:

- Status
- Barangay
- Business Type
- Date Range

---

## Selectable Table

Allows row selection for bulk operations.

Selection methods:

- Individual row checkbox
- Select All checkbox

Bulk actions should only appear when one or more rows are selected.

---

## Expandable Table

Allows rows to expand and reveal additional information.

Recommended for:

- Payment Details
- Inspection Findings
- Application History

---

## Responsive Table

Adapts to smaller screens using responsive layouts.

Recommended approaches:

- Horizontal scrolling (Web)
- Stacked cards (Mobile)
- Expandable rows

---

# States

Tables shall support:

- Default
- Hover (Web)
- Focus
- Selected Row
- Loading
- Empty
- Error
- Disabled (where applicable)

State transitions shall follow Motion guidelines.

---

# Column Guidelines

Column headers should:

- Clearly describe the data.
- Use concise labels.
- Align consistently.
- Support sorting where appropriate.

Examples:

Business Name

Owner

Status

Registered Date

Actions

Avoid ambiguous labels.

---

# Row Behavior

Rows should:

- Maintain consistent height.
- Preserve alignment.
- Support hover feedback (Web).
- Support selection.
- Support keyboard navigation.

Interactive rows shall provide visible focus indicators.

---

# Row Actions

Actions should be grouped consistently.

Common actions include:

- View
- Edit
- Approve
- Reject
- Download
- Delete

Destructive actions should require confirmation.

---

# Sorting

Sortable columns should:

- Display clear indicators.
- Preserve sorting after pagination.
- Maintain stable ordering.

Default sorting should follow business requirements.

---

# Filtering

Filters should:

- Display active selections.
- Support multiple criteria.
- Allow reset.
- Update results predictably.

Example filters:

- Status
- Barangay
- Business Type
- Payment Status
- Date Range

---

# Pagination

Large datasets should use pagination.

Recommended controls:

- Previous
- Next
- Page Number
- Rows per Page

Users should always know:

- Current page
- Total pages
- Total records

---

# Searching

Tables should integrate with the standardized Search component.

Search should:

- Preserve user input.
- Work alongside filters.
- Maintain pagination appropriately.

---

# Empty State

When no records exist:

Display an informative message.

Example:

No businesses found.

Try adjusting your filters or search.

Avoid empty tables.

---

# Loading State

During data retrieval:

- Display Skeleton Rows.
- Preserve layout stability.
- Avoid abrupt resizing.

---

# Error State

If data cannot be loaded:

Display a clear message.

Example:

Unable to load records.

Please try again.

Provide a Retry action when appropriate.

---

# Accessibility

Tables shall:

- Meet WCAG 2.1 AA.
- Provide semantic table structure.
- Support screen readers.
- Support keyboard navigation.
- Display visible focus indicators.
- Maintain sufficient color contrast.

---

# Responsive Behavior

Desktop

- Display full table.
- Support sorting.
- Support filtering.
- Support pagination.

Tablet

- Reduce visible columns when appropriate.
- Allow horizontal scrolling if necessary.

Mobile

- Prefer stacked layouts or responsive cards.
- Preserve important information.
- Keep row actions accessible.

---

# Performance

Large datasets should:

- Use server-side pagination.
- Support lazy loading where appropriate.
- Minimize unnecessary re-rendering.

Avoid loading excessive records into memory.

---

# Design Tokens

Tables consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Radius Tokens
- Shadow Tokens
- Motion Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular Tables should:

- Reuse shared Table components.
- Consume centralized SCSS tokens.
- Separate presentation from data retrieval.
- Support reusable column definitions.
- Integrate with Reactive Forms for filtering.

Recommended location:

shared/components/table/

---

# Flutter Implementation

Flutter Tables should:

- Reuse shared Table widgets.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.
- Adapt layouts for mobile devices.

Recommended location:

shared/widgets/tables/

---

# Do

✔ Keep columns concise.

✔ Support sorting and filtering.

✔ Display loading and empty states.

✔ Use pagination for large datasets.

✔ Reuse shared Table components.

---

# Don't

✘ Display excessive columns.

✘ Hide important actions.

✘ Hardcode widths unnecessarily.

✘ Use Tables for content better suited to Cards.

✘ Create undocumented Table variants.

---

# eBPCO Examples

Business Registry

- Business Name
- Owner
- Status
- Registered Date

Permit Applications

- Application Number
- Applicant
- Status

Payments

- Receipt Number
- Amount
- Payment Method

Inspections

- Business
- Inspector
- Result

Administration

- Users
- Roles
- Audit Logs

Reports

- Transaction History

---

# AI Development Guidelines

AI-generated Tables must:

- Reuse documented components.
- Consume Design Tokens.
- Preserve accessibility.
- Support responsive layouts.
- Implement sorting, filtering, and pagination consistently.
- Avoid undocumented variants.

---

# Governance

All Table implementations within the eBPCO ecosystem shall comply with this specification.

New Table variants require UI/UX approval and documentation before implementation.

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