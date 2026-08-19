# 14 Status Colors

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Component Category ID: STS

---

# Purpose

The Status System defines the official workflow states used throughout the eBPCO ecosystem.

Every module shall use these approved statuses, colors, badges, icons, and behaviors to provide a predictable user experience across both the Angular Web Administration Portal and the Flutter Mobile Application.

No module may introduce custom statuses without approval.

---

# Design Principles

Status indicators must be:

- Consistent
- Easy to recognize
- Accessible
- Actionable
- Reusable
- Workflow-driven

Status must communicate the current state of an item at a glance.

---

# Universal Status Workflow

The official workflow is:

```

Draft
↓

Pending
↓

Under Review
↓

Requires Revision
↓

Pending Review
↓

Approved
↓

Released
↓

Archived

```

Alternative terminal state:

```

Rejected

```

Cancelled may occur before approval.

---

# Status Registry

| ID | Status | Purpose |
|----|---------|----------|
| STS-001 | Draft | Work not submitted |
| STS-002 | Pending | Waiting for review |
| STS-003 | Under Review | Being evaluated |
| STS-004 | Requires Revision | Applicant must revise |
| STS-005 | Pending Review | Resubmitted for evaluation |
| STS-006 | Approved | Successfully approved |
| STS-007 | Rejected | Not approved |
| STS-008 | Released | Officially issued |
| STS-009 | Archived | Historical record |
| STS-010 | Cancelled | User cancelled process |

---

# Visual Standards

Each status must include:

- Badge
- Label
- Icon
- Semantic color

Color alone must never communicate status.

---

# Status Behaviors

## Draft

Meaning

Information is incomplete.

Allowed Actions

- Edit
- Delete
- Submit

---

## Pending

Meaning

Waiting for reviewer.

Allowed Actions

- View
- Withdraw (optional)

---

## Under Review

Meaning

Currently evaluated.

Allowed Actions

- View

No editing permitted.

---

## Requires Revision

Meaning

Applicant must correct submitted information.

Allowed Actions

- Edit
- Resubmit

---

## Pending Review

Meaning

Revision submitted.

Allowed Actions

- View

---

## Approved

Meaning

Application accepted.

Allowed Actions

- View
- Download
- Continue to next process

---

## Rejected

Meaning

Application denied.

Allowed Actions

- View
- Submit New Application (if permitted)

---

## Released

Meaning

Official document available.

Allowed Actions

- Download
- Print
- View

---

## Archived

Meaning

Historical record.

Allowed Actions

- View

---

## Cancelled

Meaning

Process voluntarily cancelled.

Allowed Actions

- View

---

# Badge Standards

Every badge includes:

- Status label
- Approved color
- Optional icon

Badge style remains consistent across all modules.

---

# Workflow Rules

Status progression follows approved business rules.

Users must never skip required workflow stages.

Invalid transitions are prohibited.

---

# Notifications

Status changes should generate notifications when appropriate.

Examples:

- Application Approved
- Revision Required
- Payment Confirmed
- Permit Released

---

# Accessibility

Status indicators must include:

- Text labels
- Icons
- Approved colors
- WCAG AA compliant contrast

---

# Responsive Behaviour

Status badges maintain:

- Consistent color
- Consistent typography
- Consistent spacing

Across desktop, tablet, and mobile.

---

# Angular Implementation Notes

Create reusable components:

- AppStatusBadge
- AppWorkflowStatus

Never hardcode status values.

Use enums or centralized constants.

---

# Flutter Implementation Notes

Create reusable widgets:

- StatusBadge
- WorkflowStatusChip

Centralize all status mappings.

---

# AI Generation Notes

When generating UI:

- Use only approved statuses.
- Preserve workflow order.
- Never invent custom status names.
- Always use the registered component IDs.

---

# Governance

Adding or modifying statuses requires:

1. Business approval
2. Design review
3. Documentation update
4. Component update
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