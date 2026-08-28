# 07 – Dashboard Stitch

## Overview

The Dashboard Stitch defines the main landing page of the Electronic Building Permit and Certificate of Occupancy (eBPCO) mobile application after a user successfully signs in.

The dashboard serves as the user's command center, providing quick access to business permit services, application status, notifications, recent activities, and account information.

It is designed to provide important information at a glance while minimizing the number of taps required to complete common tasks.

---

# Objectives

The dashboard shall:

- Welcome the authenticated user.
- Display important application information.
- Provide quick access to common actions.
- Show application summaries.
- Display recent permit applications.
- Surface notifications and announcements.
- Maintain a clean, modern, and consistent interface.

---

# Dashboard Layout

The dashboard follows the standard eBPCO layout.

```text
Hero Header
        │
        ▼
Quick Actions
        │
        ▼
Application Summary
        │
        ▼
Recent Applications
        │
        ▼
Announcements
        │
        ▼
Bottom Navigation
```

---

# Hero Header

The Hero Header contains:

- User Greeting
- User Name
- Profile Picture (Optional)
- Notification Button
- Search Button (Future)

Example

```
Good Morning,

Juan Dela Cruz
```

The Hero Header should follow the official eBPCO branding and use the application's primary color.

---

# Quick Actions

Quick Actions provide one-tap access to frequently used services.

Current Actions

- Apply for Permit
- Track Application
- My Documents
- Payments

Future Actions

- Schedule Appointment
- Business Profile
- Renew Permit
- Help Center

---

# Application Summary

Displays an overview of the user's permit activities.

Examples

- Total Applications
- Approved
- Pending
- Under Review
- Rejected

Each summary should be displayed using reusable statistic cards.

---

# Recent Applications

Displays the user's latest permit applications.

Each application card contains:

- Permit Type
- Tracking Number
- Date Submitted
- Current Status
- View Details Button

Example

```
Business Permit

Tracking No.
BP-2026-000125

Status

Under Review
```

---

# Status Indicators

Application status must use consistent status chips.

Approved

- Green

Pending

- Orange

Under Review

- Blue

Rejected

- Red

Expired

- Gray

The same status colors must be reused throughout the application.

---

# Announcements

Displays important notices from the Business Permit Office.

Examples

- Office Announcements
- Holiday Schedules
- System Maintenance
- New Policies
- Application Deadlines

Future versions may include rich media announcements.

---

# Empty States

If no applications exist:

Display

```
No permit applications yet.

Tap "Apply for Permit" to get started.
```

If no announcements exist:

Display

```
No announcements available.
```

---

# Loading State

While dashboard information is loading:

Display:

- Skeleton cards
- Loading indicators
- Placeholder content

Avoid blank screens whenever possible.

---

# Error State

If dashboard data cannot be loaded:

Display

```
Unable to load dashboard.

Please check your internet connection.

Try Again
```

---

# Refresh Behavior

Users should be able to refresh dashboard data using:

- Pull-to-refresh
- Automatic refresh after login

Future enhancement:

- Background synchronization

---

# Navigation

Dashboard provides access to:

- Permit Application
- Application Tracking
- Notifications
- Profile
- Settings

Navigation must follow the Navigation Stitch.

---

# UI Components

Reusable components:

- EBPCOHeroHeader
- EBPCOQuickActionCard
- EBPCOStatisticCard
- EBPCOApplicationCard
- EBPCOStatusChip
- EBPCOAnnouncementCard
- EBPCOBottomNavigation
- EBPCOLoadingSkeleton

---

# Dependencies

This stitch interacts with:

- Authentication Stitch
- Permit Application Stitch
- Tracking Stitch
- Notifications Stitch
- Profile Stitch
- Settings Stitch

---

# Acceptance Criteria

- Dashboard follows eBPCO Brand Guidelines.
- Hero Header displays authenticated user information.
- Quick Actions are accessible.
- Application Summary is displayed correctly.
- Recent Applications are listed.
- Status chips are standardized.
- Announcements section is available.
- Loading, empty, and error states are documented.
- Reusable components are identified.
- Ready for backend integration.

---

# Future Improvements

- Personalized dashboard widgets.
- AI-powered reminders.
- Recent activity timeline.
- Upcoming permit expiration alerts.
- Real-time application updates.
- Dashboard customization.
- Weather and emergency advisories.
- Smart recommendations based on user activity.