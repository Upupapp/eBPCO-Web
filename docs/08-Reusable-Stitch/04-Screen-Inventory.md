# Screen Inventory

Version: 1.0.0
Status: Draft
Document Owner: System Architect

Category: Reusable Stitch

---

# Purpose

This document defines the complete inventory of screens within the Electronic Business Permit and Clearance Office (eBPCO).

Unlike the Application Map, which illustrates how reusable stitches connect, the Screen Inventory identifies every user-facing screen, its purpose, ownership, and the stitch to which it belongs.

This inventory serves as the master reference for UI/UX design, frontend development, testing, and AI-assisted generation.

---

# Objectives

The Screen Inventory aims to:

- Document every application screen.
- Prevent duplicate screen creation.
- Define ownership of each screen.
- Associate screens with reusable stitches.
- Maintain consistency across Web and Mobile.
- Support project planning and testing.

---

# Screen Classification

Screens are grouped into the following categories:

- Public
- Shared
- Business Owner
- Administrative
- System

Each screen belongs to one reusable stitch.

---

# Public Screens

| Screen ID | Screen Name | Stitch | Platforms |
|------------|-------------|---------|-----------|
| PUB-001 | Splash Screen | Authentication Stitch | Mobile |
| PUB-002 | Landing Page | Authentication Stitch | Web |
| PUB-003 | Login | Authentication Stitch | Web / Mobile |
| PUB-004 | Register Account | Authentication Stitch | Web / Mobile |
| PUB-005 | Forgot Password | Authentication Stitch | Web / Mobile |
| PUB-006 | Reset Password | Authentication Stitch | Web / Mobile |

---

# Shared Screens

Accessible according to user permissions.

| Screen ID | Screen Name | Stitch | Platforms |
|------------|-------------|---------|-----------|
| SHR-001 | Dashboard | Dashboard Stitch | Web / Mobile |
| SHR-002 | Notifications | Notification Stitch | Web / Mobile |
| SHR-003 | User Profile | Profile Stitch | Web / Mobile |
| SHR-004 | Account Settings | Profile Stitch | Web / Mobile |
| SHR-005 | Change Password | Profile Stitch | Web / Mobile |

---

# Business Management Screens

| Screen ID | Screen Name | Stitch |
|------------|-------------|---------|
| BUS-001 | My Businesses | Business Management Stitch |
| BUS-002 | Register Business | Business Management Stitch |
| BUS-003 | Business Details | Business Management Stitch |
| BUS-004 | Edit Business | Business Management Stitch |

---

# Permit Service Screens

## New Permit

| Screen ID | Screen Name | Stitch |
|------------|-------------|---------|
| PER-001 | Select Business | Permit Application Stitch |
| PER-002 | Permit Information | Permit Application Stitch |
| PER-003 | Business Activity | Permit Application Stitch |
| PER-004 | Review Application | Permit Application Stitch |
| PER-005 | Submit Application | Permit Application Stitch |

---

## Permit Renewal

| Screen ID | Screen Name | Stitch |
|------------|-------------|---------|
| REN-001 | Select Existing Permit | Permit Renewal Stitch |
| REN-002 | Renewal Form | Permit Renewal Stitch |
| REN-003 | Review Renewal | Permit Renewal Stitch |

---

## Permit Amendment

| Screen ID | Screen Name | Stitch |
|------------|-------------|---------|
| AMD-001 | Select Permit | Permit Amendment Stitch |
| AMD-002 | Amendment Form | Permit Amendment Stitch |
| AMD-003 | Review Amendment | Permit Amendment Stitch |

---

# Document Management Screens

| Screen ID | Screen Name | Stitch |
|------------|-------------|---------|
| DOC-001 | Upload Documents | Document Upload Stitch |
| DOC-002 | Uploaded Documents | Document Upload Stitch |
| DOC-003 | Document Preview | Document Upload Stitch |

---

# Payment Screens

| Screen ID | Screen Name | Stitch |
|------------|-------------|---------|
| PAY-001 | Payment Options | Payment Stitch |
| PAY-002 | Bank Transfer | Payment Stitch |
| PAY-003 | Digital Payment | Payment Stitch |
| PAY-004 | Payment Receipt | Payment Stitch |
| PAY-005 | Payment Success | Payment Stitch |

---

# Tracking Screens

| Screen ID | Screen Name | Stitch |
|------------|-------------|---------|
| TRA-001 | My Applications | Tracking Stitch |
| TRA-002 | Application Details | Tracking Stitch |
| TRA-003 | Timeline | Tracking Stitch |

---

# Administrative Screens

## Application Review

| Screen ID | Screen Name | Stitch |
|------------|-------------|---------|
| ADM-001 | Pending Applications | Review Stitch |
| ADM-002 | Application Details | Review Stitch |
| ADM-003 | Document Review | Review Stitch |

---

## Inspection

| Screen ID | Screen Name | Stitch |
|------------|-------------|---------|
| INS-001 | Assigned Inspections | Inspection Stitch |
| INS-002 | Inspection Details | Inspection Stitch |
| INS-003 | Inspection Report | Inspection Stitch |

---

## Payment Verification

| Screen ID | Screen Name | Stitch |
|------------|-------------|---------|
| PVO-001 | Pending Payments | Payment Verification Stitch |
| PVO-002 | Payment Details | Payment Verification Stitch |

---

## Approval

| Screen ID | Screen Name | Stitch |
|------------|-------------|---------|
| APR-001 | Pending Approvals | Approval Stitch |
| APR-002 | Approval Details | Approval Stitch |

---

## Reports

| Screen ID | Screen Name | Stitch |
|------------|-------------|---------|
| REP-001 | Dashboard Reports | Reports Stitch |
| REP-002 | Permit Reports | Reports Stitch |
| REP-003 | Revenue Reports | Reports Stitch |
| REP-004 | Export Reports | Reports Stitch |

---

## User Management

| Screen ID | Screen Name | Stitch |
|------------|-------------|---------|
| USR-001 | User List | User Management Stitch |
| USR-002 | User Details | User Management Stitch |
| USR-003 | Create User | User Management Stitch |
| USR-004 | Edit User | User Management Stitch |

---

## Role Management

| Screen ID | Screen Name | Stitch |
|------------|-------------|---------|
| ROL-001 | Roles | Role Management Stitch |
| ROL-002 | Permissions | Role Management Stitch |

---

## System Settings

| Screen ID | Screen Name | Stitch |
|------------|-------------|---------|
| SYS-001 | General Settings | System Settings Stitch |
| SYS-002 | Announcement Management | System Settings Stitch |
| SYS-003 | Audit Logs | System Settings Stitch |

---

# Screen Metadata

Every screen should have a corresponding specification document containing:

- Screen ID
- Screen Name
- Purpose
- Associated Stitch
- User Roles
- Entry Points
- Exit Points
- UI Components
- Navigation
- Validation Rules
- Business Rules
- API Endpoints
- Screen States
- Acceptance Criteria

Detailed specifications are documented separately to avoid duplication.

---

# Naming Convention

Screen IDs follow this format:

```text
<Category Prefix>-<Sequential Number>
```

Example:

```text
PER-001
```

Where:

- PER = Permit
- 001 = Sequential Identifier

This convention ensures consistency across design files, source code, documentation, testing artifacts, and issue tracking.

---

# Relationship to Other Documents

This document supports:

- Application Map
- Navigation Stitch
- Screen Specifications
- Feature Specifications
- Component Mapping
- AI Development Standards

---

# Governance

The Screen Inventory shall be updated whenever screens are added, removed, renamed, or reorganized.

No new screen should be implemented without first being registered in this inventory.

---

# Approval

Project

Electronic Business Permit and Clearance Office (eBPCO)

Platforms

- Responsive Web Application
- Flutter Mobile Application

Status

Draft

Version

1.0.0