# User Roles

Version: 1.0.0
Status: Draft
Document Owner: System Architect

Category: Reusable Stitch

---

# Purpose

This document defines the user roles within the Electronic Business Permit and Clearance Office (eBPCO) platform.

User roles determine how reusable stitches behave by defining accessible features, navigation, permissions, and business responsibilities.

Rather than creating different applications for different users, eBPCO uses Role-Based Access Control (RBAC), where reusable stitches adapt based on the authenticated user's assigned role.

---

# Objectives

This document aims to:

- Define all user roles.
- Establish responsibilities for each role.
- Identify accessible stitches.
- Standardize permissions.
- Support secure application behavior.
- Provide a reference for AI-assisted implementation.

---

# Role Hierarchy

```text
System
│
├── Super Administrator
│
├── Administrator
│
├── Approving Officer
│
├── Payment Officer
│
├── Inspector
│
├── Evaluator
│
└── Business Owner
```

Higher roles may inherit capabilities from lower administrative roles where appropriate, while external users remain isolated from internal administrative functions.

---

# External Roles

## Business Owner

### Description

The Business Owner is the primary external user of the platform.

This role applies for business permits, submits documents, completes payments, tracks application progress, and manages business information.

### Responsibilities

- Register an account.
- Manage personal profile.
- Register businesses.
- Apply for permits.
- Renew permits.
- Amend permits.
- Upload required documents.
- Select payment method.
- View payment history.
- Track application status.
- Receive notifications.
- Download approved permits.

### Accessible Stitches

- Authentication
- Dashboard
- Business Management
- Permit Application
- Permit Renewal
- Permit Amendment
- Document Upload
- Payment
- Application Tracking
- Notification Center
- Profile

---

# Internal Roles

## Evaluator

### Description

The Evaluator performs the initial assessment of submitted permit applications.

### Responsibilities

- Review applications.
- Verify submitted information.
- Check document completeness.
- Return incomplete applications.
- Recommend approval.
- Recommend inspection.

### Accessible Stitches

- Authentication
- Dashboard
- Application Review
- Document Review
- Notification Center
- Reports
- Profile

---

## Inspector

### Description

The Inspector conducts field inspections and validates business compliance.

### Responsibilities

- View assigned inspections.
- Record inspection findings.
- Upload inspection reports.
- Recommend approval or rejection.

### Accessible Stitches

- Dashboard
- Inspection Management
- Document Upload
- Notifications
- Profile

---

## Payment Officer

### Description

The Payment Officer validates and records payments.

### Responsibilities

- Verify payment receipts.
- Record onsite payments.
- Confirm digital payments.
- Update payment status.

### Accessible Stitches

- Dashboard
- Payment Management
- Application Review
- Notifications
- Reports
- Profile

---

## Approving Officer

### Description

The Approving Officer provides the final decision on permit applications.

### Responsibilities

- Review evaluated applications.
- Review inspection reports.
- Approve permits.
- Reject permits.
- Return applications for correction.

### Accessible Stitches

- Dashboard
- Approval Management
- Application Review
- Reports
- Notifications
- Profile

---

## Administrator

### Description

The Administrator manages operational aspects of the platform.

### Responsibilities

- Manage users.
- Manage roles.
- Configure system settings.
- View reports.
- Manage announcements.
- Monitor platform activity.

### Accessible Stitches

- Dashboard
- User Management
- Role Management
- Reports
- Notifications
- System Settings
- Profile

---

## Super Administrator

### Description

The Super Administrator has unrestricted administrative access to the platform.

### Responsibilities

- Manage administrators.
- Configure global system settings.
- Audit user activity.
- Manage permissions.
- Configure reusable stitches.
- Access all reports.

### Accessible Stitches

All stitches.

---

# Permission Levels

The platform defines four permission levels.

| Level | Description |
|--------|-------------|
| View | Read-only access |
| Create | Create new records |
| Update | Modify existing records |
| Delete | Remove records when permitted |

Additional permissions include:

- Approve
- Reject
- Verify
- Assign
- Export
- Configure

---

# Role-Based Stitch Behavior

Each reusable stitch shall adapt its behavior based on the authenticated user's role.

Examples include:

## Dashboard Stitch

Business Owner

- Application summary
- Permit status
- Notifications
- Quick actions

Administrator

- System metrics
- Pending reviews
- User statistics
- Reports

Inspector

- Assigned inspections
- Inspection schedule
- Recent findings

Although the stitch remains the same, its content changes according to role.

---

## Navigation Stitch

Business Owner

- Home
- Businesses
- Applications
- Payments
- Notifications
- Profile

Administrator

- Dashboard
- Users
- Reports
- System Settings
- Notifications

Navigation shall dynamically reflect authorized features.

---

## Permission Principles

Every stitch shall:

- Hide inaccessible actions.
- Prevent unauthorized operations.
- Validate permissions on every request.
- Display only relevant information.
- Protect sensitive administrative functions.

Permission enforcement shall exist on both the client and server.

---

# Future Role Expansion

The architecture supports additional roles without requiring major redesign.

Examples include:

- Treasury Officer
- Licensing Officer
- Barangay Officer
- Regional Administrator
- Auditor

New roles should reuse existing stitches whenever possible.

---

# Relationship to Other Documents

This document supports:

- Stitch Principles
- Navigation Stitch
- Permissions Matrix
- Feature Specifications
- Authentication Stitch
- AI Development Standards

---

# Governance

User roles and permissions shall be reviewed whenever business processes or organizational responsibilities change.

All changes shall maintain the principle of least privilege.

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