# Application Map

Version: 1.0.0
Status: Draft
Document Owner: System Architect

Category: Reusable Stitch

---

# Purpose

This document defines how the Electronic Building Permit and Certificate of Occupancy (eBPCO) application is assembled using reusable stitches.

Rather than viewing the platform as a collection of individual pages, the application is organized into modular stitches, where each stitch represents a complete business capability.

The Application Map serves as the architectural blueprint showing how stitches connect to form the complete system.

---

# Objectives

The Application Map aims to:

- Visualize the overall application structure.
- Define relationships between stitches.
- Identify entry and exit points.
- Promote modular development.
- Support scalable application architecture.
- Simplify AI-assisted implementation.

---

# Application Architecture

The eBPCO application is composed of interconnected reusable stitches.

```text
Authentication
      │
      ▼
Dashboard
      │
      ├──────────────┐
      ▼              ▼
Business        Notification
Management         Center
      │
      ▼
Permit Services
      │
      ├──────────────┬──────────────┐
      ▼              ▼              ▼
New Permit      Renewal      Amendment
      │
      ▼
Document Upload
      │
      ▼
Payment
      │
      ▼
Application Tracking
      │
      ▼
Permit Approval
      │
      ▼
Digital Permit
```

Administrative users access additional management stitches through the Dashboard.

---

# Primary Navigation Flow

## Public Access

```text
Landing Page
      │
      ▼
Login / Register
```

---

## Authenticated User

```text
Dashboard
│
├── Business Management
├── Permit Services
├── Notifications
├── Payments
├── Profile
└── Settings
```

---

# Permit Service Flow

The Permit Services stitch contains three related workflows.

```text
Permit Services
│
├── New Application
├── Permit Renewal
└── Permit Amendment
```

Each workflow reuses common stitches such as:

- Document Upload
- Payment
- Application Tracking

---

# Administrative Flow

```text
Dashboard
│
├── Application Review
├── Inspection
├── Payment Verification
├── Approval
├── Reports
├── User Management
├── System Settings
└── Notifications
```

Administrative stitches reuse common navigation and dashboard components while exposing role-specific functionality.

---

# Shared Stitches

The following stitches are reused throughout the application.

| Stitch | Reused By |
|----------|-----------|
| Authentication | All Users |
| Dashboard | All Roles |
| Notification Center | All Roles |
| Profile | All Roles |
| File Upload | Permit Services, Inspection |
| Search | Administrative Modules |
| Data Table | Administrative Modules |
| Confirmation Dialog | Entire Application |
| Success Dialog | Entire Application |
| Error Dialog | Entire Application |

These stitches provide a consistent user experience and reduce duplicated implementation.

---

# Stitch Dependencies

Some stitches depend on others before they can be accessed.

| Stitch | Depends On |
|---------|------------|
| Dashboard | Authentication |
| Business Management | Dashboard |
| Permit Services | Business Management |
| Document Upload | Permit Services |
| Payment | Document Upload |
| Application Tracking | Payment |
| Permit Approval | Application Review |
| Reports | Dashboard |
| User Management | Dashboard |

Dependencies help maintain a predictable workflow and enforce business rules.

---

# Entry Points

Users may enter the application through different entry points depending on their role.

## Business Owner

```text
Login
   │
   ▼
Dashboard
```

---

## Administrator

```text
Login
   │
   ▼
Administrative Dashboard
```

---

## Inspector

```text
Login
   │
   ▼
Inspection Dashboard
```

Each entry point uses the same Authentication Stitch but routes users to role-specific dashboard experiences.

---

# Exit Points

Users may exit a stitch by:

- Completing the workflow.
- Returning to Dashboard.
- Cancelling the operation.
- Logging out.

Each stitch should clearly define its possible exit paths to ensure predictable navigation.

---

# Navigation Principles

All stitches shall adhere to the following navigation principles:

- Every screen must have a clear purpose.
- Navigation should minimize unnecessary steps.
- Users should always know their current location.
- Back navigation should preserve user context.
- Frequently used actions should be easily accessible.
- Navigation patterns shall remain consistent across Web and Mobile.

---

# AI Development Guidance

When generating application features using AI tools, each stitch should be treated as an independent module.

AI prompts should reference stitches rather than individual screens whenever possible.

Example:

> Generate the **Permit Application Stitch** using the approved Design System, Component Library, and UX Standards.

This approach improves consistency and encourages component reuse.

---

# Relationship to Other Documents

This document supports:

- Stitch Principles
- User Roles
- Navigation Stitch
- Screen Inventory
- Component Mapping
- Shared State Stitch
- AI Development Standards

---

# Governance

The Application Map shall be updated whenever:

- A new stitch is introduced.
- Existing workflows change.
- Navigation is redesigned.
- Business processes are modified.

Maintaining an accurate Application Map ensures all project stakeholders share a common understanding of the system architecture.

---

# Approval

Project

Electronic Building Permit and Certificate of Occupancy (eBPCO)

Platforms

- Responsive Web Application
- Flutter Mobile Application

Status

Draft

Version

1.0.0