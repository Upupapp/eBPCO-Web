# 12 Tables

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Component Category ID: TBL

---

# Purpose

Tables are the primary component for presenting structured information within the eBPCO Web Administration Portal.

They enable users to browse, search, filter, sort, manage, and export large datasets efficiently while maintaining consistency across all modules.

The Mobile Application should use responsive alternatives such as cards or expandable lists when traditional tables are not practical.

---

# Design Principles

Tables must be:

- Readable
- Scannable
- Responsive
- Accessible
- Consistent
- Performant

---

# Component Registry

| Component ID | Component |
|--------------|-----------|
| TBL-001 | Standard Data Table |
| TBL-002 | Sortable Table |
| TBL-003 | Searchable Table |
| TBL-004 | Filterable Table |
| TBL-005 | Paginated Table |
| TBL-006 | Selectable Table |
| TBL-007 | Expandable Table |
| TBL-008 | Empty State Table |

---

# Component Anatomy

A standard table consists of:

- Table Toolbar
- Search Bar
- Filters
- Bulk Actions
- Column Headers
- Table Rows
- Status Indicators
- Row Actions
- Pagination
- Empty State

Every table should follow this structure.

---

# Column Rules

Columns must:

- Use clear headings
- Maintain consistent spacing
- Avoid unnecessary abbreviations
- Support responsive resizing

Numeric values should be right-aligned.

Text values should be left-aligned.

Status badges should be centered where appropriate.

---

# Row Rules

Rows should:

- Maintain equal height
- Highlight on hover (Web)
- Display selection state
- Support keyboard navigation

Rows must never rely solely on color to indicate selection.

---

# Search

Every searchable table should include:

- Search field
- Clear button
- Instant filtering (when appropriate)
- Debounced input

---

# Filtering

Filters may include:

- Status
- Date
- Category
- Assigned User
- Department
- Business Type

Multiple filters should be supported simultaneously.

---

# Sorting

Sortable columns must display:

- Ascending indicator
- Descending indicator
- Default state

Only sortable columns should display sort controls.

---

# Pagination

Tables should support:

- Page navigation
- Page size selection
- Current page indicator
- Total record count

Default page size:

25 records

---

# Bulk Actions

Bulk actions become available only when rows are selected.

Examples:

- Delete
- Export
- Archive
- Approve
- Reject

---

# Row Actions

Common row actions:

- View
- Edit
- Approve
- Reject
- Delete
- Download

Actions should appear consistently across all modules.

---

# Empty State

When no data exists, display:

- Illustration
- Title
- Description
- Primary Action (optional)

Example:

"No business permits found."

---

# Loading State

During loading:

- Display table skeleton
- Preserve layout
- Avoid layout shifts

---

# Error State

If data cannot be loaded:

Display:

- Error message
- Retry button
- Optional support information

---

# Accessibility

Tables must:

- Support keyboard navigation
- Provide sufficient contrast
- Include accessible column headers
- Announce sorting changes
- Maintain logical tab order

---

# Responsive Behaviour

Desktop

Full table layout.

Tablet

Hide low-priority columns when necessary.

Mobile

Convert to responsive cards or expandable rows.

Horizontal scrolling should be the last resort.

---

# Angular Implementation Notes

Create reusable table components.

Examples:

- AppDataTable
- AppTableToolbar
- AppPagination
- AppTableFilters

Do not duplicate table logic.

---

# Flutter Implementation Notes

Use reusable list-based widgets for mobile.

Avoid forcing desktop-style tables onto small screens.

---

# AI Generation Notes

When generating tables:

- Use only approved table components.
- Follow the documented anatomy.
- Preserve accessibility.
- Maintain consistent row actions.
- Never invent new table layouts.

---

# Governance

Any new table pattern requires:

1. Design review
2. Component registration
3. Documentation update
4. Approval
5. Implementation

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