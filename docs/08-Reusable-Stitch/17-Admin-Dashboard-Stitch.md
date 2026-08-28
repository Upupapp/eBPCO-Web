# 17 – Admin Dashboard Stitch

## Overview

The Admin Dashboard Stitch defines the centralized workspace for authorized personnel of the Electronic Building Permit and Certificate of Occupancy (eBPCO). It provides administrators and reviewing officers with a real-time overview of permit processing activities, application statistics, operational metrics, and quick access to administrative functions.

The dashboard serves as the primary landing page after an administrator logs into the system.

---

# Objectives

The Admin Dashboard shall:

- Present a real-time overview of system activities.
- Display key performance indicators (KPIs).
- Highlight pending administrative tasks.
- Provide shortcuts to common administrative functions.
- Display recent activities and announcements.
- Prepare dashboard widgets for backend integration.

---

# Dashboard Workflow

```text
Administrator Login
        │
        ▼
Admin Dashboard
        │
        ├───────────────┐
        ▼               ▼
Application Queue   Analytics
        │               │
        ▼               ▼
Review Actions    Reports
        │               │
        └───────┬───────┘
                ▼
        Administrative Tasks
```

---

# Dashboard Layout

The dashboard consists of:

- Welcome Header
- KPI Summary Cards
- Pending Applications
- Recent Activities
- Quick Actions
- Announcements
- System Status

---

# Welcome Header

Display:

- Administrator Name
- User Role
- Current Date
- Greeting Message

Example

```
Good Morning,

Maria Santos
Permit Administrator
```

---

# KPI Summary Cards

Display the following statistics:

- Total Applications
- Pending Applications
- Approved Applications
- Rejected Applications
- Payments Pending Verification
- Permits Ready for Release

Future enhancement:

- Average Processing Time
- Daily Application Count
- Weekly Performance Metrics

---

# Pending Applications

Display:

- Reference Number
- Applicant Name
- Business Name
- Submission Date
- Current Status

Actions:

- View Application
- Review Application

---

# Recent Activities

Display recent administrative actions.

Example

```
Juan Dela Cruz submitted a new application.

2 minutes ago
```

```
Payment verified for Permit #2026-0154.

10 minutes ago
```

---

# Quick Actions

Provide shortcuts to:

- Review Applications
- Verify Payments
- Manage Users
- View Reports
- Release Permits
- System Settings

---

# Announcements

Display:

- Internal announcements
- Office reminders
- Maintenance schedules
- Policy updates

---

# System Status

Display operational indicators.

Examples

- Database Status
- Server Status
- Notification Service
- Payment Gateway

Current Version

- Mock status indicators

Future Version

- Live monitoring

---

# Search

Search dashboard content by:

- Applicant Name
- Reference Number
- Business Name

---

# Filters

Filter dashboard widgets by:

- Today
- This Week
- This Month

Future enhancement:

- Custom Date Range

---

# Loading State

Display:

- Skeleton KPI cards
- Skeleton tables
- Loading indicators

---

# Empty State

```
No administrative activities available.
```

---

# Error State

```
Unable to load dashboard information.

Please refresh the page.
```

---

# Security Requirements

The Admin Dashboard shall:

- Be accessible only to authorized personnel.
- Display information based on user role.
- Protect confidential applicant information.
- Record administrative activities for auditing.
- Secure all dashboard communications.

---

# UI Components

Reusable components

- EBPCOAdminHeader
- EBPCOKPICard
- EBPCOStatisticCard
- EBPCOApplicationTable
- EBPCOQuickActionCard
- EBPCOAnnouncementCard
- EBPCOStatusIndicator
- EBPCOLoadingSkeleton

---

# Dependencies

This stitch interacts with:

- Authentication Stitch
- Admin Review and Approval Stitch
- Payment Stitch
- Permit Release and Completion Stitch
- Notification Stitch
- Reports Stitch (Future)
- Backend Dashboard Service

---

# Acceptance Criteria

- Dashboard displays administrative overview.
- KPI cards summarize system activity.
- Pending applications are visible.
- Recent activities are displayed.
- Quick actions provide navigation shortcuts.
- Search and filters are supported.
- Loading, empty, and error states are documented.
- Reusable components are identified.
- Ready for backend integration.

---

# Future Improvements

- Real-time analytics dashboard.
- Interactive charts and graphs.
- Customizable dashboard widgets.
- SLA monitoring.
- AI-generated workload insights.
- Performance benchmarking.
- Multi-office dashboard support.
- Export dashboard statistics.