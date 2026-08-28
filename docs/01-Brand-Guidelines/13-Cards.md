# 13 Cards

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Component Category ID: CRD

---

# Purpose

Cards are reusable containers that organize related information into clear, visually distinct sections.

They provide structure throughout the eBPCO ecosystem, including dashboards, forms, reports, workflow summaries, notifications, and mobile interfaces.

Every card must follow this specification.

---

# Design Principles

Cards must be:

- Simple
- Consistent
- Informative
- Responsive
- Accessible
- Reusable

Cards organize information—they should never become decorative.

---

# Component Registry

| Component ID | Component |
|--------------|-----------|
| CRD-001 | Standard Card |
| CRD-002 | Dashboard Statistic Card |
| CRD-003 | Information Card |
| CRD-004 | Action Card |
| CRD-005 | Summary Card |
| CRD-006 | Notification Card |
| CRD-007 | Workflow Card |
| CRD-008 | Empty State Card |

---

# Component Anatomy

Every card consists of:

- Header
- Optional Icon
- Title
- Optional Subtitle
- Content Area
- Optional Footer
- Optional Actions

---

# Standard Card (CRD-001)

Purpose

General content container.

Used for:

- Forms
- Settings
- Information panels
- Reports

---

# Dashboard Statistic Card (CRD-002)

Purpose

Display key metrics.

Examples

- Total Applications
- Pending Applications
- Approved Today
- Revenue
- Active Users

Structure

Icon

Statistic Value

Label

Optional Trend Indicator

---

# Information Card (CRD-003)

Purpose

Display detailed information.

Examples

Business Profile

Applicant Details

Permit Information

---

# Action Card (CRD-004)

Purpose

Navigate users toward a workflow.

Examples

Apply for Permit

Renew Business

Pay Fees

Track Application

---

# Summary Card (CRD-005)

Purpose

Display summarized records.

Examples

Business Summary

Payment Summary

Application Summary

---

# Notification Card (CRD-006)

Purpose

Highlight announcements, reminders, or alerts.

Must include:

- Title
- Timestamp
- Status
- Action (if required)

---

# Workflow Card (CRD-007)

Purpose

Display workflow progress.

Examples

Draft

Pending

Under Review

Approved

Rejected

Completed

---

# Empty State Card (CRD-008)

Purpose

Displayed when content is unavailable.

Must include:

- Illustration
- Title
- Description
- Primary Action (optional)

---

# Card Spacing

Internal Padding

24px

Gap Between Sections

16px

Gap Between Cards

24px

---

# Card Radius

Use:

Radius-3

No custom radius values are allowed.

---

# Card Elevation

Default

Elevation-1

Hover

Elevation-2 (Web only)

Disabled

Flat appearance

---

# Card Actions

Actions should appear:

Top Right

or

Bottom Right

Avoid placing actions in multiple locations within the same card.

---

# Card States

Every card supports:

- Default
- Hover
- Focus
- Selected
- Disabled
- Loading
- Empty

---

# Dashboard Usage

Dashboard cards should prioritize:

1. Statistics
2. Workflow
3. Alerts
4. Recent Activity
5. Quick Actions

Maintain consistent sizing across rows.

---

# Accessibility

Cards must:

- Maintain sufficient contrast.
- Support keyboard focus if interactive.
- Preserve readable spacing.
- Never rely solely on color.

---

# Responsive Behaviour

Desktop

Multi-column grid.

Tablet

Adaptive grid.

Mobile

Single-column layout.

Cards should expand to available width.

---

# Angular Implementation Notes

Create reusable components.

Examples

AppCard

AppStatisticCard

AppWorkflowCard

AppNotificationCard

Avoid inline styling.

---

# Flutter Implementation Notes

Create reusable widgets.

Examples

AppCard

StatisticCard

SummaryCard

WorkflowCard

Use centralized decorations.

---

# AI Generation Notes

When generating cards:

- Use only documented card types.
- Follow approved spacing.
- Apply correct elevation.
- Preserve responsive behaviour.
- Never invent undocumented layouts.

---

# Governance

Any new card requires:

1. Design review
2. Component registration
3. Documentation update
4. Approval
5. Implementation

---

# Approval

Project

Electronic Building Permit and Certificate of Occupancy (eBPCO)

Platforms

- Angular Web Administration Portal
- Flutter Mobile Application

Status

Approved

Version

1.0.0